// Cache do Service Worker muda versão para atualizar o app.
const CACHE_NAME = 'portal-aluno-v11';
const IMAGES_CACHE = 'portal-aluno-images-v11';
const STATIC_CACHE = 'portal-aluno-static-v11';

// Lista de recursos para cache (admin.html removido intencionalmente)
const urlsToCache = [
  '/',
  '/index.html',
  // '/admin.html', // Removido do cache
  '/assets/css/style.css',
  '/assets/js/app.js',
  '/manifest.json',
  '/assets/images/logos/logo.png',
  '/assets/images/icons/search.svg',
  '/assets/images/icons/icon-192x192.png',
  '/assets/images/icons/icon-512x512.png'
];

// Lista de imagens dos cards para cache
const cardImages = [
  '/assets/images/logos/classroom.png',
  '/assets/images/logos/redacao.png',
  '/assets/images/logos/leia.png',
  '/assets/images/logos/matific.png',
  '/assets/images/logos/khanacademy.png',
  '/assets/images/logos/quizizz.png',
  '/assets/images/logos/inglesparanateens.png',
  '/assets/images/logos/inglesparanahigh.png',
  '/assets/images/logos/alura.png',
  '/assets/images/logos/scratch.png',
  '/assets/images/logos/github.png',
  '/assets/images/logos/mblock.png',
  '/assets/images/logos/areadoaluno.png',
  '/assets/images/logos/logo.webp'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Cache principal
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(urlsToCache);
      }),
      // Cache de imagens
      caches.open(IMAGES_CACHE).then(cache => {
        return cache.addAll(cardImages);
      }),
      // Cache estático (admin.css não adicionado aqui)
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll([
          '/assets/css/style.css',
          '/assets/js/app.js'
        ]);
      })
    ])
  );
  // Ativa o novo Service Worker imediatamente
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Limpa caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== IMAGES_CACHE && 
                cacheName !== STATIC_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Toma controle de todas as páginas imediatamente
      clients.claim()
    ])
  );
});

// Função para verificar integridade do cache
async function verifyCacheIntegrity(request, cache) {
  try {
    const response = await cache.match(request);
    if (!response) return false;

    // Verifica se a resposta é válida
    if (!response.ok) return false;

    // Verifica se é uma imagem
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.startsWith('image/')) {
      // Tenta carregar a imagem para verificar se está corrompida
      const blob = await response.blob();
      return blob.size > 0;
    }

    return true;
  } catch (error) {
    console.error('Erro ao verificar integridade do cache:', error);
    return false;
  }
}

// Função para buscar e cachear recursos
async function fetchAndCache(request) {
  try {
    const response = await fetch(request);
    if (!response || response.status !== 200) {
      throw new Error('Falha ao buscar recurso');
    }

    // Clona a resposta para cache
    const responseToCache = response.clone();

    // Determina qual cache usar
    let cacheName = CACHE_NAME;
    if (request.url.includes('/assets/images/logos/')) {
      cacheName = IMAGES_CACHE;
    } else if (request.url.includes('/assets/css/') || request.url.includes('/assets/js/')) {
      cacheName = STATIC_CACHE;
    }

    // Armazena no cache apropriado
    const cache = await caches.open(cacheName);
    await cache.put(request, responseToCache);

    return response;
  } catch (error) {
    console.error('Erro ao buscar e cachear:', error);
    throw error;
  }
}

// Interceptação de requisições
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Exclui admin.html, admin.css, splash.css, splash.js e favicon.ico do cache e da manipulação pelo Service Worker
  if (requestUrl.pathname.includes('/admin.html') || 
      requestUrl.pathname.includes('/assets/css/admin.css') ||
      requestUrl.pathname.includes('/assets/css/splash.css') ||
      requestUrl.pathname.includes('/assets/js/splash.js') ||
      requestUrl.pathname.includes('/favicon.ico')) {
    return event.respondWith(fetch(event.request));
  }

  // Ignora requisições para APIs externas
  if (event.request.url.includes('google.com') || 
      event.request.url.includes('classroom.google.com') ||
      event.request.url.includes('redacao.pr.gov.br') ||
      event.request.url.includes('leiaparana.odilo.us') ||
      event.request.url.includes('matific.com') ||
      event.request.url.includes('khanacademy.org') ||
      event.request.url.includes('quizizz.com') ||
      event.request.url.includes('englishcentral.com') ||
      event.request.url.includes('ef.com') ||
      event.request.url.includes('alura.com.br') ||
      event.request.url.includes('scratch.mit.edu') ||
      event.request.url.includes('github.com') ||
      event.request.url.includes('mblock.cc') ||
      event.request.url.includes('areadoaluno.seed.pr.gov.br') ||
      event.request.url.includes('sites.google.com') ||
      event.request.url.includes('sora.chatgpt.com')) {
    return event.respondWith(fetch(event.request));
  }

  // Estratégia especial para a página inicial
  if (requestUrl.pathname === '/' || requestUrl.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Sempre busca a versão mais recente da página inicial
          return response;
        })
        .catch(() => {
          // Em caso de erro, tenta buscar do cache
          return caches.match(event.request);
        })
    );
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Tenta buscar do cache primeiro
        const cache = await caches.match(event.request);
        if (cache) {
          // Verifica integridade do cache
          const isIntegrityValid = await verifyCacheIntegrity(event.request, caches);
          if (isIntegrityValid) {
            return cache;
          }
        }

        // Se não estiver no cache ou estiver corrompido, busca da rede
        const response = await fetch(event.request);
        if (!response || response.status !== 200) {
          throw new Error('Falha ao buscar recurso');
        }
        return response;
      } catch (error) {
        console.error('Erro no fetch:', error);
        // Em caso de erro, tenta buscar do cache mesmo que corrompido
        const cache = await caches.match(event.request);
        if (cache) {
          return cache;
        }
        // Se não houver cache, retorna uma página de erro
        return new Response('Erro ao carregar recurso', { status: 500 });
      }
    })()
  );
});

// Listener para mensagens do cliente (app.js)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 