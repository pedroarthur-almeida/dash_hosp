import secrets

from django.db import models
from django.utils import timezone

class Setor(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nome

class Atendimento(models.Model):
    #opcoes fixas de prioridade e status
    PRIORIDADE_CHOICES = [
        ('BAIXA', 'Baixa'),
        ('MEDIA', 'Média'),
        ('ALTA', 'Alta'),
    ]
    STATUS_CHOICES = [
        ('AGUARDANDO', 'Aguardando'),
        ('EM_ATENDIMENTO', 'Em Atendimento'),
        ('FINALIZADO', 'Finalizado'),
        ('CANCELADO', 'Cancelado'),
    ]

    prontuario = models.CharField(max_length=20, unique=True, blank=True, default='')
    paciente_nome = models.CharField(max_length=150)
    setor = models.ForeignKey(Setor, on_delete=models.CASCADE, related_name='atendimentos')
    prioridade = models.CharField(max_length=10, choices=PRIORIDADE_CHOICES, default='BAIXA')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='AGUARDANDO')
    data_entrada = models.DateTimeField(auto_now_add=True)
    data_inicio = models.DateTimeField(null=True, blank=True)
    data_fim = models.DateTimeField(null=True, blank=True)

    def _gerar_patient_id(self):
        while True:
            candidato = f'PAT-{secrets.token_hex(4)}'
            na_fila = Atendimento.objects.filter(prontuario=candidato)
            if self.pk:
                na_fila = na_fila.exclude(pk=self.pk)
            if na_fila.exists():
                continue
            if HistoricoInternacao.objects.filter(paciente_id_origem=candidato).exists():
                continue
            return candidato

    def save(self, *args, **kwargs):
        if not self.prontuario:
            self.prontuario = self._gerar_patient_id()
        agora = timezone.now()
        if self.status == 'AGUARDANDO':
            self.data_inicio = None
            self.data_fim = None
        elif self.status == 'EM_ATENDIMENTO':
            if self.data_inicio is None:
                self.data_inicio = agora
            self.data_fim = None
        elif self.status in ('FINALIZADO', 'CANCELADO') and self.data_fim is None:
            self.data_fim = agora
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.paciente_nome} - {self.setor.nome}"

class HistoricoInternacao(models.Model):
    #dados historicos do kaggle
    paciente_id_origem = models.CharField(max_length=50, unique=True)
    paciente_nome = models.CharField(max_length=150)
    idade = models.IntegerField()
    setor = models.ForeignKey(Setor, on_delete=models.CASCADE, related_name='historico_internacoes')
    data_entrada = models.DateField()
    data_saida = models.DateField(null=True, blank=True)
    permanencia_dias = models.IntegerField(null=True, blank=True)
    satisfacao = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"[Histórico {self.paciente_id_origem}] {self.paciente_nome} - {self.permanencia_dias} dias"
