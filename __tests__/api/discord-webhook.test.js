// ============================================
// Tests for api/webhook/discord.js
// ============================================

jest.mock('axios');
jest.mock('../../lib/db', () => ({
  logAction: jest.fn().mockResolvedValue(undefined)
}));

const axios = require('axios');
const handler = require('../../api/webhook/discord');
const { logAction } = require('../../lib/db');

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

describe('POST /api/webhook/discord', () => {
  test('returns 200 with OPTIONS', async () => {
    const { req, res } = createMocks('OPTIONS');
    await handler(req, res);
    expect(res.statusCode).toBe(200);
  });

  test('returns 405 for non-POST methods', async () => {
    const { req, res } = createMocks('GET');
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  test('returns 400 when token is missing', async () => {
    const { req, res } = createMocks('POST', {});
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toContain('Token is required');
  });

  test('sends embed to Discord on success', async () => {
    axios.post.mockResolvedValue({ data: { id: 'discord-msg-123' } });

    const { req, res } = createMocks('POST', {
      token: 'BTC',
      alert_type: 'research_share',
      risk_score: 3,
      risk_class: 'low',
      research_url: 'https://example.com/research/1'
    });
    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.discord_message_id).toBe('discord-msg-123');

    // Verify Discord payload structure
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        embeds: expect.arrayContaining([
          expect.objectContaining({
            title: expect.stringContaining('BTC'),
            fields: expect.any(Array)
          })
        ])
      })
    );
  });

  test('uses correct color for each risk class', async () => {
    axios.post.mockResolvedValue({ data: {} });

    const riskColors = {
      low: 0x22C55E,
      medium: 0xF59E0B,
      high: 0xEF4444,
      extreme: 0x450A0A
    };

    for (const [riskClass, expectedColor] of Object.entries(riskColors)) {
      const { req, res } = createMocks('POST', {
        token: 'TEST',
        risk_class: riskClass
      });
      await handler(req, res);

      const embed = axios.post.mock.calls.at(-1)[1].embeds[0];
      expect(embed.color).toBe(expectedColor);
    }
  });

  test('price_spike alert type mentions @everyone', async () => {
    axios.post.mockResolvedValue({ data: {} });

    const { req, res } = createMocks('POST', {
      token: 'BTC',
      alert_type: 'price_spike',
      change_percent: '+50%'
    });
    await handler(req, res);

    const payload = axios.post.mock.calls[0][1];
    expect(payload.content).toBe('@everyone');
  });

  test('research_share alert does NOT mention @everyone', async () => {
    axios.post.mockResolvedValue({ data: {} });

    const { req, res } = createMocks('POST', {
      token: 'BTC',
      alert_type: 'research_share'
    });
    await handler(req, res);

    const payload = axios.post.mock.calls[0][1];
    expect(payload.content).toBeUndefined();
  });

  test('includes price field when current_price is provided', async () => {
    axios.post.mockResolvedValue({ data: {} });

    const { req, res } = createMocks('POST', {
      token: 'BTC',
      current_price: '$50,000'
    });
    await handler(req, res);

    const embed = axios.post.mock.calls[0][1].embeds[0];
    const priceField = embed.fields.find(f => f.name === 'Preț Curent');
    expect(priceField).toBeDefined();
    expect(priceField.value).toBe('$50,000');
  });

  test('includes research URL field when provided', async () => {
    axios.post.mockResolvedValue({ data: {} });

    const { req, res } = createMocks('POST', {
      token: 'BTC',
      research_url: 'https://example.com/r/1'
    });
    await handler(req, res);

    const embed = axios.post.mock.calls[0][1].embeds[0];
    const urlField = embed.fields.find(f => f.name === 'Raport Complet');
    expect(urlField).toBeDefined();
    expect(urlField.value).toContain('https://example.com/r/1');
  });

  test('returns 500 when Discord API fails', async () => {
    axios.post.mockRejectedValue(new Error('Discord unavailable'));

    const { req, res } = createMocks('POST', { token: 'BTC' });
    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.code).toBe('DISCORD_ERROR');
  });

  test('logs webhook action on success', async () => {
    axios.post.mockResolvedValue({ data: {} });

    const { req, res } = createMocks('POST', {
      token: 'BTC',
      alert_type: 'research_share',
      research_id: 'r_123'
    });
    await handler(req, res);

    expect(logAction).toHaveBeenCalledWith(
      'discord_webhook',
      expect.objectContaining({ token: 'BTC', alert_type: 'research_share', research_id: 'r_123' }),
      expect.any(Object)
    );
  });
});
