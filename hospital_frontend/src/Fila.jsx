import { useState } from 'react'
import { esperaDaFila, textoPrioridade, textoStatus } from './formatos'

export default function Fila({ resumo, atendimentos, onAtualizar, onNovo, onEditar, onCancelar }) {
  const [buscaFila, setBuscaFila] = useState('')
  const [statusFila, setStatusFila] = useState('')

  const termoFila = buscaFila.trim().toLowerCase()
  const fila = atendimentos.filter((item) => {
    if (item.status === 'FINALIZADO' || item.status === 'CANCELADO') return false
    if (statusFila && item.status !== statusFila) return false
    if (!termoFila) return true
    const nome = item.paciente_nome.toLowerCase()
    const prontuario = (item.prontuario || '').toLowerCase()
    return nome.includes(termoFila) || prontuario.includes(termoFila)
  })

  return (
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
            <button onClick={onAtualizar} className="btn-secondary">Atualizar</button>
            <button onClick={onNovo} className="btn-primary">+ Novo Atendimento</button>
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
                        <button onClick={() => onEditar(p)} className="btn-secondary">
                          Editar
                        </button>
                        <button onClick={() => onCancelar(p.id)} className="btn-delete">
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
  )
}
