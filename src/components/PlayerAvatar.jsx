import React from 'react'
import { initials } from '../data/mockData.js'

export default function PlayerAvatar({ player, size = 'md' }) {
  return (
    <div
      className={'avatar' + (size === 'sm' ? ' sm' : '')}
      style={{ background: player.color }}
    >
      {initials(player.name)}
    </div>
  )
}
