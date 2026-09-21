# ESTRATÉGIA DE INGESTÃO DE DADOS (TOLERÂNCIA A FALHAS E MONITORAMENTO CONTÍNUO)

Para que Cachoeiras de Macacu não sofra um "apagão de dados" durante a queda de energia ou internet, o Motor de Regras do SMIIC utilizará uma **Tríade de Fontes de Dados**. 

Se a Camada 1 falhar, a Camada 2 assume automaticamente. Se a gestão precisa se antecipar, a Camada 3 entra em ação.

---

### CAMADA 1: A VERDADE DE CHÃO (Microclima e Pluviometria Local)
**Fontes Físicas IoT:** 
1. Estações da Rede Exaclima (Escolas Municipais) consumidas via API do Supabase.
2. Pluviômetros e Fluviômetros Nacionais/Estaduais (CEMADEN, INEA, ANA).
* **O que mede:** Passado e Presente Exato (Temperatura, Umidade, Vento, Volume de Chuva, Nível dos Rios).
* **Vantagem:** Precisão absoluta do microclima e rios de cada bairro. Fundamental para calcular o IRIF (Índice de Risco de Incêndio Florestal) e decretar evacuação ribeirinha (Alerta Máximo - Nível 3).
* **Vulnerabilidade:** Sujeito a quedas de energia (nas escolas) ou vandalismo. Possui "pontos cegos".

### CAMADA 2: O SENSORIAMENTO REMOTO (O Olho no Céu)
**Fontes (Gratuitas):** Radares meteorológicos do **CEMADEN** e **REDEMET** (Comando da Aeronáutica).
* **O que mede:** Presente e curtíssimo prazo (*Nowcasting*).
* **Vantagem:** O Radar e o Satélite (GOES-16) olham o município de cima. Se a energia da escola (Exaclima) cair, o radar continua vendo que existe uma célula de tempestade despejando chuva exatamente em cima do bairro.
* **Uso no Sistema:** Failover. Se a API da Exaclima parar de responder por 15 minutos, o Motor de Regras do Django muda para "Modo Radar" e estima a chuva através da imagem de refletividade.

### CAMADA 3: O MODELO PREDITIVO (Antecipação e Níveis Operacionais)
**Fontes (Gratuitas/Abertas):** **INMET**, **CPTEC/INPE** e APIs como **Open-Meteo**.
* **O que mede:** Futuro (Probabilidade de chuva extrema, ventania, ondas de calor).
* **Vantagem:** Permite ao Prefeito alterar a Matriz de Vulnerabilidade e os Níveis Operacionais (ex: elevar para Nível 2 - Alerta) *antes* da desgraça acontecer.
* **Uso no Sistema:** O motor do sistema cruza a *previsão* de ventos do INPE com as ocorrências de árvores vulneráveis mapeadas pelas secretarias, e gera despachos automáticos para poda preventiva.

---

## O FLUXO DE SINCRONIZAÇÃO E FAILOVER NO SUPABASE

A lógica ininterrupta rodando na nuvem substitui os antigos scripts Python (Django) por **Edge Functions** do Supabase acionadas via Cron/Webhooks:

1. **A cada 10/15 minutos (Edge Function em Cron):** O Supabase consome a API REST da rede municipal e do CEMADEN, insere os dados de Temperatura, Chuva, Vento e Nível de Rio nas tabelas do PostgreSQL e calcula o risco de incêndio (IRIF).
2. **Cenário A (Tudo Certo):** As estações respondem corretamente. O sistema injeta os dados na Matriz, e o frontend Next.js recebe o gatilho automático via Supabase Realtime para atualizar o mapa.
3. **Cenário B (Queda da Estação):** O script da Edge Function falha ao comunicar-se com o sensor ou a leitura é demasiadamente antiga (Timeout).
4. **Acionamento do Radar:** O sistema sinaliza o *Status* do sensor como inativo e emite um alerta no Painel do Gabinete para que passem a cruzar os dados visualmente através das fontes de Radar.
