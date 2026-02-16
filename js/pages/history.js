// ============================================
// PAGES/HISTORY.JS - History Page Logic
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // State
  let currentPage = 1;
  const itemsPerPage = 10;
  let allResearches = [];
  let filteredResearches = [];

  // Elements
  const loadingState = document.getElementById('loadingState');
  const emptyState = document.getElementById('emptyState');
  const historyList = document.getElementById('historyList');
  const pagination = document.getElementById('pagination');
  const searchInput = document.getElementById('searchInput');
  const riskFilter = document.getElementById('riskFilter');
  const sortFilter = document.getElementById('sortFilter');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');

  // Load data
  try {
    const response = await API.getHistory();
    
    if (response.success) {
      allResearches = response.data.researches || [];
      filteredResearches = [...allResearches];
      
      if (allResearches.length === 0) {
        showEmptyState();
      } else {
        renderHistory();
      }
    } else {
      showEmptyState();
    }
  } catch (error) {
    console.error('Error loading history:', error);
    showEmptyState();
  }

  // Event listeners
  searchInput?.addEventListener('input', debounce(() => {
    currentPage = 1;
    applyFilters();
  }, 300));

  riskFilter?.addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
  });

  sortFilter?.addEventListener('change', () => {
    applyFilters();
  });

  prevPageBtn?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderHistory();
    }
  });

  nextPageBtn?.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredResearches.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderHistory();
    }
  });

  // Apply filters
  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const riskLevel = riskFilter.value;
    const sortBy = sortFilter.value;

    // Filter
    filteredResearches = allResearches.filter(research => {
      const matchesSearch = 
        research.ticker?.toLowerCase().includes(searchTerm) ||
        research.name?.toLowerCase().includes(searchTerm);
      
      const matchesRisk = 
        riskLevel === 'all' || 
        research.risk_class === riskLevel;

      return matchesSearch && matchesRisk;
    });

    // Sort
    filteredResearches.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'date-desc':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'risk-asc':
          return a.risk_score - b.risk_score;
        case 'risk-desc':
          return b.risk_score - a.risk_score;
        case 'name':
          return (a.name || a.ticker).localeCompare(b.name || b.ticker);
        default:
          return 0;
      }
    });

    renderHistory();
  }

  // Render history list
  function renderHistory() {
    loadingState.classList.add('hidden');
    
    if (filteredResearches.length === 0) {
      historyList.classList.add('hidden');
      pagination.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    historyList.classList.remove('hidden');
    pagination.classList.remove('hidden');

    // Pagination
    const totalPages = Math.ceil(filteredResearches.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filteredResearches.slice(start, end);

    // Update page info
    pageInfo.textContent = `Pagina ${currentPage} din ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    // Render items
    historyList.innerHTML = pageItems.map(research => `
      <div class="history-item">
        <div class="history-item__info">
          <img 
            src="${research.logo || 'https://via.placeholder.com/48'}" 
            alt="${research.name || research.ticker}" 
            class="history-item__logo"
            onerror="this.src='https://via.placeholder.com/48'"
          >
          <div class="history-item__details">
            <div class="history-item__name">${research.name || research.ticker}</div>
            <div class="history-item__ticker">${research.ticker}</div>
            <div class="history-item__date">${formatters.date(research.created_at)}</div>
          </div>
        </div>
        
        <div class="history-item__risk">
          <span class="history-item__risk-badge history-item__risk-badge--${research.risk_class}">
            ${research.risk_score}/10
          </span>
          
          <div class="history-item__actions">
            <a href="research.html?id=${research.id}" class="btn btn--secondary btn--sm">
              <i class="fas fa-eye"></i>
            </a>
            <button class="btn btn--secondary btn--sm" onclick="researchAgain('${research.ticker}')">
              <i class="fas fa-redo"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Show empty state
  function showEmptyState() {
    loadingState.classList.add('hidden');
    historyList.classList.add('hidden');
    pagination.classList.add('hidden');
    emptyState.classList.remove('hidden');
  }

  // Debounce helper
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
});

// Research again function
function researchAgain(ticker) {
  window.location.href = `index.html?research=${encodeURIComponent(ticker)}`;
}
