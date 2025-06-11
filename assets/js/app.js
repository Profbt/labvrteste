/**
 * app.js - Portal do Aluno Vicente Rijo
 * @author Prof. Bruno Carvalho
 * @version 2.0 (2025)
 */

// Inicialização da aplicação
// Não há mais parallax nem service worker

document.addEventListener('DOMContentLoaded', () => {
    setupCards();
    // Removida a lógica de inicialização do tema daqui
    // O tema agora é inicializado por um script inline no head do index.html

    // Botão de alternância
    const btn = document.getElementById('toggle-theme');
    if (btn) {
        btn.addEventListener('click', toggleTheme);
        // Garante que o ícone do botão seja atualizado com o tema já definido
        setTheme(document.documentElement.getAttribute('data-theme'));
    }

    // Lógica para o indicador de status da rede
    updateNetworkStatusIndicator();
});

  function setupCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        // Estilo inicial
        card.style.transition = 'all 0.3s ease';
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        
        // Efeito hover
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        });
        // Navegação por teclado
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const link = card.querySelector('a');
                if (link) link.click();
            }
      });
    });
  }
  
// Rastreamento de cliques
function trackLinkClick(card) {
    const platform = card.getAttribute('data-platform');
    const link = card.querySelector('a')?.getAttribute('href');
    if (link) {
        console.log(`Link clicado: ${platform} - ${link}`);
        window.open(link, '_blank');
    } else {
        console.warn(`Nenhum link encontrado para: ${platform}`);
    }
}

// Alternância de tema claro/escuro
function setTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        const btn = document.getElementById('toggle-theme');
        if (btn) {
            btn.textContent = '☀️';
        }
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        const btn = document.getElementById('toggle-theme');
        if (btn) {
            btn.textContent = '🌙';
        }
    }
}

function toggleTheme() {
    const current = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Lógica para o indicador de status da rede
function updateNetworkStatusIndicator() {
    console.log('APP.JS: updateNetworkStatusIndicator chamado.');
    console.log('APP.JS: navigator.onLine =', navigator.onLine);
    const indicator = document.getElementById('network-status-indicator');
    if (indicator) {
        console.log('APP.JS: Indicador de rede encontrado.');
        if (navigator.onLine) {
            indicator.classList.add('network-status-online');
            indicator.classList.remove('network-status-offline');
            indicator.textContent = 'Online';
            indicator.setAttribute('aria-label', 'Status da rede: Online');
            console.log('APP.JS: Classes para Online aplicadas.');
        } else {
            indicator.classList.add('network-status-offline');
            indicator.classList.remove('network-status-online');
            indicator.textContent = 'Offline';
            indicator.setAttribute('aria-label', 'Status da rede: Offline');
            console.log('APP.JS: Classes para Offline aplicadas.');
        }
    } else {
        console.warn('APP.JS: Indicador de rede (#network-status-indicator) NÃO encontrado.');
    }
}

// Adiciona event listeners para os eventos online/offline
window.addEventListener('online', updateNetworkStatusIndicator);
window.addEventListener('offline', updateNetworkStatusIndicator);

// Chama a função no carregamento inicial para definir o status correto
document.addEventListener('DOMContentLoaded', updateNetworkStatusIndicator);