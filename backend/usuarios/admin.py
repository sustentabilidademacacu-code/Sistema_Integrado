from django.contrib import admin
from .models import Secretaria

# Isso diz ao Django para colocar a tabela no Painel Azul
admin.site.register(Secretaria)