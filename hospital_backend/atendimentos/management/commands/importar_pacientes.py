import csv
from datetime import datetime
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction
from atendimentos.models import Setor, HistoricoInternacao

class Command(BaseCommand):
    help = 'Importa e trata os dados históricos de pacientes do arquivo patients.csv'

    # 1. Dicionário de Tradução dos Setores (Mapeamento explícito)
    MAPA_SETORES = {
        'emergency': 'Emergência',
        'surgery': 'Cirurgia',
        'ICU': 'UTI',
        'general_medicine': 'Clínica Médica'
    }

    def handle(self, *args, **options):
        caminho_csv = settings.BASE_DIR / 'dados' / 'patients.csv'

        if not caminho_csv.exists():
            self.stdout.write(self.style.ERROR(f'Arquivo não encontrado: {caminho_csv}'))
            return

        self.stdout.write(self.style.WARNING(f'Iniciando ETL do arquivo: {caminho_csv}'))

        # 2. Pré-cadastra os setores traduzidos no banco de dados (se não existirem)
        setores_cache = {}
        for chave_ing, nome_pt in self.MAPA_SETORES.items():
            setor_obj, _ = Setor.objects.get_or_create(
                nome=nome_pt,
                defaults={'descricao': f'Ala médica de {nome_pt}'}
            )
            setores_cache[chave_ing] = setor_obj

        # 3. Lendo o CSV e aplicando as regras de tratamento
        linhas_lidas = 0
        inseridos = 0
        atualizados = 0
        rejeitados = 0

        with open(caminho_csv, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            with transaction.atomic():
                for row in reader:
                    linhas_lidas += 1
                    
                    try:
                        # Validação do setor
                        servico = row['service'].strip()
                        if servico not in setores_cache:
                            self.stdout.write(self.style.ERROR(f"Linha {linhas_lidas}: Setor desconhecido '{servico}'. Rejeitado."))
                            rejeitados += 1
                            continue

                        # Conversão e tratamento de datas
                        data_entrada = datetime.strptime(row['arrival_date'].strip(), '%Y-%m-%d').date()
                        data_saida_str = row['departure_date'].strip()
                        
                        data_saida = None
                        permanencia_dias = None

                        if data_saida_str:
                            data_saida = datetime.strptime(data_saida_str, '%Y-%m-%d').date()
                            
                            # Validação: data de saída anterior à entrada é inválida
                            if data_saida < data_entrada:
                                self.stdout.write(self.style.ERROR(f"Linha {linhas_lidas}: Alta anterior à admissão ({data_saida} < {data_entrada}). Rejeitado."))
                                rejeitados += 1
                                continue
                            
                            # Cálculo da permanência de leito (Length of Stay)
                            permanencia_dias = (data_saida - data_entrada).days

                        # Validação de idade
                        idade = int(row['age'])
                        if idade < 0 or idade > 120:
                            self.stdout.write(self.style.ERROR(f"Linha {linhas_lidas}: Idade absurda ({idade}). Rejeitado."))
                            rejeitados += 1
                            continue

                        # Satisfação
                        satisfacao = float(row['satisfaction']) if row.get('satisfaction') else None

                        # Salvando no banco de forma idempotente (não duplica se rodar de novo)
                        obj, created = HistoricoInternacao.objects.update_or_create(
                            paciente_id_origem=row['patient_id'].strip(),
                            defaults={
                                'paciente_nome': row['name'].strip(),
                                'idade': idade,
                                'setor': setores_cache[servico],
                                'data_entrada': data_entrada,
                                'data_saida': data_saida,
                                'permanencia_dias': permanencia_dias,
                                'satisfacao': satisfacao
                            }
                        )

                        if created:
                            inseridos += 1
                        else:
                            atualizados += 1

                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Linha {linhas_lidas}: Erro ao processar ({e}). Rejeitado."))
                        rejeitados += 1

        # 4. Relatório final de execução
        self.stdout.write(self.style.SUCCESS('--- RELATÓRIO DO ETL (IMPORTAÇÃO) ---'))
        self.stdout.write(self.style.SUCCESS(f'Total de linhas lidas: {linhas_lidas}'))
        self.stdout.write(self.style.SUCCESS(f'Novos registros inseridos: {inseridos}'))
        self.stdout.write(self.style.SUCCESS(f'Registros atualizados: {atualizados}'))
        if rejeitados > 0:
            self.stdout.write(self.style.WARNING(f'Registros rejeitados: {rejeitados}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Registros rejeitados: 0 (100% de integridade)'))
