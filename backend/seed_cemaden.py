import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from clima.models import EstacaoMeteorologica, LeituraEstacao

# 1. Limpar estações antigas
print("Limpando dados fictícios...")
EstacaoMeteorologica.objects.all().delete()

# 2. Criar Estações reais/realistas
estacoes = [
    {
        "nome": "CEMADEN - Pluviômetro Cabeceira (Nova Friburgo)",
        "latitude": -22.2867, 
        "longitude": -42.5341,
        "ativa": True
    },
    {
        "nome": "ANA - Estação Fluviométrica (Boca do Mato)",
        "latitude": -22.4215, 
        "longitude": -42.6050,
        "ativa": True
    },
    {
        "nome": "CEMADEN - Régua Rio Macacu (Centro)",
        "latitude": -22.4647, 
        "longitude": -42.6533,
        "ativa": True
    },
    {
        "nome": "Defesa Civil - Alerta Papucaia (Baixada)",
        "latitude": -22.5800, 
        "longitude": -42.7100,
        "ativa": True
    },
    {
        "nome": "INEA - Monitoramento Rio Guapiaçu (Área Rural)",
        "latitude": -22.4450, 
        "longitude": -42.7450,
        "ativa": True
    }
]

for est_data in estacoes:
    est = EstacaoMeteorologica.objects.create(**est_data)
    chuva = 0.0
    nivel = 1.2 if 'Régua' in est.nome or 'Fluviométrica' in est.nome or 'Monitoramento' in est.nome else None
    
    LeituraEstacao.objects.create(
        estacao=est,
        chuva_mm=chuva,
        nivel_rio_metros=nivel,
        temperatura_c=26.5
    )
print("Integração concluída com sucesso.")
