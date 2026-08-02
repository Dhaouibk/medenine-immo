'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = 'medenine2026' // نفس كلمة السر متاع /gerer و /ajouter

export default function ContratsPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    if (localStorage.getItem('medenine_admin') === 'true') {
      setLoggedIn(true)
    }
  }, [])

  const [contrats, setContrats] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const [form, setForm] = useState({
    property_title: '', nom_client: '', date_debut: '', notes: ''
  })

  useEffect(() => {
    if (loggedIn) loadContrats()
  }, [loggedIn])

  async function loadContrats() {
    setLoading(true)
    const { data, error } = await supabase
      .from('contrats')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setContrats(data)
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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.property_title || !form.nom_client || !form.date_debut) {
      setMsg('عمر العنوان، الاسم، وتاريخ البداية على الأقل.')
      return
    }
    const { error } = await supabase.from('contrats').insert({
      property_title: form.property_title,
      nom_client: form.nom_client,
      date_debut: form.date_debut,
      notes: form.notes,
      paye_ce_mois: false
    })
    if (error) {
      setMsg('خطأ: ' + error.message)
    } else {
      setMsg('تمت الإضافة ✓')
      setForm({ property_title: '', nom_client: '', date_debut: '', notes: '' })
      loadContrats()
    }
  }

  async function togglePaye(c) {
    const { error } = await supabase
      .from('contrats')
      .update({ paye_ce_mois: !c.paye_ce_mois })
      .eq('id', c.id)
    if (!error) loadContrats()
  }

  async function handleDelete(id) {
    if (!confirm('متأكد باش تحذف هذا العقد؟')) return
    const { error } = await supabase.from('contrats').delete().eq('id', id)
    if (!error) {
      setMsg('تم الحذف ✓')
      loadContrats()
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
      <h2 style={{ marginBottom: 24 }}>متابعة الكراء والبيع</h2>
      {msg && <div style={{ padding: 10, background: '#F3EFE4', fontSize: '0.85rem', marginBottom: 16 }}>{msg}</div>}

      {/* فورم إضافة عقد جديد */}
      <form onSubmit={handleAdd} style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12,
        border: '1px solid var(--line)', padding: 20, marginBottom: 30, background: '#FCFAF5'
      }}>
        <input name="property_title" placeholder="اسم / عنوان الدار" value={form.property_title} onChange={handleChange} style={inputStyle} />
        <input name="nom_client" placeholder="اسم الشخص (كاري/مشتري)" value={form.nom_client} onChange={handleChange} style={inputStyle} />
        <input name="date_debut" type="date" value={form.date_debut} onChange={handleChange} style={inputStyle} />
        <input name="notes" placeholder="ملاحظات (اختياري)" value={form.notes} onChange={handleChange} style={inputStyle} />
        <button type="submit" style={{
          gridColumn: '1 / -1', background: 'var(--ink)', color: '#fff', border: 'none',
          padding: 12, cursor: 'pointer', fontSize: '0.9rem'
        }}>+ إضافة عقد جديد</button>
      </form>

      {/* قائمة العقود */}
      {loading ? (
        <p>جاري التحميل...</p>
      ) : contrats.length === 0 ? (
        <div className="empty">ما فماش عقود مسجلة توّة.</div>
      ) : (
        contrats.map(c => (
          <div key={c.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: '1px solid var(--line)', padding: 16, marginBottom: 10, gap: 14
          }}>
            <div>
              <strong>{c.property_title}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--soft)' }}>
                {c.nom_client} · من {new Date(c.date_debut).toLocaleDateString('fr-FR')}
                {c.notes && ` · ${c.notes}`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                onClick={() => togglePaye(c)}
                style={{
                  padding: '8px 16px', border: '1px solid',
                  borderColor: c.paye_ce_mois ? '#3E7A4E' : '#B14B3F',
                  color: c.paye_ce_mois ? '#3E7A4E' : '#B14B3F',
                  background: 'none', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap'
                }}
              >
                {c.paye_ce_mois ? '✓ خلص هذا الشهر' : '✗ ما خلصش'}
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