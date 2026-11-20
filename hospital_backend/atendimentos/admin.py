from django.contrib import admin
from .models import Setor, Atendimento, HistoricoInternacao

# registrando os nossos modelos no painel visual
admin.site.register(Setor)
admin.site.register(Atendimento)
admin.site.register(HistoricoInternacao)
