(async function(){
  // Load all strings from external JSON (no Hebrew embedded here)
  const res = await fetch('strings.json', { cache: 'no-cache' });
  const STR = await res.json();

  const headline = document.getElementById('headline');
  const subline  = document.getElementById('subline');
  const askBtn   = document.getElementById('askBtn');

  const dialog   = document.getElementById('qDialog');
  const overlay  = document.getElementById('qOverlay');
  const qText    = document.getElementById('qText');
  const btnYes   = document.getElementById('btnYes');
  const btnNo    = document.getElementById('btnNo');
  const fx       = document.getElementById('fx');
  const footerLink = document.getElementById('footerLink');

  // Seed UI texts from JSON
  askBtn.textContent = STR.ui.askButton;
  btnYes.textContent = STR.ui.yes;
  btnNo.textContent  = STR.ui.no;
  subline.textContent = STR.ui.subline;

  footerLink.textContent = STR.footer.text;
  footerLink.href = `mailto:${STR.footer.email}`;

  // Alternate headline text
  const headlines = STR.headlines.slice(); // e.g., ["8 גברים", "200 הומואים"]
  let h = 0;
  function setHeadline(text){
    headline.textContent = text;
    headline.setAttribute('aria-label', text);
  }
  setHeadline(headlines[h]);
  setInterval(() => {
    h = (h + 1) % headlines.length;
    setHeadline(headlines[h]);
  }, STR.timing.headlineMs);

  // Question popup logic
  function showQuestion(q){
    qText.textContent = q;
    overlay.classList.add('show');
    dialog.showModal();
  }
  function hideQuestion(){
    dialog.close();
    overlay.classList.remove('show');
  }

  // Randomly surface a question at intervals
  function randomBetween(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
  function scheduleNextQuestion(){
    const wait = randomBetween(STR.timing.minQuestionMs, STR.timing.maxQuestionMs);
    window.setTimeout(() => {
      const q = STR.questions[Math.floor(Math.random() * STR.questions.length)];
      showQuestion(q);
    }, wait);
  }

  // Manual trigger
  askBtn.addEventListener('click', () => {
    const q = STR.questions[Math.floor(Math.random() * STR.questions.length)];
    showQuestion(q);
  });

  // Button handlers -> response + rainbow confetti
  function respond(type){
    hideQuestion();
    // Small response under headline
    subline.textContent = (type === 'yes')
      ? STR.responses.yes[Math.floor(Math.random() * STR.responses.yes.length)]
      : STR.responses.no[Math.floor(Math.random() * STR.responses.no.length)];
    burstConfetti();
    scheduleNextQuestion();
  }
  btnYes.addEventListener('click', () => respond('yes'));
  btnNo.addEventListener('click',  () => respond('no'));
  overlay.addEventListener('click', hideQuestion);

  // Confetti generator (rainbow pieces)
  function burstConfetti(){
    const n = 80;
    const hues = [0, 25, 52, 130, 230, 280]; // red, orange, yellow, green, blue, purple
    for(let i=0;i<n;i++){
      const el = document.createElement('div');
      el.className = 'piece';
      const x = Math.random() * window.innerWidth;
      const rot = Math.floor(Math.random() * 360);
      const hue = hues[Math.floor(Math.random()*hues.length)];
      const dur = (Math.random() * 1200 + 1800) + 'ms';
      el.style.setProperty('--x', x+'px');
      el.style.setProperty('--rot', rot+'deg');
      el.style.setProperty('--dur', dur);
      el.style.background = `hsl(${hue}deg 90% 55%)`;
      el.style.borderRadius = Math.random()>.5 ? '2px' : '50%';
      fx.appendChild(el);
      // cleanup
      setTimeout(() => el.remove(), 2600);
    }
  }

  // Kick things off
  scheduleNextQuestion();
})();
