let chatState = {
  cotaId: null,
  proposta: null
};

/* =========================================================
   INICIALIZAÇÃO DO CHATBOT
   ========================================================= */

function initChatbot() {
  limparChat();

  botMessage(`
    Olá! Sou o <strong>Khon BOT</strong>, assistente digital da KhonFácil.
    Posso ajudar com consulta de débitos, negociação, simulação IPCA/INCC,
    pagamento demonstrativo e dúvidas sobre a plataforma.
  `);

  renderQuickActions();
}

/* =========================================================
   UTILITÁRIOS DE MENSAGEM
   ========================================================= */

function limparChat() {
  const box = document.getElementById("chatMessages");

  if (box) {
    box.innerHTML = "";
  }
}

function addMessage(text, type) {
  const box = document.getElementById("chatMessages");

  if (!box) {
    console.warn("Elemento #chatMessages não encontrado.");
    return;
  }

  const div = document.createElement("div");

  div.className = `message ${type}`;
  div.innerHTML = text;

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function botMessage(text) {
  addMessage(text, "bot");
}

function userMessage(text) {
  addMessage(text, "user");
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
  return cotas.sort((a, b) => {
    const riscoA = calcularRisco(a).score;
    const riscoB = calcularRisco(b).score;

    return riscoB - riscoA;
  })[0];
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

  botMessage(`
    Encontrei <strong>${cotas.length}</strong> cota(s) com pendência
    para <strong>${cliente.nome}</strong>, totalizando
    <strong>${fmtBRL(total)}</strong>.

    <br><br>

    A maior prioridade é a cota
    <strong>${cotaCritica.grupo}/${cotaCritica.cota}</strong>,
    classificada com risco <strong>${risco.faixa}</strong>
    e score <strong>${risco.score}</strong>.
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

  abrirPainelNegociacao(cota);

  botMessage(`
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

  document.getElementById("propostaResultado").innerHTML = `
    <strong>Proposta gerada:</strong><br>
    Desconto aplicado: <strong>${desconto}%</strong><br>
    Valor final: <strong>${fmtBRL(valorFinal)}</strong><br>
    Entrada: <strong>${fmtBRL(entrada)}</strong><br>
    Parcelamento: <strong>${parcelas}x de ${fmtBRL(valorParcela)}</strong>
  `;

  botMessage(`
    Proposta simulada com sucesso:

    <br><br>

    Desconto de <strong>${desconto}%</strong>,
    valor final de <strong>${fmtBRL(valorFinal)}</strong>,
    entrada de <strong>${fmtBRL(entrada)}</strong>
    e parcelamento em <strong>${parcelas}x de ${fmtBRL(valorParcela)}</strong>.
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

  const negociacao = {
    id: nextId(db.negociacoes),
    clienteId: cliente.id,
    cotaId: chatState.cotaId,
    valorOriginal: proposta.valorOriginal,
    desconto: proposta.desconto,
    entrada: proposta.entrada,
    parcelas: proposta.parcelas,
    valorFinal: proposta.valorFinal,
    canal: "Chatbot",
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
    "Negociação concluída pelo chatbot"
  );

  addLog(
    "Negociação",
    `Acordo firmado via Khon Bot para cliente ${cliente.nome}`
  );

  document.getElementById("negotiationBox").style.display = "none";

  botMessage(`
    Negociação concluída com sucesso!

    <br><br>

    O acordo foi registrado como
    <strong>ACORDO FIRMADO</strong>.
    O comprovante demonstrativo seria enviado por e-mail
    e os pontos de fidelidade serão registrados no perfil do consorciado.
  `);

  chatState.cotaId = null;
  chatState.proposta = null;
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

  botMessage(`
    Simulação de reajuste por <strong>${indice}</strong>.

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

  botMessage(`
    Pagamento demonstrativo gerado com sucesso.

    <br><br>

    Cliente:
    <strong>${cliente.nome}</strong><br>

    Código Pix demonstrativo:
    <strong>${protocolo}</strong><br>

    Canal:
    <strong>Pix ou Cartão</strong>

    <br><br>

    Após confirmação em ambiente real, o pagamento seria integrado
    ao gateway financeiro e os pontos seriam lançados automaticamente
    no programa de fidelidade.
  `);
}

function gerarProtocoloPagamento() {
  const data = new Date();

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  const aleatorio = Math.floor(Math.random() * 9000) + 1000;

  return `KHON-PIX-${ano}${mes}${dia}-${aleatorio}`;
}