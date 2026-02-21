// js/app.js
// Phase 1 (Person 1): Canvas setup + draw Earth + orbit rings

const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");

// --------- Canvas sizing (important) ----------
function resizeCanvas() {
  // Make the canvas match the displayed size (CSS) AND account for devicePixelRatio
  const dpr = window.devicePixelRatio || 1;

  // CSS size
  const cssWidth = window.innerWidth;
  const cssHeight = window.innerHeight;

  // Actual pixel buffer size
  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);

  // Set drawing scale so you can keep using CSS pixels in your math
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// --------- Scene helpers ----------
function getCenter() {
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
}

function drawBackground() {
  // simple deep-space look
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.fillStyle = "#050814";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function drawOrbitRing(cx, cy, radius) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawEarth(cx, cy) {
  // Earth body
  ctx.beginPath();
  ctx.arc(cx, cy, 75, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(80, 140, 255, 0.95)";
  ctx.fill();

  // Simple glow
  ctx.beginPath();
  ctx.arc(cx, cy, 90, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(90, 130, 255, 0.20)";
  ctx.lineWidth = 10;
  ctx.stroke();
}

function drawScene() {
  drawBackground();

  const { x: cx, y: cy } = getCenter();

  // Orbit radii (feel free to tweak)
  drawOrbitRing(cx, cy, 140); // LEO-ish
  drawOrbitRing(cx, cy, 220); // MEO-ish
  drawOrbitRing(cx, cy, 320); // GEO-ish

  drawEarth(cx, cy);
}

// --------- Animation loop ----------
function animate() {
  drawScene();
  requestAnimationFrame(animate);
}

animate();