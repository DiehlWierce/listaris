import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import BuildingCard from './components/BuildingCard'
import ResourcePanel from './components/ResourcePanel'
import SectionCard from './components/SectionCard'
import UpgradeCard from './components/UpgradeCard'
import { buildingData, getBuildingCost, type Building } from './modules/buildings'
import { formatDateTime, formatNumber } from './modules/format'
import { futureBlocks, qualityChecklist, roadmapItems } from './modules/roadmap'
import { upgradeData } from './modules/upgrades'

const SAVE_KEY = 'listaris.save.v1'

const initialBuildings = buildingData.map((building) => ({ ...building }))

type GameState = {
  coins: number
  buildings: Building[]
  upgrades: string[]
  totalClicks: number
  lastSavedAt: number
}

type GameAction =
  | { type: 'addCoins'; amount: number }
  | { type: 'buyBuilding'; id: string }
  | { type: 'buyUpgrade'; id: string }
  | { type: 'loadState'; payload: GameState }
  | { type: 'reset' }
  | { type: 'registerClick' }
  | { type: 'updateSaveTimestamp'; timestamp: number }

type Particle = {
  id: number
  x: number
  y: number
  text: string
}

const defaultState: GameState = {
  coins: 0,
  buildings: initialBuildings,
  upgrades: [],
  totalClicks: 0,
  lastSavedAt: Date.now()
}

const hydrateState = (saved?: Partial<GameState>): GameState => {
  if (!saved) return { ...defaultState, lastSavedAt: Date.now() }

  const savedBuildings = Array.isArray(saved.buildings) ? saved.buildings : []

  const buildings = buildingData.map((building) => {
    const match = savedBuildings.find((item) => item.id === building.id)
    return {
      ...building,
      count: match?.count ?? building.count
    }
  })

  return {
    coins: Number(saved.coins ?? defaultState.coins),
    buildings,
    upgrades: Array.isArray(saved.upgrades) ? saved.upgrades : [],
    totalClicks: Number(saved.totalClicks ?? 0),
    lastSavedAt: Number(saved.lastSavedAt ?? Date.now())
  }
}

const meetsUpgradeRequirement = (state: GameState, upgradeId: string): boolean => {
  const upgrade = upgradeData.find((item) => item.id === upgradeId)
  if (!upgrade) return false
  if (!upgrade.requiresBuildings || !upgrade.targetBuildingId) return true

  const targetBuilding = state.buildings.find((building) => building.id === upgrade.targetBuildingId)
  return (targetBuilding?.count ?? 0) >= upgrade.requiresBuildings
}

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'addCoins':
      return { ...state, coins: state.coins + action.amount }
    case 'registerClick':
      return { ...state, totalClicks: state.totalClicks + 1 }
    case 'buyBuilding': {
      const building = state.buildings.find((item) => item.id === action.id)
      if (!building) return state
      const cost = getBuildingCost(building)
      if (state.coins < cost) return state
      return {
        ...state,
        coins: state.coins - cost,
        buildings: state.buildings.map((item) =>
          item.id === action.id
            ? { ...item, count: item.count + 1 }
            : item
        )
      }
    }
    case 'buyUpgrade': {
      if (state.upgrades.includes(action.id)) return state
      const upgrade = upgradeData.find((item) => item.id === action.id)
      if (!upgrade) return state
      if (state.coins < upgrade.cost) return state
      if (!meetsUpgradeRequirement(state, action.id)) return state
      return {
        ...state,
        coins: state.coins - upgrade.cost,
        upgrades: [...state.upgrades, action.id]
      }
    }
    case 'loadState':
      return action.payload
    case 'reset':
      return { ...defaultState, lastSavedAt: Date.now() }
    case 'updateSaveTimestamp':
      return { ...state, lastSavedAt: action.timestamp }
    default:
      return state
  }
}

const tabs = [
  { id: 'overview', label: 'Обзор' },
  { id: 'buildings', label: 'Постройки' },
  { id: 'upgrades', label: 'Улучшения' },
  { id: 'progress', label: 'Прогресс' },
  { id: 'roadmap', label: 'Дорожная карта' }
]

const App = () => {
  const [state, dispatch] = useReducer(gameReducer, defaultState)
  const [activeTab, setActiveTab] = useState(tabs[0].id)
  const [particles, setParticles] = useState<Particle[]>([])
  const [isClickingDisabled, setIsClickingDisabled] = useState(false)
  const clickButtonRef = useRef<HTMLButtonElement | null>(null)
  const particleIdCounter = useRef(0)
  const saveTimeout = useRef<number | undefined>(undefined)

  const ownedUpgrades = useMemo(() => new Set(state.upgrades), [state.upgrades])

  const clickBonus = useMemo(
    () =>
      upgradeData.reduce((sum, upgrade) =>
        ownedUpgrades.has(upgrade.id) && upgrade.clickBonus
          ? sum + upgrade.clickBonus
          : sum,
      1),
    [ownedUpgrades]
  )

  const coinsPerSec = useMemo(() => {
    return state.buildings.reduce((sum, building) => {
      const upgradeMultiplier = upgradeData.reduce((acc, upgrade) => {
        if (
          upgrade.targetBuildingId === building.id &&
          ownedUpgrades.has(upgrade.id) &&
          upgrade.incomeMultiplier
        ) {
          return acc + upgrade.incomeMultiplier
        }
        return acc
      }, 0)

      return sum + building.count * building.baseIncome * (1 + upgradeMultiplier)
    }, 0)
  }, [ownedUpgrades, state.buildings])

  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY)
    if (!saved) return

    try {
      const parsed = JSON.parse(saved) as Partial<GameState>
      dispatch({ type: 'loadState', payload: hydrateState(parsed) })
    } catch (error) {
      console.warn('Не удалось загрузить сохранение', error)
    }
  }, [])

  useEffect(() => {
    window.clearTimeout(saveTimeout.current)

    saveTimeout.current = window.setTimeout(() => {
      const timestamp = Date.now()
      const payload: GameState = { ...state, lastSavedAt: timestamp }
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload))
      dispatch({ type: 'updateSaveTimestamp', timestamp })
    }, 600)

    return () => window.clearTimeout(saveTimeout.current)
  }, [state.coins, state.buildings, state.upgrades, state.totalClicks])

  useEffect(() => {
    const interval = window.setInterval(() => {
      dispatch({ type: 'addCoins', amount: coinsPerSec / 10 })
    }, 100)

    return () => window.clearInterval(interval)
  }, [coinsPerSec])

  const handleClick = () => {
    if (isClickingDisabled || !clickButtonRef.current) return

    const appContainer = document.querySelector('.app-container')
    if (!appContainer) return

    const appRect = appContainer.getBoundingClientRect()
    const buttonRect = clickButtonRef.current.getBoundingClientRect()
    const x = buttonRect.left - appRect.left + Math.random() * buttonRect.width
    const y = buttonRect.top - appRect.top + Math.random() * buttonRect.height

    dispatch({ type: 'addCoins', amount: clickBonus })
    dispatch({ type: 'registerClick' })

    const newParticle: Particle = {
      id: particleIdCounter.current++,
      x,
      y,
      text: `+${clickBonus}`
    }

    setParticles((prev) => [...prev, newParticle])
    setIsClickingDisabled(true)

    window.setTimeout(() => setIsClickingDisabled(false), 80)
    window.setTimeout(() => {
      setParticles((prev) => prev.filter((particle) => particle.id !== newParticle.id))
    }, 1000)
  }

  const buildingsUnlocked = state.buildings.filter(
    (building) => state.coins >= building.unlockAt || building.count > 0
  )

  const lockedBuildings = state.buildings.filter(
    (building) => !buildingsUnlocked.includes(building)
  )

  const nextBuilding = lockedBuildings
    .sort((a, b) => a.unlockAt - b.unlockAt)
    .find(Boolean)

  const resourceItems = [
    {
      id: 'coins',
      label: 'Листы',
      value: formatNumber(state.coins),
      hint: `+${formatNumber(coinsPerSec)}/сек`
    },
    {
      id: 'click',
      label: 'Клик',
      value: `+${formatNumber(clickBonus, 0)}`,
      hint: `Всего кликов: ${formatNumber(state.totalClicks, 0)}`
    },
    {
      id: 'buildings',
      label: 'Постройки',
      value: `${state.buildings.reduce((sum, building) => sum + building.count, 0)}`,
      hint: nextBuilding ? `Следующее: ${nextBuilding.name}` : 'Все здания открыты'
    }
  ]

  return (
    <div className="app-container">
      <div className="container">
        <header className="app-header">
          <div className="header-top">
            <div>
              <span className="pre-release-pill">Релизная сборка · v1.0</span>
              <h1 className="app-title">Листарис</h1>
              <p className="subtitle">
                Ведите экспедицию, расшифровывайте хроники и стройте инфраструктуру древней цивилизации.
              </p>
            </div>
            <div className="header-actions">
              <button className="secondary-button" type="button" onClick={() => dispatch({ type: 'reset' })}>
                Сбросить прогресс
              </button>
              <div className="last-save">
                <span>Последнее сохранение</span>
                <strong>{formatDateTime(state.lastSavedAt)}</strong>
              </div>
            </div>
          </div>
          <ResourcePanel items={resourceItems} />
        </header>

        <main className="app-main">
          <section className="hero-panel">
            <div className="hero-copy">
              <h2>Командный центр экспедиции</h2>
              <p>
                Быстро запускайте раскопки, отслеживайте ключевые показатели и открывайте новые постройки.
              </p>
              <div className="hero-stats">
                <div>
                  <span>Экономика</span>
                  <strong>{formatNumber(coinsPerSec)}/сек</strong>
                </div>
                <div>
                  <span>Активные зоны</span>
                  <strong>{buildingsUnlocked.length}</strong>
                </div>
                <div>
                  <span>Апгрейды</span>
                  <strong>{state.upgrades.length}</strong>
                </div>
              </div>
            </div>
            <div className="hero-action">
              <button
                className="scroll-button"
                onClick={handleClick}
                disabled={isClickingDisabled}
                ref={clickButtonRef}
              >
                <span className="scroll-emoji">📜</span>
                <span className="scroll-label">Расшифровать лист</span>
                <span className="scroll-subtitle">+{formatNumber(clickBonus, 0)} за клик</span>
              </button>
            </div>
          </section>

          <div className="tab-panel">
            <nav className="tab-bar" aria-label="Навигация по разделам">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`tab-button ${activeTab === tab.id ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="tab-content">
              {activeTab === 'overview' && (
                <section className="overview-grid">
                  <SectionCard
                    title="Панель контроля"
                    description="Следите за основными метриками, чтобы держать экономику в зелёной зоне."
                    accent
                  >
                    <ul className="clean-list">
                      <li>Баланс: {formatNumber(state.coins)}</li>
                      <li>Скорость: {formatNumber(coinsPerSec)}/сек</li>
                      <li>Кликов: {formatNumber(state.totalClicks, 0)}</li>
                    </ul>
                  </SectionCard>
                  <SectionCard
                    title="Сценарии на сегодня"
                    description="Рекомендуемые шаги, чтобы ускорить рост."
                  >
                    <ol className="clean-list">
                      <li>Купить хотя бы 2 экскаватора.</li>
                      <li>Подготовить лагерь и открыть Архив.</li>
                      <li>Собрать апгрейд для ускорения кликов.</li>
                    </ol>
                  </SectionCard>
                  <SectionCard
                    title="Будущие доработки"
                    description="Блоки, обозначенные ранее как запланированные, теперь структурированы для релиза."
                  >
                    <div className="chip-grid">
                      {futureBlocks.map((block) => (
                        <div className="chip" key={block.title}>
                          <strong>{block.title}</strong>
                          <span>{block.description}</span>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </section>
              )}

              {activeTab === 'buildings' && (
                <section className="shop-grid">
                  {buildingsUnlocked.map((building) => (
                    <BuildingCard
                      key={building.id}
                      building={building}
                      canBuy={state.coins >= getBuildingCost(building)}
                      onBuy={() => dispatch({ type: 'buyBuilding', id: building.id })}
                    />
                  ))}
                  {lockedBuildings.map((building) => (
                    <div className="shop-card shop-card--locked" key={building.id}>
                      <div>
                        <div className="shop-card__title">
                          <h4>{building.name}</h4>
                          <span className="status-pill">Закрыто</span>
                        </div>
                        <p className="shop-card__desc">Откроется при {formatNumber(building.unlockAt)} листах.</p>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {activeTab === 'upgrades' && (
                <section className="shop-grid">
                  {upgradeData.map((upgrade) => {
                    const isOwned = ownedUpgrades.has(upgrade.id)
                    const targetBuilding = state.buildings.find(
                      (building) => building.id === upgrade.targetBuildingId
                    )
                    const meetsRequirement = upgrade.requiresBuildings
                      ? (targetBuilding?.count ?? 0) >= upgrade.requiresBuildings
                      : true
                    const canBuy = state.coins >= upgrade.cost && !isOwned && meetsRequirement

                    const requirementLabel = upgrade.requiresBuildings
                      ? `${upgrade.requiresBuildings}+ ${targetBuilding?.name ?? 'построек'}`
                      : undefined

                    return (
                      <UpgradeCard
                        key={upgrade.id}
                        upgrade={upgrade}
                        isOwned={isOwned}
                        canBuy={canBuy}
                        onBuy={() => dispatch({ type: 'buyUpgrade', id: upgrade.id })}
                        requirementLabel={requirementLabel}
                      />
                    )
                  })}
                </section>
              )}

              {activeTab === 'progress' && (
                <section className="overview-grid">
                  <SectionCard
                    title="Качество релиза"
                    description="Проверьте, что продукт готов к продаже и масштабированию."
                    accent
                  >
                    <ul className="clean-list">
                      {qualityChecklist.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </SectionCard>
                  <SectionCard
                    title="Технический статус"
                    description="Ключевые системы, которые уже активны в релизе."
                  >
                    <ul className="clean-list">
                      <li>Автодобыча каждые 100 мс.</li>
                      <li>Динамическая экономика построек.</li>
                      <li>Сохранение прогресса локально.</li>
                      <li>UI оптимизирован под короткие сессии.</li>
                    </ul>
                  </SectionCard>
                  <SectionCard
                    title="Следующие контрольные точки"
                    description="Сфокусируйтесь на росте вовлечённости."
                  >
                    <ol className="clean-list">
                      <li>Добавить ежедневные задания.</li>
                      <li>Запустить линейку достижений.</li>
                      <li>Подготовить сюжетный акт II.</li>
                    </ol>
                  </SectionCard>
                </section>
              )}

              {activeTab === 'roadmap' && (
                <section className="overview-grid">
                  {roadmapItems.map((item) => (
                    <SectionCard
                      key={item.id}
                      title={item.title}
                      description={item.status === 'ready' ? 'Готово' : item.status === 'active' ? 'В работе' : 'Запланировано'}
                      accent={item.status === 'active'}
                    >
                      <ul className="clean-list">
                        {item.items.map((entry) => (
                          <li key={entry}>{entry}</li>
                        ))}
                      </ul>
                    </SectionCard>
                  ))}
                </section>
              )}
            </div>
          </div>

          <div className="particles-container">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="particle"
                style={{
                  left: `${particle.x}px`,
                  top: `${particle.y}px`
                }}
              >
                {particle.text}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
