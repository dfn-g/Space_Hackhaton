const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Run once at start
resizeCanvas();

// Run whenever window resizes
window.addEventListener("resize", resizeCanvas);