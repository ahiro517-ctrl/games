/* 2048：スワイプ／矢印キーで遊ぶ定番パズル（フリープレイ） */
const Game2048 = (() => {
  const N = 4;
  let grid = [], score = 0, over = false, won = false;
  let newTiles = new Set();
  let swipeStart = null;

  function emptyCells() {
    const out = [];
    for (let i = 0; i < N * N; i++) if (!grid[i]) out.push(i);
    return out;
  }

  function addTile() {
    const empty = emptyCells();
    if (!empty.length) return;
    const i = empty[Math.floor(Math.random() * empty.length)];
    grid[i] = Math.random() < 0.9 ? 2 : 4;
    newTiles.add(i);
  }

  /* dir: 0=左 1=右 2=上 3=下 */
  function move(dir) {
    if (over) return;
    let moved = false;
    newTiles.clear();
    for (let line = 0; line < N; line++) {
      const idx = [];
      for (let k = 0; k < N; k++) {
        if (dir === 0) idx.push(line * N + k);
        if (dir === 1) idx.push(line * N + (N - 1 - k));
        if (dir === 2) idx.push(k * N + line);
        if (dir === 3) idx.push((N - 1 - k) * N + line);
      }
      const vals = idx.map(i => grid[i]).filter(v => v);
      const merged = [];
      for (let k = 0; k < vals.length; k++) {
        if (k + 1 < vals.length && vals[k] === vals[k + 1]) {
          const v = vals[k] * 2;
          merged.push(v);
          score += v;
          if (v === 2048 && !won) { won = true; onWin(); }
          k++;
        } else {
          merged.push(vals[k]);
        }
      }
      while (merged.length < N) merged.push(0);
      idx.forEach((i, k) => {
        if (grid[i] !== merged[k]) moved = true;
        grid[i] = merged[k];
      });
    }
    if (!moved) return;
    addTile();
    const best = Store.get('pzl.best2048', 0);
    if (score > best) Store.set('pzl.best2048', score);
    if (!emptyCells().length && !canMove()) over = true;
    render();
  }

  function canMove() {
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const v = grid[r * N + c];
        if (!v) return true;
        if (c + 1 < N && grid[r * N + c + 1] === v) return true;
        if (r + 1 < N && grid[(r + 1) * N + c] === v) return true;
      }
    }
    return false;
  }

  function onWin() {
    Modal.show({
      emoji: '👑',
      title: '2048達成！',
      text: 'おめでとう！このまま続けてハイスコアを狙えます。',
      retryLabel: '続ける',
      onRetry: () => {}
    });
  }

  function render() {
    const board = document.getElementById('g2048Board');
    board.innerHTML = '';
    for (let i = 0; i < N * N; i++) {
      const div = document.createElement('div');
      const v = grid[i];
      div.className = 'g2048-cell' + (v ? ` v${Math.min(v, 2048)}` : '');
      if (newTiles.has(i)) div.classList.add('pop');
      div.textContent = v || '';
      board.appendChild(div);
    }
    if (over) {
      const o = document.createElement('div');
      o.className = 'g2048-over';
      o.innerHTML = '<div>ゲームオーバー</div>';
      const b = document.createElement('button');
      b.className = 'btn primary';
      b.textContent = '新しいゲーム';
      b.addEventListener('click', reset);
      o.appendChild(b);
      board.appendChild(o);
    }
    document.getElementById('g2048Score').textContent = `スコア ${score}`;
    document.getElementById('g2048Best').textContent = `ベスト ${Store.get('pzl.best2048', 0)}`;
  }

  function reset() {
    grid = new Array(N * N).fill(0);
    score = 0;
    over = false;
    won = false;
    newTiles.clear();
    addTile();
    addTile();
    render();
  }

  function onKey(e) {
    if (!document.getElementById('game-2048').classList.contains('active')) return;
    const map = { ArrowLeft: 0, ArrowRight: 1, ArrowUp: 2, ArrowDown: 3 };
    if (map[e.key] !== undefined) {
      e.preventDefault();
      move(map[e.key]);
    }
  }

  function open() {
    reset();
    showScreen('game-2048');
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('g2048Reset').addEventListener('click', reset);
    document.addEventListener('keydown', onKey);
    const board = document.getElementById('g2048Board');
    board.addEventListener('pointerdown', (e) => {
      swipeStart = { x: e.clientX, y: e.clientY };
    });
    board.addEventListener('pointerup', (e) => {
      if (!swipeStart) return;
      const dx = e.clientX - swipeStart.x, dy = e.clientY - swipeStart.y;
      swipeStart = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : 0);
      else move(dy > 0 ? 3 : 2);
    });
  });

  return { open };
})();
