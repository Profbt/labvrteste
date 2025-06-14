/**
 * app.js - Portal do Aluno Vicente Rijo
 * @author Prof. Bruno Carvalho
 * @version 2.0 (2025)
 */

// Inicialização da aplicação
// Não há mais parallax nem service worker

let deferredPrompt;

// Função para inicializar o tema ao carregar a página
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme, false); // Não salvar no localStorage na inicialização
}

function updateInstallButtonVisibility() {
    const installButton = document.getElementById('install-button');
    if (installButton) {
        // Verifica se está em modo standalone (PWA instalado)
        const isInStandaloneMode = (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone);
        
        // Verifica se é um dispositivo móvel
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

        if (isMobile && !isInStandaloneMode) {
            installButton.style.display = 'inline-block'; // Exibe o botão se for mobile E NÃO estiver em standalone
        } else {
            installButton.style.display = 'none'; // Oculta o botão caso contrário
        }
    }
}

// Função para mostrar o banner de instalação
function showInstallBanner() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Usuário aceitou a instalação');
            } else {
                console.log('Usuário recusou a instalação');
            }
            deferredPrompt = null;
        });
    }
}

// Listener para o evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Mostra o botão de instalação apenas em dispositivos móveis e se a PWA ainda não estiver instalada
    const installButton = document.getElementById('install-button');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    const isInStandaloneMode = (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone);

    if (installButton && isMobile && !isInStandaloneMode) {
        installButton.style.display = 'inline-block'; // Altera para inline-block para melhor compatibilidade com flex/grid
        // Remove o event listener duplicado para evitar múltiplos prompts ou comportamentos inesperados
        installButton.removeEventListener('click', showInstallBanner); // Remove o antigo
        installButton.addEventListener('click', showInstallBanner); // Adiciona o correto
    } else {
        installButton.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    setupCards();

    const btn = document.getElementById('toggle-theme');
    if (btn) {
        btn.addEventListener('click', toggleTheme);
    }

    updateNetworkStatusIndicator();

    // Removendo o listener duplicado para o botão de instalação aqui, pois já é tratado no beforeinstallprompt
    // const installButton = document.getElementById('install-button');
    // if (installButton) {
    //     installButton.addEventListener('click', async () => {
    //         if (deferredPrompt) {
    //             deferredPrompt.prompt();
    //             const { outcome } = await deferredPrompt.userChoice;
    //             deferredPrompt = null;
    //             installButton.style.display = 'none';
    //         } else {
    //             installButton.style.display = 'none';
    //         }
    //     });
    // }

    // A chamada a updateInstallButtonVisibility já está presente e é importante.
    updateInstallButtonVisibility();
    initializeTheme(); // Chamada para inicializar o tema quando o DOM estiver pronto
});

window.addEventListener('resize', () => {
    updateInstallButtonVisibility();
    updateNetworkStatusIndicator();
});

function setupCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.transition = 'all 0.3s ease';
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const link = card.querySelector('a');
                if (link) link.click();
            }
        });
    });
}

function setTheme(theme, save = true) {
    document.documentElement.setAttribute('data-theme', theme);
    if (save) {
        localStorage.setItem('theme', theme);
    }
    const btn = document.getElementById('toggle-theme');
    if (btn) {
        btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

function updateNetworkStatusIndicator() {
    const indicator = document.getElementById('network-status-indicator');
    if (indicator) {
        if (window.innerWidth <= 768) {
            indicator.style.display = 'none';
            return;
        }

        indicator.style.display = 'flex';
        if (navigator.onLine) {
            indicator.classList.add('network-status-online');
            indicator.classList.remove('network-status-offline');
            indicator.textContent = 'Online';
            indicator.setAttribute('aria-label', 'Status da rede: Online');
        } else {
            indicator.classList.add('network-status-offline');
            indicator.classList.remove('network-status-online');
            indicator.textContent = 'Offline';
            indicator.setAttribute('aria-label', 'Status da rede: Offline');
        }
    }
}

window.addEventListener('online', updateNetworkStatusIndicator);
window.addEventListener('offline', updateNetworkStatusIndicator);

// Função para exibir um prompt de atualização ao usuário
function promptForUpdate(registration) {
    const updateModal = document.getElementById('update-modal-overlay');
    const updateNowButton = document.getElementById('update-now-button');
    const updateLaterButton = document.getElementById('update-later-button');

    if (!updateModal || !updateNowButton || !updateLaterButton) {
        console.error('Elementos do modal de atualização não encontrados.');
        // Fallback para o confirm simples se os elementos não forem encontrados
        const updateConfirmed = confirm('Uma nova versão do Portal do Aluno está disponível! Deseja atualizar agora?');
        if (updateConfirmed) {
            if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            window.location.reload();
        }
        return;
    }

    updateModal.classList.add('active');

    const handleUpdateNow = () => {
        if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
        removeListeners();
    };

    const handleUpdateLater = () => {
        updateModal.classList.remove('active');
        removeListeners();
    };

    const removeListeners = () => {
        updateNowButton.removeEventListener('click', handleUpdateNow);
        updateLaterButton.removeEventListener('click', handleUpdateLater);
    };

    updateNowButton.addEventListener('click', handleUpdateNow);
    updateLaterButton.addEventListener('click', handleUpdateLater);
}

// Registro do Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Verifica se já existe um Service Worker registrado
        if (navigator.serviceWorker.controller) {
            console.log('Service Worker já está ativo');
            return;
        }

        navigator.serviceWorker.register('sw.js?v=7').then(function(registration) {
            console.log('ServiceWorker registrado com sucesso:', registration.scope);

            // Escutar por atualizações
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Verifica se houve mudanças reais no Service Worker
                        const currentVersion = localStorage.getItem('swVersion');
                        const newVersion = 'v7'; // Versão atual do Service Worker

                        if (currentVersion !== newVersion) {
                            // Só mostra o prompt se for uma nova versão
                            promptForUpdate(registration);
                            localStorage.setItem('swVersion', newVersion);
                        }
                    }
                });
            });

            // Se já houver um Service Worker em espera
            if (registration.waiting) {
                const currentVersion = localStorage.getItem('swVersion');
                const newVersion = 'v7';

                if (currentVersion !== newVersion) {
                    promptForUpdate(registration);
                    localStorage.setItem('swVersion', newVersion);
                }
            }

            // Verificar periodicamente por atualizações
            setInterval(() => {
                registration.update();
            }, 1000 * 60 * 60); // Verifica a cada hora

        }, function(err) {
            console.log('Falha ao registrar o ServiceWorker:', err);
        });
    });
}