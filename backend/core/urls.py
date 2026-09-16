from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Importando todas as portas que você criou!
from usuarios.views import SecretariaViewSet, SolicitacaoAcessoViewSet, mvp_login
from ocorrencias.views import InventarioVulnerabilidadeViewSet, OcorrenciaViewSet
from clima.views import EstacaoMeteorologicaViewSet, SistemaEstadoViewSet, LeituraEstacaoViewSet

router = DefaultRouter()
router.register(r'secretarias', SecretariaViewSet)
router.register(r'solicitacoes-acesso', SolicitacaoAcessoViewSet)
router.register(r'vulnerabilidades-mmvc', InventarioVulnerabilidadeViewSet)
router.register(r'ocorrencias', OcorrenciaViewSet)
router.register(r'estacoes-meteorologicas', EstacaoMeteorologicaViewSet)
router.register(r'sistema-estado', SistemaEstadoViewSet)
router.register(r'leituras-estacoes', LeituraEstacaoViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/mvp-login/', mvp_login, name='mvp_login'),
]