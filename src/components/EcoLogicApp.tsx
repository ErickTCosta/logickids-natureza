'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { ClimateChallenge, ClimateCategory, CLIMATE_CATEGORIES, getFallbackChallenge } from '@/data/fallbackChallenges'

type Screen = 'home' | 'quiz' | 'result'

const categoryDetails: Record<ClimateCategory, { icon: string; color: string; description: string }> = {
  'Condicional (SE / ENTÃO)': { icon: '🔀', color: '#0f766e', description: 'Aprenda a tomar decisões como um computador.' },
  'Sequência Lógica': { icon: '🧩', color: '#2563eb', description: 'Descubra padrões e o próximo passo.' },
  'Matemática Climática': { icon: '🌱', color: '#15803d', description: 'Use números para cuidar do planeta.' },
}

function ChallengeSkeleton() {
  return (
    <div className="eco-card eco-skeleton-card" aria-label="Carregando desafio" role="status">
      <div className="eco-skeleton eco-skeleton-small" />
      <div className="eco-skeleton eco-skeleton-title" />
      <div className="eco-skeleton eco-skeleton-line" />
      <div className="eco-skeleton eco-skeleton-line eco-skeleton-short" />
      <div className="eco-skeleton-options">
        {[1, 2, 3, 4].map((item) => <div className="eco-skeleton eco-skeleton-option" key={item} />)}
      </div>
    </div>
  )
}

export default function EcoLogicApp() {
  const [screen, setScreen] = useState<Screen>('home')
  const [category, setCategory] = useState<ClimateCategory>('Condicional (SE / ENTÃO)')
  const [challenge, setChallenge] = useState<ClimateChallenge | null>(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reforestation, setReforestation] = useState(60)
  const [solarEnergy, setSolarEnergy] = useState(60)

  const loadChallenge = useCallback(async (nextCategory: ClimateCategory) => {
    setLoading(true)
    setSelectedIndex(null)
    setError('')
    try {
      const response = await fetch('/api/gerar-desafio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: nextCategory }),
      })
      if (!response.ok) throw new Error('Não foi possível carregar o desafio.')
      setChallenge((await response.json()) as ClimateChallenge)
    } catch (loadError) {
      console.error('Erro ao carregar desafio:', loadError)
      setChallenge(getFallbackChallenge(nextCategory))
      setError('A missão offline foi ativada. Você ainda pode jogar!')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (screen === 'quiz') void loadChallenge(category)
  }, [category, loadChallenge, screen])

  function startQuiz(nextCategory: ClimateCategory) {
    setCategory(nextCategory)
    setQuestionNumber(0)
    setCorrectAnswers(0)
    setScreen('quiz')
  }

  function answer(index: number) {
    if (selectedIndex !== null || !challenge) return
    setSelectedIndex(index)
    if (index === challenge.correctIndex) setCorrectAnswers((value) => value + 1)
  }

  function nextQuestion() {
    if (questionNumber >= 4) {
      setScreen('result')
      return
    }
    setQuestionNumber((value) => value + 1)
    void loadChallenge(category)
  }

  const xp = correctAnswers * 20
  const planetStatus = reforestation >= 60 && solarEnergy >= 60
    ? { label: 'Planeta equilibrado!', emoji: '🌍', tone: 'good' }
    : { label: 'O planeta precisa de mais cuidado.', emoji: '🌡️', tone: 'warning' }

  return (
    <main className="eco-page">
      <header className="eco-header">
        <div className="eco-brand" aria-label="LogicKids Missão Clima">
          <span className="eco-brand-mark">🌿</span>
          <span>Logic<span>Kids</span></span>
        </div>
        <div className="eco-header-badge">ODS 13 · Ação Climática</div>
      </header>

      <div className="eco-container">
        {screen === 'home' && (
          <>
            <section className="eco-hero">
              <div>
                <p className="eco-eyebrow">MISSÃO CLIMA</p>
                <h1>Pequenas ideias,<br /><strong>grandes mudanças!</strong></h1>
                <p className="eco-hero-copy">Resolva desafios, ganhe XP e descubra como suas escolhas ajudam a cuidar da Terra.</p>
              </div>
              <div className="eco-hero-planet" aria-hidden="true">🌎</div>
            </section>

            <section className="eco-section">
              <div className="eco-section-heading">
                <div><p className="eco-eyebrow">ESCOLHA SUA MISSÃO</p><h2>Qual desafio você quer explorar?</h2></div>
                <span className="eco-xp-pill">⭐ 0 XP</span>
              </div>
              <div className="eco-category-grid">
                {CLIMATE_CATEGORIES.map((item) => {
                  const details = categoryDetails[item]
                  return (
                    <button className="eco-category" key={item} onClick={() => startQuiz(item)} style={{ '--category-color': details.color } as CSSProperties}>
                      <span className="eco-category-icon">{details.icon}</span>
                      <strong>{item}</strong>
                      <span>{details.description}</span>
                      <span className="eco-play">Começar missão <span aria-hidden="true">→</span></span>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="eco-lab">
              <div className="eco-lab-copy">
                <p className="eco-eyebrow">LABORATÓRIO DO CLIMA</p>
                <h2>Você no controle do planeta</h2>
                <p>Altere as variáveis e observe a regra <strong>SE / SENÃO</strong> em ação.</p>
              </div>
              <div className="eco-lab-controls">
                <label>🌳 Reflorestamento <output>{reforestation}%</output>
                  <input type="range" min="0" max="100" value={reforestation} onChange={(event) => setReforestation(Number(event.target.value))} />
                </label>
                <label>☀️ Energia solar <output>{solarEnergy}%</output>
                  <input type="range" min="0" max="100" value={solarEnergy} onChange={(event) => setSolarEnergy(Number(event.target.value))} />
                </label>
                <div className={`eco-planet-state ${planetStatus.tone}`}><span>{planetStatus.emoji}</span><strong>SE as escolhas forem boas...</strong><small>{planetStatus.label}</small></div>
              </div>
            </section>
          </>
        )}

        {screen === 'quiz' && (
          <section className="eco-quiz">
            <div className="eco-quiz-top">
              <button className="eco-back-button" onClick={() => setScreen('home')}>← Voltar</button>
              <div className="eco-progress-wrap"><div className="eco-progress"><span style={{ width: `${((questionNumber + (selectedIndex !== null ? 1 : 0)) / 5) * 100}%` }} /></div><span>{questionNumber + 1} de 5</span></div>
            </div>
            {error && <p className="eco-offline-message" role="status">{error}</p>}
            {loading || !challenge ? <ChallengeSkeleton /> : (
              <>
                <div className="eco-card eco-question-card">
                  <span className="eco-question-category">{categoryDetails[category].icon} {challenge.category}</span>
                  <h1>{challenge.title}</h1>
                  <p>{challenge.question}</p>
                  <div className="eco-hint">💡 <strong>Dica de lógica:</strong> {challenge.logicHint}</div>
                </div>
                <div className="eco-options">
                  {challenge.options.map((option, index) => {
                    const isCorrect = index === challenge.correctIndex
                    const isSelected = index === selectedIndex
                    const state = selectedIndex === null ? '' : isCorrect ? 'correct' : isSelected ? 'wrong' : 'muted'
                    return <button className={`eco-option ${state}`} key={option} disabled={selectedIndex !== null} onClick={() => answer(index)}><span>{String.fromCharCode(65 + index)}</span>{option}</button>
                  })}
                </div>
                {selectedIndex !== null && <div className={`eco-feedback ${selectedIndex === challenge.correctIndex ? 'correct' : 'wrong'}`} role="status"><strong>{selectedIndex === challenge.correctIndex ? '🎉 Muito bem!' : '💪 Continue tentando!'}</strong><p>{selectedIndex === challenge.correctIndex ? 'Você acertou e ganhou 20 XP.' : `A resposta certa era: ${challenge.options[challenge.correctIndex]}.`}</p></div>}
                {selectedIndex !== null && <div className="eco-fact"><span>🌱</span><div><strong>Pílula climática</strong><p>{challenge.ecoFact}</p></div></div>}
                {selectedIndex !== null && <button className="eco-primary-button eco-next-button" onClick={nextQuestion}>{questionNumber >= 4 ? 'Ver meu resultado' : 'Próximo desafio →'}</button>}
              </>
            )}
          </section>
        )}

        {screen === 'result' && (
          <section className="eco-result">
            <div className="eco-result-icon">🏆</div>
            <p className="eco-eyebrow">MISSÃO CONCLUÍDA</p>
            <h1>Você foi incrível!</h1>
            <p>Seu raciocínio ajuda a construir um futuro mais sustentável.</p>
            <div className="eco-score"><strong>{correctAnswers}/5</strong><span>desafios corretos</span><b>+{xp} XP</b></div>
            <button className="eco-primary-button" onClick={() => setScreen('home')}>Voltar ao mapa de missões</button>
          </section>
        )}
      </div>
      <footer className="eco-footer">LogicKids · Aprender, brincar e cuidar do planeta 🌱</footer>
    </main>
  )
}
