# ESTRATÉGIA DE DADOS: TOPOGRAFIA, HIDROLOGIA E INCÊNDIOS

O Sistema Municipal Integrado de Inteligência Climática (SMIIC) precisa prever tanto a descida brutal das águas (inundações na planície) quanto o avanço rápido do fogo (incêndios florestais). O cruzamento georreferenciado no Leaflet/PostGIS é o coração do sistema.

Para isso, a base de dados cartográfica e ambiental cruza diversas camadas estáticas e dinâmicas:

## 1. DADOS ESTÁTICOS (Topografia e Bacias Hidrográficas)
Para saber *para onde* a água vai correr ou *quão rápido* o fogo vai subir um morro, usamos dados de relevo.

* **Modelo Digital de Elevação (MDE) e Declividade:** 
  * **Onde pegar:** Projeto **TOPODATA (INPE)** ou **SRTM (USGS/NASA)**. 
  * **Uso na Enchente:** O sistema desenha onde o terreno é íngreme (água desce rápido) e onde é bacia/planície (água acumula e alaga).
  * **Uso no Incêndio (IRIF):** O fogo avança muito mais rápido morro acima. A declividade é injetada na fórmula do IRIF junto com o tipo de vegetação.
* **Desenho das Bacias, Rios e GeoJSONs Municipais:**
  * **Fonte:** **ANA** (Base Hidrográfica Ottocodificada) e arquivos locais (Localidades.geojson e Bairros.geojson inseridos no frontend Next.js).
  * **Uso:** Mostra o traçado dos rios desembocando no Rio Macacu e as áreas habitadas (interface urbano-rural).

## 2. DADOS DINÂMICOS (Sensores e Telemetria em Tempo Real)
O sistema lê sensores em tempo real através de rotas Serverless e Edge Functions (Supabase).

* **Sistema de Alerta de Cheias (INEA/CEMADEN):** Sensores telemétricos (fluviômetros e pluviômetros) espalhados pelos rios Macacu, Guapiaçu, etc. Lidos via Edge Functions a cada 15 minutos para medir o volume real das calhas e popular o PostgreSQL no Supabase.
* **Rede Municipal Exaclima (Escolas):** Dados puxados diretamente da API Exaclima, trazendo vento, temperatura e umidade.

## 3. A INTELIGÊNCIA DO SISTEMA (Ação do Motor de Regras)

**CENÁRIO 1: Inundação (Ameaça Hídrica)**
1. **Monitoramento Upstream (Lá em cima):** O radar do CEMADEN ou a estação da ANA detecta chuva extrema (100mm) nas cabeceiras da Serra.
2. **Cálculo de Tempo:** As Edge Functions ou lógica do Next.js calculam o "Tempo de Concentração da Bacia" (quantas horas a água leva para chegar à planície de Papucaia).
3. **Alerta Antecipado:** Horas *antes* de o rio transbordar na cidade, a Sala de Situação (`/gabinete`) recebe o Alerta. O Prefeito eleva o Nível Operacional e aciona o plano de contingência, disparando viaturas para evacuar as áreas ribeirinhas mapeadas na MMVC.

**CENÁRIO 2: Fogo (Ameaça Florestal - IRIF)**
1. **Monitoramento do Microclima:** As escolas (Exaclima) registram 38°C de temperatura, umidade abaixo de 30% e 14 dias sem chuva na região.
2. **Cálculo de Vulnerabilidade (IRIF):** O sistema cruza esse clima seco com o fato de a escola estar ao lado de "Pastagem (Pecuária)" e em "Declividade Moderada".
3. **Alerta Crítico:** A pontuação atinge "N5 - Grave" e o ícone da escola no mapa brilha vermelho no painel. O Gabinete utiliza o botão "ACIONAR" e despacha a Secretaria de Meio Ambiente e a Defesa Civil para proibirem queimadas naquela região, antes que qualquer fagulha seja acesa.
