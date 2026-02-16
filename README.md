# Auto-Research Agent pentru Crypto

Generează rapoarte complete și analize de risc pentru token-uri crypto în câteva secunde.

**Status:** ✅ Demo mode activ - testează acum!

## 🚀 Live Demo

- **Frontend:** https://acronim25.github.io/crypto-research-agent
- **API:** https://crypto-research-api.vercel.app (opțional)

## ✨ Features

- 🔍 Research complet pentru orice token (ticker, address, sau nume)
- 📊 Risk Score 1-10 cu clasificare (Low/Medium/High/Extreme)
- 🚩 Detectare automată a 13 red flags
- 📈 Chart preț integrat
- 📱 Design responsive, mobile-first
- 🔔 Monitorizare preț și alerte Discord
- 💾 Istoric research-uri
- 🌐 Limbă: Română

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript (ES2022)
- Chart.js pentru vizualizări
- Font Awesome pentru iconițe
- GitHub Pages pentru hosting

**Backend:**
- Node.js 18.x
- Vercel Serverless Functions
- SQLite pentru database

**APIs:**
- CoinGecko (free tier)
- CoinMarketCap (free tier)
- DEXTools (scraping)
- Etherscan (free tier)

## 📋 Usage

1. Accesează https://crypto-research-agent.github.io
2. Introdu ticker-ul, adresa de contract, sau numele token-ului
3. Apasă "Research"
4. Primești raportul complet în 10-30 secunde

## 🏗️ Development

### Setup Local

```bash
# Clone repository
git clone https://github.com/alexcriss15hunna/crypto-research-agent.git
cd crypto-research-agent

# Install dependencies
npm install

# Run local dev server
npm run dev
```

### Environment Variables

Creează fișier `.env.local`:

```env
COINMARKETCAP_API_KEY=your_key_here
ETHERSCAN_API_KEY=your_key_here
DISCORD_WEBHOOK_URL=your_webhook_here
```

### Deploy

```bash
# Deploy frontend (GitHub Pages)
git push origin main

# Deploy backend (Vercel)
npm run deploy
```

## 📁 Structure

```
crypto-research-agent/
├── api/                    # Vercel serverless functions
├── css/                    # Stylesheets
├── js/                     # JavaScript modules
├── lib/                    # Backend utilities
├── data/                   # SQLite database
├── index.html             # Landing page
├── research.html          # Research report page
├── history.html           # History page
└── README.md
```

## 🎯 Roadmap

- [x] Documentație completă
- [ ] Setup infrastructură
- [ ] API integration
- [ ] Frontend implementation
- [ ] Monitoring și alerte
- [ ] Testing și optimizare

## ⚠️ Disclaimer

Acest tool este pentru scopuri educaționale. Risk score-ul este generat automat pe baza datelor publice și **nu constituie advice financiar**. DYOR (Do Your Own Research) înainte de orice investiție.

## 📄 License

MIT License - vezi [LICENSE](LICENSE) pentru detalii.

---

Built with 💰 pentru comunitatea crypto
