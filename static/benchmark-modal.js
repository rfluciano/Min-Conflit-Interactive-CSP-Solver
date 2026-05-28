// Benchmark Modal - Complete Self-Contained Module
// Import this file directly into your app

class BenchmarkModal {
    constructor() {
        this.modalHTML = `
            <div id="benchmarkBackdrop" class="benchmark-backdrop" style="display:none;" aria-hidden="true">
                <section class="panel-card benchmark-panel" id="benchmarkPanel" role="dialog" aria-modal="true" aria-labelledby="benchmarkTitle">
                    <div class="panel-head">
                        <div>
                            <h2 id="benchmarkTitle">Benchmarks</h2>
                        </div>
                        <button id="benchmarkCloseBtn" class="ghost-button close-button" type="button" aria-label="Fermer le benchmark">✕</button>
                    </div>
                    
                    <div class="bench-body">
                        <div class="bench-tabs">
                            <button class="bench-tab-btn active" data-tab="queens" role="tab" aria-selected="true">
                                <span class="tab-icon">♛</span> N-Reines
                            </button>
                            <button class="bench-tab-btn" data-tab="sudoku" role="tab" aria-selected="false">
                                <span class="tab-icon">📝</span> Sudoku
                            </button>
                        </div>
                        
                        <div class="bench-tab-content active" id="benchQueens" role="tabpanel">
                            <div class="bench-controls">
                                <div class="bench-input-group">
                                    <label for="queensMinN">N min</label>
                                    <input type="number" id="queensMinN" value="4" min="4" max="20">
                                </div>
                                <div class="bench-input-group">
                                    <label for="queensMaxN">N max</label>
                                    <input type="number" id="queensMaxN" value="12" min="4" max="20">
                                </div>
                                <div class="bench-input-group">
                                    <label for="queensTrials">Essais</label>
                                    <input type="number" id="queensTrials" value="10" min="1" max="100">
                                </div>
                                <button id="runQueensBenchBtn" class="primary-button compact-button" type="button">
                                    <span class="btn-icon">▶</span> Lancer
                                </button>
                            </div>
                            <div class="bench-table-container">
                                <table class="bench-table" id="benchQueensTable">
                                    <thead>
                                        <tr>
                                            <th>N</th>
                                            <th>Succès %</th>
                                            <th>Temps moy (ms)</th>
                                            <th>Étapes moy</th>
                                            <th>Min/Max (ms)</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            <div class="bench-status" id="benchQueensStatus">
                                <span class="status-icon">⏸</span>
                                <span class="status-text">Prêt</span>
                            </div>
                        </div>

                        <div class="bench-tab-content" id="benchSudoku" role="tabpanel">
                            <div class="bench-controls">
                                <div class="bench-input-group">
                                    <label for="benchSudokuMethod">Méthode</label>
                                    <select id="benchSudokuMethod">
                                        <option value="backtrack">Solveur Pro (Backtracking)</option>
                                        <option value="minconf">Min-Conflit</option>
                                    </select>
                                </div>
                                <button id="runSudokuBenchBtn" class="primary-button compact-button" type="button">
                                    <span class="btn-icon">▶</span> Lancer
                                </button>
                            </div>
                            <div class="bench-table-container">
                                <table class="bench-table" id="benchSudokuTable">
                                    <thead>
                                        <tr>
                                            <th>Difficulté</th>
                                            <th>Résolu</th>
                                            <th>Temps (ms)</th>
                                            <th>Étapes</th>
                                            <th>Grille</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            <div class="bench-status" id="benchSudokuStatus">
                                <span class="status-icon">⏸</span>
                                <span class="status-text">Prêt</span>
                            </div>
                        </div>

                        <div class="loader-container" id="benchLoader" style="display:none;">
                            <div class="loader3d">
                                <div class="cube">
                                    <div class="face front"></div>
                                    <div class="face back"></div>
                                    <div class="face left"></div>
                                    <div class="face right"></div>
                                    <div class="face top"></div>
                                    <div class="face bottom"></div>
                                </div>
                            </div>
                            <p class="loader-text">Calcul en cours...</p>
                        </div>
                    </div>
                </section>
            </div>
        `;

        this.styles = `
            <style>
                :root {
                    --benchmark-panel-bg: rgba(10, 14, 24, 0.95);
                    --benchmark-border: rgba(99, 102, 241, 0.25);
                    --benchmark-row: rgba(255, 255, 255, 0.04);
                    --benchmark-hover: rgba(99, 102, 241, 0.1);
                    --benchmark-success: #10b981;
                    --benchmark-warning: #f59e0b;
                    --benchmark-error: #ef4444;
                    --radius-md: 8px;
                    --radius-lg: 12px;
                    --radius-xl: 16px;
                    --space-2: 8px;
                    --space-3: 12px;
                    --space-4: 16px;
                    --text: #eef2ff;
                    --muted: #94a3b8;
                    --control-height: 40px;
                }

                #benchmarkPanel {
                    position: relative;
                    width: min(950px, calc(100vw - 40px));
                    max-width: 950px;
                    max-height: calc(100vh - 80px);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    background: var(--benchmark-panel-bg);
                    border: 1px solid var(--benchmark-border);
                    border-radius: var(--radius-xl);
                    backdrop-filter: blur(20px);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    animation: modalIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes modalIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .benchmark-backdrop {
                    position: fixed;
                    inset: 0;
                    display: grid;
                    place-items: center;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                    z-index: 1200;
                    padding: 16px;
                    animation: backdropIn 0.3s ease;
                }

                @keyframes backdropIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .panel-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: var(--space-4) var(--space-4) var(--space-2);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .panel-head h2 {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .panel-head p {
                    margin: 4px 0 0;
                    color: var(--muted);
                    font-size: 0.9rem;
                }

                .close-button {
                    min-width: 40px;
                    min-height: 40px;
                    padding: 0;
                    border-radius: 999px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.06);
                    color: white;
                    font-size: 1.2rem;
                    line-height: 1;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .close-button:hover {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: rgba(239, 68, 68, 0.3);
                    transform: rotate(90deg);
                }

                .bench-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: var(--space-3) var(--space-4) var(--space-4);
                }

                .bench-tabs {
                    display: flex;
                    gap: var(--space-2);
                    margin-bottom: var(--space-3);
                    border-bottom: 2px solid rgba(255, 255, 255, 0.08);
                    padding-bottom: var(--space-2);
                }

                .bench-tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    border: 1px solid transparent;
                    background: transparent;
                    color: var(--muted);
                    font-weight: 600;
                    font-size: 0.95rem;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }

                .bench-tab-btn:hover {
                    background: var(--benchmark-hover);
                    color: #eef2ff;
                }

                .bench-tab-btn.active {
                    background: rgba(99, 102, 241, 0.15);
                    color: #a5b4fc;
                    border-color: rgba(99, 102, 241, 0.3);
                }

                .bench-tab-btn.active::after {
                    content: '';
                    position: absolute;
                    bottom: -9px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 60%;
                    height: 2px;
                    background: #6366f1;
                    border-radius: 2px;
                }

                .tab-icon {
                    font-size: 1.2rem;
                }

                .bench-tab-content {
                    display: none;
                    animation: fadeIn 0.3s ease;
                }

                .bench-tab-content.active {
                    display: block;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .bench-controls {
                    display: flex;
                    gap: var(--space-2);
                    align-items: flex-end;
                    flex-wrap: wrap;
                    margin-bottom: var(--space-3);
                    padding: var(--space-3);
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: var(--radius-lg);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }

                .bench-input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .bench-input-group label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .bench-input-group input,
                .bench-input-group select {
                    min-height: var(--control-height);
                    padding: 0 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(15, 19, 31, 0.8);
                    border-radius: var(--radius-md);
                    color: var(--text);
                    font-size: 0.9rem;
                    transition: all 0.2s ease;
                    min-width: 80px;
                }

                .bench-input-group input:focus,
                .bench-input-group select:focus {
                    outline: none;
                    border-color: rgba(99, 102, 241, 0.4);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .primary-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0 20px;
                    min-height: var(--control-height);
                    border: none;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    font-weight: 600;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .primary-button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
                }

                .primary-button:active {
                    transform: translateY(0);
                }

                .primary-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                .btn-icon {
                    font-size: 0.9rem;
                }

                .bench-table-container {
                    overflow: auto;
                    max-height: 350px;
                    border-radius: var(--radius-md);
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }

                .bench-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.88rem;
                    color: #eef2ff;
                }

                .bench-table th,
                .bench-table td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }

                .bench-table th {
                    position: sticky;
                    top: 0;
                    background: rgba(10, 14, 24, 0.98);
                    color: var(--muted);
                    font-weight: 700;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    z-index: 1;
                }

                .bench-table tbody tr {
                    transition: background 0.2s ease;
                }

                .bench-table tbody tr:hover {
                    background: var(--benchmark-hover);
                }

                .bench-table tbody tr:nth-child(even) {
                    background: rgba(255, 255, 255, 0.02);
                }

                .bench-table tbody tr:nth-child(even):hover {
                    background: var(--benchmark-hover);
                }

                .bench-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: var(--space-2);
                    padding: 8px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: var(--radius-md);
                    font-size: 0.85rem;
                    color: var(--muted);
                }

                .bench-status.running {
                    color: #6366f1;
                    border-left: 3px solid #6366f1;
                }

                .bench-status.complete {
                    color: var(--benchmark-success);
                    border-left: 3px solid var(--benchmark-success);
                }

                .bench-status.error {
                    color: var(--benchmark-error);
                    border-left: 3px solid var(--benchmark-error);
                }

                .loader-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--space-3);
                    padding: var(--space-4);
                }

                .loader-text {
                    color: var(--muted);
                    font-size: 0.9rem;
                    animation: pulse 1.5s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }

                .loader3d {
                    width: 48px;
                    height: 48px;
                    perspective: 200px;
                }

                .cube {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    transform-style: preserve-3d;
                    animation: spinCube 2s infinite linear;
                }

                .face {
                    position: absolute;
                    width: 48px;
                    height: 48px;
                    background: rgba(99, 102, 241, 0.2);
                    border: 2px solid rgba(99, 102, 241, 0.4);
                    border-radius: 6px;
                }

                .front  { transform: translateZ(24px); }
                .back   { transform: rotateY(180deg) translateZ(24px); }
                .left   { transform: rotateY(-90deg) translateZ(24px); }
                .right  { transform: rotateY(90deg) translateZ(24px); }
                .top    { transform: rotateX(90deg) translateZ(24px); }
                .bottom { transform: rotateX(-90deg) translateZ(24px); }

                @keyframes spinCube {
                    from { transform: rotateX(0deg) rotateY(0deg); }
                    to   { transform: rotateX(360deg) rotateY(360deg); }
                }

                .text-success { color: #10b981; font-weight: 600; }
                .text-warning { color: #f59e0b; font-weight: 600; }
                .text-error { color: #ef4444; font-weight: 600; }

                .view-grid-btn {
                    padding: 4px 8px;
                    background: rgba(99, 102, 241, 0.2);
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    color: #a5b4fc;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: all 0.2s ease;
                }

                .view-grid-btn:hover {
                    background: rgba(99, 102, 241, 0.3);
                }

                /* Scrollbar Styling */
                .bench-body::-webkit-scrollbar,
                .bench-table-container::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }

                .bench-body::-webkit-scrollbar-track,
                .bench-table-container::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                }

                .bench-body::-webkit-scrollbar-thumb,
                .bench-table-container::-webkit-scrollbar-thumb {
                    background: rgba(99, 102, 241, 0.3);
                    border-radius: 3px;
                }

                .bench-body::-webkit-scrollbar-thumb:hover,
                .bench-table-container::-webkit-scrollbar-thumb:hover {
                    background: rgba(99, 102, 241, 0.5);
                }

                @media (max-width: 768px) {
                    .bench-controls {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .bench-input-group {
                        width: 100%;
                    }
                    
                    .bench-table th,
                    .bench-table td {
                        padding: 8px 6px;
                        font-size: 0.8rem;
                    }
                    
                    .bench-tabs {
                        flex-direction: column;
                        gap: var(--space-1);
                    }
                    
                    .bench-tab-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            </style>
        `;

        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        // Inject HTML
        document.body.insertAdjacentHTML('beforeend', this.modalHTML);
        
        // Inject styles if not already present
        if (!document.getElementById('benchmark-modal-styles')) {
            const styleElement = document.createElement('div');
            styleElement.id = 'benchmark-modal-styles';
            styleElement.innerHTML = this.styles;
            document.head.appendChild(styleElement);
        }

        // Get references
        this.backdrop = document.getElementById('benchmarkBackdrop');
        this.panel = document.getElementById('benchmarkPanel');
        this.closeBtn = document.getElementById('benchmarkCloseBtn');
        this.loader = document.getElementById('benchLoader');
        
        this.tabBtns = document.querySelectorAll('.bench-tab-btn');
        this.tabContents = document.querySelectorAll('.bench-tab-content');
        
        this.queensMinN = document.getElementById('queensMinN');
        this.queensMaxN = document.getElementById('queensMaxN');
        this.queensTrials = document.getElementById('queensTrials');
        this.runQueensBtn = document.getElementById('runQueensBenchBtn');
        this.queensTable = document.getElementById('benchQueensTable');
        this.queensStatus = document.getElementById('benchQueensStatus');
        
        this.sudokuMethod = document.getElementById('benchSudokuMethod');
        this.runSudokuBtn = document.getElementById('runSudokuBenchBtn');
        this.sudokuTable = document.getElementById('benchSudokuTable');
        this.sudokuStatus = document.getElementById('benchSudokuStatus');
        
        this.isOpen = false;
        this.isRunning = false;

        // Bind events
        this.bindEvents();
        
        this.initialized = true;
    }

    bindEvents() {
        this.closeBtn.addEventListener('click', () => this.close());
        this.backdrop.addEventListener('click', (e) => {
            if (e.target === this.backdrop) this.close();
        });
        
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        this.runQueensBtn.addEventListener('click', () => this.runQueensBenchmark());
        this.runSudokuBtn.addEventListener('click', () => this.runSudokuBenchmark());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.close();
        });
        
        this.queensMinN.addEventListener('change', () => this.validateQueensInputs());
        this.queensMaxN.addEventListener('change', () => this.validateQueensInputs());
    }

    open() {
        if (!this.initialized) this.init();
        
        this.backdrop.style.display = 'grid';
        this.backdrop.setAttribute('aria-hidden', 'false');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        this.closeBtn.focus();
    }

    close() {
        if (this.isRunning) {
            if (!confirm('Un benchmark est en cours. Voulez-vous vraiment fermer ?')) {
                return;
            }
        }
        
        this.backdrop.style.display = 'none';
        this.backdrop.setAttribute('aria-hidden', 'true');
        this.isOpen = false;
        document.body.style.overflow = '';
    }

    switchTab(tabName) {
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
            btn.setAttribute('aria-selected', btn.dataset.tab === tabName);
        });
        
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `bench${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
        });
    }

    validateQueensInputs() {
        const min = parseInt(this.queensMinN.value);
        const max = parseInt(this.queensMaxN.value);
        
        if (min > max) {
            this.queensMaxN.value = min;
        }
        
        if (min < 4) this.queensMinN.value = 4;
        if (max > 20) this.queensMaxN.value = 20;
    }

    setLoading(loading) {
        this.isRunning = loading;
        this.loader.style.display = loading ? 'flex' : 'none';
        this.runQueensBtn.disabled = loading;
        this.runSudokuBtn.disabled = loading;
    }

    updateStatus(element, status, message) {
        element.className = `bench-status ${status}`;
        const icon = element.querySelector('.status-icon');
        const text = element.querySelector('.status-text');
        
        const icons = {
            ready: '⏸',
            running: '⏳',
            complete: '✅',
            error: '❌'
        };
        
        icon.textContent = icons[status] || '⏸';
        text.textContent = message;
    }

    async runQueensBenchmark() {
        const minN = parseInt(this.queensMinN.value);
        const maxN = parseInt(this.queensMaxN.value);
        const trials = parseInt(this.queensTrials.value);
        
        if (minN < 4 || maxN > 20 || minN > maxN || trials < 1) {
            alert('Paramètres invalides. Vérifiez les valeurs.');
            return;
        }
        
        this.setLoading(true);
        this.queensTable.querySelector('tbody').innerHTML = '';
        this.updateStatus(this.queensStatus, 'running', 'Benchmark en cours...');
        
        try {
            for (let n = minN; n <= maxN; n++) {
                await this.sleep(50);
                
                const result = await this.benchmarkQueens(n, trials);
                this.addQueensRow(n, result);
            }
            
            this.updateStatus(this.queensStatus, 'complete', 'Benchmark terminé avec succès');
        } catch (error) {
            console.error('Queens benchmark error:', error);
            this.updateStatus(this.queensStatus, 'error', `Erreur: ${error.message}`);
        } finally {
            this.setLoading(false);
        }
    }

    async benchmarkQueens(n, trials) {
        const times = [];
        const steps = [];
        let successes = 0;
        
        for (let i = 0; i < trials; i++) {
            const startTime = performance.now();
            const solution = this.solveNQueens(n);
            const endTime = performance.now();
            
            times.push(endTime - startTime);
            steps.push(solution.steps);
            
            if (solution.success) {
                successes++;
            }
        }
        
        return {
            successRate: (successes / trials) * 100,
            avgTime: times.reduce((a, b) => a + b, 0) / times.length,
            minTime: Math.min(...times),
            maxTime: Math.max(...times),
            avgSteps: steps.reduce((a, b) => a + b, 0) / steps.length,
            successes,
            trials
        };
    }

    solveNQueens(n) {
        const board = new Array(n).fill(-1);
        let steps = 0;
        let found = false;
        
        const isSafe = (row, col) => {
            steps++;
            for (let prevRow = 0; prevRow < row; prevRow++) {
                const prevCol = board[prevRow];
                if (prevCol === col || 
                    Math.abs(prevCol - col) === Math.abs(prevRow - row)) {
                    return false;
                }
            }
            return true;
        };
        
        const backtrack = (row) => {
            if (row === n) {
                found = true;
                return true;
            }
            
            const columns = this.shuffleArray(Array.from({length: n}, (_, i) => i));
            
            for (const col of columns) {
                if (isSafe(row, col)) {
                    board[row] = col;
                    if (backtrack(row + 1)) {
                        return true;
                    }
                    board[row] = -1;
                }
            }
            
            return false;
        };
        
        backtrack(0);
        
        return {
            success: found,
            steps,
            board: found ? [...board] : null
        };
    }

    async runSudokuBenchmark() {
        const method = this.sudokuMethod.value;
        
        this.setLoading(true);
        this.sudokuTable.querySelector('tbody').innerHTML = '';
        this.updateStatus(this.sudokuStatus, 'running', `Test de la méthode ${method}...`);
        
        try {
            const difficulties = [
                { name: 'Facile', clues: 45 },
                { name: 'Moyen', clues: 35 },
                { name: 'Difficile', clues: 28 },
                { name: 'Expert', clues: 22 }
            ];
            
            for (const diff of difficulties) {
                await this.sleep(50);
                
                const puzzle = this.generateSudoku(diff.clues);
                const result = await this.benchmarkSudoku(puzzle, method);
                this.addSudokuRow(diff.name, result, puzzle);
            }
            
            this.updateStatus(this.sudokuStatus, 'complete', 'Benchmark terminé avec succès');
        } catch (error) {
            console.error('Sudoku benchmark error:', error);
            this.updateStatus(this.sudokuStatus, 'error', `Erreur: ${error.message}`);
        } finally {
            this.setLoading(false);
        }
    }

    generateSudoku(clues) {
        const board = Array(9).fill(null).map(() => Array(9).fill(0));
        
        for (let box = 0; box < 9; box += 3) {
            this.fillBox(board, box, box);
        }
        
        this.solveSudokuBacktrack(board);
        
        const puzzle = board.map(row => [...row]);
        const positions = this.shuffleArray(
            Array.from({length: 81}, (_, i) => i)
        );
        
        let removed = 0;
        const toRemove = 81 - clues;
        
        for (const pos of positions) {
            if (removed >= toRemove) break;
            
            const row = Math.floor(pos / 9);
            const col = pos % 9;
            puzzle[row][col] = 0;
            removed++;
        }
        
        return puzzle;
    }

    fillBox(board, startRow, startCol) {
        const nums = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        let idx = 0;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                board[startRow + i][startCol + j] = nums[idx++];
            }
        }
    }

    solveSudokuBacktrack(board) {
        const empty = this.findEmpty(board);
        if (!empty) return true;
        
        const [row, col] = empty;
        const nums = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        for (const num of nums) {
            if (this.isValidSudoku(board, row, col, num)) {
                board[row][col] = num;
                if (this.solveSudokuBacktrack(board)) return true;
                board[row][col] = 0;
            }
        }
        
        return false;
    }

    findEmpty(board) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === 0) return [i, j];
            }
        }
        return null;
    }

    isValidSudoku(board, row, col, num) {
        for (let j = 0; j < 9; j++) {
            if (board[row][j] === num) return false;
        }
        
        for (let i = 0; i < 9; i++) {
            if (board[i][col] === num) return false;
        }
        
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[boxRow + i][boxCol + j] === num) return false;
            }
        }
        
        return true;
    }

    async benchmarkSudoku(puzzle, method) {
        const startTime = performance.now();
        let result;
        
        if (method === 'backtrack') {
            result = this.solveSudokuWithBacktrack(puzzle);
        } else {
            result = this.solveSudokuWithMinConflicts(puzzle);
        }
        
        const endTime = performance.now();
        
        return {
            solved: result.success,
            time: endTime - startTime,
            steps: result.steps,
            solution: result.solution
        };
    }

    solveSudokuWithBacktrack(puzzle) {
        const board = puzzle.map(row => [...row]);
        let steps = 0;
        
        const solve = () => {
            const empty = this.findEmpty(board);
            if (!empty) return true;
            
            const [row, col] = empty;
            
            for (let num = 1; num <= 9; num++) {
                steps++;
                if (this.isValidSudoku(board, row, col, num)) {
                    board[row][col] = num;
                    if (solve()) return true;
                    board[row][col] = 0;
                }
            }
            
            return false;
        };
        
        const success = solve();
        
        return {
            success,
            steps,
            solution: success ? board : null
        };
    }

    solveSudokuWithMinConflicts(puzzle) {
        const board = puzzle.map(row => [...row]);
        const maxSteps = 100000;
        let steps = 0;
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === 0) {
                    board[i][j] = Math.floor(Math.random() * 9) + 1;
                }
            }
        }
        
        for (let step = 0; step < maxSteps; step++) {
            steps++;
            
            const conflicts = [];
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (puzzle[i][j] === 0) {
                        const currentConflicts = this.countConflicts(board, i, j, board[i][j]);
                        if (currentConflicts > 0) {
                            conflicts.push({row: i, col: j, conflicts: currentConflicts});
                        }
                    }
                }
            }
            
            if (conflicts.length === 0) {
                return { success: true, steps, solution: board };
            }
            
            const cell = conflicts[Math.floor(Math.random() * conflicts.length)];
            
            let minConflicts = Infinity;
            let bestValues = [];
            
            for (let num = 1; num <= 9; num++) {
                const conflicts = this.countConflicts(board, cell.row, cell.col, num);
                if (conflicts < minConflicts) {
                    minConflicts = conflicts;
                    bestValues = [num];
                } else if (conflicts === minConflicts) {
                    bestValues.push(num);
                }
            }
            
            board[cell.row][cell.col] = bestValues[Math.floor(Math.random() * bestValues.length)];
        }
        
        return { success: false, steps, solution: null };
    }

    countConflicts(board, row, col, value) {
        let conflicts = 0;
        
        for (let j = 0; j < 9; j++) {
            if (j !== col && board[row][j] === value) conflicts++;
        }
        
        for (let i = 0; i < 9; i++) {
            if (i !== row && board[i][col] === value) conflicts++;
        }
        
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const r = boxRow + i;
                const c = boxCol + j;
                if (r !== row && c !== col && board[r][c] === value) conflicts++;
            }
        }
        
        return conflicts;
    }

    addQueensRow(n, result) {
        const tbody = this.queensTable.querySelector('tbody');
        const row = document.createElement('tr');
        
        const successClass = result.successRate === 100 ? 'text-success' : 
                           result.successRate >= 80 ? 'text-warning' : 'text-error';
        
        row.innerHTML = `
            <td><strong>${n}</strong></td>
            <td class="${successClass}">${result.successRate.toFixed(1)}%</td>
            <td>${result.avgTime.toFixed(2)}</td>
            <td>${result.avgSteps.toFixed(0)}</td>
            <td>${result.minTime.toFixed(2)} / ${result.maxTime.toFixed(2)}</td>
        `;
        
        tbody.appendChild(row);
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    addSudokuRow(difficulty, result, puzzle) {
        const tbody = this.sudokuTable.querySelector('tbody');
        const row = document.createElement('tr');
        
        const solvedClass = result.solved ? 'text-success' : 'text-error';
        const solvedText = result.solved ? '✅ Oui' : '❌ Non';
        
        row.innerHTML = `
            <td><strong>${difficulty}</strong></td>
            <td class="${solvedClass}">${solvedText}</td>
            <td>${result.time.toFixed(2)}</td>
            <td>${result.steps.toLocaleString()}</td>
            <td>
                <button class="view-grid-btn">👁 Voir</button>
            </td>
        `;
        
        const viewBtn = row.querySelector('.view-grid-btn');
        viewBtn.addEventListener('click', () => {
            this.showGridPopup(puzzle, result.solution);
        });
        
        tbody.appendChild(row);
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    showGridPopup(puzzle, solution) {
        let gridHTML = '<div style="display: grid; grid-template-columns: repeat(9, 30px); gap: 2px; margin: 20px; background: #0a0e18; padding: 20px; border-radius: 8px;">';
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const value = puzzle[i][j];
                const isOriginal = value !== 0;
                const bg = isOriginal ? 'rgba(99, 102, 241, 0.2)' : 'transparent';
                const color = isOriginal ? '#eef2ff' : '#10b981';
                
                gridHTML += `
                    <div style="
                        width: 30px; height: 30px;
                        display: flex; align-items: center; justify-content: center;
                        background: ${bg};
                        border: 1px solid rgba(255,255,255,0.1);
                        font-size: 14px;
                        font-weight: ${isOriginal ? '600' : '400'};
                        color: ${color};
                        border-radius: 2px;
                    ">
                        ${value || ''}
                    </div>
                `;
            }
        }
        
        gridHTML += '</div>';
        
        if (solution) {
            gridHTML += '<div style="text-align: center; margin: 10px; color: #10b981; font-weight: 600;">✅ Solution trouvée</div>';
        } else {
            gridHTML += '<div style="text-align: center; margin: 10px; color: #ef4444; font-weight: 600;">❌ Non résolu</div>';
        }
        
        const popup = window.open('', 'Sudoku Grid', 'width=400,height=500');
        popup.document.write(`
            <html>
                <head>
                    <title>Grille Sudoku</title>
                    <style>
                        body {
                            background: #0a0e18;
                            color: #eef2ff;
                            font-family: system-ui, -apple-system, sans-serif;
                            margin: 0;
                            padding: 20px;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                        }
                    </style>
                </head>
                <body>${gridHTML}</body>
            </html>
        `);
        popup.document.close();
    }

    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    destroy() {
        if (this.backdrop) {
            this.backdrop.remove();
        }
        const styles = document.getElementById('benchmark-modal-styles');
        if (styles) {
            styles.remove();
        }
        this.initialized = false;
    }
}

// Auto-initialize and export
if (typeof window !== 'undefined') {
    // Create global instance
    window.BenchmarkModal = BenchmarkModal;
    
    // Auto-initialize if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.benchmarkModal = new BenchmarkModal();
        });
    } else {
        window.benchmarkModal = new BenchmarkModal();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BenchmarkModal;
}