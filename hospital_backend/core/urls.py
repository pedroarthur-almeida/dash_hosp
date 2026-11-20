from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from atendimentos.views import SetorViewSet, AtendimentoViewSet, HistoricoInternacaoViewSet

#rotas da api rest
router = DefaultRouter()
router.register(r'setores', SetorViewSet)
router.register(r'atendimentos', AtendimentoViewSet)
router.register(r'historico', HistoricoInternacaoViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
