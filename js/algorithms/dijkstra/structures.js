// Класс ребра
class Edge {
  constructor(from, to, weight) {
    this.from = from;
    this.to = to;
    this.weight = weight;
  }
}

// Класс графа
class WeightedGraph {
  constructor(V) {
    this.Vcount = V;
    this.adj = new Array(V).fill(null).map(() => []);
    this.edges = new Map(); // для быстрого доступа к ребрам
  }

  V() {
    return this.Vcount;
  }

  addEdge(edge) {
    const v = edge.from;
    this.adj[v].push(edge);
    
    // Сохраняем ребро в Map для быстрого доступа
    const key = `${edge.from}-${edge.to}`;
    this.edges.set(key, edge);
  }

  adjList(v) {
    return this.adj[v];
  }

  getEdge(from, to) {
    return this.edges.get(`${from}-${to}`);
  }

  // Парсинг графа из строки пользователя
  static fromString(input) {
    if (!input) return null;
    
    const edges = input.split(',').map(s => s.trim());
    let maxNode = 0;
    const edgeList = [];
    
    for (let edge of edges) {
      const parts = edge.split('-').map(s => parseInt(s.trim()));
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

  // Генерация случайного графа
  static generateRandom() {
    // Случайное количество узлов от 4 до 6
    const nodeCount = Math.floor(Math.random() * 3) + 4; // 4, 5 или 6
    const graph = new WeightedGraph(nodeCount);
    
    // Гарантируем связность - создаем остовное дерево
    for (let i = 0; i < nodeCount - 1; i++) {
      const weight = Math.floor(Math.random() * 10) + 1; // вес от 1 до 10
      graph.addEdge(new Edge(i, i + 1, weight));
    }
    
    // Добавляем случайные дополнительные ребра
    const extraEdges = Math.floor(Math.random() * 3) + 2; // 2-4 дополнительных ребра
    
    for (let i = 0; i < extraEdges; i++) {
      // Генерируем случайные вершины, чтобы не было петель
      let from, to;
      do {
        from = Math.floor(Math.random() * nodeCount);
        to = Math.floor(Math.random() * nodeCount);
      } while (from === to || graph.getEdge(from, to));
      
      const weight = Math.floor(Math.random() * 10) + 1;
      graph.addEdge(new Edge(from, to, weight));
    }
    
    return graph;
  }
  
  // Преобразование графа в строку для отображения в поле ввода
  toString() {
    const edges = [];
    for (let i = 0; i < this.Vcount; i++) {
      for (let edge of this.adj[i]) {
        edges.push(`${edge.from}-${edge.to}-${edge.weight}`);
      }
    }
    return edges.join(', ');
  }
}