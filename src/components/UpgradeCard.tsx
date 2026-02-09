import { type Upgrade } from '../modules/upgrades'
import { formatNumber } from '../modules/format'

type UpgradeCardProps = {
  upgrade: Upgrade
  isOwned: boolean
  canBuy: boolean
  onBuy: () => void
  requirementLabel?: string
}

const UpgradeCard = ({ upgrade, isOwned, canBuy, onBuy, requirementLabel }: UpgradeCardProps) => (
  <div className={`shop-card${isOwned ? ' shop-card--owned' : ''}`}>
    <div>
      <div className="shop-card__title">
        <h4>{upgrade.name}</h4>
        {isOwned && <span className="status-pill status-pill--owned">Приобретено</span>}
      </div>
      <p className="shop-card__desc">{upgrade.desc}</p>
    </div>
    <div className="shop-card__meta">
      <div>
        <span>Стоимость</span>
        <strong>{formatNumber(upgrade.cost)}</strong>
      </div>
      {requirementLabel && (
        <div>
          <span>Условие</span>
          <strong>{requirementLabel}</strong>
        </div>
      )}
    </div>
    <button className="primary-button" type="button" onClick={onBuy} disabled={!canBuy}>
      {isOwned ? 'Готово' : 'Улучшить'}
    </button>
  </div>
)

export default UpgradeCard
