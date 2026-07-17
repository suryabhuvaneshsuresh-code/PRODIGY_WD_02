# Task-02 — Stopwatch Web Application

A fully functional, responsive stopwatch built with **plain HTML, CSS, and JavaScript** — no frameworks, no libraries. Built for the Prodigy InfoTech Web Development Internship.

![Tech](https://img.shields.io/badge/HTML-CSS-JS-orange)

---

## 📁 Folder Structure

```
Task-02/
│── index.html      # Page structure & markup
│── style.css        # Visual design, layout, responsiveness
│── script.js         # Timer logic, event handling, lap tracking
│── README.md       # This file
```

---

## 🚀 How to Run the Project

No build tools or installs required.

1. Download / clone the `Task-02` folder.
2. Double-click **`index.html`** — it opens directly in any modern browser (Chrome, Edge, Firefox, Safari).

**Optional — run via a local server** (recommended if your browser blocks local file access for any reason):

```bash
cd Task-02
python3 -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.

---

## ✨ Features

- **Start / Pause** — single toggle button, clearly labeled and color-coded
- **Reset** — clears the timer and all recorded laps
- **Lap** — records a split while the stopwatch is running
- **HH:MM:SS:MS display** — updates every 10ms for a smooth, centisecond-accurate readout
- **Lap list** — newest lap at the top, with the split time (time since previous lap) shown alongside each entry, and the fastest/slowest splits highlighted
- **Single-timer safety** — Start is only actionable when not already running, so it's impossible to spawn two overlapping `setInterval` timers
- **Keyboard shortcuts** — `Space` = Start/Pause, `L` = Lap, `R` = Reset
- **Fully responsive** — scales cleanly from small phones to desktop
- **Accessible** — visible keyboard focus states, `prefers-reduced-motion` respected

---

## 🗂️ File-by-File Explanation

### `index.html`
Defines the page structure: a centered card containing a header (brand + running status), the four-segment time display (`HH`, `MM`, `SS`, `MS`), a thin progress "tick track" bar, the three control buttons (Lap, Start/Pause, Reset), and the lap-history list. Every dynamic element has an `id` so `script.js` can target it directly.

### `style.css`
Implements a dark **chronograph-instrument** visual style — a graphite panel with a warm amber "lit dial" accent and a teal marker for lap activity, using `Space Grotesk` for UI text and `JetBrains Mono` for the numeric time readout (monospaced digits prevent the display from jittering as numbers change). Includes:
- Responsive sizing with `clamp()` for the time digits
- Hover/active states and smooth transitions on all buttons
- A `data-state` driven status indicator (idle / running / paused)
- Mobile breakpoint (`max-width: 420px`) and a wider desktop layout (`min-width: 600px`)

### `script.js`
Contains all the logic, organized into clearly commented sections:
- **Timing engine** — uses `Date.now()` timestamps (not a naive incrementing counter) combined with `setInterval()` / `clearInterval()`, so displayed time stays accurate even if the browser delays a tick
- **`formatTime()`** — converts raw milliseconds into zero-padded `HH`, `MM`, `SS`, `MS` strings
- **Start/Pause/Reset/Lap handlers** — each updates both the internal state and the relevant UI (button labels, disabled states, status indicator)
- **`renderLaps()`** — rebuilds the lap list from an array of recorded lap times, calculating and highlighting the fastest/slowest split
- **Guard logic** — the Start button becomes a "Pause" action while running, so a second interval can never be created; Lap and Reset are disabled/enabled at the right moments to prevent invalid states (e.g. lapping while paused)

---

## 🧪 Testing Notes

- Verified with `node --check script.js` — no syntax errors
- All `id` references in `script.js` cross-checked against `index.html` — no mismatches
- Manually traced every state transition (idle → running → paused → running → reset) to confirm no double timers, no stuck disabled buttons, and no console errors
