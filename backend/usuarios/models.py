import uuid
from django.db import models

class Secretaria(models.Model):
    # Usamos UUID (letras e números) como ID por ser mais seguro
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome = models.CharField(max_length=150, verbose_name="Nome da Secretaria")

    class Meta:
        verbose_name = "Secretaria"
        verbose_name_plural = "Secretarias"

    def __str__(self):
        return self.nome