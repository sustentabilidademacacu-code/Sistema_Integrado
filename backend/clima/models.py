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

class LeituraEstacao(models.Model):
    estacao = models.ForeignKey(EstacaoMeteorologica, on_delete=models.CASCADE, related_name='leituras')
    data_hora = models.DateTimeField(auto_now_add=True, help_text="Momento exato em que a leitura chegou")
    chuva_mm = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Volume de chuva em mm")
    nivel_rio_metros = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Nível do rio em metros")
    temperatura_c = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    
    class Meta:
        verbose_name = "Leitura da Estação"
        verbose_name_plural = "Leituras das Estações"
        ordering = ['-data_hora']

    def __str__(self):
        return f"{self.estacao.nome} - {self.data_hora.strftime('%d/%m/%Y %H:%M')}"

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