function renderInputArray(arr, { activeIndex = null, dimAllExceptActive = false, placedIndex = null } = {}) {
  clearSvg(inputSvg);

  const W = 800;
  const H = 220;
  const padX = 24;
  const padTop = 18;
  const padBottom = 34;
  const chartH = H - padTop - padBottom;

  const n = arr.length;
  const gap = 10;
  const barW = n === 0 ? 0 : (W - padX * 2 - gap * (n - 1)) / n;
  const max = Math.max(1, ...arr);

  inputSvg.appendChild(
    el("text", { x: padX, y: 16, fill: "rgba(184,199,238,.95)", "font-size": 12, "font-weight": 650 }, "Value bars")
  );

  for (let i = 0; i < n; i++) {
    const v = arr[i];
    const h = (v / max) * chartH;
    const x = padX + i * (barW + gap);
    const y = padTop + (chartH - h);

    const rect = el("rect", { x, y, width: barW, height: h, rx: 10, class: "bar-rect" });
    if (dimAllExceptActive && activeIndex !== null && i !== activeIndex) rect.classList.add("dim");
    if (activeIndex !== null && i === activeIndex) rect.classList.add("active");
    if (placedIndex !== null && i === placedIndex) rect.classList.add("placed");

    const text = el("text", { x: x + barW / 2, y: y + Math.max(16, h / 2), class: "bar-text" }, String(v));
    const idx = el("text", { x: x + barW / 2, y: H - 22, class: "bar-index" }, `i=${i}`);

    inputSvg.appendChild(rect);
    inputSvg.appendChild(text);
    inputSvg.appendChild(idx);
  }
}

function renderCountArray(arr, { activeIndex = null, calcIndex = null } = {}) {
  clearSvg(countSvg);

  const W = 800;
  const H = 220;
  const padX = 18;
  const padY = 20;

  if (arr.length === 0) return;

  const cols = arr.length;
  const gap = 8;
  const cellW = (W - padX * 2 - gap * (cols - 1)) / cols;
  const cellH = 74;
  const y = 86;

  countSvg.appendChild(
    el(
      "text",
      { x: padX, y: 18, fill: "rgba(184,199,238,.95)", "font-size": 12, "font-weight": 650 },
      "Index and count"
    )
  );

  for (let i = 0; i < cols; i++) {
    const x = padX + i * (cellW + gap);
    const rect = el("rect", { x, y, width: cellW, height: cellH, rx: 10, class: "cell-rect" });
    if (activeIndex !== null && i === activeIndex) rect.classList.add("active");
    if (calcIndex !== null && i === calcIndex) rect.classList.add("calc");

    const idxLabel = el("text", { x: x + cellW / 2, y: y - 16, class: "cell-subtext" }, `index ${i}`);
    const cntLabel = el("text", { x: x + cellW / 2, y: y + 28, class: "cell-subtext" }, "count");
    const cntVal = el("text", { x: x + cellW / 2, y: y + 52, class: "cell-text" }, String(arr[i]));

    countSvg.appendChild(idxLabel);
    countSvg.appendChild(rect);
    countSvg.appendChild(cntLabel);
    countSvg.appendChild(cntVal);
  }
}

function renderOutputArray(arr, { placeIndex = null } = {}) {
  clearSvg(outputSvg);

  const W = 800;
  const H = 180;
  const padX = 18;
  const padTop = 24;

  const n = arr.length;
  if (n === 0) return;

  const gap = 10;
  const cellW = (W - padX * 2 - gap * (n - 1)) / n;
  const cellH = 80;
  const y = padTop + 38;

  outputSvg.appendChild(
    el(
      "text",
      { x: padX, y: 22, fill: "rgba(184,199,238,.95)", "font-size": 12, "font-weight": 650 },
      "Output positions"
    )
  );

  for (let i = 0; i < n; i++) {
    const x = padX + i * (cellW + gap);
    const rect = el("rect", { x, y, width: cellW, height: cellH, rx: 12, class: "cell-rect" });
    if (placeIndex !== null && i === placeIndex) rect.classList.add("place");
    if (arr[i] !== null) rect.classList.add("filled");

    const idxLabel = el("text", { x: x + cellW / 2, y: y - 14, class: "cell-subtext" }, `pos ${i}`);
    const val = arr[i] === null ? "" : String(arr[i]);
    const valText = el("text", { x: x + cellW / 2, y: y + cellH / 2, class: "cell-text" }, val);

    outputSvg.appendChild(idxLabel);
    outputSvg.appendChild(rect);
    outputSvg.appendChild(valText);
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