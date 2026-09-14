from rest_framework import viewsets
from .models import EstacaoMeteorologica, SistemaEstado
from .serializers import EstacaoMeteorologicaSerializer, SistemaEstadoSerializer

class EstacaoMeteorologicaViewSet(viewsets.ModelViewSet):
    queryset = EstacaoMeteorologica.objects.all()
    serializer_class = EstacaoMeteorologicaSerializer

class SistemaEstadoViewSet(viewsets.ModelViewSet):
    queryset = SistemaEstado.objects.all()
    serializer_class = SistemaEstadoSerializer