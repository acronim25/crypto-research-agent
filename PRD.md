# PRD.md - Product Requirements Document

## Auto-Research Agent pentru Crypto

**Versiune:** 1.0  
**Data:** 2026-02-16  
**Limba:** Română  
**Status:** Draft

---

## 1. VIZIUNE ȘI OBIECTIVE

### 1.1 Problemă Rezolvată
Utilizatorul (trader crypto) are nevoie de research rapid și complet despre token-uri noi înainte de a investi. Procesul manual de verificare a multiplelor surse (CoinGecko, DEXTools, social media, etc.) consumă timp și este predispus la omisiuni.

### 1.2 Soluție
O aplicație web care primește input (ticker, contract address, sau nume complet) și generează un raport infografic vizual complet în limba română, cu toate datele esențiale, analize și red flags.

### 1.3 Obiective Cheie
- Timp de research redus de la 30-45 minute la 2-3 minute
- Zero omisiuni în verificarea red flags
- Consistență în evaluarea riscului (score 1-10)
- Monitorizare continuă a token-urilor research-ate

---

## 2. FEATURES ȘI USER STORIES

### FEAT-001: Form de Input
**Ca utilizator**, vreau să introduc un token prin ticker, contract address sau nume complet, pentru a initia research-ul.

**Acceptance Criteria:**
- [ ] Input field acceptă: ticker (ex: BTC), contract address (0x...), nume complet (Bitcoin)
- [ ] Auto-detect tip input (regex pentru address)
- [ ] Validare input înainte de submit
- [ ] Loading state vizibil după submit
- [ ] Mesaj clar dacă token-ul nu există: "Token-ul nu a fost găsit. Verifică spelling-ul sau adresa de contract."

### FEAT-002: Dashboard cu Raport Infografic
**Ca utilizator**, vreau să văd un raport vizual organizat pe secțiuni, pentru a înțelege rapid token-ul.

**Acceptance Criteria:**
- [ ] 8 secțiuni obligatorii: Overview, Tokenomics, Team, Use Case, Red Flags, Social Sentiment, Price Action, Concluzie
- [ ] Fiecare secțiune are max 10 bullet points
- [ ] Design infografic cu iconițe, culori, și layout vizual
- [ ] Include imagini: chart preț, logo token, screenshot-uri relevante
- [ ] Limba: Română exclusiv
- [ ] Loading skeleton în timpul generării

### FEAT-003: Colectare Date Preț și Market Data
**Ca sistem**, trebuie să extrag toate datele de preț și market pentru analiză completă.

**Acceptance Criteria:**
- [ ] Preț curent (USD)
- [ ] ATH (All Time High) și ATL (All Time Low)
- [ ] ATH% (cât % sub ATH)
- [ ] Zile de la ATH
- [ ] Volume 24h și trend (↑/↓ vs ieri)
- [ ] Market cap rank
- [ ] Preț în BTC și ETH pairs
- [ ] Age (zile de la launch)

### FEAT-004: Colectare Date Tokenomics
**Ca sistem**, trebuie să extrag toate datele tokenomics.

**Acceptance Criteria:**
- [ ] Market cap
- [ ] Fully Diluted Valuation (FDV)
- [ ] Total supply
- [ ] Circulating supply
- [ ] % din supply în circulație
- [ ] Holders count
- [ ] Top 10 holders (% din supply)
- [ ] Top holder (% din supply)
- [ ] Holders growth vs ieri (creștere sau scădere)

### FEAT-005: Colectare Date On-chain (DEX)
**Ca sistem**, trebuie să verific datele on-chain pentru tokens DEX.

**Acceptance Criteria:**
- [ ] Liquidity pool size (USD)
- [ ] Buy tax %
- [ ] Sell tax %
- [ ] Contract verified (da/nu)
- [ ] Mint authority renunțată (da/nu)
- [ ] Ownership renunțată (da/nu)
- [ ] Liquidity locked (da/nu + până când)
- [ ] Honeypot test (poți vinde după ce cumperi?)

### FEAT-006: Analiză și Scoruri
**Ca sistem**, trebuie să calculez metrici de analiză.

**Acceptance Criteria:**
- [ ] Risk score 1-10 (1 = foarte sigur, 10 = extrem de riscant)
- [ ] Risk classification (Low/Medium/High/Extreme)
- [ ] Sentiment analysis din Twitter (bullish/bearish/neutral)
- [ ] Social score (cât de activă e comunitatea)
- [ ] Trend analysis (uptrend/downtrend/sideways)
- [ ] Comparație cu proiecte similare (market cap, growth)

### FEAT-007: Verificare Red Flags
**Ca sistem**, trebuie să verific toate red flags posibile.

**Acceptance Criteria:**
- [ ] Honeypot (nu poți vinde)
- [ ] Contract unverified
- [ ] Mint enabled (pot crea infinit tokeni)
- [ ] Ownership not renounced
- [ ] Liquidity unlocked
- [ ] Suspicious wallet patterns (whale accumulation)
- [ ] Team anonim + no track record
- [ ] Website down/unprofessional
- [ ] No social media activity (ultima postare >30 zile)
- [ ] No whitepaper
- [ ] Copy-paste code (nu e original)
- [ ] Same contract ca alte scam-uri
- [ ] Audit missing sau fail

### FEAT-008: Salvare și Istoric
**Ca sistem**, trebuie să salvez toate research-urile.

**Acceptance Criteria:**
- [ ] Toate research-urile salvate în DB permanent
- [ ] Timestamp pentru fiecare research
- [ ] Log: cine a cerut + când
- [ ] Lista tuturor research-urilor anterioare accesibilă
- [ ] Posibilitate de re-run research (reface complet)

### FEAT-009: Monitorizare și Alerte
**Ca sistem**, trebuie să monitorizez token-uri și să alertez.

**Acceptance Criteria:**
- [ ] Monitorizare automată pentru token-urile research-ate
- [ ] Alertă Discord când prețul schimbă ±50%
- [ ] Alertă Discord când volume spike >500%
- [ ] Alertă include: ticker, preț nou, change %, link către research

### FEAT-010: Integrare Discord
**Ca utilizator**, vreau să share-uiesc rapoarte în Discord.

**Acceptance Criteria:**
- [ ] Buton "Share to Discord" în dashboard
- [ ] Trimite rezumat în canalul #research
- [ ] Include link către raportul complet
- [ ] Formatare frumoasă pentru Discord (embed)

### FEAT-011: Bookmark Browser
**Ca utilizator**, vreau să salvez rapoarte pentru referință ulterioară.

**Acceptance Criteria:**
- [ ] URL unic pentru fiecare research (shareable)
- [ ] URL include timestamp și ticker
- [ ] Pagina încarcă research-ul salvat din DB

### FEAT-012: Integrare Jurnal Trading
**Ca utilizator**, vreau să adaug token-ul în watchlist/jurnal.

**Acceptance Criteria:**
- [ ] Buton "Add to Watchlist"
- [ ] Salvează în sistemul existent de jurnal
- [ ] Include note optionale

---

## 3. NON-FUNCTIONAL REQUIREMENTS

### NFR-001: Performance
- Timp generare raport: < 30 secunde pentru token-uri cunoscute
- Timp generare raport: < 60 secunde pentru token-uri noi/obscure
- Load time pagină: < 2 secunde

### NFR-002: Availability
- Uptime target: 99% (GitHub Pages + Vercel functions)
- Retry logic pentru API-uri fail: 3x cu delay 5 secunde

### NFR-003: Scalability
- Suportă nelimitat research-uri per zi (rate limits doar la nivel de API externe)
- DB scale: SQLite local (suficient pentru utilizare personală)

### NFR-004: Security
- Logging: cine ce a cerut + când (pentru audit)
- No sensitive data storage (nu stocăm keys, doar public data)

### NFR-005: Accessibility
- Limba: Română exclusiv
- Design responsive (mobile-first)

---

## 4. CONSTRÂNGERI

### Business Constraints
- Budget API: $0 (doar free tiers și scraping)
- Hosting: GitHub Pages (frontend) + Vercel/Netlify (serverless functions)
- Limbă: Română obligatoriu

### Technical Constraints
- APIs disponibile: CoinGecko free, CoinMarketCap free, DEXTools scraping, Moonshot
- No authentication required (public access)
- Static site hosting (GitHub Pages)

### Legal Constraints
- Doar risk score, zero advice financiar explicit
- No "buy/sell/hold" recommendations
- User-ul ia propriile decizii (DYOR)

---

## 5. METRICS DE SUCCES

- **Timp mediu research:** < 30 secunde (vs 30-45 minute manual)
- **Red flags detectate:** 100% din lista verificată
- **Uptime:** > 99%
- **Utilizare:** Minim 10 research-uri pe săptămână

---

*Document version: 1.0*  
*Last updated: 2026-02-16*
