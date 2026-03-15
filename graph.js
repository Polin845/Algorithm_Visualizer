const NODE_COUNT = 8;

let adjacencyList = [];
let nodePositions = [];
let isTraversing = false;

const graphContainer = document.getElementById("graphContainer");
const generateGraphBtn = document.getElementById("generateGraphBtn");
const startBfsBtn = document.getElementById("startBfsBtn");
const startDfsBtn = document.getElementById("startDfsBtn");
const graphSpeedRange = document.getElementById("graphSpeedRange");
const graphSpeedLabel = document.getElementById("graphSpeedLabel");

let svgElement = null;
let nodeElements = [];

function getGraphDelay() {
  return Number(graphSpeedRange.value);
}

function updateGraphSpeedLabel() {
  graphSpeedLabel.textContent = `${getGraphDelay()} ms`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createDefaultPositions() {
  // Arrange nodes in a circle
  const radius = 40;
  const centerX = 50;
  const centerY = 50;

  nodePositions = Array.from({ length: NODE_COUNT }, (_, i) => {
    const angle = (2 * Math.PI * i) / NODE_COUNT;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
}

function generateRandomGraph() {
  if (isTraversing) return;

  adjacencyList = Array.from({ length: NODE_COUNT }, () => new Set());

  // Ensure connectivity with a simple chain
  for (let i = 0; i < NODE_COUNT - 1; i++) {
    adjacencyList[i].add(i + 1);
    adjacencyList[i + 1].add(i);
  }

  // Add some random extra edges
  const extraEdges = NODE_COUNT;
  for (let k = 0; k < extraEdges; k++) {
    const u = Math.floor(Math.random() * NODE_COUNT);
    const v = Math.floor(Math.random() * NODE_COUNT);
    if (u !== v) {
      adjacencyList[u].add(v);
      adjacencyList[v].add(u);
    }
  }

  renderGraph();
}

function renderGraph() {
  graphContainer.innerHTML = "";

  svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgElement.setAttribute("viewBox", "0 0 100 100");
  svgElement.classList.add("graph-svg");

  // Draw edges
  for (let u = 0; u < NODE_COUNT; u++) {
    for (const v of adjacencyList[u]) {
      if (v <= u) continue; // avoid duplicates
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", nodePositions[u].x);
      line.setAttribute("y1", nodePositions[u].y);
      line.setAttribute("x2", nodePositions[v].x);
      line.setAttribute("y2", nodePositions[v].y);
      line.classList.add("graph-edge");
      svgElement.appendChild(line);
    }
  }

  // Draw nodes
  nodeElements = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.classList.add("graph-node");
    g.dataset.index = String(i);

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", nodePositions[i].x);
    circle.setAttribute("cy", nodePositions[i].y);
    circle.setAttribute("r", "5");

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", nodePositions[i].x);
    text.setAttribute("y", nodePositions[i].y);
    text.textContent = String(i);

    g.appendChild(circle);
    g.appendChild(text);
    svgElement.appendChild(g);

    nodeElements[i] = g;
  }

  graphContainer.appendChild(svgElement);
}

function resetNodeClasses() {
  nodeElements.forEach((node) => {
    node.classList.remove("visited", "active");
  });
}

function setGraphControlsDisabled(disabled) {
  generateGraphBtn.disabled = disabled;
  startBfsBtn.disabled = disabled;
  startDfsBtn.disabled = disabled;
  graphSpeedRange.disabled = disabled;
}

async function bfs(start) {
  const visited = new Array(NODE_COUNT).fill(false);
  const queue = [];

  queue.push(start);
  visited[start] = true;

  while (queue.length > 0) {
    const current = queue.shift();

    resetNodeClasses();
    nodeElements[current].classList.add("active");
    await sleep(getGraphDelay());

    nodeElements[current].classList.remove("active");
    nodeElements[current].classList.add("visited");

    for (const neighbor of adjacencyList[current]) {
      if (!visited[neighbor]) {
        visited[neighbor] = true;
        queue.push(neighbor);
      }
    }
  }
}

async function dfs(start) {
  const visited = new Array(NODE_COUNT).fill(false);
  const stack = [start];

  while (stack.length > 0) {
    const current = stack.pop();
    if (visited[current]) continue;
    visited[current] = true;

    resetNodeClasses();
    nodeElements[current].classList.add("active");
    await sleep(getGraphDelay());

    nodeElements[current].classList.remove("active");
    nodeElements[current].classList.add("visited");

    const neighbors = Array.from(adjacencyList[current]).sort((a, b) => b - a);
    for (const neighbor of neighbors) {
      if (!visited[neighbor]) {
        stack.push(neighbor);
      }
    }
  }
}

async function handleTraversal(type) {
  if (isTraversing) return;
  if (!adjacencyList.length) return;

  isTraversing = true;
  setGraphControlsDisabled(true);
  resetNodeClasses();

  try {
    if (type === "bfs") {
      await bfs(0);
    } else {
      await dfs(0);
    }
  } finally {
    isTraversing = false;
    setGraphControlsDisabled(false);
  }
}

function initGraphPage() {
  createDefaultPositions();
  updateGraphSpeedLabel();
  generateRandomGraph();

  graphSpeedRange.addEventListener("input", updateGraphSpeedLabel);
  generateGraphBtn.addEventListener("click", generateRandomGraph);
  startBfsBtn.addEventListener("click", () => handleTraversal("bfs"));
  startDfsBtn.addEventListener("click", () => handleTraversal("dfs"));
}

document.addEventListener("DOMContentLoaded", initGraphPage);

