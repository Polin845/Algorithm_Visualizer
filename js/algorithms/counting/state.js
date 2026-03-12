// Глобальное состояние
let input = [];
let maxValue = 0;
let count = [];
let output = [];
let animationSteps = [];
let currentStepIndex = 0;

// Функции для работы с состоянием
function cloneArray(arr) {
  return arr ? arr.slice() : [];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Парсинг пользовательского ввода
function parseCustomInput() {
  if (!customInput) return null;
  
  const txt = customInput.value.trim();
  if (!txt) return null;
  
  const nums = txt
    .split(/\s+/)
    .map(s => parseInt(s, 10))
    .filter(n => !isNaN(n) && n >= 0);
  
  return nums.length ? nums : null;
}

// Генерация случайного массива
function generateRandomArray() {
  const length = 15;
  const max = randomInt(8, 12);
  return Array.from({ length }, () => randomInt(0, max));
}