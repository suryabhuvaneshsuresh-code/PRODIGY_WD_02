/* ==========================================================================
   STOPWATCH APP
   Beginner-friendly, well-commented vanilla JS stopwatch.
   Uses Date.now() timestamps (not a simple counter) so the displayed time
   stays accurate even if setInterval ticks are slightly delayed by the
   browser — this is the standard reliable pattern for stopwatches.
   ========================================================================== */

// ---- Grab all the DOM elements we need, once, up front ----
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const millisecondsEl = document.getElementById('milliseconds');

const startPauseBtn = document.getElementById('startPauseBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');

const statusEl = document.getElementById('status');
const tickFillEl = document.getElementById('tickFill');

const lapsList = document.getElementById('lapsList');
const lapsEmpty = document.getElementById('lapsEmpty');
const lapCountEl = document.getElementById('lapCount');

// ---- State ----
let timerId = null;        // holds the setInterval reference; null = not running
let startTimestamp = 0;    // Date.now() value when the current run started
let elapsedBeforePause = 0; // milliseconds accumulated from previous runs
let isRunning = false;
let lapTimes = [];         // array of elapsed-ms values, one per lap

const UPDATE_INTERVAL_MS = 10; // update the display every 10ms (100 fps of the MS digits)

/**
 * Converts a total-milliseconds number into { hh, mm, ss, ms } string parts,
 * each zero-padded to 2 digits.
 */
function formatTime(totalMs) {
  const totalCentiseconds = Math.floor(totalMs / 10); // we display MS as centiseconds (00-99)

  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const centiseconds = totalCentiseconds % 100;

  const pad = (num) => String(num).padStart(2, '0');

  return {
    hh: pad(hours),
    mm: pad(minutes),
    ss: pad(seconds),
    ms: pad(centiseconds),
  };
}

/**
 * Pushes the current elapsed time into the on-screen digits, and drives the
 * small progress bar that fills once per second (purely visual feedback).
 */
function renderTime(totalMs) {
  const { hh, mm, ss, ms } = formatTime(totalMs);
  hoursEl.textContent = hh;
  minutesEl.textContent = mm;
  secondsEl.textContent = ss;
  millisecondsEl.textContent = ms;

  // Fill percentage within the current second, for the tick-track bar
  const msIntoSecond = totalMs % 1000;
  tickFillEl.style.width = (msIntoSecond / 1000) * 100 + '%';
}

/** Returns the total elapsed milliseconds right now. */
function getElapsedMs() {
  if (!isRunning) return elapsedBeforePause;
  return elapsedBeforePause + (Date.now() - startTimestamp);
}

/**
 * Runs on every interval tick while the stopwatch is active.
 */
function tick() {
  renderTime(getElapsedMs());
}

// ==========================================================================
// START / PAUSE (single button, toggles behavior — this naturally prevents
// two timers from ever running at once, since Start is disabled while
// running is true and vice versa)
// ==========================================================================
function startStopwatch() {
  if (isRunning) return; // guard: never start a second interval

  isRunning = true;
  startTimestamp = Date.now();
  timerId = setInterval(tick, UPDATE_INTERVAL_MS);

  // Update button + status UI
  startPauseBtn.textContent = 'Pause';
  startPauseBtn.dataset.running = 'true';
  statusEl.dataset.state = 'running';
  statusEl.querySelector('.status-text').textContent = 'RUNNING';

  lapBtn.disabled = false;
  resetBtn.disabled = false;
}

function pauseStopwatch() {
  if (!isRunning) return;

  // Fold the time-since-start into elapsedBeforePause, then stop the interval
  elapsedBeforePause += Date.now() - startTimestamp;
  clearInterval(timerId);
  timerId = null;
  isRunning = false;

  startPauseBtn.textContent = 'Start';
  startPauseBtn.dataset.running = 'false';
  statusEl.dataset.state = 'paused';
  statusEl.querySelector('.status-text').textContent = 'PAUSED';

  lapBtn.disabled = true; // no lapping while paused
}

function toggleStartPause() {
  if (isRunning) {
    pauseStopwatch();
  } else {
    startStopwatch();
  }
}

// ==========================================================================
// RESET
// ==========================================================================
function resetStopwatch() {
  // Stop any running interval first
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }

  isRunning = false;
  elapsedBeforePause = 0;
  startTimestamp = 0;
  lapTimes = [];

  renderTime(0);
  tickFillEl.style.width = '0%';

  startPauseBtn.textContent = 'Start';
  startPauseBtn.dataset.running = 'false';
  statusEl.dataset.state = 'idle';
  statusEl.querySelector('.status-text').textContent = 'READY';

  lapBtn.disabled = true;
  resetBtn.disabled = true;

  renderLaps();
}

// ==========================================================================
// LAP
// ==========================================================================
function recordLap() {
  if (!isRunning) return;

  const currentElapsed = getElapsedMs();
  lapTimes.push(currentElapsed);
  renderLaps();
}

/**
 * Rebuilds the lap list in the DOM from the lapTimes array.
 * Also marks the fastest and slowest lap SPLIT (the gap between
 * consecutive laps, not the cumulative time) for quick visual reference.
 */
function renderLaps() {
  lapsList.innerHTML = '';
  lapCountEl.textContent = lapTimes.length;

  if (lapTimes.length === 0) {
    lapsEmpty.style.display = 'block';
    return;
  }
  lapsEmpty.style.display = 'none';

  // Compute the individual split for each lap (time since previous lap)
  const splits = lapTimes.map((time, index) => {
    const prev = index === 0 ? 0 : lapTimes[index - 1];
    return time - prev;
  });

  const fastestSplit = Math.min(...splits);
  const slowestSplit = Math.max(...splits);
  const hasVariation = fastestSplit !== slowestSplit;

  // Show most recent lap first
  for (let i = lapTimes.length - 1; i >= 0; i--) {
    const split = splits[i];
    const { hh, mm, ss, ms } = formatTime(lapTimes[i]);

    const li = document.createElement('li');
    li.className = 'lap-item';

    if (hasVariation) {
      if (split === fastestSplit) li.dataset.mark = 'fastest';
      else if (split === slowestSplit) li.dataset.mark = 'slowest';
    }

    const splitFormatted = formatTime(split);

    li.innerHTML = `
      <span class="lap-index">Lap ${i + 1}</span>
      <span class="lap-time">${hh}:${mm}:${ss}.${ms}</span>
      <span class="lap-delta">+${splitFormatted.ss}.${splitFormatted.ms}s</span>
    `;

    lapsList.appendChild(li);
  }
}

// ==========================================================================
// EVENT LISTENERS
// ==========================================================================
startPauseBtn.addEventListener('click', toggleStartPause);
lapBtn.addEventListener('click', recordLap);
resetBtn.addEventListener('click', resetStopwatch);

// Optional: keyboard shortcuts for convenience (Space = start/pause, L = lap, R = reset)
document.addEventListener('keydown', (e) => {
  // Ignore if the user is typing in an input/textarea somewhere (not present
  // here, but this keeps the app safe if extended later)
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.code === 'Space') {
    e.preventDefault(); // stop page from scrolling
    toggleStartPause();
  } else if (e.key.toLowerCase() === 'l' && !lapBtn.disabled) {
    recordLap();
  } else if (e.key.toLowerCase() === 'r' && !resetBtn.disabled) {
    resetStopwatch();
  }
});

// ---- Initial render on page load ----
renderTime(0);
renderLaps();
