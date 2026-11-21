# Painel de Atendimentos

Um hospital precisa de duas respostas ao mesmo tempo: quem está na fila agora, e como foi o ano que já fechou. Este projeto faz as duas, sem misturar uma na outra.

A tela é um React com três abas. A API é Django REST Framework. O banco local é SQLite.

## As três abas

**Fila** é a operação do dia. Dá para abrir um atendimento, mudar prioridade e status, e cancelar. Cancelar tira a pessoa da fila e mantém o registro. Cada atendimento recebe um identificador `PAT-` na gravação, no mesmo formato do arquivo importado. A espera é calculada a partir da entrada, do início do atendimento e do encerramento. Esses horários são gravados pelo servidor quando o status muda.

**Histórico** junta duas listas. Em cima, os atendimentos concluídos ou cancelados na operação. Embaixo, as mil internações importadas de 2025, com busca por nome e filtro por setor.

**Painel** é o dashboard do ano importado. Mostra o volume de admissões mês a mês e a permanência média, em dias de leito, por setor e por faixa de idade. A faixa etária é calculada na consulta, não gravada na tabela.

## Por que duas tabelas

`Atendimento` guarda a fila: nome, prontuário, setor, prioridade, status e horários. `HistoricoInternacao` guarda o ano fechado: idade, chegada, saída, dias de leito e satisfação. As duas apontam para o mesmo cadastro de setores.

Juntar tudo numa tabela só faria a fila contar gente que chegou em março de 2025, e a média de permanência misturaria visita ainda aberta com internação já encerrada. A fila mede espera em horas. O ano mede leito em dias.

## Os dados

`hospital_backend/dados/patients.csv` tem mil internações sintéticas de 2025, licença CC0. Não descreve um hospital real. Os setores do arquivo (`emergency`, `surgery`, `ICU`, `general_medicine`) entram como Emergência, Cirurgia, UTI e Clínica Médica.

A carga é o comando `importar_pacientes`. Ele valida setor, datas e idade, calcula a permanência e grava pelo `patient_id`. Rodar de novo atualiza as mesmas linhas.

## API

| Método | Endereço | Uso |
| --- | --- | --- |
| `GET` `POST` `PATCH` | `/api/atendimentos/` | fila do dia |
| `GET` | `/api/atendimentos/resumo/` | totais dos cartões |
| `GET` | `/api/setores/` | setores do formulário |
| `GET` | `/api/historico/` | internações de 2025 |
| `GET` | `/api/historico/metricas/` | contas do Painel |

Não há `DELETE` em atendimento. Encerrar sem apagar é um `PATCH` com status cancelado.

## Como rodar

Backend, na pasta `hospital_backend`:

```powershell
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py importar_pacientes
.\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

Frontend, na pasta `hospital_frontend`:

```powershell
npm install
npm run dev
```

A API fica em `http://127.0.0.1:8000` e a tela em `http://127.0.0.1:5173`.
