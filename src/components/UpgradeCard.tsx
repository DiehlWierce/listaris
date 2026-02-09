import { type Upgrade } from '../modules/upgrades'
import { formatNumber } from '../modules/format'

type UpgradeCardProps = {
  upgrade: Upgrade
  isOwned: boolean
  isLocked: boolean
  canBuy: boolean
  onBuy: () => void
  requirementLabels: string[]
}

const UpgradeCard = ({ upgrade, isOwned, isLocked, canBuy, onBuy, requirementLabels }: UpgradeCardProps) => (
  <div className={`shop-card${isOwned ? ' shop-card--owned' : ''}${isLocked ? ' shop-card--locked' : ''}`}>
    <div>
      <div className="shop-card__title">
        <h4>{upgrade.name}</h4>
        {isOwned && <span className="status-pill status-pill--owned">Активно</span>}
        {!isOwned && isLocked && <span className="status-pill">Закрыто</span>}
      </div>
      <p className="shop-card__desc">{upgrade.desc}</p>
    </div>
    <div className="shop-card__meta">
      <div>
        <span>Стоимость</span>
        <strong>{formatNumber(upgrade.cost)}</strong>
      </div>
      {requirementLabels.map((label) => (
        <div key={label}>
          <span>Условие</span>
          <strong>{label}</strong>
        </div>
      ))}
    </div>
    <button className="primary-button" type="button" onClick={onBuy} disabled={!canBuy}>
      {isOwned ? 'Готово' : 'Улучшить'}
    </button>
  </div>
)

export default UpgradeCard
