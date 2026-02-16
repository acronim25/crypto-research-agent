// ============================================
// COMPONENTS/DATAGRID.JS - Data Grid Component
// ============================================

class DataGrid {
  constructor(data, columns = 3) {
    this.data = data;
    this.columns = columns;
  }

  render() {
    const grid = document.createElement('div');
    grid.className = 'data-grid';
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(${this.columns}, 1fr);
      gap: 1rem;
    `;

    // Adjust columns for mobile
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    if (mediaQuery.matches) {
      grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    }

    this.data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'stat-item';
      card.style.cssText = `
        background-color: var(--color-bg-tertiary);
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
      `;

      const changeClass = item.change > 0 ? 'positive' : item.change < 0 ? 'negative' : '';
      const changeIcon = item.change > 0 ? '↑' : item.change < 0 ? '↓' : '';
      const changeColor = item.change > 0 ? '#22C55E' : item.change < 0 ? '#EF4444' : 'inherit';

      card.innerHTML = `
        <div style="
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 0.25rem;
        ">
          ${item.value}
          ${item.change ? `<span style="
            font-size: 0.875rem;
            font-weight: 500;
            margin-left: 0.5rem;
            color: ${changeColor};
          ">${changeIcon} ${Math.abs(item.change)}%</span>` : ''}
        </div>
        <div style="
          font-size: 0.875rem;
          color: var(--color-text-muted);
        ">${item.label}</div>
      `;

      grid.appendChild(card);
    });

    return grid;
  }

  mount(container) {
    container.innerHTML = '';
    container.appendChild(this.render());
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataGrid;
}
