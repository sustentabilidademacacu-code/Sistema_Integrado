const { Client } = require('pg');

async function seed() {
  const client = new Client({
    connectionString: 'postgresql://postgres.kheeajpqhwlyaqdsyvtn:Sustentabilidadeclima2026%40@aws-0-sa-east-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log('Inserindo conjunto completo de ocorrencias demonstrativas para todos os paineis...');

  const ocorrenciasDemo = [
    // 1. DEFESA CIVIL - CRÍTICA (Pendente)
    {
      categoria: 'Risco de Deslizamento',
      descricao: 'Talude instável com rachaduras no solo após chuvas intensas na parte alta. Risco iminente para 2 residências.',
      bairro: 'Castália',
      logradouro: 'Rua das Flores',
      numero: '142',
      prioridade_acao: 'CRÍTICA',
      status: 'Pendente',
      status_publico: 'Pendente',
      latitude: -22.464200,
      longitude: -42.651500,
      secretaria_id: '22222222-2222-2222-2222-222222222222', // Defesa Civil
      cidadao_nome: 'Adrielly Souza',
      cidadao_telefone: '21988047777',
      data_registro: new Date(Date.now() - 1000 * 60 * 35).toISOString() // 35 min atrás
    },
    // 2. DEFESA CIVIL - ALTA (Em Atendimento)
    {
      categoria: 'Alagamento',
      descricao: 'Transbordamento parcial de córrego bloqueando acesso à via principal. Nível da água subindo rapidamente.',
      bairro: 'Papucaia',
      logradouro: 'Avenida Macacu',
      numero: '510',
      prioridade_acao: 'ALTA',
      status: 'Em Atendimento',
      status_publico: 'Em Atendimento',
      latitude: -22.492100,
      longitude: -42.715200,
      secretaria_id: '22222222-2222-2222-2222-222222222222', // Defesa Civil
      cidadao_nome: 'Carlos Eduardo Mendes',
      cidadao_telefone: '21987654321',
      data_registro: new Date(Date.now() - 1000 * 60 * 120).toISOString()
    },
    // 3. SUSTENTABILIDADE & CLIMA - ALTA (Pendente)
    {
      categoria: 'Queda de Árvore',
      descricao: 'Árvore de grande porte tombou sobre a fiação elétrica e canaleta pluvial, represando água da chuva.',
      bairro: 'Sede (Centro / Cachoeiras)',
      logradouro: 'Rua Manoel Pereira',
      numero: '88',
      prioridade_acao: 'ALTA',
      status: 'Pendente',
      status_publico: 'Pendente',
      latitude: -22.461800,
      longitude: -42.654100,
      secretaria_id: '55555555-5555-5555-5555-555555555555', // Sustentabilidade
      cidadao_nome: 'Adrielly Souza',
      cidadao_telefone: '21988047777',
      data_registro: new Date(Date.now() - 1000 * 60 * 75).toISOString()
    },
    // 4. SUSTENTABILIDADE & CLIMA - MÉDIA (Concluído com Parecer Técnico)
    {
      categoria: 'Assoreamento de Rio',
      descricao: 'Acúmulo de sedimentos e galhadas no leito do rio próximo à ponte do Guapiaçu.',
      bairro: 'Guapiaçu',
      logradouro: 'Estrada do Guapiaçu',
      numero: 'S/N',
      prioridade_acao: 'MÉDIA',
      status: 'Concluido',
      status_publico: 'Resolvido',
      latitude: -22.478500,
      longitude: -42.678900,
      secretaria_id: '55555555-5555-5555-5555-555555555555', // Sustentabilidade
      cidadao_nome: 'Marcos Vinicius Lima',
      cidadao_telefone: '21971122334',
      parecer_tecnico: 'Vistoria técnica realizada pela equipe ambiental. Efetuada a desobstrução mecânica do fluxo hídrico com remoção de 4 toneladas de biomassa e galhos retidos.',
      resolvido_por_nome: 'Eng. Roberto Alves',
      resolvido_por_email: 'roberto.alves@sistema.local',
      equipe_responsavel: 'Equipe de Recursos Hídricos / Viatura Amb-01',
      resolvido_em: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      data_registro: new Date(Date.now() - 1000 * 60 * 480).toISOString()
    },
    // 5. OBRAS E SANEAMENTO - ALTA (Pendente)
    {
      categoria: 'Rompimento de Drenagem',
      descricao: 'Galeria pluvial rompeu com a força das águas, causando afundamento de asfalto e cratera na calçada.',
      bairro: 'Japuíba',
      logradouro: 'Rua Coronel Pereira',
      numero: '230',
      prioridade_acao: 'ALTA',
      status: 'Pendente',
      status_publico: 'Pendente',
      latitude: -22.481200,
      longitude: -42.693400,
      secretaria_id: '33333333-3333-3333-3333-333333333333', // Obras
      cidadao_nome: 'Juliana Ferreira Ramos',
      cidadao_telefone: '21992233445',
      data_registro: new Date(Date.now() - 1000 * 60 * 90).toISOString()
    },
    // 6. OBRAS E SANEAMENTO - MÉDIA (Concluído)
    {
      categoria: 'Desobstrução de Bueiro',
      descricao: 'Bueiro entupido com lixo e areia impedindo escoamento da água pluvial.',
      bairro: 'Maraporã',
      logradouro: 'Rua Projetada A',
      numero: '45',
      prioridade_acao: 'MÉDIA',
      status: 'Concluido',
      status_publico: 'Resolvido',
      latitude: -22.455600,
      longitude: -42.648200,
      secretaria_id: '33333333-3333-3333-3333-333333333333', // Obras
      cidadao_nome: 'Adrielly Souza',
      cidadao_telefone: '21988047777',
      parecer_tecnico: 'Executada a hidrojateamento e sucção do ramal de drenagem. Vazão restabelecida a 100%.',
      resolvido_por_nome: 'Mestre Gilberto Santos',
      resolvido_por_email: 'gilberto.santos@sistema.local',
      equipe_responsavel: 'Caminhão Vac-All / Equipe Saneamento 03',
      resolvido_em: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      data_registro: new Date(Date.now() - 1000 * 60 * 600).toISOString()
    },
    // 7. INFRAESTRUTURA RURAL - CRÍTICA (Pendente)
    {
      categoria: 'Ponte Rural Abalada',
      descricao: 'Cabeceira de ponte de madeira danificada após cheia do rio. Risco de isolamento de 30 produtores rurais.',
      bairro: 'Funchal',
      logradouro: 'Estrada do Funchal Velho',
      numero: 'Km 4',
      prioridade_acao: 'CRÍTICA',
      status: 'Pendente',
      status_publico: 'Pendente',
      latitude: -22.435000,
      longitude: -42.625000,
      secretaria_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', // Infraestrutura Rural
      cidadao_nome: 'Antônio José Moreira',
      cidadao_telefone: '21981122990',
      data_registro: new Date(Date.now() - 1000 * 60 * 45).toISOString()
    },
    // 8. AGRICULTURA - MÉDIA (Em Atendimento)
    {
      categoria: 'Perda de Lavoura por Granizo',
      descricao: 'Granizo e vendaval atingiram plantações de hortaliças. Solicitação de laudo técnico agronômico.',
      bairro: 'Valério',
      logradouro: 'Sítio Boa Esperança',
      numero: 'S/N',
      prioridade_acao: 'MÉDIA',
      status: 'Em Atendimento',
      status_publico: 'Em Atendimento',
      latitude: -22.448900,
      longitude: -42.662100,
      secretaria_id: '99999999-9999-9999-9999-999999999999', // Agricultura
      cidadao_nome: 'Sebastião Dias',
      cidadao_telefone: '21994455667',
      data_registro: new Date(Date.now() - 1000 * 60 * 180).toISOString()
    },
    // 9. ASSISTÊNCIA SOCIAL - ALTA (Em Atendimento)
    {
      categoria: 'Desabrigo por Enxurrada',
      descricao: 'Família com 4 crianças precisando de acolhimento e mantimentos após invasão de lama na residência.',
      bairro: 'Ribeira',
      logradouro: 'Travessa Santa Luzia',
      numero: '12',
      prioridade_acao: 'ALTA',
      status: 'Em Atendimento',
      status_publico: 'Em Atendimento',
      latitude: -22.467800,
      longitude: -42.658900,
      secretaria_id: '44444444-4444-4444-4444-444444444444', // Assistência Social
      cidadao_nome: 'Maria de Fátima Couto',
      cidadao_telefone: '21983344556',
      data_registro: new Date(Date.now() - 1000 * 60 * 150).toISOString()
    },
    // 10. SAÚDE - ALTA (Pendente)
    {
      categoria: 'Infiltração em Posto de Saúde',
      descricao: 'Goteiras e infiltração na sala de vacinas da UBS após temporal, colocando em risco estoque de insumos.',
      bairro: 'Boa Vista',
      logradouro: 'Rua da Saúde',
      numero: '100',
      prioridade_acao: 'ALTA',
      status: 'Pendente',
      status_publico: 'Pendente',
      latitude: -22.471500,
      longitude: -42.645500,
      secretaria_id: '77777777-7777-7777-7777-777777777777', // Saúde
      cidadao_nome: 'Drª. Camila Vasconcelos',
      cidadao_telefone: '21982233119',
      data_registro: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    },
    // 11. VIGILÂNCIA SANITÁRIA - BAIXA (Concluído)
    {
      categoria: 'Acúmulo de Água Parada',
      descricao: 'Terreno baldio com descarte irregular de pneus e carcaças acumulando água de chuva.',
      bairro: 'São José da Boa Morte',
      logradouro: 'Rua Principal',
      numero: 'Lt 14',
      prioridade_acao: 'BAIXA',
      status: 'Concluido',
      status_publico: 'Resolvido',
      latitude: -22.508900,
      longitude: -42.731200,
      secretaria_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', // Vigilância Sanitária
      cidadao_nome: 'Lucas Barreto',
      cidadao_telefone: '21975566778',
      parecer_tecnico: 'Vistoria in loco. Proprietário notificado e realizada aplicação de larvicida e remoção dos pneus para descarte ambiental correto.',
      resolvido_por_nome: 'Agente Sanitário Paulo Ramos',
      resolvido_por_email: 'paulo.ramos@sistema.local',
      equipe_responsavel: 'Equipe Zoonoses 01',
      resolvido_em: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
      data_registro: new Date(Date.now() - 1000 * 60 * 1440).toISOString()
    },
    // 12. EDUCAÇÃO - MÉDIA (Pendente)
    {
      categoria: 'Árvore em Risco no Pátio Escolar',
      descricao: 'Galho rachado com risco de queda sobre o pátio de recreação infantil.',
      bairro: 'Boca do Mato',
      logradouro: 'Rua da Escola Municipal',
      numero: '55',
      prioridade_acao: 'MÉDIA',
      status: 'Pendente',
      status_publico: 'Pendente',
      latitude: -22.429000,
      longitude: -42.618000,
      secretaria_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', // Educação
      cidadao_nome: 'Profª Helena Guimarães',
      cidadao_telefone: '21988776655',
      data_registro: new Date(Date.now() - 1000 * 60 * 110).toISOString()
    }
  ];

  for (const oco of ocorrenciasDemo) {
    await client.query(`
      INSERT INTO public.ocorrencias (
        categoria, descricao, bairro, logradouro, numero, prioridade_acao,
        status, status_publico, latitude, longitude, secretaria_id,
        cidadao_nome, cidadao_telefone, parecer_tecnico, resolvido_por_nome,
        resolvido_por_email, equipe_responsavel, resolvido_em, data_registro, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, $15,
        $16, $17, $18, $19, $20
      )
    `, [
      oco.categoria,
      oco.descricao,
      oco.bairro,
      oco.logradouro,
      oco.numero,
      oco.prioridade_acao,
      oco.status,
      oco.status_publico,
      oco.latitude,
      oco.longitude,
      oco.secretaria_id,
      oco.cidadao_nome,
      oco.cidadao_telefone,
      oco.parecer_tecnico || null,
      oco.resolvido_por_nome || null,
      oco.resolvido_por_email || null,
      oco.equipe_responsavel || null,
      oco.resolvido_em || null,
      oco.data_registro,
      oco.data_registro
    ]);
  }

  const countRes = await client.query('SELECT COUNT(*) FROM public.ocorrencias');
  console.log(`Sucesso! Total de ocorrencias no banco agora: ${countRes.rows[0].count}`);

  await client.end();
}

seed().catch(console.error);
