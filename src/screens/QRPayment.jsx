import React, { useRef, useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import { computeSplit } from '../data/calc.js'

export default function QRPayment({ players, games, expenses, onBack, onNext }) {
  const shuttleTotal = (Number(expenses.shuttlePrice) || 0) * (Number(expenses.shuttleCount) || 0)
  const total = shuttleTotal + (Number(expenses.courtFee) || 0)
  const split = computeSplit(players, games, total)

  const [index, setIndex] = useState(0)
  const [qrImage, setQrImage] = useState(null)
  const fileInput = useRef(null)

  const current = split[Math.min(index, split.length - 1)]

  const onFileChosen = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setQrImage(reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="screen">
      <TopBar title="ชำระเงิน" onBack={onBack} />
      <div className="screen-body">
        <div className="qr-card">
          <div className="section-title">สแกน QR Code เพื่อชำระเงิน</div>

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

          {current && (
            <>
              <div className="qr-recipient">ผู้รับเงิน: {current.player.name}</div>
              <div className="qr-amount">฿{current.amount}</div>
            </>
          )}

          <div className="player-pager">
            {split.map((s, i) => (
              <button
                key={s.player.id}
                className={'pager-dot' + (i === index ? ' active' : '')}
                onClick={() => setIndex(i)}
                aria-label={`ดู QR ของ ${s.player.name}`}
              />
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={onNext}>แชร์บิล</button>
      </div>
    </div>
  )
}
