class Dijkstra {
  
  constructor(G, s) {
    const V = G.V();
    //-----
    this.steps = []; //для записи состояния
    //----
    this.dist = new Array(V).fill(Infinity);
    this.pred = new Array(V).fill(null);

    const marked = new Array(V).fill(false);

    this.pq = new MinPQplus(); // очередь

    this.dist[s] = 0;
    this.pq.put(this.dist[s], s);

    //----снимок инициализиции
    this.pushStep({
    type: "init",
    start: s
    });
    //---------

    while (!this.pq.isEmpty()) {

      const v = this.pq.delMin();

      //----выбор вершины
      this.pushStep({
      type: "select_vertex",
      vertex: v
    });
      //-------

      if (marked[v]) continue;

      marked[v] = true;

      //----посещение вершины
      this.pushStep({
      type: "visit_vertex",
      vertex: v
      }); 
      //-------

      for (const e of G.adjList(v)) {

        const w = e.to();

        //----рассмотрение ребра
        this.pushStep({
          type: "check_edge",
          from: v,
          to: w,
          weight: e.weight()
        });
        //---------

        if (this.dist[w] > this.dist[v] + e.weight()) {

          this.dist[w] = this.dist[v] + e.weight();
          this.pred[w] = e;

          //-----расслабление
          this.pushStep({
            type: "relax_edge",
            from: v,
            to: w,
            newDist: this.dist[w],
            updatedVertex: w
          });
          //-------

          this.pq.insert(this.dist[w], w);

          //----добавление в очередь
          this.pushStep({
            type: "push_queue",
            vertex: w,
            priority: this.dist[w]
          });
          //------
        }
      }
    }
    //-----конец
    this.pushStep({
    type: "finish"
    });
    //------
  }
  pushStep(state) { //метод для записи состояния
  this.steps.push({
    ...state,
    dist: [...this.dist],
    pred: [...this.pred],
    queue: this.pq ? this.pq.toArray() : []
  });
  } 
}

generateGraphBtn.addEventListener("click", () => {
   somefunc();
});


//------------временно!! проверка----------
let player;

function somefunc(){
  const g = new WeightedGraph(15);
  g.addEdge(new Edge(0,1,2));
  g.addEdge(new Edge(0,2,4));
  g.addEdge(new Edge(1,2,1));
  g.addEdge(new Edge(1,3,7));
  g.addEdge(new Edge(2,4,3));
  g.addEdge(new Edge(4,3,2));
  g.addEdge(new Edge(4,5,7));
  g.addEdge(new Edge(5,6,2));

  const width = 600;
  const height = 400;
  const nodePositions = generateCircleLayout(
    g.V(),
    width,
    height
  );

  const d = new Dijkstra(g, 0);
  const renderer = new Renderer(g, nodePositions);
  const statePanel = new StatePanel();
  player = new StepPlayer(d.steps, renderer, statePanel);
  console.log("nfdfopdjopfjsf0j");

}

nextBtn.addEventListener("click", () => {
  player.next();
});

prevBtn.addEventListener("click", () => {
  player.prev();
});
