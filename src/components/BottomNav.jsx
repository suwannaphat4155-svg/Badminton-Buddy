import React from 'react'

const TABS = [
  { key: 'home', label: 'หน้าแรก', icon: '🏠' },
  { key: 'sessions', label: 'เซสชัน', icon: '📅' },
  { key: 'players', label: 'ผู้เล่น', icon: '👥' },
  { key: 'profile', label: 'โปรไฟล์', icon: '⚙️' }
]

export default function BottomNav({ active, onSelect }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.key}
          className={'nav-item' + (active === tab.key ? ' active' : '')}
          onClick={() => onSelect(tab.key)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
