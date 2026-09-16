from rest_framework import serializers
from .models import EstacaoMeteorologica, SistemaEstado, LeituraEstacao

class EstacaoMeteorologicaSerializer(serializers.ModelSerializer):
    ultima_leitura = serializers.SerializerMethodField()

    class Meta:
        model = EstacaoMeteorologica
        fields = '__all__'

    def get_ultima_leitura(self, obj):
        leitura = obj.leituras.first()
        if leitura:
            return LeituraEstacaoSerializer(leitura).data
        return None

class SistemaEstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SistemaEstado
        fields = '__all__'

class LeituraEstacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeituraEstacao
        fields = '__all__'