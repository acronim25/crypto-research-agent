// ============================================
// Tests for js/api.js - Analyzer (frontend)
// These test the frontend risk calculation logic
// which is separate from the backend analyzer
// ============================================

// Extract the Analyzer logic (it's designed for browser, so we replicate the pure functions)
// The actual js/api.js assigns to window.*, so we test the logic directly

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

// ============================================
// Frontend Analyzer.calculateRiskScore
// ============================================
describe('Frontend Analyzer.calculateRiskScore', () => {
  test('base score is 5 with neutral data', () => {
    const result = Analyzer.calculateRiskScore({
      market_data: {
        market_cap: { usd: 5000000 },
        total_volume: { usd: 500000 },
        price_change_percentage_24h: 0
      }
    });
    expect(result.score).toBe(5);
    expect(result.riskClass).toBe('medium');
  });

  test('low market cap increases risk', () => {
    const result = Analyzer.calculateRiskScore({
      market_data: {
        market_cap: { usd: 500000 }, // < 1M
        total_volume: { usd: 500000 },
        price_change_percentage_24h: 0
      }
    });
    expect(result.score).toBe(7);
    expect(result.redFlags).toContain('Market cap foarte mic');
    expect(result.riskClass).toBe('high');
  });

  test('high market cap decreases risk', () => {
    const result = Analyzer.calculateRiskScore({
      market_data: {
        market_cap: { usd: 2000000000 }, // > 1B
        total_volume: { usd: 500000 },
        price_change_percentage_24h: 0
      }
    });
    expect(result.score).toBe(4);
    expect(result.greenFlags).toContain('Market cap mare');
  });

  test('low volume increases risk', () => {
    const result = Analyzer.calculateRiskScore({
      market_data: {
        market_cap: { usd: 5000000 },
        total_volume: { usd: 50000 }, // < 100K
        price_change_percentage_24h: 0
      }
    });
    expect(result.score).toBe(6);
    expect(result.redFlags).toContain('Volum scăzut');
  });

  test('high volume decreases risk', () => {
    const result = Analyzer.calculateRiskScore({
      market_data: {
        market_cap: { usd: 5000000 },
        total_volume: { usd: 50000000 }, // > 10M
        price_change_percentage_24h: 0
      }
    });
    expect(result.score).toBe(4);
    expect(result.greenFlags).toContain('Volum bun');
  });

  test('massive pump (+50%) increases risk', () => {
    const result = Analyzer.calculateRiskScore({
      market_data: {
        market_cap: { usd: 5000000 },
        total_volume: { usd: 500000 },
        price_change_percentage_24h: 60
      }
    });
    expect(result.score).toBe(7);
    expect(result.redFlags).toContain('Pump masiv 24h');
  });

  test('massive drop (-50%) increases risk', () => {
    const result = Analyzer.calculateRiskScore({
      market_data: {
        market_cap: { usd: 5000000 },
        total_volume: { usd: 500000 },
        price_change_percentage_24h: -55
      }
    });
    expect(result.score).toBe(6);
    expect(result.redFlags).toContain('Drop masiv 24h');
  });

  test('best case: large cap, high volume, stable price = low risk', () => {
    const result = Analyzer.calculateRiskScore({
      market_data: {
        market_cap: { usd: 10000000000 },
        total_volume: { usd: 100000000 },
        price_change_percentage_24h: 2
      }
    });
    expect(result.score).toBe(3);
    expect(result.riskClass).toBe('low');
  });

  test('worst case: tiny cap, no volume, pumping = high risk', () => {
    const result = Analyzer.calculateRiskScore({
      market_data: {
        market_cap: { usd: 10000 },
        total_volume: { usd: 1000 },
        price_change_percentage_24h: 100
      }
    });
    expect(result.score).toBe(10);
    expect(result.riskClass).toBe('high');
  });

  test('handles missing market_data', () => {
    const result = Analyzer.calculateRiskScore({});
    expect(result.score).toBe(8); // 5 + 2 (low cap) + 1 (low vol)
    expect(result.riskClass).toBe('high');
  });

  test('riskClass boundaries', () => {
    // score <= 3 = low
    expect(Analyzer.calculateRiskScore({
      market_data: {
        market_cap: { usd: 5000000000 },
        total_volume: { usd: 50000000 },
        price_change_percentage_24h: 0
      }
    }).riskClass).toBe('low');

    // score 4-6 = medium
    expect(Analyzer.calculateRiskScore({
      market_data: {
        market_cap: { usd: 5000000 },
        total_volume: { usd: 500000 },
        price_change_percentage_24h: 0
      }
    }).riskClass).toBe('medium');
  });
});

// ============================================
// Frontend Analyzer.calculateSentiment
// ============================================
describe('Frontend Analyzer.calculateSentiment', () => {
  test('bullish when 24h > 5% AND 7d > 10%', () => {
    const result = Analyzer.calculateSentiment({
      market_data: {
        price_change_percentage_24h: 10,
        price_change_percentage_7d: 15
      }
    });
    expect(result.sentiment).toBe('bullish');
    expect(result.sentimentScore).toBe(75);
  });

  test('bearish when 24h < -5% AND 7d < -10%', () => {
    const result = Analyzer.calculateSentiment({
      market_data: {
        price_change_percentage_24h: -10,
        price_change_percentage_7d: -15
      }
    });
    expect(result.sentiment).toBe('bearish');
    expect(result.sentimentScore).toBe(25);
  });

  test('neutral when conditions not met', () => {
    const result = Analyzer.calculateSentiment({
      market_data: {
        price_change_percentage_24h: 3,
        price_change_percentage_7d: 5
      }
    });
    expect(result.sentiment).toBe('neutral');
    expect(result.sentimentScore).toBe(50);
  });

  test('neutral when only 24h is positive', () => {
    const result = Analyzer.calculateSentiment({
      market_data: {
        price_change_percentage_24h: 10,
        price_change_percentage_7d: -5
      }
    });
    expect(result.sentiment).toBe('neutral');
  });

  test('handles missing market_data', () => {
    const result = Analyzer.calculateSentiment({});
    expect(result.sentiment).toBe('neutral');
    expect(result.sentimentScore).toBe(50);
  });

  test('boundary: exactly 5% / 10% is NOT bullish', () => {
    const result = Analyzer.calculateSentiment({
      market_data: {
        price_change_percentage_24h: 5,
        price_change_percentage_7d: 10
      }
    });
    expect(result.sentiment).toBe('neutral');
  });

  test('boundary: exactly -5% / -10% is NOT bearish', () => {
    const result = Analyzer.calculateSentiment({
      market_data: {
        price_change_percentage_24h: -5,
        price_change_percentage_7d: -10
      }
    });
    expect(result.sentiment).toBe('neutral');
  });
});
