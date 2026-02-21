// js/app.js
// Phase 1 (Person 1): Canvas setup + draw Earth + orbit rings

const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");
let debrisField = [];
let hoveredDebris = null;

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

function createDebris(count) {
    debrisField = [];

    //const orbitRadii = [150, 220, 300];
    const orbitRadii = [140, 220, 320];

    for (let i = 0; i < count; i++) {

        const orbitRadius = orbitRadii[Math.floor(Math.random() * orbitRadii.length)];
        const angle = Math.random() * Math.PI * 2;

        debrisField.push({
            orbitRadius: orbitRadius,
            angle: angle,
            speed: 0.002 + Math.random() * 0.004,
            radius: 3 + Math.random() * 4,
            type: "debris"
        });
    }
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
            ctx.fillStyle = "purple";
            ctx.shadowBlur = 0;              // remove glow for others
        }
        
        ctx.fill();
    });
    // Reset shadow to avoid affecting other drawings
    ctx.shadowBlur = 0;
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


    updateDebris();
    drawDebris();

    requestAnimationFrame(animate);

}

createDebris(50);
animate();

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
    // Show panel and populate data
    infoPanel.classList.remove('is-hidden');
    infoTitle.textContent = clickedDebris.type.charAt(0).toUpperCase() + clickedDebris.type.slice(1);
    infoFact.textContent = `Orbit radius: ${clickedDebris.orbitRadius} px | Speed: ${clickedDebris.speed.toFixed(4)} rad/frame`;
    infoMeta.textContent = `Size: ${clickedDebris.radius.toFixed(1)} px`;
  } else {
    // Hide panel if click is empty space
    infoPanel.classList.add('is-hidden');
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
    count = 50;      // default medium
  } else if (value === 'high') {
    count = 100;     // many debris
  }

  createDebris(count);  // replaces the debris field with new random debris
});