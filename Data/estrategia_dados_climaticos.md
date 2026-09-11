# ESTRATÉGIA DE INGESTÃO DE DADOS (TOLERÂNCIA A FALHAS)

Para que Cachoeiras de Macacu não sofra um "apagão de dados" durante a queda de energia ou internet causada pelo El Niño, o Motor de Regras do sistema utilizará uma **Tríade de Fontes de Dados**. 

Se a Camada 1 falhar, a Camada 2 assume automaticamente. Se a gestão precisa se antecipar, a Camada 3 entra em ação.

---

### CAMADA 1: A VERDADE DE CHÃO (Microclima)
**Fonte:** Estações Físicas IoT (Exaclima nas Escolas)
* **O que mede:** Passado e Presente Exato (UV, Temp, PM10, Pluviômetro, Vento, etc).
* **Vantagem:** Precisão absoluta do microclima daquele bairro específico. Útil para calibrar os alertas daquele setor e medir qualidade do ar (fumaça de incêndio com PM2.5).
* **Vulnerabilidade:** Se acabar a luz, a internet, ou se um pássaro/vento mexer no sensor, o dado para de chegar ou chega corrompido. Possui vários "pontos cegos" (áreas da cidade sem estação).

### CAMADA 2: O SENSORIAMENTO REMOTO (O Olho no Céu)
**Fontes (Gratuitas):** Radares do **CEMADEN** (Centro Nacional de Monitoramento e Alertas de Desastres Naturais) e **REDEMET** (Rede de Meteorologia do Comando da Aeronáutica).
* **O que mede:** Presente e curtíssimo prazo (*Nowcasting*).
* **Vantagem:** O Radar e o Satélite (GOES-16) olham o município de cima. Se a energia da escola cair, o radar continua vendo que existe uma nuvem gigantesca despejando 60mm de chuva exatamente em cima do bairro X.
* **Uso no Sistema:** Se a API da Exaclima parar de responder por 15 minutos, o Motor de Regras do Django muda para "Modo Radar" e passa a calcular o risco de alagamento baseado na imagem de refletividade do CEMADEN.

### CAMADA 3: O MODELO PREDITIVO (Antecipação)
**Fontes (Gratuitas/Abertas):** **INMET** (Instituto Nacional de Meteorologia), **CPTEC/INPE** e APIs de previsão global (como **Open-Meteo** ou **OpenWeatherMap**).
* **O que mede:** Futuro (Probabilidade de chuva, ventania severa, ondas de calor para as próximas horas e dias).
* **Vantagem:** É o que permite o Prefeito apertar o botão de Alerta *antes* da desgraça acontecer. Modelos matemáticos dizem "90% de chance de rajadas de 80km/h às 17h".
* **Uso no Sistema:** O motor do sistema cruza a *previsão* de ventos do INPE com a *Matriz de Vulnerabilidade* (onde estão as árvores velhas?) e gera alertas (P2/P3) para a Secretaria de Sustentabilidade mandar podar **um dia antes** do vento chegar.

---

## O FLUXO DE FAILOVER (Prevenção contra o Apagão)

O código rodando no backend seguirá a seguinte lógica ininterrupta:

1. **A cada 10 minutos:** O sistema pede a medição de chuva para a Estação Escola X.
2. **Cenário A (Tudo Certo):** A estação responde: "Choveu 40mm". O sistema avisa: Nível de Atenção na bacia X.
3. **Cenário B (Queda da Estação):** O sistema pede o dado, e dá *Timeout* (estação sem luz/offline).
4. **Acionamento do Radar:** O sistema avisa o painel: `"Sensor Escola X Offline. Alternando para Radar CEMADEN"`. O backend consulta a malha de radar nas coordenadas daquela escola, extrai o volume de chuva estimado pelo céu, e dispara o alerta mesmo com a escola no escuro.
