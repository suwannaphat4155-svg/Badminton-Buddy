// Splits the total by player-game participation slots without assigning rounding remainder.
export function computeSplit(players, games, total) {
  const counts = players.map(player => ({
    player,
    count: games.filter(game => game.participantIds?.includes(player.id)).length
  }))
  const totalSlots = counts.reduce((sum, entry) => sum + entry.count, 0)
  const costPerSlot = totalSlots > 0
    ? (Number(total) || 0) / totalSlots
    : players.length > 0 ? (Number(total) || 0) / players.length : 0

  return counts.map(({ player, count }) => ({
    player,
    count,
    amount: totalSlots > 0 ? costPerSlot * count : costPerSlot
  }))
}

export function formatBaht(amount) {
  return (Number(amount) || 0).toFixed(2)
}
