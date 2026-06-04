(function () {
  function ensureMaterialSymbols() {
    if (document.querySelector('link[data-khon-material]')) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:FILL@0..1';
    link.setAttribute('data-khon-material', 'true');

    document.head.appendChild(link);
  }

  function asset(path) {
    const isInsidePages = window.location.pathname.includes('/pages/');
    return `${isInsidePages ? '../' : ''}assets/${path}`;
  }

  function ms(name, cls = '') {
    return `<span class="material-symbols-outlined ${cls}">${name}</span>`;
  }

  function navIcon(icon) {
    if (icon === 'khon_bot') {
      return `
        <img
          class="khon-rail-bot"
          src="${asset('img/khonia-bot.png')}"
          alt="Khon Bot"
        >
      `;
    }

    return ms(icon, 'ico');
  }

  function injectDashboardRailStyle() {
    if (document.getElementById('khon-dashboard-rail-style')) return;

    const style = document.createElement('style');
    style.id = 'khon-dashboard-rail-style';

    style.textContent = `
      :root {
        --khon-rail-w: 82px;
        --khon-rail-open: 278px;
      }

      body {
        padding-left: var(--khon-rail-w);
        transition: padding-left .25s ease;
      }

      body.rail-expanded {
        padding-left: var(--khon-rail-open);
      }

      .khon-rail {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 10000;
        width: var(--khon-rail-w);
        background: linear-gradient(180deg, #0f2f65, #071d3f);
        color: white;
        padding: 14px 10px;
        box-shadow: 10px 0 35px rgba(15, 23, 42, .18);
        overflow: hidden;
        transition: width .25s ease;
        font-family: 'Nunito', sans-serif;
      }

      .khon-rail:hover,
      body.rail-expanded .khon-rail {
        width: var(--khon-rail-open);
      }

      .khon-rail-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 8px 18px;
        white-space: nowrap;
      }

      .khon-rail-logo {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: rgba(255, 255, 255, .12);
        display: grid;
        place-items: center;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, .16);
      }

      .khon-rail-logo img {
        width: 34px;
        height: 34px;
        object-fit: contain;
      }

      .khon-rail-title {
        opacity: 0;
        transition: .2s;
      }

      .khon-rail:hover .khon-rail-title,
      body.rail-expanded .khon-rail-title {
        opacity: 1;
      }

      .khon-rail-title strong {
        display: block;
        font-size: .96rem;
      }

      .khon-rail-title span {
        display: block;
        font-size: .72rem;
        color: rgba(255, 255, 255, .68);
      }

      .khon-rail-toggle {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 6px 8px;
        width: calc(100% - 12px);
        height: 40px;
        padding: 0 12px;
        border: 1px solid rgba(255, 255, 255, .16);
        background: rgba(255, 255, 255, .10);
        color: white;
        border-radius: 13px;
        cursor: pointer;
        overflow: hidden;
      }

      .khon-rail-toggle .txt {
        opacity: 0;
        transition: .2s;
        font-size: .8rem;
        font-weight: 800;
        white-space: nowrap;
      }

      .khon-rail:hover .khon-rail-toggle .txt,
      body.rail-expanded .khon-rail-toggle .txt {
        opacity: 1;
      }

      .khon-rail-section {
        margin: 24px 10px 9px;
        font-size: .64rem;
        text-transform: uppercase;
        letter-spacing: 1.3px;
        color: rgba(255, 255, 255, .55);
        font-weight: 900;
        opacity: 0;
        white-space: nowrap;
      }

      .khon-rail:hover .khon-rail-section,
      body.rail-expanded .khon-rail-section {
        opacity: 1;
      }

      .khon-rail-link {
        height: 46px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        gap: 14px;
        color: rgba(255, 255, 255, .86);
        text-decoration: none;
        padding: 0 13px;
        margin-bottom: 6px;
        font-weight: 800;
        white-space: nowrap;
        transition: .2s;
      }

      .khon-rail-link:hover,
      .khon-rail-link.active {
        background: rgba(255, 255, 255, .13);
        color: white;
      }

      .khon-rail-link .ico.material-symbols-outlined,
      .khon-rail-toggle .material-symbols-outlined,
      .khon-mobile-menu .material-symbols-outlined {
        font-size: 22px;
        min-width: 24px;
        text-align: center;
        font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
      }

      .khon-rail-bot {
        width: 30px;
        height: 30px;
        min-width: 30px;
        border-radius: 10px;
        object-fit: cover;
        display: block;
        box-shadow: 0 6px 16px rgba(10, 132, 200, .28);
        border: 1px solid rgba(255, 255, 255, .20);
      }

      .khon-rail-link.active .khon-rail-bot,
      .khon-rail-link:hover .khon-rail-bot {
        box-shadow: 0 8px 20px rgba(10, 132, 200, .42);
      }

      .khon-rail-link .txt {
        opacity: 0;
        transform: translateX(-6px);
        transition: .2s;
      }

      .khon-rail:hover .khon-rail-link .txt,
      body.rail-expanded .khon-rail-link .txt {
        opacity: 1;
        transform: none;
      }

      @media (max-width: 900px) {
        body {
          padding-left: 0;
        }

        .khon-rail {
          transform: translateX(-105%);
        }

        .khon-rail.mobile-open {
          transform: translateX(0);
          width: var(--khon-rail-open);
        }

        .khon-mobile-menu {
          display: grid !important;
        }

        .khon-rail-title,
        .khon-rail-link .txt,
        .khon-rail-section,
        .khon-rail-toggle .txt {
          opacity: 1 !important;
          transform: none !important;
        }

        .khon-rail-toggle {
          display: none;
        }
      }

      .khon-mobile-menu {
        display: none;
        position: fixed;
        left: 16px;
        bottom: 18px;
        z-index: 10001;
        width: 52px;
        height: 52px;
        border: 0;
        border-radius: 16px;
        background: #0a84c8;
        color: white;
        box-shadow: 0 12px 35px rgba(10, 80, 140, .30);
        place-items: center;
      }
    `;

    document.head.appendChild(style);
  }

  function link(href, icon, text, current) {
    return `
      <a
        class="khon-rail-link ${current === href ? 'active' : ''}"
        href="${href}"
      >
        ${navIcon(icon)}
        <span class="txt">${text}</span>
      </a>
    `;
  }

  function initDashboardShell() {
    ensureMaterialSymbols();

    try {
      if (typeof requireAuth === 'function') {
        requireAuth(['admin']);
      }
    } catch (e) {}

    injectDashboardRailStyle();

    const expanded =
      localStorage.getItem('khon_rail_expanded') === 'true';

    if (expanded) {
      document.body.classList.add('rail-expanded');
    }

    const current =
      window.location.pathname.split('/').pop();

    const rail = document.createElement('nav');
    rail.className = 'khon-rail';

    rail.innerHTML = `
      <div class="khon-rail-brand">

        <div class="khon-rail-logo">
          <img
            src="${asset('img/logo-khonfacil-icon.png')}"
            alt="KhonFácil"
          >
        </div>

        <div class="khon-rail-title">
          <strong>KhonFácil</strong>
          <span>Portal BI Executivo</span>
        </div>

      </div>

      <button
        class="khon-rail-toggle"
        title="Fixar/recolher navegação"
      >
        ${ms(expanded ? 'left_panel_close' : 'left_panel_open')}
        <span class="txt">${expanded ? 'Recolher' : 'Expandir'}</span>
      </button>

      <div class="khon-rail-section">Administrativo</div>

      ${link('dashboard.html', 'space_dashboard', 'Dashboard BI', current)}
      ${link('cotas.html', 'warning', 'Cotas Críticas', current)}
      ${link('assessorias.html', 'apartment', 'Assessorias', current)}
      ${link('relatorios.html', 'description', 'Relatórios', current)}
      ${link('auditoria.html', 'manage_search', 'Auditoria', current)}

      <div class="khon-rail-section">Solução</div>

      ${link('chatbot.html', 'khon_bot', 'Khon Bot', current)}
      ${link('configuracoes.html', 'settings', 'Configurações', current)}

      <a
        class="khon-rail-link"
        href="#"
        onclick="destroySession(); return false;"
      >
        ${ms('logout', 'ico')}
        <span class="txt">Sair</span>
      </a>
    `;

    document.body.prepend(rail);

    const mobile = document.createElement('button');
    mobile.className = 'khon-mobile-menu';
    mobile.innerHTML = ms('menu');

    document.body.appendChild(mobile);

    mobile.addEventListener('click', () => {
      rail.classList.toggle('mobile-open');
    });

    rail
      .querySelector('.khon-rail-toggle')
      .addEventListener('click', () => {
        document.body.classList.toggle('rail-expanded');

        const isExpanded =
          document.body.classList.contains('rail-expanded');

        localStorage.setItem(
          'khon_rail_expanded',
          String(isExpanded)
        );

        const btn = rail.querySelector('.khon-rail-toggle');

        btn.innerHTML = `
          ${ms(isExpanded ? 'left_panel_close' : 'left_panel_open')}
          <span class="txt">${isExpanded ? 'Recolher' : 'Expandir'}</span>
        `;
      });
  }

  document.addEventListener('DOMContentLoaded', initDashboardShell);
})();