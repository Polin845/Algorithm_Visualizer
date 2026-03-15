// Пошаговая логика Дейкстры

// Класс для очереди с приоритетом (Min-Heap)
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
    return node;
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
    // Возвращаем отсортированную копию для отображения
    return [...this.heap].sort((a, b) => a.priority - b.priority);
  }
}

// Построение шагов алгоритма Дейкстры
function buildDijkstraSteps(graph, source = 0) {
  const steps = [];
  const V = graph.V();
  
  // Инициализация
  const dist = new Array(V).fill(Infinity);
  const pred = new Array(V).fill(null);
  const visited = new Array(V).fill(false);
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
    description: `Начинаем поиск кратчайших путей от вершины ${source}`
  });
  
  while (!pq.isEmpty()) {
    // Получаем текущее состояние очереди ДО извлечения
    const queueBefore = pq.toArray();
    
    // Выбираем вершину с минимальным расстоянием
    const v = pq.delMin();
    
    // Если вершина уже посещена, пропускаем
    if (visited[v]) continue;
    
    // Помечаем как посещенную
    visited[v] = true;
    
    steps.push({
      type: 'select_vertex',
      activeVertex: v,
      dist: [...dist],
      pred: [...pred],
      visited: [...visited],
      queue: queueBefore,
      description: `Извлекаем вершину ${v} с расстоянием ${dist[v]}`
    });
    
    steps.push({
      type: 'visit_vertex',
      activeVertex: v,
      dist: [...dist],
      pred: [...pred],
      visited: [...visited],
      queue: pq.toArray(),
      description: `Посещаем вершину ${v}`
    });
    
    // Проверяем все смежные ребра
    for (const edge of graph.adjList(v)) {
      const w = edge.to;
      const weight = edge.weight;
      
      // Пропускаем уже посещенные вершины
      if (visited[w]) continue;
      
      steps.push({
        type: 'check_edge',
        activeVertex: v,
        dist: [...dist],
        pred: [...pred],
        visited: [...visited],
        queue: pq.toArray(),
        currentEdge: { from: v, to: w, weight: weight },
        description: `Проверяем ребро (${v} → ${w}) с весом ${weight}`
      });
      
      // Релаксация
      const newDist = dist[v] + weight;
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
          relaxedEdge: { from: v, to: w, weight: weight },
          description: `Обновляем расстояние до вершины ${w}: ${oldDist === Infinity ? '∞' : oldDist} → ${newDist}`
        });
      }
    }
  }
  
  // Финальный шаг - показываем все найденные пути
  const paths = [];
  for (let i = 0; i < V; i++) {
    if (i !== source && dist[i] !== Infinity) {
      paths.push(`0 → ${i} = ${dist[i]}`);
    }
  }
  
  steps.push({
    type: 'finish',
    activeVertex: null,
    dist: [...dist],
    pred: [...pred],
    visited: [...visited],
    queue: [],
    description: `Алгоритм завершен. Найдены пути: ${paths.join(', ')}`
  });
  
  return steps;
}

// Экспорт
window.steps = {
  buildDijkstraSteps
};