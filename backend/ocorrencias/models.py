import uuid
from django.db import models
from usuarios.models import Secretaria

class InventarioVulnerabilidade(models.Model):
    PRIORIDADE_CHOICES = [
        ('P1', 'P1 - Imediata (Emergência)'),
        ('P2', 'P2 - Alta (Risco Iminente)'),
        ('P3', 'P3 - Programada (Manutenção)'),
        ('P4', 'P4 - Acompanhamento Mensal'),
        ('P5', 'P5 - Observação Sazonal'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    secretaria_responsavel = models.ForeignKey(Secretaria, on_delete=models.SET_NULL, null=True, blank=True)
    categoria = models.CharField(max_length=150, help_text="Ex: Encosta, Árvore Podre, Bueiro Entupido")
    prioridade_acao = models.CharField(max_length=2, choices=PRIORIDADE_CHOICES)
    latitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    data_vistoria = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Vulnerabilidade (MMVC)"
        verbose_name_plural = "Inventário MMVC"

    def __str__(self):
        return f"[{self.prioridade_acao}] {self.categoria}"


class Ocorrencia(models.Model):
    STATUS_PUBLICO_CHOICES = [
        ('Recebido', 'Recebido pela Prefeitura'),
        ('Em Atendimento', 'Equipe em Deslocamento / Em Atendimento'),
        ('Concluido', 'Ocorrência Resolvida'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vulnerabilidade = models.ForeignKey(InventarioVulnerabilidade, on_delete=models.SET_NULL, null=True, blank=True)
    categoria = models.CharField(max_length=150, help_text="Ex: Árvore Caída na Pista, Alagamento")
    prioridade_acao = models.CharField(max_length=2, choices=InventarioVulnerabilidade.PRIORIDADE_CHOICES)
    latitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    foto_storage_url = models.URLField(max_length=500, null=True, blank=True, help_text="Link da foto no R2")
    status_publico = models.CharField(max_length=50, choices=STATUS_PUBLICO_CHOICES, default='Recebido')
    status_interno = models.CharField(max_length=255, null=True, blank=True, help_text="Ex: Aguardando motosserra.")
    localidade = models.CharField(max_length=100, null=True, blank=True)
    bairro = models.CharField(max_length=100, null=True, blank=True)
    logradouro = models.CharField(max_length=255, null=True, blank=True)
    numero = models.CharField(max_length=50, null=True, blank=True)
    descricao = models.TextField(null=True, blank=True)
    data_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Ocorrência (Desastre)"
        verbose_name_plural = "Ocorrências Abertas"

    def __str__(self):
        return f"{self.categoria} - {self.status_publico}"