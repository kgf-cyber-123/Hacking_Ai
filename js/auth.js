/* ==========================================
   Authentication & Key Management Module
   ========================================== */

import StorageManager from './storage.js';
import SecurityManager from './security.js';
/* ==========================================
   User Auth & Session Management Module
   ========================================== */

import ToastManager from './toast.js';

const USERS_STORAGE_KEY = 'app_registered_users';
const CURRENT_USER_KEY = 'app_current_user_session';

const AuthManager = {
  /**
   * অ্যাপ লোড হওয়ার সময় অটেন্টিকেশন স্টেট চেক করা
   */
  init() {
    const currentUser = this.getCurrentUser();
    return {
      authenticated: !!currentUser,
      user: currentUser
    };
  },

  /**
   * নিবন্ধিত সকল ইউজারের তালিকা পাওয়া
   */
  getRegisteredUsers() {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  /**
   * নতুন অ্যাকাউন্ট সাইন আপ (Signup) করা
   * @param {string} username 
   * @param {string} email 
   * @param {string} password 
   * @returns {{ success: boolean, message: string }}
   */
  signup(username, email, password) {
    const cleanUsername = SecurityManager.escapeHTML(username.trim());
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername || !cleanEmail || !password) {
      return { success: false, message: 'সমস্ত তথ্য সঠিক ভাবে দিন!' };
    }

    if (password.length < 6) {
      return { success: false, message: 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে!' };
    }

    const users = this.getRegisteredUsers();

    // ইমেইল বা ইউজারনেম আগেই আছে কিনা তা পরীক্ষা করা
    const existingUser = users.find(u => u.email === cleanEmail || u.username === cleanUsername);
    if (existingUser) {
      return { success: false, message: 'এই ইমেইল বা ইউজারনেম দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে!' };
    }

    // নতুন ইউজার অবজেক্ট তৈরি
    const newUser = {
      id: 'user_' + Date.now(),
      username: cleanUsername,
      email: cleanEmail,
      password: btoa(password), // সিম্পল এনকোডিং (প্রোডাকশনে ব্যাকএন্ড হ্যাশিং ব্যবহার করা হয়)
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // সাইন আপ সফল হওয়ার পর অটো-লগইন করানো
    this.createSession(newUser);

    return { success: true, message: 'অ্যাকোউন্ট সফলভাবে তৈরি হয়েছে!' };
  },

  /**
   * ইউজার লগইন (Login) করা
   * @param {string} emailOrUsername 
   * @param {string} password 
   * @returns {{ success: boolean, message: string }}
   */
  login(emailOrUsername, password) {
    const inputKey = emailOrUsername.trim().toLowerCase();
    const encodedPassword = btoa(password);

    const users = this.getRegisteredUsers();
    const user = users.find(u => 
      (u.email === inputKey || u.username.toLowerCase() === inputKey) && 
      u.password === encodedPassword
    );

    if (!user) {
      return { success: false, message: 'ভুল ইমেইল/ইউজারনেম অথবা পাসওয়ার্ড!' };
    }

    this.createSession(user);
    return { success: true, message: 'লগইন সফল হয়েছে!' };
  },

  /**
   * সেশন সংরক্ষণ করা
   */
  createSession(user) {
    const sessionData = {
      id: user.id,
      username: user.username,
      email: user.email,
      loginTime: Date.now()
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionData));
  },

  /**
   * অ্যাকাউন্ট লগআউট করা
   */
  logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    StorageManager.clearActiveChatId();
    ToastManager.info('আপনি লগআউট হয়েছেন।');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  },

  /**
   * বর্তমান লগইন থাকা ইউজার তথ্য পাওয়া
   */
  getCurrentUser() {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * ইউজার লগইন অবস্থায় আছে কিনা তা জানা
   * @returns {boolean}
   */
  isLoggedIn() {
    return !!this.getCurrentUser();
  }
};

export default AuthManager;

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
