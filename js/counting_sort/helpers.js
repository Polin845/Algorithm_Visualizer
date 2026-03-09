

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDelayMs() {
  return SPEED_MS_BY_LEVEL[Number(speedSlider.value)] ?? 350;
}

// update text next to speed slider
function setSpeedLabel() {
  speedLabel.textContent = `${getDelayMs()} ms`;
}

function setPhase(text, cssClass) {
  phaseBadge.textContent = text;
  phaseBadge.className = "phase-badge";
  if (cssClass) phaseBadge.classList.add(cssClass);
}

function setCalcText(html) {
  calcLine.innerHTML = html || "";
}

function clearSvg(svgEl) {
  while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
}

function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function showFloatingPlus(index, newValue) {
  // Находим ячейку count array по индексу
  const countCells = document.querySelectorAll('#countSvg .cell-rect');
  if (index >= countCells.length) return;
  
  const cell = countCells[index];
  const rect = cell.getBoundingClientRect();
  
  // Находим текстовый элемент внутри ячейки
  const allTexts = countSvg.querySelectorAll('.cell-text');
  const textElement = allTexts[index];
  
  if (!textElement) {
    console.error("Text element not found for index", index);
    return;
  }
  
  console.log("Starting animation for index", index, "new value:", newValue);
  
  // Создаем плавающий элемент
  const floatPlus = document.createElement('div');
  floatPlus.className = 'plus-one-float';
  floatPlus.textContent = '+1';
  floatPlus.style.left = (rect.left + rect.width / 2 - 15) + 'px';
  floatPlus.style.top = (rect.top - 35) + 'px';
  floatPlus.style.fontSize = '24px'; // фиксированный размер
  
  document.body.appendChild(floatPlus);
  
  // Анимация: +1 летит вниз
  setTimeout(() => {
    // Меняем число
    textElement.textContent = newValue;
    textElement.classList.add('highlight');
    
    // Убираем подсветку
    setTimeout(() => {
      textElement.classList.remove('highlight');
    }, 300);
    
    // Удаляем плюс
    floatPlus.remove();
  }, 400); // Почти в конце анимации (500ms)
}