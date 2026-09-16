from rest_framework import serializers
from .models import InventarioVulnerabilidade, Ocorrencia

class InventarioVulnerabilidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventarioVulnerabilidade
        fields = '__all__'

class OcorrenciaSerializer(serializers.ModelSerializer):
    nome_secretaria = serializers.CharField(source='secretaria_responsavel.nome', read_only=True)
    cor_secretaria = serializers.CharField(source='secretaria_responsavel.cor_identidade', read_only=True)
    vulnerabilidade_detalhe = serializers.CharField(source='vulnerabilidade.categoria', read_only=True)

    class Meta:
        model = Ocorrencia
        fields = '__all__'