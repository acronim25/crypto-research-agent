// ============================================
// Tests for api/history.js
// ============================================

jest.mock('../../lib/db', () => ({
  all: jest.fn(),
  logAction: jest.fn().mockResolvedValue(undefined)
}));

const handler = require('../../api/history');
const { all, logAction } = require('../../lib/db');

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

describe('GET /api/history', () => {
  test('returns 200 with OPTIONS (CORS preflight)', async () => {
    const { req, res } = createMocks('OPTIONS');
    await handler(req, res);
    expect(res.statusCode).toBe(200);
  });

  test('returns 405 for non-GET methods', async () => {
    const { req, res } = createMocks('POST');
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  test('returns paginated results', async () => {
    const mockResearches = [
      { id: 'r1', ticker: 'BTC', name: 'Bitcoin', risk_score: 3, risk_class: 'low', created_at: '2026-01-01' },
      { id: 'r2', ticker: 'ETH', name: 'Ethereum', risk_score: 5, risk_class: 'medium', created_at: '2026-01-02' }
    ];

    all
      .mockResolvedValueOnce(mockResearches) // main query
      .mockResolvedValueOnce([{ total: 10 }]); // count query

    const { req, res } = createMocks('GET', {});
    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.researches).toHaveLength(2);
    expect(res.body.data.pagination.total).toBe(10);
  });

  test('formats response fields correctly', async () => {
    all
      .mockResolvedValueOnce([{
        id: 'r1', ticker: 'BTC', name: 'Bitcoin',
        risk_score: 3, risk_class: 'low', created_at: '2026-01-01',
        description: 'should not appear', address: 'should not appear'
      }])
      .mockResolvedValueOnce([{ total: 1 }]);

    const { req, res } = createMocks('GET', {});
    await handler(req, res);

    const research = res.body.data.researches[0];
    expect(research).toEqual({
      id: 'r1',
      ticker: 'BTC',
      name: 'Bitcoin',
      risk_score: 3,
      risk_class: 'low',
      created_at: '2026-01-01'
    });
    // Should NOT include extra fields
    expect(research.description).toBeUndefined();
    expect(research.address).toBeUndefined();
  });

  test('applies ticker filter', async () => {
    all
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 0 }]);

    const { req, res } = createMocks('GET', { ticker: 'BTC' });
    await handler(req, res);

    expect(all).toHaveBeenCalledWith(
      expect.stringContaining('ticker LIKE'),
      expect.arrayContaining(['%BTC%'])
    );
  });

  test('applies risk class filter', async () => {
    all
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 0 }]);

    const { req, res } = createMocks('GET', { risk: 'high' });
    await handler(req, res);

    expect(all).toHaveBeenCalledWith(
      expect.stringContaining('risk_class = ?'),
      expect.arrayContaining(['high'])
    );
  });

  test('ignores risk filter when set to "all"', async () => {
    all
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 0 }]);

    const { req, res } = createMocks('GET', { risk: 'all' });
    await handler(req, res);

    expect(all).toHaveBeenCalledWith(
      expect.not.stringContaining('risk_class'),
      expect.any(Array)
    );
  });

  test('supports sort by risk', async () => {
    all
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 0 }]);

    const { req, res } = createMocks('GET', { sort: 'risk', order: 'asc' });
    await handler(req, res);

    expect(all).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY risk_score ASC'),
      expect.any(Array)
    );
  });

  test('defaults to sorting by date DESC', async () => {
    all
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 0 }]);

    const { req, res } = createMocks('GET', {});
    await handler(req, res);

    expect(all).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY created_at DESC'),
      expect.any(Array)
    );
  });

  test('pagination uses limit and offset', async () => {
    all
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 100 }]);

    const { req, res } = createMocks('GET', { limit: '10', offset: '20' });
    await handler(req, res);

    expect(all).toHaveBeenCalledWith(
      expect.stringContaining('LIMIT ? OFFSET ?'),
      expect.arrayContaining([10, 20])
    );
  });

  test('has_more is true when more results exist', async () => {
    all
      .mockResolvedValueOnce([{ id: 'r1', ticker: 'BTC', name: 'BTC', risk_score: 3, risk_class: 'low', created_at: '' }])
      .mockResolvedValueOnce([{ total: 100 }]);

    const { req, res } = createMocks('GET', { limit: '1', offset: '0' });
    await handler(req, res);

    expect(res.body.data.pagination.has_more).toBe(true);
  });

  test('has_more is false at end of results', async () => {
    all
      .mockResolvedValueOnce([{ id: 'r1', ticker: 'BTC', name: 'BTC', risk_score: 3, risk_class: 'low', created_at: '' }])
      .mockResolvedValueOnce([{ total: 1 }]);

    const { req, res } = createMocks('GET', { limit: '50', offset: '0' });
    await handler(req, res);

    expect(res.body.data.pagination.has_more).toBe(false);
  });

  test('returns 500 on internal error', async () => {
    all.mockRejectedValue(new Error('DB crashed'));

    const { req, res } = createMocks('GET', {});
    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  test('logs history view action', async () => {
    all
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 0 }]);

    const { req, res } = createMocks('GET', { ticker: 'BTC' });
    await handler(req, res);

    expect(logAction).toHaveBeenCalledWith(
      'history_view',
      expect.objectContaining({ filters: { ticker: 'BTC' } }),
      expect.any(Object)
    );
  });
});
