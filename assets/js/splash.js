// Variável global para controlar o estado da splash screen
let splashScreenShown = false;

// Função para mostrar a splash screen
function showSplashScreen() {
    // Se a splash screen já foi mostrada nesta sessão, não mostra novamente
    if (splashScreenShown) {
        return;
    }

    // Verifica se o navegador está online
    if (!navigator.onLine) {
        console.log('Navegador offline, splash screen não será exibida.');
        return;
    }

    // Verifica se a splash screen está habilitada
    const splashData = JSON.parse(localStorage.getItem('splashData')) || {
        title: 'Bem-vindo ao Portal do Aluno',
        message: 'Carregando recursos...',
        buttonText: 'Continuar',
        enabled: true
    };

    // Se a splash screen estiver desabilitada, não mostra
    if (!splashData.enabled) {
        return;
    }

    // Usa a mensagem diretamente, sem conversão Markdown
    const renderedMessage = splashData.message;

    // Remove qualquer splash screen existente
    const existingSplash = document.querySelector('.splash-overlay');
    if (existingSplash) {
        existingSplash.remove();
    }

    const splashOverlay = document.createElement('div');
    splashOverlay.className = 'splash-overlay';
    splashOverlay.innerHTML = `
        <div class="splash-container">
            <div class="splash-header">
                <img src="assets/images/logos/logo.png" alt="Logo do Colégio Vicente Rijo" class="splash-logo">
                <h2 class="splash-title" id="splashTitle">${splashData.title}</h2>
            </div>
            <p class="splash-message" id="splashMessage">${renderedMessage}</p>
            <div class="splash-buttons">
                <button class="splash-button primary" id="splashConfirm">${splashData.buttonText}</button>
            </div>
        </div>
    `;

    document.body.appendChild(splashOverlay);
    setTimeout(() => splashOverlay.classList.add('active'), 100);

    // Função para fechar a splash screen
    const closeSplash = () => {
        splashOverlay.classList.remove('active');
        setTimeout(() => {
            splashOverlay.remove();
            splashScreenShown = true;
        }, 300);
    };

    // Manipulador de eventos para o botão
    document.getElementById('splashConfirm').addEventListener('click', closeSplash);

    // Manipulador de eventos para clicar fora
    splashOverlay.addEventListener('click', (e) => {
        if (e.target === splashOverlay) {
            closeSplash();
        }
    });
}

// Função para resetar o estado da splash screen
function resetSplashScreen() {
    splashScreenShown = false;
}

// Mostrar splash screen quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', showSplashScreen);

// Resetar splash screen quando a página for atualizada
window.addEventListener('beforeunload', resetSplashScreen);

// Mostrar splash screen quando o Service Worker for atualizado
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        resetSplashScreen();
        showSplashScreen();
    });
}

// Mostrar splash screen quando a conexão for restabelecida
window.addEventListener('online', () => {
    resetSplashScreen();
    showSplashScreen();
});

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    // A função setupCards agora está em app.js
}); 
