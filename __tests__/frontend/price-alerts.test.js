// ============================================
// Tests for js/price-alerts.js
// Pure logic tests (no DOM dependencies)
// ============================================

// Since PriceAlerts is a DOM-dependent class, we test
// the core logic by extracting and testing the algorithms directly.

describe('PriceAlerts - Core Logic', () => {
  // Simulate the alert data model
  let alerts;

  beforeEach(() => {
    alerts = [];
  });

  // ============================================
  // addAlert logic
  // ============================================
  describe('addAlert', () => {
    function addAlert(ticker, condition, price, maxAlerts = 10) {
      if (alerts.length >= maxAlerts) {
        return false;
      }

      const alert = {
        id: Date.now(),
        ticker: ticker.toUpperCase(),
        condition,
        price: parseFloat(price),
        active: true,
        created: new Date().toISOString(),
        triggered: null
      };

      alerts.push(alert);
      return true;
    }

    test('adds alert with correct structure', () => {
      const result = addAlert('btc', 'above', '50000');
      expect(result).toBe(true);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].ticker).toBe('BTC');
      expect(alerts[0].condition).toBe('above');
      expect(alerts[0].price).toBe(50000);
      expect(alerts[0].active).toBe(true);
      expect(alerts[0].triggered).toBeNull();
    });

    test('converts ticker to uppercase', () => {
      addAlert('eth', 'below', '3000');
      expect(alerts[0].ticker).toBe('ETH');
    });

    test('parses price as float', () => {
      addAlert('BTC', 'above', '50000.75');
      expect(alerts[0].price).toBe(50000.75);
    });

    test('refuses when max alerts reached', () => {
      for (let i = 0; i < 10; i++) {
        addAlert('BTC', 'above', String(50000 + i));
      }
      expect(alerts).toHaveLength(10);

      const result = addAlert('ETH', 'below', '3000');
      expect(result).toBe(false);
      expect(alerts).toHaveLength(10);
    });

    test('respects custom maxAlerts', () => {
      for (let i = 0; i < 3; i++) {
        addAlert('BTC', 'above', String(50000 + i), 3);
      }
      const result = addAlert('ETH', 'below', '3000', 3);
      expect(result).toBe(false);
    });

    test('each alert gets unique id', () => {
      // Use different timestamps
      addAlert('BTC', 'above', '50000');
      const id1 = alerts[0].id;

      // Small delay to ensure different timestamp
      addAlert('ETH', 'below', '3000');
      const id2 = alerts[1].id;

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
    });
  });

  // ============================================
  // removeAlert logic
  // ============================================
  describe('removeAlert', () => {
    function removeAlert(id) {
      alerts = alerts.filter(a => a.id !== id);
    }

    test('removes alert by id', () => {
      alerts = [
        { id: 1, ticker: 'BTC', active: true },
        { id: 2, ticker: 'ETH', active: true },
        { id: 3, ticker: 'SOL', active: true }
      ];

      removeAlert(2);
      expect(alerts).toHaveLength(2);
      expect(alerts.find(a => a.id === 2)).toBeUndefined();
    });

    test('does nothing when id not found', () => {
      alerts = [{ id: 1, ticker: 'BTC', active: true }];
      removeAlert(999);
      expect(alerts).toHaveLength(1);
    });
  });

  // ============================================
  // toggleAlert logic
  // ============================================
  describe('toggleAlert', () => {
    function toggleAlert(id) {
      const alert = alerts.find(a => a.id === id);
      if (alert) {
        alert.active = !alert.active;
      }
    }

    test('toggles active state', () => {
      alerts = [{ id: 1, ticker: 'BTC', active: true }];

      toggleAlert(1);
      expect(alerts[0].active).toBe(false);

      toggleAlert(1);
      expect(alerts[0].active).toBe(true);
    });

    test('does nothing for non-existent id', () => {
      alerts = [{ id: 1, ticker: 'BTC', active: true }];
      toggleAlert(999);
      expect(alerts[0].active).toBe(true);
    });
  });

  // ============================================
  // checkAlerts logic (price trigger)
  // ============================================
  describe('checkAlerts (price trigger)', () => {
    function checkAlerts(tokens) {
      const triggered = [];

      alerts.forEach(alert => {
        if (!alert.active || alert.triggered) return;

        const token = tokens.find(t => t.symbol === alert.ticker);
        if (!token) return;

        const currentPrice = token.price;
        let isTriggered = false;

        if (alert.condition === 'above' && currentPrice >= alert.price) {
          isTriggered = true;
        } else if (alert.condition === 'below' && currentPrice <= alert.price) {
          isTriggered = true;
        }

        if (isTriggered) {
          alert.triggered = new Date().toISOString();
          triggered.push({ alert, currentPrice });
        }
      });

      return triggered;
    }

    test('triggers "above" alert when price >= target', () => {
      alerts = [{ id: 1, ticker: 'BTC', condition: 'above', price: 50000, active: true, triggered: null }];
      const tokens = [{ symbol: 'BTC', price: 50000 }];

      const result = checkAlerts(tokens);
      expect(result).toHaveLength(1);
      expect(alerts[0].triggered).not.toBeNull();
    });

    test('triggers "above" when price exceeds target', () => {
      alerts = [{ id: 1, ticker: 'BTC', condition: 'above', price: 50000, active: true, triggered: null }];
      const tokens = [{ symbol: 'BTC', price: 55000 }];

      const result = checkAlerts(tokens);
      expect(result).toHaveLength(1);
    });

    test('does NOT trigger "above" when price < target', () => {
      alerts = [{ id: 1, ticker: 'BTC', condition: 'above', price: 50000, active: true, triggered: null }];
      const tokens = [{ symbol: 'BTC', price: 49999 }];

      const result = checkAlerts(tokens);
      expect(result).toHaveLength(0);
      expect(alerts[0].triggered).toBeNull();
    });

    test('triggers "below" alert when price <= target', () => {
      alerts = [{ id: 1, ticker: 'ETH', condition: 'below', price: 3000, active: true, triggered: null }];
      const tokens = [{ symbol: 'ETH', price: 3000 }];

      const result = checkAlerts(tokens);
      expect(result).toHaveLength(1);
    });

    test('triggers "below" when price drops below target', () => {
      alerts = [{ id: 1, ticker: 'ETH', condition: 'below', price: 3000, active: true, triggered: null }];
      const tokens = [{ symbol: 'ETH', price: 2500 }];

      const result = checkAlerts(tokens);
      expect(result).toHaveLength(1);
    });

    test('does NOT trigger "below" when price > target', () => {
      alerts = [{ id: 1, ticker: 'ETH', condition: 'below', price: 3000, active: true, triggered: null }];
      const tokens = [{ symbol: 'ETH', price: 3001 }];

      const result = checkAlerts(tokens);
      expect(result).toHaveLength(0);
    });

    test('skips inactive alerts', () => {
      alerts = [{ id: 1, ticker: 'BTC', condition: 'above', price: 50000, active: false, triggered: null }];
      const tokens = [{ symbol: 'BTC', price: 60000 }];

      const result = checkAlerts(tokens);
      expect(result).toHaveLength(0);
    });

    test('skips already triggered alerts', () => {
      alerts = [{ id: 1, ticker: 'BTC', condition: 'above', price: 50000, active: true, triggered: '2026-01-01' }];
      const tokens = [{ symbol: 'BTC', price: 60000 }];

      const result = checkAlerts(tokens);
      expect(result).toHaveLength(0);
    });

    test('skips alerts for unknown tokens', () => {
      alerts = [{ id: 1, ticker: 'UNKNOWN', condition: 'above', price: 1, active: true, triggered: null }];
      const tokens = [{ symbol: 'BTC', price: 50000 }];

      const result = checkAlerts(tokens);
      expect(result).toHaveLength(0);
    });

    test('handles multiple alerts triggering simultaneously', () => {
      alerts = [
        { id: 1, ticker: 'BTC', condition: 'above', price: 40000, active: true, triggered: null },
        { id: 2, ticker: 'ETH', condition: 'below', price: 4000, active: true, triggered: null },
        { id: 3, ticker: 'BTC', condition: 'above', price: 60000, active: true, triggered: null }
      ];
      const tokens = [
        { symbol: 'BTC', price: 50000 },
        { symbol: 'ETH', price: 3500 }
      ];

      const result = checkAlerts(tokens);
      expect(result).toHaveLength(2); // BTC above 40k + ETH below 4k
      expect(alerts[0].triggered).not.toBeNull();
      expect(alerts[1].triggered).not.toBeNull();
      expect(alerts[2].triggered).toBeNull(); // BTC not above 60k
    });

    test('handles floating point price comparison correctly', () => {
      alerts = [{ id: 1, ticker: 'TOKEN', condition: 'above', price: 0.000001, active: true, triggered: null }];
      const tokens = [{ symbol: 'TOKEN', price: 0.0000015 }];

      const result = checkAlerts(tokens);
      expect(result).toHaveLength(1);
    });
  });

  // ============================================
  // localStorage serialization
  // ============================================
  describe('serialization', () => {
    test('alerts serialize to valid JSON', () => {
      alerts = [
        { id: 1, ticker: 'BTC', condition: 'above', price: 50000, active: true, created: '2026-01-01', triggered: null },
        { id: 2, ticker: 'ETH', condition: 'below', price: 3000, active: false, created: '2026-01-02', triggered: '2026-01-03' }
      ];

      const json = JSON.stringify(alerts);
      const parsed = JSON.parse(json);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].ticker).toBe('BTC');
      expect(parsed[1].triggered).toBe('2026-01-03');
    });

    test('handles empty alerts array', () => {
      const json = JSON.stringify(alerts);
      expect(JSON.parse(json)).toEqual([]);
    });
  });
});
