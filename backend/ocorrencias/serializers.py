from rest_framework import serializers
from .models import InventarioVulnerabilidade, Ocorrencia

class InventarioVulnerabilidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventarioVulnerabilidade
        fields = '__all__'

class OcorrenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ocorrencia
        fields = '__all__'