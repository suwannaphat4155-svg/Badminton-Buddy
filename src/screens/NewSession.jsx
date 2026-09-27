import React from 'react'
import TopBar from '../components/TopBar.jsx'

export default function NewSession({ session, setSession, onBack, onNext }) {
  const update = (key) => (e) => setSession({ ...session, [key]: e.target.value })

  return (
    <div className="screen">
      <TopBar title="เริ่มเกมใหม่" onBack={onBack} />
      <div className="screen-body">
        <div className="field">
          <label>วันที่</label>
          <input type="date" value={session.date} onChange={update('date')} />
        </div>
        <div className="field">
          <label>สถานที่ / ชื่อสนาม</label>
          <input
            placeholder="เช่น Badminton Court"
            value={session.venue}
            onChange={update('venue')}
          />
        </div>
        <div className="field">
          <label>จำนวนคอร์ต</label>
          <input type="number" min="1" value={session.courts} onChange={update('courts')} />
        </div>
        <div className="field">
          <label>หมายเหตุ</label>
          <textarea
            rows={3}
            placeholder="เช่น จองไว้ 2 ชั่วโมง"
            value={session.notes}
            onChange={update('notes')}
          />
        </div>

        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={onNext}>เพิ่มผู้เล่น</button>
      </div>
    </div>
  )
}
