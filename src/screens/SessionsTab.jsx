import React from 'react'
import BottomNav from '../components/BottomNav.jsx'
import { RECENT_SESSIONS } from '../data/mockData.js'

export default function SessionsTab({ onSelectTab }) {
  return (
    <div className="screen">
      <div className="topbar"><h1>เซสชันทั้งหมด</h1></div>
      <div className="screen-body">
        {RECENT_SESSIONS.map(s => (
          <div className="session-item" key={s.id}>
            <div>
              <div className="name">{s.name}</div>
              <div className="meta">{s.date} · {s.players} Players · {s.games} Games</div>
            </div>
            <div className="amount">฿{s.total}</div>
          </div>
        ))}
      </div>
      <BottomNav active="sessions" onSelect={onSelectTab} />
    </div>
  )
}
