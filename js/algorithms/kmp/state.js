// Состояние алгоритма KMP

let text = '';
let pattern = '';
let pi = []; // префикс-функция

let animationSteps = [];
let currentStepIndex = 0;
let currentPhase = 'prefix'; // 'prefix' или 'search'

let foundMatches = []; // найденные вхождения

// Инициализация примера по умолчанию
function initializeDefault() {
  const example = getRandomExample();
  text = example.text;
  pattern = example.pattern;
  pi = computePrefixFunction(pattern);
  foundMatches = [];
}

// Обновление текста и образца
function setTextAndPattern(newText, newPattern) {
  if (newText) text = newText;
  if (newPattern) pattern = newPattern;
  pi = computePrefixFunction(pattern);
  foundMatches = [];
}

// Проверка валидности ввода
function validateInput(text, pattern) {
  if (!text || !pattern) return false;
  if (pattern.length > text.length) {
    alert('Образец не может быть длиннее текста!');
    return false;
  }
  return true;
}