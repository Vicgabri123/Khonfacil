function renderClienteNaoEncontrado(targetId, titulo = "Dados não encontrados") {
  const target = document.getElementById(targetId);
  if (!target) return;

  target.innerHTML = `
    <div class="panel empty-state-panel">
      <span class="material-symbols-outlined">person_alert</span>
      <h2>${titulo}</h2>
      <p class="muted">
        Não foi possível localizar os dados do consorciado vinculado à sessão atual.
        Faça login novamente ou restaure a base demonstrativa em Configurações.
      </p>
      <div class="actions">
        <a class="btn secondary" href="configuracoes.html">Ir para configurações</a>
        <button class="btn danger" onclick="destroySession()">Sair da sessão</button>
      </div>
    </div>
  `;
}

function renderEmptyTableRow(colspan, message, iconName = "info") {
  return `
    <tr>
      <td colspan="${colspan}">
        <div class="table-empty-state">
          <span class="material-symbols-outlined">${iconName}</span>
          <strong>${message}</strong>
        </div>
      </td>
    </tr>
  `;
}

function initPerfil() {
  const cliente = currentCliente();
  const user = currentUser();

  if (!cliente || !user) {
    renderClienteNaoEncontrado("perfilContent");
    return;
  }

  const cotas = getClienteCotas(cliente.id);
  const saldo = cotas.reduce((s, c) => s + Number(c.saldoDevedor || 0), 0);
  const atrasadas = cotas.filter(c => Number(c.parcelasAtrasadas || 0) > 0).length;
  const statusCarteira = atrasadas ? "Possui atraso" : "Adimplente";
  const notificacoes = user.notificacoes || { email: false, sms: false, antecedencia: 3 };
  const canais = [
    notificacoes.email ? "E-mail" : null,
    notificacoes.sms ? "SMS" : null
  ].filter(Boolean).join(" e ") || "Não configuradas";

  document.getElementById("perfilContent").innerHTML = `
    <div class="profile-welcome-panel panel">
      <div class="profile-avatar">
        ${String(cliente.nome || "C").charAt(0).toUpperCase()}
      </div>
      <div>
        <span class="badge ${badgeClass(statusCarteira)}">${statusCarteira}</span>
        <h2>${cliente.nome}</h2>
        <p class="muted">
          Perfil do consorciado autenticado. Os dados abaixo são carregados dinamicamente pela sessão atual.
        </p>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="card">
        <div class="label">Nome</div>
        <div class="value" style="font-size:1.35rem">${cliente.nome}</div>
        <div class="hint">${cliente.email}</div>
      </div>

      <div class="card">
        <div class="label">Cotas</div>
        <div class="value">${cotas.length}</div>
        <div class="hint">Vínculos ativos</div>
      </div>

      <div class="card">
        <div class="label">Saldo devedor</div>
        <div class="value">${fmtBRL(saldo)}</div>
        <div class="hint">Carteira pessoal</div>
      </div>

      <div class="card">
        <div class="label">Pontos</div>
        <div class="value">${Number(cliente.pontos || 0)}</div>
        <div class="hint">Nível ${cliente.nivel || "Bronze"}</div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <h2>Dados do consorciado</h2>
        ${renderStatusBadge(statusCarteira)}
      </div>

      <div class="profile-data-grid">
        <p><strong>CPF:</strong> ${cliente.cpf || "Não informado"}</p>
        <p><strong>Telefone:</strong> ${cliente.telefone || "Não informado"}</p>
        <p><strong>Região:</strong> ${cliente.regiao || "Não informada"}</p>
        <p><strong>Perfil:</strong> ${user.perfil === "cliente" ? "Consorciado" : user.perfil}</p>
        <p><strong>Notificações:</strong> ${canais} • ${notificacoes.antecedencia || 3} dias antes</p>
        <p><strong>Consentimento LGPD:</strong> ${user.consentimentoLGPD ? "Ativo" : "Pendente"}</p>
      </div>
    </div>
  `;
}

function initParcelas() {
  const cliente = currentCliente();

  if (!cliente) {
    const table = document.getElementById("parcelasTable");
    if (table) table.innerHTML = renderEmptyTableRow(7, "Nenhum consorciado vinculado à sessão atual.", "person_alert");
    return;
  }

  const cotas = getClienteCotas(cliente.id);

  if (!cotas.length) {
    document.getElementById("parcelasTable").innerHTML = renderEmptyTableRow(
      7,
      "Este consorciado ainda não possui cotas vinculadas no MVP.",
      "info"
    );
    return;
  }

  document.getElementById("parcelasTable").innerHTML = cotas.map(c => {
    const risco = calcularRisco(c);

    return `
      <tr>
        <td>${c.grupo}/${c.cota}</td>
        <td>${fmtBRL(c.saldoDevedor)}</td>
        <td>${c.parcelasAtrasadas}</td>
        <td>${fmtDate(c.vencimento)}</td>
        <td>${renderStatusBadge(c.status)}</td>
        <td>${renderStatusBadge(risco.faixa)} ${risco.score}</td>
        <td><a class="btn secondary" href="chatbot.html">Negociar</a></td>
      </tr>
    `;
  }).join("");
}

function initFidelidade() {
  const cliente = currentCliente();

  if (!cliente) {
    const resumo = document.getElementById("fidelidadeResumo");
    if (resumo) renderClienteNaoEncontrado("fidelidadeResumo", "Fidelidade não encontrada");
    return;
  }

  const historico = getDB().pontosHistorico.filter(p => Number(p.clienteId) === Number(cliente.id));
  const pontos = Number(cliente.pontos || 0);
  const proximoNivel = pontos >= 500 ? "Nível máximo" : pontos >= 300 ? "Diamante em 500 pts" : pontos >= 150 ? "Ouro em 300 pts" : "Prata em 150 pts";

  document.getElementById("fidelidadeResumo").innerHTML = `
    <div class="card">
      <div class="label">Saldo de pontos</div>
      <div class="value">${pontos}</div>
      <div class="hint">Registrados automaticamente</div>
    </div>

    <div class="card">
      <div class="label">Nível atual</div>
      <div class="value">${cliente.nivel || "Bronze"}</div>
      <div class="hint">${proximoNivel}</div>
    </div>

    <div class="card">
      <div class="label">Benefício sugerido</div>
      <div class="value" style="font-size:1.4rem">Prioridade</div>
      <div class="hint">Atendimento e alertas personalizados</div>
    </div>
  `;

  document.getElementById("pontosTable").innerHTML = historico.length
    ? historico.map(p => `
      <tr>
        <td>${fmtDate(p.data)}</td>
        <td>${p.motivo}</td>
        <td><strong>+${p.pontos}</strong></td>
      </tr>
    `).join("")
    : renderEmptyTableRow(3, "Nenhum ponto registrado para este consorciado.", "workspace_premium");
}

function initConfiguracoes() {
  const user = currentUser();

  if (!user) return;

  user.notificacoes = user.notificacoes || { email: true, sms: false, antecedencia: 3 };

  document.getElementById("notifEmail").checked = !!user.notificacoes.email;
  document.getElementById("notifSms").checked = !!user.notificacoes.sms;
  document.getElementById("antecedencia").value = user.notificacoes.antecedencia || 3;
  document.getElementById("lgpd").checked = !!user.consentimentoLGPD;

  document.getElementById("temaVisual").value = getTemaAtual();

  document.getElementById("temaVisual").addEventListener("change", function () {
    alternarTema(this.value);
  });

  document.getElementById("configForm").addEventListener("submit", event => {
    event.preventDefault();

    const db = getDB();
    const u = db.usuarios.find(x => x.id === user.id);

    u.notificacoes = {
      email: document.getElementById("notifEmail").checked,
      sms: document.getElementById("notifSms").checked,
      antecedencia: Number(document.getElementById("antecedencia").value)
    };

    u.consentimentoLGPD = document.getElementById("lgpd").checked;
    u.temaVisual = document.getElementById("temaVisual").value;

    alternarTema(u.temaVisual);
    saveDB(db);

    addLog("Configurações", `Preferências atualizadas por ${u.email}`);

    const msg = document.getElementById("configMsg");
    msg.textContent = "Configurações salvas com sucesso.";
    msg.className = "form-msg ok";
  });
}

function restaurarBaseDemo() {
  if (!confirm("Restaurar a base demo apagará os cadastros locais. Continuar?")) return;
  resetDB();
  alert("Base demo restaurada.");
  window.location.reload();
}
