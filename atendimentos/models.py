from django.db import models


class Setor(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    def __str__(self):
        return self.nome


class Atendimento(models.Model):
    #opções fixas de prioridade e status
    PRIORIDADE_CHOICES = [
        ('BAIXA', 'Baixa'),
        ('MEDIA', 'Média'),
        ('ALTA', 'Alta'),
    ]
    STATUS_CHOICES = [
        ('AGUARDANDO', 'Aguardando'),
        ('EM_ATENDIMENTO', 'Em Atendimento'),
        ('FINALIZADO', 'Finalizado'),
    ]
    paciente_nome = models.CharField(max_length=150)
    setor = models.ForeignKey(Setor, on_delete=models.CASCADE, related_name='atendimentos')
    prioridade = models.CharField(max_length=10, choices=PRIORIDADE_CHOICES, default='BAIXA')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='AGUARDANDO')
    data_entrada = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.paciente_nome} - {self.setor.nome}"
