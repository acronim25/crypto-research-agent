// ============================================
// COMPONENTS/RISKBADGE.JS - Risk Score Component
// ============================================

class RiskBadge {
  constructor(score, size = 'normal') {
    this.score = score;
    this.size = size;
    this.classification = this.getClassification();
  }

  getClassification() {
    if (this.score <= 3) {
      return { 
        level: 'low', 
        label: 'Risc Scăzut', 
        color: '#22C55E',
        bgColor: 'rgba(34, 197, 94, 0.2)'
      };
    }
    if (this.score <= 5) {
      return { 
        level: 'medium', 
        label: 'Risc Moderat', 
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.2)'
      };
    }
    if (this.score <= 7) {
      return { 
        level: 'high', 
        label: 'Risc Ridicat', 
        color: '#EF4444',
        bgColor: 'rgba(239, 68, 68, 0.2)'
      };
    }
    return { 
      level: 'extreme', 
      label: 'Risc Extrem', 
      color: '#FCA5A5',
      bgColor: 'rgba(69, 10, 10, 0.8)'
    };
  }

  render() {
    const { level, label, color, bgColor } = this.classification;
    const sizeClass = this.size === 'large' ? 'risk-badge--large' : '';
    
    const div = document.createElement('div');
    div.className = `risk-badge risk-badge--${level} ${sizeClass}`;
    div.style.cssText = `
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: ${this.size === 'large' ? '140px' : '120px'};
      padding: ${this.size === 'large' ? '1.5rem 2rem' : '1rem 1.5rem'};
      border-radius: 12px;
      border: 2px solid ${color};
      background-color: ${bgColor};
      text-align: center;
    `;

    div.innerHTML = `
      <span style="
        font-family: 'JetBrains Mono', monospace;
        font-size: ${this.size === 'large' ? '2.5rem' : '1.5rem'};
        font-weight: 700;
        color: ${color};
        line-height: 1;
      ">${this.score}/10</span>
      <span style="
        font-size: ${this.size === 'large' ? '1rem' : '0.875rem'};
        font-weight: 600;
        color: ${color};
        margin-top: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      ">${label}</span>
    `;

    return div;
  }

  mount(container) {
    container.innerHTML = '';
    container.appendChild(this.render());
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RiskBadge;
}
