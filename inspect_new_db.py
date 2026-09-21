import psycopg2
import sys

# Corrige problemas de encoding de saída no terminal Windows
sys.stdout.reconfigure(encoding='utf-8')

HOST = 'aws-0-sa-east-1.pooler.supabase.com'
PORT = '6543'
DBNAME = 'postgres'
USER = 'postgres.oawsmfizeeabuipxekci'
PASSWORD = 'Sustentabilidadeclima2026@'

try:
    conn = psycopg2.connect(host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
    """)
    tables = [row[0] for row in cur.fetchall()]
    
    print("--- ESTRUTURA DO BANCO DE DADOS (NOVO PROJETO SMIIC) ---")
    if not tables:
        print("Nenhuma tabela encontrada no schema public.")
        
    for t in tables:
        cur.execute(f"""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = '{t}'
        """)
        columns = cur.fetchall()
        print(f"\nTabela: {t}")
        for col in columns:
            print(f"  - {col[0]} ({col[1]})")
            
        cur.execute(f'SELECT count(*) FROM "{t}"')
        print(f"  [Total de registros: {cur.fetchone()[0]}]")
        
    conn.close()
except Exception as e:
    print(f"Erro ao conectar: {e}")
