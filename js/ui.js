/* ==========================================
   UI Controller & Auth Modal Handlers
   ========================================== */

import AuthManager from './auth.js';
import ModalManager from './modal.js';
import ToastManager from './toast.js';

const UIManager = {
  /**
   * UI ইন্টারফেস ও অটেন্টিকেশন হ্যান্ডলার ইনিশিয়ালাইজ করা
   */
  init() {
    this.renderUserProfile();
    this.bindAuthEvents();
    this.bindSidebarEvents();
  },

  /**
   * ইউজারের লগইন স্ট্যাটাস অনুযায়ী সাইডবার প্রোফাইল সেকশন আপডেট করা
   */
  renderUserProfile() {
    const profileContainer = document.getElementById('user-profile-section');
    if (!profileContainer) return;

    const currentUser = AuthManager.getCurrentUser();

    if (currentUser) {
      // ইউজার লগইন অবস্থায় থাকলে
      profileContainer.innerHTML = `
        <div class="user-info-card">
          <div class="user-avatar">${currentUser.username.charAt(0).toUpperCase()}</div>
          <div class="user-details">
            <span class="username">${currentUser.username}</span>
            <span class="user-email">${currentUser.email}</span>
          </div>
          <button id="logout-btn" class="icon-btn logout-btn" title="লগআউট">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      `;

      // লগআউট বাটনে ইভেন্ট যুক্ত করা
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          AuthManager.logout();
        });
      }
    } else {
      // ইউজার লগআউট অবস্থায় থাকলে
      profileContainer.innerHTML = `
        <button id="auth-modal-open-btn" class="btn btn-secondary btn-full">
          <i class="fa-solid fa-right-to-bracket"></i> লগইন / সাইনআপ
        </button>
      `;

      // ওপেন মোডাল বাটন ইভেন্ট
      const openModalBtn = document.getElementById('auth-modal-open-btn');
      if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
          ModalManager.open('auth-modal');
        });
      }
    }
  },

  /**
   * সাইনআপ ও লগইন ফর্মের সাথে ইভেন্ট বাইন্ডিং
   */
  bindAuthEvents() {
    const modalCloseBtn = document.getElementById('close-auth-modal');
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabSignupBtn = document.getElementById('tab-signup-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // মোডাল বন্ধের ইভেন্ট
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => {
        ModalManager.close('auth-modal');
      });
    }

    // ট্যাবস সুইচ করা (Login vs Signup)
    if (tabLoginBtn && tabSignupBtn) {
      tabLoginBtn.addEventListener('click', () => {
        tabLoginBtn.classList.add('active');
        tabSignupBtn.classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
      });

      tabSignupBtn.addEventListener('click', () => {
        tabSignupBtn.classList.add('active');
        tabLoginBtn.classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
      });
    }

    // ১. সাইনআপ ফর্ম সাবমিট
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        const result = AuthManager.signup(username, email, password);
        if (result.success) {
          ToastManager.success(result.message);
          ModalManager.close('auth-modal');
          this.renderUserProfile();
        } else {
          ToastManager.error(result.message);
        }
      });
    }

    // ২. লগইন ফর্ম সাবমিট
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailOrUsername = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const result = AuthManager.login(emailOrUsername, password);
        if (result.success) {
          ToastManager.success(result.message);
          ModalManager.close('auth-modal');
          this.renderUserProfile();
        } else {
          ToastManager.error(result.message);
        }
      });
    }
  },

  /**
   * মোবাইল বা ছোট স্ক্রিনে সাইডবার টগল করা
   */
  bindSidebarEvents() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('sidebar');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }
  }
};

export default UIManager;
