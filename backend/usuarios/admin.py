from django.contrib import admin
from .models import Secretaria, PerfilUsuario, SolicitacaoAcesso

admin.site.register(Secretaria)
admin.site.register(PerfilUsuario)
admin.site.register(SolicitacaoAcesso)