// Главный файл KMP

// Глобальные переменные
let isInitialized = false;

// Функция обновления кнопок
window.updateButtons = function() {
  if (window.playback) {
    window.playback.updateButtons();
  }
};

// Инициализация контролов воспроизведения
function initPlaybackControls() {
  if (window.playback) return;
  
  window.playback = new PlaybackControls({
    onPlay: () => playFromCurrent(),
    onPause: () => {},
    onStepForward: () => stepForward(),
    onStepBackward: () => stepBackward(),
    onReset: () => resetPlayback(),
    onSpeedChange: (speed) => {
      console.log('Speed changed to', speed);
    },
    canStepForward: () => currentStepIndex < animationSteps.length - 1,
    canStepBackward: () => currentStepIndex > 0,
    canReset: () => animationSteps.length > 0,
    initialSpeed: 800,
    speedMin: 200,
    speedMax: 2000,
    speedStep: 50
  });

  const playbackSection = document.getElementById('playback-section');
  if (playbackSection) {
    window.playback.mount(playbackSection);
  }
}

// Генерация примера
function generateExample() {
  const example = getRandomExample();
  text = example.text;      // из state.js
  pattern = example.pattern; // из state.js
  
  // Обновляем поля ввода
  if (textInput) textInput.value = text;      // textInput из constants.js
  if (patternInput) patternInput.value = pattern; // patternInput из constants.js
  
  // Вычисляем префикс-функцию
  pi = computePrefixFunction(pattern); // из state.js
  
  // Строим шаги анимации
  animationSteps = buildAnimationSteps(text, pattern); // из state.js
  currentStepIndex = 0; // из state.js
  foundMatches = []; // из state.js
  
  // Рендерим первый шаг
  if (animationSteps.length > 0) {
    renderAll(animationSteps[0]);
  }
  
  // Обновляем кнопки
  if (window.playback) {
    window.playback.updateButtons();
    window.playback.pause();
  }
}

// Обработка пользовательского ввода
function handleInput() {
  const newText = textInput.value.trim();      // textInput из constants.js
  const newPattern = patternInput.value.trim(); // patternInput из constants.js
  
  if (!validateInput(newText, newPattern)) return;
  
  text = newText;
  pattern = newPattern;
  
  // Вычисляем префикс-функцию
  pi = computePrefixFunction(pattern);
  
  // Строим шаги анимации
  animationSteps = buildAnimationSteps(text, pattern);
  currentStepIndex = 0;
  foundMatches = [];
  
  // Рендерим первый шаг
  if (animationSteps.length > 0) {
    renderAll(animationSteps[0]);
  }
  
  // Обновляем кнопки
  if (window.playback) {
    window.playback.updateButtons();
    window.playback.pause();
  }
}

// Функции навигации
function stepForward() {
  if (animationSteps.length === 0) return;
  if (currentStepIndex < animationSteps.length - 1) {
    currentStepIndex++;
    renderAll(animationSteps[currentStepIndex]);
    if (window.playback) window.playback.updateButtons();
  }
}

function stepBackward() {
  if (animationSteps.length === 0) return;
  if (currentStepIndex > 0) {
    currentStepIndex--;
    renderAll(animationSteps[currentStepIndex]);
    if (window.playback) window.playback.updateButtons();
  }
}

function resetPlayback() {
  if (animationSteps.length === 0) return;
  
  currentStepIndex = 0;
  renderAll(animationSteps[0]);
  
  if (window.playback) {
    window.playback.pause();
    window.playback.updateButtons();
  }
}

async function playFromCurrent() {
  if (!window.playback) return;
  if (animationSteps.length === 0) return;
  
  while (window.playback.isPlaying && currentStepIndex < animationSteps.length - 1) {
    await sleep(window.playback.getSpeed());
    
    if (!window.playback.isPlaying) break;
    
    currentStepIndex++;
    renderAll(animationSteps[currentStepIndex]);
    window.playback.updateButtons();
  }
  
  if (currentStepIndex >= animationSteps.length - 1) {
    window.playback.pause();
  }
}

// Переключение между фазами
function switchPhase(phase) {
  if (phase === 'prefix') {
    const firstPrefixIndex = animationSteps.findIndex(step => step.phase === 'prefix');
    if (firstPrefixIndex !== -1) {
      currentStepIndex = firstPrefixIndex;
      renderAll(animationSteps[currentStepIndex]);
      if (window.playback) {
        window.playback.pause();
        window.playback.updateButtons();
      }
    }
  } else if (phase === 'search') {
    const firstSearchIndex = animationSteps.findIndex(step => step.phase === 'search');
    if (firstSearchIndex !== -1) {
      currentStepIndex = firstSearchIndex;
      renderAll(animationSteps[currentStepIndex]);
      if (window.playback) {
        window.playback.pause();
        window.playback.updateButtons();
      }
    }
  }
}

// Инициализация
function initialize() {
  if (isInitialized) return;
  
  initPlaybackControls();
  
  if (generateBtn) {  // generateBtn из constants.js
    generateBtn.addEventListener('click', generateExample);
  }
  
  if (textInput) {    // textInput из constants.js
    textInput.addEventListener('change', handleInput);
    textInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') handleInput();
    });
  }
  
  if (patternInput) { // patternInput из constants.js
    patternInput.addEventListener('change', handleInput);
    patternInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') handleInput();
    });
  }
  
  // phaseTabs из constants.js
  phaseTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const phase = tab.dataset.phase;
      switchPhase(phase);
    });
  });
  
  generateExample();
  
  isInitialized = true;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}