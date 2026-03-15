// Состояние алгоритма Дейкстры
let graph = null;
let steps = [];
let currentStepIndex = 0;
let distances = [];
let predecessors = [];
let queue = [];

// Эти переменные будут использоваться в других файлах
// НЕ объявляем их заново в main.js!