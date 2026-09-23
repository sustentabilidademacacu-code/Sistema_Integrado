Cachoeiras de Macacu, 15 de setembro de 2026.
MEMORANDO Nº 071/2026
AO
ILMO. SR MICHAEL SOUZA
SECRETÁRIO DE COMUNICAÇÃO
ASSUNTO: Apresentação dos Parâmetros Técnicos e Diretrizes de Arquitetura do Sistema SMIIC para apoio em avaliações futuras.

Prezado Secretário,

Cumprimentando-o cordialmente, sirvo-me do presente para apresentar as diretrizes e requisitos técnicos estruturais do Sistema Municipal Integrado de Informações Climáticas (SMIIC), composto pelo Painel Web e Aplicativo Cidadão.

O objetivo deste documento é unicamente compartilhar o mapeamento técnico da arquitetura do sistema, servindo como material descritivo de apoio para as equipes administrativas e de Tecnologia da Informação (TI) nas futuras avaliações de infraestrutura e hospedagem, visando a transição do ambiente de testes para a operação definitiva.

1. OBJETIVO E ARQUITETURA DO SISTEMA
O SMIIC foi desenvolvido utilizando tecnologias modernas (Next.js e PostgreSQL) para integrar informações climáticas, mapas geográficos e recebimento de ocorrências da população. A arquitetura é centralizada: o Painel Web funciona como a plataforma de gestão administrativa e também como o "cérebro" (API) que se comunica diretamente com o Aplicativo Cidadão.

2. SITUAÇÃO ATUAL (AMBIENTE PROVISÓRIO)
Para dar celeridade ao desenvolvimento, o sistema foi implantado de forma provisória utilizando planos gratuitos de plataformas em nuvem: Vercel (para o código Web/API) e Supabase (para o Banco de Dados, Autenticação e armazenamento de fotos). No entanto, com o início do uso contínuo pela população e o tráfego gerado pelo aplicativo, as restrições e limites de processamento gratuitos destas plataformas serão esgotados rapidamente, causando inoperância.

3. DIRETRIZES E OPÇÕES PARA HOSPEDAGEM DEFINITIVA
Para que o sistema suporte o volume real de acessos com extrema segurança, mapeamos três cenários viáveis de infraestrutura. A escolha deverá considerar custo, políticas internas de pagamento e disponibilidade técnica da TI.

Cenário A: Assinaturas em Nuvem Descentralizada (Modelo Atual)
Consiste em manter a estrutura exatamente onde está, realizando o "upgrade" (assinatura) para os planos profissionais destas plataformas.
* Prós: Alta escalabilidade, segurança avançada, backups automáticos e zero necessidade de gerenciamento físico por parte da TI do Município. As plataformas lidam com tudo automaticamente.
* Contras: Cobrança internacional realizada em Dólar (USD), sujeita à variação cambial e impostos de transação via cartão de crédito.
* Custos Estimados: Plataforma Vercel (US$ 20,00 mensais) + Plataforma Supabase (US$ 25,00 mensais).

Cenário B: Hospedagem Unificada em Servidor Virtual (VPS)
Consiste em alugar uma única máquina virtual em um provedor de mercado (como Hostinger, Locaweb, ou DigitalOcean) e unificar todo o sistema dentro dela (Painel Web, API, Banco de Dados e Armazenamento de Imagens). 
* Prós: Custo mensal significativamente menor e centralizado. Provedores com forte presença no Brasil (como Hostinger e Locaweb) permitem pagamento em Real (BRL), com emissão de nota fiscal nacional e menor burocracia de faturamento.
* Contras: Exige configuração inicial do ambiente (instalação de dependências como Node.js e Docker) e manutenção periódica padrão por parte da equipe técnica.
* Custos Estimados: Dependendo do provedor, um servidor com 4 GB de Memória RAM e 50 GB de disco SSD atende perfeitamente à demanda, com custos variando entre R$ 50,00 e R$ 90,00 mensais.

Cenário C: Utilização de Infraestrutura Própria do Município
Caso o Município já possua um datacenter e servidores ociosos disponíveis internamente.
* Prós: Custo zero de mensalidade externa. Total controle, soberania e retenção local dos dados.
* Contras: Depende da disponibilidade de banda de internet constante no local e de ações diretas da TI interna (configuração de IP externo, apontamento de domínio, liberação de portas e rotinas de backup físico).
* Requisitos Técnicos: Uma máquina (física ou virtual) rodando Linux, com no mínimo 4 GB de Memória RAM, permissões para tecnologias Docker/Node.js e instalação de um banco PostgreSQL com extensão PostGIS. Todo o sistema que hoje está provisoriamente na nuvem seria exportado e migrado para esta máquina.

4. CONTAS INSTITUCIONAIS NAS LOJAS DE APLICATIVOS (Google e Apple)
Independentemente de onde o sistema ficará hospedado, a distribuição do Aplicativo Cidadão demanda atendimento às diretrizes globais das Lojas Oficiais, que exigem que a titularidade do aplicativo pertença formalmente ao Município de Cachoeiras de Macacu.

* Plataforma Android (Google Play): Abertura de uma conta institucional (Google Play Console), acompanhada de uma taxa de registro única vitalícia de aproximadamente US$ 25,00 dólares americanos.
* Plataforma iOS (Apple App Store): A Apple institui uma anuidade padrão de US$ 99,00 dólares americanos. No entanto, existe o programa "Apple Gov Fee Waiver" (Isenção de taxas para Governo). Para garantir a isenção, a Apple exige o envio do código internacional D-U-N-S associado ao CNPJ da Prefeitura. A liberação dessa conta costuma ser a etapa mais demorada do trâmite (2 a 4 semanas).

CONCLUSÃO
Espera-se que as informações aqui consolidadas sirvam como referencial técnico para auxiliar os respectivos departamentos na tomada de decisões, orçamentos e na formatação de eventuais trâmites administrativos internos. A arquitetura modular do SMIIC garante flexibilidade total para operar com máxima eficiência em qualquer um dos cenários adotados.

Sendo o que cumpria relatar, coloco-me à disposição para maiores esclarecimentos técnicos sobre o funcionamento do código e da plataforma, bem como para o apoio na eventual migração ou configuração definitiva do ambiente escolhido.

Atenciosamente,

PAULO SCHIAVO JUNIOR
SECRETÁRIO MUNICIPAL DE SUSTENTABILIDADE, CLIMA, RECURSOS HÍDRICOS E PROJETOS ESTRATÉGICOS
