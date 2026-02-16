// ============================================
// CONFIG.JS - Application Configuration
// ============================================

const CONFIG = {
  // API Base URL
  API_BASE_URL: 'https://crypto-research-api.vercel.app',
  
  // Local development
  // API_BASE_URL: 'http://localhost:3000',
  
  // Endpoints
  ENDPOINTS: {
    RESEARCH: '/api/research',
    GET_RESEARCH: (id) => `/api/research/${id}`,
    HISTORY: '/api/history',
    DISCORD_WEBHOOK: '/api/webhook/discord'
  },
  
  // UI Settings
  UI: {
    DEBOUNCE_DELAY: 300,
    LOADING_MIN_TIME: 2000, // Minimum time to show loading (for UX)
    MAX_RETRIES: 3,
    RETRY_DELAY: 5000
  },
  
  // Risk Score Colors
  RISK_COLORS: {
    LOW: { score: [1, 3], class: 'low', label: 'Risc Scăzut' },
    MEDIUM: { score: [4, 5], class: 'medium', label: 'Risc Moderat' },
    HIGH: { score: [6, 7], class: 'high', label: 'Risc Ridicat' },
    EXTREME: { score: [8, 10], class: 'extreme', label: 'Risc Extrem' }
  },
  
  // Red Flag Severity
  RED_FLAG_SEVERITY: {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
