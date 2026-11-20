from rest_framework import serializers
from .models import Setor, Atendimento, HistoricoInternacao

class SetorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setor
        fields = '__all__'

class AtendimentoSerializer(serializers.ModelSerializer):
    #traz o nome do setor junto com os dados
    setor_nome = serializers.ReadOnlyField(source='setor.nome')

    class Meta:
        model = Atendimento
        fields = '__all__'
        read_only_fields = ('prontuario', 'data_entrada', 'data_inicio', 'data_fim')

class HistoricoInternacaoSerializer(serializers.ModelSerializer):
    #dados historicos do kaggle
    setor_nome = serializers.ReadOnlyField(source='setor.nome')

    class Meta:
        model = HistoricoInternacao
        fields = '__all__'
