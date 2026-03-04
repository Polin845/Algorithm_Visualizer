// Configuration
const ARRAY_SIZE = 30;
const MIN_VALUE = 5;
const MAX_VALUE = 100;

// State
let array = [];
let isSorting = false;

// DOM elements
const arrayContainer = document.getElementById("arrayContainer");
const generateArrayBtn = document.getElementById("generateArrayBtn");
const startSortBtn = document.getElementById("startSortBtn");
const speedRange = document.getElementById("speedRange");
const speedLabel = document.getElementById("speedLabel");
const customArrayInput = document.getElementById("customArrayInput");
const setArrayBtn = document.getElementById("setArrayBtn");

function getDelayFromSpeedSlider() {
  // Slider value is already in ms in this implementation
  return Number(speedRange.value);
}

function updateSpeedLabel() {
  speedLabel.textContent = `${getDelayFromSpeedSlider()} ms`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateRandomArray() {
  if (isSorting) return;
  array = Array.from({ length: ARRAY_SIZE }, () =>
    Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
  );
  renderArray();
}

function clearBarStates() {
  const bars = arrayContainer.children;
  for (const bar of bars) {
    bar.classList.remove("comparing", "swapping", "sorted");
  }
}

function renderArray(highlightIndices = {}, sortedBoundary = null) {
  arrayContainer.innerHTML = "";

  if (array.length === 0) {
    return;
  }

  const maxVal = Math.max(...array);

  array.forEach((value, index) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("bar-wrapper");

    const bar = document.createElement("div");
    bar.classList.add("bar");

    const heightPercent = (value / maxVal) * 100;
    bar.style.height = `${heightPercent}%`;

    if (highlightIndices.comparing && highlightIndices.comparing.has(index)) {
      bar.classList.add("comparing");
    }
    if (highlightIndices.swapping && highlightIndices.swapping.has(index)) {
      bar.classList.add("swapping");
    }

    if (sortedBoundary !== null && index >= sortedBoundary) {
      bar.classList.add("sorted");
    }

    const label = document.createElement("div");
    label.classList.add("bar-value");
    label.textContent = value;

    wrapper.appendChild(bar);
    wrapper.appendChild(label);
    arrayContainer.appendChild(wrapper);
  });
}

function setControlsDisabled(disabled) {
  generateArrayBtn.disabled = disabled;
  startSortBtn.disabled = disabled;
  speedRange.disabled = disabled;
  setArrayBtn.disabled = disabled;
  customArrayInput.disabled = disabled;
}

function setCustomArrayFromInput() {
  if (isSorting) return;
  const raw = customArrayInput.value.trim();
  if (!raw) return;

  const parts = raw.split(/\s+/);
  const numbers = parts.map((p) => Number(p));

  if (numbers.some((n) => !Number.isFinite(n))) {
    alert("Please enter only numbers separated by spaces.");
    return;
  }

  if (numbers.length === 0) {
    return;
  }

  array = numbers;
  renderArray();
}

async function bubbleSort() {
  const n = array.length;
  let swapped;

  for (let i = 0; i < n - 1; i++) {
    swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      const delay = getDelayFromSpeedSlider();

      renderArray(
        {
          comparing: new Set([j, j + 1]),
        },
        n - i
      );
      await sleep(delay);

      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];

        renderArray(
          {
            swapping: new Set([j, j + 1]),
          },
          n - i
        );
        await sleep(delay);

        swapped = true;
      }
    }

    if (!swapped) {
      break;
    }
  }

  renderArray({}, 0);
}

async function handleStartSort() {
  if (isSorting || array.length === 0) return;

  isSorting = true;
  setControlsDisabled(true);

  try {
    await bubbleSort();
    renderArray(
      {},
      0 // all bars as sorted color at the end
    );
  } finally {
    isSorting = false;
    setControlsDisabled(false);
  }
}

function init() {
  updateSpeedLabel();
  generateRandomArray();

  speedRange.addEventListener("input", updateSpeedLabel);
  generateArrayBtn.addEventListener("click", generateRandomArray);
  startSortBtn.addEventListener("click", handleStartSort);
  setArrayBtn.addEventListener("click", setCustomArrayFromInput);
  customArrayInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setCustomArrayFromInput();
    }
  });
}

document.addEventListener("DOMContentLoaded", init);

