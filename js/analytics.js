/* ==========================================
   App Analytics & Usage Metrics Module
   ========================================== */

const ANALYTICS_KEY = 'chat_app_analytics_data';

const AnalyticsManager = {
  sessionStartTime: null,

  /**
   * অ্যানালিটিক্স মডিউল ইনিশিয়ালাইজ করা
   */
  init() {
    this.sessionStartTime = Date.now();
    this.ensureDataStructure();
    this.trackSessionStart();
  },

  /**
   * লোকাল স্টোরেজে অ্যানালিটিক্স ডাটা অবজেক্ট নিশ্চিত করা
   */
  ensureDataStructure() {
    const existing = localStorage.getItem(ANALYTICS_KEY);
    if (!existing) {
      const initialData = {
        totalPromptsSent: 0,
        totalSessions: 0,
        totalActiveTimeSeconds: 0,
        lastActiveTimestamp: Date.now(),
        events: []
      };
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(initialData));
    }
  },

  /**
   * বর্তমানে সংরক্ষিত ডাটা লোড করা
   */
  getData() {
    try {
      const data = localStorage.getItem(ANALYTICS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Failed to read analytics data:', e);
      return {};
    }
  },

  /**
   * আপডেট করা ডাটা সেভ করা
   */
  saveData(data) {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  },

  /**
   * নতুন সেশন শুরু ট্র্যাকিং
   */
  trackSessionStart() {
    const data = this.getData();
    data.totalSessions = (data.totalSessions || 0) + 1;
    data.lastActiveTimestamp = Date.now();
    this.saveData(data);
  },

  /**
   * প্রম্পট পাঠানোর সংখ্যা ট্র্যাকিং
   */
  trackPromptSent() {
    const data = this.getData();
    data.totalPromptsSent = (data.totalPromptsSent || 0) + 1;
    this.saveData(data);
    this.logEvent('prompt_sent', { timestamp: Date.now() });
  },

  /**
   * কাস্টম ইভেন্ট লগ ইনসার্ট করা
   * @param {string} eventName 
   * @param {Object} metadata 
   */
  logEvent(eventName, metadata = {}) {
    const data = this.getData();
    if (!data.events) data.events = [];

    data.events.push({
      event: eventName,
      time: new Date().toISOString(),
      ...metadata
    });

    // সাম্প্রতিক ৫০টি ইভেন্ট বজায় রাখা
    if (data.events.length > 50) {
      data.events.shift();
    }

    this.saveData(data);
  },

  /**
   * সেশন ডিউরেশন হিসাব করা ও আপডেট করা
   */
  updateActiveTime() {
    if (!this.sessionStartTime) return;
    const now = Date.now();
    const durationInSeconds = Math.floor((now - this.sessionStartTime) / 1000);

    const data = this.getData();
    data.totalActiveTimeSeconds = (data.totalActiveTimeSeconds || 0) + durationInSeconds;
    this.sessionStartTime = now; // রিসেট সেশন টাইম
    this.saveData(data);
  },

  /**
   * সংক্ষিপ্ত মেট্রিক্স রিপোর্ট পাওয়া
   * @returns {{prompts: number, sessions: number, activeMinutes: number}}
   */
  getSummary() {
    this.updateActiveTime();
    const data = this.getData();
    return {
      prompts: data.totalPromptsSent || 0,
      sessions: data.totalSessions || 0,
      activeMinutes: Math.round((data.totalActiveTimeSeconds || 0) / 60)
    };
  }
};

// গ্লোবালি অ্যাক্সেসের সুবিধা দেওয়া
window.AnalyticsManager = AnalyticsManager;

export default AnalyticsManager;
