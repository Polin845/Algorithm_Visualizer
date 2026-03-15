// Построение шагов анимации

function phaseText(phase) {
  if (phase === 'counting') return { text: 'Phase 1: Counting occurrences', cls: 'phase1' };
  if (phase === 'placement') return { text: 'Phase 2: Building output', cls: 'phase3' };
  if (phase === 'done') return { text: 'Done — Output is sorted', cls: 'done' };
  return { text: 'Ready', cls: '' };
}

function pushStep(steps, step) {
  steps.push({
    inputArray: cloneArray(step.inputArray),
    countArray: cloneArray(step.countArray),
    outputArray: cloneArray(step.outputArray),
    highlightedInputIndex: step.highlightedInputIndex ?? null,
    highlightedCountIndex: step.highlightedCountIndex ?? null,
    highlightedOutputIndex: step.highlightedOutputIndex ?? null,
    calcIndex: step.calcIndex ?? null,
    phase: step.phase,
    calcText: step.calcText ?? '',
    dimInput: Boolean(step.dimInput),
    countIncrementIndex: step.countIncrementIndex ?? null,
  });
}

function buildAnimationSteps() {
  const steps = [];

  const inputArray = cloneArray(input);
  const countArray = Array.from({ length: maxValue + 1 }, () => 0);
  const outputArray = Array.from({ length: inputArray.length }, () => null);

  // Начальный шаг
  pushStep(steps, {
    inputArray,
    countArray,
    outputArray,
    phase: 'ready',
    calcText: 'Ready. Press Play to begin counting.',
    dimInput: false,
  });

  // Фаза 1: подсчет
  for (let i = 0; i < inputArray.length; i++) {
    const x = inputArray[i];

    // Шаг 1: показываем какой элемент читаем
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: i,
      highlightedCountIndex: x,
      phase: 'counting',
      calcText: `Read <strong>input[${i}]</strong> = <strong>${x}</strong>`,
      dimInput: true,
    });

    // Шаг 2: показываем +1
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: i,
      highlightedCountIndex: x,
      countIncrementIndex: x,
      phase: 'counting',
      calcText: `Increment <strong>count[${x}]</strong>`,
      dimInput: true,
    });

    // Увеличиваем счетчик
    countArray[x] += 1;

    // Шаг 3: показываем новое значение
    pushStep(steps, {
      inputArray,
      countArray,
      outputArray,
      highlightedInputIndex: i,
      highlightedCountIndex: x,
      phase: 'counting',
      calcText: `<strong>count[${x}]</strong> is now <strong>${countArray[x]}</strong>`,
      dimInput: true,
    });
  }

  // Фаза 2: построение выходного массива
  pushStep(steps, {
    inputArray,
    countArray,
    outputArray,
    phase: 'placement',
    calcText: 'Phase 2: Building output array from counts',
    dimInput: false,
  });

  let outPos = 0;
  for (let v = 0; v < countArray.length; v++) {
    while (countArray[v] > 0) {
      // Показываем куда будем писать
      pushStep(steps, {
        inputArray,
        countArray,
        outputArray,
        highlightedCountIndex: v,
        highlightedOutputIndex: outPos,
        phase: 'placement',
        calcText: `Write <strong>${v}</strong> to <strong>output[${outPos}]</strong>`,
        dimInput: false,
      });

      // Записываем значение
      outputArray[outPos] = v;
      countArray[v] -= 1;

      // Показываем результат
      pushStep(steps, {
        inputArray,
        countArray,
        outputArray,
        highlightedCountIndex: v,
        highlightedOutputIndex: outPos,
        phase: 'placement',
        calcText: `Placed. <strong>count[${v}]</strong> = <strong>${countArray[v]}</strong>`,
        dimInput: false,
      });

      outPos++;
    }
  }

  // Финальный шаг
  pushStep(steps, {
    inputArray,
    countArray,
    outputArray,
    phase: 'done',
    calcText: 'Sorting complete! Output array is sorted.',
    dimInput: false,
  });

  return steps;
}

function renderStep(step) {
  if (!step) return;

  const p = phaseText(step.phase);
  setPhase(p.text, p.cls);
  setCalcText(step.calcText || '');

  renderAll(step.inputArray, step.countArray, step.outputArray, {
    inputActive: step.highlightedInputIndex,
    dimInput: step.dimInput,
    countActive: step.highlightedCountIndex,
    countCalc: step.calcIndex,
    countIncrement: step.countIncrementIndex,
    outputPlace: step.highlightedOutputIndex,
  });

  if (window.updateButtons) {
    window.updateButtons();
  }
}