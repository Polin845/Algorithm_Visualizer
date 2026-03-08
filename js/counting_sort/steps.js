function cloneArray(a) {
  return a.slice();
}

//то есть эта функция записывает текщее состояние алгоритма в массив steps
function pushStep(steps, step) {
  steps.push({
    inputArray: cloneArray(step.inputArray),
    countArray: cloneArray(step.countArray),
    outputArray: cloneArray(step.outputArray),
    highlightedInputIndex: step.highlightedInputIndex ?? null, //если нет значения, то null
    highlightedCountIndex: step.highlightedCountIndex ?? null,
    highlightedOutputIndex: step.highlightedOutputIndex ?? null,
    calcIndex: step.calcIndex ?? null,
    phase: step.phase,
    calcText: step.calcText ?? "",
    dimInput: Boolean(step.dimInput),
  });
}

function buildAnimationSteps() {
  const steps = [];

  const inputArray = cloneArray(input);
  const countArray = Array.from({ length: maxValue + 1 }, () => 0);
  const outputArray = Array.from({ length: inputArray.length }, () => null);

  pushStep(steps, {
    inputArray,
    countArray,
    outputArray,
    highlightedInputIndex: null,
    highlightedCountIndex: null,
    highlightedOutputIndex: null,
    phase: "counting",
    calcText: "Ready. Press Resume (or Step Forward) to begin Phase 1.",
    dimInput: false,
  });

  // PHASE 1 - подсчет вхождений каждого значения
  
  for (let i = 0; i < inputArray.length; i++) {
    const x = inputArray[i]; // текущее значения входного массива
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: i,
      highlightedCountIndex: x,
      highlightedOutputIndex: null,
      phase: "counting",
      calcText: `Read <strong>input[${i}]</strong> = <strong>${x}</strong>. Increment <strong>count[${x}]</strong>.`,
      dimInput: true,
    });

    countArray[x] += 1;
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: i,
      highlightedCountIndex: x,
      highlightedOutputIndex: null,
      phase: "counting",
      calcText: `Incremented: <strong>count[${x}]</strong> is now <strong>${countArray[x]}</strong>.`,
      dimInput: true,
    });
  }

  // PHASE 2 — Prefix sums
  pushStep(steps, {
    inputArray,
    countArray,
    outputArray,
    highlightedInputIndex: null,
    highlightedCountIndex: null,
    highlightedOutputIndex: null,
    phase: "prefix_sum",
    calcText: "Phase 2: convert counts to prefix sums (how many elements are ≤ each index).",
    dimInput: false,
  });

  for (let i = 1; i < countArray.length; i++) {
    const before = countArray[i];
    const add = countArray[i - 1];
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: null,
      highlightedCountIndex: null,
      highlightedOutputIndex: null,
      phase: "prefix_sum",
      calcText: `Compute: <strong>count[${i}]</strong> = <strong>${before}</strong> + <strong>count[${i - 1}]</strong> (${add})`,
      dimInput: false,
      calcIndex: i,
    });

    countArray[i] = before + add;
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: null,
      highlightedCountIndex: null,
      highlightedOutputIndex: null,
      phase: "prefix_sum",
      calcText: `Updated: <strong>count[${i}]</strong> = <strong>${countArray[i]}</strong>.`,
      dimInput: false,
      calcIndex: i,
    });
  }

  // PHASE 3 — Building output (stable right-to-left)
  pushStep(steps, {
    inputArray,
    countArray,
    outputArray,
    highlightedInputIndex: null,
    highlightedCountIndex: null,
    highlightedOutputIndex: null,
    phase: "placement",
    calcText: "Phase 3: build output right-to-left. Place at count[value] - 1, then decrement.",
    dimInput: false,
  });

  for (let i = inputArray.length - 1; i >= 0; i--) {
    const x = inputArray[i];
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: i,
      highlightedCountIndex: x,
      highlightedOutputIndex: null,
      phase: "placement",
      calcText: `Take <strong>input[${i}]</strong> = <strong>${x}</strong>. Use <strong>count[${x}]</strong> to find its position.`,
      dimInput: true,
    });

    const pos = countArray[x] - 1;
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: i,
      highlightedCountIndex: x,
      highlightedOutputIndex: pos,
      phase: "placement",
      calcText: `Place <strong>${x}</strong> at output position <strong>${pos}</strong> (because count[${x}] = ${countArray[x]}).`,
      dimInput: true,
    });

    outputArray[pos] = x;
    countArray[x] -= 1;
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: i,
      highlightedCountIndex: x,
      highlightedOutputIndex: pos,
      phase: "placement",
      calcText: `Placed. Decrement: <strong>count[${x}]</strong> becomes <strong>${countArray[x]}</strong>.`,
      dimInput: true,
    });
  }

  pushStep(steps, {
    inputArray,
    countArray,
    outputArray,
    highlightedInputIndex: null,
    highlightedCountIndex: null,
    highlightedOutputIndex: null,
    phase: "done",
    calcText: "Done. The output array is sorted.",
    dimInput: false,
  });

  return steps;
}

function phaseText(phase) {
  if (phase === "counting") return { text: "Phase 1: Counting occurrences", cls: "phase1" };
  if (phase === "prefix_sum") return { text: "Phase 2: Prefix sums", cls: "phase2" };
  if (phase === "placement") return { text: "Phase 3: Building output array", cls: "phase3" };
  if (phase === "done") return { text: "Done — Output is sorted", cls: "done" };
  return { text: "Ready", cls: "" };
}

function renderStep(step) {
  if (!step) return;

  const p = phaseText(step.phase);
  setPhase(p.text, p.cls);
  setCalcText(step.calcText || "");

  const countCalcIndex = step.calcIndex ?? null;
  renderAll(step.inputArray, step.countArray, step.outputArray, {
    inputActive: step.highlightedInputIndex,
    dimInput: step.dimInput,
    countActive: step.highlightedCountIndex,
    countCalc: countCalcIndex,
    outputPlace: step.highlightedOutputIndex,
  });

  updateButtons();
}

function stepForward() {
  if (animationSteps.length === 0) return;
  currentStepIndex = clamp(currentStepIndex + 1, 0, animationSteps.length - 1);
  renderStep(animationSteps[currentStepIndex]);
}

function stepBackward() {
  if (animationSteps.length === 0) return;
  currentStepIndex = clamp(currentStepIndex - 1, 0, animationSteps.length - 1);
  renderStep(animationSteps[currentStepIndex]);
}

async function playFromCurrent() {
  if (isRunning) return;
  if (animationSteps.length === 0) return;

  const runId = ++playbackRunId;
  isRunning = true;
  updateButtons();

  try {
    while (currentStepIndex < animationSteps.length - 1) {
      if (runId !== playbackRunId) return;
      while (isPaused) {
        if (runId !== playbackRunId) return;
        await sleep(50);
      }

      await sleep(getDelayMs());

      // If user paused during the delay, wait again before advancing.
      while (isPaused) {
        if (runId !== playbackRunId) return;
        await sleep(50);
      }

      if (runId !== playbackRunId) return;
      currentStepIndex += 1;
      renderStep(animationSteps[currentStepIndex]);
    }
  } finally {
    if (runId === playbackRunId) isRunning = false;
    updateButtons();
  }
}

function resetPlaybackToStart() {
  playbackRunId += 1; // cancel any running autoplay loop
  isPaused = false;
  isRunning = false;
  currentStepIndex = 0;
  if (animationSteps.length > 0) renderStep(animationSteps[0]);
  updateButtons();
}

//обновление кнопок
function updateButtons() {
  const hasSteps = animationSteps.length > 0;
  const atStart = currentStepIndex <= 0;
  const atEnd = hasSteps && currentStepIndex >= animationSteps.length - 1;

  playPauseBtn.disabled = !hasSteps || atEnd;

  stepBackBtn.disabled = !hasSteps || atStart;
  stepForwardBtn.disabled = !hasSteps || atEnd;

  resetBtn.disabled = !hasSteps;

  generateBtn.disabled = isRunning && !isPaused;
  startBtn.disabled = isRunning && !isPaused;
}