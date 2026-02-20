// ============================================
// AUTOCOMPLETE.JS - Search Autocomplete for Tickers
// ============================================

class Autocomplete {
  constructor(inputElement, options = {}) {
    this.input = inputElement;
    this.options = {
      minChars: 1,
      maxResults: 8,
      delay: 150,
      ...options
    };
    this.items = [];
    this.selectedIndex = -1;
    this.dropdown = null;
    this.debounceTimer = null;
    
    this.init();
  }

  init() {
    this.createDropdown();
    this.bindEvents();
    
    // Load token data
    if (typeof MOCK_DATA !== 'undefined') {
      this.items = MOCK_DATA.tokens;
    }
  }

  createDropdown() {
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'autocomplete-dropdown';
    this.dropdown.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 245, 212, 0.3);
      border-top: none;
      border-radius: 0 0 12px 12px;
      max-height: 320px;
      overflow-y: auto;
      z-index: 1000;
      display: none;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 245, 212, 0.1);
    `;
    
    // Insert after input parent
    const parent = this.input.parentElement;
    parent.style.position = 'relative';
    parent.appendChild(this.dropdown);
  }

  bindEvents() {
    // Input event with debounce
    this.input.addEventListener('input', (e) => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.handleInput(e.target.value);
      }, this.options.delay);
    });

    // Keyboard navigation
    this.input.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });

    // Focus event
    this.input.addEventListener('focus', () => {
      if (this.input.value.length >= this.options.minChars) {
        this.handleInput(this.input.value);
      }
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.input.parentElement.contains(e.target)) {
        this.hide();
      }
    });
  }

  handleInput(value) {
    const query = value.trim().toLowerCase();
    
    if (query.length < this.options.minChars) {
      this.hide();
      return;
    }

    const matches = this.filterItems(query);
    this.render(matches);
  }

  filterItems(query) {
    return this.items
      .filter(item => 
        item.symbol.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      )
      .slice(0, this.options.maxResults);
  }

  render(matches) {
    if (matches.length === 0) {
      this.hide();
      return;
    }

    const html = matches.map((item, index) => {
      const categoryStyle = MOCK_DATA.categories[item.category] || {};
      const isPositive = item.change24h >= 0;
      const changeColor = isPositive ? '#00ff88' : '#ff4444';
      const changeIcon = isPositive ? '▲' : '▼';
      
      return `
        <div class="autocomplete-item" data-index="${index}" data-symbol="${item.symbol}">
          <div class="autocomplete-item__main">
            <span class="autocomplete-item__symbol">${item.symbol}</span>
            <span class="autocomplete-item__name">${item.name}</span>
            <span class="autocomplete-item__category" style="color: ${categoryStyle.color || '#fff'}">
              <i class="fas ${categoryStyle.icon || 'fa-circle'}" style="margin-right: 4px;"></i>
              ${item.category}
            </span>
          </div>
          <div class="autocomplete-item__price">
            <span class="autocomplete-item__price-value">$${this.formatPrice(item.price)}</span>
            <span class="autocomplete-item__change" style="color: ${changeColor}">
              ${changeIcon} ${Math.abs(item.change24h).toFixed(2)}%
            </span>
          </div>
        </div>
      `;
    }).join('');

    this.dropdown.innerHTML = html;
    this.dropdown.style.display = 'block';
    this.selectedIndex = -1;

    // Add click handlers
    this.dropdown.querySelectorAll('.autocomplete-item').forEach((el, index) => {
      el.addEventListener('click', () => {
        this.select(matches[index]);
      });
      
      el.addEventListener('mouseenter', () => {
        this.selectedIndex = index;
        this.highlightItem(index);
      });
    });

    // Add styles if not already added
    this.addStyles();
  }

  formatPrice(price) {
    if (price >= 1) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (price >= 0.0001) {
      return price.toFixed(6);
    } else {
      return price.toExponential(4);
    }
  }

  addStyles() {
    if (document.getElementById('autocomplete-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'autocomplete-styles';
    styles.textContent = `
      .autocomplete-item {
        padding: 12px 16px;
        cursor: pointer;
        border-bottom: 1px solid rgba(0, 245, 212, 0.1);
        transition: all 0.2s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .autocomplete-item:last-child {
        border-bottom: none;
      }
      
      .autocomplete-item:hover,
      .autocomplete-item.selected {
        background: rgba(0, 245, 212, 0.1);
      }
      
      .autocomplete-item__main {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
      }
      
      .autocomplete-item__symbol {
        font-family: 'JetBrains Mono', monospace;
        font-weight: 700;
        font-size: 1rem;
        color: var(--neon-cyan, #00f5d4);
        min-width: 50px;
      }
      
      .autocomplete-item__name {
        color: #fff;
        font-size: 0.9rem;
        flex: 1;
      }
      
      .autocomplete-item__category {
        font-size: 0.75rem;
        padding: 3px 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        white-space: nowrap;
      }
      
      .autocomplete-item__price {
        text-align: right;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      
      .autocomplete-item__price-value {
        font-family: 'JetBrains Mono', monospace;
        color: #fff;
        font-weight: 600;
      }
      
      .autocomplete-item__change {
        font-size: 0.8rem;
        font-family: 'JetBrains Mono', monospace;
      }
      
      .autocomplete-dropdown::-webkit-scrollbar {
        width: 6px;
      }
      
      .autocomplete-dropdown::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
      }
      
      .autocomplete-dropdown::-webkit-scrollbar-thumb {
        background: rgba(0, 245, 212, 0.3);
        border-radius: 3px;
      }
      
      .autocomplete-dropdown::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 245, 212, 0.5);
      }
    `;
    document.head.appendChild(styles);
  }

  handleKeydown(e) {
    const items = this.dropdown.querySelectorAll('.autocomplete-item');
    
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
        this.highlightItem(this.selectedIndex);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.highlightItem(this.selectedIndex);
        break;
        
      case 'Enter':
        if (this.selectedIndex >= 0) {
          e.preventDefault();
          const selectedEl = items[this.selectedIndex];
          const symbol = selectedEl.dataset.symbol;
          const item = this.items.find(i => i.symbol === symbol);
          if (item) this.select(item);
        }
        break;
        
      case 'Escape':
        this.hide();
        break;
    }
  }

  highlightItem(index) {
    const items = this.dropdown.querySelectorAll('.autocomplete-item');
    items.forEach((item, i) => {
      item.classList.toggle('selected', i === index);
    });
    
    // Scroll into view
    if (items[index]) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }

  select(item) {
    this.input.value = item.symbol;
    this.hide();
    
    // Trigger change event
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Call onSelect callback if provided
    if (this.options.onSelect) {
      this.options.onSelect(item);
    }
  }

  hide() {
    this.dropdown.style.display = 'none';
    this.selectedIndex = -1;
  }

  destroy() {
    if (this.dropdown) {
      this.dropdown.remove();
    }
    clearTimeout(this.debounceTimer);
  }
}

// Make available globally
window.Autocomplete = Autocomplete;
