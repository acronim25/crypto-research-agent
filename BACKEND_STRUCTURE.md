# BACKEND_STRUCTURE.md - Database and API Contracts

## Auto-Research Agent pentru Crypto

**Versiune:** 1.0  
**Data:** 2026-02-16

---

## 1. DATABASE SCHEMA

### 1.1 Database Engine
- **Type:** SQLite 3
- **File:** `/data/research.db`
- **Location:** Persistent storage on Vercel (mounted)
- **Backup:** Daily JSON export

### 1.2 Tabelă: researches

Stochează toate research-urile generate.

```sql
CREATE TABLE researches (
  -- Primary Key
  id TEXT PRIMARY KEY,  -- Format: research_[timestamp]_[ticker]
  
  -- Token Identification
  ticker TEXT NOT NULL,
  name TEXT,
  address TEXT,         -- Contract address (if applicable)
  chain TEXT,           -- ethereum, bsc, solana, etc.
  
  -- Price Data (JSON blob)
  price_data TEXT,      -- {
                        --   current_price: number,
                        --   ath: number,
                        --   atl: number,
                        --   ath_percentage: number,
                        --   days_since_ath: number,
                        --   volume_24h: number,
                        --   volume_change_24h: number,
                        --   market_cap_rank: number,
                        --   price_btc: number,
                        --   price_eth: number,
                        --   age_days: number
                        -- }
  
  -- Tokenomics (JSON blob)
  tokenomics TEXT,      -- {
                        --   market_cap: number,
                        --   fully_diluted_valuation: number,
                        --   total_supply: number,
                        --   circulating_supply: number,
                        --   circulation_percentage: number,
                        --   holders_count: number,
                        --   top_10_holders_percentage: number,
                        --   top_holder_percentage: number,
                        --   holders_change_24h: number
                        -- }
  
  -- On-chain Data (JSON blob)
  onchain TEXT,         -- {
                        --   liquidity_pool_usd: number,
                        --   buy_tax_percentage: number,
                        --   sell_tax_percentage: number,
                        --   contract_verified: boolean,
                        --   mint_authority_renounced: boolean,
                        --   ownership_renounced: boolean,
                        --   liquidity_locked: boolean,
                        --   liquidity_locked_until: timestamp,
                        --   honeypot_test: boolean
                        -- }
  
  -- Red Flags (JSON array)
  red_flags TEXT,       -- [
                        --   { check: "honeypot", passed: false, severity: "critical" },
                        --   { check: "contract_verified", passed: true, severity: "medium" },
                        --   ...
                        -- ]
  
  -- Analysis Results
  risk_score INTEGER,           -- 1-10
  risk_class TEXT,              -- 'low' | 'medium' | 'high' | 'extreme'
  sentiment TEXT,               -- 'bullish' | 'bearish' | 'neutral'
  sentiment_score INTEGER,      -- -100 to 100
  social_score INTEGER,         -- 0-100
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_researches_ticker ON researches(ticker);
CREATE INDEX idx_researches_created ON researches(created_at DESC);
CREATE INDEX idx_researches_risk ON researches(risk_score);
```

### 1.3 Tabelă: alerts

Stochează alertele generate de monitorizare.

```sql
CREATE TABLE alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Link to research
  research_id TEXT,
  
  -- Alert Details
  token TEXT NOT NULL,
  alert_type TEXT NOT NULL,     -- 'price_spike' | 'volume_spike'
  change_percent REAL,          -- +65.5 pentru +65.5%
  current_price TEXT,           -- Formatted string
  old_price TEXT,               -- Price at research time
  
  -- Status
  sent_to_discord BOOLEAN DEFAULT 0,
  discord_message_id TEXT,      -- ID mesaj Discord (pentru tracking)
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  
  -- Foreign Key
  FOREIGN KEY (research_id) REFERENCES researches(id)
);

-- Indexes
CREATE INDEX idx_alerts_token ON alerts(token);
CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);
CREATE INDEX idx_alerts_sent ON alerts(sent_to_discord);
```

### 1.4 Tabelă: logs

Logging pentru audit și debugging.

```sql
CREATE TABLE logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Log Details
  action TEXT NOT NULL,         -- 'research_created', 'alert_sent', 'api_error'
  details TEXT,                 -- JSON string cu detalii
  
  -- Request Info
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_logs_action ON logs(action);
CREATE INDEX idx_logs_created ON logs(created_at DESC);
```

### 1.5 Tabelă: monitoring

Track care token-uri sunt în monitorizare activă.

```sql
CREATE TABLE monitoring (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  research_id TEXT NOT NULL,
  ticker TEXT NOT NULL,
  
  -- Price at time of enabling monitoring
  baseline_price REAL,
  baseline_volume REAL,
  
  -- Alert Thresholds
  price_threshold_percentage REAL DEFAULT 50,    -- Alert la ±50%
  volume_threshold_percentage REAL DEFAULT 500,  -- Alert la 500% volume
  
  -- Status
  is_active BOOLEAN DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_check_at TIMESTAMP,
  
  -- Foreign Key
  FOREIGN KEY (research_id) REFERENCES researches(id)
);

-- Indexes
CREATE INDEX idx_monitoring_ticker ON monitoring(ticker);
CREATE INDEX idx_monitoring_active ON monitoring(is_active);
```

---

## 2. API ENDPOINT CONTRACTS

### 2.1 POST /api/research

Creează un nou research pentru un token.

**Request:**
```http
POST /api/research
Content-Type: application/json

{
  "input": "PEPE",
  "type": "ticker"  // "ticker" | "address" | "name"
}
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "research_1708083600_PEPE",
    "status": "complete",
    "timestamp": "2026-02-16T13:00:00Z",
    "redirect_url": "/research/research_1708083600_PEPE"
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_NOT_FOUND",
    "message": "Token-ul nu a fost găsit. Verifică spelling-ul sau adresa de contract.",
    "suggestions": ["PEPE2", "PEPEDOGE"]  // Optional fuzzy matches
  }
}
```

**Response Error (429 Too Many Requests):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Prea multe cereri. Așteaptă un moment.",
    "retry_after": 60
  }
}
```

**Response Error (500 Internal Server):**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Eroare internă. Încearcă din nou."
  }
}
```

### 2.2 GET /api/research/[id]

Returnează datele complete ale unui research.

**Request:**
```http
GET /api/research/research_1708083600_PEPE
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "research_1708083600_PEPE",
    "token": {
      "ticker": "PEPE",
      "name": "Pepe",
      "address": "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
      "chain": "ethereum"
    },
    "price_data": {
      "current_price": 0.00000123,
      "ath": 0.00000456,
      "atl": 0.00000001,
      "ath_percentage": -73.0,
      "days_since_ath": 285,
      "volume_24h": 45000000,
      "volume_change_24h": 15.5,
      "market_cap_rank": 45,
      "price_btc": 2.1e-11,
      "price_eth": 3.8e-10,
      "age_days": 620
    },
    "tokenomics": {
      "market_cap": 520000000,
      "fully_diluted_valuation": 520000000,
      "total_supply": 420690000000000,
      "circulating_supply": 420690000000000,
      "circulation_percentage": 100.0,
      "holders_count": 150000,
      "top_10_holders_percentage": 25.5,
      "top_holder_percentage": 8.2,
      "holders_change_24h": 1250
    },
    "onchain": {
      "liquidity_pool_usd": 8500000,
      "buy_tax_percentage": 0,
      "sell_tax_percentage": 0,
      "contract_verified": true,
      "mint_authority_renounced": true,
      "ownership_renounced": true,
      "liquidity_locked": false,
      "liquidity_locked_until": null,
      "honeypot_test": true
    },
    "red_flags": [
      { "check": "honeypot", "passed": true, "severity": "critical", "description": "Poți vinde token-ul" },
      { "check": "contract_verified", "passed": true, "severity": "high", "description": "Contract verificat pe Etherscan" },
      { "check": "mint_authority", "passed": true, "severity": "critical", "description": "Mint authority renunțată" },
      { "check": "liquidity_locked", "passed": false, "severity": "medium", "description": "Liquidity nu este locked" },
      { "check": "team_doxxed", "passed": false, "severity": "low", "description": "Team anonim" }
    ],
    "analysis": {
      "risk_score": 7,
      "risk_class": "high",
      "sentiment": "bullish",
      "sentiment_score": 65,
      "social_score": 78
    },
    "created_at": "2026-02-16T13:00:00Z"
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "RESEARCH_NOT_FOUND",
    "message": "Research-ul nu a fost găsit."
  }
}
```

### 2.3 GET /api/history

Returnează lista tuturor research-urilor.

**Request:**
```http
GET /api/history
GET /api/history?limit=50&offset=0
GET /api/history?ticker=PEPE
GET /api/history?risk=high
GET /api/history?sort=date&order=desc
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | integer | 50 | Număr rezultate per pagină |
| offset | integer | 0 | Offset pentru paginare |
| ticker | string | - | Filtrează după ticker |
| risk | string | - | Filtrează după risk class (low/medium/high/extreme) |
| sort | string | date | Sortează după (date/risk/name) |
| order | string | desc | Ordine (asc/desc) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "researches": [
      {
        "id": "research_1708083600_PEPE",
        "ticker": "PEPE",
        "name": "Pepe",
        "risk_score": 7,
        "risk_class": "high",
        "created_at": "2026-02-16T13:00:00Z"
      },
      {
        "id": "research_1707997200_DOGE",
        "ticker": "DOGE",
        "name": "Dogecoin",
        "risk_score": 4,
        "risk_class": "medium",
        "created_at": "2026-02-15T13:00:00Z"
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "has_more": true
    }
  }
}
```

### 2.4 POST /api/webhook/discord

Trimite un mesaj în canalul Discord #research.

**Request:**
```http
POST /api/webhook/discord
Content-Type: application/json

{
  "token": "PEPE",
  "alert_type": "research_share",
  "research_id": "research_1708083600_PEPE",
  "risk_score": 7,
  "risk_class": "high",
  "message": "Am făcut research pentru PEPE - Risc 7/10 (Ridicat)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sent": true,
    "discord_message_id": "1234567890",
    "channel": "#research"
  }
}
```

**Response Error (500):**
```json
{
  "success": false,
  "error": {
    "code": "DISCORD_ERROR",
    "message": "Nu s-a putut trimite mesajul pe Discord."
  }
}
```

---

## 3. CRON JOBS (Background Tasks)

### 3.1 Monitorizare Preț (15 minute)

```javascript
// Cron: */15 * * * *

async function monitorPrices() {
  // 1. Get all active monitoring entries
  const activeMonitoring = await db.query(
    'SELECT * FROM monitoring WHERE is_active = 1'
  );
  
  // 2. For each, check current price vs baseline
  for (const monitor of activeMonitoring) {
    const currentPrice = await getCurrentPrice(monitor.ticker);
    const priceChange = ((currentPrice - monitor.baseline_price) / monitor.baseline_price) * 100;
    
    // 3. If change > threshold, create alert
    if (Math.abs(priceChange) >= monitor.price_threshold_percentage) {
      await createAlert({
        research_id: monitor.research_id,
        token: monitor.ticker,
        alert_type: 'price_spike',
        change_percent: priceChange.toFixed(2),
        current_price: currentPrice
      });
    }
  }
  
  // 4. Update last_check timestamp
  await db.query(
    'UPDATE monitoring SET last_check_at = ? WHERE is_active = 1',
    [new Date().toISOString()]
  );
}
```

### 3.2 Send Discord Alerts (5 minute)

```javascript
// Cron: */5 * * * *

async function sendDiscordAlerts() {
  // 1. Get unsent alerts
  const unsentAlerts = await db.query(
    'SELECT * FROM alerts WHERE sent_to_discord = 0 ORDER BY created_at ASC LIMIT 10'
  );
  
  // 2. Send each to Discord
  for (const alert of unsentAlerts) {
    try {
      const message = formatDiscordMessage(alert);
      const discordResponse = await sendToDiscordWebhook(message);
      
      // 3. Mark as sent
      await db.query(
        'UPDATE alerts SET sent_to_discord = 1, discord_message_id = ?, sent_at = ? WHERE id = ?',
        [discordResponse.id, new Date().toISOString(), alert.id]
      );
    } catch (error) {
      console.error('Failed to send Discord alert:', error);
    }
  }
}
```

### 3.3 Database Backup (Daily)

```javascript
// Cron: 0 0 * * * (midnight)

async function backupDatabase() {
  // 1. Export researches to JSON
  const researches = await db.query('SELECT * FROM researches');
  const backupData = {
    timestamp: new Date().toISOString(),
    researches: researches,
    count: researches.length
  };
  
  // 2. Save to backup file
  const backupPath = `/backups/research_${Date.now()}.json`;
  await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
  
  // 3. Keep only last 30 backups
  await cleanupOldBackups(30);
}
```

---

## 4. ERROR HANDLING

### 4.1 API Error Structure

Toate erorile urmează acest format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message în română",
    "details": {} // Optional additional context
  }
}
```

### 4.2 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| TOKEN_NOT_FOUND | 404 | Token-ul nu există în nicio sursă |
| RESEARCH_NOT_FOUND | 404 | Research ID invalid |
| RATE_LIMITED | 429 | Prea multe request-uri |
| INTERNAL_ERROR | 500 | Eroare server internă |
| DISCORD_ERROR | 500 | Eroare la trimiterea pe Discord |
| VALIDATION_ERROR | 400 | Input invalid |
| API_UNAVAILABLE | 503 | API extern indisponibil |

---

*Document version: 1.0*  
*Last updated: 2026-02-16*
