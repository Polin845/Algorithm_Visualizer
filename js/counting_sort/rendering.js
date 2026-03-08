// Универсальная функция для автоцентрирования и подгонки высоты SVG
function setupSvg(svg, W, cellHeight, labelHeight = 18, bottomTextHeight = 22, gapY = 2) {
  const H = labelHeight + cellHeight + bottomTextHeight + gapY * 2 + 10; // минимальная необходимая высота
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  return labelHeight + gapY; // y-координата верхнего квадрата
}

function renderInputArray(arr, { activeIndex = null, dimAllExceptActive = false, placedIndex = null } = {}) {
  clearSvg(inputSvg);
  const W = 800;
  const gap = 6;
  if (arr.length === 0) return;

  const labelHeight = 18;
  const bottomTextHeight = 22;
  const gapY = 2;

  const n = arr.length;
  const cell = (W - 6 * 2 - gap * (n - 1)) / n;
  const y = setupSvg(inputSvg, W, cell, labelHeight, bottomTextHeight, gapY);

  for (let i = 0; i < n; i++) {
    const x = 6 + i * (cell + gap);
    const rect = el("rect", { x, y, width: cell, height: cell, rx: 12, class: "cell-rect" });
    if (dimAllExceptActive && activeIndex !== null && i !== activeIndex) rect.classList.add("dim");
    if (activeIndex !== null && i === activeIndex) rect.classList.add("active");
    if (placedIndex !== null && i === placedIndex) rect.classList.add("placed");

    const text = el("text", { x: x + cell / 2, y: y + cell / 2, class: "cell-text" }, String(arr[i]));
    const idx = el("text", { x: x + cell / 2, y: y + cell + 12, class: "cell-subtext" }, `i=${i}`);

    inputSvg.appendChild(rect);
    inputSvg.appendChild(text);
    inputSvg.appendChild(idx);
  }
}

function renderCountArray(arr, { activeIndex = null, calcIndex = null } = {}) {
  clearSvg(countSvg);
  const W = 800;
  const gap = 6;
  if (arr.length === 0) return;

  const labelHeight = 0; // убрали верхнюю надпись
  const bottomTextHeight = 22; // теперь снизу только подписи i=...
  const gapY = 2;

  const cols = arr.length;
  const size = (W - 6 * 2 - gap * (cols - 1)) / cols;
  const y = setupSvg(countSvg, W, size, labelHeight, bottomTextHeight, gapY);

  for (let i = 0; i < cols; i++) {
    const x = 6 + i * (size + gap);
    const rect = el("rect", { x, y, width: size, height: size, rx: 12, class: "cell-rect" });
    if (activeIndex !== null && i === activeIndex) rect.classList.add("active");
    if (calcIndex !== null && i === calcIndex) rect.classList.add("calc");

    // снизу надпись i={номер}, как в первой секции
    const idxLabel = el("text", { x: x + size / 2, y: y + size + 12, class: "cell-subtext" }, `i=${i}`);

    // значение count (само число) остаётся в центре квадрата
    const cntVal = el("text", { x: x + size / 2, y: y + size / 2, class: "cell-text" }, String(arr[i]));

    countSvg.appendChild(rect);
    countSvg.appendChild(cntVal);
    countSvg.appendChild(idxLabel);
  }
}

function renderOutputArray(arr, { placeIndex = null } = {}) {
  clearSvg(outputSvg);
  const W = 800;
  const gap = 6;
  if (arr.length === 0) return;

  const labelHeight = 0; // убрали верхнюю надпись
  const bottomTextHeight = 22; // подписи i=... снизу
  const gapY = 2;

  const n = arr.length;
  const size = (W - 6 * 2 - gap * (n - 1)) / n;
  const y = setupSvg(outputSvg, W, size, labelHeight, bottomTextHeight, gapY);

  for (let i = 0; i < n; i++) {
    const x = 6 + i * (size + gap);
    const rect = el("rect", { x, y, width: size, height: size, rx: 12, class: "cell-rect" });
    if (placeIndex !== null && i === placeIndex) rect.classList.add("place");
    if (arr[i] !== null) rect.classList.add("filled");

    // подпись снизу: i={номер квадрата}
    const idxLabel = el("text", { x: x + size / 2, y: y + size + 12, class: "cell-subtext" }, `i=${i}`);
    const val = arr[i] === null ? "" : String(arr[i]);
    const valText = el("text", { x: x + size / 2, y: y + size / 2, class: "cell-text" }, val);

    outputSvg.appendChild(rect);
    outputSvg.appendChild(valText);
    outputSvg.appendChild(idxLabel);
  }
}

function renderAll(
  inputArr,
  countArr,
  outputArr,
  { inputActive = null, dimInput = false, countActive = null, countCalc = null, outputPlace = null } = {}
) {
  renderInputArray(inputArr, { activeIndex: inputActive, dimAllExceptActive: dimInput });
  renderCountArray(countArr, { activeIndex: countActive, calcIndex: countCalc });
  renderOutputArray(outputArr, { placeIndex: outputPlace });
}