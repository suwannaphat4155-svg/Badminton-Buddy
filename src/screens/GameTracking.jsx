import React, { useState } from 'react'
import TopBar from '../components/TopBar.jsx'

function splitIntoTeams(ids) {
  const half = Math.ceil(ids.length / 2)
  return { teamA: ids.slice(0, half), teamB: ids.slice(half) }
}

function freshDraft(players) {
  const ids = players.map(p => p.id)
  return { ...splitIntoTeams(ids), participantIds: ids }
}

export default function GameTracking({ players, games, setGames, onBack, onFinishSession }) {
  // phase 'setup'   -> choosing who's playing this game and which team they're on
  // phase 'playing' -> the match is live; tap a team's panel to add a point
  const [phase, setPhase] = useState('setup')
  const [draft, setDraft] = useState(() => freshDraft(players))
  const [score, setScore] = useState({ a: 0, b: 0 })

  const gameNumber = games.length + 1
  const nameOf = (id) => players.find(p => p.id === id)?.name || '?'

  const toggleParticipant = (id) => {
    const inGame = draft.participantIds.includes(id)
    if (inGame) {
      setDraft({
        ...draft,
        participantIds: draft.participantIds.filter(x => x !== id),
        teamA: draft.teamA.filter(x => x !== id),
        teamB: draft.teamB.filter(x => x !== id)
      })
    } else {
      const addToA = draft.teamA.length <= draft.teamB.length
      setDraft({
        ...draft,
        participantIds: [...draft.participantIds, id],
        teamA: addToA ? [...draft.teamA, id] : draft.teamA,
        teamB: addToA ? draft.teamB : [...draft.teamB, id]
      })
    }
  }

  const swapTeam = (id) => {
    if (draft.teamA.includes(id)) {
      setDraft({ ...draft, teamA: draft.teamA.filter(x => x !== id), teamB: [...draft.teamB, id] })
    } else {
      setDraft({ ...draft, teamB: draft.teamB.filter(x => x !== id), teamA: [...draft.teamA, id] })
    }
  }

  const canStartMatch = draft.teamA.length > 0 && draft.teamB.length > 0

  const startMatch = () => {
    if (!canStartMatch) return
    setScore({ a: 0, b: 0 })
    setPhase('playing')
  }

  const addPoint = (side) => setScore(s => ({ ...s, [side]: s[side] + 1 }))
  const undoPoint = (side) => setScore(s => ({ ...s, [side]: Math.max(0, s[side] - 1) }))

  const canFinishMatch = score.a !== score.b && (score.a > 0 || score.b > 0)

  const finishMatch = () => {
    if (!canFinishMatch) return
    setGames([...games, {
      id: 'g' + Date.now(),
      index: gameNumber,
      teamA: draft.teamA,
      teamB: draft.teamB,
      participantIds: draft.participantIds,
      scoreA: score.a,
      scoreB: score.b
    }])
    setDraft(freshDraft(players))
    setPhase('setup')
  }

  return (
    <div className="screen">
      <TopBar title="บันทึกเกม" onBack={onBack} />
      <div className="screen-body">
        <div className="game-badge">Game {gameNumber}</div>

        {phase === 'setup' && (
          <>
            <div>
              <div className="section-title">ใครเล่นเกมนี้</div>
              <div className="chip-grid" style={{ marginTop: 10 }}>
                {players.map(p => (
                  <button
                    key={p.id}
                    className={'chip' + (draft.participantIds.includes(p.id) ? ' selected' : '')}
                    onClick={() => toggleParticipant(p.id)}
                  >
                    <span style={{
                      width: 8, height: 8, borderRadius: 4,
                      background: draft.participantIds.includes(p.id) ? 'var(--court-green)' : 'var(--border)'
                    }} />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="score-card">
              <div className="score-side" style={{ gridTemplateColumns: '1fr' }}>
                <div className="team-names">
                  ทีม A: {draft.teamA.map(nameOf).join(' & ') || '—'}
                </div>
              </div>
              <div className="score-vs">VS</div>
              <div className="team-names">
                ทีม B: {draft.teamB.map(nameOf).join(' & ') || '—'}
              </div>

              <div className="section-title" style={{ marginTop: 4 }}>แตะชื่อเพื่อสลับทีม</div>
              <div className="chip-grid">
                {draft.participantIds.map(id => (
                  <button key={id} className="chip selected" onClick={() => swapTeam(id)}>
                    {nameOf(id)} · {draft.teamA.includes(id) ? 'ทีม A' : 'ทีม B'}
                  </button>
                ))}
                {draft.participantIds.length === 0 && (
                  <div className="empty-note">เลือกผู้เล่นด้านบนก่อน</div>
                )}
              </div>

              <button className="btn-primary" disabled={!canStartMatch} onClick={startMatch}>
                เริ่มแข่ง
              </button>
            </div>
          </>
        )}

        {phase === 'playing' && (
          <>
            <button className="btn-text" onClick={() => setPhase('setup')}>← แก้ทีม</button>

            <div className="live-scoreboard">
              <button className="score-panel" onClick={() => addPoint('a')}>
                <div className="team-label">{draft.teamA.map(nameOf).join(' & ')}</div>
                <div className="big-score">{score.a}</div>
                <span
                  className="undo-btn"
                  onClick={(e) => { e.stopPropagation(); undoPoint('a') }}
                >
                  −1
                </span>
              </button>

              <div className="score-vs">VS</div>

              <button className="score-panel" onClick={() => addPoint('b')}>
                <div className="team-label">{draft.teamB.map(nameOf).join(' & ')}</div>
                <div className="big-score">{score.b}</div>
                <span
                  className="undo-btn"
                  onClick={(e) => { e.stopPropagation(); undoPoint('b') }}
                >
                  −1
                </span>
              </button>
            </div>
            <div className="empty-note" style={{ padding: '0 4px' }}>
              แตะที่ฝั่งของทีมเพื่อเพิ่มแต้มทีละคะแนน กด −1 เพื่อแก้ไข
            </div>

            <button className="btn-primary" disabled={!canFinishMatch} onClick={finishMatch}>
              จบเกม บันทึกสกอร์
            </button>
          </>
        )}

        {games.length > 0 && (
          <div>
            <div className="section-title">เกมที่เล่นแล้ว</div>
            <div className="completed-list" style={{ marginTop: 10 }}>
              {games.map(g => (
                <div className="completed-row" key={g.id}>
                  <span className="tag">
                    ✓ Game {g.index}: {g.teamA.map(nameOf).join(' & ')} vs {g.teamB.map(nameOf).join(' & ')}
                  </span>
                  <span className="result">{g.scoreA}–{g.scoreB}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />
        {phase === 'setup' && (
          <button className="btn-secondary" onClick={onFinishSession} disabled={games.length === 0}>
            จบการเล่น
          </button>
        )}
      </div>
    </div>
  )
}
