import React from 'react'
import BottomNav from '../components/BottomNav.jsx'

export default function ProfileTab({ onSelectTab }) {
  return (
    <div className="screen">
      <div className="topbar"><h1>โปรไฟล์</h1></div>
      <div className="screen-body">
        <div className="session-item"><div className="name">แจ้งเตือน</div></div>
        <div className="session-item"><div className="name">บัญชีรับเงิน / QR ประจำตัว</div></div>
        <div className="session-item"><div className="name">เกี่ยวกับ Badminton Buddy</div></div>
      </div>
      <BottomNav active="profile" onSelect={onSelectTab} />
    </div>
  )
}
