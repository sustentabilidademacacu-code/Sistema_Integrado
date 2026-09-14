from rest_framework import viewsets
from .models import InventarioVulnerabilidade, Ocorrencia
from .serializers import InventarioVulnerabilidadeSerializer, OcorrenciaSerializer

class InventarioVulnerabilidadeViewSet(viewsets.ModelViewSet):
    queryset = InventarioVulnerabilidade.objects.all()
    serializer_class = InventarioVulnerabilidadeSerializer

class OcorrenciaViewSet(viewsets.ModelViewSet):
    queryset = Ocorrencia.objects.all()
    serializer_class = OcorrenciaSerializer