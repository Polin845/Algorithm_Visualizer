function cloneArray(a) {
  return a.slice();
}

//то есть эта функция записывает текщее состояние алгоритма в массив steps
function pushStep(steps, step) {
   // ВРЕМЕННО: для отладки
  if (step.countIncrementIndex !== undefined && step.countIncrementIndex !== null) {
    console.log("Step with increment:", step.countIncrementIndex, "countArray:", step.countArray);
  }
  
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
    countIncrementIndex: step.countIncrementIndex ?? null,
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
  const x = inputArray[i]; // текущее значение входного массива

  // шаг 1 — читаем элемент input
  pushStep(steps, {
    inputArray,
    countArray,
    outputArray,
    highlightedInputIndex: i,
    highlightedCountIndex: x,
    highlightedOutputIndex: null,
    phase: "counting",
    calcText: `Read <strong>input[${i}]</strong> = <strong>${x}</strong>.`,
    dimInput: true,
  });

  // шаг 2 — показываем +1 (но число ещё не увеличиваем)
  pushStep(steps, {
    inputArray,
    countArray,
    outputArray,
    highlightedInputIndex: i,
    highlightedCountIndex: x,
    highlightedOutputIndex: null,
    countIncrementIndex: x,
    phase: "counting",
    calcText: `Prepare to increment <strong>count[${x}]</strong>.`,
    dimInput: true,
  });

  // теперь реально увеличиваем число
  countArray[x] += 1;

  // шаг 3 — показываем новое значение
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

  // PHASE 2 — Build output directly from counts (no prefix sums)
  pushStep(steps, {
    inputArray,
    countArray,
    outputArray,
    highlightedInputIndex: null,
    highlightedCountIndex: null,
    highlightedOutputIndex: null,
    phase: "placement",
    calcText:
      "Phase 2: build the output array directly from <strong>count</strong>. For each value <strong>v</strong>, write it <strong>count[v]</strong> times into output (left-to-right), decrementing as you go.",
    dimInput: false,
  });

  let outPos = 0;
  for (let v = 0; v < countArray.length; v++) {
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: null,
      highlightedCountIndex: v,
      highlightedOutputIndex: null,
      phase: "placement",
      calcText: `Value <strong>${v}</strong>: current <strong>count[${v}]</strong> = <strong>${countArray[v]}</strong>.`,
      dimInput: false,
    });

    while (countArray[v] > 0) {
      pushStep(steps, {
        inputArray,
        countArray,
        outputArray,
        highlightedInputIndex: null,
        highlightedCountIndex: v,
        highlightedOutputIndex: outPos,
        phase: "placement",
        calcText: `Write <strong>${v}</strong> to <strong>output[${outPos}]</strong>, then decrement <strong>count[${v}]</strong>.`,
        dimInput: false,
      });

      outputArray[outPos] = v;
      countArray[v] -= 1;

      pushStep(steps, {
        inputArray,
        countArray,
        outputArray,
        highlightedInputIndex: null,
        highlightedCountIndex: v,
        highlightedOutputIndex: outPos,
        phase: "placement",
        calcText: `Placed. Now <strong>count[${v}]</strong> = <strong>${countArray[v]}</strong>.`,
        dimInput: false,
      });

      outPos += 1;
    }
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
  if (phase === "placement") return { text: "Phase 2: Building output from count[]", cls: "phase3" };
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
    countIncrement: step.countIncrementIndex,
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
  setPlayIcon();
  playPauseBtn.title = "Resume";
  updateButtons();
}

//обновление кнопок
function updateButtons() {
  const hasSteps = animationSteps.length > 0;
  const atStart = currentStepIndex <= 0;
  const atEnd = hasSteps && currentStepIndex >= animationSteps.length - 1;

  playPauseBtn.disabled = hasSteps && atEnd;

  stepBackBtn.disabled = !hasSteps || atStart;
  stepForwardBtn.disabled = !hasSteps || atEnd;

  resetBtn.disabled = !hasSteps;

  // generate button should always be available so user can abort current run
  generateBtn.disabled = false;
}