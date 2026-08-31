/* ==========================================
   Keyboard Shortcuts Controller Module
   ========================================== */

import ChatManager from './chat.js';
import ChatSearch from './search.js';
import ModalManager from './modal.js';
import ToastManager from './toast.js';

const ShortcutManager = {
  /**
   * শর্টকাট মডিউল ইনিশিয়ালাইজ ও ইভেন্ট লিসেনার সেটআপ করা
   */
  init() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
  },

  /**
   * কিবোর্ড ইভেন্ট হ্যান্ডলিং লজিক
   * @param {KeyboardEvent} e 
   */
  handleKeyDown(e) {
    const isCmdOrCtrl = e.metaKey || e.ctrlKey;
    const key = e.key.toLowerCase();

    // ১. Ctrl / Cmd + Enter -> মেসেজ সেন্ড করা
    if (isCmdOrCtrl && e.key === 'Enter') {
      const promptInput = document.getElementById('prompt-input');
      if (document.activeElement === promptInput) {
        e.preventDefault();
        ChatManager.handleSendPrompt();
      }
      return;
    }

    // ২. Ctrl / Cmd + Shift + F -> সার্চ বার চালু/বন্ধ করা
    if (isCmdOrCtrl && e.shiftKey && key === 'f') {
      e.preventDefault();
      ChatSearch.toggleSearchBar();
      return;
    }

    // ৩. Ctrl / Cmd + K / N -> নতুন চ্যাট সেশন শুরু করা
    if (isCmdOrCtrl && (key === 'k' || key === 'n')) {
      e.preventDefault();
      ChatManager.createNewChat();
      ToastManager.info('নতুন চ্যাট ফাইল শুরু হয়েছে!');
      return;
    }

    // ৪. Escape Key -> যেকোনো অ্যাক্টিভ মোডাল বা সার্চ বার বন্ধ করা
    if (e.key === 'Escape') {
      if (ModalManager.activeModal) {
        ModalManager.closeActiveModal();
      } else {
        ChatSearch.closeSearch();
      }
    }
  }
};

// গ্লোবালি এক্সেসের সুবিধা দেওয়া
window.ShortcutManager = ShortcutManager;

export default ShortcutManager;
