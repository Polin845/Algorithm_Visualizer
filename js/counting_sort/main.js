// отмена текущей анимации, очистка истории и рендер начального состояния
function resetAndRenderFresh() { 
  setPhase("Ready", "");
  setCalcText("Generate an array, then start Counting Sort to see every step.");
  playbackRunId += 1; // cancel any running autoplay loop
  animationSteps = [];
  currentStepIndex = 0;
  isPaused = false;
  isRunning = false;
  // if for some reason input is empty, make a fresh one
  if (!input || input.length === 0) {
    console.log("resetAndRenderFresh: input empty, generating new array");
    generateArray();
  }
  renderAll(input, count, output);
  updateButtons();
}

//переключатель паузы/плей и запуск сортировки
playPauseBtn.addEventListener("click", () => {
  // If animation hasn't started yet, initialize and start
  if (animationSteps.length === 0) {
    // apply custom input if provided; otherwise keep whatever array is current
    const custom = parseCustomInput();
    if (custom) {
      input = custom.slice();
      maxValue = Math.max(...input);
      count = Array.from({ length: maxValue + 1 }, () => 0);
      output = Array.from({ length: input.length }, () => null);
      resetAndRenderFresh(); // show the custom array immediately
    }
    // Restart cleanly (also cancels any paused autoplay loop).
    playbackRunId += 1;
    isRunning = false;
    isPaused = false;

    // Build full state history, then start playback.
    animationSteps = buildAnimationSteps();
    currentStepIndex = 0;
    renderStep(animationSteps[0]);
    setPauseIcon();
    playPauseBtn.title = "Pause";
    playFromCurrent();
    updateButtons();
  } else if (isPaused || !isRunning) {
    // Resume from pause or start after reset
    isPaused = false;
    setPauseIcon();
    playFromCurrent();
    playPauseBtn.title = "Pause";
    updateButtons();
  } else {
    // Pause playback
    isPaused = true;
    setPlayIcon();
    playPauseBtn.title = "Resume";
    updateButtons();
  }
});

function setPlayIcon() {
  playPauseIcon.innerHTML =
    `<polygon points="6,4 20,12 6,20"></polygon>`;
}

function setPauseIcon() {
  playPauseIcon.innerHTML = `
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  `;
}

generateBtn.addEventListener("click", () => {
  // if array playback is in progress, cancel it and ...
  playbackRunId += 1; // abort any running loop
  isPaused = false;
  isRunning = false;

  generateArray();
  resetAndRenderFresh();

  // ensure play/pause button shows resume state since nothing is playing yet
  setPlayIcon();
  playPauseBtn.title = "Resume";
});

//---------------------пользовательский ввод---------------------
// custom input: pressing Enter should parse and render the typed array
const customInputEl = document.getElementById("customArray");
customInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const custom = parseCustomInput();
    if (custom) {
      input = custom.slice();
      maxValue = Math.max(...input);
      count = Array.from({ length: maxValue + 1 }, () => 0);
      output = Array.from({ length: input.length }, () => null);
      resetAndRenderFresh();
      setPlayIcon();
      playPauseBtn.title = "Resume";
    }
  }
});


speedSlider.addEventListener("input", () => {
  setSpeedLabel();
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

// Initial load – run immediately if DOM is ready, otherwise wait
function initialize() {
  setSpeedLabel();
  generateArray();
  resetAndRenderFresh();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
