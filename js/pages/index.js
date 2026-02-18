// ============================================
// PAGES/INDEX.JS - Landing Page Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');
  const tokenInput = document.getElementById('tokenInput');
  const submitBtn = document.getElementById('submitBtn');
  const loadingState = document.getElementById('loadingState');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  
  // Handle form submission
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const input = tokenInput.value.trim();
    console.log('📝 Form submitted with input:', input);
    if (!input) return;
    
    // Reset UI
    hideError();
    showLoading();
    
    try {
      console.log('🚀 Calling API.createResearch...');
      // Create research
      const response = await API.createResearch(input);
      console.log('📊 API response:', response);
      
      if (response.success) {
        console.log('✅ Research created, redirecting to:', response.data.id);
        // Redirect to research page
        window.location.href = `research.html#${response.data.id}`;
      } else {
        throw new Error(response.error?.message || 'Eroare necunoscută');
      }
    } catch (error) {
      console.error('❌ Error in form submission:', error);
      hideLoading();
      showError(error.message || 'A apărut o eroare. Încearcă din nou.');
    }
  });
  
  // Show loading state
  function showLoading() {
    searchForm.style.display = 'none';
    loadingState.classList.add('loading--active');
  }
  
  // Hide loading state
  function hideLoading() {
    loadingState.classList.remove('loading--active');
    searchForm.style.display = 'block';
  }
  
  // Show error message
  function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.add('error-message--active');
    tokenInput.focus();
  }
  
  // Hide error message
  function hideError() {
    errorMessage.classList.remove('error-message--active');
  }
  
  // Auto-detect input type (for UX feedback)
  tokenInput.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    
    // Detect if it's an Ethereum address
    if (value.startsWith('0x') && value.length === 42) {
      tokenInput.style.borderColor = 'var(--color-accent-success)';
    } else if (value.length > 3) {
      tokenInput.style.borderColor = '';
    }
  });
  
  // Clear border on blur
  tokenInput.addEventListener('blur', () => {
    tokenInput.style.borderColor = '';
  });
});
