/* ==========================================
   Quick Prompt Templates & Chips Manager
   ========================================== */

import StorageManager from './storage.js';

const TEMPLATES_KEY = 'chat_app_custom_templates';

const TemplateManager = {
  // ডিফল্ট প্রস্তুতকৃত প্রম্পট টেমপ্লেট চিপস
  defaultTemplates: [
    { id: '1', label: '⚡ Code Review', prompt: 'এই কোডটির পারফরম্যান্স এবং সিকিউরিটি চেক করে মান উন্নত করার পরামর্শ দিন:' },
    { id: '2', label: '🐛 Fix Bug', prompt: 'আমার কোডে এই ভুলটি হচ্ছে, সঠিক সমাধান কোড সহ বুঝিয়ে দিন:' },
    { id: '3', label: '📝 Explain Code', prompt: 'নিচের কোড ব্লকটি একদম সহজে স্টেপ-বাই-স্টেপ ব্যাখ্যা করুন:' },
    { id: '4', label: '💡 Refactor', prompt: 'এই কোডটিকে Clean Code নিয়মে পুনর্গঠন (Refactor) করে দিন:' }
  ],

  /**
   * টেমপ্লেট মডিউল ইনিশিয়ালাইজ ও চিপস রেন্ডার করা
   */
  init() {
    this.renderChips();
  },

  /**
   * সেভ করা বা ডিফল্ট টেমপ্লেট তালিকা পাওয়া
   */
  getAllTemplates() {
    try {
      const stored = localStorage.getItem(TEMPLATES_KEY);
      return stored ? JSON.parse(stored) : this.defaultTemplates;
    } catch (e) {
      return this.defaultTemplates;
    }
  },

  /**
   * কাস্টম নতুন প্রম্পট টেমপ্লেট সেভ করা
   */
  addTemplate(label, prompt) {
    const templates = this.getAllTemplates();
    const newTemplate = {
      id: 'tpl_' + Date.now(),
      label: label.trim(),
      prompt: prompt.trim()
    };
    templates.push(newTemplate);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    this.renderChips();
  },

  /**
   * নির্দিষ্ট আইডি দিয়ে টেমপ্লেট ডিলিট করা
   */
  deleteTemplate(id) {
    let templates = this.getAllTemplates();
    templates = templates.filter(t => t.id !== id);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    this.renderChips();
  },

  /**
   * UI-তে টেমপ্লেট চিপস (Chips) রেন্ডার করা
   */
  renderChips() {
    const wrapper = document.getElementById('template-chips-wrapper');
    if (!wrapper) return;

    wrapper.innerHTML = '';
    const templates = this.getAllTemplates();

    templates.forEach(tpl => {
      const chip = document.createElement('button');
      chip.className = 'prompt-chip';
      chip.textContent = tpl.label;
      chip.type = 'button';

      // চিপসে ক্লিক করলে ইনপুট বক্সে টেক্সট সেট করা
      chip.addEventListener('click', () => {
        this.applyTemplateToInput(tpl.prompt);
      });

      wrapper.appendChild(chip);
    });
  },

  /**
   * প্রম্পট ইনপুট ফিল্ডে টেক্সট যোগ করা
   */
  applyTemplateToInput(promptText) {
    const inputEl = document.getElementById('prompt-input');
    if (inputEl) {
      inputEl.value = promptText + ' ';
      inputEl.focus();
    }
  }
};

// গ্লোবাল এক্সেস সুবিধা দেওয়া
window.TemplateManager = TemplateManager;

export default TemplateManager;
