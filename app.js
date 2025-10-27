'use strict';

// ========= ユーティリティ =========
const pad = n => String(n).padStart(2, '0');
const ymd = (d=new Date()) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const storage = {
  get(key, fallback=null){ try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }catch{ return fallback }},
  set(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
};

// ========= ① オリジナル応援フレーズ（50） =========
const phrases = [
  '今日の一歩が、未来の私を強くする。',
  '迷ったら、かっこいい方へ。',
  '続ける人だけが、景色を変えられる。',
  '小さな勝利を、静かに積み重ねる。',
  'できることから、すぐ始める。',
  '心とカラダ、どちらも大切に。',
  '焦らずに、でも止まらない。',
  '昨日より少しだけ、今日の自分が好きになる。',
  '凛として、軽やかに。',
  '私が決める、私のペース。',
  '努力は必ず、美しさになる。',
  '選ぶほどに、私らしさが研ぎ澄まされる。',
  'やり切った日は、表情が違う。',
  'かっこよさは、静かな継続から生まれる。',
  'ブレずに、しなやかに。',
  '今日の5分が、明日の自信。',
  '“できた”は、最高のご褒美。',
  '無理はしない、言い訳もしない。',
  '私には、私のリズムがある。',
  '一回で完璧より、毎日の少し。',
  '身体が喜ぶ選択を、静かに積み重ねる。',
  '私の未来は、私の手の中にある。',
  '背筋を伸ばすと、心も上向く。',
  '今日も自分の味方でいよう。',
  '淡々と、でも情熱的に。',
  '美しさは、生活の中に宿る。',
  'やさしく、つよく。',
  '選択はシンプルに、想いはまっすぐに。',
  'ときめくほうを選ぶ。',
  '休む勇気も、進む力になる。',
  '大丈夫、私ならできる。',
  '理想の私に、日々チューニング。',
  '余白をつくると、余裕が生まれる。',
  '笑顔は、最高のコンディション。',
  '丁寧な一口が、体を変える。',
  '昨日の私に、そっと“ありがとう”。',
  'シンプルに食べて、軽やかに動く。',
  '静かに燃える、私の中の火。',
  '選んだ分だけ、強くなる。',
  '私の基準で、美しくなる。',
  '今日の選択が、明日を軽くする。',
  '習慣が、私を守ってくれる。',
  '小さな“できた”が、最強の相棒。',
  '今の一歩は、未来の拍手。',
  'ほんの少しの勇気が、景色を変える。',
  '心地よい疲れは、努力の証。',
  '呼吸を整えて、私に集中。',
  '私の可能性は、まだ始まったばかり。',
  '今日の選択を、誇りに思える私でいよう。',
  'さあ、かっこよく行こう。'
];

function pickRandom(arr){ return arr[Math.floor(Math.random()*arr.length)] }
function setQuote(random=true){
  const el = document.getElementById('quoteText');
  const seed = storage.get('quote-seed');
  if(!random && seed){ el.textContent = seed; return }
  const text = pickRandom(phrases);
  el.textContent = text;
  storage.set('quote-seed', text);
}

// ========= ② チェックリスト & ⑦ カレンダー連動 =========
const checklistIds = ['chkExercise','chkWater','chkChew','chkSun'];
function saveChecklistFor(dateStr){
  const data = checklistIds.map(id => document.getElementById(id).checked);
  storage.set(`checklist:${dateStr}`, data);
}
function loadChecklistFor(dateStr){
  const data = storage.get(`checklist:${dateStr}`, null);
  if(!data) return false;
  checklistIds.forEach((id, i)=>{ document.getElementById(id).checked = !!data[i]; });
  return data.every(Boolean);
}
function setupChecklist(){
  const today = ymd();
  const achieved = loadChecklistFor(today);
  updateChecklistStatus(achieved);
  checklistIds.forEach(id=>{
    document.getElementById(id).addEventListener('change', ()=>{
      saveChecklistFor(today);
      const all = checklistIds.every(i=> document.getElementById(i).checked);
      updateChecklistStatus(all);
      renderCalendar();
    })
  });
}
function updateChecklistStatus(all){
  document.getElementById('checklistStatus').textContent = all ? '全達成💮 すばらしい！' : '今日もコツコツいきましょう。';
}

// ========= ④ 今日の夕ご飯（日替わり） =========
const dinners = [
  { title:'鶏むねの塩麹グリル＋蒸し野菜＋雑穀ごはん', kcal:480, p:45, f:9, c:55,
    desc:'鶏むねを塩麹で漬けてグリル。ブロッコリー/にんじんを蒸し、雑穀ごはん120g。調味は塩・こしょう。' },
  { title:'ささみの梅しそレンジ蒸し＋豆腐味噌汁＋ごはん', kcal:450, p:42, f:7, c:58,
    desc:'ささみを梅しそで包みレンジ蒸し。わかめと絹豆腐の味噌汁。白米120g。' },
  { title:'ツナ缶と白菜の和風煮＋温玉＋麦ごはん', kcal:470, p:38, f:10, c:60,
    desc:'シーチキン水煮缶と白菜を出汁で煮る。仕上げに温玉。麦ごはん120g。' },
  { title:'白身魚のトマト煮（缶）＋クスクス', kcal:440, p:36, f:8, c:58,
    desc:'タラなど白身魚をトマト缶で煮込み、玉ねぎ少量。クスクス70g。' },
  { title:'鶏むねの生姜焼き＋キャベツ千切り＋ごはん', kcal:500, p:40, f:11, c:65,
    desc:'胸肉を薄切りで、醤油・みりん控えめ・生姜で焼く。キャベツたっぷり。白米130g。' },
  { title:'豆腐ステーキきのこあん＋雑穀ごはん', kcal:430, p:28, f:11, c:55,
    desc:'木綿豆腐を焼いて、舞茸・しめじの出汁あん。雑穀ごはん110g。' },
  { title:'サバの味噌煮（煮込み）＋小松菜おひたし＋ごはん', kcal:480, p:34, f:14, c:52,
    desc:'サバを味噌で煮込む（砂糖控えめ）。ごはん110g。' },
  { title:'鶏ささみのヨーグルトレモン蒸し＋温野菜', kcal:420, p:40, f:7, c:48,
    desc:'ささみを無糖ヨーグルト・レモンで蒸し焼き。ブロッコリー/ズッキーニ。' },
  { title:'高野豆腐と野菜の含め煮＋ごはん', kcal:450, p:32, f:9, c:60,
    desc:'高野豆腐を出汁で煮含め、にんじん・いんげん。白米120g。' },
  { title:'鮭のホイル焼き（野菜たっぷり）＋ごはん', kcal:490, p:38, f:12, c:58,
    desc:'鮭ときのこ・玉ねぎをホイルで蒸し焼き。バター不使用、塩こしょうとレモン。白米120g。' },
];
// 450kcal以下にフィルタ
const dinnerPool = dinners.filter(d => d.kcal <= 450);

function dinnerOfDay(dateStr){
  // デフォルトは日付シードで固定
  const len = dinnerPool.length || 1;
  const seed = new Date(dateStr).getDate() % len;
  return dinnerPool[seed];
}
function renderDinner(index=null){
  const el = document.getElementById('dinnerContent');
  const today = ymd();
  if(dinnerPool.length === 0){
    el.innerHTML = '<div class="desc">本日の条件に合うメニューがありません。</div>';
    return;
  }
  let i = index;
  if(i===null){
    i = storage.get(`dinnerIndex:${today}`, null);
    if(i===null){ i = new Date(today).getDate() % dinnerPool.length }
  }
  const d = dinnerPool[i];
  storage.set(`dinnerIndex:${today}`, i % dinnerPool.length);
  el.innerHTML = `
    <div class="title">${d.title}</div>
    <div class="meta">${d.kcal}kcal｜P${d.p} F${d.f} C${d.c}</div>
    <div class="desc">${d.desc}</div>
  `;
}

// ========= ⑤ セブンイレブン提案 =========
const sevenCombos = [
  { items:['野菜スティック','サラダ(ノンオイル)','梅おにぎり','サラダチキン(プレーン)'], kcal:430 },
  { items:['野菜スティック','サラダ(ノンオイル)','おでん(大根・こんにゃく・たまご)','おにぎり(昆布)'], kcal:420 },
  { items:['野菜スティック','サラダ(ノンオイル)','十六穀おにぎり','豆腐バー(プレーン)'], kcal:440 },
  { items:['野菜スティック','サラダ(ノンオイル)','そば(つゆ控えめ)','ゆでたまご'], kcal:450 },
  { items:['野菜スティック','サラダ(ノンオイル)','鮭おにぎり','納豆(たれ少なめ)'], kcal:440 },
];
function renderSeven(index=null){
  const el = document.getElementById('sevenMenu');
  let i = index;
  if(i===null){ i = storage.get('sevenIndex', 0) }
  const c = sevenCombos[i % sevenCombos.length];
  storage.set('sevenIndex', i % sevenCombos.length);
  el.innerHTML = `
    <div class="title">組み合わせ</div>
    <div class="desc">・${c.items.join('<br>・')}</div>
    <div class="meta">合計 約${c.kcal}kcal</div>
  `;
}

// ========= ⑥ 体重入力 =========
function saveWeight(){
  const val = parseFloat(document.getElementById('weightInput').value);
  const today = ymd();
  if(isNaN(val)){ setWeightStatus('数値を入力してください。'); return }
  storage.set(`weight:${today}`, val);
  setWeightStatus(`保存しました：${val.toFixed(1)} kg`);
  renderCalendar();
}
function setWeightStatus(t){ document.getElementById('weightStatus').textContent = t }
function loadTodayWeight(){
  const today = ymd();
  const v = storage.get(`weight:${today}`, null);
  if(v!=null){ document.getElementById('weightInput').value = v; setWeightStatus(`本日の体重：${v.toFixed(1)} kg`)}
}

// ========= ⑦ カレンダー =========
let calRef = new Date();
calRef.setDate(1);
function monthKey(dt){ return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}` }
function buildCalendarDays(dt){
  const y = dt.getFullYear(); const m = dt.getMonth();
  const first = new Date(y, m, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(y, m+1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  const cells = [];
  // previous month tail
  for(let i=startDay-1; i>=0; i--){
    const d = new Date(y, m-1, prevDays - i);
    cells.push({ date:d, muted:true });
  }
  // current month
  for(let d=1; d<=daysInMonth; d++){
    cells.push({ date:new Date(y, m, d), muted:false });
  }
  // next month head to fill 6 rows (42 cells)
  while(cells.length % 7 !== 0 || cells.length < 35){
    const last = cells[cells.length-1].date;
    const nd = new Date(last); nd.setDate(last.getDate()+1);
    cells.push({ date:nd, muted:true });
  }
  return cells;
}
function renderCalendar(){
  const title = document.getElementById('calTitle');
  title.textContent = `${calRef.getFullYear()}年 ${calRef.getMonth()+1}月`;
  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';
  const cells = buildCalendarDays(calRef);
  cells.forEach(c=>{
    const d = c.date; const dateStr = ymd(d);
    const wrap = document.createElement('div');
    wrap.className = 'day' + (c.muted ? ' muted':'' );
    wrap.innerHTML = `
      <div class="d">${d.getDate()}</div>
      <div class="badge"></div>
      <div class="weight"></div>
    `;
    // today highlight
    const todayStr = ymd();
    if(!c.muted && dateStr === todayStr) {
      wrap.classList.add('today');
    }
    const badge = wrap.querySelector('.badge');
    const weightEl = wrap.querySelector('.weight');
    // checklist 完了
    const chk = storage.get(`checklist:${dateStr}`, null);
    if(chk && chk.every(Boolean)) badge.textContent = '💮';
    // weight
    const w = storage.get(`weight:${dateStr}`, null);
    if(w!=null) weightEl.textContent = `${w.toFixed(1)} kg`;
    grid.appendChild(wrap);
  });
}

// ========= 初期化 =========
document.addEventListener('DOMContentLoaded', ()=>{
  setQuote();
  document.getElementById('btnNewQuote').addEventListener('click', ()=> setQuote(true));

  setupChecklist();

  renderDinner();
  document.getElementById('btnNextDinner').addEventListener('click', ()=>{
    const today = ymd();
    const cur = storage.get(`dinnerIndex:${today}`, 0);
    const len = dinnerPool.length || 1;
    renderDinner((cur+1) % len);
  });

  renderSeven();
  document.getElementById('btnNextSeven').addEventListener('click', ()=>{
    const cur = storage.get('sevenIndex', 0);
    renderSeven(cur+1);
  });

  loadTodayWeight();
  document.getElementById('btnSaveWeight').addEventListener('click', saveWeight);

  renderCalendar();
  document.getElementById('prevMonth').addEventListener('click', ()=>{ calRef.setMonth(calRef.getMonth()-1); renderCalendar(); });
  document.getElementById('nextMonth').addEventListener('click', ()=>{ calRef.setMonth(calRef.getMonth()+1); renderCalendar(); });
});
