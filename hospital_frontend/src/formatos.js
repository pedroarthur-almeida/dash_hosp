export function textoPermanencia(dias) {
  if (dias == null) return '—'
  return dias === 1 ? '1 dia' : `${dias} dias`
}

export function formatarData(iso) {
  if (!iso) return '—'
  const [ano, mes, dia] = String(iso).slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

export function textoPrioridade(prioridade) {
  if (prioridade === 'ALTA') return 'Alta'
  if (prioridade === 'MEDIA') return 'Média'
  return 'Baixa'
}

export function textoStatus(status) {
  if (status === 'AGUARDANDO') return 'Aguardando'
  if (status === 'EM_ATENDIMENTO') return 'Em atendimento'
  if (status === 'CANCELADO') return 'Cancelado'
  return 'Finalizado'
}

export function textoDuracao(isoInicio, isoFim) {
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

export function esperaDaFila(paciente) {
  if (paciente.status === 'EM_ATENDIMENTO') {
    return textoDuracao(paciente.data_entrada, paciente.data_inicio)
  }
  return textoDuracao(paciente.data_entrada)
}
