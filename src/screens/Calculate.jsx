import React from 'react'
import TopBar from '../components/TopBar.jsx'
import { computeSplit, formatBaht } from '../data/calc.js'

export default function Calculate({ players, games, expenses, onBack, onNext }) {
  const shuttleTotal = (Number(expenses.shuttlePrice) || 0) * (Number(expenses.shuttleCount) || 0)
  const total = shuttleTotal + (Number(expenses.courtFee) || 0)
  const split = computeSplit(players, games, total)
  const totalSlots = split.reduce((sum, row) => sum + row.count, 0)
  const perGame = totalSlots > 0 ? total / totalSlots : (split[0]?.amount || 0)

  return (
    <div className="screen">
      <TopBar title="คำนวณค่าใช้จ่าย" onBack={onBack} />
      <div className="screen-body">
        <div className="total-row" style={{ borderTop: 'none', paddingTop: 0 }}>
          <span className="label">ค่าใช้จ่ายรวม</span>
          <span className="value">฿{total}</span>
        </div>

        <div className="section-title">
          หารตามจำนวนเกมที่ลง (฿{formatBaht(perGame)} / เกม-คน)
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {split.map(({ player, count, amount }) => (
            <div className="split-row" key={player.id}>
              <div className="detail">
                <div className="name">{player.name}</div>
                <div className="calc">{count} เกม × ฿{formatBaht(perGame)}</div>
              </div>
              <div className="owed">฿{formatBaht(amount)}</div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={onNext}>สร้างบิลสรุป</button>
      </div>
    </div>
  )
}
