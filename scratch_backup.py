import psycopg2
import csv
import os
import sys

# Corrige problemas de encoding de emojis/acentos no console do Windows
sys.stdout.reconfigure(encoding='utf-8')

# Parametros de conexao via IPv4 Pooler
HOST = 'aws-1-sa-east-1.pooler.supabase.com'
PORT = '6543'
DBNAME = 'postgres'
USER = 'postgres.qdslaorkcjshhkutmulm'
PASSWORD = 'Sustentabilidadeclima2026@'
OUTPUT_DIR = r'C:\Users\adrie\Sistema_Integrado\Data'

print("Iniciando backup do Supabase (IPv4 Pooler)...")

try:
    conn = psycopg2.connect(
        host=HOST,
        port=PORT,
        dbname=DBNAME,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()
    
    # Busca todas as tabelas do usuário
    cur.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
    """)
    tables = [row[0] for row in cur.fetchall()]
    
    if not tables:
        print("Nenhuma tabela encontrada no schema public.")
    else:
        print(f"Encontradas {len(tables)} tabelas: {', '.join(tables)}")
    
    for table in tables:
        print(f"\n--- Exportando a tabela: {table} ---")
        csv_path = os.path.join(OUTPUT_DIR, f"{table}.csv")
        
        cur.execute(f'SELECT * FROM "{table}"')
        colnames = [desc[0] for desc in cur.description]
        
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(colnames)
            
            row_count = 0
            while True:
                # Busca em lotes para não estourar a memória RAM do computador
                rows = cur.fetchmany(50000)
                if not rows:
                    break
                writer.writerows(rows)
                row_count += len(rows)
                
                # Feedback a cada 50k registros
                print(f"  ... salvos {row_count} registros em {table}.")
                
        print(f"Total: {row_count} registros exportados para {table}.csv")
        
    cur.close()
    conn.close()
    print("\nBackup de todas as tabelas concluido com sucesso!")
    
except Exception as e:
    print(f"\nErro ao fazer backup: {e}")
