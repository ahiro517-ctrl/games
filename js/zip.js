/* ジップ：数字を順につないで全マスを通る一筆書きパズル */
const ZipGame = (() => {
  const N = 6, TOTAL = N * N, NUMS = 7;
  let waypoints = {};   // cellIndex -> 1..NUMS
  let path = [];        // なぞった経路（セル番号の配列）
  let dragging = false;
  let cleared = false;

  function neighbors(i) {
    const r = Math.floor(i / N), c = i % N, out = [];
    if (r > 0) out.push(i - N);
    if (r < N - 1) out.push(i + N);
    if (c > 0) out.push(i - 1);
    if (c < N - 1) out.push(i + 1);
    return out;
  }

  /* ランダムなハミルトン路（全マスを1回ずつ通る道）を生成 */
  function generate(rng) {
    let steps;
    while (true) {
      steps = 0;
      const p = [], visited = new Array(TOTAL).fill(false);
      const dfs = (cell) => {
        if (++steps > 150000) return false;
        p.push(cell); visited[cell] = true;
        if (p.length === TOTAL) return true;
        for (const n of shuffle(neighbors(cell), rng)) {
          if (!visited[n] && dfs(n)) return true;
        }
        visited[cell] = false; p.pop();
        return false;
      };
      if (dfs(Math.floor(rng() * TOTAL)) && p.length === TOTAL) {
        waypoints = {};
        for (let k = 0; k < NUMS; k++) {
          const pos = Math.round(k * (TOTAL - 1) / (NUMS - 1));
          waypoints[p[pos]] = k + 1;
        }
        return;
      }
    }
  }

  function nextNeeded() {
    let max = 0;
    for (const cell of path) {
      if (waypoints[cell]) max = Math.max(max, waypoints[cell]);
    }
    return max + 1;
  }

  function tryStep(cell) {
    if (cleared || cell == null) return;
    if (path.length === 0) {
      if (waypoints[cell] === 1) { path.push(cell); render(); }
      return;
    }
    const last = path[path.length - 1];
    if (cell === last) return;
    if (path.length >= 2 && cell === path[path.length - 2]) {
      path.pop(); render();                          // 1マス戻る
      return;
    }
    const idx = path.indexOf(cell);
    if (idx !== -1) return;                          // 通過済み
    if (!neighbors(last).includes(cell)) return;     // 隣接のみ
    if (waypoints[cell] && waypoints[cell] !== nextNeeded()) return; // 数字は順番どおり
    path.push(cell);
    render();
    if (path.length === TOTAL) win();
  }

  function win() {
    cleared = true;
    markDone('zip');
    Modal.show({
      text: 'すべてのマスをつなげました！',
      onRetry: () => { path = []; cleared = false; render(); }
    });
  }

  function cellFromEvent(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const cell = el && el.closest('.zip-cell');
    return cell ? Number(cell.dataset.i) : null;
  }

  function build() {
    const board = document.getElementById('zipBoard');
    board.innerHTML = '';
    for (let i = 0; i < TOTAL; i++) {
      const div = document.createElement('div');
      div.className = 'zip-cell';
      div.dataset.i = i;
      if (waypoints[i]) div.innerHTML = `<span class="num">${waypoints[i]}</span>`;
      board.appendChild(div);
    }
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('zip-svg');
    svg.innerHTML = '<polyline points=""/>';
    board.appendChild(svg);

    board.onpointerdown = (e) => {
      dragging = true;
      const cell = cellFromEvent(e);
      const idx = path.indexOf(cell);
      if (idx !== -1) { path = path.slice(0, idx + 1); render(); } // 途中をタップで巻き戻し
      else tryStep(cell);
    };
    board.onpointermove = (e) => { if (dragging) tryStep(cellFromEvent(e)); };
    window.addEventListener('pointerup', () => { dragging = false; });
  }

  function render() {
    const board = document.getElementById('zipBoard');
    const cells = board.querySelectorAll('.zip-cell');
    cells.forEach((c, i) => c.classList.toggle('on', path.includes(i)));

    const svg = board.querySelector('.zip-svg');
    const rect = board.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    const pts = path.map(i => {
      const c = cells[i];
      return (c.offsetLeft + c.offsetWidth / 2) + ',' + (c.offsetTop + c.offsetHeight / 2);
    }).join(' ');
    svg.querySelector('polyline').setAttribute('points', pts);
  }

  function open() {
    generate(dailyRng('zip'));
    path = [];
    cleared = false;
    showScreen('game-zip');
    build();
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('zipReset').addEventListener('click', () => {
      path = []; cleared = false; render();
    });
  });

  return { open };
})();
