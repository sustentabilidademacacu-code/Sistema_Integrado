from django.db import models

class EstacaoMeteorologica(models.Model):
    nome = models.CharField(max_length=150, help_text="Ex: Estação Escola Municipal X")
    latitude = models.DecimalField(max_digits=10, decimal_places=6)
    longitude = models.DecimalField(max_digits=10, decimal_places=6)
    ativa = models.BooleanField(default=True, help_text="Desmarque se a estação quebrar no meio da tempestade")

    class Meta:
        verbose_name = "Estação Meteorológica"
        verbose_name_plural = "Estações Meteorológicas"

    def __str__(self):
        return self.nome

class SistemaEstado(models.Model):
    # Aqueles níveis oficiais do seu protocolo!
    NIVEIS_CHOICES = [
        (0, 'Nível 0 - Normalidade'),
        (1, 'Nível 1 - Atenção'),
        (2, 'Nível 2 - Alerta'),
        (3, 'Nível 3 - Alerta Máximo'),
        (4, 'Nível 4 - Recuperação'),
    ]

    nivel_operacional = models.IntegerField(choices=NIVEIS_CHOICES, default=0)
    alterado_em = models.DateTimeField(auto_now=True)
    mensagem_alerta = models.TextField(null=True, blank=True, help_text="Mensagem que vai aparecer no celular de todos os cidadãos.")

    class Meta:
        verbose_name = "Controle de Nível (Prefeito)"
        verbose_name_plural = "Controle de Nível (Prefeito)"

    def __str__(self):
        return f"Status da Cidade: {self.get_nivel_operacional_display()}"