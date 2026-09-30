/* ==================================================================
   settings.js - Figure 7: Settings (System Settings form)
   ================================================================== */
(function () {
  const MESSAGE_ID = 'settingsMessage';
  const form = document.getElementById('settingsForm');
  const saveBtn = document.getElementById('saveSettingsBtn');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

  async function load() {
    try {
      const { settings } = await window.Api.getSettings();
      document.getElementById('administratorName').value = settings.administratorName || '';
      document.getElementById('settingsEmail').value = settings.email || '';
      document.getElementById('collegeName').value = settings.collegeName || '';
      document.getElementById('theme').value = settings.theme || 'Light';
    } catch (err) {
      window.Layout.showMessage(MESSAGE_ID, err.message || 'Unable to load settings.', 'error');
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    window.Layout.hideMessage(MESSAGE_ID);

    const administratorName = document.getElementById('administratorName').value.trim();
    const email = document.getElementById('settingsEmail').value.trim();
    const collegeName = document.getElementById('collegeName').value.trim();
    const theme = document.getElementById('theme').value;

    if (!administratorName) {
      window.Layout.showMessage(MESSAGE_ID, 'Please enter the administrator name.', 'error');
      return;
    }
    if (!email) {
      window.Layout.showMessage(MESSAGE_ID, 'Please enter the email address.', 'error');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      window.Layout.showMessage(MESSAGE_ID, 'Please enter a valid email address.', 'error');
      return;
    }
    if (!collegeName) {
      window.Layout.showMessage(MESSAGE_ID, 'Please enter the college name.', 'error');
      return;
    }

    saveBtn.disabled = true;
    try {
      const { message, settings } = await window.Api.updateSettings({ administratorName, email, collegeName, theme });
      document.body.classList.toggle('theme-dark', settings.theme === 'Dark');
      const adminEl = document.getElementById('adminInfo');
      if (adminEl) {
        adminEl.innerHTML = `<span class="avatar">${window.Icons.user}</span><span>${settings.administratorName}</span>`;
      }
      window.Layout.showMessage(MESSAGE_ID, message || 'Settings saved successfully.', 'success');
    } catch (err) {
      window.Layout.showMessage(MESSAGE_ID, err.message || 'Unable to save settings.', 'error');
    } finally {
      saveBtn.disabled = false;
    }
  });

  (async () => {
    const admin = await window.Layout.render('settings', 'Settings');
    if (!admin) return;
    await load();
  })();
})();