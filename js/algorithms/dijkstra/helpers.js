// Вспомогательные функции

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Форматирование расстояния (∞ для бесконечности)
function formatDistance(dist) {
  return dist === Infinity ? '∞' : dist.toString();
}

// Генерация позиций узлов (круговая раскладка)
function generateNodePositions(nodeCount, width = 700, height = 400) {
  const positions = {};
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;
  
  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * 2 * Math.PI - Math.PI / 2;
    positions[i] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  }
  
  return positions;
}

// Получение случайного графа для примера
function getRandomExample() {
  const examples = [
    { edges: '0-1-4, 0-2-2, 1-2-1, 1-3-5, 2-3-8, 2-4-10, 3-4-2, 3-5-6, 4-5-3' },
    { edges: '0-1-2, 0-2-4, 1-2-1, 1-3-7, 2-4-3, 3-4-2, 3-5-1, 4-5-5' },
    { edges: '0-1-5, 0-2-3, 1-3-6, 1-4-2, 2-3-7, 2-4-4, 3-5-8, 4-5-1' }
  ];
  
  return examples[Math.floor(Math.random() * examples.length)];
}

// Парсинг пользовательского ввода
function parseGraphInput(input) {
  if (!input) return null;
  
  const edges = input.split(',').map(s => s.trim());
  const edgeList = [];
  let maxNode = 0;
  
  for (let edge of edges) {
    // Поддерживаем форматы: "0-1-2" или "0 1 2"
    let parts;
    if (edge.includes('-')) {
      parts = edge.split('-').map(s => parseInt(s.trim()));
    } else {
      parts = edge.split(' ').filter(s => s).map(s => parseInt(s.trim()));
    }
    
    if (parts.length === 3) {
      const [from, to, weight] = parts;
      edgeList.push(new Edge(from, to, weight));
      maxNode = Math.max(maxNode, from, to);
    }
  }
  
  if (edgeList.length === 0) return null;
  
  const graph = new WeightedGraph(maxNode + 1);
  edgeList.forEach(edge => graph.addEdge(edge));
  
  return graph;
}