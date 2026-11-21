# Painel de Atendimentos

Sistema de fila hospitalar com dashboard básico. A API é Django REST Framework e a tela é React. O banco local é SQLite.

A fila do dia fica em `Atendimento`: cadastro, prioridade, status, espera e cancelamento. O ano de 2025 fica em `HistoricoInternacao`, carregado de `hospital_backend/dados/patients.csv`. O arquivo é sintético, licença CC0, e não representa um hospital real. O Painel lê só esse ano: admissões por mês e permanência média por setor e por idade.

## Como executar

A ordem é esta: backend, frontend e, por último, o endereço da tela. Cada servidor fica no próprio terminal.

**1. Backend.** Na primeira vez, dentro de `hospital_backend`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py importar_pacientes
python manage.py runserver
```

`Activate.ps1` liga o ambiente. Depois disso, `python` e `pip` já são os desse ambiente. Nas próximas vezes:

```powershell
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

A API fica em `http://127.0.0.1:8000`. `importar_pacientes` só entra de novo se o CSV mudar. Uma nova execução atualiza as mesmas linhas.

**2. Frontend.** Na primeira vez, dentro de `hospital_frontend`:

```powershell
npm install
npm run dev
```

Nas próximas vezes, `npm run dev`.

**3. Tela.** Abra o endereço que o Vite mostrar, em geral `http://localhost:5173`. A página chama a API do passo 1. Com o backend parado, a tela abre sem os dados.

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
