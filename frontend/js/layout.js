/* ==================================================================
   layout.js - shared sidebar + topbar used by every inner page
   Keeps the navigation identical on Dashboard, Add Student, View
   Students, Search Student, Reports and Settings (Figures 2-7).
   ================================================================== */
(function (global) {
  const NAV_ITEMS = [
    { key: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: 'dashboard' },
    { key: 'add-student', label: 'Add Student', href: 'add-student.html', icon: 'addStudent' },
    { key: 'view-students', label: 'View Students', href: 'view-students.html', icon: 'viewStudents' },
    { key: 'search-student', label: 'Search Student', href: 'search-student.html', icon: 'searchStudent' },
    { key: 'reports', label: 'Reports', href: 'reports.html', icon: 'reports' },
    { key: 'settings', label: 'Settings', href: 'settings.html', icon: 'settings' },
    { key: 'logout', label: 'Logout', href: 'index.html', icon: 'logout' },
  ];

  const Layout = {
    /* Requires a valid session; redirects to the login page otherwise. */
    async requireLogin() {
      if (!global.Api.Auth.getToken()) {
        global.Api.Auth.redirectToLogin();
        return null;
      }
      try {
        const { admin } = await global.Api.me();
        global.Api.Auth.setSession(global.Api.Auth.getToken(), admin);
        return admin;
      } catch (err) {
        return null; /* api.js already redirected on 401 */
      }
    },

    /* Paints the sidebar and the administrator block in the topbar. */
    async render(activeKey, pageTitle) {
      const admin = await Layout.requireLogin();
      if (!admin) return null;

      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.className = 'sidebar';
        sidebar.innerHTML = `
          <div class="brand">
            <div class="brand-name">SRMS</div>
            <div class="brand-sub">Student Record</div>
          </div>
          <nav class="nav">
            ${NAV_ITEMS.map((item) => `
              <a class="nav-item${item.key === activeKey ? ' active' : ''}" href="${item.href}" data-nav="${item.key}">
                ${global.Icons[item.icon] || ''}
                <span>${item.label}</span>
              </a>`).join('')}
          </nav>`;

        const logoutLink = sidebar.querySelector('[data-nav="logout"]');
        if (logoutLink) {
          logoutLink.addEventListener('click', async (event) => {
            event.preventDefault();
            try {
              await global.Api.logout();
            } catch (e) {
              /* the local session is cleared either way */
            }
            global.Api.Auth.clear();
            global.location.replace('index.html');
          });
        }
      }

      const titleEl = document.querySelector('.page-title');
      if (titleEl && pageTitle) titleEl.textContent = pageTitle;

      const adminEl = document.getElementById('adminInfo');
      if (adminEl) {
        adminEl.className = 'admin-info';
        adminEl.innerHTML = `<span class="avatar">${global.Icons.user}</span><span>${admin.name || 'Administrator'}</span>`;
      }

      await Layout.applyTheme();
      return admin;
    },

    /* Applies the Theme saved in Settings ("Light" / "Dark"). */
    async applyTheme() {
      try {
        const { settings } = await global.Api.getSettings();
        document.body.classList.toggle('theme-dark', settings.theme === 'Dark');
        const el = document.getElementById('adminInfo');
        if (el && settings.administratorName) {
          el.innerHTML = `<span class="avatar">${global.Icons.user}</span><span>${settings.administratorName}</span>`;
        }
      } catch (e) {
        /* theme is cosmetic - ignore failures */
      }
    },

    /* Small helper for the success / error / info banners */
    showMessage(id, text, type) {
      const el = document.getElementById(id);
      if (!el) return;
      el.className = `message ${type || 'success'} show`;
      el.innerHTML = `${global.Icons.info}<span>${text}</span>`;
    },

    hideMessage(id) {
      const el = document.getElementById(id);
      if (el) el.className = 'message';
    },
  };

  global.Layout = Layout;
})(window);