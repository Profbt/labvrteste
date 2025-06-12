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
        if (window.innerWidth <= 768) {
            installButton.style.display = 'inline-block';
        } else {
            installButton.style.display = 'none';
        }
    }
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    updateInstallButtonVisibility();
});

document.addEventListener('DOMContentLoaded', () => {
    setupCards();

    const btn = document.getElementById('toggle-theme');
    if (btn) {
        btn.addEventListener('click', toggleTheme);
    }

    updateNetworkStatusIndicator();

    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                deferredPrompt = null;
                installButton.style.display = 'none';
            } else {
                installButton.style.display = 'none';
            }
        });
    }
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

console.log('Falha ao registrar o ServiceWorker:', err);