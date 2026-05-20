'use strict';

(function() {
    const runtime = typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime : null;
    const storageArea = typeof chrome !== 'undefined' && chrome.storage ? chrome.storage.local : null;

    const versionBadge = document.getElementById('versionBadge');
    const runtimeInfo = document.getElementById('runtimeInfo');
    const lastRunSummary = document.getElementById('lastRunSummary');
    const openWorkspaceLink = document.getElementById('openWorkspaceLink');

    function storageGet(defaults) {
        return new Promise((resolve) => {
            if (!storageArea) {
                const values = {};
                Object.keys(defaults).forEach((key) => {
                    const raw = localStorage.getItem(key);
                    values[key] = raw ? JSON.parse(raw) : defaults[key];
                });
                resolve(values);
                return;
            }
            storageArea.get(defaults, resolve);
        });
    }

    function formatLastRun(lastRun) {
        if (!lastRun) {
            return 'Aucun calcul encore.';
        }

        const parts = [];
        parts.push(lastRun.mode === 'queens' ? 'Mode: N-Queens' : 'Mode: Sudoku');
        if (lastRun.mode === 'queens' && typeof lastRun.n === 'number') {
            parts.push('Taille: ' + lastRun.n);
        }
        if (lastRun.mode === 'sudoku') {
            parts.push('Methode: ' + (lastRun.method === 'minconf' ? 'Min-Conflict' : 'Backtracking'));
            parts.push('Difficulte: ' + (lastRun.difficulty || 'custom'));
        }
        parts.push('Etat: ' + (lastRun.solved ? 'resolu' : 'non resolu'));
        parts.push('Etapes: ' + lastRun.steps);
        parts.push('Temps: ' + Math.round(lastRun.timeMs) + ' ms');
        return parts.join(' | ');
    }

    async function init() {
        if (runtime) {
            versionBadge.textContent = 'v' + runtime.getManifest().version;
            openWorkspaceLink.href = runtime.getURL('app.html');
            runtimeInfo.textContent = 'Extension chargee localement. Aucun acces a des sites tiers n est demande.';
        } else {
            runtimeInfo.textContent = 'Mode apercu. Le popup fonctionne aussi hors extension pour la demo.';
        }

        const stored = await storageGet({ lastRun: null });
        lastRunSummary.textContent = formatLastRun(stored.lastRun);
    }

    init();
})();
