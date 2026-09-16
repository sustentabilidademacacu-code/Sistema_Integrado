import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from usuarios.models import Secretaria

sec = Secretaria.objects.filter(nome__icontains='Obras').first()
if sec:
    sec.cor_identidade = '#2563eb' # Blue 600 (Unmistakable Blue, good contrast)
    sec.save()
print("Cor de Obras atualizada no DB.")
