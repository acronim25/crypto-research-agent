// ============================================
// PAGES/RESEARCH.JS - Research Report Page Logic
// ============================================

// Formatters pentru afișarea datelor
const formatters = {
  price: (value) => {
    if (!value || value === 0) return '$0.00';
    if (value >= 1) {
      return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (value >= 0.01) {
      return '$' + value.toFixed(4);
    } else {
      return '$' + value.toExponential(4);
    }
  },
  
  marketCap: (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    const num = Number(value);
    if (num === 0) return '$0';
    if (num >= 1e12) {
      return '$' + (num / 1e12).toFixed(2) + 'T';
    } else if (num >= 1e9) {
      return '$' + (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
      return '$' + (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
      return '$' + (num / 1e3).toFixed(2) + 'K';
    }
    return '$' + num.toFixed(2);
  },
  
  number: (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    const num = Number(value);
    if (num === 0) return '0';
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toLocaleString('en-US');
  },
  
  percentage: (value) => {
    if (value === null || value === undefined) return '--';
    const sign = value > 0 ? '+' : '';
    return sign + value.toFixed(2) + '%';
  },
  
  // Special formatter for holders
  holders: (value, hasRealData) => {
    if (!hasRealData || !value || value === 0) return 'N/A';
    return formatters.number(value);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  // Get research ID from URL hash (e.g., #research_bitcoin_123)
  const researchId = window.location.hash.slice(1); // Remove # from start
  
  console.log('🔍 Looking for research:', researchId);
  console.log('📦 localStorage keys:', Object.keys(localStorage));

  if (!researchId) {
    showError('ID-ul research-ului nu a fost specificat.');
    return;
  }

  // Load research data
  try {
    const response = await API.getResearch(researchId);
    console.log('📊 API response:', response);
    
    if (response.success) {
      console.log('📊 Research data:', response.data);
      console.log('📍 Contract address:', response.data.token?.address);
      console.log('👥 Holders count:', response.data.tokenomics?.holders_count);
      console.log('📈 Top holders:', response.data.tokenomics?.top_holders?.length);
      console.log('🔗 Aggregated sources:', response.data.aggregated_sources);
      renderResearch(response.data);
    } else {
      showError(response.error || 'Raportul nu a fost găsit.');
    }
  } catch (error) {
    console.error('❌ Error loading research:', error);
    showError('Eroare la încărcarea raportului. Încearcă din nou.');
  }

  // Setup action buttons
  setupActionButtons(researchId);
});

// Render the research report
function renderResearch(data) {
  // Hide loading, show report
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('researchReport').classList.remove('hidden');

  // Header info
  document.getElementById('tokenName').textContent = data.token.name || 'Unknown';
  document.getElementById('tokenTicker').textContent = data.token.ticker || '--';
  
  if (data.token.address) {
    const shortAddress = `${data.token.address.slice(0, 6)}...${data.token.address.slice(-4)}`;
    document.getElementById('tokenAddress').textContent = `${shortAddress} • ${data.token.chain || 'Unknown'}`;
  } else {
    document.getElementById('tokenAddress').textContent = data.token.chain || '';
  }

  // Token logo (if available)
  const logoEl = document.getElementById('tokenLogo');
  if (data.token.logo) {
    logoEl.src = data.token.logo;
    logoEl.style.display = 'block';
  }

  // Risk Badge
  const riskBadge = new RiskBadge(data.analysis.risk_score, 'large');
  riskBadge.mount(document.getElementById('riskBadgeContainer'));

  // Overview
  document.getElementById('tokenDescription').textContent = 
    data.token.description || 'Nu există descriere disponibilă pentru acest token.';

  // Price Stats
  if (data.price_data) {
    const priceStats = [
      { label: 'Preț Curent', value: formatters.price(data.price_data.current_price) },
      { label: 'ATH', value: formatters.price(data.price_data.ath) },
      { label: 'ATL', value: formatters.price(data.price_data.atl) },
      { label: 'De la ATH', value: formatters.percentage(data.price_data.ath_percentage), change: data.price_data.ath_percentage },
      { label: 'Volum 24h', value: formatters.marketCap(data.price_data.volume_24h) },
      { label: 'Rank', value: `#${data.price_data.market_cap_rank || 'N/A'}` }
    ];
    
    const priceGrid = new DataGrid(priceStats, 3);
    priceGrid.mount(document.getElementById('priceStats'));
  }

  // Tokenomics Stats
  if (data.tokenomics) {
    // Check if we have real holder data from aggregated sources
    const hasRealHolderData = data.aggregated_sources?.successful > 1;
    const holderCount = data.tokenomics.holders_count > 0 
      ? data.tokenomics.holders_count 
      : null;
    const top10Percentage = data.tokenomics.top_10_holders_percentage;
    
    console.log('💡 Holder display:', { hasRealHolderData, holderCount, top10Percentage });
    
    const tokenomicsStats = [
      { label: 'Market Cap', value: formatters.marketCap(data.tokenomics.market_cap) },
      { label: 'FDV', value: formatters.marketCap(data.tokenomics.fully_diluted_valuation) },
      { label: 'Supply Total', value: formatters.number(data.tokenomics.total_supply) },
      { label: 'În Circulație', value: formatters.number(data.tokenomics.circulating_supply) },
      { label: 'Holders', value: holderCount ? formatters.number(holderCount) : 'N/A' },
      { label: 'Top 10 %', value: top10Percentage ? `${top10Percentage.toFixed(2)}%` : 'N/A' }
    ];
    
    const tokenomicsGrid = new DataGrid(tokenomicsStats, 3);
    tokenomicsGrid.mount(document.getElementById('tokenomicsStats'));
    
    // Add note about data sources if we don't have real holder data
    if (!hasRealHolderData || !holderCount) {
      const holdersNote = document.createElement('p');
      holdersNote.className = 'text-sm text-muted mt-2';
      holdersNote.style.cssText = 'color: rgba(0, 245, 212, 0.6); font-style: italic;';
      holdersNote.innerHTML = '💡 Date despre holders indisponibile pentru acest token. DexScreener are aceste date doar pentru token-uri DEX.';
      document.getElementById('tokenomicsStats').appendChild(holdersNote);
    }
  }

  // On-Chain Stats
  if (data.onchain) {
    const onChainStats = [
      { label: 'Liquidity', value: formatters.marketCap(data.onchain.liquidity_pool_usd) },
      { label: 'Buy Tax', value: `${data.onchain.buy_tax_percentage || 0}%` },
      { label: 'Sell Tax', value: `${data.onchain.sell_tax_percentage || 0}%` },
      { label: 'Contract', value: data.onchain.contract_verified ? '✓ Verificat' : '✗ Neverificat' },
      { label: 'Mint', value: data.onchain.mint_authority_renounced ? '✓ Renunțat' : '✗ Activ' },
      { label: 'Liquidity', value: data.onchain.liquidity_locked ? '✓ Locked' : '✗ Unlocked' }
    ];
    
    const onChainGrid = new DataGrid(onChainStats, 3);
    onChainGrid.mount(document.getElementById('onChainStats'));
  }

  // Red Flags
  if (data.red_flags) {
    RedFlagItem.renderList(data.red_flags, document.getElementById('redFlagsList'));
  }

  // Team & Use Case
  document.getElementById('teamInfo').textContent = 
    data.token.team || 'Echipa nu este publică (anonimă).';
  document.getElementById('useCaseInfo').textContent = 
    data.token.use_case || 'Nu există informații despre use case.';

  // Sentiment
  document.getElementById('sentimentScore').textContent = data.analysis.sentiment_score ?? '--';
  document.getElementById('sentimentLabel').textContent = 
    data.analysis.sentiment?.charAt(0).toUpperCase() + data.analysis.sentiment?.slice(1) || '--';
  document.getElementById('socialScore').textContent = data.analysis.social_score ?? '--';

  // Conclusion
  const conclusionRiskBadge = new RiskBadge(data.analysis.risk_score);
  conclusionRiskBadge.mount(document.getElementById('conclusionRiskBadge'));

  const riskText = {
    'low': 'Acest token prezintă un risc scăzut. Verificările de bază sunt trecute, dar aceasta nu garantează profit.',
    'medium': 'Acest token prezintă un risc moderat. Există câteva puncte de atenție, dar nimic critic.',
    'high': 'Acest token prezintă un risc ridicat. S-au detectat multiple red flags. Investește doar ce îți permiți să pierzi.',
    'extreme': 'Acest token prezintă un risc extrem. Posibil scam. Recomandăm să eviți complet.'
  };

  document.getElementById('conclusionText').textContent = 
    riskText[data.analysis.risk_class] || riskText['medium'];
}

// Show error state
function showError(message) {
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('researchReport').classList.add('hidden');
  document.getElementById('errorState').classList.remove('hidden');
  document.getElementById('errorMessage').textContent = message;
}

// Setup action buttons
function setupActionButtons(researchId) {
  // Share to Discord
  document.getElementById('shareBtn')?.addEventListener('click', async () => {
    try {
      const tokenName = document.getElementById('tokenName').textContent;
      const riskScore = document.querySelector('.risk-badge span')?.textContent || '';
      
      await API.shareToDiscord({
        token: tokenName,
        alert_type: 'research_share',
        research_id: researchId,
        risk_score: riskScore,
        research_url: window.location.href
      });
      
      alert('Raportul a fost share-uit pe Discord!');
    } catch (error) {
      alert('Eroare la share. Încearcă din nou.');
    }
  });

  // Bookmark
  document.getElementById('bookmarkBtn')?.addEventListener('click', () => {
    const bookmarks = JSON.parse(localStorage.getItem('researchBookmarks') || '[]');
    if (!bookmarks.includes(researchId)) {
      bookmarks.push(researchId);
      localStorage.setItem('researchBookmarks', JSON.stringify(bookmarks));
      alert('Adăugat la bookmarks!');
    } else {
      alert('Deja în bookmarks.');
    }
  });

  // Add to watchlist
  document.getElementById('watchlistBtn')?.addEventListener('click', () => {
    const ticker = document.getElementById('tokenTicker').textContent;
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    if (!watchlist.includes(ticker)) {
      watchlist.push(ticker);
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
      alert(`Adăugat ${ticker} la watchlist!`);
    } else {
      alert('Deja în watchlist.');
    }
  });

  // Monitor
  document.getElementById('monitorBtn')?.addEventListener('click', async () => {
    try {
      // This would call an API to enable monitoring
      alert('Monitorizare activată! Vei primi alerte pe Discord la schimbări majore.');
    } catch (error) {
      alert('Eroare la activarea monitorizării.');
    }
  });
}
