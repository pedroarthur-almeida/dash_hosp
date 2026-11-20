from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from .models import Setor, Atendimento
from .serializers import SetorSerializer, AtendimentoSerializer

class SetorViewSet(viewsets.ModelViewSet):
    queryset = Setor.objects.all()
    serializer_class = SetorSerializer


class AtendimentoViewSet(viewsets.ModelViewSet):
    queryset = Atendimento.objects.all()
    serializer_class = AtendimentoSerializer

    
    @action(detail=False, methods=['get'])
    def resumo(self, request):
        total_atendimentos = Atendimento.objects.count()
        aguardando = Atendimento.objects.filter(status='AGUARDANDO').count()
        em_atendimento = Atendimento.objects.filter(status='EM_ATENDIMENTO').count()
        finalizados = Atendimento.objects.filter(status='FINALIZADO').count()

        #group by
        por_setor = (
            Atendimento.objects
            .values('setor__nome')
            .annotate(total=Count('id'))
            .order_by('-total')
        )

        dados_resumo = {
            'total': total_atendimentos,
            'aguardando': aguardando,
            'em_atendimento': em_atendimento,
            'finalizados': finalizados,
            'por_setor': list(por_setor)
        }

        return Response(dados_resumo)