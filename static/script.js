const API = '';
let mode = 'queens';
let states = [], currentStep = 0, playInterval = null, backendOnline = false;
let sudokuInitialGrid = [];
let sudokuFixedMask = [];

async function checkBackend() {
    try {
        const r = await fetch(`${API}/`, { signal: AbortSignal.timeout(1500) });
        backendOnline = r.ok;
        if (backendOnline) {
            document.getElementById('connectionStatus').innerHTML = '🟢 En Ligne (Backend)';
            document.getElementById('connectionStatus').className = 'status online';
        } else {
            document.getElementById('connectionStatus').innerHTML = '⚡ Hors-Ligne (Moteur Local)';
            document.getElementById('connectionStatus').className = 'status offline-fallback';
        }
    } catch (e) {
        backendOnline = false;
        document.getElementById('connectionStatus').innerHTML = '⚡ Hors-Ligne (Moteur Local)';
        document.getElementById('connectionStatus').className = 'status offline-fallback';
    }
}
checkBackend();
setInterval(checkBackend, 4000);

function notation(r, c, n) { return String.fromCharCode(97 + c) + (n - r); }

// ==================== N‑REINES ====================
function drawQueensBoard() {
    if (!states.length) return;
    const container = document.getElementById('boardContainer');
    container.innerHTML = '';
    const board = document.createElement('div');
    board.className = 'queens-board';
    const n = Object.keys(states[currentStep].assign).length;
    const boardArea = document.querySelector('.board-area');
    const maxW = boardArea.clientWidth - 20;
    const maxH = boardArea.clientHeight - 100;
    const cellSize = Math.min(maxW / n, maxH / n, 48);
    board.style.width = board.style.height = (cellSize * n) + 'px';
    board.style.gridTemplateColumns = `repeat(${n}, ${cellSize}px)`;
    board.style.gridTemplateRows = `repeat(${n}, ${cellSize}px)`;

    const assign = states[currentStep].assign;
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
            if (assign[r] === c) {
                const span = document.createElement('span');
                span.className = 'queen';
                span.textContent = '♛';
                span.style.fontSize = (cellSize * 0.8) + 'px';
                cell.appendChild(span);
                if (states[currentStep].angry.includes(r)) cell.classList.add('angry');
                else cell.classList.add('happy');
                if (states[currentStep].moved && states[currentStep].moved.var === r) cell.classList.add('moved');
            }
            board.appendChild(cell);
        }
    }
    container.appendChild(board);
    updateQueensInfo();
    updateQueenTable();
}

function updateQueensInfo() {
    const info = document.getElementById('infoPanel');
    if (!states.length) { info.innerHTML = ''; return; }
    const st = states[currentStep];
    let txt = `<strong>Étape ${st.step}</strong> — Conflits totaux : ${st.total_conflicts}`;
    if (st.moved) {
        const m = st.moved;
        const n = Object.keys(st.assign).length;
        txt += `<br>Reine ${m.var} déplacée de ${notation(m.var, m.from, n)} → ${notation(m.var, m.to, n)}`;
        txt += `<br>Conflits : ${m.conflicts_before} → ${m.conflicts_after}`;
        txt += st.blunder ? ' <span style="color:red;">❌ BLUNDER</span>' : ' ✅ Amélioration';
    } else if (st.total_conflicts === 0) txt += ' ✅ Solution trouvée !';
    info.innerHTML = txt;
}

function updateQueenTable() {
    const rightPanel = document.getElementById('rightPanel');
    rightPanel.innerHTML = `<h3>👑 Suivi des reines</h3>
        <div class="queen-table-container">
            <table id="queenTable">
                <thead><tr><th>Q°</th><th>Position</th><th>Déplacement</th><th>Status</th><th>État</th></tr></thead>
                <tbody></tbody>
            </table>
        </div>`;
    const tbody = document.querySelector('#queenTable tbody');
    if (!states.length) return;
    const n = Object.keys(states[currentStep].assign).length;
    const assign = states[currentStep].assign;
    const st = states[currentStep];
    for (let r = 0; r < n; r++) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${r}</td>`;
        tr.innerHTML += `<td>${notation(r, assign[r], n)}</td>`;
        if (st.moved && st.moved.var === r) {
            tr.innerHTML += `<td>${notation(r, st.moved.from, n)} → ${notation(r, st.moved.to, n)}</td>`;
        } else {
            tr.innerHTML += '<td>—</td>';
        }
        let statusText = 'En attente', statusClass = 'status-attente';
        if (states.length && currentStep === states.length - 1 && st.total_conflicts === 0) {
            statusText = 'Placé'; statusClass = 'status-place';
        } else if (st.moved && st.moved.var === r) {
            statusText = 'En cours'; statusClass = 'status-cours';
        } else if (currentStep > 0 && !st.angry.includes(r)) {
            statusText = 'Placé'; statusClass = 'status-place';
        }
        tr.innerHTML += `<td><span class="status-badge ${statusClass}">${statusText}</span></td>`;
        tr.innerHTML += `<td>${st.angry.includes(r) ? '😠 Furieux' : '😊 Satisfait'}</td>`;
        tbody.appendChild(tr);
    }
}

// ==================== SUDOKU ====================
const SUDOKU_PUZZLES = {
    easy: [
        [5,3,0,0,7,0,0,0,0],
        [6,0,0,1,9,5,0,0,0],
        [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3],
        [4,0,0,8,0,3,0,0,1],
        [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0],
        [0,0,0,4,1,9,0,0,5],
        [0,0,0,0,8,0,0,7,9]
    ],
    medium: [
        [0,0,0,2,6,0,7,0,1],
        [6,8,0,0,7,0,0,9,0],
        [1,9,0,0,0,4,5,0,0],
        [8,2,0,1,0,0,0,4,0],
        [0,0,4,6,0,2,9,0,0],
        [0,5,0,0,0,3,0,2,8],
        [0,0,9,3,0,0,0,7,4],
        [0,5,0,0,4,0,0,5,0],
        [7,0,3,0,1,8,0,0,0]
    ],
    hard: [
        [0,0,0,6,0,0,4,0,0],
        [7,0,0,0,0,3,6,0,0],
        [0,0,0,0,9,1,0,8,0],
        [0,0,0,0,0,0,0,0,0],
        [0,5,0,1,8,0,0,0,3],
        [0,0,0,3,0,6,0,4,5],
        [0,4,0,2,0,0,0,6,0],
        [9,0,3,0,0,0,0,0,0],
        [0,2,0,0,0,0,1,0,0]
    ],
    expert: [
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,3,0,8,5],
        [0,0,1,0,2,0,0,0,0],
        [0,0,0,5,0,7,0,0,0],
        [0,0,4,0,0,0,1,0,0],
        [0,9,0,0,0,0,0,0,0],
        [5,0,0,0,0,0,0,7,3],
        [0,0,2,0,1,0,0,0,0],
        [0,0,0,0,4,0,0,0,9]
    ]
};

function drawInitialSudokuBoard() {
    const container = document.getElementById('boardContainer');
    container.innerHTML = '';
    const board = document.createElement('div');
    board.className = 'sudoku-board';
    board.style.width = board.style.height = '432px';
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.style.width = '48px'; cell.style.height = '48px';
            if (c % 3 === 2 && c !== 8) cell.classList.add('right-thick');
            if (r % 3 === 2 && r !== 8) cell.classList.add('bottom-thick');
            const val = sudokuInitialGrid[r][c];
            if (val) {
                cell.textContent = val;
                if (sudokuFixedMask[r][c]) cell.classList.add('fixed');
                else cell.classList.add('new');
            }
            board.appendChild(cell);
        }
    }
    container.appendChild(board);
}

function drawSudokuBoard() {
    if (!states.length) return;
    const container = document.getElementById('boardContainer');
    container.innerHTML = '';
    const board = document.createElement('div');
    board.className = 'sudoku-board';
    board.style.width = board.style.height = '432px';
    const grid = states[currentStep].grid;
    const angrySet = new Set(states[currentStep].angry.map(([r,c]) => `${r},${c}`));
    const moved = states[currentStep].moved;

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.style.width = '48px'; cell.style.height = '48px';
            if (c % 3 === 2 && c !== 8) cell.classList.add('right-thick');
            if (r % 3 === 2 && r !== 8) cell.classList.add('bottom-thick');
            const val = grid[r][c];
            if (val) {
                cell.textContent = val;
                if (sudokuFixedMask[r][c]) cell.classList.add('fixed');
                else cell.classList.add('new');
            }
            if (angrySet.has(`${r},${c}`)) cell.classList.add('conflict');
            if (moved && moved.var[0] === r && moved.var[1] === c) {
                cell.style.boxShadow = 'inset 0 0 0 2px gold';
            }
            board.appendChild(cell);
        }
    }
    container.appendChild(board);
    updateSudokuInfo();
    updateSudokuTracking();
}

function updateSudokuInfo() {
    const info = document.getElementById('infoPanel');
    if (!states.length) { info.innerHTML = ''; return; }
    const st = states[currentStep];
    let txt = `<strong>Étape ${st.step}</strong> — Conflits totaux : ${st.total_conflicts}`;
    if (st.moved) {
        const [r,c] = st.moved.var;
        txt += `<br>Case (${r},${c}) : ${st.moved.from} → ${st.moved.to}`;
        txt += `<br>Conflits : ${st.moved.conflicts_before} → ${st.moved.conflicts_after}`;
    }
    if (st.solved) txt += ' ✅ Résolu !';
    info.innerHTML = txt;
}

function updateSudokuTracking() {
    const rightPanel = document.getElementById('rightPanel');
    rightPanel.innerHTML = `<h3>📋 Suivi du jeu</h3>
        <div class="queen-table-container">
            <table id="trackingTable">
                <thead><tr><th>Case</th><th>Init.</th><th>Actuel</th><th>Conflits</th><th>Statut</th><th>État</th></tr></thead>
                <tbody></tbody>
            </table>
        </div>`;
    const tbody = document.querySelector('#trackingTable tbody');
    if (!states.length) return;
    const grid = states[currentStep].grid;
    const angrySet = new Set(states[currentStep].angry.map(([r,c]) => `${r},${c}`));
    const moved = states[currentStep].moved;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (sudokuFixedMask[r][c]) continue;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>(${r},${c})</td>`;
            tr.innerHTML += `<td>${sudokuInitialGrid[r][c] || '-'}</td>`;
            tr.innerHTML += `<td>${grid[r][c] || '-'}</td>`;
            const angry = angrySet.has(`${r},${c}`);
            tr.innerHTML += `<td>${angry ? 'Oui' : '0'}</td>`;
            let statusText = 'En attente', statusClass = 'status-attente';
            if (states.length && currentStep === states.length - 1 && states[currentStep].solved) {
                statusText = 'Placé'; statusClass = 'status-place';
            } else if (moved && moved.var[0] === r && moved.var[1] === c) {
                statusText = 'En cours'; statusClass = 'status-cours';
            } else if (currentStep > 0 && !angry) {
                statusText = 'Placé'; statusClass = 'status-place';
            }
            tr.innerHTML += `<td><span class="status-badge ${statusClass}">${statusText}</span></td>`;
            tr.innerHTML += `<td>${angry ? '😠 Furieux' : '😊 Satisfait'}</td>`;
            tbody.appendChild(tr);
        }
    }
}

function showSudokuError(msg) {
    const isTimeout = msg.includes('Timeout');
    const cls = isTimeout ? 'error-message timeout-message' : 'error-message';
    document.getElementById('infoPanel').innerHTML = `<div class="${cls}">${msg}</div>`;
    try { document.querySelector('#trackingTable tbody').innerHTML = ''; } catch(e) {}
}

function updateSudokuGridFromDifficulty() {
    const diff = document.getElementById('difficulty').value;
    if (diff === 'custom') return;
    const puzzle = SUDOKU_PUZZLES[diff];
    if (puzzle) {
        sudokuInitialGrid = puzzle.map(row => [...row]);
        document.getElementById('sudokuGridInput').value = puzzle.map(r => r.join(' ')).join('\n');
        sudokuFixedMask = puzzle.map(row => row.map(v => v !== 0));
    }
    drawInitialSudokuBoard();
}

function resetCustomGrid() {
    sudokuInitialGrid = Array(9).fill().map(() => Array(9).fill(0));
    sudokuFixedMask = Array(9).fill().map(() => Array(9).fill(false));
    document.getElementById('sudokuGridInput').value = sudokuInitialGrid.map(r => r.join(' ')).join('\n');
    drawInitialSudokuBoard();
}

// ==================== Cyberpunk Panel ====================
const modeSelect = document.getElementById('modeSelect');
const queensOptions = document.getElementById('queensOptions');
const sudokuOptions = document.getElementById('sudokuOptions');
const difficultySelect = document.getElementById('difficulty');
const customGridContainer = document.getElementById('customGridContainer');
const sudokuMethodSelect = document.getElementById('sudokuMethod');
const sudokuGridInput = document.getElementById('sudokuGridInput');
const autoBench = document.getElementById('autoBench');
const playBtn = document.getElementById('playBtn');

modeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'queens') {
        mode = 'queens';
        queensOptions.style.display = 'grid';
        sudokuOptions.style.display = 'none';
    } else {
        mode = 'sudoku';
        queensOptions.style.display = 'none';
        sudokuOptions.style.display = 'grid';
        if (difficultySelect.value === 'custom') {
            customGridContainer.style.display = 'grid';
        } else {
            customGridContainer.style.display = 'none';
            updateSudokuGridFromDifficulty();
        }
    }
});

difficultySelect.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        customGridContainer.style.display = 'grid';
        resetCustomGrid();
    } else {
        customGridContainer.style.display = 'none';
        updateSudokuGridFromDifficulty();
    }
});

// ------------------- Benchmark Functions -------------------
function runQueensBenchmark() {
    const status = document.getElementById('benchQueensStatus');
    const loader = document.getElementById('benchLoader');
    status.textContent = '⏳ Calcul...';
    loader.style.display = 'block';

    if (!backendOnline) {
        setTimeout(() => {
            try {
                const data = window.MinConflitSolvers.benchmarkQueens({ trials: 8 });
                const tbody = document.querySelector('#benchQueensTable tbody');
                tbody.innerHTML = '';
                data.forEach(d => {
                    tbody.innerHTML += `<tr><td>${d.n}</td><td>${d.successRate.toFixed(1)}</td><td>${d.avgTimeMs.toFixed(2)}</td><td>${d.avgSteps.toFixed(1)}</td></tr>`;
                });
                status.textContent = '⚡ Terminé (Local)';
            } catch (err) {
                status.textContent = '❌ Erreur';
            } finally {
                loader.style.display = 'none';
            }
        }, 100);
        return;
    }

    fetch(`${API}/benchmark`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('#benchQueensTable tbody');
            tbody.innerHTML = '';
            data.forEach(d => {
                tbody.innerHTML += `<tr><td>${d.n}</td><td>${d.success_rate.toFixed(1)}</td><td>${d.avg_time_ms.toFixed(2)}</td><td>${d.avg_steps.toFixed(1)}</td></tr>`;
            });
            status.textContent = '✅ Terminé';
        })
        .catch(() => status.textContent = '❌ Erreur')
        .finally(() => loader.style.display = 'none');
}

function runSudokuBenchmark(method = document.getElementById('benchSudokuMethod').value) {
    const status = document.getElementById('benchSudokuStatus');
    const loader = document.getElementById('benchLoader');
    status.textContent = '⏳ Calcul...';
    loader.style.display = 'block';

    if (!backendOnline) {
        setTimeout(() => {
            try {
                const data = window.MinConflitSolvers.benchmarkSudoku({ method });
                const tbody = document.querySelector('#benchSudokuTable tbody');
                tbody.innerHTML = '';
                data.forEach(d => {
                    tbody.innerHTML += `<tr><td>${d.difficulty}</td><td>${d.solved ? 'Oui' : 'Non'}</td><td>${d.timeMs.toFixed(2)}</td><td>${d.steps}</td></tr>`;
                });
                status.textContent = '⚡ Terminé (Local)';
            } catch (err) {
                status.textContent = '❌ Erreur';
            } finally {
                loader.style.display = 'none';
            }
        }, 100);
        return;
    }

    fetch(`${API}/benchmark-sudoku?method=${method}`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('#benchSudokuTable tbody');
            tbody.innerHTML = '';
            data.forEach(d => {
                tbody.innerHTML += `<tr><td>${d.difficulty}</td><td>${d.solved?'Oui':'Non'}</td><td>${d.time_ms.toFixed(2)}</td><td>${d.steps}</td></tr>`;
            });
            status.textContent = '✅ Terminé';
        })
        .catch(() => status.textContent = '❌ Erreur')
        .finally(() => loader.style.display = 'none');
}

document.getElementById('runSudokuBenchBtn').addEventListener('click', () => {
    runSudokuBenchmark();
});

// Benchmark tabs (Dropdown Selector)
const benchTabSelect = document.getElementById('benchTabSelect');
if (benchTabSelect) {
    benchTabSelect.addEventListener('change', (e) => {
        const tab = e.target.value;
        document.getElementById('benchQueens').style.display = tab === 'queens' ? 'block' : 'none';
        document.getElementById('benchSudoku').style.display = tab === 'sudoku' ? 'block' : 'none';
    });
}

// ------------------- PLAY button action -------------------
playBtn.addEventListener('click', async () => {
    document.getElementById('loadingIndicator').style.display = 'flex';
    const benchmarkNeeded = autoBench.checked;
    if (benchmarkNeeded) {
        document.getElementById('benchmarkPanel').style.display = 'flex';
    }

    // --- Messages d'attente ---
    const waitingDiv = document.getElementById('waitingMessages');
    waitingDiv.textContent = ''; // on efface les anciens messages
    let startTime = Date.now();
    let messageInterval = setInterval(() => {
        let elapsed = Math.floor((Date.now() - startTime) / 1000);
        let modeName = modeSelect.value === 'queens' ? 'N‑Reines' : 'Sudoku';
        let diff = '';
        if (modeSelect.value === 'sudoku') {
            diff = difficultySelect.value === 'custom' ? 'personnalisé' : difficultySelect.value;
            diff = ` (${diff})`;
        }
        waitingDiv.textContent = `⏳ Résolution ${modeName}${diff} en cours... ${elapsed}s écoulées`;
    }, 10000);

    try {
        if (modeSelect.value === 'queens') {
            const n = parseInt(document.getElementById('size').value);
            let data;

            if (!backendOnline) {
                // Moteur Local Offline Fallback
                const res = window.MinConflitSolvers.solveQueensDetailed(n, { maxSteps: 500 });
                if (!res.ok) throw new Error(res.error || "Erreur de calcul local.");
                data = {
                    states: res.states,
                    solved: res.solved,
                    steps: res.steps,
                    time: res.timeMs / 1000
                };
            } else {
                const solveTask = fetch(`${API}/solve`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ n, max_steps: 500 })
                }).then(res => res.json());

                data = await solveTask;
            }

            if (benchmarkNeeded) runQueensBenchmark();

            states = data.states;
            currentStep = 0;
            document.getElementById('timeline').style.display = 'flex';
            document.getElementById('stepSlider').max = states.length - 1;
            document.getElementById('stepSlider').value = 0;
            document.getElementById('stepLabel').textContent = `Étape 0/${states.length - 1}`;
            document.getElementById('statsContent').innerHTML =
                `Résolu : ${data.solved ? 'Oui' : 'Non'}<br>Étapes : ${data.steps}<br>Temps : ${(data.time * 1000).toFixed(1)} ms`;
            drawQueensBoard();
        } else {
            // Sudoku
            if (difficultySelect.value === 'custom') {
                const raw = sudokuGridInput.value;
                const rows = raw.trim().split('\n');
                if (rows.length !== 9) { alert("Il faut exactement 9 lignes."); return; }
                const grid = rows.map(line => line.trim().split(/\s+/).map(Number));
                if (grid.some(r => r.length !== 9)) { alert("Chaque ligne doit avoir 9 nombres."); return; }
                sudokuInitialGrid = grid;
                sudokuFixedMask = grid.map(row => row.map(v => v !== 0));
            } else {
                updateSudokuGridFromDifficulty();
            }

            const method = sudokuMethodSelect.value;
            let data;

            if (!backendOnline) {
                // Moteur Local Offline Fallback
                const res = method === 'minconf'
                    ? window.MinConflitSolvers.solveSudokuMinConflict(sudokuInitialGrid, { maxStepsPerTry: 600, maxRestarts: 12, timeoutMs: 4000 })
                    : window.MinConflitSolvers.solveSudokuBacktracking(sudokuInitialGrid, { captureEvery: 1, maxStates: 5000 });
                
                if (!res.ok && res.error) throw new Error(res.error);

                data = {
                    states: res.states,
                    solved: res.solved,
                    steps: res.steps,
                    time: res.timeMs / 1000
                };
            } else {
                const solveTask = fetch(`${API}/solve-sudoku`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ grid: sudokuInitialGrid, method, max_steps: 5000 })
                }).then(res => res.json());

                data = await solveTask;
            }

            if (benchmarkNeeded) {
                runSudokuBenchmark(method);
            }

            if (data.solved) {
                states = data.states;
                currentStep = 0;
                document.getElementById('timeline').style.display = 'flex';
                document.getElementById('stepSlider').max = states.length - 1;
                document.getElementById('stepSlider').value = 0;
                document.getElementById('stepLabel').textContent = `Étape 0/${states.length - 1}`;
                document.getElementById('statsContent').innerHTML =
                    `Résolu : Oui<br>Méthode : ${method === 'minconf' ? 'Min‑Conflit' : 'Backtracking'}<br>Étapes : ${data.steps}<br>Temps : ${(data.time * 1000).toFixed(1)} ms`;
                drawSudokuBoard();
            } else {
                showSudokuError(`❌ L'heuristique Min‑Conflit n'a pas réussi à résoudre cette grille. Essayez avec le Solveur Pro.`);
                document.getElementById('timeline').style.display = 'none';
            }
        }
    } catch (err) {
        document.getElementById('infoPanel').innerHTML = `<span style="color:red;">❌ ${err.message}</span>`;
    } finally {
        clearInterval(messageInterval);
        waitingDiv.textContent = '';
        document.getElementById('loadingIndicator').style.display = 'none';
    }
});

// ==================== Timeline controls ====================
document.getElementById('stepSlider').addEventListener('input', e => {
    currentStep = parseInt(e.target.value);
    if (mode === 'queens'){
        drawQueensBoard();
        document.getElementById('playBtnTimeline').click();}
    else {drawSudokuBoard();document.getElementById('playBtnTimeline').click();
}
});

document.getElementById('playBtnTimeline').addEventListener('click', () => {
    if (playInterval) {
        clearInterval(playInterval); playInterval = null;
        document.getElementById('playBtnTimeline').textContent = '▶';
    } else {
        playInterval = setInterval(() => {
            if (currentStep < states.length - 1) {
                currentStep++;
                if (mode === 'queens') drawQueensBoard();
                else drawSudokuBoard();
                document.getElementById('stepSlider').value = currentStep;
                document.getElementById('stepLabel').textContent = `Étape ${currentStep}/${states.length - 1}`;
            } else {
                clearInterval(playInterval); playInterval = null;
                document.getElementById('playBtnTimeline').textContent = '▶';
            }
        }, 400);
        document.getElementById('playBtnTimeline').textContent = '⏸';
    }
});

document.getElementById('endBtn').addEventListener('click', () => {
    if (playInterval) { clearInterval(playInterval); playInterval = null; document.getElementById('playBtnTimeline').textContent = '▶'; }
    currentStep = states.length - 1;
    if (mode === 'queens') drawQueensBoard();
    else drawSudokuBoard();
    document.getElementById('stepSlider').value = currentStep;
    document.getElementById('stepLabel').textContent = `Étape ${currentStep}/${states.length - 1}`;
});

// ==================== ENREGISTREMENT PWA SERVICE WORKER ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then((reg) => console.log('[PWA Workspace] Service Worker registered with scope:', reg.scope))
            .catch((err) => console.error('[PWA Workspace] Service Worker registration failed:', err));
    });
}

// ==================== GESTION DE L'INSTALLATION PWA (WINDOWS 10+) ====================
let deferredInstallPromptWorkspace = null;
const installBtnWorkspace = document.getElementById('installPwaBtn');

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPromptWorkspace = event;
    if (installBtnWorkspace) {
        installBtnWorkspace.style.display = 'inline-flex';
    }
});

if (installBtnWorkspace) {
    installBtnWorkspace.addEventListener('click', async () => {
        if (!deferredInstallPromptWorkspace) return;
        deferredInstallPromptWorkspace.prompt();
        const choiceResult = await deferredInstallPromptWorkspace.userChoice;
        console.log('[PWA Workspace] User response to installation:', choiceResult.outcome);
        if (choiceResult.outcome === 'accepted') {
            installBtnWorkspace.style.display = 'none';
        }
        deferredInstallPromptWorkspace = null;
    });
}

window.addEventListener('appinstalled', (event) => {
    console.log('[PWA Workspace] App installed successfully!');
    if (installBtnWorkspace) {
        installBtnWorkspace.style.display = 'none';
    }
});
