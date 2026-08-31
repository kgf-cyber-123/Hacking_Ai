/* ==========================================
   Toast Notification Engine Module
   ========================================== */

const ToastManager = {
  containerEl: null,

  /**
   * টোস্ট কন্টেইনার অটো-ইনশিয়ালাইজ করা
   */
  init() {
    if (!this.containerEl) {
      let existing = document.querySelector('.toast-container');
      if (existing) {
        this.containerEl = existing;
      } else {
        this.containerEl = document.createElement('div');
        this.containerEl.className = 'toast-container';
        document.body.appendChild(this.containerEl);
      }
    }
  },

  /**
   * টোস্ট নোটিফিকেশন প্রদর্শন করা
   * @param {string} message - নোটিফিকেশনের টেক্সট
   * @param {'success' | 'error' | 'info' | 'warning'} type - নোটিফিকেশনের ধরণ
   * @param {number} duration - কত সময় থাকবে (milliseconds)
   */
  show(message, type = 'info', duration = 3000) {
    this.init();

    const toastItem = document.createElement('div');
    toastItem.className = `toast-item ${type}`;
    
    // টাইপ অনুযায়ী আইকন ও টেক্সট নির্ধারণ
    const icon = this.getIcon(type);
    toastItem.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${this.escapeHTML(message)}</span>
    `;

    this.containerEl.appendChild(toastItem);

    // নির্দিষ্ট সময় পর অটোমেটিক সরিয়ে ফেলা
    setTimeout(() => {
      this.remove(toastItem);
    }, duration);
  },

  /**
   * টাইপ অনুসারে আইকন সিলেক্ট
   */
  getIcon(type) {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info':
      default: return 'ℹ';
    }
  },

  /**
   * টোস্ট হাইড অ্যানিমেশন সম্পন্ন করে সরিয়ে ফেলা
   */
  remove(toastItem) {
    toastItem.classList.add('hide');
    toastItem.addEventListener('transitionend', () => {
      if (toastItem.parentNode) {
        toastItem.parentNode.removeChild(toastItem);
      }
    });
  },

  /**
   * হেল্পার মোডসমূহ (Shortcut Methods)
   */
  success(msg, duration) { this.show(msg, 'success', duration); },
  error(msg, duration) { this.show(msg, 'error', duration); },
  info(msg, duration) { this.show(msg, 'info', duration); },
  warning(msg, duration) { this.show(msg, 'warning', duration); },

  /**
   * টেক্সট সেনিটাইজার
   */
  escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

export default ToastManager;
