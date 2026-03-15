// Функции для отрисовки KMP

function renderText(str, options = {}) {
  const {
    currentIndex = -1,
    matchIndices = [],
    foundMatches = []
  } = options;
  
  // Создаем множество индексов, которые входят в найденные вхождения
  const matchPositions = new Set();
  foundMatches.forEach(start => {
    for (let i = 0; i < pattern.length; i++) {
      matchPositions.add(start + i);
    }
  });
  
  return str.split('').map((char, index) => {
    let className = 'char';
    
    if (index === currentIndex) className += ' current-text';
    if (matchPositions.has(index)) className += ' found-match';
    
    return `<span class="${className}" data-index="${index}">${char}</span>`;
  }).join('');
}

function renderPattern(str, options = {}) {
  const {
    currentIndex = -1,
    highlightIndices = []
  } = options;
  
  return str.split('').map((char, index) => {
    let className = 'char';
    
    if (index === currentIndex) className += ' current-pattern';
    if (highlightIndices.includes(index)) className += ' match-highlight';
    
    return `<span class="${className}" data-index="${index}">${char}</span>`;
  }).join('');
}

function renderPiArray(pi, options = {}) {
  const { currentIndex = -1 } = options;
  
  if (!pi || pi.length === 0) {
    return '<div class="empty-state">Префикс-функция пуста</div>';
  }
  
  return pi.map((value, index) => {
    const isCurrent = index === currentIndex;
    return `
      <div class="pi-cell ${isCurrent ? 'current' : ''}">
        <div class="pi-index">${index}</div>
        <div class="pi-value">${value}</div>
      </div>
    `;
  }).join('');
}

function renderMatches(matches) {
  if (!matches || matches.length === 0) {
    return '<div class="empty-state">Пока нет совпадений</div>';
  }
  
  return matches.map((pos, idx) => `
    <div class="match-item">
      <span class="match-position">#${idx + 1}:</span>
      <span class="match-text">позиция ${pos}</span>
    </div>
  `).join('');
}

function renderPrefixStep(step) {
  // Отрисовка образца
  if (patternContent) {
    patternContent.innerHTML = renderPattern(step.pattern, {
      currentIndex: step.j,
      highlightIndices: step.highlightPattern || []
    });
  }
  
  // Отрисовка префикс-функции
  if (piArray) {
    piArray.innerHTML = renderPiArray(step.pi, {
      currentIndex: step.i
    });
  }
  
  // Очищаем текст (он не используется в этой фазе)
  if (textContent) {
    textContent.innerHTML = renderText(text);
  }
}

function renderSearchStep(step) {
  // Отрисовка текста
  if (textContent) {
    textContent.innerHTML = renderText(step.text, {
      currentIndex: step.i,
      foundMatches: step.matches || []
    });
  }
  
  // Отрисовка образца
  if (patternContent) {
    patternContent.innerHTML = renderPattern(step.pattern, {
      currentIndex: step.j,
      highlightIndices: step.highlightPattern || []
    });
  }
  
  // Отрисовка префикс-функции
  if (piArray) {
    piArray.innerHTML = renderPiArray(step.pi);
  }
  
  // Отрисовка найденных вхождений
  if (matchesList && step.matches) {
    matchesList.innerHTML = renderMatches(step.matches);
  }
}

function renderSeparatorStep(step) {
  // Показываем финальную префикс-функцию
  if (piArray) {
    piArray.innerHTML = renderPiArray(step.pi);
  }
  
  // Очищаем подсветку
  clearHighlights();
}

function updateIndices(step) {
  if (iIndex) {
    iIndex.textContent = step.i !== undefined ? step.i : '-';
  }
  
  if (jIndex) {
    jIndex.textContent = step.j !== undefined ? step.j : '-';
  }
  
  if (textLength) {
    textLength.textContent = text.length;
  }
  
  if (patternLength) {
    patternLength.textContent = pattern.length;
  }
}

function updatePhase(phase) {
  currentPhase = phase;
  
  // Обновляем табы
  document.querySelectorAll('.phase-tab').forEach(tab => {
    const tabPhase = tab.dataset.phase;
    if (tabPhase === phase) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

function renderAll(step) {
  if (!step) return;
  
  if (step.phase === 'prefix') {
    renderPrefixStep(step);
  } else if (step.phase === 'search') {
    renderSearchStep(step);
  } else if (step.phase === 'separator') {
    renderSeparatorStep(step);
  }
  
  updateIndices(step);
  
  if (stepExplanation) {
    stepExplanation.innerHTML = step.description || '';
  }
  
  updatePhase(step.phase);
}

// Экспорт
window.rendering = {
  renderAll,
  renderText,
  renderPattern,
  renderPiArray,
  renderMatches,
  clearHighlights
};