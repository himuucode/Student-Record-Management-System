/* ==================================================================
   icons.js - inline SVG icon set used across all SRMS pages
   ================================================================== */
(function (global) {
  const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">${body}</svg>`;

  const Icons = {
    /* ------------------------- sidebar navigation ------------------------- */
    dashboard: svg('<path d="M12 3 3 11h2.6v9h5v-5.6h2.8V20h5v-9H21L12 3Z"/>'),
    addStudent: svg('<circle cx="9.6" cy="7.6" r="3.7"/><path d="M2.4 20.4c0-3.7 3.2-6.3 7.2-6.3s7.2 2.6 7.2 6.3H2.4Z"/><path d="M18.5 5.6h1.9v2.2h2.2v1.9h-2.2v2.2h-1.9v-2.2h-2.2V7.8h2.2V5.6Z"/>'),
    viewStudents: svg('<circle cx="8.3" cy="8.3" r="3.3"/><path d="M1.8 19.7c0-3.3 2.9-5.7 6.5-5.7s6.5 2.4 6.5 5.7H1.8Z"/><circle cx="16.7" cy="9.4" r="2.7"/><path d="M13.2 19.7c0-1.7.5-3.2 1.3-4.3.7-.2 1.4-.3 2.2-.3 2.9 0 5.3 1.9 5.3 4.6h-8.8Z"/>'),
    searchStudent: svg('<path d="M10.4 3a7.4 7.4 0 1 0 4.5 13.2l4.5 4.5 1.5-1.5-4.5-4.5A7.4 7.4 0 0 0 10.4 3Zm0 2a5.4 5.4 0 1 1 0 10.8 5.4 5.4 0 0 1 0-10.8Z"/>'),
    reports: svg('<rect x="3" y="12.4" width="3.8" height="8.6" rx="0.6"/><rect x="9.3" y="7.4" width="3.8" height="13.6" rx="0.6"/><rect x="15.6" y="3.4" width="3.8" height="17.6" rx="0.6"/>'),
    settings: svg('<circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="12" r="6.9" fill="none" stroke="currentColor" stroke-width="2"/><rect x="10.9" y="1.6" width="2.2" height="3.4" rx="0.6"/><rect x="10.9" y="19" width="2.2" height="3.4" rx="0.6"/><rect x="10.9" y="1.6" width="2.2" height="3.4" rx="0.6" transform="rotate(45 12 12)"/><rect x="10.9" y="19" width="2.2" height="3.4" rx="0.6" transform="rotate(45 12 12)"/><rect x="10.9" y="1.6" width="2.2" height="3.4" rx="0.6" transform="rotate(90 12 12)"/><rect x="10.9" y="19" width="2.2" height="3.4" rx="0.6" transform="rotate(90 12 12)"/><rect x="10.9" y="1.6" width="2.2" height="3.4" rx="0.6" transform="rotate(135 12 12)"/><rect x="10.9" y="19" width="2.2" height="3.4" rx="0.6" transform="rotate(135 12 12)"/>'),
    logout: svg('<path d="M10.2 3H5.4A2.4 2.4 0 0 0 3 5.4v13.2A2.4 2.4 0 0 0 5.4 21h4.8v-2H5.4a.4.4 0 0 1-.4-.4V5.4c0-.2.2-.4.4-.4h4.8V3Z"/><path d="m14.9 7.3-1.5 1.4 2.2 2.3H9.2v2h6.4l-2.2 2.3 1.5 1.4 4.7-4.7-4.7-4.7Z"/>'),
    user: svg('<circle cx="12" cy="8.2" r="3.6"/><path d="M4.6 20.4c0-3.7 3.3-6.4 7.4-6.4s7.4 2.7 7.4 6.4H4.6Z"/>'),

    /* ------------------------ statistic card icons ------------------------ */
    totalStudents: svg('<path d="M12 3.6 2 8.6l10 5 10-5-10-5Z"/><path d="M6 11.7V15c0 1.8 2.7 3.2 6 3.2s6-1.4 6-3.2v-3.3l-6 3-6-3Z"/><path d="M19.6 11.9v5.2h1.6v-5.9l-1.6.7Z"/>'),
    averageMarks: svg('<path d="M4 3h2v16h15v2H4V3Z"/><polyline points="6.8,15.4 11,10.4 14.2,13.6 20,6.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    passPercentage: svg('<circle cx="12" cy="8.8" r="5.4"/><path d="M8.5 13.4 6.8 21.2l5.2-2.7 5.2 2.7-1.7-7.8a7.3 7.3 0 0 1-7 0Z"/>'),
    departments: svg('<path d="M12 2.6 1.8 8v2.2h20.4V8L12 2.6Z"/><rect x="3.6" y="11.6" width="2.6" height="6.6"/><rect x="8.4" y="11.6" width="2.6" height="6.6"/><rect x="13" y="11.6" width="2.6" height="6.6"/><rect x="17.8" y="11.6" width="2.6" height="6.6"/><rect x="1.8" y="19.2" width="20.4" height="2.4"/>'),
    passed: svg('<circle cx="12" cy="12" r="9.2"/><path d="m7.4 12.3 3.1 3.1 6.1-6.4" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'),
    failed: svg('<circle cx="12" cy="12" r="9.2"/><path d="m8.8 8.8 6.4 6.4m0-6.4-6.4 6.4" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/>'),

    /* --------------------------- form / actions --------------------------- */
    save: svg('<path d="M4.5 3h11.2L20.5 7.8V21h-16V3Z"/><rect x="8" y="3" width="7.6" height="6" fill="#FFFFFF"/><rect x="7.4" y="12.6" width="9.2" height="8.4" fill="#FFFFFF"/>'),
    edit: svg('<path d="M4 17.1V20h2.9L18.9 7.9 16.1 5.1 4 17.1Z"/><path d="m17.2 3.9 2.9 2.9.9-.9a1.4 1.4 0 0 0 0-2l-.9-.9a1.4 1.4 0 0 0-2 0l-.9.9Z"/>'),
    delete: svg('<path d="M9.2 2.6h5.6l.7 1.6h3.9v2H4.6v-2h3.9l.7-1.6Z"/><path d="M6.2 7.6h11.6l-.9 13.8H7.1L6.2 7.6Z"/>'),
    info: svg('<circle cx="12" cy="12" r="9.2"/><circle cx="12" cy="7.7" r="1.3" fill="#FFFFFF"/><rect x="10.9" y="10.4" width="2.2" height="6.6" rx="1.1" fill="#FFFFFF"/>'),
  };

  global.Icons = Icons;
})(window);