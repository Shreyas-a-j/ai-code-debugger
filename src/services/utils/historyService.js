class HistoryService {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
  }

  addToHistory(code) {
    // This is an alias for push, for backward compatibility
    this.push(code);
  }

  push(code) {
    // Remove any forward history when new changes are made
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(code);
    this.currentIndex++;
  }

  undo() {
    if (this.canUndo()) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  redo() {
    if (this.canRedo()) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }

  canUndo() {
    return this.currentIndex > 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
  }

  getCurrentState() {
    return this.history[this.currentIndex] || '';
  }

  getHistory() {
    return {
      history: [...this.history],
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };
  }
}

export const historyService = new HistoryService(); 