/* 共通ユーティリティとホーム画面 */
const Store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
};

function fmtDate(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}
function todayStr() { return fmtDate(new Date()); }

function hashStr(s) {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* 日付＋ゲーム名から決まる乱数 → 全員が同じ「今日の問題」になる */
function dailyRng(gameId) { return mulberry32(hashStr(todayStr() + ':' + gameId)); }

function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ---------- クリア記録 ---------- */
function markDone(gameId) {
  const all = Store.get('pzl.done', {});
  const t = todayStr();
  const list = all[t] || [];
  if (!list.includes(gameId)) {
    list.push(gameId);
    all[t] = list;
    Store.set('pzl.done', all);
  }
}
function isDoneToday(gameId) {
  const all = Store.get('pzl.done', {});
  return (all[todayStr()] || []).includes(gameId);
}
function streakCount() {
  const all = Store.get('pzl.done', {});
  let n = 0;
  const d = new Date();
  if (!(all[fmtDate(d)] || []).length) d.setDate(d.getDate() - 1);
  while ((all[fmtDate(d)] || []).length) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/* ---------- 画面遷移 ---------- */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  window.scrollTo(0, 0);
}

/* ---------- クリアモーダル ---------- */
const Modal = {
  onRetry: null,
  show(opts) {
    document.getElementById('clearEmoji').textContent = opts.emoji || '🎉';
    document.getElementById('clearTitle').textContent = opts.title || 'クリア！';
    document.getElementById('clearText').textContent = opts.text || '';
    document.getElementById('clearRetryBtn').textContent = opts.retryLabel || 'もう一度';
    Modal.onRetry = opts.onRetry || null;
    document.getElementById('clearModal').classList.remove('hidden');
  },
  hide() { document.getElementById('clearModal').classList.add('hidden'); }
};

/* ---------- ホーム ---------- */
const App = {
  games: [
    { id: 'zip',    name: 'ジップ',   icon: '🌻', tint: 'tint-zip',    desc: '数字をつなぐ一筆書き', daily: true,  open: () => ZipGame.open() },
    { id: 'sums',   name: 'サムズ',   icon: '⭐', tint: 'tint-sums',   desc: '合計に合わせて消す',   daily: true,  open: () => SumsGame.open() },
    { id: 'sudoku', name: 'ミニ数独', icon: '🌸', tint: 'tint-sudoku', desc: '6×6のやさしい数独',    daily: true,  open: () => SudokuGame.open() },
    { id: 'panda',  name: 'パンダ',   icon: '🐼', tint: 'tint-panda',  desc: 'バランスよく並べよう', daily: true,  open: () => PandaGame.open() },
    { id: 'lights', name: 'ライツ',   icon: '💡', tint: 'tint-lights', desc: '全部のライトを消そう', daily: true,  open: () => LightsGame.open() },
    { id: '2048',   name: '2048',     icon: '🔢', tint: 'tint-2048',   desc: '合体パズルの定番',     daily: false, open: () => Game2048.open() }
  ],

  renderHome() {
    const d = new Date();
    const week = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
    document.getElementById('dateCard').textContent =
      `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${week}）`;
    document.getElementById('streakBadge').textContent = `🔥 ${streakCount()}`;

    const cards = document.getElementById('cards');
    cards.innerHTML = '';
    for (const g of App.games) {
      const btn = document.createElement('button');
      btn.className = `game-card ${g.tint}`;
      btn.innerHTML = `<span class="icon">${g.icon}</span>` +
        `<span class="name">${g.name}</span>` +
        `<span class="desc">${g.desc}</span>`;
      if (g.daily && isDoneToday(g.id)) {
        btn.innerHTML += '<span class="done-badge">✓</span>';
      }
      if (g.id === '2048') {
        const best = Store.get('pzl.best2048', 0);
        if (best > 0) btn.innerHTML += `<span class="best-badge">ベスト ${best}</span>`;
      }
      btn.addEventListener('click', g.open);
      cards.appendChild(btn);
    }
  },

  goHome() {
    Modal.hide();
    App.renderHome();
    showScreen('home');
  },

  init() {
    document.querySelectorAll('[data-back]').forEach(b =>
      b.addEventListener('click', App.goHome));
    document.getElementById('clearHomeBtn').addEventListener('click', App.goHome);
    document.getElementById('clearRetryBtn').addEventListener('click', () => {
      Modal.hide();
      if (Modal.onRetry) Modal.onRetry();
    });
    App.renderHome();
  }
};
