import { useState, useEffect } from 'react'
import './App.css'
import Fila from './Fila.jsx'
import Historico from './Historico.jsx'
import Painel from './Painel.jsx'

function App() {
  const [tela, setTela] = useState('fila')
  const [resumo, setResumo] = useState(null)
  const [atendimentos, setAtendimentos] = useState([])
  const [setores, setSetores] = useState([])
  const [metricas, setMetricas] = useState(null)
  const [historico, setHistorico] = useState([])
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
          <Fila
            resumo={resumo}
            atendimentos={atendimentos}
            onAtualizar={carregarDados}
            onNovo={abrirNovo}
            onEditar={abrirEdicao}
            onCancelar={handleCancelar}
          />
        ) : tela === 'historico' ? (
          <Historico
            atendimentos={atendimentos}
            historico={historico}
            setores={setores}
            onEditar={abrirEdicao}
          />
        ) : (
          <Painel metricas={metricas} />
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
