/**
 * Вспомогательные функции для алгоритма Форда-Фалкерсона
 */

// Задержка для анимации
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Случайное число в диапазоне [min, max]
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Ограничение числа в диапазоне
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Форматирование пути для отображения
function formatPath(path) {
    if (!path || path.length === 0) return 'none';
    
    let result = '0';
    let current = 0;
    
    for (let edge of path) {
        if (edge.from === current) {
            result += ` → ${edge.to}`;
            current = edge.to;
        } else {
            result += ` ← ${edge.from}`;
            current = edge.from;
        }
    }
    
    return result;
}

// Получение цвета для ребра в зависимости от типа и состояния
function getEdgeColor(type, isAugmenting = false) {
    if (isAugmenting) return '#fbbf24'; // Желтый для увеличивающего пути
    
    switch(type) {
        case 'capacity': return '#4f7cff'; // Синий
        case 'flow': return '#34d399'; // Зеленый
        case 'forward': return '#60a5fa'; // Голубой
        case 'backward': return '#fb7185'; // Розовый
        default: return '#4b5563'; // Серый
    }
}

// Получение стиля линии в зависимости от типа
function getLineStyle(type, isAugmenting = false) {
    if (isAugmenting) {
        return { width: 4, dasharray: null };
    }
    
    switch(type) {
        case 'capacity':
            return { width: 2, dasharray: null };
        case 'flow':
            return { width: 3, dasharray: null };
        case 'forward':
            return { width: 2.5, dasharray: null };
        case 'backward':
            return { width: 2.5, dasharray: '5,5' };
        default:
            return { width: 2, dasharray: null };
    }
}

// Проверка, является ли узел истоком
function isSource(node) {
    return node === 0;
}

// Проверка, является ли узел стоком (последний узел)
function isSink(node, graph) {
    return node === Math.max(...graph.nodes);
}

// Получение цвета узла в зависимости от типа
function getNodeColor(node, graph, isActive = false) {
    if (isActive) return '#fbbf24'; // Желтый для активного
    if (isSource(node)) return '#059669'; // Зеленый для истока
    if (isSink(node, graph)) return '#b91c1c'; // Красный для стока
    return '#1f2937'; // Темно-серый для обычных узлов
}

// Расчет позиции для текста на ребре
function calculateTextPosition(from, to) {
    return {
        x: (from.x + to.x) / 2,
        y: (from.y + to.y) / 2
    };
}

// Расчет угла для стрелки
function calculateArrowAngle(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
}

// Форматирование числа для отображения (без плавающей точки)
function formatNumber(num) {
    return Math.round(num).toString();
}

// Создание уникального ID для маркера стрелки
function createArrowId(type, index) {
    return `arrow-${type}-${index}`;
}

// Очистка SVG
function clearSvg(svg) {
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }
}

// Проверка, существует ли элемент в DOM
function elementExists(id) {
    return !!document.getElementById(id);
}

// Получение максимального потока из всех шагов (для отладки)
function getMaxFlowFromSteps(steps) {
    if (!steps || steps.length === 0) return 0;
    const lastStep = steps[steps.length - 1];
    return lastStep.graph ? lastStep.graph.getTotalFlow() : 0;
}

// Создание элемента SVG с атрибутами
function createSvgElement(tag, attributes = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    return element;
}

// Логирование отладки (можно включить/выключить)
const DEBUG = true;
function log(...args) {
    if (DEBUG) {
        console.log('[Ford-Fulkerson]', ...args);
    }
}

function error(...args) {
    console.error('[Ford-Fulkerson]', ...args);
}