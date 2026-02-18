// ============================================
// COMPONENTS/PRICECHART.JS - Simple Price Chart using Chart.js
// ============================================

class PriceChart {
  constructor(containerId, data = null) {
    this.container = document.getElementById(containerId);
    this.data = data;
    this.chart = null;
  }

  render() {
    if (!this.container) {
      console.warn('PriceChart: Container not found');
      return;
    }

    if (!this.data || !this.data.prices || this.data.prices.length === 0) {
      this.renderEmpty();
      return;
    }

    this.renderChart();
  }

  renderEmpty() {
    this.container.innerHTML = `
      <div class="chart-empty">
        <i class="fas fa-chart-line"></i>
        <p>Graficul prețului nu este disponibil pentru acest token.</p>
      </div>
    `;
  }

  renderChart() {
    const ctx = document.createElement('canvas');
    this.container.innerHTML = '';
    this.container.appendChild(ctx);

    const prices = this.data.prices;
    const labels = prices.map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (prices.length - i));
      return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
    });

    const pricesValues = prices.map(p => p[1] || p);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Preț (USD)',
          data: pricesValues,
          borderColor: '#00f5d4',
          backgroundColor: 'rgba(0, 245, 212, 0.1)',
          borderWidth: 2,
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
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return '$' + context.parsed.y.toFixed(4);
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            grid: {
              color: 'rgba(0, 245, 212, 0.1)'
            },
            ticks: {
              color: '#8b9bb4',
              maxTicksLimit: 6
            }
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(0, 245, 212, 0.1)'
            },
            ticks: {
              color: '#8b9bb4',
              callback: function(value) {
                if (value >= 1) return '$' + value.toFixed(2);
                return '$' + value.toFixed(4);
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }

  // Generate mock price data for demo
  static generateMockData(basePrice, days = 30) {
    const prices = [];
    let currentPrice = basePrice;
    const now = Date.now();
    
    for (let i = days; i >= 0; i--) {
      const date = now - (i * 24 * 60 * 60 * 1000);
      const change = (Math.random() - 0.5) * 0.1; // ±5% daily change
      currentPrice = currentPrice * (1 + change);
      prices.push([date, currentPrice]);
    }
    
    return { prices };
  }
}

// Expose globally
window.PriceChart = PriceChart;
