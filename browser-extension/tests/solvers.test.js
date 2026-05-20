'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const solvers = require('../lib/solvers.js');

function cloneGrid(grid) {
    return grid.map((row) => row.slice());
}

test('N-Queens solves an 8x8 board with deterministic randomness', () => {
    const rng = solvers.createSeededRandom(42);
    const result = solvers.solveQueensDetailed(8, {
        maxSteps: 1200,
        rng
    });

    assert.equal(result.ok, true);
    assert.equal(result.solved, true);
    assert.equal(result.states.at(-1).totalConflicts, 0);
});

test('Backtracking solves the easy Sudoku puzzle', () => {
    const result = solvers.solveSudokuBacktracking(cloneGrid(solvers.SUDOKU_PUZZLES.easy));

    assert.equal(result.ok, true);
    assert.equal(result.solved, true);
    assert.equal(solvers.isSudokuSolved(result.states.at(-1).grid), true);
});

test('Sudoku validation rejects duplicated values in a row', () => {
    const invalid = cloneGrid(solvers.SUDOKU_PUZZLES.easy);
    invalid[0][2] = 5;
    const validation = solvers.validateSudokuGrid(invalid);

    assert.equal(validation.valid, false);
    assert.match(validation.errors[0], /ligne|bloc|colonne/i);
});

test('Queens benchmark returns one row per requested size', () => {
    const benchmark = solvers.benchmarkQueens({
        sizes: [8, 16],
        trials: 2,
        maxSteps: 600,
        rng: solvers.createSeededRandom(7)
    });

    assert.equal(Array.isArray(benchmark), true);
    assert.equal(benchmark.length, 2);
    assert.equal(benchmark[0].n, 8);
    assert.equal(typeof benchmark[0].avgTimeMs, 'number');
});

test('Min-Conflict returns ok and correct structure even when unsolved', () => {
    const grid = cloneGrid(solvers.SUDOKU_PUZZLES.easy);
    const result = solvers.solveSudokuMinConflict(grid, {
        maxStepsPerTry: 10,
        maxRestarts: 2
    });

    assert.equal(result.ok, true);
    assert.equal(typeof result.solved, 'boolean');
    assert.equal(result.states.length > 0, true);
    // Verify cumulative step numbers are sequential: 0, 1, 2, ...
    for (let idx = 0; idx < result.states.length; idx++) {
        assert.equal(result.states[idx].step, idx);
    }
});

test('Backtracking solves the medium Sudoku puzzle', () => {
    const grid = cloneGrid(solvers.SUDOKU_PUZZLES.medium);
    const result = solvers.solveSudokuBacktracking(grid);

    assert.equal(result.ok, true);
    assert.equal(result.solved, true);
    assert.equal(solvers.isSudokuSolved(result.states.at(-1).grid), true);
});

test('All default puzzles are valid', () => {
    for (const key of Object.keys(solvers.SUDOKU_PUZZLES)) {
        const grid = solvers.SUDOKU_PUZZLES[key];
        const validation = solvers.validateSudokuGrid(grid);
        assert.equal(validation.valid, true, `Grid ${key} should be valid`);
    }
});
