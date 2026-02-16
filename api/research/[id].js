// ============================================
// API/RESEARCH/[ID].JS - GET /api/research/[id]
// ============================================

const { get, logAction } = require('../../lib/db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: { message: 'Method not allowed' }
    });
  }
  
  try {
    // Get ID from URL
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'ID is required' }
      });
    }
    
    // Fetch research from database
    const research = await get('SELECT * FROM researches WHERE id = ?', [id]);
    
    if (!research) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESEARCH_NOT_FOUND',
          message: 'Research-ul nu a fost găsit.'
        }
      });
    }
    
    // Parse JSON fields
    const response = {
      id: research.id,
      token: {
        ticker: research.ticker,
        name: research.name,
        address: research.address,
        chain: research.chain,
        logo: research.logo,
        description: research.description,
        team: research.team,
        use_case: research.use_case
      },
      price_data: JSON.parse(research.price_data || '{}'),
      tokenomics: JSON.parse(research.tokenomics || '{}'),
      onchain: JSON.parse(research.onchain || '{}'),
      red_flags: JSON.parse(research.red_flags || '[]'),
      analysis: {
        risk_score: research.risk_score,
        risk_class: research.risk_class,
        sentiment: research.sentiment,
        sentiment_score: research.sentiment_score,
        social_score: research.social_score
      },
      created_at: research.created_at
    };
    
    // Log access
    await logAction('research_view', { research_id: id }, req);
    
    res.status(200).json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('Get research error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Eroare internă. Încearcă din nou.'
      }
    });
  }
};
