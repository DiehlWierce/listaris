export const formatNumber = (value: number, digits = 1): string => {
  const absValue = Math.abs(value)

  if (absValue >= 1e12) return `${(value / 1e12).toFixed(2)}T`
  if (absValue >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (absValue >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (absValue >= 1e3) return `${(value / 1e3).toFixed(digits)}k`

  return value.toFixed(digits)
}

export const formatDateTime = (timestamp: number): string =>
  new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(timestamp))
