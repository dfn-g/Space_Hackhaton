Orbit Debris Visualiser

> **BrisHack 2026** — Space Theme

An interactive, space debris simulator built for BrisHack 2026. We wanted to make the growing problem of orbital debris tangible and accessible — so we built a visualisation where you can explore real catalogued objects orbiting Earth right now.

## What is it?

Space debris is one of the most pressing but least visible threats to our future in space. Over 30,000 trackable objects orbit Earth — defunct satellites, rocket bodies, and fragments from collisions — and millions more are too small to track but large enough to cause catastrophic damage.

This simulator lets you explore that problem visually. Every dot you see represents a real object in orbit, classified by type and orbit band using real TLE (Two-Line Element) data.

##  Features

- **Real data** — Objects loaded from a real space catalogue with NORAD IDs, orbit data, and object types
- **Click any object** — See its name, type, orbit band, and an educational fact about it
- **Type filtering** — Toggle between Debris, Rocket Bodies, and Payloads with colour-coded dots
- **Orbit bands** — Objects are placed in LEO, MEO, or GEO orbits based on their real mean motion data
- **Density control** — Switch between Low, Medium, and High debris density

- ##  Project Structure

```
/
├── index.html              # Main HTML — UI layout and panels
├── css/
│   └── style.css           # All styling — dark space UI, panels, buttons
├── js/
│   ├── app.js              # Canvas, simulation logic, debris, hover & click detection
│   └── ui.js               # UI helpers — info panel, simulation toggle
├── data/
│   └── space_objects.json  # Real space object catalogue (NORAD, TLE, type, facts)
└── assets/
    └── earth_texture.png   # Equirectangular Earth texture for the rotating globe
