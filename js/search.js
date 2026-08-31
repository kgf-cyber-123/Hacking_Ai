/* ==========================================
   Chat Search & Text Highlighting Module
   ========================================== */

import SecurityManager from './security.js';

const ChatSearch = {
  searchBarEl: null,
  searchInputEl: null,
  chatViewportEl: null,
  currentQuery: '',

  /**
   * সার্চ মডিউল ইনিশিয়ালাইজ করা
   */
  init() {
    this.searchBarEl = document.getElementById('chat-search-bar');
    this.searchInputEl = document.getElementById('search-query-input');
    this.chatViewportEl = document.getElementById('chat-viewport');
  },

  /**
   * সার্চ বার প্রদর্শন বা গোপন (Toggle) করা
   */
  toggleSearchBar() {
    if (!this.searchBarEl) this.init();

    if (this.searchBarEl.style.display === 'none' || !this.searchBarEl.style.display) {
      this.openSearch();
    } else {
      this.closeSearch();
    }
  },

  /**
   * সার্চ বার চালু করা এবং ইনপুট বক্সে ফোকাস দেওয়া
   */
  openSearch() {
    if (!this.searchBarEl) this.init();
    this.searchBarEl.style.display = 'flex';
    if (this.searchInputEl) {
      this.searchInputEl.focus();
      this.searchInputEl.select();
    }
  },

  /**
   * সার্চ বার বন্ধ করা এবং হাইলাইট ক্লিয়ার করা
   */
  closeSearch() {
    if (!this.searchBarEl) this.init();
    if (this.searchBarEl) {
      this.searchBarEl.style.display = 'none';
    }
    if (this.searchInputEl) {
      this.searchInputEl.value = '';
    }
    this.clearHighlights();
  },

  /**
   * ইনপুট টেক্সট অনুযায়ী মেসেজ ফিল্টার ও হাইলাইট করা
   * @param {string} query 
   */
  filterChatMessages(query) {
    this.currentQuery = query.trim().toLowerCase();
    this.clearHighlights();

    if (!this.currentQuery) return;

    const messageBodies = document.querySelectorAll('.message-body');

    messageBodies.forEach(bodyEl => {
      this.highlightTextNodes(bodyEl, this.currentQuery);
    });

    // প্রথম ম্যাচ হওয়া এলিমেন্টে স্ক্রোল করা
    const firstMatch = document.querySelector('mark.highlight-match');
    if (firstMatch) {
      firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  /**
   * টেক্সট নোডের ভিতরে অনুসন্ধান করে `<mark>` ট্যাগ বসানো
   */
  highlightTextNodes(node, query) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue;
      const lowerText = text.toLowerCase();
      const index = lowerText.indexOf(query);

      if (index !== -1) {
        const span = document.createElement('span');
        const before = text.substring(0, index);
        const match = text.substring(index, index + query.length);
        const after = text.substring(index + query.length);

        span.innerHTML = `${SecurityManager.escapeHTML(before)}<mark class="highlight-match">${SecurityManager.escapeHTML(match)}</mark>${SecurityManager.escapeHTML(after)}`;
        
        node.parentNode.replaceChild(span, node);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE && node.childNodes && !['SCRIPT', 'STYLE', 'MARK', 'CODE', 'PRE'].includes(node.tagName)) {
      Array.from(node.childNodes).forEach(child => this.highlightTextNodes(child, query));
    }
  },

  /**
   * সকল হাইলাইট করা মার্ক তুলে নেওয়া
   */
  clearHighlights() {
    const highlights = document.querySelectorAll('mark.highlight-match');
    highlights.forEach(mark => {
      const parent = mark.parentNode;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize(); // টেক্সট নোডগুলো পুনর্মিলন করা
    });
  }
};

// গ্লোবাল এক্সেস বা জানালার সাথে সংযুক্ত করা
window.ChatSearch = ChatSearch;

export default ChatSearch;
