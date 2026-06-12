// ── player.js — character drawing + physics, shared across all pages ─────────
// Depends on: draw.js (drawGlow, hexToRgb)

// ── State ────────────────────────────────────────────────────────────────────
const Player = {
  x: 300, y: 0,
  w: 24,  h: 34,
  vx: 0,  vy: 0,
  onGround: false,
  facing: 1,          // 1 = right, -1 = left
  frame: 0,
  fTimer: 0,
  state: 'idle',      // idle | walk | jump | fall
  cPhase: 0,
  nearDoor: null,

  // Called once to place the player on the ground
  init(x, groundY) {
    this.x = x;
    this.y = groundY - this.h;
    this.vy = 0; this.vx = 0;
    this.onGround = true;
    this.state = 'idle';
  },
};

// ── Input ────────────────────────────────────────────────────────────────────
const Keys = {};
function initInput(onEnter) {
  window.addEventListener('keydown', e => {
    Keys[e.code] = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
    if ((e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyE') && Player.nearDoor) {
      onEnter(Player.nearDoor);
    }
  });
  window.addEventListener('keyup', e => { Keys[e.code] = false; });
}

// ── Physics ──────────────────────────────────────────────────────────────────
const GRAV = 0.52, JVEL = -13.2, SPD = 3.4;

function updatePlayer(groundY, platforms, doors, spawnDustFn) {
  // Horizontal
  if (Keys['ArrowLeft']  || Keys['KeyA']) { Player.vx = -SPD; Player.facing = -1; }
  else if (Keys['ArrowRight'] || Keys['KeyD']) { Player.vx = SPD;  Player.facing =  1; }
  else Player.vx *= 0.72;

  // Jump
  if ((Keys['Space'] || Keys['ArrowUp'] || Keys['KeyW']) && Player.onGround) {
    Player.vy = JVEL;
    Player.onGround = false;
    spawnDustFn(Player.x + Player.w/2, Player.y + Player.h, '#6040b0', 7);
  }

  Player.vy += GRAV;
  Player.x  += Player.vx;
  Player.y  += Player.vy;

  // World clamp (per-page WORLD_W injected globally)
  const worldW = typeof WORLD_W !== 'undefined' ? WORLD_W : 8000;
  Player.x = Math.max(0, Math.min(worldW - Player.w, Player.x));

  // Ground
  Player.onGround = false;
  const pb = Player.y + Player.h;
  if (pb >= groundY) {
    if (Player.vy > 2) spawnDustFn(Player.x + Player.w/2, groundY, '#4030a0', 5);
    Player.y = groundY - Player.h;
    Player.vy = 0;
    Player.onGround = true;
  }

  // Platforms
  platforms.forEach(([px, pyf, pw, ph]) => {
    const py = typeof pyf === 'number' && pyf < 2 ? window.innerHeight * pyf : pyf;
    if (Player.x + Player.w > px && Player.x < px + pw &&
        pb > py && pb < py + ph + 14 && Player.vy >= 0) {
      Player.y = py - Player.h;
      Player.vy = 0;
      Player.onGround = true;
    }
  });

  // Animate state
  Player.fTimer++;
  if (Player.onGround && Math.abs(Player.vx) > 0.5) {
    Player.state = 'walk';
    if (Player.fTimer > 7) { Player.frame = (Player.frame + 1) % 6; Player.fTimer = 0; }
  } else if (!Player.onGround) {
    Player.state = Player.vy < 0 ? 'jump' : 'fall';
  } else {
    Player.state = 'idle';
    if (Player.fTimer > 22) { Player.frame = (Player.frame + 1) % 2; Player.fTimer = 0; }
  }
  Player.cPhase += 0.06;

  // Near door detection — player body overlaps door hitbox (with 8px margin)
  Player.nearDoor = null;
  doors.forEach(d => {
    const doorLeft  = d.x - 8;
    const doorRight = d.x + (d.w || 52) + 8;
    if (Player.x + Player.w > doorLeft && Player.x < doorRight) {
      Player.nearDoor = d;
    }
  });
}

// ── Drawing ──────────────────────────────────────────────────────────────────
function drawPlayer(cx, screenX, screenY, tick) {
  const s   = window.innerHeight / 720;
  const S   = n => n * s;
  const facing   = Player.facing;
  const state    = Player.state;
  const frame    = Player.frame;
  const cPhase   = Player.cPhase;

  cx.save();
  cx.translate(Math.round(screenX + Player.w/2), Math.round(screenY));
  if (facing < 0) cx.scale(-1, 1);

  const bob  = state === 'idle' ? Math.sin(cPhase) * 1.2 : 0;
  const wbob = state === 'walk' ? Math.sin(cPhase * 2.4) * 2 : 0;

  // Ambient glow
  drawGlow(cx, 0, S(34), S(28), '#4030a0', 0.22);

  // Shadow
  cx.fillStyle = 'rgba(0,0,0,0.3)';
  cx.beginPath(); cx.ellipse(0, S(34), S(10), S(3.5), 0, 0, Math.PI*2); cx.fill();

  // Cloak
  const cw1 = Math.sin(cPhase * 0.6) * S(3);
  const cw2 = Math.sin(cPhase * 0.8 + 1) * S(2);
  cx.fillStyle = '#0c0920';
  cx.beginPath();
  cx.moveTo(S(-12), S(8));
  cx.bezierCurveTo(S(-18)+cw1, S(18), S(-16)+cw1, S(28), S(-10)+cw1, S(36)+S(bob));
  cx.lineTo(S(-4), S(30));
  cx.lineTo(0, S(32)+S(wbob));
  cx.lineTo(S(4), S(30));
  cx.lineTo(S(10)+cw2, S(36)+S(bob));
  cx.bezierCurveTo(S(16)+cw2, S(28), S(18)+cw2, S(18), S(12), S(8));
  cx.closePath(); cx.fill();
  // Cloak highlight
  cx.strokeStyle = 'rgba(80,60,140,0.4)'; cx.lineWidth = S(1.5);
  cx.beginPath();
  cx.moveTo(S(-10), S(10));
  cx.bezierCurveTo(S(-12)+cw1*.5, S(20), S(-10)+cw1*.5, S(28), S(-6)+cw1*.5, S(34)+S(bob));
  cx.stroke();

  // Legs
  const legSwing = state === 'walk' ? Math.sin(cPhase * 2.4) * S(5) : 0;
  cx.fillStyle = '#1a1530';
  cx.fillRect(S(1),  S(22), S(5), S(12) - legSwing);
  cx.fillRect(S(-6), S(22), S(5), S(12) + legSwing);
  cx.fillStyle = '#252040';
  cx.fillRect(S(-7), S(30)+legSwing, S(6), S(5));
  cx.fillRect(S(0),  S(30)-legSwing, S(6), S(5));
  cx.fillStyle = '#3a3060';
  cx.fillRect(S(-7), S(30)+legSwing, S(6), S(1.5));
  cx.fillRect(S(0),  S(30)-legSwing, S(6), S(1.5));

  // Body
  cx.fillStyle = '#151225';
  cx.beginPath(); cx.roundRect(S(-9), S(6), S(18), S(18), S(2)); cx.fill();
  cx.strokeStyle = 'rgba(100,80,180,0.35)'; cx.lineWidth = S(1);
  cx.beginPath();
  cx.moveTo(S(-7), S(8)); cx.lineTo(S(-7), S(22));
  cx.moveTo(S(-4), S(7)); cx.lineTo(S(-4), S(23));
  cx.stroke();

  // Chest gem
  drawGlow(cx, 0, S(14), S(6), '#8060ff', 0.35);
  cx.fillStyle = '#c0a8ff'; cx.beginPath(); cx.arc(0, S(14), S(3), 0, Math.PI*2); cx.fill();
  cx.fillStyle = 'rgba(255,255,255,0.7)'; cx.beginPath(); cx.arc(S(-1), S(13), S(1.2), 0, Math.PI*2); cx.fill();

  // Shoulders
  cx.fillStyle = '#1e1a38';
  cx.beginPath(); cx.ellipse(S(-11), S(9), S(5), S(4), -0.2, 0, Math.PI*2); cx.fill();
  cx.beginPath(); cx.ellipse(S(11),  S(9), S(5), S(4),  0.2, 0, Math.PI*2); cx.fill();
  cx.fillStyle = '#2e2850';
  cx.beginPath(); cx.ellipse(S(-11), S(9), S(4), S(3), -0.2, 0, Math.PI*2); cx.fill();
  cx.beginPath(); cx.ellipse(S(11),  S(9), S(4), S(3),  0.2, 0, Math.PI*2); cx.fill();

  // Arms
  const armSwing = state === 'walk' ? Math.sin(cPhase * 2.4) * S(3) : 0;
  cx.fillStyle = '#151225';
  cx.fillRect(S(-14), S(9)+armSwing,  S(5), S(11));
  cx.fillRect(S(9),   S(9)-armSwing,  S(5), S(11));
  cx.fillStyle = '#252040';
  cx.fillRect(S(-15), S(18)+armSwing, S(6), S(5));
  cx.fillRect(S(9),   S(18)-armSwing, S(6), S(5));

  // Nail (sword)
  const nailY = S(20) - armSwing;
  cx.strokeStyle = '#b0c8ff'; cx.lineWidth = S(2.5); cx.lineCap = 'round';
  cx.beginPath(); cx.moveTo(S(14), nailY); cx.lineTo(S(14), nailY+S(22)); cx.stroke();
  cx.strokeStyle = 'rgba(255,255,255,0.6)'; cx.lineWidth = S(1);
  cx.beginPath(); cx.moveTo(S(13.5), nailY+S(2)); cx.lineTo(S(13.5), nailY+S(16)); cx.stroke();
  cx.fillStyle = '#3a3060'; cx.fillRect(S(10), nailY-S(1), S(8), S(3));
  cx.fillStyle = '#5a50a0'; cx.fillRect(S(10), nailY-S(1), S(8), S(1.5));
  drawGlow(cx, S(14), nailY+S(22), S(6), '#8080ff', 0.4);

  // Head
  cx.fillStyle = '#0e0c1e';
  cx.beginPath(); cx.ellipse(0, S(-4), S(12), S(13), 0, 0, Math.PI*2); cx.fill();
  cx.strokeStyle = 'rgba(60,50,100,0.6)'; cx.lineWidth = S(1.5);
  cx.beginPath(); cx.ellipse(0, S(-4), S(12), S(13), 0, Math.PI*0.8, Math.PI*1.6); cx.stroke();
  cx.fillStyle = '#130f22';
  cx.beginPath(); cx.ellipse(0, S(-4), S(10.5), S(11.5), 0, 0, Math.PI*2); cx.fill();

  // Brow ridges
  cx.fillStyle = '#1e1a38';
  cx.fillRect(S(-8), S(-9), S(7), S(2));
  cx.fillRect(S(1),  S(-9), S(7), S(2));

  // Eyes
  const eyePulse = 0.8 + Math.sin(tick * 0.025) * 0.2;
  drawGlow(cx, S(-3.5), S(-4), S(8), '#a0c8ff', 0.45*eyePulse);
  cx.fillStyle = '#ffffff';
  cx.beginPath(); cx.ellipse(S(-3.5), S(-4.5), S(3), S(2.2), -0.15, 0, Math.PI*2); cx.fill();
  cx.fillStyle = 'rgba(140,180,255,0.5)';
  cx.beginPath(); cx.arc(S(-4.5), S(-5), S(0.8), 0, Math.PI*2); cx.fill();
  drawGlow(cx, S(3.5), S(-4), S(8), '#a0c8ff', 0.4*eyePulse);
  cx.fillStyle = '#ffffff';
  cx.beginPath(); cx.ellipse(S(3.5), S(-5), S(2.5), S(2), 0.15, 0, Math.PI*2); cx.fill();
  cx.fillStyle = 'rgba(140,180,255,0.5)';
  cx.beginPath(); cx.arc(S(2.8), S(-5.5), S(0.7), 0, Math.PI*2); cx.fill();

  // Main horn
  cx.fillStyle = '#1a1530';
  cx.beginPath(); cx.moveTo(S(-3),S(-15)); cx.lineTo(S(3),S(-15)); cx.lineTo(S(0.5),S(-28)); cx.closePath(); cx.fill();
  cx.fillStyle = '#2d2848';
  cx.beginPath(); cx.moveTo(S(-1.5),S(-15)); cx.lineTo(S(1.5),S(-15)); cx.lineTo(S(0.5),S(-26)); cx.closePath(); cx.fill();
  drawGlow(cx, S(0.5), S(-27), S(5), '#c0a8ff', 0.5*eyePulse);
  cx.fillStyle = 'rgba(220,200,255,0.9)';
  cx.beginPath(); cx.arc(S(0.5), S(-27), S(1.5), 0, Math.PI*2); cx.fill();
  // Side horn nubs
  cx.fillStyle = '#1a1530';
  cx.beginPath(); cx.moveTo(S(-10),S(-8)); cx.lineTo(S(-8),S(-8)); cx.lineTo(S(-14),S(-14)); cx.closePath(); cx.fill();
  cx.beginPath(); cx.moveTo(S(10),S(-8));  cx.lineTo(S(8),S(-8));  cx.lineTo(S(14),S(-14));  cx.closePath(); cx.fill();

  cx.restore();
}