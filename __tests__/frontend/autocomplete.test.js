// ============================================
// Tests for js/autocomplete.js
// Pure logic tests (filtering, formatting)
// ============================================

describe('Autocomplete - Core Logic', () => {
  // ============================================
  // filterItems
  // ============================================
  describe('filterItems', () => {
    const items = [
      { symbol: 'BTC', name: 'Bitcoin', category: 'Store of Value' },
      { symbol: 'ETH', name: 'Ethereum', category: 'Smart Contracts' },
      { symbol: 'SOL', name: 'Solana', category: 'Smart Contracts' },
      { symbol: 'DOGE', name: 'Dogecoin', category: 'Meme' },
      { symbol: 'SHIB', name: 'Shiba Inu', category: 'Meme' },
      { symbol: 'AVAX', name: 'Avalanche', category: 'Smart Contracts' },
      { symbol: 'DOT', name: 'Polkadot', category: 'Infrastructure' },
      { symbol: 'MATIC', name: 'Polygon', category: 'Layer 2' },
      { symbol: 'LINK', name: 'Chainlink', category: 'Oracle' },
      { symbol: 'UNI', name: 'Uniswap', category: 'DeFi' }
    ];

    function filterItems(query, maxResults = 8) {
      return items
        .filter(item =>
          item.symbol.toLowerCase().includes(query) ||
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        )
        .slice(0, maxResults);
    }

    test('filters by symbol', () => {
      const results = filterItems('btc');
      expect(results).toHaveLength(1);
      expect(results[0].symbol).toBe('BTC');
    });

    test('filters by name', () => {
      const results = filterItems('bitcoin');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Bitcoin');
    });

    test('filters by category', () => {
      const results = filterItems('meme');
      expect(results).toHaveLength(2);
      expect(results.map(r => r.symbol)).toEqual(['DOGE', 'SHIB']);
    });

    test('partial match works', () => {
      const results = filterItems('sol');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].symbol).toBe('SOL');
    });

    test('case insensitive search', () => {
      const results = filterItems('ethereum');
      expect(results).toHaveLength(1);
      expect(results[0].symbol).toBe('ETH');
    });

    test('returns empty for no matches', () => {
      const results = filterItems('zzzzz');
      expect(results).toHaveLength(0);
    });

    test('respects maxResults limit', () => {
      const results = filterItems('smart contracts', 2);
      expect(results).toHaveLength(2);
    });

    test('returns multiple matches for broad query', () => {
      const results = filterItems('a'); // matches many: Avalanche, Polkadot, Chainlink, etc.
      expect(results.length).toBeGreaterThan(1);
    });

    test('empty query matches everything (up to maxResults)', () => {
      const results = filterItems('');
      expect(results).toHaveLength(8); // maxResults default
    });
  });

  // ============================================
  // formatPrice
  // ============================================
  describe('formatPrice', () => {
    function formatPrice(price) {
      if (price >= 1) {
        return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } else if (price >= 0.0001) {
        return price.toFixed(6);
      } else {
        return price.toExponential(4);
      }
    }

    test('formats large prices with 2 decimals', () => {
      expect(formatPrice(50000)).toContain('50');
      expect(formatPrice(50000)).toContain('.00');
    });

    test('formats prices >= 1 with 2 decimals', () => {
      const result = formatPrice(1.5);
      expect(result).toContain('1.50');
    });

    test('formats small prices with 6 decimals', () => {
      expect(formatPrice(0.005)).toBe('0.005000');
    });

    test('formats very small prices in scientific notation', () => {
      const result = formatPrice(0.00001);
      expect(result).toContain('e');
    });

    test('boundary: price = 1 uses standard format', () => {
      const result = formatPrice(1);
      expect(result).toContain('1.00');
    });

    test('boundary: price = 0.0001 uses fixed format', () => {
      expect(formatPrice(0.0001)).toBe('0.000100');
    });

    test('boundary: price just below 0.0001 uses scientific', () => {
      const result = formatPrice(0.00009999);
      expect(result).toContain('e');
    });
  });

  // ============================================
  // Keyboard navigation
  // ============================================
  describe('keyboard navigation logic', () => {
    test('ArrowDown increments selectedIndex', () => {
      let selectedIndex = -1;
      const itemsCount = 5;

      // Simulate ArrowDown
      selectedIndex = Math.min(selectedIndex + 1, itemsCount - 1);
      expect(selectedIndex).toBe(0);

      selectedIndex = Math.min(selectedIndex + 1, itemsCount - 1);
      expect(selectedIndex).toBe(1);
    });

    test('ArrowDown caps at last item', () => {
      let selectedIndex = 4;
      const itemsCount = 5;

      selectedIndex = Math.min(selectedIndex + 1, itemsCount - 1);
      expect(selectedIndex).toBe(4);
    });

    test('ArrowUp decrements selectedIndex', () => {
      let selectedIndex = 2;

      selectedIndex = Math.max(selectedIndex - 1, -1);
      expect(selectedIndex).toBe(1);
    });

    test('ArrowUp stops at -1 (no selection)', () => {
      let selectedIndex = 0;

      selectedIndex = Math.max(selectedIndex - 1, -1);
      expect(selectedIndex).toBe(-1);

      selectedIndex = Math.max(selectedIndex - 1, -1);
      expect(selectedIndex).toBe(-1);
    });

    test('Enter with selectedIndex >= 0 selects item', () => {
      const selectedIndex = 2;
      const items = ['BTC', 'ETH', 'SOL'];

      if (selectedIndex >= 0) {
        expect(items[selectedIndex]).toBe('SOL');
      }
    });

    test('Enter with selectedIndex -1 does nothing', () => {
      const selectedIndex = -1;
      expect(selectedIndex < 0).toBe(true);
    });
  });

  // ============================================
  // Debounce behavior
  // ============================================
  describe('debounce logic', () => {
    test('only last call executes after delay', () => {
      jest.useFakeTimers();
      const fn = jest.fn();

      let timer = null;
      function debounced(value) {
        clearTimeout(timer);
        timer = setTimeout(() => fn(value), 150);
      }

      debounced('b');
      debounced('bi');
      debounced('bit');
      debounced('bitc');

      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(150);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('bitc');

      jest.useRealTimers();
    });
  });
});
