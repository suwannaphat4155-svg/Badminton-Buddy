import React from 'react'
import BottomNav from '../components/BottomNav.jsx'
import { RECENT_SESSIONS, LIFETIME_STATS } from '../data/mockData.js'

export default function Home({ onStartSession, onSelectTab, recentSessions }) {
  return (
    <div className="screen">
      <div className="screen-body">
        <div className="hero">
          <div className="hero-content">
            <div className="hero-eyebrow">Badminton Buddy</div>
            <h2>ใครมาตีแบดกับคุณวันนี้?</h2>
            <button className="btn-hero" onClick={onStartSession}>
              เริ่มเล่นวันนี้ →
            </button>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat-card">
            <div className="value">{LIFETIME_STATS.totalSessions}</div>
            <div className="label">ครั้งที่เล่นทั้งหมด</div>
          </div>
          <div className="stat-card">
            <div className="value">฿{LIFETIME_STATS.lastTotal}</div>
            <div className="label">ค่าใช้จ่ายล่าสุด</div>
          </div>
        </div>

        <div>
          <div className="section-title">เซสชันล่าสุด</div>
        </div>

        {(recentSessions || RECENT_SESSIONS).map(s => (
          <div className="session-item" key={s.id}>
            <div>
              <div className="name">{s.name}</div>
              <div className="meta">{s.date} · {s.players} Players · {s.games} Games</div>
            </div>
            <div className="amount">฿{s.total}</div>
          </div>
        ))}
      </div>

      <BottomNav active="home" onSelect={onSelectTab} />
    </div>
  )
}
