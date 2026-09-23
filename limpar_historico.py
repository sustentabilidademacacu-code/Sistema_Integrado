import psycopg2
import sys

sys.stdout.reconfigure(encoding='utf-8')

HOST = 'aws-0-sa-east-1.pooler.supabase.com'
PORT = '6543'
DBNAME = 'postgres'
USER = 'postgres.oawsmfizeeabuipxekci'
PASSWORD = 'Sustentabilidadeclima2026@'

TABELAS = [
    'leituras_clima_historico_irif',
    'log_execucoes'
]

def limpar_historico():
    print("Iniciando esvaziamento das tabelas de histórico...")
    try:
        conn = psycopg2.connect(host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD)
        cur = conn.cursor()
        
        for tabela in TABELAS:
            print(f"Esvaziando tabela: {tabela}...")
            # TRUNCATE esvazia a tabela instantaneamente
            cur.execute(f'TRUNCATE TABLE "{tabela}" RESTART IDENTITY CASCADE;')
            
        conn.commit()
        print("\nHistórico apagado com sucesso! Espaço liberado no Supabase.")
        
        for tabela in TABELAS:
            cur.execute(f'SELECT count(*) FROM "{tabela}"')
            print(f"[{tabela}] Registros atuais: {cur.fetchone()[0]}")
            
        conn.close()
    except Exception as e:
        print(f"Erro durante a limpeza: {e}")

if __name__ == '__main__':
    limpar_historico()
