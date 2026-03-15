<<<<<<< HEAD
// DOM элементы
const graphSvg = document.getElementById('graphSvg');
const generateBtn = document.getElementById('generateGraphBtn');
const graphInput = document.getElementById('graphInput');
const sourceNode = document.getElementById('sourceNode');

// Элементы информационной панели
const currentStepEl = document.getElementById('currentStep');
const currentVertexEl = document.getElementById('currentVertex');
const distancesEl = document.getElementById('distances');
const queueEl = document.getElementById('queue');
const pathTreeEl = document.getElementById('pathTree');

// Константы
const SVG_NS = 'http://www.w3.org/2000/svg';
const NODE_RADIUS = 20;

// Цвета для разных состояний
const COLORS = {
  default: '#4f7cff',
  active: '#fbbf24',
  visited: '#34d399',
  edge: '#fb7185',
  path: '#34d399'
=======
// DOM элементы
const graphSvg = document.getElementById('graphSvg');
const generateBtn = document.getElementById('generateGraphBtn');
const graphInput = document.getElementById('graphInput');
const sourceNode = document.getElementById('sourceNode');

// Элементы информационной панели
const currentStepEl = document.getElementById('currentStep');
const currentVertexEl = document.getElementById('currentVertex');
const distancesEl = document.getElementById('distances');
const queueEl = document.getElementById('queue');
const pathTreeEl = document.getElementById('pathTree');

// Константы
const SVG_NS = 'http://www.w3.org/2000/svg';
const NODE_RADIUS = 20;

// Цвета для разных состояний
const COLORS = {
  default: '#4f7cff',
  active: '#fbbf24',
  visited: '#34d399',
  edge: '#fb7185',
  path: '#34d399'
>>>>>>> e11a861e7600a813384879e6fe6e310384aef388
};