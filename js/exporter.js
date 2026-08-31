/* ==========================================
   Chat Data Exporter & Download Module
   ========================================== */

import StorageManager from './storage.js';
import ToastManager from './toast.js';
import SecurityManager from './security.js';

const ExporterManager = {

  /**
   * ফাইল ডাউনলোড ফায়ার করা
   * @param {string} content 
   * @param {string} filename 
   * @param {string} mimeType 
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  },

  /**
   * মেসেজ অবজেক্ট থেকে প্লেইন টেক্সট ফরম্যাট তৈরি করা
   */
  formatAsPlainText(chat) {
    let output = `--- ${chat.title || 'Chat Export'} ---\n`;
    output += `Date: ${new Date(chat.createdAt || Date.now()).toLocaleString()}\n\n`;

    (chat.messages || []).forEach(msg => {
      const sender = msg.role === 'user' ? 'User' : 'Copilot AI';
      output += `[${sender}]\n${msg.content}\n\n`;
    });

    return output;
  },

  /**
   * মেসেজ অবজেক্ট থেকে Markdown (MD) ফরম্যাট তৈরি করা
   */
  formatAsMarkdown(chat) {
    let output = `# ${chat.title || 'Chat Export'}\n\n`;
    output += `*Exported on: ${new Date(chat.createdAt || Date.now()).toLocaleString()}*\n\n---\n\n`;

    (chat.messages || []).forEach(msg => {
      const sender = msg.role === 'user' ? '### 👤 User' : '### 🤖 Copilot AI';
      output += `${sender}\n\n${msg.content}\n\n---\n\n`;
    });

    return output;
  },

  /**
   * মেসেজ অবজেক্ট থেকে সুবিন্যস্ত HTML ফরম্যাট তৈরি করা
   */
  formatAsHTML(chat) {
    const sanitizedTitle = SecurityManager.escapeHTML(chat.title || 'Chat Export');
    let htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>${sanitizedTitle}</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 20px auto; padding: 20px; background: #0f172a; color: #f8fafc; }
    h1 { color: #38bdf8; border-bottom: 2px solid #334155; padding-bottom: 10px; }
    .message { margin-bottom: 20px; padding: 15px; border-radius: 8px; }
    .user { background: #1e293b; border-left: 4px solid #38bdf8; }
    .assistant { background: #1e293b; border-left: 4px solid #10b981; }
    .sender { font-weight: bold; margin-bottom: 5px; color: #94a3b8; }
    .content { whitespace: pre-wrap; }
  </style>
</head>
<body>
  <h1>${sanitizedTitle}</h1>
`;

    (chat.messages || []).forEach(msg => {
      const sender = msg.role === 'user' ? 'User' : 'Copilot AI';
      const cssClass = msg.role === 'user' ? 'user' : 'assistant';
      const cleanText = SecurityManager.escapeHTML(msg.content);

      htmlContent += `  <div class="message ${cssClass}">
    <div class="sender">${sender}</div>
    <div class="content">${cleanText}</div>
  </div>\n`;
    });

    htmlContent += `</body>\n</html>`;
    return htmlContent;
  },

  /**
   * সক্রিয় চ্যাট নির্দিষ্ট ফরম্যাটে এক্সপোর্ট করা
   * @param {'txt' | 'md' | 'json' | 'html'} format 
   */
  exportActiveChat(format = 'md') {
    const activeId = StorageManager.getActiveChatId();
    if (!activeId) {
      ToastManager.error('কোনো চ্যাট সক্রিয় নেই!');
      return;
    }

    const chat = StorageManager.getChatById(activeId);
    if (!chat || !chat.messages || chat.messages.length === 0) {
      ToastManager.error('চ্যাটে কোনো এক্সপোর্ট করার মত মেসেজ নেই!');
      return;
    }

    const safeTitle = (chat.title || 'chat').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const timestamp = Date.now();

    switch (format.toLowerCase()) {
      case 'txt':
        this.downloadFile(this.formatAsPlainText(chat), `${safeTitle}_${timestamp}.txt`, 'text/plain');
        break;
      case 'md':
        this.downloadFile(this.formatAsMarkdown(chat), `${safeTitle}_${timestamp}.md`, 'text/markdown');
        break;
      case 'html':
        this.downloadFile(this.formatAsHTML(chat), `${safeTitle}_${timestamp}.html`, 'text/html');
        break;
      case 'json':
        this.downloadFile(JSON.stringify(chat, null, 2), `${safeTitle}_${timestamp}.json`, 'application/json');
        break;
      default:
        ToastManager.error('অসমর্থিত ফাইল ফরম্যাট!');
        return;
    }

    ToastManager.success(`চ্যাট সফলভাবে .${format} ফরম্যাটে এক্সপোর্ট হয়েছে!`);
  },

  /**
   * চ্যাট মেসেজ ক্লিপবোর্ডে কপি করা
   */
  async copyChatToClipboard() {
    const activeId = StorageManager.getActiveChatId();
    if (!activeId) return;

    const chat = StorageManager.getChatById(activeId);
    if (!chat || !chat.messages || chat.messages.length === 0) {
      ToastManager.error('কপি করার জন্য কোনো মেসেজ পাওয়া যায়নি!');
      return;
    }

    const plainText = this.formatAsPlainText(chat);

    try {
      await navigator.clipboard.writeText(plainText);
      ToastManager.success('চ্যাট ক্লিপবোর্ডে কপি করা হয়েছে!');
    } catch (err) {
      ToastManager.error('কপি করতে ব্যর্থ হয়েছে!');
    }
  }
};

export default ExporterManager;
