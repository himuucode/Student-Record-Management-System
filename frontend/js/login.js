/* ==================================================================
   login.js - Figure 1: Login Page
   ================================================================== */
(function () {
  const form = document.getElementById('loginForm');
  const usernameEl = document.getElementById('username');
  const passwordEl = document.getElementById('password');
  const button = document.getElementById('loginBtn');
  const MESSAGE_ID = 'loginMessage';

  /* Already logged in? go straight to the dashboard */
  if (window.Api.Auth.getToken()) {
    window.location.replace('dashboard.html');
  }

  function showError(text) {
    const el = document.getElementById(MESSAGE_ID);
    if (!el) return;
    el.className = 'message error show';
    el.textContent = text;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const el = document.getElementById(MESSAGE_ID);
    if (el) el.className = 'message';

    const username = usernameEl.value.trim();
    const password = passwordEl.value;

    /* frontend validation */
    if (!username && !password) {
      showError('Please enter your username and password.');
      return;
    }
    if (!username) {
      showError('Please enter your username.');
      return;
    }
    if (!password) {
      showError('Please enter your password.');
      return;
    }

    button.disabled = true;
    button.textContent = 'Logging in...';

    try {
      const { token, admin } = await window.Api.login(username, password);
      window.Api.Auth.setSession(token, admin);
      window.location.href = 'dashboard.html';
    } catch (err) {
      showError(err.message || 'Login failed. Please try again.');
      passwordEl.value = '';
      passwordEl.focus();
    } finally {
      button.disabled = false;
      button.textContent = 'Login';
    }
  });
})();