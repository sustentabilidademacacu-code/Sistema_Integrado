import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from usuarios.models import Secretaria

sec = Secretaria.objects.filter(nome__icontains='Sustentabilidade').first()
if sec:
    sec.cor_identidade = '#0e7490' # Cyan 700 (Escuro)
    sec.save()
print("Cor de Sustentabilidade atualizada no DB.")
