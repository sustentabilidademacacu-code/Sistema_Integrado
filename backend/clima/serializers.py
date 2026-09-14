from rest_framework import serializers
from .models import EstacaoMeteorologica, SistemaEstado

class EstacaoMeteorologicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstacaoMeteorologica
        fields = '__all__'

class SistemaEstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SistemaEstado
        fields = '__all__'