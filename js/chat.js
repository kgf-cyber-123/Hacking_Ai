/* ==========================================
   Chat Engine & Message UI Controller
   ========================================== */

import StorageManager from './storage.js';
import APIManager from './api.js';
import SecurityManager from './security.js';
import ToastManager from './toast.js';

const ChatManager = {
  currentChatId: null,
  chatViewportEl: null,
  chatListEl: null,
  promptInputEl: null,

  /**
   * চ্যাট মডিউল ইনিশিয়ালাইজ করা
   */
  init() {
    this.chatViewportEl = document.getElementById('chat-viewport');
    this.chatListEl = document.getElementById('chat-list');
    this.promptInputEl = document.getElementById('prompt-input');

    // লোকাল স্টোরেজ থেকে শেষ সক্রিয় চ্যাট লোড করা
    const activeId = StorageManager.getActiveChatId();
    if (activeId) {
      this.loadChat(activeId);
    } else {
      this.createNewChat();
    }
  },

  /**
   * নতুন একটি চ্যাট সেশন শুরু করা
   */
  createNewChat() {
    const newChat = {
      id: 'chat_' + Date.now(),
      title: 'New Workspace Chat',
      messages: [],
      createdAt: new Date().toISOString()
    };

    StorageManager.saveChat(newChat);
    StorageManager.setActiveChatId(newChat.id);
    this.currentChatId = newChat.id;
    this.renderMessages([]);
    this.updateActiveTitle(newChat.title);
  },

  /**
   * নির্দিষ্ট আইডি দিয়ে চ্যাট মেসেজগুলো স্ক্রিনে লোড করা
   */
  loadChat(chatId) {
    const chat = StorageManager.getChatById(chatId);
    if (!chat) {
      this.createNewChat();
      return;
    }

    this.currentChatId = chat.id;
    StorageManager.setActiveChatId(chat.id);
    this.renderMessages(chat.messages || []);
    this.updateActiveTitle(chat.title);
  },

  /**
   * স্ক্রিনে সমস্ত চ্যাট মেসেজ রেন্ডার করা
   */
  renderMessages(messages) {
    if (!this.chatListEl) return;
    this.chatListEl.innerHTML = '';

    messages.forEach(msg => {
      this.appendMessageToDOM(msg.role, msg.content);
    });

    this.scrollToBottom();
  },

  /**
   * DOM-এ একক মেসেজ বাবল যুক্ত করা
   */
  appendMessageToDOM(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;

    const avatarInitial = role === 'user' ? 'U' : 'AI';
    const sanitizedContent = SecurityManager.sanitizeHTML(content);

    messageDiv.innerHTML = `
      <div class="message-avatar">${avatarInitial}</div>
      <div class="message-content">
        <div class="message-header">
          <span>${role === 'user' ? 'You' : 'Copilot AI'}</span>
        </div>
        <div class="message-body">${sanitizedContent}</div>
      </div>
    `;

    this.chatListEl.appendChild(messageDiv);
    this.scrollToBottom();
    return messageDiv;
  },

  /**
   * ইউজার প্রম্পট প্রসেস ও API-তে সেন্ড করা
   */
  async handleSendPrompt() {
    if (!this.promptInputEl) return;
    const promptText = this.promptInputEl.value.trim();

    if (!promptText) return;

    // ১. ইনপুট বক্স ক্লিয়ার করা
    this.promptInputEl.value = '';

    // ২. অ্যাক্টিভ চ্যাট সেশন আনা
    let chat = StorageManager.getChatById(this.currentChatId);
    if (!chat) {
      this.createNewChat();
      chat = StorageManager.getChatById(this.currentChatId);
    }

    // প্রথম মেসেজ হলে চ্যাটের টাইটেল আপডেট করা
    if (chat.messages.length === 0) {
      chat.title = promptText.length > 25 ? promptText.substring(0, 25) + '...' : promptText;
      this.updateActiveTitle(chat.title);
    }

    // ৩. ইউজার মেসেজ ডাটা সেভ ও DOM-এ প্রদর্শন
    const userMsg = { role: 'user', content: promptText };
    chat.messages.push(userMsg);
    StorageManager.saveChat(chat);
    this.appendMessageToDOM('user', promptText);

    // ৪. টাইপিং ইন্ডিকেটর প্রদর্শন
    const typingIndicator = this.showTypingIndicator();

    try {
      // ৫. API অনুরোধ পাঠানো
      const aiResponseText = await APIManager.sendMessage(chat.messages);

      // টাইপিং ইন্ডিকেটর সরিয়ে ফেলা
      this.removeTypingIndicator(typingIndicator);

      // ৬. AI মেসেজ ডাটা সেভ ও DOM-এ প্রদর্শন
      const aiMsg = { role: 'assistant', content: aiResponseText };
      chat.messages.push(aiMsg);
      StorageManager.saveChat(chat);
      this.appendMessageToDOM('assistant', aiResponseText);

    } catch (error) {
      this.removeTypingIndicator(typingIndicator);
      ToastManager.error(error.message || 'মেসেজ পাঠাতে ব্যর্থ হয়েছে!');
      console.error('Chat Send Error:', error);
    }
  },

  /**
   * AI টাইপিং অ্যানিমেশন দেখানো
   */
  showTypingIndicator() {
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'chat-message assistant typing-container';
    indicatorDiv.innerHTML = `
      <div class="message-avatar">AI</div>
      <div class="message-content">
        <div class="message-body">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    `;
    this.chatListEl.appendChild(indicatorDiv);
    this.scrollToBottom();
    return indicatorDiv;
  },

  /**
   * টাইপিং অ্যানিমেশন রিমুভ করা
   */
  removeTypingIndicator(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  },

  /**
   * সক্রিয় চ্যাট ফাইলের নাম টাইটেল বারে দেখানো
   */
  updateActiveTitle(title) {
    const titleEl = document.getElementById('active-file-name');
    if (titleEl) {
      titleEl.textContent = title;
    }
  },

  /**
   * অটো-স্ক্রোল টু বটম
   */
  scrollToBottom() {
    if (this.chatViewportEl) {
      this.chatViewportEl.scrollTop = this.chatViewportEl.scrollHeight;
    }
  }
};

export default ChatManager;
