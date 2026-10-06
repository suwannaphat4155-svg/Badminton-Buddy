import React from 'react'
import BottomNav from '../components/BottomNav.jsx'
import { RECENT_SESSIONS } from '../data/mockData.js'

export default function Home({ onStartSession, onSelectTab, onSelectSession, recentSessions }) {
  const sessions = recentSessions || RECENT_SESSIONS
  const totalSpend = sessions.reduce((sum, session) => sum + (Number(session.total) || 0), 0)

  return (
    <div className="screen">
      <div className="screen-body">
        <div className="hero">
          <div className="hero-court-lines" aria-hidden="true" />
          <div className="hero-shuttle" aria-hidden="true">✦</div>
          <div className="hero-content">
            <div className="hero-eyebrow">BADMINTON BUDDY <span>• MATCH DAY</span></div>
            <h2>ใครมาตีแบดกับคุณวันนี้?</h2>
            <button className="btn-hero" onClick={onStartSession}>
              เริ่มเล่นวันนี้ →
            </button>
          </div>
        </div>

        <div className="section-kicker"><span>SEASON STATS</span><i /></div>
        <div className="stat-row">
          <div className="stat-card">
            <div className="stat-index">01</div>
            <div className="value">{String(sessions.length).padStart(2, '0')}</div>
            <div className="label">ครั้งที่เล่นทั้งหมด</div>
          </div>
          <div className="stat-card">
            <div className="value">฿{totalSpend}</div>
            <div className="label">ค่าใช้จ่ายรวม</div>
          </div>
        </div>

        <div>
          <div className="section-heading-row">
            <div className="section-title">เซสชันล่าสุด</div>
            {sessions.length > 0 && <button className="text-btn" onClick={() => onSelectTab('sessions')}>ดูทั้งหมด</button>}
          </div>
        </div>

        {sessions.slice(0, 3).map(s => (
          <button className="session-item session-item-button" key={s.id} onClick={() => onSelectSession?.(s)}>
            <div>
              <div className="name">{s.name}</div>
              <div className="meta">{s.date} · {s.players} Players · {s.games} Games</div>
            </div>
            <div className="amount">฿{s.total}</div>
          </button>
        ))}

        {sessions.length === 0 && (
          <div className="empty-home">
            <div className="empty-home-icon">🏸</div>
            <div className="name">ยังไม่มีเซสชัน</div>
            <div className="meta">สร้างเซสชันแรกเพื่อเริ่มบันทึกเกมและแชร์ค่าใช้จ่าย</div>
            <button className="btn-secondary" onClick={onStartSession}>สร้างเซสชันแรก</button>
          </div>
        )}
      </div>

      <BottomNav active="home" onSelect={onSelectTab} />
    </div>
  )
}
