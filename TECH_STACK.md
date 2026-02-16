# TECH_STACK.md - Technical Stack Specification

## Auto-Research Agent pentru Crypto

**Versiune:** 1.0  
**Data:** 2026-02-16  
**Status:** Production Ready

---

## 1. OVERVIEW ARHITECTURAL

### 1.1 Arhitectură Three-Tier

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Static)                        │
│              GitHub Pages - crypto-research-agent           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  index.html  │ │ research.html│ │  history.html│        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐ ┌──────────────┐                          │
│  │   app.js     │ │  styles.css  │                          │
│  └──────────────┘ └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Serverless Functions)                 │
│                    Vercel / Netlify                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │/api/research │ │/api/research/│ │ /api/history │        │
│  │    POST      │ │   [id] GET   │ │     GET      │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐                                          │
│  │/api/webhook/ │                                          │
│  │   discord    │                                          │
│  └──────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQLite / Memory
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA STORAGE                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  researches  │ │    alerts    │ │     logs     │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL APIs (Free Tiers)                     │
│  CoinGecko │ CoinMarketCap │ DEXTools │ Twitter │ GitHub   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. FRONTEND STACK

### 2.1 Platformă și Hosting
- **Platform:** GitHub Pages
- **Domain:** `https://crypto-research-agent.github.io` (sau custom domain)
- **Type:** Static Site
- **HTTPS:** Obligatoriu (enforced by GitHub)
- **CDN:** Cloudflare (via GitHub)

### 2.2 Core Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Markup | HTML5 | Living Standard | Structure |
| Styling | CSS3 | Living Standard | Design System |
| Logic | Vanilla JavaScript | ES2022 | Interactivity |
| Charts | Chart.js | 4.4.0 | Price charts |
| Icons | Font Awesome | 6.4.0 | Iconography |
| Fonts | Google Fonts | - | Inter (body), JetBrains Mono (data) |

### 2.3 Build Process
- **Build Tool:** None (vanilla JS/HTML/CSS)
- **Bundler:** None required
- **Transpilation:** None (target modern browsers)
- **Deployment:** Git push → GitHub Actions → GitHub Pages

### 2.4 Browser Support
- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

### 2.5 File Structure (Frontend)
```
/
├── index.html              # Landing + Form
├── research.html           # Template raport
├── history.html            # Istoric
├── about.html              # About
├── css/
│   ├── styles.css          # Main stylesheet
│   ├── design-system.css   # Tokens (colors, typography)
│   └── components.css      # Component styles
├── js/
│   ├── app.js              # Main logic
│   ├── api.js              # API calls
│   ├── charts.js           # Chart rendering
│   └── utils.js            # Helpers
├── assets/
│   ├── logo.svg            # App logo
│   └── icons/              # Custom icons
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Actions
```

---

## 3. BACKEND STACK

### 3.1 Platformă și Hosting
- **Primary:** Vercel Serverless Functions
- **Alternative:** Netlify Functions (fallback)
- **Region:** Europe (Frankfurt) - closest to user (Romania)
- **Runtime:** Node.js 18.x
- **Memory:** 1024 MB per function
- **Timeout:** 30 seconds (sufficient for API calls)

### 3.2 Core Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Node.js | 18.x | Server environment |
| API | Next.js API Routes | 14.1.0 | Serverless functions |
| HTTP Client | axios | 1.6.0 | External API calls |
| Scraping | cheerio | 1.0.0 | HTML parsing |
| Cache | node-cache | 5.1.0 | In-memory caching |
| CORS | cors | 2.8.5 | Cross-origin requests |

### 3.3 API Endpoints

#### POST /api/research
```javascript
// Request
{
  "input": "PEPE",
  "type": "ticker" // "ticker" | "address" | "name"
}

// Response Success (200)
{
  "id": "research_abc123",
  "status": "complete",
  "timestamp": "2026-02-16T13:30:00Z"
}

// Response Error (404)
{
  "error": "Token not found",
  "message": "Verifică spelling-ul sau adresa de contract"
}
```

#### GET /api/research/[id]
```javascript
// Response (200)
{
  "id": "research_abc123",
  "token": {
    "ticker": "PEPE",
    "name": "Pepe",
    "address": "0x698...",
    "chain": "ethereum"
  },
  "price_data": { /* ... */ },
  "tokenomics": { /* ... */ },
  "onchain": { /* ... */ },
  "red_flags": [ /* ... */ ],
  "analysis": {
    "risk_score": 7,
    "risk_class": "High",
    "sentiment": "bullish"
  },
  "timestamp": "2026-02-16T13:30:00Z"
}
```

#### GET /api/history
```javascript
// Response (200)
{
  "researches": [
    {
      "id": "research_abc123",
      "ticker": "PEPE",
      "name": "Pepe",
      "risk_score": 7,
      "timestamp": "2026-02-16T13:30:00Z"
    }
  ],
  "total": 150
}
```

#### POST /api/webhook/discord
```javascript
// Request
{
  "token": "PEPE",
  "alert_type": "price_spike",
  "change_percent": "+65%",
  "current_price": "$0.000012",
  "research_url": "https://.../research/research_abc123"
}

// Response (200)
{
  "sent": true,
  "message_id": "discord_msg_123"
}
```

### 3.4 File Structure (Backend)
```
/api
├── research.js           # POST /api/research
├── research
│   └── [id].js           # GET /api/research/[id]
├── history.js            # GET /api/history
└── webhook
    └── discord.js        # POST /api/webhook/discord

/lib
├── db.js                 # Database connection
├── apis.js               # External API wrappers
├── analyzer.js           # Analysis logic
├── risk-calculator.js    # Risk score algorithm
└── utils.js              # Helpers

/data
└── research.db           # SQLite database
```

---

## 4. DATABASE SCHEMA

### 4.1 Platformă
- **Engine:** SQLite 3
- **Location:** `/data/research.db` (persistent on Vercel via mounting)
- **Backup:** Daily export to JSON

### 4.2 Tabele

#### Tabela: researches
```sql
CREATE TABLE researches (
  id TEXT PRIMARY KEY,
  ticker TEXT NOT NULL,
  name TEXT,
  address TEXT,
  chain TEXT,
  
  -- Price Data (JSON)
  price_data TEXT,
  
  -- Tokenomics (JSON)
  tokenomics TEXT,
  
  -- On-chain (JSON)
  onchain TEXT,
  
  -- Red Flags (JSON array)
  red_flags TEXT,
  
  -- Analysis
  risk_score INTEGER,
  risk_class TEXT,
  sentiment TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticker ON researches(ticker);
CREATE INDEX idx_created ON researches(created_at);
```

#### Tabela: alerts
```sql
CREATE TABLE alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  research_id TEXT,
  token TEXT NOT NULL,
  alert_type TEXT, -- 'price_spike', 'volume_spike'
  change_percent TEXT,
  current_price TEXT,
  sent_to_discord BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (research_id) REFERENCES researches(id)
);

CREATE INDEX idx_token ON alerts(token);
CREATE INDEX idx_created ON alerts(created_at);
```

#### Tabela: logs
```sql
CREATE TABLE logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT, -- 'research_created', 'alert_sent'
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. EXTERNAL APIs

### 5.1 API Inventory

| API | Purpose | Tier | Rate Limit | Cost |
|-----|---------|------|------------|------|
| CoinGecko | Market data, prices | Free | 10-30 calls/min | $0 |
| CoinMarketCap | Market data, rankings | Free | 10K calls/month | $0 |
| DEXTools | DEX data, on-chain | Scraping | N/A | $0 |
| Etherscan/BSCScan | Contract verification | Free | 5 calls/sec | $0 |
| Twitter/X API | Sentiment analysis | Scraping | N/A | $0 |
| GitHub API | Repo activity | Free | 60 calls/hour | $0 |

### 5.2 API Wrappers (Lib)

```javascript
// lib/apis.js

const apis = {
  // CoinGecko API
  coingecko: {
    baseURL: 'https://api.coingecko.com/api/v3',
    getToken: async (id) => { /* ... */ },
    getMarketData: async (id) => { /* ... */ },
  },
  
  // CoinMarketCap API
  coinmarketcap: {
    baseURL: 'https://pro-api.coinmarketcap.com/v1',
    getToken: async (symbol) => { /* ... */ },
  },
  
  // DEXTools (Scraping)
  dextools: {
    baseURL: 'https://www.dextools.io',
    getTokenData: async (address) => { /* ... */ },
    getHolders: async (address) => { /* ... */ },
  },
  
  // Blockchain Explorers
  etherscan: {
    baseURL: 'https://api.etherscan.io/api',
    verifyContract: async (address) => { /* ... */ },
  },
  
  // Twitter (Scraping via Nitter or similar)
  twitter: {
    getSentiment: async (query) => { /* ... */ },
  }
};
```

### 5.3 Error Handling & Retries

```javascript
// Retry logic pentru API calls
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, options);
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(5000); // Wait 5s before retry
    }
  }
}
```

---

## 6. SECURITY

### 6.1 API Keys Management
- **Storage:** Environment variables (Vercel Dashboard)
- **Never commit:** Keys în cod
- **Rotation:** Lunar

### 6.2 CORS Policy
```javascript
// Allow only GitHub Pages domain
const corsOptions = {
  origin: [
    'https://crypto-research-agent.github.io',
    'http://localhost:3000' // Dev
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
};
```

### 6.3 Rate Limiting (Backend)
```javascript
// Limit: 100 requests per IP per hour
const rateLimit = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100
};
```

### 6.4 Data Validation
- Joi sau Zod pentru schema validation
- Sanitizare input pentru a preveni SQL injection
- Escape HTML în output pentru XSS prevention

---

## 7. DEPLOYMENT

### 7.1 Frontend Deployment (GitHub Pages)
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

### 7.2 Backend Deployment (Vercel)
```bash
# Local dev
vercel dev

# Deploy to production
vercel --prod
```

### 7.3 Environment Variables (Vercel)
```
COINMARKETCAP_API_KEY=xxx
ETHERSCAN_API_KEY=xxx
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DATABASE_URL=/data/research.db
```

---

## 8. MONITORING ȘI LOGGING

### 8.1 Error Tracking
- **Service:** Vercel Analytics (built-in)
- **Alerts:** Email on 500 errors

### 8.2 Performance Monitoring
- **Service:** Vercel Analytics
- **Metrics:** Response time, error rate, invocations

### 8.3 Logging
```javascript
// Structured logging
console.log(JSON.stringify({
  level: 'info',
  message: 'Research created',
  researchId: 'abc123',
  ticker: 'PEPE',
  timestamp: new Date().toISOString()
}));
```

---

## 9. COST ESTIMATION

### 9.1 Monthly Costs

| Service | Tier | Cost |
|---------|------|------|
| GitHub Pages | Free | $0 |
| Vercel | Hobby (Free) | $0 |
| CoinGecko API | Free | $0 |
| CoinMarketCap | Free | $0 |
| DEXTools | Scraping | $0 |
| Etherscan | Free | $0 |
| **TOTAL** | | **$0** |

### 9.2 Limits Free Tiers
- Vercel: 100GB bandwidth, 1000 function invocations/day
- GitHub Pages: 1GB storage, 100GB bandwidth
- APIs: Respect rate limits cu caching

### 9.3 Scale-Up Costs (dacă e nevoie)
- Vercel Pro: $20/lună (mai multe funcții, bandwidth)
- CoinGecko API Paid: $129/lună (rate limits mai mari)

---

## 10. BACKUP ȘI RECOVERY

### 10.1 Database Backup
```javascript
// Daily backup script
const backup = {
  frequency: 'daily',
  destination: 'GitHub repo backup branch',
  retention: '30 days'
};
```

### 10.2 Recovery Plan
1. Database corrupt → Restore din backup JSON
2. API keys compromised → Rotate imediat
3. GitHub Pages down → Switch la Netlify backup

---

*Document version: 1.0*  
*Last updated: 2026-02-16*
