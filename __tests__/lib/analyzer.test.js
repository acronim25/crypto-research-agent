// ============================================
// Tests for lib/analyzer.js
// ============================================

const { calculateRiskScore, getRiskClass, analyzeRedFlags } = require('../../lib/analyzer');

// ============================================
// calculateRiskScore
// ============================================
describe('calculateRiskScore', () => {
  function makeAnalysis(overrides = {}) {
    return {
      red_flags: [],
      price_data: {
        ath_percentage: -50,
        age_days: 365,
        volume_24h: 1000000,
        ...overrides.price_data
      },
      tokenomics: {
        circulation_percentage: 80,
        ...overrides.tokenomics
      },
      ...overrides
    };
  }

  test('returns base score of 5 with no risk factors', () => {
    const analysis = makeAnalysis();
    const score = calculateRiskScore(analysis);
    expect(score).toBe(5);
  });

  test('critical red flags add 3 points each', () => {
    const analysis = makeAnalysis({
      red_flags: [
        { severity: 'critical', passed: false },
        { severity: 'critical', passed: false }
      ]
    });
    const score = calculateRiskScore(analysis);
    // 5 + 3 + 3 = 11 -> capped at 10
    expect(score).toBe(10);
  });

  test('high red flags add 2 points each', () => {
    const analysis = makeAnalysis({
      red_flags: [{ severity: 'high', passed: false }]
    });
    const score = calculateRiskScore(analysis);
    expect(score).toBe(7);
  });

  test('medium red flags add 0.5 points each', () => {
    const analysis = makeAnalysis({
      red_flags: [
        { severity: 'medium', passed: false },
        { severity: 'medium', passed: false }
      ]
    });
    const score = calculateRiskScore(analysis);
    // 5 + 0.5 + 0.5 = 6
    expect(score).toBe(6);
  });

  test('passed flags are NOT counted', () => {
    const analysis = makeAnalysis({
      red_flags: [
        { severity: 'critical', passed: true },
        { severity: 'high', passed: true }
      ]
    });
    const score = calculateRiskScore(analysis);
    expect(score).toBe(5);
  });

  test('ATH drop > 90% adds 1 point', () => {
    const analysis = makeAnalysis({
      price_data: { ath_percentage: -95, age_days: 365, volume_24h: 1000000 }
    });
    const score = calculateRiskScore(analysis);
    expect(score).toBe(6);
  });

  test('token age < 30 days adds 2 points', () => {
    const analysis = makeAnalysis({
      price_data: { ath_percentage: -50, age_days: 10, volume_24h: 1000000 }
    });
    const score = calculateRiskScore(analysis);
    expect(score).toBe(7);
  });

  test('volume < 10000 adds 1 point', () => {
    const analysis = makeAnalysis({
      price_data: { ath_percentage: -50, age_days: 365, volume_24h: 5000 }
    });
    const score = calculateRiskScore(analysis);
    expect(score).toBe(6);
  });

  test('low circulation percentage adds 1 point', () => {
    const analysis = makeAnalysis({
      tokenomics: { circulation_percentage: 30 }
    });
    const score = calculateRiskScore(analysis);
    expect(score).toBe(6);
  });

  test('score is capped at 10', () => {
    const analysis = makeAnalysis({
      red_flags: [
        { severity: 'critical', passed: false },
        { severity: 'critical', passed: false },
        { severity: 'critical', passed: false }
      ],
      price_data: { ath_percentage: -95, age_days: 5, volume_24h: 100 },
      tokenomics: { circulation_percentage: 10 }
    });
    const score = calculateRiskScore(analysis);
    expect(score).toBe(10);
  });

  test('score has minimum of 1', () => {
    // Base is 5, no additions, no subtractions in current logic
    // But testing the Math.max(1, ...) boundary
    const analysis = makeAnalysis();
    const score = calculateRiskScore(analysis);
    expect(score).toBeGreaterThanOrEqual(1);
  });

  test('score is always an integer (rounded)', () => {
    const analysis = makeAnalysis({
      red_flags: [{ severity: 'medium', passed: false }]
    });
    // 5 + 0.5 = 5.5 -> rounded to 6
    const score = calculateRiskScore(analysis);
    expect(Number.isInteger(score)).toBe(true);
  });

  test('multiple risk factors combine correctly', () => {
    const analysis = makeAnalysis({
      red_flags: [
        { severity: 'high', passed: false },
        { severity: 'medium', passed: false }
      ],
      price_data: { ath_percentage: -95, age_days: 15, volume_24h: 5000 },
      tokenomics: { circulation_percentage: 30 }
    });
    // 5 + 2 + 0.5 + 1 + 2 + 1 + 1 = 12.5 -> capped at 10
    const score = calculateRiskScore(analysis);
    expect(score).toBe(10);
  });
});

// ============================================
// getRiskClass
// ============================================
describe('getRiskClass', () => {
  test('score 1 returns low', () => {
    expect(getRiskClass(1)).toBe('low');
  });

  test('score 3 returns low (boundary)', () => {
    expect(getRiskClass(3)).toBe('low');
  });

  test('score 4 returns medium', () => {
    expect(getRiskClass(4)).toBe('medium');
  });

  test('score 5 returns medium (boundary)', () => {
    expect(getRiskClass(5)).toBe('medium');
  });

  test('score 6 returns high', () => {
    expect(getRiskClass(6)).toBe('high');
  });

  test('score 7 returns high (boundary)', () => {
    expect(getRiskClass(7)).toBe('high');
  });

  test('score 8 returns extreme', () => {
    expect(getRiskClass(8)).toBe('extreme');
  });

  test('score 10 returns extreme', () => {
    expect(getRiskClass(10)).toBe('extreme');
  });
});

// ============================================
// analyzeRedFlags
// ============================================
describe('analyzeRedFlags', () => {
  function makeAnalysis(overrides = {}) {
    return {
      token: { website: '', ...overrides.token },
      price_data: { age_days: 365, ...overrides.price_data },
      onchain: { ...overrides.onchain },
      ...overrides
    };
  }

  test('returns exactly 7 flags', () => {
    const flags = analyzeRedFlags(makeAnalysis());
    expect(flags).toHaveLength(7);
  });

  test('each flag has required properties', () => {
    const flags = analyzeRedFlags(makeAnalysis());
    flags.forEach(flag => {
      expect(flag).toHaveProperty('check');
      expect(flag).toHaveProperty('passed');
      expect(flag).toHaveProperty('severity');
      expect(flag).toHaveProperty('description');
      expect(typeof flag.check).toBe('string');
      expect([true, false, undefined, null, '', 0]).toContain(flag.passed); // truthy/falsy check
      expect(['critical', 'high', 'medium', 'low']).toContain(flag.severity);
      expect(typeof flag.description).toBe('string');
    });
  });

  // Honeypot check (flag 0)
  test('honeypot check always passes (placeholder)', () => {
    const flags = analyzeRedFlags(makeAnalysis());
    const honeypot = flags.find(f => f.check === 'Honeypot Test');
    expect(honeypot.passed).toBe(true);
    expect(honeypot.severity).toBe('critical');
  });

  // Contract verified (flag 1)
  test('contract verified flag passes when contract is verified', () => {
    const flags = analyzeRedFlags(makeAnalysis({
      onchain: { contract_verified: true }
    }));
    const contractFlag = flags.find(f => f.check === 'Contract Verificat');
    expect(contractFlag.passed).toBe(true);
  });

  test('contract verified flag fails when contract is not verified', () => {
    const flags = analyzeRedFlags(makeAnalysis({
      onchain: { contract_verified: false }
    }));
    const contractFlag = flags.find(f => f.check === 'Contract Verificat');
    expect(contractFlag.passed).toBe(false);
  });

  // Mint authority (flag 2)
  test('mint authority flag passes when renounced', () => {
    const flags = analyzeRedFlags(makeAnalysis({
      onchain: { mint_authority_renounced: true }
    }));
    const mintFlag = flags.find(f => f.check === 'Mint Authority');
    expect(mintFlag.passed).toBe(true);
    expect(mintFlag.severity).toBe('critical');
  });

  test('mint authority flag fails when NOT renounced', () => {
    const flags = analyzeRedFlags(makeAnalysis({
      onchain: { mint_authority_renounced: false }
    }));
    const mintFlag = flags.find(f => f.check === 'Mint Authority');
    expect(mintFlag.passed).toBe(false);
  });

  // Liquidity locked (flag 3)
  test('liquidity flag passes when locked', () => {
    const flags = analyzeRedFlags(makeAnalysis({
      onchain: { liquidity_locked: true }
    }));
    const liqFlag = flags.find(f => f.check === 'Liquidity Locked');
    expect(liqFlag.passed).toBe(true);
    expect(liqFlag.severity).toBe('medium');
  });

  test('liquidity flag fails when not locked', () => {
    const flags = analyzeRedFlags(makeAnalysis({
      onchain: { liquidity_locked: false }
    }));
    const liqFlag = flags.find(f => f.check === 'Liquidity Locked');
    expect(liqFlag.passed).toBe(false);
  });

  // Website active (flag 4)
  test('website flag passes when website exists', () => {
    const flags = analyzeRedFlags(makeAnalysis({
      token: { website: 'https://example.com' }
    }));
    const webFlag = flags.find(f => f.check === 'Website Activ');
    expect(webFlag.passed).toBe(true);
  });

  test('website flag fails when no website', () => {
    const flags = analyzeRedFlags(makeAnalysis({
      token: { website: '' }
    }));
    const webFlag = flags.find(f => f.check === 'Website Activ');
    expect(webFlag.passed).toBeFalsy();
  });

  // Team doxxed (flag 5)
  test('team flag always fails (placeholder)', () => {
    const flags = analyzeRedFlags(makeAnalysis());
    const teamFlag = flags.find(f => f.check === 'Echipa Publică');
    expect(teamFlag.passed).toBe(false);
    expect(teamFlag.severity).toBe('low');
  });

  // Age check (flag 6)
  test('age flag passes for projects older than 30 days', () => {
    const flags = analyzeRedFlags(makeAnalysis({
      price_data: { age_days: 100 }
    }));
    const ageFlag = flags.find(f => f.check === 'Vechime Proiect');
    expect(ageFlag.passed).toBe(true);
  });

  test('age flag fails for projects younger than 30 days', () => {
    const flags = analyzeRedFlags(makeAnalysis({
      price_data: { age_days: 15 }
    }));
    const ageFlag = flags.find(f => f.check === 'Vechime Proiect');
    expect(ageFlag.passed).toBe(false);
    expect(ageFlag.severity).toBe('medium');
  });

  test('age flag boundary: 30 days exactly passes', () => {
    const flags = analyzeRedFlags(makeAnalysis({
      price_data: { age_days: 30 }
    }));
    const ageFlag = flags.find(f => f.check === 'Vechime Proiect');
    expect(ageFlag.passed).toBe(true);
  });

  test('age flag boundary: 29 days fails', () => {
    const flags = analyzeRedFlags(makeAnalysis({
      price_data: { age_days: 29 }
    }));
    const ageFlag = flags.find(f => f.check === 'Vechime Proiect');
    expect(ageFlag.passed).toBe(false);
  });

  // Edge cases
  test('handles missing onchain data gracefully', () => {
    const flags = analyzeRedFlags(makeAnalysis({ onchain: undefined }));
    expect(flags).toHaveLength(7);
  });

  test('handles missing token data gracefully', () => {
    const flags = analyzeRedFlags(makeAnalysis({ token: undefined }));
    expect(flags).toHaveLength(7);
  });

  test('handles missing price_data gracefully', () => {
    const flags = analyzeRedFlags(makeAnalysis({ price_data: undefined }));
    expect(flags).toHaveLength(7);
  });
});
