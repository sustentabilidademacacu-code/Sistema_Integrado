import psycopg2
import sys

# Corrige problemas de encoding de saída no terminal Windows
sys.stdout.reconfigure(encoding='utf-8')

HOST = 'aws-0-sa-east-1.pooler.supabase.com'
PORT = '6543'
DBNAME = 'postgres'
USER = 'postgres.oawsmfizeeabuipxekci'
PASSWORD = 'Sustentabilidadeclima2026@'

TABELAS_PARA_REMOVER = [
    'despachos',
    'solicitacao_acesso',
    'secretarias',
    'sistema_estado',
    'perfil_usuario',
    'ocorrencias',
    'vulnerabilidades_mmvc'
]

def limpar_banco():
    print("Iniciando limpeza do banco de dados (Remoção de tabelas ociosas)...")
    try:
        conn = psycopg2.connect(host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD)
        cur = conn.cursor()
        
        for tabela in TABELAS_PARA_REMOVER:
            print(f"Apagando tabela: {tabela}...")
            # Usa CASCADE para garantir que apaga mesmo com chaves estrangeiras
            cur.execute(f'DROP TABLE IF EXISTS "{tabela}" CASCADE;')
            
        conn.commit()
        print("\nLimpeza concluída com sucesso! O seu Supabase agora só contém os dados climáticos.")
        
        # Opcionalmente, mostrar as tabelas que sobraram:
        cur.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        """)
        sobraram = [row[0] for row in cur.fetchall()]
        print("\nTabelas restantes no banco de dados:")
        for t in sobraram:
            print(f" - {t}")
            
        conn.close()
    except Exception as e:
        print(f"Erro durante a limpeza: {e}")

if __name__ == '__main__':
    limpar_banco()
