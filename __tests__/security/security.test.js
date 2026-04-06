// ============================================
// Security Tests
// SQL Injection, XSS, Input Validation, API Key Exposure
// ============================================

jest.mock('../../lib/db', () => ({
  run: jest.fn().mockResolvedValue({ id: 1, changes: 1 }),
  get: jest.fn(),
  all: jest.fn(),
  logAction: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../../lib/apis', () => ({
  identifyToken: jest.fn()
}));

jest.mock('../../lib/analyzer', () => ({
  analyzeToken: jest.fn()
}));

const historyHandler = require('../../api/history');
const researchHandler = require('../../api/research');
const { all } = require('../../lib/db');
const { identifyToken } = require('../../lib/apis');

function createMocks(method, bodyOrQuery = {}) {
  const isGet = method === 'GET';
  return {
    req: {
      method,
      body: isGet ? undefined : bodyOrQuery,
      query: isGet ? bodyOrQuery : {},
      headers: { 'user-agent': 'security-test' }
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

// ============================================
// SQL Injection Tests
// ============================================
describe('SQL Injection Prevention', () => {
  test('ticker filter uses parameterized query (LIKE ?)', async () => {
    all
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 0 }]);

    const maliciousInput = "'; DROP TABLE researches; --";
    const { req, res } = createMocks('GET', { ticker: maliciousInput });
    await historyHandler(req, res);

    // Verify the SQL uses parameterized query, not string concatenation
    const sqlCall = all.mock.calls[0];
    expect(sqlCall[0]).toContain('ticker LIKE ?');
    // The parameter should be the escaped value, not raw SQL
    expect(sqlCall[1]).toContain(`%${maliciousInput}%`);
    expect(res.statusCode).toBe(200);
  });

  test('risk filter uses parameterized query', async () => {
    all
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 0 }]);

    const maliciousRisk = "low' OR '1'='1";
    const { req, res } = createMocks('GET', { risk: maliciousRisk });
    await historyHandler(req, res);

    const sqlCall = all.mock.calls[0];
    expect(sqlCall[0]).toContain('risk_class = ?');
    expect(sqlCall[1]).toContain(maliciousRisk);
  });

  test('limit/offset are parsed as integers', async () => {
    all
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 0 }]);

    const { req, res } = createMocks('GET', {
      limit: '10; DROP TABLE researches',
      offset: "0' OR '1'='1"
    });
    await historyHandler(req, res);

    // parseInt('10; DROP TABLE...') = 10
    // parseInt("0' OR...") = 0
    const sqlCall = all.mock.calls[0];
    const params = sqlCall[1];
    const limit = params[params.length - 2];
    const offset = params[params.length - 1];
    expect(typeof limit).toBe('number');
    expect(typeof offset).toBe('number');
    expect(limit).toBe(10);
    expect(offset).toBe(0);
  });

  test('sort parameter only accepts whitelisted values', async () => {
    all
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 0 }]);

    // Attempt to inject via sort parameter
    const { req, res } = createMocks('GET', { sort: 'risk_score; DROP TABLE researches' });
    await historyHandler(req, res);

    const sqlCall = all.mock.calls[0];
    // The sort logic maps 'risk' -> 'risk_score', anything else -> 'created_at'
    // Since input doesn't match 'risk', it should default to 'created_at'
    expect(sqlCall[0]).toContain('ORDER BY created_at');
    expect(res.statusCode).toBe(200);
  });

  test('order parameter only accepts ASC/DESC', async () => {
    all
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 0 }]);

    const { req, res } = createMocks('GET', { order: 'asc; DROP TABLE users' });
    await historyHandler(req, res);

    const sqlCall = all.mock.calls[0];
    // order !== 'asc' exactly (has extra chars), so defaults to DESC
    expect(sqlCall[0]).toContain('DESC');
  });
});

// ============================================
// XSS Prevention Tests
// ============================================
describe('XSS Prevention', () => {
  test('research input with script tags is treated as string', async () => {
    identifyToken.mockResolvedValue({ type: 'name', value: '' });

    const xssInput = '<script>alert("xss")</script>';
    const { req, res } = createMocks('POST', { input: xssInput });
    await researchHandler(req, res);

    // The input should be treated as a string, not executed
    // Token won't be found, so 404
    expect(res.statusCode).toBe(404);
  });

  test('research input with event handlers is treated as string', async () => {
    identifyToken.mockResolvedValue({ type: 'name', value: '' });

    const xssInput = '<img onerror=alert(1) src=x>';
    const { req, res } = createMocks('POST', { input: xssInput });
    await researchHandler(req, res);

    expect(res.statusCode).toBe(404);
  });

  test('history ticker filter with HTML is parameterized', async () => {
    all
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 0 }]);

    const xssInput = '<img src=x onerror=alert(1)>';
    const { req, res } = createMocks('GET', { ticker: xssInput });
    await historyHandler(req, res);

    // Input is passed as SQL parameter, not interpolated
    expect(all.mock.calls[0][1]).toContain(`%${xssInput}%`);
    expect(res.statusCode).toBe(200);
  });
});

// ============================================
// Input Validation Tests
// ============================================
describe('Input Validation', () => {
  test('rejects non-string input', async () => {
    const { req, res } = createMocks('POST', { input: 12345 });
    await researchHandler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('rejects null input', async () => {
    const { req, res } = createMocks('POST', { input: null });
    await researchHandler(req, res);
    expect(res.statusCode).toBe(400);
  });

  test('rejects undefined input', async () => {
    const { req, res } = createMocks('POST', {});
    await researchHandler(req, res);
    expect(res.statusCode).toBe(400);
  });

  test('rejects empty string input', async () => {
    const { req, res } = createMocks('POST', { input: '' });
    await researchHandler(req, res);
    expect(res.statusCode).toBe(400);
  });

  test('rejects array input', async () => {
    const { req, res } = createMocks('POST', { input: ['BTC'] });
    await researchHandler(req, res);
    expect(res.statusCode).toBe(400);
  });

  test('rejects object input', async () => {
    const { req, res } = createMocks('POST', { input: { ticker: 'BTC' } });
    await researchHandler(req, res);
    expect(res.statusCode).toBe(400);
  });

  test('handles very long input string', async () => {
    identifyToken.mockResolvedValue({ type: 'name', value: '' });
    const longInput = 'A'.repeat(10000);
    const { req, res } = createMocks('POST', { input: longInput });
    await researchHandler(req, res);
    // Should not crash; returns 404 (token not found)
    expect([400, 404, 500]).toContain(res.statusCode);
  });
});

// ============================================
// API Key Exposure Tests
// ============================================
describe('API Key Exposure', () => {
  const fs = require('fs');
  const path = require('path');

  test('API routes do not expose API keys in responses', async () => {
    all
      .mockResolvedValueOnce([{ id: 'r1', ticker: 'BTC', name: 'Bitcoin', risk_score: 3, risk_class: 'low', created_at: '' }])
      .mockResolvedValueOnce([{ total: 1 }]);

    const { req, res } = createMocks('GET', {});
    await historyHandler(req, res);

    const responseStr = JSON.stringify(res.body);
    // Should not contain any API key patterns
    expect(responseStr).not.toMatch(/api[_-]?key/i);
    expect(responseStr).not.toMatch(/apikey/i);
    expect(responseStr).not.toMatch(/secret/i);
  });

  test('error responses do not leak stack traces in production-like format', async () => {
    all.mockRejectedValue(new Error('Database connection failed'));

    const { req, res } = createMocks('GET', {});
    await historyHandler(req, res);

    expect(res.statusCode).toBe(500);
    // Error response should use generic message, not the actual error
    expect(res.body.error.message).not.toContain('Database connection failed');
    expect(res.body.error.message).toContain('Eroare internă');
  });
});

// ============================================
// CORS Configuration Tests
// ============================================
describe('CORS Configuration', () => {
  test('history endpoint sets CORS headers', async () => {
    all.mockResolvedValueOnce([]).mockResolvedValueOnce([{ total: 0 }]);

    const { req, res } = createMocks('GET', {});
    await historyHandler(req, res);

    expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(res.headers['Access-Control-Allow-Methods']).toContain('GET');
  });

  test('research endpoint sets CORS headers', async () => {
    const { req, res } = createMocks('POST', { input: 'test' });
    identifyToken.mockResolvedValue({ type: 'name', value: '' });
    await researchHandler(req, res);

    expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(res.headers['Access-Control-Allow-Methods']).toContain('POST');
  });

  test('OPTIONS preflight returns 200', async () => {
    const { req, res } = createMocks('OPTIONS');
    await historyHandler(req, res);
    expect(res.statusCode).toBe(200);
  });
});

// ============================================
// HTTP Method Enforcement
// ============================================
describe('HTTP Method Enforcement', () => {
  test('research endpoint rejects GET', async () => {
    const { req, res } = createMocks('GET');
    req.query = {};
    await researchHandler(req, res);
    expect(res.statusCode).toBe(405);
  });

  test('research endpoint rejects PUT', async () => {
    const { req, res } = createMocks('PUT');
    req.body = { input: 'BTC' };
    await researchHandler(req, res);
    expect(res.statusCode).toBe(405);
  });

  test('research endpoint rejects DELETE', async () => {
    const { req, res } = createMocks('DELETE');
    req.body = {};
    await researchHandler(req, res);
    expect(res.statusCode).toBe(405);
  });

  test('history endpoint rejects POST', async () => {
    const { req, res } = createMocks('POST');
    await historyHandler(req, res);
    expect(res.statusCode).toBe(405);
  });

  test('history endpoint rejects DELETE', async () => {
    const { req, res } = createMocks('DELETE');
    req.query = {};
    await historyHandler(req, res);
    expect(res.statusCode).toBe(405);
  });
});
