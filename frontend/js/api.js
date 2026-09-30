/* ==================================================================
   api.js - thin wrapper around the SRMS REST API
   The administrator credential never reaches the browser: only the
   opaque session token returned by /api/auth/login is stored here.
   ================================================================== */
(function (global) {
  const TOKEN_KEY = 'srms_token';
  const ADMIN_KEY = 'srms_admin';

  /* When the frontend is served by the Express server, use the same origin. */
  const API_BASE = `${global.location.origin}/api`;

  const Auth = {
    getToken() {
      try {
        return localStorage.getItem(TOKEN_KEY) || '';
      } catch (e) {
        return '';
      }
    },
    setSession(token, admin) {
      try {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(ADMIN_KEY, JSON.stringify(admin || {}));
      } catch (e) { /* ignore */ }
    },
    getAdmin() {
      try {
        return JSON.parse(localStorage.getItem(ADMIN_KEY) || '{}');
      } catch (e) {
        return {};
      }
    },
    clear() {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ADMIN_KEY);
      } catch (e) { /* ignore */ }
    },
    /* Sends the user back to the login page when the session is gone. */
    redirectToLogin() {
      Auth.clear();
      global.location.replace('index.html');
    },
  };

  async function request(method, path, body) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    const token = Auth.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let response;
    try {
      response = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (networkError) {
      throw new Error('Cannot reach the server. Please make sure the backend is running.');
    }

    let payload = {};
    try {
      payload = await response.json();
    } catch (e) {
      payload = {};
    }

    if (response.status === 401 && !path.startsWith('/auth/login')) {
      Auth.redirectToLogin();
      throw new Error(payload.message || 'Session expired. Please login again.');
    }

    if (!response.ok || payload.success === false) {
      throw new Error(payload.message || `Request failed with status ${response.status}`);
    }

    return payload;
  }

  const Api = {
    Auth,
    /* authentication */
    login: (username, password) => request('POST', '/auth/login', { username, password }),
    logout: () => request('POST', '/auth/logout'),
    me: () => request('GET', '/auth/me'),
    /* students */
    getStudents: (search) => request('GET', `/students${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    getStudent: (id) => request('GET', `/students/${id}`),
    searchByRollNumber: (rollNumber) => request('GET', `/students/search/${encodeURIComponent(rollNumber)}`),
    createStudent: (student) => request('POST', '/students', student),
    updateStudent: (id, student) => request('PUT', `/students/${id}`, student),
    deleteStudent: (id) => request('DELETE', `/students/${id}`),
    /* reports */
    getDashboard: () => request('GET', '/reports/dashboard'),
    getReports: () => request('GET', '/reports'),
    /* settings */
    getSettings: () => request('GET', '/settings'),
    updateSettings: (settings) => request('PUT', '/settings', settings),
  };

  global.Api = Api;
})(window);