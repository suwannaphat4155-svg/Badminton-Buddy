// Splits by player-game participation and assigns any remaining satang to the last player.
export function computeSplit(players, games, total) {
  const totalCents = Math.round((Number(total) || 0) * 100)
  const counts = players.map(player => ({
    player,
    count: games.filter(game => game.participantIds?.includes(player.id)).length
  }))
  const totalSlots = counts.reduce((sum, entry) => sum + entry.count, 0)
  const units = counts.map(({ count }) => totalSlots > 0 ? count : players.length ? 1 : 0)
  const denominator = totalSlots || players.length
  let centsLeft = totalCents
  return counts.map(({ player, count }, index) => {
    const cents = denominator ? Math.floor(totalCents * units[index] / denominator) : 0
    centsLeft -= cents
    return { player, count, amount: cents / 100 }
  }).map((row, index, rows) => index === rows.length - 1 && centsLeft
    ? { ...row, amount: row.amount + centsLeft / 100 }
    : row)
}

export function formatBaht(amount) {
  return (Number(amount) || 0).toFixed(2)
}
