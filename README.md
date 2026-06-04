# KhonFácil — Plataforma V2 para Banca

Versão integrada com o Dashboard Executivo aprovado, alimentado por agregações reais geradas a partir de `relatorio_consolidado.xlsx`.

## Como executar

1. Extraia o ZIP.
2. Abra `index.html` no navegador.
3. Use as credenciais:

### Administrador
- E-mail: `admin@khonfacil.com`
- Senha: `Admin@123`
- 2FA: `123456`

### Consorciado
- E-mail: `cliente@khonfacil.com`
- Senha: `Cliente@123`

## O que foi melhorado nesta versão

- `pages/dashboard.html` reaproveita o dashboard aprovado pela banca.
- Dashboard alimentado por `assets/js/dashboardData.js`, gerado do relatório consolidado.
- Novas assessorias e cotas cadastradas localmente passam a impactar o BI.
- Navegação vertical moderna em desktop/notebook/PC, com expansão por hover e botão para fixar/recolher.
- Chatbot global Khon Bot disponível em todas as páginas por botão flutuante.
- Relatórios, auditoria, cotas críticas, fidelidade e configurações continuam integrados por LocalStorage.

## Observação técnica

O sistema é um MVP acadêmico estático em HTML/CSS/JS. Integrações reais com APIs, e-mail, SMS, Pix/cartão, SSL/TLS e banco de dados devem entrar em uma versão backend futura.

## Versão V4 — refinamento visual para banca

- Logo oficial aplicada na tela inicial, navegação e chatbot.
- Fundo branco removido da logo para uso sobre fundo escuro.
- Favicon da marca gerado a partir do ícone.
- Material Symbols Outlined integrado por CDN.
- Ícones padronizados nas páginas principais, navegação e dashboard.
- Tela inicial refinada para notebooks e desktops, evitando corte vertical.
- Gráficos do Dashboard receberam altura responsiva para evitar cortes em telas menores.
- Animações leves de hover em cards, painéis, navegação e botões.

## Versão V5 — revisão visual completa + 2ª verificação da base

### Revisão visual
- Logo oficial atualizada a partir do recorte manual do usuário.
- Revisão do design das páginas secundárias com bloco de abertura padronizado.
- Sidebar, topbar, cards, tabelas e painéis com acabamento visual unificado.
- Hover refinado em links, botões, cards e painéis.
- Favicon atualizado com o ícone da marca.

### 2ª verificação da base consolidada
- 100.000 registros e 21 colunas confirmados.
- Dimensão da planilha verificada: A1:U100001.
- 0 duplicidades no campo ID_Pagamento.
- 27.357 valores nulos em Data_Pagamento, coerentes com pagamentos ainda não realizados.
- Intervalo de vencimento: 2025-01-01 até 2026-03-26.
- Intervalo de pagamento: 2024-12-27 até 2026-07-21.
- Status confirmados: EM ABERTO 40.146, ACORDO FIRMADO 33.914, INSUCESSO 15.516, AJUIZADO 10.424.
- Valor inadimplente consolidado: R$ 6.067.684.018,50.
- Valor recuperado consolidado: R$ 55.440.309,28.


## Versão V6 — refinamento final de marca
- Logo principal atualizada com a nova versão vetorizada/transparente enviada pelo usuário.
- Ícone K refinado para navegação, favicon e áreas reduzidas.
- Superfície clara aplicada na tela inicial para melhor legibilidade da marca.
- Imagem proprietária do KhonIA adicionada ao chatbot flutuante e à página do assistente.
- Revisão visual final da presença da marca no site.

## Atualização V7 — cadastro dinâmico e feedback visual
- Cadastro de novos consorciados agora cria usuário, cliente, cota demonstrativa e histórico inicial de pontos.
- Perfil do consorciado passa a carregar dinamicamente os dados da sessão atual.
- Telas de login, 2FA e cadastro receberam feedback visual com animação de conclusão.
- Tabelas de parcelas e fidelidade agora possuem estados vazios amigáveis.
- Reforço no vínculo entre usuário e cliente para evitar perfil fixo em conta demo.


## Versão V8 — validações finais
- Cadastro de assessorias com feedback visual/toast.
- Assessorias locais consideradas no Dashboard BI ao acessar/atualizar a tela.
- Contador de assessorias e perguntas de auditoria do dashboard tornados dinâmicos.
- Novo consorciado inicia com 0 pontos e nível Bronze, preservando regra de progressão por comportamento.


## V9 — Foco Khon Bot

Esta versão fortalece o Khon Bot para apresentação à banca:

- Botão "Demonstrar solução".
- Diagnóstico financeiro do consorciado.
- Respostas vinculadas aos requisitos RF05, RF06, RF07, RF08, RF09 e RN10.
- Protocolo de negociação e pagamento demonstrativo.
- Resumo do atendimento para auditoria e governança.
- Animação de "Khon Bot está analisando".
- Melhor explicação de IPCA/INCC e integração futura com gateway/API.
