# DOSSIÊ TÉCNICO: ARQUITETURA E FLUXOS (SISTEMA DE INTELIGÊNCIA CLIMÁTICA)
**Município de Cachoeiras de Macacu - Preparação El Niño e Gestão Preventiva**

Este documento detalha a arquitetura tecnológica do Sistema Municipal Integrado de Inteligência Climática, projetado para operar com baixo custo de infraestrutura, alta tolerância a falhas e total adequação à realidade operacional das Secretarias Municipais.

---

## PÁGINA 1: CONTEXTO GERAL E BLINDAGEM
Toda a cidade (do Prefeito ao Cidadão) utiliza a **mesma plataforma**. O que muda é o nível de acesso. O núcleo opera via Motor de Regras e Matriz de Vulnerabilidade (MMVC), garantindo a blindagem operacional das secretarias e gestão baseada em dados reais.

```mermaid
flowchart TD
    classDef unificado fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#000000;
    classDef sistema fill:#fff3e0,stroke:#e65100,stroke-width:3px,color:#000000;
    classDef fontes fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000000;

    APP["📱 Super App Municipal (Web/Mobile)\nUma única interface de entrada para toda a cidade"]:::unificado

    subgraph SYS [" "]
        CORE{"SISTEMA CLIMÁTICO CENTRAL\n(Motor de Regras, MMVC e Banco Geográfico PostGIS)"}:::sistema
    end

    EST["📡 Dados Observacionais\n(Estações Exaclima)"]:::fontes
    EXT["🌍 Sensoriamento e Previsão\n(CEMADEN, INPE, INEA)"]:::fontes

    APP <-->|Login e Navegação Dinâmica| CORE
    EST --> CORE
    EXT --> CORE
```

---

## PÁGINA 2: O ROTEAMENTO DE TELAS (ACESSO ÚNICO)
Nós temos 1 só aplicativo. Quando o usuário faz login, a API verifica sua identidade e molda a interface. Servidores usam Matrícula; cidadãos usam cadastro comum (gov.br ou e-mail).

```mermaid
flowchart TD
    classDef portal fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000000;
    classDef tela fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#000000;
    classDef master fill:#ffebee,stroke:#c62828,stroke-width:3px,color:#000000;

    PORTAL{"Acesso Único\n(Login Central)"}:::portal

    CAD_CID["Cadastro Cidadão\n(Cidadão Comum)"] --> PORTAL
    CAD_SERV["Cadastro Servidor\n(Validação por Matrícula)"] --> PORTAL

    PORTAL -->|Perfil: Cidadão| TELA_POP["Tela Pública\n- Botão 'Avisar Ocorrência'\n- Avisos da Defesa Civil"]:::tela
    
    PORTAL -->|Perfil: Servidor| TELA_SEC["Tela Setorial (Ex: Obras, Sustentabilidade)\n- Gestão de Vulnerabilidades (MMVC)\n- Atualização de Ocorrências"]:::tela
    
    PORTAL -->|Perfil: Prefeito/Defesa Civil| TELA_PREF["Visão Master (Sala de Situação)\n- Mapa Global com Mapas de Calor\n- Mudança do Nível Operacional (0 a 4)"]:::master
```

---

## PÁGINA 3: A TRÍADE CLIMÁTICA (TOLERÂNCIA A FALHAS DE SENSORES)
O sistema não depende apenas das 14 estações físicas locais. Para evitar um "apagão de dados" caso as estações fiquem sem energia ou internet durante o desastre, o Motor de Regras utiliza três camadas de dados redundantes.

```mermaid
flowchart TD
    classDef hardware fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#000000;
    classDef remote fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000000;
    classDef predict fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000000;
    classDef logic fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000000;

    EXA["1. Estações Físicas (Exaclima)\nMedição exata do microclima local"]:::hardware
    CEM["2. Radar/Satélite (CEMADEN)\nVisão de cima, não cai sem luz"]:::remote
    INP["3. Modelos Preditivos (INMET/INPE)\nPrevisão futura de vendavais/calor"]:::predict

    MOTOR{"Motor de Regras Django\n(Failover Automático)"}:::logic

    EXA -- "Falhou / Offline" --> MOTOR
    MOTOR -. "Aciona Backup" .-> CEM
    
    INP -- "Aviso Antecipado" --> MOTOR
    
    MOTOR --> ALERTA["Geração de Alertas Prévios e Seguros"]
```

---

## PÁGINA 4: TOPOGRAFIA E INUNDAÇÕES (CÁLCULO DE CABECEIRA)
Cachoeiras de Macacu sofre com alagamentos nas planícies e lavouras causados por chuvas nas cabeceiras (Serra). O sistema cruza dados estáticos de declividade com telemetria de rios para avisar produtores rurais *antes* da água chegar.

```mermaid
flowchart LR
    classDef geo fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#000000;
    classDef calc fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000000;

    DEM["Mapa de Declividade 3D\n(INPE/NASA - Topodata)"]:::geo
    RIO["Fluviômetros em Tempo Real\n(Rio Macacu - INEA/ANA)"]:::geo
    
    DEM --> POSTGIS[("Banco Geográfico\n(PostGIS)")]
    RIO --> POSTGIS
    
    POSTGIS --> CALC{"Cálculo de Tempo\nde Concentração"}:::calc
    
    CALC --> PROD["Aviso Antecipado de Inundação\npara Áreas Rurais/Planícies"]
```

---

## PÁGINA 5: INTELIGÊNCIA PASSIVA E MAPAS DE CALOR (O REALISMO OPERACIONAL)
Entendendo os limites operacionais da Prefeitura (falta de viaturas na Saúde/Defesa Animal), o sistema cadastra dados sensíveis (Idosos Acamados, Animais) não para obrigar resgates utópicos, mas como **Inteligência Passiva (Business Intelligence)** para o Prefeito solicitar ajuda Estadual ou Federal com embasamento estatístico.

```mermaid
flowchart TD
    classDef db fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#000000;
    classDef heat fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#000000;
    classDef aid fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#000000;

    CAD_MMVC[("Cadastro MMVC\n- Onde estão os Idosos/Acamados?\n- Áreas de Foco de Dengue")]:::db
    
    CAD_MMVC --> MAPA["Mapa de Calor na\nSala de Situação (God View)"]:::heat
    
    MAPA --> PREF{"Decisão Estratégica do Prefeito\n(Sem onerar secretarias locais)"}:::heat
    
    PREF --> EXERCITO["Solicitação Baseada em Dados:\n'Precisamos de Barcos dos Bombeiros\npara 45 acamados na Região X'"]:::aid
```

---

## PÁGINA 6: FLUXO DE VULNERABILIDADES E OCORRÊNCIAS
A visão do Cidadão é blindada. Ele usa um formulário guiado, o sistema cruza com a Matriz de Vulnerabilidade (MMVC), gera a Prioridade Oficial (P1 a P5) e despacha.

```mermaid
sequenceDiagram
    autonumber
    actor POP as App (Logado como Cidadão)
    participant SYS as Motor de Regras (Backend)
    participant DC as App (Visão Master/Defesa Civil)
    participant SEC as App (Visão Servidor/Secretaria)

    POP->>SYS: Preenche Categoria + Foto e GPS
    
    rect rgb(243, 229, 245)
    SYS->>SYS: Cruza GPS com Inventário MMVC e gera Prioridade Oficial (P1 a P5)
    SYS->>POP: Responde: "Registro recebido pela Prefeitura." (Blindado)
    end
    
    SYS->>DC: Alerta P1 no Mapa Master da Defesa Civil
    DC->>SYS: Operador no Mapa Master VALIDA o envio
    
    SYS->>SEC: Tarefa de prioridade aparece no Painel Web da Secretaria
    SEC->>SYS: Servidor resolve o problema
    
    SYS->>POP: Notifica celular do cidadão: "Ocorrência Concluída."
```

---

## PÁGINA 7: FLUXO DE EMISSÃO DE ALERTAS MULTICANAL
O Prefeito ou a Defesa Civil alteram o Nível Operacional (0 a 4) e disparam uma única mensagem estruturada para todos os canais integrados.

```mermaid
flowchart TD
    classDef trigger fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#000000;
    classDef process fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#000000;
    classDef channel fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000000;

    DC["Visão Master (Altera Nível Operacional 0 a 4)"]:::trigger
    
    MSG["Montador de Mensagem Institucional\n(Informação clara e padronizada)"]:::process
    DC --> MSG
    
    MSG --> CH1["Aviso Push para cidadãos logados no App"]:::channel
    MSG --> CH2["Sirenes da Defesa Civil"]:::channel
    MSG --> CH3["Disparo SMS / WhatsApp"]:::channel
```

---

## PÁGINA 8: ARTICULAÇÃO ENTRE SECRETARIAS
Embora usem o mesmo banco, cada secretaria possui um layout focado em sua missão. Sustentabilidade e Obras operam a base de prevenção (MMVC).

```mermaid
flowchart TD
    classDef coord fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000000;
    classDef sec fill:#e8eaf6,stroke:#283593,stroke-width:2px,color:#000000;

    SALA["🛡️ Sala de Situação (Visão Master)"]:::coord
    
    subgraph Atuacao_Oculta ["Frentes de Trabalho (Visões Web Setoriais)"]
        direction TB
        SUST["🌳 Sustentabilidade (MMVC Árvores, Rios e Incêndios)"]:::sec
        OBRAS["🚜 Obras (Fila de Infraestrutura e Drenagem)"]:::sec
        EDUC["🏫 Educação (Controle Logístico de Abrigos)"]:::sec
    end
    
    SALA --> SUST & OBRAS & EDUC
    
    SUST & OBRAS & EDUC --> REG["Atualizam as ocorrências (P1-P5) no Banco"]:::coord
    REG --> SALA
```

---

## PÁGINA 9: O "WAZE CLIMÁTICO" (VISÃO DO CIDADÃO NO APP)
A interface simplificada e direta para a população relatar e acompanhar.

```mermaid
flowchart LR
    classDef pop fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000000;
    classDef app fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#000000;

    CIDA["🧑 Cidadão (Logado)"]:::pop
    
    subgraph Visao_App_Cidadao ["App Único: Modo Cidadão"]
        direction TB
        MAPA["Visualizar Mapa Público (Áreas Afetadas)"]:::app
        ALERTA["Receber Alertas Governamentais"]:::app
        OCORR["Enviar Ocorrência via Formulário"]:::app
        ACOMP["Ver Status: 'Em Andamento' (Blindado)"]:::app
    end
    
    CIDA --> MAPA & ALERTA & OCORR & ACOMP
```

---

## PÁGINA 10: DIAGRAMA DE ENTIDADES (ALINHADO ÀS LEIS MUNICIPAIS)
O banco de dados atende integralmente aos Capítulos 5 e 6 do Protocolo de Gestão Preventiva. Foram incluídos a `INVENTARIO_VULNERABILIDADE`, as Prioridades (`P1` a `P5`) e o `Nível Operacional`.

```mermaid
erDiagram
    SECRETARIA {
        uuid id PK
        string nome
    }
    USUARIO {
        uuid id PK
        string tipo_cadastro "cidadao | servidor"
        string matricula "Nulo se for cidadão"
        string perfil "master | obras | sustentabilidade | educacao"
        uuid secretaria_id FK "Nulo se for cidadão"
    }
    INVENTARIO_VULNERABILIDADE {
        uuid id PK
        uuid secretaria_id FK
        geometry localizacao "Point/Polygon"
        string categoria "Encosta, Árvore Risco, Acamado"
        string classe_vulnerabilidade "Crítica, Alta, Baixa..."
        string prioridade_acao "P1, P2, P3, P4, P5"
    }
    OCORRENCIA {
        uuid id PK
        uuid vulnerabilidade_id FK "Opcional (se da MMVC)"
        geometry localizacao "Point"
        string prioridade_acao "P1 a P5"
        string foto_storage_url "URL pública do R2"
        string status_publico "Ex: 'Em Atendimento'"
        string status_interno "Ex: 'Falta Maquinário'"
    }
    SISTEMA_ESTADO {
        int id PK
        string nivel_operacional "0, 1, 2, 3, 4"
        timestamp alterado_em
    }

    SECRETARIA ||--o{ USUARIO : lota
    SECRETARIA ||--o{ INVENTARIO_VULNERABILIDADE : "gerencia"
    USUARIO ||--o{ OCORRENCIA : "registra"
    INVENTARIO_VULNERABILIDADE ||--o{ OCORRENCIA : "evolui para"
```

---

## PÁGINA 11: INFRAESTRUTURA DE DADOS DE BAIXO CUSTO (ZERO GOOGLE/MICROSOFT)
Adequando-se à limitação orçamentária do município, a arquitetura utiliza soluções "Cloud Native" de altíssimo desempenho e custo praticamente zero para armazenamento, não dependendo de assinaturas do Google Workspace ou Office 365.

```mermaid
flowchart TD
    classDef front fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000000;
    classDef back fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#000000;
    classDef db fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000000;
    classDef cloud fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000000;

    subgraph Aplicativos ["Interfaces de Usuário"]
        APP["📱 Mobile App\n(Lojas Oficiais)"]:::front
        WEB["💻 Painéis Web Setoriais\n(Hospedagem em Borda / Vercel)"]:::front
    end

    subgraph Servidor Central ["Motor do Sistema"]
        API["⚙️ Backend Python/Django\n(Servidor Linux Baixo Custo)"]:::back
        EXCEL["📊 Exportador Nativo Excel\n(Django gera planilhas\nsob demanda para Secretários)"]:::back
        API --> EXCEL
    end

    subgraph Armazenamento ["Bancos de Dados"]
        SQL[("🐘 PostgreSQL/PostGIS\n(Textos e Mapas GPS)") ]:::db
        R2[("☁️ Cloudflare R2 Storage\n(Fotos pesadas do Cidadão.\n10GB grátis e ZERO taxa de download)") ]:::cloud
    end

    APP --> API
    WEB --> API
    
    API -- "Salva textos/coordenadas" --> SQL
    API -- "Salva mídias pesadas" --> R2
```

**Benefícios da Arquitetura Econômica:**
1. **Cloudflare R2 (S3) no lugar do Drive:** Armazenamento de classe empresarial idêntico à Amazon, mas gratuito até 10GB e sem custo por transferência de arquivos (egress fee). Mantém o banco relacional leve.
2. **Exportação Nativa no lugar do Sheets:** O próprio sistema tem um botão "Exportar" que baixa arquivos `.xlsx` oficiais para os secretários elaborarem relatórios de gestão, cortando totalmente a necessidade de licenças corporativas terceirizadas.
