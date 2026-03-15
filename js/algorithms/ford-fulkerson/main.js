// Глобальные переменные (graph уже объявлен в state.js, поэтому НЕ объявляем его заново)
let isInitialized = false;

// Добавьте в начало main.js новые ссылки
const currentStepEl = document.getElementById('currentStep');
const pathsListEl = document.getElementById('pathsList');
const totalSourceFlowEl = document.getElementById('totalSourceFlow');
const totalSinkFlowEl = document.getElementById('totalSinkFlow');
const edgeFlowsListEl = document.getElementById('edgeFlowsList');

// Массив для хранения найденных путей
let foundPaths = [];

// Функция обновления кнопок
window.updateButtons = function() {
    if (window.playback) {
        window.playback.updateButtons();
    }
};

// Инициализация контролов воспроизведения
function initPlaybackControls() {
    if (window.playback) return;
    
    console.log('Initializing playback controls...');
    
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
        console.log('Playback controls mounted');
    } else {
        console.error('Playback section not found!');
    }
}

// Функция генерации графа
function generateGraph() {
    console.log('Generating random graph...');
    
    // Очищаем список найденных путей
    foundPaths = [];
    
    graph = generateRandomGraph();  // graph уже объявлен в state.js
    
    animationSteps = buildAnimationSteps(graph);
    currentStepIndex = 0;
    
    if (animationSteps.length > 0) {
        renderStep(animationSteps[0]);
    }
    
    if (window.playback) {
        window.playback.updateButtons();
        window.playback.pause();
    }
    
    console.log('Graph generated');
}

// Парсинг пользовательского ввода
function handleGraphInput(e) {
    if (e.key === 'Enter') {
        const input = graphInput.value.trim();
        if (input) {
            const newGraph = parseGraphInput(input);
            if (newGraph && newGraph.edges.size > 0) {
                // Очищаем список найденных путей
                foundPaths = [];
                
                graph = newGraph;
                animationSteps = buildAnimationSteps(graph);
                currentStepIndex = 0;
                renderStep(animationSteps[0]);
                
                if (window.playback) {
                    window.playback.pause();
                    window.playback.updateButtons();
                }
            } else {
                if (augmentingPathLine) {
                    augmentingPathLine.innerHTML = 'Invalid graph format. Use: from-to-capacity, e.g. 0-1-10, 1-2-5';
                }
            }
        }
    }
}

// Функции навигации
function stepForward() {
    if (animationSteps.length === 0) return;
    if (currentStepIndex < animationSteps.length - 1) {
        currentStepIndex++;
        renderStep(animationSteps[currentStepIndex]);
        if (window.playback) window.playback.updateButtons();
    }
}

function stepBackward() {
    if (animationSteps.length === 0) return;
    if (currentStepIndex > 0) {
        currentStepIndex--;
        renderStep(animationSteps[currentStepIndex]);
        if (window.playback) window.playback.updateButtons();
    }
}

function resetPlayback() {
    if (animationSteps.length === 0) return;
    
    // Очищаем список найденных путей
    foundPaths = [];
    
    currentStepIndex = 0;
    renderStep(animationSteps[0]);
    
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
        renderStep(animationSteps[currentStepIndex]);
        window.playback.updateButtons();
    }
    
    if (currentStepIndex >= animationSteps.length - 1) {
        window.playback.pause();
    }
}

// Функция renderStep
function renderStep(step) {
  if (!step) return;
  
  const graphSvg = document.getElementById('graphSvg');
  if (!graphSvg) return;
  
  // Передаем все параметры в renderGraph
  renderGraph(graphSvg, step.graph, {
    augmentingPath: step.augmentingPath || [],
    activeNode: step.activeNode,
    bottleneckEdges: step.bottleneckEdges || [],
    saturatedEdges: step.saturatedEdges || []
  });
  
  updateInfoPanel(step);
  
  if (flowValue) {
    flowValue.textContent = `Total flow: ${step.graph.getTotalFlow()}`;
  }
  
  if (augmentingPathLine) {
    augmentingPathLine.innerHTML = step.calcText || '';
  }
}

// Функция updateInfoPanel
function updateInfoPanel(step) {
  // Текущий шаг
  if (currentStepEl) {
    currentStepEl.innerHTML = step.calcText || 'No description';
  }
  
  // Сохраняем путь если он найден
  if (step.phase === 'path-found' && step.augmentingPath.length > 0) {
    const pathStr = formatPath(step.augmentingPath);
    const bottleneck = findBottleneck(step.augmentingPath, step.graph);
    foundPaths.push({
      path: pathStr,
      bottleneck: bottleneck,
      iteration: foundPaths.length + 1
    });
  }
  
  // Отображаем все найденные пути
  if (pathsListEl) {
    if (foundPaths.length === 0) {
      pathsListEl.innerHTML = '<div class="empty-state">No paths yet</div>';
    } else {
      pathsListEl.innerHTML = foundPaths.map(p => `
        <div class="path-item">
          <span class="path">${p.path}</span>
          <span class="bottleneck">+${p.bottleneck}</span>
        </div>
      `).join('');
    }
  }
  
  // Обновляем информацию о потоке
  if (step.graph) {
    const sourceFlow = calculateSourceFlow(step.graph);
    const sinkFlow = calculateSinkFlow(step.graph);
    
    if (totalSourceFlowEl) {
      totalSourceFlowEl.textContent = sourceFlow;
    }
    if (totalSinkFlowEl) {
      totalSinkFlowEl.textContent = sinkFlow;
    }
    
    // Отображаем все ребра с потоками
    if (edgeFlowsListEl) {
      const edgesWithFlow = [];
      for (let [key, edge] of step.graph.edges) {
        if (edge.flow > 0) {
          edgesWithFlow.push(edge);
        }
      }
      
      if (edgesWithFlow.length === 0) {
        edgeFlowsListEl.innerHTML = '<div class="empty-state">No flows yet</div>';
      } else {
        edgeFlowsListEl.innerHTML = edgesWithFlow.map(edge => `
          <div class="edge-flow-item">
            <span class="edge">${edge.from} → ${edge.to}</span>
            <span class="flow">${edge.flow}</span>
            <span class="capacity">/${edge.capacity}</span>
          </div>
        `).join('');
      }
    }
  }
}

// Вспомогательные функции
function calculateSourceFlow(graph) {
  let total = 0;
  for (let [key, edge] of graph.edges) {
    if (edge.from === 0) {
      total += edge.flow;
    }
  }
  return total;
}

function calculateSinkFlow(graph) {
  const sink = graph.getSink();
  let total = 0;
  for (let [key, edge] of graph.edges) {
    if (edge.to === sink) {
      total += edge.flow;
    }
  }
  return total;
}

function findBottleneck(path, graph) {
  if (!path || path.length === 0) return 0;
  
  let bottleneck = Infinity;
  for (let edge of path) {
    const residual = graph.getResidualCapacity(edge.from, edge.to);
    bottleneck = Math.min(bottleneck, residual);
  }
  return bottleneck;
}

// Инициализация
function initialize() {
    if (isInitialized) return;
    
    console.log('Initializing Ford-Fulkerson...');
    
    initPlaybackControls();
    
    if (generateBtn) {
        generateBtn.addEventListener('click', generateGraph);
        console.log('Generate button handler attached');
    }
    
    if (graphInput) {
        graphInput.addEventListener('keydown', handleGraphInput);
        console.log('Graph input handler attached');
    }
    
    generateGraph();
    
    isInitialized = true;
    console.log('Initialization complete');
}

// Запускаем инициализацию
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}