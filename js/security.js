/* ==========================================
   Security & Input Sanitization Module
   ========================================== */

const SecurityManager = {
  /**
   * সাধারণ টেক্সট থেকে HTML স্পেশাল ক্যারেক্টার এস্কেপ করা (XSS প্রতিরোধে)
   * @param {string} str 
   * @returns {string}
   */
  escapeHTML(str) {
    if (!str || typeof str !== 'string') return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, (m) => map[m]);
  },

  /**
   * রেন্ডার হওয়ার পূর্বে কাস্টম HTML/Markdown সেনিটাইজ করা
   * ক্ষতিকারক <script>, <iframe>, javascript: ইউআরএল বা inline event handlers রিমুভ করা
   * @param {string} htmlContent 
   * @returns {string}
   */
  sanitizeHTML(htmlContent) {
    if (!htmlContent || typeof htmlContent !== 'string') return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // ক্ষতিকারক ট্যাগসমূহ রিমুভ করা
    const forbiddenTags = ['script', 'iframe', 'object', 'embed', 'form', 'style', 'meta'];
    forbiddenTags.forEach(tag => {
      const elements = doc.querySelectorAll(tag);
      elements.forEach(el => el.remove());
    });

    // অনাকাঙ্ক্ষিত এট্রিবিউট (যেমন: onclick, onload) ও javascript: URL চেক করা
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        const attrName = attr.name.toLowerCase();
        const attrValue = attr.value.toLowerCase();

        // inline event handlers (on*) রিমুভ
        if (attrName.startsWith('on')) {
          el.removeAttribute(attr.name);
        }

        // href/src এ javascript: বা data: URI থাকলে মুছে ফেলা
        if ((attrName === 'href' || attrName === 'src') && (attrValue.includes('javascript:') || attrValue.includes('data:text/html'))) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return doc.body.innerHTML;
  },

  /**
   * আপলোড করা ফাইলের সিকিউরিটি চেক (সাইজ ও টাইপ ভ্যালিডেশন)
   * @param {File} file 
   * @param {Array<string>} allowedTypes - উদাহরণ: ['image/jpeg', 'image/png', 'application/json']
   * @param {number} maxMBSize - সর্বোচ্চ সাইজ (মেগাবাইট)
   * @returns {{ valid: boolean, message: string }}
   */
  validateFile(file, allowedTypes = [], maxMBSize = 5) {
    if (!file) {
      return { valid: false, message: 'কোন ফাইল নির্বাচিত হয়নি।' };
    }

    // ফাইল সাইজ চেক
    const maxBytes = maxMBSize * 1024 * 1024;
    if (file.size > maxBytes) {
      return { valid: false, message: `ফাইলের সাইজ সর্বোচ্চ ${maxMBSize}MB হতে পারবে।` };
    }

    // টাইপ চেক
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return { valid: false, message: 'অনুমোদিত নয় এমন ফাইল টাইপ!' };
    }

    return { valid: true, message: 'ফাইলটি সুরক্ষিত।' };
  },

  /**
   * API Key এর বেসিক ফরম্যাট ভ্যালিডেশন
   * @param {string} key 
   * @returns {boolean}
   */
  isValidApiKey(key) {
    if (!key || typeof key !== 'string') return false;
    const trimmed = key.trim();
    return trimmed.length >= 20; // সাধারণ ন্যূনতম দৈর্ঘ্য যাচাই
  }
};

export default SecurityManager;
