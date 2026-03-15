// Пошаговая логика KMP

function buildPrefixSteps(pattern) {
  const steps = [];
  const n = pattern.length;
  const pi = new Array(n).fill(0);
  
  // Начальное состояние
  steps.push({
    phase: 'prefix',
    pattern: pattern,
    pi: [...pi],
    i: 0,
    j: 0,
    len: 0,
    description: 'Начинаем построение префикс-функции. π[0] = 0',
    highlightPattern: []
  });
  
  if (n <= 1) return steps;
  
  let len = 0;
  let i = 1;
  
  while (i < n) {
    // Показываем текущие индексы
    steps.push({
      phase: 'prefix',
      pattern: pattern,
      pi: [...pi],
      i: i,
      j: len,
      len: len,
      description: `Сравниваем pattern[${i}] = '${pattern[i]}' с pattern[${len}] = '${pattern[len]}'`,
      highlightPattern: [i, len]
    });
    
    if (pattern[i] === pattern[len]) {
      len++;
      pi[i] = len;
      
      steps.push({
        phase: 'prefix',
        pattern: pattern,
        pi: [...pi],
        i: i,
        j: len,
        len: len,
        description: `Совпадение! π[${i}] = ${len}. Увеличиваем len до ${len}`,
        highlightPattern: Array.from({ length: len }, (_, idx) => idx)
      });
      
      i++;
    } else {
      if (len !== 0) {
        steps.push({
          phase: 'prefix',
          pattern: pattern,
          pi: [...pi],
          i: i,
          j: len,
          len: len,
          description: `Несовпадение. len = π[${len-1}] = ${pi[len-1]}`,
          highlightPattern: []
        });
        len = pi[len - 1];
      } else {
        pi[i] = 0;
        steps.push({
          phase: 'prefix',
          pattern: pattern,
          pi: [...pi],
          i: i,
          j: 0,
          len: 0,
          description: `Несовпадение. π[${i}] = 0, переходим к следующему символу`,
          highlightPattern: []
        });
        i++;
      }
    }
  }
  
  // Финальное состояние
  steps.push({
    phase: 'prefix',
    pattern: pattern,
    pi: [...pi],
    i: -1,
    j: -1,
    len: -1,
    description: `Префикс-функция построена: [${pi.join(', ')}]`,
    highlightPattern: []
  });
  
  return steps;
}

function buildSearchSteps(text, pattern, pi) {
  const steps = [];
  const n = text.length;
  const m = pattern.length;
  
  // Начало поиска
  steps.push({
    phase: 'search',
    text: text,
    pattern: pattern,
    pi: pi,
    i: 0,
    j: 0,
    description: 'Начинаем поиск образца в тексте',
    highlightText: [],
    highlightPattern: []
  });
  
  let i = 0; // индекс в тексте
  let j = 0; // индекс в образце
  const matches = [];
  
  while (i < n) {
    steps.push({
      phase: 'search',
      text: text,
      pattern: pattern,
      pi: pi,
      i: i,
      j: j,
      description: `Сравниваем text[${i}] = '${text[i]}' с pattern[${j}] = '${pattern[j]}'`,
      highlightText: [i],
      highlightPattern: [j]
    });
    
    if (pattern[j] === text[i]) {
      steps.push({
        phase: 'search',
        text: text,
        pattern: pattern,
        pi: pi,
        i: i,
        j: j,
        description: `Совпадение! i = ${i}, j = ${j}`,
        highlightText: [i],
        highlightPattern: Array.from({ length: j + 1 }, (_, idx) => idx),
        matchLength: j + 1
      });
      
      i++;
      j++;
      
      if (j === m) {
        // Найдено вхождение
        matches.push(i - j);
        steps.push({
          phase: 'search',
          text: text,
          pattern: pattern,
          pi: pi,
          i: i,
          j: j,
          description: `Найдено вхождение на позиции ${i - j}!`,
          highlightText: Array.from({ length: m }, (_, idx) => i - j + idx),
          highlightPattern: Array.from({ length: m }, (_, idx) => idx),
          foundMatch: i - j,
          matches: [...matches]
        });
        
        j = pi[j - 1];
      }
    } else {
      if (j !== 0) {
        steps.push({
          phase: 'search',
          text: text,
          pattern: pattern,
          pi: pi,
          i: i,
          j: j,
          description: `Несовпадение. j = π[${j-1}] = ${pi[j-1]}`,
          highlightText: [i],
          highlightPattern: []
        });
        j = pi[j - 1];
      } else {
        steps.push({
          phase: 'search',
          text: text,
          pattern: pattern,
          pi: pi,
          i: i,
          j: 0,
          description: `Несовпадение. i увеличивается до ${i + 1}`,
          highlightText: [i],
          highlightPattern: []
        });
        i++;
      }
    }
  }
  
  // Финальное состояние
  steps.push({
    phase: 'search',
    text: text,
    pattern: pattern,
    pi: pi,
    i: -1,
    j: -1,
    description: matches.length > 0 
      ? `Поиск завершен. Найдено ${matches.length} вхождений: ${matches.join(', ')}`
      : 'Поиск завершен. Вхождений не найдено',
    matches: matches
  });
  
  return steps;
}

function buildAnimationSteps(text, pattern) {
  const steps = [];
  
  // Фаза 1: Построение префикс-функции
  const prefixSteps = buildPrefixSteps(pattern);
  steps.push(...prefixSteps);
  
  // Разделительный шаг
  steps.push({
    phase: 'separator',
    description: 'Префикс-функция построена. Переходим к поиску в тексте.',
    pi: prefixSteps[prefixSteps.length - 1].pi
  });
  
  // Фаза 2: Поиск
  const searchSteps = buildSearchSteps(text, pattern, prefixSteps[prefixSteps.length - 1].pi);
  steps.push(...searchSteps);
  
  return steps;
}

function renderStep(step) {
  if (!step) return;
  
  if (step.phase === 'prefix') {
    // Отрисовка фазы построения префикс-функции
    renderPrefixStep(step);
  } else if (step.phase === 'search') {
    // Отрисовка фазы поиска
    renderSearchStep(step);
  } else if (step.phase === 'separator') {
    // Разделительный шаг
    renderSeparatorStep(step);
  }
  
  // Обновление индексов
  updateIndices(step);
  
  // Обновление объяснения
  if (stepExplanation) {
    stepExplanation.innerHTML = step.description || '';
  }
  
  // Обновление фазы
  updatePhase(step.phase);
}