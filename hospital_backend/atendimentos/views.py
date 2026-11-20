from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Case, CharField, Count, IntegerField, Value, When
from django.db.models.functions import TruncMonth
from .models import Setor, Atendimento, HistoricoInternacao
from .serializers import SetorSerializer, AtendimentoSerializer, HistoricoInternacaoSerializer

class SetorViewSet(viewsets.ModelViewSet):
    queryset = Setor.objects.all()
    serializer_class = SetorSerializer

class AtendimentoViewSet(viewsets.ModelViewSet):
    queryset = Atendimento.objects.all()
    serializer_class = AtendimentoSerializer
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']

    #resumo da fila de hoje
    @action(detail=False, methods=['get'])
    def resumo(self, request):
        total = Atendimento.objects.count()
        aguardando = Atendimento.objects.filter(status='AGUARDANDO').count()
        em_atendimento = Atendimento.objects.filter(status='EM_ATENDIMENTO').count()
        finalizados = Atendimento.objects.filter(status='FINALIZADO').count()
        cancelados = Atendimento.objects.filter(status='CANCELADO').count()

        por_setor = (
            Atendimento.objects
            .values('setor__nome')
            .annotate(total=Count('id'))
            .order_by('-total')
        )

        return Response({
            'total': total,
            'aguardando': aguardando,
            'em_atendimento': em_atendimento,
            'finalizados': finalizados,
            'cancelados': cancelados,
            'por_setor': list(por_setor)
        })

class HistoricoInternacaoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        HistoricoInternacao.objects
        .select_related('setor')
        .order_by('-data_entrada', '-id')
    )
    serializer_class = HistoricoInternacaoSerializer

    #metricas avancadas de permanencia do kaggle
    @action(detail=False, methods=['get'])
    def metricas(self, request):
        # Permanência vazia não entra na média nem na contagem do gráfico.
        com_permanencia = HistoricoInternacao.objects.filter(permanencia_dias__isnull=False)

        # Média de dias de leito por setor.
        setores = (
            com_permanencia
            .values('setor__nome')
            .annotate(
                media_dias=Avg('permanencia_dias'),
                total=Count('id')
            )
            .order_by('-media_dias')
        )

        # Faixa calculada na consulta: mudar o corte não exige recarregar o CSV.
        # ordem_faixa guarda a sequência etária; ordenar pelo texto da faixa quebraria ao renomear.
        faixas = (
            com_permanencia
            .annotate(
                faixa_etaria=Case(
                    When(idade__lte=17, then=Value('0 a 17 anos')),
                    When(idade__lte=39, then=Value('18 a 39 anos')),
                    When(idade__lte=64, then=Value('40 a 64 anos')),
                    default=Value('65+ anos'),
                    output_field=CharField()
                ),
                ordem_faixa=Case(
                    When(idade__lte=17, then=Value(1)),
                    When(idade__lte=39, then=Value(2)),
                    When(idade__lte=64, then=Value(3)),
                    default=Value(4),
                    output_field=IntegerField()
                )
            )
            .values('faixa_etaria', 'ordem_faixa')
            .annotate(
                media_dias=Avg('permanencia_dias'),
                total=Count('id')
            )
            .order_by('ordem_faixa')
        )

        por_mes = (
            HistoricoInternacao.objects
            .annotate(mes=TruncMonth('data_entrada'))
            .values('mes')
            .annotate(total=Count('id'))
            .order_by('mes')
        )
        media_geral = com_permanencia.aggregate(media=Avg('permanencia_dias'))['media']

        return Response({
            'total_historico': HistoricoInternacao.objects.count(),
            'media_geral_dias': round(media_geral, 1) if media_geral else 0,
            'admissoes_por_mes': [
                {
                    'mes': item['mes'].strftime('%Y-%m'),
                    'total': item['total']
                }
                for item in por_mes
            ],
            'permanencia_por_setor': [
                {
                    'setor': item['setor__nome'],
                    'media_dias': round(item['media_dias'], 1) if item['media_dias'] else 0,
                    'total_pacientes': item['total']
                }
                for item in setores
            ],
            'permanencia_por_faixa': [
                {
                    'faixa': item['faixa_etaria'],
                    'media_dias': round(item['media_dias'], 1) if item['media_dias'] else 0,
                    'total_pacientes': item['total']
                }
                for item in faixas
            ]
        })
