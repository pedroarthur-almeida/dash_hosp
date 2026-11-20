import { useState, useEffect } from 'react'
import './App.css'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function rotuloMes(anoMes) {
  const indice = Number(String(anoMes).slice(5, 7)) - 1
  return MESES[indice] || anoMes
}

function textoPermanencia(dias) {
  if (dias == null) return '—'
  return dias === 1 ? '1 dia' : `${dias} dias`
}

function formatarData(iso) {
  if (!iso) return '—'
  const [ano, mes, dia] = String(iso).slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

function textoPrioridade(prioridade) {
  if (prioridade === 'ALTA') return 'Alta'
  if (prioridade === 'MEDIA') return 'Média'
  return 'Baixa'
}

function textoStatus(status) {
  if (status === 'AGUARDANDO') return 'Aguardando'
  if (status === 'EM_ATENDIMENTO') return 'Em atendimento'
  if (status === 'CANCELADO') return 'Cancelado'
  return 'Finalizado'
}

function textoDuracao(isoInicio, isoFim) {
  if (!isoInicio) return '—'
  const inicio = new Date(isoInicio).getTime()
  const fim = isoFim ? new Date(isoFim).getTime() : Date.now()
  if (Number.isNaN(inicio) || Number.isNaN(fim)) return '—'
  const minutos = Math.max(0, Math.round((fim - inicio) / 60000))
  if (minutos < 60) return `${minutos} min`
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return resto ? `${horas} h ${resto} min` : `${horas} h`
}

function esperaDaFila(paciente) {
  if (paciente.status === 'EM_ATENDIMENTO') {
    return textoDuracao(paciente.data_entrada, paciente.data_inicio)
  }
  return textoDuracao(paciente.data_entrada)
}

function GraficoAdmissoes({ itens }) {
  const maior = Math.max(...itens.map((item) => item.total), 0)

  return (
    <div role="img" aria-label="Admissões por mês">
      <div className="column-chart">
        {itens.map((item) => {
          const altura = maior ? Math.round((item.total / maior) * 100) : 0
          return (
            <div key={item.mes} className="column">
              <span className="column-value">{item.total}</span>
              <div className="column-track">
                <div className="column-bar" style={{ height: `${altura}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="column-labels">
        {itens.map((item) => (
          <span key={item.mes} className="column-label">{rotuloMes(item.mes)}</span>
        ))}
      </div>
    </div>
  )
}

function App() {
  const [tela, setTela] = useState('fila')
  const [resumo, setResumo] = useState(null)
  const [atendimentos, setAtendimentos] = useState([])
  const [setores, setSetores] = useState([])
  const [metricas, setMetricas] = useState(null)
  const [historico, setHistorico] = useState([])
  const [buscaHistorico, setBuscaHistorico] = useState('')
  const [setorHistorico, setSetorHistorico] = useState('')
  const [statusFila, setStatusFila] = useState('')
  const [buscaFila, setBuscaFila] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [novoAtendimento, setNovoAtendimento] = useState({
    paciente_nome: '',
    setor: '',
    prioridade: 'MEDIA',
    status: 'AGUARDANDO'
  })

  const formularioInicial = (setorId = '') => ({
    paciente_nome: '',
    setor: setorId,
    prioridade: 'MEDIA',
    status: 'AGUARDANDO'
  })

  const carregarDados = () => {
    fetch('http://127.0.0.1:8000/api/atendimentos/resumo/')
      .then((res) => res.json())
      .then((dados) => setResumo(dados))
      .catch((err) => console.error('Erro resumo:', err))

    fetch('http://127.0.0.1:8000/api/atendimentos/')
      .then((res) => res.json())
      .then((dados) => {
        setAtendimentos(dados)
        setCarregando(false)
      })
      .catch((err) => {
        console.error('Erro atendimentos:', err)
        setCarregando(false)
      })

    fetch('http://127.0.0.1:8000/api/historico/metricas/')
      .then((res) => res.json())
      .then((dados) => setMetricas(dados))
      .catch((err) => console.error('Erro historico:', err))

    fetch('http://127.0.0.1:8000/api/historico/')
      .then((res) => res.json())
      .then((dados) => setHistorico(Array.isArray(dados) ? dados : dados.results || []))
      .catch((err) => console.error('Erro lista historico:', err))

    fetch('http://127.0.0.1:8000/api/setores/')
      .then((res) => res.json())
      .then((dados) => {
        setSetores(dados)
        if (dados.length > 0 && !novoAtendimento.setor) {
          setNovoAtendimento((prev) => ({ ...prev, setor: String(dados[0].id) }))
        }
      })
      .catch((err) => console.error('Erro setores:', err))
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const fecharModal = () => {
    setModalAberto(false)
    setEditandoId(null)
    setNovoAtendimento(formularioInicial(setores[0] ? String(setores[0].id) : ''))
  }

  const abrirNovo = () => {
    setEditandoId(null)
    setNovoAtendimento(formularioInicial(setores[0] ? String(setores[0].id) : ''))
    setModalAberto(true)
  }

  const abrirEdicao = (paciente) => {
    setEditandoId(paciente.id)
    setNovoAtendimento({
      paciente_nome: paciente.paciente_nome,
      setor: String(paciente.setor),
      prioridade: paciente.prioridade,
      status: paciente.status
    })
    setModalAberto(true)
  }

  const handleSalvar = (e) => {
    e.preventDefault()
    if (!novoAtendimento.paciente_nome.trim()) {
      alert('Informe o nome do paciente.')
      return
    }

    const editando = editandoId
    fetch(editando
      ? `http://127.0.0.1:8000/api/atendimentos/${editando}/`
      : 'http://127.0.0.1:8000/api/atendimentos/', {
      method: editando ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoAtendimento)
    })
      .then((res) => {
        if (res.ok) {
          fecharModal()
          carregarDados()
        } else {
          alert(editando ? 'Erro ao atualizar atendimento.' : 'Erro ao registrar atendimento.')
        }
      })
      .catch((err) => console.error('Erro ao salvar:', err))
  }

  const handleCancelar = (id) => {
    if (!confirm('Cancelar este atendimento? Ele sai da fila e permanece registrado.')) return

    fetch(`http://127.0.0.1:8000/api/atendimentos/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELADO' })
    })
      .then((res) => {
        if (res.ok) carregarDados()
      })
      .catch((err) => console.error('Erro ao cancelar:', err))
  }

  const termoFila = buscaFila.trim().toLowerCase()
  const fila = atendimentos.filter((item) => {
    if (item.status === 'FINALIZADO' || item.status === 'CANCELADO') return false
    if (statusFila && item.status !== statusFila) return false
    if (!termoFila) return true
    const nome = item.paciente_nome.toLowerCase()
    const prontuario = (item.prontuario || '').toLowerCase()
    return nome.includes(termoFila) || prontuario.includes(termoFila)
  })
  const termoHistorico = buscaHistorico.trim().toLowerCase()
  const finalizados = atendimentos.filter((item) => {
    if (item.status !== 'FINALIZADO' && item.status !== 'CANCELADO') return false
    const nome = item.paciente_nome.toLowerCase()
    const prontuario = (item.prontuario || '').toLowerCase()
    const nomeOk = !termoHistorico || nome.includes(termoHistorico) || prontuario.includes(termoHistorico)
    const setorOk = !setorHistorico || item.setor_nome === setorHistorico
    return nomeOk && setorOk
  })
  const historicoFiltrado = historico.filter((item) => {
    const nomeOk = item.paciente_nome.toLowerCase().includes(termoHistorico)
    const setorOk = !setorHistorico || item.setor_nome === setorHistorico
    return nomeOk && setorOk
  })

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div>
            <h1 className="brand-title">Painel de Atendimentos</h1>
            <p className="brand-subtitle">Gestão e Fluxo de Pacientes</p>
          </div>
        </div>

        <nav className="view-nav">
          <button
            className={tela === 'fila' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setTela('fila')}
          >
            Fila
          </button>
          <button
            className={tela === 'historico' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setTela('historico')}
          >
            Histórico
          </button>
          <button
            className={tela === 'painel' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setTela('painel')}
          >
            Painel
          </button>
        </nav>
      </header>

      <main className="main-content">
        {carregando ? (
          <div className="loading-state">
            <p>Carregando dados do sistema...</p>
          </div>
        ) : tela === 'fila' ? (
          <>
          {resumo && (
            <div className="kpi-grid kpi-grid-fila">
              <div className="kpi-card">
                <div className="kpi-label">Aguardando</div>
                <div className="kpi-value">{resumo.aguardando}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Em atendimento</div>
                <div className="kpi-value">{resumo.em_atendimento}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Finalizados</div>
                <div className="kpi-value">{resumo.finalizados}</div>
              </div>
            </div>
          )}
          <div className="card-panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Lista de Atendimentos</h2>
                <p className="panel-subtitle">Aguardando e em atendimento. Para mudar prioridade ou status, use Editar.</p>
              </div>
              <div className="panel-actions">
                <input
                  type="search"
                  className="form-input fila-busca"
                  placeholder="Buscar nome ou ID"
                  value={buscaFila}
                  onChange={(e) => setBuscaFila(e.target.value)}
                />
                <select
                  className="form-input status-filter"
                  value={statusFila}
                  onChange={(e) => setStatusFila(e.target.value)}
                >
                  <option value="">Todos os status</option>
                  <option value="AGUARDANDO">Aguardando</option>
                  <option value="EM_ATENDIMENTO">Em atendimento</option>
                </select>
                <button onClick={carregarDados} className="btn-secondary">Atualizar</button>
                <button onClick={abrirNovo} className="btn-primary">+ Novo Atendimento</button>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>ID</th>
                    <th>Setor</th>
                    <th>Prioridade</th>
                    <th>Status</th>
                    <th>Espera</th>
                    <th className="action-col">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {fila.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-text">
                        {termoFila || statusFila ? 'Nenhum paciente com esse filtro.' : 'Nenhum paciente na fila.'}
                      </td>
                    </tr>
                  ) : (
                    fila.map((p) => (
                      <tr key={p.id}>
                        <td className="patient-name">{p.paciente_nome}</td>
                        <td>{p.prontuario || '—'}</td>
                        <td className="sector-name">{p.setor_nome || 'N/A'}</td>
                        <td>
                          <span className={`badge-priority ${p.prioridade.toLowerCase()}`}>
                            {textoPrioridade(p.prioridade)}
                          </span>
                        </td>
                        <td>
                          <span className="status-text">{textoStatus(p.status)}</span>
                        </td>
                        <td>{esperaDaFila(p)}</td>
                        <td className="action-col">
                          <div className="row-actions">
                            <button onClick={() => abrirEdicao(p)} className="btn-secondary">
                              Editar
                            </button>
                            <button onClick={() => handleCancelar(p.id)} className="btn-delete">
                              Cancelar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </>
        ) : tela === 'historico' ? (
          <>
            <div className="history-filters">
              <input
                type="search"
                className="form-input"
                placeholder="Buscar paciente"
                value={buscaHistorico}
                onChange={(e) => setBuscaHistorico(e.target.value)}
              />
              <select
                className="form-input"
                value={setorHistorico}
                onChange={(e) => setSetorHistorico(e.target.value)}
              >
                <option value="">Todos os setores</option>
                {setores.map((setor) => (
                  <option key={setor.id} value={setor.nome}>{setor.nome}</option>
                ))}
              </select>
            </div>

            <div className="card-panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Atendimentos encerrados</h2>
                  <p className="panel-subtitle">Concluídos ou cancelados na fila. A tabela seguinte reúne a série histórica importada.</p>
                </div>
              </div>
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Paciente</th>
                      <th>ID</th>
                      <th>Setor</th>
                      <th>Status</th>
                      <th>Duração</th>
                      <th className="action-col">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalizados.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-text">Nenhum atendimento encerrado.</td>
                      </tr>
                    ) : (
                      finalizados.map((p) => (
                        <tr key={p.id}>
                          <td className="patient-name">{p.paciente_nome}</td>
                          <td>{p.prontuario || '—'}</td>
                          <td className="sector-name">{p.setor_nome || 'N/A'}</td>
                          <td>
                            <span className="status-text">{textoStatus(p.status)}</span>
                          </td>
                          <td>{textoDuracao(p.data_entrada, p.data_fim)}</td>
                          <td className="action-col">
                            <div className="row-actions">
                              <button onClick={() => abrirEdicao(p)} className="btn-secondary">
                                Editar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card-panel history-table-panel">
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">Registros do ano</h2>
                    <p className="panel-subtitle">{historicoFiltrado.length} de {historico.length} internações</p>
                  </div>
                </div>

                <div className="table-wrapper history-table-scroll">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Paciente</th>
                        <th>Idade</th>
                        <th>Setor</th>
                        <th>Entrada</th>
                        <th>Saída</th>
                        <th>Permanência</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoFiltrado.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="empty-text">Nenhuma internação com esse filtro.</td>
                        </tr>
                      ) : (
                        historicoFiltrado.map((item) => (
                          <tr key={item.paciente_id_origem}>
                            <td className="patient-name">{item.paciente_nome}</td>
                            <td>{item.idade}</td>
                            <td className="sector-name">{item.setor_nome}</td>
                            <td>{formatarData(item.data_entrada)}</td>
                            <td>{formatarData(item.data_saida)}</td>
                            <td>{textoPermanencia(item.permanencia_dias)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          </>
        ) : (
          <div>
            {!metricas ? (
              <p className="empty-text">Carregando análise...</p>
            ) : (
              <>
                <div className="card-panel">
                  <h2 className="panel-title">Admissões por mês</h2>
                  <p className="panel-subtitle">
                    {metricas.total_historico} internações em 2025. A altura compara o volume de cada mês.
                  </p>
                  <GraficoAdmissoes itens={metricas.admissoes_por_mes} />
                </div>

                <div className="painel-grid">
                  <div className="card-panel">
                    <h2 className="panel-title">Permanência por setor</h2>
                    <p className="panel-subtitle">Média de dias de leito</p>
                    <div className="history-bars">
                      {metricas.permanencia_por_setor.map((item) => (
                        <div key={item.setor} className="rank-row">
                          <span>{item.setor}</span>
                          <span className="sector-count">
                            {Number(item.media_dias).toFixed(1)} dias · {item.total_pacientes}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card-panel">
                    <h2 className="panel-title">Permanência por idade</h2>
                    <p className="panel-subtitle">Média de dias de leito</p>
                    <div className="history-bars">
                      {metricas.permanencia_por_faixa.map((item) => (
                        <div key={item.faixa} className="rank-row">
                          <span>{item.faixa}</span>
                          <span className="sector-count">
                            {Number(item.media_dias).toFixed(1)} dias · {item.total_pacientes}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {modalAberto && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editandoId ? 'Editar atendimento' : 'Novo atendimento'}</h3>
              <button onClick={fecharModal} className="modal-close">✕</button>
            </div>

            <form onSubmit={handleSalvar} className="modal-form">
              <div className="form-group">
                <label className="form-label">Nome do Paciente:</label>
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={novoAtendimento.paciente_nome}
                  onChange={(e) => setNovoAtendimento({ ...novoAtendimento, paciente_nome: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Setor:</label>
                <select
                  value={novoAtendimento.setor}
                  onChange={(e) => setNovoAtendimento({ ...novoAtendimento, setor: e.target.value })}
                  className="form-input"
                >
                  {setores.map((s) => (
                    <option key={s.id} value={String(s.id)}>{s.nome}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Prioridade:</label>
                  <select
                    value={novoAtendimento.prioridade}
                    onChange={(e) => setNovoAtendimento({ ...novoAtendimento, prioridade: e.target.value })}
                    className="form-input"
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média</option>
                    <option value="ALTA">Alta</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status:</label>
                  <select
                    value={novoAtendimento.status}
                    onChange={(e) => setNovoAtendimento({ ...novoAtendimento, status: e.target.value })}
                    className="form-input"
                  >
                    <option value="AGUARDANDO">Aguardando</option>
                    <option value="EM_ATENDIMENTO">Em atendimento</option>
                    {editandoId && <option value="FINALIZADO">Finalizado</option>}
                    {editandoId && <option value="CANCELADO">Cancelado</option>}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={fecharModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
