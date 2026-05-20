'use strict';

importScripts('./lib/solvers.js');

self.addEventListener('message', function(event) {
    const payload = event.data || {};
    const id = payload.id;
    const type = payload.type;
    const data = payload.payload || {};

    try {
        let result;
        switch (type) {
        case 'solveQueens':
            result = self.MinConflitSolvers.solveQueensDetailed(data.n, {
                maxSteps: data.maxSteps
            });
            break;
        case 'benchmarkQueens':
            result = self.MinConflitSolvers.benchmarkQueens({
                sizes: data.sizes,
                trials: data.trials,
                maxSteps: data.maxSteps
            });
            break;
        case 'solveSudoku':
            result = data.method === 'minconf'
                ? self.MinConflitSolvers.solveSudokuMinConflict(data.grid, {
                    maxStepsPerTry: data.maxStepsPerTry,
                    maxRestarts: data.maxRestarts,
                    timeoutMs: data.timeoutMs
                })
                : self.MinConflitSolvers.solveSudokuBacktracking(data.grid, {
                    captureEvery: data.captureEvery,
                    maxStates: data.maxStates
                });
            break;
        case 'benchmarkSudoku':
            result = self.MinConflitSolvers.benchmarkSudoku({
                method: data.method,
                timeoutMs: data.timeoutMs
            });
            break;
        default:
            throw new Error('Type de tache inconnu: ' + type);
        }

        self.postMessage({
            id: id,
            ok: true,
            result: result
        });
    } catch (error) {
        self.postMessage({
            id: id,
            ok: false,
            error: error && error.message ? error.message : String(error)
        });
    }
});
