/* ==========================================
   Main Application Entry Point & Controller
   ========================================== */
import AuthManager from './auth.js';
import ThemeManager from './theme.js';
import ModalManager from './modal.js';
import NetworkManager from './network.js';
import ShortcutManager from './shortcuts.js';
import TemplateManager from './templates.js';
import AnalyticsManager from './analytics.js';
import ChatManager from './chat.js';
import ChatSearch from './search.js';
import ExporterManager from './exporter.js';
import BackupManager from './backup.js';

const App = {
  /**
   * সম্পূর্ণ অ্যাপ্লিকেশন ইনিশিয়ালাইজ ও লোড করা
   */
  init() {
    console.log('🚀 App initializing...');

    // ১. থিম ও নেটওয়ার্ক কনফিগারেশন লোড
    ThemeManager.init();
    NetworkManager.init();

    // ২. ইন্টারফেস মোডাল ও শর্টকাট সক্রিয় করা
    ModalManager.init();
    ShortcutManager.init();

    // ৩. অ্যানালিটিক্স ও টেমপ্লেট চিপস লোড
    AnalyticsManager.init();
    TemplateManager.init();

    // ৪. চ্যাট ও সার্চ মডিউল চালু করা
    ChatManager.init();
    ChatSearch.init();

    // ৫. DOM ইভেন্ট লিসেনার সমুহ যুক্ত করা
    this.bindEvents();

    console.log('✅ App initialized successfully!');
  },

  /**
   * ইউজার ইন্টারফেসের বিভিন্ন বাটন ও ইনপুট ফিল্ডের সাথে ইভেন্ট বাইন্ডিং
   */
  bindEvents() {
    // প্রম্পট সেন্ড বাটন
    const sendBtn = document.getElementById('send-prompt-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        ChatManager.handleSendPrompt();
        AnalyticsManager.trackPromptSent();
      });
    }

    // নতুন চ্যাট তৈরি করার বাটন
    const newChatBtn = document.getElementById('new-chat-btn');
    if (newChatBtn) {
      newChatBtn.addEventListener('click', () => {
        ChatManager.createNewChat();
      });
    }

    // চ্যাট ইনপুট ফিল্ডে Enter প্রেস করলে কাজ করা (শর্টকাট হ্যান্ডলার ছাড়া সাধারণ সাবমিট)
    const promptInput = document.getElementById('prompt-input');
    if (promptInput) {
      promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          ChatManager.handleSendPrompt();
          AnalyticsManager.trackPromptSent();
        }
      });
    }

    // চ্যাট সার্চ ইনপুট ফিল্ড
    const searchInput = document.getElementById('search-query-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        ChatSearch.filterChatMessages(e.target.value);
      });
    }

    // সার্চ বার খোলার বাটন
    const openSearchBtn = document.getElementById('open-search-btn');
    if (openSearchBtn) {
      openSearchBtn.addEventListener('click', () => {
        ChatSearch.toggleSearchBar();
      });
    }

    // সার্চ বার বন্ধের বাটন
    const closeSearchBtn = document.getElementById('close-search-btn');
    if (closeSearchBtn) {
      closeSearchBtn.addEventListener('click', () => {
        ChatSearch.closeSearch();
      });
    }

    // থিম চেঞ্জ সিলেক্টর/বাটন
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        ThemeManager.applyTheme(e.target.value);
      });
    }

    // এক্সপোর্ট বাটনসমূহ
    const exportMarkdownBtn = document.getElementById('export-md-btn');
    if (exportMarkdownBtn) {
      exportMarkdownBtn.addEventListener('click', () => {
        ExporterManager.exportActiveChat('md');
      });
    }

    const exportTxtBtn = document.getElementById('export-txt-btn');
    if (exportTxtBtn) {
      exportTxtBtn.addEventListener('click', () => {
        ExporterManager.exportActiveChat('txt');
      });
    }

    const exportHtmlBtn = document.getElementById('export-html-btn');
    if (exportHtmlBtn) {
      exportHtmlBtn.addEventListener('click', () => {
        ExporterManager.exportActiveChat('html');
      });
    }

    // ডাটা ব্যাকআপ ডাউনলোড বাটন
    const backupExportBtn = document.getElementById('backup-export-btn');
    if (backupExportBtn) {
      backupExportBtn.addEventListener('click', () => {
        BackupManager.exportFullBackup();
      });
    }
     const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const res = AuthManager.signup(username, email, password);
    if (res.success) {
      ToastManager.success(res.message);
      ModalManager.closeActiveModal();
      window.location.reload();
    } else {
      ToastManager.error(res.message);
    }
  });
}

// লগইন ফর্ম সাবমিট
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailOrUsername = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const res = AuthManager.login(emailOrUsername, password);
    if (res.success) {
      ToastManager.success(res.message);
      ModalManager.closeActiveModal();
      window.location.reload();
    } else {
      ToastManager.error(res.message);
    }
  });
}

// লগআউট বাটন
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    AuthManager.logout();
  });
}


    // ডাটা রিস্টোর ফাইল ইনপুট ফিল্ড
    const restoreFileInput = document.getElementById('backup-restore-input');
    if (restoreFileInput) {
      restoreFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          BackupManager.restoreBackupFromFile(file);
        }
      });
    }
  }
};

// DOM লোড সম্পন্ন হলে অ্যাপ চালু করা
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

export default App;
