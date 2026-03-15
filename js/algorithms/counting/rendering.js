// Функции для отрисовки

function clearSvg(svg) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
}

function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) {
    node.setAttribute(k, String(v));
  }
  if (text !== undefined) node.textContent = text;
  return node;
}

function setupSvg(svg, W, cellHeight, labelHeight = 18, bottomTextHeight = 22, gapY = 2) {
  const H = labelHeight + cellHeight + bottomTextHeight + gapY * 2 + 10;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  return labelHeight + gapY;
}

function renderInputArray(arr, options = {}) {
  if (!inputSvg) return;
  clearSvg(inputSvg);
  
  const W = 800;
  const gap = 6;
  if (!arr || arr.length === 0) return;

  const labelHeight = 18;
  const bottomTextHeight = 22;
  const gapY = 2;

  const n = arr.length;
  const cell = (W - 6 * 2 - gap * (n - 1)) / n;
  const y = setupSvg(inputSvg, W, cell, labelHeight, bottomTextHeight, gapY);

  for (let i = 0; i < n; i++) {
    const x = 6 + i * (cell + gap);
    const rect = el('rect', { 
      x, y, width: cell, height: cell, rx: 12, 
      class: 'cell-rect' 
    });
    
    if (options.dimAllExceptActive && options.activeIndex !== null && i !== options.activeIndex) {
      rect.classList.add('dim');
    }
    if (options.activeIndex !== null && i === options.activeIndex) {
      rect.classList.add('active');
    }
    if (options.placedIndex !== null && i === options.placedIndex) {
      rect.classList.add('placed');
    }

    const text = el('text', { 
      x: x + cell / 2, y: y + cell / 2, class: 'cell-text' 
    }, String(arr[i]));
    
    const idx = el('text', { 
      x: x + cell / 2, y: y + cell + 12, class: 'cell-subtext' 
    }, `i=${i}`);

    inputSvg.appendChild(rect);
    inputSvg.appendChild(text);
    inputSvg.appendChild(idx);
  }
}

function renderCountArray(arr, options = {}) {
  if (!countSvg) return;
  
  // Сохраняем старые значения для анимации
  const oldValues = {};
  const oldTexts = countSvg.querySelectorAll('.cell-text');
  oldTexts.forEach((text, idx) => {
    oldValues[idx] = text.textContent;
  });
  
  clearSvg(countSvg);

  const W = 800;
  const gap = 6;
  if (!arr || arr.length === 0) return;

  const labelHeight = 0;
  const bottomTextHeight = 22;
  const gapY = 2;

  const cols = arr.length;
  const size = (W - 6 * 2 - gap * (cols - 1)) / cols;
  const y = setupSvg(countSvg, W, size, labelHeight, bottomTextHeight, gapY);

  for (let i = 0; i < cols; i++) {
    const x = 6 + i * (size + gap);
    const rect = el('rect', { 
      x, y, width: size, height: size, rx: 12, 
      class: 'cell-rect' 
    });

    if (options.activeIndex !== null && i === options.activeIndex) {
      rect.classList.add('active');
    }
    if (options.calcIndex !== null && i === options.calcIndex) {
      rect.classList.add('calc');
    }

    const idxLabel = el('text', { 
      x: x + size / 2, y: y + size + 12, class: 'cell-subtext' 
    }, `i=${i}`);
    
    // Используем старое значение для индекса, который инкрементится
    let displayValue = String(arr[i]);
    if (options.incrementIndex !== null && i === options.incrementIndex) {
      displayValue = oldValues[i] || String(arr[i] - 1);
    }
    
    const cntVal = el('text', { 
      x: x + size / 2, y: y + size / 2, class: 'cell-text' 
    }, displayValue);
    
    countSvg.appendChild(rect);
    countSvg.appendChild(cntVal);
    countSvg.appendChild(idxLabel);
  }
  
  // Показываем анимацию если есть инкремент
  if (options.incrementIndex !== null) {
    setTimeout(() => {
      showFloatingPlus(options.incrementIndex, arr[options.incrementIndex]);
    }, 50);
  }
}

function renderOutputArray(arr, options = {}) {
  if (!outputSvg) return;
  clearSvg(outputSvg);
  
  const W = 800;
  const gap = 6;
  if (!arr || arr.length === 0) return;

  const labelHeight = 0;
  const bottomTextHeight = 22;
  const gapY = 2;

  const n = arr.length;
  const size = (W - 6 * 2 - gap * (n - 1)) / n;
  const y = setupSvg(outputSvg, W, size, labelHeight, bottomTextHeight, gapY);

  for (let i = 0; i < n; i++) {
    const x = 6 + i * (size + gap);
    const rect = el('rect', { 
      x, y, width: size, height: size, rx: 12, 
      class: 'cell-rect' 
    });
    
    if (options.placeIndex !== null && i === options.placeIndex) {
      rect.classList.add('place');
    }
    if (arr[i] !== null) {
      rect.classList.add('filled');
    }

    const idxLabel = el('text', { 
      x: x + size / 2, y: y + size + 12, class: 'cell-subtext' 
    }, `i=${i}`);
    
    const val = arr[i] === null ? '' : String(arr[i]);
    const valText = el('text', { 
      x: x + size / 2, y: y + size / 2, class: 'cell-text' 
    }, val);

    outputSvg.appendChild(rect);
    outputSvg.appendChild(valText);
    outputSvg.appendChild(idxLabel);
  }
}

function renderAll(inputArr, countArr, outputArr, options = {}) {
  renderInputArray(inputArr, {
    activeIndex: options.inputActive,
    dimAllExceptActive: options.dimInput,
    placedIndex: options.inputPlaced
  });
  
  renderCountArray(countArr, {
    activeIndex: options.countActive,
    calcIndex: options.countCalc,
    incrementIndex: options.countIncrement
  });
  
  renderOutputArray(outputArr, {
    placeIndex: options.outputPlace
  });
}