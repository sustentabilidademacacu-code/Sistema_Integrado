# ESTRATÉGIA DE DADOS: TOPOGRAFIA E HIDROLOGIA (INUNDAÇÕES)

Para prever inundações em lavouras, áreas rurais e bairros históricos de Cachoeiras de Macacu, o Sistema Municipal não pode depender apenas da chuva local. Ele precisa calcular o fluxo de água que desce das cabeceiras (Serra) em direção à planície.

Para isso, o banco de dados geográfico (PostGIS) será alimentado por duas categorias de dados externos:

## 1. DADOS ESTÁTICOS (O Mapa do Relevo e Bacias)
Para saber *para onde* a água vai correr e *onde* ela vai empoçar, precisamos dos dados de Relevo (Declividade).

* **Modelo Digital de Elevação (MDE) e Declividade:** 
  * **Onde pegar:** Projeto **TOPODATA (INPE)** ou **SRTM (USGS/NASA)**. 
  * **O que é:** Eles fornecem um mapa 3D gratuito do Brasil inteiro com resolução de 30 metros. Nós jogamos isso no nosso sistema, e ele desenha automaticamente onde é íngreme (água desce rápido) e onde é bacia/planície (água acumula e alaga).
* **Desenho das Bacias e Rios:**
  * **Onde pegar:** **Agência Nacional de Águas (ANA)** (Base Hidrográfica Ottocodificada) e **IBGE**.
  * **O que é:** Um arquivo (Shapefile) que tem o traçado exato de todos os rios grandes e pequenos de Cachoeiras de Macacu, e mostra exatamente de onde a água vem (os rios que desembocam no Rio Macacu).

## 2. DADOS DINÂMICOS (O Nível da Água em Tempo Real)
O sistema precisa de "Fluviômetros" (sensores que medem a altura da água do rio, e não a chuva do céu). A Prefeitura não precisa comprar todos eles, pois o Estado e a União já possuem sensores na bacia do Rio Guapi-Macacu.

* **Sistema de Alerta de Cheias do INEA-RJ:** O Governo do Estado possui estações telemétricas espalhadas pelos rios. O nosso Motor de Regras vai puxar (via API) o nível do Rio Macacu e seus afluentes a cada 15 minutos.
* **Rede Hidrometeorológica Nacional (ANA / CEMADEN):** Consultamos em tempo real os sensores localizados *antes* de Cachoeiras de Macacu (nas cabeceiras da Serra). 

## 3. A INTELIGÊNCIA DO SISTEMA (Como o Motor de Regras Salva as Lavouras)
Com esses dados integrados, a regra matemática do nosso software funcionará assim:

1. **Monitoramento Upstream (Lá em cima):** O radar do CEMADEN ou a estação da ANA detecta chuva extrema (100mm) em Nova Friburgo / Serra dos Órgãos.
2. **Cálculo de Tempo:** O sistema calcula que a água vai demorar "X horas" para descer a serra e chegar nas planícies de Cachoeiras de Macacu (Tempo de Concentração da Bacia).
3. **Identificação de Vulnerabilidade:** O sistema olha para o mapa de Declividade (Topodata) e identifica as lavouras e moradias que estão em áreas planas perto da calha do rio.
4. **Alerta Antecipado:** Horas *antes* de o rio transbordar na cidade, a Sala de Situação recebe o Alerta de Inundação. A Defesa Civil aciona o alerta no Super App para os produtores rurais tirarem animais das áreas baixas e moradores levantarem móveis, **mesmo que não esteja chovendo uma gota em Cachoeiras de Macacu naquele momento**.
