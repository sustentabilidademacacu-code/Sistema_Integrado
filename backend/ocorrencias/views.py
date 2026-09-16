from rest_framework import viewsets
from .models import InventarioVulnerabilidade, Ocorrencia
from .serializers import InventarioVulnerabilidadeSerializer, OcorrenciaSerializer
from usuarios.models import Secretaria

class InventarioVulnerabilidadeViewSet(viewsets.ModelViewSet):
    queryset = InventarioVulnerabilidade.objects.all()
    serializer_class = InventarioVulnerabilidadeSerializer

class OcorrenciaViewSet(viewsets.ModelViewSet):
    queryset = Ocorrencia.objects.all()
    serializer_class = OcorrenciaSerializer

    def perform_create(self, serializer):
        # Auto-roteamento baseado na categoria
        categoria = serializer.validated_data.get('categoria', '')
        
        termo_busca = 'Defesa Civil' # Padrão
        if 'árvore' in categoria.lower() or 'arvore' in categoria.lower():
            termo_busca = 'Meio Ambiente'
        elif 'ponte' in categoria.lower() or 'estrada' in categoria.lower():
            termo_busca = 'Obras'
        elif 'doen' in categoria.lower() or 'dengue' in categoria.lower():
            termo_busca = 'Saúde'

        sec = Secretaria.objects.filter(nome__icontains=termo_busca).first()
        
        if not sec:
            sec = Secretaria.objects.filter(nome__icontains='Defesa Civil').first()

        serializer.save(secretaria_responsavel=sec)