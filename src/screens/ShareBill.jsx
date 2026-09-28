import React, { useState } from 'react'
import TopBar from '../components/TopBar.jsx'

function createBillImage({ qrImage, summary, session, total }) {
  return new Promise((resolve, reject) => {
    if (!qrImage) {
      reject(new Error('กรุณากลับไปอัปโหลด QR Code ในหน้าบิลก่อนแชร์'))
      return
    }

    const qr = new Image()
    qr.onload = () => {
      const lines = (summary || '').split('\n').filter(Boolean)
      const canvas = document.createElement('canvas')
      canvas.width = 900
      canvas.height = 760 + lines.length * 58
      const context = canvas.getContext('2d')

      if (!context) {
        reject(new Error('สร้างภาพบิลไม่สำเร็จ'))
        return
      }

      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.fillStyle = '#a72f6b'
      context.fillRect(0, 0, canvas.width, 18)
      context.fillStyle = '#302333'
      context.font = '700 42px sans-serif'
      context.fillText('BADMINTON BILL', 56, 92)
      context.font = '24px sans-serif'
      context.fillStyle = '#786879'
      context.fillText(session?.venue || 'Badminton Session', 56, 140)
      context.fillText(session?.date || '', 56, 178)

      let y = 252
      context.font = '600 27px sans-serif'
      context.fillStyle = '#302333'
      lines.forEach(line => {
        context.fillText(line, 56, y)
        y += 58
      })

      context.fillStyle = '#a72f6b'
      context.font = '700 34px sans-serif'
      context.fillText(`รวมทั้งหมด  ฿${Number(total || 0).toFixed(2)}`, 56, y + 18)

      const qrSize = 280
      const qrX = (canvas.width - qrSize) / 2
      const qrY = y + 68
      context.fillStyle = '#ffffff'
      context.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32)
      context.drawImage(qr, qrX, qrY, qrSize, qrSize)
      context.font = '600 22px sans-serif'
      context.fillStyle = '#786879'
      context.textAlign = 'center'
      context.fillText('สแกน QR Code เพื่อชำระเงิน', canvas.width / 2, qrY + qrSize + 58)

      canvas.toBlob(blob => {
        if (blob) resolve(blob)
        else reject(new Error('บันทึกภาพบิลไม่สำเร็จ'))
      }, 'image/png')
    }
    qr.onerror = () => reject(new Error('อ่านรูป QR Code ไม่สำเร็จ'))
    qr.src = qrImage
  })
}

export default function ShareBill({ session, shareData, onBack, onDone }) {
  const [toast, setToast] = useState(null)

  const summary = `Badminton Buddy\n${session?.venue || 'Badminton Session'} - ${session?.date || ''}\n${shareData?.summary || ''}\nรวม: ฿${shareData?.total || 0}`

  const notify = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 1800)
  }

  const downloadBillImage = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const getBillImage = () => createBillImage({
    qrImage: shareData?.qrImage,
    summary: shareData?.summary,
    session,
    total: shareData?.total
  })

  const handleOption = async (key) => {
    if (key === 'copy') {
      await navigator.clipboard?.writeText(summary)
      notify('คัดลอกสรุปบิลแล้ว')
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

    try {
      const blob = await getBillImage()
      if (key === 'save') {
        downloadBillImage(blob, `badminton-bill-${session?.date || 'session'}.png`)
        notify('บันทึกภาพบิลพร้อม QR แล้ว')
        return
      }

      const file = new File([blob], `badminton-bill-${session?.date || 'session'}.png`, { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: 'Badminton Buddy Bill', text: summary, files: [file] })
        notify('แชร์บิลพร้อม QR แล้ว')
      } else {
        downloadBillImage(blob, file.name)
        notify('ดาวน์โหลดภาพบิลพร้อม QR แล้ว นำภาพไปแชร์ได้เลย')
      }
    } catch (error) {
      notify(error.message || 'จัดการภาพบิลไม่สำเร็จ')
    }
  }

  const options = [
    { key: 'image', icon: '🖼️', label: 'แชร์บิลพร้อม QR Code' },
    { key: 'qr', icon: '📱', label: shareData?.qrImage ? 'ดาวน์โหลด QR Code' : 'แชร์สรุปการชำระเงิน' },
    { key: 'save', icon: '💾', label: 'บันทึกภาพบิลพร้อม QR' },
    { key: 'copy', icon: '📋', label: 'คัดลอกสรุป' }
  ]

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <TopBar title="แชร์บิล" onBack={onBack} />
      <div className="screen-body">
        <div className="section-title">เลือกวิธีแชร์บิลของคุณ</div>
        <div className="share-bill-preview">
          <div className="share-preview-header">
            <strong>BADMINTON BILL</strong>
            <span>{session?.venue || 'Badminton Session'}</span>
            <span>{session?.date || ''}</span>
          </div>
          <div className="share-preview-amounts">
            {(shareData?.summary || '').split('\n').filter(Boolean).map(line => (
              <div key={line}>{line}</div>
            ))}
            <strong>รวม ฿{Number(shareData?.total || 0).toFixed(2)}</strong>
          </div>
          {shareData?.qrImage ? (
            <img className="share-preview-qr" src={shareData.qrImage} alt="QR Code สำหรับชำระเงิน" />
          ) : (
            <p className="share-preview-missing">ยังไม่มี QR Code กลับไปอัปโหลด QR ในหน้าบิลก่อนแชร์</p>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map(opt => (
            <button
              key={opt.key}
              className="share-option"
              onClick={() => handleOption(opt.key)}
              disabled={['image', 'save', 'qr'].includes(opt.key) && !shareData?.qrImage}
            >
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
