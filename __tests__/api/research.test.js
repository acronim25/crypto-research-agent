// ============================================
// Tests for api/research.js
// ============================================

// Mock dependencies before requiring
jest.mock('../../lib/db', () => ({
  run: jest.fn().mockResolvedValue({ id: 1, changes: 1 }),
  get: jest.fn(),
  logAction: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../../lib/apis', () => ({
  identifyToken: jest.fn()
}));

jest.mock('../../lib/analyzer', () => ({
  analyzeToken: jest.fn()
}));

const handler = require('../../api/research');
const { run, logAction } = require('../../lib/db');
const { identifyToken } = require('../../lib/apis');
const { analyzeToken } = require('../../lib/analyzer');

// Helper to create mock req/res
function createMocks(method = 'POST', body = {}) {
  return {
    req: {
      method,
      body,
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

describe('POST /api/research', () => {
  test('returns 200 with OPTIONS (CORS preflight)', async () => {
    const { req, res } = createMocks('OPTIONS');
    await handler(req, res);
    expect(res.statusCode).toBe(200);
  });

  test('returns 405 for non-POST methods', async () => {
    const { req, res } = createMocks('GET');
    await handler(req, res);
    expect(res.statusCode).toBe(405);
    expect(res.body.success).toBe(false);
  });

  test('returns 400 when input is missing', async () => {
    const { req, res } = createMocks('POST', {});
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('returns 400 when input is not a string', async () => {
    const { req, res } = createMocks('POST', { input: 123 });
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('returns 404 when token not found', async () => {
    identifyToken.mockResolvedValue({ type: 'name', value: '' });

    const { req, res } = createMocks('POST', { input: 'unknowntoken' });
    await handler(req, res);
    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe('TOKEN_NOT_FOUND');
  });

  test('returns 200 with research data on success', async () => {
    identifyToken.mockResolvedValue({
      type: 'ticker',
      value: 'bitcoin',
      ticker: 'BTC',
      chain: null
    });

    analyzeToken.mockResolvedValue({
      token: { ticker: 'BTC', name: 'Bitcoin', logo: '', description: '' },
      price_data: { current_price: 50000 },
      tokenomics: { market_cap: 1000000000 },
      onchain: {},
      red_flags: [],
      analysis: {
        risk_score: 3,
        risk_class: 'low',
        sentiment: 'bullish',
        sentiment_score: 75,
        social_score: 50
      }
    });

    const { req, res } = createMocks('POST', { input: 'BTC' });
    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toMatch(/^research_/);
    expect(res.body.data.status).toBe('complete');
    expect(res.body.data.redirect_url).toContain('research.html');
  });

  test('saves research to database', async () => {
    identifyToken.mockResolvedValue({ type: 'ticker', value: 'eth' });
    analyzeToken.mockResolvedValue({
      token: { ticker: 'ETH', name: 'Ethereum' },
      price_data: {},
      tokenomics: {},
      onchain: {},
      red_flags: [],
      analysis: { risk_score: 4, risk_class: 'medium', sentiment: 'neutral', sentiment_score: 50, social_score: 30 }
    });

    const { req, res } = createMocks('POST', { input: 'ETH' });
    await handler(req, res);

    expect(run).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO researches'),
      expect.arrayContaining(['ETH', 'Ethereum'])
    );
  });

  test('logs the research request', async () => {
    identifyToken.mockResolvedValue({ type: 'ticker', value: 'btc' });
    analyzeToken.mockResolvedValue({
      token: { ticker: 'BTC' },
      price_data: {},
      tokenomics: {},
      onchain: {},
      red_flags: [],
      analysis: { risk_score: 5, risk_class: 'medium' }
    });

    const { req, res } = createMocks('POST', { input: 'BTC' });
    await handler(req, res);

    expect(logAction).toHaveBeenCalledWith(
      'research_request',
      expect.objectContaining({ input: 'BTC' }),
      expect.any(Object)
    );
  });

  test('returns 500 on internal error', async () => {
    identifyToken.mockRejectedValue(new Error('API crash'));

    const { req, res } = createMocks('POST', { input: 'BTC' });
    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  test('sets CORS headers', async () => {
    const { req, res } = createMocks('POST', { input: 'BTC' });
    identifyToken.mockResolvedValue({ type: 'name', value: '' });
    await handler(req, res);

    expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(res.headers['Access-Control-Allow-Methods']).toContain('POST');
  });
});
