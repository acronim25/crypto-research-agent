// ============================================
// JS/API-MOCK.JS - Mock API pentru demo (fără backend real)
// ============================================

// Toggle între mock și real
const USE_MOCK = true;

// Mock data pentru BTC
const MOCK_RESEARCH = {
  id: "research_demo_btc",
  token: {
    ticker: "BTC",
    name: "Bitcoin",
    address: null,
    chain: "bitcoin",
    logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    description: "Bitcoin este prima și cea mai cunoscută criptomonedă, creată în 2009 de Satoshi Nakamoto. Funcționează pe o rețea descentralizată fără o autoritate centrală.",
    team: "Satoshi Nakamoto (anonim), dezvoltare open-source",
    use_case: "Store of value, medium of exchange, payment system"
  },
  price_data: {
    current_price: 51234.56,
    ath: 69045.00,
    atl: 67.81,
    ath_percentage: -25.8,
    days_since_ath: 845,
    volume_24h: 28500000000,
    volume_change_24h: 12.5,
    market_cap_rank: 1,
    price_btc: 1.0,
    price_eth: 15.2,
    age_days: 5475
  },
  tokenomics: {
    market_cap: 1005000000000,
    fully_diluted_valuation: 1075000000000,
    total_supply: 21000000,
    circulating_supply: 19600000,
    circulation_percentage: 93.3,
    holders_count: 50000000,
    top_10_holders_percentage: 5.2,
    top_holder_percentage: 0.8
  },
  onchain: {
    liquidity_pool_usd: 0,
    buy_tax_percentage: 0,
    sell_tax_percentage: 0,
    contract_verified: true,
    mint_authority_renounced: true,
    ownership_renounced: true,
    liquidity_locked: false,
    liquidity_locked_until: null,
    honeypot_test: true
  },
  red_flags: [
    { check: "Honeypot Test", passed: true, severity: "critical", description: "Token-ul poate fi vândut (nu este honeypot)" },
    { check: "Contract Verificat", passed: true, severity: "high", description: "Codul este public și verificat" },
    { check: "Mint Authority", passed: true, severity: "critical", description: "Supply-ul este limitat la 21M BTC" },
    { check: "Liquidity Locked", passed: false, severity: "low", description: "N/A pentru BTC (nu e token DEX)" },
    { check: "Echipa Publică", passed: false, severity: "low", description: "Creatorul este anonim (Satoshi)" },
    { check: "Vechime Proiect", passed: true, severity: "medium", description: "Proiect vechi de 15 ani" }
  ],
  analysis: {
    risk_score: 3,
    risk_class: "low",
    sentiment: "bullish",
    sentiment_score: 65,
    social_score: 95
  },
  created_at: new Date().toISOString()
};

// Mock API functions
const MockAPI = {
  async createResearch(input) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      data: {
        id: "research_demo_btc",
        status: "complete",
        timestamp: new Date().toISOString(),
        redirect_url: `/research.html?id=research_demo_btc`
      }
    };
  },
  
  async getResearch(id) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      data: MOCK_RESEARCH
    };
  },
  
  async getHistory() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        researches: [
          {
            id: "research_demo_btc",
            ticker: "BTC",
            name: "Bitcoin",
            risk_score: 3,
            risk_class: "low",
            created_at: new Date().toISOString()
          },
          {
            id: "research_demo_eth",
            ticker: "ETH",
            name: "Ethereum",
            risk_score: 4,
            risk_class: "medium",
            created_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: "research_demo_pepe",
            ticker: "PEPE",
            name: "Pepe",
            risk_score: 7,
            risk_class: "high",
            created_at: new Date(Date.now() - 172800000).toISOString()
          }
        ],
        pagination: {
          total: 3,
          limit: 50,
          offset: 0,
          has_more: false
        }
      }
    };
  },
  
  async shareToDiscord(data) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Mock Discord share:', data);
    alert('Demo: Raportul ar fi fost trimis pe Discord!');
    
    return {
      success: true,
      data: { sent: true }
    };
  }
};

// Override real API with mock if USE_MOCK is true
if (USE_MOCK) {
  window.API = MockAPI;
}
