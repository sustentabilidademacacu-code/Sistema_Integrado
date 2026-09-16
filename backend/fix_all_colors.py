import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from usuarios.models import Secretaria

# Dicionário de cores exatas (Tons escuros/saturados para bom contraste na UI)
colors = {
    'Defesa Civil': '#ea580c',          # Laranja 600
    'Obras Saneamento': '#2563eb',      # Azul 600
    'Assistencia Social': '#c026d3',    # Fuchsia 600 (Lilás/Rosa)
    'Sustentabilidade': '#0e7490',      # Ciano 700
    'Meio Ambiente': '#16a34a',         # Verde 600
    'Saúde': '#dc2626',                 # Vermelho 600
    'AMAE': '#0284c7',                  # Azul Celeste (Sky 600)
    'Agricultura': '#ca8a04',           # Amarelo 600
    'Infraestrutura Rural': '#78350f',  # Marrom
    'Vigilância': '#475569',            # Cinza
    'Educação': '#4f46e5',              # Indigo 600 (não pediu cor especifica, vou colocar Indigo)
    'Gabinete': '#fbbf24'               # Dourado
}

for sec in Secretaria.objects.all():
    updated = False
    for key, color in colors.items():
        if key.lower() in sec.nome.lower():
            sec.cor_identidade = color
            sec.save()
            updated = True
            print(f"Atualizado: {sec.nome} -> {color}")
            break
            
    if not updated:
        print(f"Mantido: {sec.nome} -> {sec.cor_identidade}")

# Remover duplicata de Assistência se existir uma curtinha
duplicata = Secretaria.objects.filter(nome='Assistência').first()
if duplicata:
    duplicata.delete()
    print("Duplicata 'Assistência' removida.")

