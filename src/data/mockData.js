// Palette used to color-code player avatars, cycled by index.
export const AVATAR_COLORS = [
  '#1F9D77', '#16324F', '#F2994A', '#7C5CBF',
  '#2196A6', '#C0455D', '#5B8C3E', '#B9862F'
]

export function colorForIndex(i) {
  return AVATAR_COLORS[i % AVATAR_COLORS.length]
}

export function initials(name) {
  return (name || '?').trim().slice(0, 2).toUpperCase()
}

// Recent-session history shown on the Home screen (read-only demo data).
export const RECENT_SESSIONS = [
  { id: 's1', name: 'Badminton Session', date: '21 Sep 2026', players: 4, games: 4, total: 160 },
  { id: 's2', name: 'Badminton Session', date: '14 Sep 2026', players: 6, games: 6, total: 270 }
]

export const LIFETIME_STATS = {
  totalSessions: 12,
  lastTotal: 180
}

// Seed data so every screen has something to show immediately on load.
export function seedPlayers() {
  return ['Film', 'Boss', 'A', 'B'].map((name, i) => ({
    id: 'p' + (i + 1),
    name,
    color: colorForIndex(i)
  }))
}
