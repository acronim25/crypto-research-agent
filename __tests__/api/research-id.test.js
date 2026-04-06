// ============================================
// Tests for api/research/[id].js
// ============================================

jest.mock('../../lib/db', () => ({
  get: jest.fn(),
  logAction: jest.fn().mockResolvedValue(undefined)
}));

const handler = require('../../api/research/[id]');
const { get, logAction } = require('../../lib/db');

function createMocks(method = 'GET', query = {}) {
  return {
    req: {
      method,
      query,
      headers: { 'user-agent': 'test' }
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
});

describe('GET /api/research/[id]', () => {
  test('returns 200 with OPTIONS', async () => {
    const { req, res } = createMocks('OPTIONS');
    await handler(req, res);
    expect(res.statusCode).toBe(200);
  });

  test('returns 405 for non-GET methods', async () => {
    const { req, res } = createMocks('POST');
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  test('returns 400 when id is missing', async () => {
    const { req, res } = createMocks('GET', {});
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('returns 404 when research not found', async () => {
    get.mockResolvedValue(undefined);

    const { req, res } = createMocks('GET', { id: 'nonexistent' });
    await handler(req, res);
    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe('RESEARCH_NOT_FOUND');
  });

  test('returns 200 with formatted research data', async () => {
    get.mockResolvedValue({
      id: 'research_123',
      ticker: 'BTC',
      name: 'Bitcoin',
      address: null,
      chain: null,
      logo: 'https://logo.png',
      description: 'A cryptocurrency',
      team: null,
      use_case: null,
      price_data: '{"current_price":50000,"ath":69000}',
      tokenomics: '{"market_cap":1000000000}',
      onchain: '{}',
      red_flags: '[{"check":"Test","passed":true,"severity":"low"}]',
      risk_score: 3,
      risk_class: 'low',
      sentiment: 'bullish',
      sentiment_score: 75,
      social_score: 50,
      created_at: '2026-01-01'
    });

    const { req, res } = createMocks('GET', { id: 'research_123' });
    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data.id).toBe('research_123');
    expect(data.token.ticker).toBe('BTC');
    expect(data.token.name).toBe('Bitcoin');
    expect(data.price_data.current_price).toBe(50000);
    expect(data.tokenomics.market_cap).toBe(1000000000);
    expect(data.red_flags).toHaveLength(1);
    expect(data.analysis.risk_score).toBe(3);
    expect(data.analysis.risk_class).toBe('low');
  });

  test('parses JSON fields from stored strings', async () => {
    get.mockResolvedValue({
      id: 'r1',
      ticker: 'ETH',
      name: 'Ethereum',
      price_data: '{"volume":5000000}',
      tokenomics: '{"total_supply":120000000}',
      onchain: '{"contract_verified":true}',
      red_flags: '[]',
      risk_score: 5,
      risk_class: 'medium',
      created_at: '2026-01-01'
    });

    const { req, res } = createMocks('GET', { id: 'r1' });
    await handler(req, res);

    expect(res.body.data.price_data.volume).toBe(5000000);
    expect(res.body.data.onchain.contract_verified).toBe(true);
  });

  test('handles null JSON fields gracefully', async () => {
    get.mockResolvedValue({
      id: 'r1',
      ticker: 'X',
      price_data: null,
      tokenomics: null,
      onchain: null,
      red_flags: null,
      risk_score: 5,
      created_at: '2026-01-01'
    });

    const { req, res } = createMocks('GET', { id: 'r1' });
    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.price_data).toEqual({});
    expect(res.body.data.red_flags).toEqual([]);
  });

  test('logs research view', async () => {
    get.mockResolvedValue({
      id: 'r1', ticker: 'BTC', price_data: '{}', tokenomics: '{}',
      onchain: '{}', red_flags: '[]', risk_score: 5, created_at: '2026-01-01'
    });

    const { req, res } = createMocks('GET', { id: 'r1' });
    await handler(req, res);

    expect(logAction).toHaveBeenCalledWith(
      'research_view',
      { research_id: 'r1' },
      expect.any(Object)
    );
  });

  test('returns 500 on database error', async () => {
    get.mockRejectedValue(new Error('DB connection lost'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const { req, res } = createMocks('GET', { id: 'r1' });
    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    consoleSpy.mockRestore();
  });

  test('sets CORS headers', async () => {
    get.mockResolvedValue(undefined);

    const { req, res } = createMocks('GET', { id: 'test' });
    await handler(req, res);

    expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
  });
});
