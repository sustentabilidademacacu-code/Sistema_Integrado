import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from usuarios.models import Secretaria

sec = Secretaria.objects.filter(nome__icontains='Obras').first()
if sec:
    sec.cor_identidade = '#0369a1' # Sky 700 (Even darker)
    sec.save()
print("Cor de Obras escurecida novamente no DB.")
