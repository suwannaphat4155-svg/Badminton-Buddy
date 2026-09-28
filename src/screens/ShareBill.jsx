import React, { useState } from 'react'
import TopBar from '../components/TopBar.jsx'

export default function ShareBill({ session, shareData, onBack, onDone }) {
  const [toast, setToast] = useState(null)

  const summary = `Badminton Buddy\n${session?.venue || 'Badminton Session'} - ${session?.date || ''}\n${shareData?.summary || ''}\nรวม: ฿${shareData?.total || 0}`

  const notify = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 1800)
  }

  const handleOption = async (key) => {
    if (key === 'copy') {
      await navigator.clipboard?.writeText(summary)
      notify('คัดลอกสรุปบิลแล้ว')
      return
    }
    if (key === 'save') {
      const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `badminton-bill-${session?.date || 'session'}.txt`
      link.click()
      URL.revokeObjectURL(url)
      notify('บันทึกบิลแล้ว')
      return
    }
    if (key === 'qr' && shareData?.qrImage) {
      const link = document.createElement('a')
      link.href = shareData.qrImage
      link.download = 'badminton-payment-qr.png'
      link.click()
      notify('ดาวน์โหลด QR แล้ว')
      return
    }
    if (navigator.share) {
      await navigator.share({ title: 'Badminton Buddy Bill', text: summary })
      notify('แชร์บิลแล้ว')
    } else {
      await navigator.clipboard?.writeText(summary)
      notify('คัดลอกสรุปบิลแล้ว')
    }
  }

  const options = [
    { key: 'image', icon: '🖼️', label: 'แชร์บิล' },
    { key: 'qr', icon: '📱', label: shareData?.qrImage ? 'ดาวน์โหลด QR Code' : 'แชร์สรุปการชำระเงิน' },
    { key: 'save', icon: '💾', label: 'บันทึกบิล' },
    { key: 'copy', icon: '📋', label: 'คัดลอกสรุป' }
  ]

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <TopBar title="แชร์บิล" onBack={onBack} />
      <div className="screen-body">
        <div className="section-title">เลือกวิธีแชร์บิลของคุณ</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map(opt => (
            <button key={opt.key} className="share-option" onClick={() => handleOption(opt.key)}>
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
