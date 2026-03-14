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
  marker.setAttribute('refX', '9');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '6');
  marker.setAttribute('markerHeight', '6');
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
  const minDistFromNodes = 45;
  const minDistFromLabels = 35;
  const nodeRadius = NODE_RADIUS || 20;
  
  for (let node in nodePositions) {
    const pos = nodePositions[node];
    const dist = Math.sqrt(
      Math.pow(textPos.x - pos.x, 2) + 
      Math.pow(textPos.y - pos.y, 2)
    );
    if (dist < minDistFromNodes + nodeRadius) return true;
  }
  
  for (let existing of existingLabels) {
    if (existing.edgeFrom === currentEdge.from && existing.edgeTo === currentEdge.to) continue;
    
    const dist = Math.sqrt(
      Math.pow(textPos.x - existing.x, 2) + 
      Math.pow(textPos.y - existing.y, 2)
    );
    if (dist < minDistFromLabels) return true;
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
  
  const offsets = [
    { perp: 20, along: 0 },
    { perp: -20, along: 0 },
    { perp: 25, along: 10 },
    { perp: -25, along: -10 },
    { perp: 15, along: 15 },
    { perp: -15, along: -15 },
    { perp: 30, along: -5 },
    { perp: -30, along: 5 },
  ];
  
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  
  for (let offset of offsets) {
    const textX = midX + nx * offset.along + perpX * offset.perp;
    const textY = midY + ny * offset.along + perpY * offset.perp;
    
    if (textX < 40 || textX > 860 || textY < 30 || textY > 470) continue;
    
    const textPos = { x: textX, y: textY };
    
    if (!checkLabelCollision(textPos, nodePositions, existingLabels, { from, to })) {
      return textPos;
    }
  }
  
  return { x: midX + perpX * 30, y: midY + perpY * 30 };
}

// Отрисовка ребра
function drawEdge(svg, from, to, options = {}, nodePositions, existingLabels) {
  const {
    color = '#4f7cff',
    width = 2,
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
  
  // Добавляем классы для стилизации через CSS
  line.classList.add('edge-line');
  if (isInPath) line.classList.add('path-edge');
  if (isBottleneck) line.classList.add('bottleneck');
  if (isSaturated) line.classList.add('saturated');
  
  svg.appendChild(line);
  
  // Добавляем текст
  if (label) {
    const textPos = findOptimalLabelPosition(from, to, nodePositions, existingLabels);
    
    existingLabels.push({ x: textPos.x, y: textPos.y, edgeFrom: from, edgeTo: to });
    
    // Фон для текста
    const bg = document.createElementNS(SVG_NS, 'rect');
    const textWidth = label.length * 7 + 20;
    bg.setAttribute('x', textPos.x - textWidth / 2);
    bg.setAttribute('y', textPos.y - 12);
    bg.setAttribute('width', textWidth);
    bg.setAttribute('height', 24);
    bg.setAttribute('rx', 6);
    bg.setAttribute('ry', 6);
    bg.classList.add('edge-text-bg');
    if (isBottleneck) bg.classList.add('bottleneck');
    svg.appendChild(bg);
    
    // Текст
    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', textPos.x);
    text.setAttribute('y', textPos.y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.classList.add('edge-text');
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
  text.textContent = label;
  svg.appendChild(text);
}

// Расчет позиций узлов
function calculateNodePositions(graph) {
  const positions = {};
  const nodes = Array.from(graph.nodes).sort((a, b) => a - b);
  const width = 850;
  const height = 450;
  const margin = { x: 80, y: 60 };
  
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
    
    const startX = margin.x + 100;
    const endX = width - margin.x - 100;
    
    // Группируем по слоям
    const layers = new Map();
    
    for (let node of middleNodes) {
      let minDist = Infinity;
      for (let [key, edge] of graph.edges) {
        if (edge.to === node && edge.from === source) {
          minDist = 1;
          break;
        }
      }
      if (minDist === Infinity) minDist = 2;
      layers.set(node, minDist);
    }
    
    const nodesByLayer = new Map();
    for (let [node, layer] of layers) {
      if (!nodesByLayer.has(layer)) nodesByLayer.set(layer, []);
      nodesByLayer.get(layer).push(node);
    }
    
    let currentX = startX;
    for (let layer of [1, 2, 3]) {
      const nodesInLayer = nodesByLayer.get(layer) || [];
      if (nodesInLayer.length === 0) continue;
      
      const verticalSpacing = Math.max(80, (height - 2 * margin.y) / (nodesInLayer.length + 1));
      
      for (let i = 0; i < nodesInLayer.length; i++) {
        positions[nodesInLayer[i]] = {
          x: currentX,
          y: margin.y + (i + 1) * verticalSpacing
        };
      }
      currentX += 150;
    }
    
    // Оставшиеся узлы
    const unplaced = middleNodes.filter(n => !positions[n]);
    if (unplaced.length > 0) {
      const stepX = (endX - startX) / (unplaced.length + 1);
      for (let i = 0; i < unplaced.length; i++) {
        positions[unplaced[i]] = {
          x: startX + (i + 1) * stepX,
          y: height / 2
        };
      }
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
  
  // Создаем базовые стрелки
  const arrowDefault = createArrowhead(svg, 'arrow-default', '#4f7cff');
  
  // Получаем позиции узлов
  const nodePositions = calculateNodePositions(graph);
  
  // Сбрасываем позиции подписей
  labelPositions = [];
  
  // Получаем все ребра из графа
  const edges = Array.from(graph.edges.values());
  
  // Рисуем все ребра
  for (let edge of edges) {
    const fromPos = nodePositions[edge.from];
    const toPos = nodePositions[edge.to];
    
    if (!fromPos || !toPos) continue;
    
    // Проверяем, входит ли ребро в текущий путь
    const isInPath = augmentingPath.some(e => e.from === edge.from && e.to === edge.to);
    
    // Проверяем, является ли ребро bottleneck
    const isBottleneck = bottleneckEdges.some(e => e.from === edge.from && e.to === edge.to);
    
    // Проверяем, насыщено ли ребро
    const isSaturated = saturatedEdges.some(e => e.from === edge.from && e.to === edge.to);
    
    // Определяем цвет в зависимости от состояния
    let color;
    if (isInPath) color = '#fbbf24';
    else if (edge.flow > 0) color = '#34d399';
    else color = '#4f7cff';
    
    // Определяем толщину
    let width = 2;
    if (isInPath) width = 4;
    else if (edge.flow > 0) width = 3;
    
    // Формируем подпись
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