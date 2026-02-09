import './ResourcePanel.css'

type ResourcePanelProps = {
  coins: number
  coinsPerSec: number
  showEnergy?: boolean
  showCrystals?: boolean
  showSouls?: boolean
  energy?: number
  crystals?: number
  souls?: number
  energyPerSec?: number
  crystalsPerSec?: number
}

const fmt = (num: number): string => {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}k`
  return num.toFixed(1)
}

const ResourcePanel = ({ coins, coinsPerSec }: ResourcePanelProps) => (
  <div className="resources-panel">
    <div className="resource-item">
      <div className="resource-label">📜 Листы</div>
      <div className="resource-value">{fmt(coins)}</div>
      {coinsPerSec > 0 && (
        <div className="resource-per-sec">+{fmt(coinsPerSec)}/сек</div>
      )}
    </div>
  </div>
)

export default ResourcePanel
