import psycopg2

HOST = 'aws-1-sa-east-1.pooler.supabase.com'
PORT = '6543'
DBNAME = 'postgres'
USER = 'postgres.qdslaorkcjshhkutmulm'
PASSWORD = 'Sustentabilidadeclima2026@'

try:
    conn = psycopg2.connect(host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD)
    cur = conn.cursor()
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
    tables = [row[0] for row in cur.fetchall()]
    
    print(f"Tabelas no schema public ({len(tables)}):")
    for t in tables:
        cur.execute(f'SELECT count(*) FROM "{t}"')
        count = cur.fetchone()[0]
        print(f" - {t}: {count} linhas")
        
    conn.close()
except Exception as e:
    print(f"Erro de conexão: {e}")
