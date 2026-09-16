import uuid
from django.db import models
from django.contrib.auth.models import User

class PerfilUsuario(models.Model):
    TIPO_CHOICES = [
        ('CIDADAO', 'Cidadão'),
        ('SERVIDOR', 'Servidor Público'),
        ('GESTOR', 'Gestor (Secretário/Prefeito)'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='CIDADAO')
    secretaria = models.ForeignKey('Secretaria', on_delete=models.SET_NULL, null=True, blank=True, related_name='servidores')
    telefone = models.CharField(max_length=20, null=True, blank=True)

    class Meta:
        verbose_name = "Perfil de Usuário"
        verbose_name_plural = "Perfis de Usuários"

    def __str__(self):
        return f"{self.user.username} - {self.get_tipo_display()}"

class Secretaria(models.Model):
    # Usamos UUID (letras e números) como ID por ser mais seguro
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome = models.CharField(max_length=150, verbose_name="Nome da Secretaria")
    cor_identidade = models.CharField(max_length=20, default="#022888", verbose_name="Cor de Identidade (Hex)")
    
    # Novos campos estruturais para Articulação Intersetorial
    sigla = models.CharField(max_length=20, null=True, blank=True, verbose_name="Sigla")
    telefone_plantao = models.CharField(max_length=50, null=True, blank=True, verbose_name="Telefone de Plantão (24h)")
    email_oficial = models.EmailField(null=True, blank=True, verbose_name="E-mail Oficial")
    
    nome_ponto_focal = models.CharField(max_length=150, null=True, blank=True, verbose_name="Nome do Ponto Focal")
    telefone_ponto_focal = models.CharField(max_length=50, null=True, blank=True, verbose_name="Telefone do Ponto Focal")
    
    recursos_estrategicos = models.TextField(null=True, blank=True, help_text="Ex: Caminhão pipa, abrigos, retroescavadeira")

    class Meta:
        verbose_name = "Secretaria"
        verbose_name_plural = "Secretarias"

    def __str__(self):
        return self.nome

class SolicitacaoAcesso(models.Model):
    STATUS_CHOICES = [
        ('PENDENTE', 'Pendente de Aprovação'),
        ('APROVADO', 'Aprovado'),
        ('REJEITADO', 'Rejeitado')
    ]
    
    nome_completo = models.CharField(max_length=150)
    email_institucional = models.EmailField()
    secretaria = models.ForeignKey(Secretaria, on_delete=models.CASCADE)
    senha_provisoria = models.CharField(max_length=128, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDENTE')
    data_solicitacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Solicitação de Acesso"
        verbose_name_plural = "Solicitações de Acesso"
        ordering = ['-data_solicitacao']

    def __str__(self):
        return f"{self.nome_completo} - {self.status}"