import React, { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import PlayerAvatar from '../components/PlayerAvatar.jsx'
import { colorForIndex } from '../data/mockData.js'

export default function AddPlayers({ players, games = [], setPlayers, onBack, onNext, isEditing, onSave }) {
  const [name, setName] = useState('')

  const addPlayer = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setPlayers([...players, { id: 'p' + Date.now(), name: trimmed, color: colorForIndex(players.length) }])
    setName('')
  }

  const removePlayer = (id) => {
    const affectedGames = games.filter(game => game.participantIds?.includes(id)).length
    if (affectedGames && !window.confirm(`ผู้เล่นคนนี้อยู่ในบันทึก ${affectedGames} เกม หากลบ ชื่อจะถูกนำออกจากเกมเหล่านั้นด้วย ต้องการลบหรือไม่?`)) return
    setPlayers(players.filter(p => p.id !== id))
  }

  return (
    <div className="screen">
      <TopBar title="ใครมาเล่นวันนี้?" onBack={onBack} />
      <div className="screen-body">
        <div className="section-title">{players.length} Players</div>

        <div className="add-player-form">
          <input
            placeholder="พิมพ์ชื่อผู้เล่น"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPlayer()}
          />
          <button onClick={addPlayer}>+ เพิ่ม</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {players.map(p => (
            <div className="player-row" key={p.id}>
              <PlayerAvatar player={p} />
              <div className="name">{p.name}</div>
              <button className="remove-btn" onClick={() => removePlayer(p.id)}>✕</button>
            </div>
          ))}
          {players.length === 0 && (
            <div className="empty-note">ยังไม่มีผู้เล่น เพิ่มชื่อด้านบนเพื่อเริ่มต้น</div>
          )}
        </div>

        <div style={{ flex: 1 }} />
        <button
          className="btn-primary"
          disabled={players.length < 2}
          onClick={isEditing ? () => onSave(players) : onNext}
        >
          {isEditing ? 'บันทึกผู้เล่น' : 'เริ่มเล่น'}
        </button>
      </div>
    </div>
  )
}
