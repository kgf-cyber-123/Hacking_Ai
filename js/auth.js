/* ==========================================
   Authentication & Key Management Module
   ========================================== */

import StorageManager from './storage.js';
import SecurityManager from './security.js';

const AuthManager = {
  /**
   * অ্যাপ শুরু হওয়ার সময় অটেন্টিকেশন স্টেট চেক করা
   * @returns {{ authenticated: boolean, apiKey: string }}
   */
  init() {
    const apiKey = StorageManager.getApiKey();
    const isAuthenticated = this.validateApiKey(apiKey);
    
    return {
      authenticated: isAuthenticated,
      apiKey: apiKey
    };
  },

  /**
   * ইউজার ইনপুট দেওয়া API Key যাচাই এবং সেভ করা
   * @param {string} rawKey 
   * @returns {{ success: boolean, message: string }}
   */
  loginWithApiKey(rawKey) {
    if (!rawKey) {
      return { success: false, message: 'অনুগ্রহ করে একটি সঠিক API Key প্রদান করুন।' };
    }

    const cleanKey = rawKey.trim();

    // সিকিউরিটি ফিল্টার চেক
    if (!SecurityManager.isValidApiKey(cleanKey)) {
      return { success: false, message: 'প্রদেয় API Key-টি সঠিক ফরম্যাটের নয়।' };
    }

    // স্টোরেজে সেভ
    StorageManager.setApiKey(cleanKey);
    return { success: true, message: 'API Key সফলভাবে সংরক্ষিত হয়েছে!' };
  },

  /**
   * লোকাল স্টোরেজ থেকে API Key রিমুভ (লগআউট) করা
   */
  logout() {
    StorageManager.setApiKey('');
    StorageManager.clearActiveChatId();
    return true;
  },

  /**
   * বর্তমানে সংরক্ষিত API Key আছে কিনা তা নিশ্চিত করা
   * @returns {boolean}
   */
  isLoggedIn() {
    const key = StorageManager.getApiKey();
    return this.validateApiKey(key);
  },

  /**
   * বর্তমানে অ্যাক্টিভ থাকা API Key রিটার্ন করা
   * @returns {string}
   */
  getCurrentApiKey() {
    return StorageManager.getApiKey();
  },

  /**
   * অভ্যন্তরীণ ইন্টারনাল API Key যাচাই নিয়ম
   * @param {string} key 
   * @returns {boolean}
   */
  validateApiKey(key) {
    if (!key || typeof key !== 'string') return false;
    return key.trim().length >= 20;
  }
};

export default AuthManager;
