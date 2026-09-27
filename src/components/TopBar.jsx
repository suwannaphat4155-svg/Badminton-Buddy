import React from 'react'

export default function TopBar({ title, onBack }) {
  return (
    <div className="topbar">
      {onBack && (
        <button className="back-btn" onClick={onBack} aria-label="ย้อนกลับ">←</button>
      )}
      <h1>{title}</h1>
    </div>
  )
}
