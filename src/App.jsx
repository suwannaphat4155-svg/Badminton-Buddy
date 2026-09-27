import React, { useState } from 'react'
import { seedPlayers } from './data/mockData.js'

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

export default function App() {
  const [screen, setScreen] = useState('home')

  const [session, setSession] = useState(DEFAULT_SESSION)
  const [players, setPlayers] = useState(seedPlayers())
  const [games, setGames] = useState([])
  const [expenses, setExpenses] = useState(DEFAULT_EXPENSES)

  const goHome = () => setScreen('home')

  const resetForNewSession = () => {
    setSession(DEFAULT_SESSION)
    setPlayers(seedPlayers())
    setGames([])
    setExpenses(DEFAULT_EXPENSES)
  }

  const handleTabSelect = (tab) => setScreen(tab)

  return (
    <div className="phone-frame">
      <div className="phone-notch" />

      {screen === 'home' && (
        <Home
          onStartSession={() => { resetForNewSession(); setScreen('newSession') }}
          onSelectTab={handleTabSelect}
        />
      )}

      {screen === 'sessions' && <SessionsTab onSelectTab={handleTabSelect} />}
      {screen === 'players' && <PlayersTab players={players} onSelectTab={handleTabSelect} />}
      {screen === 'profile' && <ProfileTab onSelectTab={handleTabSelect} />}

      {screen === 'newSession' && (
        <NewSession
          session={session}
          setSession={setSession}
          onBack={goHome}
          onNext={() => setScreen('addPlayers')}
        />
      )}

      {screen === 'addPlayers' && (
        <AddPlayers
          players={players}
          setPlayers={setPlayers}
          onBack={() => setScreen('newSession')}
          onNext={() => setScreen('gameTracking')}
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
          onNext={() => setScreen('shareBill')}
        />
      )}

      {screen === 'shareBill' && (
        <ShareBill onBack={() => setScreen('bill')} onDone={goHome} />
      )}
    </div>
  )
}
