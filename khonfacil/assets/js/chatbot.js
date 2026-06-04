let chatState = {
  cotaId: null,
  proposta: null,
  protocolo: null,
  atendimento: []
};

/* =========================================================
   INICIALIZAÇÃO DO KHON BOT
   ========================================================= */

function initChatbot() {
  limparChat();

  chatState = {
    cotaId: null,
    proposta: null,
    protocolo: null,
    atendimento: []
  };

  botMessage(`
    <div class="khonbot-response-card">
      <strong>Olá! Sou o Khon Bot, assistente digital da KhonFácil.</strong>
      <br><br>
      Fui criado para apoiar consorciados e administradores em consulta de débitos,
      diagnóstico financeiro, simulações IPCA/INCC, autonegociação e pagamento demonstrativo.
      <br><br>
      Para a banca, minha função principal é demonstrar como a plataforma reduz atendimento manual,
      prioriza cotas críticas e apoia a recuperação financeira da carteira.
    </div>
  `);

  registrarAtendimento("Início", "Atendimento iniciado no Khon Bot");
  renderQuickActions();
}

/* =========================================================
   UTILITÁRIOS DE MENSAGEM E EXPERIÊNCIA
   ========================================================= */

function limparChat() {
  const box = document.getElementById("chatMessages");

  if (box) {
    box.innerHTML = "";
  }
}

function registrarAtendimento(acao, detalhe) {
  chatState.atendimento.push({
    acao,
    detalhe,
    data: new Date().toLocaleString("pt-BR")
  });
}

function addMessage(text, type) {
  const box = document.getElementById("chatMessages");

  if (!box) {
    console.warn("Elemento #chatMessages não encontrado.");
    return null;
  }

  const div = document.createElement("div");

  div.className = `message ${type}`;
  div.innerHTML = text;

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;

  return div;
}

function addTypingIndicator() {
  return addMessage(`
    <div class="typing-indicator">
      <strong>Khon Bot está analisando</strong>
      <span class="typing-dots">
        <i></i><i></i><i></i>
      </span>
    </div>
  `, "bot typing");
}

function botMessage(text, delay = 520) {
  const typing = addTypingIndicator();

  window.setTimeout(() => {
    if (typing && typing.parentNode) {
      typing.parentNode.removeChild(typing);
    }

    addMessage(text, "bot");
  }, delay);
}

function userMessage(text) {
  addMessage(text, "user");
}

function fmtPercent(valor) {
  return `${Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })}%`;
}

function gerarProtocolo(prefixo = "KHON") {
  const data = new Date();

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  const hora = String(data.getHours()).padStart(2, "0");
  const min = String(data.getMinutes()).padStart(2, "0");
  const aleatorio = Math.floor(Math.random() * 9000) + 1000;

  return `${prefixo}-${ano}${mes}${dia}-${hora}${min}-${aleatorio}`;
}

/* =========================================================
   BOTÕES RÁPIDOS
   ========================================================= */

function renderQuickActions() {
  const quickActions = document.getElementById("quickActions");

  if (!quickActions) {
    console.warn("Elemento #quickActions não encontrado.");
    return;
  }

  quickActions.innerHTML = `
    <button class="btn primary khonbot-featured-action" onclick="demonstrarSolucao()">
      <span class="material-symbols-outlined">play_circle</span>
      Demonstrar solução
    </button>

    <button class="btn secondary" onclick="diagnosticoFinanceiro()">
      <span class="material-symbols-outlined">monitoring</span>
      Diagnóstico financeiro
    </button>

    <button class="btn secondary" onclick="consultarDebitos()">
      <span class="material-symbols-outlined">receipt_long</span>
      Consultar débitos
    </button>

    <button class="btn secondary" onclick="iniciarNegociacao()">
      <span class="material-symbols-outlined">handshake</span>
      Negociar débito
    </button>

    <button class="btn secondary" onclick="simularReajuste('IPCA')">
      <span class="material-symbols-outlined">trending_up</span>
      Simular IPCA
    </button>

    <button class="btn secondary" onclick="simularReajuste('INCC')">
      <span class="material-symbols-outlined">calculate</span>
      Simular INCC
    </button>

    <button class="btn secondary" onclick="verRequisitosAtendidos()">
      <span class="material-symbols-outlined">rule</span>
      Requisitos atendidos
    </button>

    <button class="btn secondary" onclick="gerarResumoAtendimento()">
      <span class="material-symbols-outlined">summarize</span>
      Resumo do atendimento
    </button>

    <button class="btn primary" onclick="simularPagamento()">
      <span class="material-symbols-outlined">qr_code_2</span>
      Pagar via Pix/Cartão
    </button>
  `;
}

/* =========================================================
   CONTEXTO DO USUÁRIO
   ========================================================= */

function getClienteChat() {
  const user = currentUser();

  if (!user) {
    return null;
  }

  if (user.perfil === "cliente") {
    return currentCliente();
  }

  /*
    Quando o administrador acessa o chatbot,
    usamos o primeiro cliente da base como demonstração.
  */
  const db = getDB();

  return db.clientes[0] || null;
}

function getCotasNegociaveis(clienteId) {
  return getClienteCotas(clienteId).filter(cota => {
    return cota.status !== "ADIMPLENTE";
  });
}

function getCotaMaisCritica(cotas) {
  return [...cotas].sort((a, b) => {
    const riscoA = calcularRisco(a).score;
    const riscoB = calcularRisco(b).score;

    return riscoB - riscoA;
  })[0];
}

function getResumoCliente(cliente) {
  const cotas = getClienteCotas(cliente.id);
  const cotasNegociaveis = getCotasNegociaveis(cliente.id);
  const saldoTotal = cotas.reduce((soma, cota) => {
    return soma + Number(cota.saldoDevedor || 0);
  }, 0);

  const saldoPendente = cotasNegociaveis.reduce((soma, cota) => {
    return soma + Number(cota.saldoDevedor || 0);
  }, 0);

  const parcelasAtrasadas = cotas.reduce((soma, cota) => {
    return soma + Number(cota.parcelasAtrasadas || 0);
  }, 0);

  const cotaCritica = cotasNegociaveis.length
    ? getCotaMaisCritica(cotasNegociaveis)
    : null;

  const risco = cotaCritica
    ? calcularRisco(cotaCritica)
    : { score: 0, faixa: "Baixo" };

  return {
    cotas,
    cotasNegociaveis,
    saldoTotal,
    saldoPendente,
    parcelasAtrasadas,
    cotaCritica,
    risco
  };
}

/* =========================================================
   MODO APRESENTAÇÃO / BANCA
   ========================================================= */

function demonstrarSolucao() {
  userMessage(`
    <span class="material-symbols-outlined">play_circle</span>
    Demonstrar solução
  `);

  registrarAtendimento("Demonstração", "Usuário solicitou visão geral da solução");

  botMessage(`
    <div class="khonbot-response-card">
      <strong>Demonstração rápida da solução KhonFácil</strong>

      <div class="khonbot-step-list">
        <div><span>1</span><p><strong>Centralização de dados:</strong> a plataforma consolida informações de cotas, pagamentos, inadimplência e assessorias.</p></div>
        <div><span>2</span><p><strong>Central analítica:</strong> o dashboard transforma a base consolidada em KPIs, gráficos, filtros e análise regional.</p></div>
        <div><span>3</span><p><strong>Sistema decisório:</strong> cotas críticas, auditoria e insights apoiam decisões de cobrança e recuperação financeira.</p></div>
        <div><span>4</span><p><strong>Khon Bot:</strong> realiza consulta, diagnóstico, simulações, autonegociação e pagamento demonstrativo.</p></div>
        <div><span>5</span><p><strong>Governança:</strong> logs, requisitos, LGPD, 2FA e rastreabilidade reforçam controle e transparência.</p></div>
      </div>
    </div>
  `);
}

function verRequisitosAtendidos() {
  userMessage(`
    <span class="material-symbols-outlined">rule</span>
    Ver requisitos atendidos pelo Khon Bot
  `);

  registrarAtendimento("Requisitos", "Usuário consultou requisitos atendidos pelo bot");

  botMessage(`
    <div class="khonbot-response-card">
      <strong>Requisitos diretamente demonstrados pelo Khon Bot</strong>

      <div class="khonbot-chip-grid">
        <div><strong>RF05</strong><span>Negociação autônoma de débitos.</span></div>
        <div><strong>RF06</strong><span>Simulação de reajustes por IPCA/INCC.</span></div>
        <div><strong>RF07</strong><span>Disponibilidade contínua do chatbot.</span></div>
        <div><strong>RF08</strong><span>Pontuação após comportamento positivo.</span></div>
        <div><strong>RF09</strong><span>Integração com fidelidade.</span></div>
        <div><strong>RN10</strong><span>Fluxo sem intervenção humana.</span></div>
      </div>

      <br>
      Em ambiente real, esse módulo também poderia ser integrado a gateway de pagamento,
      disparos de notificação e APIs dos sistemas legados da administradora.
    </div>
  `);
}

/* =========================================================
   DIAGNÓSTICO FINANCEIRO
   ========================================================= */

function diagnosticoFinanceiro() {
  userMessage(`
    <span class="material-symbols-outlined">monitoring</span>
    Gerar diagnóstico financeiro
  `);

  const cliente = getClienteChat();

  if (!cliente) {
    botMessage(`
      Não consegui identificar um cliente vinculado à sessão atual.
      Verifique o perfil de acesso ou tente novamente.
    `);
    return;
  }

  const resumo = getResumoCliente(cliente);
  const { cotas, cotasNegociaveis, saldoPendente, parcelasAtrasadas, cotaCritica, risco } = resumo;

  registrarAtendimento("Diagnóstico", `Diagnóstico financeiro gerado para ${cliente.nome}`);

  if (!cotas.length) {
    botMessage(`
      <div class="khonbot-response-card">
        <strong>Diagnóstico financeiro</strong><br><br>
        O cliente <strong>${cliente.nome}</strong> ainda não possui cotas vinculadas.
        Em cenário real, as cotas seriam integradas a partir da base da administradora de consórcios.
      </div>
    `);
    return;
  }

  const recomendacao = cotaCritica
    ? `Priorizar a cota <strong>${cotaCritica.grupo}/${cotaCritica.cota}</strong>, pois ela apresenta risco <strong>${risco.faixa}</strong> e score <strong>${risco.score}</strong>.`
    : "Manter acompanhamento preventivo e notificações configuradas, pois não há cotas negociáveis no momento.";

  botMessage(`
    <div class="khonbot-response-card">
      <strong>Diagnóstico financeiro de ${cliente.nome}</strong>

      <div class="khonbot-mini-grid">
        <div><span>Cotas</span><strong>${cotas.length}</strong></div>
        <div><span>Negociáveis</span><strong>${cotasNegociaveis.length}</strong></div>
        <div><span>Parcelas atrasadas</span><strong>${parcelasAtrasadas}</strong></div>
        <div><span>Saldo pendente</span><strong>${fmtBRL(saldoPendente)}</strong></div>
      </div>

      <br>
      <strong>Recomendação do Khon Bot:</strong><br>
      ${recomendacao}

      <br><br>
      Esse diagnóstico apoia a decisão de cobrança ao destacar risco, prioridade e potencial de recuperação.
    </div>
  `);
}

/* =========================================================
   CONSULTA DE DÉBITOS
   ========================================================= */

function consultarDebitos() {
  userMessage(`
    <span class="material-symbols-outlined">receipt_long</span>
    Consultar meus débitos
  `);

  const cliente = getClienteChat();

  if (!cliente) {
    botMessage(`
      Não consegui identificar um cliente vinculado à sessão atual.
      Verifique o perfil de acesso ou tente novamente.
    `);
    return;
  }

  const cotas = getCotasNegociaveis(cliente.id);

  if (!cotas.length) {
    registrarAtendimento("Consulta", `Cliente ${cliente.nome} sem débitos pendentes`);

    botMessage(`
      Boa notícia, <strong>${cliente.nome}</strong>!
      Não encontrei débitos pendentes para sua conta.
    `);
    return;
  }

  const total = cotas.reduce((soma, cota) => {
    return soma + Number(cota.saldoDevedor || 0);
  }, 0);

  const cotaCritica = getCotaMaisCritica(cotas);
  const risco = calcularRisco(cotaCritica);

  registrarAtendimento("Consulta", `Consulta de débitos para ${cliente.nome}`);

  botMessage(`
    <div class="khonbot-response-card">
      <strong>Consulta de débitos</strong><br><br>

      Encontrei <strong>${cotas.length}</strong> cota(s) com pendência
      para <strong>${cliente.nome}</strong>, totalizando
      <strong>${fmtBRL(total)}</strong>.

      <br><br>

      A maior prioridade é a cota
      <strong>${cotaCritica.grupo}/${cotaCritica.cota}</strong>,
      classificada com risco <strong>${risco.faixa}</strong>
      e score <strong>${risco.score}</strong>.

      <br><br>

      Recomendo iniciar a negociação pela cota mais crítica para aumentar a chance de recuperação financeira.
    </div>
  `);
}

/* =========================================================
   NEGOCIAÇÃO
   ========================================================= */

function iniciarNegociacao() {
  userMessage(`
    <span class="material-symbols-outlined">handshake</span>
    Quero negociar meu débito
  `);

  const cliente = getClienteChat();

  if (!cliente) {
    botMessage(`
      Não consegui identificar um cliente para iniciar a negociação.
    `);
    return;
  }

  const cotas = getCotasNegociaveis(cliente.id);

  if (!cotas.length) {
    botMessage(`
      Você não possui débitos negociáveis no momento.
    `);
    return;
  }

  const cota = getCotaMaisCritica(cotas);
  const risco = calcularRisco(cota);

  chatState.cotaId = cota.id;
  chatState.proposta = null;
  chatState.protocolo = gerarProtocolo("KHON-NEG");

  abrirPainelNegociacao(cota);

  registrarAtendimento("Negociação", `Negociação iniciada para cota ${cota.grupo}/${cota.cota}`);

  botMessage(`
    <div class="khonbot-response-card">
      <strong>Negociação iniciada</strong><br><br>

      Protocolo gerado:
      <strong class="khonbot-protocol">${chatState.protocolo}</strong>

      <br><br>

      Vamos negociar a cota
      <strong>${cota.grupo}/${cota.cota}</strong>.

      <br><br>

      Essa cota foi priorizada automaticamente porque possui
      risco <strong>${risco.faixa}</strong>, score
      <strong>${risco.score}</strong> e saldo devedor de
      <strong>${fmtBRL(cota.saldoDevedor)}</strong>.

      <br><br>

      Preenchi uma proposta inicial com entrada de 10%
      e parcelamento em 6 vezes.
    </div>
  `);
}

function abrirPainelNegociacao(cota) {
  const box = document.getElementById("negotiationBox");

  if (!box) {
    console.warn("Elemento #negotiationBox não encontrado.");
    return;
  }

  box.style.display = "block";

  document.getElementById("valorOriginal").value =
    Number(cota.saldoDevedor || 0);

  document.getElementById("entrada").value =
    Math.round(Number(cota.saldoDevedor || 0) * 0.10);

  document.getElementById("parcelas").value = 6;

  const resultado = document.getElementById("propostaResultado");

  if (resultado) {
    resultado.innerHTML = "";
  }
}

function calcularProposta() {
  const valorOriginal = Number(
    document.getElementById("valorOriginal").value || 0
  );

  const entrada = Number(
    document.getElementById("entrada").value || 0
  );

  const parcelas = Number(
    document.getElementById("parcelas").value || 1
  );

  if (valorOriginal <= 0) {
    alert("Informe um valor original válido.");
    return;
  }

  if (entrada < 0) {
    alert("A entrada não pode ser negativa.");
    return;
  }

  if (parcelas < 1 || parcelas > 12) {
    alert("Informe uma quantidade de parcelas entre 1 e 12.");
    return;
  }

  const desconto = calcularDescontoPorParcelas(parcelas);
  const valorFinal = valorOriginal - (valorOriginal * desconto / 100);
  const saldoParcelado = Math.max(valorFinal - entrada, 0);
  const valorParcela = saldoParcelado / parcelas;

  chatState.proposta = {
    valorOriginal,
    entrada,
    parcelas,
    desconto,
    valorFinal,
    valorParcela
  };

  const resultado = document.getElementById("propostaResultado");

  if (resultado) {
    resultado.innerHTML = `
      <strong>Proposta gerada:</strong><br>
      Desconto aplicado: <strong>${desconto}%</strong><br>
      Valor final: <strong>${fmtBRL(valorFinal)}</strong><br>
      Entrada: <strong>${fmtBRL(entrada)}</strong><br>
      Parcelamento: <strong>${parcelas}x de ${fmtBRL(valorParcela)}</strong>
    `;
  }

  registrarAtendimento("Proposta", `Proposta simulada em ${parcelas} parcela(s)`);

  botMessage(`
    <div class="khonbot-response-card">
      <strong>Proposta simulada com sucesso</strong>

      <div class="khonbot-mini-grid">
        <div><span>Desconto</span><strong>${desconto}%</strong></div>
        <div><span>Valor final</span><strong>${fmtBRL(valorFinal)}</strong></div>
        <div><span>Entrada</span><strong>${fmtBRL(entrada)}</strong></div>
        <div><span>Parcelas</span><strong>${parcelas}x</strong></div>
      </div>

      <br>
      Valor estimado por parcela:
      <strong>${fmtBRL(valorParcela)}</strong>.
    </div>
  `);
}

function calcularDescontoPorParcelas(parcelas) {
  if (parcelas <= 3) {
    return 15;
  }

  if (parcelas <= 6) {
    return 10;
  }

  return 5;
}

function confirmarNegociacao() {
  if (!chatState.cotaId) {
    botMessage(`
      Para confirmar uma negociação, primeiro selecione uma cota
      clicando em <strong>Negociar débito</strong>.
    `);
    return;
  }

  if (!chatState.proposta) {
    calcularProposta();
  }

  const proposta = chatState.proposta;

  if (!proposta) {
    botMessage(`
      Não foi possível gerar a proposta.
      Verifique os valores informados.
    `);
    return;
  }

  const cliente = getClienteChat();
  const db = getDB();

  const protocolo = chatState.protocolo || gerarProtocolo("KHON-NEG");

  const negociacao = {
    id: nextId(db.negociacoes),
    clienteId: cliente.id,
    cotaId: chatState.cotaId,
    protocolo,
    valorOriginal: proposta.valorOriginal,
    desconto: proposta.desconto,
    entrada: proposta.entrada,
    parcelas: proposta.parcelas,
    valorFinal: proposta.valorFinal,
    canal: "Khon Bot",
    status: "ACORDO FIRMADO",
    criadoEm: new Date().toISOString()
  };

  db.negociacoes.unshift(negociacao);

  const cota = db.cotas.find(c => c.id === chatState.cotaId);

  if (cota) {
    cota.status = "ACORDO FIRMADO";
  }

  saveDB(db);

  registrarPontuacao(
    cliente.id,
    120,
    `Negociação concluída pelo Khon Bot • ${protocolo}`
  );

  addLog(
    "Negociação",
    `Acordo firmado via Khon Bot para cliente ${cliente.nome}. Protocolo: ${protocolo}`
  );

  registrarAtendimento("Acordo", `Acordo firmado com protocolo ${protocolo}`);

  const box = document.getElementById("negotiationBox");

  if (box) {
    box.style.display = "none";
  }

  botMessage(`
    <div class="khonbot-response-card">
      <strong>Negociação concluída com sucesso!</strong>

      <br><br>

      Protocolo:
      <strong class="khonbot-protocol">${protocolo}</strong>

      <br><br>

      Status:
      <strong>ACORDO FIRMADO</strong><br>

      Canal:
      <strong>Khon Bot</strong><br>

      Pontuação:
      <strong>+120 pontos de fidelidade</strong>

      <br><br>

      O acordo foi registrado na base local do MVP, o log de auditoria foi criado
      e os pontos foram lançados no programa de fidelidade do consorciado.
    </div>
  `);

  chatState.cotaId = null;
  chatState.proposta = null;
  chatState.protocolo = null;
}

/* =========================================================
   SIMULAÇÕES IPCA / INCC
   ========================================================= */

function simularReajuste(indice) {
  userMessage(`
    <span class="material-symbols-outlined">calculate</span>
    Simular reajuste por ${indice}
  `);

  const cliente = getClienteChat();

  if (!cliente) {
    botMessage(`
      Não consegui identificar um cliente para realizar a simulação.
    `);
    return;
  }

  const cotas = getClienteCotas(cliente.id);

  if (!cotas.length) {
    botMessage(`
      Não encontrei cotas vinculadas ao cliente para simulação.
    `);
    return;
  }

  const cota = cotas[0];
  const taxa = getTaxaIndice(indice);
  const saldoAtual = Number(cota.saldoDevedor || 0);
  const saldoReajustado = saldoAtual + (saldoAtual * taxa / 100);
  const diferenca = saldoReajustado - saldoAtual;

  registrarAtendimento("Simulação", `Simulação de reajuste por ${indice}`);

  const explicacaoIndice = indice === "IPCA"
    ? "O IPCA é utilizado como referência de inflação ao consumidor e pode impactar valores conforme regra contratual."
    : "O INCC acompanha a variação de custos da construção civil e pode impactar contratos vinculados a esse índice.";

  botMessage(`
    <div class="khonbot-response-card">
      <strong>Simulação de reajuste por ${indice}</strong><br><br>

      ${explicacaoIndice}

      <br><br>

      Data de referência:
      <strong>${new Date().toLocaleDateString("pt-BR")}</strong><br>

      Cota analisada:
      <strong>${cota.grupo}/${cota.cota}</strong><br>

      Saldo atual:
      <strong>${fmtBRL(saldoAtual)}</strong><br>

      Índice aplicado:
      <strong>${taxa}%</strong><br>

      Acréscimo estimado:
      <strong>${fmtBRL(diferenca)}</strong><br>

      Saldo reajustado:
      <strong>${fmtBRL(saldoReajustado)}</strong>

      <br><br>
      <span class="khonbot-note">
        Simulação demonstrativa para o MVP acadêmico. Em ambiente real, os índices seriam consumidos de fonte oficial ou API integrada.
      </span>
    </div>
  `);
}

function getTaxaIndice(indice) {
  if (indice === "IPCA") {
    return 4.62;
  }

  if (indice === "INCC") {
    return 3.85;
  }

  return 0;
}

/* =========================================================
   PAGAMENTO DEMONSTRATIVO
   ========================================================= */

function simularPagamento() {
  userMessage(`
    <span class="material-symbols-outlined">qr_code_2</span>
    Pagar via Pix/Cartão
  `);

  const cliente = getClienteChat();

  if (!cliente) {
    botMessage(`
      Não consegui identificar um cliente para gerar o pagamento demonstrativo.
    `);
    return;
  }

  const protocolo = gerarProtocoloPagamento();

  registrarAtendimento("Pagamento", `Pagamento demonstrativo gerado: ${protocolo}`);

  botMessage(`
    <div class="khonbot-response-card">
      <strong>Pagamento demonstrativo gerado</strong>

      <div class="khonbot-mini-grid">
        <div><span>Cliente</span><strong>${cliente.nome}</strong></div>
        <div><span>Status</span><strong>Aguardando confirmação</strong></div>
        <div><span>Canal</span><strong>Pix/Cartão</strong></div>
        <div><span>Ambiente</span><strong>MVP</strong></div>
      </div>

      <br>

      Código Pix demonstrativo:
      <strong class="khonbot-protocol">${protocolo}</strong>

      <br><br>

      Em ambiente real, esta etapa seria integrada a um gateway de pagamento
      por API, com confirmação automática e baixa financeira na carteira.
    </div>
  `);
}

function gerarProtocoloPagamento() {
  return gerarProtocolo("KHON-PIX");
}

/* =========================================================
   RESUMO DO ATENDIMENTO
   ========================================================= */

function gerarResumoAtendimento() {
  userMessage(`
    <span class="material-symbols-outlined">summarize</span>
    Gerar resumo do atendimento
  `);

  const cliente = getClienteChat();
  const nomeCliente = cliente ? cliente.nome : "cliente demonstrativo";

  if (!chatState.atendimento.length) {
    registrarAtendimento("Resumo", "Resumo solicitado sem interações prévias");
  }

  const linhas = chatState.atendimento.map(item => {
    return `
      <tr>
        <td>${item.data}</td>
        <td>${item.acao}</td>
        <td>${item.detalhe}</td>
      </tr>
    `;
  }).join("");

  botMessage(`
    <div class="khonbot-response-card">
      <strong>Resumo do atendimento — ${nomeCliente}</strong>

      <br><br>

      <div class="khonbot-summary-table-wrap">
        <table class="khonbot-summary-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Ação</th>
              <th>Detalhe</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>

      <br>

      Esse resumo demonstra rastreabilidade do atendimento, útil para auditoria,
      governança e acompanhamento da negociação.
    </div>
  `);
}
