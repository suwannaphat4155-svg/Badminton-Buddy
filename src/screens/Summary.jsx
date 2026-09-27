import React from 'react'
import TopBar from '../components/TopBar.jsx'
import PlayerAvatar from '../components/PlayerAvatar.jsx'

export function gameCountsByPlayer(players, games) {
  return players.map(p => ({
    player: p,
    count: games.filter(g => g.participantIds.includes(p.id)).length
  }))
}

export default function Summary({ players, games, onBack, onNext }) {
  const counts = gameCountsByPlayer(players, games)
  const maxCount = Math.max(1, ...counts.map(c => c.count))

  return (
    <div className="screen">
      <TopBar title="สรุปการเล่น" onBack={onBack} />
      <div className="screen-body">
        <div className="summary-hero">
          <div className="big-number">{games.length}</div>
          <div className="big-label">Games วันนี้เล่นทั้งหมด</div>
        </div>

        <div className="section-title">จำนวนเกมที่แต่ละคนเล่น</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {counts.map(({ player, count }) => (
            <div className="player-summary-card" key={player.id}>
              <PlayerAvatar player={player} />
              <div style={{ flex: 1 }}>
                <div className="name">{player.name}</div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
              </div>
              <div className="games">{count} Games</div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={onNext}>ไปหน้าค่าใช้จ่าย</button>
      </div>
    </div>
  )
}
