# Decisão Arquitetural: Cards de Clima

**Data:** 24/09/2026

**Decisão:** Os cards exibindo temperatura, umidade e vento na sidebar do Painel Operacional foram removidos temporariamente.

**Motivação:** A integração com a planilha do Google Sheets estava instável. Para evitar dados inconsistentes no front-end, a exibição direta desses dados foi aposentada por enquanto.

**Novo Fluxo:** A visualização na sidebar foca apenas no **Índice de Risco de Incêndio Florestal (IRIF)**. Para ver detalhes completos de clima, o usuário deve clicar no selo do IRIF que abrirá o dashboard completo da HexaCloud.
