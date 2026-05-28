# TODO — Split CSS components (static/style.css)

## Step 1: Read & inventory (done)
- Reviewed: `static/app.html`, `static/style.css`, `static/script.js` (for injected DOM), `static/solvers.js` (no extra DOM ids/classes for layout).
- Identified benchmark loader/cube + select + tables + board + tracking elements that must keep stable layout.

## Step 2: Prepare plan (to do)
- Create 4 new CSS files:
  - `static/header.css`
  - `static/left.css`
  - `static/board.css`
  - `static/right.css`
- Convert `static/style.css` into an aggregator using `@import` while keeping required base rules.

## Step 3: Implement split
- Move/copy selectors from `static/style.css` into the appropriate new files:
  - Base/variables/reset kept in `static/style.css` (or in a base import, if preferred).
  - Header/topbar + common controls in `header.css`
  - Left panel + benchmark + cube loader in `left.css`
  - Board area + queens/sudoku boards + info/loading panels in `board.css`
  - Right panel + tracking table + badges in `right.css`
- Ensure no selector gets lost.

## Step 4: Keep compatibility
- Do not change `static/app.html` (it only loads `style.css`).
- Ensure all existing IDs/classes remain styled (`#benchmarkPanel`, `#benchLoader`, `#boardContainer`, `#rightPanel`, `#queenTable`, `.bench-dropdown`, `.cube`, etc.).

## Step 5: Test
- Manual check (browser):
  - benchmark appears in the correct place (no shift right / no drop under board)
  - board remains centered
  - tracking panel and tables layout are unchanged
  - responsive at breakpoints (~1360px and 920px)

## Step 6: Cleanup
- Remove accidental duplicate/contradictory rules across CSS files (if any).
