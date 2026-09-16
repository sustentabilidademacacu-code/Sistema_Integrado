import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from usuarios.models import SolicitacaoAcesso
from usuarios.signals import criar_usuario_django

aprovados = SolicitacaoAcesso.objects.filter(status='APROVADO')
count = 0
for req in aprovados:
    criar_usuario_django(sender=SolicitacaoAcesso, instance=req, created=False)
    count += 1
print(f"{count} usuarios checados/criados no Django Auth.")
