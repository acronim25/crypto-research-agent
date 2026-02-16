// ============================================
// LIB/APIS.JS - External API Wrappers
// ============================================

const axios = require('axios');

// Rate limiting helper
const rateLimiters = {};

function rateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  if (!rateLimiters[key]) {
    rateLimiters[key] = { requests: 1, resetTime: now + windowMs };
    return true;
  }
  
  if (now > rateLimiters[key].resetTime) {
    rateLimiters[key] = { requests: 1, resetTime: now + windowMs };
    return true;
  }
  
  if (rateLimiters[key].requests < maxRequests) {
    rateLimiters[key].requests++;
    return true;
  }
  
  return false;
}

// Retry logic
async function fetchWithRetry(url, options = {}, retries = 3, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios({ url, ...options });
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// ============================================
// CoinGecko API
// ============================================
const CoinGecko = {
  baseURL: 'https://api.coingecko.com/api/v3',
  
  // Search for a token
  async search(query) {
    const data = await fetchWithRetry(
      `${this.baseURL}/search?query=${encodeURIComponent(query)}`
    );
    return data;
  },
  
  // Get coin data
  async getCoin(id) {
    const data = await fetchWithRetry(
      `${this.baseURL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false&sparkline=false`
    );
    return data;
  },
  
  // Get market chart
  async getMarketChart(id, days = 7) {
    const data = await fetchWithRetry(
      `${this.baseURL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
    );
    return data;
  }
};

// ============================================
// CoinMarketCap API
// ============================================
const CoinMarketCap = {
  baseURL: 'https://pro-api.coinmarketcap.com/v1',
  apiKey: process.env.COINMARKETCAP_API_KEY,
  
  async getQuotes(symbol) {
    if (!rateLimit('cmc', 10, 60000)) {
      throw new Error('Rate limit exceeded');
    }
    
    const data = await fetchWithRetry(
      `${this.baseURL}/cryptocurrency/quotes/latest?symbol=${symbol}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': this.apiKey
        }
      }
    );
    return data;
  }
};

// ============================================
// Etherscan API
// ============================================
const Etherscan = {
  baseURL: 'https://api.etherscan.io/api',
  apiKey: process.env.ETHERSCAN_API_KEY,
  
  async verifyContract(address) {
    if (!rateLimit('etherscan', 5, 1000)) {
      throw new Error('Rate limit exceeded');
    }
    
    const data = await fetchWithRetry(
      `${this.baseURL}?module=contract&action=getsourcecode&address=${address}&apikey=${this.apiKey}`
    );
    return data;
  },
  
  async getTokenInfo(address) {
    const data = await fetchWithRetry(
      `${this.baseURL}?module=stats&action=tokensupply&contractaddress=${address}&apikey=${this.apiKey}`
    );
    return data;
  }
};

// ============================================
// DEXTools (Scraping)
// ============================================
const DEXTools = {
  async getTokenData(address) {
    // Placeholder for DEXTools scraping
    // In production, this would scrape dextools.io
    console.log('DEXTools scraping not implemented yet');
    return null;
  }
};

// ============================================
// Twitter API
// ============================================
const Twitter = {
  async getSentiment(query) {
    // Placeholder for Twitter sentiment analysis
    // In production, this would use Twitter API or scraping
    console.log('Twitter sentiment not implemented yet');
    return {
      score: 0,
      label: 'neutral',
      volume: 0
    };
  }
};

// ============================================
// Token Identification
// ============================================
async function identifyToken(input) {
  const trimmed = input.trim();
  
  // Check if it's an Ethereum address
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return {
      type: 'address',
      value: trimmed,
      chain: 'ethereum'
    };
  }
  
  // Check if it's a Solana address
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
    return {
      type: 'address',
      value: trimmed,
      chain: 'solana'
    };
  }
  
  // Try to search on CoinGecko
  try {
    const search = await CoinGecko.search(trimmed);
    if (search.coins && search.coins.length > 0) {
      return {
        type: 'ticker',
        value: search.coins[0].id,
        ticker: search.coins[0].symbol.toUpperCase(),
        name: search.coins[0].name,
        source: 'coingecko'
      };
    }
  } catch (err) {
    console.error('CoinGecko search error:', err);
  }
  
  // Return as name/ticker search
  return {
    type: 'name',
    value: trimmed
  };
}

module.exports = {
  CoinGecko,
  CoinMarketCap,
  Etherscan,
  DEXTools,
  Twitter,
  identifyToken,
  fetchWithRetry
};
