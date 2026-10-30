/* ==========================================================================
 * ZAYN & ALIZEH — THE VELVET CRIMSON ROSE WEDDING INVITATION
 * Main Application Script (script.js)
 * ========================================================================== */

gsap.registerPlugin(ScrollTrigger);

/* =========================================================================
 * 1. ROMANTIC AMBIENT WEB AUDIO SYNTHESIZER (NO EXTERNAL MP3 REQUIRED)
 * Generates a warm, dreamy harp & velvet pad chord progression on open.
 * ========================================================================= */
class RomanticAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.intervalId = null;
    this.masterGain = null;
    // Romantic A-minor / F-major7 / C-major7 / G6 arpeggio notes (Hz)
    this.chords = [
      [220.00, 261.63, 329.63, 392.00, 493.88], // Am9
      [174.61, 220.00, 261.63, 329.63, 440.00], // Fmaj7
      [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9
      [196.00, 246.94, 293.66, 392.00, 493.88]  // G6
    ];
    this.chordIndex = 0;
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.16;
    this.masterGain.connect(this.ctx.destination);
  }

  playNote(freq, delay, duration = 3.2) {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(freq * 0.5, now);

    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.18, now + 0.35);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(noteGain);
    subOsc.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + duration + 0.1);
    subOsc.stop(now + duration + 0.1);
  }

  triggerChord() {
    if (!this.isPlaying) return;
    const chord = this.chords[this.chordIndex % this.chords.length];
    chord.forEach((freq, idx) => {
      this.playNote(freq, idx * 0.42, 3.6);
    });
    this.chordIndex++;
  }

  start() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.triggerChord();
    this.intervalId = setInterval(() => this.triggerChord(), 3200);
    this.updateUI();
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.updateUI();
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  updateUI() {
    const eqBars = document.getElementById('eq-bars');
    const label = document.getElementById('audio-label');
    if (this.isPlaying) {
      eqBars.classList.add('playing');
      label.textContent = 'Music On';
    } else {
      eqBars.classList.remove('playing');
      label.textContent = 'Music Off';
    }
  }
}

const romanticAudio = new RomanticAudioEngine();
document.getElementById('audio-toggle-btn').addEventListener('click', () => {
  romanticAudio.toggle();
});

/* =========================================================================
 * 2. ENVELOPE OPENING OVERLAY LOGIC (GSAP 3D FLAP & SCROLL UNLOCK)
 * ========================================================================= */
const envelopeOverlay = document.getElementById('envelope-overlay');
const envelopeWrapper = document.getElementById('envelope-interactive');
const openInvitationBtn = document.getElementById('open-invitation-btn');
let isEnvelopeOpened = false;

function openEnvelopeSequence() {
  if (isEnvelopeOpened) return;
  isEnvelopeOpened = true;

  // Start romantic ambient music automatically on user interaction
  romanticAudio.start();

  // Subtle gold & crimson celebratory burst on seal break
  confetti({
    particleCount: 40,
    spread: 65,
    origin: { y: 0.55 },
    colors: ['#d4af37', '#f5e6c8', '#be123c', '#99001f']
  });

  const tl = gsap.timeline({
    onComplete: () => {
      envelopeOverlay.style.display = 'none';
      document.body.classList.remove('locked');
      ScrollTrigger.refresh();
    }
  });

  // 1. Fade out prompt & break wax seal / ribbon
  tl.to('#envelope-prompt, #envelope-header', {
    opacity: 0,
    y: -15,
    duration: 0.4,
    ease: 'power2.inOut'
  })
  .to('#wax-seal', {
    scale: 1.25,
    opacity: 0,
    duration: 0.35,
    ease: 'back.in(2)'
  }, '<0.1')
  .to('#envelope-ribbon', {
    scaleX: 0,
    opacity: 0,
    duration: 0.3,
    ease: 'power2.in'
  }, '<0.1')
  // 2. 3D RotateX the envelope top flap open
  .to('#envelope-flap', {
    rotateX: 180,
    duration: 0.85,
    ease: 'power3.inOut',
    onUpdate: function () {
      if (this.progress() > 0.45) {
        document.getElementById('envelope-flap').style.zIndex = '1';
      }
    }
  })
  // 3. Slide the inner invitation card upward out of the pocket
  .to('#envelope-letter', {
    y: -135,
    scale: 1.04,
    duration: 0.9,
    ease: 'power3.out'
  }, '-=0.35')
  // 4. Smoothly fade out the envelope modal & zoom-reveal Hero section
  .fromTo('#hero-card',
    { scale: 0.88, opacity: 0 },
    { scale: 1, opacity: 1, duration: 1.1, ease: 'power3.out' },
    '-=0.2'
  )
  .to(envelopeOverlay, {
    opacity: 0,
    scale: 1.08,
    duration: 0.85,
    ease: 'power2.inOut'
  }, '<');
}

envelopeWrapper.addEventListener('click', openEnvelopeSequence);
openInvitationBtn.addEventListener('click', openEnvelopeSequence);
envelopeWrapper.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') openEnvelopeSequence();
});

/* =========================================================================
 * 3. SCROLL-DRIVEN FLOATING ROSE & FOOTER COUPLE HANDOFF CLIMAX
 * ========================================================================= */
const floatingRoseContainer = document.getElementById('floating-rose-container');
const floatingRoseSvg = document.getElementById('floating-rose-svg');
let climaxTriggered = false;
let lastPetalTime = 0;

// Spawn a glowing crimson petal along the rose's path as the user scrolls
function spawnTrailPetal(x, y) {
  const now = performance.now();
  if (now - lastPetalTime < 95) return;
  lastPetalTime = now;

  const petal = document.createElement('div');
  petal.className = 'rose-trail-petal';
  const size = 6 + Math.random() * 7;
  petal.style.width = `${size}px`;
  petal.style.height = `${size * 1.3}px`;
  petal.style.left = `${x + (Math.random() * 24 - 12)}px`;
  petal.style.top = `${y + (Math.random() * 16 - 8)}px`;
  document.body.appendChild(petal);

  gsap.to(petal, {
    y: 35 + Math.random() * 40,
    x: (Math.random() - 0.5) * 45,
    rotation: Math.random() * 260 - 130,
    opacity: 0,
    scale: 0.3,
    duration: 1.2 + Math.random() * 0.6,
    ease: 'power1.out',
    onComplete: () => petal.remove()
  });
}

// ScrollTrigger controlling the Floating Rose vertical travel & rotation
ScrollTrigger.create({
  trigger: '#main-content',
  start: 'top top',
  end: 'bottom bottom',
  scrub: 0.6,
  onUpdate: (self) => {
    if (climaxTriggered && self.progress < 0.92) {
      resetCoupleClimax();
    }
    if (!climaxTriggered) {
      const maxTravel = window.innerHeight - 250;
      const currentY = self.progress * maxTravel;
      const swayX = Math.sin(self.progress * Math.PI * 5) * 14;
      const rot = Math.sin(self.progress * Math.PI * 6) * 18 + self.progress * 25;

      gsap.set(floatingRoseContainer, {
        y: currentY,
        x: swayX,
        rotation: rot
      });

      const rect = floatingRoseContainer.getBoundingClientRect();
      spawnTrailPetal(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    // Trigger the Groom & Bride Rose Handoff Climax when reaching bottom
    if (self.progress >= 0.95 && !climaxTriggered) {
      playCoupleRoseHandoff();
    }
  }
});

// Execute the 4-step Groom & Bride Rose Handoff Climax
function playCoupleRoseHandoff() {
  climaxTriggered = true;

  const handTarget = document.getElementById('groom-hand-target');
  const handRect = handTarget.getBoundingClientRect();
  const roseRect = floatingRoseContainer.getBoundingClientRect();

  // Calculate exact delta from current rose position to Groom's hand
  const currentX = gsap.getProperty(floatingRoseContainer, 'x') || 0;
  const currentY = gsap.getProperty(floatingRoseContainer, 'y') || 0;
  const deltaX = (handRect.left - roseRect.left) + currentX - 18;
  const deltaY = (handRect.top - roseRect.top) + currentY - 28;

  const climaxTl = gsap.timeline();

  // Step 1: Floating rose docks smoothly right into the Groom's hand
  climaxTl.to(floatingRoseContainer, {
    x: deltaX,
    y: deltaY,
    rotation: 20,
    scale: 0.65,
    duration: 0.75,
    ease: 'power3.inOut'
  })
  .to(floatingRoseContainer, {
    opacity: 0,
    duration: 0.15
  })
  .set('#handoff-rose', { opacity: 1 }, '<')

  // Step 2: Groom bows gently and extends his arm to give the rose to the Bride
  .to('#groom-upper-body', {
    rotation: 12,
    duration: 0.55,
    ease: 'power2.out'
  })
  .to('#groom-arm', {
    rotation: -14,
    x: 12,
    duration: 0.55,
    ease: 'power2.out'
  }, '<')

  // Step 3: Bride reaches out, receives the rose, holds it close with glowing hearts & blush
  .to('#bride-arm', {
    rotation: 15,
    duration: 0.45,
    ease: 'power2.out'
  }, '-=0.2')
  .to('#handoff-rose', {
    opacity: 0,
    duration: 0.2
  })
  .to('#bride-received-rose', {
    opacity: 1,
    duration: 0.25
  }, '<')
  .to('#bride-arm', {
    rotation: -18,
    duration: 0.55,
    ease: 'back.out(1.7)'
  })
  .to('#groom-upper-body', {
    rotation: 0,
    duration: 0.5,
    ease: 'power2.inOut'
  }, '<')
  .to('#bride-blush', {
    opacity: 0.85,
    scale: 1.35,
    duration: 0.4
  }, '<')
  .call(() => {
    document.getElementById('couple-hearts').style.opacity = '1';
    document.getElementById('climax-status-banner').innerHTML =
      '&ldquo;Forever sealed with a Velvet Crimson Rose &mdash; Zayn &amp; Alizeh&rdquo;';
    launchGrandFinaleConfetti();
  });
}

// Subtle continuous romantic breeze on the Bride's cathedral veil
gsap.to('#bride-veil', {
  skewX: 2.5,
  scaleX: 1.03,
  transformOrigin: '62px 22px',
  duration: 2.8,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut'
});

function resetCoupleClimax() {
  climaxTriggered = false;
  gsap.killTweensOf([
    floatingRoseContainer,
    '#groom-upper-body',
    '#groom-arm',
    '#bride-arm',
    '#handoff-rose',
    '#bride-received-rose',
    '#bride-blush'
  ]);
  gsap.set(floatingRoseContainer, { opacity: 1, scale: 1 });
  gsap.set('#handoff-rose', { opacity: 0 });
  gsap.set('#bride-received-rose', { opacity: 0 });
  gsap.set('#groom-upper-body', { rotation: 0 });
  gsap.set('#groom-arm', { rotation: 0, x: 0 });
  gsap.set('#bride-arm', { rotation: 0 });
  gsap.set('#bride-blush', { opacity: 0.2, scale: 1 });
  document.getElementById('couple-hearts').style.opacity = '0';
}

// Step 4: Rich celebration burst using canvas-confetti
function launchGrandFinaleConfetti() {
  const colors = ['#d4af37', '#f5e6c8', '#be123c', '#e11d48', '#99001f'];

  // Left & Right Golden Glitter Cannons
  confetti({
    particleCount: 55,
    angle: 60,
    spread: 60,
    origin: { x: 0.1, y: 0.75 },
    colors
  });
  confetti({
    particleCount: 55,
    angle: 120,
    spread: 60,
    origin: { x: 0.9, y: 0.75 },
    colors
  });

  // Center Floating Rose Petals & Golden Sparkles Burst
  setTimeout(() => {
    confetti({
      particleCount: 70,
      spread: 100,
      startVelocity: 35,
      decay: 0.92,
      scalar: 1.2,
      origin: { x: 0.5, y: 0.65 },
      colors
    });
  }, 300);
}

document.getElementById('replay-climax-btn').addEventListener('click', () => {
  resetCoupleClimax();
  setTimeout(() => playCoupleRoseHandoff(), 120);
});

/* =========================================================================
 * 4. INTERACTIVE DATE SCRATCH-OFF CARD (HTML5 CANVAS)
 * ========================================================================= */
const scratchCanvas = document.getElementById('scratch-canvas');
const scratchCtx = scratchCanvas.getContext('2d', { willReadFrequently: true });
const scratchInnerCard = document.getElementById('scratch-inner-card');
const scratchStatusText = document.getElementById('scratch-status-text');
let isDrawingScratch = false;
let isScratchRevealed = false;

function initScratchFoil() {
  isScratchRevealed = false;
  scratchInnerCard.classList.remove('shine-reveal');
  scratchCanvas.style.opacity = '1';
  scratchCanvas.style.pointerEvents = 'auto';
  scratchStatusText.textContent = 'Scratch progress: 0%';

  const rect = scratchInnerCard.getBoundingClientRect();
  scratchCanvas.width = rect.width;
  scratchCanvas.height = rect.height;

  const w = scratchCanvas.width;
  const h = scratchCanvas.height;

  // Draw Metallic Champagne-Gold & Velvet Shimmer Coat
  scratchCtx.globalCompositeOperation = 'source-over';
  const grad = scratchCtx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#3b0714');
  grad.addColorStop(0.28, '#99001f');
  grad.addColorStop(0.52, '#d4af37');
  grad.addColorStop(0.75, '#f5e6c8');
  grad.addColorStop(1, '#7c5813');

  scratchCtx.fillStyle = grad;
  scratchCtx.fillRect(0, 0, w, h);

  // Subtle Diagonal Shimmer Pattern
  scratchCtx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  scratchCtx.lineWidth = 1;
  for (let i = -h; i < w; i += 16) {
    scratchCtx.beginPath();
    scratchCtx.moveTo(i, 0);
    scratchCtx.lineTo(i + h, h);
    scratchCtx.stroke();
  }

  // Inner Ornate Foil Border
  scratchCtx.strokeStyle = '#f5e6c8';
  scratchCtx.lineWidth = 2;
  scratchCtx.strokeRect(14, 14, w - 28, h - 28);

  // Overlay Prompt Typography
  scratchCtx.fillStyle = '#0a0a0a';
  scratchCtx.font = '600 13px Montserrat, sans-serif';
  scratchCtx.textAlign = 'center';
  scratchCtx.fillText('✦ ROYAL GOLD FOIL SEAL ✦', w / 2, h / 2 - 22);

  scratchCtx.font = 'italic 600 26px "Playfair Display", serif';
  scratchCtx.fillText('Scratch to Reveal Our Special Day', w / 2, h / 2 + 12);

  scratchCtx.font = '400 12px Montserrat, sans-serif';
  scratchCtx.fillText('Drag Across with Cursor or Finger', w / 2, h / 2 + 40);
}

function getCanvasPointerPos(evt) {
  const rect = scratchCanvas.getBoundingClientRect();
  const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
  const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function scratchAtPoint(x, y) {
  if (isScratchRevealed) return;
  scratchCtx.globalCompositeOperation = 'destination-out';
  scratchCtx.beginPath();
  scratchCtx.arc(x, y, 30, 0, Math.PI * 2);
  scratchCtx.fill();
  checkScratchPercentage();
}

function checkScratchPercentage() {
  const w = scratchCanvas.width;
  const h = scratchCanvas.height;
  const imgData = scratchCtx.getImageData(0, 0, w, h).data;
  let transparentPixels = 0;
  const sampleStep = 16; // Sample every 4th pixel for smooth mobile performance
  const totalSampled = imgData.length / sampleStep;

  for (let i = 3; i < imgData.length; i += sampleStep) {
    if (imgData[i] < 128) transparentPixels++;
  }

  const percent = Math.min(100, Math.round((transparentPixels / totalSampled) * 100));
  scratchStatusText.textContent = `Scratch progress: ${percent}%`;

  if (percent >= 48 && !isScratchRevealed) {
    isScratchRevealed = true;
    scratchCanvas.style.opacity = '0';
    scratchCanvas.style.pointerEvents = 'none';
    scratchInnerCard.classList.add('shine-reveal');
    scratchStatusText.textContent = 'Date Revealed! Save it to your calendar below.';

    confetti({
      particleCount: 45,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#d4af37', '#f5e6c8', '#be123c']
    });
  }
}

scratchCanvas.addEventListener('mousedown', (e) => {
  isDrawingScratch = true;
  const pos = getCanvasPointerPos(e);
  scratchAtPoint(pos.x, pos.y);
});
window.addEventListener('mousemove', (e) => {
  if (!isDrawingScratch) return;
  const pos = getCanvasPointerPos(e);
  scratchAtPoint(pos.x, pos.y);
});
window.addEventListener('mouseup', () => {
  isDrawingScratch = false;
});

scratchCanvas.addEventListener('touchstart', (e) => {
  isDrawingScratch = true;
  const pos = getCanvasPointerPos(e);
  scratchAtPoint(pos.x, pos.y);
}, { passive: true });
scratchCanvas.addEventListener('touchmove', (e) => {
  if (!isDrawingScratch) return;
  e.preventDefault();
  const pos = getCanvasPointerPos(e);
  scratchAtPoint(pos.x, pos.y);
}, { passive: false });
scratchCanvas.addEventListener('touchend', () => {
  isDrawingScratch = false;
});

document.getElementById('reset-scratch-btn').addEventListener('click', initScratchFoil);
window.addEventListener('resize', () => {
  if (!isScratchRevealed) initScratchFoil();
});

// Apple / Outlook .ics Calendar File Generator
document.getElementById('apple-cal-btn').addEventListener('click', () => {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zayn and Alizeh Wedding//EN',
    'BEGIN:VEVENT',
    'DTSTART:20261212T163000Z',
    'DTEND:20261212T235900Z',
    'SUMMARY:Zayn & Alizeh — Royal Wedding Celebration',
    'DESCRIPTION:Join us for the Black & Velvet Crimson Rose wedding celebration of Zayn & Alizeh.',
    'LOCATION:Ciragan Palace Kempinski, Istanbul',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Zayn-Alizeh-Wedding.ics');
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

/* =========================================================================
 * 5. VENUE COPY ADDRESS INTERACTION & RSVP FORM SUBMISSION
 * ========================================================================= */
const copyAddressBtn = document.getElementById('copy-address-btn');
const copyAddressLabel = document.getElementById('copy-address-label');
copyAddressBtn.addEventListener('click', () => {
  const address = document.getElementById('venue-address-text').textContent.trim();
  navigator.clipboard.writeText(address).catch(() => {});
  copyAddressLabel.textContent = 'Address Copied ✓';
  setTimeout(() => {
    copyAddressLabel.textContent = 'Copy Address';
  }, 2500);
});

// RSVP Form Handler
const rsvpForm = document.getElementById('rsvp-form');
const rsvpSuccess = document.getElementById('rsvp-success');
const rsvpSummaryText = document.getElementById('rsvp-summary-text');
const rsvpEditBtn = document.getElementById('rsvp-edit-btn');

rsvpForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(rsvpForm);
  const name = formData.get('name');
  const guests = formData.get('guests');
  const attendance = formData.get('attendance');

  rsvpForm.classList.add('hidden');
  rsvpSuccess.classList.remove('hidden');

  if (attendance === 'attending') {
    rsvpSummaryText.textContent = `Thank you, ${name}! We have reserved ${guests} seat(s) in your honor for December 12th, 2026.`;
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#d4af37', '#be123c', '#f5e6c8']
    });
  } else {
    rsvpSummaryText.textContent = `Thank you, ${name}. We will miss your presence dearly and hold your warm blessings close to our hearts.`;
  }
});

rsvpEditBtn.addEventListener('click', () => {
  rsvpSuccess.classList.add('hidden');
  rsvpForm.classList.remove('hidden');
});

/* =========================================================================
 * 6. LIVE COUNTDOWN TIMER & SECTION SCROLL ANIMATIONS
 * ========================================================================= */
const weddingTargetDate = new Date('2026-12-12T16:30:00Z').getTime();

function updateCountdown() {
  const now = Date.now();
  const diff = Math.max(0, weddingTargetDate - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / 1000 / 60) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
  document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
  document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Reveal animations for timeline cards & luxury sections
gsap.utils.toArray('.reveal-up, .timeline-item').forEach((elem) => {
  gsap.fromTo(elem,
    { opacity: 0, y: 42 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: elem,
        start: 'top 86%',
        toggleActions: 'play none none reverse'
      }
    }
  );
});

/* =========================================================================
 * 7. AMBIENT BACKGROUND GOLDEN & CRIMSON EMBER CANVAS
 * ========================================================================= */
const bgCanvas = document.getElementById('ambient-bg-canvas');
const bgCtx = bgCanvas.getContext('2d');
let embers = [];

function resizeBgCanvas() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
resizeBgCanvas();
window.addEventListener('resize', resizeBgCanvas);

for (let i = 0; i < 36; i++) {
  embers.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2 + 0.6,
    vx: (Math.random() - 0.5) * 0.25,
    vy: -Math.random() * 0.35 - 0.1,
    alpha: Math.random() * 0.65 + 0.15,
    gold: Math.random() > 0.45
  });
}

function animateAmbientEmbers() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  for (const p of embers) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.y < -10) p.y = bgCanvas.height + 10;
    if (p.x < -10) p.x = bgCanvas.width + 10;
    if (p.x > bgCanvas.width + 10) p.x = -10;

    bgCtx.beginPath();
    bgCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    bgCtx.fillStyle = p.gold
      ? `rgba(212, 175, 55, ${p.alpha})`
      : `rgba(225, 29, 72, ${p.alpha})`;
    bgCtx.fill();
  }
  requestAnimationFrame(animateAmbientEmbers);
}

window.addEventListener('DOMContentLoaded', () => {
  initScratchFoil();
  animateAmbientEmbers();
});

