# APP_FLOW.md - Application Flow and User Journeys

## Auto-Research Agent pentru Crypto

**Versiune:** 1.0  
**Data:** 2026-02-16

---

## 1. ARHITECTURA APLICAȚIEI

### 1.1 Structura de Pagini

```
/
├── /index.html              # Landing + Form Input (Entry Point)
├── /research/[id].html      # Raport Infografic (Dynamic)
├── /history.html            # Istoric Research-uri
└── /about.html              # Despre Aplicație
```

### 1.2 Componente Principale

**Frontend (GitHub Pages - Static):**
- `index.html` - Form input + Landing page
- `research.html` - Template pentru raport (populat dinamic cu JS)
- `history.html` - Lista research-urilor anterioare
- `app.js` - Logică principală, API calls, rendering
- `styles.css` - Stiluri conform DESIGN_SYSTEM.md

**Backend (Vercel Serverless Functions):**
- `/api/research` - POST: Primește input, returnează research ID
- `/api/research/[id]` - GET: Returnează datele complete ale unui research
- `/api/history` - GET: Returnează lista tuturor research-urilor
- `/api/webhook/discord` - POST: Trimite alerte către Discord

**Database (SQLite pe Vercel/Local):**
- Tabelă `researches` - Stochează toate research-urile
- Tabelă `alerts` - Stochează alertele trigger-ate
- Tabelă `logs` - Loghează cine ce a cerut

---

## 2. USER JOURNEYS

### Journey 1: Research Nou (Cazul Fericit)

**User:** Alex  
**Scop:** Vrea să research-eze un token nou auzit pe Twitter

```
1. ACCESARE
   └── User intră pe https://crypto-research-agent.github.io
   └── Pagina index.html se încarcă (< 2 sec)
   └── Vede: Header, Form Input, Scurt descriere, Footer

2. INPUT
   └── User tastează în form: "PEPE" (sau "0x698..." sau "Pepe Coin")
   └── Client-side validation: detectează tipul input-ului
   └── User apasă butonul "Research"

3. SUBMIT ȘI LOADING
   └── POST către /api/research cu payload: {input: "PEPE", type: "ticker"}
   └── UI arată loading spinner + mesaj: "Se analizează token-ul..."
   └── Backend procesează:
       ├── Identifică token-ul unic
       ├── Extrage date din multiple surse (CoinGecko, DEXTools, etc.)
       ├── Calculează metrici și risk score
       ├── Verifică red flags
       ├── Salvează în DB
       └── Returnează: {id: "research_abc123", status: "complete"}

4. REDIRECT ȘI AFIȘARE RAPORT
   └── Redirect către /research/research_abc123.html
   └── GET /api/research/research_abc123
   └── Primește JSON cu toate datele
   └── Rendering dinamic al raportului infografic:
       ├── Secțiunea Overview (logo, nume, descriere)
       ├── Secțiunea Price Action (chart, ATH/ATL, etc.)
       ├── Secțiunea Tokenomics (supply, holders, etc.)
       ├── Secțiunea On-chain (liquidity, taxes, etc.)
       ├── Secțiunea Red Flags (checklist cu ✅/❌)
       ├── Secțiunea Team & Use Case
       ├── Secțiunea Social Sentiment
       └── Secțiunea Concluzie (risk score mare, vizibil)

5. ACȚIUNI POST-RESEARCH
   └── User poate:
       ├── Click "Share to Discord" → POST /api/webhook/discord → Mesaj în #research
       ├── Click "Add to Watchlist" → Salvează în jurnal trading
       ├── Click "Bookmark" → Salvează URL în browser
       ├── Click "Research Another" → Înapoi la index.html
       └── Click "View History" → history.html
```

### Journey 2: Token Nu Există (Eroare)

```
1. INPUT
   └── User introduce: "XYZTOKEN123" (token inexistent)

2. VALIDARE
   └── Backend caută în toate sursele
   └── Nu găsește match în CoinGecko, CMC, DEXTools

3. RĂSPUNS EROARE
   └── Returnează: {error: "Token not found", suggestions: []}
   └── UI afișează:
       ├── Mesaj roșu: "Token-ul nu a fost găsit. Verifică spelling-ul sau adresa de contract."
       ├── Formul rămâne deschis cu valoarea precedentă
       └── Sugestii similare (dacă există fuzzy match)

4. RETRY
   └── User corectează și retrimite
```

### Journey 3: Token Abia Listat (Warning)

```
1. INPUT
   └── User introduce: "TOKEN_ABIA_LANSAT"

2. DETECTARE
   └── Backend găsește token-ul
   └── Detectează: age < 7 zile, volume = 0, holders < 100

3. RĂSPUNS CU WARNING
   └── Returnează research complet
   └── UI afișează:
       ├── Banner galben mare: "⚠️ ATENȚIE: Token abia lansat (< 7 zile). Date limitate. Risc extrem."
       ├── Research-ul continuă normal
       └── Risk score probabil HIGH sau EXTREME
```

### Journey 4: Re-search Același Token

```
1. INPUT
   └── User introduce: "PEPE" (același ticker ca în Journey 1, aceeași zi)

2. DETECTARE DUPLICAT
   └── Backend verifică: există research pentru "PEPE" în ultimele 24h?
   └── Găsește: research_abc123 creat acum 2 ore

3. DECIZIE
   └── Conform cerințelor: refaci research (nu cached)
   └── Motiv: datele se pot schimba rapid în crypto

4. PROCESARE NOUĂ
   └── Creează research nou: research_def456
   └── Extrage date fresh (nu folosește cache)
   └── Compară implicit cu research_abc123 (arată Δ)
   └── Salvează nou

5. AFIȘARE
   └── Raport nou cu timestamp actual
   └── Include secțiune opțională: "Comparație cu research anterior"
       ├── Preț anterior vs curent
       ├── Holders growth
       └── Orice schimbări majore
```

### Journey 5: Vizualizare Istoric

```
1. NAVIGARE
   └── User click "Istoric" sau navighează direct la /history.html

2. LOADING LISTĂ
   └── GET /api/history
   └── Returnează lista tuturor research-urilor (ordered by date desc)
   ├── research_def456 - PEPE - 2026-02-16 14:30
   ├── research_abc123 - PEPE - 2026-02-16 12:15
   ├── research_xyz789 - DOGE - 2026-02-15 18:00
   └── ...

3. AFIȘARE
   └── Tabel/cards cu:
       ├── Ticker/Logo
       ├── Data și ora
       ├── Risk Score (color coded)
       ├── Link către raport complet
       └── Buton "Research Again"

4. FILTRARE ȘI SORTARE
   └── User poate:
       ├── Filtra după ticker
       ├── Filtra după risk score (doar HIGH)
       ├── Sorta după dată (newest/oldest)
       └── Sorta după risk score
```

### Journey 6: Alertă Automată (Background)

```
1. TRIGGER
   └── Cron job rulează la fiecare 15 minute
   └── Verifică toate token-urile din tabela `researches`

2. VERIFICARE CONDIȚII
   └── Pentru fiecare token:
       ├── Preț curent vs preț la research: ±50%?
       ├── Volume 24h vs avg 7 zile: >500%?
       └── Dacă DA → creează alertă

3. TRIMITERE ALERTĂ
   └── POST /api/webhook/discord
   └── Payload:
       {
         "token": "PEPE",
         "alert_type": "price_spike",
         "change_percent": "+65%",
         "current_price": "$0.000012",
         "research_url": "https://.../research/research_abc123",
         "timestamp": "2026-02-16 15:45"
       }
   └── Discord bot postează în canalul #research:
       🚨 ALERTĂ: PEPE +65% în ultimele ore!
       Preț curent: $0.000012
       Research complet: [Link]
       @alexcriss15hunna

4. LOGGING
   └── Salvează alerta în tabela `alerts`
   └── Evită duplicate (nu alerta de 2x pentru același event în 1h)
```

---

## 3. FLOW-URI TEHNICE

### 3.1 Backend Flow: Research Endpoint

```
POST /api/research
├── 1. Primește input: {input: "PEPE", type: "ticker"}
├── 2. Normalizează input (uppercase, trim)
├── 3. Identificare token:
│   ├── Încearcă CoinGecko API
│   ├── Încearcă CoinMarketCap API
│   ├── Încearcă DEXTools (dacă e DEX token)
│   └── Dacă nu găsește → return 404 + error message
├── 4. Extrage date (parallel requests):
│   ├── CoinGecko: market data
│   ├── DEXTools: on-chain data
│   ├── Twitter API: sentiment
│   ├── Website: scraping pentru info suplimentar
│   └── GitHub: activity (dacă există)
├── 5. Procesare și calcul:
│   ├── Calculează metrici (growth, ratios)
│   ├── Verifică red flags (13 checkpoints)
│   ├── Calculează risk score (algoritm ponderat)
│   ├── Analizează sentiment
│   └── Compară cu proiecte similare
├── 6. Salvare:
│   ├── Generează ID unic: research_[timestamp]_[ticker]
│   ├── Salvează în SQLite: tabela `researches`
│   └── Log: cine a cerut (IP, timestamp)
├── 7. Returnează: {id, status, timestamp}
└── 8. Dacă monitorizare activată → adaugă la watchlist
```

### 3.2 Frontend Flow: Rendering Raport

```
/research/[id].html se încarcă
├── 1. Extrage ID din URL
├── 2. GET /api/research/[id]
├── 3. Dacă 404 → arată "Research not found"
├── 4. Dacă 200 → primește JSON cu date
├── 5. Rendering secțiuni:
│   ├── Header: Logo, nume, ticker, risk score badge
│   ├── Grid layout pentru secțiuni
│   ├── Secțiunea 1: Overview (card mare)
│   ├── Secțiunea 2: Price Action (chart + stats)
│   ├── Secțiunea 3: Tokenomics (3 coloane)
│   ├── Secțiunea 4: On-chain (badges verzi/roșii)
│   ├── Secțiunea 5: Red Flags (lista cu iconițe)
│   ├── Secțiunea 6: Team & Use Case (text)
│   ├── Secțiunea 7: Social (grafic sentiment)
│   └── Secțiunea 8: Concluzie (risk score mare + summary)
├── 6. Adaugă butoane acțiuni (Share, Bookmark, Watchlist)
├── 7. Adaugă timestamp și disclaimer
└── 8. Hydrate interactivitate (tooltips, etc.)
```

### 3.3 Error Handling Flow

```
Erori Posibile:
├── API External Down:
│   ├── Retry 3x cu delay 5s
│   ├── Dacă tot fail → folosește cache (dacă există < 1h)
│   └── Dacă nu există cache → return error "Service temporar indisponibil"
├── Rate Limit API:
│   ├── Queue request
│   └── Return "Se procesează..." + poll pentru status
├── Token Ambiguu (multiple matches):
│   ├── Return listă: "Am găsit 3 token-uri 'PEPE'. Alege:"
│   └── Dropdown cu opțiuni
└── Network Error:
    └── Return "Verifică conexiunea și încearcă din nou"
```

---

## 4. NAVIGAȚIE ȘI URL STRUCTURE

| URL | Pagina | Descriere |
|-----|--------|-----------|
| `/` | index.html | Landing + Form input |
| `/research/[id]` | research.html | Raport infografic specific |
| `/history` | history.html | Lista tuturor research-urilor |
| `/about` | about.html | Informații despre aplicație |

---

## 5. STATE MANAGEMENT

### 5.1 Frontend State
- **Global:** Niciun state global complex
- **Per Page:**
  - index.html: Form input value, loading state
  - research.html: Research data (fetch on load), error state
  - history.html: List of researches, filter state

### 5.2 Backend State
- **Database:** SQLite persistent
- **Cache:** In-memory pentru API responses (TTL: 5 minute)
- **Queue:** Pentru requests care necesită processing heavy

---

## 6. CONDIȚII DE LOAD ȘI ERROR

### 6.1 Ce Se Întâmplă Când:

**Nu există date pentru o secțiune?**
- Afișează: "Date indisponibile" sau "N/A"
- Nu ascunde secțiunea complet
- Gray out secțiunea respectivă

**Chart-ul nu poate fi generat?**
- Afișează placeholder
- Buton "Reîncearcă"
- Log error pentru debugging

**Red flag nu poate fi verificat?**
- Afișează "⚠️ Nu s-a putut verifica"
- Nu presupune că e safe

**Token e pe CEX nu DEX (nu are on-chain data)?**
- Secțiunea On-chain arată: "Token CEX - date on-chain indisponibile"
- Continuă cu restul analizei

---

*Document version: 1.0*  
*Last updated: 2026-02-16*
