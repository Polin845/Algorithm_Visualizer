<<<<<<< HEAD
// main.js
let playbackInstance = null; // Сохраняем ссылку на экземпляр

function resetAndRenderFresh() { 
  setPhase("Ready", "");
  setCalcText("Generate an array, then start Counting Sort to see every step.");
  playbackRunId += 1; // cancel any running autoplay loop
  animationSteps = [];
  currentStepIndex = 0;
  isPaused = false;
  isRunning = false;

  if (!input || input.length === 0) {
    generateArray();
  }

  renderAll(input, count, output);

  if (playbackInstance) playbackInstance.updateButtons();
  
  // Сбрасываем window.playback для консистентности
  window.playback = playbackInstance;
}

// Обработчик для generate button
document.getElementById("generateBtn").addEventListener("click", () => {
  // Отменяем текущее воспроизведение
  playbackRunId += 1;
  isPaused = false;
  isRunning = false;

  generateArray();
  resetAndRenderFresh();
  
  // Обновляем состояние кнопок
  if (playbackInstance) {
    playbackInstance.pause(); // Убеждаемся, что воспроизведение остановлено
    playbackInstance.updateButtons();
  }
});

// Обработчик для custom input
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

      if (playbackInstance) {
        playbackInstance.pause();
        playbackInstance.updateButtons();
      }
    }
  }
});

function startPlayback() {
  console.log("startPlayback called", { animationStepsLength: animationSteps.length });
  
  if (animationSteps.length === 0) {
    const custom = parseCustomInput();
    if (custom) {
      input = custom.slice();
      maxValue = Math.max(...input);
      count = Array.from({ length: maxValue + 1 }, () => 0);
      output = Array.from({ length: input.length }, () => null);

      resetAndRenderFresh();
    }

    animationSteps = buildAnimationSteps();
    currentStepIndex = 0;
    renderStep(animationSteps[0]);
  }
  
  // Запускаем воспроизведение
  playFromCurrent();
}

function initPlaybackControls() {
  // Создаем только один экземпляр
  playbackInstance = new PlaybackControls({
    onPlay: () => {
      console.log("Play callback triggered");
      startPlayback();
    },
    onPause: () => {
      console.log("Pause callback triggered");
      isPaused = true;
      isRunning = false;
    },
    onStepForward: () => {
      console.log("Step forward callback triggered");
      if (animationSteps.length === 0) {
        // Если шагов нет, создаем их
        animationSteps = buildAnimationSteps();
        currentStepIndex = 0;
        renderStep(animationSteps[0]);
      } else {
        stepForward();
      }
    },
    onStepBackward: () => {
      console.log("Step backward callback triggered");
      if (animationSteps.length === 0) return;
      isPaused = true;
      isRunning = false;
      stepBackward();
    },
    onReset: () => {
      console.log("Reset callback triggered");
      if (animationSteps.length === 0) return;
      isPaused = true;
      isRunning = false;
      resetPlaybackToStart();
    },
    onSpeedChange: (speed) => {
      currentSpeed = speed;
    },
    canStepForward: () => currentStepIndex < animationSteps.length - 1,
    canStepBackward: () => currentStepIndex > 0,
    canReset: () => animationSteps.length > 0,
    initialSpeed: 350
  });

  playbackInstance.mount("#playback-section");
  
  // Сохраняем глобальную ссылку для совместимости
  window.playback = playbackInstance;
}

// Initial load
function initialize() {
  console.log("Initializing...");
  
  // Убеждаемся, что старый экземпляр не мешает
  if (playbackInstance) {
    playbackInstance.pause();
  }
  
  generateArray();
  resetAndRenderFresh();
  initPlaybackControls();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
=======
// main.js
let playbackInstance = null; // Сохраняем ссылку на экземпляр

function resetAndRenderFresh() { 
  setPhase("Ready", "");
  setCalcText("Generate an array, then start Counting Sort to see every step.");
  playbackRunId += 1; // cancel any running autoplay loop
  animationSteps = [];
  currentStepIndex = 0;
  isPaused = false;
  isRunning = false;

  if (!input || input.length === 0) {
    generateArray();
  }

  renderAll(input, count, output);

  if (playbackInstance) playbackInstance.updateButtons();
  
  // Сбрасываем window.playback для консистентности
  window.playback = playbackInstance;
}

// Обработчик для generate button
document.getElementById("generateBtn").addEventListener("click", () => {
  // Отменяем текущее воспроизведение
  playbackRunId += 1;
  isPaused = false;
  isRunning = false;

  generateArray();
  resetAndRenderFresh();
  
  // Обновляем состояние кнопок
  if (playbackInstance) {
    playbackInstance.pause(); // Убеждаемся, что воспроизведение остановлено
    playbackInstance.updateButtons();
  }
});

// Обработчик для custom input
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

      if (playbackInstance) {
        playbackInstance.pause();
        playbackInstance.updateButtons();
      }
    }
  }
});

function startPlayback() {
  console.log("startPlayback called", { animationStepsLength: animationSteps.length });
  
  if (animationSteps.length === 0) {
    const custom = parseCustomInput();
    if (custom) {
      input = custom.slice();
      maxValue = Math.max(...input);
      count = Array.from({ length: maxValue + 1 }, () => 0);
      output = Array.from({ length: input.length }, () => null);

      resetAndRenderFresh();
    }

    animationSteps = buildAnimationSteps();
    currentStepIndex = 0;
    renderStep(animationSteps[0]);
  }
  
  // Запускаем воспроизведение
  playFromCurrent();
}

function initPlaybackControls() {
  // Создаем только один экземпляр
  playbackInstance = new PlaybackControls({
    onPlay: () => {
      console.log("Play callback triggered");
      startPlayback();
    },
    onPause: () => {
      console.log("Pause callback triggered");
      isPaused = true;
      isRunning = false;
    },
    onStepForward: () => {
      console.log("Step forward callback triggered");
      if (animationSteps.length === 0) {
        // Если шагов нет, создаем их
        animationSteps = buildAnimationSteps();
        currentStepIndex = 0;
        renderStep(animationSteps[0]);
      } else {
        stepForward();
      }
    },
    onStepBackward: () => {
      console.log("Step backward callback triggered");
      if (animationSteps.length === 0) return;
      isPaused = true;
      isRunning = false;
      stepBackward();
    },
    onReset: () => {
      console.log("Reset callback triggered");
      if (animationSteps.length === 0) return;
      isPaused = true;
      isRunning = false;
      resetPlaybackToStart();
    },
    onSpeedChange: (speed) => {
      currentSpeed = speed;
    },
    canStepForward: () => currentStepIndex < animationSteps.length - 1,
    canStepBackward: () => currentStepIndex > 0,
    canReset: () => animationSteps.length > 0,
    initialSpeed: 350
  });

  playbackInstance.mount("#playback-section");
  
  // Сохраняем глобальную ссылку для совместимости
  window.playback = playbackInstance;
}

// Initial load
function initialize() {
  console.log("Initializing...");
  
  // Убеждаемся, что старый экземпляр не мешает
  if (playbackInstance) {
    playbackInstance.pause();
  }
  
  generateArray();
  resetAndRenderFresh();
  initPlaybackControls();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
>>>>>>> e11a861e7600a813384879e6fe6e310384aef388
}