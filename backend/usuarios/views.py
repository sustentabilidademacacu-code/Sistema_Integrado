from rest_framework import viewsets
from .models import Secretaria
from .serializers import SecretariaSerializer

class SecretariaViewSet(viewsets.ModelViewSet):
    queryset = Secretaria.objects.all()
    serializer_class = SecretariaSerializer