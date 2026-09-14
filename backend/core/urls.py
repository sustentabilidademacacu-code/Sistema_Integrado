from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Importando todas as portas que você criou!
from usuarios.views import SecretariaViewSet
from ocorrencias.views import InventarioVulnerabilidadeViewSet, OcorrenciaViewSet
from clima.views import EstacaoMeteorologicaViewSet, SistemaEstadoViewSet

router = DefaultRouter()
router.register(r'secretarias', SecretariaViewSet)
router.register(r'vulnerabilidades-mmvc', InventarioVulnerabilidadeViewSet)
router.register(r'ocorrencias', OcorrenciaViewSet)
router.register(r'estacoes-meteorologicas', EstacaoMeteorologicaViewSet)
router.register(r'estado-sistema', SistemaEstadoViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)), 
]