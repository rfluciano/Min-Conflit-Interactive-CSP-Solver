const runtime = typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime : null;
const storageArea = typeof chrome !== 'undefined' && chrome.storage ? chrome.storage.local : null;
const solvers = window.MinConflitSolvers;

const defaults = {
    mode: 'queens',
    queensSize: 12,
    difficulty: 'easy',
    method: 'backtrack',
    benchmarkEnabled: true,
    customGridText: formatGridForTextarea(solvers.SUDOKU_PUZZLES.easy),
    lastRun: null
};

const worker = new Worker('worker.js');
const pendingRequests = new Map();
let nextRequestId = 1;
let waitingTimer = null;

const state = {
    mode: defaults.mode,
    states: [],
    currentStep: 0,
    playInterval: null,
    customGridText: defaults.customGridText,
    currentGrid: cloneGrid(solvers.SUDOKU_PUZZLES.easy),
    fixedMask: buildFixedMask(solvers.SUDOKU_PUZZLES.easy),
    benchmarks: {
        queens: null,
        sudoku: null
    },
    lastRun: null
};

const elements = {
    modeSelect: document.getElementById('modeSelect'),
    queensSize: document.getElementById('queensSize'),
    difficultySelect: document.getElementById('difficultySelect'),
    methodSelect: document.getElementById('methodSelect'),
    benchmarkToggle: document.getElementById('benchmarkToggle'),
    customGridInput: document.getElementById('customGridInput'),
    customGridField: document.getElementById('customGridField'),
    queensSizeField: document.getElementById('queensSizeField'),
    difficultyField: document.getElementById('difficultyField'),
    methodField: document.getElementById('methodField'),
    runButton: document.getElementById('runButton'),
    runtimeBadge: document.getElementById('runtimeBadge'),
    statsPanel: document.getElementById('statsPanel'),
    benchmarksPanel: document.getElementById('benchmarksPanel'),
    boardTitle: document.getElementById('boardTitle'),
    boardSubtitle: document.getElementById('boardSubtitle'),
    boardMeta: document.getElementById('boardMeta'),
    boardHost: document.getElementById('boardHost'),
    infoPanel: document.getElementById('infoPanel'),
    trackingPanel: document.getElementById('trackingPanel'),
    loadingPanel: document.getElementById('loadingPanel'),
    loadingTitle: document.getElementById('loadingTitle'),
    loadingMessage: document.getElementById('loadingMessage'),
    timelineCard: document.getElementById('timelineCard'),
    stepSlider: document.getElementById('stepSlider'),
    stepLabel: document.getElementById('stepLabel'),
    playPauseButton: document.getElementById('playPauseButton'),
    lastStepButton: document.getElementById('lastStepButton')
};

worker.addEventListener('message', (event) => {
    const message = event.data || {};
    const handlers = pendingRequests.get(message.id);
    if (!handlers) {
        return;
    }
    pendingRequests.delete(message.id);
    if (message.ok) {
        handlers.resolve(message.result);
    } else {
        handlers.reject(new Error(message.error || 'Worker error'));
    }
});

function cloneGrid(grid) {
    return grid.map((row) => row.slice());
}

function buildFixedMask(grid) {
    return grid.map((row) => row.map((value) => value !== 0));
}

function formatGridForTextarea(grid) {
    return grid.map((row) => row.join(' ')).join('\n');
}

function storageGet(defaultValues) {
    return new Promise((resolve) => {
        if (!storageArea) {
            const values = {};
            Object.keys(defaultValues).forEach((key) => {
                const raw = localStorage.getItem(key);
                values[key] = raw ? JSON.parse(raw) : defaultValues[key];
            });
            resolve(values);
            return;
        }
        storageArea.get(defaultValues, resolve);
    });
}

function storageSet(values) {
    return new Promise((resolve) => {
        if (!storageArea) {
            Object.keys(values).forEach((key) => {
                localStorage.setItem(key, JSON.stringify(values[key]));
            });
            resolve();
            return;
        }
        storageArea.set(values, resolve);
    });
}

function callWorker(type, payload) {
    const id = nextRequestId++;
    return new Promise((resolve, reject) => {
        pendingRequests.set(id, { resolve, reject });
        worker.postMessage({ id, type, payload });
    });
}

function setRuntimeBadge() {
    if (runtime) {
        elements.runtimeBadge.textContent = 'Local extension runtime';
        elements.runtimeBadge.className = 'status-chip local';
    } else {
        elements.runtimeBadge.textContent = 'Portfolio preview mode';
        elements.runtimeBadge.className = 'status-chip preview';
    }
}

function toggleModeFields() {
    const isQueens = state.mode === 'queens';
    elements.queensSizeField.classList.toggle('hidden', !isQueens);
    elements.difficultyField.classList.toggle('hidden', isQueens);
    elements.methodField.classList.toggle('hidden', isQueens);
    elements.customGridField.classList.toggle(
        'hidden',
        isQueens || elements.difficultySelect.value !== 'custom'
    );
    elements.boardTitle.textContent = isQueens ? 'N-Queens board' : 'Sudoku board';
    elements.boardSubtitle.textContent = isQueens
        ? 'Le solveur local rejoue chaque deplacement de reine dans un worker.'
        : 'Le solveur local compare backtracking et Min-Conflict sans backend distant.';
}

function stopPlayback() {
    if (state.playInterval) {
        clearInterval(state.playInterval);
        state.playInterval = null;
        elements.playPauseButton.textContent = 'Play';
    }
}

function setStep(index) {
    if (!state.states.length) {
        return;
    }
    state.currentStep = Math.max(0, Math.min(index, state.states.length - 1));
    elements.stepSlider.value = String(state.currentStep);
    elements.stepLabel.textContent = `Etape ${state.currentStep} / ${state.states.length - 1}`;
    renderCurrentStep();
}

function renderPlaceholder(message) {
    elements.boardHost.innerHTML = `<div class="empty-state">${message}</div>`;
}

function resetWorkspace(message) {
    stopPlayback();
    state.states = [];
    state.currentStep = 0;
    elements.boardMeta.textContent = 'Aucune execution';
    updateTimelineVisibility();
    renderPlaceholder(message);
    renderInfoPanel();
    renderTrackingPanel();
}

function renderStats() {
    if (!state.lastRun) {
        elements.statsPanel.innerHTML = [
            createMetricCard('Mode', 'Aucune execution'),
            createMetricCard('Etat', 'Pret'),
            createMetricCard('Engine', runtime ? 'Extension locale' : 'Apercu'),
            createMetricCard('Permissions', 'storage uniquement')
        ].join('');
        return;
    }

    const lastRun = state.lastRun;
    const entries = [
        createMetricCard('Mode', lastRun.mode === 'queens' ? 'N-Queens' : 'Sudoku'),
        createMetricCard('Etat', lastRun.solved ? 'Resolu' : 'Non resolu'),
        createMetricCard('Etapes', String(lastRun.steps)),
        createMetricCard('Temps', `${Math.round(lastRun.timeMs)} ms`)
    ];

    if (lastRun.mode === 'queens') {
        entries.push(createMetricCard('Taille', `N=${lastRun.n}`));
    } else {
        entries.push(createMetricCard('Methode', lastRun.method === 'minconf' ? 'Min-Conflict' : 'Backtracking'));
        entries.push(createMetricCard('Difficulte', lastRun.difficulty || 'custom'));
    }

    elements.statsPanel.innerHTML = entries.join('');
}

function createMetricCard(label, value) {
    return `
        <article class="metric-card">
            <div class="metric-label">${label}</div>
            <div class="metric-value">${value}</div>
        </article>
    `;
}

function renderBenchmarks() {
    const cards = [];

    if (state.benchmarks.queens) {
        const rows = state.benchmarks.queens.map((row) => `
            <tr>
                <td>${row.n}</td>
                <td>${row.successRate.toFixed(1)}%</td>
                <td>${row.avgTimeMs.toFixed(1)} ms</td>
                <td>${row.avgSteps.toFixed(1)}</td>
            </tr>
        `).join('');
        cards.push(`
            <section class="benchmark-card">
                <h3>N-Queens benchmark</h3>
                <table class="data-table">
                    <thead>
                        <tr><th>N</th><th>Succes</th><th>Temps moyen</th><th>Etapes</th></tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </section>
        `);
    }

    if (state.benchmarks.sudoku) {
        const rows = state.benchmarks.sudoku.map((row) => `
            <tr>
                <td>${row.difficulty}</td>
                <td>${row.solved ? 'Oui' : 'Non'}</td>
                <td>${row.timeMs.toFixed(1)} ms</td>
                <td>${row.steps}</td>
            </tr>
        `).join('');
        cards.push(`
            <section class="benchmark-card">
                <h3>Sudoku benchmark</h3>
                <table class="data-table">
                    <thead>
                        <tr><th>Difficulte</th><th>Resolu</th><th>Temps</th><th>Etapes</th></tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </section>
        `);
    }

    if (!cards.length) {
        elements.benchmarksPanel.innerHTML = '<div class="empty-state">Lance un solveur avec le benchmark active pour remplir cette zone.</div>';
        return;
    }

    elements.benchmarksPanel.innerHTML = cards.join('');
}

function renderTrackingPanel() {
    if (!state.states.length) {
        elements.trackingPanel.innerHTML = '<div class="empty-state">Le tracking apparaitra apres la premiere execution.</div>';
        return;
    }

    const current = state.states[state.currentStep];
    if (state.mode === 'queens') {
        const rows = current.assign.map((column, row) => {
            const moved = current.moved && current.moved.var === row;
            const status = current.angry.includes(row) ? 'Conflict' : 'Stable';
            return `
                <tr>
                    <td>Q${row + 1}</td>
                    <td>${notation(row, column, current.assign.length)}</td>
                    <td>${moved ? `${notation(row, current.moved.from, current.assign.length)} -> ${notation(row, current.moved.to, current.assign.length)}` : '-'}</td>
                    <td>${status}</td>
                </tr>
            `;
        }).join('');

        elements.trackingPanel.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr><th>Reine</th><th>Position</th><th>Move</th><th>Etat</th></tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
        return;
    }

    const angry = new Set(current.angry.map(([row, col]) => `${row},${col}`));
    const rows = [];
    for (let row = 0; row < 9; row += 1) {
        for (let col = 0; col < 9; col += 1) {
            if (state.fixedMask[row][col]) {
                continue;
            }
            const moved = current.moved && current.moved.var[0] === row && current.moved.var[1] === col;
            rows.push(`
                <tr>
                    <td>${row},${col}</td>
                    <td>${state.currentGrid[row][col] || '-'}</td>
                    <td>${current.grid[row][col] || '-'}</td>
                    <td>${moved ? `${current.moved.from} -> ${current.moved.to}` : '-'}</td>
                    <td>${angry.has(`${row},${col}`) ? 'Conflict' : 'Stable'}</td>
                </tr>
            `);
        }
    }

    elements.trackingPanel.innerHTML = `
        <table class="data-table">
            <thead>
                <tr><th>Cell</th><th>Init</th><th>Current</th><th>Move</th><th>Etat</th></tr>
            </thead>
            <tbody>${rows.join('')}</tbody>
        </table>
    `;
}

function renderInfoPanel() {
    if (!state.states.length) {
        elements.infoPanel.innerHTML = 'Aucune etape a afficher pour le moment.';
        return;
    }

    const current = state.states[state.currentStep];
    if (state.mode === 'queens') {
        let html = `<strong>Etape ${current.step}</strong><br>Total conflits: ${current.totalConflicts}`;
        if (current.moved) {
            html += `<br>Move: ${notation(current.moved.var, current.moved.from, current.assign.length)} -> ${notation(current.moved.var, current.moved.to, current.assign.length)}`;
            html += `<br>Conflits: ${current.moved.conflictsBefore} -> ${current.moved.conflictsAfter}`;
        }
        if (current.totalConflicts === 0) {
            html += '<br><strong>Solution trouvee.</strong>';
        }
        elements.infoPanel.innerHTML = html;
        return;
    }

    let html = `<strong>Etape ${current.step}</strong><br>Total conflits: ${current.totalConflicts}`;
    if (current.moved) {
        html += `<br>Cell ${current.moved.var[0]},${current.moved.var[1]}: ${current.moved.from} -> ${current.moved.to}`;
        html += `<br>Conflits: ${current.moved.conflictsBefore} -> ${current.moved.conflictsAfter}`;
    }
    if (current.solved) {
        html += '<br><strong>Grille resolue.</strong>';
    }
    elements.infoPanel.innerHTML = html;
}

function renderCurrentStep() {
    if (!state.states.length) {
        renderPlaceholder('Choisis un mode puis lance le solveur pour voir le replay local.');
        renderInfoPanel();
        renderTrackingPanel();
        return;
    }

    if (state.mode === 'queens') {
        drawQueensBoard();
    } else {
        drawSudokuBoard();
    }

    renderInfoPanel();
    renderTrackingPanel();
}

function drawQueensBoard() {
    const current = state.states[state.currentStep];
    const n = current.assign.length;
    const hostWidth = elements.boardHost.clientWidth || 720;
    const hostHeight = elements.boardHost.clientHeight || 540;
    const cellSize = Math.max(16, Math.min(Math.floor((hostWidth - 40) / n), Math.floor((hostHeight - 40) / n), 54));

    const board = document.createElement('div');
    board.className = 'queens-board';
    board.style.gridTemplateColumns = `repeat(${n}, ${cellSize}px)`;
    board.style.gridTemplateRows = `repeat(${n}, ${cellSize}px)`;

    for (let row = 0; row < n; row += 1) {
        for (let col = 0; col < n; col += 1) {
            const cell = document.createElement('div');
            cell.className = `queen-cell ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            if (current.assign[row] === col) {
                const glyph = document.createElement('span');
                glyph.className = 'queen-glyph';
                glyph.textContent = 'Q';
                glyph.style.fontSize = `${Math.max(14, Math.floor(cellSize * 0.54))}px`;
                cell.appendChild(glyph);
                cell.classList.add(current.angry.includes(row) ? 'angry' : 'happy');
                if (current.moved && current.moved.var === row) {
                    cell.classList.add('moved');
                }
            }
            board.appendChild(cell);
        }
    }

    elements.boardHost.innerHTML = '';
    elements.boardHost.appendChild(board);
}

function drawSudokuBoard() {
    const current = state.states[state.currentStep];
    const angry = new Set(current.angry.map(([row, col]) => `${row},${col}`));
    const board = document.createElement('div');
    board.className = 'sudoku-board';

    for (let row = 0; row < 9; row += 1) {
        for (let col = 0; col < 9; col += 1) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            if (col % 3 === 2 && col !== 8) {
                cell.classList.add('right-thick');
            }
            if (row % 3 === 2 && row !== 8) {
                cell.classList.add('bottom-thick');
            }
            if (state.fixedMask[row][col]) {
                cell.classList.add('fixed');
            } else {
                cell.classList.add('generated');
            }
            if (angry.has(`${row},${col}`)) {
                cell.classList.add('conflict');
            }
            if (current.moved && current.moved.var[0] === row && current.moved.var[1] === col) {
                cell.classList.add('moved');
            }
            cell.textContent = current.grid[row][col] ? String(current.grid[row][col]) : '';
            board.appendChild(cell);
        }
    }

    elements.boardHost.innerHTML = '';
    elements.boardHost.appendChild(board);
}

function notation(row, col, size) {
    return `${String.fromCharCode(97 + col)}${size - row}`;
}

function updateTimelineVisibility() {
    const hasStates = state.states.length > 0;
    elements.timelineCard.classList.toggle('hidden', !hasStates);
    if (!hasStates) {
        return;
    }
    elements.stepSlider.max = String(state.states.length - 1);
    elements.stepSlider.value = String(state.currentStep);
    elements.stepLabel.textContent = `Etape ${state.currentStep} / ${state.states.length - 1}`;
}

function setLoading(visible, title, message) {
    elements.loadingPanel.classList.toggle('hidden', !visible);
    elements.loadingTitle.textContent = title || 'Calcul en cours';
    elements.loadingMessage.textContent = message || 'Le solveur travaille localement...';
    elements.runButton.disabled = visible;

    if (waitingTimer) {
        clearInterval(waitingTimer);
        waitingTimer = null;
    }

    if (!visible) {
        return;
    }

    const startedAt = Date.now();
    waitingTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        elements.loadingMessage.textContent = `${message || 'Le solveur travaille localement...'} ${elapsed}s`;
    }, 1000);
}

function persistPreferences() {
    return storageSet({
        mode: state.mode,
        queensSize: Number.parseInt(elements.queensSize.value, 10) || defaults.queensSize,
        difficulty: elements.difficultySelect.value,
        method: elements.methodSelect.value,
        benchmarkEnabled: elements.benchmarkToggle.checked,
        customGridText: elements.customGridInput.value
    });
}

function updateCurrentSudokuSource() {
    if (elements.difficultySelect.value === 'custom') {
        const parsed = parseGridFromTextarea(elements.customGridInput.value);
        if (!parsed.ok) {
            return parsed;
        }
        state.currentGrid = parsed.grid;
        state.fixedMask = buildFixedMask(parsed.grid);
        state.customGridText = elements.customGridInput.value;
        return { ok: true, grid: parsed.grid };
    }

    const puzzle = cloneGrid(solvers.SUDOKU_PUZZLES[elements.difficultySelect.value]);
    state.currentGrid = puzzle;
    state.fixedMask = buildFixedMask(puzzle);
    elements.customGridInput.value = formatGridForTextarea(puzzle);
    state.customGridText = elements.customGridInput.value;
    return { ok: true, grid: puzzle };
}

function parseGridFromTextarea(text) {
    const rows = text.trim().split('\n').map((line) => line.trim()).filter(Boolean);
    if (rows.length !== 9) {
        return { ok: false, error: 'La grille custom doit contenir exactement 9 lignes.' };
    }

    const grid = rows.map((line) => line.split(/\s+/).map((value) => Number.parseInt(value, 10)));
    const validation = solvers.validateSudokuGrid(grid);
    if (!validation.valid) {
        return { ok: false, error: validation.errors.join(' ') };
    }

    return { ok: true, grid };
}

async function saveLastRun(lastRun) {
    state.lastRun = lastRun;
    await storageSet({ lastRun });
    renderStats();
}

async function runQueensFlow() {
    const n = Number.parseInt(elements.queensSize.value, 10);
    if (!solvers.validateNQueensSize(n)) {
        throw new Error('N doit etre un entier entre 4 et 2000.');
    }

    setLoading(true, 'Resolution N-Queens', 'Calcul local en cours...');
    const result = await callWorker('solveQueens', {
        n,
        maxSteps: 1200
    });

    if (!result.ok) {
        throw new Error(result.error || 'Echec du solveur N-Queens.');
    }

    state.states = result.states;
    state.currentStep = 0;
    state.benchmarks.sudoku = null;
    elements.boardMeta.textContent = `${result.solved ? 'Resolu' : 'Non resolu'} | ${result.steps} etapes | ${Math.round(result.timeMs)} ms`;
    updateTimelineVisibility();
    renderCurrentStep();
    await saveLastRun({
        mode: 'queens',
        solved: result.solved,
        steps: result.steps,
        timeMs: result.timeMs,
        n
    });

    if (elements.benchmarkToggle.checked) {
        setLoading(true, 'Benchmark N-Queens', 'Mesure locale en cours...');
        state.benchmarks.queens = await callWorker('benchmarkQueens', {
            sizes: solvers.DEFAULT_QUEENS_BENCHMARK_SIZES,
            trials: 6,
            maxSteps: 900
        });
        renderBenchmarks();
    }
}

async function runSudokuFlow() {
    const source = updateCurrentSudokuSource();
    if (!source.ok) {
        throw new Error(source.error);
    }

    const method = elements.methodSelect.value;
    setLoading(true, 'Resolution Sudoku', 'Calcul local en cours...');
    const result = await callWorker('solveSudoku', {
        grid: source.grid,
        method,
        timeoutMs: 12000,
        maxStepsPerTry: 700,
        maxRestarts: 14,
        captureEvery: 1,
        maxStates: 12000
    });

    if (!result.ok) {
        throw new Error(result.error || 'Echec du solveur Sudoku.');
    }

    state.states = result.states;
    state.currentStep = 0;
    state.benchmarks.queens = null;
    elements.boardMeta.textContent = `${result.solved ? 'Resolu' : 'Non resolu'} | ${result.steps} etapes | ${Math.round(result.timeMs)} ms`;
    updateTimelineVisibility();
    renderCurrentStep();
    await saveLastRun({
        mode: 'sudoku',
        solved: result.solved,
        steps: result.steps,
        timeMs: result.timeMs,
        difficulty: elements.difficultySelect.value,
        method
    });

    if (elements.benchmarkToggle.checked) {
        setLoading(true, 'Benchmark Sudoku', 'Mesure locale en cours...');
        state.benchmarks.sudoku = await callWorker('benchmarkSudoku', {
            method,
            timeoutMs: method === 'minconf' ? 5000 : 12000
        });
        renderBenchmarks();
    }
}

async function runSolver() {
    stopPlayback();
    await persistPreferences();

    try {
        if (state.mode === 'queens') {
            await runQueensFlow();
        } else {
            await runSudokuFlow();
        }
    } catch (error) {
        elements.infoPanel.innerHTML = `<span class="status-badge warn">${error.message}</span>`;
        elements.boardMeta.textContent = 'Erreur';
        if (!state.states.length) {
            renderPlaceholder('Une erreur a empeche la resolution. Verifie les entrees puis relance.');
        }
    } finally {
        setLoading(false);
        renderBenchmarks();
    }
}

function applyModeFromControls() {
    state.mode = elements.modeSelect.value;
    toggleModeFields();
    if (state.mode === 'sudoku') {
        updateCurrentSudokuSource();
    }

    resetWorkspace(state.mode === 'queens'
        ? 'Choisis une taille N puis lance le solveur pour visualiser le replay.'
        : 'Choisis une grille Sudoku ou colle une grille custom, puis lance le solveur.');
}

function restoreStateFromControls(stored) {
    state.mode = stored.mode;
    elements.modeSelect.value = stored.mode;
    elements.queensSize.value = String(stored.queensSize);
    elements.difficultySelect.value = stored.difficulty;
    elements.methodSelect.value = stored.method;
    elements.benchmarkToggle.checked = Boolean(stored.benchmarkEnabled);
    elements.customGridInput.value = stored.customGridText;
    state.customGridText = stored.customGridText;
    applyModeFromControls();
}

function wireEvents() {
    elements.modeSelect.addEventListener('change', async () => {
        applyModeFromControls();
        await persistPreferences();
    });

    elements.difficultySelect.addEventListener('change', async () => {
        toggleModeFields();
        updateCurrentSudokuSource();
        await persistPreferences();
        if (state.mode === 'sudoku') {
            resetWorkspace('La grille Sudoku est prete. Lance le solveur quand tu veux.');
        }
    });

    elements.customGridInput.addEventListener('input', async () => {
        state.customGridText = elements.customGridInput.value;
        await persistPreferences();
    });

    elements.methodSelect.addEventListener('change', persistPreferences);
    elements.queensSize.addEventListener('change', persistPreferences);
    elements.benchmarkToggle.addEventListener('change', persistPreferences);
    elements.runButton.addEventListener('click', runSolver);

    elements.stepSlider.addEventListener('input', () => {
        stopPlayback();
        setStep(Number.parseInt(elements.stepSlider.value, 10));
    });

    elements.playPauseButton.addEventListener('click', () => {
        if (!state.states.length) {
            return;
        }
        if (state.playInterval) {
            stopPlayback();
            return;
        }
        elements.playPauseButton.textContent = 'Pause';
        state.playInterval = setInterval(() => {
            if (state.currentStep >= state.states.length - 1) {
                stopPlayback();
                return;
            }
            setStep(state.currentStep + 1);
        }, 380);
    });

    elements.lastStepButton.addEventListener('click', () => {
        stopPlayback();
        setStep(state.states.length - 1);
    });

    window.addEventListener('resize', () => {
        if (state.states.length) {
            renderCurrentStep();
        }
    });
}

async function init() {
    setRuntimeBadge();
    wireEvents();
    renderBenchmarks();
    renderStats();

    const stored = await storageGet(defaults);
    restoreStateFromControls(stored);
    state.lastRun = stored.lastRun;
    renderStats();
    updateCurrentSudokuSource();
    renderPlaceholder(state.mode === 'queens'
        ? 'Choisis une taille N puis lance le solveur pour visualiser le replay.'
        : 'Choisis une grille Sudoku ou colle une grille custom, puis lance le solveur.');
    renderInfoPanel();
    renderTrackingPanel();
}

init();
