from rest_framework import serializers
from .models import Secretaria, SolicitacaoAcesso

class SecretariaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Secretaria
        fields = '__all__'

class SolicitacaoAcessoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolicitacaoAcesso
        fields = '__all__'