/* パンダ：🐼と🎍を各行・各列に3つずつ。同じ絵文字を3連続で並べたらNG（タクズ系） */
const PandaGame = (() => {
  const N = 6, HALF = N / 2, GIVENS = 14;
  const SYM = ['', '🐼', '🎍'];   // 0=空, 1=パンダ, 2=竹
  let given = [], grid = [];
  let cleared = false;

  function generate(rng) {
    const sol = new Array(N * N).fill(0);
    const ok = (i, v) => {
      const r = Math.floor(i / N), c = i % N;
      let rc = 0, cc = 0;
      for (let k = 0; k < N; k++) {
        if (sol[r * N + k] === v) rc++;
        if (sol[k * N + c] === v) cc++;
      }
      if (rc >= HALF || cc >= HALF) return false;
      if (c >= 2 && sol[i - 1] === v && sol[i - 2] === v) return false;
      if (r >= 2 && sol[i - N] === v && sol[i - 2 * N] === v) return false;
      return true;
    };
    const fill = (i) => {
      if (i === N * N) return true;
      for (const v of shuffle([1, 2], rng)) {
        if (ok(i, v)) {
          sol[i] = v;
          if (fill(i + 1)) return true;
          sol[i] = 0;
        }
      }
      return false;
    };
    fill(0);
    given = new Array(N * N).fill(0);
    const order = shuffle([...Array(N * N).keys()], rng);
    for (let k = 0; k < GIVENS; k++) given[order[k]] = sol[order[k]];
  }

  /* ルール違反のマスを集める */
  function violations() {
    const bad = new Set();
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const i = r * N + c, v = grid[i];
        if (!v) continue;
        if (c >= 2 && grid[i - 1] === v && grid[i - 2] === v) { bad.add(i); bad.add(i - 1); bad.add(i - 2); }
        if (r >= 2 && grid[i - N] === v && grid[i - 2 * N] === v) { bad.add(i); bad.add(i - N); bad.add(i - 2 * N); }
      }
    }
    for (let r = 0; r < N; r++) {
      for (const v of [1, 2]) {
        let cnt = 0;
        for (let c = 0; c < N; c++) if (grid[r * N + c] === v) cnt++;
        if (cnt > HALF) for (let c = 0; c < N; c++) if (grid[r * N + c] === v) bad.add(r * N + c);
      }
    }
    for (let c = 0; c < N; c++) {
      for (const v of [1, 2]) {
        let cnt = 0;
        for (let r = 0; r < N; r++) if (grid[r * N + c] === v) cnt++;
        if (cnt > HALF) for (let r = 0; r < N; r++) if (grid[r * N + c] === v) bad.add(r * N + c);
      }
    }
    return bad;
  }

  function build() {
    const board = document.getElementById('pandaBoard');
    board.innerHTML = '';
    for (let i = 0; i < N * N; i++) {
      const btn = document.createElement('button');
      btn.className = 'panda-cell';
      if (given[i]) btn.classList.add('given');
      btn.addEventListener('click', () => {
        if (cleared || given[i]) return;
        grid[i] = (grid[i] + 1) % 3;
        render();
        check();
      });
      board.appendChild(btn);
    }
  }

  function render() {
    const bad = violations();
    document.querySelectorAll('#pandaBoard .panda-cell').forEach((el, i) => {
      el.textContent = SYM[grid[i]];
      el.classList.toggle('bad', bad.has(i));
    });
  }

  function check() {
    if (grid.some(v => !v) || violations().size) return;
    cleared = true;
    markDone('panda');
    Modal.show({
      emoji: '🐼',
      text: 'パンダと竹がバランスよく並びました！',
      onRetry: () => { grid = given.slice(); cleared = false; render(); }
    });
  }

  function open() {
    generate(dailyRng('panda'));
    grid = given.slice();
    cleared = false;
    showScreen('game-panda');
    build();
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('pandaReset').addEventListener('click', () => {
      grid = given.slice();
      cleared = false;
      render();
    });
  });

  return { open };
})();
