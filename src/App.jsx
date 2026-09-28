import React, { useEffect, useState } from 'react'
import { RECENT_SESSIONS, seedPlayers } from './data/mockData.js'

import Home from './screens/Home.jsx'
import SessionsTab from './screens/SessionsTab.jsx'
import PlayersTab from './screens/PlayersTab.jsx'
import ProfileTab from './screens/ProfileTab.jsx'
import NewSession from './screens/NewSession.jsx'
import AddPlayers from './screens/AddPlayers.jsx'
import GameTracking from './screens/GameTracking.jsx'
import Summary from './screens/Summary.jsx'
import Expenses from './screens/Expenses.jsx'
import Calculate from './screens/Calculate.jsx'
import Bill from './screens/Bill.jsx'
import ShareBill from './screens/ShareBill.jsx'

// Prototype flow:
// home -> newSession -> addPlayers -> gameTracking -> summary
//      -> expenses -> calculate -> bill (includes the shared payment QR) -> shareBill -> home

const DEFAULT_SESSION = { date: '2026-09-28', venue: 'Badminton Court', courts: 2, notes: '' }
const DEFAULT_EXPENSES = { courtFee: 0, shuttlePrice: 45, shuttleCount: 4 }
const DRAFT_KEY = 'badminton-buddy-draft'

function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY))
  } catch {
    return null
  }
}

export default function App() {
  const [savedDraft] = useState(readDraft)
  const [screen, setScreen] = useState(savedDraft?.screen || 'home')
  const [activeSessionId, setActiveSessionId] = useState(savedDraft?.activeSessionId || null)

  const [session, setSession] = useState(savedDraft?.session || DEFAULT_SESSION)
  const [players, setPlayers] = useState(savedDraft?.players || seedPlayers())
  const [games, setGames] = useState(savedDraft?.games || [])
  const [expenses, setExpenses] = useState(savedDraft?.expenses || DEFAULT_EXPENSES)
  const [recentSessions, setRecentSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('badminton-buddy-sessions')) || RECENT_SESSIONS
    } catch {
      return RECENT_SESSIONS
    }
  })
  const [shareData, setShareData] = useState(null)

  useEffect(() => {
    if (screen === 'home') {
      localStorage.removeItem(DRAFT_KEY)
      return
    }

    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      screen,
      activeSessionId,
      session,
      players,
      games,
      expenses,
      shareData
    }))
  }, [screen, activeSessionId, session, players, games, expenses, shareData])

  const goHome = () => setScreen('home')

  const resetForNewSession = () => {
    setActiveSessionId(null)
    setSession(DEFAULT_SESSION)
    setPlayers(seedPlayers())
    setGames([])
    setExpenses(DEFAULT_EXPENSES)
  }

  const handleTabSelect = (tab) => setScreen(tab)

  const finishSession = () => {
    const total = (Number(expenses.shuttlePrice) || 0) * (Number(expenses.shuttleCount) || 0) + (Number(expenses.courtFee) || 0)
    const completed = {
      id: activeSessionId || 's' + Date.now(),
      name: session.venue || 'Badminton Session',
      date: session.date,
      players: players.length,
      games: games.length,
      total,
      sessionData: { session, players, games, expenses }
    }
    const nextSessions = [completed, ...recentSessions.filter(item => item.id !== completed.id)].slice(0, 20)
    setRecentSessions(nextSessions)
    localStorage.setItem('badminton-buddy-sessions', JSON.stringify(nextSessions))
    localStorage.removeItem(DRAFT_KEY)
    setScreen('home')
  }

  const openSavedSession = (saved) => {
    if (!saved.sessionData) return
    setActiveSessionId(saved.id)
    setSession(saved.sessionData.session)
    setPlayers(saved.sessionData.players)
    setGames(saved.sessionData.games)
    setExpenses(saved.sessionData.expenses)
    setScreen('gameTracking')
  }

  const editSavedSession = (saved, targetScreen) => {
    if (!saved.sessionData && targetScreen !== 'newSession') return
    setActiveSessionId(saved.id)
    setSession(saved.sessionData?.session || {
      ...DEFAULT_SESSION,
      date: /^\d{4}-\d{2}-\d{2}$/.test(saved.date) ? saved.date : DEFAULT_SESSION.date,
      venue: saved.name
    })
    setPlayers(saved.sessionData?.players || seedPlayers())
    setGames(saved.sessionData?.games || [])
    setExpenses(saved.sessionData?.expenses || DEFAULT_EXPENSES)
    setScreen(targetScreen)
  }

  const continueLegacySession = (saved) => {
    if (saved.sessionData) {
      openSavedSession(saved)
      return
    }

    const legacySessionData = {
      session: {
        ...DEFAULT_SESSION,
        date: /^\d{4}-\d{2}-\d{2}$/.test(saved.date) ? saved.date : DEFAULT_SESSION.date,
        venue: saved.name
      },
      players: [],
      games: Array.from({ length: Number(saved.games) || 0 }, (_, index) => ({
        id: `${saved.id}-legacy-${index + 1}`,
        index: index + 1,
        teamA: [],
        teamB: [],
        participantIds: [],
        scoreA: null,
        scoreB: null,
        historical: true
      })),
      expenses: { courtFee: Number(saved.total) || 0, shuttlePrice: 0, shuttleCount: 0 }
    }
    const migrated = { ...saved, sessionData: legacySessionData }
    const updatedSessions = recentSessions.map(item => item.id === saved.id ? migrated : item)

    setActiveSessionId(saved.id)
    setSession(legacySessionData.session)
    setPlayers(legacySessionData.players)
    setGames(legacySessionData.games)
    setExpenses(legacySessionData.expenses)
    setRecentSessions(updatedSessions)
    localStorage.setItem('badminton-buddy-sessions', JSON.stringify(updatedSessions))
    setScreen('addPlayers')
  }

  const saveSessionEdits = (updates = {}) => {
    const updatedSession = updates.session || session
    const updatedPlayers = updates.players || players
    const updatedGames = updates.games || games
    const updatedExpenses = updates.expenses || expenses
    const currentRecord = recentSessions.find(saved => saved.id === activeSessionId)
    const hasFullDetails = Boolean(currentRecord?.sessionData)
    const total = (Number(updatedExpenses.shuttlePrice) || 0) * (Number(updatedExpenses.shuttleCount) || 0)
      + (Number(updatedExpenses.courtFee) || 0)
    const updatedSessions = recentSessions.map(saved => saved.id === activeSessionId ? {
      ...saved,
      name: updatedSession.venue || 'Badminton Session',
      date: updatedSession.date,
      ...(hasFullDetails ? {
        players: updatedPlayers.length,
        games: updatedGames.length,
        total,
        sessionData: {
          session: updatedSession,
          players: updatedPlayers,
          games: updatedGames,
          expenses: updatedExpenses
        }
      } : {})
    } : saved)

    setSession(updatedSession)
    setPlayers(updatedPlayers)
    setGames(updatedGames)
    setExpenses(updatedExpenses)
    setRecentSessions(updatedSessions)
    localStorage.setItem('badminton-buddy-sessions', JSON.stringify(updatedSessions))
    setScreen('sessions')
  }

  return (
    <div className="phone-frame">
      <div className="phone-notch" />

      {screen === 'home' && (
        <Home
          onStartSession={() => { resetForNewSession(); setScreen('newSession') }}
          onSelectTab={handleTabSelect}
          recentSessions={recentSessions}
        />
      )}

      {screen === 'sessions' && (
        <SessionsTab
          recentSessions={recentSessions}
          onSelectTab={handleTabSelect}
          onSelectSession={openSavedSession}
          onContinueSession={continueLegacySession}
          onEditDetails={(saved) => editSavedSession(saved, 'newSession')}
          onEditPlayers={(saved) => editSavedSession(saved, 'addPlayers')}
        />
      )}
      {screen === 'players' && <PlayersTab players={players} onSelectTab={handleTabSelect} />}
      {screen === 'profile' && <ProfileTab onSelectTab={handleTabSelect} />}

      {screen === 'newSession' && (
        <NewSession
          session={session}
          setSession={setSession}
          onBack={goHome}
          onNext={() => setScreen('addPlayers')}
          isEditing={Boolean(activeSessionId)}
          onSave={saveSessionEdits}
        />
      )}

      {screen === 'addPlayers' && (
        <AddPlayers
          players={players}
          setPlayers={setPlayers}
          onBack={() => setScreen('newSession')}
          onNext={() => setScreen('gameTracking')}
          isEditing={Boolean(activeSessionId)}
          onSave={(updatedPlayers) => {
            const playerIds = new Set(updatedPlayers.map(player => player.id))
            const updatedGames = games.map(game => ({
              ...game,
              teamA: game.teamA.filter(id => playerIds.has(id)),
              teamB: game.teamB.filter(id => playerIds.has(id)),
              participantIds: game.participantIds.filter(id => playerIds.has(id))
            }))
            saveSessionEdits({ players: updatedPlayers, games: updatedGames })
          }}
        />
      )}

      {screen === 'gameTracking' && (
        <GameTracking
          players={players}
          games={games}
          setGames={setGames}
          onBack={() => setScreen('addPlayers')}
          onFinishSession={() => setScreen('summary')}
        />
      )}

      {screen === 'summary' && (
        <Summary
          players={players}
          games={games}
          onBack={() => setScreen('gameTracking')}
          onNext={() => setScreen('expenses')}
        />
      )}

      {screen === 'expenses' && (
        <Expenses
          expenses={expenses}
          setExpenses={setExpenses}
          onBack={() => setScreen('summary')}
          onNext={() => setScreen('calculate')}
        />
      )}

      {screen === 'calculate' && (
        <Calculate
          players={players}
          games={games}
          expenses={expenses}
          onBack={() => setScreen('expenses')}
          onNext={() => setScreen('bill')}
        />
      )}

      {screen === 'bill' && (
        <Bill
          session={session}
          players={players}
          games={games}
          expenses={expenses}
          onBack={() => setScreen('calculate')}
          onNext={(data) => { setShareData(data); setScreen('shareBill') }}
        />
      )}

      {screen === 'shareBill' && (
        <ShareBill
          session={session}
          shareData={shareData}
          onBack={() => setScreen('bill')}
          onDone={finishSession}
        />
      )}
    </div>
  )
}
