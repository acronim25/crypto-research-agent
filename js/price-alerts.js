// ============================================
// PRICE-ALERTS.JS - Price Alerts System
// ============================================

class PriceAlerts {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      maxAlerts: 10,
      ...options
    };
    this.alerts = [];
    
    if (this.container) {
      this.init();
    }
  }

  init() {
    this.loadAlerts();
    this.render();
    this.addStyles();
    this.startSimulation();
  }

  loadAlerts() {
    const saved = localStorage.getItem('price_alerts');
    if (saved) {
      try {
        this.alerts = JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to load alerts');
      }
    }
    
    // Use mock data if available and no saved alerts
    if (this.alerts.length === 0 && typeof MOCK_DATA !== 'undefined' && MOCK_DATA.priceAlerts) {
      this.alerts = MOCK_DATA.priceAlerts;
      this.saveAlerts();
    }
  }

  saveAlerts() {
    localStorage.setItem('price_alerts', JSON.stringify(this.alerts));
  }

  addAlert(ticker, condition, price) {
    if (this.alerts.length >= this.options.maxAlerts) {
      alert('Maximum number of alerts reached. Please remove some alerts first.');
      return false;
    }
    
    const alert = {
      id: Date.now(),
      ticker: ticker.toUpperCase(),
      condition,
      price: parseFloat(price),
      active: true,
      created: new Date().toISOString(),
      triggered: null
    };
    
    this.alerts.push(alert);
    this.saveAlerts();
    this.render();
    
    return true;
  }

  removeAlert(id) {
    this.alerts = this.alerts.filter(a => a.id !== id);
    this.saveAlerts();
    this.render();
  }

  toggleAlert(id) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.active = !alert.active;
      this.saveAlerts();
      this.render();
    }
  }

  render() {
    const activeCount = this.alerts.filter(a => a.active).length;
    
    const html = `
      <div class="price-alerts">
        <div class="price-alerts__header">
          <div class="price-alerts__title-group">
            <h3 class="price-alerts__title">
              <i class="fas fa-bell"></i>
              Price Alerts
              <span class="price-alerts__badge">${activeCount}</span>
            </h3>
          </div>
          <button class="price-alerts__add-btn" id="addAlertBtn">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        
        <div class="price-alerts__list">
          ${this.alerts.length > 0 ? this.alerts.map(alert => this.renderAlert(alert)).join('') : `
            <div class="price-alerts__empty">
              <i class="fas fa-bell-slash"></i>
              <p>No price alerts</p>
              <span>Set alerts to get notified when prices hit your targets</span>
            </div>
          `}
        </div>
        
        <div class="price-alerts__info">
          <i class="fas fa-info-circle"></i>
          Alerts are checked every minute (simulated)
        </div>
      </div>
      
      ${this.renderAddModal()}
      <div class="price-alerts__notifications" id="alertNotifications"></div>
    `;
    
    this.container.innerHTML = html;
    this.bindEvents();
  }

  renderAlert(alert) {
    const conditionText = alert.condition === 'above' ? '≥ Above' : '≤ Below';
    const isTriggered = alert.triggered !== null;
    
    return `
      <div class="price-alerts__item ${alert.active ? '' : 'price-alerts__item--inactive'} ${isTriggered ? 'price-alerts__item--triggered' : ''}" data-id="${alert.id}">
        <div class="price-alerts__item-main">
          <div class="price-alerts__item-ticker">${alert.ticker}</div>
          <div class="price-alerts__item-condition">
            <span class="price-alerts__item-operator">${conditionText}</span>
            <span class="price-alerts__item-price">$${alert.price.toLocaleString()}</span>
          </div>
        </div>
        
        <div class="price-alerts__item-actions">
          <button class="price-alerts__item-toggle ${alert.active ? 'active' : ''}" title="${alert.active ? 'Disable' : 'Enable'} alert">
            <i class="fas ${alert.active ? 'fa-bell' : 'fa-bell-slash'}"></i>
          </button>
          <button class="price-alerts__item-remove" title="Remove alert">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        
        ${isTriggered ? '<div class="price-alerts__item-triggered-badge">TRIGGERED</div>' : ''}
      </div>
    `;
  }

  renderAddModal() {
    return `
      <div class="price-alerts__modal" id="addAlertModal">
        <div class="price-alerts__modal-overlay"></div>
        <div class="price-alerts__modal-content">
          <div class="price-alerts__modal-header">
            <h3>Add Price Alert</h3>
            <button class="price-alerts__modal-close" id="closeAlertModal"><i class="fas fa-times"></i></button>
          </div>
          
          <div class="price-alerts__modal-body">
            <div class="price-alerts__modal-field">
              <label>Token Ticker</label>
              <input type="text" id="alertTicker" placeholder="e.g., BTC, ETH" maxlength="10">
            </div>
            
            <div class="price-alerts__modal-field">
              <label>Condition</label>
              <div class="price-alerts__modal-condition">
                <button type="button" class="condition-btn active" data-condition="above">
                  <i class="fas fa-arrow-up"></i> Above
                </button>
                <button type="button" class="condition-btn" data-condition="below">
                  <i class="fas fa-arrow-down"></i> Below
                </button>
              </div>
            </div>
            
            <div class="price-alerts__modal-field">
              <label>Target Price (USD)</label>
              <input type="number" id="alertPrice" placeholder="0.00" step="any">
            </div>
          </div>
          
          <div class="price-alerts__modal-footer">
            <button class="price-alerts__modal-cancel" id="cancelAlert">Cancel</button>
            <button class="price-alerts__modal-confirm" id="confirmAlert">Add Alert</button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Add alert button
    const addBtn = document.getElementById('addAlertBtn');
    const modal = document.getElementById('addAlertModal');
    const closeBtn = document.getElementById('closeAlertModal');
    const cancelBtn = document.getElementById('cancelAlert');
    const confirmBtn = document.getElementById('confirmAlert');
    const conditionBtns = modal?.querySelectorAll('.condition-btn');
    
    addBtn?.addEventListener('click', () => {
      modal.classList.add('active');
    });
    
    closeBtn?.addEventListener('click', () => {
      modal.classList.remove('active');
    });
    
    cancelBtn?.addEventListener('click', () => {
      modal.classList.remove('active');
    });
    
    // Condition toggle
    let selectedCondition = 'above';
    conditionBtns?.forEach(btn => {
      btn.addEventListener('click', () => {
        conditionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCondition = btn.dataset.condition;
      });
    });
    
    confirmBtn?.addEventListener('click', () => {
      const ticker = document.getElementById('alertTicker').value.trim();
      const price = document.getElementById('alertPrice').value;
      
      if (!ticker || !price) {
        alert('Please fill in all fields');
        return;
      }
      
      if (this.addAlert(ticker, selectedCondition, price)) {
        modal.classList.remove('active');
        document.getElementById('alertTicker').value = '';
        document.getElementById('alertPrice').value = '';
      }
    });
    
    // Alert item actions
    this.container.querySelectorAll('.price-alerts__item').forEach(item => {
      const id = parseInt(item.dataset.id);
      
      const toggleBtn = item.querySelector('.price-alerts__item-toggle');
      const removeBtn = item.querySelector('.price-alerts__item-remove');
      
      toggleBtn?.addEventListener('click', () => {
        this.toggleAlert(id);
      });
      
      removeBtn?.addEventListener('click', () => {
        this.removeAlert(id);
      });
    });
    
    // Close modal on overlay click
    modal?.querySelector('.price-alerts__modal-overlay')?.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  startSimulation() {
    // Simulate price checking every 30 seconds
    setInterval(() => {
      this.checkAlerts();
    }, 30000);
  }

  checkAlerts() {
    if (typeof MOCK_DATA === 'undefined' || !MOCK_DATA.tokens) return;
    
    this.alerts.forEach(alert => {
      if (!alert.active || alert.triggered) return;
      
      // Find token in mock data
      const token = MOCK_DATA.tokens.find(t => t.symbol === alert.ticker);
      if (!token) return;
      
      const currentPrice = token.price;
      let triggered = false;
      
      if (alert.condition === 'above' && currentPrice >= alert.price) {
        triggered = true;
      } else if (alert.condition === 'below' && currentPrice <= alert.price) {
        triggered = true;
      }
      
      if (triggered) {
        alert.triggered = new Date().toISOString();
        this.saveAlerts();
        this.showNotification(alert, currentPrice);
        this.render();
      }
    });
  }

  showNotification(alert, currentPrice) {
    const container = document.getElementById('alertNotifications');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = 'price-alerts__notification';
    notification.innerHTML = `
      <div class="price-alerts__notification-icon">
        <i class="fas fa-bell"></i>
      </div>
      <div class="price-alerts__notification-content">
        <div class="price-alerts__notification-title">Price Alert Triggered!</div>
        <div class="price-alerts__notification-text">
          ${alert.ticker} is now $${currentPrice.toLocaleString()} 
          (${alert.condition} your target of $${alert.price.toLocaleString()})
        </div>
      </div>
      <button class="price-alerts__notification-close"><i class="fas fa-times"></i></button>
    `;
    
    container.appendChild(notification);
    
    // Play sound (optional)
    this.playAlertSound();
    
    // Auto remove after 10 seconds
    setTimeout(() => {
      notification.classList.add('hiding');
      setTimeout(() => notification.remove(), 300);
    }, 10000);
    
    // Close button
    notification.querySelector('.price-alerts__notification-close').addEventListener('click', () => {
      notification.classList.add('hiding');
      setTimeout(() => notification.remove(), 300);
    });
  }

  playAlertSound() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play();
    } catch (e) {
      // Ignore audio errors
    }
  }

  addStyles() {
    if (document.getElementById('price-alerts-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'price-alerts-styles';
    styles.textContent = `
      .price-alerts {
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 245, 212, 0.15);
        border-radius: 16px;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      
      .price-alerts:hover {
        border-color: rgba(0, 245, 212, 0.3);
        box-shadow: 0 10px 40px rgba(0, 245, 212, 0.1);
      }
      
      .price-alerts__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: rgba(0, 245, 212, 0.05);
        border-bottom: 1px solid rgba(0, 245, 212, 0.1);
      }
      
      .price-alerts__title {
        font-family: 'JetBrains Mono', monospace;
        font-size: 1rem;
        color: var(--neon-cyan, #00f5d4);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .price-alerts__badge {
        background: rgba(0, 245, 212, 0.2);
        color: var(--neon-cyan, #00f5d4);
        font-size: 0.75rem;
        padding: 2px 8px;
        border-radius: 12px;
        margin-left: 4px;
      }
      
      .price-alerts__add-btn {
        background: linear-gradient(135deg, rgba(0, 245, 212, 0.2), rgba(0, 255, 136, 0.2));
        border: 1px solid var(--neon-cyan, #00f5d4);
        color: var(--neon-cyan, #00f5d4);
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }
      
      .price-alerts__add-btn:hover {
        background: linear-gradient(135deg, rgba(0, 245, 212, 0.4), rgba(0, 255, 136, 0.4));
        box-shadow: 0 0 20px rgba(0, 245, 212, 0.3);
        transform: scale(1.1);
      }
      
      .price-alerts__list {
        max-height: 300px;
        overflow-y: auto;
      }
      
      .price-alerts__item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 20px;
        border-bottom: 1px solid rgba(0, 245, 212, 0.05);
        transition: all 0.2s ease;
        position: relative;
      }
      
      .price-alerts__item:last-child {
        border-bottom: none;
      }
      
      .price-alerts__item:hover {
        background: rgba(0, 245, 212, 0.03);
      }
      
      .price-alerts__item--inactive {
        opacity: 0.5;
      }
      
      .price-alerts__item--triggered {
        background: rgba(0, 255, 136, 0.1);
      }
      
      .price-alerts__item-ticker {
        font-family: 'JetBrains Mono', monospace;
        font-weight: 700;
        font-size: 1rem;
        color: #fff;
        margin-bottom: 4px;
      }
      
      .price-alerts__item-condition {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85rem;
      }
      
      .price-alerts__item-operator {
        color: rgba(148, 163, 184, 0.8);
      }
      
      .price-alerts__item-price {
        font-family: 'JetBrains Mono', monospace;
        color: var(--neon-cyan, #00f5d4);
        font-weight: 600;
      }
      
      .price-alerts__item-actions {
        display: flex;
        gap: 8px;
      }
      
      .price-alerts__item-toggle,
      .price-alerts__item-remove {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 6px;
        border-radius: 6px;
        transition: all 0.2s ease;
      }
      
      .price-alerts__item-toggle {
        color: rgba(148, 163, 184, 0.8);
      }
      
      .price-alerts__item-toggle.active {
        color: var(--neon-cyan, #00f5d4);
      }
      
      .price-alerts__item-toggle:hover {
        background: rgba(0, 245, 212, 0.1);
      }
      
      .price-alerts__item-remove {
        color: rgba(255, 68, 68, 0.5);
      }
      
      .price-alerts__item-remove:hover {
        color: #ff4444;
        background: rgba(255, 68, 68, 0.1);
      }
      
      .price-alerts__item-triggered-badge {
        position: absolute;
        right: 80px;
        background: rgba(0, 255, 136, 0.2);
        color: #00ff88;
        font-size: 0.65rem;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'JetBrains Mono', monospace;
      }
      
      .price-alerts__empty {
        text-align: center;
        padding: 40px 20px;
        color: rgba(148, 163, 184, 0.6);
      }
      
      .price-alerts__empty i {
        font-size: 2.5rem;
        margin-bottom: 12px;
        display: block;
      }
      
      .price-alerts__empty p {
        font-size: 1rem;
        margin-bottom: 4px;
        color: #fff;
      }
      
      .price-alerts__empty span {
        font-size: 0.8rem;
      }
      
      .price-alerts__info {
        padding: 12px 20px;
        background: rgba(0, 245, 212, 0.02);
        border-top: 1px solid rgba(0, 245, 212, 0.1);
        font-size: 0.75rem;
        color: rgba(148, 163, 184, 0.7);
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      /* Modal */
      .price-alerts__modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: none;
        align-items: center;
        justify-content: center;
      }
      
      .price-alerts__modal.active {
        display: flex;
      }
      
      .price-alerts__modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
      }
      
      .price-alerts__modal-content {
        position: relative;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(0, 245, 212, 0.3);
        border-radius: 16px;
        width: 90%;
        max-width: 360px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: alertModalSlideIn 0.3s ease;
      }
      
      @keyframes alertModalSlideIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .price-alerts__modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid rgba(0, 245, 212, 0.1);
      }
      
      .price-alerts__modal-header h3 {
        margin: 0;
        font-family: 'JetBrains Mono', monospace;
        color: var(--neon-cyan, #00f5d4);
      }
      
      .price-alerts__modal-close {
        background: transparent;
        border: none;
        color: rgba(148, 163, 184, 0.8);
        cursor: pointer;
        font-size: 1.2rem;
        padding: 4px;
        transition: color 0.2s ease;
      }
      
      .price-alerts__modal-close:hover {
        color: #fff;
      }
      
      .price-alerts__modal-body {
        padding: 20px;
      }
      
      .price-alerts__modal-field {
        margin-bottom: 16px;
      }
      
      .price-alerts__modal-field label {
        display: block;
        font-size: 0.85rem;
        color: rgba(148, 163, 184, 0.9);
        margin-bottom: 6px;
      }
      
      .price-alerts__modal-field input {
        width: 100%;
        padding: 12px 16px;
        background: rgba(10, 15, 28, 0.8);
        border: 1px solid rgba(0, 245, 212, 0.2);
        border-radius: 8px;
        color: #fff;
        font-family: 'JetBrains Mono', monospace;
        font-size: 1rem;
        transition: all 0.2s ease;
      }
      
      .price-alerts__modal-field input:focus {
        outline: none;
        border-color: var(--neon-cyan, #00f5d4);
        box-shadow: 0 0 15px rgba(0, 245, 212, 0.2);
      }
      
      .price-alerts__modal-condition {
        display: flex;
        gap: 12px;
      }
      
      .price-alerts__modal-condition button {
        flex: 1;
        padding: 12px;
        background: rgba(10, 15, 28, 0.8);
        border: 1px solid rgba(0, 245, 212, 0.2);
        border-radius: 8px;
        color: rgba(148, 163, 184, 0.9);
        cursor: pointer;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s ease;
      }
      
      .price-alerts__modal-condition button.active,
      .price-alerts__modal-condition button:hover {
        border-color: var(--neon-cyan, #00f5d4);
        color: var(--neon-cyan, #00f5d4);
        background: rgba(0, 245, 212, 0.1);
      }
      
      .price-alerts__modal-footer {
        display: flex;
        gap: 12px;
        padding: 20px;
        border-top: 1px solid rgba(0, 245, 212, 0.1);
      }
      
      .price-alerts__modal-cancel,
      .price-alerts__modal-confirm {
        flex: 1;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9rem;
        transition: all 0.3s ease;
      }
      
      .price-alerts__modal-cancel {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(148, 163, 184, 0.9);
      }
      
      .price-alerts__modal-cancel:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .price-alerts__modal-confirm {
        background: linear-gradient(135deg, rgba(0, 245, 212, 0.2), rgba(0, 255, 136, 0.2));
        border: 1px solid var(--neon-cyan, #00f5d4);
        color: var(--neon-cyan, #00f5d4);
      }
      
      .price-alerts__modal-confirm:hover {
        background: linear-gradient(135deg, rgba(0, 245, 212, 0.4), rgba(0, 255, 136, 0.4));
        box-shadow: 0 0 20px rgba(0, 245, 212, 0.3);
      }
      
      /* Notifications */
      .price-alerts__notifications {
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .price-alerts__notification {
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(0, 255, 136, 0.3);
        border-left: 4px solid #00ff88;
        border-radius: 12px;
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        animation: notificationSlideIn 0.3s ease;
        max-width: 350px;
      }
      
      .price-alerts__notification.hiding {
        animation: notificationSlideOut 0.3s ease forwards;
      }
      
      @keyframes notificationSlideIn {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes notificationSlideOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
      }
      
      .price-alerts__notification-icon {
        width: 40px;
        height: 40px;
        background: rgba(0, 255, 136, 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #00ff88;
        font-size: 1.2rem;
        flex-shrink: 0;
      }
      
      .price-alerts__notification-content {
        flex: 1;
      }
      
      .price-alerts__notification-title {
        font-weight: 600;
        color: #fff;
        margin-bottom: 4px;
      }
      
      .price-alerts__notification-text {
        font-size: 0.85rem;
        color: rgba(148, 163, 184, 0.9);
        line-height: 1.4;
      }
      
      .price-alerts__notification-close {
        background: transparent;
        border: none;
        color: rgba(148, 163, 184, 0.6);
        cursor: pointer;
        padding: 4px;
        transition: color 0.2s ease;
      }
      
      .price-alerts__notification-close:hover {
        color: #fff;
      }
      
      /* Light theme */
      body.light-theme .price-alerts {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(0, 136, 170, 0.15);
      }
      
      body.light-theme .price-alerts__header {
        background: rgba(0, 136, 170, 0.05);
        border-bottom: 1px solid rgba(0, 136, 170, 0.1);
      }
      
      body.light-theme .price-alerts__item-ticker {
        color: #1a202c;
      }
      
      body.light-theme .price-alerts__item:hover {
        background: rgba(0, 136, 170, 0.05);
      }
      
      body.light-theme .price-alerts__empty p {
        color: #1a202c;
      }
      
      body.light-theme .price-alerts__modal-content {
        background: rgba(255, 255, 255, 0.98);
        border: 1px solid rgba(0, 136, 170, 0.2);
      }
      
      body.light-theme .price-alerts__modal-field input {
        background: rgba(240, 244, 248, 0.9);
        border: 1px solid rgba(0, 136, 170, 0.2);
        color: #1a202c;
      }
      
      body.light-theme .price-alerts__modal-condition button {
        background: rgba(240, 244, 248, 0.9);
        border: 1px solid rgba(0, 136, 170, 0.2);
        color: #4a5568;
      }
      
      body.light-theme .price-alerts__notification {
        background: rgba(255, 255, 255, 0.98);
        border: 1px solid rgba(0, 255, 136, 0.3);
      }
    `;
    document.head.appendChild(styles);
  }
}

// Make available globally
window.PriceAlerts = PriceAlerts;
