// ============================================
// EXPORT-REPORT.JS - Export Report to PDF/Image
// ============================================

class ExportReport {
  constructor(options = {}) {
    this.options = {
      filename: 'crypto-research-report',
      quality: 2,
      ...options
    };
  }

  async exportToPDF(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found:', elementId);
      return false;
    }

    try {
      this.showLoading('Generating PDF...');

      // Check if libraries are available
      if (typeof html2canvas === 'undefined') {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      }
      if (typeof jspdf === 'undefined') {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      }

      // Wait a moment for fonts to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture the element
      const canvas = await html2canvas(element, {
        scale: this.options.quality,
        useCORS: true,
        allowTaint: true,
        backgroundColor: this.getBackgroundColor(),
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      const tokenName = document.getElementById('tokenName')?.textContent || 'report';
      pdf.save(`${this.options.filename}-${tokenName}-${new Date().toISOString().split('T')[0]}.pdf`);

      this.hideLoading();
      this.showNotification('PDF downloaded successfully!', 'success');
      return true;

    } catch (error) {
      console.error('PDF export error:', error);
      this.hideLoading();
      this.showNotification('Failed to generate PDF. Try image export instead.', 'error');
      return false;
    }
  }

  async exportToImage(elementId, format = 'png') {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found:', elementId);
      return false;
    }

    try {
      this.showLoading('Generating image...');

      // Load html2canvas if not available
      if (typeof html2canvas === 'undefined') {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      }

      // Wait for fonts
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture the element
      const canvas = await html2canvas(element, {
        scale: this.options.quality,
        useCORS: true,
        allowTaint: true,
        backgroundColor: this.getBackgroundColor(),
        logging: false
      });

      // Convert to blob and download
      const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const blob = await new Promise(resolve => canvas.toBlob(resolve, mimeType, 0.95));
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const tokenName = document.getElementById('tokenName')?.textContent || 'report';
      link.download = `${this.options.filename}-${tokenName}-${new Date().toISOString().split('T')[0]}.${format}`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.hideLoading();
      this.showNotification(`Image downloaded as ${format.toUpperCase()}!`, 'success');
      return true;

    } catch (error) {
      console.error('Image export error:', error);
      this.hideLoading();
      this.showNotification('Failed to generate image.', 'error');
      return false;
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  getBackgroundColor() {
    // Get computed background color from body or use default
    const isLight = document.body.classList.contains('light-theme');
    return isLight ? '#f0f4f8' : '#0a0f1c';
  }

  showLoading(message) {
    // Create loading overlay
    let overlay = document.getElementById('export-loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'export-loading-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
        z-index: 99999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
      `;
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="export-loading-spinner"></div>
      <div class="export-loading-text">${message}</div>
    `;

    // Add spinner styles if not added
    if (!document.getElementById('export-loading-styles')) {
      const styles = document.createElement('style');
      styles.id = 'export-loading-styles';
      styles.textContent = `
        .export-loading-spinner {
          width: 60px;
          height: 60px;
          border: 3px solid rgba(0, 245, 212, 0.2);
          border-top-color: #00f5d4;
          border-right-color: #00ff88;
          border-radius: 50%;
          animation: exportSpin 1s linear infinite;
        }
        
        @keyframes exportSpin {
          to { transform: rotate(360deg); }
        }
        
        .export-loading-text {
          color: #00f5d4;
          font-family: 'JetBrains Mono', monospace;
          font-size: 1rem;
          text-shadow: 0 0 10px rgba(0, 245, 212, 0.5);
        }
      `;
      document.head.appendChild(styles);
    }
  }

  hideLoading() {
    const overlay = document.getElementById('export-loading-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `export-notification export-notification--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      z-index: 100000;
      animation: exportNotificationSlideIn 0.3s ease;
      max-width: 350px;
      line-height: 1.4;
    `;

    // Colors based on type
    const colors = {
      success: 'background: rgba(0, 255, 136, 0.2); border: 1px solid #00ff88; color: #00ff88;',
      error: 'background: rgba(255, 68, 68, 0.2); border: 1px solid #ff4444; color: #ff4444;',
      info: 'background: rgba(0, 245, 212, 0.2); border: 1px solid #00f5d4; color: #00f5d4;'
    };
    notification.style.cssText += colors[type] || colors.info;

    // Add animation styles
    if (!document.getElementById('export-notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'export-notification-styles';
      styles.textContent = `
        @keyframes exportNotificationSlideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'exportNotificationSlideIn 0.3s ease reverse forwards';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  // Create export button
  static createExportButton(containerId, targetElementId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const exporter = new ExportReport();

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'export-button-group';
    buttonGroup.innerHTML = `
      <button class="export-btn export-btn--main" id="exportBtn">
        <i class="fas fa-download"></i>
        Export Report
      </button>
      <div class="export-dropdown" id="exportDropdown">
        <button class="export-option" data-format="pdf">
          <i class="fas fa-file-pdf"></i>
          Export as PDF
        </button>
        <button class="export-option" data-format="png">
          <i class="fas fa-image"></i>
          Export as PNG
        </button>
        <button class="export-option" data-format="jpg">
          <i class="fas fa-image"></i>
          Export as JPG
        </button>
      </div>
    `;

    container.appendChild(buttonGroup);

    // Add styles
    if (!document.getElementById('export-button-styles')) {
      const styles = document.createElement('style');
      styles.id = 'export-button-styles';
      styles.textContent = `
        .export-button-group {
          position: relative;
          display: inline-block;
        }
        
        .export-btn {
          background: linear-gradient(135deg, rgba(0, 245, 212, 0.2), rgba(0, 255, 136, 0.2));
          border: 1px solid var(--neon-cyan, #00f5d4);
          color: var(--neon-cyan, #00f5d4);
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }
        
        .export-btn:hover {
          background: linear-gradient(135deg, rgba(0, 245, 212, 0.4), rgba(0, 255, 136, 0.4));
          box-shadow: 0 0 20px rgba(0, 245, 212, 0.3);
        }
        
        .export-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(0, 245, 212, 0.3);
          border-radius: 12px;
          padding: 8px;
          min-width: 180px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
          z-index: 100;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }
        
        .export-dropdown.active {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        
        .export-option {
          width: 100%;
          background: transparent;
          border: none;
          color: #fff;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s ease;
          text-align: left;
        }
        
        .export-option:hover {
          background: rgba(0, 245, 212, 0.1);
          color: var(--neon-cyan, #00f5d4);
        }
        
        .export-option i {
          width: 16px;
          text-align: center;
        }
        
        body.light-theme .export-dropdown {
          background: rgba(255, 255, 255, 0.98);
          border: 1px solid rgba(0, 136, 170, 0.2);
        }
        
        body.light-theme .export-option {
          color: #1a202c;
        }
        
        body.light-theme .export-option:hover {
          background: rgba(0, 136, 170, 0.1);
          color: var(--neon-cyan);
        }
      `;
      document.head.appendChild(styles);
    }

    // Bind events
    const mainBtn = buttonGroup.querySelector('#exportBtn');
    const dropdown = buttonGroup.querySelector('#exportDropdown');
    const options = buttonGroup.querySelectorAll('.export-option');

    mainBtn.addEventListener('click', () => {
      dropdown.classList.toggle('active');
    });

    options.forEach(option => {
      option.addEventListener('click', () => {
        const format = option.dataset.format;
        if (format === 'pdf') {
          exporter.exportToPDF(targetElementId);
        } else {
          exporter.exportToImage(targetElementId, format);
        }
        dropdown.classList.remove('active');
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!buttonGroup.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });

    return exporter;
  }
}

// Make available globally
window.ExportReport = ExportReport;
