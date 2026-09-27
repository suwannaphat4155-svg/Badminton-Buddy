import React, { useState } from 'react'
import TopBar from '../components/TopBar.jsx'

const OPTIONS = [
  { key: 'image', icon: '🖼️', label: 'Share Image' },
  { key: 'qr', icon: '📱', label: 'Send QR Code' },
  { key: 'save', icon: '💾', label: 'Save Bill' },
  { key: 'copy', icon: '📋', label: 'Copy Summary' }
]

export default function ShareBill({ onBack, onDone }) {
  const [toast, setToast] = useState(null)

  const handleOption = (opt) => {
    setToast(`${opt.label} — บันทึกแล้ว (ตัวอย่าง)`)
    setTimeout(() => setToast(null), 1800)
  }

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <TopBar title="แชร์บิล" onBack={onBack} />
      <div className="screen-body">
        <div className="section-title">เลือกวิธีแชร์บิลของคุณ</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {OPTIONS.map(opt => (
            <button key={opt.key} className="share-option" onClick={() => handleOption(opt)}>
              <span className="share-icon">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />
        <button className="btn-secondary" onClick={onDone}>กลับไปหน้าแรก</button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
