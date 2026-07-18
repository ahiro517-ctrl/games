/* ミニ数独：6×6（2×3ブロック） */
const SudokuGame = (() => {
  const N = 6, BR = 2, BC = 3, GIVENS = 16;
  let solution = [], given = [], grid = [];
  let selected = -1;
  let cleared = false;

  function boxId(r, c) { return Math.floor(r / BR) * (N / BC) + Math.floor(c / BC); }

  function generate(rng) {
    solution = new Array(N * N).fill(0);
    const fill = (i) => {
      if (i === N * N) return true;
      const r = Math.floor(i / N), c = i % N;
      for (const v of shuffle([1, 2, 3, 4, 5, 6], rng)) {
        let ok = true;
        for (let k = 0; k < N * N && ok; k++) {
          if (!solution[k]) continue;
          const kr = Math.floor(k / N), kc = k % N;
          if (solution[k] === v && (kr === r || kc === c || boxId(kr, kc) === boxId(r, c))) ok = false;
        }
        if (ok) {
          solution[i] = v;
          if (fill(i + 1)) return true;
          solution[i] = 0;
        }
      }
      return false;
    };
    fill(0);
    given = new Array(N * N).fill(0);
    const order = shuffle([...Array(N * N).keys()], rng);
    for (let k = 0; k < GIVENS; k++) given[order[k]] = solution[order[k]];
  }

  function conflicts() {
    const bad = new Set();
    for (let i = 0; i < N * N; i++) {
      if (!grid[i]) continue;
      const r = Math.floor(i / N), c = i % N;
      for (let j = i + 1; j < N * N; j++) {
        if (grid[j] !== grid[i]) continue;
        const jr = Math.floor(j / N), jc = j % N;
        if (jr === r || jc === c || boxId(jr, jc) === boxId(r, c)) { bad.add(i); bad.add(j); }
      }
    }
    return bad;
  }

  function build() {
    const board = document.getElementById('sudokuBoard');
    board.innerHTML = '';
    for (let i = 0; i < N * N; i++) {
      const r = Math.floor(i / N), c = i % N;
      const btn = document.createElement('button');
      btn.className = 'sudoku-cell';
      if (c % BC === 0 && c !== 0) btn.classList.add('bx');
      if (r % BR === 0 && r !== 0) btn.classList.add('by');
      if (given[i]) btn.classList.add('given');
      btn.addEventListener('click', () => {
        if (cleared || given[i]) return;
        selected = (selected === i) ? -1 : i;
        render();
      });
      board.appendChild(btn);
    }
    const pad = document.getElementById('sudokuPad');
    pad.innerHTML = '';
    for (let v = 1; v <= N; v++) {
      const b = document.createElement('button');
      b.textContent = v;
      b.addEventListener('click', () => input(v));
      pad.appendChild(b);
    }
    const e = document.createElement('button');
    e.textContent = '✕';
    e.className = 'erase';
    e.addEventListener('click', () => input(0));
    pad.appendChild(e);
  }

  function input(v) {
    if (cleared || selected < 0 || given[selected]) return;
    grid[selected] = v;
    render();
    check();
  }

  function render() {
    const cells = document.querySelectorAll('#sudokuBoard .sudoku-cell');
    const bad = conflicts();
    cells.forEach((el, i) => {
      el.textContent = grid[i] || '';
      el.classList.toggle('sel', i === selected);
      el.classList.toggle('conflict', bad.has(i));
    });
  }

  function check() {
    if (grid.some(v => !v) || conflicts().size) return;
    cleared = true;
    selected = -1;
    render();
    markDone('sudoku');
    Modal.show({
      text: '6×6の数独を解きました！',
      onRetry: () => { grid = given.slice(); cleared = false; render(); }
    });
  }

  function open() {
    generate(dailyRng('sudoku'));
    grid = given.slice();
    selected = -1;
    cleared = false;
    showScreen('game-sudoku');
    build();
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sudokuReset').addEventListener('click', () => {
      grid = given.slice();
      selected = -1;
      cleared = false;
      render();
    });
  });

  return { open };
})();
