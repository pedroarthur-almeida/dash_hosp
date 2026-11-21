const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function rotuloMes(anoMes) {
  const indice = Number(String(anoMes).slice(5, 7)) - 1
  return MESES[indice] || anoMes
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

export default function Painel({ metricas }) {
  if (!metricas) {
    return <p className="empty-text">Carregando análise...</p>
  }

  return (
    <div>
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
    </div>
  )
}
