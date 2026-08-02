'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

const ADMIN_PASSWORD = 'medenine2026'

export default function AjouterClientPage() {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    if (localStorage.getItem('medenine_admin') === 'true') {
      setLoggedIn(true)
    }
  }, [])

  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ nom: '', telephone: '', cin: '', property_title: '' })
  const [properties, setProperties] = useState([])

  useEffect(() => {
    if (loggedIn) {
      supabase.from('proprieties').select('title').eq('disponible', true).then(({ data }) => {
        if (data) setProperties(data)
      })
    }
  }, [loggedIn])

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

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nom || !form.telephone || !form.cin || !form.property_title) {
      setMsg('عمر كل الخانات.')
      return
    }
    setLoading(true)
    setMsg('')

    const { error } = await supabase.from('clients').insert({
      nom: form.nom,
      telephone: form.telephone,
      cin: form.cin,
      property_title: form.property_title,
      confirme: false
    })

    if (error) {
      setMsg('خطأ: ' + error.message)
    } else {
      // نخلي الدار غير متوفرة (تختفي من الصفحة الرئيسية)
      await supabase
        .from('proprieties')
        .update({ disponible: false })
        .eq('title', form.property_title)

      setMsg('تم إضافة الحريف والدار توّة غير معروضة للزوار ✓')
      setForm({ nom: '', telephone: '', cin: '', property_title: '' })
      setTimeout(() => router.push('/confirmer-clients'), 1000)
    }
    setLoading(false)
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
    <div className="wrap section" style={{ maxWidth: 480 }}>
      <h2 style={{ marginBottom: 24 }}>إضافة حريف جديد</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input name="nom" placeholder="الاسم الكامل" value={form.nom} onChange={handleChange} style={inputStyle} />
        <input name="telephone" placeholder="رقم الهاتف" value={form.telephone} onChange={handleChange} style={inputStyle} />
        <input name="cin" placeholder="رقم بطاقة التعريف (CIN)" value={form.cin} onChange={handleChange} style={inputStyle} />
        <select name="property_title" value={form.property_title} onChange={handleChange} style={inputStyle}>
          <option value="">-- اختار الدار --</option>
          {properties.map((p, i) => (
            <option key={i} value={p.title}>{p.title}</option>
          ))}
        </select>

        <button type="submit" disabled={loading} style={{ background: 'var(--ink)', color: '#fff', border: 'none', padding: 14, cursor: 'pointer', fontSize: '0.95rem' }}>
          {loading ? 'جاري الإضافة...' : 'إضافة الحريف'}
        </button>

        {msg && <div style={{ padding: 10, background: '#F3EFE4', fontSize: '0.85rem' }}>{msg}</div>}
      </form>
    </div>
  )
}

const inputStyle = {
  padding: 11, border: '1px solid var(--line)', background: 'var(--bg)',
  fontFamily: 'inherit', fontSize: '0.92rem', width: '100%'
}