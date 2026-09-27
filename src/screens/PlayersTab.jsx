import React from 'react'
import BottomNav from '../components/BottomNav.jsx'
import PlayerAvatar from '../components/PlayerAvatar.jsx'

export default function PlayersTab({ players, onSelectTab }) {
  return (
    <div className="screen">
      <div className="topbar"><h1>ผู้เล่นทั้งหมด</h1></div>
      <div className="screen-body">
        {players.map(p => (
          <div className="player-row" key={p.id}>
            <PlayerAvatar player={p} />
            <div className="name">{p.name}</div>
          </div>
        ))}
        {players.length === 0 && <div className="empty-note">ยังไม่มีผู้เล่นที่บันทึกไว้</div>}
      </div>
      <BottomNav active="players" onSelect={onSelectTab} />
    </div>
  )
}
