import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from usuarios.models import Secretaria

for s in Secretaria.objects.all():
    print(f"{s.nome} - {s.cor_identidade}")
