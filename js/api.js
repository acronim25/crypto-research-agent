// ============================================
// API.JS - API Client
// ============================================

const API = {
  // Base URL from config
  baseUrl: CONFIG.API_BASE_URL,
  
  // Generic fetch wrapper with error handling
  async fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    };
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: { message: 'Eroare de server' }
        }));
        throw new Error(error.error?.message || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  // Create new research
  async createResearch(input, type = 'auto') {
    return this.fetch(CONFIG.ENDPOINTS.RESEARCH, {
      method: 'POST',
      body: JSON.stringify({ input, type })
    });
  },
  
  // Get research by ID
  async getResearch(id) {
    return this.fetch(CONFIG.ENDPOINTS.GET_RESEARCH(id));
  },
  
  // Get history
  async getHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `${CONFIG.ENDPOINTS.HISTORY}?${queryString}`
      : CONFIG.ENDPOINTS.HISTORY;
    return this.fetch(endpoint);
  },
  
  // Share to Discord
  async shareToDiscord(data) {
    return this.fetch(CONFIG.ENDPOINTS.DISCORD_WEBHOOK, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// Helper functions
const formatters = {
  // Format price with appropriate decimals
  price(value) {
    if (value === null || value === undefined) return 'N/A';
    if (value >= 1) return `$${value.toLocaleString('ro-RO', { maximumFractionDigits: 2 })}`;
    if (value >= 0.01) return `$${value.toLocaleString('ro-RO', { maximumFractionDigits: 4 })}`;
    return `$${value.toLocaleString('ro-RO', { maximumFractionDigits: 8 })}`;
  },
  
  // Format number with commas
  number(value) {
    if (value === null || value === undefined) return 'N/A';
    return value.toLocaleString('ro-RO');
  },
  
  // Format percentage
  percentage(value) {
    if (value === null || value === undefined) return 'N/A';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  },
  
  // Format market cap
  marketCap(value) {
    if (value === null || value === undefined) return 'N/A';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  },
  
  // Format date
  date(timestamp) {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API, formatters };
}
