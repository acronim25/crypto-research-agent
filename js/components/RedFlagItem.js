// ============================================
// COMPONENTS/REDFLAGITEM.JS - Red Flag Component
// ============================================

class RedFlagItem {
  constructor(check, passed, severity, description) {
    this.check = check;
    this.passed = passed;
    this.severity = severity;
    this.description = description;
  }

  render() {
    const div = document.createElement('div');
    
    // Determine styling based on status
    let borderColor, bgColor, icon, iconColor;
    
    if (this.passed) {
      borderColor = '#22C55E';
      bgColor = 'rgba(34, 197, 94, 0.05)';
      icon = '✓';
      iconColor = '#22C55E';
    } else if (this.severity === 'critical' || this.severity === 'high') {
      borderColor = '#EF4444';
      bgColor = 'rgba(239, 68, 68, 0.05)';
      icon = '✗';
      iconColor = '#EF4444';
    } else {
      borderColor = '#F59E0B';
      bgColor = 'rgba(245, 158, 11, 0.05)';
      icon = '!';
      iconColor = '#F59E0B';
    }

    div.style.cssText = `
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem;
      background-color: ${bgColor};
      border-left: 4px solid ${borderColor};
      border-radius: 0 8px 8px 0;
      margin-bottom: 0.75rem;
    `;

    div.innerHTML = `
      <span style="
        font-size: 1.25rem;
        font-weight: bold;
        color: ${iconColor};
        flex-shrink: 0;
      ">${icon}</span>
      <div style="flex: 1;">
        <div style="
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 0.25rem;
        ">${this.check}</div>
        <div style="
          font-size: 0.875rem;
          color: var(--color-text-muted);
        ">${this.description}</div>
      </div>
    `;

    return div;
  }

  static renderList(redFlags, container) {
    container.innerHTML = '';
    
    if (!redFlags || redFlags.length === 0) {
      container.innerHTML = '<p>Nu există red flags de verificat.</p>';
      return;
    }

    redFlags.forEach(flag => {
      const item = new RedFlagItem(
        flag.check,
        flag.passed,
        flag.severity,
        flag.description
      );
      container.appendChild(item.render());
    });
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RedFlagItem;
}
