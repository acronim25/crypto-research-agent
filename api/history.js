// ============================================
// API/HISTORY.JS - GET /api/history
// ============================================

const { all, logAction } = require('../lib/db');

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
    // Get query parameters
    const { 
      limit = 50, 
      offset = 0, 
      ticker,
      risk,
      sort = 'date',
      order = 'desc'
    } = req.query;
    
    // Build query
    let sql = 'SELECT * FROM researches WHERE 1=1';
    const params = [];
    
    // Filter by ticker
    if (ticker) {
      sql += ' AND ticker LIKE ?';
      params.push(`%${ticker}%`);
    }
    
    // Filter by risk class
    if (risk && risk !== 'all') {
      sql += ' AND risk_class = ?';
      params.push(risk);
    }
    
    // Sort
    const sortColumn = sort === 'risk' ? 'risk_score' : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortColumn} ${sortOrder}`;
    
    // Pagination
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    // Execute query
    const researches = await all(sql, params);
    
    // Get total count
    const countResult = await all('SELECT COUNT(*) as total FROM researches');
    const total = countResult[0].total;
    
    // Format response
    const formatted = researches.map(r => ({
      id: r.id,
      ticker: r.ticker,
      name: r.name,
      risk_score: r.risk_score,
      risk_class: r.risk_class,
      created_at: r.created_at
    }));
    
    // Log access
    await logAction('history_view', { filters: req.query }, req);
    
    res.status(200).json({
      success: true,
      data: {
        researches: formatted,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: parseInt(offset) + formatted.length < total
        }
      }
    });
    
  } catch (error) {
    console.error('History API error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Eroare internă. Încearcă din nou.'
      }
    });
  }
};
