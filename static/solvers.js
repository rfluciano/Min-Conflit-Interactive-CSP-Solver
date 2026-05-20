(function(root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    root.MinConflitSolvers = api;
})(typeof self !== 'undefined' ? self : globalThis, function() {
    'use strict';

    const DEFAULT_QUEENS_BENCHMARK_SIZES = [8, 16, 32, 64, 128, 256];

    const SUDOKU_PUZZLES = {
        easy: [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ],
        medium: [
            [0, 2, 0, 6, 0, 8, 0, 0, 0],
            [5, 8, 0, 0, 0, 9, 7, 0, 0],
            [0, 0, 0, 0, 4, 0, 0, 0, 0],
            [3, 7, 0, 0, 0, 0, 5, 0, 0],
            [6, 0, 0, 0, 0, 0, 0, 0, 4],
            [0, 0, 8, 0, 0, 0, 0, 1, 3],
            [0, 0, 0, 0, 2, 0, 0, 0, 0],
            [0, 0, 9, 8, 0, 0, 0, 3, 6],
            [0, 0, 0, 3, 0, 6, 0, 9, 0]
        ],
        hard: [
            [0, 0, 0, 6, 0, 0, 4, 0, 0],
            [7, 0, 0, 0, 0, 3, 6, 0, 0],
            [0, 0, 0, 0, 9, 1, 0, 8, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 5, 0, 1, 8, 0, 0, 0, 3],
            [0, 0, 0, 3, 0, 6, 0, 4, 5],
            [0, 4, 0, 2, 0, 0, 0, 6, 0],
            [9, 0, 3, 0, 0, 0, 0, 0, 0],
            [0, 2, 0, 0, 0, 0, 1, 0, 0]
        ],
        expert: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 3, 0, 8, 5],
            [0, 0, 1, 0, 2, 0, 0, 0, 0],
            [0, 0, 0, 5, 0, 7, 0, 0, 0],
            [0, 0, 4, 0, 0, 0, 1, 0, 0],
            [0, 9, 0, 0, 0, 0, 0, 0, 0],
            [5, 0, 0, 0, 0, 0, 0, 7, 3],
            [0, 0, 2, 0, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 4, 0, 0, 0, 9]
        ]
    };

    function nowMs() {
        return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    }

    function cloneGrid(grid) {
        return grid.map(function(row) { return row.slice(); });
    }

    function cloneAssign(assign) {
        return assign.slice();
    }

    function randomChoice(items, rng) {
        return items[Math.floor(rng() * items.length)];
    }

    function createSeededRandom(seed) {
        let state = (seed >>> 0) || 1;
        return function() {
            state = (1664525 * state + 1013904223) >>> 0;
            return state / 4294967296;
        };
    }

    function validateNQueensSize(n) {
        return Number.isInteger(n) && n >= 4 && n <= 2000;
    }

    function queenConflicts(row, col, assign) {
        let conflicts = 0;
        for (let otherRow = 0; otherRow < assign.length; otherRow += 1) {
            if (otherRow === row) {
                continue;
            }
            const otherCol = assign[otherRow];
            if (otherCol === col || Math.abs(otherRow - row) === Math.abs(otherCol - col)) {
                conflicts += 1;
            }
        }
        return conflicts;
    }

    function totalQueenConflicts(assign) {
        let total = 0;
        for (let row = 0; row < assign.length; row += 1) {
            total += queenConflicts(row, assign[row], assign);
        }
        return total;
    }

    function buildAngryQueens(assign) {
        const angry = [];
        for (let row = 0; row < assign.length; row += 1) {
            if (queenConflicts(row, assign[row], assign) > 0) {
                angry.push(row);
            }
        }
        return angry;
    }

    function solveQueensDetailed(n, options) {
        const config = options || {};
        const rng = config.rng || Math.random;
        const maxSteps = Number.isInteger(config.maxSteps) ? config.maxSteps : 800;

        if (!validateNQueensSize(n)) {
            return {
                ok: false,
                error: 'N doit etre un entier entre 4 et 2000.'
            };
        }

        const start = nowMs();
        const assign = [];
        for (let row = 0; row < n; row += 1) {
            assign.push(Math.floor(rng() * n));
        }

        const states = [];
        let totalConflicts = totalQueenConflicts(assign);
        let angry = buildAngryQueens(assign);

        states.push({
            step: 0,
            assign: cloneAssign(assign),
            totalConflicts: totalConflicts,
            moved: null,
            blunder: false,
            angry: angry.slice()
        });

        for (let step = 1; step <= maxSteps; step += 1) {
            if (totalConflicts === 0 || angry.length === 0) {
                break;
            }

            const row = randomChoice(angry, rng);
            const previousCol = assign[row];
            const conflictsBefore = queenConflicts(row, previousCol, assign);

            let bestScore = Number.POSITIVE_INFINITY;
            let bestColumns = [];

            for (let col = 0; col < n; col += 1) {
                const score = queenConflicts(row, col, assign);
                if (score < bestScore) {
                    bestScore = score;
                    bestColumns = [col];
                } else if (score === bestScore) {
                    bestColumns.push(col);
                }
            }

            const nextCol = randomChoice(bestColumns, rng);
            assign[row] = nextCol;
            const conflictsAfter = queenConflicts(row, nextCol, assign);
            const nextTotal = totalQueenConflicts(assign);
            const nextAngry = buildAngryQueens(assign);

            states.push({
                step: step,
                assign: cloneAssign(assign),
                totalConflicts: nextTotal,
                moved: {
                    var: row,
                    from: previousCol,
                    to: nextCol,
                    conflictsBefore: conflictsBefore,
                    conflictsAfter: conflictsAfter
                },
                blunder: nextTotal > totalConflicts,
                angry: nextAngry.slice()
            });

            totalConflicts = nextTotal;
            angry = nextAngry;
        }

        return {
            ok: true,
            states: states,
            solved: states[states.length - 1].totalConflicts === 0,
            steps: states.length - 1,
            timeMs: nowMs() - start
        };
    }

    function benchmarkQueens(options) {
        const config = options || {};
        const rng = config.rng || Math.random;
        const sizes = Array.isArray(config.sizes) && config.sizes.length ? config.sizes : DEFAULT_QUEENS_BENCHMARK_SIZES;
        const trials = Number.isInteger(config.trials) ? config.trials : 8;
        const maxSteps = Number.isInteger(config.maxSteps) ? config.maxSteps : 800;
        const results = [];

        for (let index = 0; index < sizes.length; index += 1) {
            const n = sizes[index];
            let successCount = 0;
            let totalTimeMs = 0;
            let totalSteps = 0;

            for (let trial = 0; trial < trials; trial += 1) {
                const result = solveQueensDetailed(n, { maxSteps: maxSteps, rng: rng });
                totalTimeMs += result.timeMs;
                if (result.solved) {
                    successCount += 1;
                    totalSteps += result.steps;
                }
            }

            results.push({
                n: n,
                successRate: (successCount / trials) * 100,
                avgTimeMs: totalTimeMs / trials,
                avgSteps: successCount ? (totalSteps / successCount) : 0
            });
        }

        return results;
    }

    function validateSudokuGrid(grid) {
        const errors = [];
        if (!Array.isArray(grid) || grid.length !== 9) {
            return { valid: false, errors: ['La grille doit contenir 9 lignes.'] };
        }

        for (let row = 0; row < 9; row += 1) {
            if (!Array.isArray(grid[row]) || grid[row].length !== 9) {
                errors.push('Chaque ligne doit contenir 9 colonnes.');
                break;
            }

            for (let col = 0; col < 9; col += 1) {
                const value = grid[row][col];
                if (!Number.isInteger(value) || value < 0 || value > 9) {
                    errors.push('Les valeurs doivent etre des entiers entre 0 et 9.');
                    break;
                }
            }
        }

        if (errors.length) {
            return { valid: false, errors: errors };
        }

        for (let row = 0; row < 9; row += 1) {
            const seen = new Set();
            for (let col = 0; col < 9; col += 1) {
                const value = grid[row][col];
                if (value === 0) {
                    continue;
                }
                if (seen.has(value)) {
                    errors.push('Deux valeurs identiques ont ete trouvees sur une meme ligne.');
                    row = 9;
                    break;
                }
                seen.add(value);
            }
        }

        for (let col = 0; col < 9 && !errors.length; col += 1) {
            const seen = new Set();
            for (let row = 0; row < 9; row += 1) {
                const value = grid[row][col];
                if (value === 0) {
                    continue;
                }
                if (seen.has(value)) {
                    errors.push('Deux valeurs identiques ont ete trouvees sur une meme colonne.');
                    break;
                }
                seen.add(value);
            }
        }

        for (let boxRow = 0; boxRow < 3 && !errors.length; boxRow += 1) {
            for (let boxCol = 0; boxCol < 3 && !errors.length; boxCol += 1) {
                const seen = new Set();
                for (let row = boxRow * 3; row < boxRow * 3 + 3; row += 1) {
                    for (let col = boxCol * 3; col < boxCol * 3 + 3; col += 1) {
                        const value = grid[row][col];
                        if (value === 0) {
                            continue;
                        }
                        if (seen.has(value)) {
                            errors.push('Deux valeurs identiques ont ete trouvees dans un meme bloc 3x3.');
                            break;
                        }
                        seen.add(value);
                    }
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    function isValidSudokuPlacement(grid, row, col, value) {
        for (let index = 0; index < 9; index += 1) {
            if (grid[row][index] === value || grid[index][col] === value) {
                return false;
            }
        }

        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let r = startRow; r < startRow + 3; r += 1) {
            for (let c = startCol; c < startCol + 3; c += 1) {
                if (grid[r][c] === value) {
                    return false;
                }
            }
        }

        return true;
    }

    function computeSudokuCandidates(grid, row, col) {
        const candidates = [];
        for (let value = 1; value <= 9; value += 1) {
            if (isValidSudokuPlacement(grid, row, col, value)) {
                candidates.push(value);
            }
        }
        return candidates;
    }

    function findSudokuCellWithMrv(grid, fixedMask) {
        let bestCell = null;
        let bestCandidates = null;

        for (let row = 0; row < 9; row += 1) {
            for (let col = 0; col < 9; col += 1) {
                if (fixedMask[row][col] || grid[row][col] !== 0) {
                    continue;
                }
                const candidates = computeSudokuCandidates(grid, row, col);
                if (candidates.length === 0) {
                    return { cell: [row, col], candidates: [] };
                }
                if (!bestCandidates || candidates.length < bestCandidates.length) {
                    bestCell = [row, col];
                    bestCandidates = candidates;
                }
            }
        }

        return {
            cell: bestCell,
            candidates: bestCandidates
        };
    }

    function createSudokuState(step, grid, totalConflicts, moved, angry, solved) {
        return {
            step: step,
            grid: cloneGrid(grid),
            totalConflicts: totalConflicts,
            moved: moved,
            angry: angry ? angry.slice() : [],
            solved: Boolean(solved)
        };
    }

    function solveSudokuBacktracking(initialGrid, options) {
        const config = options || {};
        const captureEvery = Number.isInteger(config.captureEvery) ? config.captureEvery : 1;
        const maxStates = Number.isInteger(config.maxStates) ? config.maxStates : 12000;
        const validation = validateSudokuGrid(initialGrid);

        if (!validation.valid) {
            return {
                ok: false,
                error: validation.errors.join(' ')
            };
        }

        const start = nowMs();
        const grid = cloneGrid(initialGrid);
        const fixedMask = grid.map(function(row) {
            return row.map(function(value) {
                return value !== 0;
            });
        });
        const states = [];
        let step = 0;

        function pushState(moved, solved) {
            if (states.length >= maxStates) {
                return;
            }
            if (step % captureEvery !== 0 && !solved) {
                return;
            }
            states.push(createSudokuState(step, grid, 0, moved || null, [], solved));
        }

        pushState(null, false);

        function backtrack() {
            const next = findSudokuCellWithMrv(grid, fixedMask);
            if (!next.cell) {
                pushState(null, true);
                return true;
            }

            const row = next.cell[0];
            const col = next.cell[1];
            if (!next.candidates || next.candidates.length === 0) {
                return false;
            }

            for (let index = 0; index < next.candidates.length; index += 1) {
                const value = next.candidates[index];
                grid[row][col] = value;
                step += 1;
                pushState({
                    var: [row, col],
                    from: 0,
                    to: value,
                    conflictsBefore: 0,
                    conflictsAfter: 0
                }, false);

                if (backtrack()) {
                    return true;
                }

                grid[row][col] = 0;
                step += 1;
                pushState({
                    var: [row, col],
                    from: value,
                    to: 0,
                    conflictsBefore: 0,
                    conflictsAfter: 0
                }, false);
            }

            return false;
        }

        const solved = backtrack();
        if (!states.length) {
            states.push(createSudokuState(0, grid, 0, null, [], solved));
        } else if (solved) {
            states[states.length - 1].solved = true;
        }

        return {
            ok: true,
            states: states,
            solved: solved,
            steps: states.length ? states[states.length - 1].step : 0,
            timeMs: nowMs() - start
        };
    }

    function createSudokuEngine(initialGrid) {
        const grid = cloneGrid(initialGrid);
        const fixedMask = grid.map(function(row) {
            return row.map(function(value) {
                return value !== 0;
            });
        });
        const rowCounts = Array.from({ length: 9 }, function() { return Array(10).fill(0); });
        const colCounts = Array.from({ length: 9 }, function() { return Array(10).fill(0); });
        const boxCounts = Array.from({ length: 3 }, function() {
            return Array.from({ length: 3 }, function() { return Array(10).fill(0); });
        });

        for (let row = 0; row < 9; row += 1) {
            for (let col = 0; col < 9; col += 1) {
                const value = grid[row][col];
                if (!value) {
                    continue;
                }
                rowCounts[row][value] += 1;
                colCounts[col][value] += 1;
                boxCounts[Math.floor(row / 3)][Math.floor(col / 3)][value] += 1;
            }
        }

        function conflicts(row, col, value) {
            if (!value) {
                return 0;
            }
            const boxRow = Math.floor(row / 3);
            const boxCol = Math.floor(col / 3);
            if (grid[row][col] === value) {
                return (rowCounts[row][value] - 1) +
                    (colCounts[col][value] - 1) +
                    (boxCounts[boxRow][boxCol][value] - 1);
            }
            return rowCounts[row][value] + colCounts[col][value] + boxCounts[boxRow][boxCol][value];
        }

        function totalConflicts() {
            let total = 0;
            for (let row = 0; row < 9; row += 1) {
                for (let col = 0; col < 9; col += 1) {
                    const value = grid[row][col];
                    if (value) {
                        total += conflicts(row, col, value);
                    }
                }
            }
            return total / 2;
        }

        function assign(row, col, value) {
            const previous = grid[row][col];
            if (previous === value) {
                return;
            }
            if (previous) {
                rowCounts[row][previous] -= 1;
                colCounts[col][previous] -= 1;
                boxCounts[Math.floor(row / 3)][Math.floor(col / 3)][previous] -= 1;
            }
            grid[row][col] = value;
            if (value) {
                rowCounts[row][value] += 1;
                colCounts[col][value] += 1;
                boxCounts[Math.floor(row / 3)][Math.floor(col / 3)][value] += 1;
            }
        }

        function angryCells() {
            const list = [];
            for (let row = 0; row < 9; row += 1) {
                for (let col = 0; col < 9; col += 1) {
                    if (!fixedMask[row][col] && conflicts(row, col, grid[row][col]) > 0) {
                        list.push([row, col]);
                    }
                }
            }
            return list;
        }

        function worstVariable() {
            let maxConflicts = -1;
            let worst = null;
            for (let row = 0; row < 9; row += 1) {
                for (let col = 0; col < 9; col += 1) {
                    if (fixedMask[row][col]) {
                        continue;
                    }
                    const currentConflicts = conflicts(row, col, grid[row][col]);
                    if (currentConflicts > maxConflicts) {
                        maxConflicts = currentConflicts;
                        worst = [row, col];
                    }
                }
            }
            return worst;
        }

        function isSolved() {
            return totalConflicts() === 0 && grid.every(function(row) {
                return row.every(function(value) { return value !== 0; });
            });
        }

        return {
            grid: grid,
            fixedMask: fixedMask,
            conflicts: conflicts,
            totalConflicts: totalConflicts,
            assign: assign,
            angryCells: angryCells,
            worstVariable: worstVariable,
            isSolved: isSolved
        };
    }

    function solveSudokuMinConflict(initialGrid, options) {
        const config = options || {};
        const rng = config.rng || Math.random;
        const maxStepsPerTry = Number.isInteger(config.maxStepsPerTry) ? config.maxStepsPerTry : 600;
        const maxRestarts = Number.isInteger(config.maxRestarts) ? config.maxRestarts : 12;
        const timeoutMs = Number.isInteger(config.timeoutMs) ? config.timeoutMs : 12000;
        const validation = validateSudokuGrid(initialGrid);

        if (!validation.valid) {
            return {
                ok: false,
                error: validation.errors.join(' ')
            };
        }

        const start = nowMs();
        const deadline = start + timeoutMs;
        const states = [];
        const originalGrid = cloneGrid(initialGrid);

        for (let restart = 0; restart < maxRestarts; restart += 1) {
            if (nowMs() > deadline) {
                break;
            }

            const engine = createSudokuEngine(originalGrid);
            const mutableCells = [];
            for (let row = 0; row < 9; row += 1) {
                for (let col = 0; col < 9; col += 1) {
                    if (!engine.fixedMask[row][col]) {
                        mutableCells.push([row, col]);
                        engine.assign(row, col, Math.floor(rng() * 9) + 1);
                    }
                }
            }

            states.push(createSudokuState(states.length, engine.grid, engine.totalConflicts(), null, engine.angryCells(), false));

            for (let step = 1; step <= maxStepsPerTry; step += 1) {
                if (nowMs() > deadline) {
                    return {
                        ok: true,
                        states: states,
                        solved: false,
                        steps: states.length - 1,
                        timeMs: nowMs() - start
                    };
                }

                if (engine.isSolved()) {
                    states[states.length - 1].solved = true;
                    return {
                        ok: true,
                        states: states,
                        solved: true,
                        steps: states.length - 1,
                        timeMs: nowMs() - start
                    };
                }

                const variable = engine.worstVariable();
                if (!variable) {
                    break;
                }

                const row = variable[0];
                const col = variable[1];
                const previousValue = engine.grid[row][col];
                const conflictsBefore = engine.conflicts(row, col, previousValue);

                engine.assign(row, col, 0);
                let bestScore = Number.POSITIVE_INFINITY;
                let bestValues = [];

                for (let value = 1; value <= 9; value += 1) {
                    const score = engine.conflicts(row, col, value);
                    if (score < bestScore) {
                        bestScore = score;
                        bestValues = [value];
                    } else if (score === bestScore) {
                        bestValues.push(value);
                    }
                }

                const nextValue = randomChoice(bestValues, rng);
                engine.assign(row, col, nextValue);
                const conflictsAfter = engine.conflicts(row, col, nextValue);

                states.push(createSudokuState(
                    states.length,
                    engine.grid,
                    engine.totalConflicts(),
                    {
                        var: [row, col],
                        from: previousValue,
                        to: nextValue,
                        conflictsBefore: conflictsBefore,
                        conflictsAfter: conflictsAfter
                    },
                    engine.angryCells(),
                    false
                ));
            }
        }

        return {
            ok: true,
            states: states.length ? states : [createSudokuState(0, originalGrid, 0, null, [], false)],
            solved: false,
            steps: states.length ? states.length - 1 : 0,
            timeMs: nowMs() - start
        };
    }

    function benchmarkSudoku(options) {
        const config = options || {};
        const method = config.method === 'minconf' ? 'minconf' : 'backtrack';
        const difficulties = ['easy', 'medium', 'hard', 'expert'];
        const results = [];

        for (let index = 0; index < difficulties.length; index += 1) {
            const difficulty = difficulties[index];
            const grid = cloneGrid(SUDOKU_PUZZLES[difficulty]);
            const result = method === 'minconf'
                ? solveSudokuMinConflict(grid, config)
                : solveSudokuBacktracking(grid, config);

            results.push({
                difficulty: difficulty,
                solved: Boolean(result.solved),
                timeMs: result.timeMs || 0,
                steps: result.steps || 0
            });
        }

        return results;
    }

    function isSudokuSolved(grid) {
        const validation = validateSudokuGrid(grid);
        if (!validation.valid) {
            return false;
        }
        for (let row = 0; row < 9; row += 1) {
            for (let col = 0; col < 9; col += 1) {
                if (grid[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    return {
        DEFAULT_QUEENS_BENCHMARK_SIZES: DEFAULT_QUEENS_BENCHMARK_SIZES,
        SUDOKU_PUZZLES: SUDOKU_PUZZLES,
        benchmarkQueens: benchmarkQueens,
        benchmarkSudoku: benchmarkSudoku,
        createSeededRandom: createSeededRandom,
        isSudokuSolved: isSudokuSolved,
        solveQueensDetailed: solveQueensDetailed,
        solveSudokuBacktracking: solveSudokuBacktracking,
        solveSudokuMinConflict: solveSudokuMinConflict,
        validateNQueensSize: validateNQueensSize,
        validateSudokuGrid: validateSudokuGrid
    };
});
