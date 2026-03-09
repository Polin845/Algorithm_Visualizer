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
