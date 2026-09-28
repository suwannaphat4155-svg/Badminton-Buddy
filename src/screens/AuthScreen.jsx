import React, { useState } from 'react'

export default function AuthScreen({ supabase }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')

    try {
      const result = mode === 'signup'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })

      if (result.error) {
        setMessage(result.error.message)
        return
      }
      if (mode === 'signup' && !result.data.session) {
        setMessage('สร้างบัญชีแล้ว กรุณาตรวจอีเมลเพื่อยืนยันก่อนเข้าสู่ระบบ')
      }
    } catch (error) {
      setMessage(error.message || 'เชื่อมต่อระบบล็อกอินไม่ได้')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="cloud-gate">
      <section className="auth-panel">
        <div className="hero-eyebrow">BADMINTON BUDDY</div>
        <h1>{mode === 'signin' ? 'เข้าสู่ระบบ' : 'สร้างบัญชีผู้ดูแล'}</h1>
        <p>ประวัติเซสชันจะบันทึกออนไลน์และเข้าถึงได้จากบัญชีนี้</p>
        <form onSubmit={submit}>
          <label className="field">
            <span>อีเมล</span>
            <input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />
          </label>
          <label className="field">
            <span>รหัสผ่าน</span>
            <input type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={6} required value={password} onChange={event => setPassword(event.target.value)} />
          </label>
          {message && <div className="auth-message" role="status">{message}</div>}
          <button className="btn-primary" disabled={busy} type="submit">
            {busy ? 'กำลังดำเนินการ...' : mode === 'signin' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'}
          </button>
        </form>
        <button className="btn-text auth-switch" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage('') }}>
          {mode === 'signin' ? 'ยังไม่มีบัญชี? สร้างบัญชีผู้ดูแล' : 'มีบัญชีแล้ว? กลับไปเข้าสู่ระบบ'}
        </button>
      </section>
    </main>
  )
}
