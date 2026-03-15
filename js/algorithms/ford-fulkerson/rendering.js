// Функции для отрисовки графа

// Глобальный массив для отслеживания позиций подписей
let labelPositions = [];

function clearSvg(svg) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
}

function createArrowhead(svg, id, color) {
  const defs = document.createElementNS(SVG_NS, 'defs');
  const marker = document.createElementNS(SVG_NS, 'marker');
  marker.setAttribute('id', id);
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', '8'); // Уменьшено с 9
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '6'); // Уменьшено
  marker.setAttribute('markerHeight', '6'); // Уменьшено
  marker.setAttribute('orient', 'auto');
  
  const polygon = document.createElementNS(SVG_NS, 'polygon');
  polygon.setAttribute('points', '0,0 10,5 0,10');
  polygon.setAttribute('fill', color);
  
  marker.appendChild(polygon);
  defs.appendChild(marker);
  svg.appendChild(defs);
  
  return `url(#${id})`;
}

// Проверка коллизий для подписей
function checkLabelCollision(textPos, nodePositions, existingLabels, currentEdge) {
  const minDistFromNodes = 80; // Увеличено с 70
  const minDistFromLabels = 60; // Увеличено с 50
  const nodeRadius = NODE_RADIUS || 30; // Увеличено с 25
  
  // Проверка расстояния до вершин
  for (let node in nodePositions) {
    const pos = nodePositions[node];
    const dist = Math.sqrt(
      Math.pow(textPos.x - pos.x, 2) + 
      Math.pow(textPos.y - pos.y, 2)
    );
    if (dist < minDistFromNodes + nodeRadius) {
      return true;
    }
  }
  
  // Проверка расстояния до других подписей
  for (let existing of existingLabels) {
    if (existing.edgeFrom === currentEdge.from && existing.edgeTo === currentEdge.to) {
      continue;
    }
    
    const dist = Math.sqrt(
      Math.pow(textPos.x - existing.x, 2) + 
      Math.pow(textPos.y - existing.y, 2)
    );
    if (dist < minDistFromLabels) {
      return true;
    }
  }
  
  return false;
}

// Поиск оптимальной позиции для подписи
function findOptimalLabelPosition(from, to, nodePositions, existingLabels) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  const nx = dx / length;
  const ny = dy / length;
  const perpX = -ny;
  const perpY = nx;
  
  // Пробуем разные смещения (увеличены)
  const offsets = [
    { perp: 45, along: 0 },   // сверху
    { perp: -45, along: 0 },  // снизу
    { perp: 50, along: 20 },  // сверху со смещением
    { perp: -50, along: -20 }, // снизу со смещением
    { perp: 40, along: 25 },  // ближе к началу
    { perp: -40, along: -25 }, // ближе к началу снизу
    { perp: 55, along: -15 },  // дальше сверху
    { perp: -55, along: 15 },  // дальше снизу
    { perp: 60, along: 10 },   // очень далеко сверху
    { perp: -60, along: -10 }, // очень далеко снизу
  ];
  
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  
  // Сортируем смещения по предпочтению
  for (let offset of offsets) {
    const textX = midX + nx * offset.along + perpX * offset.perp;
    const textY = midY + ny * offset.along + perpY * offset.perp;
    
    // Проверяем границы (увеличены)
    if (textX < 80 || textX > 920 || textY < 70 || textY > 530) {
      continue;
    }
    
    const textPos = { x: textX, y: textY };
    
    if (!checkLabelCollision(textPos, nodePositions, existingLabels, { from, to })) {
      return textPos;
    }
  }
  
  // Если ничего не нашли, возвращаем позицию под углом
  return {
    x: midX + perpX * 45 + nx * 15,
    y: midY + perpY * 45 + ny * 15
  };
}

// Отрисовка ребра
function drawEdge(svg, from, to, options = {}, nodePositions, existingLabels) {
  const {
    color = '#4f7cff',
    width = 3, // Увеличено с 2.5
    dasharray = null,
    label = '',
    markerEnd = null,
    opacity = 1,
    isBottleneck = false,
    isSaturated = false,
    isInPath = false
  } = options;
  
  const line = document.createElementNS(SVG_NS, 'line');
  line.setAttribute('x1', from.x);
  line.setAttribute('y1', from.y);
  line.setAttribute('x2', to.x);
  line.setAttribute('y2', to.y);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', width);
  line.setAttribute('opacity', opacity);
  if (dasharray) line.setAttribute('stroke-dasharray', dasharray);
  if (markerEnd) line.setAttribute('marker-end', markerEnd);
  
  line.classList.add('edge-line');
  if (isInPath) line.classList.add('path-edge');
  if (isBottleneck) line.classList.add('bottleneck');
  if (isSaturated) line.classList.add('saturated');
  
  svg.appendChild(line);
  
  // Добавляем текст
  if (label) {
    const textPos = findOptimalLabelPosition(from, to, nodePositions, existingLabels);
    
    existingLabels.push({ 
      x: textPos.x, y: textPos.y, 
      edgeFrom: from, edgeTo: to,
      label: label 
    });
    
    // Фон для текста (увеличен)
    const bg = document.createElementNS(SVG_NS, 'rect');
    const textWidth = label.length * 12 + 30; // Увеличено с 9*8+24
    bg.setAttribute('x', textPos.x - textWidth / 2);
    bg.setAttribute('y', textPos.y - 20); // Увеличено с -16
    bg.setAttribute('width', textWidth);
    bg.setAttribute('height', 40); // Увеличено с 32
    bg.setAttribute('rx', 12); // Увеличено с 10
    bg.setAttribute('ry', 12); // Увеличено с 10
    bg.classList.add('edge-text-bg');
    if (isBottleneck) bg.classList.add('bottleneck');
    svg.appendChild(bg);
    
    // Текст (увеличен)
    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', textPos.x);
    text.setAttribute('y', textPos.y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.classList.add('edge-text');
    text.setAttribute('font-size', '18'); // Увеличено с 14
    text.textContent = label;
    svg.appendChild(text);
  }
}

// Отрисовка вершины
function drawNode(svg, node, pos, options = {}) {
  const { isSource = false, isSink = false, isActive = false, label = node.toString() } = options;
  
  const circle = document.createElementNS(SVG_NS, 'circle');
  circle.setAttribute('cx', pos.x);
  circle.setAttribute('cy', pos.y);
  circle.setAttribute('r', NODE_RADIUS);
  circle.classList.add('node-circle');
  
  if (isSource) circle.classList.add('source');
  if (isSink) circle.classList.add('sink');
  if (isActive) circle.classList.add('active');
  
  svg.appendChild(circle);
  
  const text = document.createElementNS(SVG_NS, 'text');
  text.setAttribute('x', pos.x);
  text.setAttribute('y', pos.y);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dominant-baseline', 'middle');
  text.classList.add('node-text');
  text.setAttribute('font-size', '22'); // Увеличено с 18
  text.textContent = label;
  svg.appendChild(text);
}

// Расчет позиций узлов (УВЕЛИЧЕННОЕ СОДЕРЖИМОЕ)
function calculateNodePositions(graph) {
  const positions = {};
  const nodes = Array.from(graph.nodes).sort((a, b) => a - b);
  const width = 1000;
  const height = 600;
  const margin = { x: 150, y: 120 }; // Увеличены отступы
  
  // Фиксируем исток (0) слева по центру
  const source = 0;
  positions[source] = { x: margin.x, y: height / 2 };
  
  // Фиксируем сток (максимальный узел) справа по центру
  const sink = Math.max(...nodes);
  positions[sink] = { x: width - margin.x, y: height / 2 };
  
  // Промежуточные узлы
  const middleNodes = nodes.filter(n => n !== source && n !== sink);
  
  if (middleNodes.length > 0) {
    middleNodes.sort((a, b) => a - b);
    
    // Распределение по горизонтали с большим шагом
    const startX = margin.x + 180;
    const endX = width - margin.x - 180;
    const stepX = (endX - startX) / (middleNodes.length + 1);
    
    let currentX = startX;
    
    for (let i = 0; i < middleNodes.length; i++) {
      const node = middleNodes[i];
      
      // Распределяем по вертикали с большим смещением
      let yOffset = 0;
      if (i % 3 === 0) yOffset = -100;
      else if (i % 3 === 1) yOffset = 0;
      else yOffset = 100;
      
      positions[node] = {
        x: currentX,
        y: height / 2 + yOffset
      };
      
      currentX += stepX;
    }
  }
  
  return positions;
}

// Главная функция отрисовки
function renderGraph(svg, graph, options = {}) {
  if (!graph || !svg) return;
  
  clearSvg(svg);
  
  const { 
    augmentingPath = [], 
    activeNode = null,
    bottleneckEdges = [],
    saturatedEdges = []
  } = options;
  
  // Устанавливаем viewBox, но оставляем его таким же - элементы будут крупнее
  svg.setAttribute('viewBox', '0 0 1000 600');
  
  // Создаем базовые стрелки
  const arrowDefault = createArrowhead(svg, 'arrow-default', '#4f7cff');
  
  // Получаем позиции узлов
  const nodePositions = calculateNodePositions(graph);
  
  // Сбрасываем позиции подписей
  labelPositions = [];
  
  // Получаем все ребра из графа
  const edges = Array.from(graph.edges.values());
  
  // Сортируем ребра: сначала те, у которых flow=0 (чтобы подписи не накладывались)
  edges.sort((a, b) => {
    if (a.flow > 0 && b.flow === 0) return 1;
    if (a.flow === 0 && b.flow > 0) return -1;
    return 0;
  });
  
  // Рисуем все ребра
  for (let edge of edges) {
    const fromPos = nodePositions[edge.from];
    const toPos = nodePositions[edge.to];
    
    if (!fromPos || !toPos) continue;
    
    const isInPath = augmentingPath.some(e => e.from === edge.from && e.to === edge.to);
    const isBottleneck = bottleneckEdges.some(e => e.from === edge.from && e.to === edge.to);
    const isSaturated = saturatedEdges.some(e => e.from === edge.from && e.to === edge.to);
    
    // Определяем цвет
    let color;
    if (isInPath) color = '#fbbf24';
    else if (edge.flow > 0) color = '#34d399';
    else color = '#4f7cff';
    
    // Определяем толщину (увеличена)
    let width = 3.5;
    if (isInPath) width = 6;
    else if (edge.flow > 0) width = 4.5;
    
    const label = `${edge.flow}/${edge.capacity}`;
    
    drawEdge(svg, fromPos, toPos, {
      color: color,
      width: width,
      markerEnd: arrowDefault,
      label: label,
      opacity: isSaturated ? 0.3 : 1,
      isBottleneck: isBottleneck,
      isSaturated: isSaturated,
      isInPath: isInPath
    }, nodePositions, labelPositions);
  }
  
  // Рисуем вершины
  for (let node of graph.nodes) {
    const pos = nodePositions[node];
    if (!pos) continue;
    
    drawNode(svg, node, pos, {
      isSource: node === 0,
      isSink: node === graph.getSink(),
      isActive: node === activeNode
    });
  }
}

// Основная функция renderAll
function renderAll(graph, step) {
  if (!graph) return;
  
  const graphSvg = document.getElementById('graphSvg');
  if (!graphSvg) return;
  
  renderGraph(graphSvg, graph, {
    augmentingPath: step?.augmentingPath || [],
    activeNode: step?.activeNode,
    bottleneckEdges: step?.bottleneckEdges || [],
    saturatedEdges: step?.saturatedEdges || []
  });
  
  if (window.flowValue) {
    window.flowValue.textContent = `Total flow: ${graph.getTotalFlow()}`;
  }
}

// Экспорт
window.rendering = {
  renderAll,
  renderGraph,
  calculateNodePositions
};