import React from 'react'
import BottomNav from '../components/BottomNav.jsx'
import { RECENT_SESSIONS } from '../data/mockData.js'

export default function SessionsTab({ recentSessions, onSelectTab, onSelectSession, onContinueSession, onEditDetails, onEditPlayers, onDeleteSession }) {
  return (
    <div className="screen">
      <div className="topbar"><h1>เซสชันทั้งหมด</h1></div>
      <div className="screen-body">
        {(recentSessions || RECENT_SESSIONS).map(s => (
          <div className="session-item" key={s.id}>
            <div>
              <div className="name">{s.name}</div>
              <div className="meta">{s.date} · {s.players} Players · {s.games} Games</div>
            </div>
            <div className="amount">฿{s.total}</div>
            <div className="session-actions">
              <button onClick={() => onEditDetails?.(s)}>แก้รายละเอียด</button>
              {s.sessionData ? (
                <>
                  <button onClick={() => onEditPlayers?.(s)}>แก้ผู้เล่น</button>
                  <button onClick={() => onSelectSession?.(s)}>เพิ่มเกม</button>
                </>
              ) : (
                <button onClick={() => onContinueSession?.(s)}>เพิ่มผู้เล่นเพื่อเล่นต่อ</button>
              )}
              <button className="delete-session-btn" onClick={() => onDeleteSession?.(s)}>
                ลบเซสชัน
              </button>
            </div>
          </div>
        ))}
        {(recentSessions || RECENT_SESSIONS).length === 0 && (
          <div className="empty-note">ยังไม่มีเซสชันที่บันทึกไว้</div>
        )}
      </div>
      <BottomNav active="sessions" onSelect={onSelectTab} />
    </div>
  )
}
