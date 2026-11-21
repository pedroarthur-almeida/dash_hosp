import { useState } from 'react'
import { formatarData, textoDuracao, textoPermanencia, textoStatus } from './formatos'

export default function Historico({ atendimentos, historico, setores, onEditar }) {
  const [buscaHistorico, setBuscaHistorico] = useState('')
  const [setorHistorico, setSetorHistorico] = useState('')

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
                        <button onClick={() => onEditar(p)} className="btn-secondary">
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
  )
}
