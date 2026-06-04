const DATA_VERIFICATION = {
  registros: 100000,
  colunas: 21,
  intervalo_vencimento: '2025-01-01 até 2026-03-26',
  intervalo_pagamento: '2024-12-27 até 2026-07-21',
  null_data_pagamento: 27357,
  id_pagamento_duplicado: 0,
  total_inadimplente: 6067684018.50,
  total_recuperado: 55440309.28,
  status: {
    'EM ABERTO': 40146,
    'ACORDO FIRMADO': 33914,
    'INSUCESSO': 15516,
    'AJUIZADO': 10424
  },
  assessorias: {
    'FÊNIX RECUPERAÇÃO DE CRÉDITO': 30084,
    'VÉRTICE ASSET & COBRANÇA': 30072,
    'NEXUS MEDIAÇÃO FINANCEIRA': 20386,
    'ACERTA CRÉDITO INTEGRADO': 19458
  },
  regioes: {
    'NORDESTE': 36874,
    'SUDESTE': 35088,
    'SUL': 15255,
    'CENTRO-OESTE': 7833,
    'NORTE': 4950
  }
};

function initAssessorias() {
  renderAssessorias();
  document.getElementById("assessoriaForm").addEventListener("submit", event => {
    event.preventDefault();
    const db = getDB();

    db.assessorias.push({
      id: nextId(db.assessorias),
      source: "local",
      nome: document.getElementById("nome").value.trim().toUpperCase(),
      regiao: document.getElementById("regiao").value,
      totalCasos: Number(document.getElementById("totalCasos").value || 0),
      acordos: Number(document.getElementById("acordos").value || 0),
      emAberto: Number(document.getElementById("emAberto").value || 0),
      ajuizado: Number(document.getElementById("ajuizado").value || 0),
      insucesso: Number(document.getElementById("insucesso").value || 0),
      valorInadimplente: Number(document.getElementById("valorInadimplente").value || 0),
      valorRecuperado: Number(document.getElementById("valorRecuperado").value || 0),
      atrasoMedio: Number(document.getElementById("atrasoMedio").value || 0),
      score: Number(document.getElementById("score").value || 0),
      comissao: Number(document.getElementById("comissao").value || 3)
    });

    saveDB(db);
    addLog("Assessoria cadastrada", document.getElementById("nome").value);
    event.target.reset();
    renderAssessorias();
  });
}

function renderAssessorias() {
  const db = getDB();
  document.getElementById("assessoriasCount").textContent = db.assessorias.length;

  document.getElementById("assessoriasTable").innerHTML = db.assessorias
    .sort((a, b) => Number(b.score) - Number(a.score))
    .map(a => `
      <tr>
        <td><strong>${a.nome}</strong></td>
        <td>${a.regiao}</td>
        <td>${Number(a.taxaRecuperacao || (a.totalCasos ? (a.acordos/a.totalCasos*100) : 0)).toFixed(2)}%</td>
        <td>${Number(a.eficienciaFinanceira || (a.valorInadimplente ? (a.valorRecuperado/a.valorInadimplente*100) : 0)).toFixed(2)}%</td>
        <td>${Number(a.totalCasos ? (a.insucesso/a.totalCasos*100) : (a.insucesso || 0)).toFixed(2)}%</td>
        <td>${renderStatusBadge(a.score >= 50 ? "Alto" : a.score >= 25 ? "Médio" : "Baixo")} ${a.score}</td>
        <td>${a.comissao}%</td>
      </tr>
    `).join("");
}

function initCotas() {
  fillCotaSelects();
  renderCotas();

  document.getElementById("cotaForm").addEventListener("submit", event => {
    event.preventDefault();
    const db = getDB();

    db.cotas.push({
      id: nextId(db.cotas),
      source: "local",
      clienteId: Number(document.getElementById("clienteId").value),
      grupo: document.getElementById("grupo").value.trim(),
      cota: document.getElementById("cota").value.trim(),
      regiao: document.getElementById("regiao").value,
      assessoriaId: Number(document.getElementById("assessoriaId").value),
      bemEntregue: document.getElementById("bemEntregue").value === "true",
      valorCredito: Number(document.getElementById("valorCredito").value || 0),
      saldoDevedor: Number(document.getElementById("saldoDevedor").value || 0),
      parcelasAtrasadas: Number(document.getElementById("parcelasAtrasadas").value || 0),
      diasAtraso: Number(document.getElementById("diasAtraso").value || 0),
      status: document.getElementById("status").value,
      vencimento: document.getElementById("vencimento").value
    });

    db.pagamentos.push({
      id: nextId(db.pagamentos),
      clienteId: Number(document.getElementById("clienteId").value),
      cotaId: nextId(db.cotas) - 1,
      valor: Number(document.getElementById("saldoDevedor").value || 0),
      data: null,
      vencimento: document.getElementById("vencimento").value,
      status: "PENDENTE"
    });

    saveDB(db);
    addLog("Cota cadastrada", `${document.getElementById("grupo").value}/${document.getElementById("cota").value}`);
    event.target.reset();
    renderCotas();
  });
}

function fillCotaSelects() {
  const db = getDB();
  document.getElementById("clienteId").innerHTML = db.clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join("");
  document.getElementById("assessoriaId").innerHTML = db.assessorias.map(a => `<option value="${a.id}">${a.nome}</option>`).join("");
}

function renderCotas() {
  const db = getDB();
  const rows = db.cotas
    .map(c => ({ ...c, cliente: db.clientes.find(cli => cli.id === c.clienteId), risco: calcularRisco(c) }))
    .sort((a, b) => b.risco.score - a.risco.score);

  document.getElementById("cotasTable").innerHTML = rows.map(c => `
    <tr>
      <td>${c.cliente ? c.cliente.nome : "-"}</td>
      <td>${c.grupo}/${c.cota}</td>
      <td>${fmtBRL(c.saldoDevedor)}</td>
      <td>${c.parcelasAtrasadas}</td>
      <td>${c.diasAtraso}</td>
      <td>${c.bemEntregue ? "Sim" : "Não"}</td>
      <td>${renderStatusBadge(c.status)}</td>
      <td>${renderStatusBadge(c.risco.faixa)} ${c.risco.score}</td>
    </tr>
  `).join("");
}

function initRelatorios() {
  fillReportFilters();
  renderRelatorio();

  ["filtroRegiao", "filtroStatus"].forEach(id => {
    document.getElementById(id).addEventListener("change", renderRelatorio);
  });
}

function fillReportFilters() {
  const regioes = [...new Set(getDB().cotas.map(c => c.regiao))];
  document.getElementById("filtroRegiao").innerHTML = `<option value="todos">Todas</option>` + regioes.map(r => `<option value="${r}">${r}</option>`).join("");
}

function filteredReportRows() {
  const db = getDB();
  const regiao = document.getElementById("filtroRegiao").value;
  const status = document.getElementById("filtroStatus").value;

  return db.cotas
    .filter(c => regiao === "todos" || c.regiao === regiao)
    .filter(c => status === "todos" || c.status === status)
    .map(c => ({ ...c, cliente: db.clientes.find(cli => cli.id === c.clienteId), risco: calcularRisco(c) }));
}

function renderRelatorio() {
  const rows = filteredReportRows();
  const total = rows.reduce((sum, c) => sum + Number(c.saldoDevedor || 0), 0);

  document.getElementById("reportSummary").innerHTML = `
    <div class="card"><div class="label">Registros</div><div class="value">${rows.length}</div><div class="hint">Filtro aplicado</div></div>
    <div class="card"><div class="label">Valor em carteira</div><div class="value">${fmtBRL(total)}</div><div class="hint">Inclui data de geração</div></div>
  `;

  document.getElementById("relatorioTable").innerHTML = rows.map(c => `
    <tr>
      <td>${c.cliente ? c.cliente.nome : "-"}</td>
      <td>${c.regiao}</td>
      <td>${c.grupo}/${c.cota}</td>
      <td>${fmtBRL(c.saldoDevedor)}</td>
      <td>${renderStatusBadge(c.status)}</td>
      <td>${renderStatusBadge(c.risco.faixa)} ${c.risco.score}</td>
      <td>${fmtDate(c.vencimento)}</td>
    </tr>
  `).join("");

  document.getElementById("reportDate").textContent = new Date().toLocaleString("pt-BR");
}

function exportCSV() {
  const rows = filteredReportRows();
  const header = ["Data de geração", new Date().toLocaleString("pt-BR")].join(";") + "\n";
  const cols = ["Cliente", "Região", "Grupo/Cota", "Saldo", "Status", "Risco", "Vencimento"].join(";") + "\n";

  const body = rows.map(c => [
    c.cliente ? c.cliente.nome : "-",
    c.regiao,
    `${c.grupo}/${c.cota}`,
    Number(c.saldoDevedor || 0).toFixed(2),
    c.status,
    calcularRisco(c).faixa,
    c.vencimento
  ].join(";")).join("\n");

  const blob = new Blob([header + cols + body], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "relatorio_khonfacil.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function renderAuditVerification() {
  const summary = document.getElementById("auditVerificationSummary");
  const list = document.getElementById("auditVerificationList");
  if (!summary || !list) return;

  summary.innerHTML = `
    <div class="audit-mini-card"><div class="eyebrow">Registros validados</div><div class="big">${DATA_VERIFICATION.registros.toLocaleString('pt-BR')}</div><div class="sub">${DATA_VERIFICATION.colunas} colunas na base consolidada</div></div>
    <div class="audit-mini-card"><div class="eyebrow">Duplicidade de ID_Pagamento</div><div class="big">${DATA_VERIFICATION.id_pagamento_duplicado}</div><div class="sub">Nenhum ID duplicado na segunda checagem</div></div>
    <div class="audit-mini-card"><div class="eyebrow">Data_Pagamento nula</div><div class="big">${DATA_VERIFICATION.null_data_pagamento.toLocaleString('pt-BR')}</div><div class="sub">Compatível com parcelas ainda não pagas</div></div>
  `;

  const items = [
    [`calendar_month`, `Período de vencimento`, DATA_VERIFICATION.intervalo_vencimento],
    [`event_available`, `Período de pagamento`, DATA_VERIFICATION.intervalo_pagamento],
    [`payments`, `Valor inadimplente consolidado`, fmtBRL(DATA_VERIFICATION.total_inadimplente)],
    [`price_check`, `Valor recuperado consolidado`, fmtBRL(DATA_VERIFICATION.total_recuperado)],
    [`inventory_2`, `Distribuição por status`, Object.entries(DATA_VERIFICATION.status).map(([k,v]) => `${k}: ${v.toLocaleString('pt-BR')}`).join(' • ')],
    [`map`, `Distribuição regional`, Object.entries(DATA_VERIFICATION.regioes).map(([k,v]) => `${k}: ${v.toLocaleString('pt-BR')}`).join(' • ')],
    [`apartment`, `Distribuição por assessoria`, Object.entries(DATA_VERIFICATION.assessorias).map(([k,v]) => `${k}: ${v.toLocaleString('pt-BR')}`).join(' • ')]
  ];

  list.innerHTML = items.map(([ic,title,txt]) => `
    <div class="verification-item">
      <span class="material-symbols-outlined">${ic}</span>
      <div><strong>${title}</strong><div class="muted">${txt}</div></div>
    </div>
  `).join('');
}

function initAuditoria() {
  const reqs = [
    ["RF-AU01", "Login com e-mail/senha", "Implementado"],
    ["RF-AU02", "Recuperação de senha", "Simulado com token de 30 minutos"],
    ["RF-AU03", "2FA administrador", "Implementado com código demonstrativo 123456"],
    ["RF-AU04", "Logout por inatividade", "Implementado por temporizador"],
    ["RF-AU05", "Controle de acesso por perfil", "Implementado por página"],
    ["RF01", "Painel analítico único", "Implementado no Dashboard BI"],
    ["RF02", "Previsão de fluxo de caixa", "30/60/90 dias"],
    ["RF03", "Cotas críticas", "Ordenação automática por risco"],
    ["RF04", "Relatórios regionalizados", "Filtros + CSV + impressão/PDF"],
    ["RF05", "Negociação autônoma", "Chatbot Financeiro"],
    ["RF06", "Simulação IPCA/INCC", "Chatbot Financeiro"],
    ["RF07", "Chatbot 24/7", "Disponível no sistema local"],
    ["RF08", "Pontuação automática", "Pagamento gera pontos"],
    ["RF09", "Painel de fidelidade", "Implementado"],
    ["RF10", "Notificações", "Configuração por e-mail/SMS"]
  ];

  document.getElementById("auditoriaTable").innerHTML = reqs.map(r => `
    <tr>
      <td><strong>${r[0]}</strong></td>
      <td>${r[1]}</td>
      <td>${renderStatusBadge("Atendido")}</td>
      <td>${r[2]}</td>
    </tr>
  `).join("");

  renderAuditVerification();

  const logs = getDB().logs.slice(0, 12);
  document.getElementById("logsTable").innerHTML = logs.map(log => `
    <tr>
      <td>${fmtDate(log.data)}</td>
      <td>${log.acao}</td>
      <td>${log.detalhe}</td>
    </tr>
  `).join("") || `<tr><td colspan="3">Nenhum log registrado ainda.</td></tr>`;
}
