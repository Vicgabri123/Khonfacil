function initDashboard() {
  renderDashboardKPIs();
  renderDashboardCharts();
  renderCriticalTable();
}

function dashboardMetrics() {
  const db = getDB();
  const totalCotas = db.cotas.length;
  const inadimplentes = db.cotas.filter(c => ["EM ABERTO", "AJUIZADO"].includes(String(c.status).toUpperCase())).length;
  const taxaInad = totalCotas ? (inadimplentes / totalCotas * 100) : 0;
  const totalRecuperado = db.pagamentos.filter(p => p.status === "PAGO").reduce((s, p) => s + Number(p.valor || 0), 0);

  const hoje = new Date();
  const fluxo = [30, 60, 90].map(dias => {
    const limite = new Date();
    limite.setDate(hoje.getDate() + dias);
    return db.pagamentos
      .filter(p => p.status !== "PAGO" && new Date(p.vencimento) <= limite)
      .reduce((s, p) => s + Number(p.valor || 0), 0);
  });

  return { db, totalCotas, inadimplentes, taxaInad, totalRecuperado, fluxo };
}

function renderDashboardKPIs() {
  const { db, totalCotas, taxaInad, totalRecuperado, fluxo } = dashboardMetrics();

  document.getElementById("kpis").innerHTML = `
    <div class="card">
      <div class="label">Cotas monitoradas</div>
      <div class="value">${totalCotas}</div>
      <div class="hint">RF01 • Dados centralizados</div>
    </div>

    <div class="card">
      <div class="label">Inadimplência</div>
      <div class="value">${taxaInad.toFixed(1)}%</div>
      <div class="hint">Em aberto + ajuizado</div>
    </div>

    <div class="card">
      <div class="label">Fluxo 30 dias</div>
      <div class="value">${fmtBRL(fluxo[0])}</div>
      <div class="hint">RF02 • Previsão de caixa</div>
    </div>

    <div class="card">
      <div class="label">Total recuperado</div>
      <div class="value">${fmtBRL(totalRecuperado)}</div>
      <div class="hint">${db.negociacoes.length} negociação(ões)</div>
    </div>
  `;
}

function renderDashboardCharts() {
  const { db, fluxo } = dashboardMetrics();

  const statusCount = ["ADIMPLENTE", "EM ABERTO", "AJUIZADO", "ACORDO FIRMADO"].map(status =>
    db.cotas.filter(c => String(c.status).toUpperCase() === status).length
  );

  new Chart(document.getElementById("statusChart"), {
    type: "doughnut",
    data: {
      labels: ["Adimplente", "Em aberto", "Ajuizado", "Acordo firmado"],
      datasets: [{
        data: statusCount,
        backgroundColor: ["#16a34a", "#d97706", "#dc2626", "#0a84c8"]
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  new Chart(document.getElementById("fluxoChart"), {
    type: "bar",
    data: {
      labels: ["30 dias", "60 dias", "90 dias"],
      datasets: [{
        label: "Previsão de recebimento",
        data: fluxo,
        backgroundColor: "#0a84c8"
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function renderCriticalTable() {
  const db = getDB();

  const rows = db.cotas
    .map(c => ({ ...c, risco: calcularRisco(c), cliente: db.clientes.find(cli => cli.id === c.clienteId) }))
    .sort((a, b) => b.risco.score - a.risco.score)
    .slice(0, 8);

  document.getElementById("criticalTable").innerHTML = rows.map(c => `
    <tr>
      <td>${c.cliente ? c.cliente.nome : "-"}</td>
      <td>${c.grupo}/${c.cota}</td>
      <td>${c.regiao}</td>
      <td>${c.bemEntregue ? "Sim" : "Não"}</td>
      <td>${c.parcelasAtrasadas}</td>
      <td>${c.diasAtraso} dias</td>
      <td>${renderStatusBadge(c.status)}</td>
      <td>${renderStatusBadge(c.risco.faixa)} ${c.risco.score}</td>
    </tr>
  `).join("");
}
