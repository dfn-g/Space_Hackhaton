// js/app.js
// Phase 1 (Person 1): Canvas setup + draw Earth + orbit rings

const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");
let debrisField = [];
let hoveredDebris = null;
//let simRunning = true;   // from UI toggle 
let SPACE_DATA = null;   // whole JSON file

// --------- Earth texture (realistic) ----------
const earthImg = new Image();
earthImg.src = "assets/earth_texture.png";
let earthReady = false;
earthImg.onload = () => (earthReady = true);

// optional: slow rotation
let earthSpin = 0;

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
//returns the center in terms of css pixels
function getCenter() {
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
}

const stars = Array.from({ length: 220 }, () => ({
  x: Math.random(),
  y: Math.random(),
  r: Math.random() * 1.6,
  a: 0.25 + Math.random() * 0.75
}));

function drawBackground() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.fillStyle = "#050814";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  // stars
  for (const s of stars) {
    const x = s.x * window.innerWidth;
    const y = s.y * window.innerHeight;
    ctx.beginPath();
    ctx.arc(x, y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${s.a})`;
    ctx.fill();
  }
}

function drawOrbitRing(cx, cy, radius) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function getMeanMotion(tleLine2) {
  if (!tleLine2) return null;
  const parts = tleLine2.trim().split(/\s+/);
  const mm = parseFloat(parts[parts.length - 1]);
  return Number.isFinite(mm) ? mm : null;
}

function classifyOrbitBandFromTLE(tleLine2) {
  const mm = getMeanMotion(tleLine2);
  if (mm === null) return "LEO";        // fallback
  if (mm > 11) return "LEO";
  if (mm > 1.5) return "MEO";
  return "GEO";
}

function orbitRadiusForBand(band) {
  if (band === "LEO") return 140;
  if (band === "MEO") return 220;
  return 320;
}

function baseSpeedForBand(band) {
  if (band === "LEO") return 0.0045;
  if (band === "MEO") return 0.0028;
  return 0.0016;
}

function createDebris(count) {
    debrisField = [];

    if (!SPACE_DATA || !SPACE_DATA.objects) {
    const orbitRadii = [140, 220, 320];
    for (let i = 0; i < count; i++) {
      const orbitRadius = orbitRadii[Math.floor(Math.random() * orbitRadii.length)];
      const angle = Math.random() * Math.PI * 2;

      debrisField.push({
        orbitRadius,
        angle,
        speed: 0.002 + Math.random() * 0.004,
        radius: 3 + Math.random() * 4,
        type: "debris",
        data: null,
        band: "LEO"
      });
    }
    return;
  }
     // Use real dataset objects
  const src = SPACE_DATA.objects;
  const chosen = src.slice(0, Math.min(count, src.length));

  for (const obj of chosen) {
    const band = classifyOrbitBandFromTLE(obj?.tle?.line2);
    const orbitRadius = orbitRadiusForBand(band);

    const angle = Math.random() * Math.PI * 2;
    const speed = baseSpeedForBand(band) + Math.random() * 0.0015;

    debrisField.push({
      orbitRadius,
      angle,
      speed,
      radius: 3 + Math.random() * 3,   // keep small dots for now
      type: (obj.type || "UNKNOWN"),
      data: obj,       // store the real object here
      band             //store orbit band
    });
  }

    /*for (let i = 0; i < count; i++) {

        const orbitRadius = orbitRadii[Math.floor(Math.random() * orbitRadii.length)];
        const angle = Math.random() * Math.PI * 2;

        debrisField.push({
            orbitRadius: orbitRadius,
            angle: angle,
            speed: 0.002 + Math.random() * 0.004,
            radius: 3 + Math.random() * 4,
            type: "debris"
        });
    }*/
}

function updateDebris() {
    debrisField.forEach(obj => {
        obj.angle += obj.speed;
    });
}

function drawDebris() {
   const { x: centerX, y: centerY } = getCenter();

    debrisField.forEach(obj => {
        const x = centerX + obj.orbitRadius * Math.cos(obj.angle);
        const y = centerY + obj.orbitRadius * Math.sin(obj.angle);

        ctx.beginPath();
        ctx.arc(x, y, obj.radius, 0, Math.PI * 2);
        // Highlight if this object is hovered
        if (obj === hoveredDebris) {
            ctx.fillStyle = "yellow";        // highlight colour
            ctx.shadowColor = "white";       // optional glow
            ctx.shadowBlur = 10;
        } else {
            ctx.fillStyle = "rgba(180,140,255,0.9)";
            ctx.shadowBlur = 0;              // remove glow for others
        }
        
        ctx.fill();
    });
    // Reset shadow to avoid affecting other drawings
    ctx.shadowBlur = 0;
}

function drawEarth(cx, cy) {
  const R = 78;

  // If image not ready yet, fallback to simple circle
  if (!earthReady) {
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(70,135,255,0.95)";
    ctx.fill();
    return;
  }

  // Slight rotation each frame (very slow, subtle)
  earthSpin += 0.0008;

  // Clip a circle and draw the texture inside it
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  // Draw the equirectangular map so it "wraps" into the circle.
  // We fake rotation by shifting the texture horizontally.
  const imgW = earthImg.width;
  const imgH = earthImg.height;

  // Horizontal offset in pixels (wrap-around)
  const shift = (earthSpin * imgW) % imgW;

  // We draw twice to cover wrap-around seams
  ctx.drawImage(earthImg, -shift, 0, imgW, imgH, cx - R, cy - R, R * 2 * (imgW / imgH), R * 2);
  ctx.drawImage(earthImg, imgW - shift, 0, imgW, imgH, cx - R, cy - R, R * 2 * (imgW / imgH), R * 2);

  // Because the image aspect is 2:1, we scale it into the circle area
  // This keeps land/ocean texture visible.

  ctx.restore();

  // Subtle limb darkening for depth (matches UI, not scary)
  const limb = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, R);
  limb.addColorStop(0, "rgba(0,0,0,0)");
  limb.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = limb;
  ctx.fill();

  // Atmosphere glow (use your UI accent color)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R + 2.5, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(4, 33, 91, 0.29)";
  ctx.lineWidth = 8;
  ctx.shadowColor = "rgba(64, 104, 184, 0.67)";
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.restore();


// Soft inner rim (adds depth without a hard outline)
ctx.save();
ctx.beginPath();
ctx.arc(cx, cy, R - 0.8, 0, Math.PI * 2);
ctx.strokeStyle = "rgba(255,255,255,0.08)";
ctx.lineWidth = 2;
ctx.shadowColor = "rgba(0,0,0,0.25)";
ctx.shadowBlur = 6;
ctx.stroke();
ctx.restore();
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

    if (simRunning) updateDebris();
    
    drawDebris();

    requestAnimationFrame(animate);

}

async function loadSpaceData() {
  const res = await fetch("data/space_objects.json");
  if (!res.ok) throw new Error("Failed to load data/space_objects.json");
  return await res.json();
}

async function start() {
  SPACE_DATA = await loadSpaceData();
  createDebris(50);
  animate();
}

start().catch(console.error);

// --------- Hover detection ----------


canvas.addEventListener('mousemove', (event) => {
  // Get mouse position in CSS pixels relative to canvas
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const { x: centerX, y: centerY } = getCenter();
  const threshold = 8; // same as click threshold
  let newHover = null;
  let minDist = Infinity;

  debrisField.forEach(obj => {
    const x = centerX + obj.orbitRadius * Math.cos(obj.angle);
    const y = centerY + obj.orbitRadius * Math.sin(obj.angle);
    const dx = mouseX - x;
    const dy = mouseY - y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist <= obj.radius + threshold && dist < minDist) {
      minDist = dist;
      newHover = obj;
    }
  });

  hoveredDebris = newHover;

  // Change cursor style
  canvas.style.cursor = hoveredDebris ? 'pointer' : 'default';
});

// Clear hover when mouse leaves canvas
canvas.addEventListener('mouseleave', () => {
  hoveredDebris = null;
  canvas.style.cursor = 'default';
});


// --------- Click detection ----------
canvas.addEventListener('click', (event) => {
  // Get mouse position in CSS pixels relative to canvas
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Center of Earth (same as drawing)
  const { x: centerX, y: centerY } = getCenter();

  // Find the closest debris within a threshold
  const threshold = 8; // pixels – makes clicking easier
  let clickedDebris = null;
  let minDist = Infinity;

  debrisField.forEach(obj => {
    // Current position of debris
    const x = centerX + obj.orbitRadius * Math.cos(obj.angle);
    const y = centerY + obj.orbitRadius * Math.sin(obj.angle);

    const dx = mouseX - x;
    const dy = mouseY - y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    // Check if within object radius + threshold
    if (dist <= obj.radius + threshold && dist < minDist) {
      minDist = dist;
      clickedDebris = obj;
    }
  });

  // Get info panel elements
  const infoPanel = document.getElementById('infoPanel');
  const infoTitle = document.getElementById('infoTitle');
  const infoFact = document.getElementById('infoFact');
  const infoMeta = document.getElementById('infoMeta');

if (clickedDebris) {
  const obj = clickedDebris.data;

  const name = obj?.name || `NORAD ${obj?.noradId || "Unknown"}`;
  const fact = obj?.education || "No fact available for this object.";
  const norad = obj?.noradId || "Unknown";
  const type = obj?.type || clickedDebris.type || "UNKNOWN";
  const band = clickedDebris.band || "LEO";

  // These are your sim/visual stats
  const orbitRadius = clickedDebris.orbitRadius;
  const speed = clickedDebris.speed;
  const size = clickedDebris.radius;

  const metaHTML = `
  <div class="infoChips">
    <span class="chip chip--strong">NORAD ${norad}</span>
    <span class="chip">${type}</span>
    <span class="chip">${band}</span>
  </div>

  <div class="infoSection">
    <div class="infoSection__title">Simulation</div>
    <div class="statGrid">
      <div class="stat">
        <div class="stat__label">Orbit radius</div>
        <div class="stat__value">${orbitRadius.toFixed(0)} <span class="stat__unit">px</span></div>
      </div>
      <div class="stat">
        <div class="stat__label">Speed</div>
        <div class="stat__value">${speed.toFixed(4)} <span class="stat__unit">rad/frame</span></div>
      </div>
      <div class="stat">
        <div class="stat__label">Size</div>
        <div class="stat__value">${size.toFixed(1)} <span class="stat__unit">px</span></div>
      </div>
    </div>
  </div>

  <div class="infoSection">
    <div class="infoSection__title">About this object</div>
    <div class="infoKeyValue">
      <div class="kv"><span>Catalog ID</span><span>${norad}</span></div>
      <div class="kv"><span>Orbit band</span><span>${band}</span></div>
      <div class="kv"><span>Type</span><span>${type}</span></div>
    </div>
  </div>
`;

  window.UI?.showInfoPanel({
    name,
    fact,
    metaHTML   // 👈 this goes under the fact
  });
} else {
  window.UI?.hideInfoPanel?.();
}  
});

// Close button functionality
document.getElementById('closeInfo').addEventListener('click', () => {
  document.getElementById('infoPanel').classList.add('is-hidden');
});

// --------- Density control (Phase 4) ----------
const densitySelect = document.getElementById('densitySelect');

densitySelect.addEventListener('change', (event) => {
  const value = event.target.value;
  let count;

  if (value === 'low') {
    count = 20;      // few debris
  } else if (value === 'medium') {
    count = 70;      // default medium
  } else if (value === 'high') {
    count = 250;     // many debris
  }

  createDebris(count);  // replaces the debris field with new random debris
});

// Help modal functionality
const helpButton = document.getElementById('helpButton');
const helpModal = document.getElementById('helpModal');
const closeHelp = document.getElementById('closeHelp');

if (helpButton && helpModal && closeHelp) {
  helpButton.addEventListener('click', () => {
    helpModal.classList.remove('is-hidden');
  });

  closeHelp.addEventListener('click', () => {
    helpModal.classList.add('is-hidden');
  });

  // Close modal when clicking outside the modal content
  helpModal.addEventListener('click', (event) => {
    if (event.target === helpModal) {
      helpModal.classList.add('is-hidden');
    }
  });
} else {
  console.warn('Help button or modal elements not found in DOM.');
}