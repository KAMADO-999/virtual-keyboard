class VirtualKeyboard {
    constructor() {
      this.input = document.getElementById('input-area');
      this.keyboard = document.getElementById('keyboard');
      this.wpmDisplay = document.getElementById('wpm');
      this.accuracyDisplay = document.getElementById('accuracy');
      this.errorsDisplay = document.getElementById('errors');
  
      this.cursorPosition = 0;
      this.startTime = null;
      this.errors = 0;
      this.totalKeystrokes = 0;
  
      this.init();
    }
  
    init() {
      this.renderKeyboard();
      this.addEventListeners();
    }
  
    renderKeyboard() {
      const layout = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
        ['Space']
      ];
      this.keyboard.innerHTML = layout.map(row =>
        `<div class="keyboard-row">
          ${row.map(key =>
            `<div class="key ${key === 'Space' ? 'space' : ''}" data-key="${key.toLowerCase()}">${key}</div>`
          ).join('')}
        </div>`
      ).join('');
    }
  
    addEventListeners() {
      // Handle PC keyboard input
      document.addEventListener('keydown', this.handleKeyPress.bind(this));
      document.addEventListener('keyup', this.handleKeyUp.bind(this));
  
      // Handle mobile touch input
      this.keyboard.addEventListener('touchstart', this.handleTouchStart.bind(this));
      this.keyboard.addEventListener('touchend', this.handleTouchEnd.bind(this));
  
      // Update cursor position and WPM on manual input (for mobile typing)
      this.input.addEventListener('click', this.updateCursorPosition.bind(this));
      this.input.addEventListener('keyup', this.updateCursorPosition.bind(this));
      this.input.addEventListener('input', this.handleInput.bind(this));
    }
  
    handleKeyPress(event) {
      if (!this.startTime) {
        this.startTime = Date.now();
      }
      const key = event.key.toLowerCase();
      const keyElement = this.keyboard.querySelector(`[data-key="${key}"]`);
      if (keyElement) {
        keyElement.classList.add('active');
      }
      this.totalKeystrokes++;
    }
  
    handleKeyUp(event) {
      const key = event.key.toLowerCase();
      const keyElement = this.keyboard.querySelector(`[data-key="${key}"]`);
      if (keyElement) {
        keyElement.classList.remove('active');
      }
      this.handleInput();
    }
  
    handleTouchStart(event) {
      const keyElement = event.target.closest('.key');
      if (!keyElement) return;
  
      keyElement.classList.add('active');
      const key = keyElement.dataset.key;
  
      this.insertTextAtCursor(key);
    }
  
    handleTouchEnd(event) {
      const keyElement = event.target.closest('.key');
      if (keyElement) keyElement.classList.remove('active');
    }
  
    updateCursorPosition() {
      this.cursorPosition = this.input.selectionStart;
    }
  
    insertTextAtCursor(key) {
      let currentValue = this.input.value;
  
      if (!this.startTime) {
        this.startTime = Date.now();
      }
  
      this.totalKeystrokes++;
  
      if (key === 'backspace') {
        this.input.value = currentValue.slice(0, this.cursorPosition - 1) + currentValue.slice(this.cursorPosition);
        this.cursorPosition = Math.max(0, this.cursorPosition - 1);
      } else if (key === 'space') {
        this.input.value = currentValue.slice(0, this.cursorPosition) + ' ' + currentValue.slice(this.cursorPosition);
        this.cursorPosition++;
      } else {
        this.input.value = currentValue.slice(0, this.cursorPosition) + key + currentValue.slice(this.cursorPosition);
        this.cursorPosition++;
      }
  
      this.input.setSelectionRange(this.cursorPosition, this.cursorPosition);
      this.input.focus();
  
      this.handleInput();
    }
  
    handleInput() {
      if (!this.startTime) return;
  
      const elapsedTime = (Date.now() - this.startTime) / 60000; // Convert ms to minutes
      if (elapsedTime <= 0) return; // Prevent division by zero
  
      const wordsTyped = this.input.value.trim().split(/\s+/).filter(word => word.length > 0).length; // Count valid words
      const wpm = wordsTyped > 0 ? Math.round(wordsTyped / elapsedTime) : 0;
  
      const accuracy = this.totalKeystrokes > 0
        ? Math.max(0, Math.round(((this.totalKeystrokes - this.errors) / this.totalKeystrokes) * 100))
        : 100;
  
      this.wpmDisplay.textContent = wpm;
      this.accuracyDisplay.textContent = `${accuracy}%`;
      this.errorsDisplay.textContent = this.errors;
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => new VirtualKeyboard());
  