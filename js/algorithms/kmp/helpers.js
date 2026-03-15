// Вспомогательные функции для KMP

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Вычисление префикс-функции для образца
function computePrefixFunction(pattern) {
  const pi = new Array(pattern.length).fill(0);
  let len = 0;
  let i = 1;
  
  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) {
      len++;
      pi[i] = len;
      i++;
    } else {
      if (len !== 0) {
        len = pi[len - 1];
      } else {
        pi[i] = 0;
        i++;
      }
    }
  }
  
  return pi;
}

// Форматирование строки для отображения
function formatString(str) {
  return str || '';
}

// Создание HTML для символов с подсветкой
function createCharElements(str, options = {}) {
  const {
    currentIndex = -1,
    matchIndices = [],
    highlightIndices = [],
    highlightClass = 'match-highlight'
  } = options;
  
  return str.split('').map((char, index) => {
    let className = 'char';
    
    if (index === currentIndex) className += ' current-text';
    if (matchIndices.includes(index)) className += ' found-match';
    if (highlightIndices.includes(index)) className += ` ${highlightClass}`;
    
    return `<span class="${className}" data-index="${index}">${char}</span>`;
  }).join('');
}

// Очистка подсветки
function clearHighlights() {
  document.querySelectorAll('.char').forEach(el => {
    el.classList.remove('current-text', 'current-pattern', 'match-highlight', 'found-match');
  });
  
  document.querySelectorAll('.pi-cell').forEach(el => {
    el.classList.remove('current');
  });
}

// Получение случайного примера
function getRandomExample() {
  const examples = [
    { text: 'ABABDABACDABABCABAB', pattern: 'ABABCABAB' },
    { text: 'AABAACAADAABAABA', pattern: 'AABA' },
    { text: 'ABCABCABCABCABC', pattern: 'ABC' },
    { text: 'AAAAABAAAAABAAAAAB', pattern: 'AAAAAB' },
    { text: 'THIS IS A TEST TEXT', pattern: 'TEST' }
  ];
  
  return examples[Math.floor(Math.random() * examples.length)];
}