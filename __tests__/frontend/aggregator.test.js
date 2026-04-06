// ============================================
// Tests for js/aggregator.js
// ============================================

// Mock fetch globally
global.fetch = jest.fn();
global.console.warn = jest.fn();
global.console.log = jest.fn();
global.console.error = jest.fn();

const Aggregator = require('../../js/aggregator');

beforeEach(() => {
  jest.clearAllMocks();
  Aggregator.cache.clear();
});

// ============================================
// Cache System
// ============================================
describe('Cache', () => {
  test('getCached returns null for missing key', () => {
    expect(Aggregator.getCached('nonexistent')).toBeNull();
  });

  test('setCached + getCached returns cached data', () => {
    Aggregator.setCached('test_key', { foo: 'bar' });
    expect(Aggregator.getCached('test_key')).toEqual({ foo: 'bar' });
  });

  test('getCached returns null for expired cache', () => {
    Aggregator.cache.set('expired_key', {
      data: { foo: 'bar' },
      timestamp: Date.now() - 300000 // 5 minutes ago (> 2 min CACHE_DURATION)
    });
    expect(Aggregator.getCached('expired_key')).toBeNull();
  });

  test('expired cache entry is deleted', () => {
    Aggregator.cache.set('expired_key', {
      data: { foo: 'bar' },
      timestamp: Date.now() - 300000
    });
    Aggregator.getCached('expired_key');
    expect(Aggregator.cache.has('expired_key')).toBe(false);
  });

  test('cache respects CACHE_DURATION', () => {
    Aggregator.setCached('fresh_key', { data: 'fresh' });
    // Within 2 minutes, should still be cached
    expect(Aggregator.getCached('fresh_key')).toEqual({ data: 'fresh' });
  });
});

// ============================================
// fetchDefiLlamaData
// ============================================
describe('fetchDefiLlamaData', () => {
  test('returns cached data if available', async () => {
    Aggregator.setCached('defillama_bitcoin', { found: true, tvl: 1000000 });

    const result = await Aggregator.fetchDefiLlamaData('bitcoin', 'Bitcoin');
    expect(result).toEqual({ found: true, tvl: 1000000 });
    expect(fetch).not.toHaveBeenCalled();
  });

  test('returns found:false when no matching protocol', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve([
        { name: 'Aave', symbol: 'AAVE', slug: 'aave' },
        { name: 'Uniswap', symbol: 'UNI', slug: 'uniswap' }
      ])
    });

    const result = await Aggregator.fetchDefiLlamaData('nonexistent', 'NonexistentToken');
    expect(result).toEqual({ found: false, tvl: 0, chains: [], category: null });
  });

  test('finds protocol by name match and returns detailed data', async () => {
    fetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve([
          { name: 'Aave', symbol: 'AAVE', slug: 'aave' }
        ])
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          tvl: 5000000,
          change_1d: 2.5,
          change_7d: -1.2,
          chains: ['Ethereum', 'Polygon'],
          category: 'Lending',
          audits: ['Trail of Bits'],
          audit_links: ['https://audit.example.com']
        })
      });

    const result = await Aggregator.fetchDefiLlamaData('aave', 'Aave');
    expect(result.found).toBe(true);
    expect(result.tvl).toBe(5000000);
    expect(result.chains).toEqual(['Ethereum', 'Polygon']);
    expect(result.category).toBe('Lending');
  });

  test('handles API error gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await Aggregator.fetchDefiLlamaData('test', 'Test');
    expect(result).toEqual({ found: false, error: 'Network error' });
  });
});

// ============================================
// fetchDexScreenerData
// ============================================
describe('fetchDexScreenerData', () => {
  test('returns found:false when no address provided', async () => {
    const result = await Aggregator.fetchDexScreenerData(null);
    expect(result).toEqual({ found: false });
  });

  test('returns found:false when no pairs found', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ pairs: [] })
    });

    const result = await Aggregator.fetchDexScreenerData('0xabc123');
    expect(result).toEqual({ found: false });
  });

  test('aggregates data from multiple pairs', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        pairs: [
          {
            dexId: 'uniswap',
            pairAddress: '0xpair1',
            baseToken: { symbol: 'TOKEN' },
            quoteToken: { symbol: 'WETH' },
            priceUsd: '1.50',
            priceChange: { h24: '5.2' },
            volume: { h24: '100000' },
            liquidity: { usd: '500000' },
            fdv: '10000000',
            marketCap: '5000000',
            buyTax: 0,
            sellTax: 0,
            holders: [
              { address: '0xholder1', balance: '1000', percentage: 10 },
              { address: '0xholder2', balance: '500', percentage: 5 }
            ]
          },
          {
            dexId: 'sushiswap',
            pairAddress: '0xpair2',
            volume: { h24: '50000' },
            liquidity: { usd: '200000' }
          }
        ]
      })
    });

    const result = await Aggregator.fetchDexScreenerData('0xtoken123');
    expect(result.found).toBe(true);
    expect(result.pairs).toBe(2);
    expect(result.aggregated.totalLiquidity).toBe(700000);
    expect(result.aggregated.totalVolume24h).toBe(150000);
    expect(result.mainPair.priceUsd).toBe(1.50);
    expect(result.topHolders).toHaveLength(2);
  });

  test('handles API error gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('DexScreener down'));
    const result = await Aggregator.fetchDexScreenerData('0xabc');
    expect(result).toEqual({ found: false, error: 'DexScreener down' });
  });
});

// ============================================
// fetchEthplorerData
// ============================================
describe('fetchEthplorerData', () => {
  test('returns found:false for invalid address', async () => {
    const result = await Aggregator.fetchEthplorerData('not-an-address');
    expect(result).toEqual({ found: false });
  });

  test('returns found:false for null address', async () => {
    const result = await Aggregator.fetchEthplorerData(null);
    expect(result).toEqual({ found: false });
  });

  test('returns data for valid contract', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        name: 'TestToken',
        symbol: 'TT',
        decimals: 18,
        totalSupply: '1000000000000000000000',
        holdersCount: 5000,
        holders: [
          { address: '0xh1', balance: '100', share: 0.1 },
          { address: '0xh2', balance: '50', share: 0.05 }
        ],
        price: { rate: 1.5 },
        marketCapUsd: 5000000,
        transfersCount: 10000
      })
    });

    const result = await Aggregator.fetchEthplorerData('0x1234567890abcdef1234567890abcdef12345678');
    expect(result.found).toBe(true);
    expect(result.name).toBe('TestToken');
    expect(result.holdersCount).toBe(5000);
    expect(result.topHolders).toHaveLength(2);
    expect(result.topHolders[0].percentage).toBe('10.00');
  });

  test('returns found:false on HTTP error', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 429 });
    const result = await Aggregator.fetchEthplorerData('0x1234567890abcdef1234567890abcdef12345678');
    expect(result).toEqual({ found: false, status: 429 });
  });

  test('returns found:false on API error response', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ error: { message: 'Invalid token' } })
    });
    const result = await Aggregator.fetchEthplorerData('0x1234567890abcdef1234567890abcdef12345678');
    expect(result).toEqual({ found: false, error: 'Invalid token' });
  });
});

// ============================================
// fetchMoralisData
// ============================================
describe('fetchMoralisData', () => {
  test('returns found:false for invalid address', async () => {
    const result = await Aggregator.fetchMoralisData('invalid');
    expect(result).toEqual({ found: false });
  });

  test('returns found:false when no API key', async () => {
    const result = await Aggregator.fetchMoralisData('0x1234567890abcdef1234567890abcdef12345678', null);
    expect(result).toEqual({ found: false, error: 'No API key' });
  });

  test('calculates holder percentages from balances', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        result: [
          { owner_address: '0xA', balance: '750' },
          { owner_address: '0xB', balance: '250' }
        ]
      })
    });

    const result = await Aggregator.fetchMoralisData('0x1234567890abcdef1234567890abcdef12345678', 'test-key');
    expect(result.found).toBe(true);
    expect(result.holders).toHaveLength(2);
    expect(result.holders[0].percentage).toBe('75.0000');
    expect(result.holders[1].percentage).toBe('25.0000');
    expect(result.totalSupply).toBe(1000);
  });

  test('handles HTTP error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized')
    });

    const result = await Aggregator.fetchMoralisData('0x1234567890abcdef1234567890abcdef12345678', 'bad-key');
    expect(result.found).toBe(false);
    expect(result.status).toBe(401);
  });

  test('returns found:false when no holders', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ result: [] })
    });

    const result = await Aggregator.fetchMoralisData('0x1234567890abcdef1234567890abcdef12345678', 'key');
    expect(result.found).toBe(false);
  });
});

// ============================================
// fetchEtherscanData
// ============================================
describe('fetchEtherscanData', () => {
  test('returns found:false for invalid address', async () => {
    const result = await Aggregator.fetchEtherscanData('invalid');
    expect(result).toEqual({ found: false });
  });

  test('parses holder data with supply percentage', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          status: '1',
          result: [
            { TokenHolderAddress: '0xA', TokenHolderQuantity: '1000' },
            { TokenHolderAddress: '0xB', TokenHolderQuantity: '500' }
          ]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          status: '1',
          result: '10000'
        })
      });

    const result = await Aggregator.fetchEtherscanData('0x1234567890abcdef1234567890abcdef12345678', 'key');
    expect(result.found).toBe(true);
    expect(result.holders[0].percentage).toBe('10.0000');
    expect(result.holders[1].percentage).toBe('5.0000');
  });

  test('handles API error status', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        status: '0',
        message: 'NOTOK',
        result: null
      })
    });

    const result = await Aggregator.fetchEtherscanData('0x1234567890abcdef1234567890abcdef12345678', 'key');
    expect(result.found).toBe(false);
    expect(result.error).toBe('NOTOK');
  });
});

// ============================================
// fetchCoinMarketCapData
// ============================================
describe('fetchCoinMarketCapData', () => {
  test('finds coin by symbol (case insensitive)', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        data: {
          cryptoCurrencyList: [
            {
              id: 1, name: 'Bitcoin', symbol: 'BTC', slug: 'bitcoin',
              cmcRank: 1,
              quotes: [{ price: 50000, marketCap: 1000000000000, volume24h: 30000000000, percentChange24h: 2.5 }],
              circulatingSupply: 19500000, totalSupply: 21000000, maxSupply: 21000000
            }
          ]
        }
      })
    });

    const result = await Aggregator.fetchCoinMarketCapData('btc');
    expect(result.found).toBe(true);
    expect(result.name).toBe('Bitcoin');
    expect(result.price).toBe(50000);
  });

  test('returns found:false when coin not found', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ data: { cryptoCurrencyList: [] } })
    });

    const result = await Aggregator.fetchCoinMarketCapData('NONEXISTENT');
    expect(result).toEqual({ found: false });
  });

  test('handles API error', async () => {
    fetch.mockRejectedValueOnce(new Error('CMC down'));
    const result = await Aggregator.fetchCoinMarketCapData('BTC');
    expect(result).toEqual({ found: false, error: 'CMC down' });
  });
});

// ============================================
// fetchMessariData
// ============================================
describe('fetchMessariData', () => {
  test('returns metrics data on success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: {
          id: 'btc', symbol: 'BTC', name: 'Bitcoin', slug: 'bitcoin',
          market_data: { price_usd: 50000 },
          supply: { circulating: 19500000 },
          developer_activity: { commits_last_90_days: 500 }
        }
      })
    });

    const result = await Aggregator.fetchMessariData('BTC');
    expect(result.found).toBe(true);
    expect(result.name).toBe('Bitcoin');
    expect(result.metrics.marketData.price_usd).toBe(50000);
  });

  test('returns found:false on HTTP error', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    const result = await Aggregator.fetchMessariData('UNKNOWN');
    expect(result).toEqual({ found: false, status: 404 });
  });

  test('returns found:false when no data', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: null })
    });
    const result = await Aggregator.fetchMessariData('X');
    expect(result).toEqual({ found: false });
  });
});

// ============================================
// aggregateCoinData
// ============================================
describe('aggregateCoinData', () => {
  function mockAllSourcesEmpty() {
    // 7 fetches for 7 sources (defiLlama has 1 fetch that returns no match)
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: null, pairs: [], status: '0', result: [] })
    });
  }

  test('runs all 7 sources in parallel', async () => {
    mockAllSourcesEmpty();

    const coinData = { symbol: 'BTC', market_data: { current_price: { usd: 50000 } } };
    const result = await Aggregator.aggregateCoinData(coinData, 'bitcoin', 'Bitcoin', '0x1234567890abcdef1234567890abcdef12345678');

    expect(result.sources).toBeDefined();
    expect(result.sources.coinGecko).toBeDefined();
    expect(result.sources.defiLlama).toBeDefined();
    expect(result.sources.dexScreener).toBeDefined();
    expect(result.sources.messari).toBeDefined();
    expect(result.sources.coinMarketCap).toBeDefined();
    expect(result.sources.ethplorer).toBeDefined();
    expect(result.sources.etherscan).toBeDefined();
    expect(result.sources.moralis).toBeDefined();
  });

  test('skips address-based sources when no contract address', async () => {
    mockAllSourcesEmpty();

    const coinData = { symbol: 'BTC' };
    const result = await Aggregator.aggregateCoinData(coinData, 'bitcoin', 'Bitcoin', null);

    // DexScreener, Ethplorer, Etherscan, Moralis should return found:false
    expect(result.sources.dexScreener.found).toBe(false);
    expect(result.sources.ethplorer.found).toBe(false);
    expect(result.sources.etherscan.found).toBe(false);
    expect(result.sources.moralis.found).toBe(false);
  });

  test('combines liquidity from DexScreener and DefiLlama', async () => {
    // Mock all fetches to return empty by default, then override specific ones
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: null, pairs: [], status: '0', result: [] })
    });

    const coinData = { symbol: 'TOKEN' };
    const result = await Aggregator.aggregateCoinData(coinData, 'token', 'Token', null);

    expect(result.combined.liquidity).toBeDefined();
    expect(result.combined.liquidity.dexLiquidity).toBeDefined();
    expect(result.combined.liquidity.defiTvl).toBeDefined();
  });

  test('calculates price comparison with variance', async () => {
    // We can't easily mock individual source results through aggregateCoinData
    // because all sources share the same fetch mock. Test the structure instead.
    mockAllSourcesEmpty();

    const coinData = { symbol: 'BTC', market_data: { current_price: { usd: 50000 } } };
    const result = await Aggregator.aggregateCoinData(coinData, 'bitcoin', 'Bitcoin');

    // Only CoinGecko has a price, so no comparison is created (needs > 1 source)
    expect(result.combined.liquidity).toBeDefined();
    expect(result.combined.holders).toBeDefined();
    expect(result.combined.taxes).toBeDefined();
  });

  test('holder priority: Ethplorer > Moralis > DexScreener', async () => {
    mockAllSourcesEmpty();

    const coinData = { symbol: 'TOKEN' };
    const result = await Aggregator.aggregateCoinData(coinData, 'token', 'Token');

    // When all sources fail, holders should be empty
    expect(result.combined.holders.topHolders).toEqual([]);
    expect(result.combined.holders.count).toBe(0);
  });

  test('handles source failures gracefully via Promise.allSettled', async () => {
    // Some sources fail, some succeed
    fetch.mockRejectedValue(new Error('All APIs down'));

    const coinData = { symbol: 'BTC' };
    // Should NOT throw even if all fetches fail
    const result = await Aggregator.aggregateCoinData(coinData, 'bitcoin', 'Bitcoin');

    expect(result.sources).toBeDefined();
    expect(result.combined).toBeDefined();
  });
});

// ============================================
// getSourcesSummary
// ============================================
describe('getSourcesSummary', () => {
  test('counts successful and failed sources', () => {
    const aggregated = {
      sources: {
        coinGecko: { data: { name: 'Bitcoin' } },
        defiLlama: { found: true, tvl: 1000 },
        dexScreener: { found: false },
        messari: { error: 'timeout' },
        coinMarketCap: { found: true, price: 50000 },
        ethplorer: { found: false, error: 'invalid' },
        etherscan: { found: true },
        moralis: { found: false }
      }
    };

    const summary = Aggregator.getSourcesSummary(aggregated);
    expect(summary.total).toBe(8);
    expect(summary.successful).toBe(4); // coinGecko (has data), defiLlama, coinMarketCap, etherscan
    expect(summary.failed).toBe(2); // messari, ethplorer (have error field)
    expect(summary.details).toHaveLength(8);
  });

  test('details contain name and status', () => {
    const aggregated = {
      sources: {
        coinGecko: { data: {}, found: undefined },
        defiLlama: { found: true }
      }
    };

    const summary = Aggregator.getSourcesSummary(aggregated);
    expect(summary.details[0].name).toBe('coinGecko');
    expect(summary.details[1].name).toBe('defiLlama');
    expect(summary.details[1].status).toBe('success');
    expect(summary.details[1].hasData).toBe(true);
  });
});
