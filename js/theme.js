/* ==========================================
   Theme Switcher & Preference Module
   ========================================== */

import StorageManager from './storage.js';

const ThemeManager = {
  // সাপোর্ট করা থিমসমূহের তালিকা
  themes: {
    DARK: 'theme-github-dark',
    LIGHT: 'theme-github-light',
    CONTRAST: 'theme-high-contrast'
  },

  /**
   * থিম মডিউল ইনিশিয়ালাইজ করা
   */
  init() {
    const savedTheme = StorageManager.getTheme() || this.themes.DARK;
    this.applyTheme(savedTheme);
    this.setupSystemListener();
  },

  /**
   * নির্দিষ্ট থিম বডি ট্যাগে অ্যাপ্লাই করা এবং স্টোরেজে সেভ করা
   * @param {string} themeName 
   */
  applyTheme(themeName) {
    const body = document.body;

    // আগের সকল থিম ক্লাস রিমুভ করা
    Object.values(this.themes).forEach(t => body.classList.remove(t));

    // নতুন থিম যোগ করা
    if (Object.values(this.themes).includes(themeName)) {
      body.classList.add(themeName);
      StorageManager.setTheme(themeName);
    } else {
      body.classList.add(this.themes.DARK);
      StorageManager.setTheme(this.themes.DARK);
    }

    // সেটিংস সিলেক্টের মান সিঙ্ক করা (যদি থাকে)
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
      themeSelect.value = themeName;
    }
  },

  /**
   * থিম পরিবর্তন (Toggle) করা
   */
  toggleTheme() {
    const currentTheme = StorageManager.getTheme();
    let nextTheme = this.themes.DARK;

    if (currentTheme === this.themes.DARK) {
      nextTheme = this.themes.LIGHT;
    } else if (currentTheme === this.themes.LIGHT) {
      nextTheme = this.themes.CONTRAST;
    } else {
      nextTheme = this.themes.DARK;
    }

    this.applyTheme(nextTheme);
  },

  /**
   * ব্রাউজারের সিস্টেম ডার্ক/লাইটের পরিবর্তন ডিটেক্ট করা
   */
  setupSystemListener() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      // ইউজার ম্যানুয়ালি থিম না সেট করে থাকলে সিস্টেম থিম অনুসরণ করা
      if (!localStorage.getItem('chat_app_theme')) {
        const newTheme = e.matches ? this.themes.DARK : this.themes.LIGHT;
        this.applyTheme(newTheme);
      }
    });
  }
};

// গ্লোবালি অ্যাক্সেসের সুবিধা দেওয়া
window.ThemeManager = ThemeManager;

export default ThemeManager;
