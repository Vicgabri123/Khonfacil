function openModal(id) {
  document.getElementById(id).classList.add("show");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("show");
}

document.getElementById("perfil").addEventListener("change", function () {
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");

  if (this.value === "admin") {
    email.value = "admin@khonfacil.com";
    senha.value = "Admin@123";
  } else {
    email.value = "cliente@khonfacil.com";
    senha.value = "Cliente@123";
  }
});

document.getElementById("loginForm").addEventListener("submit", function (event) {
  event.preventDefault();
  login();
});

function login() {
  const email = document.getElementById("email").value.trim().toLowerCase();
  const senha = document.getElementById("senha").value;
  const perfilSelecionado = document.getElementById("perfil").value;
  const msg = document.getElementById("loginMsg");

  const db = getDB();
  const user = db.usuarios.find(u => u.email.toLowerCase() === email && u.perfil === perfilSelecionado);

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
    document.getElementById("twoFactorMsg").textContent = "Código enviado por e-mail/SMS demonstrativo. Use 123456.";
    document.getElementById("twoFactorMsg").className = "form-msg ok";
    return;
  }

  setSession(user);
  addLog("Login", `Usuário ${user.email} entrou como consorciado`);
  window.location.href = "pages/perfil.html";
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
  window.location.href = "pages/dashboard.html";
}

function sendRecovery() {
  const email = document.getElementById("recoveryEmail").value.trim().toLowerCase();
  const msg = document.getElementById("recoveryMsg");
  const user = getDB().usuarios.find(u => u.email.toLowerCase() === email);

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

  if (db.usuarios.some(u => u.email.toLowerCase() === email)) {
    msg.textContent = "E-mail já cadastrado.";
    msg.className = "form-msg error";
    return;
  }

  const cliente = {
    id: nextId(db.clientes),
    source: "local",
    nome,
    cpf,
    email,
    telefone,
    regiao: "Nordeste",
    pontos: 50,
    nivel: "Bronze"
  };

  const user = {
    id: nextId(db.usuarios),
    nome,
    email,
    senha,
    perfil: "cliente",
    clienteId: cliente.id,
    tentativas: 0,
    bloqueadoAte: null,
    consentimentoLGPD: true,
    notificacoes: { email: true, sms: false, antecedencia: 3 }
  };

  db.clientes.push(cliente);
  db.usuarios.push(user);
  db.pontosHistorico.unshift({
    id: nextId(db.pontosHistorico),
    clienteId: cliente.id,
    pontos: 50,
    motivo: "Cadastro na plataforma",
    data: new Date().toISOString().slice(0, 10)
  });

  saveDB(db);
  addLog("Cadastro", `Novo consorciado cadastrado: ${email}`);

  msg.textContent = "Conta criada com sucesso. Você já pode fazer login.";
  msg.className = "form-msg ok";
}
