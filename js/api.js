// ============================================
// API.JS - Main API Module
// ============================================

// CoinGecko API
const CoinGeckoAPI = {
  baseUrl: 'https://api.coingecko.com/api/v3',

  async searchToken(query) {
    const response = await fetch(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed');
    return await response.json();
  },

  async getCoinData(coinId) {
    const response = await fetch(`${this.baseUrl}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true`);
    if (!response.ok) throw new Error('Failed to fetch coin data');
    return await response.json();
  },
  
  async getMarketChart(coinId, days = 30) {
    const response = await fetch(`${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch market chart');
    return await response.json();
  },

  async getTrending() {
    const response = await fetch(`${this.baseUrl}/search/trending`);
    if (!response.ok) throw new Error('Failed to fetch trending');
    return await response.json();
  }
};

// Analyzer
const Analyzer = {
  calculateRiskScore(coinData) {
    const marketData = coinData.market_data || {};
    let score = 5;
    const redFlags = [];
    const greenFlags = [];

    const marketCap = marketData.market_cap?.usd || 0;
    const volume = marketData.total_volume?.usd || 0;
    const change24h = marketData.price_change_percentage_24h || 0;

    if (marketCap < 1000000) { score += 2; redFlags.push('Market cap foarte mic'); }
    else if (marketCap > 1000000000) { score -= 1; greenFlags.push('Market cap mare'); }

    if (volume < 100000) { score += 1; redFlags.push('Volum scăzut'); }
    else if (volume > 10000000) { score -= 1; greenFlags.push('Volum bun'); }

    if (change24h > 50) { score += 2; redFlags.push('Pump masiv 24h'); }
    else if (change24h < -50) { score += 1; redFlags.push('Drop masiv 24h'); }

    let riskClass = 'medium';
    if (score <= 3) riskClass = 'low';
    else if (score >= 7) riskClass = 'high';

    return { score: Math.round(score), riskClass, redFlags, greenFlags };
  },

  calculateSentiment(coinData) {
    const marketData = coinData.market_data || {};
    const change24h = marketData.price_change_percentage_24h || 0;
    const change7d = marketData.price_change_percentage_7d || 0;

    let sentiment = 'neutral';
    let sentimentScore = 50;

    if (change24h > 5 && change7d > 10) { sentiment = 'bullish'; sentimentScore = 75; }
    else if (change24h < -5 && change7d < -10) { sentiment = 'bearish'; sentimentScore = 25; }

    return { sentiment, sentimentScore };
  }
};

// Real API
const RealAPI = {
  async createResearch(input) {
    try {
      const searchResults = await CoinGeckoAPI.searchToken(input);

      if (!searchResults.coins?.length) {
        throw new Error('Token negăsit. Încearcă alt ticker.');
      }

      const coin = searchResults.coins[0];
      const coinData = await CoinGeckoAPI.getCoinData(coin.id);
      const researchId = `research_${coin.id}_${Date.now()}`;

      // Get contract address
      let contractAddress = coinData.contract_address;
      if (!contractAddress && coinData.platforms) {
        contractAddress = coinData.platforms.ethereum ||
                         coinData.platforms['binance-smart-chain'] ||
                         Object.values(coinData.platforms)[0];
      }

      // Aggregate data
      let aggregatedData = null;
      let priceHistory = null;
      
      if (typeof Aggregator !== 'undefined') {
        try {
          aggregatedData = await Aggregator.aggregateCoinData(coinData, coin.id, coin.name, contractAddress);
        } catch (e) {
          console.warn('Aggregator error:', e);
        }
      }
      
      // Fetch price history from CoinGecko
      try {
        console.log('📊 Fetching price history for', coin.id);
        const marketChart = await CoinGeckoAPI.getMarketChart(coin.id, 30);
        // Limit to ~30 data points (one per day) to avoid storage quota
        if (marketChart.prices && marketChart.prices.length > 30) {
          priceHistory = marketChart.prices.filter((_, i) => i % Math.ceil(marketChart.prices.length / 30) === 0).slice(0, 30);
        } else {
          priceHistory = marketChart.prices;
        }
        console.log('✅ Price history fetched:', priceHistory?.length, 'data points');
      } catch (e) {
        console.warn('Price history fetch error:', e);
      }

      // Build research object
      const research = this.buildResearchObject(researchId, coinData, aggregatedData, priceHistory);

      // Save to localStorage
      localStorage.setItem(researchId, JSON.stringify(research));

      // Add to history
      console.log('📝 About to add to history:', research?.id);
      RealAPI.addToHistory(research);
      console.log('✅ addToHistory called');

      return {
        success: true,
        data: {
          id: researchId,
          status: "complete",
          redirect_url: `research.html#${researchId}`
        }
      };

    } catch (error) {
      console.error('Research error:', error);
      return { success: false, error: error.message };
    }
  },

  buildResearchObject(id, coinData, aggregatedData = null, priceHistory = null) {
    const marketData = coinData.market_data || {};
    const riskAnalysis = Analyzer.calculateRiskScore(coinData);
    const sentimentAnalysis = Analyzer.calculateSentiment(coinData);

    const ath = marketData.ath?.usd || 0;
    const currentPrice = marketData.current_price?.usd || 0;
    const athPercentage = ath > 0 ? ((currentPrice - ath) / ath) * 100 : 0;

    const research = {
      id: id,
      token: {
        name: coinData.name,
        ticker: coinData.symbol?.toUpperCase(),
        logo: coinData.image?.small || coinData.image?.thumb,
        address: coinData.contract_address,
        platforms: coinData.platforms,
        genesis_date: coinData.genesis_date,
        categories: coinData.categories,
        description: coinData.description?.en?.substring(0, 500) + '...'
      },
      price_data: {
        current_price: currentPrice,
        ath: ath,
        atl: marketData.atl?.usd || 0,
        ath_percentage: athPercentage,
        volume_24h: marketData.total_volume?.usd || 0,
        market_cap: marketData.market_cap?.usd || 0,
        market_cap_rank: marketData.market_cap_rank,
        price_change_24h: marketData.price_change_percentage_24h || 0,
        price_change_7d: marketData.price_change_percentage_7d || 0,
        price_change_30d: marketData.price_change_percentage_30d || 0
      },
      price_history: priceHistory,
      tokenomics: {
        total_supply: marketData.total_supply,
        circulating_supply: marketData.circulating_supply,
        max_supply: marketData.max_supply,
        market_cap: marketData.market_cap?.usd || 0,
        fully_diluted_valuation: marketData.fully_diluted_valuation?.usd || 0,
        holders_count: aggregatedData?.combined?.holders?.count || 0,
        top_holders: aggregatedData?.combined?.holders?.topHolders || [],
        top_10_percentage: aggregatedData?.combined?.holders?.topHolders?.slice(0, 10).reduce((sum, h) => sum + (parseFloat(h.percentage) || 0), 0) || 0
      },
      onchain: {
        liquidity_pool_usd: aggregatedData?.combined?.liquidity?.totalValueLocked || 0,
        total_liquidity: aggregatedData?.combined?.liquidity?.totalValueLocked || 0,
        dex_liquidity: aggregatedData?.combined?.liquidity?.dexLiquidity || 0,
        defi_tvl: aggregatedData?.combined?.liquidity?.defiTvl || 0
      },
      analysis: {
        risk_score: riskAnalysis.score,
        risk_class: riskAnalysis.riskClass,
        risk_factors: riskAnalysis.redFlags,
        positive_factors: riskAnalysis.greenFlags,
        sentiment: sentimentAnalysis.sentiment,
        sentiment_score: sentimentAnalysis.sentimentScore,
        summary: `Token ${coinData.name} (${coinData.symbol?.toUpperCase()}) are un risk score de ${riskAnalysis.score}/10.`
      },
      created_at: new Date().toISOString()
    };

    if (aggregatedData) {
      research.aggregated_sources = Aggregator.getSourcesSummary(aggregatedData);
    }

    return research;
  },

  addToHistory(research) {
    console.log('📝 addToHistory called');
    try {
      if (!research?.id) {
        console.error('❌ No research ID');
        return;
      }

      let history = JSON.parse(localStorage.getItem('research_history') || '[]');

      if (history.some(item => item.id === research.id)) {
        console.log('⚠️ Already in history');
        return;
      }

      history.unshift({
        id: research.id,
        ticker: research.token?.ticker || 'N/A',
        name: research.token?.name || 'Unknown',
        logo: research.token?.logo,
        risk_score: research.analysis?.risk_score ?? 5,
        risk_class: research.analysis?.risk_class || 'medium',
        created_at: research.created_at
      });

      history = history.slice(0, 50);
      localStorage.setItem('research_history', JSON.stringify(history));
      console.log('✅ History saved:', history.length, 'items');
    } catch (error) {
      console.error('❌ addToHistory error:', error);
    }
  },

  async getResearch(id) {
    try {
      const research = localStorage.getItem(id);
      if (!research) {
        return { success: false, error: 'Research negăsit' };
      }
      return { success: true, data: JSON.parse(research) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getHistory(limit = 50, offset = 0) {
    console.log('🔍 getHistory called with limit:', limit, 'offset:', offset);
    try {
      const raw = localStorage.getItem('research_history');
      console.log('📦 Raw history length:', raw ? raw.length : 0);
      console.log('📦 Raw history first 200 chars:', raw ? raw.substring(0, 200) : 'empty');
      
      const history = JSON.parse(raw || '[]');
      console.log('📚 Parsed history count:', history.length);
      console.log('📚 History item 0:', history[0]);
      console.log('📚 History item 1:', history[1]);  
      console.log('📚 History item 2:', history[2]);
      
      const result = history.slice(offset, offset + limit);
      console.log('📤 Returning:', result.length, 'items');
      
      return {
        success: true,
        data: {
          researches: result,
          pagination: { total: history.length, limit, offset }
        }
      };
    } catch (error) {
      console.error('❌ getHistory error:', error);
      return { success: false, error: error.message };
    }
  },

  async getTrending() {
    return await CoinGeckoAPI.getTrending();
  }
};

// Expose globally
window.API = RealAPI;
window.CoinGeckoAPI = CoinGeckoAPI;
window.Analyzer = Analyzer;

console.log('🔌 API initialized');
