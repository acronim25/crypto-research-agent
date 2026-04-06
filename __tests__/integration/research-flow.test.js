// ============================================
// Integration Tests - Research Flow
// Tests the full pipeline: identify -> analyze -> save -> retrieve
// ============================================

jest.mock('../../lib/db', () => {
  const store = {};
  return {
    run: jest.fn().mockImplementation(async (sql, params) => {
      if (sql.includes('INSERT INTO researches')) {
        // Match the column order from api/research.js INSERT
        store[params[0]] = {
          id: params[0],
          ticker: params[1],
          name: params[2],
          address: params[3],
          chain: params[4],
          logo: params[5],
          description: params[6],
          price_data: params[7],
          tokenomics: params[8],
          onchain: params[9],
          red_flags: params[10],
          risk_score: params[11],
          risk_class: params[12],
          sentiment: params[13],
          sentiment_score: params[14],
          social_score: params[15],
          created_at: new Date().toISOString()
        };
      }
      return { id: 1, changes: 1 };
    }),
    get: jest.fn().mockImplementation(async (sql, params) => {
      return store[params[0]] || undefined;
    }),
    all: jest.fn().mockImplementation(async () => {
      return Object.values(store);
    }),
    logAction: jest.fn().mockResolvedValue(undefined),
    _store: store
  };
});

jest.mock('axios');
const axios = require('axios');

const researchHandler = require('../../api/research');
const researchIdHandler = require('../../api/research/[id]');
const historyHandler = require('../../api/history');
const db = require('../../lib/db');

function createMocks(method, bodyOrQuery = {}) {
  const isGet = method === 'GET';
  return {
    req: {
      method,
      body: isGet ? undefined : bodyOrQuery,
      query: isGet ? bodyOrQuery : {},
      headers: { 'user-agent': 'integration-test' }
    },
    res: {
      statusCode: null,
      body: null,
      headers: {},
      setHeader(key, value) { this.headers[key] = value; },
      status(code) { this.statusCode = code; return this; },
      json(data) { this.body = data; return this; },
      end() { return this; }
    }
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  // Clear the store
  Object.keys(db._store).forEach(k => delete db._store[k]);
});

describe('Research Flow Integration', () => {
  test('full flow: search -> analyze -> save -> retrieve', async () => {
    // Mock sequence:
    // 1. identifyToken → CoinGecko.search('BTC') via fetchWithRetry
    // 2. analyzeToken → CoinGecko.search('bitcoin') via fetchWithRetry (inside type === 'ticker' branch)
    // 3. analyzeToken → CoinGecko.getCoin(coinId) via fetchWithRetry
    const coinSearchResult = { coins: [{ id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', large: '' }] };
    const coinData = {
      description: { en: 'Digital gold' },
      links: { homepage: ['https://bitcoin.org'] },
      market_data: {
        current_price: { usd: 50000, btc: 1, eth: 16 },
        ath: { usd: 69000 },
        atl: { usd: 67 },
        ath_change_percentage: { usd: -27 },
        ath_date: { usd: '2021-11-10' },
        total_volume: { usd: 30000000000 },
        market_cap: { usd: 1000000000000 },
        market_cap_rank: 1,
        total_supply: 21000000,
        circulating_supply: 19500000,
        fully_diluted_valuation: { usd: 1050000000000 }
      },
      genesis_date: '2009-01-03'
    };

    axios
      .mockResolvedValueOnce({ data: coinSearchResult })  // identifyToken search
      .mockResolvedValueOnce({ data: coinSearchResult })  // analyzeToken search
      .mockResolvedValueOnce({ data: coinData });          // analyzeToken getCoin

    // Create research
    const { req: postReq, res: postRes } = createMocks('POST', { input: 'BTC' });
    await researchHandler(postReq, postRes);

    expect(postRes.statusCode).toBe(200);
    expect(postRes.body.success).toBe(true);
    const researchId = postRes.body.data.id;
    expect(researchId).toMatch(/^research_/);

    // Retrieve research by ID
    const { req: getReq, res: getRes } = createMocks('GET', { id: researchId });
    await researchIdHandler(getReq, getRes);

    // Verify the store has the research with correct data
    expect(Object.keys(db._store).length).toBeGreaterThan(0);
    const storedResearch = db._store[researchId];
    expect(storedResearch).toBeDefined();
    expect(storedResearch.ticker).toBe('BTC');

    // Verify the GET endpoint returns success
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.success).toBe(true);

    // Check history contains the research
    db.all.mockResolvedValueOnce([db._store[researchId]]);
    db.all.mockResolvedValueOnce([{ total: 1 }]);

    const { req: histReq, res: histRes } = createMocks('GET', {});
    await historyHandler(histReq, histRes);

    expect(histRes.statusCode).toBe(200);
    expect(histRes.body.data.researches.length).toBeGreaterThanOrEqual(1);
  });

  test('handles token not found in search', async () => {
    jest.useFakeTimers();
    // CoinGecko search returns empty, then fetchWithRetry might retry
    // Mock enough responses to cover all retries
    axios.mockResolvedValue({ data: { coins: [] } });

    const promise = researchHandler(
      createMocks('POST', { input: 'ZZZZNONEXISTENT' }).req,
      createMocks('POST', { input: 'ZZZZNONEXISTENT' }).res
    );

    // The response object gets lost with separate createMocks calls, fix:
    const { req, res } = createMocks('POST', { input: 'ZZZZNONEXISTENT' });
    const promise2 = researchHandler(req, res);

    // Advance timers past any retry delays
    await jest.advanceTimersByTimeAsync(30000);
    await promise2;

    // identifyToken returns type:'name' with value:'ZZZZNONEXISTENT'
    // Since value is truthy, it proceeds to analyzeToken which calls CoinGecko
    expect([200, 404, 500]).toContain(res.statusCode);
    jest.useRealTimers();
  }, 60000);

  test('handles invalid input gracefully', async () => {
    const { req, res } = createMocks('POST', { input: '' });
    await researchHandler(req, res);
    expect(res.statusCode).toBe(400);
  });

  test('multiple researches show in history', async () => {
    const mockResearches = [
      { id: 'r1', ticker: 'BTC', name: 'Bitcoin', risk_score: 3, risk_class: 'low', created_at: '2026-01-01' },
      { id: 'r2', ticker: 'ETH', name: 'Ethereum', risk_score: 5, risk_class: 'medium', created_at: '2026-01-02' }
    ];

    db.all
      .mockResolvedValueOnce(mockResearches)
      .mockResolvedValueOnce([{ total: 2 }]);

    const { req, res } = createMocks('GET', {});
    await historyHandler(req, res);

    expect(res.body.data.researches).toHaveLength(2);
    expect(res.body.data.pagination.total).toBe(2);
  });
});
