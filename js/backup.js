/* ==========================================
   Full Application Data Backup & Restore Module
   ========================================== */

import StorageManager from './storage.js';
import SecurityManager from './security.js';
import ToastManager from './toast.js';

const BackupManager = {
  /**
   * সমস্ত অ্যাপ্লিকেশনের ডাটা ব্যাকআপ ব্যাকআপ JSON ফাইল হিসেবে এক্সপোর্ট করা
   */
  exportFullBackup() {
    try {
      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        chats: StorageManager.getAllChats(),
        activeChatId: StorageManager.getActiveChatId(),
        theme: StorageManager.getTheme(),
        apiKey: StorageManager.getApiKey()
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const filename = `copilot_backup_${Date.now()}.json`;

      const blob = new Blob([jsonString], { type: 'application/json' });
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

      ToastManager.success('সম্পূর্ণ ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('Export Backup Error:', error);
      ToastManager.error('ব্যাকআপ ফাইল তৈরি করতে ব্যর্থ হয়েছে!');
    }
  },

  /**
   * JSON ফাইল থেকে ডাটা ইমপোর্ট ও রিস্টোর করা
   * @param {File} file 
   */
  async restoreBackupFromFile(file) {
    // ফাইল সিকিউরিটি যাচাই
    const fileValidation = SecurityManager.validateFile(file, ['application/json', 'text/plain'], 10);
    if (!fileValidation.valid) {
      ToastManager.error(fileValidation.message);
      return;
    }

    try {
      const fileText = await file.text();
      const parsedData = JSON.parse(fileText);

      // ব্যাকআপ ফাইলের মৌলিক গঠন পরীক্ষা
      if (!parsedData || typeof parsedData !== 'object' || !Array.isArray(parsedData.chats)) {
        throw new Error('অবৈধ বা ক্ষতিগ্রস্ত ব্যাকআপ ফাইল!');
      }

      // ১. চ্যাট সমুহ সংরক্ষণ করা
      parsedData.chats.forEach(chat => {
        if (chat.id && Array.isArray(chat.messages)) {
          StorageManager.saveChat(chat);
        }
      });

      // ২. অ্যাক্টিভ চ্যাট আইডি আপডেট
      if (parsedData.activeChatId) {
        StorageManager.setActiveChatId(parsedData.activeChatId);
      }

      // ৩. থিম সেটিংস আপডেট
      if (parsedData.theme) {
        StorageManager.setTheme(parsedData.theme);
      }

      // ৪. API Key আপডেট (যদি উপস্থিত থাকে)
      if (parsedData.apiKey) {
        StorageManager.setApiKey(parsedData.apiKey);
      }

      ToastManager.success('ডাটা সফলভাবে রিস্টোর করা হয়েছে! পেজ রিফ্রেশ হচ্ছে...');
      
      // পরিবর্তন কার্যকর করতে অ্যাপ পেজ রিফ্রেশ করা
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Restore Backup Error:', error);
      ToastManager.error('রিস্টোর করার সময় সমস্যা হয়েছে: ' + (error.message || 'অবৈধ ফাইল'));
    }
  }
};

// গ্লোবালি এক্সেসের সুবিধা দেওয়া
window.BackupManager = BackupManager;

export default BackupManager;
