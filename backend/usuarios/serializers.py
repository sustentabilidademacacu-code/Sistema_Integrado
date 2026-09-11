from rest_framework import serializers
from .models import Secretaria

class SecretariaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Secretaria
        fields = '__all__' # Diz para traduzir todas as colunas da tabela