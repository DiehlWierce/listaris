import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import ResourcePanel from './components/ResourcePanel'
import { buildingData, getBuildingCost, type Building } from './modules/buildings'

const initialBuildings = buildingData.map((building) => ({ ...building }))

type GameState = {
  coins: number
  buildings: Building[]
}

type GameAction =
  | { type: 'addCoins'; amount: number }
  | { type: 'buyBuilding'; id: string }

type Particle = {
  id: number
  x: number
  y: number
  text: string
  color: string
  size: string
}

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'addCoins':
      return { ...state, coins: state.coins + action.amount }
    case 'buyBuilding': {
      const building = state.buildings.find((item) => item.id === action.id)
      if (!building) return state
      const cost = getBuildingCost(building)
      if (state.coins < cost) return state
      return {
        coins: state.coins - cost,
        buildings: state.buildings.map((item) =>
          item.id === action.id
            ? { ...item, count: item.count + 1 }
            : item
        )
      }
    }
    default:
      return state
  }
}

const tabs = [
  { id: 'overview', label: '🌌 Обзор' },
  { id: 'buildings', label: '🏗️ Постройки' },
  { id: 'progress', label: '📈 Прогресс' },
  { id: 'roadmap', label: '🧭 Дорожная карта' }
]

const App = () => {
  const [state, dispatch] = useReducer(gameReducer, {
    coins: 0,
    buildings: initialBuildings
  })
  const [activeTab, setActiveTab] = useState(tabs[0].id)
  const [particles, setParticles] = useState<Particle[]>([])
  const [isClickingDisabled, setIsClickingDisabled] = useState(false)
  const clickButtonRef = useRef<HTMLButtonElement | null>(null)
  const particleIdCounter = useRef(0)

  const coinsPerSec = useMemo(
    () => state.buildings.reduce((sum, building) => sum + building.count * building.baseIncome, 0),
    [state.buildings]
  )

  const excavator = useMemo(
    () => state.buildings.find((building) => building.id === 'excavator'),
    [state.buildings]
  )

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

    dispatch({ type: 'addCoins', amount: 1 })

    const newParticle: Particle = {
      id: particleIdCounter.current++,
      x,
      y,
      text: '+1',
      color: '#4ade80',
      size: '1.2rem'
    }

    setParticles((prev) => [...prev, newParticle])
    setIsClickingDisabled(true)

    window.setTimeout(() => setIsClickingDisabled(false), 100)
    window.setTimeout(() => {
      setParticles((prev) => prev.filter((particle) => particle.id !== newParticle.id))
    }, 1000)
  }

  return (
    <div className="app-container dark">
      <div className="container">
        <header className="app-header">
          <div className="pre-release-pill">Предрелиз · SPA</div>
          <h1 className="app-title">
            <span className="title-icon">📜</span>
            <span className="title-text">Листарис</span>
          </h1>
          <p className="subtitle">
            Восстанавливай хроники древней цивилизации, автоматизируй раскопки и готовься к запуску кампании.
          </p>
          <ResourcePanel coins={state.coins} coinsPerSec={coinsPerSec} />
        </header>

        <main className="app-main">
          <div className="click-section">
            <button
              className="scroll-button"
              onClick={handleClick}
              disabled={isClickingDisabled}
              ref={clickButtonRef}
            >
              <span className="scroll-emoji">📜</span>
              <span className="scroll-label">Листать</span>
            </button>
          </div>

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
                  <div className="info-card">
                    <h3>Состояние раскопок</h3>
                    <p>Текущие листы: <strong>{state.coins.toFixed(1)}</strong></p>
                    <p>Скорость добычи: <strong>{coinsPerSec.toFixed(1)}</strong> / сек</p>
                    <p>Активных построек: <strong>{state.buildings.reduce((sum, building) => sum + building.count, 0)}</strong></p>
                  </div>
                  <div className="info-card">
                    <h3>Ключевые системы</h3>
                    <ul>
                      <li>Клик + автодобыча</li>
                      <li>Экономика построек</li>
                      <li>План развития контента</li>
                    </ul>
                  </div>
                  <div className="info-card">
                    <h3>Следующий релиз</h3>
                    <p>Улучшения интерфейса и новые здания второго акта.</p>
                    <p>Добавить события, достижения и сохранение прогресса.</p>
                  </div>
                </section>
              )}

              {activeTab === 'buildings' && (
                <section className="building-section">
                  {excavator && (
                    <>
                      <h3 className="building-title">{excavator.name}</h3>
                      <p className="building-desc">{excavator.desc}</p>
                      <p className="building-stats">Количество: {excavator.count}</p>
                      <p className="building-cost">
                        Стоимость: {getBuildingCost(excavator)} 📜
                      </p>
                      <button
                        className="buy-button"
                        onClick={() => dispatch({ type: 'buyBuilding', id: 'excavator' })}
                        disabled={state.coins < getBuildingCost(excavator)}
                      >
                        Купить
                      </button>
                    </>
                  )}
                </section>
              )}

              {activeTab === 'progress' && (
                <section className="progress-panel">
                  <div className="info-card">
                    <h3>Дневник прогресса</h3>
                    <ul>
                      <li>Стабильный цикл добычи с шагом 100 мс.</li>
                      <li>Система стоимости зданий растёт экспоненциально.</li>
                      <li>Частицы подтверждают клики и увеличивают вовлечённость.</li>
                    </ul>
                  </div>
                  <div className="info-card">
                    <h3>Риски</h3>
                    <p>Нет сохранения. Нет второй ветки построек.</p>
                    <p>Нужна балансировка экономики для первых 15 минут игры.</p>
                  </div>
                </section>
              )}

              {activeTab === 'roadmap' && (
                <section className="roadmap">
                  <div className="info-card">
                    <h3>Предрелизный чек-лист</h3>
                    <ol>
                      <li>Сохранение прогресса и восстановление после перезапуска.</li>
                      <li>Добавить апгрейды с визуальными подсказками.</li>
                      <li>Расширить вкладки и сценарии миссий.</li>
                    </ol>
                  </div>
                  <div className="info-card">
                    <h3>Готовность</h3>
                    <p>UI: 70%</p>
                    <p>Экономика: 40%</p>
                    <p>Контент: 20%</p>
                  </div>
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
                  top: `${particle.y}px`,
                  color: particle.color,
                  fontSize: particle.size
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
