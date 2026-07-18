/* サムズ：数字を消して、残りの合計を行・列の目標に合わせるパズル */
const SumsGame = (() => {
  const N = 5;
  let values = [];      // N*N の数字
  let keepMask = [];    // 正解で残すマス
  let removed = [];     // プレイヤーが消したマス
  let rowT = [], colT = [];
  let cleared = false;

  function generate(rng) {
    values = []; keepMask = [];
    for (let i = 0; i < N * N; i++) {
      values.push(1 + Math.floor(rng() * 9));
      keepMask.push(rng() < 0.55);
    }
    rowT = []; colT = [];
    for (let r = 0; r < N; r++) {
      let s = 0;
      for (let c = 0; c < N; c++) if (keepMask[r * N + c]) s += values[r * N + c];
      rowT.push(s);
    }
    for (let c = 0; c < N; c++) {
      let s = 0;
      for (let r = 0; r < N; r++) if (keepMask[r * N + c]) s += values[r * N + c];
      colT.push(s);
    }
  }

  function rowSum(r) {
    let s = 0;
    for (let c = 0; c < N; c++) if (!removed[r * N + c]) s += values[r * N + c];
    return s;
  }
  function colSum(c) {
    let s = 0;
    for (let r = 0; r < N; r++) if (!removed[r * N + c]) s += values[r * N + c];
    return s;
  }

  function build() {
    const board = document.getElementById('sumsBoard');
    board.innerHTML = '';
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const i = r * N + c;
        const btn = document.createElement('button');
        btn.className = 'sums-cell';
        btn.textContent = values[i];
        btn.addEventListener('click', () => {
          if (cleared) return;
          removed[i] = !removed[i];
          render();
          check();
        });
        board.appendChild(btn);
      }
      const t = document.createElement('div');
      t.className = 'sums-target';
      t.dataset.row = r;
      t.textContent = rowT[r];
      board.appendChild(t);
    }
    for (let c = 0; c < N; c++) {
      const t = document.createElement('div');
      t.className = 'sums-target';
      t.dataset.col = c;
      t.textContent = colT[c];
      board.appendChild(t);
    }
    board.appendChild(Object.assign(document.createElement('div'), { className: 'sums-corner' }));
  }

  function render() {
    const board = document.getElementById('sumsBoard');
    board.querySelectorAll('.sums-cell').forEach((b, i) =>
      b.classList.toggle('removed', !!removed[i]));
    board.querySelectorAll('[data-row]').forEach(t =>
      t.classList.toggle('ok', rowSum(Number(t.dataset.row)) === rowT[Number(t.dataset.row)]));
    board.querySelectorAll('[data-col]').forEach(t =>
      t.classList.toggle('ok', colSum(Number(t.dataset.col)) === colT[Number(t.dataset.col)]));
  }

  function check() {
    for (let r = 0; r < N; r++) if (rowSum(r) !== rowT[r]) return;
    for (let c = 0; c < N; c++) if (colSum(c) !== colT[c]) return;
    cleared = true;
    markDone('sums');
    Modal.show({
      text: 'すべての行と列がぴったり合いました！',
      onRetry: () => { removed = new Array(N * N).fill(false); cleared = false; render(); }
    });
  }

  function open() {
    generate(dailyRng('sums'));
    removed = new Array(N * N).fill(false);
    cleared = false;
    showScreen('game-sums');
    build();
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sumsReset').addEventListener('click', () => {
      removed = new Array(N * N).fill(false);
      cleared = false;
      render();
    });
  });

  return { open };
})();
