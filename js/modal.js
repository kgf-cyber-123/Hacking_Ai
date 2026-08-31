/* ==========================================
   Modal & Dialog Controller Module
   ========================================== */

const ModalManager = {
  activeModal: null,

  /**
   * মোডাল মডিউল ইনিশিয়ালাইজ করা এবং ইভেন্ট লিসেনার সেটআপ
   */
  init() {
    // Escape key দিয়ে সক্রিয় মোডাল বন্ধ করা
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.closeActiveModal();
      }
    });

    // মোডালের বাইরে (Overlay) ক্লিক করলে বন্ধ হওয়া
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.closeActiveModal();
      }
    });
  },

  /**
   * নির্দিষ্ট আইডি দিয়ে মোডাল ওপেন করা
   * @param {string} modalId 
   */
  open(modalId) {
    const modalEl = document.getElementById(modalId);
    if (!modalEl) {
      console.warn(`Modal Element with ID "${modalId}" not found.`);
      return;
    }

    // আগের খোলা মোডাল থাকলে বন্ধ করে নেওয়া
    if (this.activeModal && this.activeModal !== modalEl) {
      this.closeActiveModal();
    }

    modalEl.classList.add('active');
    modalEl.style.display = 'flex';
    document.body.classList.add('modal-open');
    this.activeModal = modalEl;

    // ফার্স্ট ইনপুট এলিমেন্টে অটো ফোকাস
    const focusableInput = modalEl.querySelector('input, textarea, button');
    if (focusableInput) {
      focusableInput.focus();
    }
  },

  /**
   * নির্দিষ্ট আইডি দিয়ে মোডাল বন্ধ করা
   * @param {string} modalId 
   */
  close(modalId) {
    const modalEl = document.getElementById(modalId);
    if (!modalEl) return;

    modalEl.classList.remove('active');
    modalEl.style.display = 'none';

    if (this.activeModal === modalEl) {
      this.activeModal = null;
    }

    // অন্য কোনো মোডাল খোলা না থাকলে বডি স্ক্রোল এনাবল করা
    const remainingModals = document.querySelectorAll('.modal-overlay.active, .modal.active');
    if (remainingModals.length === 0) {
      document.body.classList.remove('modal-open');
    }
  },

  /**
   * বর্তমানে যেকোনো খোলা মোডাল বন্ধ করা
   */
  closeActiveModal() {
    if (this.activeModal) {
      const id = this.activeModal.id;
      this.close(id);
    }
  },

  /**
   * নির্দিষ্ট মোডালের প্রদর্শন ফিল্টার (Toggle)
   * @param {string} modalId 
   */
  toggle(modalId) {
    const modalEl = document.getElementById(modalId);
    if (!modalEl) return;

    if (modalEl.classList.contains('active')) {
      this.close(modalId);
    } else {
      this.open(modalId);
    }
  }
};

// গ্লোবালি মোডাল অ্যাক্সেস করার সুবিধা দেওয়া
window.ModalManager = ModalManager;

export default ModalManager;
