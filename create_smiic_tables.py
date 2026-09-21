import psycopg2
import sys

sys.stdout.reconfigure(encoding='utf-8')

HOST = 'aws-0-sa-east-1.pooler.supabase.com'
PORT = '6543'
DBNAME = 'postgres'
USER = 'postgres.oawsmfizeeabuipxekci'
PASSWORD = 'Sustentabilidadeclima2026@'

DDL = """
-- Habilita UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Secretarias (Secretarias municipais que atenderão as ocorrências)
CREATE TABLE IF NOT EXISTS secretarias (
  id uuid primary key default uuid_generate_v4(),
  nome varchar(150) not null,
  cor_identidade varchar(20) default '#022888',
  sigla varchar(20),
  telefone_plantao varchar(50),
  email_oficial varchar(255),
  nome_ponto_focal varchar(150),
  telefone_ponto_focal varchar(50),
  recursos_estrategicos text
);

-- Sistema de estado (Nível operacional do município - N0 a N5)
CREATE TABLE IF NOT EXISTS sistema_estado (
  id uuid primary key default uuid_generate_v4(),
  nivel_operacional varchar(10) not null,
  mensagem text,
  atualizado_em timestamptz default now()
);

-- Despachos (Ordem de serviço para uma secretaria ir até uma ocorrência)
CREATE TABLE IF NOT EXISTS despachos (
  id uuid primary key default uuid_generate_v4(),
  ocorrencia_id uuid,
  secretaria_id uuid references secretarias(id),
  estado varchar(20) default 'aberta',
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Solicitações de acesso (Formulário para funcionários pedirem acesso ao painel)
CREATE TABLE IF NOT EXISTS solicitacao_acesso (
  id uuid primary key default uuid_generate_v4(),
  nome_completo varchar(150) not null,
  email_institucional varchar(255) not null,
  secretaria_id uuid references secretarias(id),
  senha_provisoria varchar(128),
  status varchar(20) default 'PENDENTE',
  data_solicitacao timestamptz default now()
);

-- Perfil de usuário (Extensão do sistema de login de Auth do Supabase)
CREATE TABLE IF NOT EXISTS perfil_usuario (
  id uuid primary key default uuid_generate_v4(),
  auth_uid uuid references auth.users(id) on delete cascade,
  tipo varchar(20) default 'CIDADAO',
  secretaria_id uuid references secretarias(id),
  telefone varchar(20)
);

-- Tabela Ocorrências (Para vincularmos os despachos aos chamados da população)
CREATE TABLE IF NOT EXISTS ocorrencias (
  id uuid primary key default uuid_generate_v4(),
  titulo varchar(255),
  descricao text,
  latitude double precision,
  longitude double precision,
  prioridade varchar(20) default 'Media',
  status varchar(20) default 'Aberta',
  criado_em timestamptz default now()
);
"""

try:
    print("Conectando ao banco para criar tabelas do SMIIC...")
    conn = psycopg2.connect(host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD)
    cur = conn.cursor()
    cur.execute(DDL)
    conn.commit()
    conn.close()
    print("Tabelas adicionais do SMIIC criadas com sucesso!")
except Exception as e:
    print(f"Erro ao criar tabelas: {e}")
