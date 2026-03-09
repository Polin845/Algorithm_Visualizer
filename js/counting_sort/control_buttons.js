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