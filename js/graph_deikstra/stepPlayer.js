class StepPlayer {

  constructor(steps, renderer) {
    this.steps = steps;
    this.renderer = renderer;
    this.index = 0;
  }

  next() {
    if (this.index >= this.steps.length) return;

    const step = this.steps[this.index];
    this.renderer.render(step);

    this.index++;
  }

  prev() {
    if (this.index <= 0) return;

    this.index--;
    const step = this.steps[this.index];
    this.renderer.render(step);
  }
}