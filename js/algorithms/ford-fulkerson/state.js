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
  
  graph.addNode(0);
  graph.addNode(maxNode);
  
  return graph;
}

// Проверка, есть ли путь от истока к стоку через узел
function hasPathToSink(graph, node, visited = new Set()) {
  if (node === graph.getSink()) return true;
  if (visited.has(node)) return false;
  
  visited.add(node);
  
  for (let [key, edge] of graph.edges) {
    if (edge.from === node && !visited.has(edge.to)) {
      if (hasPathToSink(graph, edge.to, visited)) {
        return true;
      }
    }
  }
  
  return false;
}

// Проверка связности графа
function ensureConnectivity(graph, source, sink) {
  const visited = new Set();
  const queue = [source];
  visited.add(source);
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    for (let [key, edge] of graph.edges) {
      if (edge.from === current && !visited.has(edge.to)) {
        visited.add(edge.to);
        queue.push(edge.to);
      }
    }
  }
  
  // Если сток не достижим, добавляем прямое ребро
  if (!visited.has(sink)) {
    const capacity = randomInt(15, 25);
    graph.addEdge(source, sink, capacity);
    console.log('Added direct edge from source to sink for connectivity');
  }
  
  // Проверяем каждый узел - должен иметь путь к стоку
  for (let node of graph.nodes) {
    if (node !== sink && node !== source && !hasPathToSink(graph, node)) {
      // Узел висит в воздухе - добавляем ребро к стоку
      const capacity = randomInt(10, 20);
      graph.addEdge(node, sink, capacity);
      console.log(`Added edge from ${node} to sink to ensure connectivity`);
    }
  }
}

// Подсчет количества путей от истока к стоку
function countPathsToSink(graph) {
  const paths = [];
  const visited = new Set();
  
  function dfs(current, path) {
    if (current === graph.getSink()) {
      paths.push([...path]);
      return;
    }
    
    visited.add(current);
    
    for (let [key, edge] of graph.edges) {
      if (edge.from === current && !visited.has(edge.to)) {
        path.push(edge);
        dfs(edge.to, path);
        path.pop();
      }
    }
    
    visited.delete(current);
  }
  
  dfs(0, []);
  return paths.length;
}

// Генерация простого графа в стиле ОГЭ
function generateSimpleGraph() {
  console.log('Generating simple OGE-style graph...');
  
  // Фиксированное количество узлов для простоты
  const nodeCount = 6; // 0,1,2,3,4,5
  const graph = new Graph();
  const source = 0;
  const sink = 5;
  
  // Добавляем узлы
  for (let i = 0; i < nodeCount; i++) {
    graph.addNode(i);
  }
  
  // Создаем 3-4 простых пути с общими узлами
  
  // Путь 1: 0-1-3-5
  graph.addEdge(0, 1, randomInt(12, 20));
  graph.addEdge(1, 3, randomInt(8, 15));
  graph.addEdge(3, 5, randomInt(10, 18));
  
  // Путь 2: 0-2-4-5  
  graph.addEdge(0, 2, randomInt(10, 18));
  graph.addEdge(2, 4, randomInt(12, 20));
  graph.addEdge(4, 5, randomInt(8, 16));
  
  // Путь 3: 0-1-4-5 (общий узел 1 и 4 с первыми двумя путями)
  graph.addEdge(1, 4, randomInt(6, 12));
  
  // Путь 4: 0-2-3-5 (общий узел 2 и 3)
  graph.addEdge(2, 3, randomInt(7, 14));
  
  // Добавляем одно дополнительное ребро для разнообразия (не обязательно)
  if (Math.random() > 0.5) {
    graph.addEdge(1, 2, randomInt(5, 10));
  }
  
  // Проверяем связность - убираем висящие узлы
  ensureConnectivity(graph, source, sink);
  
  // Удаляем узлы, которые не имеют пути к стоку (кроме источника)
  const nodesToRemove = [];
  for (let node of graph.nodes) {
    if (node !== source && node !== sink && !hasPathToSink(graph, node)) {
      nodesToRemove.push(node);
    }
  }
  
  // В простом графе такое вряд ли случится, но на всякий случай
  const actualPaths = countPathsToSink(graph);
  console.log(`Generated simple graph with ${actualPaths} paths from source to sink`);
  
  return graph;
}

// Альтернативная генерация с разным количеством узлов
function generateMediumGraph() {
  console.log('Generating medium graph...');
  
  // Случайное количество узлов от 5 до 7
  const nodeCount = randomInt(5, 7);
  const graph = new Graph();
  const source = 0;
  const sink = nodeCount - 1;
  
  // Добавляем узлы
  for (let i = 0; i < nodeCount; i++) {
    graph.addNode(i);
  }
  
  // Создаем базовый скелет графа
  
  // Все узлы соединяем последовательно (гарантирует связность)
  for (let i = 0; i < nodeCount - 1; i++) {
    graph.addEdge(i, i + 1, randomInt(8, 18));
  }
  
  // Добавляем 1-2 параллельных пути
  if (nodeCount >= 5) {
    // Путь в обход
    graph.addEdge(0, 2, randomInt(10, 16));
    graph.addEdge(2, 4, randomInt(8, 14));
    
    if (nodeCount >= 6) {
      graph.addEdge(1, 3, randomInt(6, 12));
      graph.addEdge(3, 5, randomInt(9, 15));
    }
  }
  
  // Добавляем одно перекрестное ребро
  if (nodeCount >= 4) {
    graph.addEdge(1, 2, randomInt(5, 10));
  }
  
  // Проверяем связность
  ensureConnectivity(graph, source, sink);
  
  const actualPaths = countPathsToSink(graph);
  console.log(`Generated medium graph with ${actualPaths} paths from source to sink`);
  
  return graph;
}

// Основная функция генерации (используем простой вариант по умолчанию)
function generateRandomGraph() {
  // Выбираем тип генерации: 70% простой, 30% средний
  if (Math.random() < 0.7) {
    return generateSimpleGraph();
  } else {
    return generateMediumGraph();
  }
}