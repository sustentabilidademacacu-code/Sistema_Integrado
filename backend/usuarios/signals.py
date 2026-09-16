from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User, Group
from .models import SolicitacaoAcesso

@receiver(post_save, sender=SolicitacaoAcesso)
def criar_usuario_django(sender, instance, created, **kwargs):
    if instance.status == 'APROVADO':
        # Verifica se o usuario ja existe pelo email
        if not User.objects.filter(email=instance.email_institucional).exists():
            # Cria o usuario oficial do Django
            username = instance.email_institucional.split('@')[0]
            # Garante username unico
            if User.objects.filter(username=username).exists():
                username = f"{username}_{instance.id}"
                
            user = User.objects.create_user(
                username=username,
                email=instance.email_institucional,
                password=instance.senha_provisoria,
                first_name=instance.nome_completo.split()[0]
            )
            
            # Adiciona ao grupo da respectiva secretaria
            if instance.secretaria:
                grupo, _ = Group.objects.get_or_create(name=instance.secretaria.nome)
                user.groups.add(grupo)
