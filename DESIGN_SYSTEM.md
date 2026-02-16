# DESIGN_SYSTEM.md - Visual Language and Design Tokens

## Auto-Research Agent pentru Crypto

**Versiune:** 1.0  
**Data:** 2026-02-16  
**Platform:** Web (Responsive)  
**Language:** Română

---

## 1. PRINCIPII DESIGN

### 1.1 Filosofie
- **Claritate:** Informație densă dar ușor de scanat
- **Încredere:** Culori și spațiere care transmit profesionalism
- **Viteză:** Utilizatorul înțelege token-ul în 10 secunde
- **Accesibilitate:** Contrast bun, fonturi lizibile, touch-friendly

### 1.2 Design Principles
1. **Mobile-first:** Toate componentele funcționează pe mobil, desktop e enhancement
2. **Date înainte de decor:** Informația e stelară, UI-ul e suport
3. **Ierarhie vizuală clară:** Risk score-ul e cel mai vizibil element
4. **Consistență:** Aceleași pattern-uri peste tot

---

## 2. COLOR SYSTEM

### 2.1 Paleta Principală

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--color-bg-primary` | #0F172A | rgb(15, 23, 42) | Background pagină |
| `--color-bg-secondary` | #1E293B | rgb(30, 41, 59) | Cards, sections |
| `--color-bg-tertiary` | #334155 | rgb(51, 65, 85) | Hover states, borders |

### 2.2 Culori Accente

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--color-accent-primary` | #3B82F6 | rgb(59, 130, 246) | Primary buttons, links |
| `--color-accent-success` | #22C55E | rgb(34, 197, 94) | Safe/Low risk, positive data |
| `--color-accent-warning` | #F59E0B | rgb(245, 158, 11) | Medium risk, warnings |
| `--color-accent-danger` | #EF4444 | rgb(239, 68, 68) | High risk, red flags |
| `--color-accent-purple` | #A855F7 | rgb(168, 85, 247) | Special highlights |

### 2.3 Culori Text

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--color-text-primary` | #F8FAFC | rgb(248, 250, 252) | Headings, important text |
| `--color-text-secondary` | #94A3B8 | rgb(148, 163, 184) | Body text, descriptions |
| `--color-text-muted` | #64748B | rgb(100, 116, 139) | Labels, metadata |

### 2.4 Culori Risk Score

| Risk Level | Background | Text | Usage |
|------------|------------|------|-------|
| Low (1-3) | #064E3B | #22C55E | Safe investment |
| Medium (4-5) | #713F12 | #F59E0B | Moderate risk |
| High (6-7) | #7F1D1D | #EF4444 | High risk |
| Extreme (8-10) | #450A0A | #FCA5A5 | Extreme risk, likely scam |

### 2.5 Culori Chart

| Element | Color |
|---------|-------|
| Line chart | #3B82F6 |
| Area fill (gradient) | rgba(59, 130, 246, 0.1) |
| Positive change | #22C55E |
| Negative change | #EF4444 |
| Grid lines | #334155 |

---

## 3. TYPOGRAPHY

### 3.1 Font Families

| Token | Font | Fallback | Usage |
|-------|------|----------|-------|
| `--font-primary` | Inter | system-ui, sans-serif | Body, headings |
| `--font-mono` | JetBrains Mono | monospace | Numbers, addresses |

### 3.2 Scale (Type Scale)

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-h1` | 2.5rem (40px) | 700 | 1.2 | Page titles |
| `--text-h2` | 2rem (32px) | 700 | 1.2 | Section headings |
| `--text-h3` | 1.5rem (24px) | 600 | 1.3 | Card titles |
| `--text-h4` | 1.25rem (20px) | 600 | 1.4 | Subsection titles |
| `--text-body` | 1rem (16px) | 400 | 1.6 | Body text |
| `--text-small` | 0.875rem (14px) | 400 | 1.5 | Descriptions, metadata |
| `--text-xs` | 0.75rem (12px) | 400 | 1.5 | Labels, timestamps |
| `--text-data` | 1.125rem (18px) | 500 | 1.4 | Numbers, prices |

### 3.3 Typography Patterns

**Headings:**
- Font: Inter
- Weight: 700 pentru H1-H2, 600 pentru H3-H4
- Color: `--color-text-primary`
- Letter-spacing: -0.02em pentru H1-H2

**Body Text:**
- Font: Inter
- Weight: 400
- Color: `--color-text-secondary`
- Line-height: 1.6 pentru lizibilitate

**Numbers (Prices, Stats):**
- Font: JetBrains Mono
- Weight: 500-700
- Color: `--color-text-primary` sau accent
- Tabular nums pentru aliniere

---

## 4. SPACING SYSTEM

### 4.1 Base Unit
- **Base:** 4px
- **Scale:** Multipliers de 4 (4, 8, 12, 16, 24, 32, 48, 64, 96)

### 4.2 Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Icon gaps, tight spacing |
| `--space-2` | 8px | Small gaps, inline spacing |
| `--space-3` | 12px | Button padding, small margins |
| `--space-4` | 16px | Standard gap, card padding |
| `--space-5` | 24px | Section gaps, large padding |
| `--space-6` | 32px | Section margins |
| `--space-7` | 48px | Large section separation |
| `--space-8` | 64px | Page-level spacing |
| `--space-9` | 96px | Hero sections |

### 4.3 Layout Grid

**Container:**
- Max-width: 1200px
- Padding: 16px (mobile), 24px (tablet), 32px (desktop)

**Grid:**
- 12-column grid pe desktop
- 6-column pe tablet
- 4-column pe mobile
- Gap: 24px (desktop), 16px (mobile)

---

## 5. COMPONENTS

### 5.1 Buttons

**Primary Button:**
```css
background: var(--color-accent-primary);
color: white;
border: none;
border-radius: 8px;
padding: 12px 24px;
font-weight: 600;
transition: all 0.2s ease;

/* Hover */
background: #2563EB; /* Darker blue */
transform: translateY(-1px);

/* Active */
transform: translateY(0);
```

**Secondary Button:**
```css
background: transparent;
color: var(--color-accent-primary);
border: 1px solid var(--color-accent-primary);
border-radius: 8px;
padding: 12px 24px;

/* Hover */
background: rgba(59, 130, 246, 0.1);
```

**Button Sizes:**
- Small: padding 8px 16px, font 14px
- Medium: padding 12px 24px, font 16px (default)
- Large: padding 16px 32px, font 18px

### 5.2 Cards

**Research Card:**
```css
background: var(--color-bg-secondary);
border: 1px solid var(--color-bg-tertiary);
border-radius: 12px;
padding: 24px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

/* Hover */
border-color: var(--color-accent-primary);
box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
```

### 5.3 Form Input

**Text Input:**
```css
background: var(--color-bg-secondary);
border: 1px solid var(--color-bg-tertiary);
border-radius: 8px;
padding: 12px 16px;
color: var(--color-text-primary);
font-size: 16px;

/* Focus */
border-color: var(--color-accent-primary);
outline: 2px solid rgba(59, 130, 246, 0.3);
```

### 5.4 Risk Score Badge

**Implementation:**
```css
.risk-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 8px 16px;
  border-radius: 9999px; /* Pill shape */
  font-weight: 700;
  font-size: 1.25rem;
}

/* Risk: Low */
.risk-low {
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
  border: 2px solid #22C55E;
}

/* Risk: High */
.risk-high {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
  border: 2px solid #EF4444;
}
```

### 5.5 Red Flag Item

**Layout:**
```
┌─────────────────────────────────────┐
│ ❌  [Icon]  Text red flag           │
│     └─ Detail suplimentar (muted)   │
└─────────────────────────────────────┘
```

**Styling:**
```css
.red-flag {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border-left: 4px solid #EF4444;
  border-radius: 0 8px 8px 0;
}

.red-flag-icon {
  color: #EF4444;
  font-size: 20px;
}
```

### 5.6 Data Grid

**Stats Grid (3 coloane):**
```css
.data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  background: var(--color-bg-tertiary);
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: 4px;
}
```

---

## 6. LAYOUT PATTERNS

### 6.1 Page Structure (Research Report)

```
┌──────────────────────────────────────────────────────────┐
│  HEADER (Logo + Nav)                                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  RISK SCORE SECTION (Hero)                               │
│  ┌──────────────────────────────────────────────────┐    │
│  │  [RISK BADGE 7/10]  Token Name (TICKER)          │    │
│  │  Last updated: 2 min ago                         │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  GRID 2-COLUMNS                                          │
│  ┌──────────────────────┐ ┌──────────────────────┐       │
│  │  PRICE ACTION        │ │  TOKENOMICS          │       │
│  │  (Chart + stats)     │ │  (Supply, holders)   │       │
│  └──────────────────────┘ └──────────────────────┘       │
│                                                          │
│  FULL WIDTH SECTIONS                                     │
│  ┌──────────────────────────────────────────────────┐    │
│  │  RED FLAGS CHECKLIST                             │    │
│  └──────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────┐    │
│  │  TEAM & USE CASE                                 │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ACTION BUTTONS                                          │
│  [Share] [Bookmark] [Watchlist]                          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  FOOTER                                                  │
└──────────────────────────────────────────────────────────┘
```

### 6.2 Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | 1 coloană, stacked sections |
| Tablet | 640-1024px | 2 coloane pentru grids |
| Desktop | > 1024px | Full layout, 3 coloane pentru stats |

### 6.3 Mobile Adaptations
- Risk score full width
- Stats grid: 2 coloane
- Charts: full width, height 200px
- Buttons: full width, stacked

---

## 7. ANIMATIONS ȘI TRANSITIONS

### 7.1 Durations

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Hover states, micro-interactions |
| `--duration-normal` | 300ms | Page transitions, modals |
| `--duration-slow` | 500ms | Loading animations |

### 7.2 Easing

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-default` | ease | General transitions |
| `--ease-out` | cubic-bezier(0, 0, 0.2, 1) | Elements entering |
| `--ease-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | Smooth transitions |

### 7.3 Loading States

**Spinner:**
```css
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-bg-tertiary);
  border-top-color: var(--color-accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**Skeleton Loading:**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 25%,
    var(--color-bg-tertiary) 50%,
    var(--color-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 8. ICONOGRAPHY

### 8.1 Icon Library
- **Font Awesome 6.4.0** (via CDN)
- **Style:** Solid (fas) pentru weight consistent

### 8.2 Icon Mapping

| Usage | Icon | Class |
|-------|------|-------|
| Search | 🔍 | fas fa-search |
| Risk Low | ✅ | fas fa-check-circle |
| Risk High | ⚠️ | fas fa-exclamation-triangle |
| Price Up | 📈 | fas fa-arrow-trend-up |
| Price Down | 📉 | fas fa-arrow-trend-down |
| Share | 📤 | fas fa-share |
| Bookmark | 🔖 | fas fa-bookmark |
| Alert | 🔔 | fas fa-bell |
| Loading | ⏳ | fas fa-spinner fa-spin |
| Error | ❌ | fas fa-times-circle |
| Info | ℹ️ | fas fa-info-circle |

---

## 9. CHARTS ȘI DATA VIZ

### 9.1 Price Chart

**Library:** Chart.js 4.4.0

**Config:**
```javascript
{
  type: 'line',
  data: {
    datasets: [{
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
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { color: '#334155' },
        ticks: { color: '#64748B' }
      },
      y: {
        grid: { color: '#334155' },
        ticks: { color: '#64748B' }
      }
    }
  }
}
```

**Dimensions:**
- Desktop: height 300px
- Mobile: height 200px

### 9.2 Progress Bars (Risk Score)

```css
.risk-bar {
  width: 100%;
  height: 8px;
  background: var(--color-bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.risk-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

/* Example: Risk 7/10 */
.risk-bar-fill { width: 70%; background: #EF4444; }
```

---

## 10. ACCESIBILITATE

### 10.1 Contrast
- Text normal: 4.5:1 minimum (respectat cu paleta definită)
- Text large: 3:1 minimum
- UI components: 3:1 minimum

### 10.2 Focus States
```css
:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}
```

### 10.3 Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

*Document version: 1.0*  
*Last updated: 2026-02-16*
