// ============================================
// API/RESEARCH.JS - POST /api/research
// ============================================

const { run, get, logAction } = require('../lib/db');
const { identifyToken } = require('../lib/apis');
const { analyzeToken } = require('../lib/analyzer');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { message: 'Method not allowed' }
    });
  }
  
  try {
    const { input, type = 'auto' } = req.body;
    
    if (!input || typeof input !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Input is required' }
      });
    }
    
    // Log the request
    await logAction('research_request', { input, type }, req);
    
    // Identify token
    const identifier = await identifyToken(input);
    
    if (!identifier.value) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TOKEN_NOT_FOUND',
          message: 'Token-ul nu a fost găsit. Verifică spelling-ul sau adresa de contract.'
        }
      });
    }
    
    // Perform analysis
    const analysis = await analyzeToken(identifier.value, identifier.type);
    
    // Generate research ID
    const timestamp = Date.now();
    const researchId = `research_${timestamp}_${analysis.token.ticker || 'unknown'}`;
    
    // Save to database
    await run(`
      INSERT INTO researches (
        id, ticker, name, address, chain, logo, description,
        price_data, tokenomics, onchain, red_flags,
        risk_score, risk_class, sentiment, sentiment_score, social_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      researchId,
      analysis.token.ticker,
      analysis.token.name,
      identifier.type === 'address' ? identifier.value : null,
      identifier.chain || null,
      analysis.token.logo,
      analysis.token.description,
      JSON.stringify(analysis.price_data),
      JSON.stringify(analysis.tokenomics),
      JSON.stringify(analysis.onchain),
      JSON.stringify(analysis.red_flags),
      analysis.analysis.risk_score,
      analysis.analysis.risk_class,
      analysis.analysis.sentiment,
      analysis.analysis.sentiment_score,
      analysis.analysis.social_score
    ]);
    
    // Return success
    res.status(200).json({
      success: true,
      data: {
        id: researchId,
        status: 'complete',
        timestamp: new Date().toISOString(),
        redirect_url: `/research.html?id=${researchId}`
      }
    });
    
  } catch (error) {
    console.error('Research API error:', error);
    
    // Log error
    await logAction('research_error', { error: error.message }, req);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Eroare internă. Încearcă din nou.'
      }
    });
  }
};
