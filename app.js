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
// 条件: 複合炭水化物（米・パン・麺・雑穀等）を含まない、<=400kcal
// tags: '辛口' | 'さっぱり' | '温かい' | '冷たい'
function buildDinners(){
  const proteins = [
    {name:'鶏むね', p:38, f:8, c:0, base:220, tags:['さっぱり','温かい']},
    {name:'鶏ささみ', p:36, f:6, c:0, base:200, tags:['さっぱり','温かい']},
    {name:'白身魚', p:30, f:6, c:0, base:180, tags:['さっぱり','温かい']},
    {name:'鮭', p:34, f:12, c:0, base:260, tags:['温かい']},
    {name:'木綿豆腐', p:24, f:12, c:8, base:180, tags:['温かい']},
    {name:'高野豆腐', p:28, f:9, c:18, base:220, tags:['温かい']},
    {name:'ツナ水煮', p:26, f:3, c:0, base:150, tags:['温かい','さっぱり']},
  ];
  const sauces = [
    {name:'レモンハーブ', kcal:20, p:0, f:1, c:2, tags:['さっぱり']},
    {name:'生姜だれ', kcal:25, p:0, f:1, c:3, tags:['温かい']},
    {name:'塩麹', kcal:30, p:1, f:0, c:4, tags:['さっぱり']},
    {name:'ヨーグルトレモン', kcal:40, p:3, f:1, c:4, tags:['さっぱり']},
    {name:'トマト煮', kcal:60, p:2, f:2, c:8, tags:['温かい']},
    {name:'出汁あん', kcal:45, p:1, f:1, c:7, tags:['温かい']},
    {name:'コチュジャン', kcal:50, p:2, f:1, c:9, tags:['辛口','温かい']},
    {name:'豆板醤', kcal:35, p:1, f:1, c:5, tags:['辛口','温かい']},
    {name:'カレー粉マリネ', kcal:55, p:2, f:3, c:6, tags:['辛口','温かい']},
    {name:'柚子胡椒', kcal:15, p:0, f:0, c:2, tags:['さっぱり']},
  ];
  const veggies = [
    {name:'ブロッコリー', kcal:25, p:3, f:0, c:4},
    {name:'ズッキーニ', kcal:20, p:1, f:0, c:4},
    {name:'舞茸', kcal:15, p:2, f:0, c:3},
    {name:'しめじ', kcal:15, p:2, f:0, c:3},
    {name:'小松菜', kcal:18, p:2, f:0, c:2},
    {name:'キャベツ', kcal:18, p:1, f:0, c:4},
    {name:'パプリカ', kcal:25, p:1, f:0, c:5},
    {name:'なす', kcal:30, p:1, f:1, c:5},
    {name:'玉ねぎ少量', kcal:18, p:0, f:0, c:4},
    {name:'もやし', kcal:15, p:1, f:0, c:3},
    {name:'豆苗', kcal:25, p:3, f:1, c:2},
    {name:'きゅうり', kcal:12, p:0, f:0, c:2},
  ];
  const makeTitle = (prot, sauce, vegs) => `${prot.name}の${sauce.name}＋${vegs.map(v=>v.name).slice(0,2).join('・')}`;
  const randPick = (arr, n) => arr.sort(()=>Math.random()-0.5).slice(0,n);
  const items = [];
  proteins.forEach(p=>{
    sauces.forEach(s=>{
      for(let vcount of [2,3]){
        const vs = randPick([...veggies], vcount);
        const kcal = p.base + s.kcal + vs.reduce((a,b)=>a+b.kcal,0);
        const P = p.p + s.p + vs.reduce((a,b)=>a+(b.p||0),0);
        const F = p.f + s.f + vs.reduce((a,b)=>a+(b.f||0),0);
        const C = p.c + s.c + vs.reduce((a,b)=>a+(b.c||0),0);
        const tags = Array.from(new Set([...(p.tags||[]), ...(s.tags||[]), '温かい']));
        if(kcal <= 400){
          items.push({
            title: makeTitle(p,s,vs),
            kcal: Math.round(kcal), p: Math.round(P), f: Math.round(F), c: Math.round(C),
            tags,
            desc: `${p.name}を${s.name}で調理。野菜（${vs.map(v=>v.name).join('・')}）をたっぷり添える。`,
            steps: ['材料を下ごしらえ','たれ/スパイスで調味','焼く/蒸す/煮るなどで加熱','味を整えて盛り付け'],
            alt: ['野菜は季節のものに置き換えOK','辛さは控えめ〜強めで調整']
          });
        }
      }
    })
  });
  // 冷たい・さっぱり系を少量追加
  const coldBases = [
    { title:'ツナ・卵・ブロッコリーの冷製サラダ', kcal:380, p:32, f:16, c:10, tags:['冷たい','さっぱり'],
      desc:'ノンオイルでさっぱり仕上げ。', steps:['具材を下茹で','和える'], alt:['ドレッシングはレモンベースに']}
  ];
  const all = [...items, ...coldBases];
  // 重複タイトル除去し、シャッフル
  const uniq = []; const seen = new Set();
  all.forEach(it=>{ if(!seen.has(it.title)){ seen.add(it.title); uniq.push(it); } });
  return uniq.sort(()=>Math.random()-0.5);
}
const dinners = buildDinners();
const baseDinnerPool = dinners.filter(d => d.kcal <= 400);

function getCurrentTag(){ return storage.get('dinnerTag','all'); }
function setCurrentTag(tag){ storage.set('dinnerTag', tag); }
function getDinnerPool(){
  const tag = getCurrentTag();
  if(tag==='all') return baseDinnerPool;
  return baseDinnerPool.filter(d => (d.tags||[]).includes(tag));
}

function dinnerOfDay(dateStr){
  // デフォルトは日付シードで固定
  const pool = getDinnerPool();
  const len = pool.length || 1;
  const seed = new Date(dateStr).getDate() % len;
  return pool[seed];
}
function renderDinner(index=null){
  const el = document.getElementById('dinnerContent');
  const today = ymd();
  const pool = getDinnerPool();
  if(pool.length === 0){
    el.innerHTML = '<div class="desc">本日の条件に合うメニューがありません。</div>';
    document.getElementById('recipeDetails').hidden = true;
    return;
  }
  let i = index;
  if(i===null){
    i = storage.get(`dinnerIndex:${today}`, null);
    if(i===null){ i = new Date(today).getDate() % pool.length }
  }
  const d = pool[i];
  storage.set(`dinnerIndex:${today}`, i % pool.length);
  el.innerHTML = `
    <div class="meal-box">
      <div class="meal-header">
        <div class="meal-title">${d.title}</div>
        <div class="kcal-badge">${d.kcal} kcal</div>
      </div>
      <div class="pfc">
        <span class="chip">P ${d.p}</span>
        <span class="chip">F ${d.f}</span>
        <span class="chip">C ${d.c}</span>
        ${d.tags? d.tags.map(t=>`<span class='chip chip-tag'>${t}</span>`).join(''):''}
      </div>
      <div class="desc">${d.desc}</div>
    </div>
  `;
  // recipe details content (hidden by default)
  const detailBox = document.getElementById('recipeDetails');
  if(d.steps || d.alt){
    const steps = (d.steps||[]).map((s,idx)=>`<li>${idx+1}. ${s}</li>`).join('');
    const alts = (d.alt||[]).map(a=>`<li>・${a}</li>`).join('');
    detailBox.innerHTML = `
      ${steps? `<div><strong>手順</strong><ol>${steps}</ol></div>`:''}
      ${alts? `<div><strong>代替案</strong><ul>${alts}</ul></div>`:''}
    `;
  } else {
    detailBox.innerHTML = '';
  }
}

// ========= ⑤ セブンイレブン提案 =========
function buildSevenCombos(){
  const baseA = { name:'野菜スティック', kcal:40 };
  const baseB = { name:'サラダ(ノンオイル)', kcal:40 };
  const mains = [
    { name:'サラダチキン(プレーン)', kcal:115 },
    { name:'豆腐バー(プレーン)', kcal:120 },
    { name:'ゆでたまご', kcal:70 },
    { name:'おでん(大根・こんにゃく・たまご)', kcal:120 },
    { name:'おでん(大根・昆布・たまご)', kcal:110 },
    { name:'焼き鳥(塩・もも)', kcal:160 },
    { name:'納豆(たれ少なめ)', kcal:90 },
    { name:'冷やっこ(小)', kcal:80 },
  ];
  const carbs = [
    { name:'梅おにぎり', kcal:170 },
    { name:'昆布おにぎり', kcal:175 },
    { name:'鮭おにぎり', kcal:185 },
    { name:'十六穀おにぎり', kcal:190 },
    { name:'そば(つゆ控えめ)', kcal:220 },
    { name:'味噌汁(具だくさん)', kcal:90 },
  ];
  const extras = [
    { name:'ヨーグルト(無糖小)', kcal:60 },
    { name:'豆乳(無調整小)', kcal:80 },
    { name:'チーズ(低脂肪個包装)', kcal:60 },
    { name:'枝豆(小)', kcal:90 },
  ];
  const combos = [];
  mains.forEach(m=>{
    carbs.forEach(c=>{
      const base = baseA.kcal + baseB.kcal + m.kcal + c.kcal; // 必須2品 + 主菜 + 炭水化物
      if(base>=400 && base<=450){
        combos.push({ items:[baseA.name, baseB.name, c.name, m.name], kcal: base });
      } else {
        // 余白で小さい副菜を加えて調整
        extras.forEach(e=>{
          const cal = base + e.kcal;
          if(cal>=400 && cal<=450){
            combos.push({ items:[baseA.name, baseB.name, c.name, m.name, e.name], kcal: cal });
          }
        })
      }
    })
  });
  // 重複排除＆30件以上確保
  const seen = new Set();
  const uniq = combos.filter(x=>{ const key=x.items.join('|'); if(seen.has(key)) return false; seen.add(key); return true; });
  // 足りなければ、主菜+汁物で構成
  if(uniq.length<30){
    mains.forEach(m=>{
      const cal = baseA.kcal + baseB.kcal + m.kcal + 90; // 具だくさん味噌汁想定
      if(cal>=400 && cal<=450){ uniq.push({ items:[baseA.name, baseB.name, '味噌汁(具だくさん)', m.name], kcal: cal }); }
    });
  }
  return uniq.slice(0, 40).sort(()=>Math.random()-0.5);
}
const sevenCombos = buildSevenCombos();
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
  const delta = calcPrevDelta(today, val);
  setWeightStatus(statusWithDelta(`保存しました：${val.toFixed(1)} kg`, delta));
  renderCalendar();
}
function setWeightStatus(t){ document.getElementById('weightStatus').textContent = t }
function loadTodayWeight(){
  const today = ymd();
  const v = storage.get(`weight:${today}`, null);
  if(v!=null){
    document.getElementById('weightInput').value = v;
    const delta = calcPrevDelta(today, v);
    setWeightStatus(statusWithDelta(`本日の体重：${v.toFixed(1)} kg`, delta));
  }
}

// 前日比計算
function yesterdayStr(dateStr){
  const d = new Date(dateStr); d.setDate(d.getDate()-1); return ymd(d);
}
function calcPrevDelta(todayStr, todayVal){
  const yStr = yesterdayStr(todayStr);
  const prev = storage.get(`weight:${yStr}`, null);
  if(prev==null) return null;
  return parseFloat((todayVal - prev).toFixed(1));
}
function statusWithDelta(base, delta){
  if(delta==null) return base + '（前日データなし）';
  const sign = delta>0 ? '+' : '';
  return `${base}（前日比 ${sign}${delta.toFixed(1)} kg）`;
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
  // Theme init
  const root = document.documentElement;
  const savedTheme = storage.get('theme', null);
  const initial = savedTheme || 'light';
  if(initial === 'light') root.setAttribute('data-theme', 'light');
  const themeBtn = document.getElementById('themeToggle');
  if(themeBtn){
    const applyAria = () => themeBtn.setAttribute('aria-pressed', root.getAttribute('data-theme') === 'light' ? 'true' : 'false');
    applyAria();
    themeBtn.addEventListener('click', ()=>{
      const isLight = root.getAttribute('data-theme') === 'light';
      if(isLight){
        root.removeAttribute('data-theme');
        storage.set('theme', 'dark');
      } else {
        root.setAttribute('data-theme', 'light');
        storage.set('theme', 'light');
      }
      applyAria();
    });
  }

  setQuote();
  document.getElementById('btnNewQuote').addEventListener('click', ()=> setQuote(true));

  setupChecklist();

  renderDinner();
  document.getElementById('btnNextDinner').addEventListener('click', ()=>{
    const today = ymd();
    const cur = storage.get(`dinnerIndex:${today}`, 0);
    const len = getDinnerPool().length || 1;
    renderDinner((cur+1) % len);
  });
  // dinner tags
  const tagBtns = document.querySelectorAll('#dinner .tag-btn');
  tagBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      tagBtns.forEach(b=>{ b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('active'); btn.setAttribute('aria-selected','true');
      setCurrentTag(btn.dataset.tag);
      // reset index to 0 for the new tag
      storage.set(`dinnerIndex:${ymd()}`, 0);
      renderDinner(0);
    });
  });
  // initialize tag UI from storage
  const currentTag = getCurrentTag();
  tagBtns.forEach(b=>{ if(b.dataset.tag===currentTag){ b.classList.add('active'); b.setAttribute('aria-selected','true'); } else { b.classList.remove('active'); b.setAttribute('aria-selected','false'); } });

  // recipe details toggle
  const btnDetails = document.getElementById('btnRecipeDetails');
  const detailsBox = document.getElementById('recipeDetails');
  if(btnDetails){
    btnDetails.addEventListener('click', ()=>{
      const hidden = detailsBox.hasAttribute('hidden');
      if(hidden) detailsBox.removeAttribute('hidden'); else detailsBox.setAttribute('hidden','');
    });
  }

  // ingredient search
  const inpIng = document.getElementById('ingredientInput');
  const btnIng = document.getElementById('btnSearchIngredient');
  const resIng = document.getElementById('ingredientResults');
  function searchByIngredients(q){
    const words = q.split(/[\s,、\/]+/).map(s=>s.trim()).filter(Boolean);
    if(words.length===0){ resIng.textContent = '食材名を入力してください。'; return; }
    const pool = baseDinnerPool; // 全体から検索
    const scored = pool.map((d, idx)=>{
      const text = `${d.title} ${d.desc}`;
      let score = 0;
      words.forEach(w=>{ if(text.includes(w)) score+=2; if((d.tags||[]).some(t=>t.includes(w))) score+=1; });
      return {d, idx, score};
    }).filter(x=>x.score>0).sort((a,b)=> b.score - a.score).slice(0,10);
    if(scored.length===0){ resIng.textContent = '該当するメニューが見つかりませんでした。'; return; }
    // render list with select buttons
    resIng.innerHTML = scored.map((x,i)=>`<div class="result-item"><span>${x.d.title}</span> <button data-i="${x.idx}" class="btn small">選ぶ</button></div>`).join('');
    resIng.querySelectorAll('button').forEach(b=>{
      b.addEventListener('click', ()=>{
        // set dinnerIndex to the found item's index within current filtered pool
        const today = ymd();
        const indexInPool = baseDinnerPool.findIndex(it=> it.title === scored.find(s=> s.idx==b.dataset.i).d.title);
        storage.set(`dinnerIndex:${today}`, indexInPool>=0? indexInPool : 0);
        setCurrentTag('all');
        document.querySelectorAll('#dinner .tag-btn').forEach(tb=>{
          tb.classList.toggle('active', tb.dataset.tag==='all');
          tb.setAttribute('aria-selected', tb.dataset.tag==='all' ? 'true':'false');
        });
        renderDinner(indexInPool);
      });
    });
  }
  if(btnIng && inpIng){
    btnIng.addEventListener('click', ()=> searchByIngredients(inpIng.value));
    inpIng.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ searchByIngredients(inpIng.value) } });
  }

  renderSeven();
  document.getElementById('btnNextSeven').addEventListener('click', ()=>{
    const cur = storage.get('sevenIndex', 0);
    renderSeven(cur+1);
  });

  loadTodayWeight();
  document.getElementById('btnSaveWeight').addEventListener('click', saveWeight);

  // 身長・年齢 入力と表示
  const heightInput = document.getElementById('heightInput');
  const ageInput = document.getElementById('ageInput');
  const idealBox = document.getElementById('idealInfo');
  const goalInput = document.getElementById('goalInput');
  const goalDiff = document.getElementById('goalDiff');
  const progressBar = document.getElementById('progressBar');
  const chartCanvas = document.getElementById('weightChart');
  function saveProfile(){
    const h = parseFloat(heightInput.value);
    const a = parseInt(ageInput.value, 10);
    if(!isNaN(h)) storage.set('profile:height_cm', h);
    if(!isNaN(a)) storage.set('profile:age', a);
    renderIdeal();
    renderBMI();
    updateGoalUI();
  }
  function renderIdeal(){
    const h = parseFloat(heightInput.value || storage.get('profile:height_cm', ''));
    const a = parseInt(ageInput.value || storage.get('profile:age', ''), 10);
    if(!isNaN(h)){
      const m = h / 100;
      const std = 22 * m * m; // 標準体重（BMI22）
      const beauty = 20 * m * m; // 美容体重（BMI20）
      const ageTxt = !isNaN(a) ? `・年齢 ${a}歳` : '';
      const bmiTxt = renderBMI(true);
      idealBox.textContent = `身長 ${h.toFixed(1)} cm${ageTxt}｜標準 ${std.toFixed(1)} kg／美容 ${beauty.toFixed(1)} kg${bmiTxt ? ' ｜ ' + bmiTxt : ''}`;
    } else {
      idealBox.textContent = '';
    }
  }
  function currentWeight(){
    const v = storage.get(`weight:${ymd()}`, null);
    return typeof v === 'number' ? v : null;
  }
  function renderBMI(returnText=false){
    const h = parseFloat(heightInput.value || storage.get('profile:height_cm', ''));
    const w = currentWeight();
    if(isNaN(h) || w==null) return returnText ? '' : undefined;
    const m = h/100; const bmi = w/(m*m);
    const txt = `BMI ${bmi.toFixed(1)}`;
    if(returnText) return txt; else { return; }
  }

  // 目標体重
  function saveGoal(){
    const g = parseFloat(goalInput.value);
    if(!isNaN(g)) storage.set('profile:goal_kg', g);
    updateGoalUI();
  }
  function earliestWeight(){
    // localStorageから最古のweightを探索
    let earliestDate = null; let val = null;
    for(let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if(k && k.startsWith('weight:')){
        const dateStr = k.split(':')[1];
        if(!earliestDate || dateStr < earliestDate){ earliestDate = dateStr; val = storage.get(k, null); }
      }
    }
    return typeof val === 'number' ? val : null;
  }
  function updateGoalUI(){
    const g = parseFloat(goalInput.value || storage.get('profile:goal_kg', ''));
    const w = currentWeight();
    if(!isNaN(g)){
      storage.set('profile:goal_kg', g);
      if(w!=null){
        const diff = parseFloat((w - g).toFixed(1));
        goalDiff.textContent = `目標まで ${diff>0? diff.toFixed(1)+' kg': diff.toFixed(1)+' kg'}${diff>0?' 減':' 増'}`;
      } else {
        goalDiff.textContent = '';
      }
    } else {
      goalDiff.textContent = '';
    }
    // 進捗バー
    const start = earliestWeight();
    const goal = isNaN(g) ? null : g;
    if(start!=null && goal!=null && w!=null){
      let total = Math.abs(start - goal);
      let done = Math.abs(start - w);
      let pct = total === 0 ? 1 : Math.min(1, done / total);
      progressBar.style.width = `${(pct*100).toFixed(0)}%`;
      progressBar.setAttribute('aria-valuenow', (pct*100).toFixed(0));
    } else {
      progressBar.style.width = '0%';
      progressBar.removeAttribute('aria-valuenow');
    }
  }

  // グラフ描画（直近30日）
  function listRecentWeights(days=30){
    const today = new Date();
    const data = [];
    for(let i=days-1;i>=0;i--){
      const d = new Date(today); d.setDate(d.getDate()-i);
      const key = `weight:${ymd(d)}`;
      const v = storage.get(key, null);
      data.push({ d, v });
    }
    return data;
  }
  function drawChart(){
    if(!chartCanvas) return;
    const ctx = chartCanvas.getContext('2d');
    const W = chartCanvas.width, H = chartCanvas.height;
    ctx.clearRect(0,0,W,H);
    const data = listRecentWeights(30);
    const values = data.map(p=>p.v).filter(v=>typeof v==='number');
    if(values.length < 2){
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText('データが少ないため、グラフは表示できません。', 10, H/2);
      return;
    }
    const min = Math.min(...values) - 0.5;
    const max = Math.max(...values) + 0.5;
    const px = i => 20 + (W-40) * (i/(data.length-1));
    const py = v => H-20 - (H-40) * ((v-min)/(max-min));
    // grid
    ctx.strokeStyle = 'rgba(255,255,255,.12)';
    for(let y=0;y<5;y++){
      const yy = 20 + (H-40)* (y/4);
      ctx.beginPath(); ctx.moveTo(20, yy); ctx.lineTo(W-20, yy); ctx.stroke();
    }
    // line
    ctx.beginPath();
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2;
    data.forEach((p, i)=>{
      if(typeof p.v !== 'number') return;
      const x = px(i), y = py(p.v);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();
    // points
    ctx.fillStyle = '#f06292';
    data.forEach((p, i)=>{
      if(typeof p.v !== 'number') return;
      const x = px(i), y = py(p.v);
      ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2); ctx.fill();
    });
  }
  if(heightInput && ageInput){
    // 初期値ロード
    const hSaved = storage.get('profile:height_cm', null);
    const aSaved = storage.get('profile:age', null);
    if(hSaved!=null) heightInput.value = hSaved;
    if(aSaved!=null) ageInput.value = aSaved;
    renderIdeal();
    renderBMI();
    heightInput.addEventListener('input', saveProfile);
    ageInput.addEventListener('input', saveProfile);
  }
  if(goalInput){
    const gSaved = storage.get('profile:goal_kg', null);
    if(gSaved!=null) goalInput.value = gSaved;
    updateGoalUI();
    goalInput.addEventListener('input', saveGoal);
  }

  drawChart();

  renderCalendar();
  document.getElementById('prevMonth').addEventListener('click', ()=>{ calRef.setMonth(calRef.getMonth()-1); renderCalendar(); });
  document.getElementById('nextMonth').addEventListener('click', ()=>{ calRef.setMonth(calRef.getMonth()+1); renderCalendar(); });
});
