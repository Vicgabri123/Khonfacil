function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("show");
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("show");
}

function showActionOverlay(title, description, variant = "success") {
  let overlay = document.getElementById("khonActionOverlay");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "khonActionOverlay";
    document.body.appendChild(overlay);
  }

  overlay.className = `khon-action-overlay show ${variant}`;
  overlay.innerHTML = `
    <div class="khon-action-card">
      <div class="khon-action-icon">
        <span class="material-symbols-outlined">
          ${variant === "success" ? "check_circle" : "hourglass_top"}
        </span>
      </div>

      <h2>${title}</h2>
      <p>${description}</p>

      <div class="khon-action-loader">
        <span></span>
      </div>
    </div>
  `;
}

function hideActionOverlay() {
  const overlay = document.getElementById("khonActionOverlay");
  if (overlay) overlay.classList.remove("show");
}

function redirectWithFeedback(url, title, description) {
  showActionOverlay(title, description, "success");

  setTimeout(() => {
    window.location.href = url;
  }, 850);
}

function preencherLoginDemoPorPerfil(perfil) {
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");

  if (!email || !senha) return;

  if (perfil === "admin") {
    email.value = "admin@khonfacil.com";
    senha.value = "Admin@123";
  } else {
    email.value = "cliente@khonfacil.com";
    senha.value = "Cliente@123";
  }
}

const perfilSelect = document.getElementById("perfil");

if (perfilSelect) {
  perfilSelect.addEventListener("change", function () {
    preencherLoginDemoPorPerfil(this.value);
  });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    login();
  });
}

function login() {
  const email = document.getElementById("email").value.trim().toLowerCase();
  const senha = document.getElementById("senha").value;
  const perfilSelecionado = document.getElementById("perfil").value;
  const msg = document.getElementById("loginMsg");

  const db = getDB();
  const user = db.usuarios.find(u =>
    String(u.email).toLowerCase() === email &&
    u.perfil === perfilSelecionado
  );

  if (!user) {
    msg.textContent = "Usuário não encontrado para o perfil selecionado.";
    msg.className = "form-msg error";
    return;
  }

  if (user.bloqueadoAte && Date.now() < user.bloqueadoAte) {
    const minutos = Math.ceil((user.bloqueadoAte - Date.now()) / 60000);
    msg.textContent = `Conta bloqueada. Tente novamente em ${minutos} minuto(s).`;
    msg.className = "form-msg error";
    return;
  }

  if (user.senha !== senha) {
    user.tentativas = Number(user.tentativas || 0) + 1;

    if (user.tentativas >= 5) {
      user.bloqueadoAte = Date.now() + 15 * 60 * 1000;
      user.tentativas = 0;
      msg.textContent = "Conta bloqueada por 15 minutos após 5 tentativas incorretas.";
    } else {
      msg.textContent = `Senha incorreta. Tentativas restantes: ${5 - user.tentativas}.`;
    }

    saveDB(db);
    msg.className = "form-msg error";
    return;
  }

  user.tentativas = 0;
  user.bloqueadoAte = null;
  saveDB(db);

  if (user.perfil === "admin") {
    localStorage.setItem(PENDING_2FA_KEY, JSON.stringify({
      userId: user.id,
      code: "123456",
      expiresAt: Date.now() + 5 * 60 * 1000
    }));

    openModal("twoFactorModal");

    const twoFactorMsg = document.getElementById("twoFactorMsg");
    twoFactorMsg.textContent = "Código enviado por e-mail/SMS demonstrativo. Use 123456.";
    twoFactorMsg.className = "form-msg ok";
    return;
  }

  setSession(user);
  addLog("Login", `Usuário ${user.email} entrou como consorciado`);

  redirectWithFeedback(
    "pages/perfil.html",
    "Login concluído",
    "Acessando o portal do consorciado..."
  );
}

function validate2FA() {
  const msg = document.getElementById("twoFactorMsg");
  const code = document.getElementById("twoFactorCode").value.trim();
  const pending = JSON.parse(localStorage.getItem(PENDING_2FA_KEY) || "null");

  if (!pending) {
    msg.textContent = "Nenhuma autenticação 2FA pendente.";
    msg.className = "form-msg error";
    return;
  }

  if (Date.now() > pending.expiresAt) {
    localStorage.removeItem(PENDING_2FA_KEY);
    msg.textContent = "Código expirado. Faça login novamente.";
    msg.className = "form-msg error";
    return;
  }

  if (code !== pending.code) {
    msg.textContent = "Código inválido.";
    msg.className = "form-msg error";
    return;
  }

  const user = getDB().usuarios.find(u => u.id === pending.userId);

  localStorage.removeItem(PENDING_2FA_KEY);
  setSession(user);
  addLog("Login 2FA", `Administrador ${user.email} confirmou 2FA`);

  redirectWithFeedback(
    "pages/dashboard.html",
    "2FA validado",
    "Acessando o painel administrativo..."
  );
}

function sendRecovery() {
  const email = document.getElementById("recoveryEmail").value.trim().toLowerCase();
  const msg = document.getElementById("recoveryMsg");
  const user = getDB().usuarios.find(u => String(u.email).toLowerCase() === email);

  if (!user) {
    msg.textContent = "E-mail não encontrado.";
    msg.className = "form-msg error";
    return;
  }

  const token = Math.random().toString(36).slice(2, 10).toUpperCase();

  localStorage.setItem("khonfacil_recovery_token", JSON.stringify({
    email,
    token,
    expiresAt: Date.now() + 30 * 60 * 1000,
    used: false
  }));

  msg.innerHTML = `Link demonstrativo gerado: <strong>${token}</strong><br>Validade: 30 minutos.`;
  msg.className = "form-msg ok";

  addLog("Recuperação de senha", `Token gerado para ${email}`);
}

function gerarVencimentoDemo() {
  const data = new Date();
  data.setMonth(data.getMonth() + 1);
  return data.toISOString().slice(0, 10);
}

function signup() {
  const nome = document.getElementById("signupName").value.trim();
  const cpf = document.getElementById("signupCpf").value.trim();
  const email = document.getElementById("signupEmail").value.trim().toLowerCase();
  const telefone = document.getElementById("signupPhone").value.trim();
  const senha = document.getElementById("signupPassword").value;
  const consent = document.getElementById("signupConsent").checked;
  const msg = document.getElementById("signupMsg");

  if (!nome || !cpf || !email || !telefone || !senha) {
    msg.textContent = "Preencha todos os campos.";
    msg.className = "form-msg error";
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    msg.textContent = "Informe um e-mail válido.";
    msg.className = "form-msg error";
    return;
  }

  if (senha.length < 8 || !/[0-9]/.test(senha) || !/[A-Za-z]/.test(senha)) {
    msg.textContent = "A senha deve ter ao menos 8 caracteres, com letras e números.";
    msg.className = "form-msg error";
    return;
  }

  if (!consent) {
    msg.textContent = "É necessário aceitar o consentimento LGPD.";
    msg.className = "form-msg error";
    return;
  }

  const db = getDB();

  db.clientes = db.clientes || [];
  db.usuarios = db.usuarios || [];
  db.cotas = db.cotas || [];
  db.pagamentos = db.pagamentos || [];
  db.pontosHistorico = db.pontosHistorico || [];

  if (db.usuarios.some(u => String(u.email).toLowerCase() === email)) {
    msg.textContent = "E-mail já cadastrado.";
    msg.className = "form-msg error";
    return;
  }

  if (db.clientes.some(c => String(c.cpf).replace(/\D/g, "") === cpf.replace(/\D/g, ""))) {
    msg.textContent = "CPF já cadastrado.";
    msg.className = "form-msg error";
    return;
  }

  const clienteId = nextId(db.clientes);
  const cotaId = nextId(db.cotas);

  const cliente = {
    id: clienteId,
    source: "local",
    nome,
    cpf,
    email,
    telefone,
    regiao: "Nordeste",
    pontos: 0,
    nivel: "Bronze",
    criadoEm: new Date().toISOString()
  };

  const user = {
    id: nextId(db.usuarios),
    nome,
    email,
    senha,
    perfil: "cliente",
    clienteId,
    tentativas: 0,
    bloqueadoAte: null,
    consentimentoLGPD: true,
    notificacoes: { email: true, sms: false, antecedencia: 3 },
    temaVisual: getTemaAtual ? getTemaAtual() : "claro"
  };

  const cotaDemo = {
    id: cotaId,
    source: "local",
    clienteId,
    grupo: `G${String(900 + clienteId).padStart(3, "0")}`,
    cota: String(clienteId).padStart(3, "0"),
    regiao: cliente.regiao,
    assessoriaId: null,
    bemEntregue: false,
    valorCredito: 55000,
    saldoDevedor: 0,
    parcelasAtrasadas: 0,
    diasAtraso: 0,
    status: "ADIMPLENTE",
    vencimento: gerarVencimentoDemo()
  };

  const pagamentoDemo = {
    id: nextId(db.pagamentos),
    source: "local",
    clienteId,
    cotaId,
    valor: 0,
    data: new Date().toISOString().slice(0, 10),
    vencimento: cotaDemo.vencimento,
    status: "PAGO"
  };

  db.clientes.push(cliente);
  db.usuarios.push(user);
  db.cotas.push(cotaDemo);
  db.pagamentos.push(pagamentoDemo);


  saveDB(db);
  addLog("Cadastro", `Novo consorciado cadastrado: ${email}`);

  msg.textContent = "Conta criada com sucesso. Use o perfil Consorciado para entrar.";
  msg.className = "form-msg ok";

  document.getElementById("email").value = email;
  document.getElementById("senha").value = senha;
  document.getElementById("perfil").value = "cliente";

  showActionOverlay(
    "Cadastro concluído",
    "Consorciado criado com nível Bronze inicial. Agora acesse pelo perfil Consorciado.",
    "success"
  );

  setTimeout(() => {
    hideActionOverlay();
    closeModal("signupModal");
  }, 1300);
}
