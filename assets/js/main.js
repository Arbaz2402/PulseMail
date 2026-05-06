/* =============================================
   Main — App Entry Point
   ============================================= */

const App = {
  init() {
    DB.setTheme(DB.getTheme());

    if (!DB.isLoggedIn()) {
      window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
      return;
    }

    const sidebarEl = document.getElementById('sidebarRoot');
    const headerEl = document.getElementById('headerRoot');
    const page = document.body.dataset.page || 'inbox';

    if (sidebarEl) Sidebar.render(sidebarEl, page);
    if (headerEl) Header.render(headerEl);
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
