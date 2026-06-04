const DB_KEY = "khonfacil_db_v2";
const SESSION_KEY = "khonfacil_session_v2";
const PENDING_2FA_KEY = "khonfacil_pending_2fa_v2";

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function initDB() {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify(clone(window.KHONFACIL_SEED)));
  }
}

function resetDB() {
  localStorage.setItem(DB_KEY, JSON.stringify(clone(window.KHONFACIL_SEED)));
}

function getDB() {
  initDB();
  return JSON.parse(localStorage.getItem(DB_KEY));
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function nextId(items) {
  return items.length ? Math.max(...items.map(item => Number(item.id) || 0)) + 1 : 1;
}

function addLog(acao, detalhe) {
  const db = getDB();
  db.logs.unshift({
    id: nextId(db.logs),
    acao,
    detalhe,
    data: new Date().toISOString()
  });
  saveDB(db);
}

function fmtBRL(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function fmtDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("pt-BR");
}

function calcularRisco(cota) {
  let score = 0;
  if (cota.bemEntregue) score += 30;
  score += Math.min(Number(cota.diasAtraso || 0) / 180 * 35, 35);
  score += Math.min(Number(cota.parcelasAtrasadas || 0) * 7, 28);
  if (String(cota.status).toUpperCase() === "AJUIZADO") score += 12;
  score = Math.min(Math.round(score), 100);

  let faixa = "Baixo";
  if (score >= 70) faixa = "Alto";
  else if (score >= 40) faixa = "Médio";

  return { score, faixa };
}

function badgeClass(texto) {
  const v = String(texto || "").toLowerCase();
  if (v.includes("alto") || v.includes("ajuizado") || v.includes("aberto")) return "danger";
  if (v.includes("médio") || v.includes("medio") || v.includes("simulada") || v.includes("pendente")) return "warning";
  if (v.includes("baixo") || v.includes("pago") || v.includes("conclu") || v.includes("adimplente")) return "success";
  return "info";
}

function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    userId: user.id,
    perfil: user.perfil,
    clienteId: user.clienteId || null,
    loginAt: Date.now(),
    lastActive: Date.now()
  }));
}

function destroySession() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "../index.html";
}

function currentUser() {
  const session = getSession();
  if (!session) return null;
  return getDB().usuarios.find(u => u.id === session.userId) || null;
}

function currentCliente() {
  const user = currentUser();
  if (!user) return null;

  const db = getDB();

  if (user.clienteId) {
    const clienteVinculado = db.clientes.find(c => Number(c.id) === Number(user.clienteId));
    if (clienteVinculado) return clienteVinculado;
  }

  const clientePorEmail = db.clientes.find(c =>
    String(c.email || "").toLowerCase() === String(user.email || "").toLowerCase()
  );

  if (clientePorEmail) {
    const usuarioPersistido = db.usuarios.find(u => Number(u.id) === Number(user.id));
    if (usuarioPersistido) {
      usuarioPersistido.clienteId = clientePorEmail.id;
      saveDB(db);
    }

    const session = getSession();
    if (session) {
      session.clienteId = clientePorEmail.id;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    return clientePorEmail;
  }

  return null;
}

function requireAuth(allowedRoles) {
  initDB();
  const session = getSession();

  if (!session) {
    window.location.href = "../index.html";
    return null;
  }

  const now = Date.now();
  const inactiveMs = now - Number(session.lastActive || now);
  const maxInactive = 30 * 60 * 1000;

  if (inactiveMs > maxInactive) {
    localStorage.removeItem(SESSION_KEY);
    alert("Sessão encerrada por inatividade de 30 minutos.");
    window.location.href = "../index.html";
    return null;
  }

  if (allowedRoles && allowedRoles.length && !allowedRoles.includes(session.perfil)) {
    alert("Acesso bloqueado: seu perfil não possui permissão para esta tela.");
    window.location.href = session.perfil === "admin" ? "dashboard.html" : "perfil.html";
    return null;
  }

  session.lastActive = now;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function startInactivityWatcher() {
  setInterval(() => {
    const session = getSession();
    if (!session) return;
    const inactiveMs = Date.now() - Number(session.lastActive || Date.now());
    const warningMs = 25 * 60 * 1000;
    const maxInactive = 30 * 60 * 1000;

    if (inactiveMs > maxInactive) {
      localStorage.removeItem(SESSION_KEY);
      alert("Sessão encerrada por inatividade.");
      window.location.href = "../index.html";
    } else if (inactiveMs > warningMs && !session.warned) {
      session.warned = true;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      alert("Aviso: sua sessão será encerrada em 5 minutos se continuar inativa.");
    }
  }, 60000);
}

["click", "keydown", "mousemove", "scroll"].forEach(evt => {
  window.addEventListener(evt, () => {
    const session = getSession();
    if (!session) return;
    session.lastActive = Date.now();
    session.warned = false;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }, { passive: true });
});

function getClienteCotas(clienteId) {
  return getDB().cotas.filter(c => Number(c.clienteId) === Number(clienteId));
}

function registrarPontuacao(clienteId, pontos, motivo) {
  const db = getDB();
  const cliente = db.clientes.find(c => Number(c.id) === Number(clienteId));
  if (!cliente) return;

  cliente.pontos = Number(cliente.pontos || 0) + Number(pontos || 0);
  cliente.nivel = cliente.pontos >= 500 ? "Diamante" : cliente.pontos >= 300 ? "Ouro" : cliente.pontos >= 150 ? "Prata" : "Bronze";

  db.pontosHistorico.unshift({
    id: nextId(db.pontosHistorico),
    clienteId: cliente.id,
    pontos,
    motivo,
    data: new Date().toISOString().slice(0, 10)
  });

  saveDB(db);
}

initDB();

function getTemaAtual() {
  return localStorage.getItem("khonfacil_tema") || "claro";
}

function aplicarTema(tema) {
  const temaFinal = tema || getTemaAtual();

  document.body.classList.remove("theme-light", "theme-dark");

  if (temaFinal === "escuro") {
    document.body.classList.add("theme-dark");
  } else {
    document.body.classList.add("theme-light");
  }

  localStorage.setItem("khonfacil_tema", temaFinal);
}

function alternarTema(tema) {
  aplicarTema(tema);
}