// ── draw.js — shared canvas drawing helpers ──────────────────────────────────

function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1,3), 16),
    parseInt(hex.slice(3,5), 16),
    parseInt(hex.slice(5,7), 16),
  ];
}

function drawGlow(cx, x, y, r, color, alpha) {
  if (!isFinite(x) || !isFinite(y) || !isFinite(r) || r <= 0 || !isFinite(alpha)) return;
  const [rv,gv,bv] = hexToRgb(color);
  const g2 = cx.createRadialGradient(x, y, 0, x, y, r);
  g2.addColorStop(0, `rgba(${rv},${gv},${bv},${alpha})`);
  g2.addColorStop(1, 'rgba(0,0,0,0)');
  cx.fillStyle = g2;
  cx.beginPath(); cx.arc(x, y, r, 0, Math.PI*2); cx.fill();
}

function drawCrystal(cx, x, y, w, h, lean, color, alpha = 1) {
  const [r,g,b] = hexToRgb(color);
  cx.save();
  cx.globalAlpha = alpha;
  // Main body
  cx.fillStyle = `rgb(${r},${g},${b})`;
  cx.beginPath();
  cx.moveTo(x + w*lean - w*0.15, y);
  cx.lineTo(x + w*lean + w*0.15, y);
  cx.lineTo(x + w*0.5, y + h);
  cx.lineTo(x - w*0.5, y + h);
  cx.closePath();
  cx.fill();
  // Inner highlight facet
  cx.fillStyle = `rgba(${Math.min(r+80,255)},${Math.min(g+80,255)},${Math.min(b+80,255)},0.6)`;
  cx.beginPath();
  cx.moveTo(x + w*lean, y);
  cx.lineTo(x + w*lean + w*0.08, y + h*0.3);
  cx.lineTo(x + w*lean - w*0.04, y + h*0.55);
  cx.closePath();
  cx.fill();
  // Tip sparkle
  cx.fillStyle = 'rgba(255,255,255,0.5)';
  cx.beginPath(); cx.arc(x + w*lean, y, 1.5, 0, Math.PI*2); cx.fill();
  cx.restore();
}

// Draw a simple animated torch flame at (x, y_base)
function drawTorch(cx, x, yBase, color, tick, idx) {
  const fl = 0.7 + Math.sin(tick * 0.13 + idx) * 0.25;
  const [r,g,b] = hexToRgb(color);
  drawGlow(cx, x, yBase - 4, 18, color, 0.4 * fl);
  cx.globalAlpha = fl * 0.9;
  cx.fillStyle = color;
  cx.beginPath(); cx.ellipse(x, yBase, 4, 7, 0, 0, Math.PI*2); cx.fill();
  cx.globalAlpha = fl * 0.55;
  cx.fillStyle = '#ffffff';
  cx.beginPath(); cx.ellipse(x, yBase + 1, 2, 3.5, 0, 0, Math.PI*2); cx.fill();
  cx.globalAlpha = 1;
}

// Seeded RNG (LCG)
function mkRng(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

// Draw cave background: void + distant rocks + stalactites + vines
function drawCaveBG(cx, W, H, tick, scrollX, opts = {}) {
  if (!W || !H) return;
  const {
    groundY   = H * 0.75,
    parallax  = 0.6,
    rngSeed   = 42,
    crystals  = [],   // { x, h, w, lean, col, ph, sp, ceiling }
    vines     = [],   // { x, segs, phase, speed }
  } = opts;

  const p6 = scrollX * parallax;

  // Void
  cx.fillStyle = '#020108'; cx.fillRect(0, 0, W, H);

  // Distant rock silhouettes
  const rng = mkRng(rngSeed);
  cx.fillStyle = '#06041a';
  for (let i = 0; i < 14; i++) {
    const bx = ((i * 480 - scrollX * 0.08 + 800) % (W * 8 + 800)) - 200;
    const bh = 50 + (i * 73 % 100);
    cx.beginPath();
    cx.moveTo(bx, groundY - bh);
    cx.lineTo(bx + 80, groundY - bh * 0.6);
    cx.lineTo(bx + 180, groundY - bh * 0.85);
    cx.lineTo(bx + 180, groundY);
    cx.lineTo(bx, groundY);
    cx.fill();
  }

  // Ceiling stalactite crystals
  crystals.forEach(st => {
    const sx = st.x - p6;
    if (sx < -30 || sx > W + 30) return;
    const cyTop = H * (st.ceiling || 0);
    const pulse = 0.6 + Math.sin(tick * st.sp + st.ph) * 0.25;
    drawGlow(cx, sx, cyTop + st.h, st.h * 0.7, st.col, 0.18 * pulse);
    cx.save();
    cx.translate(sx, cyTop);
    cx.scale(1, -1);
    drawCrystal(cx, 0, -st.h, st.w, st.h, st.lean, st.col, 0.7 * pulse);
    cx.restore();
  });

  // Vines from ceiling
  vines.forEach((v, vi) => {
    const vx = v.x - p6;
    if (vx < -60 || vx > W + 60) return;
    const sway = Math.sin(tick * v.speed + v.phase) * 3;
    cx.strokeStyle = '#0e1c0a'; cx.lineWidth = 1.5; cx.beginPath();
    let cx2 = vx, cy2 = 0;
    v.segs.forEach((seg, si) => {
      const nx = cx2 + seg.dx + sway * (si / v.segs.length);
      const ny = cy2 + seg.dy;
      cx.moveTo(cx2, cy2);
      cx.quadraticCurveTo(cx2 + seg.dx * 0.5, cy2 + seg.dy * 0.5, nx, ny);
      if (si % 2 === 0) {
        cx.save(); cx.translate(nx, ny);
        cx.fillStyle = si % 4 === 0 ? '#1a3012' : '#142808';
        cx.beginPath(); cx.ellipse(4, 0, 7, 3, 0.3, 0, Math.PI*2); cx.fill();
        cx.restore();
      }
      cx2 = nx; cy2 = ny;
    });
    cx.stroke();
  });
}

// Draw cave ground + floor crystals + platforms
function drawCaveGround(cx, W, H, tick, scrollX, opts = {}) {
  if (!W || !H) return;
  const {
    groundY    = H * 0.75,
    floorCryst = [],
    platforms  = [],
    parallax   = 0.95,
  } = opts;

  const p = scrollX * parallax;

  // Ground fill
  cx.fillStyle = '#0e0c1e'; cx.fillRect(0, groundY, W, H - groundY);
  cx.fillStyle = '#2e2850'; cx.fillRect(0, groundY, W, 1);
  cx.fillStyle = '#1e1a38'; cx.fillRect(0, groundY, W, 3);

  // Floor crystals
  floorCryst.forEach(cr => {
    const sx = cr.x - p;
    if (sx < -20 || sx > W + 20) return;
    const pulse = 0.5 + Math.sin(tick * cr.sp + cr.ph) * 0.3;
    drawGlow(cx, sx, groundY, cr.h * 0.9, cr.col, 0.2 * pulse);
    drawCrystal(cx, sx, groundY - cr.h, cr.w, cr.h, cr.lean, cr.col, 0.75 * pulse);
  });

  // Platforms
  platforms.forEach(([px, pyf, pw, ph]) => {
    const py = H * pyf;
    const sx = px - scrollX;
    if (sx > W + pw || sx < -pw) return;
    cx.fillStyle = '#12101e'; cx.fillRect(sx, py, pw, ph);
    cx.fillStyle = '#2a2448'; cx.fillRect(sx, py, pw, 3);
    cx.fillStyle = '#3d3860'; cx.fillRect(sx, py, pw, 1);
    cx.fillStyle = '#1e1a30';
    cx.fillRect(sx, py, 3, ph); cx.fillRect(sx+pw-3, py, 3, ph);
  });
}

// Standard vignette overlay
function drawVignette(cx, W, H) {
  if (!W || !H) return;
  const vig = cx.createRadialGradient(W/2, H/2, H*0.25, W/2, H/2, H*0.78);
  vig.addColorStop(0, 'transparent');
  vig.addColorStop(1, 'rgba(0,0,0,0.62)');
  cx.fillStyle = vig; cx.fillRect(0, 0, W, H);
}

// Room title in top-left
function drawRoomTitle(cx, title, sub, glowColor) {
  cx.fillStyle = '#c0b0ff';
  cx.font = 'bold 13px monospace';
  cx.textAlign = 'left';
  cx.shadowBlur = 8; cx.shadowColor = glowColor;
  cx.fillText(title, 70, 22);
  cx.shadowBlur = 0;
  cx.fillStyle = '#4a4070';
  cx.font = '9px monospace';
  cx.fillText(sub, 70, 35);
}

// Scroll hint + arrows
function drawScrollHints(cx, W, H, scrollX, maxScroll) {
  cx.fillStyle = 'rgba(140,120,200,0.4)';
  cx.font = '10px monospace';
  cx.textAlign = 'center';
  cx.fillText('← → to scroll', W/2, H - 16);
  if (scrollX > 10) {
    cx.fillStyle = 'rgba(160,140,220,0.55)';
    cx.font = '20px monospace'; cx.textAlign = 'center';
    cx.fillText('‹', 22, H/2);
  }
  if (scrollX < maxScroll - 10) {
    cx.fillStyle = 'rgba(160,140,220,0.55)';
    cx.font = '20px monospace';
    cx.fillText('›', W - 22, H/2);
  }
}