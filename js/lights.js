/* ライツ：ライツアウト。タップで十字にライトが反転、全部消したらクリア */
const LightsGame = (() => {
  const N = 5;
  let start = [], lit = [];
  let moves = 0;
  let cleared = false;

  /* 消灯状態からランダムに押して作るので必ず解ける */
  function generate(rng) {
    start = new Array(N * N).fill(false);
    const cells = shuffle([...Array(N * N).keys()], rng).slice(0, 9);
    for (const i of cells) toggleOn(start, i);
  }

  function toggleOn(arr, i) {
    const r = Math.floor(i / N), c = i % N;
    const flip = (j) => { arr[j] = !arr[j]; };
    flip(i);
    if (r > 0) flip(i - N);
    if (r < N - 1) flip(i + N);
    if (c > 0) flip(i - 1);
    if (c < N - 1) flip(i + 1);
  }

  function build() {
    const board = document.getElementById('lightsBoard');
    board.innerHTML = '';
    for (let i = 0; i < N * N; i++) {
      const btn = document.createElement('button');
      btn.className = 'lights-cell';
      btn.addEventListener('click', () => {
        if (cleared) return;
        toggleOn(lit, i);
        moves++;
        render();
        check();
      });
      board.appendChild(btn);
    }
  }

  function render() {
    document.querySelectorAll('#lightsBoard .lights-cell').forEach((el, i) =>
      el.classList.toggle('lit', lit[i]));
    document.getElementById('lightsStatus').textContent = `手数：${moves}`;
  }

  function check() {
    if (lit.some(v => v)) return;
    cleared = true;
    markDone('lights');
    Modal.show({
      emoji: '💡',
      text: `${moves}手ですべてのライトを消しました！`,
      onRetry: () => { lit = start.slice(); moves = 0; cleared = false; render(); }
    });
  }

  function open() {
    generate(dailyRng('lights'));
    lit = start.slice();
    moves = 0;
    cleared = false;
    showScreen('game-lights');
    build();
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('lightsReset').addEventListener('click', () => {
      lit = start.slice();
      moves = 0;
      cleared = false;
      render();
    });
  });

  return { open };
})();
