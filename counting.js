const inputSvg = document.getElementById("inputSvg");
const countSvg = document.getElementById("countSvg");
const outputSvg = document.getElementById("outputSvg");

const generateBtn = document.getElementById("generateBtn");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const stepForwardBtn = document.getElementById("stepForwardBtn");
const stepBackBtn = document.getElementById("stepBackBtn");
const resetBtn = document.getElementById("resetBtn");
const speedSlider = document.getElementById("speed");
const speedLabel = document.getElementById("speedLabel");

const phaseBadge = document.getElementById("phaseBadge");
const calcLine = document.getElementById("calcLine");

const SVG_NS = "http://www.w3.org/2000/svg";

const SPEED_MS_BY_LEVEL = {
  1: 900,
  2: 600,
  3: 350,
  4: 200,
  5: 90,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDelayMs() {
  return SPEED_MS_BY_LEVEL[Number(speedSlider.value)] ?? 350;
}

function setSpeedLabel() {
  const v = Number(speedSlider.value);
  const text = v <= 1 ? "Very Slow" : v === 2 ? "Slow" : v === 3 ? "Medium" : v === 4 ? "Fast" : "Very Fast";
  speedLabel.textContent = text;
}

function setPhase(text, cssClass) {
  phaseBadge.textContent = text;
  phaseBadge.className = "phase-badge";
  if (cssClass) phaseBadge.classList.add(cssClass);
}

function setCalcText(html) {
  calcLine.innerHTML = html || "";
}

function clearSvg(svgEl) {
  while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
}

function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

// ---------------------------
// State
// ---------------------------

let input = [];
let maxValue = 0;
let count = [];
let output = [];

// Playback / history
let animationSteps = [];
let currentStepIndex = 0;
let isRunning = false; // autoplay loop running
let isPaused = false;
let playbackRunId = 0; // increment to cancel old autoplay loops

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateArray() {
  const length = randomInt(7, 10);
  const max = randomInt(8, 12);
  const arr = Array.from({ length }, () => randomInt(0, max));

  input = arr;
  maxValue = Math.max(...input);
  count = Array.from({ length: maxValue + 1 }, () => 0);
  output = Array.from({ length: input.length }, () => null);
}

// ---------------------------
// Rendering
// ---------------------------

function renderInputArray(arr, { activeIndex = null, dimAllExceptActive = false, placedIndex = null } = {}) {
  clearSvg(inputSvg);

  const W = 800;
  const H = 220;
  const padX = 24;
  const padTop = 18;
  const padBottom = 34;
  const chartH = H - padTop - padBottom;

  const n = arr.length;
  const gap = 10;
  const barW = n === 0 ? 0 : (W - padX * 2 - gap * (n - 1)) / n;
  const max = Math.max(1, ...arr);

  inputSvg.appendChild(
    el("text", { x: padX, y: 16, fill: "rgba(184,199,238,.95)", "font-size": 12, "font-weight": 650 }, "Value bars")
  );

  for (let i = 0; i < n; i++) {
    const v = arr[i];
    const h = (v / max) * chartH;
    const x = padX + i * (barW + gap);
    const y = padTop + (chartH - h);

    const rect = el("rect", { x, y, width: barW, height: h, rx: 10, class: "bar-rect" });
    if (dimAllExceptActive && activeIndex !== null && i !== activeIndex) rect.classList.add("dim");
    if (activeIndex !== null && i === activeIndex) rect.classList.add("active");
    if (placedIndex !== null && i === placedIndex) rect.classList.add("placed");

    const text = el("text", { x: x + barW / 2, y: y + Math.max(16, h / 2), class: "bar-text" }, String(v));
    const idx = el("text", { x: x + barW / 2, y: H - 22, class: "bar-index" }, `i=${i}`);

    inputSvg.appendChild(rect);
    inputSvg.appendChild(text);
    inputSvg.appendChild(idx);
  }
}

function renderCountArray(arr, { activeIndex = null, calcIndex = null } = {}) {
  clearSvg(countSvg);

  const W = 800;
  const H = 220;
  const padX = 18;
  const padY = 20;

  if (arr.length === 0) return;

  const cols = arr.length;
  const gap = 8;
  const cellW = (W - padX * 2 - gap * (cols - 1)) / cols;
  const cellH = 74;
  const y = 86;

  countSvg.appendChild(
    el(
      "text",
      { x: padX, y: 18, fill: "rgba(184,199,238,.95)", "font-size": 12, "font-weight": 650 },
      "Index and count"
    )
  );

  for (let i = 0; i < cols; i++) {
    const x = padX + i * (cellW + gap);
    const rect = el("rect", { x, y, width: cellW, height: cellH, rx: 10, class: "cell-rect" });
    if (activeIndex !== null && i === activeIndex) rect.classList.add("active");
    if (calcIndex !== null && i === calcIndex) rect.classList.add("calc");

    const idxLabel = el("text", { x: x + cellW / 2, y: y - 16, class: "cell-subtext" }, `index ${i}`);
    const cntLabel = el("text", { x: x + cellW / 2, y: y + 28, class: "cell-subtext" }, "count");
    const cntVal = el("text", { x: x + cellW / 2, y: y + 52, class: "cell-text" }, String(arr[i]));

    countSvg.appendChild(idxLabel);
    countSvg.appendChild(rect);
    countSvg.appendChild(cntLabel);
    countSvg.appendChild(cntVal);
  }
}

function renderOutputArray(arr, { placeIndex = null } = {}) {
  clearSvg(outputSvg);

  const W = 800;
  const H = 180;
  const padX = 18;
  const padTop = 24;

  const n = arr.length;
  if (n === 0) return;

  const gap = 10;
  const cellW = (W - padX * 2 - gap * (n - 1)) / n;
  const cellH = 80;
  const y = padTop + 38;

  outputSvg.appendChild(
    el(
      "text",
      { x: padX, y: 22, fill: "rgba(184,199,238,.95)", "font-size": 12, "font-weight": 650 },
      "Output positions"
    )
  );

  for (let i = 0; i < n; i++) {
    const x = padX + i * (cellW + gap);
    const rect = el("rect", { x, y, width: cellW, height: cellH, rx: 12, class: "cell-rect" });
    if (placeIndex !== null && i === placeIndex) rect.classList.add("place");
    if (arr[i] !== null) rect.classList.add("filled");

    const idxLabel = el("text", { x: x + cellW / 2, y: y - 14, class: "cell-subtext" }, `pos ${i}`);
    const val = arr[i] === null ? "" : String(arr[i]);
    const valText = el("text", { x: x + cellW / 2, y: y + cellH / 2, class: "cell-text" }, val);

    outputSvg.appendChild(idxLabel);
    outputSvg.appendChild(rect);
    outputSvg.appendChild(valText);
  }
}

function renderAll(
  inputArr,
  countArr,
  outputArr,
  { inputActive = null, dimInput = false, countActive = null, countCalc = null, outputPlace = null } = {}
) {
  renderInputArray(inputArr, { activeIndex: inputActive, dimAllExceptActive: dimInput });
  renderCountArray(countArr, { activeIndex: countActive, calcIndex: countCalc });
  renderOutputArray(outputArr, { placeIndex: outputPlace });
}

// ---------------------------
// Steps + playback
// ---------------------------

function cloneArray(a) {
  return a.slice();
}

function pushStep(steps, step) {
  steps.push({
    inputArray: cloneArray(step.inputArray),
    countArray: cloneArray(step.countArray),
    outputArray: cloneArray(step.outputArray),
    highlightedInputIndex: step.highlightedInputIndex ?? null,
    highlightedCountIndex: step.highlightedCountIndex ?? null,
    highlightedOutputIndex: step.highlightedOutputIndex ?? null,
    calcIndex: step.calcIndex ?? null,
    phase: step.phase,
    calcText: step.calcText ?? "",
    dimInput: Boolean(step.dimInput),
  });
}

function buildAnimationSteps() {
  const steps = [];

  const inputArray = cloneArray(input);
  const countArray = Array.from({ length: maxValue + 1 }, () => 0);
  const outputArray = Array.from({ length: inputArray.length }, () => null);

  pushStep(steps, {
    inputArray,
    countArray,
    outputArray,
    highlightedInputIndex: null,
    highlightedCountIndex: null,
    highlightedOutputIndex: null,
    phase: "counting",
    calcText: "Ready. Press Resume (or Step Forward) to begin Phase 1.",
    dimInput: false,
  });

  // PHASE 1 — Counting occurrences
  for (let i = 0; i < inputArray.length; i++) {
    const x = inputArray[i];
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: i,
      highlightedCountIndex: x,
      highlightedOutputIndex: null,
      phase: "counting",
      calcText: `Read <strong>input[${i}]</strong> = <strong>${x}</strong>. Increment <strong>count[${x}]</strong>.`,
      dimInput: true,
    });

    countArray[x] += 1;
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: i,
      highlightedCountIndex: x,
      highlightedOutputIndex: null,
      phase: "counting",
      calcText: `Incremented: <strong>count[${x}]</strong> is now <strong>${countArray[x]}</strong>.`,
      dimInput: true,
    });
  }

  // PHASE 2 — Prefix sums
  pushStep(steps, {
    inputArray,
    countArray,
    outputArray,
    highlightedInputIndex: null,
    highlightedCountIndex: null,
    highlightedOutputIndex: null,
    phase: "prefix_sum",
    calcText: "Phase 2: convert counts to prefix sums (how many elements are ≤ each index).",
    dimInput: false,
  });

  for (let i = 1; i < countArray.length; i++) {
    const before = countArray[i];
    const add = countArray[i - 1];
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: null,
      highlightedCountIndex: null,
      highlightedOutputIndex: null,
      phase: "prefix_sum",
      calcText: `Compute: <strong>count[${i}]</strong> = <strong>${before}</strong> + <strong>count[${i - 1}]</strong> (${add})`,
      dimInput: false,
      calcIndex: i,
    });

    countArray[i] = before + add;
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: null,
      highlightedCountIndex: null,
      highlightedOutputIndex: null,
      phase: "prefix_sum",
      calcText: `Updated: <strong>count[${i}]</strong> = <strong>${countArray[i]}</strong>.`,
      dimInput: false,
      calcIndex: i,
    });
  }

  // PHASE 3 — Building output (stable right-to-left)
  pushStep(steps, {
    inputArray,
    countArray,
    outputArray,
    highlightedInputIndex: null,
    highlightedCountIndex: null,
    highlightedOutputIndex: null,
    phase: "placement",
    calcText: "Phase 3: build output right-to-left. Place at count[value] - 1, then decrement.",
    dimInput: false,
  });

  for (let i = inputArray.length - 1; i >= 0; i--) {
    const x = inputArray[i];
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: i,
      highlightedCountIndex: x,
      highlightedOutputIndex: null,
      phase: "placement",
      calcText: `Take <strong>input[${i}]</strong> = <strong>${x}</strong>. Use <strong>count[${x}]</strong> to find its position.`,
      dimInput: true,
    });

    const pos = countArray[x] - 1;
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: i,
      highlightedCountIndex: x,
      highlightedOutputIndex: pos,
      phase: "placement",
      calcText: `Place <strong>${x}</strong> at output position <strong>${pos}</strong> (because count[${x}] = ${countArray[x]}).`,
      dimInput: true,
    });

    outputArray[pos] = x;
    countArray[x] -= 1;
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: i,
      highlightedCountIndex: x,
      highlightedOutputIndex: pos,
      phase: "placement",
      calcText: `Placed. Decrement: <strong>count[${x}]</strong> becomes <strong>${countArray[x]}</strong>.`,
      dimInput: true,
    });
  }

  pushStep(steps, {
    inputArray,
    countArray,
    outputArray,
    highlightedInputIndex: null,
    highlightedCountIndex: null,
    highlightedOutputIndex: null,
    phase: "done",
    calcText: "Done. The output array is sorted.",
    dimInput: false,
  });

  return steps;
}

function phaseText(phase) {
  if (phase === "counting") return { text: "Phase 1: Counting occurrences", cls: "phase1" };
  if (phase === "prefix_sum") return { text: "Phase 2: Prefix sums", cls: "phase2" };
  if (phase === "placement") return { text: "Phase 3: Building output array", cls: "phase3" };
  if (phase === "done") return { text: "Done — Output is sorted", cls: "done" };
  return { text: "Ready", cls: "" };
}

function renderStep(step) {
  if (!step) return;

  const p = phaseText(step.phase);
  setPhase(p.text, p.cls);
  setCalcText(step.calcText || "");

  const countCalcIndex = step.calcIndex ?? null;
  renderAll(step.inputArray, step.countArray, step.outputArray, {
    inputActive: step.highlightedInputIndex,
    dimInput: step.dimInput,
    countActive: step.highlightedCountIndex,
    countCalc: countCalcIndex,
    outputPlace: step.highlightedOutputIndex,
  });

  updateButtons();
}

function stepForward() {
  if (animationSteps.length === 0) return;
  currentStepIndex = clamp(currentStepIndex + 1, 0, animationSteps.length - 1);
  renderStep(animationSteps[currentStepIndex]);
}

function stepBackward() {
  if (animationSteps.length === 0) return;
  currentStepIndex = clamp(currentStepIndex - 1, 0, animationSteps.length - 1);
  renderStep(animationSteps[currentStepIndex]);
}

async function playFromCurrent() {
  if (isRunning) return;
  if (animationSteps.length === 0) return;

  const runId = ++playbackRunId;
  isRunning = true;
  updateButtons();

  try {
    while (currentStepIndex < animationSteps.length - 1) {
      if (runId !== playbackRunId) return;
      while (isPaused) {
        if (runId !== playbackRunId) return;
        await sleep(50);
      }

      await sleep(getDelayMs());

      // If user paused during the delay, wait again before advancing.
      while (isPaused) {
        if (runId !== playbackRunId) return;
        await sleep(50);
      }

      if (runId !== playbackRunId) return;
      currentStepIndex += 1;
      renderStep(animationSteps[currentStepIndex]);
    }
  } finally {
    if (runId === playbackRunId) isRunning = false;
    updateButtons();
  }
}

function resetPlaybackToStart() {
  playbackRunId += 1; // cancel any running autoplay loop
  isPaused = false;
  isRunning = false;
  currentStepIndex = 0;
  if (animationSteps.length > 0) renderStep(animationSteps[0]);
  updateButtons();
}

function updateButtons() {
  const hasSteps = animationSteps.length > 0;
  const atStart = currentStepIndex <= 0;
  const atEnd = hasSteps && currentStepIndex >= animationSteps.length - 1;

  pauseBtn.disabled = !hasSteps || !isRunning || isPaused || atEnd;
  resumeBtn.disabled = !hasSteps || atEnd || (!isPaused && isRunning);

  stepBackBtn.disabled = !hasSteps || atStart;
  stepForwardBtn.disabled = !hasSteps || atEnd;

  resetBtn.disabled = !hasSteps;

  // These should be locked only while autoplay is running (students can still step while paused).
  generateBtn.disabled = isRunning && !isPaused;
  startBtn.disabled = isRunning && !isPaused;
}

// ---------------------------
// Wire up UI
// ---------------------------

function resetAndRenderFresh() {
  setPhase("Ready", "");
  setCalcText("Generate an array, then start Counting Sort to see every step.");
  playbackRunId += 1; // cancel any running autoplay loop
  animationSteps = [];
  currentStepIndex = 0;
  isPaused = false;
  isRunning = false;
  renderAll(input, count, output);
  updateButtons();
}

generateBtn.addEventListener("click", () => {
  if (isRunning && !isPaused) return;
  generateArray();
  resetAndRenderFresh();
});

startBtn.addEventListener("click", () => {
  if (isRunning && !isPaused) return;

  // Restart cleanly (also cancels any paused autoplay loop).
  playbackRunId += 1;
  isRunning = false;
  isPaused = false;

  // Build full state history, then start playback.
  animationSteps = buildAnimationSteps();
  currentStepIndex = 0;
  renderStep(animationSteps[0]);
  playFromCurrent();
});

speedSlider.addEventListener("input", () => {
  setSpeedLabel();
});

pauseBtn.addEventListener("click", () => {
  if (animationSteps.length === 0) return;
  isPaused = true;
  updateButtons();
});

resumeBtn.addEventListener("click", () => {
  if (animationSteps.length === 0) return;
  isPaused = false;
  updateButtons();
  playFromCurrent();
});

stepForwardBtn.addEventListener("click", () => {
  if (animationSteps.length === 0) return;
  isPaused = true;
  stepForward();
});

stepBackBtn.addEventListener("click", () => {
  if (animationSteps.length === 0) return;
  isPaused = true;
  stepBackward();
});

resetBtn.addEventListener("click", () => {
  if (animationSteps.length === 0) return;
  isPaused = true;
  resetPlaybackToStart();
});

// Initial load
setSpeedLabel();
generateArray();
resetAndRenderFresh();

