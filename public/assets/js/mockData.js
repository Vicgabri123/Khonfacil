window.KHONFACIL_SEED = {
  usuarios: [
    {
      id: 1,
      nome: "Administrador Demo",
      email: "admin@khonfacil.com",
      senha: "Admin@123",
      perfil: "admin",
      tentativas: 0,
      bloqueadoAte: null,
      consentimentoLGPD: true,
      notificacoes: { email: true, sms: false, antecedencia: 5 }
    },
    {
      id: 2,
      nome: "Maria Souza",
      email: "cliente@khonfacil.com",
      senha: "Cliente@123",
      perfil: "cliente",
      clienteId: 1,
      tentativas: 0,
      bloqueadoAte: null,
      consentimentoLGPD: true,
      notificacoes: { email: true, sms: true, antecedencia: 3 }
    }
  ],

  clientes: [
    { id: 1, source: "demo", nome: "Maria Souza", cpf: "123.456.789-00", email: "cliente@khonfacil.com", telefone: "(81) 99999-0001", regiao: "Nordeste", pontos: 360, nivel: "Ouro" },
    { id: 2, source: "demo", nome: "João Silva", cpf: "555.222.111-00", email: "joao@exemplo.com", telefone: "(81) 98888-1111", regiao: "Sudeste", pontos: 90, nivel: "Bronze" },
    { id: 3, source: "demo", nome: "Ana Paula", cpf: "444.333.222-10", email: "ana@exemplo.com", telefone: "(81) 97777-2222", regiao: "Sul", pontos: 210, nivel: "Prata" },
    { id: 4, source: "demo", nome: "Carlos Lima", cpf: "333.222.111-99", email: "carlos@exemplo.com", telefone: "(81) 96666-3333", regiao: "Norte", pontos: 40, nivel: "Bronze" }
  ],

  assessorias: [
    { id: 1, source: "demo", nome: "ACERTA CRÉDITO INTEGRADO", regiao: "Nordeste", taxaRecuperacao: 34.8, eficienciaFinanceira: 0.91, insucesso: 15.6, score: 66.2, comissao: 6.0 },
    { id: 2, source: "demo", nome: "NEXUS MEDIAÇÃO FINANCEIRA", regiao: "Sudeste", taxaRecuperacao: 33.55, eficienciaFinanceira: 1.01, insucesso: 14.35, score: 49.8, comissao: 4.5 },
    { id: 3, source: "demo", nome: "VÉRTICE ASSET & COBRANÇA", regiao: "Sul", taxaRecuperacao: 33.91, eficienciaFinanceira: 0.86, insucesso: 15.61, score: 20.7, comissao: 3.0 },
    { id: 4, source: "demo", nome: "FÊNIX RECUPERAÇÃO DE CRÉDITO", regiao: "Norte", taxaRecuperacao: 33.59, eficienciaFinanceira: 0.91, insucesso: 16.16, score: 11.7, comissao: 3.0 }
  ],

  cotas: [
    { id: 1, source: "demo", clienteId: 1, grupo: "G001", cota: "015", regiao: "Nordeste", assessoriaId: 1, bemEntregue: true, valorCredito: 72000, saldoDevedor: 18500, parcelasAtrasadas: 4, diasAtraso: 126, status: "EM ABERTO", vencimento: "2026-06-12" },
    { id: 2, source: "demo", clienteId: 1, grupo: "G001", cota: "016", regiao: "Nordeste", assessoriaId: 1, bemEntregue: false, valorCredito: 52000, saldoDevedor: 6500, parcelasAtrasadas: 1, diasAtraso: 18, status: "EM ABERTO", vencimento: "2026-06-20" },
    { id: 3, source: "demo", clienteId: 2, grupo: "G002", cota: "081", regiao: "Sudeste", assessoriaId: 2, bemEntregue: true, valorCredito: 89000, saldoDevedor: 33000, parcelasAtrasadas: 6, diasAtraso: 171, status: "AJUIZADO", vencimento: "2026-06-18" },
    { id: 4, source: "demo", clienteId: 3, grupo: "G003", cota: "024", regiao: "Sul", assessoriaId: 3, bemEntregue: false, valorCredito: 68000, saldoDevedor: 7800, parcelasAtrasadas: 0, diasAtraso: 0, status: "ADIMPLENTE", vencimento: "2026-07-02" },
    { id: 5, source: "demo", clienteId: 4, grupo: "G004", cota: "112", regiao: "Norte", assessoriaId: 4, bemEntregue: true, valorCredito: 94000, saldoDevedor: 22000, parcelasAtrasadas: 3, diasAtraso: 92, status: "EM ABERTO", vencimento: "2026-06-25" }
  ],

  pagamentos: [
    { id: 1, source: "demo", clienteId: 3, cotaId: 4, valor: 1450, data: "2026-05-20", vencimento: "2026-06-20", status: "PAGO" },
    { id: 2, source: "demo", clienteId: 1, cotaId: 2, valor: 1200, data: null, vencimento: "2026-06-20", status: "PENDENTE" },
    { id: 3, source: "demo", clienteId: 1, cotaId: 1, valor: 18500, data: null, vencimento: "2026-06-12", status: "PENDENTE" },
    { id: 4, source: "demo", clienteId: 2, cotaId: 3, valor: 33000, data: null, vencimento: "2026-06-18", status: "PENDENTE" }
  ],

  negociacoes: [
    { id: 1, source: "demo", clienteId: 1, cotaId: 1, valorOriginal: 18500, desconto: 12, entrada: 1200, parcelas: 6, valorFinal: 16280, canal: "Chatbot", status: "SIMULADA", criadoEm: "2026-06-01T10:00:00" }
  ],

  pontosHistorico: [
    { id: 1, source: "demo", clienteId: 1, pontos: 120, motivo: "Pagamento em dia", data: "2026-05-20" },
    { id: 2, source: "demo", clienteId: 1, pontos: 80, motivo: "Cadastro de notificações", data: "2026-05-28" },
    { id: 3, source: "demo", clienteId: 1, pontos: 160, motivo: "Renegociação concluída", data: "2026-06-01" }
  ],

  logs: []
};
