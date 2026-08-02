'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = 'medenine2026'

export default function ConfirmerClientsPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    if (localStorage.getItem('medenine_admin') === 'true') {
      setLoggedIn(true)
    }
  }, [])

  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (loggedIn) loadClients()
  }, [loggedIn])

  async function loadClients() {
    setLoading(true)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setClients(data)
    setLoading(false)
  }

  function tryLogin(e) {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      setLoggedIn(true)
      localStorage.setItem('medenine_admin', 'true')
      setPwError('')
    } else {
      setPwError('كلمة السر غالطة')
    }
  }

  async function toggleConfirme(c) {
    const newConfirme = !c.confirme
    const newMois = newConfirme ? (c.mois_payes || 0) + 1 : c.mois_payes
    const { error } = await supabase
      .from('clients')
      .update({ confirme: newConfirme, mois_payes: newMois })
      .eq('id', c.id)
    if (!error) loadClients()
  }

  async function handleDelete(id) {
    if (!confirm('متأكد باش تحذف هذا الحريف؟')) return
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (!error) {
      setMsg('تم الحذف ✓')
      loadClients()
    }
  }

  if (!loggedIn) {
    return (
      <div className="wrap section" style={{ maxWidth: 380, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 10 }}>دخول</h2>
        <p style={{ color: 'var(--soft)', fontSize: '0.88rem', marginBottom: 20 }}>
          هذي الصفحة خاصة بصاحب الموقع فقط
        </p>
        <form onSubmit={tryLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="password" placeholder="كلمة السر" value={pw} onChange={e => setPw(e.target.value)} style={inputStyle} />
          <button type="submit" style={{ background: 'var(--ink)', color: '#fff', border: 'none', padding: 12, cursor: 'pointer' }}>دخول</button>
          {pwError && <div style={{ color: '#B14B3F', fontSize: '0.85rem' }}>{pwError}</div>}
        </form>
      </div>
    )
  }

  return (
    <div className="wrap section">
      <h2 style={{ marginBottom: 24 }}>تأكيد معلومات الحرفاء ({clients.length})</h2>
      {msg && <div style={{ padding: 10, background: '#F3EFE4', fontSize: '0.85rem', marginBottom: 16 }}>{msg}</div>}

      {loading ? (
        <p>جاري التحميل...</p>
      ) : clients.length === 0 ? (
        <div className="empty">ما فماش حرفاء مسجلين توّة.</div>
      ) : (
        clients.map(c => (
          <div key={c.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: '1px solid var(--line)', padding: 16, marginBottom: 10, gap: 14
          }}>
            <div>
              <strong>{c.nom}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--soft)' }}>
                📞 {c.telephone} · CIN: {c.cin} · 🏠 {c.property_title}
                {c.date_debut && ` · 📅 ${new Date(c.date_debut).toLocaleDateString('fr-FR')}`}
                {' · '}<strong>{c.mois_payes || 0} شهر مدفوع</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                onClick={() => toggleConfirme(c)}
                style={{
                  padding: '8px 16px', border: '1px solid',
                  borderColor: c.confirme ? '#3E7A4E' : '#B14B3F',
                  color: c.confirme ? '#3E7A4E' : '#B14B3F',
                  background: 'none', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap'
                }}
              >
                {c.confirme ? '✓ مؤكد' : '✗ غير مؤكد'}
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                style={{ padding: '8px 16px', border: '1px solid #B14B3F', color: '#B14B3F', background: 'none', cursor: 'pointer' }}
              >حذف</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

const inputStyle = {
  padding: 10, border: '1px solid var(--line)', background: 'var(--bg)',
  fontFamily: 'inherit', fontSize: '0.9rem', width: '100%'
}