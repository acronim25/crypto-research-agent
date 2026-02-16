# FRONTEND_GUIDELINES.md - Engineering Rules

## Auto-Research Agent pentru Crypto

**Versiune:** 1.0  
**Data:** 2026-02-16

---

## 1. ARHITECTURA COMPONENTELOR

### 1.1 Component Hierarchy

```
Page (HTML File)
├── Layout
│   ├── Header (Logo + Navigation)
│   ├── Main Content
│   │   ├── Section Components
│   │   │   ├── RiskScoreHero
│   │   │   ├── PriceChartSection
│   │   │   ├── TokenomicsGrid
│   │   │   ├── OnChainData
│   │   │   ├── RedFlagsList
│   │   │   ├── TeamInfo
│   │   │   ├── SocialSentiment
│   │   │   └── Conclusion
│   │   └── ActionButtons
│   └── Footer
└── Scripts
    ├── API Layer
    ├── State Management
    ├── Event Handlers
    └── Utils
```

### 1.2 Component Naming Convention

**Files:**
- `kebab-case.html` (e.g., `research-report.html`)
- `camelCase.js` (e.g., `riskCalculator.js`)
- `kebab-case.css` (e.g., `design-tokens.css`)

**CSS Classes:**
- Block: `.component-name` (e.g., `.risk-badge`)
- Element: `.component-name__element` (e.g., `.risk-badge__score`)
- Modifier: `.component-name--modifier` (e.g., `.risk-badge--high`)

**JavaScript Functions:**
- `camelCase` pentru utility functions (e.g., `formatPrice`)
- `PascalCase` pentru class constructors (e.g., `ChartRenderer`)

---

## 2. FILE STRUCTURE

### 2.1 Directory Tree

```
/
├── index.html                    # Entry: Landing + Form
├── research.html                 # Research report template
├── history.html                  # Research history list
├── about.html                    # About page
├──
├── css/
│   ├── 01-design-tokens.css      # Variables (colors, spacing, typography)
│   ├── 02-reset.css              # Normalize/Reset
│   ├── 03-base.css               # Base styles (body, typography)
│   ├── 04-layout.css             # Grid, container, responsive
│   ├── 05-components.css         # Buttons, cards, forms
│   ├── 06-sections.css           # Page-specific sections
│   └── 07-utilities.css          # Helper classes
│
├── js/
│   ├── config.js                 # Constants, API endpoints
│   ├── api.js                    # API calls (fetch wrappers)
│   ├── state.js                  # State management
│   ├── components/
│   │   ├── RiskBadge.js          # Risk score component
│   │   ├── PriceChart.js         # Chart.js wrapper
│   │   ├── DataGrid.js           # Stats grid component
│   │   ├── RedFlagItem.js        # Red flag list item
│   │   └── LoadingState.js       # Skeleton/spinner
│   ├── pages/
│   │   ├── index.js              # Landing page logic
│   │   ├── research.js           # Research report logic
│   │   └── history.js            # History page logic
│   └── utils/
│       ├── formatters.js         # Number, date formatters
│       ├── validators.js         # Input validation
│       └── helpers.js            # General utilities
│
├── assets/
│   ├── logo.svg
│   └── icons/
│
└── .github/
    └── workflows/
        └── deploy.yml
```

### 2.2 Import Order (HTML)

```html
<!-- 1. Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500" rel="stylesheet">

<!-- 2. Icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- 3. CSS -->
<link rel="stylesheet" href="css/01-design-tokens.css">
<link rel="stylesheet" href="css/02-reset.css">
<link rel="stylesheet" href="css/03-base.css">
<link rel="stylesheet" href="css/04-layout.css">
<link rel="stylesheet" href="css/05-components.css">
<link rel="stylesheet" href="css/06-sections.css">
<link rel="stylesheet" href="css/07-utilities.css">

<!-- 4. External Libraries -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0"></script>

<!-- 5. App Scripts -->
<script type="module" src="js/config.js"></script>
<script type="module" src="js/api.js"></script>
<script type="module" src="js/state.js"></script>
<script type="module" src="js/pages/index.js"></script>
```

---

## 3. STATE MANAGEMENT

### 3.1 State Structure

```javascript
// js/state.js

const appState = {
  // Current page state
  currentPage: 'index', // 'index' | 'research' | 'history'
  
  // Research data (populated on research page)
  currentResearch: null,
  
  // Loading states
  isLoading: false,
  error: null,
  
  // History page
  historyList: [],
  historyFilters: {
    search: '',
    riskLevel: 'all', // 'all' | 'low' | 'medium' | 'high'
    sortBy: 'date' // 'date' | 'risk' | 'name'
  },
  
  // User preferences (persisted to localStorage)
  preferences: {
    theme: 'dark', // Always dark for this app
    watchlist: [], // Array of tickers
    bookmarks: []  // Array of research IDs
  }
};

// Getters
export const getState = () => ({ ...appState });

// Setters (with validation)
export const setState = (key, value) => {
  if (!(key in appState)) {
    console.warn(`State key "${key}" does not exist`);
    return;
  }
  appState[key] = value;
  notifySubscribers(key, value);
};

// Subscriptions for reactive updates
const subscribers = {};
export const subscribe = (key, callback) => {
  if (!subscribers[key]) subscribers[key] = [];
  subscribers[key].push(callback);
};

const notifySubscribers = (key, value) => {
  if (subscribers[key]) {
    subscribers[key].forEach(cb => cb(value));
  }
};
```

### 3.2 localStorage Persistence

```javascript
// Save preferences
export const savePreferences = () => {
  localStorage.setItem('researchAgentPrefs', JSON.stringify(appState.preferences));
};

// Load preferences
export const loadPreferences = () => {
  const saved = localStorage.getItem('researchAgentPrefs');
  if (saved) {
    appState.preferences = { ...appState.preferences, ...JSON.parse(saved) };
  }
};
```

---

## 4. API LAYER

### 4.1 Base API Client

```javascript
// js/api.js

const API_BASE_URL = 'https://crypto-research-api.vercel.app'; // Update with actual URL

// Generic fetch wrapper
async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Specific API methods
export const api = {
  // Create new research
  createResearch: (input, type) => 
    apiClient('/api/research', {
      method: 'POST',
      body: JSON.stringify({ input, type })
    }),
  
  // Get research by ID
  getResearch: (id) => 
    apiClient(`/api/research/${id}`),
  
  // Get history
  getHistory: () => 
    apiClient('/api/history'),
  
  // Share to Discord
  shareToDiscord: (data) => 
    apiClient('/api/webhook/discord', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};
```

### 4.2 Error Handling

```javascript
// js/utils/errorHandler.js

export const handleApiError = (error, uiElement) => {
  console.error('API Error:', error);
  
  const errorMessages = {
    'Token not found': 'Token-ul nu a fost găsit. Verifică spelling-ul sau adresa de contract.',
    'Service temporarily unavailable': 'Serviciul este temporar indisponibil. Încearcă din nou în câteva momente.',
    'Rate limit exceeded': 'Prea multe cereri. Așteaptă un moment și încearcă din nou.',
    'Network error': 'Eroare de rețea. Verifică conexiunea la internet.'
  };
  
  const message = errorMessages[error.message] || 'A apărut o eroare. Încearcă din nou.';
  
  // Display error in UI
  if (uiElement) {
    uiElement.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
      </div>
    `;
  }
  
  return message;
};
```

---

## 5. COMPONENTE REUTILIZABILE

### 5.1 Risk Badge Component

```javascript
// js/components/RiskBadge.js

export class RiskBadge {
  constructor(score) {
    this.score = score;
    this.classification = this.getClassification();
  }
  
  getClassification() {
    if (this.score <= 3) return { level: 'low', label: 'Risc Scăzut', color: '#22C55E' };
    if (this.score <= 5) return { level: 'medium', label: 'Risc Moderat', color: '#F59E0B' };
    if (this.score <= 7) return { level: 'high', label: 'Risc Ridicat', color: '#EF4444' };
    return { level: 'extreme', label: 'Risc Extrem', color: '#450A0A' };
  }
  
  render() {
    const { level, label } = this.classification;
    
    return `
      <div class="risk-badge risk-badge--${level}">
        <span class="risk-badge__score">${this.score}/10</span>
        <span class="risk-badge__label">${label}</span>
      </div>
    `;
  }
  
  mount(container) {
    container.innerHTML = this.render();
  }
}
```

### 5.2 Price Chart Component

```javascript
// js/components/PriceChart.js

export class PriceChart {
  constructor(canvasId, priceData) {
    this.canvasId = canvasId;
    this.priceData = priceData;
    this.chart = null;
  }
  
  render() {
    const ctx = document.getElementById(this.canvasId).getContext('2d');
    
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.priceData.map(d => d.date),
        datasets: [{
          label: 'Preț (USD)',
          data: this.priceData.map(d => d.price),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => `$${context.parsed.y.toFixed(6)}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: '#334155' },
            ticks: { color: '#64748B', maxTicksLimit: 6 }
          },
          y: {
            grid: { color: '#334155' },
            ticks: { 
              color: '#64748B',
              callback: (value) => `$${value.toFixed(6)}`
            }
          }
        }
      }
    });
  }
  
  destroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
```

### 5.3 Data Grid Component

```javascript
// js/components/DataGrid.js

export class DataGrid {
  constructor(data, columns = 3) {
    this.data = data; // Array of {label, value, change}
    this.columns = columns;
  }
  
  render() {
    const items = this.data.map(item => {
      const changeClass = item.change > 0 ? 'positive' : item.change < 0 ? 'negative' : '';
      const changeIcon = item.change > 0 ? '↑' : item.change < 0 ? '↓' : '';
      
      return `
        <div class="stat-item">
          <div class="stat-item__value" data-change="${changeClass}">
            ${item.value}
            ${item.change ? `<span class="stat-item__change">${changeIcon} ${Math.abs(item.change)}%</span>` : ''}
          </div>
          <div class="stat-item__label">${item.label}</div>
        </div>
      `;
    }).join('');
    
    return `<div class="data-grid" style="--columns: ${this.columns}">${items}</div>
    `;
  }
  
  mount(container) {
    container.innerHTML = this.render();
  }
}
```

---

## 6. RESPONSIVE BEHAVIOR

### 6.1 Breakpoint Strategy

```css
/* Mobile First - Base styles for mobile */
/* No media query needed for mobile */

/* Tablet */
@media (min-width: 640px) {
  .container {
    padding: 24px;
  }
  
  .data-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px;
  }
  
  .data-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .research-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}
```

### 6.2 Mobile Adaptations

```css
/* Mobile-specific overrides */
@media (max-width: 639px) {
  .risk-badge {
    flex-direction: column;
    text-align: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons button {
    width: 100%;
  }
  
  .chart-container {
    height: 200px;
  }
}
```

---

## 7. PERFORMANCE OPTIMIZATIONS

### 7.1 Lazy Loading

```javascript
// Lazy load non-critical components
const loadChartComponent = async () => {
  const { PriceChart } = await import('./components/PriceChart.js');
  return PriceChart;
};

// Use Intersection Observer for lazy rendering
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Load and render component
      renderSection(entry.target);
    }
  });
});
```

### 7.2 Debouncing și Throttling

```javascript
// js/utils/helpers.js

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Usage: Search input debounce
const handleSearch = debounce((query) => {
  performSearch(query);
}, 300);
```

### 7.3 Code Splitting

```javascript
// Dynamic imports for page-specific code
if (window.location.pathname === '/research.html') {
  import('./pages/research.js').then(module => {
    module.initResearchPage();
  });
}
```

---

## 8. TESTING GUIDELINES

### 8.1 Manual Testing Checklist

**Funcționalitate:**
- [ ] Form submit funcționează cu ticker, address, name
- [ ] Loading state apare imediat după submit
- [ ] Raport se încarcă complet cu toate secțiunile
- [ ] Risk score este vizibil și colorat corect
- [ ] Toate cele 13 red flags sunt verificate și afișate
- [ ] Chart-ul price se render-ează corect
- [ ] Butoanele Share, Bookmark, Watchlist funcționează

**Responsive:**
- [ ] Layout funcționează pe mobile (375px)
- [ ] Layout funcționează pe tablet (768px)
- [ ] Layout funcționează pe desktop (1440px)
- [ ] Textul este lizibil pe toate dimensiunile

**Error Handling:**
- [ ] Token inexistent arată error message corespunzător
- [ ] Network error este handled gracefully
- [ ] Loading state dispare și în caz de eroare

### 8.2 Browser Testing

Testează pe:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Chrome Mobile (Android)
- Safari Mobile (iOS)

---

## 9. CODING STANDARDS

### 9.1 JavaScript Style

```javascript
// Use const/let, no var
const score = 7;
let isLoading = false;

// Use arrow functions for callbacks
const doubled = numbers.map(n => n * 2);

// Destructuring
const { ticker, name } = tokenData;

// Template literals
const message = `Token-ul ${ticker} are risk score ${score}.`;

// Async/await
async function loadResearch(id) {
  try {
    const data = await api.getResearch(id);
    return data;
  } catch (error) {
    handleError(error);
  }
}

// Early returns
function getRiskClass(score) {
  if (score <= 3) return 'low';
  if (score <= 5) return 'medium';
  if (score <= 7) return 'high';
  return 'extreme';
}
```

### 9.2 HTML Semantics

```html
<!-- Use semantic elements -->
<header>...\u003c/header>
<nav>...\u003c/nav>
<main>...\u003c/main>
<section>...\u003c/section>
<article>...\u003c/article>
<footer>...\u003c/footer>

<!-- Accessibility attributes -->
<button aria-label="Close dialog">×</button>
<img src="..." alt="Token logo">
<input aria-describedby="error-message">
```

### 9.3 CSS Naming

```css
/* BEM Methodology */
.block { }
.block__element { }
.block--modifier { }

/* Examples */
.risk-badge { }
.risk-badge__score { }
.risk-badge__label { }
.risk-badge--high { }
.risk-badge--low { }
```

---

*Document version: 1.0*  
*Last updated: 2026-02-16*
