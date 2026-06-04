(function(){
  function ensureMaterialSymbols(){
    if (document.querySelector('link[data-khon-material]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:FILL@0..1';
    link.setAttribute('data-khon-material','true');
    document.head.appendChild(link);
  }

  function injectStyles(){
    if (document.getElementById('khon-chat-widget-style')) return;
    const style = document.createElement('style');
    style.id = 'khon-chat-widget-style';
    style.textContent = `
      .khon-chat-fab{position:fixed;right:24px;bottom:24px;z-index:9999;width:72px;height:72px;border-radius:24px;border:1px solid rgba(255,255,255,.7);background:linear-gradient(135deg,#0a84c8,#1e3a8a);box-shadow:0 18px 45px rgba(10,80,140,.32);display:grid;place-items:center;cursor:pointer;transition:.2s ease}
      .khon-chat-fab:hover{transform:translateY(-3px) scale(1.03)}
      .khon-chat-fab img{width:48px;height:48px;object-fit:cover;filter:drop-shadow(0 4px 12px rgba(0,0,0,.18))}
      .khon-chat-panel{position:fixed;right:24px;bottom:100px;z-index:9999;width:min(420px,calc(100vw - 28px));height:min(620px,calc(100vh - 130px));background:rgba(255,255,255,.97);border:1px solid #cce8f4;border-radius:24px;box-shadow:0 24px 70px rgba(15,23,42,.24);display:none;overflow:hidden;font-family:'Segoe UI',system-ui,sans-serif}
      .khon-chat-panel.open{display:flex;flex-direction:column}
      .khon-chat-head{background:linear-gradient(135deg,#0a84c8,#1e3a8a);color:white;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px}
      .khon-chat-head-main{display:flex;align-items:center;gap:12px}
      .khon-chat-head-icon{width:42px;height:42px;border-radius:14px;background:rgba(255,255,255,.13);display:grid;place-items:center;border:1px solid rgba(255,255,255,.18)}
      .khon-chat-head-icon img{width:30px;height:30px;object-fit:cover}
      .khon-chat-head strong{display:block;font-size:1rem}.khon-chat-head span{display:block;font-size:.78rem;opacity:.78}
      .khon-chat-close{display:grid;place-items:center;background:rgba(255,255,255,.15);color:white;border:0;border-radius:10px;width:40px;height:40px;cursor:pointer}
      .khon-chat-close .material-symbols-outlined,.khon-chat-input button .material-symbols-outlined{font-size:22px;font-variation-settings:'FILL' 0,'wght' 500,'GRAD' 0,'opsz' 24}
      .khon-chat-body{flex:1;padding:15px;background:#f7fbff;overflow:auto}.khon-msg{padding:11px 13px;border-radius:16px;margin:0 0 10px;line-height:1.45;font-size:.9rem}.khon-msg.bot{background:white;border:1px solid #d7e3ef;color:#0f172a}.khon-msg.user{background:#1e3a8a;color:white;margin-left:auto;max-width:84%}
      .khon-chat-actions{padding:12px;border-top:1px solid #d7e3ef;display:flex;flex-wrap:wrap;gap:8px;background:white}.khon-chip{border:1px solid #cce8f4;background:#edf6ff;color:#0f2f65;border-radius:999px;padding:8px 10px;font-weight:700;font-size:.78rem;cursor:pointer}
      .khon-chat-input{display:flex;gap:8px;padding:12px;background:white;border-top:1px solid #d7e3ef}.khon-chat-input input{flex:1;border:1px solid #d7e3ef;border-radius:12px;padding:11px;outline:none}.khon-chat-input button{display:grid;place-items:center;border:0;border-radius:12px;width:48px;min-width:48px;background:#0a84c8;color:white;font-weight:800;cursor:pointer}
      @media(max-width:640px){.khon-chat-fab{right:16px;bottom:16px}.khon-chat-panel{right:14px;bottom:88px;height:min(600px,calc(100vh - 108px))}}
    `;
    document.head.appendChild(style);
  }

  function answer(text){
    const q = String(text || '').toLowerCase();
    if (q.includes('inadimpl') || q.includes('atras')) return 'O KhonFácil combate inadimplência centralizando dados, priorizando cotas críticas por risco e oferecendo autonegociação 24h via chatbot.';
    if (q.includes('dashboard') || q.includes('bi') || q.includes('painel')) return 'O Dashboard Executivo consolida 100.000 registros do relatório, exibindo inadimplência, recuperação, atraso médio, performance de assessorias, risco regional e remuneração variável.';
    if (q.includes('assessor')) return 'As assessorias são avaliadas por taxa de recuperação, eficiência financeira, taxa de insucesso, atraso médio e score composto. Novas assessorias locais também passam a refletir no painel BI.';
    if (q.includes('ipca') || q.includes('incc') || q.includes('reajuste')) return 'A simulação de reajuste usa IPCA ou INCC como índice de referência, mostrando saldo antes, percentual aplicado e saldo reajustado de forma simples.';
    if (q.includes('pix') || q.includes('cart')) return 'No MVP, Pix e cartão são simulados no fluxo do chatbot. Em produção, a integração seria feita por APIs REST com gateways de pagamento.';
    if (q.includes('fidel')) return 'O programa de fidelidade registra pontos por comportamento adimplente, negociação concluída e configurações ativas, exibindo saldo, nível e histórico no painel do cliente.';
    if (q.includes('lgpd') || q.includes('seguran')) return 'A solução considera LGPD, controle de perfil, 2FA para administradores, logs de acesso e consentimento do usuário. Criptografia real depende de backend e infraestrutura.';
    if (q.includes('relatorio') || q.includes('export')) return 'Os relatórios permitem filtros por região e status, com exportação CSV/Excel e impressão em PDF refletindo os filtros aplicados.';
    return 'Posso ajudar com Dashboard BI, inadimplência, assessorias, cotas críticas, negociação, IPCA/INCC, fidelidade, relatórios, LGPD e navegação da plataforma.';
  }

  function addMsg(body, text, type){
    const div = document.createElement('div');
    div.className = 'khon-msg ' + type;
    div.innerHTML = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function init(){
    ensureMaterialSymbols();
    injectStyles();
    if (document.getElementById('khon-chat-fab')) return;
    const iconSrc = (location.pathname.includes('/pages/')) ? '../assets/img/khonia-bot.png' : 'assets/img/khonia-bot.png';
    const fab = document.createElement('button');
    fab.id = 'khon-chat-fab';
    fab.className = 'khon-chat-fab';
    fab.innerHTML = `<img src="${iconSrc}" alt="KhonIA">`;
    fab.title = 'Abrir assistente Khon Bot';

    const panel = document.createElement('section');
    panel.className = 'khon-chat-panel';
    panel.innerHTML = `
      <div class="khon-chat-head">
        <div class="khon-chat-head-main">
          <div class="khon-chat-head-icon"><img src="${iconSrc}" alt="KhonIA"></div>
          <div><strong>Khon Bot</strong><span>Assistente digital oficial da KhonFácil</span></div>
        </div>
        <button class="khon-chat-close" type="button"><span class="material-symbols-outlined">close</span></button>
      </div>
      <div class="khon-chat-body" id="khon-chat-body"></div>
      <div class="khon-chat-actions">
        <button class="khon-chip">O que o sistema resolve?</button>
        <button class="khon-chip">Como funciona o Dashboard BI?</button>
        <button class="khon-chip">Como simular IPCA/INCC?</button>
        <button class="khon-chip">Como funciona fidelidade?</button>
      </div>
      <form class="khon-chat-input"><input type="text" placeholder="Digite sua dúvida sobre a plataforma..."><button><span class="material-symbols-outlined">arrow_upward</span></button></form>
    `;
    document.body.appendChild(panel);
    document.body.appendChild(fab);

    const body = panel.querySelector('#khon-chat-body');
    addMsg(body, 'Olá! Sou o Khon Bot. Estou disponível em todas as telas para explicar a solução, o BI, as regras de negócio e o fluxo de negociação.', 'bot');
    fab.addEventListener('click', () => panel.classList.toggle('open'));
    panel.querySelector('.khon-chat-close').addEventListener('click', () => panel.classList.remove('open'));
    panel.querySelectorAll('.khon-chip').forEach(btn => btn.addEventListener('click', () => {
      addMsg(body, btn.textContent, 'user');
      addMsg(body, answer(btn.textContent), 'bot');
    }));
    panel.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      const input = panel.querySelector('input');
      const text = input.value.trim();
      if (!text) return;
      addMsg(body, text, 'user');
      input.value = '';
      setTimeout(() => addMsg(body, answer(text), 'bot'), 240);
    });
  }

  window.KhonChatWidget = { init };
  document.addEventListener('DOMContentLoaded', init);
})();
