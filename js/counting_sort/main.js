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
  // apply custom input if provided; otherwise keep whatever array is current
  const custom = parseCustomInput();
  if (custom) {
    input = custom.slice();
    maxValue = Math.max(...input);
    count = Array.from({ length: maxValue + 1 }, () => 0);
    output = Array.from({ length: input.length }, () => null);
    resetAndRenderFresh(); // show the custom array immediately
    setPauseIcon();
  playPauseBtn.title = "Pause";
  }
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
