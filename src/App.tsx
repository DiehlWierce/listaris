import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import BuildingCard from './components/BuildingCard'
import ResourcePanel from './components/ResourcePanel'
import SectionCard from './components/SectionCard'
import UpgradeCard from './components/UpgradeCard'
import { achievements } from './modules/achievements'
import { buildingData, getBuildingCost, getBuildingSparkCost, type Building } from './modules/buildings'
import { faqItems } from './modules/faq'
import { formatDateTime, formatNumber } from './modules/format'
import { storyParagraphs } from './modules/story'
import { upgradeData } from './modules/upgrades'

const SAVE_KEY = 'listaris.save.v3'

const initialBuildings = buildingData.map((building) => ({ ...building }))

const PRESTIGE_THRESHOLD = 25000
const PRESTIGE_MULTIPLIER = 0.06
const BOOST_DURATION = 20000
const BOOST_COOLDOWN = 65000
const BOOST_MULTIPLIER = 1.35

type GameState = {
  coins: number
  sparks: number
  buildings: Building[]
  upgrades: string[]
  totalClicks: number
  prestige: number
  lastSavedAt: number
}

type GameAction =
  | { type: 'addCoins'; amount: number }
  | { type: 'addSparks'; amount: number }
  | { type: 'addClicks'; amount: number }
  | { type: 'buyBuilding'; id: string }
  | { type: 'buyUpgrade'; id: string }
  | { type: 'loadState'; payload: GameState }
  | { type: 'reset' }
  | { type: 'prestige'; gain: number }
  | { type: 'registerClick' }
  | { type: 'updateSaveTimestamp'; timestamp: number }

type Particle = {
  id: number
  x: number
  y: number
  text: string
}

type AmbientParticle = {
  id: number
  left: number
  top: number
  size: number
  delay: number
  duration: number
  emoji: string
}

const defaultState: GameState = {
  coins: 0,
  sparks: 0,
  buildings: initialBuildings,
  upgrades: [],
  totalClicks: 0,
  prestige: 0,
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
    sparks: Number(saved.sparks ?? defaultState.sparks),
    buildings,
    upgrades: Array.isArray(saved.upgrades) ? saved.upgrades : [],
    totalClicks: Number(saved.totalClicks ?? 0),
    prestige: Number(saved.prestige ?? 0),
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
    case 'addSparks':
      return { ...state, sparks: state.sparks + action.amount }
    case 'addClicks':
      return { ...state, totalClicks: state.totalClicks + action.amount }
    case 'registerClick':
      return { ...state, totalClicks: state.totalClicks + 1 }
    case 'buyBuilding': {
      const building = state.buildings.find((item) => item.id === action.id)
      if (!building) return state
      const cost = getBuildingCost(building)
      const sparkCost = getBuildingSparkCost(building)
      if (state.coins < cost || state.sparks < sparkCost) return state
      return {
        ...state,
        coins: state.coins - cost,
        sparks: state.sparks - sparkCost,
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
      const sparkCost = upgrade.sparkCost ?? 0
      if (state.coins < upgrade.cost) return state
      if (state.sparks < sparkCost) return state
      if (state.coins < upgrade.unlockAt) return state
      if (!meetsUpgradeRequirement(state, action.id)) return state
      return {
        ...state,
        coins: state.coins - upgrade.cost,
        sparks: state.sparks - sparkCost,
        upgrades: [...state.upgrades, action.id]
      }
    }
    case 'loadState':
      return action.payload
    case 'reset':
      return { ...defaultState, lastSavedAt: Date.now() }
    case 'prestige':
      return {
        ...defaultState,
        prestige: state.prestige + action.gain,
        lastSavedAt: Date.now()
      }
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
  { id: 'prestige', label: 'Престиж' },
  { id: 'achievements', label: 'Достижения' },
  { id: 'story', label: 'История мира' },
  { id: 'faq', label: 'FAQ' }
]

const App = () => {
  const [state, dispatch] = useReducer(gameReducer, defaultState)
  const [activeTab, setActiveTab] = useState(tabs[0].id)
  const [particles, setParticles] = useState<Particle[]>([])
  const [isClickingDisabled, setIsClickingDisabled] = useState(false)
  const [boostState, setBoostState] = useState({ activeUntil: 0, cooldownUntil: 0 })
  const [now, setNow] = useState(Date.now())
  const clickButtonRef = useRef<HTMLButtonElement | null>(null)
  const particleIdCounter = useRef(0)
  const saveTimeout = useRef<number | undefined>(undefined)

  const ownedUpgrades = useMemo(() => new Set(state.upgrades), [state.upgrades])

  const ambientParticles = useMemo<AmbientParticle[]>(() => {
    const emojis = ['✨', '💫', '🌟', '🟣', '🔹', '🫧']
    return Array.from({ length: 18 }, (_, index) => ({
      id: index,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 14 + Math.random() * 22,
      delay: Math.random() * 6,
      duration: 12 + Math.random() * 10,
      emoji: emojis[index % emojis.length]
    }))
  }, [])

  const prestigeMultiplier = useMemo(() => 1 + state.prestige * PRESTIGE_MULTIPLIER, [state.prestige])
  const boostActive = now < boostState.activeUntil
  const boostMultiplier = boostActive ? BOOST_MULTIPLIER : 1
  const boostCooldown = now < boostState.cooldownUntil

  const globalIncomeMultiplier = useMemo(() => {
    return upgradeData.reduce((sum, upgrade) => {
      if (!upgrade.targetBuildingId && upgrade.incomeMultiplier && ownedUpgrades.has(upgrade.id)) {
        return sum + upgrade.incomeMultiplier
      }
      return sum
    }, 0)
  }, [ownedUpgrades])

  const globalSparkMultiplier = useMemo(() => {
    return upgradeData.reduce((sum, upgrade) => {
      if (!upgrade.targetBuildingId && upgrade.sparkMultiplier && ownedUpgrades.has(upgrade.id)) {
        return sum + upgrade.sparkMultiplier
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

  const autoClicksPerSec = useMemo(() => {
    const buildingClicks = state.buildings.reduce(
      (sum, building) => sum + (building.baseAutoClicks ?? 0) * building.count,
      0
    )

    const upgradeClicks = upgradeData.reduce(
      (sum, upgrade) => (ownedUpgrades.has(upgrade.id) ? sum + (upgrade.autoClicks ?? 0) : sum),
      0
    )

    return buildingClicks + upgradeClicks
  }, [ownedUpgrades, state.buildings])

  const effectiveClickValue = clickBonus * prestigeMultiplier * boostMultiplier

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

      const sparkMultiplier = upgradeData.reduce((acc, upgrade) => {
        if (
          upgrade.targetBuildingId === building.id &&
          ownedUpgrades.has(upgrade.id) &&
          upgrade.sparkMultiplier
        ) {
          return acc + upgrade.sparkMultiplier
        }
        return acc
      }, 0)

      const incomePerUnit =
        building.baseIncome * (1 + buildingMultiplier + globalIncomeMultiplier) * prestigeMultiplier * boostMultiplier
      const totalIncome = incomePerUnit * building.count

      const sparkIncomePerUnit =
        (building.baseSparkIncome ?? 0) * (1 + sparkMultiplier + globalSparkMultiplier) * prestigeMultiplier
      const sparkTotalIncome = sparkIncomePerUnit * building.count

      return {
        ...map,
        [building.id]: {
          incomePerUnit,
          totalIncome,
          sparkIncomePerUnit,
          sparkTotalIncome
        }
      }
    }, {} as Record<string, { incomePerUnit: number; totalIncome: number; sparkIncomePerUnit: number; sparkTotalIncome: number }>)
  }, [boostMultiplier, globalIncomeMultiplier, globalSparkMultiplier, ownedUpgrades, prestigeMultiplier, state.buildings])

  const coinsPerSec = useMemo(() => {
    return state.buildings.reduce((sum, building) => sum + (buildingIncomeMap[building.id]?.totalIncome ?? 0), 0)
  }, [buildingIncomeMap, state.buildings])

  const sparksPerSec = useMemo(() => {
    return state.buildings.reduce(
      (sum, building) => sum + (buildingIncomeMap[building.id]?.sparkTotalIncome ?? 0),
      0
    )
  }, [buildingIncomeMap, state.buildings])

  const prestigeGain = Math.floor(Math.sqrt(state.coins / PRESTIGE_THRESHOLD))

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
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
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
  }, [state.coins, state.sparks, state.buildings, state.upgrades, state.totalClicks, state.prestige])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const coinsGain = coinsPerSec / 10 + (autoClicksPerSec * effectiveClickValue) / 10
      const sparkGain = sparksPerSec / 10

      dispatch({ type: 'addCoins', amount: coinsGain })
      if (sparkGain > 0) dispatch({ type: 'addSparks', amount: sparkGain })
      if (autoClicksPerSec > 0) dispatch({ type: 'addClicks', amount: autoClicksPerSec / 10 })
    }, 100)

    return () => window.clearInterval(interval)
  }, [autoClicksPerSec, coinsPerSec, effectiveClickValue, sparksPerSec])

  const handleClick = () => {
    if (isClickingDisabled || !clickButtonRef.current) return

    const appContainer = document.querySelector('.app-container')
    if (!appContainer) return

    const appRect = appContainer.getBoundingClientRect()
    const buttonRect = clickButtonRef.current.getBoundingClientRect()
    const x = buttonRect.left - appRect.left + Math.random() * buttonRect.width
    const y = buttonRect.top - appRect.top + Math.random() * buttonRect.height

    dispatch({ type: 'addCoins', amount: effectiveClickValue })
    dispatch({ type: 'registerClick' })

    const newParticle: Particle = {
      id: particleIdCounter.current++,
      x,
      y,
      text: `+${formatNumber(effectiveClickValue, 0)} ✨`
    }

    setParticles((prev) => [...prev, newParticle])
    setIsClickingDisabled(true)

    window.setTimeout(() => setIsClickingDisabled(false), 80)
    window.setTimeout(() => {
      setParticles((prev) => prev.filter((particle) => particle.id !== newParticle.id))
    }, 1000)
  }

  const handleBoost = () => {
    if (boostActive || boostCooldown) return
    const timestamp = Date.now()
    setBoostState({
      activeUntil: timestamp + BOOST_DURATION,
      cooldownUntil: timestamp + BOOST_COOLDOWN
    })
  }

  const handlePrestige = () => {
    if (prestigeGain <= 0) return
    dispatch({ type: 'prestige', gain: prestigeGain })
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
      label: 'Листы ✨',
      value: formatNumber(state.coins),
      hint: `+${formatNumber(coinsPerSec)}/сек`
    },
    {
      id: 'sparks',
      label: 'Искры ⚡',
      value: formatNumber(state.sparks, 1),
      hint: `+${formatNumber(sparksPerSec, 2)}/сек`
    },
    {
      id: 'click',
      label: 'Клик 👆',
      value: `+${formatNumber(effectiveClickValue, 0)}`,
      hint: `Автоклики: ${formatNumber(autoClicksPerSec, 1)}/сек`
    },
    {
      id: 'prestige',
      label: 'Сияние 🟣',
      value: formatNumber(state.prestige, 0),
      hint: `Бонус: +${formatNumber(state.prestige * PRESTIGE_MULTIPLIER * 100, 1)}%`
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
      case 'sparks':
        return state.sparks
      case 'prestige':
        return state.prestige
      default:
        return 0
    }
  }

  return (
    <div className="app-container">
      <div className="ambient-particles">
        {ambientParticles.map((particle) => (
          <span
            key={particle.id}
            className="ambient-particle"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              fontSize: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          >
            {particle.emoji}
          </span>
        ))}
      </div>
      <div className="container">
        <header className="app-header">
          <div className="header-top">
            <div>
              <span className="pre-release-pill">Световой дирижёр</span>
              <h1 className="app-title">Листарис: Пульс Сияния</h1>
              <p className="subtitle">
                Превратите город в бесконечный неоновый оркестр: собирайте листы, выращивайте искры и
                запускайте престиж.
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
              <h2>Пульс экспедиции 🌌</h2>
              <p>
                Запускайте клики, усиливайте здания и включайте всплески энергии, чтобы ускорять рост
                города.
              </p>
              <div className="hero-stats">
                <div>
                  <span>Листы/сек</span>
                  <strong>{formatNumber(coinsPerSec)}</strong>
                </div>
                <div>
                  <span>Искры/сек</span>
                  <strong>{formatNumber(sparksPerSec, 2)}</strong>
                </div>
                <div>
                  <span>Автоклики</span>
                  <strong>{formatNumber(autoClicksPerSec, 1)}/сек</strong>
                </div>
              </div>
              <div className="hero-boost">
                <button
                  className="boost-button"
                  type="button"
                  onClick={handleBoost}
                  disabled={boostActive || boostCooldown}
                >
                  {boostActive ? 'Всплеск активен ✨' : 'Запустить всплеск'}
                </button>
                <div className="boost-meta">
                  {boostActive && <span>+35% к доходу ещё {Math.ceil((boostState.activeUntil - now) / 1000)}с</span>}
                  {!boostActive && boostCooldown && (
                    <span>Перезарядка {Math.ceil((boostState.cooldownUntil - now) / 1000)}с</span>
                  )}
                  {!boostActive && !boostCooldown && <span>Мгновенный буст на {BOOST_DURATION / 1000}с</span>}
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
                <span className="scroll-emoji">🌟</span>
                <span className="scroll-label">Собрать импульс</span>
                <span className="scroll-subtitle">+{formatNumber(effectiveClickValue, 0)} за клик</span>
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
                    title="Панель управления"
                    description="Держите ритм роста и отслеживайте ускорители."
                    accent
                  >
                    <ul className="clean-list">
                      <li>Баланс: {formatNumber(state.coins)} листов</li>
                      <li>Искры: {formatNumber(state.sparks, 1)}</li>
                      <li>Кликов: {formatNumber(state.totalClicks, 0)}</li>
                      <li>Бонус престижа: +{formatNumber(state.prestige * PRESTIGE_MULTIPLIER * 100, 1)}%</li>
                    </ul>
                  </SectionCard>
                  <SectionCard
                    title="Следующие шаги"
                    description="Мини-план для ускорения цикла."
                  >
                    <ol className="clean-list">
                      <li>Постройте 3–4 люмин-кузницы.</li>
                      <li>Откройте кристальные архивы для искр.</li>
                      <li>Запустите всплеск энергии в нужный момент.</li>
                    </ol>
                  </SectionCard>
                  <SectionCard
                    title="Цикл роста"
                    description="Инкрементальная петля во всей красе."
                  >
                    <div className="chip-grid">
                      <div className="chip">
                        <strong>Клик → листы</strong>
                        <span>Ручной старт и мгновенный доход.</span>
                      </div>
                      <div className="chip">
                        <strong>Листы → постройки</strong>
                        <span>Автоматизация и экспоненциальный рост.</span>
                      </div>
                      <div className="chip">
                        <strong>Искры → апгрейды</strong>
                        <span>Сложные улучшения и бусты.</span>
                      </div>
                      <div className="chip">
                        <strong>Престиж → Сияние</strong>
                        <span>Сброс ради постоянного ускорения.</span>
                      </div>
                    </div>
                  </SectionCard>
                </section>
              )}

              {activeTab === 'buildings' && (
                <section className="shop-grid">
                  {buildingsUnlocked.map((building) => {
                    const incomeData = buildingIncomeMap[building.id] ?? {
                      incomePerUnit: 0,
                      totalIncome: 0,
                      sparkIncomePerUnit: 0,
                      sparkTotalIncome: 0
                    }
                    const sparkCost = getBuildingSparkCost(building)
                    return (
                      <BuildingCard
                        key={building.id}
                        building={building}
                        canBuy={state.coins >= getBuildingCost(building) && state.sparks >= sparkCost}
                        onBuy={() => dispatch({ type: 'buyBuilding', id: building.id })}
                        incomePerUnit={incomeData.incomePerUnit}
                        totalIncome={incomeData.totalIncome}
                        sparkIncomePerUnit={incomeData.sparkIncomePerUnit}
                        sparkTotalIncome={incomeData.sparkTotalIncome}
                        sparkCost={sparkCost}
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
                    const sparkCost = upgrade.sparkCost ?? 0
                    const canBuy = state.coins >= upgrade.cost && state.sparks >= sparkCost && !isOwned && meetsRequirement && isUnlocked

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

              {activeTab === 'prestige' && (
                <section className="overview-grid">
                  <SectionCard
                    title="Ритуал Сияния"
                    description="Сбросьте прогресс ради постоянного усиления."
                    accent={prestigeGain > 0}
                  >
                    <div className="prestige-panel">
                      <div>
                        <h4>Возможный прирост</h4>
                        <p>
                          При {formatNumber(state.coins)} листах вы получите {formatNumber(prestigeGain, 0)} очков Сияния.
                        </p>
                        <p>Каждое очко даёт +{formatNumber(PRESTIGE_MULTIPLIER * 100, 1)}% к доходу и кликам.</p>
                      </div>
                      <button
                        className="primary-button"
                        type="button"
                        onClick={handlePrestige}
                        disabled={prestigeGain <= 0}
                      >
                        Запустить престиж
                      </button>
                    </div>
                  </SectionCard>
                  <SectionCard
                    title="Подсказка"
                    description="Сияние ускоряет всё: листы, искры и автоклики."
                  >
                    <ul className="clean-list">
                      <li>Рекомендуется активировать после {formatNumber(PRESTIGE_THRESHOLD)} листов.</li>
                      <li>После престижа вы стартуете быстрее.</li>
                      <li>Сияние суммируется бесконечно.</li>
                    </ul>
                  </SectionCard>
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
                  <SectionCard title="Хроники Листариса" description="Новая легенда неонового города.">
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
