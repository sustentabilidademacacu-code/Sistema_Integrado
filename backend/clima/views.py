from rest_framework import viewsets
from .models import EstacaoMeteorologica, SistemaEstado, LeituraEstacao
from .serializers import EstacaoMeteorologicaSerializer, SistemaEstadoSerializer, LeituraEstacaoSerializer

class EstacaoMeteorologicaViewSet(viewsets.ModelViewSet):
    queryset = EstacaoMeteorologica.objects.all()
    serializer_class = EstacaoMeteorologicaSerializer

class SistemaEstadoViewSet(viewsets.ModelViewSet):
    queryset = SistemaEstado.objects.all()
    serializer_class = SistemaEstadoSerializer

class LeituraEstacaoViewSet(viewsets.ModelViewSet):
    queryset = LeituraEstacao.objects.all()
    serializer_class = LeituraEstacaoSerializer