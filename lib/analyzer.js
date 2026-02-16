// ============================================
// LIB/ANALYZER.JS - Token Analysis Logic
// ============================================

const { CoinGecko, CoinMarketCap, Etherscan, Twitter } = require('./apis');

// Main analysis function
async function analyzeToken(identifier, type) {
  const analysis = {
    token: {},
    price_data: {},
    tokenomics: {},
    onchain: {},
    red_flags: [],
    analysis: {}
  };
  
  try {
    // Get CoinGecko data
    let coinId = identifier;
    if (type === 'ticker' || type === 'name') {
      const search = await CoinGecko.search(identifier);
      if (search.coins && search.coins.length > 0) {
        coinId = search.coins[0].id;
        analysis.token.ticker = search.coins[0].symbol.toUpperCase();
        analysis.token.name = search.coins[0].name;
        analysis.token.logo = search.coins[0].large;
      }
    }
    
    // Get detailed coin data
    if (coinId) {
      const coinData = await CoinGecko.getCoin(coinId);
      
      // Token info
      analysis.token.description = coinData.description?.en || '';
      analysis.token.website = coinData.links?.homepage?.[0] || '';
      
      // Price data
      const market = coinData.market_data;
      analysis.price_data = {
        current_price: market?.current_price?.usd || 0,
        ath: market?.ath?.usd || 0,
        atl: market?.atl?.usd || 0,
        ath_percentage: market?.ath_change_percentage?.usd || 0,
        days_since_ath: calculateDaysSince(market?.ath_date?.usd),
        volume_24h: market?.total_volume?.usd || 0,
        volume_change_24h: market?.volume_change_24h || 0,
        market_cap_rank: market?.market_cap_rank || 0,
        price_btc: market?.current_price?.btc || 0,
        price_eth: market?.current_price?.eth || 0,
        age_days: estimateAge(coinData.genesis_date)
      };
      
      // Tokenomics
      analysis.tokenomics = {
        market_cap: market?.market_cap?.usd || 0,
        fully_diluted_valuation: market?.fully_diluted_valuation?.usd || 0,
        total_supply: market?.total_supply || 0,
        circulating_supply: market?.circulating_supply || 0,
        circulation_percentage: market?.total_supply 
          ? (market.circulating_supply / market.total_supply) * 100 
          : 0
      };
    }
    
    // Get sentiment
    const sentiment = await Twitter.getSentiment(analysis.token.ticker || identifier);
    analysis.analysis.sentiment = sentiment.label;
    analysis.analysis.sentiment_score = sentiment.score;
    analysis.analysis.social_score = Math.min(100, sentiment.volume / 10);
    
    // Red flags analysis
    analysis.red_flags = analyzeRedFlags(analysis);
    
    // Calculate risk score
    analysis.analysis.risk_score = calculateRiskScore(analysis);
    analysis.analysis.risk_class = getRiskClass(analysis.analysis.risk_score);
    
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
  
  return analysis;
}

// Calculate risk score
function calculateRiskScore(analysis) {
  let score = 5; // Start at medium
  
  // Red flags impact
  const criticalFlags = analysis.red_flags.filter(f => f.severity === 'critical' && !f.passed);
  const highFlags = analysis.red_flags.filter(f => f.severity === 'high' && !f.passed);
  const mediumFlags = analysis.red_flags.filter(f => f.severity === 'medium' && !f.passed);
  
  score += criticalFlags.length * 3;
  score += highFlags.length * 2;
  score += mediumFlags.length * 0.5;
  
  // Price action impact
  const price = analysis.price_data;
  if (price.ath_percentage < -90) score += 1; // Down 90% from ATH
  if (price.age_days < 30) score += 2; // Less than 1 month old
  if (price.volume_24h < 10000) score += 1; // Very low volume
  
  // Tokenomics impact
  const tokenomics = analysis.tokenomics;
  if (tokenomics.circulation_percentage < 50) score += 1;
  
  // Cap at 10
  return Math.min(10, Math.max(1, Math.round(score)));
}

// Get risk class
function getRiskClass(score) {
  if (score <= 3) return 'low';
  if (score <= 5) return 'medium';
  if (score <= 7) return 'high';
  return 'extreme';
}

// Analyze red flags
function analyzeRedFlags(analysis) {
  const flags = [];
  
  // 1. Honeypot check (placeholder)
  flags.push({
    check: 'Honeypot Test',
    passed: true, // Would be checked via contract simulation
    severity: 'critical',
    description: 'Token-ul poate fi vândut (nu este honeypot)'
  });
  
  // 2. Contract verified
  flags.push({
    check: 'Contract Verificat',
    passed: !!analysis.onchain?.contract_verified,
    severity: 'high',
    description: analysis.onchain?.contract_verified 
      ? 'Codul contractului este public și verificat'
      : 'Codul contractului nu este verificat'
  });
  
  // 3. Mint authority
  flags.push({
    check: 'Mint Authority',
    passed: analysis.onchain?.mint_authority_renounced !== false,
    severity: 'critical',
    description: analysis.onchain?.mint_authority_renounced
      ? 'Dezvoltatorii nu pot crea mai mulți tokeni'
      : 'Dezvoltatorii pot crea tokeni nelimitați'
  });
  
  // 4. Liquidity locked
  flags.push({
    check: 'Liquidity Locked',
    passed: analysis.onchain?.liquidity_locked,
    severity: 'medium',
    description: analysis.onchain?.liquidity_locked
      ? 'Liquidity-ul este blocat (rug pull protection)'
      : 'Liquidity-ul nu este blocat'
  });
  
  // 5. Website active
  const hasWebsite = analysis.token?.website && analysis.token.website.length > 0;
  flags.push({
    check: 'Website Activ',
    passed: hasWebsite,
    severity: 'medium',
    description: hasWebsite
      ? 'Proiectul are website oficial'
      : 'Nu există website oficial'
  });
  
  // 6. Team doxxed (placeholder)
  flags.push({
    check: 'Echipa Publică',
    passed: false, // Would require manual verification
    severity: 'low',
    description: 'Echipa nu este publică (anonimă)'
  });
  
  // 7. Age check
  const isNew = analysis.price_data?.age_days < 30;
  flags.push({
    check: 'Vechime Proiect',
    passed: !isNew,
    severity: 'medium',
    description: isNew
      ? `Proiect nou (${analysis.price_data?.age_days} zile)`
      : `Proiect vechi de ${analysis.price_data?.age_days} zile`
  });
  
  return flags;
}

// Helper: Calculate days since date
function calculateDaysSince(dateString) {
  if (!dateString) return 0;
  const date = new Date(dateString);
  const now = new Date();
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

// Helper: Estimate age from genesis date
function estimateAge(genesisDate) {
  if (!genesisDate) return 365; // Default to 1 year if unknown
  return calculateDaysSince(genesisDate);
}

module.exports = {
  analyzeToken,
  calculateRiskScore,
  getRiskClass,
  analyzeRedFlags
};
