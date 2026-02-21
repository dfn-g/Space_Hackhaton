 
// grab UI elements
const infoPanel = document.getElementById("infoPanel");
const infoTitle = document.getElementById("infoTitle");
const infoFact = document.getElementById("infoFact");
const infoMeta = document.getElementById("infoMeta");
const hoverTooltip = document.getElementById("hoverTooltip");
const riskLegend = document.getElementById("riskLegend");

const closeInfoBtn = document.getElementById("closeInfo");

const toggleRiskBtn = document.getElementById("toggleRisk");
const toggleSimBtn = document.getElementById("toggleSim");

// UI State 
let riskViewOn = false;
let simRunning = false;


function makeChips(chips = []) {
  if (!chips.length) return "";
  return `<div class="chips">
    ${chips.map(c => `<span class="chip ${c.strong ? "chip--strong" : ""}">${c.text}</span>`).join("")}
  </div>`;
}

// functions to control the Info Panel 
function showInfoPanel({ name, fact, chips= [], metaHTML = "" }) {
  infoTitle.textContent = name || "Unknown Object";
  infoFact.textContent = fact || "No description available.";
  infoMeta.innerHTML = metaHTML || makeChips(chips);

  infoPanel.classList.remove("is-hidden");
  infoPanel.classList.add("is-visible");
}

function hideInfoPanel() {
  infoPanel.classList.remove("is-visible");
  infoPanel.classList.add("is-hidden");
}

// Close button
closeInfoBtn.addEventListener("click", hideInfoPanel);

// button behaviour 
toggleRiskBtn.addEventListener("click", () => {
  riskViewOn = !riskViewOn;

  toggleRiskBtn.textContent = riskViewOn ? "Risk View: On" : "Risk View: Off";
  toggleRiskBtn.classList.toggle("is-active", riskViewOn);
  riskLegend.classList.toggle("is-hidden", !riskViewOn);
  // Tell canvas logic (Person 1) that risk mode changed
  window.dispatchEvent(new CustomEvent("risk-toggle", { detail: { riskViewOn } }));
});

toggleSimBtn.addEventListener("click", () => {
  simRunning = !simRunning;

  toggleSimBtn.textContent = simRunning ? "Stop Simulation" : "Run Simulation";
  toggleSimBtn.classList.toggle("is-active", simRunning);

  window.dispatchEvent(new CustomEvent("sim-toggle", { detail: { simRunning } }));
});

// Density change
densitySelect.addEventListener("change", () => {
  const density = densitySelect.value;

  window.dispatchEvent(new CustomEvent("density-change", { detail: { density } }));
});

// ---------- Demo mode (for you now) ----------
// This lets you test the info panel even before Person 1 wires click events.
// Press "i" to open a sample info card.
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "i") {
    showInfoPanel({
      name: "Fragmentation Debris",
      fact: "Tiny fragments can travel ~28,000 km/h and damage satellites on impact.",
      metaHTML: "<div>Orbit: LEO</div><div>Type: Debris</div>",
    });
  }
});

function showTooltip(text, x, y) {
  hoverTooltip.textContent = text;
  hoverTooltip.style.left = `${x + 12}px`;
  hoverTooltip.style.top = `${y + 12}px`;
  hoverTooltip.classList.remove("is-hidden");
}

function hideTooltip() {
  hoverTooltip.classList.add("is-hidden");
}
// ---------- Export global function for Person 1 ----------
// Person 1 can call: window.UI.showInfoPanel(debrisData)
window.UI = { showInfoPanel, hideInfoPanel, showTooltip, hideTooltip };