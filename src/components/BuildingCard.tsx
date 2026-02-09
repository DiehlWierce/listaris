import { type Building, getBuildingCost } from '../modules/buildings'
import { formatNumber } from '../modules/format'

type BuildingCardProps = {
  building: Building
  canBuy: boolean
  onBuy: () => void
}

const BuildingCard = ({ building, canBuy, onBuy }: BuildingCardProps) => {
  const cost = getBuildingCost(building)

  return (
    <div className="shop-card">
      <div>
        <div className="shop-card__title">
          <h4>{building.name}</h4>
          <span className="shop-card__count">x{building.count}</span>
        </div>
        <p className="shop-card__desc">{building.desc}</p>
      </div>
      <div className="shop-card__meta">
        <div>
          <span>Доход</span>
          <strong>+{formatNumber(building.baseIncome, 2)}/сек</strong>
        </div>
        <div>
          <span>Стоимость</span>
          <strong>{formatNumber(cost)}</strong>
        </div>
      </div>
      <button className="primary-button" type="button" onClick={onBuy} disabled={!canBuy}>
        Купить
      </button>
    </div>
  )
}

export default BuildingCard
