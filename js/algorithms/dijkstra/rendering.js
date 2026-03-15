// Функции для отрисовки

let nodePositions = {};
let lastGraphV = -1;

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

function formatDistance(dist) {
  return dist === Infinity ? '∞' : dist.toString();
}

// Отрисовка ребра
function drawEdge(svg, from, to, edge, options = {}) {
  const {
    isRelaxed = false,
    isPath = false,
  } = options;
  
  const fromPos = nodePositions[from];
  const toPos = nodePositions[to];
  
  if (!fromPos || !toPos) return;
  
  // Определяем цвет и толщину
  let color = '#4b5563';
  let width = 2;
  
  if (isPath) {
    color = '#34d399';
    width = 3;
  } else if (isRelaxed) {
    color = '#fb7185';
    width = 3;
  }
  
  const line = document.createElementNS(SVG_NS, 'line');
  line.setAttribute('x1', fromPos.x);
  line.setAttribute('y1', fromPos.y);
  line.setAttribute('x2', toPos.x);
  line.setAttribute('y2', toPos.y);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', width);
  
  line.classList.add('edge-line');
  if (isPath) line.classList.add('path');
  if (isRelaxed) line.classList.add('relaxed');
  
  svg.appendChild(line);
  
  // Добавляем вес ребра
  const midX = (fromPos.x + toPos.x) / 2;
  const midY = (fromPos.y + toPos.y) / 2;
  
  // Смещаем подпись в сторону
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const length = Math.sqrt(dx*dx + dy*dy);
  if (length === 0) return;
  
  const nx = dy / length;
  const ny = -dx / length;
  
  const textX = midX + nx * 18;
  const textY = midY + ny * 18;
  
  // Фон для текста
  const bg = document.createElementNS(SVG_NS, 'rect');
  bg.setAttribute('x', textX - 18);
  bg.setAttribute('y', textY - 14);
  bg.setAttribute('width', '36');
  bg.setAttribute('height', '28');
  bg.setAttribute('rx', '10');
  bg.setAttribute('ry', '10');
  bg.setAttribute('fill', 'rgba(0,0,0,0.9)');
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
  circle.setAttribute('r', 22);
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
  
  const currentV = graph.V();
  if (currentV !== lastGraphV) {
    nodePositions = generateNodePositions(currentV, 700, 400);
    lastGraphV = currentV;
  }
  
  clearSvg(graphSvg);
  
  createArrowhead(graphSvg, 'arrow', '#4b5563');
  
  // Рисуем все ребра
  for (let i = 0; i < graph.V(); i++) {
    for (let edge of graph.adjList(i)) {
      const isRelaxed = step?.relaxedEdge?.from === edge.from && 
                        step?.relaxedEdge?.to === edge.to;
      const isPath = step?.pred && step.pred[edge.to] === edge.from;
      
      drawEdge(graphSvg, edge.from, edge.to, edge, {
        isRelaxed,
        isPath
      });
    }
  }
  
  // Рисуем все вершины
  for (let i = 0; i < graph.V(); i++) {
    const isActive = step?.activeVertex === i;
    const isVisited = step?.visited && step.visited[i];
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
  
  // Очередь с приоритетом
  if (queueEl) {
    queueEl.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'queue-container';
    
    if (!step.queue || step.queue.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'queue-empty';
      emptyDiv.textContent = 'Очередь пуста';
      container.appendChild(emptyDiv);
    } else {
      step.queue.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'queue-item';
        if (step.activeVertex === item.value) div.classList.add('current');
        
        div.innerHTML = `
          <span class="vertex">${item.value}</span>
          <span class="priority">${formatDistance(item.priority)}</span>
        `;
        
        container.appendChild(div);
      });
    }
    
    queueEl.appendChild(container);
  }
  
  // Дерево кратчайших путей
  if (pathTreeEl && step.pred) {
    pathTreeEl.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'path-tree';
    
    let hasEdges = false;
    step.pred.forEach((pred, i) => {
      if (pred !== null) {
        hasEdges = true;
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
    
    if (!hasEdges) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-state';
      emptyDiv.textContent = 'Нет построенных путей';
      container.appendChild(emptyDiv);
    }
    
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