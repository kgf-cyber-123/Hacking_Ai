/* ==========================================
   Storage Manager Module (LocalStorage)
   ========================================== */

const STORAGE_KEYS = {
  THEME: 'chat_app_theme',
  API_KEY: 'chat_app_api_key',
  CHAT_HISTORY: 'chat_app_history',
  ACTIVE_CHAT_ID: 'chat_app_active_id',
  SETTINGS: 'chat_app_settings'
};

const StorageManager = {
  /**
   * থিম প্রেফারেন্স সংরক্ষণ ও লোড করা
   */
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'theme-github-dark';
  },

  setTheme(themeName) {
    localStorage.setItem(STORAGE_KEYS.THEME, themeName);
  },

  /**
   * API Key সংরক্ষণ ও লোড করা
   */
  getApiKey() {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  },

  setApiKey(key) {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
  },

  /**
   * সমস্ত চ্যাট হিস্ট্রি লোড করা
   */
  getAllChats() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse chat history:', e);
      return [];
    }
  },

  /**
   * একটি নির্দিষ্ট চ্যাট সেশন সেভ বা আপডেট করা
   */
  saveChat(chatSession) {
    const chats = this.getAllChats();
    const existingIndex = chats.findIndex(c => c.id === chatSession.id);

    if (existingIndex > -1) {
      chats[existingIndex] = chatSession;
    } else {
      chats.unshift(chatSession); // নতুন চ্যাট শীর্ষে যুক্ত হবে
    }

    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(chats));
  },

  /**
   * নির্দিষ্ট আইডি দিয়ে চ্যাট লোড করা
   */
  getChatById(id) {
    const chats = this.getAllChats();
    return chats.find(c => c.id === id) || null;
  },

  /**
   * নির্দিষ্ট চ্যাট মুছে ফেলা
   */
  deleteChat(id) {
    let chats = this.getAllChats();
    chats = chats.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(chats));

    if (this.getActiveChatId() === id) {
      this.clearActiveChatId();
    }
  },

  /**
   * একটি নির্দিষ্ট চ্যাটের শিরোনাম (Title) আপডেট করা
   */
  updateChatTitle(id, newTitle) {
    const chats = this.getAllChats();
    const chat = chats.find(c => c.id === id);
    if (chat) {
      chat.title = newTitle;
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(chats));
    }
  },

  /**
   * অ্যাক্টিভ চ্যাট আইডি ট্র্যাকিং
   */
  getActiveChatId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT_ID) || null;
  },

  setActiveChatId(id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT_ID, id);
  },

  clearActiveChatId() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT_ID);
  },

  /**
   * অ্যাপের সেটিংস লোড ও সেভ করা
   */
  getSettings() {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : { systemPrompt: '', model: 'gemini-1.5-flash' };
    } catch (e) {
      return { systemPrompt: '', model: 'gemini-1.5-flash' };
    }
  },

  saveSettings(settingsObj) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsObj));
  },

  /**
   * সমস্ত ডাটা ক্লিয়ার করা (Reset App)
   */
  clearAll() {
    localStorage.clear();
  }
};

export default StorageManager;
