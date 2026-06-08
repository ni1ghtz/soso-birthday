/* ============================================================
   BIRTHDAY WEBSITE — script.js
   ============================================================ */

/* ---------- 1. INTRO / GIFT BOX ---------- */
const introScreen = document.getElementById('intro-screen');
const mainContent = document.getElementById('main-content');

introScreen.addEventListener('click', openSurprise);

function openSurprise() {
  introScreen.classList.add('fade-out');
  setTimeout(() => {
    introScreen.style.display = 'none';
    mainContent.classList.remove('hidden');
    startConfetti();
    initScrollReveal();
    playMusic();
  }, 800);
}

/* ---------- 2. SCROLL REVEAL ---------- */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => observer.observe(el));
}

/* ---------- 3. CONFETTI ---------- */
const canvas  = document.getElementById('confetti-canvas');
const ctx     = canvas.getContext('2d');
let particles = [];
let animating = false;

const COLORS = ['#ff6b8a','#c678dd','#f7c59f','#ffe066','#ff9f7f','#ffffff','#ffc2d4'];
const EMOJIS = ['💖','💕','🌸','✨','🎉','🎊','💝'];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function spawnConfetti(count = 120) {
  for (let i = 0; i < count; i++) {
    const isEmoji = Math.random() < 0.2;
    particles.push({
      x:     randomBetween(0, canvas.width),
      y:     randomBetween(-100, -20),
      vx:    randomBetween(-2, 2),
      vy:    randomBetween(2, 6),
      size:  randomBetween(6, 16),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      emoji: isEmoji ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : null,
      rot:   randomBetween(0, Math.PI * 2),
      rotV:  randomBetween(-0.08, 0.08),
      life:  1,
      decay: randomBetween(0.004, 0.009),
    });
  }
}

function drawParticle(p) {
  ctx.save();
  ctx.globalAlpha = p.life;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  if (p.emoji) {
    ctx.font = `${p.size * 1.5}px serif`;
    ctx.fillText(p.emoji, -p.size / 2, p.size / 2);
  } else {
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
  }
  ctx.restore();
}

function animateConfetti() {
  if (!animating) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x   += p.vx;
    p.y   += p.vy;
    p.rot += p.rotV;
    p.vy  += 0.05; // gravity
    p.life -= p.decay;
    drawParticle(p);
  });
  particles = particles.filter(p => p.life > 0 && p.y < canvas.height + 50);
  if (particles.length === 0 && animating) {
    animating = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    requestAnimationFrame(animateConfetti);
  }
}

function startConfetti() {
  animating = true;
  const isMobile = window.innerWidth <= 768;
  spawnConfetti(isMobile ? 60 : 200);
  animateConfetti();

  // Extra bursts
  setTimeout(() => { spawnConfetti(isMobile ? 30 : 100); }, 800);
  setTimeout(() => { spawnConfetti(isMobile ? 20 : 80);  }, 1600);
}

/* ---------- 4. CANDLE BLOWING ---------- */
let blownCount = 0;
const totalCandles = document.querySelectorAll('.candle').length;

function blowCandle(candle) {
  if (candle.classList.contains('blown')) return;
  candle.classList.add('blown');
  blownCount++;

  // mini confetti burst
  spawnConfetti(30);
  if (!animating) { animating = true; animateConfetti(); }

  if (blownCount === totalCandles) {
    document.getElementById('candle-hint').textContent = '🌟 Your wish is on its way! Happy Birthday SOSO! 🎂✨';
    setTimeout(() => { startConfetti(); }, 400);
  }
}

/* ---------- 5. AMBIENT MUSIC ---------- */
// Creates a gentle chord using Web Audio API (no file needed — works offline)
let audioCtx = null;

function playMusic() {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    playAmbientChord();
  } catch(e) { /* audio not supported */ }
}

function playNote(freq, startTime, duration, vol = 0.06) {
  if (!audioCtx) return;
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.4);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function playAmbientChord() {
  if (!audioCtx) return;
  // Soft romantic chord progression — C maj → A min → F maj → G maj
  const chords = [
    [261.63, 329.63, 392.00], // C major
    [220.00, 261.63, 329.63], // A minor
    [174.61, 220.00, 261.63], // F major
    [196.00, 246.94, 293.66], // G major
  ];

  let t = audioCtx.currentTime + 0.5;
  chords.forEach(chord => {
    chord.forEach(freq => playNote(freq, t, 3.5, 0.05));
    t += 3.8;
  });

  // Loop every ~16s
  setTimeout(playAmbientChord, 15500);
}

/* ---------- 6. MUSIC TOGGLE BUTTON (floating) ---------- */
const musicBtn = document.createElement('button');
musicBtn.id        = 'music-btn';
musicBtn.innerHTML = '🎵';
musicBtn.title     = 'Toggle Music';
musicBtn.style.cssText = `
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(255,107,138,0.6);
  background: rgba(13,8,20,0.8);
  color: white;
  font-size: 1.3rem;
  cursor: pointer;
  z-index: 8000;
  backdrop-filter: blur(10px);
  transition: transform 0.3s, box-shadow 0.3s;
  display: none;
`;
musicBtn.addEventListener('mouseenter', () => {
  musicBtn.style.transform  = 'scale(1.15)';
  musicBtn.style.boxShadow  = '0 0 20px rgba(255,107,138,0.5)';
});
musicBtn.addEventListener('mouseleave', () => {
  musicBtn.style.transform  = 'scale(1)';
  musicBtn.style.boxShadow  = 'none';
});

let musicMuted = false;
musicBtn.addEventListener('click', () => {
  if (!audioCtx) return;
  if (musicMuted) {
    audioCtx.resume();
    musicBtn.innerHTML = '🎵';
    musicMuted = false;
  } else {
    audioCtx.suspend();
    musicBtn.innerHTML = '🔇';
    musicMuted = true;
  }
});

document.body.appendChild(musicBtn);

// Show music button after intro opens
const origOpen = openSurprise;
introScreen.removeEventListener('click', openSurprise);
introScreen.addEventListener('click', function handler() {
  introScreen.removeEventListener('click', handler);
  origOpen();
  setTimeout(() => { musicBtn.style.display = 'flex'; musicBtn.style.alignItems = 'center'; musicBtn.style.justifyContent = 'center'; }, 1500);
});

/* ---------- 7. PHOTO SLIDESHOW ---------- */
(function initSlideshow() {
  const slides     = document.querySelectorAll('.slide');
  const dotsWrap   = document.getElementById('slide-dots');
  const counter    = document.getElementById('slide-counter');
  const btnPrev    = document.getElementById('slide-prev');
  const btnNext    = document.getElementById('slide-next');
  const wrapper    = document.querySelector('.slideshow-wrapper');

  if (!slides.length || !dotsWrap) return;

  const TOTAL       = slides.length;
  let   current     = 0;
  let   autoTimer   = null;
  const AUTO_DELAY  = 4000; // 4 seconds per slide

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Slide ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function updateUI() {
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    dotsWrap.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
    if (counter) counter.textContent = (current + 1) + ' / ' + TOTAL;
  }

  function goTo(index) {
    current = (index + TOTAL) % TOTAL;
    updateUI();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, AUTO_DELAY);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  // Button clicks
  if (btnPrev) btnPrev.addEventListener('click', () => { prev(); startAuto(); });
  if (btnNext) btnNext.addEventListener('click', () => { next(); startAuto(); });

  // Pause auto on hover (desktop)
  if (wrapper) {
    wrapper.addEventListener('mouseenter', stopAuto);
    wrapper.addEventListener('mouseleave', startAuto);
  }

  // Touch / swipe support for iPhone
  let touchStartX = 0;
  let touchStartY = 0;
  if (wrapper) {
    wrapper.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    wrapper.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      // Only trigger if horizontal swipe is dominant
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        dx < 0 ? next() : prev();
        startAuto();
      }
    }, { passive: true });
  }

  // Keyboard arrow keys
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { next(); startAuto(); }
    if (e.key === 'ArrowLeft')  { prev(); startAuto(); }
  });

  // Start everything
  updateUI();
  startAuto();
})();
