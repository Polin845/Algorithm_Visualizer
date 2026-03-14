function formatPath(path) {
  if (!path || path.length === 0) return 'none';
  
  let result = '0';
  let current = 0;
  
  for (let edge of path) {
    if (edge.from === current) {
      result += ` → ${edge.to}`;
      current = edge.to;
    } else {
      result += ` ← ${edge.from}`;
      current = edge.from;
    }
  }
  
  return result;
}

function findBottleneckEdge(path, graph) {
  if (!path || path.length === 0) return null;
  
  let minResidual = Infinity;
  let bottleneckEdge = null;
  
  for (let edge of path) {
    const residual = graph.getResidualCapacity(edge.from, edge.to);
    if (residual < minResidual) {
      minResidual = residual;
      bottleneckEdge = edge;
    }
  }
  
  return {
    from: bottleneckEdge.from,
    to: bottleneckEdge.to,
    capacity: minResidual
  };
}

function findSaturatedEdges(graph, path, bottleneck) {
  const saturated = [];
  
  for (let edge of path) {
    const residual = graph.getResidualCapacity(edge.from, edge.to);
    if (residual === bottleneck) {
      saturated.push({ from: edge.from, to: edge.to });
    }
  }
  
  return saturated;
}

function buildAnimationSteps(initialGraph) {
  const steps = [];
  const graph = cloneGraph(initialGraph);
  
  // Начальное состояние
  steps.push({
    graph: cloneGraph(graph),
    augmentingPath: [],
    bottleneckEdges: [],
    saturatedEdges: [],
    phase: 'start',
    calcText: 'Initial graph. Looking for augmenting path from source (0) to sink...'
  });
  
  let iteration = 1;
  
  while (true) {
    // Ищем увеличивающий путь
    const path = graph.findAugmentingPath();
    
    if (!path) {
      steps.push({
        graph: cloneGraph(graph),
        augmentingPath: [],
        bottleneckEdges: [],
        saturatedEdges: [],
        phase: 'done',
        calcText: `Algorithm finished! Maximum flow: ${graph.getTotalFlow()}`
      });
      break;
    }
    
    // Показываем найденный путь
    steps.push({
      graph: cloneGraph(graph),
      augmentingPath: path,
      bottleneckEdges: [],
      saturatedEdges: [],
      phase: 'path-found',
      calcText: `Iteration ${iteration}: Found augmenting path: ${formatPath(path)}`
    });
    
    // Находим bottleneck ребро
    const bottleneck = findBottleneckEdge(path, graph);
    
    // Показываем bottleneck ребро (подсвечиваем красным)
    steps.push({
      graph: cloneGraph(graph),
      augmentingPath: path,
      bottleneckEdges: [bottleneck],
      saturatedEdges: [],
      phase: 'bottleneck',
      calcText: `Bottleneck edge: ${bottleneck.from} → ${bottleneck.to} with capacity ${bottleneck.capacity}`
    });
    
    // Находим все ребра, которые станут насыщенными
    const saturatedEdges = findSaturatedEdges(graph, path, bottleneck.capacity);
    
    // Показываем, какие ребра станут насыщенными
    steps.push({
      graph: cloneGraph(graph),
      augmentingPath: path,
      bottleneckEdges: [bottleneck],
      saturatedEdges: saturatedEdges,
      phase: 'about-to-saturate',
      calcText: `These edges will become saturated (capacity will become 0): ${saturatedEdges.map(e => `${e.from}→${e.to}`).join(', ')}`
    });
    
    // Обновляем поток
    for (let edge of path) {
      graph.addFlow(edge.from, edge.to, bottleneck.capacity);
    }
    
    // Показываем результат после обновления
    steps.push({
      graph: cloneGraph(graph),
      augmentingPath: [],
      bottleneckEdges: [],
      saturatedEdges: saturatedEdges,
      phase: 'flow-updated',
      calcText: `Added flow ${bottleneck.capacity}. Total flow: ${graph.getTotalFlow()}`
    });
    
    iteration++;
  }
  
  return steps;
}