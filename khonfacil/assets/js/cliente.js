function initPerfil() {
  const cliente = currentCliente();
  const user = currentUser();
  if (!cliente) return;

  const cotas = getClienteCotas(cliente.id);
  const saldo = cotas.reduce((s, c) => s + Number(c.saldoDevedor || 0), 0);
  const atrasadas = cotas.filter(c => Number(c.parcelasAtrasadas || 0) > 0).length;

  document.getElementById("perfilContent").innerHTML = `
    <div class="kpi-grid">
      <div class="card"><div class="label">Nome</div><div class="value" style="font-size:1.4rem">${cliente.nome}</div><div class="hint">${cliente.email}</div></div>
      <div class="card"><div class="label">Cotas</div><div class="value">${cotas.length}</div><div class="hint">Vínculos ativos</div></div>
      <div class="card"><div class="label">Saldo devedor</div><div class="value">${fmtBRL(saldo)}</div><div class="hint">Carteira pessoal</div></div>
      <div class="card"><div class="label">Pontos</div><div class="value">${cliente.pontos}</div><div class="hint">Nível ${cliente.nivel}</div></div>
    </div>

    <div class="panel">
      <div class="panel-header"><h2>Dados do consorciado</h2>${renderStatusBadge(atrasadas ? "Possui atraso" : "Adimplente")}</div>
      <p><strong>CPF:</strong> ${cliente.cpf}</p>
      <p><strong>Telefone:</strong> ${cliente.telefone}</p>
      <p><strong>Região:</strong> ${cliente.regiao}</p>
      <p><strong>Notificações:</strong> ${user.notificacoes.email ? "E-mail" : ""} ${user.notificacoes.sms ? "SMS" : ""} • ${user.notificacoes.antecedencia} dias antes</p>
    </div>
  `;
}

function initParcelas() {
  const cliente = currentCliente();
  if (!cliente) return;

  const cotas = getClienteCotas(cliente.id);

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
  if (!cliente) return;

  const historico = getDB().pontosHistorico.filter(p => Number(p.clienteId) === Number(cliente.id));
  const proximoNivel = cliente.pontos >= 500 ? "Nível máximo" : cliente.pontos >= 300 ? "Diamante em 500 pts" : cliente.pontos >= 150 ? "Ouro em 300 pts" : "Prata em 150 pts";

  document.getElementById("fidelidadeResumo").innerHTML = `
    <div class="card"><div class="label">Saldo de pontos</div><div class="value">${cliente.pontos}</div><div class="hint">Registrados automaticamente</div></div>
    <div class="card"><div class="label">Nível atual</div><div class="value">${cliente.nivel}</div><div class="hint">${proximoNivel}</div></div>
    <div class="card"><div class="label">Benefício sugerido</div><div class="value" style="font-size:1.4rem">Prioridade</div><div class="hint">Atendimento e alertas personalizados</div></div>
  `;

  document.getElementById("pontosTable").innerHTML = historico.map(p => `
    <tr>
      <td>${fmtDate(p.data)}</td>
      <td>${p.motivo}</td>
      <td><strong>+${p.pontos}</strong></td>
    </tr>
  `).join("");
}

function initConfiguracoes() {
  const user = currentUser();

  document.getElementById("notifEmail").checked = !!user.notificacoes.email;
  document.getElementById("notifSms").checked = !!user.notificacoes.sms;
  document.getElementById("antecedencia").value = user.notificacoes.antecedencia || 3;
  document.getElementById("lgpd").checked = !!user.consentimentoLGPD;

  // Carrega o tema salvo
  document.getElementById("temaVisual").value = getTemaAtual();

  // Aplica o tema imediatamente ao mudar no select
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

    // Salva o tema escolhido no usuário
    u.temaVisual = document.getElementById("temaVisual").value;

    // Aplica o tema escolhido
    alternarTema(u.temaVisual);

    saveDB(db);

    addLog("Configurações", `Preferências atualizadas por ${u.email}`);

    document.getElementById("configMsg").textContent =
      "Configurações salvas com sucesso.";

    document.getElementById("configMsg").className = "form-msg ok";
  });
}

function restaurarBaseDemo() {
  if (!confirm("Restaurar a base demo apagará os cadastros locais. Continuar?")) return;
  resetDB();
  alert("Base demo restaurada.");
  window.location.reload();
}
