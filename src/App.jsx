import React, { useCallback, useEffect, useState } from 'react'
import { RECENT_SESSIONS, seedPlayers } from './data/mockData.js'
import { supabase } from './data/supabase.js'
import { deleteCloudSession, fetchCloudSessions, saveCloudSession, saveCloudSessions } from './data/cloudSessions.js'

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
import AuthScreen from './screens/AuthScreen.jsx'

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
  const [authSession, setAuthSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(Boolean(supabase))
  const [cloudLoading, setCloudLoading] = useState(false)
  const [cloudMessage, setCloudMessage] = useState('')
  const [savedDraft] = useState(readDraft)
  const [screen, setScreen] = useState(savedDraft?.screen || 'home')
  const [activeSessionId, setActiveSessionId] = useState(savedDraft?.activeSessionId || null)

  const [session, setSession] = useState(savedDraft?.session || DEFAULT_SESSION)
  const [players, setPlayers] = useState(savedDraft?.players || seedPlayers())
  const [games, setGames] = useState(savedDraft?.games || [])
  const [expenses, setExpenses] = useState(savedDraft?.expenses || DEFAULT_EXPENSES)
  const [trackingState, setTrackingState] = useState(savedDraft?.trackingState || null)
  const [recentSessions, setRecentSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('badminton-buddy-sessions')) || RECENT_SESSIONS
    } catch {
      return RECENT_SESSIONS
    }
  })
  const [shareData, setShareData] = useState(null)

  useEffect(() => {
    if (!supabase) return undefined

    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session)
      setAuthLoading(false)
    })

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) setCloudMessage(error.message)
      setAuthSession(data.session)
      setAuthLoading(false)
    }).catch(error => {
      if (!active) return
      setCloudMessage(error.message || 'เชื่อมต่อระบบล็อกอินไม่ได้')
      setAuthLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const userId = authSession?.user?.id
    if (!supabase || !userId) return undefined

    let active = true
    const loadSessions = async () => {
      setCloudLoading(true)
      setCloudMessage('')
      try {
        const remoteSessions = await fetchCloudSessions(supabase, userId)
        const migrationKey = `badminton-buddy-migrated-${userId}`
        let localSessions = []
        try {
          const storedSessions = JSON.parse(localStorage.getItem('badminton-buddy-sessions'))
          localSessions = Array.isArray(storedSessions) ? storedSessions : []
        } catch {
          localSessions = []
        }

        if (!localStorage.getItem(migrationKey) && localSessions.length) {
          const remoteIds = new Set(remoteSessions.map(item => item.id))
          const toMigrate = localSessions.filter(item => !remoteIds.has(item.id))
          await saveCloudSessions(supabase, userId, toMigrate)
          localStorage.setItem(migrationKey, 'true')
        }

        const sessions = await fetchCloudSessions(supabase, userId)
        if (active) {
          setRecentSessions(sessions)
          localStorage.setItem('badminton-buddy-sessions', JSON.stringify(sessions))
        }
      } catch (error) {
        if (active) setCloudMessage(`ซิงก์ข้อมูลออนไลน์ไม่สำเร็จ: ${error.message}`)
      } finally {
        if (active) setCloudLoading(false)
      }
    }

    loadSessions()
    return () => { active = false }
  }, [authSession?.user?.id])

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
      shareData,
      trackingState
    }))
  }, [screen, activeSessionId, session, players, games, expenses, shareData, trackingState])

  const updateTrackingState = useCallback((nextState) => setTrackingState(nextState), [])

  const goHome = () => setScreen('home')

  const resetForNewSession = () => {
    setActiveSessionId(null)
    setSession(DEFAULT_SESSION)
    setPlayers(seedPlayers())
    setGames([])
    setExpenses(DEFAULT_EXPENSES)
    setTrackingState(null)
  }

  const handleTabSelect = (tab) => setScreen(tab)

  const finishSession = async () => {
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
    if (supabase && authSession?.user?.id) {
      try {
        await saveCloudSession(supabase, authSession.user.id, completed)
        setCloudMessage('บันทึกออนไลน์แล้ว')
      } catch (error) {
        setCloudMessage(`บันทึกออนไลน์ไม่สำเร็จ: ${error.message}`)
        return
      }
    }
    localStorage.removeItem(DRAFT_KEY)
    setScreen('home')
  }

  const openSavedSession = (saved) => {
    if (!saved.sessionData) return
    setTrackingState(null)
    setActiveSessionId(saved.id)
    setSession(saved.sessionData.session)
    setPlayers(saved.sessionData.players)
    setGames(saved.sessionData.games)
    setExpenses(saved.sessionData.expenses)
    setScreen('gameTracking')
  }

  const editSavedSession = (saved, targetScreen) => {
    if (!saved.sessionData && targetScreen !== 'newSession') return
    setTrackingState(null)
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

  const continueLegacySession = async (saved) => {
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
    setTrackingState(null)
    const migrated = { ...saved, sessionData: legacySessionData }
    const updatedSessions = recentSessions.map(item => item.id === saved.id ? migrated : item)

    setActiveSessionId(saved.id)
    setSession(legacySessionData.session)
    setPlayers(legacySessionData.players)
    setGames(legacySessionData.games)
    setExpenses(legacySessionData.expenses)
    setRecentSessions(updatedSessions)
    localStorage.setItem('badminton-buddy-sessions', JSON.stringify(updatedSessions))
    if (supabase && authSession?.user?.id) {
      try {
        await saveCloudSession(supabase, authSession.user.id, migrated)
      } catch (error) {
        setCloudMessage(`อัปเดตข้อมูลออนไลน์ไม่สำเร็จ: ${error.message}`)
      }
    }
    setScreen('addPlayers')
  }

  const saveSessionEdits = async (updates = {}) => {
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
    const updatedRecord = updatedSessions.find(saved => saved.id === activeSessionId)
    if (supabase && authSession?.user?.id && updatedRecord) {
      try {
        await saveCloudSession(supabase, authSession.user.id, updatedRecord)
        setCloudMessage('บันทึกการแก้ไขออนไลน์แล้ว')
      } catch (error) {
        setCloudMessage(`บันทึกออนไลน์ไม่สำเร็จ: ${error.message}`)
        return
      }
    }
    setScreen('sessions')
  }

  const deleteSession = async (saved) => {
    if (!window.confirm(`ลบเซสชัน "${saved.name}" ใช่ไหม? การลบนี้ย้อนกลับไม่ได้`)) return

    if (supabase && authSession?.user?.id) {
      try {
        await deleteCloudSession(supabase, authSession.user.id, saved.id)
      } catch (error) {
        setCloudMessage(`ลบข้อมูลออนไลน์ไม่สำเร็จ: ${error.message}`)
        return
      }
    }

    const updatedSessions = recentSessions.filter(item => item.id !== saved.id)
    setRecentSessions(updatedSessions)
    localStorage.setItem('badminton-buddy-sessions', JSON.stringify(updatedSessions))
    setCloudMessage(supabase ? 'ลบเซสชันจากคลาวด์แล้ว' : 'ลบเซสชันออกจากอุปกรณ์แล้ว')
  }

  if (supabase && authLoading) {
    return <div className="cloud-gate"><div className="auth-panel">กำลังตรวจสอบบัญชี...</div></div>
  }

  if (supabase && !authSession) return <AuthScreen supabase={supabase} />

  return (
    <div className="app-shell">
      {supabase ? (
        <div className="cloud-toolbar">
          <span>{cloudLoading ? 'กำลังซิงก์ข้อมูล...' : `ออนไลน์: ${authSession.user.email}`}</span>
          <button onClick={() => supabase.auth.signOut()}>ออก</button>
        </div>
      ) : (
        <div className="cloud-notice">โหมดในเครื่อง: ตั้งค่า Supabase เพื่อเก็บข้อมูลออนไลน์</div>
      )}
      {cloudMessage && <div className="cloud-message">{cloudMessage}</div>}

      {screen === 'home' && (
        <Home
          onStartSession={() => { resetForNewSession(); setScreen('newSession') }}
          onSelectTab={handleTabSelect}
          onSelectSession={openSavedSession}
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
          onDeleteSession={deleteSession}
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
          games={games}
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
          savedTrackingState={trackingState}
          onTrackingStateChange={updateTrackingState}
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
