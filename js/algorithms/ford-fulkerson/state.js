// Глобальное состояние
let graph = null;
let animationSteps = [];
let currentStepIndex = 0;
let nodePositions = {};

// Функции для работы с состоянием
function cloneGraph(original) {
  if (!original) return null;
  
  const clone = new Graph();
  for (let [key, edge] of original.edges) {
    clone.addEdge(edge.from, edge.to, edge.capacity);
    const clonedEdge = clone.getEdge(edge.from, edge.to);
    clonedEdge.flow = edge.flow;
  }
  return clone;
}

function calculateNodePositions(nodeCount) {
  // Если есть предопределенные позиции для этого количества узлов
  if (nodeCount <= 9) {
    return { ...DEFAULT_POSITIONS };
  }
  
  // Иначе генерируем позиции по кругу
  const positions = {};
  const centerX = 400;
  const centerY = 200;
  const radius = 150;
  
  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * 2 * Math.PI - Math.PI / 2;
    positions[i] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  }
  
  return positions;
}

// Парсинг пользовательского ввода
function parseGraphInput(input) {
  if (!input) return null;
  
  const edges = input.split(',').map(s => s.trim());
  const graph = new Graph();
  let maxNode = 0;
  
  for (let edge of edges) {
    const parts = edge.split('-').map(s => parseInt(s.trim()));
    if (parts.length === 3) {
      const [from, to, capacity] = parts;
      graph.addEdge(from, to, capacity);
      maxNode = Math.max(maxNode, from, to);
    }
  }
  
  // Убедимся, что исток (0) и сток (maxNode) существуют
  graph.addNode(0);
  graph.addNode(maxNode);
  
  return graph;
}

// Генерация случайного графа
function generateRandomGraph() {
    console.log('Generating random graph...');
    
    // Случайное количество узлов от 4 до 7 (чтобы поместились на экране)
    const nodeCount = randomInt(4, 7);
    const graph = new Graph();
    
    // Добавляем узлы
    for (let i = 0; i < nodeCount; i++) {
        graph.addNode(i);
    }
    
    const source = 0;
    const sink = nodeCount - 1;
    
    // Создаем несколько путей от истока к стоку для интереса
    
    // Путь 1: прямой путь через последовательные узлы
    let prev = source;
    for (let i = 1; i < sink; i++) {
        if (Math.random() > 0.3) {
            const capacity = randomInt(10, 30);
            graph.addEdge(prev, i, capacity);
            prev = i;
        }
    }
    // Соединяем последний промежуточный с стоком
    if (prev !== sink) {
        const capacity = randomInt(15, 35);
        graph.addEdge(prev, sink, capacity);
    }
    
    // Путь 2: альтернативный путь через другие узлы
    if (nodeCount > 3) {
        const mid1 = Math.floor(nodeCount / 2);
        const mid2 = mid1 + 1;
        
        if (mid2 < sink) {
            const cap1 = randomInt(8, 20);
            const cap2 = randomInt(8, 20);
            const cap3 = randomInt(8, 20);
            
            graph.addEdge(source, mid1, cap1);
            graph.addEdge(mid1, mid2, cap2);
            graph.addEdge(mid2, sink, cap3);
        }
    }
    
    // Добавляем случайные дополнительные ребра
    const extraEdgesCount = randomInt(2, 4);
    for (let e = 0; e < extraEdgesCount; e++) {
        const from = randomInt(0, sink - 1);
        const to = randomInt(from + 1, sink);
        
        if (from !== to && !graph.getEdge(from, to)) {
            const capacity = randomInt(5, 25);
            graph.addEdge(from, to, capacity);
        }
    }
    
    // Проверяем связность
    ensureConnectivity(graph, source, sink);
    
    console.log('Random graph generated:', graph);
    return graph;
}

// Проверка связности графа
function ensureConnectivity(graph, source, sink) {
    // Простой BFS для проверки пути от source к sink
    const visited = new Set();
    const queue = [source];
    
    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);
        
        for (let [key, edge] of graph.edges) {
            if (edge.from === current && !visited.has(edge.to)) {
                queue.push(edge.to);
            }
        }
    }
    
    // Если sink не достижим, добавляем прямое ребро
    if (!visited.has(sink)) {
        const capacity = randomInt(20, 40);
        graph.addEdge(source, sink, capacity);
        console.log('Added direct edge from source to sink for connectivity');
    }
}