/* ==========================================
   Network Status & Online Monitor Module
   ========================================== */

import ToastManager from './toast.js';

const NetworkManager = {
  isOnline: true,
  offlineBannerEl: null,

  /**
   * নেটওয়ার্ক মডিউল ইনিশিয়ালাইজ করা এবং ইভেন্ট লিসেনার সেটআপ
   */
  init() {
    this.isOnline = navigator.onLine;
    this.offlineBannerEl = document.getElementById('offline-banner');

    // ব্রাউজারের ডিফল্ট অনলাইন/অফলাইন ইভেন্ট লিসেনার
    window.addEventListener('online', () => this.handleOnlineState());
    window.addEventListener('offline', () => this.handleOfflineState());

    // প্রাথমিক অবস্থা যাচাই করা
    if (!this.isOnline) {
      this.handleOfflineState(true);
    }
  },

  /**
   * ইন্টারনেট কানেকশন ফেরত আসলে কল হবে
   */
  handleOnlineState() {
    this.isOnline = true;
    if (this.offlineBannerEl) {
      this.offlineBannerEl.style.display = 'none';
    }
    ToastManager.success('ইন্টারনেট সংযোগ পুনরায় যুক্ত হয়েছে!');
  },

  /**
   * ইন্টারনেট কানেকশন বিচ্ছিন্ন হলে কল হবে
   */
  handleOfflineState(silent = false) {
    this.isOnline = false;
    if (this.offlineBannerEl) {
      this.offlineBannerEl.style.display = 'block';
      this.offlineBannerEl.textContent = '⚠️ ইন্টারনেট সংযোগ নেই! কিছু সুবিধা সীমিত হতে পারে।';
    }
    if (!silent) {
      ToastManager.warning('আপনি বর্তমানে অফলাইনে আছেন!');
    }
  },

  /**
   * বর্তমান নেটওয়ার্ক স্ট্যাটাস চেক করা
   * @returns {boolean}
   */
  checkConnection() {
    return navigator.onLine;
  },

  /**
   * কাস্টম পিং টেস্ট করে সার্ভার কানেকশন ভ্যালিডেট করা
   * @returns {Promise<boolean>}
   */
  async pingServer() {
    try {
      const response = await fetch('https://httpbin.org/ping', {
        method: 'HEAD',
        cache: 'no-store'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};

// গ্লোবালি অ্যাক্সেসের সুবিধা দেওয়া
window.NetworkManager = NetworkManager;

export default NetworkManager;
