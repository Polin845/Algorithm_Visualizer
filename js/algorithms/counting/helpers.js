function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function setPhase(text, cssClass) {
  const phaseBadge = document.getElementById('phaseBadge');
  if (phaseBadge) {
    phaseBadge.textContent = text;
    phaseBadge.className = 'phase-badge';
    if (cssClass) phaseBadge.classList.add(cssClass);
  }
}

function setCalcText(html) {
  const calcLine = document.getElementById('calcLine');
  if (calcLine) {
    calcLine.innerHTML = html || '';
  }
}

function showFloatingPlus(index, newValue) {
  const countCells = document.querySelectorAll('#countSvg .cell-rect');
  if (index >= countCells.length) return;
  
  const cell = countCells[index];
  const rect = cell.getBoundingClientRect();
  
  const floatPlus = document.createElement('div');
  floatPlus.className = 'plus-one-float';
  floatPlus.textContent = '+1';
  floatPlus.style.left = (rect.left + rect.width / 2 - 15) + 'px';
  floatPlus.style.top = (rect.top - 35) + 'px';
  
  document.body.appendChild(floatPlus);
  
  setTimeout(() => {
    // Обновляем значение в ячейке
    const allTexts = countSvg.querySelectorAll('.cell-text');
    if (allTexts[index]) {
      allTexts[index].textContent = newValue;
      allTexts[index].classList.add('highlight');
      
      setTimeout(() => {
        allTexts[index].classList.remove('highlight');
      }, 300);
    }
    
    floatPlus.remove();
  }, 400);
}

// Функция получения задержки из playback контролов
function getDelayMs() {
  return window.playback ? window.playback.getSpeed() : 500;
}