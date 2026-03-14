// Класс для представления графа
class Graph {
  constructor() {
    this.nodes = new Set();
    this.edges = new Map(); // key: `${from}-${to}`, value: {capacity, flow}
    this.adjacency = new Map(); // для быстрого доступа к соседям
  }

  addNode(node) {
    this.nodes.add(node);
    if (!this.adjacency.has(node)) {
      this.adjacency.set(node, new Set());
    }
  }

  addEdge(from, to, capacity) {
    this.addNode(from);
    this.addNode(to);
    const key = `${from}-${to}`;
    this.edges.set(key, { from, to, capacity, flow: 0 });
    this.adjacency.get(from).add(to);
  }

  getEdge(from, to) {
    return this.edges.get(`${from}-${to}`);
  }

  getResidualCapacity(from, to) {
    const edge = this.getEdge(from, to);
    if (edge) {
      return edge.capacity - edge.flow;
    }
    // Проверяем обратное ребро
    const reverseEdge = this.getEdge(to, from);
    if (reverseEdge) {
      return reverseEdge.flow; // Сколько можем вернуть
    }
    return 0;
  }

  addFlow(from, to, flow) {
    const edge = this.getEdge(from, to);
    if (edge) {
      edge.flow += flow;
    } else {
      // Если нет прямого ребра, значит это обратное - уменьшаем поток
      const reverseEdge = this.getEdge(to, from);
      if (reverseEdge) {
        reverseEdge.flow -= flow;
      }
    }
  }

  getTotalFlow() {
    let total = 0;
    // Суммируем поток из истока (0)
    for (let to of this.adjacency.get(0) || []) {
      const edge = this.getEdge(0, to);
      if (edge) {
        total += edge.flow;
      }
    }
    return total;
  }

  // Получить все ребра для остаточной сети
  getResidualEdges() {
    const edges = [];
    for (let [key, edge] of this.edges) {
      // Прямое ребро с остаточной capacity
      if (edge.flow < edge.capacity) {
        edges.push({
          from: edge.from,
          to: edge.to,
          capacity: edge.capacity - edge.flow,
          type: 'forward'
        });
      }
      // Обратное ребро (можно вернуть поток)
      if (edge.flow > 0) {
        edges.push({
          from: edge.to,
          to: edge.from,
          capacity: edge.flow,
          type: 'backward'
        });
      }
    }
    return edges;
  }

  // BFS для поиска увеличивающего пути
  findAugmentingPath() {
    const queue = [0];
    const parent = new Map();
    parent.set(0, null);
    
    while (queue.length > 0) {
      const current = queue.shift();
      
      if (current === this.getSink()) {
        // Нашли путь до стока
        return this.reconstructPath(parent);
      }
      
      // Проверяем все возможные ребра (прямые и обратные)
      for (let [key, edge] of this.edges) {
        // Прямое ребро с остаточной capacity
        if (edge.from === current && edge.flow < edge.capacity && !parent.has(edge.to)) {
          parent.set(edge.to, { from: current, edge: edge, type: 'forward' });
          queue.push(edge.to);
        }
        // Обратное ребро (можем вернуть поток)
        if (edge.to === current && edge.flow > 0 && !parent.has(edge.from)) {
          parent.set(edge.from, { from: current, edge: edge, type: 'backward' });
          queue.push(edge.from);
        }
      }
    }
    
    return null; // Путь не найден
  }

  reconstructPath(parent) {
    const path = [];
    let current = this.getSink();
    
    while (current !== 0) {
      const p = parent.get(current);
      if (!p) return null;
      
      path.unshift({
        from: p.type === 'forward' ? p.edge.from : p.edge.to,
        to: p.type === 'forward' ? p.edge.to : p.edge.from,
        edge: p.edge,
        type: p.type
      });
      
      current = p.from;
    }
    
    return path;
  }

  getSink() {
    return Math.max(...this.nodes);
  }

  // Создание графа по умолчанию (как в презентации)
  static createDefault() {
    const graph = new Graph();
    
    // Добавляем ребра из презентации
    graph.addEdge(0, 1, 95);
    graph.addEdge(0, 2, 32);
    graph.addEdge(0, 3, 5);
    graph.addEdge(0, 4, 6);
    graph.addEdge(0, 5, 18);
    
    graph.addEdge(1, 6, 75);
    graph.addEdge(1, 7, 57);
    
    graph.addEdge(2, 7, 9);
    
    graph.addEdge(3, 5, 24);
    graph.addEdge(3, 7, 11);
    
    graph.addEdge(4, 5, 7);
    graph.addEdge(4, 7, 81);
    
    graph.addEdge(5, 6, 20);
    graph.addEdge(5, 7, 94);
    
    graph.addEdge(6, 8, 23);
    graph.addEdge(7, 8, 16);
    
    return graph;
  }
}