class StepPlayer {

  constructor(steps, renderer, statePanel) {
    this.steps = steps;
    this.renderer = renderer;
    this.statePanel = statePanel;
    this.index = 0;
  }

  next() {
    if (this.index >= this.steps.length) return;

    const step = this.steps[this.index];
    this.renderer.render(step);
    this.statePanel.render(step);

    this.index++;
  }

  prev() {
    if (this.index <= 0) return;

    this.index--;
    const step = this.steps[this.index];
    this.renderer.render(step);
    this.statePanel.render(step);
  }
}