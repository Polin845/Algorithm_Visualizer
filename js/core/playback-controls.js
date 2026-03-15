/**
 * Единый компонент управления воспроизведением для всех алгоритмов
 * Использование:
 * const playback = new PlaybackControls({
 *   onPlay: () => { ... },
 *   onPause: () => { ... },
 *   onStepForward: () => { ... },
 *   onStepBackward: () => { ... },
 *   onReset: () => { ... },
 *   onSpeedChange: (speedMs) => { ... },
 *   canStepForward: () => boolean,
 *   canStepBackward: () => boolean,
 *   canReset: () => boolean,
 *   initialSpeed: 500
 * });
 */

class PlaybackControls {
  constructor(options = {}) {
    this.options = {
      onPlay: options.onPlay || (() => {}),
      onPause: options.onPause || (() => {}),
      onStepForward: options.onStepForward || (() => {}),
      onStepBackward: options.onStepBackward || (() => {}),
      onReset: options.onReset || (() => {}),
      onSpeedChange: options.onSpeedChange || (() => {}),
      canStepForward: options.canStepForward || (() => true),
      canStepBackward: options.canStepBackward || (() => true),
      canReset: options.canReset || (() => true),
      initialSpeed: options.initialSpeed || 500,
      speedMin: options.speedMin || 50,
      speedMax: options.speedMax || 1000,
      speedStep: options.speedStep || 10
    };

    this.isPlaying = false;
    this.speed = this.options.initialSpeed;
    
    this.createElements();
    this.attachEvents();
    this.updateButtons();
  }

  createElements() {
    // Создаем контейнер контролов
    this.container = document.createElement('div');
    this.container.className = 'playback-controls';
    
    // Создаем HTML структуру
    this.container.innerHTML = `
      <div class="controls-row controls-row-playback">
        <button class="btn icon-btn step-back" title="Шаг назад" disabled>
          <svg viewBox="0 0 24 24">
            <polygon points="19,4 9,12 19,20"></polygon>
            <rect x="5" y="4" width="3" height="16"></rect>
          </svg>
        </button>
        
        <button class="btn icon-btn play-pause" title="Воспроизвести">
          <svg class="play-icon" viewBox="0 0 24 24">
            <polygon points="6,4 20,12 6,20"></polygon>
          </svg>
          <svg class="pause-icon" viewBox="0 0 24 24" style="display: none;">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </button>
        
        <button class="btn icon-btn step-forward" title="Шаг вперед" disabled>
          <svg viewBox="0 0 24 24">
            <polygon points="5,4 15,12 5,20"></polygon>
            <rect x="16" y="4" width="3" height="16"></rect>
          </svg>
        </button>
        
        <button class="btn icon-btn reset" title="Сбросить" disabled>
          <svg viewBox="0 0 24 24">
            <path d="M12 5V1L7 6l5 5V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"></path>
          </svg>
        </button>
        
        <div class="speed-control">
          <label class="speed-label">
            Скорость:
            <span class="speed-value">${this.speed} мс</span>
          </label>
          <input type="range" class="speed-slider" 
                 min="${this.options.speedMin}" 
                 max="${this.options.speedMax}" 
                 step="${this.options.speedStep}" 
                 value="${this.speed}">
        </div>
      </div>
    `;

    // Сохраняем ссылки на элементы
    this.elements = {
      stepBack: this.container.querySelector('.step-back'),
      playPause: this.container.querySelector('.play-pause'),
      stepForward: this.container.querySelector('.step-forward'),
      reset: this.container.querySelector('.reset'),
      playIcon: this.container.querySelector('.play-icon'),
      pauseIcon: this.container.querySelector('.pause-icon'),
      speedSlider: this.container.querySelector('.speed-slider'),
      speedValue: this.container.querySelector('.speed-value')
    };
  }

  attachEvents() {
    this.elements.stepBack.addEventListener('click', () => {
      this.options.onStepBackward();
      this.updateButtons();
    });

    this.elements.stepForward.addEventListener('click', () => {
      this.options.onStepForward();
      this.updateButtons();
    });

    this.elements.reset.addEventListener('click', () => {
      this.isPlaying = false;
      this.updatePlayPauseIcon();
      this.options.onReset();
      this.updateButtons();
    });

    this.elements.playPause.addEventListener('click', () => {
      this.isPlaying = !this.isPlaying;
      this.updatePlayPauseIcon();
      
      if (this.isPlaying) {
        this.options.onPlay();
      } else {
        this.options.onPause();
      }
      
      this.updateButtons();
    });

    this.elements.speedSlider.addEventListener('input', (e) => {
      this.speed = parseInt(e.target.value);
      this.elements.speedValue.textContent = `${this.speed} мс`;
      this.options.onSpeedChange(this.speed);
    });
  }

  updatePlayPauseIcon() {
    if (this.isPlaying) {
      this.elements.playIcon.style.display = 'none';
      this.elements.pauseIcon.style.display = 'block';
      this.elements.playPause.title = 'Пауза';
    } else {
      this.elements.playIcon.style.display = 'block';
      this.elements.pauseIcon.style.display = 'none';
      this.elements.playPause.title = 'Воспроизвести';
    }
  }

  updateButtons() {
    this.elements.stepBack.disabled = !this.options.canStepBackward();
    this.elements.stepForward.disabled = !this.options.canStepForward();
    this.elements.reset.disabled = !this.options.canReset();
  }

  // Публичные методы
  pause() {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.updatePlayPauseIcon();
      this.options.onPause();
      this.updateButtons();
    }
  }

  reset() {
    this.pause();
    this.options.onReset();
    this.updateButtons();
  }

  getSpeed() {
    return this.speed;
  }

  mount(parentElement) {
    if (typeof parentElement === 'string') {
      parentElement = document.querySelector(parentElement);
    }
    parentElement.appendChild(this.container);
    return this;
  }
}

// Глобальный экспорт
window.PlaybackControls = PlaybackControls;