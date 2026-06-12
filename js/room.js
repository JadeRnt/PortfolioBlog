// ── room.js — scrolling room engine shared by all sub-pages ─────────────────
// Depends on: draw.js, player.js

// ── Dust particles ───────────────────────────────────────────────────────────
const DustParticles = [];

function spawnDust(wx, wy, color, n = 4) {
  for (let i = 0; i < n; i++) {
    DustParticles.push({
      x: wx, y: wy,
      vx: (Math.random() - 0.5) * 1.8,
      vy: -Math.random() * 1.4 - 0.3,
      life: 1,
      decay: 0.025 + Math.random() * 0.02,
      sz: 1 + Math.random() * 2,
      color,
    });
  }
}

function updateDust() {
  for (let i = DustParticles.length - 1; i >= 0; i--) {
    const p = DustParticles[i];
    p.x += p.vx; p.y += p.vy; p.vy -= 0.02; p.life -= p.decay;
    if (p.life <= 0) DustParticles.splice(i, 1);
  }
}

function drawDust(cx, camX) {
  if (!isFinite(camX)) return;
  DustParticles.forEach(p => {
    cx.globalAlpha = p.life * 0.8;
    cx.fillStyle = p.color;
    cx.fillRect(Math.round(p.x - camX), Math.round(p.y), Math.round(p.sz), Math.round(p.sz));
  });
  cx.globalAlpha = 1;
}

// ── Ambient floating dust specks ─────────────────────────────────────────────
function makeAmbientDust(n, roomW, color) {
  const d = [];
  for (let i = 0; i < n; i++) {
    d.push({
      x: Math.random() * roomW,
      y: Math.random() * 500,
      vx: (Math.random() - 0.5) * 0.28,
      vy: -Math.random() * 0.16 - 0.03,
      a: Math.random(),
      ph: Math.random() * Math.PI * 2,
      color,
    });
  }
  return d;
}

function drawAmbientDust(cx, dust, scrollX, roomW, H) {
  dust.forEach(d => {
    d.x += d.vx; d.y += d.vy; d.ph += 0.02;
    if (d.y < 0) d.y = H * 0.9;
    if (d.x < -100) d.x = roomW + 100;
    if (d.x > roomW + 100) d.x = -100;
    const sx = d.x - scrollX;
    if (sx < 0 || sx > cx.canvas.width) return;
    cx.globalAlpha = (0.12 + Math.sin(d.ph) * 0.08) * d.a;
    cx.fillStyle = d.color;
    cx.beginPath(); cx.arc(sx, d.y, 1, 0, Math.PI * 2); cx.fill();
  });
  cx.globalAlpha = 1;
}

// ── Camera ───────────────────────────────────────────────────────────────────
// camX is declared locally in each page, updateCamera returns the new value

function updateCamera(camX, targetX, W, roomW) {
  camX += (targetX - camX) * 0.1;
  camX = Math.max(0, Math.min(roomW - W, camX));
  return camX;
}

// ── Door drawing ─────────────────────────────────────────────────────────────
function drawDoor(cx, door, camX, groundY, near, tick) {
  if (!isFinite(groundY) || !isFinite(camX)) return;
  const x = door.x - camX;
  const dW = door.w || 52, dH = 78, y = groundY - dH;
  const col = door.color;
  const [r, g, b] = hexToRgb(col);
  const pulse = 0.7 + Math.sin(tick * 0.04) * 0.2;

  // Stone arch backing
  cx.fillStyle = '#0c0a1c'; cx.fillRect(x-6, y-8, dW+12, dH+8);
  cx.fillStyle = '#1a1730';
  cx.fillRect(x-6, y-8, 7, dH+8); cx.fillRect(x+dW-1, y-8, 7, dH+8);
  cx.fillRect(x-6, y-8, dW+12, 7);
  cx.fillStyle = '#25224a';
  cx.fillRect(x-5, y-7, 2, dH+6); cx.fillRect(x+dW+3, y-7, 2, dH+6);
  cx.fillRect(x-5, y-7, dW+10, 2);
  cx.fillStyle = '#100e22';
  for (let i = 0; i < 4; i++) cx.fillRect(x-6, y-8+i*20, dW+12, 1);

  // Door void
  cx.fillStyle = '#04020e'; cx.fillRect(x, y, dW, dH);

  // Inner glow
  const ig = cx.createLinearGradient(x, y, x, y+dH);
  ig.addColorStop(0, `rgba(${r},${g},${b},0)`);
  ig.addColorStop(0.4, `rgba(${r},${g},${b},${0.18*pulse})`);
  ig.addColorStop(0.8, `rgba(${r},${g},${b},${0.10*pulse})`);
  ig.addColorStop(1, `rgba(${r},${g},${b},0)`);
  cx.fillStyle = ig; cx.fillRect(x, y, dW, dH);

  drawGlow(cx, x+dW/2, y+dH*0.55, 55, col, 0.22*pulse);

  // Floor beam
  cx.fillStyle = `rgba(${r},${g},${b},0.07)`;
  cx.beginPath();
  cx.moveTo(x+4, groundY); cx.lineTo(x+dW-4, groundY);
  cx.lineTo(x+dW+22, groundY+12); cx.lineTo(x-22, groundY+12);
  cx.closePath(); cx.fill();

  // Floating glyph
  const gY = y + dH*0.4 + Math.sin(tick * 0.05) * 4;
  cx.fillStyle = `rgba(${r},${g},${b},${0.6*pulse})`;
  cx.font = 'bold 16px monospace'; cx.textAlign = 'center';
  cx.fillText(door.glyph || '✦', x+dW/2, gY);

  // Label
  const ly = y - 32;
  if (near) {
    drawGlow(cx, x+dW/2, ly, 40, col, 0.2);
    cx.fillStyle = col; cx.shadowBlur = 8; cx.shadowColor = col;
  } else {
    cx.fillStyle = '#8878aa'; cx.shadowBlur = 0;
  }
  cx.font = 'bold 11px monospace'; cx.textAlign = 'center';
  cx.fillText(door.label, x+dW/2, ly);
  cx.shadowBlur = 0;
  cx.fillStyle = near ? `rgba(${r},${g},${b},0.7)` : '#4a4070';
  cx.font = '9px monospace';
  cx.fillText(door.sub || '', x+dW/2, ly+13);

  if (near) {
    const hy = y - 50 + Math.sin(tick * 0.1) * 2;
    cx.fillStyle = '#ffffff'; cx.font = 'bold 9px monospace';
    cx.shadowBlur = 8; cx.shadowColor = col;
    cx.fillText('[ ↑  enter ]', x+dW/2, hy);
    cx.shadowBlur = 0;
  }
}

// ── Page transition ──────────────────────────────────────────────────────────
let _transitioning = false;

function isTransitioning() { return _transitioning; }

function navigateTo(url) {
  if (_transitioning) return;
  _transitioning = true;
  const f = document.getElementById('fade');
  f.style.transition = 'background 0.5s';
  f.classList.remove('in');
  setTimeout(() => { window.location.href = url; }, 550);
}

function fadeIn() {
  setTimeout(() => document.getElementById('fade').classList.add('in'), 40);
}