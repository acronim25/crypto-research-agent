// ============================================
// AGGREGATOR.JS - Multi-Source Data Aggregator
// Combines data from CoinGecko, DefiLlama, DexScreener, and more
// ============================================

const Aggregator = {
  // Cache configuration
  cache: new Map(),
  CACHE_DURATION: 120000, // 2 minutes
  
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  },
  
  setCached(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  },

  // ============================================
  // DEFILLAMA API - DeFi TVL and Protocol Data
  // ============================================
  async fetchDefiLlamaData(coinId, coinName) {
    const cacheKey = `defillama_${coinId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    try {
      // Search for protocol on DefiLlama
      const protocolsResponse = await fetch('https://api.llama.fi/protocols');
      const protocols = await protocolsResponse.json();
      
      // Find matching protocol
      const protocol = protocols.find(p => 
        p.name.toLowerCase().includes(coinName.toLowerCase()) ||
        p.symbol?.toLowerCase() === coinId.toLowerCase()
      );
      
      if (!protocol) {
        return { found: false, tvl: 0, chains: [], category: null };
      }
      
      // Get detailed protocol data
      const protocolData = await fetch(`https://api.llama.fi/protocol/${protocol.slug}`);
      const data = await protocolData.json();
      
      const result = {
        found: true,
        tvl: data.tvl || 0,
        tvlChange24h: data.change_1d || 0,
        tvlChange7d: data.change_7d || 0,
        chains: data.chains || [],
        category: data.category,
        audits: data.audits || [],
        audit_links: data.audit_links || [],
        twitter: data.twitter,
        website: data.url,
        governance: data.governance,
        tokensInCirculation: data.tokensInCirculation,
        tokenSupply: data.tokenSupply,
        mcaps: data.mcaps,
        fdv: data.fdv
      };
      
      this.setCached(cacheKey, result);
      return result;
      
    } catch (error) {
      console.warn('DefiLlama API error:', error);
      return { found: false, error: error.message };
    }
  },

  // ============================================
  // DEXSCREENER API - DEX Trading Data
  // ============================================
  async fetchDexScreenerData(tokenAddress, chain = 'ethereum') {
    if (!tokenAddress) return { found: false };
    
    const cacheKey = `dexscreener_${tokenAddress}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
      const data = await response.json();
      
      if (!data.pairs || data.pairs.length === 0) {
        return { found: false };
      }
      
      // Aggregate data from all pairs
      const pairs = data.pairs;
      const mainPair = pairs[0]; // Most liquid pair
      
      // Calculate total liquidity and volume
      const totalLiquidity = pairs.reduce((sum, p) => sum + (parseFloat(p.liquidity?.usd) || 0), 0);
      const totalVolume24h = pairs.reduce((sum, p) => sum + (parseFloat(p.volume?.h24) || 0), 0);
      
      // Find best buy/sell prices
      const buyTax = mainPair.buyTax || 0;
      const sellTax = mainPair.sellTax || 0;
      
      // Get top holders if available
      const holders = mainPair.holders || [];
      const topHolders = holders.slice(0, 10).map(h => ({
        address: h.address,
        balance: h.balance,
        percentage: h.percentage
      }));
      
      const result = {
        found: true,
        pairs: pairs.length,
        mainPair: {
          dex: mainPair.dexId,
          pairAddress: mainPair.pairAddress,
          baseToken: mainPair.baseToken,
          quoteToken: mainPair.quoteToken,
          priceUsd: parseFloat(mainPair.priceUsd) || 0,
          priceChange24h: parseFloat(mainPair.priceChange?.h24) || 0,
          volume24h: parseFloat(mainPair.volume?.h24) || 0,
          liquidityUsd: parseFloat(mainPair.liquidity?.usd) || 0,
          fdv: parseFloat(mainPair.fdv) || 0,
          marketCap: parseFloat(mainPair.marketCap) || 0
        },
        aggregated: {
          totalLiquidity,
          totalVolume24h,
          buyTax,
          sellTax
        },
        topHolders,
        topHoldersCount: holders.length,
        timestamp: new Date().toISOString()
      };
      
      this.setCached(cacheKey, result);
      return result;
      
    } catch (error) {
      console.warn('DexScreener API error:', error);
      return { found: false, error: error.message };
    }
  },

  // ============================================
  // ETHPLORER API - Token Holders (Free tier)
  // ============================================
  async fetchEthplorerData(contractAddress) {
    if (!contractAddress || !contractAddress.startsWith('0x')) {
      console.log('⚠️ Ethplorer: Invalid contract address:', contractAddress);
      return { found: false };
    }
    
    const cacheKey = `ethplorer_${contractAddress}`;
    const cached = this.getCached(cacheKey);
    if (cached) {
      console.log('📦 Ethplorer: Using cached data');
      return cached;
    }
    
    try {
      console.log('🔍 Ethplorer: Fetching data for:', contractAddress);
      
      // Ethplorer free API - no key required for basic data
      const response = await fetch(`https://api.ethplorer.io/getTokenInfo/${contractAddress}?apiKey=freekey`);
      
      if (!response.ok) {
        console.warn('⚠️ Ethplorer: HTTP error:', response.status);
        return { found: false, status: response.status };
      }
      
      const data = await response.json();
      
      if (!data || data.error) {
        console.warn('⚠️ Ethplorer: API error:', data?.error?.message || 'Unknown error');
        return { found: false, error: data?.error?.message };
      }
      
      console.log('✅ Ethplorer: Data found for', data.name, '- Holders:', data.holdersCount);
      
      // Get top holders
      const topHolders = data.holders?.slice(0, 10).map(h => ({
        address: h.address,
        balance: h.balance,
        percentage: (h.share * 100).toFixed(2)
      })) || [];
      
      const result = {
        found: true,
        contractAddress,
        name: data.name,
        symbol: data.symbol,
        decimals: data.decimals,
        totalSupply: data.totalSupply,
        holdersCount: data.holdersCount,
        topHolders: topHolders,
        topHoldersCount: data.holdersCount,
        price: data.price,
        marketCap: data.marketCapUsd,
        totalSupplyFormatted: data.totalSupply / Math.pow(10, data.decimals || 18),
        transfersCount: data.transfersCount,
        ethTransfersCount: data.ethTransfersCount,
        lastUpdated: data.lastUpdated
      };
      
      this.setCached(cacheKey, result);
      return result;
      
    } catch (error) {
      console.warn('❌ Ethplorer API error:', error);
      return { found: false, error: error.message };
    }
  },

  // ============================================
  // ETHERSCAN API - Contract Verification & Holders
  // ============================================
  async fetchEtherscanData(contractAddress, apiKey = null) {
    if (!contractAddress || !contractAddress.startsWith('0x')) {
      return { found: false };
    }
    
    const cacheKey = `etherscan_${contractAddress}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    try {
      // Note: Without API key, we're limited. This is a placeholder structure.
      // In production, you'd use: https://api.etherscan.io/api?module=contract&action=getabi&address=...
      
      // For now, return basic structure
      const result = {
        found: true,
        contractAddress,
        verified: null, // Would need API key to check
        implementation: null,
        creator: null,
        creationDate: null,
        holders: null,
        transactions: null,
        sourceCode: null,
        abi: null
      };
      
      this.setCached(cacheKey, result);
      return result;
      
    } catch (error) {
      console.warn('Etherscan API error:', error);
      return { found: false, error: error.message };
    }
  },

  // ============================================
  // COINMARKETCAP API - Alternative Price Data
  // ============================================
  async fetchCoinMarketCapData(symbol) {
    const cacheKey = `cmc_${symbol.toLowerCase()}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    try {
      // Note: CoinMarketCap requires API key for most endpoints
      // This is a simplified version that could work with their free tier
      
      const response = await fetch(`https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing?limit=5000`);
      const data = await response.json();
      
      const coin = data.data?.cryptoCurrencyList?.find(c => 
        c.symbol.toLowerCase() === symbol.toLowerCase()
      );
      
      if (!coin) {
        return { found: false };
      }
      
      const result = {
        found: true,
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        slug: coin.slug,
        rank: coin.cmcRank,
        price: coin.quotes?.[0]?.price,
        marketCap: coin.quotes?.[0]?.marketCap,
        volume24h: coin.quotes?.[0]?.volume24h,
        percentChange24h: coin.quotes?.[0]?.percentChange24h,
        circulatingSupply: coin.circulatingSupply,
        totalSupply: coin.totalSupply,
        maxSupply: coin.maxSupply,
        tags: coin.tags,
        platform: coin.platform
      };
      
      this.setCached(cacheKey, result);
      return result;
      
    } catch (error) {
      console.warn('CoinMarketCap API error:', error);
      return { found: false, error: error.message };
    }
  },

  // ============================================
  // MESSARI API - Research Reports (if available)
  // ============================================
  async fetchMessariData(symbol) {
    const cacheKey = `messari_${symbol.toLowerCase()}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    try {
      // Messari has a free API tier
      const response = await fetch(`https://data.messari.io/api/v1/assets/${symbol.toLowerCase()}/metrics`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        return { found: false, status: response.status };
      }
      
      const data = await response.json();
      
      if (!data.data) {
        return { found: false };
      }
      
      const metrics = data.data;
      
      const result = {
        found: true,
        id: metrics.id,
        symbol: metrics.symbol,
        name: metrics.name,
        slug: metrics.slug,
        metrics: {
          marketData: metrics.market_data,
          supply: metrics.supply,
          blockchainStats: metrics.blockchain_stats,
          allTimeHigh: metrics.all_time_high,
          cycleLow: metrics.cycle_low,
          tokenSaleStats: metrics.token_sale_stats,
          stakingStats: metrics.staking_stats,
          miningStats: metrics.mining_stats,
          developerActivity: metrics.developer_activity,
          roiData: metrics.roi_data,
          reddit: metrics.reddit,
          onChainData: metrics.on_chain_data,
          exchangeFlows: metrics.exchange_flows,
          supplyDistribution: metrics.supply_distribution,
          alertMessages: metrics.alert_messages
        }
      };
      
      this.setCached(cacheKey, result);
      return result;
      
    } catch (error) {
      console.warn('Messari API error:', error);
      return { found: false, error: error.message };
    }
  },

  // ============================================
  // MAIN AGGREGATION FUNCTION
  // ============================================
  async aggregateCoinData(coinGeckoData, coinId, coinName, contractAddress = null) {
    console.log('🔄 Aggregating data from multiple sources...');
    
    const symbol = coinGeckoData.symbol?.toUpperCase();
    
    // Fetch all sources in parallel
    const [defiLlama, dexScreener, messari, cmc, ethplorer] = await Promise.allSettled([
      this.fetchDefiLlamaData(coinId, coinName),
      contractAddress ? this.fetchDexScreenerData(contractAddress) : Promise.resolve({ found: false }),
      this.fetchMessariData(symbol),
      this.fetchCoinMarketCapData(symbol),
      contractAddress ? this.fetchEthplorerData(contractAddress) : Promise.resolve({ found: false })
    ]);
    
    const aggregated = {
      sources: {
        coinGecko: { status: 'success', data: coinGeckoData },
        defiLlama: defiLlama.status === 'fulfilled' ? defiLlama.value : { error: defiLlama.reason },
        dexScreener: dexScreener.status === 'fulfilled' ? dexScreener.value : { error: dexScreener.reason },
        messari: messari.status === 'fulfilled' ? messari.value : { error: messari.reason },
        coinMarketCap: cmc.status === 'fulfilled' ? cmc.value : { error: cmc.reason },
        ethplorer: ethplorer.status === 'fulfilled' ? ethplorer.value : { error: ethplorer.reason }
      },
      combined: {}
    };
    
    // Combine liquidity data
    const dexLiquidity = dexScreener.status === 'fulfilled' && dexScreener.value.found 
      ? dexScreener.value.aggregated.totalLiquidity 
      : 0;
    
    const defiTvl = defiLlama.status === 'fulfilled' && defiLlama.value.found
      ? defiLlama.value.tvl
      : 0;
    
    aggregated.combined.liquidity = {
      dexLiquidity,
      defiTvl,
      totalValueLocked: defiTvl,
      sources: []
    };
    
    if (dexLiquidity > 0) aggregated.combined.liquidity.sources.push('DexScreener');
    if (defiTvl > 0) aggregated.combined.liquidity.sources.push('DefiLlama');
    
    // Combine holder data from multiple sources
    const dexHolders = dexScreener.status === 'fulfilled' && dexScreener.value.found 
      ? dexScreener.value.topHolders 
      : [];
    
    const ethplorerHolders = ethplorer.status === 'fulfilled' && ethplorer.value.found
      ? ethplorer.value.topHolders
      : [];
    
    // Prioritize Ethplorer for Ethereum tokens as it has better holder data
    const bestHolders = ethplorerHolders.length > 0 ? ethplorerHolders : dexHolders;
    const holdersSource = ethplorerHolders.length > 0 ? 'Ethplorer' : dexHolders.length > 0 ? 'DexScreener' : null;
    const holdersCount = ethplorer.status === 'fulfilled' && ethplorer.value.found
      ? ethplorer.value.holdersCount
      : dexScreener.status === 'fulfilled' && dexScreener.value.found
        ? dexScreener.value.topHoldersCount
        : 0;
    
    aggregated.combined.holders = {
      topHolders: bestHolders,
      count: holdersCount,
      source: holdersSource
    };
    
    // Combine tax data
    const buyTax = dexScreener.status === 'fulfilled' && dexScreener.value.found
      ? dexScreener.value.aggregated.buyTax
      : 0;
    const sellTax = dexScreener.status === 'fulfilled' && dexScreener.value.found
      ? dexScreener.value.aggregated.sellTax
      : 0;
    
    aggregated.combined.taxes = {
      buyTax,
      sellTax,
      source: buyTax > 0 || sellTax > 0 ? 'DexScreener' : null
    };
    
    // DeFi category and chains
    if (defiLlama.status === 'fulfilled' && defiLlama.value.found) {
      aggregated.combined.defi = {
        category: defiLlama.value.category,
        chains: defiLlama.value.chains,
        audits: defiLlama.value.audits,
        auditLinks: defiLlama.value.audit_links,
        governance: defiLlama.value.governance
      };
    }
    
    // Additional metrics from Messari
    if (messari.status === 'fulfilled' && messari.value.found) {
      aggregated.combined.messari = {
        developerActivity: messari.value.metrics.developerActivity,
        onChainData: messari.value.metrics.onChainData,
        exchangeFlows: messari.value.metrics.exchangeFlows,
        supplyDistribution: messari.value.metrics.supplyDistribution,
        alertMessages: messari.value.metrics.alertMessages
      };
    }
    
    // Price comparison between sources
    const prices = [];
    if (coinGeckoData.market_data?.current_price?.usd) {
      prices.push({ source: 'CoinGecko', price: coinGeckoData.market_data.current_price.usd });
    }
    if (cmc.status === 'fulfilled' && cmc.value.found && cmc.value.price) {
      prices.push({ source: 'CoinMarketCap', price: cmc.value.price });
    }
    if (dexScreener.status === 'fulfilled' && dexScreener.value.found && dexScreener.value.mainPair?.priceUsd) {
      prices.push({ source: 'DexScreener', price: dexScreener.value.mainPair.priceUsd });
    }
    
    if (prices.length > 1) {
      const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
      const maxPrice = Math.max(...prices.map(p => p.price));
      const minPrice = Math.min(...prices.map(p => p.price));
      const variance = ((maxPrice - minPrice) / avgPrice) * 100;
      
      aggregated.combined.priceComparison = {
        sources: prices,
        average: avgPrice,
        variance: variance,
        varianceWarning: variance > 5 // Alert if variance > 5%
      };
    }
    
    console.log('✅ Aggregation complete. Sources:', 
      Object.entries(aggregated.sources)
        .filter(([_, v]) => v.found || (v.data && !v.error))
        .map(([k, _]) => k)
        .join(', ')
    );
    
    return aggregated;
  },
  
  // Get summary of available data sources
  getSourcesSummary(aggregatedData) {
    const sources = aggregatedData.sources;
    return {
      total: Object.keys(sources).length,
      successful: Object.values(sources).filter(s => s.found || (s.data && !s.error)).length,
      failed: Object.values(sources).filter(s => s.error).length,
      details: Object.entries(sources).map(([name, data]) => ({
        name,
        status: data.found ? 'success' : data.error ? 'error' : 'not_found',
        hasData: !!data.found
      }))
    };
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Aggregator;
}
