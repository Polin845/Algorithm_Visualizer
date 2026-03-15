class MinPQplus {
  constructor() {
    this.heap = [];
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  put(priority, value) {
    this.insert(priority, value);
  }

  insert(priority, value) {
    const node = { priority, value };
    this.heap.push(node);
    this.bubbleUp();
  }

  delMin() {
    if (this.isEmpty()) return null;

    const min = this.heap[0];
    const end = this.heap.pop();

    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.bubbleDown();
    }

    return min.value;
  }

  bubbleUp() { // Восстанавливает свойство кучи после вставки элемента
    let index = this.heap.length - 1;

    while (index > 0) {
      let parent = Math.floor((index - 1) / 2);

      if (this.heap[parent].priority <= this.heap[index].priority) break;

      [this.heap[parent], this.heap[index]] =
        [this.heap[index], this.heap[parent]];

      index = parent;
    }
  }

  bubbleDown() { // Восстанавливает свойство кучи после удаления минимального элемента
    let index = 0;
    const length = this.heap.length;

    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let smallest = index;

      if (left < length &&
          this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }

      if (right < length &&
          this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] =
        [this.heap[smallest], this.heap[index]];

      index = smallest;
    }
  }
  toArray() {
    // возвращаем элементы в виде [{value, priority}, ...]
    return this.heap.map(node => ({ value: node.value, priority: node.priority }));
  }
}