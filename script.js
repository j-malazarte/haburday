(function () {
  'use strict';
  const confettiCanvas = document.getElementById('confettiCanvas');
  const cCtx = confettiCanvas.getContext('2d');
  const balloonCanvas = document.getElementById('balloonCanvas');
  const bCtx = balloonCanvas.getContext('2d');
  let confettiPieces = [], balloons = [];
  let balloonActive = false, confettiActive = false, opened = false;
  const SONGS = [
    { name: 'sundown',  src: 'sundown.mp3'  },
    { name: 'youngstunna', src: 'youngstunna.mp3' },
    { name: 'spaghetti', src: 'spaghetti.mp3' },
  ];
  let currentSong = 0, player = null;
  function loadSong(index, autoplay) {
    if (player) { player.pause(); player.src = ''; }
    currentSong = (index + SONGS.length) % SONGS.length;
    player = new Audio(SONGS[currentSong].src);
    player.volume = 0.75;
    player.loop = false;
    player.onended = () => loadSong(currentSong + 1, true);
    const label = document.getElementById('songLabel');
    if (label) label.textContent = SONGS[currentSong].name;
    if (autoplay) player.play().catch(() => {});
  }
  window.nextSong = function () {
    const note = document.getElementById('songNote');
    if (note) { note.style.animation = 'none'; note.style.transform = 'scale(0.75)'; setTimeout(() => { note.style.transform = ''; note.style.animation = ''; }, 200); }
    loadSong(currentSong + 1, true);
  };
  function resize() { confettiCanvas.width = balloonCanvas.width = window.innerWidth; confettiCanvas.height = balloonCanvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });
  const CONFETTI_COLORS = ['#FFF5A0','#FF6B9D','#C44DFF','#44DDFF','#FF8C42','#7BFF6A','#FFD700','#FF4444','#44FFBB'];
  const BALLOON_COLORS  = ['#FF4444','#FF88BB','#FF6EC7','#FF9944','#FFDD44','#BB44FF','#44BBFF','#44FF88'];
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randItem(arr)  { return arr[Math.floor(Math.random() * arr.length)]; }
  function spawnConfetti() {
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    for (let i = 0; i < 220; i++) {
      confettiPieces.push({ x: cx + rand(-50,50), y: cy, vx: rand(-9,9), vy: rand(-18,-4), color: randItem(CONFETTI_COLORS), size: rand(5,15), rot: rand(0,360), rotV: rand(-12,12), shape: Math.random()>0.5?'rect':'circle', alpha: 1, gravity: 0.45 });
    }
    confettiActive = true;
  }
  function spawnBalloons() {
    balloonActive = true;
    setInterval(() => {
      if (!balloonActive) return;
      balloons.push({ x: rand(0,window.innerWidth), y: window.innerHeight+60, vy: rand(-3,-1.2), vx: rand(-0.4,0.4), r: rand(22,42), color: randItem(BALLOON_COLORS), sway: rand(0,Math.PI*2), swaySpeed: rand(0.01,0.04), alpha: 1 });
    }, 300);
  }
  function drawBalloon(b) {
    bCtx.save(); bCtx.globalAlpha = b.alpha;
    bCtx.beginPath(); bCtx.ellipse(b.x, b.y, b.r*0.85, b.r, 0, 0, Math.PI*2); bCtx.fillStyle = b.color; bCtx.fill();
    bCtx.beginPath(); bCtx.ellipse(b.x-b.r*0.22, b.y-b.r*0.3, b.r*0.18, b.r*0.25, -0.4, 0, Math.PI*2); bCtx.fillStyle = 'rgba(255,255,255,0.35)'; bCtx.fill();
    bCtx.beginPath(); bCtx.moveTo(b.x, b.y+b.r);
    const cx = b.x + Math.sin(b.sway*4)*12;
    bCtx.quadraticCurveTo(cx, b.y+b.r+20, b.x+Math.sin(b.sway*2)*8, b.y+b.r+50);
    bCtx.strokeStyle = 'rgba(80,40,80,0.6)'; bCtx.lineWidth = 1; bCtx.stroke(); bCtx.restore();
  }
  function loop() {
    cCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
    bCtx.clearRect(0,0,balloonCanvas.width,balloonCanvas.height);
    if (confettiActive) {
      for (let i = confettiPieces.length-1; i >= 0; i--) {
        const p = confettiPieces[i];
        p.x+=p.vx; p.y+=p.vy; p.vy+=p.gravity; p.vx*=0.99; p.rot+=p.rotV; p.alpha-=0.006;
        if (p.alpha<=0) { confettiPieces.splice(i,1); continue; }
        cCtx.save(); cCtx.globalAlpha=Math.max(0,p.alpha); cCtx.translate(p.x,p.y); cCtx.rotate(p.rot*Math.PI/180); cCtx.fillStyle=p.color;
        if (p.shape==='rect') { cCtx.fillRect(-p.size/2,-p.size/4,p.size,p.size/2); } else { cCtx.beginPath(); cCtx.arc(0,0,p.size/2,0,Math.PI*2); cCtx.fill(); }
        cCtx.restore();
      }
      if (confettiPieces.length===0) confettiActive=false;
    }
    if (balloonActive) {
      for (let i = balloons.length-1; i >= 0; i--) {
        const b = balloons[i];
        b.sway+=b.swaySpeed; b.x+=b.vx+Math.sin(b.sway)*0.5; b.y+=b.vy;
        if (b.y<-100) { balloons.splice(i,1); continue; }
        drawBalloon(b);
      }
    }
    requestAnimationFrame(loop);
  }
  loop();
  window.openGift = function () {
    if (opened) return; opened = true;
    const gift = document.getElementById('giftBox');
    gift.classList.add('exploding');
    gift.closest('.gift-wrapper').style.pointerEvents = 'none';
    try { const pop = new Audio('popbox.mp3'); pop.volume=1.0; pop.play().catch(()=>{}); } catch(e) {}
    setTimeout(() => { loadSong(0, true); }, 400);
    spawnConfetti();
    setTimeout(() => {
      const s1=document.getElementById('scene1'), s2=document.getElementById('scene2');
      s1.classList.add('hidden'); s1.setAttribute('aria-hidden','true');
      s2.classList.add('active'); s2.setAttribute('aria-hidden','false');
      spawnBalloons();
    }, 700);
  };
}());
