/* ==================================================================
   page-icons.js - fills every [data-icon] placeholder with its SVG.
   Keeps the page markup readable while icons stay in icons.js.
   ================================================================== */
(function () {
  document.querySelectorAll('[data-icon]').forEach((el) => {
    const name = el.getAttribute('data-icon');
    if (window.Icons[name]) el.innerHTML = window.Icons[name];
  });
})();