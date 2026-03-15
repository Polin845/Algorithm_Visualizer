const nodePositions = {
  0: {x:100, y:200},
  1: {x:250, y:100},
  2: {x:250, y:300},
  3: {x:450, y:100},
  4: {x:450, y:300}
};

class Renderer {

  constructor(graph, nodePositions) {
    this.graph = graph;
    this.nodePositions = nodePositions;
    this.svg = document.getElementById("graph");

    this.nodeElements = {};
    this.edgeElements = [];

    this.drawGraph();
  }

   drawGraph() {
    this.drawEdges();
    this.drawNodes();
  }

  render(step) {

  this.resetHighlights();

  switch(step.type) {

    case "init":
      console.log("Инициализация");
      break;

    case "select_vertex":
      this.highlightVertex(step.vertex);
      console.log("Выбрана вершина", step.vertex)
      break;

    case "visit_vertex":
      this.markVisited(step.vertex);
      console.log("Посещена вершина", step.vertex)
      break;

    case "check_edge":
      this.highlightEdge(step.from, step.to);
      console.log("Проверяем ребро", step.from, step.to)
      break;

    case "relax_edge":
      this.highlightEdge(step.from, step.to);
      this.highlightVertex(step.to);
      console.log("Обновили расстояние", step.to)
      break;

    case "push_queue":
      console.log("Добавлена в очередь", step.vertex);
      break;

    case "finish":
      console.log("Алгоритм завершён");
      break;
  }
}

drawEdges(){

  for(let v = 0; v < this.graph.V(); v++){

    for(const e of this.graph.adjList(v)){

      const from = this.nodePositions[e.from];
      const to = this.nodePositions[e.to()];

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );

      line.setAttribute("x1", from.x);
      line.setAttribute("y1", from.y);
      line.setAttribute("x2", to.x);
      line.setAttribute("y2", to.y);

      line.setAttribute("stroke", "#d36161");
      line.setAttribute("stroke-width", "2");
      line.setAttribute("opacity", "0.8");

      this.svg.appendChild(line);

      //----вес ребра----

      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;

      const weightLabel = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );

      weightLabel.setAttribute("x", midX);
      weightLabel.setAttribute("y", midY - 5);

      weightLabel.setAttribute("text-anchor", "middle");
      weightLabel.setAttribute("font-size", "14");
      weightLabel.setAttribute("font-family", "Arial");
      weightLabel.setAttribute("font-weight", "bold");
      weightLabel.setAttribute("fill", "#1a1a1a");

      //для лучшей читаемости - обводка
      weightLabel.setAttribute("stroke", "white");
      weightLabel.setAttribute("stroke-width", "1"); //надо подумать какое значение тут
      weightLabel.setAttribute("paint-order", "stroke");


      weightLabel.textContent = e.weight();

      this.svg.appendChild(weightLabel);

      //сохраняем для подсветки

      this.edgeElements.push({
        line: line,
        label: weightLabel,
        from: e.from,
        to: e.to()
      });
    }
  }
}

drawNodes(){

  for(let v = 0; v < this.graph.V(); v++){

    const pos = this.nodePositions[v];

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );

    circle.setAttribute("cx", pos.x);
    circle.setAttribute("cy", pos.y);

    circle.setAttribute("r", 13);
    circle.setAttribute("fill", "#7ec8ff");
    circle.setAttribute("stroke", "#1f4e79");
    circle.setAttribute("stroke-width", "2");

    this.svg.appendChild(circle);

    const label = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );

    label.setAttribute("x", pos.x);
    label.setAttribute("y", pos.y+5);

    label.setAttribute("font-size", "14");
    label.setAttribute("font-family", "Arial");
    label.setAttribute("font-weight", "bold");
    label.setAttribute("fill", "#c03d3d");

    //для центрования надписи
    label.setAttribute("dominant-baseline", "middle");
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("y", pos.y);

    label.textContent = v;

    this.svg.appendChild(label);

    this.nodeElements[v] = circle;
  }
}

highlightVertex(v){

  const node = this.nodeElements[v];
  node.setAttribute("fill", "orange");

}

highlightEdge(from,to){

  for(const edge of this.edgeElements){

    if(edge.from === from && edge.to === to){

      edge.line.setAttribute("stroke","red");
      edge.line.setAttribute("stroke-width","4");

    }
  }
}

resetHighlights() {

  for (const v in this.nodeElements) {
    this.nodeElements[v].setAttribute("fill", "lightblue");
  }

  for (const edge of this.edgeElements) {
    edge.line.setAttribute("stroke", "red");
    edge.line.setAttribute("stroke-width", "2");
  }

}

markVisited(v) {

  const node = this.nodeElements[v];

  if (node) {
    node.setAttribute("fill", "lightgreen");
  }

}

}


//-----------раскладка---------
function generateCircleLayout(n, container) {
  const positions = {};
  const rect = container.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  // динамический padding
  const padding = Math.min(width, height) * 0.08;

  // радиус с учётом вертикального padding
  const radius = Math.min(width, height - 2*padding) / 2;

  // центр круга
  const centerX = width / 2;
  const centerY = radius + padding; // смещаем центр вверх

  const startAngle = -Math.PI / 2; // вершина 0 сверху

  for (let i = 0; i < n; i++) {
    const angle = startAngle + (2 * Math.PI * i) / n;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    positions[i] = { x, y };
  }

  return positions;
}




// -------------рендер панелия состояния----------------

class StatePanel {

  constructor() {
    this.currentVertexEl = document.getElementById("currentVertex");
    this.distancesEl = document.getElementById("distances");
    this.queueEl = document.getElementById("queue");
  }

  render(step) {

    // текущая вершина
    if(step.vertex !== undefined){
      this.currentVertexEl.textContent = step.vertex;
    }

    // массив расстояний
    if(step.dist){
      this.renderDistances(step.dist, step.updatedVertex);
    }

    // очередь
  if(step.queue){
    this.renderQueue(step.queue);
  }

  }

  renderDistances(dist, highlightIndex){

  this.distancesEl.innerHTML = "";

  const container = document.createElement("div");
  container.className = "array-container";

  const indexRow = document.createElement("div");
  indexRow.className = "array-row";

  const valueRow = document.createElement("div");
  valueRow.className = "array-row";

  dist.forEach((d, i) => {

    const indexCell = document.createElement("div");
    indexCell.className = "array-cell array-index";
    indexCell.textContent = i;

    const valueCell = document.createElement("div");
    valueCell.className = "array-cell";
    valueCell.textContent = d === Infinity ? "∞" : d;

    if(i === highlightIndex){
      valueCell.classList.add("array-updated");
    }

    indexRow.appendChild(indexCell);
    valueRow.appendChild(valueCell);

  });

  container.appendChild(indexRow);
  container.appendChild(valueRow);

  this.distancesEl.appendChild(container);

  }

  renderQueue(queue){
    this.queueEl.innerHTML = "";

    const container = document.createElement("div");
    container.className = "queue-container";

    const label = document.createElement("div");
    label.className = "queue-label";
    label.textContent = "vertex : distance";

    const row = document.createElement("div");
    row.className = "queue-row";

    queue
      .slice()
      .sort((a,b) => a.priority - b.priority)
      .forEach(node => {

        const cell = document.createElement("div");
        cell.className = "queue-cell";

        cell.textContent = `${node.value} : ${node.priority}`;

        row.appendChild(cell);

      });

    container.appendChild(label);
    container.appendChild(row);

    this.queueEl.appendChild(container);

  }

}
