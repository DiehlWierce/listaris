import { type Building, getBuildingCost } from '../modules/buildings'
import { formatNumber } from '../modules/format'

type BuildingCardProps = {
  building: Building
  canBuy: boolean
  onBuy: () => void
  incomePerUnit: number
  totalIncome: number
  sparkIncomePerUnit: number
  sparkTotalIncome: number
  sparkCost: number
}

const BuildingCard = ({
  building,
  canBuy,
  onBuy,
  incomePerUnit,
  totalIncome,
  sparkIncomePerUnit,
  sparkTotalIncome,
  sparkCost
}: BuildingCardProps) => {
  const cost = getBuildingCost(building)
  const hasSparkIncome = sparkIncomePerUnit > 0 || sparkTotalIncome > 0
  const hasSparkCost = sparkCost > 0

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
        {hasSparkIncome && (
          <div>
            <span>Искры</span>
            <strong>+{formatNumber(sparkTotalIncome, 2)}/сек</strong>
          </div>
        )}
        <div>
          <span>Стоимость</span>
          <strong>{formatNumber(cost)}</strong>
        </div>
        {hasSparkCost && (
          <div>
            <span>Искры</span>
            <strong>{formatNumber(sparkCost, 1)}</strong>
          </div>
        )}
      </div>
      <button className="primary-button" type="button" onClick={onBuy} disabled={!canBuy}>
        Купить
      </button>
    </div>
  )
}

export default BuildingCard
