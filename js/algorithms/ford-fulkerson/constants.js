// DOM элементы
const capacitySvg = document.getElementById('capacitySvg');
const flowSvg = document.getElementById('flowSvg');
const residualSvg = document.getElementById('residualSvg');
const generateBtn = document.getElementById('generateGraphBtn');
const graphInput = document.getElementById('graphInput');
const flowValue = document.getElementById('flowValue');
const augmentingPathLine = document.getElementById('augmentingPathLine');

const SVG_NS = 'http://www.w3.org/2000/svg';

// Параметры отрисовки
const NODE_RADIUS = 20;
const SOURCE_COLOR = '#059669';
const SINK_COLOR = '#b91c1c';
const NODE_COLOR = '#1f2937';
const EDGE_COLOR = '#4b5563';
const FLOW_COLOR = '#34d399';
const RESIDUAL_FORWARD = '#60a5fa';
const RESIDUAL_BACKWARD = '#fb7185';
const AUGMENTING_COLOR = '#fbbf24';

// Позиции вершин для красивого отображения (пример из презентации)
const DEFAULT_POSITIONS = {
  0: { x: 100, y: 200 },  // source
  1: { x: 250, y: 80 },
  2: { x: 250, y: 320 },
  3: { x: 400, y: 80 },
  4: { x: 400, y: 200 },
  5: { x: 400, y: 320 },
  6: { x: 550, y: 80 },
  7: { x: 550, y: 320 },
  8: { x: 700, y: 200 }   // sink
};