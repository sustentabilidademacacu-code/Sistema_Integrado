import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from usuarios.models import Secretaria

sec = Secretaria.objects.filter(nome__icontains='Obras').first()
if sec:
    sec.cor_identidade = '#38bdf8' # Azul Claro (Original)
    sec.save()
print("Cor de Obras revertida no DB.")
