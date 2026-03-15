// Пошаговая логика Дейкстры

// Класс для очереди с приоритетом (адаптированный из min_heap.js)
class MinPriorityQueue {
  constructor() {
    this.heap = [];
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  insert(priority, value) {
    const node = { priority, value };
    this.heap.push(node);
    this._bubbleUp();
  }

  delMin() {
    if (this.isEmpty()) return null;
    
    const min = this.heap[0];
    const end = this.heap.pop();
    
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this._bubbleDown();
    }
    
    return min.value;
  }

  _bubbleUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
      let parent = Math.floor((index - 1) / 2);
      if (this.heap[parent].priority <= this.heap[index].priority) break;
      
      [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }

  _bubbleDown() {
    let index = 0;
    const length = this.heap.length;
    
    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let smallest = index;
      
      if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      
      if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      
      if (smallest === index) break;
      
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }

  toArray() {
    return this.heap.map(node => ({ value: node.value, priority: node.priority }));
  }
}

// Построение шагов алгоритма Дейкстры
function buildDijkstraSteps(graph, source = 0) {
  const steps = [];
  const V = graph.V();
  
  // Инициализация
  const dist = new Array(V).fill(Infinity);
  const pred = new Array(V).fill(null);
  const visited = [];
  const pq = new MinPriorityQueue();
  
  dist[source] = 0;
  pq.insert(0, source);
  
  // Начальный шаг
  steps.push({
    type: 'init',
    activeVertex: null,
    dist: [...dist],
    pred: [...pred],
    visited: [...visited],
    queue: pq.toArray(),
    description: `Initialize distances: dist[${source}] = 0, all others = ∞`
  });
  
  while (!pq.isEmpty()) {
    // Выбираем вершину с минимальным расстоянием
    const v = pq.delMin();
    
    steps.push({
      type: 'select_vertex',
      activeVertex: v,
      dist: [...dist],
      pred: [...pred],
      visited: [...visited],
      queue: pq.toArray(),
      description: `Select vertex ${v} with smallest distance = ${dist[v]}`
    });
    
    // Помечаем как посещенную
    visited.push(v);
    
    steps.push({
      type: 'visit_vertex',
      activeVertex: v,
      dist: [...dist],
      pred: [...pred],
      visited: [...visited],
      queue: pq.toArray(),
      description: `Mark vertex ${v} as visited`
    });
    
    // Проверяем все смежные ребра
    for (const edge of graph.adjList(v)) {
      const w = edge.to;
      
      steps.push({
        type: 'check_edge',
        activeVertex: v,
        dist: [...dist],
        pred: [...pred],
        visited: [...visited],
        queue: pq.toArray(),
        currentEdge: { from: v, to: w, weight: edge.weight },
        description: `Check edge (${v} → ${w}) with weight ${edge.weight}`
      });
      
      // Релаксация
      const newDist = dist[v] + edge.weight;
      if (newDist < dist[w]) {
        const oldDist = dist[w];
        dist[w] = newDist;
        pred[w] = v;
        pq.insert(newDist, w);
        
        steps.push({
          type: 'relax_edge',
          activeVertex: v,
          updatedVertex: w,
          newDist: newDist,
          oldDist: oldDist,
          dist: [...dist],
          pred: [...pred],
          visited: [...visited],
          queue: pq.toArray(),
          relaxedEdge: { from: v, to: w, weight: edge.weight },
          description: `Relax edge (${v} → ${w}): distance updated from ${formatDistance(oldDist)} to ${newDist}`
        });
      }
    }
  }
  
  // Финальный шаг
  steps.push({
    type: 'finish',
    activeVertex: null,
    dist: [...dist],
    pred: [...pred],
    visited: [...visited],
    queue: [],
    description: 'Algorithm finished. Shortest paths found!'
  });
  
  return steps;
}

// Построение дерева кратчайших путей для отображения
function buildPathTree(pred) {
  const edges = [];
  pred.forEach((from, to) => {
    if (from !== null) {
      edges.push({ from, to });
    }
  });
  return edges;
}

// Формирование описания шага
function getStepDescription(step) {
  switch (step.type) {
    case 'init':
      return 'Initialize distances';
    case 'select_vertex':
      return `Select vertex ${step.activeVertex}`;
    case 'visit_vertex':
      return `Visit vertex ${step.activeVertex}`;
    case 'check_edge':
      return `Check edge (${step.currentEdge.from} → ${step.currentEdge.to})`;
    case 'relax_edge':
      return `Update distance to vertex ${step.updatedVertex}`;
    case 'finish':
      return 'Algorithm complete';
    default:
      return '';
  }
}

// Экспорт
window.steps = {
  buildDijkstraSteps,
  buildPathTree,
  getStepDescription
};