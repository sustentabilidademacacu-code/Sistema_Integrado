import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from usuarios.models import Secretaria

cores = {
    'Defesa Civil': '#f97316', # Laranja
    'Obras': '#38bdf8', # Azul Claro
    'Assistência': '#d946ef', # Lilás/Rosa
    'Sustentabilidade': '#06b6d4', # Ciano
    'Meio Ambiente': '#22c55e', # Verde
    'Saúde': '#ef4444', # Vermelho
    'AMAE': '#0ea5e9', # Azul Celeste
    'Agricultura': '#eab308', # Amarelo
    'Infraestrutura Rural': '#78350f', # Marrom
    'Vigilância Sanitária': '#64748b', # Cinza
}

# Criar caso não existam, ou atualizar
for nome, cor in cores.items():
    sec = Secretaria.objects.filter(nome__icontains=nome).first()
    if sec:
        sec.cor_identidade = cor
        sec.save()
    else:
        # Se não existe, vamos criar para já ter o banco populado bonitinho
        Secretaria.objects.create(nome=nome, cor_identidade=cor)

print("Cores atualizadas com sucesso!")
