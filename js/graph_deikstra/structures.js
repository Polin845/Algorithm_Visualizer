//----------ребро----------
class Edge {
  constructor(from, to, weight) {
    this.from = from;
    this.toVertex = to;
    this.w = weight;
  }
  to() {
    return this.toVertex;
  }

  weight() {
    return this.w;
  }
}

//----------граф----------
class WeightedGraph {
  constructor(V) {
    this.Vcount = V;
    this.adj = new Array(V).fill(null).map(() => []);
  }

  V() {
    return this.Vcount;
  }

  addEdge(e) { //добавить ребро
    const v = e.from;
    this.adj[v].push(e);
  }

  adjList(v) { //получить список смежности для вершины v
    return this.adj[v];
  }
}