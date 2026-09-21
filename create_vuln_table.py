import psycopg2
import sys

sys.stdout.reconfigure(encoding='utf-8')

HOST = 'aws-0-sa-east-1.pooler.supabase.com'
PORT = '6543'
DBNAME = 'postgres'
USER = 'postgres.oawsmfizeeabuipxekci'
PASSWORD = 'Sustentabilidadeclima2026@'

DDL = """
CREATE TABLE IF NOT EXISTS vulnerabilidades_mmvc (
  id uuid primary key default uuid_generate_v4(),
  nome varchar(255) not null,
  descricao text,
  grau_risco varchar(50)
);

-- Inserir alguns valores default caso esteja vazia
INSERT INTO vulnerabilidades_mmvc (nome, grau_risco)
SELECT 'Área de Deslizamento', 'Alto'
WHERE NOT EXISTS (SELECT 1 FROM vulnerabilidades_mmvc WHERE nome = 'Área de Deslizamento');

INSERT INTO vulnerabilidades_mmvc (nome, grau_risco)
SELECT 'Área de Alagamento', 'Médio'
WHERE NOT EXISTS (SELECT 1 FROM vulnerabilidades_mmvc WHERE nome = 'Área de Alagamento');
"""

try:
    print("Conectando ao banco para criar tabela vulnerabilidades_mmvc...")
    conn = psycopg2.connect(host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD)
    cur = conn.cursor()
    cur.execute(DDL)
    conn.commit()
    conn.close()
    print("Tabela vulnerabilidades_mmvc criada com sucesso!")
except Exception as e:
    print(f"Erro ao criar tabela: {e}")
