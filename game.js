'use strict';

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const COLORS = [
  null,
  '#4dd0e1', // I - cyan
  '#ffd54f', // O - yellow
  '#ba68c8', // T - purple
  '#81c784', // S - green
  '#e57373', // Z - red
  '#64b5f6', // J - pale blue
  '#ffb74d', // L - orange
  '#b0bec5', // N - nut (steel gray)
];

const PIECES = [
  null,
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // I
  [[2,2],[2,2]],                               // O
  [[0,3,0],[3,3,3],[0,0,0]],                  // T
  [[0,4,4],[4,4,0],[0,0,0]],                  // S
  [[5,5,0],[0,5,5],[0,0,0]],                  // Z
  [[6,0,0],[6,6,6],[0,0,0]],                  // J
  [[0,0,7],[7,7,7],[0,0,0]],                  // L
  [[8,8,8],[8,0,8],[8,8,8]],                  // N - tuerca (nut)
];

const SKIN_STORAGE_KEY = 'tetris-skin';

const RETRO_COLORS = COLORS;

const NEON_COLORS = [
  null,
  '#00f7ff', // I
  '#fff200', // O
  '#e14dff', // T
  '#39ff6a', // S
  '#ff3860', // Z
  '#4d8bff', // J
  '#ff9a3c', // L
  '#ffffff', // N
];

const PASTEL_COLORS = [
  null,
  '#a8dee6', // I
  '#f7e6a3', // O
  '#d9b8e0', // T
  '#b8ddb0', // S
  '#f0b8b8', // Z
  '#b3cdea', // J
  '#f2cba3', // L
  '#d8dde2', // N
];

const PIXEL_COLORS = RETRO_COLORS;

function shadeColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amt));
  return `rgb(${r}, ${g}, ${b})`;
}

const pixelPatternCache = {};

function getPixelPattern(context, colorIndex) {
  if (pixelPatternCache[colorIndex]) return pixelPatternCache[colorIndex];
  const base = PIXEL_COLORS[colorIndex];
  const light = shadeColor(base, 18);
  const dark = shadeColor(base, -18);
  const p = document.createElement('canvas');
  p.width = 8;
  p.height = 8;
  const pctx = p.getContext('2d');
  pctx.fillStyle = base;
  pctx.fillRect(0, 0, 8, 8);
  pctx.fillStyle = light;
  pctx.fillRect(0, 0, 4, 4);
  pctx.fillRect(4, 4, 4, 4);
  pctx.fillStyle = dark;
  pctx.fillRect(4, 0, 4, 4);
  pctx.fillRect(0, 4, 4, 4);
  const pattern = context.createPattern(p, 'repeat');
  pixelPatternCache[colorIndex] = pattern;
  return pattern;
}

function roundRectPath(context, x, y, w, h, r) {
  context.beginPath();
  if (typeof context.roundRect === 'function') {
    context.roundRect(x, y, w, h, r);
    return;
  }
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

function drawBlockRetro(context, x, y, colorIndex, size, alpha) {
  const color = RETRO_COLORS[colorIndex];
  context.globalAlpha = alpha ?? 1;
  context.fillStyle = color;
  context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  context.fillStyle = 'rgba(255,255,255,0.12)';
  context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
  context.globalAlpha = 1;
}

function drawBlockNeon(context, x, y, colorIndex, size, alpha) {
  const color = NEON_COLORS[colorIndex];
  const a = alpha ?? 1;
  context.save();
  context.globalAlpha = a;
  context.shadowColor = color;
  context.shadowBlur = 6 + 10 * a;
  context.fillStyle = color;
  context.fillRect(x * size + 2, y * size + 2, size - 4, size - 4);
  context.shadowBlur = 0;
  context.strokeStyle = 'rgba(255,255,255,0.55)';
  context.lineWidth = 1;
  context.strokeRect(x * size + 2.5, y * size + 2.5, size - 5, size - 5);
  context.restore();
}

function drawBlockPastel(context, x, y, colorIndex, size, alpha) {
  const color = PASTEL_COLORS[colorIndex];
  context.save();
  context.globalAlpha = alpha ?? 1;
  roundRectPath(context, x * size + 2, y * size + 2, size - 4, size - 4, 5);
  context.fillStyle = color;
  context.fill();
  roundRectPath(context, x * size + 2, y * size + 2, size - 4, (size - 4) * 0.35, 5);
  context.fillStyle = 'rgba(255,255,255,0.35)';
  context.fill();
  context.restore();
}

function drawBlockPixel(context, x, y, colorIndex, size, alpha) {
  context.save();
  context.globalAlpha = alpha ?? 1;
  context.translate(x * size, y * size);
  context.fillStyle = getPixelPattern(context, colorIndex);
  context.fillRect(1, 1, size - 2, size - 2);
  context.strokeStyle = 'rgba(0,0,0,0.4)';
  context.lineWidth = 1;
  context.strokeRect(0.5, 0.5, size - 1, size - 1);
  context.restore();
}

const SKINS = {
  retro:  { label: 'Retro',     bodyClass: null,          draw: drawBlockRetro },
  neon:   { label: 'Neon',      bodyClass: 'skin-neon',   draw: drawBlockNeon },
  pastel: { label: 'Pastel',    bodyClass: 'skin-pastel', draw: drawBlockPastel },
  pixel:  { label: 'Pixel Art', bodyClass: 'skin-pixel',  draw: drawBlockPixel },
};

const LINE_SCORES = [0, 100, 300, 500, 800];
const PERFECT_CLEAR_BONUS = [0, 800, 1200, 1800, 2000];

const POWERUP_TYPES = ['tint', 'bomb', 'lightning'];
const POWERUP_ICONS = { tint: '🎨', bomb: '💣', lightning: '⚡' };

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');
const holdCanvas = document.getElementById('hold-canvas');
const holdCtx = holdCanvas.getContext('2d');
const holdSection = document.getElementById('hold-section');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const comboEl = document.getElementById('combo');
const comboSection = document.getElementById('combo-section');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const restartBtn = document.getElementById('restart-btn');
const themeToggle = document.getElementById('theme-toggle');
const skinSelect = document.getElementById('skin-select');

let board, current, next, hold, holdLocked, score, lines, level, paused, gameOver, lastTime, dropAccum, dropInterval, animId;
let linesUntilPowerUp, nextIsSpecial;
let combo, floatingTexts;

let currentSkin = localStorage.getItem(SKIN_STORAGE_KEY) || 'retro';
if (!SKINS[currentSkin]) currentSkin = 'retro';
if (SKINS[currentSkin].bodyClass) document.body.classList.add(SKINS[currentSkin].bodyClass);
skinSelect.value = currentSkin;
themeToggle.disabled = currentSkin === 'neon';

let gridColor = getComputedStyle(document.body).getPropertyValue('--grid-color').trim();

let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', gain = 0.15, delay = 0) {
  const ctx2 = getAudioCtx();
  const osc = ctx2.createOscillator();
  const gainNode = ctx2.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const startAt = ctx2.currentTime + delay;
  gainNode.gain.setValueAtTime(0, startAt);
  gainNode.gain.linearRampToValueAtTime(gain, startAt + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
  osc.connect(gainNode);
  gainNode.connect(ctx2.destination);
  osc.start(startAt);
  osc.stop(startAt + duration);
}

function playLineClearSound(cleared) {
  playTone(330 + cleared * 60, 0.15);
}

function playComboSound(comboCount) {
  const base = 440 + Math.min(comboCount, 8) * 40;
  playTone(base, 0.12);
  playTone(base * 1.25, 0.15, 'sine', 0.15, 0.08);
}

function playTetrisSound() {
  playTone(523.25, 0.25, 'square', 0.1);
  playTone(659.25, 0.25, 'square', 0.1);
  playTone(783.99, 0.3, 'square', 0.1);
}

function playPerfectClearSound() {
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    playTone(freq, 0.3, 'triangle', 0.15, i * 0.09);
  });
}

function spawnFloatingText(text, color) {
  floatingTexts.push({ text, color, alpha: 1, y: (ROWS * BLOCK) / 2, life: 900, maxLife: 900 });
}

function updateFloatingTexts(dt) {
  for (const t of floatingTexts) {
    t.life -= dt;
    t.y -= dt * 0.03;
    t.alpha = Math.max(0, t.life / t.maxLife);
  }
  floatingTexts = floatingTexts.filter(t => t.life > 0);
}

function isBoardEmpty() {
  return board.every(row => row.every(v => v === 0));
}

function setTheme(isLight) {
  document.body.classList.toggle('light-theme', isLight);
  gridColor = getComputedStyle(document.body).getPropertyValue('--grid-color').trim();
}

themeToggle.addEventListener('change', () => setTheme(themeToggle.checked));

function setSkin(name) {
  if (!SKINS[name]) name = 'retro';
  currentSkin = name;
  localStorage.setItem(SKIN_STORAGE_KEY, name);
  document.body.classList.remove('skin-neon', 'skin-pastel', 'skin-pixel');
  if (SKINS[name].bodyClass) document.body.classList.add(SKINS[name].bodyClass);
  gridColor = getComputedStyle(document.body).getPropertyValue('--grid-color').trim();
  themeToggle.disabled = name === 'neon';
  draw();
  drawNext();
  drawHold();
}

skinSelect.addEventListener('change', () => setSkin(skinSelect.value));

function createBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

function randomPowerUpThreshold() {
  return 8 + Math.floor(Math.random() * 8);
}

function randomPiece(isSpecial) {
  const type = Math.floor(Math.random() * 8) + 1;
  const shape = PIECES[type].map(row => [...row]);
  const special = isSpecial ? POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)] : null;
  return { type, shape, x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0, special };
}

function collide(shape, ox, oy) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = ox + c;
      const ny = oy + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function rotateCW(shape) {
  const rows = shape.length, cols = shape[0].length;
  const result = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      result[c][rows - 1 - r] = shape[r][c];
  return result;
}

function tryRotate() {
  const rotated = rotateCW(current.shape);
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collide(rotated, current.x + kick, current.y)) {
      current.shape = rotated;
      current.x += kick;
      return;
    }
  }
}

function merge() {
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        board[current.y + r][current.x + c] = current.shape[r][c];
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(v => v !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  if (cleared) {
    combo++;
    lines += cleared;
    score += (LINE_SCORES[cleared] || 0) * level * combo;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(100, 1000 - (level - 1) * 90);
    linesUntilPowerUp -= cleared;
    if (linesUntilPowerUp <= 0) {
      nextIsSpecial = true;
      linesUntilPowerUp = randomPowerUpThreshold();
    }

    if (cleared === 4) {
      spawnFloatingText('TETRIS!', '#ffd54f');
      playTetrisSound();
    } else if (combo >= 2) {
      spawnFloatingText(`COMBO x${combo}`, '#7aa2f7');
      playComboSound(combo);
    } else {
      playLineClearSound(cleared);
    }

    if (isBoardEmpty()) {
      score += PERFECT_CLEAR_BONUS[cleared] * level;
      spawnFloatingText('PERFECT CLEAR!', '#ffe066');
      playPerfectClearSound();
    }

    updateHUD();
  } else {
    combo = 0;
    updateHUD();
  }
}

function clearFullRow(r) {
  board.splice(r, 1);
  board.unshift(new Array(COLS).fill(0));
  lines += 1;
  score += (LINE_SCORES[1] || 0) * level;
  level = Math.floor(lines / 10) + 1;
  dropInterval = Math.max(100, 1000 - (level - 1) * 90);
}

function collapseColumns(colsAffected) {
  for (const c of colsAffected) {
    const values = [];
    for (let r = 0; r < ROWS; r++) {
      if (board[r][c] !== 0) values.push(board[r][c]);
    }
    for (let r = 0; r < ROWS; r++) {
      const fromBottom = ROWS - 1 - r;
      const valueIndex = values.length - 1 - fromBottom;
      board[r][c] = valueIndex >= 0 ? values[valueIndex] : 0;
    }
  }
}

function pieceBounds(piece) {
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        minR = Math.min(minR, r);
        maxR = Math.max(maxR, r);
        minC = Math.min(minC, c);
        maxC = Math.max(maxC, c);
      }
    }
  }
  return { minR, maxR, minC, maxC };
}

function applyPowerUp(piece) {
  const { minR, maxR, minC, maxC } = pieceBounds(piece);

  if (piece.special === 'bomb') {
    const centerR = piece.y + Math.round((minR + maxR) / 2);
    const centerC = piece.x + Math.round((minC + maxC) / 2);
    const colsAffected = new Set();
    for (let r = centerR - 1; r <= centerR + 1; r++) {
      if (r < 0 || r >= ROWS) continue;
      for (let c = centerC - 1; c <= centerC + 1; c++) {
        if (c < 0 || c >= COLS) continue;
        board[r][c] = 0;
        colsAffected.add(c);
      }
    }
    collapseColumns(colsAffected);
  } else if (piece.special === 'lightning') {
    const width = maxC - minC + 1;
    const height = maxR - minR + 1;
    if (width >= height) {
      const rows = new Set();
      for (let r = minR; r <= maxR; r++) rows.add(piece.y + r);
      for (const r of [...rows].sort((a, b) => b - a)) {
        if (r >= 0 && r < ROWS) clearFullRow(r);
      }
    } else {
      const colsAffected = new Set();
      for (let c = minC; c <= maxC; c++) {
        const col = piece.x + c;
        if (col < 0 || col >= COLS) continue;
        for (let r = 0; r < ROWS; r++) board[r][col] = 0;
        colsAffected.add(col);
      }
      collapseColumns(colsAffected);
    }
  } else if (piece.special === 'tint') {
    const counts = new Array(COLORS.length).fill(0);
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (board[r][c]) counts[board[r][c]]++;
    let target = 0;
    for (let i = 1; i < counts.length; i++) {
      if (counts[i] > counts[target]) target = i;
    }
    const colsAffected = new Set();
    if (target > 0) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (board[r][c] === target) {
            board[r][c] = 0;
            colsAffected.add(c);
          }
        }
      }
    }
    collapseColumns(colsAffected);
  }
}

function ghostY() {
  let gy = current.y;
  while (!collide(current.shape, current.x, gy + 1)) gy++;
  return gy;
}

function hardDrop() {
  const gy = ghostY();
  score += (gy - current.y) * 2;
  current.y = gy;
  lockPiece();
}

function softDrop() {
  if (!collide(current.shape, current.x, current.y + 1)) {
    current.y++;
    score += 1;
    updateHUD();
  } else {
    lockPiece();
  }
}

function lockPiece() {
  merge();
  if (current.special) applyPowerUp(current);
  clearLines();
  spawn();
}

function spawn() {
  current = next;
  next = randomPiece(nextIsSpecial);
  nextIsSpecial = false;
  holdLocked = false;
  holdSection.classList.remove('hold-locked');
  if (collide(current.shape, current.x, current.y)) {
    endGame();
  }
  drawNext();
}

function holdPiece() {
  if (holdLocked) return;
  const spawnShape = t => PIECES[t].map(row => [...row]);
  const spawnX = t => Math.floor(COLS / 2) - Math.floor(spawnShape(t)[0].length / 2);
  const heldFromCurrent = { type: current.type, shape: spawnShape(current.type), special: current.special };

  if (hold === null) {
    hold = heldFromCurrent;
    spawn();
  } else {
    const swapped = hold;
    hold = heldFromCurrent;
    current = { type: swapped.type, shape: spawnShape(swapped.type), x: spawnX(swapped.type), y: 0, special: swapped.special };
    if (collide(current.shape, current.x, current.y)) endGame();
  }
  holdLocked = true;
  holdSection.classList.add('hold-locked');
  drawHold();
  updateHUD();
}

function updateHUD() {
  scoreEl.textContent = score.toLocaleString();
  linesEl.textContent = lines;
  levelEl.textContent = level;
  comboEl.textContent = combo;
  comboSection.classList.toggle('hidden', combo < 2);
}

function drawBlock(context, x, y, colorIndex, size, alpha) {
  if (!colorIndex) return;
  SKINS[currentSkin].draw(context, x, y, colorIndex, size, alpha);
}

function drawGrid() {
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 0.5;
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * BLOCK, 0);
    ctx.lineTo(c * BLOCK, ROWS * BLOCK);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * BLOCK);
    ctx.lineTo(COLS * BLOCK, r * BLOCK);
    ctx.stroke();
  }
}

function drawSpecialOverlay(context, piece, originX, originY, size) {
  if (!piece.special) return;
  const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 150);
  context.save();
  context.strokeStyle = `rgba(255, 255, 255, ${0.4 + 0.6 * pulse})`;
  context.lineWidth = 2;
  const { minR, maxR, minC, maxC } = pieceBounds(piece);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      context.strokeRect(
        (originX + c) * size + 1.5,
        (originY + r) * size + 1.5,
        size - 3,
        size - 3
      );
    }
  }
  const centerR = originY + (minR + maxR) / 2 + 0.5;
  const centerC = originX + (minC + maxC) / 2 + 0.5;
  context.font = `${size * 0.7}px sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(POWERUP_ICONS[piece.special], centerC * size, centerR * size);
  context.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  // board
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      drawBlock(ctx, c, r, board[r][c], BLOCK);

  // ghost
  const gy = ghostY();
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        drawBlock(ctx, current.x + c, gy + r, current.shape[r][c], BLOCK, 0.2);

  // current piece
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      drawBlock(ctx, current.x + c, current.y + r, current.shape[r][c], BLOCK);

  drawSpecialOverlay(ctx, current, current.x, current.y, BLOCK);

  for (const t of floatingTexts) {
    ctx.save();
    ctx.globalAlpha = t.alpha;
    ctx.fillStyle = t.color;
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 3;
    ctx.strokeText(t.text, canvas.width / 2, t.y);
    ctx.fillText(t.text, canvas.width / 2, t.y);
    ctx.restore();
  }
}

function drawPreview(context, canvasEl, piece) {
  const NB = 30;
  context.clearRect(0, 0, canvasEl.width, canvasEl.height);
  if (!piece) return;
  const shape = piece.shape;
  const offX = Math.floor((4 - shape[0].length) / 2);
  const offY = Math.floor((4 - shape.length) / 2);
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      drawBlock(context, offX + c, offY + r, shape[r][c], NB);
  drawSpecialOverlay(context, piece, offX, offY, NB);
}

function drawNext() {
  drawPreview(nextCtx, nextCanvas, next);
}

function drawHold() {
  drawPreview(holdCtx, holdCanvas, hold);
}

function endGame() {
  gameOver = true;
  cancelAnimationFrame(animId);
  overlayTitle.textContent = 'GAME OVER';
  overlayScore.textContent = `Puntuación: ${score.toLocaleString()}`;
  overlay.classList.remove('hidden');
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
  if (!paused) {
    lastTime = performance.now();
    loop(lastTime);
  } else {
    cancelAnimationFrame(animId);
    overlayTitle.textContent = 'PAUSA';
    overlayScore.textContent = '';
    overlay.classList.remove('hidden');
  }
}

function loop(ts) {
  const dt = ts - lastTime;
  lastTime = ts;
  updateFloatingTexts(dt);
  dropAccum += dt;
  if (dropAccum >= dropInterval) {
    dropAccum = 0;
    if (!collide(current.shape, current.x, current.y + 1)) {
      current.y++;
    } else {
      lockPiece();
    }
  }
  if (gameOver) return;
  draw();
  animId = requestAnimationFrame(loop);
}

function init() {
  board = createBoard();
  score = 0;
  lines = 0;
  level = 1;
  paused = false;
  gameOver = false;
  dropInterval = 1000;
  dropAccum = 0;
  lastTime = performance.now();
  linesUntilPowerUp = randomPowerUpThreshold();
  nextIsSpecial = false;
  combo = 0;
  floatingTexts = [];
  hold = null;
  holdLocked = false;
  holdSection.classList.remove('hold-locked');
  next = randomPiece(false);
  spawn();
  drawHold();
  updateHUD();
  overlay.classList.add('hidden');
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => {
  if (e.code === 'KeyP') { togglePause(); return; }
  if (paused || gameOver) return;
  switch (e.code) {
    case 'ArrowLeft':
      if (!collide(current.shape, current.x - 1, current.y)) current.x--;
      break;
    case 'ArrowRight':
      if (!collide(current.shape, current.x + 1, current.y)) current.x++;
      break;
    case 'ArrowDown':
      softDrop();
      break;
    case 'ArrowUp':
    case 'KeyX':
      tryRotate();
      break;
    case 'Space':
      e.preventDefault();
      hardDrop();
      break;
    case 'KeyC':
    case 'ShiftLeft':
    case 'ShiftRight':
      holdPiece();
      break;
  }
  updateHUD();
});

restartBtn.addEventListener('click', init);

init();
