// ============================================
// MOCK-DATA.JS - Extensive Mock Data for Crypto Research Agent
// ============================================

const MOCK_DATA = {
  // Extended token database for autocomplete
  tokens: [
    // Layer 1
    { symbol: 'BTC', name: 'Bitcoin', category: 'Layer 1', price: 64230.50, change24h: 2.34, marketCap: 1260000000000 },
    { symbol: 'ETH', name: 'Ethereum', category: 'Layer 1', price: 3450.20, change24h: 1.89, marketCap: 415000000000 },
    { symbol: 'SOL', name: 'Solana', category: 'Layer 1', price: 142.80, change24h: 5.67, marketCap: 68000000000 },
    { symbol: 'ADA', name: 'Cardano', category: 'Layer 1', price: 0.58, change24h: -1.23, marketCap: 20500000000 },
    { symbol: 'DOT', name: 'Polkadot', category: 'Layer 1', price: 7.45, change24h: 0.89, marketCap: 11200000000 },
    { symbol: 'AVAX', name: 'Avalanche', category: 'Layer 1', price: 35.60, change24h: 3.45, marketCap: 14200000000 },
    { symbol: 'NEAR', name: 'NEAR Protocol', category: 'Layer 1', price: 3.85, change24h: 4.21, marketCap: 4200000000 },
    { symbol: 'ATOM', name: 'Cosmos Hub', category: 'Layer 1', price: 8.92, change24h: -0.56, marketCap: 3500000000 },
    { symbol: 'SUI', name: 'Sui', category: 'Layer 1', price: 1.45, change24h: 8.90, marketCap: 1800000000 },
    { symbol: 'SEI', name: 'Sei', category: 'Layer 1', price: 0.42, change24h: 12.34, marketCap: 1200000000 },
    { symbol: 'TON', name: 'Toncoin', category: 'Layer 1', price: 5.23, change24h: 1.45, marketCap: 18000000000 },
    { symbol: 'TRX', name: 'TRON', category: 'Layer 1', price: 0.12, change24h: 0.34, marketCap: 11000000000 },
    { symbol: 'ALGO', name: 'Algorand', category: 'Layer 1', price: 0.18, change24h: 2.10, marketCap: 1500000000 },
    { symbol: 'FTM', name: 'Fantom', category: 'Layer 1', price: 0.65, change24h: 5.43, marketCap: 1800000000 },
    { symbol: 'MATIC', name: 'Polygon', category: 'Layer 2', price: 0.52, change24h: 1.23, marketCap: 4800000000 },
    { symbol: 'ARB', name: 'Arbitrum', category: 'Layer 2', price: 1.85, change24h: 2.67, marketCap: 2400000000 },
    { symbol: 'OP', name: 'Optimism', category: 'Layer 2', price: 2.34, change24h: 3.12, marketCap: 2300000000 },
    { symbol: 'STRK', name: 'Starknet', category: 'Layer 2', price: 1.92, change24h: -2.45, marketCap: 1400000000 },
    
    // DeFi
    { symbol: 'UNI', name: 'Uniswap', category: 'DeFi', price: 9.80, change24h: 4.56, marketCap: 5900000000 },
    { symbol: 'AAVE', name: 'Aave', category: 'DeFi', price: 145.30, change24h: 2.34, marketCap: 2200000000 },
    { symbol: 'MKR', name: 'Maker', category: 'DeFi', price: 1680.00, change24h: 1.23, marketCap: 1550000000 },
    { symbol: 'LDO', name: 'Lido DAO', category: 'DeFi', price: 2.15, change24h: -3.45, marketCap: 1920000000 },
    { symbol: 'COMP', name: 'Compound', category: 'DeFi', price: 58.90, change24h: 0.89, marketCap: 490000000 },
    { symbol: 'CRV', name: 'Curve DAO', category: 'DeFi', price: 0.45, change24h: -1.23, marketCap: 590000000 },
    { symbol: 'SNX', name: 'Synthetix', category: 'DeFi', price: 2.80, change24h: 3.21, marketCap: 920000000 },
    { symbol: 'YFI', name: 'yearn.finance', category: 'DeFi', price: 7230.00, change24h: 5.67, marketCap: 242000000 },
    { symbol: '1INCH', name: '1inch', category: 'DeFi', price: 0.42, change24h: 1.89, marketCap: 520000000 },
    { symbol: 'SUSHI', name: 'SushiSwap', category: 'DeFi', price: 1.25, change24h: -0.56, marketCap: 320000000 },
    { symbol: 'DYDX', name: 'dYdX', category: 'DeFi', price: 2.15, change24h: 4.32, marketCap: 1340000000 },
    { symbol: 'PENDLE', name: 'Pendle', category: 'DeFi', price: 4.85, change24h: 8.90, marketCap: 780000000 },
    { symbol: 'RDNT', name: 'Radiant Capital', category: 'DeFi', price: 0.12, change24h: -5.43, marketCap: 89000000 },
    { symbol: 'JOE', name: 'Trader Joe', category: 'DeFi', price: 0.38, change24h: 6.78, marketCap: 158000000 },
    { symbol: 'CAKE', name: 'PancakeSwap', category: 'DeFi', price: 2.45, change24h: 1.56, marketCap: 720000000 },
    { symbol: 'LQTY', name: 'Liquity', category: 'DeFi', price: 1.05, change24h: -2.34, marketCap: 102000000 },
    { symbol: 'FXS', name: 'Frax Share', category: 'DeFi', price: 3.25, change24h: 0.78, marketCap: 268000000 },
    { symbol: 'BAL', name: 'Balancer', category: 'DeFi', price: 3.80, change24h: 2.45, marketCap: 215000000 },
    { symbol: 'GNO', name: 'Gnosis', category: 'DeFi', price: 315.00, change24h: 1.34, marketCap: 815000000 },
    { symbol: 'KNC', name: 'Kyber Network', category: 'DeFi', price: 0.72, change24h: 3.21, marketCap: 120000000 },
    
    // Meme
    { symbol: 'DOGE', name: 'Dogecoin', category: 'Meme', price: 0.12, change24h: 8.90, marketCap: 18500000000 },
    { symbol: 'SHIB', name: 'Shiba Inu', category: 'Meme', price: 0.000018, change24h: 5.67, marketCap: 10600000000 },
    { symbol: 'PEPE', name: 'Pepe', category: 'Meme', price: 0.0000012, change24h: 15.23, marketCap: 5000000000 },
    { symbol: 'FLOKI', name: 'FLOKI', category: 'Meme', price: 0.00015, change24h: 12.34, marketCap: 1450000000 },
    { symbol: 'WIF', name: 'dogwifhat', category: 'Meme', price: 2.15, change24h: 18.90, marketCap: 2150000000 },
    { symbol: 'BONK', name: 'Bonk', category: 'Meme', price: 0.000023, change24h: 22.45, marketCap: 1450000000 },
    { symbol: 'MEME', name: 'Memecoin', category: 'Meme', price: 0.028, change24h: -8.90, marketCap: 350000000 },
    { symbol: 'CORGIAI', name: 'CorgiAI', category: 'Meme', price: 0.0012, change24h: 45.67, marketCap: 280000000 },
    { symbol: 'BOME', name: 'BOOK OF MEME', category: 'Meme', price: 0.0085, change24h: -12.34, marketCap: 470000000 },
    { symbol: 'POPCAT', name: 'Popcat', category: 'Meme', price: 0.65, change24h: 25.67, marketCap: 650000000 },
    { symbol: 'BRETT', name: 'Brett', category: 'Meme', price: 0.12, change24h: 35.40, marketCap: 1200000000 },
    { symbol: 'MOG', name: 'Mog Coin', category: 'Meme', price: 0.0000021, change24h: 18.90, marketCap: 780000000 },
    { symbol: 'TURBO', name: 'Turbo', category: 'Meme', price: 0.0089, change24h: -5.43, marketCap: 620000000 },
    { symbol: 'MYRO', name: 'Myro', category: 'Meme', price: 0.045, change24h: 32.10, marketCap: 145000000 },
    { symbol: 'WEN', name: 'Wen', category: 'Meme', price: 0.00012, change24h: 8.90, marketCap: 85000000 },
    
    // Gaming & Metaverse
    { symbol: 'AXS', name: 'Axie Infinity', category: 'Gaming', price: 7.85, change24h: 3.45, marketCap: 1150000000 },
    { symbol: 'SAND', name: 'The Sandbox', category: 'Gaming', price: 0.42, change24h: 2.34, marketCap: 980000000 },
    { symbol: 'MANA', name: 'Decentraland', category: 'Gaming', price: 0.45, change24h: 1.89, marketCap: 875000000 },
    { symbol: 'ILV', name: 'Illuvium', category: 'Gaming', price: 95.00, change24h: 5.67, marketCap: 580000000 },
    { symbol: 'ENJ', name: 'Enjin Coin', category: 'Gaming', price: 0.28, change24h: -0.45, marketCap: 420000000 },
    { symbol: 'GALA', name: 'Gala', category: 'Gaming', price: 0.038, change24h: 8.90, marketCap: 1450000000 },
    { symbol: 'IMX', name: 'Immutable', category: 'Gaming', price: 2.45, change24h: 4.56, marketCap: 3800000000 },
    { symbol: 'YGG', name: 'Yield Guild Games', category: 'Gaming', price: 0.85, change24h: 12.34, marketCap: 320000000 },
    { symbol: 'MAGIC', name: 'Treasure', category: 'Gaming', price: 0.52, change24h: -3.21, marketCap: 145000000 },
    { symbol: 'GMT', name: 'STEPN', category: 'Gaming', price: 0.18, change24h: 6.78, marketCap: 320000000 },
    { symbol: 'AURY', name: 'Aurory', category: 'Gaming', price: 0.35, change24h: 15.60, marketCap: 85000000 },
    { symbol: 'BEAM', name: 'Beam', category: 'Gaming', price: 0.028, change24h: 22.45, marketCap: 1450000000 },
    { symbol: 'XAI', name: 'Xai', category: 'Gaming', price: 0.42, change24h: -8.90, marketCap: 120000000 },
    { symbol: 'PRIME', name: 'Echelon Prime', category: 'Gaming', price: 14.50, change24h: 9.80, marketCap: 580000000 },
    { symbol: 'RON', name: 'Ronin', category: 'Gaming', price: 2.85, change24h: 3.20, marketCap: 850000000 },
    
    // AI & Big Data
    { symbol: 'RNDR', name: 'Render', category: 'AI', price: 7.85, change24h: 12.34, marketCap: 3100000000 },
    { symbol: 'FET', name: 'Fetch.ai', category: 'AI', price: 2.15, change24h: 8.90, marketCap: 1800000000 },
    { symbol: 'AGIX', name: 'SingularityNET', category: 'AI', price: 0.85, change24h: 6.78, marketCap: 1100000000 },
    { symbol: 'OCEAN', name: 'Ocean Protocol', category: 'AI', price: 0.95, change24h: 4.56, marketCap: 540000000 },
    { symbol: 'WLD', name: 'Worldcoin', category: 'AI', price: 5.60, change24h: -5.43, marketCap: 1200000000 },
    { symbol: 'TAO', name: 'Bittensor', category: 'AI', price: 425.00, change24h: 15.60, marketCap: 2900000000 },
    { symbol: 'ARKM', name: 'Arkham', category: 'AI', price: 2.35, change24h: 18.90, marketCap: 480000000 },
    { symbol: 'NMR', name: 'Numeraire', category: 'AI', price: 18.50, change24h: 2.34, marketCap: 145000000 },
    { symbol: 'GRT', name: 'The Graph', category: 'AI', price: 0.28, change24h: 5.67, marketCap: 2680000000 },
    { symbol: 'LPT', name: 'Livepeer', category: 'AI', price: 15.20, change24h: 9.80, marketCap: 480000000 },
    { symbol: 'AKT', name: 'Akash Network', category: 'AI', price: 4.25, change24h: 22.45, marketCap: 980000000 },
    { symbol: 'ATH', name: 'Aethir', category: 'AI', price: 0.085, change24h: 35.60, marketCap: 450000000 },
    { symbol: 'IO', name: 'io.net', category: 'AI', price: 3.45, change24h: -12.34, marketCap: 320000000 },
    { symbol: 'NEURAL', name: 'Neural', category: 'AI', price: 0.015, change24h: 45.60, marketCap: 15000000 },
    
    // Infrastructure & Oracle
    { symbol: 'LINK', name: 'Chainlink', category: 'Oracle', price: 18.50, change24h: 3.45, marketCap: 11500000000 },
    { symbol: 'GRT', name: 'The Graph', category: 'Infrastructure', price: 0.28, change24h: 5.67, marketCap: 2680000000 },
    { symbol: 'PYTH', name: 'Pyth Network', category: 'Oracle', price: 0.42, change24h: 8.90, marketCap: 1520000000 },
    { symbol: 'API3', name: 'API3', category: 'Oracle', price: 2.15, change24h: 4.32, marketCap: 215000000 },
    { symbol: 'BAND', name: 'Band Protocol', category: 'Oracle', price: 1.45, change24h: 1.23, marketCap: 215000000 },
    { symbol: 'TRB', name: 'Tellor', category: 'Oracle', price: 85.00, change24h: -15.60, marketCap: 220000000 },
    { symbol: 'UMA', name: 'UMA', category: 'Oracle', price: 3.25, change24h: 2.34, marketCap: 268000000 },
    { symbol: 'ZRO', name: 'LayerZero', category: 'Infrastructure', price: 3.85, change24h: 6.78, marketCap: 420000000 },
    { symbol: 'AR', name: 'Arweave', category: 'Storage', price: 28.50, change24h: 4.56, marketCap: 1870000000 },
    { symbol: 'FIL', name: 'Filecoin', category: 'Storage', price: 5.60, change24h: 2.34, marketCap: 3200000000 },
    { symbol: 'HNT', name: 'Helium', category: 'Infrastructure', price: 6.85, change24h: 9.80, marketCap: 1100000000 },
    { symbol: 'GLMR', name: 'Moonbeam', category: 'Infrastructure', price: 0.32, change24h: 5.43, marketCap: 280000000 },
    { symbol: 'ASTR', name: 'Astar', category: 'Infrastructure', price: 0.065, change24h: 3.21, marketCap: 450000000 },
    { symbol: 'MINA', name: 'Mina Protocol', category: 'Infrastructure', price: 0.85, change24h: 7.89, marketCap: 950000000 },
    
    // NFT & Marketplace
    { symbol: 'BLUR', name: 'Blur', category: 'NFT', price: 0.35, change24h: 12.34, marketCap: 580000000 },
    { symbol: 'LOOKS', name: 'LooksRare', category: 'NFT', price: 0.08, change24h: -8.90, marketCap: 42000000 },
    { symbol: 'X2Y2', name: 'X2Y2', category: 'NFT', price: 0.025, change24h: 5.67, marketCap: 8500000 },
    { symbol: 'SUPER', name: 'SuperVerse', category: 'NFT', price: 0.85, change24h: 22.45, marketCap: 890000000 },
    { symbol: 'RARE', name: 'SuperRare', category: 'NFT', price: 0.12, change24h: 3.21, marketCap: 85000000 },
    { symbol: 'NFTX', name: 'NFTX', category: 'NFT', price: 15.60, change24h: 1.89, marketCap: 65000000 },
    { symbol: 'AUDIO', name: 'Audius', category: 'NFT', price: 0.18, change24h: 4.56, marketCap: 230000000 },
    
    // Privacy
    { symbol: 'XMR', name: 'Monero', category: 'Privacy', price: 142.00, change24h: 1.23, marketCap: 2620000000 },
    { symbol: 'ZEC', name: 'Zcash', category: 'Privacy', price: 28.50, change24h: -2.34, marketCap: 465000000 },
    { symbol: 'DASH', name: 'Dash', category: 'Privacy', price: 32.00, change24h: 0.89, marketCap: 380000000 },
    { symbol: 'SCRT', name: 'Secret', category: 'Privacy', price: 0.35, change24h: 5.67, marketCap: 92000000 },
    { symbol: 'ROSE', name: 'Oasis Network', category: 'Privacy', price: 0.095, change24h: 8.90, marketCap: 650000000 },
    
    // Exchange & Utility
    { symbol: 'BNB', name: 'BNB', category: 'Exchange', price: 585.00, change24h: 1.45, marketCap: 86500000000 },
    { symbol: 'CRO', name: 'Cronos', category: 'Exchange', price: 0.095, change24h: 2.34, marketCap: 2500000000 },
    { symbol: 'KCS', name: 'KuCoin Token', category: 'Exchange', price: 10.50, change24h: 0.78, marketCap: 1010000000 },
    { symbol: 'LEO', name: 'LEO Token', category: 'Exchange', price: 5.85, change24h: 0.23, marketCap: 5400000000 },
    { symbol: 'GT', name: 'GateToken', category: 'Exchange', price: 8.50, change24h: 1.56, marketCap: 750000000 },
    { symbol: 'OKB', name: 'OKB', category: 'Exchange', price: 48.50, change24h: 2.10, marketCap: 2920000000 },
    { symbol: 'HTX', name: 'HTX DAO', category: 'Exchange', price: 0.0000032, change24h: -5.43, marketCap: 3200000000 },
    
    // Stablecoins (for reference)
    { symbol: 'USDT', name: 'Tether', category: 'Stablecoin', price: 1.00, change24h: 0.01, marketCap: 98000000000 },
    { symbol: 'USDC', name: 'USD Coin', category: 'Stablecoin', price: 1.00, change24h: -0.01, marketCap: 28000000000 },
    { symbol: 'DAI', name: 'Dai', category: 'Stablecoin', price: 1.00, change24h: 0.00, marketCap: 5200000000 },
    { symbol: 'FDUSD', name: 'First Digital USD', category: 'Stablecoin', price: 1.00, change24h: 0.01, marketCap: 2800000000 },
    { symbol: 'USDe', name: 'Ethena USDe', category: 'Stablecoin', price: 1.00, change24h: 0.00, marketCap: 3400000000 },
    
    // RWA & Tokenization
    { symbol: 'CFG', name: 'Centrifuge', category: 'RWA', price: 0.65, change24h: 8.90, marketCap: 320000000 },
    { symbol: 'ONDO', name: 'Ondo', category: 'RWA', price: 1.45, change24h: 15.60, marketCap: 2050000000 },
    { symbol: 'PENDLE', name: 'Pendle', category: 'RWA', price: 4.85, change24h: 8.90, marketCap: 780000000 },
    { symbol: 'TOKEN', name: 'TokenFi', category: 'RWA', price: 0.065, change24h: -12.34, marketCap: 65000000 },
    { symbol: 'POLYX', name: 'Polymesh', category: 'RWA', price: 0.25, change24h: 4.56, marketCap: 245000000 },
    { symbol: 'RIO', name: 'Realio', category: 'RWA', price: 0.85, change24h: 22.45, marketCap: 58000000 },
    { symbol: 'NXRA', name: 'AllianceBlock Nexera', category: 'RWA', price: 0.12, change24h: 6.78, marketCap: 95000000 },
    { symbol: 'TRAC', name: 'OriginTrail', category: 'RWA', price: 0.65, change24h: 9.80, marketCap: 340000000 },
    { symbol: 'DEXT', name: 'DEXTools', category: 'RWA', price: 0.85, change24h: 3.45, marketCap: 72000000 },
    
    // Additional Popular Tokens
    { symbol: 'APT', name: 'Aptos', category: 'Layer 1', price: 8.50, change24h: 3.45, marketCap: 3900000000 },
    { symbol: 'INJ', name: 'Injective', category: 'DeFi', price: 25.00, change24h: 6.78, marketCap: 2350000000 },
    { symbol: 'SEI', name: 'Sei', category: 'Layer 1', price: 0.42, change24h: 12.34, marketCap: 1200000000 },
    { symbol: 'SATS', name: 'SATS', category: 'Meme', price: 0.00000045, change24h: 8.90, marketCap: 950000000 },
    { symbol: 'ORDI', name: 'Ordinals', category: 'Infrastructure', price: 42.00, change24h: 5.67, marketCap: 880000000 },
    { symbol: 'TIA', name: 'Celestia', category: 'Infrastructure', price: 6.85, change24h: -3.21, marketCap: 1450000000 },
    { symbol: 'DYM', name: 'Dymension', category: 'Layer 2', price: 2.15, change24h: 4.56, marketCap: 320000000 },
    { symbol: 'MANTA', name: 'Manta Network', category: 'Layer 2', price: 1.25, change24h: -8.90, marketCap: 450000000 },
    { symbol: 'ZETA', name: 'ZetaChain', category: 'Layer 1', price: 1.85, change24h: 12.34, marketCap: 580000000 },
    { symbol: 'STRK', name: 'Starknet', category: 'Layer 2', price: 1.92, change24h: -2.45, marketCap: 1400000000 },
    { symbol: 'SC', name: 'Siacoin', category: 'Storage', price: 0.0056, change24h: 3.45, marketCap: 320000000 },
    { symbol: 'STORJ', name: 'Storj', category: 'Storage', price: 0.52, change24h: 1.89, marketCap: 72000000 },
    { symbol: 'HOT', name: 'Holo', category: 'Infrastructure', price: 0.0028, change24h: 6.78, marketCap: 510000000 },
    { symbol: 'IOTA', name: 'IOTA', category: 'Infrastructure', price: 0.28, change24h: 4.56, marketCap: 890000000 },
    { symbol: 'XDC', name: 'XDC Network', category: 'Layer 1', price: 0.035, change24h: 1.23, marketCap: 520000000 },
    { symbol: 'EGLD', name: 'MultiversX', category: 'Layer 1', price: 42.50, change24h: 3.45, marketCap: 1150000000 },
    { symbol: 'XTZ', name: 'Tezos', category: 'Layer 1', price: 0.85, change24h: 2.10, marketCap: 850000000 },
    { symbol: 'EOS', name: 'EOS', category: 'Layer 1', price: 0.72, change24h: -1.23, marketCap: 820000000 },
    { symbol: 'NEO', name: 'NEO', category: 'Layer 1', price: 12.50, change24h: 4.56, marketCap: 880000000 },
    { symbol: 'VET', name: 'VeChain', category: 'Layer 1', price: 0.028, change24h: 3.45, marketCap: 2300000000 },
    { symbol: 'ICP', name: 'Internet Computer', category: 'Layer 1', price: 12.80, change24h: 5.67, marketCap: 6000000000 },
    { symbol: 'FLOW', name: 'Flow', category: 'Gaming', price: 0.72, change24h: 8.90, marketCap: 1100000000 },
    { symbol: 'THETA', name: 'Theta Network', category: 'Infrastructure', price: 2.15, change24h: 4.32, marketCap: 2150000000 },
    { symbol: 'CHZ', name: 'Chiliz', category: 'Gaming', price: 0.085, change24h: 6.78, marketCap: 760000000 },
    { symbol: 'BAT', name: 'Basic Attention', category: 'Utility', price: 0.25, change24h: 2.34, marketCap: 375000000 },
    { symbol: '1INCH', name: '1inch', category: 'DeFi', price: 0.42, change24h: 1.89, marketCap: 520000000 },
    { symbol: 'ZRX', name: '0x Protocol', category: 'DeFi', price: 0.38, change24h: 3.21, marketCap: 320000000 },
    { symbol: 'LRC', name: 'Loopring', category: 'DeFi', price: 0.18, change24h: 5.43, marketCap: 250000000 },
    { symbol: 'METIS', name: 'Metis', category: 'Layer 2', price: 35.00, change24h: 8.90, marketCap: 195000000 },
    { symbol: 'IMX', name: 'Immutable', category: 'Gaming', price: 2.45, change24h: 4.56, marketCap: 3800000000 },
    { symbol: 'SKL', name: 'SKALE', category: 'Layer 2', price: 0.055, change24h: 12.34, marketCap: 280000000 },
    { symbol: 'CELR', name: 'Celer Network', category: 'Layer 2', price: 0.018, change24h: 6.78, marketCap: 135000000 },
    { symbol: 'STX', name: 'Stacks', category: 'Layer 2', price: 2.15, change24h: 9.80, marketCap: 3200000000 },
    { symbol: 'BTT', name: 'BitTorrent', category: 'Utility', price: 0.0000012, change24h: 1.23, marketCap: 1150000000 },
    { symbol: 'WAVES', name: 'Waves', category: 'Layer 1', price: 1.85, change24h: -5.43, marketCap: 215000000 },
    { symbol: 'QTUM', name: 'Qtum', category: 'Layer 1', price: 3.25, change24h: 2.10, marketCap: 340000000 },
    { symbol: 'ONT', name: 'Ontology', category: 'Layer 1', price: 0.25, change24h: 3.45, marketCap: 225000000 },
    { symbol: 'ZIL', name: 'Zilliqa', category: 'Layer 1', price: 0.022, change24h: 5.67, marketCap: 420000000 },
    { symbol: 'ONE', name: 'Harmony', category: 'Layer 1', price: 0.018, change24h: 8.90, marketCap: 280000000 },
    { symbol: 'RVN', name: 'Ravencoin', category: 'Layer 1', price: 0.025, change24h: 4.32, marketCap: 350000000 },
    { symbol: 'HBAR', name: 'Hedera', category: 'Layer 1', price: 0.065, change24h: 3.21, marketCap: 2350000000 },
    { symbol: 'KAVA', name: 'Kava', category: 'DeFi', price: 0.48, change24h: 6.78, marketCap: 520000000 },
    { symbol: 'RUNE', name: 'THORChain', category: 'DeFi', price: 4.85, change24h: 12.34, marketCap: 1650000000 },
    { symbol: 'OSMO', name: 'Osmosis', category: 'DeFi', price: 0.42, change24h: 5.67, marketCap: 285000000 },
    { symbol: 'CSPR', name: 'Casper', category: 'Layer 1', price: 0.028, change24h: 2.34, marketCap: 320000000 }
  ],

  // Categories with colors
  categories: {
    'Layer 1': { color: '#00f5d4', icon: 'fa-layer-group' },
    'Layer 2': { color: '#00b4d8', icon: 'fa-cubes' },
    'DeFi': { color: '#7209b7', icon: 'fa-chart-line' },
    'Meme': { color: '#f72585', icon: 'fa-face-grin-tongue-wink' },
    'Gaming': { color: '#4cc9f0', icon: 'fa-gamepad' },
    'AI': { color: '#a855f7', icon: 'fa-brain' },
    'Oracle': { color: '#fb8500', icon: 'fa-eye' },
    'Infrastructure': { color: '#90e0ef', icon: 'fa-server' },
    'Storage': { color: '#00ff88', icon: 'fa-database' },
    'NFT': { color: '#ff006e', icon: 'fa-image' },
    'Privacy': { color: '#3a0ca3', icon: 'fa-user-secret' },
    'Exchange': { color: '#ffd60a', icon: 'fa-exchange-alt' },
    'Stablecoin': { color: '#06ffa5', icon: 'fa-coins' },
    'RWA': { color: '#ff9f1c', icon: 'fa-building' },
    'Utility': { color: '#caf0f8', icon: 'fa-cog' }
  },

  // Mock news data
  news: [
    {
      id: 1,
      title: 'Bitcoin ETFs See Record Inflows as Institutional Adoption Accelerates',
      source: 'CoinDesk',
      time: '2h ago',
      sentiment: 'positive',
      category: 'Bitcoin',
      summary: 'Major financial institutions continue to accumulate Bitcoin through spot ETFs, signaling growing institutional confidence.'
    },
    {
      id: 2,
      title: 'Ethereum Layer 2 Solutions Reach New TVL Milestone',
      source: 'The Block',
      time: '4h ago',
      sentiment: 'positive',
      category: 'Ethereum',
      summary: 'Combined TVL across all major L2 networks surpasses $15 billion, with Arbitrum and Optimism leading growth.'
    },
    {
      id: 3,
      title: 'Solana Network Upgrade Promises 10x Speed Improvement',
      source: 'Decrypt',
      time: '6h ago',
      sentiment: 'positive',
      category: 'Solana',
      summary: 'Firedancer validator client to launch on mainnet, potentially revolutionizing network throughput.'
    },
    {
      id: 4,
      title: 'SEC Delays Decision on Multiple Spot Ethereum ETF Applications',
      source: 'Reuters',
      time: '8h ago',
      sentiment: 'negative',
      category: 'Ethereum',
      summary: 'Regulatory uncertainty continues as SEC extends review period for several pending applications.'
    },
    {
      id: 5,
      title: 'DeFi Protocol Suffers $5M Exploit Due to Smart Contract Vulnerability',
      source: 'Cointelegraph',
      time: '12h ago',
      sentiment: 'negative',
      category: 'DeFi',
      summary: 'Developers urge users to revoke approvals as investigation into the exploit continues.'
    },
    {
      id: 6,
      title: 'Meme Coin Season: PEPE and WIF Lead Weekly Gains',
      source: 'CryptoSlate',
      time: '1d ago',
      sentiment: 'neutral',
      category: 'Meme',
      summary: 'Retail traders flock to meme tokens as broader market consolidates, with some tokens up over 100%.'
    },
    {
      id: 7,
      title: 'Major Gaming Studio Announces Web3 Integration',
      source: 'VentureBeat',
      time: '1d ago',
      sentiment: 'positive',
      category: 'Gaming',
      summary: 'Traditional gaming giant partners with blockchain platform to introduce NFT assets in upcoming AAA title.'
    },
    {
      id: 8,
      title: 'AI Tokens Rally as OpenAI Announces New Model',
      source: 'CoinTelegraph',
      time: '2d ago',
      sentiment: 'positive',
      category: 'AI',
      summary: 'RNDR, FET, and other AI-related tokens see significant gains following AI industry developments.'
    },
    {
      id: 9,
      title: 'Stablecoin Regulation Bill Gains Bipartisan Support',
      source: 'Politico',
      time: '2d ago',
      sentiment: 'positive',
      category: 'Stablecoin',
      summary: 'New legislation could provide clearer framework for stablecoin issuers operating in the United States.'
    },
    {
      id: 10,
      title: 'Cross-Chain Bridge Launches with $50M Security Guarantee',
      source: 'DefiLlama',
      time: '3d ago',
      sentiment: 'positive',
      category: 'Infrastructure',
      summary: 'Innovative security model aims to address persistent bridge vulnerability concerns.'
    }
  ],

  // Mock price alerts
  priceAlerts: [
    { id: 1, ticker: 'BTC', condition: 'above', price: 70000, active: true },
    { id: 2, ticker: 'ETH', condition: 'below', price: 3000, active: true },
    { id: 3, ticker: 'SOL', condition: 'above', price: 150, active: false },
    { id: 4, ticker: 'PEPE', condition: 'above', price: 0.000002, active: true }
  ],

  // Mock portfolio data
  portfolio: {
    totalValue: 45680.50,
    totalChange24h: 1234.80,
    totalChange24hPercent: 2.78,
    assets: [
      { ticker: 'BTC', name: 'Bitcoin', balance: 0.35, value: 22480.67, allocation: 49.2, change24h: 2.34 },
      { ticker: 'ETH', name: 'Ethereum', balance: 4.2, value: 14490.84, allocation: 31.7, change24h: 1.89 },
      { ticker: 'SOL', name: 'Solana', balance: 45, value: 6426.00, allocation: 14.1, change24h: 5.67 },
      { ticker: 'PEPE', name: 'Pepe', balance: 5000000, value: 600.00, allocation: 1.3, change24h: 15.23 },
      { ticker: 'USDC', name: 'USD Coin', balance: 1682.99, value: 1682.99, allocation: 3.7, change24h: 0.00 }
    ]
  },

  // Mock social sentiment
  socialSentiment: {
    'BTC': { score: 78, mentions: 245000, trending: true, keywords: ['ETF', 'institutional', 'halving'] },
    'ETH': { score: 72, mentions: 189000, trending: true, keywords: ['L2', 'staking', 'ETF'] },
    'SOL': { score: 85, mentions: 156000, trending: true, keywords: ['Firedancer', 'NFT', 'DeFi'] },
    'PEPE': { score: 92, mentions: 89000, trending: true, keywords: ['meme', 'viral', 'moon'] },
    'DOGE': { score: 68, mentions: 67000, trending: false, keywords: ['Elon', 'tweet', 'hold'] },
    'WIF': { score: 88, mentions: 45000, trending: true, keywords: ['Solana', 'dog', 'viral'] }
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MOCK_DATA;
}
