# Painel de Atendimentos

Sistema de fila hospitalar com dashboard básico. A API é Django REST Framework e a tela é React. O banco local é SQLite.

A fila do dia fica em `Atendimento`: cadastro, prioridade, status, espera e cancelamento. O ano de 2025 fica em `HistoricoInternacao`, carregado de `hospital_backend/dados/patients.csv`. O arquivo é sintético, licença CC0, e não representa um hospital real. O Painel lê só esse ano: admissões por mês e permanência média por setor e por idade.

## Backend

Na primeira vez, dentro de `hospital_backend`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py importar_pacientes
python manage.py runserver
```

`Activate.ps1` liga o ambiente. Depois disso, `python` e `pip` já são os desse ambiente. Nas próximas vezes, ative e suba o servidor:

```powershell
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

O backend publica a API em `http://127.0.0.1:8000`. O comando `importar_pacientes` só precisa rodar de novo se o CSV mudar. Uma nova execução atualiza as mesmas linhas.

## API

| Método | Endereço | Uso |
| --- | --- | --- |
| `GET` | `/api/atendimentos/` | lista da fila |
| `POST` | `/api/atendimentos/` | cria um atendimento |
| `GET` | `/api/atendimentos/{id}/` | um atendimento |
| `PATCH` | `/api/atendimentos/{id}/` | edita ou cancela |
| `GET` | `/api/atendimentos/resumo/` | totais dos cartões |
| `GET` | `/api/setores/` | setores do formulário |
| `GET` | `/api/historico/` | internações de 2025 |
| `GET` | `/api/historico/metricas/` | números do Painel |

Não existe `DELETE` em atendimento. Cancelar é um `PATCH` com status `CANCELADO`. O histórico só aceita `GET`.

## Frontend

Na primeira vez, dentro de `hospital_frontend`:

```powershell
npm install
npm run dev
```

Depois, basta `npm run dev`. O Vite mostra o endereço da tela, em geral `http://localhost:5173`. Ela chama a API em `http://127.0.0.1:8000`.
