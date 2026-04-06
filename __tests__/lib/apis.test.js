// ============================================
// Tests for lib/apis.js
// ============================================

// We need to mock axios before requiring the module
jest.mock('axios');
const axios = require('axios');

// Clear rate limiter state between tests
beforeEach(() => {
  jest.clearAllMocks();
  // Reset the rateLimiters by re-requiring the module would be ideal,
  // but we can work around it by testing timing windows
});

// We need to access the private rateLimit function through identifyToken behavior
// and test fetchWithRetry/identifyToken as exported functions
const { fetchWithRetry, identifyToken, CoinGecko, CoinMarketCap, Etherscan } = require('../../lib/apis');

// ============================================
// fetchWithRetry
// ============================================
describe('fetchWithRetry', () => {
  test('returns data on successful first attempt', async () => {
    axios.mockResolvedValueOnce({ data: { result: 'ok' } });

    const result = await fetchWithRetry('https://api.example.com/data');
    expect(result).toEqual({ result: 'ok' });
    expect(axios).toHaveBeenCalledTimes(1);
  });

  test('retries on failure and succeeds', async () => {
    axios
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: { result: 'ok' } });

    const result = await fetchWithRetry('https://api.example.com/data', {}, 3, 10);
    expect(result).toEqual({ result: 'ok' });
    expect(axios).toHaveBeenCalledTimes(2);
  });

  test('throws after exhausting all retries', async () => {
    const error = new Error('Persistent failure');
    axios
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error);

    await expect(fetchWithRetry('https://api.example.com/data', {}, 3, 10))
      .rejects.toThrow('Persistent failure');
    expect(axios).toHaveBeenCalledTimes(3);
  });

  test('passes options to axios', async () => {
    axios.mockResolvedValueOnce({ data: {} });

    await fetchWithRetry('https://api.example.com', { headers: { 'X-Key': '123' } });
    expect(axios).toHaveBeenCalledWith({
      url: 'https://api.example.com',
      headers: { 'X-Key': '123' }
    });
  });

  test('respects custom retry count', async () => {
    const error = new Error('fail');
    axios.mockRejectedValue(error);

    await expect(fetchWithRetry('https://api.example.com', {}, 2, 10))
      .rejects.toThrow();
    expect(axios).toHaveBeenCalledTimes(2);
  });

  test('single retry (retries=1) throws immediately', async () => {
    axios.mockRejectedValueOnce(new Error('fail'));

    await expect(fetchWithRetry('https://api.example.com', {}, 1, 10))
      .rejects.toThrow('fail');
    expect(axios).toHaveBeenCalledTimes(1);
  });
});

// ============================================
// identifyToken
// ============================================
describe('identifyToken', () => {
  test('identifies Ethereum address', async () => {
    const result = await identifyToken('0x1234567890abcdef1234567890abcdef12345678');
    expect(result).toEqual({
      type: 'address',
      value: '0x1234567890abcdef1234567890abcdef12345678',
      chain: 'ethereum'
    });
  });

  test('identifies Ethereum address with uppercase hex', async () => {
    const result = await identifyToken('0xABCDEF1234567890ABCDEF1234567890ABCDEF12');
    expect(result).toEqual({
      type: 'address',
      value: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
      chain: 'ethereum'
    });
  });

  test('trims whitespace from input', async () => {
    const result = await identifyToken('  0x1234567890abcdef1234567890abcdef12345678  ');
    expect(result.type).toBe('address');
    expect(result.chain).toBe('ethereum');
  });

  test('identifies Solana address (base58, 32-44 chars)', async () => {
    // Typical Solana address: 32-44 base58 characters
    const result = await identifyToken('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
    expect(result.type).toBe('address');
    expect(result.chain).toBe('solana');
  });

  test('falls back to CoinGecko search for ticker input', async () => {
    axios.mockResolvedValueOnce({
      data: {
        coins: [{ id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' }]
      }
    });

    const result = await identifyToken('BTC');
    expect(result).toEqual({
      type: 'ticker',
      value: 'bitcoin',
      ticker: 'BTC',
      name: 'Bitcoin',
      source: 'coingecko'
    });
  });

  test('returns name type when CoinGecko search finds nothing', async () => {
    axios.mockResolvedValueOnce({ data: { coins: [] } });

    const result = await identifyToken('unknowntoken');
    expect(result).toEqual({
      type: 'name',
      value: 'unknowntoken'
    });
  });

  test('returns name type when CoinGecko search errors', async () => {
    jest.useFakeTimers();
    // fetchWithRetry retries 3 times with 5s delay, so mock all retries to fail
    axios
      .mockRejectedValueOnce(new Error('API error'))
      .mockRejectedValueOnce(new Error('API error'))
      .mockRejectedValueOnce(new Error('API error'));

    const promise = identifyToken('sometoken');
    // Advance through retry delays
    await jest.advanceTimersByTimeAsync(15000);

    const result = await promise;
    expect(result).toEqual({
      type: 'name',
      value: 'sometoken'
    });
    jest.useRealTimers();
  }, 30000);

  test('rejects invalid Ethereum address (too short)', async () => {
    axios.mockResolvedValueOnce({ data: { coins: [] } });
    const result = await identifyToken('0x1234');
    // Should NOT be identified as ethereum address
    expect(result.chain).not.toBe('ethereum');
  });

  test('40 hex chars without 0x prefix falls through to search', async () => {
    // '0' is not in base58 alphabet [1-9A-HJ-NP-Za-km-z], so this won't match Solana
    // It falls through to CoinGecko search
    axios.mockResolvedValueOnce({ data: { coins: [] } });

    const result = await identifyToken('1234567890abcdef1234567890abcdef12345678');
    expect(result.type).toBe('name');
  });
});

// ============================================
// CoinGecko API wrapper
// ============================================
describe('CoinGecko', () => {
  test('search encodes query parameter', async () => {
    axios.mockResolvedValueOnce({ data: { coins: [] } });

    await CoinGecko.search('bitcoin cash');
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('query=bitcoin%20cash')
      })
    );
  });

  test('getCoin constructs correct URL', async () => {
    axios.mockResolvedValueOnce({ data: {} });

    await CoinGecko.getCoin('bitcoin');
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/coins/bitcoin?')
      })
    );
  });

  test('getMarketChart uses default 7 days', async () => {
    axios.mockResolvedValueOnce({ data: {} });

    await CoinGecko.getMarketChart('bitcoin');
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('days=7')
      })
    );
  });

  test('getMarketChart accepts custom days', async () => {
    axios.mockResolvedValueOnce({ data: {} });

    await CoinGecko.getMarketChart('bitcoin', 30);
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('days=30')
      })
    );
  });
});

// ============================================
// CoinMarketCap API wrapper
// ============================================
describe('CoinMarketCap', () => {
  test('getQuotes sends API key header', async () => {
    const originalKey = CoinMarketCap.apiKey;
    CoinMarketCap.apiKey = 'test-key-123';

    axios.mockResolvedValueOnce({ data: {} });

    await CoinMarketCap.getQuotes('BTC');
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { 'X-CMC_PRO_API_KEY': 'test-key-123' }
      })
    );

    CoinMarketCap.apiKey = originalKey;
  });
});

// ============================================
// Etherscan API wrapper
// ============================================
describe('Etherscan', () => {
  test('verifyContract includes address and API key', async () => {
    const originalKey = Etherscan.apiKey;
    Etherscan.apiKey = 'etherscan-key';

    axios.mockResolvedValueOnce({ data: {} });

    await Etherscan.verifyContract('0xabc123');
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringMatching(/address=0xabc123.*apikey=etherscan-key/)
      })
    );

    Etherscan.apiKey = originalKey;
  });
});
