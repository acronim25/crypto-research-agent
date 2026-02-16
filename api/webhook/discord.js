// ============================================
// API/WEBHOOK/DISCORD.JS - POST /api/webhook/discord
// ============================================

const axios = require('axios');
const { logAction } = require('../../lib/db');

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || 
  'https://discord.com/api/webhooks/1472937663303778314/_AwRJR-UcpuC5SAwCTkJGivvD9kyld1WS_F1Z0ZaEEDGBZYra5ZOY9-AoVrsnMMMFCc3';

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
    const { 
      token, 
      alert_type = 'research_share',
      research_id,
      risk_score,
      risk_class,
      message,
      change_percent,
      current_price,
      research_url
    } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: { message: 'Token is required' }
      });
    }
    
    // Build Discord embed
    const embed = {
      title: alert_type === 'price_spike' 
        ? `🚨 Alertă: ${token} ${change_percent}`
        : `📊 Research: ${token}`,
      description: message || `Risk Score: ${risk_score}/10 (${risk_class})`,
      color: getColorForRisk(risk_class),
      timestamp: new Date().toISOString(),
      fields: []
    };
    
    if (current_price) {
      embed.fields.push({
        name: 'Preț Curent',
        value: current_price,
        inline: true
      });
    }
    
    if (research_url) {
      embed.fields.push({
        name: 'Raport Complet',
        value: `[Click aici](${research_url})`,
        inline: true
      });
    }
    
    // Send to Discord
    const discordPayload = {
      embeds: [embed],
      content: alert_type === 'price_spike' ? '@everyone' : undefined
    };
    
    const response = await axios.post(DISCORD_WEBHOOK_URL, discordPayload);
    
    // Log the webhook
    await logAction('discord_webhook', { 
      token, 
      alert_type,
      research_id 
    }, req);
    
    res.status(200).json({
      success: true,
      data: {
        sent: true,
        discord_message_id: response.data?.id || 'unknown'
      }
    });
    
  } catch (error) {
    console.error('Discord webhook error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'DISCORD_ERROR',
        message: 'Nu s-a putut trimite mesajul pe Discord.'
      }
    });
  }
};

// Get color for risk class
function getColorForRisk(riskClass) {
  const colors = {
    low: 0x22C55E,      // Green
    medium: 0xF59E0B,   // Orange
    high: 0xEF4444,     // Red
    extreme: 0x450A0A   // Dark Red
  };
  return colors[riskClass] || colors.medium;
}
