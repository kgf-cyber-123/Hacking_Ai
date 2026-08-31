/* ==========================================
   Custom Twitter Info API Integration Module
   ========================================== */

const APIManager = {
  // আপনার নির্দিষ্ট করা কাস্টম API Base URL
  BASE_URL: 'https://cxofb.nid-bd.my.id/CXOFB/twitter-info.php',

  /**
   * কাস্টম API-তে প্রম্পট পাঠানো এবং রেসপন্স পাওয়া
   * @param {Array<{role: string, parts: Array<{text: string}>}> | string} messages 
   * @returns {Promise<string>}
   */
  async sendMessage(messages) {
    let promptText = '';

    // ইনপুট অ্যারে নাকি প্লেইন টেক্সট তা ফিল্টার করা
    if (typeof messages === 'string') {
      promptText = messages;
    } else if (Array.isArray(messages) && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.parts && lastMessage.parts[0]) {
        promptText = lastMessage.parts[0].text;
      } else if (lastMessage.content) {
        promptText = lastMessage.content;
      }
    }

    if (!promptText.trim()) {
      throw new Error('কোনো সঠিক প্রম্পট পাওয়া যায়নি!');
    }

    // API URL তৈরি (URL Encoding সহ)
    const requestUrl = `${this.BASE_URL}?prompt=${encodeURIComponent(promptText.trim())}`;

    try {
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*'
        }
      });

      if (!response.ok) {
        throw new Error(`API অনুরোধ ব্যর্থ হয়েছে! স্ট্যাটাস: ${response.status}`);
      }

      // রেসপন্স ডাটা পার্স করা
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        // JSON রেসপন্স হলে ডাটার ভিতরের টেক্সট রিটার্ন করা (API স্ট্রাকচার অনুযায়ী adjust করতে পারেন)
        return data.result || data.response || data.message || JSON.stringify(data, null, 2);
      } else {
        const textData = await response.text();
        return textData;
      }

    } catch (error) {
      console.error('APIManager Error:', error);
      throw error;
    }
  },

  /**
   * স্ট্রিম ফাংশনালিটি সহ সামঞ্জস্য রাখার জন্য (কাস্টম API নন-স্ট্রিম হলেও অ্যাপ ক্র্যাশ করবে না)
   */
  async sendMessageStream(messages, onChunk) {
    const responseText = await this.sendMessage(messages);
    if (typeof onChunk === 'function') {
      onChunk(responseText);
    }
    return responseText;
  }
};

export default APIManager;
