

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

