// Animation du plateau de démonstration
const boardEl = document.querySelector('.animated-board');
if (boardEl) {
    for (let i = 0; i < 64; i++) {
        const cell = document.createElement('div');
        cell.className = (Math.floor(i/8) + i) % 2 === 0 ? 'cell light' : 'cell dark';
        boardEl.appendChild(cell);
    }
}

// ==================== ENREGISTREMENT PWA SERVICE WORKER ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then((reg) => console.log('[PWA] Service Worker registered with scope:', reg.scope))
            .catch((err) => console.error('[PWA] Service Worker registration failed:', err));
    });
}

// ==================== GESTION DE L'INSTALLATION PWA & MODAL (WINDOWS 10+) ====================
let deferredInstallPrompt = null;
const navInstallBtn = document.getElementById('installPwaBtn');
const heroInstallBtn = document.getElementById('heroInstallPwaBtn');
const ctaInstallBtn = document.getElementById('ctaInstallPwaBtn');
const downloadModal = document.getElementById('downloadModal');
const closeModalBtn = document.getElementById('closeModalBtn');

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (navInstallBtn) {
        navInstallBtn.style.display = 'inline-flex';
    }
});

async function handleInstallClick() {
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choiceResult = await deferredInstallPrompt.userChoice;
        console.log('[PWA] User response to installation:', choiceResult.outcome);
        if (choiceResult.outcome === 'accepted') {
            if (navInstallBtn) navInstallBtn.style.display = 'none';
        }
        deferredInstallPrompt = null;
    } else {
        // Fallback : affichage de la modal premium d'alternatives
        if (downloadModal) {
            downloadModal.classList.add('active');
        }
    }
}

if (navInstallBtn) navInstallBtn.addEventListener('click', handleInstallClick);
if (heroInstallBtn) heroInstallBtn.addEventListener('click', handleInstallClick);
if (ctaInstallBtn) ctaInstallBtn.addEventListener('click', handleInstallClick);

if (closeModalBtn && downloadModal) {
    closeModalBtn.addEventListener('click', () => {
        downloadModal.classList.remove('active');
    });
    
    downloadModal.addEventListener('click', (e) => {
        if (e.target === downloadModal) {
            downloadModal.classList.remove('active');
        }
    });
}

window.addEventListener('appinstalled', (event) => {
    console.log('[PWA] Min-Conflit has been successfully installed on the OS!');
    if (navInstallBtn) {
        navInstallBtn.style.display = 'none';
    }
});