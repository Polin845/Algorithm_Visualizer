const COUNTING_ARRAY_SIZE = 20;
const COUNTING_MIN_VALUE = 0;
const COUNTING_MAX_VALUE = 20;

let countingArray = [];
let isCountingSorting = false;

const countingArrayContainer = document.getElementById(
  "countingArrayContainer"
);
const countingGenerateArrayBtn = document.getElementById(
  "countingGenerateArrayBtn"
);
const countingStartSortBtn = document.getElementById(
  "countingStartSortBtn"
);
const countingSpeedRange = document.getElementById("countingSpeedRange");
const countingSpeedLabel = document.getElementById("countingSpeedLabel");
const countingCustomArrayInput = document.getElementById(
  "countingCustomArrayInput"
);
const countingSetArrayBtn = document.getElementById("countingSetArrayBtn");

function getCountingDelay() {
  return Number(countingSpeedRange.value);
}

function updateCountingSpeedLabel() {
  countingSpeedLabel.textContent = `${getCountingDelay()} ms`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateCountingRandomArray() {
  if (isCountingSorting) return;
  countingArray = Array.from({ length: COUNTING_ARRAY_SIZE }, () =>
    Math.floor(
      Math.random() * (COUNTING_MAX_VALUE - COUNTING_MIN_VALUE + 1)
    ) + COUNTING_MIN_VALUE
  );
  renderCountingArray();
}

function renderCountingArray(highlightIndices = {}) {
  countingArrayContainer.innerHTML = "";

  if (countingArray.length === 0) {
    return;
  }

  const maxVal = Math.max(...countingArray, 1);

  countingArray.forEach((value, index) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("bar-wrapper");

    const bar = document.createElement("div");
    bar.classList.add("bar");

    const heightPercent = (value / maxVal) * 100;
    bar.style.height = `${heightPercent}%`;

    if (
      highlightIndices.active &&
      highlightIndices.active.has(index)
    ) {
      bar.classList.add("swapping");
    }

    const label = document.createElement("div");
    label.classList.add("bar-value");
    label.textContent = value;

    wrapper.appendChild(bar);
    wrapper.appendChild(label);
    countingArrayContainer.appendChild(wrapper);
  });
}

function setCountingControlsDisabled(disabled) {
  countingGenerateArrayBtn.disabled = disabled;
  countingStartSortBtn.disabled = disabled;
  countingSpeedRange.disabled = disabled;
  countingCustomArrayInput.disabled = disabled;
  countingSetArrayBtn.disabled = disabled;
}

function setCountingArrayFromInput() {
  if (isCountingSorting) return;
  const raw = countingCustomArrayInput.value.trim();
  if (!raw) return;

  const parts = raw.split(/\s+/);
  const numbers = parts.map((p) => Number(p));

  if (numbers.some((n) => !Number.isFinite(n) || n < 0)) {
    alert("Please enter only non‑negative integers separated by spaces.");
    return;
  }

  if (numbers.length === 0) {
    return;
  }

  countingArray = numbers;
  renderCountingArray();
}

async function countingSort() {
  if (countingArray.length === 0) return;

  const maxVal = Math.max(...countingArray);
  const count = new Array(maxVal + 1).fill(0);

  // Counting occurrences
  for (let i = 0; i < countingArray.length; i++) {
    count[countingArray[i]]++;
    renderCountingArray({ active: new Set([i]) });
    await sleep(getCountingDelay());
  }

  // Build sorted array
  const sorted = [];
  for (let value = 0; value <= maxVal; value++) {
    while (count[value] > 0) {
      sorted.push(value);
      count[value]--;
    }
  }

  // Animate placing into final positions
  for (let i = 0; i < sorted.length; i++) {
    countingArray[i] = sorted[i];
    renderCountingArray({ active: new Set([i]) });
    await sleep(getCountingDelay());
  }

  renderCountingArray();
}

async function handleCountingStartSort() {
  if (isCountingSorting || countingArray.length === 0) return;

  isCountingSorting = true;
  setCountingControlsDisabled(true);

  try {
    await countingSort();
  } finally {
    isCountingSorting = false;
    setCountingControlsDisabled(false);
  }
}

function initCountingPage() {
  updateCountingSpeedLabel();
  generateCountingRandomArray();

  countingSpeedRange.addEventListener("input", updateCountingSpeedLabel);
  countingGenerateArrayBtn.addEventListener(
    "click",
    generateCountingRandomArray
  );
  countingStartSortBtn.addEventListener("click", handleCountingStartSort);
  countingSetArrayBtn.addEventListener("click", setCountingArrayFromInput);
  countingCustomArrayInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setCountingArrayFromInput();
    }
  });
}

document.addEventListener("DOMContentLoaded", initCountingPage);

