const PAGE_LABELS = {
  dashboard: "Dashboard BI",
  cotas: "Cotas Críticas",
  assessorias: "Assessorias",
  relatorios: "Relatórios",
  auditoria: "Auditoria",
  perfil: "Perfil do Consorciado",
  parcelas: "Minhas Parcelas",
  chatbot: "Chatbot Financeiro",
  fidelidade: "Fidelidade",
  configuracoes: "Configurações"
};

const PAGE_META = {
  assessorias: {
    icon: "apartment",
    subtitle: "Cadastre, acompanhe e compare a eficiência operacional das assessorias conectadas à estratégia de cobrança.",
    metrics: [{label:"Base mestre", value:"100 mil"},{label:"Assessorias base", value:"4"},{label:"Atualização", value:"Local + BI"}]
  },
  cotas: {
    icon: "warning",
    subtitle: "Acompanhe as cotas críticas com priorização por risco, atraso, status e saldo devedor para ação mais rápida.",
    metrics: [{label:"Ordenação", value:"Automática"},{label:"Critério", value:"Risco"},{label:"Ação", value:"Negociar"}]
  },
  relatorios: {
    icon: "description",
    subtitle: "Relatórios filtráveis por região, status e período, com exportação e leitura executiva para a banca.",
    metrics: [{label:"Exportação", value:"CSV/PDF"},{label:"Filtros", value:"Região"},{label:"Fonte", value:"Consolidado"}]
  },
  auditoria: {
    icon: "manage_search",
    subtitle: "Rastreabilidade de requisitos, logs de uso e checagem de consistência da base consolidada que alimenta o BI.",
    metrics: [{label:"Registros", value:"100 mil"},{label:"Duplicados", value:"0"},{label:"Cobertura", value:"Nacional"}]
  },
  perfil: {
    icon: "person",
    subtitle: "Painel individual do consorciado com dados cadastrais, evolução da relação com a plataforma e visão resumida do atendimento.",
    metrics: [{label:"Portal", value:"Cliente"},{label:"Perfil", value:"Seguro"},{label:"Acesso", value:"Personalizado"}]
  },
  parcelas: {
    icon: "credit_card",
    subtitle: "Consulte parcelas, vencimentos, status de pagamento e orientações para regularização financeira.",
    metrics: [{label:"Visual", value:"Resumo"},{label:"Canal", value:"KhonIA"},{label:"Status", value:"Online"}]
  },
  chatbot: {
    icon: "support_agent",
    subtitle: "Assistente digital da solução para dúvidas, negociação, reajustes e explicações sobre o funcionamento da plataforma.",
    metrics: [{label:"Disponível", value:"24/7"},{label:"Canal", value:"Web"},{label:"Função", value:"Orientar"}]
  },
  fidelidade: {
    icon: "workspace_premium",
    subtitle: "Programa de relacionamento com pontos automáticos, benefícios e indicadores de engajamento do consorciado.",
    metrics: [{label:"Pontos", value:"Automáticos"},{label:"Benefícios", value:"Visíveis"},{label:"Meta", value:"Adimplência"}]
  },
  configuracoes: {
    icon: "settings",
    subtitle: "Defina preferências de notificação, segurança e canais de comunicação conforme as regras de negócio da solução.",
    metrics: [{label:"Notificações", value:"Email/SMS"},{label:"Segurança", value:"2FA"},{label:"Controle", value:"Perfil"}]
  }
};

function ensureMaterialSymbols() {
  if (document.querySelector('link[data-khon-material]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:FILL@0..1';
  link.setAttribute('data-khon-material', 'true');
  document.head.appendChild(link);
}

function icon(name, className = '') {
  return `<span class="material-symbols-outlined ${className}">${name}</span>`;
}

function initApp(page, allowedRoles) {
  ensureMaterialSymbols();
  aplicarTema();
  const session = requireAuth(allowedRoles);
  if (!session) return;

  if (localStorage.getItem("khon_rail_expanded") === "true") {
    document.body.classList.add("rail-expanded");
  }

  renderSidebar(page, session.perfil);
  renderTopbar(page);
  renderPageHero(page);
  startInactivityWatcher();
  if (window.KhonChatWidget) window.KhonChatWidget.init();
}

function renderSidebar(page, perfil) {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  const adminLinks = [
    ["dashboard", "space_dashboard", "Dashboard BI", "dashboard.html"],
    ["cotas", "warning", "Cotas Críticas", "cotas.html"],
    ["assessorias", "apartment", "Assessorias", "assessorias.html"],
    ["relatorios", "description", "Relatórios", "relatorios.html"],
    ["auditoria", "manage_search", "Auditoria", "auditoria.html"],
    ["chatbot", "khonia_bot", "Khon Bot", "chatbot.html"],
    ["configuracoes", "settings", "Configurações", "configuracoes.html"]
  ];

  const clienteLinks = [
    ["perfil", "person", "Meu Perfil", "perfil.html"],
    ["parcelas", "credit_card", "Minhas Parcelas", "parcelas.html"],
    ["chatbot", "khonia_bot", "Khon Bot", "chatbot.html"],
    ["fidelidade", "workspace_premium", "Fidelidade", "fidelidade.html"],
    ["configuracoes", "settings", "Configurações", "configuracoes.html"]
  ];

  const links = perfil === "admin" ? adminLinks : clienteLinks;

  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <div class="logo-mark">
        <img src="../assets/img/logo-khonfacil-icon.png" alt="Ícone KhonFácil" loading="lazy" />
      </div>
      <div class="brand-text">
        <h2>KHONFÁCIL</h2>
        <span>${perfil === "admin" ? "Portal Administrativo" : "Portal Consorciado"}</span>
      </div>
    </div>

    <button class="rail-toggle-app" onclick="toggleRailPinned()" title="Fixar ou recolher navegação">
      ${icon(document.body.classList.contains("rail-expanded") ? "left_panel_close" : "left_panel_open", "rail-toggle-icon")}
      <span class="nav-text">${document.body.classList.contains("rail-expanded") ? "Recolher" : "Expandir"}</span>
    </button>

    <div class="nav-section">Navegação</div>

    ${links.map(item => `
  <a class="nav-link ${page === item[0] ? "active" : ""}" href="${item[3]}">
    ${item[1] === "khonia_bot"
      ? `<img class="nav-bot-icon" src="../assets/img/khonia-bot.png" alt="KhonIA">`
      : icon(item[1], "nav-icon")
    }
    <span class="nav-text">${item[2]}</span>
  </a>
`).join("")}

    <div class="nav-section">Sessão</div>
    <a class="nav-link" href="#" onclick="destroySession(); return false;">
      ${icon("logout", "nav-icon")}
      <span class="nav-text">Sair</span>
    </a>
  `;
}

function toggleRailPinned() {
  document.body.classList.toggle("rail-expanded");
  localStorage.setItem("khon_rail_expanded", String(document.body.classList.contains("rail-expanded")));
  renderSidebar(window.location.pathname.split('/').pop().replace('.html',''), currentUser()?.perfil || 'cliente');
}

function renderTopbar(page) {
  const topbar = document.getElementById("topbar");
  const user = currentUser();
  if (!topbar || !user) return;

  topbar.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px">
      <button class="menu-btn" onclick="toggleSidebar()">${icon("menu")}</button>
      <div>
        <h1>${PAGE_LABELS[page] || "KhonFácil"}</h1>
        <p class="muted" style="font-size:.84rem">Dados sincronizados via LocalStorage • Base consolidada auditada em 2ª checagem</p>
      </div>
    </div>

    <div class="user-pill">
      ${icon(user.perfil === "admin" ? "shield_person" : "account_circle")}
      <span>${user.nome}</span>
    </div>
  `;
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

function renderStatusBadge(text) {
  return `<span class="badge ${badgeClass(text)}">${text}</span>`;
}


function renderPageHero(page) {
  const meta = PAGE_META[page];
  const content = document.querySelector('.content');
  if (!meta || !content || content.querySelector('.page-hero')) return;
  const box = document.createElement('section');
  box.className = 'page-hero';
  box.innerHTML = `
    <div class="page-hero-main">
      <div class="page-hero-icon">${icon(meta.icon)}</div>
      <div class="page-hero-copy">
        <h2>${PAGE_LABELS[page] || 'KhonFácil'}</h2>
        <p>${meta.subtitle}</p>
      </div>
    </div>
    <div class="page-hero-metrics">
      ${meta.metrics.map(m => `<div class="metric-pill"><strong>${m.value}</strong><span>${m.label}</span></div>`).join('')}
    </div>
  `;
  content.prepend(box);
}
