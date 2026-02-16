# IMPLEMENTATION_PLAN.md - Master Blueprint

## Auto-Research Agent pentru Crypto

**Versiune:** 1.0  
**Data:** 2026-02-16  
**Status:** Ready for Execution

---

## EXECUTIVE SUMMARY

Acest document este harta completă pentru construirea Auto-Research Agent. **Nu se modifică în timpul execuției.** Fiecare fază are pași numerotați, dependențe explicite, și livrabile clare.

**Estimare Totală:** 40-50 ore de lucru  
**Prioritate:** High (impact direct pe deciziile de trading)  
**Blocante:** Acces API keys (CoinMarketCap, Etherscan)

---

## FAZA 1: SETUP ȘI INFRASTRUCTURĂ (4-6 ore)

### Obiectiv
Pregătirea mediului de dezvoltare și deploy. Toate tool-urile funcționale.

### Pași

**1.1 Creare Repository GitHub**
- Files: README.md, .gitignore, LICENSE
- Output: Repo public crypto-research-agent

**1.2 Setup GitHub Pages**
- Enable Pages din Settings
- Branch: main, folder: / (root)
- Output: https://crypto-research-agent.github.io live

**1.3 Setup Vercel Account + Project**
- Creare account Vercel (free tier)
- Connect repo GitHub
- Set environment variables:
  - COINMARKETCAP_API_KEY
  - ETHERSCAN_API_KEY
  - DISCORD_WEBHOOK_URL
- Output: https://crypto-research-api.vercel.app live

**1.4 Creare Structură Foldere**
```
crypto-research-agent/
├── .github/workflows/
├── api/
│   ├── research.js
│   ├── research/[id].js
│   ├── history.js
│   └── webhook/discord.js
├── lib/
│   ├── db.js
│   ├── apis.js
│   ├── analyzer.js
│   └── utils.js
├── css/
│   ├── 01-design-tokens.css
│   ├── 02-reset.css
│   ├── 03-base.css
│   ├── 04-layout.css
│   ├── 05-components.css
│   ├── 06-sections.css
│   └── 07-utilities.css
├── js/
│   ├── config.js
│   ├── api.js
│   ├── state.js
│   ├── components/
│   └── pages/
├── data/
│   └── .gitkeep
└── (root html files)
```

**1.5 Setup SQLite Database**
- File: lib/db.js
- Schema: Creare tabele researches, alerts, logs, monitoring
- Test: INSERT/SELECT test
- Output: DB funcțional pe Vercel

### Livrabile Faza 1
- [ ] Repo GitHub creat și configurat
- [ ] GitHub Pages live (hello world)
- [ ] Vercel API live (hello world)
- [ ] DB SQLite creat și testat
- [ ] Environment variables setate

### Blockers
- Necesit: API keys pentru CoinMarketCap, Etherscan

---

## FAZA 2: API EXTERNE ȘI DATA FETCHING (6-8 ore)

### Obiectiv
Conectarea la toate API-urile externe și testarea lor.

### Pași

**2.1 Implementare CoinGecko API Wrapper**
- File: lib/apis.js - coingecko object
- Endpoints: /coins/{id}, /coins/{id}/market_chart
- Test: Fetch BTC data, verificare structură răspuns
- Output: Funcție getCoinData(id) funcțională

**2.2 Implementare CoinMarketCap API Wrapper**
- File: lib/apis.js - coinmarketcap object
- Endpoints: /v1/cryptocurrency/quotes/latest
- Test: Fetch ETH data, verificare structură
- Output: Funcție getCMCData(symbol) funcțională

**2.3 Implementare DEXTools Scraping**
- File: lib/apis.js - dextools object
- Scraping: Token data, holders, liquidity
- Error handling: Retry logic, fallbacks
- Output: Funcție getDEXData(address) funcțională

**2.4 Implementare Etherscan API**
- File: lib/apis.js - etherscan object
- Endpoints: contract verification, token info
- Output: Funcție verifyContract(address) funcțională

**2.5 Implementare Twitter Sentiment (Scraping)**
- File: lib/apis.js - twitter object
- Scraping: Search tweets, analiză volum
- Output: Funcție getSentiment(query) funcțională

**2.6 Token Identification Logic**
- File: lib/utils.js - identifyToken(input)
- Logic: Detectare tip input (ticker/address/name)
- Mapping: Căutare în multiple surse
- Output: Returnează token ID + chain

### Livrabile Faza 2
- [ ] Toate API wrapper-ele funcționale
- [ ] Test suite pentru fiecare API
- [ ] Token identification logic
- [ ] Error handling + retry logic

### Blockers
- Rate limits la API-uri (testăm pe free tiers)

---

## FAZA 3: ANALIZĂ ȘI RISK SCORING (6-8 ore)

### Obiectiv
Algoritmii de analiză și calcul risk score.

### Pași

**3.1 Implementare Price Data Analysis**
- File: lib/analyzer.js - analyzePriceData()
- Calcul: ATH%, volume trends, age
- Output: Price analysis object

**3.2 Implementare Tokenomics Analysis**
- File: lib/analyzer.js - analyzeTokenomics()
- Calcul: Supply metrics, holder distribution
- Output: Tokenomics analysis object

**3.3 Implementare On-chain Analysis**
- File: lib/analyzer.js - analyzeOnChain()
- Verificare: Contract verification, taxes, liquidity
- Output: On-chain analysis object

**3.4 Implementare Red Flags Detection**
- File: lib/analyzer.js - detectRedFlags()
- Checklist: 13 red flags (vezi PRD)
- Output: Array de red flags cu passed/failed

**3.5 Implementare Risk Score Algorithm**
- File: lib/risk-calculator.js
- Formula: Weighted scoring based on:
  - Red flags (40%)
  - Token age (15%)
  - Holder distribution (15%)
  - Liquidity (15%)
  - Social metrics (15%)
- Output: Risk score 1-10 + classification

**3.6 Implementare Sentiment Analysis**
- File: lib/analyzer.js - analyzeSentiment()
- Logic: Twitter sentiment scoring
- Output: Sentiment score -100 to +100

### Livrabile Faza 3
- [ ] Toate funcțiile de analiză implementate
- [ ] Risk score algorithm testat
- [ ] Red flags detection completă
- [ ] Unit tests pentru analiză

---

## FAZA 4: BACKEND API ENDPOINTS (6-8 ore)

### Obiectiv
Toate API endpoint-urile funcționale.

### Pași

**4.1 POST /api/research**
- File: api/research.js
- Logic: Primește input, identifică token, extrage date, analizează, salvează în DB
- Output: Research ID
- Test: Curl/Postman test

**4.2 GET /api/research/[id]**
- File: api/research/[id].js
- Logic: Returnează research data din DB
- Output: JSON complet research
- Test: Verificare toate câmpurile

**4.3 GET /api/history**
- File: api/history.js
- Logic: Query DB cu filtre, paginare
- Output: Lista research-uri
- Test: Test filters, pagination

**4.4 POST /api/webhook/discord**
- File: api/webhook/discord.js
- Logic: Formatează mesaj, trimite la Discord webhook
- Output: Confirmare trimitere
- Test: Verificare mesaj în Discord

**4.5 Error Handling Middleware**
- File: lib/utils.js - errorHandler
- Logic: Standard error responses
- Output: Consistent error format

**4.6 Rate Limiting**
- File: middleware/rateLimit.js
- Logic: 100 req/hour per IP
- Output: 429 responses când depășește

### Livrabile Faza 4
- [ ] Toate 4 endpoint-uri funcționale
- [ ] Error handling consistent
- [ ] Rate limiting activ
- [ ] Test suite pentru API

---

## FAZA 5: FRONTEND - DESIGN SYSTEM (4-6 ore)

### Obiectiv
CSS complet conform DESIGN_SYSTEM.md.

### Pași

**5.1 Design Tokens CSS**
- File: css/01-design-tokens.css
- Content: Variabile pentru colors, spacing, typography
- Output: Toate token-urile definite

**5.2 Reset și Base CSS**
- Files: css/02-reset.css, css/03-base.css
- Content: Normalize, base styles pentru body, headings, links
- Output: Stiluri de bază aplicate

**5.3 Layout CSS**
- File: css/04-layout.css
- Content: Grid system, container, responsive breakpoints
- Output: Layout responsive funcțional

**5.4 Components CSS**
- File: css/05-components.css
- Components: Buttons, cards, forms, badges, risk indicators
- Output: Toate componentele stilizate

**5.5 Sections CSS**
- File: css/06-sections.css
- Sections: Header, hero, data grids, footer
- Output: Stiluri specifice pentru secțiuni

**5.6 Utilities CSS**
- File: css/07-utilities.css
- Utilities: Margin, padding, text alignment, display
- Output: Helper classes disponibile

### Livrabile Faza 5
- [ ] Toate fișierele CSS complete
- [ ] Design system implementat 100%
- [ ] Responsive pe toate breakpoint-urile
- [ ] Test vizual în browser

---

## FAZA 6: FRONTEND - PAGINI ȘI COMPONENTS (8-10 ore)

### Obiectiv
Toate paginile HTML și JavaScript funcționale.

### Pași

**6.1 Landing Page (index.html)**
- File: index.html + js/pages/index.js
- Content: Hero, form input, short description
- Features: Input validation, loading state
- Output: Pagină funcțională

**6.2 Research Report Page (research.html)**
- File: research.html + js/pages/research.js
- Sections: Risk badge, price chart, tokenomics, red flags, conclusion
- Components: Chart.js integration, data grids
- Output: Raport infografic complet

**6.3 History Page (history.html)**
- File: history.html + js/pages/history.js
- Content: Listă research-uri, filters, sort
- Features: Search, pagination
- Output: Istoric navigabil

**6.4 Componente JavaScript**
- Files: js/components/*.js
- Components: RiskBadge, PriceChart, DataGrid, RedFlagItem
- Output: Componente reutilizabile

**6.5 API Integration (Frontend)**
- File: js/api.js
- Functions: createResearch, getResearch, getHistory, shareToDiscord
- Error handling: UI error messages
- Output: Comunicare API funcțională

**6.6 State Management**
- File: js/state.js
- Features: Global state, localStorage persistence
- Output: State management funcțional

### Livrabile Faza 6
- [ ] Toate 3 pagini HTML complete
- [ ] Toate componente JS funcționale
- [ ] API integration testată
- [ ] User journey complet funcțional

---

## FAZA 7: MONITORING ȘI ALERTE (4-6 ore)

### Obiectiv
Sistem de monitorizare și alerte pe Discord.

### Pași

**7.1 Database Table monitoring**
- SQL: Creare tabelă monitoring
- Logic: Stocare token-uri în monitorizare
- Output: Tabelă creată

**7.2 Cron Job - Monitorizare Preț**
- Config: Vercel Cron (15 minute)
- Logic: Check price changes, create alerts
- Output: Alerts create în DB

**7.3 Cron Job - Send Discord Alerts**
- Config: Vercel Cron (5 minute)
- Logic: Send unsent alerts to Discord
- Output: Mesaje primite în Discord

**7.4 Enable Monitoring UI**
- Feature: Buton "Monitorizează" în research page
- Logic: Adaugă în tabela monitoring
- Output: User poate activa monitorizare

### Livrabile Faza 7
- [ ] Tabela monitoring creată
- [ ] Cron jobs configurate și testate
- [ ] Alerte primite în Discord
- [ ] UI pentru enable/disable monitoring

---

## FAZA 8: TESTING ȘI POLISH (4-6 ore)

### Obiectiv
Aplicație stabilă, bug-free, ready for production.

### Pași

**8.1 Manual Testing**
- Test: Toate user journeys (happy path + errors)
- Test: Responsive pe mobile, tablet, desktop
- Test: Cross-browser (Chrome, Firefox, Safari)
- Output: Bug list + fixes

**8.2 Error Handling Review**
- Review: Toate API error cases
- Review: Frontend error states
- Output: Graceful error handling everywhere

**8.3 Performance Optimization**
- Task: Image optimization
- Task: Code splitting
- Task: Lazy loading
- Output: Lighthouse score > 80

**8.4 Documentation**
- File: README.md (setup instructions)
- File: DEPLOY.md (deployment guide)
- Output: Documentație completă

**8.5 Final Deploy**
- Task: Production deploy GitHub Pages
- Task: Production deploy Vercel
- Test: Live application testing
- Output: App live and functional

### Livrabile Faza 8
- [ ] Testing complet, bugs fixed
- [ ] Performance optimizat
- [ ] Documentație scrisă
- [ ] Production deploy live

---

## DEPENDENȚE ȘI ORDINE

```
Faza 1 (Setup)
    ↓
Faza 2 (APIs) ───────┐
    ↓                │
Faza 3 (Analiză) ────┤
    ↓                │
Faza 4 (Backend) ◄───┘
    ↓
Faza 5 (CSS) ────────┐
    ↓                │
Faza 6 (Frontend) ◄──┘
    ↓
Faza 7 (Monitoring)
    ↓
Faza 8 (Testing)
```

**Paralelizare posibilă:**
- Faza 5 (CSS) poate începe după Faza 2
- Faza 3 și 4 pot fi parțial paralele

---

## MILESTONE-URI

| Milestone | Faze | Data Estimată | Livrabile |
|-----------|------|---------------|-----------|
| M1: API Funcțional | 1-4 | Ziua 3-4 | Endpoint-uri testabile |
| M2: UI Complet | 5-6 | Ziua 6-7 | Toate paginile funcționale |
| M3: Production | 7-8 | Ziua 8-10 | App live și stabilă |

---

## RESURSE NECESARE

**API Keys:**
- CoinMarketCap API Key (free)
- Etherscan API Key (free)
- Discord Webhook URL

**Accounts:**
- GitHub account
- Vercel account

**Tools:**
- VS Code
- Postman (pentru API testing)
- Git

---

## RISCURI ȘI MITIGARE

| Risc | Probabilitate | Impact | Mitigare |
|------|--------------|--------|----------|
| API rate limits | Mediu | Mediu | Caching, retry logic |
| API change/break | Mic | Mare | Abstract API layer |
| Vercel free tier limits | Mediu | Mediu | Optimizare, caching |
| Token nou, date lipsă | Mare | Mic | Handle gracefully |

---

*Document version: 1.0*  
*Last updated: 2026-02-16*  
**ACEST DOCUMENT NU SE MODIFICĂ ÎN TIMPUL EXECUȚIEI**
