// ============================================
// THEME-TOGGLE.JS - Dark/Light Mode Toggle
// ============================================

class ThemeToggle {
  constructor(options = {}) {
    this.options = {
      storageKey: 'crypto-research-theme',
      defaultTheme: 'dark',
      toggleButtonId: 'themeToggle',
      ...options
    };
    
    this.currentTheme = this.loadTheme();
    this.toggleButton = null;
    
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.createToggleButton();
    this.addStyles();
  }

  loadTheme() {
    const saved = localStorage.getItem(this.options.storageKey);
    if (saved) return saved;
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    
    return this.options.defaultTheme;
  }

  saveTheme(theme) {
    localStorage.setItem(this.options.storageKey, theme);
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    // Add/remove class for CSS targeting
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
    
    // Update toggle button icon
    this.updateToggleIcon();
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('themechange', { 
      detail: { theme } 
    }));
  }

  toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    this.saveTheme(newTheme);
    
    // Add transition animation
    this.animateTransition();
  }

  animateTransition() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${this.currentTheme === 'dark' ? '#0a0f1c' : '#ffffff'};
      opacity: 0;
      pointer-events: none;
      z-index: 9999;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(overlay);
    
    requestAnimationFrame(() => {
      overlay.style.opacity = '0.3';
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
      }, 50);
    });
  }

  createToggleButton() {
    // Try to find existing button
    this.toggleButton = document.getElementById(this.options.toggleButtonId);
    
    if (!this.toggleButton) {
      // Create new button
      this.toggleButton = document.createElement('button');
      this.toggleButton.id = this.options.toggleButtonId;
      this.toggleButton.className = 'theme-toggle';
      this.toggleButton.setAttribute('aria-label', 'Toggle theme');
      
      // Insert into header
      const header = document.querySelector('.header__nav');
      if (header) {
        header.appendChild(this.toggleButton);
      } else {
        document.body.appendChild(this.toggleButton);
      }
    }
    
    this.toggleButton.addEventListener('click', () => this.toggle());
    this.updateToggleIcon();
  }

  updateToggleIcon() {
    if (!this.toggleButton) return;
    
    const isDark = this.currentTheme === 'dark';
    this.toggleButton.innerHTML = isDark 
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
    
    this.toggleButton.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  addStyles() {
    if (document.getElementById('theme-toggle-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'theme-toggle-styles';
    styles.textContent = `
      /* Theme Toggle Button */
      .theme-toggle {
        background: rgba(0, 245, 212, 0.1);
        border: 1px solid rgba(0, 245, 212, 0.3);
        color: var(--neon-cyan, #00f5d4);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        transition: all 0.3s ease;
        margin-left: 1rem;
      }
      
      .theme-toggle:hover {
        background: rgba(0, 245, 212, 0.2);
        box-shadow: 0 0 20px rgba(0, 245, 212, 0.3);
        transform: scale(1.1);
      }
      
      .theme-toggle i {
        transition: transform 0.5s ease;
      }
      
      .theme-toggle:active i {
        transform: rotate(360deg);
      }
      
      /* Light Theme Variables */
      :root[data-theme="light"] {
        --neon-cyan: #0088aa;
        --neon-green: #00aa66;
        --neon-pink: #cc00cc;
        --dark-bg: #f0f4f8;
        --card-bg: rgba(255, 255, 255, 0.9);
        --color-text-primary: #1a202c;
        --color-text-secondary: #4a5568;
        --color-text-muted: #718096;
      }
      
      body.light-theme {
        background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 50%, #dbeafe 100%);
        color: var(--color-text-primary);
      }
      
      body.light-theme::before {
        background-image: 
          linear-gradient(rgba(0, 136, 170, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 136, 170, 0.03) 1px, transparent 1px);
      }
      
      body.light-theme .header {
        background: rgba(255, 255, 255, 0.95);
        border-bottom: 1px solid rgba(0, 136, 170, 0.2);
      }
      
      body.light-theme .header__logo {
        color: var(--neon-cyan) !important;
      }
      
      body.light-theme .header__nav-link {
        color: #4a5568 !important;
      }
      
      body.light-theme .hero {
        background: linear-gradient(rgba(240, 244, 248, 0.9), rgba(226, 232, 240, 0.95)), url('bg.png');
        border: 1px solid rgba(0, 136, 170, 0.2);
      }
      
      body.light-theme .hero__title {
        color: #1a202c;
        text-shadow: 0 0 10px rgba(0, 136, 170, 0.3);
      }
      
      body.light-theme .hero__subtitle {
        color: #4a5568;
      }
      
      body.light-theme .search-section {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(0, 136, 170, 0.2);
      }
      
      body.light-theme .search-form__input {
        background: rgba(255, 255, 255, 0.9);
        border: 2px solid rgba(0, 136, 170, 0.2);
        color: var(--neon-cyan);
      }
      
      body.light-theme .feature-card {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(0, 136, 170, 0.15);
      }
      
      body.light-theme .feature-card:hover {
        border-color: var(--neon-cyan);
      }
      
      body.light-theme .data-section {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(0, 136, 170, 0.15);
      }
      
      body.light-theme .stat-item {
        background: rgba(0, 136, 170, 0.05);
        border: 1px solid rgba(0, 136, 170, 0.1);
      }
      
      body.light-theme .history-item {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(0, 136, 170, 0.15);
      }
      
      body.light-theme .history-filters {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(0, 136, 170, 0.15);
      }
      
      body.light-theme .footer {
        background: rgba(255, 255, 255, 0.95);
        border-top: 1px solid rgba(0, 136, 170, 0.2);
      }
      
      body.light-theme .footer__text {
        color: var(--neon-cyan);
      }
      
      body.light-theme .theme-toggle {
        background: rgba(0, 136, 170, 0.1);
        border: 1px solid rgba(0, 136, 170, 0.3);
        color: var(--neon-cyan);
      }
      
      body.light-theme::-webkit-scrollbar-track {
        background: #f0f4f8;
      }
      
      body.light-theme .autocomplete-dropdown {
        background: rgba(255, 255, 255, 0.98);
        border: 1px solid rgba(0, 136, 170, 0.3);
      }
      
      body.light-theme .autocomplete-item {
        border-bottom: 1px solid rgba(0, 136, 170, 0.1);
      }
      
      body.light-theme .autocomplete-item:hover,
      body.light-theme .autocomplete-item.selected {
        background: rgba(0, 136, 170, 0.1);
      }
      
      body.light-theme .autocomplete-item__name {
        color: #1a202c;
      }
      
      body.light-theme .autocomplete-item__price-value {
        color: #1a202c;
      }
      
      /* Scrollbar for light theme */
      body.light-theme ::-webkit-scrollbar-track {
        background: #e2e8f0;
      }
      
      body.light-theme ::-webkit-scrollbar-thumb {
        background: linear-gradient(var(--neon-cyan), var(--neon-green));
      }
    `;
    document.head.appendChild(styles);
  }

  getCurrentTheme() {
    return this.currentTheme;
  }
}

// Make available globally
window.ThemeToggle = ThemeToggle;

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (!window.themeToggleInstance) {
    window.themeToggleInstance = new ThemeToggle();
  }
});
