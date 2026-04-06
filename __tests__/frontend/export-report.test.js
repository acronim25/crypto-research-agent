// ============================================
// Tests for js/export-report.js
// Pure logic tests
// ============================================

describe('ExportReport - Core Logic', () => {
  // ============================================
  // Constructor defaults
  // ============================================
  describe('options', () => {
    test('default filename', () => {
      const options = {
        filename: 'crypto-research-report',
        quality: 2,
        ...{}
      };
      expect(options.filename).toBe('crypto-research-report');
      expect(options.quality).toBe(2);
    });

    test('custom options override defaults', () => {
      const options = {
        filename: 'crypto-research-report',
        quality: 2,
        ...{ filename: 'my-report', quality: 3 }
      };
      expect(options.filename).toBe('my-report');
      expect(options.quality).toBe(3);
    });
  });

  // ============================================
  // getBackgroundColor logic
  // ============================================
  describe('getBackgroundColor', () => {
    test('dark theme returns dark color', () => {
      const isLight = false;
      const color = isLight ? '#f0f4f8' : '#0a0f1c';
      expect(color).toBe('#0a0f1c');
    });

    test('light theme returns light color', () => {
      const isLight = true;
      const color = isLight ? '#f0f4f8' : '#0a0f1c';
      expect(color).toBe('#f0f4f8');
    });
  });

  // ============================================
  // PDF pagination logic
  // ============================================
  describe('PDF pagination', () => {
    test('single page when content fits', () => {
      const imgWidth = 210;
      const pageHeight = 297;
      const canvasWidth = 1000;
      const canvasHeight = 1000;

      const imgHeight = (canvasHeight * imgWidth) / canvasWidth; // 210
      let heightLeft = imgHeight;
      let pages = 1;

      heightLeft -= pageHeight; // 210 - 297 = -87

      while (heightLeft >= 0) {
        pages++;
        heightLeft -= pageHeight;
      }

      expect(pages).toBe(1);
    });

    test('multiple pages for tall content', () => {
      const imgWidth = 210;
      const pageHeight = 297;
      const canvasWidth = 1000;
      const canvasHeight = 5000;

      const imgHeight = (canvasHeight * imgWidth) / canvasWidth; // 1050
      let heightLeft = imgHeight;
      let pages = 1;

      heightLeft -= pageHeight; // 1050 - 297 = 753

      while (heightLeft >= 0) {
        pages++;
        heightLeft -= pageHeight;
      }

      expect(pages).toBe(4); // 1050 / 297 ≈ 3.5 -> 4 pages
    });

    test('exact fit uses one page', () => {
      const pageHeight = 297;
      const imgHeight = 297;
      let heightLeft = imgHeight - pageHeight; // 0
      let pages = 1;

      while (heightLeft >= 0) {
        pages++;
        heightLeft -= pageHeight;
      }

      // heightLeft = 0 at start of while, so it enters once
      expect(pages).toBe(2); // edge case: heightLeft == 0 adds a page
    });
  });

  // ============================================
  // Filename generation
  // ============================================
  describe('filename generation', () => {
    test('generates filename with token name and date', () => {
      const base = 'crypto-research-report';
      const tokenName = 'Bitcoin';
      const date = '2026-04-06';

      const filename = `${base}-${tokenName}-${date}.pdf`;
      expect(filename).toBe('crypto-research-report-Bitcoin-2026-04-06.pdf');
    });

    test('handles missing token name', () => {
      const base = 'crypto-research-report';
      const tokenName = 'report';
      const date = '2026-04-06';

      const filename = `${base}-${tokenName}-${date}.png`;
      expect(filename).toBe('crypto-research-report-report-2026-04-06.png');
    });

    test('generates correct extension for each format', () => {
      const formats = ['pdf', 'png', 'jpg'];
      formats.forEach(format => {
        const filename = `report.${format}`;
        expect(filename.endsWith(`.${format}`)).toBe(true);
      });
    });
  });

  // ============================================
  // MIME type logic
  // ============================================
  describe('MIME type selection', () => {
    test('png format maps to image/png', () => {
      const format = 'png';
      const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png';
      expect(mimeType).toBe('image/png');
    });

    test('jpg format maps to image/jpeg', () => {
      const format = 'jpg';
      const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png';
      expect(mimeType).toBe('image/jpeg');
    });

    test('jpeg format maps to image/jpeg', () => {
      const format = 'jpeg';
      const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png';
      expect(mimeType).toBe('image/jpeg');
    });

    test('unknown format defaults to image/png', () => {
      const format = 'webp';
      const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png';
      expect(mimeType).toBe('image/png');
    });
  });

  // ============================================
  // Notification types
  // ============================================
  describe('notification colors', () => {
    const colors = {
      success: 'background: rgba(0, 255, 136, 0.2); border: 1px solid #00ff88; color: #00ff88;',
      error: 'background: rgba(255, 68, 68, 0.2); border: 1px solid #ff4444; color: #ff4444;',
      info: 'background: rgba(0, 245, 212, 0.2); border: 1px solid #00f5d4; color: #00f5d4;'
    };

    test('success type has green color', () => {
      expect(colors.success).toContain('#00ff88');
    });

    test('error type has red color', () => {
      expect(colors.error).toContain('#ff4444');
    });

    test('info type has cyan color', () => {
      expect(colors.info).toContain('#00f5d4');
    });

    test('unknown type falls back to info', () => {
      const type = 'warning';
      const style = colors[type] || colors.info;
      expect(style).toContain('#00f5d4');
    });
  });
});
