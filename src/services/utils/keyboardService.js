export class KeyboardService {
  constructor() {
    this.shortcuts = new Map();
    this.isEnabled = true;
  }

  register(key, callback, description) {
    this.shortcuts.set(key.toLowerCase(), { callback, description });
  }

  handleKeyPress = (event) => {
    if (!this.isEnabled) return;
    
    // Don't trigger shortcuts when typing in input fields
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

    const key = event.key.toLowerCase();
    const hasCtrl = event.ctrlKey || event.metaKey;

    if (hasCtrl && this.shortcuts.has(key)) {
      event.preventDefault();
      this.shortcuts.get(key).callback();
    }
  }

  enable() {
    this.isEnabled = true;
    document.addEventListener('keydown', this.handleKeyPress);
  }

  disable() {
    this.isEnabled = false;
    document.removeEventListener('keydown', this.handleKeyPress);
  }

  getShortcuts() {
    return Array.from(this.shortcuts.entries()).map(([key, { description }]) => ({
      key,
      description,
    }));
  }
}

export const keyboardService = new KeyboardService(); 