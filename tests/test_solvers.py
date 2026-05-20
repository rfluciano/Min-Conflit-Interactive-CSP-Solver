import unittest
from solvers.sudoku import min_conflict_sudoku, backtrack_sudoku, SUDOKU_PUZZLES, Sudoku

class TestPythonSudokuSolvers(unittest.TestCase):
    def test_medium_backtracking(self):
        grid = SUDOKU_PUZZLES["medium"]
        states = backtrack_sudoku(grid)
        self.assertTrue(states[-1].get("solved"))
        
        # Verify solved grid has no conflicts and is valid
        solved_grid = states[-1]["grid"]
        s = Sudoku(solved_grid)
        self.assertTrue(s.is_solution())

    def test_easy_backtracking(self):
        grid = SUDOKU_PUZZLES["easy"]
        states = backtrack_sudoku(grid)
        self.assertTrue(states[-1].get("solved"))

    def test_min_conflict_easy(self):
        grid = SUDOKU_PUZZLES["easy"]
        # Min conflict is stochastic, let's verify it runs and has cumulative step counts
        states = min_conflict_sudoku(grid, max_steps_per_try=20, max_restarts=2)
        self.assertGreater(len(states), 0)
        for idx, state in enumerate(states):
            self.assertEqual(state["step"], idx)

if __name__ == "__main__":
    unittest.main()
