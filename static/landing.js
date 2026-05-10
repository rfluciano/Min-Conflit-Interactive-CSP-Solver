const boardEl = document.querySelector('.animated-board');
if (boardEl) {
    for (let i = 0; i < 64; i++) {
        const cell = document.createElement('div');
        cell.className = (Math.floor(i/8) + i) % 2 === 0 ? 'cell light' : 'cell dark';
        boardEl.appendChild(cell);
    }
}