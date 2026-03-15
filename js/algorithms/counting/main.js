// main.js - ИСПРАВЛЕННАЯ ВЕРСИЯ

// Только новая переменная, которой нет в state.js
let isInitialized = false;

// Функция обновления кнопок (должна быть доступна глобально)
window.updateButtons = function() {
    if (window.playback) {
        window.playback.updateButtons();
    }
};

// Инициализация контролов воспроизведения
function initPlaybackControls() {
    if (window.playback) return; // Уже инициализированы
    
    window.playback = new PlaybackControls({
        onPlay: () => playFromCurrent(),
        onPause: () => {},
        onStepForward: () => stepForward(),
        onStepBackward: () => stepBackward(),
        onReset: () => resetPlayback(),
        onSpeedChange: (speed) => {
            console.log('Speed changed to', speed);
        },
        canStepForward: () => currentStepIndex < animationSteps.length - 1,
        canStepBackward: () => currentStepIndex > 0,
        canReset: () => animationSteps.length > 0,
        initialSpeed: 500,
        speedMin: 50,
        speedMax: 1000,
        speedStep: 10
    });

    // Монтируем контролы
    const playbackSection = document.getElementById('playback-section');
    if (playbackSection) {
        window.playback.mount(playbackSection);
        console.log('Playback controls mounted');
    } else {
        console.error('Playback section not found!');
    }
}

// Функция генерации массива
function generateArray() {
    console.log('Generating array...');
    
    const length = 15;
    const max = randomInt(8, 12);
    input = Array.from({ length }, () => randomInt(0, max));
    maxValue = Math.max(...input);
    count = Array.from({ length: maxValue + 1 }, () => 0);
    output = Array.from({ length: input.length }, () => null);
    
    console.log('Generated input:', input);
    
    // Обновляем плейсхолдер в инпуте
    if (customInput) {
        customInput.placeholder = input.join(' ');
        customInput.value = '';
    }
    
    // Строим шаги анимации
    animationSteps = buildAnimationSteps();
    currentStepIndex = 0;
    
    // Рендерим первый шаг
    if (animationSteps.length > 0) {
        renderStep(animationSteps[0]);
    }
    
    // Обновляем состояние кнопок
    if (window.playback) {
        window.playback.updateButtons();
        window.playback.pause();
    }
    
    setPhase('Ready', '');
    setCalcText('Click Play or Step Forward to start counting');
}

// Парсинг пользовательского ввода
function parseCustomInput() {
    if (!customInput) return null;
    
    const txt = customInput.value.trim();
    if (!txt) return null;
    
    const nums = txt
        .split(/\s+/)
        .map(s => parseInt(s, 10))
        .filter(n => !isNaN(n) && n >= 0);
    
    return nums.length ? nums : null;
}

// Обработчик для кастомного ввода
function handleCustomInput(e) {
    if (e.key === 'Enter') {
        const custom = parseCustomInput();
        if (custom && custom.length > 0) {
            input = custom.slice();
            maxValue = Math.max(...input);
            count = Array.from({ length: maxValue + 1 }, () => 0);
            output = Array.from({ length: input.length }, () => null);
            
            animationSteps = buildAnimationSteps();
            currentStepIndex = 0;
            
            if (animationSteps.length > 0) {
                renderStep(animationSteps[0]);
            }
            
            if (window.playback) {
                window.playback.pause();
                window.playback.updateButtons();
            }
            
            setPhase('Ready', '');
            setCalcText('Custom array loaded. Click Play to start.');
        } else {
            setCalcText('Invalid input. Please enter numbers separated by spaces.');
        }
    }
}

// Функции навигации по шагам
function stepForward() {
    if (animationSteps.length === 0) return;
    if (currentStepIndex < animationSteps.length - 1) {
        currentStepIndex++;
        renderStep(animationSteps[currentStepIndex]);
        if (window.playback) window.playback.updateButtons();
    }
}

function stepBackward() {
    if (animationSteps.length === 0) return;
    if (currentStepIndex > 0) {
        currentStepIndex--;
        renderStep(animationSteps[currentStepIndex]);
        if (window.playback) window.playback.updateButtons();
    }
}

function resetPlayback() {
    if (animationSteps.length === 0) return;
    currentStepIndex = 0;
    renderStep(animationSteps[0]);
    if (window.playback) {
        window.playback.pause();
        window.playback.updateButtons();
    }
}

async function playFromCurrent() {
    if (!window.playback) return;
    if (animationSteps.length === 0) return;
    
    while (window.playback.isPlaying && currentStepIndex < animationSteps.length - 1) {
        await sleep(window.playback.getSpeed());
        
        // Проверяем, не поставили ли на паузу
        if (!window.playback.isPlaying) break;
        
        currentStepIndex++;
        renderStep(animationSteps[currentStepIndex]);
        window.playback.updateButtons();
    }
    
    // Если дошли до конца, останавливаем воспроизведение
    if (currentStepIndex >= animationSteps.length - 1) {
        window.playback.pause();
    }
}

// Инициализация при загрузке страницы
function initialize() {
    if (isInitialized) return;
    
    console.log('Initializing Counting Sort...');
    console.log('Elements found:', {
        inputSvg: !!document.getElementById('inputSvg'),
        countSvg: !!document.getElementById('countSvg'),
        outputSvg: !!document.getElementById('outputSvg'),
        generateBtn: !!document.getElementById('generateBtn'),
        customInput: !!document.getElementById('customArray'),
        playbackSection: !!document.getElementById('playback-section'),
        phaseBadge: !!document.getElementById('phaseBadge'),
        calcLine: !!document.getElementById('calcLine')
    });
    
    // Инициализируем контролы
    initPlaybackControls();
    
    // Навешиваем обработчики
    if (generateBtn) {
        generateBtn.addEventListener('click', generateArray);
        console.log('Generate button handler attached');
    }
    
    if (customInput) {
        customInput.addEventListener('keydown', handleCustomInput);
        console.log('Custom input handler attached');
    }
    
    // Генерируем начальный массив
    generateArray();
    
    isInitialized = true;
    console.log('Initialization complete');
}

// Запускаем инициализацию после полной загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}