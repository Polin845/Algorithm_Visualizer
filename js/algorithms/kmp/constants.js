// DOM элементы
const textInput = document.getElementById('textInput');
const patternInput = document.getElementById('patternInput');
const generateBtn = document.getElementById('generateBtn');

const textContent = document.getElementById('textContent');
const patternContent = document.getElementById('patternContent');
const piArray = document.getElementById('piArray');

const textLength = document.getElementById('textLength');
const patternLength = document.getElementById('patternLength');

const iIndex = document.getElementById('iIndex');
const jIndex = document.getElementById('jIndex');

const matchesList = document.getElementById('matchesList');
const stepExplanation = document.getElementById('stepExplanation');
const phaseIndicator = document.getElementById('phaseIndicator');
const explanationContent = document.getElementById('explanationContent');

const phaseTabs = document.querySelectorAll('.phase-tab');

// Константы
const SVG_NS = 'http://www.w3.org/2000/svg';

// Цвета для разных состояний
const COLORS = {
  text: '#4f7cff',
  pattern: '#fbbf24',
  match: '#34d399',
  pi: '#60a5fa'
};