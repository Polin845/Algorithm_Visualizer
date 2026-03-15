// Константы и ссылки на DOM элементы
const inputSvg = document.getElementById('inputSvg');
const countSvg = document.getElementById('countSvg');
const outputSvg = document.getElementById('outputSvg');
const phaseBadge = document.getElementById('phaseBadge');
const calcLine = document.getElementById('calcLine');
const generateBtn = document.getElementById('generateBtn');
const customInput = document.getElementById('customArray');

const SVG_NS = 'http://www.w3.org/2000/svg';

// Соответствие скорости в ms (для обратной совместимости)
const SPEED_MS_BY_LEVEL = {
  1: 900,
  2: 600,
  3: 350,
  4: 200,
  5: 90
};