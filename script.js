// ============ OPERATORS ============
const OPERATORS = {
  jio:    { name: 'Jio',    color: '#1E40AF' },
  airtel: { name: 'Airtel', color: '#DC2626' },
  vi:     { name: 'Vi',     color: '#7C3AED' },
  bsnl:   { name: 'BSNL',   color: '#059669' },
};

// ============ PLAN DATA ============
const PLANS = [
  { id:'j1', op:'jio', price:199, validity:'28 days', data:'1.5GB/day', calls:'Unlimited', sms:'100/day', tag:'Popular' },
  { id:'j2', op:'jio', price:299, validity:'28 days', data:'2GB/day', calls:'Unlimited', sms:'100/day' },
  { id:'j3', op:'jio', price:479, validity:'56 days', data:'2GB/day', calls:'Unlimited', sms:'100/day', tag:'Best Value' },
  { id:'a1', op:'airtel', price:239, validity:'28 days', data:'1.5GB/day', calls:'Unlimited', sms:'100/day' },
  { id:'a2', op:'airtel', price:319, validity:'28 days', data:'2.5GB/day', calls:'Unlimited', sms:'100/day', tag:'Popular' },
  { id:'a3', op:'airtel', price:499, validity:'56 days', data:'2GB/day', calls:'Unlimited', sms:'100/day' },
  { id:'v1', op:'vi', price:219, validity:'28 days', data:'1.5GB/day', calls:'Unlimited', sms:'100/day' },
  { id:'v2', op:'vi', price:289, validity:'28 days', data:'2GB/day', calls:'Unlimited', sms:'100/day' },
  { id:'v3', op:'vi', price:459, validity:'56 days', data:'1.5GB/day', calls:'Unlimited', sms:'100/day', tag:'Best Value' },
  { id:'b1', op:'bsnl', price:187, validity:'28 days', data:'2GB/day', calls:'Unlimited', sms:'100/day', tag:'Popular' },
  { id:'b2', op:'bsnl', price:247, validity:'30 days', data:'2GB/day', calls:'Unlimited', sms:'100/day' },
  { id:'b3', op:'bsnl', price:397, validity:'65 days', data:'2GB/day', calls:'Unlimited', sms:'100/day', tag:'Best Value' },
];

// ============ STATE ============
let history = JSON.parse(localStorage.getItem('jyoti_recharges') || '[]');
let activeOp = 'all';
let searchTerm = '';
let selectedOperator = 'jio';

// ============ ELEMENTS ============
const planGrid = document.getElementById('planGrid');
const opTabs = document.getElementById('opTabs');
const searchInput = document.getElementById('searchInput');
const histCount = document.getElementById('histCount');
const histItems = document.getElementById('histItems');
const histEmpty = document.getElementById('histEmpty');
const histDrawer = document.getElementById('histDrawer');
const histOverlay = document.getElementById('histOverlay');
const toastEl = document.getElementById('toast');

const operatorPicker = document.getElementById('operatorPicker');
const mobileNumberInput = document.getElementById('mobileNumber');
const amountInput = document.getElementById('amountInput');
const numberError = document.getElementById('numberError');
const amountError = document.getElementById('amountError');
const rechargeForm = document.getElementById('rechargeForm');
const rechargeSuccess = document.getElementById('rechargeSuccess');
const rechargeBtn = document.getElementById('rechargeBtn');

// ============ RENDER PLANS ============
function renderPlans(){
  const term = searchTerm.trim().toLowerCase();
  const list = PLANS.filter(p=>{
    const matchesOp = activeOp === 'all' || p.op === activeOp;
    const haystack = `${OPERATORS[p.op].name} ${p.price} ${p.data} ${p.validity}`.toLowerCase();
    const matchesSearch = !term || haystack.includes(term);
    return matchesOp && matchesSearch;
  });

  if(list.length === 0){
    planGrid.innerHTML = `<p class="no-results">Koi plan nahi mila — kuch aur try karo.</p>`;
    return;
  }

  planGrid.innerHTML = list.map(p=>{
    const op = OPERATORS[p.op];
    return `
      <div class="plan-card">
        ${p.tag ? `<span class="plan-tag">${p.tag}</span>` : ''}
        <div class="plan-op">
          <span class="plan-op-badge" style="background:${op.color}">${op.name[0]}</span>
          ${op.name}
        </div>
        <div class="plan-price">₹${p.price}</div>
        <ul class="plan-specs">
          <li>Validity: <strong>${p.validity}</strong></li>
          <li>Data: <strong>${p.data}</strong></li>
          <li>Calls: <strong>${p.calls}</strong></li>
          <li>SMS: <strong>${p.sms}</strong></li>
        </ul>
        <button class="plan-recharge-btn" data-id="${p.id}">Recharge</button>
      </div>`;
  }).join('');
}

planGrid.addEventListener('click', (e)=>{
  const btn = e.target.closest('.plan-recharge-btn');
  if(!btn) return;
  const plan = PLANS.find(p=>p.id === btn.dataset.id);
  if(!plan) return;

  // pre-fill the hero widget with this plan's operator + amount
  selectedOperator = plan.op;
  [...operatorPicker.children].forEach(b=> b.classList.toggle('active', b.dataset.op === plan.op));
  amountInput.value = plan.price;

  document.getElementById('recharge').scrollIntoView({ behavior:'smooth', block:'start' });
  if(!mobileNumberInput.value){
    setTimeout(()=> mobileNumberInput.focus(), 400);
    showToast('Enter your mobile number to continue');
  } else {
    showToast(`${OPERATORS[plan.op].name} ₹${plan.price} selected`);
  }
});

// ============ OPERATOR TABS (plans section) ============
opTabs.addEventListener('click', (e)=>{
  const btn = e.target.closest('.op-tab');
  if(!btn) return;
  activeOp = btn.dataset.op;
  [...opTabs.children].forEach(b=> b.classList.toggle('active', b === btn));
  renderPlans();
});

// ============ SEARCH ============
searchInput.addEventListener('input', (e)=>{
  searchTerm = e.target.value;
  renderPlans();
  if(searchTerm.trim()){
    document.getElementById('plans').scrollIntoView({ behavior:'smooth', block:'start' });
  }
});

// ============ OPERATOR PICKER (hero widget) ============
operatorPicker.addEventListener('click', (e)=>{
  const btn = e.target.closest('.op-btn');
  if(!btn) return;
  selectedOperator = btn.dataset.op;
  [...operatorPicker.children].forEach(b=> b.classList.toggle('active', b === btn));
});

// ============ MOBILE NUMBER — digits only ============
mobileNumberInput.addEventListener('input', ()=>{
  mobileNumberInput.value = mobileNumberInput.value.replace(/\D/g,'').slice(0,10);
  numberError.textContent = '';
});

// ============ RECHARGE SUBMIT ============
rechargeBtn.addEventListener('click', ()=>{
  const number = mobileNumberInput.value.trim();
  const amount = parseInt(amountInput.value, 10);
  let valid = true;

  if(!/^[6-9]\d{9}$/.test(number)){
    numberError.textContent = 'Enter a valid 10-digit mobile number.';
    valid = false;
  } else {
    numberError.textContent = '';
  }

  if(!amount || amount < 10){
    amountError.textContent = 'Enter a valid recharge amount.';
    valid = false;
  } else {
    amountError.textContent = '';
  }

  if(!valid) return;

  const op = OPERATORS[selectedOperator];
  const matchedPlan = PLANS.find(p=> p.op === selectedOperator && p.price === amount);
  const txnId = 'JS' + Date.now().toString().slice(-8) + Math.floor(Math.random()*90+10);
  const maskedNumber = number.slice(0,2) + 'XXXXX' + number.slice(7);
  const now = new Date();

  const record = {
    txnId,
    operator: op.name,
    number: maskedNumber,
    amount,
    validity: matchedPlan ? matchedPlan.validity : '28 days',
    data: matchedPlan ? matchedPlan.data : 'Talktime added',
    date: now.toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }),
  };

  history.unshift(record);
  localStorage.setItem('jyoti_recharges', JSON.stringify(history));
  renderHistory();

  document.getElementById('rsOperator').textContent = record.operator;
  document.getElementById('rsNumber').textContent = record.number;
  document.getElementById('rsAmount').textContent = `₹${record.amount}`;
  document.getElementById('rsValidity').textContent = record.validity;
  document.getElementById('rsData').textContent = record.data;
  document.getElementById('rsTxn').textContent = record.txnId;

  rechargeForm.hidden = true;
  rechargeSuccess.hidden = false;
  showToast('Recharge successful!');
});

document.getElementById('newRechargeBtn').addEventListener('click', ()=>{
  rechargeForm.hidden = false;
  rechargeSuccess.hidden = true;
  mobileNumberInput.value = '';
  amountInput.value = '';
});

// ============ BILL PAY GRID ============
document.querySelector('.bill-grid').addEventListener('click', (e)=>{
  const card = e.target.closest('.bill-card');
  if(!card) return;
  if(card.dataset.live === 'true'){
    document.querySelector(card.dataset.target).scrollIntoView({ behavior:'smooth', block:'start' });
  } else {
    showToast('This service is launching soon!');
  }
});

// ============ HISTORY DRAWER ============
function renderHistory(){
  histCount.textContent = history.length;

  if(history.length === 0){
    histItems.innerHTML = '';
    histItems.appendChild(histEmpty);
    histEmpty.style.display = 'block';
    return;
  }
  histEmpty.style.display = 'none';

  histItems.innerHTML = history.map(r=>{
    const color = Object.values(OPERATORS).find(o=>o.name === r.operator)?.color || '#171B36';
    return `
      <div class="hist-line">
        <div class="hist-line-badge" style="background:${color}">${r.operator[0]}</div>
        <div class="hist-line-info">
          <h5>${r.operator} • ${r.number}</h5>
          <small>${r.date} · ${r.validity}</small>
        </div>
        <span class="hist-line-amount">₹${r.amount}</span>
      </div>`;
  }).join('');
}

const histToggle = document.getElementById('histToggle');
const histClose = document.getElementById('histClose');
function openHist(){ histDrawer.classList.add('open'); histOverlay.classList.add('show'); }
function closeHist(){ histDrawer.classList.remove('open'); histOverlay.classList.remove('show'); }
histToggle.addEventListener('click', openHist);
histClose.addEventListener('click', closeHist);
histOverlay.addEventListener('click', closeHist);
document.getElementById('histClear').addEventListener('click', ()=>{
  history = [];
  localStorage.setItem('jyoti_recharges', '[]');
  renderHistory();
  showToast('History cleared');
});

// ============ TOAST ============
let toastTimer;
function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toastEl.classList.remove('show'), 2400);
}

// ============ MOBILE NAV ============
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mainNav = document.getElementById('mainNav');
hamburgerBtn.addEventListener('click', ()=>{
  const isOpen = mainNav.classList.toggle('mobile-open');
  hamburgerBtn.classList.toggle('open', isOpen);
  hamburgerBtn.setAttribute('aria-expanded', isOpen);
});
mainNav.addEventListener('click', (e)=>{
  if(e.target.tagName === 'A'){
    mainNav.classList.remove('mobile-open');
    hamburgerBtn.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }
});

// ============ STICKY HEADER SHADOW + BACK TO TOP ============
const siteHeader = document.getElementById('siteHeader');
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', ()=>{
  siteHeader.classList.toggle('scrolled', window.scrollY > 12);
  backToTop.classList.toggle('show', window.scrollY > 500);
});
backToTop.addEventListener('click', ()=> window.scrollTo({ top:0, behavior:'smooth' }));

// ============ OFFERS TICKER (duplicate content for seamless loop) ============
const tickerTrack = document.getElementById('tickerTrack');
tickerTrack.innerHTML += tickerTrack.innerHTML;

// ============ TESTIMONIAL SLIDER ============
const reviewTrack = document.getElementById('reviewTrack');
const reviewChits = reviewTrack.children;
const reviewDots = document.getElementById('reviewDots');
let reviewIndex = 0;
let reviewTimer;

for(let i=0; i<reviewChits.length; i++){
  const dot = document.createElement('button');
  if(i === 0) dot.classList.add('active');
  dot.addEventListener('click', ()=> goToReview(i));
  reviewDots.appendChild(dot);
}

function goToReview(i){
  reviewIndex = (i + reviewChits.length) % reviewChits.length;
  reviewTrack.style.transform = `translateX(-${reviewIndex * 100}%)`;
  [...reviewDots.children].forEach((d,idx)=> d.classList.toggle('active', idx === reviewIndex));
}

document.getElementById('reviewPrev').addEventListener('click', ()=>{ goToReview(reviewIndex - 1); resetAutoplay(); });
document.getElementById('reviewNext').addEventListener('click', ()=>{ goToReview(reviewIndex + 1); resetAutoplay(); });

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function startAutoplay(){
  if(prefersReducedMotion) return;
  reviewTimer = setInterval(()=> goToReview(reviewIndex + 1), 5000);
}
function resetAutoplay(){
  clearInterval(reviewTimer);
  startAutoplay();
}
startAutoplay();

// ============ FAQ ACCORDION ============
document.querySelectorAll('.faq-item').forEach(item=>{
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  q.addEventListener('click', ()=>{
    const isOpen = item.classList.contains('open');
    item.classList.toggle('open', !isOpen);
    a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : 0;
  });
});

// ============ NOTIFY FORM ============
const notifyForm = document.getElementById('notifyForm');
const notifyMsg = document.getElementById('notifyMsg');
notifyForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const email = document.getElementById('notifyEmail').value.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if(!isValid){
    notifyMsg.textContent = 'Please enter a valid email address.';
    notifyMsg.style.color = 'var(--dusk)';
    return;
  }
  notifyMsg.textContent = `Thanks! We'll notify ${email} at launch.`;
  notifyMsg.style.color = 'var(--dusk)';
  notifyForm.reset();
});

// ============ FOOTER YEAR ============
document.getElementById('year').textContent = new Date().getFullYear();

// ============ INIT ============
renderPlans();
renderHistory();
