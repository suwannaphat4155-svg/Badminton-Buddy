import React, { useRef, useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import { computeSplit } from '../data/calc.js'

export default function Bill({ session, players, games, expenses, onBack, onNext }) {
  const shuttleTotal = (Number(expenses.shuttlePrice) || 0) * (Number(expenses.shuttleCount) || 0)
  const courtFee = Number(expenses.courtFee) || 0
  const total = shuttleTotal + courtFee
  const split = computeSplit(players, games, total)

  const [recipientId, setRecipientId] = useState(players[0]?.id)
  const [qrImage, setQrImage] = useState(null)
  const [paid, setPaid] = useState({})
  const fileInput = useRef(null)
  const recipient = players.find(p => p.id === recipientId)

  const onFileChosen = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setQrImage(reader.result)
    reader.readAsDataURL(file)
  }

  const togglePaid = (id) => setPaid({ ...paid, [id]: !paid[id] })

  return (
    <div className="screen">
      <TopBar title="บิลสรุปค่าใช้จ่าย" onBack={onBack} />
      <div className="screen-body">
        <div className="bill-card">
          <div className="bill-header">
            <h2>BADMINTON BILL</h2>
            <div className="meta">Date: {session.date || '28 Sep 2026'}</div>
            <div className="meta">Venue: {session.venue || 'Badminton Court'}</div>
          </div>
          <div className="bill-notch" />

          <div className="bill-body">
            <div className="bill-section-label">Session Summary</div>
            <div className="line-item"><span>Players</span><span>{players.length}</span></div>
            <div className="line-item"><span>Games</span><span>{games.length}</span></div>

            <div className="bill-section-label">Expenses</div>
            <div className="line-item"><span>Court Fee</span><span>฿{courtFee}</span></div>
            <div className="line-item"><span>Badminton Shuttle</span><span>฿{shuttleTotal}</span></div>
            <div className="line-item total"><span>Total</span><span>฿{total}</span></div>

            <div className="bill-grand-total">
              <div className="value">TOTAL ฿{total}</div>
            </div>
          </div>
        </div>

        {/* One shared QR: everyone scans the SAME code and pays their own amount to it */}
        <div className="qr-card">
          <div className="section-title">สแกน QR Code เพื่อชำระเงิน</div>

          <div className="chip-grid">
            {players.map(p => (
              <button
                key={p.id}
                className={'chip' + (p.id === recipientId ? ' selected' : '')}
                onClick={() => setRecipientId(p.id)}
              >
                ผู้รับเงิน: {p.name}
              </button>
            ))}
          </div>

          <div
            className="qr-box"
            style={qrImage ? { backgroundImage: `url(${qrImage})`, backgroundSize: 'cover' } : undefined}
          />

          <input
            type="file"
            accept="image/*"
            ref={fileInput}
            style={{ display: 'none' }}
            onChange={onFileChosen}
          />
          <button className="btn-text" onClick={() => fileInput.current?.click()}>
            {qrImage ? 'เปลี่ยน QR Code' : 'อัปโหลด QR Code'}
          </button>

          {recipient && <div className="qr-recipient">ผู้รับเงิน: {recipient.name}</div>}
          <div className="empty-note" style={{ padding: '0 4px' }}>
            ทุกคนสแกน QR Code นี้ แล้วโอนตามยอดของตัวเองด้านล่าง
          </div>
        </div>

        <div className="section-title">ยอดที่แต่ละคนต้องจ่าย</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {split.map(({ player, count, amount }) => (
            <button
              key={player.id}
              className="split-row"
              style={{ width: '100%', textAlign: 'left', background: 'var(--surface)', font: 'inherit' }}
              onClick={() => togglePaid(player.id)}
            >
              <div className="detail">
                <div className="name">{player.name}</div>
                <div className="calc">{count} games</div>
              </div>
              <div className="owed">
                {paid[player.id] ? '✓ จ่ายแล้ว' : `฿${amount}`}
              </div>
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={onNext}>แชร์บิล</button>
      </div>
    </div>
  )
}
