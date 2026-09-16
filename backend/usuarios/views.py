from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Secretaria, SolicitacaoAcesso
from .serializers import SecretariaSerializer, SolicitacaoAcessoSerializer

class SecretariaViewSet(viewsets.ModelViewSet):
    queryset = Secretaria.objects.all()
    serializer_class = SecretariaSerializer

class SolicitacaoAcessoViewSet(viewsets.ModelViewSet):
    queryset = SolicitacaoAcesso.objects.all()
    serializer_class = SolicitacaoAcessoSerializer

@api_view(['POST'])
def mvp_login(request):
    email = request.data.get('email')
    senha = request.data.get('senha')

    if not email or not senha:
        return Response({'erro': 'Credenciais faltando'}, status=status.HTTP_400_BAD_REQUEST)

    # Verifica se existe o email na base de solicitações
    solicitacao = SolicitacaoAcesso.objects.filter(email_institucional=email).last()
    
    if solicitacao:
        if solicitacao.senha_provisoria != senha:
            return Response({'status_auth': 'invalido', 'mensagem': 'Senha incorreta.'}, status=status.HTTP_401_UNAUTHORIZED)
            
        if solicitacao.status == 'PENDENTE':
            return Response({'status_auth': 'analise'})
        elif solicitacao.status == 'REJEITADO':
            return Response({'status_auth': 'rejeitado'})
        elif solicitacao.status == 'APROVADO':
            # Determina o perfil (Gabinete ou Operacional)
            is_gabinete = 'gabinete' in solicitacao.secretaria.nome.lower()
            
            return Response({
                'status_auth': 'liberado', 
                'token': 'gestor_mvp_token',
                'perfil': 'gabinete' if is_gabinete else 'operacional',
                'secretaria_id': str(solicitacao.secretaria.id),
                'secretaria_nome': solicitacao.secretaria.nome,
                'cor_identidade': solicitacao.secretaria.cor_identidade
            })

    # Fallback to bypass for existing emails or test emails
    if email == 'admin@campos.rj.gov.br' and senha == 'admin123':
        return Response({
            'status_auth': 'liberado', 
            'token': 'admin_mvp_token',
            'perfil': 'gabinete',
            'secretaria_id': None,
            'secretaria_nome': 'Gabinete do Prefeito / Sala de Situação',
            'cor_identidade': '#fbbf24'
        })
    elif email == 'operacional@teste.com':
        # Busca a Secretaria de Obras oficial para não ficar "Obras (Teste)"
        sec_obras = Secretaria.objects.filter(nome__icontains='Obras').first()
        return Response({
            'status_auth': 'liberado', 
            'token': 'op_mvp_token',
            'perfil': 'operacional',
            'secretaria_id': str(sec_obras.id) if sec_obras else None,
            'secretaria_nome': sec_obras.nome if sec_obras else 'Secretaria Municipal de Obras',
            'cor_identidade': sec_obras.cor_identidade if sec_obras else '#2563eb'
        })

    return Response({'status_auth': 'invalido', 'mensagem': 'E-mail não encontrado.'}, status=status.HTTP_401_UNAUTHORIZED)