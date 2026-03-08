//переключатель паузы/плей
playPauseBtn.addEventListener("click", () => {

  if (isPaused) {
    isPaused = false;
    setPauseIcon();
    playFromCurrent();
  } else {
    isPaused = true;
    setPlayIcon();
  }

  playPauseBtn.title = isPaused ? "Resume" : "Pause";
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