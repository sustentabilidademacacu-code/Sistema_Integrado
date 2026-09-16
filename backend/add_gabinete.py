import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from usuarios.models import Secretaria

# Criar a Secretaria "Gabinete"
gabinete, created = Secretaria.objects.get_or_create(
    nome='Gabinete do Prefeito / Sala de Situação',
    defaults={'cor_identidade': '#fbbf24'} # Dourado/Gold
)

if not created:
    gabinete.cor_identidade = '#fbbf24'
    gabinete.save()

print("Gabinete criado/atualizado com sucesso!")
