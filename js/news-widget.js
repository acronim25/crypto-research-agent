// ============================================
// NEWS-WIDGET.JS - News Integration Widget
// ============================================

class NewsWidget {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      maxItems: 5,
      showCategories: true,
      autoRefresh: false,
      refreshInterval: 300000, // 5 minutes
      ...options
    };
    this.news = [];
    
    if (this.container) {
      this.init();
    }
  }

  init() {
    this.loadNews();
    this.render();
    this.addStyles();
    
    if (this.options.autoRefresh) {
      setInterval(() => this.loadNews(), this.options.refreshInterval);
    }
  }

  loadNews() {
    // Use mock data if available
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.news) {
      this.news = MOCK_DATA.news.slice(0, this.options.maxItems);
    } else {
      // Fallback mock news
      this.news = [
        { id: 1, title: 'Bitcoin ETFs See Record Inflows', source: 'CoinDesk', time: '2h ago', sentiment: 'positive', category: 'Bitcoin' },
        { id: 2, title: 'Ethereum L2 Solutions Reach New Milestone', source: 'The Block', time: '4h ago', sentiment: 'positive', category: 'Ethereum' },
        { id: 3, title: 'Solana Upgrade Promises Speed Improvement', source: 'Decrypt', time: '6h ago', sentiment: 'positive', category: 'Solana' },
        { id: 4, title: 'DeFi Protocol Security Audit Complete', source: 'Cointelegraph', time: '8h ago', sentiment: 'neutral', category: 'DeFi' },
        { id: 5, title: 'Meme Coins Lead Weekly Gains', source: 'CryptoSlate', time: '1d ago', sentiment: 'neutral', category: 'Meme' }
      ];
    }
  }

  render() {
    const html = `
      <div class="news-widget">
        <div class="news-widget__header">
          <h3 class="news-widget__title">
            <i class="fas fa-newspaper"></i>
            Latest Crypto News
          </h3>
          <button class="news-widget__refresh" title="Refresh news">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
        <div class="news-widget__list">
          ${this.news.map(item => this.renderNewsItem(item)).join('')}
        </div>
        <div class="news-widget__footer">
          <a href="#" class="news-widget__view-all">View all news <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
    `;
    
    this.container.innerHTML = html;
    
    // Add refresh handler
    const refreshBtn = this.container.querySelector('.news-widget__refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        refreshBtn.classList.add('spinning');
        setTimeout(() => {
          this.loadNews();
          this.render();
        }, 500);
      });
    }
  }

  renderNewsItem(item) {
    const sentimentIcon = {
      positive: '<i class="fas fa-arrow-up"></i>',
      negative: '<i class="fas fa-arrow-down"></i>',
      neutral: '<i class="fas fa-minus"></i>'
    };
    
    const sentimentClass = `news-widget__sentiment--${item.sentiment}`;
    
    return `
      <div class="news-widget__item" data-id="${item.id}">
        <div class="news-widget__item-main">
          <h4 class="news-widget__item-title">${item.title}</h4>
          <div class="news-widget__item-meta">
            <span class="news-widget__item-source">${item.source}</span>
            <span class="news-widget__item-dot">•</span>
            <span class="news-widget__item-time">${item.time}</span>
            ${this.options.showCategories ? `
              <span class="news-widget__item-dot">•</span>
              <span class="news-widget__item-category">${item.category}</span>
            ` : ''}
          </div>
          ${item.summary ? `<p class="news-widget__item-summary">${item.summary}</p>` : ''}
        </div>
        <div class="news-widget__sentiment ${sentimentClass}">
          ${sentimentIcon[item.sentiment]}
        </div>
      </div>
    `;
  }

  addStyles() {
    if (document.getElementById('news-widget-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'news-widget-styles';
    styles.textContent = `
      .news-widget {
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 245, 212, 0.15);
        border-radius: 16px;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      
      .news-widget:hover {
        border-color: rgba(0, 245, 212, 0.3);
        box-shadow: 0 10px 40px rgba(0, 245, 212, 0.1);
      }
      
      .news-widget__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: rgba(0, 245, 212, 0.05);
        border-bottom: 1px solid rgba(0, 245, 212, 0.1);
      }
      
      .news-widget__title {
        font-family: 'JetBrains Mono', monospace;
        font-size: 1rem;
        color: var(--neon-cyan, #00f5d4);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .news-widget__refresh {
        background: transparent;
        border: none;
        color: var(--neon-cyan, #00f5d4);
        cursor: pointer;
        font-size: 0.9rem;
        padding: 8px;
        border-radius: 50%;
        transition: all 0.3s ease;
      }
      
      .news-widget__refresh:hover {
        background: rgba(0, 245, 212, 0.1);
        transform: rotate(180deg);
      }
      
      .news-widget__refresh.spinning i {
        animation: spin 1s linear infinite;
      }
      
      .news-widget__list {
        max-height: 400px;
        overflow-y: auto;
      }
      
      .news-widget__item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 16px 20px;
        border-bottom: 1px solid rgba(0, 245, 212, 0.1);
        transition: all 0.2s ease;
        cursor: pointer;
      }
      
      .news-widget__item:last-child {
        border-bottom: none;
      }
      
      .news-widget__item:hover {
        background: rgba(0, 245, 212, 0.05);
      }
      
      .news-widget__item-main {
        flex: 1;
        padding-right: 12px;
      }
      
      .news-widget__item-title {
        font-size: 0.95rem;
        font-weight: 500;
        color: #fff;
        margin: 0 0 6px 0;
        line-height: 1.4;
        transition: color 0.2s ease;
      }
      
      .news-widget__item:hover .news-widget__item-title {
        color: var(--neon-cyan, #00f5d4);
      }
      
      .news-widget__item-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        color: rgba(148, 163, 184, 0.8);
      }
      
      .news-widget__item-dot {
        opacity: 0.5;
      }
      
      .news-widget__item-source {
        font-weight: 500;
      }
      
      .news-widget__item-category {
        background: rgba(0, 245, 212, 0.1);
        color: var(--neon-cyan, #00f5d4);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
      }
      
      .news-widget__item-summary {
        font-size: 0.85rem;
        color: rgba(148, 163, 184, 0.9);
        margin: 8px 0 0 0;
        line-height: 1.5;
      }
      
      .news-widget__sentiment {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        font-size: 0.8rem;
        flex-shrink: 0;
      }
      
      .news-widget__sentiment--positive {
        background: rgba(0, 255, 136, 0.1);
        color: #00ff88;
      }
      
      .news-widget__sentiment--negative {
        background: rgba(255, 68, 68, 0.1);
        color: #ff4444;
      }
      
      .news-widget__sentiment--neutral {
        background: rgba(148, 163, 184, 0.1);
        color: #94a3b8;
      }
      
      .news-widget__footer {
        padding: 12px 20px;
        background: rgba(0, 245, 212, 0.02);
        border-top: 1px solid rgba(0, 245, 212, 0.1);
        text-align: center;
      }
      
      .news-widget__view-all {
        color: var(--neon-cyan, #00f5d4);
        text-decoration: none;
        font-size: 0.85rem;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
      }
      
      .news-widget__view-all:hover {
        gap: 10px;
        text-shadow: 0 0 10px rgba(0, 245, 212, 0.5);
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      /* Light theme adjustments */
      body.light-theme .news-widget {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(0, 136, 170, 0.15);
      }
      
      body.light-theme .news-widget__header {
        background: rgba(0, 136, 170, 0.05);
        border-bottom: 1px solid rgba(0, 136, 170, 0.1);
      }
      
      body.light-theme .news-widget__item-title {
        color: #1a202c;
      }
      
      body.light-theme .news-widget__item:hover .news-widget__item-title {
        color: var(--neon-cyan);
      }
      
      body.light-theme .news-widget__item {
        border-bottom: 1px solid rgba(0, 136, 170, 0.1);
      }
      
      body.light-theme .news-widget__item:hover {
        background: rgba(0, 136, 170, 0.05);
      }
      
      body.light-theme .news-widget__item-summary {
        color: #4a5568;
      }
      
      body.light-theme .news-widget__footer {
        border-top: 1px solid rgba(0, 136, 170, 0.1);
      }
    `;
    document.head.appendChild(styles);
  }
}

// Make available globally
window.NewsWidget = NewsWidget;
