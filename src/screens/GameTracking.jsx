import React, { useState } from 'react'
import TopBar from '../components/TopBar.jsx'

function freshDraft() {
  return { teamA: [], teamB: [], participantIds: [], gameType: 'doubles' }
}

export default function GameTracking({ players, games, setGames, onBack, onFinishSession, savedTrackingState, onTrackingStateChange }) {
  // phase 'setup'   -> choosing who's playing this game and which team they're on
  // phase 'playing' -> the match is live; tap a team's panel to add a point
  const [phase, setPhase] = useState(savedTrackingState?.phase || 'setup')
  const [draft, setDraft] = useState(() => ({
    ...freshDraft(),
    ...(savedTrackingState?.draft || {}),
    gameType: savedTrackingState?.draft?.gameType || 'doubles'
  }))
  const [score, setScore] = useState(() => savedTrackingState?.score || { a: 0, b: 0 })
  const [editingGameId, setEditingGameId] = useState(savedTrackingState?.editingGameId || null)

  React.useEffect(() => {
    onTrackingStateChange?.({ phase, draft, score, editingGameId })
  }, [phase, draft, score, editingGameId, onTrackingStateChange])

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

  const requiredPerTeam = draft.gameType === 'singles' ? 1 : 2
  const canStartMatch = draft.teamA.length === requiredPerTeam && draft.teamB.length === requiredPerTeam

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

    const completedGame = {
      id: editingGameId || 'g' + Date.now(),
      index: editingGameId ? games.find(g => g.id === editingGameId)?.index || gameNumber : gameNumber,
      teamA: draft.teamA,
      teamB: draft.teamB,
      participantIds: draft.participantIds,
      gameType: draft.gameType,
      scoreA: score.a,
      scoreB: score.b
    }

    if (editingGameId) {
      setGames(games.map(g => g.id === editingGameId ? completedGame : g))
      setEditingGameId(null)
    } else {
      setGames([...games, completedGame])
    }

    setDraft(freshDraft())
    setPhase('setup')
  }

  const editGame = (game) => {
    if (game.historical) return
    setDraft({
      teamA: [...game.teamA],
      teamB: [...game.teamB],
      participantIds: [...game.participantIds],
      gameType: game.gameType || 'doubles'
    })
    setScore({ a: Number(game.scoreA) || 0, b: Number(game.scoreB) || 0 })
    setEditingGameId(game.id)
    setPhase('playing')
  }

  const deleteGame = (gameId) => {
    if (!window.confirm('ลบเกมนี้ใช่ไหม?')) return
    setGames(games.filter(game => game.id !== gameId))
    if (editingGameId === gameId) {
      setEditingGameId(null)
      setDraft(freshDraft())
      setPhase('setup')
    }
  }

  return (
    <div className="screen">
      <TopBar title="บันทึกเกม" onBack={onBack} />
      <div className="screen-body">
        <div className="game-badge">เกมที่ {gameNumber} · บันทึกแล้ว {games.length} เกม</div>

        {phase === 'setup' && (
          <>
            <div>
              <div className="section-title">ใครเล่นเกมนี้</div>
              <div className="choice-grid" role="group" aria-label="รูปแบบเกม">
                {[['singles', 'เดี่ยว', 'ทีมละ 1 คน'], ['doubles', 'คู่', 'ทีมละ 2 คน']].map(([value, label, hint]) => (
                  <button
                    key={value}
                    type="button"
                    className={'choice-card' + (draft.gameType === value ? ' selected' : '')}
                    aria-pressed={draft.gameType === value}
                    onClick={() => setDraft({ ...draft, gameType: value })}
                  >
                    <strong>{label}</strong><span>{hint}</span>
                  </button>
                ))}
              </div>
              <div className="chip-grid" style={{ marginTop: 10 }}>
                {players.map(p => (
                  <button
                    key={p.id}
                    className={
                      'chip'
                      + (draft.participantIds.includes(p.id) ? ' selected' : '')
                      + (draft.teamA.includes(p.id) ? ' team-a' : '')
                      + (draft.teamB.includes(p.id) ? ' team-b' : '')
                    }
                    onClick={() => toggleParticipant(p.id)}
                  >
                    <span style={{
                      width: 8, height: 8, borderRadius: 4,
                      background: draft.teamA.includes(p.id)
                        ? 'var(--team-pink)'
                        : draft.teamB.includes(p.id) ? 'var(--team-purple)' : 'var(--border)'
                    }} />
                    {p.name}
                  </button>
                ))}
              </div>
              <div className="empty-note game-format-hint">
                เกม{requiredPerTeam === 1 ? 'เดี่ยว' : 'คู่'}: เลือกผู้เล่น {requiredPerTeam * 2} คน แล้วจัดให้ทีมละ {requiredPerTeam} คน
              </div>
            </div>

            <div className="score-card">
              <div className="score-side" style={{ gridTemplateColumns: '1fr' }}>
                <div className="team-names team-a">
                  <span className="team-side-label team-a">ทีม A</span>{' '}
                  {draft.teamA.map(nameOf).join(' & ') || '—'}
                </div>
              </div>
              <div className="score-vs">VS</div>
              <div className="team-names team-b">
                <span className="team-side-label team-b">ทีม B</span>{' '}
                {draft.teamB.map(nameOf).join(' & ') || '—'}
              </div>

              <div className="section-title" style={{ marginTop: 4 }}>แตะชื่อเพื่อสลับทีม</div>
              <div className="chip-grid">
                {draft.participantIds.map(id => (
                  <button
                    key={id}
                    className={'chip selected ' + (draft.teamA.includes(id) ? 'team-a' : 'team-b')}
                    onClick={() => swapTeam(id)}
                  >
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
              <div className="score-panel team-a">
                <div className="team-label">ทีม A · {draft.teamA.map(nameOf).join(' & ')}</div>
                <div className="big-score">{score.a}</div>
                <div className="score-action-row">
                  <button type="button" className="score-adjust-btn" onClick={() => undoPoint('a')}>−1</button>
                  <button
                    type="button"
                    className="score-adjust-btn"
                    onClick={() => addPoint('a')}
                  >
                    +1
                  </button>
                </div>
              </div>

              <div className="score-vs">VS</div>

              <div className="score-panel team-b">
                <div className="team-label">ทีม B · {draft.teamB.map(nameOf).join(' & ')}</div>
                <div className="big-score">{score.b}</div>
                <div className="score-action-row">
                  <button type="button" className="score-adjust-btn" onClick={() => undoPoint('b')}>−1</button>
                  <button type="button" className="score-adjust-btn" onClick={() => addPoint('b')}>+1</button>
                </div>
              </div>
            </div>
            <div className="empty-note" style={{ padding: '0 4px' }}>
              แตะที่ฝั่งของทีมเพื่อเพิ่มแต้มทีละคะแนน กด −1 เพื่อแก้ไข
            </div>

            <button className="btn-primary" disabled={!canFinishMatch} onClick={finishMatch}>
              {editingGameId ? 'บันทึกการแก้ไขเกม' : 'บันทึกผลเกมนี้'}
            </button>
          </>
        )}

        {games.length > 0 && (
          <div>
            <div className="section-title">เกมที่เล่นแล้ว</div>
            <div className="completed-list" style={{ marginTop: 10 }}>
              {games.map(g => (
                <div className="completed-row" key={g.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span className="tag">
                      {g.historical
                        ? `Game ${g.index}: เกมเดิม (ไม่มีรายละเอียด)`
                        : `✓ Game ${g.index}: ${g.teamA.map(nameOf).join(' & ')} vs ${g.teamB.map(nameOf).join(' & ')}`}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!g.historical && (
                        <button
                          className="btn-secondary"
                          style={{ padding: '6px 8px', fontSize: 12 }}
                          onClick={() => editGame(g)}
                        >
                          แก้ไข
                        </button>
                      )}
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 8px', fontSize: 12 }}
                        onClick={() => deleteGame(g.id)}
                      >
                        ź
                      </button>
                    </div>
                  </div>
                  {!g.historical && <span className="result">{g.scoreA}–{g.scoreB}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />
        {phase === 'setup' && (
            <button className="btn-secondary" onClick={onFinishSession} disabled={games.length === 0}>
              จบเซสชันและสรุปค่าใช้จ่าย
          </button>
        )}
      </div>
    </div>
  )
}
