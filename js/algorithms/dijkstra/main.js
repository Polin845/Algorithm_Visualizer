// Главный файл Дейкстры

// Глобальные переменные (только те, что НЕ объявлены в других файлах)
let isInitialized = false;

// Получаем функции рендеринга из глобального объекта
// НЕ объявляем renderAll заново!

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
    canStepForward: () => currentStepIndex < steps.length - 1,
    canStepBackward: () => currentStepIndex > 0,
    canReset: () => steps.length > 0,
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

// Генерация графа
function generateGraph() {
  console.log('Generating random graph...');
  
  // Создаем случайный граф
  graph = WeightedGraph.generateRandom();
  
  // Строим шаги алгоритма
  steps = buildDijkstraSteps(graph, 0);
  currentStepIndex = 0;
  
  // Рендерим первый шаг
  if (steps.length > 0 && window.rendering?.renderAll) {
    window.rendering.renderAll(graph, steps[0]);
  }
  
  // Обновляем поле ввода
  if (graphInput) {
    graphInput.value = graph.toString();
  }
  
  // Обновляем кнопки
  if (window.playback) {
    window.playback.updateButtons();
    window.playback.pause();
  }
  
  console.log('Graph generated with', graph.V(), 'vertices');
}

// Обработка пользовательского ввода
function handleGraphInput(e) {
  if (e.key === 'Enter') {
    const input = graphInput.value.trim();
    if (input) {
      const newGraph = WeightedGraph.fromString(input);
      if (newGraph) {
        graph = newGraph;
        
        // Строим шаги алгоритма
        steps = buildDijkstraSteps(graph, 0);
        currentStepIndex = 0;
        
        // Рендерим первый шаг
        if (steps.length > 0 && window.rendering?.renderAll) {
          window.rendering.renderAll(graph, steps[0]);
        }
        
        // Обновляем кнопки
        if (window.playback) {
          window.playback.pause();
          window.playback.updateButtons();
        }
      } else {
        if (currentStepEl) {
          currentStepEl.innerHTML = 'Invalid graph format. Use: from-to-weight, e.g. 0-1-2, 1-2-3';
        }
      }
    }
  }
}

// Функции навигации
function stepForward() {
  if (steps.length === 0) return;
  if (currentStepIndex < steps.length - 1) {
    currentStepIndex++;
    if (window.rendering?.renderAll) window.rendering.renderAll(graph, steps[currentStepIndex]);
    if (window.playback) window.playback.updateButtons();
  }
}

function stepBackward() {
  if (steps.length === 0) return;
  if (currentStepIndex > 0) {
    currentStepIndex--;
    if (window.rendering?.renderAll) window.rendering.renderAll(graph, steps[currentStepIndex]);
    if (window.playback) window.playback.updateButtons();
  }
}

function resetPlayback() {
  if (steps.length === 0) return;
  
  currentStepIndex = 0;
  if (window.rendering?.renderAll) window.rendering.renderAll(graph, steps[0]);
  
  if (window.playback) {
    window.playback.pause();
    window.playback.updateButtons();
  }
}

async function playFromCurrent() {
  if (!window.playback) return;
  if (steps.length === 0) return;
  
  while (window.playback.isPlaying && currentStepIndex < steps.length - 1) {
    await sleep(window.playback.getSpeed());
    
    if (!window.playback.isPlaying) break;
    
    currentStepIndex++;
    if (window.rendering?.renderAll) window.rendering.renderAll(graph, steps[currentStepIndex]);
    window.playback.updateButtons();
  }
  
  if (currentStepIndex >= steps.length - 1) {
    window.playback.pause();
  }
}

// Инициализация
function initialize() {
  if (isInitialized) return;
  
  console.log('Initializing Dijkstra...');
  console.log('renderAll available:', !!window.rendering?.renderAll);
  
  initPlaybackControls();
  
  if (generateBtn) {
    generateBtn.addEventListener('click', generateGraph);
  }
  
  if (graphInput) {
    graphInput.addEventListener('keydown', handleGraphInput);
  }
  
  // Генерируем начальный граф
  generateGraph();
  
  isInitialized = true;
  console.log('Dijkstra initialization complete');
}

// Запуск инициализации
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}