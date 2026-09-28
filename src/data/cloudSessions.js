function mapSession(row) {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    players: row.player_count,
    games: row.game_count,
    total: Number(row.total) || 0,
    ...(row.session_data ? { sessionData: row.session_data } : {})
  }
}

function toRow(userId, session) {
  return {
    user_id: userId,
    id: session.id,
    name: session.name || 'Badminton Session',
    date: String(session.date || ''),
    player_count: Number(session.players) || 0,
    game_count: Number(session.games) || 0,
    total: Number(session.total) || 0,
    session_data: session.sessionData || null,
    updated_at: new Date().toISOString()
  }
}

export async function fetchCloudSessions(supabase, userId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data || []).map(mapSession)
}

export async function saveCloudSession(supabase, userId, session) {
  const { error } = await supabase
    .from('sessions')
    .upsert(toRow(userId, session), { onConflict: 'user_id,id' })

  if (error) throw error
}

export async function saveCloudSessions(supabase, userId, sessions) {
  if (!sessions.length) return
  const { error } = await supabase
    .from('sessions')
    .upsert(sessions.map(session => toRow(userId, session)), { onConflict: 'user_id,id' })

  if (error) throw error
}

export async function deleteCloudSession(supabase, userId, sessionId) {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('user_id', userId)
    .eq('id', sessionId)

  if (error) throw error
}
