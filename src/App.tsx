import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import BuildingCard from './components/BuildingCard'
import ResourcePanel from './components/ResourcePanel'
import SectionCard from './components/SectionCard'
import UpgradeCard from './components/UpgradeCard'
import { achievements } from './modules/achievements'
import { buildingData, getBuildingCost, type Building } from './modules/buildings'
import { faqItems } from './modules/faq'
import { formatDateTime, formatNumber } from './modules/format'
import { storyParagraphs } from './modules/story'
import { upgradeData } from './modules/upgrades'

const SAVE_KEY = 'listaris.save.v2'

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

  if (upgrade.requiresBuildings && upgrade.targetBuildingId) {
    const targetBuilding = state.buildings.find((building) => building.id === upgrade.targetBuildingId)
    if ((targetBuilding?.count ?? 0) < upgrade.requiresBuildings) return false
  }

  if (upgrade.requiresTotalBuildings) {
    const totalBuildings = state.buildings.reduce((sum, building) => sum + building.count, 0)
    if (totalBuildings < upgrade.requiresTotalBuildings) return false
  }

  return true
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
      if (state.coins < upgrade.unlockAt) return state
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
  { id: 'achievements', label: 'Достижения' },
  { id: 'story', label: 'История мира' },
  { id: 'faq', label: 'FAQ' }
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

  const globalIncomeMultiplier = useMemo(() => {
    return upgradeData.reduce((sum, upgrade) => {
      if (!upgrade.targetBuildingId && upgrade.incomeMultiplier && ownedUpgrades.has(upgrade.id)) {
        return sum + upgrade.incomeMultiplier
      }
      return sum
    }, 0)
  }, [ownedUpgrades])

  const clickBonus = useMemo(
    () =>
      upgradeData.reduce((sum, upgrade) =>
        ownedUpgrades.has(upgrade.id) && upgrade.clickBonus
          ? sum + upgrade.clickBonus
          : sum,
      1),
    [ownedUpgrades]
  )

  const buildingIncomeMap = useMemo(() => {
    return state.buildings.reduce((map, building) => {
      const buildingMultiplier = upgradeData.reduce((acc, upgrade) => {
        if (
          upgrade.targetBuildingId === building.id &&
          ownedUpgrades.has(upgrade.id) &&
          upgrade.incomeMultiplier
        ) {
          return acc + upgrade.incomeMultiplier
        }
        return acc
      }, 0)

      const incomePerUnit = building.baseIncome * (1 + buildingMultiplier + globalIncomeMultiplier)
      const totalIncome = incomePerUnit * building.count

      return {
        ...map,
        [building.id]: {
          incomePerUnit,
          totalIncome
        }
      }
    }, {} as Record<string, { incomePerUnit: number; totalIncome: number }>)
  }, [globalIncomeMultiplier, ownedUpgrades, state.buildings])

  const coinsPerSec = useMemo(() => {
    return state.buildings.reduce((sum, building) => sum + (buildingIncomeMap[building.id]?.totalIncome ?? 0), 0)
  }, [buildingIncomeMap, state.buildings])

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

  const totalBuildings = state.buildings.reduce((sum, building) => sum + building.count, 0)

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
      value: `${totalBuildings}`,
      hint: nextBuilding ? `Следующее: ${nextBuilding.name}` : 'Все здания открыты'
    }
  ]

  const achievementProgress = (metric: string): number => {
    switch (metric) {
      case 'coins':
        return state.coins
      case 'clicks':
        return state.totalClicks
      case 'buildings':
        return totalBuildings
      case 'upgrades':
        return state.upgrades.length
      case 'coinsPerSec':
        return coinsPerSec
      default:
        return 0
    }
  }

  return (
    <div className="app-container">
      <div className="container">
        <header className="app-header">
          <div className="header-top">
            <div>
              <span className="pre-release-pill">Центр экспедиции</span>
              <h1 className="app-title">Листарис</h1>
              <p className="subtitle">
                Руководите раскопками, усиливайте команду и собирайте древние листы, чтобы раскрыть тайны мира.
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
              <h2>Пульс экспедиции</h2>
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
                    description="Следите за основными метриками, чтобы держать темп экспедиции."
                    accent
                  >
                    <ul className="clean-list">
                      <li>Баланс: {formatNumber(state.coins)}</li>
                      <li>Скорость: {formatNumber(coinsPerSec)}/сек</li>
                      <li>Кликов: {formatNumber(state.totalClicks, 0)}</li>
                    </ul>
                  </SectionCard>
                  <SectionCard
                    title="Рекомендуемые шаги"
                    description="Небольшой чек-лист для ускорения роста."
                  >
                    <ol className="clean-list">
                      <li>Купить 2–3 экскаватора.</li>
                      <li>Развернуть полевой лагерь и архив.</li>
                      <li>Подобрать апгрейд для клика и дохода.</li>
                    </ol>
                  </SectionCard>
                  <SectionCard
                    title="Экспедиционная выжимка"
                    description="Что уже доступно прямо сейчас."
                  >
                    <div className="chip-grid">
                      <div className="chip">
                        <strong>Сохранения</strong>
                        <span>Прогресс фиксируется автоматически.</span>
                      </div>
                      <div className="chip">
                        <strong>Мультипликаторы</strong>
                        <span>Апгрейды усиливают здания и клики.</span>
                      </div>
                      <div className="chip">
                        <strong>Расширение базы</strong>
                        <span>Новые постройки открываются по мере роста.</span>
                      </div>
                    </div>
                  </SectionCard>
                </section>
              )}

              {activeTab === 'buildings' && (
                <section className="shop-grid">
                  {buildingsUnlocked.map((building) => {
                    const incomeData = buildingIncomeMap[building.id] ?? { incomePerUnit: 0, totalIncome: 0 }
                    return (
                      <BuildingCard
                        key={building.id}
                        building={building}
                        canBuy={state.coins >= getBuildingCost(building)}
                        onBuy={() => dispatch({ type: 'buyBuilding', id: building.id })}
                        incomePerUnit={incomeData.incomePerUnit}
                        totalIncome={incomeData.totalIncome}
                      />
                    )
                  })}
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
                    const isUnlocked = state.coins >= upgrade.unlockAt || isOwned
                    const meetsRequirement = meetsUpgradeRequirement(state, upgrade.id)
                    const canBuy = state.coins >= upgrade.cost && !isOwned && meetsRequirement && isUnlocked

                    const requirementLabels = [
                      `Открывается при ${formatNumber(upgrade.unlockAt)} листах.`
                    ]

                    if (upgrade.requiresBuildings && upgrade.targetBuildingId) {
                      const targetBuilding = state.buildings.find(
                        (building) => building.id === upgrade.targetBuildingId
                      )
                      requirementLabels.push(`Нужно ${upgrade.requiresBuildings}+ ${targetBuilding?.name ?? 'построек'}.`)
                    }

                    if (upgrade.requiresTotalBuildings) {
                      requirementLabels.push(`Нужно ${upgrade.requiresTotalBuildings}+ построек.`)
                    }

                    return (
                      <UpgradeCard
                        key={upgrade.id}
                        upgrade={upgrade}
                        isOwned={isOwned}
                        isLocked={!isUnlocked}
                        canBuy={canBuy}
                        onBuy={() => dispatch({ type: 'buyUpgrade', id: upgrade.id })}
                        requirementLabels={requirementLabels}
                      />
                    )
                  })}
                </section>
              )}

              {activeTab === 'achievements' && (
                <section className="overview-grid">
                  {achievements.map((achievement) => {
                    const progress = achievementProgress(achievement.metric)
                    const progressPercent = Math.min(100, (progress / achievement.target) * 100)
                    const isUnlocked = progress >= achievement.target

                    return (
                      <SectionCard
                        key={achievement.id}
                        title={achievement.title}
                        description={achievement.description}
                        accent={isUnlocked}
                      >
                        <div className="achievement-progress">
                          <div className="achievement-bar">
                            <div className="achievement-bar__fill" style={{ width: `${progressPercent}%` }} />
                          </div>
                          <div className="achievement-meta">
                            <span>{formatNumber(progress, 0)} / {formatNumber(achievement.target, 0)}</span>
                            <strong>{isUnlocked ? 'Открыто' : 'В процессе'}</strong>
                          </div>
                        </div>
                      </SectionCard>
                    )
                  })}
                </section>
              )}

              {activeTab === 'story' && (
                <section className="story-panel">
                  <SectionCard title="Хроники Листариса" description="Легенда мира, который вы восстанавливаете.">
                    <div className="story-text">
                      {storyParagraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </SectionCard>
                </section>
              )}

              {activeTab === 'faq' && (
                <section className="overview-grid">
                  {faqItems.map((item) => (
                    <SectionCard key={item.id} title={item.question} description={item.answer} />
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
