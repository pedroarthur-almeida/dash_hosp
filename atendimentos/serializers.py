#1 eng da API REST

from rest_framework import serializers
from .models import Setor, Atendimento


class SetorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setor
        fields = '__all__'


class AtendimentoSerializer(serializers.ModelSerializer):
    #campo extra para facilitar a vida do react:
    #além do ID do setor, trazemos também o nome dele (ex: "emergência")
    setor_nome = serializers.ReadOnlyField(source='setor.nome')
    class Meta:
        model = Atendimento
        fields = '__all__'

