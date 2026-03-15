// steps.js
function cloneArray(a) {
  return a.slice();
}

function pushStep(steps, step) {
  if (step.countIncrementIndex !== undefined && step.countIncrementIndex !== null) {
    console.log("Step with increment:", step.countIncrementIndex, "countArray:", step.countArray);
  }

  steps.push({
    inputArray: cloneArray(step.inputArray),
    countArray: cloneArray(step.countArray),
    outputArray: cloneArray(step.outputArray),
    highlightedInputIndex: step.highlightedInputIndex ?? null,
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
  console.log("Building animation steps with input:", input);
  const steps = [];
  const inputArray = cloneArray(input);
  const countArray = Array.from({ length: maxValue + 1 }, () => 0);
  const outputArray = Array.from({ length: inputArray.length }, () => null);

  // --- начальный шаг ---
  pushStep(steps, {
    inputArray,
    countArray,
    outputArray,
    phase: "counting",
    calcText: "Ready. Press Resume (or Step Forward) to begin Phase 1.",
    dimInput: false,
  });

  // PHASE 1 - подсчет
  for (let i = 0; i < inputArray.length; i++) {
    const x = inputArray[i];

    // Шаг 1: показываем какой элемент читаем
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: i,
      highlightedCountIndex: x,
      phase: "counting",
      calcText: `Read <strong>input[${i}]</strong> = <strong>${x}</strong>.`,
      dimInput: true,
    });

    // Шаг 2: показываем подготовку к инкременту (здесь будет анимация +1)
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: i,
      highlightedCountIndex: x,
      countIncrementIndex: x,  // Этот флаг запустит анимацию +1
      phase: "counting",
      calcText: `Incrementing <strong>count[${x}]</strong>...`,
      dimInput: true,
    });

    // Реально инкрементируем значение
    countArray[x] += 1;

    // Шаг 3: показываем результат после инкремента
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: i,
      highlightedCountIndex: x,
      phase: "counting",
      calcText: `Incremented: <strong>count[${x}]</strong> is now <strong>${countArray[x]}</strong>.`,
      dimInput: true,
    });
  }

  // PHASE 2 - Build output directly from counts
  pushStep(steps, {
    inputArray,
    countArray,
    outputArray,
    phase: "placement",
    calcText:
      "Phase 2: build the output array directly from <strong>count</strong>. For each value <strong>v</strong>, write it <strong>count[v]</strong> times into output (left-to-right), decrementing as you go.",
  });

  let outPos = 0;
  for (let v = 0; v < countArray.length; v++) {
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedCountIndex: v,
      phase: "placement",
      calcText: `Value <strong>${v}</strong>: current <strong>count[${v}]</strong> = <strong>${countArray[v]}</strong>.`,
    });

    while (countArray[v] > 0) {
      pushStep(steps, {
        inputArray,
        countArray,
        outputArray,
        highlightedCountIndex: v,
        highlightedOutputIndex: outPos,
        phase: "placement",
        calcText: `Write <strong>${v}</strong> to <strong>output[${outPos}]</strong>, then decrement <strong>count[${v}]</strong>.`,
      });

      outputArray[outPos] = v;
      countArray[v] -= 1;

      pushStep(steps, {
        inputArray,
        countArray,
        outputArray,
        highlightedCountIndex: v,
        highlightedOutputIndex: outPos,
        phase: "placement",
        calcText: `Placed. Now <strong>count[${v}]</strong> = <strong>${countArray[v]}</strong>.`,
      });

      outPos += 1;
    }
  }

  pushStep(steps, {
    inputArray,
    countArray,
    outputArray,
    phase: "done",
    calcText: "Done. The output array is sorted.",
  });

  console.log(`Built ${steps.length} steps`);
  return steps;
}

// --- рендер и навигация ---
function phaseText(phase) {
  if (phase === "counting") return { text: "Phase 1: Counting occurrences", cls: "phase1" };
  if (phase === "placement") return { text: "Phase 2: Building output from count[]", cls: "phase3" };
  if (phase === "done") return { text: "Done — Output is sorted", cls: "done" };
  return { text: "Ready", cls: "" };
}

function renderStep(step) {
  if (!step) return;
  console.log("Rendering step", currentStepIndex);
  const p = phaseText(step.phase);
  setPhase(p.text, p.cls);
  setCalcText(step.calcText || "");
  renderAll(step.inputArray, step.countArray, step.outputArray, {
    inputActive: step.highlightedInputIndex,
    dimInput: step.dimInput,
    countActive: step.highlightedCountIndex,
    countCalc: step.calcIndex ?? null,
    countIncrement: step.countIncrementIndex,
    outputPlace: step.highlightedOutputIndex,
  });
  
  // Обновляем кнопки через глобальный playback
  if (window.playback) {
    window.playback.updateButtons();
  }
}

function stepForward() {
  console.log("Step forward", { currentStepIndex, totalSteps: animationSteps.length });
  if (animationSteps.length === 0) {
    animationSteps = buildAnimationSteps();
    currentStepIndex = 0;
  }
  if (currentStepIndex < animationSteps.length - 1) {
    currentStepIndex++;
    renderStep(animationSteps[currentStepIndex]);
  }
}

function stepBackward() {
  console.log("Step backward", { currentStepIndex });
  if (animationSteps.length === 0) return;
  if (currentStepIndex > 0) {
    currentStepIndex--;
    renderStep(animationSteps[currentStepIndex]);
  }
}

async function playFromCurrent() {
  console.log("playFromCurrent started", { 
    hasSteps: animationSteps.length > 0,
    currentStepIndex,
    isPlaying: window.playback ? window.playback.isPlaying : false 
  });
  
  if (animationSteps.length === 0) {
    animationSteps = buildAnimationSteps();
    currentStepIndex = 0;
    renderStep(animationSteps[0]);
  }
  
  // Убеждаемся, что мы не на последнем шаге
  while (window.playback && window.playback.isPlaying && currentStepIndex < animationSteps.length - 1) {
    await sleep(window.playback.getSpeed());
    if (!window.playback || !window.playback.isPlaying) break;
    currentStepIndex++;
    renderStep(animationSteps[currentStepIndex]);
  }
  
  // Если дошли до конца, останавливаем воспроизведение
  if (currentStepIndex >= animationSteps.length - 1 && window.playback) {
    console.log("Reached end, pausing");
    window.playback.pause();
  }
}

function resetPlaybackToStart() {
  console.log("Resetting to start");
  if (animationSteps.length === 0) return;
  currentStepIndex = 0;
  renderStep(animationSteps[0]);
  if (window.playback) {
    window.playback.pause();
  }
}