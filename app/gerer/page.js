'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = 'medenine2026' // نفس كلمة سر /ajouter

export default function GererPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (loggedIn) loadProperties()
  }, [loggedIn])

  async function loadProperties() {
    setLoading(true)
    const { data, error } = await supabase.from('proprieties').select('*')
    if (!error) setProperties(data)
    setLoading(false)
  }

  function tryLogin(e) {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      setLoggedIn(true)
      setPwError('')
    } else {
      setPwError('كلمة السر غالطة')
    }
  }

  async function handleDelete(id) {
    if (!confirm('متأكد باش تحذف هذا العقار؟')) return
    const { error } = await supabase.from('proprieties').delete().eq('id', id)
    if (error) {
      setMsg('خطأ: ' + error.message)
    } else {
      setMsg('تم الحذف ✓')
      loadProperties()
    }
  }

  function startEdit(p) {
    setEditingId(p.id)
    setEditForm({ ...p })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({})
  }

  function handleEditChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  async function saveEdit() {
    const { error } = await supabase
      .from('proprieties')
      .update({
        title: editForm.title,
        type: editForm.type,
        operation: editForm.operation,
        price: Number(editForm.price),
        quartier: editForm.quartier,
        surface: Number(editForm.surface),
       chambres: Number(editForm.chambres),
        sdb: Number(editForm.sdb),
        description: editForm.description
      })
      .eq('id', editForm.id)

    if (error) {
      setMsg('خطأ: ' + error.message)
    } else {
      setMsg('تم التعديل بنجاح ✓')
      setEditingId(null)
      loadProperties()
    }
  }

  // شاشة الدخول
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
      <h2 style={{ marginBottom: 20 }}>تسيير العقارات ({properties.length})</h2>
      {msg && <div style={{ padding: 10, background: '#F3EFE4', fontSize: '0.85rem', marginBottom: 16 }}>{msg}</div>}

      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        properties.map(p => (
          <div key={p.id} style={{ border: '1px solid var(--line)', padding: 18, marginBottom: 12 }}>
            {editingId === p.id ? (
              // فورم التعديل
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input name="title" value={editForm.title || ''} onChange={handleEditChange} style={inputStyle} placeholder="العنوان" />
                <div style={{ display: 'flex', gap: 10 }}>
                  <select name="type" value={editForm.type || ''} onChange={handleEditChange} style={inputStyle}>
                    <option>Villa</option>
                    <option>Maison traditionnelle</option>
                    <option>Appartement</option>
                    <option>Terrain</option>
                  </select>
                  <select name="operation" value={editForm.operation || ''} onChange={handleEditChange} style={inputStyle}>
                    <option value="location">كراء</option>
                    <option value="vente">بيع</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input name="price" type="number" value={editForm.price || ''} onChange={handleEditChange} style={inputStyle} placeholder="السعر" />
                  <input name="quartier" value={editForm.quartier || ''} onChange={handleEditChange} style={inputStyle} placeholder="الحومة" />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input name="surface" type="number" value={editForm.surface || ''} onChange={handleEditChange} style={inputStyle} placeholder="المساحة" />
                 <input name="chambres" type="number" value={editForm.chambres || ''} onChange={handleEditChange} style={inputStyle} placeholder="بيوت" />
                  <input name="sdb" type="number" value={editForm.sdb || ''} onChange={handleEditChange} style={inputStyle} placeholder="حمامات" />
                </div>
                <textarea name="description" value={editForm.description || ''} onChange={handleEditChange} style={{ ...inputStyle, minHeight: 60 }} placeholder="الوصف" />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={saveEdit} style={{ background: 'var(--ink)', color: '#fff', border: 'none', padding: 10, cursor: 'pointer', flex: 1 }}>حفظ</button>
                  <button onClick={cancelEdit} style={{ background: 'none', border: '1px solid var(--line)', padding: 10, cursor: 'pointer', flex: 1 }}>إلغاء</button>
                </div>
              </div>
            ) : (
              // عرض عادي
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
                <div>
                  <strong>{p.title}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--soft)' }}>
                    {p.quartier} · {p.operation === 'location' ? 'كراء' : 'بيع'} · {Number(p.price).toLocaleString('fr-FR')} د.ت
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startEdit(p)} style={{ padding: '8px 16px', border: '1px solid var(--line)', background: 'none', cursor: 'pointer' }}>تعديل</button>
                  <button onClick={() => handleDelete(p.id)} style={{ padding: '8px 16px', border: '1px solid #B14B3F', color: '#B14B3F', background: 'none', cursor: 'pointer' }}>حذف</button>
                </div>
              </div>
            )}
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