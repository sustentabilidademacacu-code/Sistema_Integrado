from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from usuarios.views import SecretariaViewSet

# Criamos as rotas (caminhos) da nossa API
router = DefaultRouter()
router.register(r'secretarias', SecretariaViewSet)

urlpatterns = [
    path('admin/', admin.site.urls), # A porta dos fundos que você já usou
    path('api/', include(router.urls)), # A porta do nosso Garçom (API)
]