import { type Building, getBuildingCost } from '../modules/buildings'
import { formatNumber } from '../modules/format'

type BuildingCardProps = {
  building: Building
  canBuy: boolean
  onBuy: () => void
  incomePerUnit: number
  totalIncome: number
}

const BuildingCard = ({ building, canBuy, onBuy, incomePerUnit, totalIncome }: BuildingCardProps) => {
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
          <span>Доход за 1</span>
          <strong>+{formatNumber(incomePerUnit, 2)}/сек</strong>
        </div>
        <div>
          <span>Итого</span>
          <strong>+{formatNumber(totalIncome, 2)}/сек</strong>
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
