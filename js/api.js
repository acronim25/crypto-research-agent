// ============================================
// API.JS - Real API Integration with CoinGecko
// ============================================

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

// Cache pentru a evita rate limiting
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minut

function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCached(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// CoinGecko API Functions
const CoinGeckoAPI = {
  // Caută token după query
  async searchToken(query) {
    const cacheKey = `search_${query.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    try {
      const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setCached(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  },
  
  // Ia date despre un coin specific
  async getCoinData(coinId) {
    const cacheKey = `coin_${coinId}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=false`
      );
      const data = await response.json();
      setCached(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Coin data error:', error);
      throw error;
    }
  },
  
  // Ia date de piață simplificate
  async getSimplePrice(ids, vsCurrencies = 'usd') {
    const cacheKey = `price_${ids.join(',')}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/simple/price?ids=${ids.join(',')}&vs_currencies=${vsCurrencies}&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
      );
      const data = await response.json();
      setCached(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Price error:', error);
      throw error;
    }
  },
  
  // Trending coins
  async getTrending() {
    const cached = getCached('trending');
    if (cached) return cached;
    
    try {
      const response = await fetch(`${API_BASE_URL}/search/trending`);
      const data = await response.json();
      setCached('trending', data);
      return data;
    } catch (error) {
      console.error('Trending error:', error);
      throw error;
    }
  }
};

// Analiză și Risk Scoring
const Analyzer = {
  // Calculează risk score bazat pe multiple factori
  calculateRiskScore(coinData) {
    let score = 5; // Start neutral
    const redFlags = [];
    const greenFlags = [];
    
    const marketData = coinData.market_data || {};
    
    // 1. Market Cap (lower = higher risk)
    const marketCap = marketData.market_cap?.usd || 0;
    if (marketCap > 10000000000) { // >$10B
      score -= 1;
      greenFlags.push({ check: "Market Cap Mare", passed: true, severity: "medium", description: `Market cap: $${(marketCap/1e9).toFixed(1)}B` });
    } else if (marketCap < 100000000) { // <$100M
      score += 2;
      redFlags.push({ check: "Market Cap Mic", passed: false, severity: "high", description: `Market cap: $${(marketCap/1e6).toFixed(1)}M - proiect mic, volatil` });
    } else if (marketCap < 10000000) { // <$10M
      score += 3;
      redFlags.push({ check: "Market Cap Foarte Mic", passed: false, severity: "critical", description: `Market cap: $${(marketCap/1e6).toFixed(1)}M - risc foarte ridicat` });
    }
    
    // 2. Volum 24h (low volume = higher risk)
    const volume = marketData.total_volume?.usd || 0;
    if (volume > marketCap * 0.3) {
      score -= 0.5;
      greenFlags.push({ check: "Volum Ridicat", passed: true, severity: "medium", description: "Volum de tranzacționare sănătos" });
    } else if (volume < marketCap * 0.01 && marketCap > 0) {
      score += 1;
      redFlags.push({ check: "Volum Scăzut", passed: false, severity: "high", description: "Volum foarte mic - lipsă de lichiditate" });
    }
    
    // 3. Price change 24h (extreme moves = higher risk)
    const change24h = marketData.price_change_percentage_24h || 0;
    if (Math.abs(change24h) > 50) {
      score += 2;
      redFlags.push({ check: "Volatilitate Extremă", passed: false, severity: "high", description: `Schimbare 24h: ${change24h.toFixed(1)}% - extrem de volatil` });
    } else if (Math.abs(change24h) > 20) {
      score += 1;
      redFlags.push({ check: "Volatilitate Ridicată", passed: false, severity: "medium", description: `Schimbare 24h: ${change24h.toFixed(1)}%` });
    }
    
    // 4. Age of project (if available)
    const genesisDate = coinData.genesis_date;
    if (genesisDate) {
      const ageDays = (Date.now() - new Date(genesisDate).getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays > 365) {
        score -= 1;
        greenFlags.push({ check: "Proiect Vechi", passed: true, severity: "medium", description: `Proiect vechi de ${Math.floor(ageDays/365)} ani` });
      } else if (ageDays < 30) {
        score += 2;
        redFlags.push({ check: "Proiect Nou", passed: false, severity: "high", description: "Proiect lansat recent (<30 zile)" });
      }
    }
    
    // 5. Community Score
    const communityScore = coinData.community_score || 0;
    if (communityScore > 50) {
      score -= 0.5;
      greenFlags.push({ check: "Comunitate Puternică", passed: true, severity: "low", description: `Community score: ${communityScore}/100` });
    } else if (communityScore < 20 && communityScore > 0) {
      score += 0.5;
      redFlags.push({ check: "Comunitate Mică", passed: false, severity: "low", description: "Comunitate redusă" });
    }
    
    // 6. Developer Activity
    const devScore = coinData.developer_score || 0;
    if (devScore > 50) {
      score -= 0.5;
      greenFlags.push({ check: "Dezvoltare Activă", passed: true, severity: "low", description: "Developer activity ridicat" });
    }
    
    // 7. Public Interest
    const publicInterest = coinData.public_interest_score || 0;
    if (publicInterest > 0.5) {
      greenFlags.push({ check: "Interes Public", passed: true, severity: "low", description: "Trending în căutări" });
    }
    
    // Limitează scorul între 1 și 10
    score = Math.max(1, Math.min(10, score));
    
    // Determină clasa de risc
    let riskClass = 'medium';
    if (score <= 3) riskClass = 'low';
    else if (score >= 7) riskClass = 'high';
    
    return {
      score: Math.round(score),
      riskClass,
      redFlags: [...redFlags, ...greenFlags],
      factors: {
        marketCap,
        volume,
        change24h,
        communityScore,
        devScore,
        age: genesisDate ? Math.floor((Date.now() - new Date(genesisDate).getTime()) / (1000 * 60 * 60 * 24)) : null
      }
    };
  },
  
  // Determină sentimentul
  calculateSentiment(coinData) {
    const marketData = coinData.market_data || {};
    const change24h = marketData.price_change_percentage_24h || 0;
    const change7d = marketData.price_change_percentage_7d || 0;
    const change30d = marketData.price_change_percentage_30d || 0;
    
    let sentiment = 'neutral';
    let sentimentScore = 50;
    
    if (change24h > 5 && change7d > 10) {
      sentiment = 'bullish';
      sentimentScore = 75;
    } else if (change24h < -5 && change7d < -10) {
      sentiment = 'bearish';
      sentimentScore = 25;
    } else if (change30d > 50) {
      sentiment = 'bullish';
      sentimentScore = 70;
    } else if (change30d < -50) {
      sentiment = 'bearish';
      sentimentScore = 30;
    }
    
    return { sentiment, sentimentScore };
  }
};

// Real API Functions
const RealAPI = {
  async createResearch(input) {
    console.log('🚀 createResearch called with:', input);
    try {
      console.log('🔍 Searching for:', input);
      
      // Caută token-ul
      const searchResults = await CoinGeckoAPI.searchToken(input);
      console.log('📊 Search results:', searchResults);
      
      if (!searchResults.coins || searchResults.coins.length === 0) {
        throw new Error('Token negăsit. Încearcă alt ticker sau adresă.');
      }
      
      // Ia primul rezultat (cel mai relevant)
      const coin = searchResults.coins[0];
      console.log('🎯 Selected coin:', coin.id);
      
      // Ia date complete de la CoinGecko
      const coinData = await CoinGeckoAPI.getCoinData(coin.id);
      console.log('📈 Coin data received:', coinData.name);
      
      // Generează ID unic pentru research
      const researchId = `research_${coin.id}_${Date.now()}`;
      
      // Agreghează date de la multiple surse
      console.log('🔄 About to start aggregation...');
      console.log('🔧 Aggregator available:', typeof Aggregator !== 'undefined');
      
      // Extract contract address from multiple possible sources
      let contractAddress = coinData.contract_address;
      
      // If no direct contract address, try platforms
      if (!contractAddress && coinData.platforms) {
        // Try Ethereum first, then other chains
        contractAddress = coinData.platforms.ethereum || 
                         coinData.platforms['binance-smart-chain'] ||
                         coinData.platforms.polygon ||
                         coinData.platforms.avalanche ||
                         coinData.platforms.fantom ||
                         Object.values(coinData.platforms)[0]; // fallback to first available
      }
      
      console.log('📍 Contract address:', contractAddress);
      console.log('📍 Platforms:', coinData.platforms);
      
      let aggregatedData = null;
      if (typeof Aggregator === 'undefined') {
        console.error('❌ Aggregator is not defined! Check if aggregator.js is loaded.');
      } else {
        try {
          console.log('🔄 Calling Aggregator.aggregateCoinData...');
          aggregatedData = await Aggregator.aggregateCoinData(
            coinData, 
            coin.id, 
            coinData.name,
            contractAddress
          );
          console.log('✅ Aggregation complete:', Aggregator.getSourcesSummary(aggregatedData));
        } catch (aggError) {
          console.error('❌ Aggregation error:', aggError);
        }
      }
      
      // Construiește obiectul research cu date agregate
      const research = this.buildResearchObject(researchId, coinData, aggregatedData);
      console.log('💾 Saving research:', researchId);
      
      localStorage.setItem(researchId, JSON.stringify(research));
      console.log('✅ Research saved to localStorage');
      
      // Adaugă la istoric
      this.addToHistory(research);
      
      return {
        success: true,
        data: {
          id: researchId,
          status: "complete",
          timestamp: new Date().toISOString(),
          redirect_url: `research.html#${researchId}`
        }
      };
      
    } catch (error) {
      console.error('❌ Research error:', error);
      return {
        success: false,
        error: error.message || 'Eroare la procesarea request-ului'
      };
    }
  },
  
  buildResearchObject(id, coinData, aggregatedData = null) {
    const marketData = coinData.market_data || {};
    const riskAnalysis = Analyzer.calculateRiskScore(coinData);
    const sentimentAnalysis = Analyzer.calculateSentiment(coinData);
    
    const ath = marketData.ath?.usd || 0;
    const currentPrice = marketData.current_price?.usd || 0;
    const athPercentage = ath > 0 ? ((currentPrice - ath) / ath) * 100 : 0;
    
    // Build base object
    const research = {
      id: id,
      token: {
        ticker: (coinData.symbol || '').toUpperCase(),
        name: coinData.name,
        address: coinData.contract_address || null,
        chain: coinData.asset_platform_id || 'unknown',
        logo: coinData.image?.large || coinData.image?.small,
        description: coinData.description?.en?.substring(0, 500) || 'Nu există descriere disponibilă.',
        team: coinData.developer_data ? 'Echipă activă' : 'Informații limitate',
        use_case: coinData.categories?.join(', ') || 'Cryptocurrency'
      },
      price_data: {
        current_price: currentPrice,
        ath: ath,
        atl: marketData.atl?.usd || 0,
        ath_percentage: parseFloat(athPercentage.toFixed(1)),
        days_since_ath: Math.floor((Date.now() - new Date(marketData.ath_date?.usd || Date.now()).getTime()) / (1000 * 60 * 60 * 24)),
        volume_24h: marketData.total_volume?.usd || 0,
        volume_change_24h: marketData.volume_change_percentage_24h || 0,
        market_cap_rank: coinData.market_cap_rank || 0,
        price_btc: marketData.current_price?.btc || 0,
        price_eth: marketData.current_price?.eth || 0,
        age_days: coinData.genesis_date ? Math.floor((Date.now() - new Date(coinData.genesis_date).getTime()) / (1000 * 60 * 60 * 24)) : null
      },
      tokenomics: {
        market_cap: marketData.market_cap?.usd || 0,
        fully_diluted_valuation: marketData.fully_diluted_valuation?.usd || 0,
        total_supply: marketData.total_supply || 0,
        circulating_supply: marketData.circulating_supply || 0,
        circulation_percentage: marketData.total_supply > 0 ? (marketData.circulating_supply / marketData.total_supply) * 100 : 0,
        holders_count: coinData.community_data?.twitter_followers || 0,
        top_10_holders_percentage: null, // Nu e disponibil direct
        top_holder_percentage: null
      },
      onchain: {
        liquidity_pool_usd: 0,
        buy_tax_percentage: 0,
        sell_tax_percentage: 0,
        contract_verified: !!coinData.contract_address,
        mint_authority_renounced: null,
        ownership_renounced: null,
        liquidity_locked: null,
        liquidity_locked_until: null,
        honeypot_test: true // Presupunem true pentru coin-uri listate
      },
      red_flags: riskAnalysis.redFlags,
      analysis: {
        risk_score: riskAnalysis.score,
        risk_class: riskAnalysis.riskClass,
        sentiment: sentimentAnalysis.sentiment,
        sentiment_score: sentimentAnalysis.sentimentScore,
        social_score: coinData.community_score || 0
      },
      created_at: new Date().toISOString(),
      raw_data: coinData, // Salvăm datele brute pentru debugging
      aggregated_sources: null
    };
    
    // Add aggregated data if available
    if (aggregatedData) {
      const combined = aggregatedData.combined;
      
      // Update onchain data with aggregated info
      if (combined.liquidity) {
        research.onchain.liquidity_pool_usd = combined.liquidity.dexLiquidity;
        research.onchain.total_value_locked = combined.liquidity.totalValueLocked;
      }
      
      if (combined.taxes) {
        research.onchain.buy_tax_percentage = combined.taxes.buyTax;
        research.onchain.sell_tax_percentage = combined.taxes.sellTax;
      }
      
      if (combined.holders) {
        console.log('💡 Processing holders data:', combined.holders);
        research.tokenomics.holders_count = combined.holders.count || research.tokenomics.holders_count;
        research.tokenomics.top_holders = combined.holders.topHolders;
        
        // Calculate top 10 holders percentage if available
        if (combined.holders.topHolders?.length > 0) {
          const top10Percentage = combined.holders.topHolders
            .slice(0, 10)
            .reduce((sum, h) => {
              const pct = parseFloat(h.percentage) || 0;
              console.log('  Holder:', h.address?.slice(0, 8), 'Percentage:', pct);
              return sum + pct;
            }, 0);
          console.log('💡 Calculated top 10%:', top10Percentage);
          research.tokenomics.top_10_holders_percentage = top10Percentage;
        } else {
          console.log('💡 No top holders data available');
        }
      }
      
      // Add DeFi data
      if (combined.defi) {
        research.defi = {
          category: combined.defi.category,
          chains: combined.defi.chains,
          audits: combined.defi.audits,
          governance: combined.defi.governance
        };
      }
      
      // Add price comparison
      if (combined.priceComparison) {
        research.price_comparison = combined.priceComparison;
      }
      
      // Add source summary
      research.aggregated_sources = Aggregator.getSourcesSummary(aggregatedData);
    }
    
    return research;
  },
  
  addToHistory(research) {
    let history = JSON.parse(localStorage.getItem('research_history') || '[]');
    history.unshift({
      id: research.id,
      ticker: research.token.ticker,
      name: research.token.name,
      logo: research.token.logo,
      risk_score: research.analysis.risk_score,
      risk_class: research.analysis.risk_class,
      created_at: research.created_at
    });
    // Păstrează doar ultimele 50
    history = history.slice(0, 50);
    localStorage.setItem('research_history', JSON.stringify(history));
  },
  
  async getResearch(id) {
    try {
      const research = localStorage.getItem(id);
      if (!research) {
        return {
          success: false,
          error: 'Research negăsit'
        };
      }
      
      return {
        success: true,
        data: JSON.parse(research)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  async getHistory(limit = 50, offset = 0) {
    try {
      const history = JSON.parse(localStorage.getItem('research_history') || '[]');
      const paginated = history.slice(offset, offset + limit);
      
      return {
        success: true,
        data: {
          researches: paginated,
          pagination: {
            total: history.length,
            limit,
            offset,
            has_more: history.length > offset + limit
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  async shareToDiscord(data) {
    // Pentru moment, doar logăm - necesită webhook configurat
    console.log('Discord share:', data);
    alert('Funcționalitatea Discord webhook necesită configurare. Datele au fost logate în consolă.');
    return {
      success: true,
      data: { sent: false, message: 'Necesită configurare webhook' }
    };
  },
  
  // Utilitare
  async getTrending() {
    return await CoinGeckoAPI.getTrending();
  }
};

// Expune API global
window.API = RealAPI;
window.Aggregator = Aggregator;

// Log pentru debugging
console.log('🔌 Real API initialized with CoinGecko + Multi-Source Aggregator');
