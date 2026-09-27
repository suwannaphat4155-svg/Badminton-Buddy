// Splits the total cost proportionally to how many games each player played,
// so someone who played more games covers a larger share.
export function computeSplit(players, games, total) {
  const counts = players.map(p => ({
    player: p,
    count: games.filter(g => g.participantIds.includes(p.id)).length
  }))
  const totalSlots = counts.reduce((sum, c) => sum + c.count, 0) || 1
  const perSlot = total / totalSlots

  return counts.map(({ player, count }) => ({
    player,
    count,
    amount: Math.round(perSlot * count)
  }))
}
