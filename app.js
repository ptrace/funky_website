(async function(){
  // Load all strings from external JSON (no Hebrew embedded here)
  const res = await fetch('strings.json', { cache: 'no-cache' });
  const STR = await res.json();

  const headline = document.getElementById('headline');
  const subline  = document.getElementById('subline');
  const askBtn   = document.getElementById('askBtn');
  const bgAudio = document.getElementById('bgAudio');

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

    // Try to autoplay background audio
  bgAudio.play().catch(() => {
    // If autoplay is blocked, wait for the first click anywhere
    const enableAudio = () => {
      bgAudio.play();
      document.removeEventListener('click', enableAudio);
    };
    document.addEventListener('click', enableAudio);
  });

  // Confetti generator (rainbow pieces)
  // function burstConfetti(){
  //   const n = 800;
  //   const hues = [0, 25, 52, 130, 230, 280]; // red, orange, yellow, green, blue, purple
  //   for(let i=0;i<n;i++){
  //     const el = document.createElement('div');
  //     el.className = 'piece';
  //     const x = Math.random() * window.innerWidth;
  //     console.log(`x is ${x}`)
  //     const rot = Math.floor(Math.random() * 360);
  //     const hue = hues[Math.floor(Math.random()*hues.length)];
  //     const dur = (Math.random() * 1200 + 1800) + 'ms';
  //     el.style.setProperty('--x', x+'px');
  //     el.style.setProperty('--rot', rot+'deg');
  //     el.style.setProperty('--dur', dur);
  //     el.style.background = `hsl(${hue}deg 90% 55%)`;
  //     el.style.borderRadius = Math.random()>.5 ? '2px' : '50%';
  //     fx.appendChild(el);
  //     // cleanup
  //     setTimeout(() => el.remove(), 2600);
  //   }
  // }
function burstConfetti() {
  const n = 100; // keep if your device can handle it
  const hues = [0, 25, 52, 130, 230, 280];
  const W = window.innerWidth;
  const centerX = W / 2;
  const halfSpread = W * 0.4; // covers ~80% of the screen centered

  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'piece';

    // centered X with clamp to keep on-screen
    let x = centerX + (Math.random() - 0.5) * 2 * halfSpread;
    x = Math.max(0, Math.min(W - 10, x)); // 10 = piece width to avoid overflow

    const rot = Math.floor(Math.random() * 360);
    const hue = hues[Math.floor(Math.random() * hues.length)];
    const dur = (Math.random() * 1200 + 1800) + 'ms';

    el.style.setProperty('--x', x + 'px');
    el.style.setProperty('--rot', rot + 'deg');
    el.style.setProperty('--dur', dur);
    el.style.background = `hsl(${hue}deg 90% 55%)`;
    el.style.borderRadius = Math.random() > 0.5 ? '2px' : '50%';

    fx.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
}
  // Kick things off
  scheduleNextQuestion();
})();
