<<<<<<< HEAD
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
    // Проверяем, существует ли уже такое ребро
    const key = `${from}-${to}`;
    if (this.edges.has(key)) {
      console.log(`Edge ${from}->${to} already exists, skipping`);
      return false;
    }
    
    this.addNode(from);
    this.addNode(to);
    this.edges.set(key, { from, to, capacity, flow: 0 });
    this.adjacency.get(from).add(to);
    return true;
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
      
      // Проверяем все возможные ребра
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

  // Получить все пути от истока к стоку (для проверки)
  findAllPaths() {
    const paths = [];
    const visited = new Set();
    
    function dfs(current, path) {
      if (current === this.getSink()) {
        paths.push([...path]);
        return;
      }
      
      visited.add(current);
      
      for (let [key, edge] of this.edges) {
        if (edge.from === current && !visited.has(edge.to)) {
          path.push(edge);
          dfs.call(this, edge.to, path);
          path.pop();
        }
      }
      
      visited.delete(current);
    }
    
    dfs.call(this, 0, []);
    return paths;
  }
=======
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
    // Проверяем, существует ли уже такое ребро
    const key = `${from}-${to}`;
    if (this.edges.has(key)) {
      console.log(`Edge ${from}->${to} already exists, skipping`);
      return false;
    }
    
    this.addNode(from);
    this.addNode(to);
    this.edges.set(key, { from, to, capacity, flow: 0 });
    this.adjacency.get(from).add(to);
    return true;
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
      
      // Проверяем все возможные ребра
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

  // Получить все пути от истока к стоку (для проверки)
  findAllPaths() {
    const paths = [];
    const visited = new Set();
    
    function dfs(current, path) {
      if (current === this.getSink()) {
        paths.push([...path]);
        return;
      }
      
      visited.add(current);
      
      for (let [key, edge] of this.edges) {
        if (edge.from === current && !visited.has(edge.to)) {
          path.push(edge);
          dfs.call(this, edge.to, path);
          path.pop();
        }
      }
      
      visited.delete(current);
    }
    
    dfs.call(this, 0, []);
    return paths;
  }
>>>>>>> e11a861e7600a813384879e6fe6e310384aef388
}