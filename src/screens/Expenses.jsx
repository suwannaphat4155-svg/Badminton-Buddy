import React from 'react'
import TopBar from '../components/TopBar.jsx'

export default function Expenses({ expenses, setExpenses, onBack, onNext }) {
  const shuttlePrice = Math.max(0, Number(expenses.shuttlePrice) || 0)
  const shuttleCount = Math.max(0, Math.floor(Number(expenses.shuttleCount) || 0))
  const shuttleTotal = shuttlePrice * shuttleCount
  const courtFee = Math.max(0, Number(expenses.courtFee) || 0)
  const total = shuttleTotal + courtFee

  const update = (key) => (e) => {
    const value = e.target.value
    if (value === '') { setExpenses({ ...expenses, [key]: '' }); return }
    const numericValue = Number(value)
    if (!Number.isFinite(numericValue) || numericValue < 0) return
    setExpenses({ ...expenses, [key]: key === 'shuttleCount' ? Math.floor(numericValue) : numericValue })
  }

  return (
    <div className="screen">
      <TopBar title="ค่าใช้จ่ายวันนี้" onBack={onBack} />
      <div className="screen-body">
        <div className="expense-card">
          <div className="field">
            <label>ค่าสนาม</label>
            <div className="currency-field">
              <span className="prefix">฿</span>
              <input type="number" min="0" step="0.01" value={expenses.courtFee} onChange={update('courtFee')} />
            </div>
          </div>

          <div className="field">
            <label>ราคาลูกแบด</label>
            <div className="currency-field">
              <span className="prefix">฿</span>
              <input type="number" min="0" step="0.01" value={expenses.shuttlePrice} onChange={update('shuttlePrice')} />
              <span className="suffix">/ ลูก</span>
            </div>
          </div>

          <div className="field">
            <label>จำนวนลูกที่ใช้</label>
            <div className="currency-field">
              <input type="number" min="0" step="1" value={expenses.shuttleCount} onChange={update('shuttleCount')} />
              <span className="suffix">ลูก</span>
            </div>
          </div>

          <div className="total-row">
            <span className="label">ค่าลูกแบดทั้งหมด</span>
            <span className="value" style={{ fontSize: 17 }}>฿{shuttleTotal}</span>
          </div>
          <div className="total-row">
            <span className="label">ค่าใช้จ่ายรวม</span>
            <span className="value">฿{total}</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={onNext}>คำนวณค่าใช้จ่าย</button>
      </div>
    </div>
  )
}
