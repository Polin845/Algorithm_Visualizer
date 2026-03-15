<<<<<<< HEAD
let input = [];
let maxValue = 0;
let count = [];
let output = [];

// Playback / history
let animationSteps = [];
let currentStepIndex = 0;
let isRunning = false; // autoplay loop running
let isPaused = false;
let playbackRunId = 0; // increment to cancel old autoplay loops

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// parse user-provided numbers (space-separated). Returns null if nothing valid.
function parseCustomInput() {
  const txt = document.getElementById("customArray").value.trim();
  if (!txt) return null;
  const nums = txt
    .split(/\s+/)
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n));
  return nums.length ? nums : null;
}

// always produces a random array
function generateArray() {
  const length = 15;
  const max = randomInt(10, 14);
  const arr = Array.from({ length }, () => randomInt(0, max));

  input = arr;
  maxValue = Math.max(...input);
  count = Array.from({ length: maxValue + 1 }, () => 0);
  output = Array.from({ length: input.length }, () => null);

    console.log("Generated array:", input);

=======
let input = [];
let maxValue = 0;
let count = [];
let output = [];

// Playback / history
let animationSteps = [];
let currentStepIndex = 0;
let isRunning = false; // autoplay loop running
let isPaused = false;
let playbackRunId = 0; // increment to cancel old autoplay loops

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// parse user-provided numbers (space-separated). Returns null if nothing valid.
function parseCustomInput() {
  const txt = document.getElementById("customArray").value.trim();
  if (!txt) return null;
  const nums = txt
    .split(/\s+/)
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n));
  return nums.length ? nums : null;
}

// always produces a random array
function generateArray() {
  const length = 15;
  const max = randomInt(10, 14);
  const arr = Array.from({ length }, () => randomInt(0, max));

  input = arr;
  maxValue = Math.max(...input);
  count = Array.from({ length: maxValue + 1 }, () => 0);
  output = Array.from({ length: input.length }, () => null);

    console.log("Generated array:", input);

>>>>>>> e11a861e7600a813384879e6fe6e310384aef388
}