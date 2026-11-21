# Painel de Atendimentos

Sistema de fila hospitalar com uma tela de análise. O Django guarda os dados e entrega a API. O React desenha as três abas: Fila, Histórico e Painel.

A Fila cadastra, edita e cancela o atendimento de agora. O Histórico lista o que já encerrou na operação e o ano importado. O Painel é o dashboard: admissões por mês e permanência média por setor e por idade.

A fila fica na tabela `Atendimento`. O ano de 2025 fica na tabela `HistoricoInternacao`. As duas compartilham o cadastro de setores e não se misturam: a fila não tem idade nem data de saída, e o ano importado não tem prioridade nem status.

O arquivo `hospital_backend/dados/patients.csv` é sintético, licença CC0. Não representa um hospital real. A carga é o comando `importar_pacientes`.

## Backend

Na pasta `hospital_backend`, com o ambiente virtual já criado:

```powershell
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py importar_pacientes
.\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

A API sobe em `http://127.0.0.1:8000`. Rodar `importar_pacientes` de novo atualiza as mesmas mil linhas, sem duplicar.

## Frontend

Na pasta `hospital_frontend`:

```powershell
npm install
npm run dev
```

A tela abre em `http://127.0.0.1:5173` e chama a API em `http://127.0.0.1:8000`.
