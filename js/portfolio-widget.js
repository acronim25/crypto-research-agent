// ============================================
// PORTFOLIO-WIDGET.JS - Portfolio Tracker Widget
// ============================================

class PortfolioWidget {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      showChart: true,
      editable: true,
      ...options
    };
    this.portfolio = null;
    
    if (this.container) {
      this.init();
    }
  }

  init() {
    this.loadPortfolio();
    this.render();
    this.addStyles();
  }

  loadPortfolio() {
    // Try to load from localStorage first
    const saved = localStorage.getItem('user_portfolio');
    if (saved) {
      try {
        this.portfolio = JSON.parse(saved);
        return;
      } catch (e) {
        console.warn('Failed to load saved portfolio');
      }
    }
    
    // Use mock data if available
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.portfolio) {
      this.portfolio = MOCK_DATA.portfolio;
    } else {
      // Default empty portfolio
      this.portfolio = {
        totalValue: 0,
        totalChange24h: 0,
        totalChange24hPercent: 0,
        assets: []
      };
    }
  }

  savePortfolio() {
    localStorage.setItem('user_portfolio', JSON.stringify(this.portfolio));
  }

  render() {
    const { totalValue, totalChange24h, totalChange24hPercent, assets } = this.portfolio;
    const isPositive = totalChange24h >= 0;
    const changeColor = isPositive ? '#00ff88' : '#ff4444';
    const changeIcon = isPositive ? '▲' : '▼';

    const html = `
      <div class="portfolio-widget">
        <div class="portfolio-widget__header">
          <div class="portfolio-widget__title-group">
            <h3 class="portfolio-widget__title">
              <i class="fas fa-wallet"></i>
              Portfolio
            </h3>
            <span class="portfolio-widget__subtitle">Track your crypto assets</span>
          </div>
          <button class="portfolio-widget__add-btn" id="addAssetBtn">
            <i class="fas fa-plus"></i> Add
          </button>
        </div>
        
        <div class="portfolio-widget__summary">
          <div class="portfolio-widget__value">
            <div class="portfolio-widget__value-label">Total Value</div>
            <div class="portfolio-widget__value-amount">$${this.formatNumber(totalValue)}</div>
            <div class="portfolio-widget__value-change" style="color: ${changeColor}">
              ${changeIcon} $${Math.abs(totalChange24h).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} 
              (${isPositive ? '+' : ''}${totalChange24hPercent.toFixed(2)}%)
            </div>
          </div>
          
          ${this.options.showChart ? `
            <div class="portfolio-widget__chart">
              <canvas id="portfolioChart"></canvas>
            </div>
          ` : ''}
        </div>
        
        <div class="portfolio-widget__assets">
          <div class="portfolio-widget__assets-header">
            <span>Asset</span>
            <span>Holdings</span>
            <span>Value</span>
            <span>Allocation</span>
          </div>
          
          ${assets.length > 0 ? assets.map(asset => this.renderAsset(asset)).join('') : `
            <div class="portfolio-widget__empty">
              <i class="fas fa-coins"></i>
              <p>No assets yet</p>
              <span>Add your first crypto asset to start tracking</span>
            </div>
          `}
        </div>
        
        ${assets.length > 0 ? `
          <div class="portfolio-widget__footer">
            <div class="portfolio-widget__allocation-legend">
              ${assets.slice(0, 5).map(asset => `
                <div class="portfolio-widget__legend-item">
                  <span class="portfolio-widget__legend-color" style="background: ${this.getAssetColor(asset.ticker)}"></span>
                  <span class="portfolio-widget__legend-label">${asset.ticker}</span>
                  <span class="portfolio-widget__legend-percent">${asset.allocation.toFixed(1)}%</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
      
      ${this.renderAddModal()}
    `;
    
    this.container.innerHTML = html;
    
    // Initialize chart
    if (this.options.showChart && assets.length > 0) {
      this.renderChart();
    }
    
    // Bind events
    this.bindEvents();
  }

  renderAsset(asset) {
    const isPositive = asset.change24h >= 0;
    const changeColor = isPositive ? '#00ff88' : '#ff4444';
    
    return `
      <div class="portfolio-widget__asset" data-ticker="${asset.ticker}">
        <div class="portfolio-widget__asset-info">
          <div class="portfolio-widget__asset-icon" style="background: ${this.getAssetColor(asset.ticker)}">
            ${asset.ticker[0]}
          </div>
          <div class="portfolio-widget__asset-details">
            <span class="portfolio-widget__asset-ticker">${asset.ticker}</span>
            <span class="portfolio-widget__asset-name">${asset.name}</span>
          </div>
        </div>
        
        <div class="portfolio-widget__asset-holdings">
          <span class="portfolio-widget__asset-balance">${this.formatBalance(asset.balance)}</span>
          <span class="portfolio-widget__asset-change" style="color: ${changeColor}">
            ${isPositive ? '+' : ''}${asset.change24h.toFixed(2)}%
          </span>
        </div>
        
        <div class="portfolio-widget__asset-value">
          <span class="portfolio-widget__asset-usd">$${this.formatNumber(asset.value)}</span>
        </div>
        
        <div class="portfolio-widget__asset-allocation">
          <div class="portfolio-widget__allocation-bar">
            <div class="portfolio-widget__allocation-fill" 
                 style="width: ${asset.allocation}%; background: ${this.getAssetColor(asset.ticker)}">
            </div>
          </div>
          <span class="portfolio-widget__allocation-text">${asset.allocation.toFixed(1)}%</span>
        </div>
        
        ${this.options.editable ? `
          <button class="portfolio-widget__asset-remove" data-ticker="${asset.ticker}" title="Remove asset">
            <i class="fas fa-times"></i>
          </button>
        ` : ''}
      </div>
    `;
  }

  renderAddModal() {
    return `
      <div class="portfolio-modal" id="addAssetModal">
        <div class="portfolio-modal__overlay"></div>
        <div class="portfolio-modal__content">
          <div class="portfolio-modal__header">
            <h3>Add Asset</h3>
            <button class="portfolio-modal__close" id="closeModal"><i class="fas fa-times"></i></button>
          </div>
          
          <div class="portfolio-modal__body">
            <div class="portfolio-modal__field">
              <label>Token Ticker</label>
              <input type="text" id="assetTicker" placeholder="e.g., BTC, ETH, SOL" maxlength="10">
            </div>
            
            <div class="portfolio-modal__field">
              <label>Balance</label>
              <input type="number" id="assetBalance" placeholder="0.00" step="any">
            </div>
            
            <div class="portfolio-modal__field">
              <label>Price per token (USD)</label>
              <input type="number" id="assetPrice" placeholder="0.00" step="any">
            </div>
          </div>
          
          <div class="portfolio-modal__footer">
            <button class="portfolio-modal__cancel" id="cancelAdd">Cancel</button>
            <button class="portfolio-modal__confirm" id="confirmAdd">Add Asset</button>
          </div>
        </div>
      </div>
    `;
  }

  renderChart() {
    const ctx = document.getElementById('portfolioChart');
    if (!ctx || typeof Chart === 'undefined') return;
    
    const assets = this.portfolio.assets;
    const data = assets.map(a => a.allocation);
    const labels = assets.map(a => a.ticker);
    const colors = assets.map(a => this.getAssetColor(a.ticker));
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#00f5d4',
            bodyColor: '#fff',
            borderColor: 'rgba(0, 245, 212, 0.3)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context) => {
                const asset = assets[context.dataIndex];
                return `${asset.ticker}: $${this.formatNumber(asset.value)} (${asset.allocation.toFixed(1)}%)`;
              }
            }
          }
        },
        cutout: '70%'
      }
    });
  }

  bindEvents() {
    // Add asset button
    const addBtn = document.getElementById('addAssetBtn');
    const modal = document.getElementById('addAssetModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelAdd');
    const confirmBtn = document.getElementById('confirmAdd');
    
    addBtn?.addEventListener('click', () => {
      modal.classList.add('active');
    });
    
    closeBtn?.addEventListener('click', () => {
      modal.classList.remove('active');
    });
    
    cancelBtn?.addEventListener('click', () => {
      modal.classList.remove('active');
    });
    
    confirmBtn?.addEventListener('click', () => {
      this.addAsset();
    });
    
    // Remove asset buttons
    this.container.querySelectorAll('.portfolio-widget__asset-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ticker = btn.dataset.ticker;
        this.removeAsset(ticker);
      });
    });
    
    // Close modal on overlay click
    modal?.querySelector('.portfolio-modal__overlay')?.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  addAsset() {
    const tickerInput = document.getElementById('assetTicker');
    const balanceInput = document.getElementById('assetBalance');
    const priceInput = document.getElementById('assetPrice');
    
    const ticker = tickerInput.value.trim().toUpperCase();
    const balance = parseFloat(balanceInput.value);
    const price = parseFloat(priceInput.value);
    
    if (!ticker || !balance || !price) {
      alert('Please fill in all fields');
      return;
    }
    
    const value = balance * price;
    
    // Check if asset already exists
    const existingIndex = this.portfolio.assets.findIndex(a => a.ticker === ticker);
    if (existingIndex >= 0) {
      // Update existing
      const existing = this.portfolio.assets[existingIndex];
      const totalValue = existing.value + value;
      const totalBalance = existing.balance + balance;
      existing.balance = totalBalance;
      existing.value = totalValue;
    } else {
      // Add new
      this.portfolio.assets.push({
        ticker,
        name: ticker,
        balance,
        value,
        allocation: 0, // Will be calculated
        change24h: (Math.random() - 0.5) * 20 // Mock change
      });
    }
    
    this.recalculateAllocations();
    this.savePortfolio();
    this.render();
    
    // Close modal
    document.getElementById('addAssetModal').classList.remove('active');
    
    // Clear inputs
    tickerInput.value = '';
    balanceInput.value = '';
    priceInput.value = '';
  }

  removeAsset(ticker) {
    if (!confirm(`Remove ${ticker} from portfolio?`)) return;
    
    this.portfolio.assets = this.portfolio.assets.filter(a => a.ticker !== ticker);
    this.recalculateAllocations();
    this.savePortfolio();
    this.render();
  }

  recalculateAllocations() {
    const totalValue = this.portfolio.assets.reduce((sum, a) => sum + a.value, 0);
    this.portfolio.totalValue = totalValue;
    
    this.portfolio.assets.forEach(asset => {
      asset.allocation = totalValue > 0 ? (asset.value / totalValue) * 100 : 0;
    });
  }

  formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatBalance(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (num >= 1) return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    return num.toFixed(6);
  }

  getAssetColor(ticker) {
    const colors = [
      '#f7931a', // Bitcoin orange
      '#627eea', // Ethereum blue
      '#00ffa3', // Solana green
      '#2775ca', // USDC blue
      '#f0b90b', // BNB yellow
      '#ff6b6b', // Red
      '#4ecdc4', // Teal
      '#45b7d1', // Light blue
      '#96ceb4', // Sage
      '#ffeaa7', // Yellow
      '#dfe6e9', // Gray
      '#fd79a8', // Pink
      '#a29bfe', // Purple
      '#00b894', // Green
      '#e17055'  // Orange
    ];
    
    let hash = 0;
    for (let i = 0; i < ticker.length; i++) {
      hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }

  addStyles() {
    if (document.getElementById('portfolio-widget-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'portfolio-widget-styles';
    styles.textContent = `
      .portfolio-widget {
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 245, 212, 0.15);
        border-radius: 16px;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      
      .portfolio-widget:hover {
        border-color: rgba(0, 245, 212, 0.3);
        box-shadow: 0 10px 40px rgba(0, 245, 212, 0.1);
      }
      
      .portfolio-widget__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: rgba(0, 245, 212, 0.05);
        border-bottom: 1px solid rgba(0, 245, 212, 0.1);
      }
      
      .portfolio-widget__title {
        font-family: 'JetBrains Mono', monospace;
        font-size: 1rem;
        color: var(--neon-cyan, #00f5d4);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .portfolio-widget__subtitle {
        font-size: 0.75rem;
        color: rgba(148, 163, 184, 0.8);
        margin-left: 28px;
      }
      
      .portfolio-widget__add-btn {
        background: linear-gradient(135deg, rgba(0, 245, 212, 0.2), rgba(0, 255, 136, 0.2));
        border: 1px solid var(--neon-cyan, #00f5d4);
        color: var(--neon-cyan, #00f5d4);
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.3s ease;
      }
      
      .portfolio-widget__add-btn:hover {
        background: linear-gradient(135deg, rgba(0, 245, 212, 0.4), rgba(0, 255, 136, 0.4));
        box-shadow: 0 0 20px rgba(0, 245, 212, 0.3);
        transform: translateY(-2px);
      }
      
      .portfolio-widget__summary {
        padding: 20px;
        display: flex;
        gap: 20px;
        align-items: center;
      }
      
      .portfolio-widget__value {
        flex: 1;
      }
      
      .portfolio-widget__value-label {
        font-size: 0.85rem;
        color: rgba(148, 163, 184, 0.8);
        margin-bottom: 4px;
      }
      
      .portfolio-widget__value-amount {
        font-family: 'JetBrains Mono', monospace;
        font-size: 2rem;
        font-weight: 700;
        color: #fff;
        margin-bottom: 4px;
      }
      
      .portfolio-widget__value-change {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9rem;
        font-weight: 500;
      }
      
      .portfolio-widget__chart {
        width: 120px;
        height: 120px;
      }
      
      .portfolio-widget__assets {
        padding: 0 20px;
      }
      
      .portfolio-widget__assets-header {
        display: grid;
        grid-template-columns: 2fr 1.5fr 1.5fr 1.5fr 30px;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid rgba(0, 245, 212, 0.1);
        font-size: 0.75rem;
        color: rgba(148, 163, 184, 0.8);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .portfolio-widget__asset {
        display: grid;
        grid-template-columns: 2fr 1.5fr 1.5fr 1.5fr 30px;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid rgba(0, 245, 212, 0.05);
        align-items: center;
        transition: all 0.2s ease;
      }
      
      .portfolio-widget__asset:hover {
        background: rgba(0, 245, 212, 0.03);
        margin: 0 -20px;
        padding-left: 20px;
        padding-right: 20px;
      }
      
      .portfolio-widget__asset:last-child {
        border-bottom: none;
      }
      
      .portfolio-widget__asset-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .portfolio-widget__asset-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.75rem;
        color: #fff;
      }
      
      .portfolio-widget__asset-details {
        display: flex;
        flex-direction: column;
      }
      
      .portfolio-widget__asset-ticker {
        font-family: 'JetBrains Mono', monospace;
        font-weight: 600;
        color: #fff;
        font-size: 0.9rem;
      }
      
      .portfolio-widget__asset-name {
        font-size: 0.75rem;
        color: rgba(148, 163, 184, 0.8);
      }
      
      .portfolio-widget__asset-holdings {
        display: flex;
        flex-direction: column;
      }
      
      .portfolio-widget__asset-balance {
        font-family: 'JetBrains Mono', monospace;
        color: #fff;
        font-size: 0.9rem;
      }
      
      .portfolio-widget__asset-change {
        font-size: 0.75rem;
      }
      
      .portfolio-widget__asset-value {
        font-family: 'JetBrains Mono', monospace;
        color: #fff;
        font-size: 0.9rem;
      }
      
      .portfolio-widget__asset-allocation {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .portfolio-widget__allocation-bar {
        flex: 1;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
      }
      
      .portfolio-widget__allocation-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.5s ease;
      }
      
      .portfolio-widget__allocation-text {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8rem;
        color: rgba(148, 163, 184, 0.8);
        min-width: 35px;
      }
      
      .portfolio-widget__asset-remove {
        background: transparent;
        border: none;
        color: rgba(255, 68, 68, 0.5);
        cursor: pointer;
        font-size: 0.9rem;
        padding: 4px;
        opacity: 0;
        transition: all 0.2s ease;
      }
      
      .portfolio-widget__asset:hover .portfolio-widget__asset-remove {
        opacity: 1;
      }
      
      .portfolio-widget__asset-remove:hover {
        color: #ff4444;
      }
      
      .portfolio-widget__empty {
        text-align: center;
        padding: 40px 20px;
        color: rgba(148, 163, 184, 0.6);
      }
      
      .portfolio-widget__empty i {
        font-size: 3rem;
        margin-bottom: 16px;
        display: block;
      }
      
      .portfolio-widget__empty p {
        font-size: 1rem;
        margin-bottom: 8px;
        color: #fff;
      }
      
      .portfolio-widget__empty span {
        font-size: 0.85rem;
      }
      
      .portfolio-widget__footer {
        padding: 16px 20px;
        background: rgba(0, 245, 212, 0.02);
        border-top: 1px solid rgba(0, 245, 212, 0.1);
      }
      
      .portfolio-widget__allocation-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        justify-content: center;
      }
      
      .portfolio-widget__legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
      }
      
      .portfolio-widget__legend-color {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
      
      .portfolio-widget__legend-label {
        color: #fff;
        font-weight: 500;
      }
      
      .portfolio-widget__legend-percent {
        color: rgba(148, 163, 184, 0.8);
        font-family: 'JetBrains Mono', monospace;
      }
      
      /* Modal Styles */
      .portfolio-modal {
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
      
      .portfolio-modal.active {
        display: flex;
      }
      
      .portfolio-modal__overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
      }
      
      .portfolio-modal__content {
        position: relative;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(0, 245, 212, 0.3);
        border-radius: 16px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: modalSlideIn 0.3s ease;
      }
      
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .portfolio-modal__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid rgba(0, 245, 212, 0.1);
      }
      
      .portfolio-modal__header h3 {
        margin: 0;
        font-family: 'JetBrains Mono', monospace;
        color: var(--neon-cyan, #00f5d4);
      }
      
      .portfolio-modal__close {
        background: transparent;
        border: none;
        color: rgba(148, 163, 184, 0.8);
        cursor: pointer;
        font-size: 1.2rem;
        padding: 4px;
        transition: color 0.2s ease;
      }
      
      .portfolio-modal__close:hover {
        color: #fff;
      }
      
      .portfolio-modal__body {
        padding: 20px;
      }
      
      .portfolio-modal__field {
        margin-bottom: 16px;
      }
      
      .portfolio-modal__field label {
        display: block;
        font-size: 0.85rem;
        color: rgba(148, 163, 184, 0.9);
        margin-bottom: 6px;
      }
      
      .portfolio-modal__field input {
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
      
      .portfolio-modal__field input:focus {
        outline: none;
        border-color: var(--neon-cyan, #00f5d4);
        box-shadow: 0 0 15px rgba(0, 245, 212, 0.2);
      }
      
      .portfolio-modal__footer {
        display: flex;
        gap: 12px;
        padding: 20px;
        border-top: 1px solid rgba(0, 245, 212, 0.1);
      }
      
      .portfolio-modal__cancel,
      .portfolio-modal__confirm {
        flex: 1;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9rem;
        transition: all 0.3s ease;
      }
      
      .portfolio-modal__cancel {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(148, 163, 184, 0.9);
      }
      
      .portfolio-modal__cancel:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .portfolio-modal__confirm {
        background: linear-gradient(135deg, rgba(0, 245, 212, 0.2), rgba(0, 255, 136, 0.2));
        border: 1px solid var(--neon-cyan, #00f5d4);
        color: var(--neon-cyan, #00f5d4);
      }
      
      .portfolio-modal__confirm:hover {
        background: linear-gradient(135deg, rgba(0, 245, 212, 0.4), rgba(0, 255, 136, 0.4));
        box-shadow: 0 0 20px rgba(0, 245, 212, 0.3);
      }
      
      /* Light theme */
      body.light-theme .portfolio-widget {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(0, 136, 170, 0.15);
      }
      
      body.light-theme .portfolio-widget__header {
        background: rgba(0, 136, 170, 0.05);
        border-bottom: 1px solid rgba(0, 136, 170, 0.1);
      }
      
      body.light-theme .portfolio-widget__value-amount,
      body.light-theme .portfolio-widget__asset-ticker,
      body.light-theme .portfolio-widget__asset-balance,
      body.light-theme .portfolio-widget__asset-value {
        color: #1a202c;
      }
      
      body.light-theme .portfolio-widget__asset:hover {
        background: rgba(0, 136, 170, 0.05);
      }
      
      body.light-theme .portfolio-widget__empty p {
        color: #1a202c;
      }
      
      body.light-theme .portfolio-modal__content {
        background: rgba(255, 255, 255, 0.98);
        border: 1px solid rgba(0, 136, 170, 0.2);
      }
      
      body.light-theme .portfolio-modal__field input {
        background: rgba(240, 244, 248, 0.9);
        border: 1px solid rgba(0, 136, 170, 0.2);
        color: #1a202c;
      }
    `;
    document.head.appendChild(styles);
  }
}

// Make available globally
window.PortfolioWidget = PortfolioWidget;
