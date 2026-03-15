// Функции для отрисовки

let nodePositions = {};

function clearSvg(svg) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
}

function createArrowhead(svg, id, color) {
  const defs = document.createElementNS(SVG_NS, 'defs');
  const marker = document.createElementNS(SVG_NS, 'marker');
  marker.setAttribute('id', id);
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', '8');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '5');
  marker.setAttribute('markerHeight', '5');
  marker.setAttribute('orient', 'auto');
  
  const polygon = document.createElementNS(SVG_NS, 'polygon');
  polygon.setAttribute('points', '0,0 10,5 0,10');
  polygon.setAttribute('fill', color);
  
  marker.appendChild(polygon);
  defs.appendChild(marker);
  svg.appendChild(defs);
  
  return `url(#${id})`;
}

// Отрисовка ребра
function drawEdge(svg, from, to, edge, options = {}) {
  const {
    isRelaxed = false,
    isPath = false,
    isActive = false
  } = options;
  
  const fromPos = nodePositions[from];
  const toPos = nodePositions[to];
  
  if (!fromPos || !toPos) return;
  
  // Определяем цвет и толщину
  let color = '#4b5563';
  let width = 2;
  let className = 'edge-line';
  
  if (isPath) {
    color = COLORS.path;
    width = 3;
    className += ' path';
  } else if (isRelaxed) {
    color = COLORS.edge;
    width = 3;
    className += ' relaxed';
  }
  
  const line = document.createElementNS(SVG_NS, 'line');
  line.setAttribute('x1', fromPos.x);
  line.setAttribute('y1', fromPos.y);
  line.setAttribute('x2', toPos.x);
  line.setAttribute('y2', toPos.y);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', width);
  line.classList.add(className);
  
  svg.appendChild(line);
  
  // Добавляем вес ребра
  const midX = (fromPos.x + toPos.x) / 2;
  const midY = (fromPos.y + toPos.y) / 2;
  
  // Смещаем подпись в сторону
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const nx = dy / Math.sqrt(dx*dx + dy*dy);
  const ny = -dx / Math.sqrt(dx*dx + dy*dy);
  
  const textX = midX + nx * 15;
  const textY = midY + ny * 15;
  
  // Фон для текста
  const bg = document.createElementNS(SVG_NS, 'rect');
  bg.setAttribute('x', textX - 15);
  bg.setAttribute('y', textY - 12);
  bg.setAttribute('width', '30');
  bg.setAttribute('height', '24');
  bg.setAttribute('rx', '6');
  bg.setAttribute('ry', '6');
  bg.setAttribute('fill', 'rgba(0,0,0,0.8)');
  bg.classList.add('edge-text-bg');
  svg.appendChild(bg);
  
  // Текст
  const text = document.createElementNS(SVG_NS, 'text');
  text.setAttribute('x', textX);
  text.setAttribute('y', textY);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dominant-baseline', 'middle');
  text.classList.add('edge-text');
  text.textContent = edge.weight;
  svg.appendChild(text);
}

// Отрисовка вершины
function drawNode(svg, node, options = {}) {
  const {
    isActive = false,
    isVisited = false,
    isSource = false
  } = options;
  
  const pos = nodePositions[node];
  if (!pos) return;
  
  const circle = document.createElementNS(SVG_NS, 'circle');
  circle.setAttribute('cx', pos.x);
  circle.setAttribute('cy', pos.y);
  circle.setAttribute('r', NODE_RADIUS);
  circle.classList.add('node-circle');
  
  if (isActive) circle.classList.add('active');
  else if (isVisited) circle.classList.add('visited');
  else circle.classList.add('default');
  
  svg.appendChild(circle);
  
  const text = document.createElementNS(SVG_NS, 'text');
  text.setAttribute('x', pos.x);
  text.setAttribute('y', pos.y);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dominant-baseline', 'middle');
  text.classList.add('node-text');
  text.textContent = node;
  svg.appendChild(text);
}

// Отрисовка всего графа
function renderGraph(graph, step) {
  if (!graph || !graphSvg) return;
  
  clearSvg(graphSvg);
  
  // Создаем стрелки
  createArrowhead(graphSvg, 'arrow', '#4b5563');
  
  // Получаем позиции узлов
  nodePositions = generateNodePositions(graph.V(), 700, 400);
  
  // Рисуем все ребра
  for (let i = 0; i < graph.V(); i++) {
    for (let edge of graph.adjList(i)) {
      const isRelaxed = step?.relaxedEdge?.from === edge.from && 
                        step?.relaxedEdge?.to === edge.to;
      const isPath = step?.pathEdges?.some(e => e.from === edge.from && e.to === edge.to);
      
      drawEdge(graphSvg, edge.from, edge.to, edge, {
        isRelaxed,
        isPath
      });
    }
  }
  
  // Рисуем все вершины
  for (let i = 0; i < graph.V(); i++) {
    const isActive = step?.activeVertex === i;
    const isVisited = step?.visited?.includes(i);
    const isSource = i === 0;
    
    drawNode(graphSvg, i, { isActive, isVisited, isSource });
  }
}

// Отрисовка информационной панели
function renderInfoPanel(step) {
  if (!step) return;
  
  // Текущий шаг
  if (currentStepEl) {
    currentStepEl.innerHTML = step.description || '';
  }
  
  // Текущая вершина
  if (currentVertexEl) {
    currentVertexEl.textContent = step.activeVertex !== undefined ? step.activeVertex : '—';
  }
  
  // Массив расстояний
  if (distancesEl && step.dist) {
    distancesEl.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'distances-container';
    
    step.dist.forEach((d, i) => {
      const row = document.createElement('div');
      row.className = 'dist-row';
      
      const index = document.createElement('div');
      index.className = 'dist-index';
      index.textContent = i;
      
      const value = document.createElement('div');
      value.className = 'dist-value';
      if (d === Infinity) value.classList.add('infinity');
      if (step.updatedVertex === i) value.classList.add('updated');
      value.textContent = formatDistance(d);
      
      row.appendChild(index);
      row.appendChild(value);
      container.appendChild(row);
    });
    
    distancesEl.appendChild(container);
  }
  
  // Очередь
  if (queueEl && step.queue) {
    queueEl.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'queue-container';
    
    step.queue.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'queue-item';
      if (step.activeVertex === item.value) div.classList.add('current');
      
      div.innerHTML = `
        <span class="vertex">Vertex ${item.value}</span>
        <span class="priority">${formatDistance(item.priority)}</span>
      `;
      
      container.appendChild(div);
    });
    
    queueEl.appendChild(container);
  }
  
  // Дерево кратчайших путей
  if (pathTreeEl && step.pred) {
    pathTreeEl.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'path-tree';
    
    step.pred.forEach((pred, i) => {
      if (pred !== null) {
        const edge = graph.getEdge(pred, i);
        if (edge) {
          const div = document.createElement('div');
          div.className = 'path-edge';
          div.innerHTML = `
            <span class="from">${pred}</span>
            <span class="arrow">→</span>
            <span class="to">${i}</span>
            <span class="weight">${edge.weight}</span>
          `;
          container.appendChild(div);
        }
      }
    });
    
    pathTreeEl.appendChild(container);
  }
}

// Основная функция отрисовки
function renderAll(graph, step) {
  renderGraph(graph, step);
  renderInfoPanel(step);
}

// Экспорт
window.rendering = {
  renderAll,
  renderGraph,
  renderInfoPanel
};