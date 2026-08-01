'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

const ADMIN_PASSWORD = 'medenine2026'

export default function AjouterPage() {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')

  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  const [form, setForm] = useState({
    title: '', type: 'Villa', operation: 'location', price: '',
    quartier: '', surface: '', chambres: '', sdb: '', description: ''
  })

  function tryLogin(e) {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      setLoggedIn(true)
      setPwError('')
    } else {
      setPwError('كلمة السر غالطة')
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleImages(e) {
    const files = Array.from(e.target.files)
    setImageFiles(files)
    setImagePreviews(files.map(f => URL.createObjectURL(f)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      const imageUrls = []

      // رفع كل صورة وحدة بوحدة
      for (const file of imageFiles) {
        const fileName = `${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName)

        imageUrls.push(publicUrlData.publicUrl)
      }

      const { error: insertError } = await supabase
        .from('proprieties')
        .insert({
          title: form.title,
          type: form.type,
          operation: form.operation,
          price: Number(form.price),
          quartier: form.quartier,
          surface: Number(form.surface),
          chambres: Number(form.chambres),
          sdb: Number(form.sdb),
          description: form.description,
          images: imageUrls
        })

      if (insertError) throw insertError

      setMsg('تم إضافة العقار بنجاح ✓')
      setTimeout(() => router.push('/'), 1200)

    } catch (err) {
      setMsg('خطأ: ' + err.message)
    } finally {
      setLoading(false)
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
    <div className="wrap section" style={{ maxWidth: 560 }}>
      <h2 style={{ marginBottom: 24 }}>إضافة عقار جديد</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input name="title" placeholder="عنوان الإعلان" value={form.title} onChange={handleChange} required style={inputStyle} />

        <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
          <option>Villa</option>
          <option>Maison traditionnelle</option>
          <option>Appartement</option>
          <option>Terrain</option>
        </select>

        <select name="operation" value={form.operation} onChange={handleChange} style={inputStyle}>
          <option value="location">كراء</option>
          <option value="vente">بيع</option>
        </select>

        <input name="price" type="number" placeholder="السعر (دينار)" value={form.price} onChange={handleChange} required style={inputStyle} />
        <input name="quartier" placeholder="الحومة" value={form.quartier} onChange={handleChange} required style={inputStyle} />
        <input name="surface" type="number" placeholder="المساحة (m²)" value={form.surface} onChange={handleChange} style={inputStyle} />
        <input name="chambres" type="number" placeholder="عدد البيوت" value={form.chambres} onChange={handleChange} style={inputStyle} />
        <input name="sdb" type="number" placeholder="عدد الحمامات" value={form.sdb} onChange={handleChange} style={inputStyle} />
        <textarea name="description" placeholder="الوصف" value={form.description} onChange={handleChange} style={{ ...inputStyle, minHeight: 80 }} />

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--soft)' }}>
            صور العقار (تنجم تختار عدة صور مرة وحدة)
          </label>
          <input type="file" accept="image/*" multiple onChange={handleImages} />
          {imagePreviews.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 10 }}>
              {imagePreviews.map((src, i) => (
                <img key={i} src={src} alt="" style={{ height: 90, objectFit: 'cover', width: '100%' }} />
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} style={{ background: 'var(--ink)', color: '#fff', border: 'none', padding: 14, cursor: 'pointer', fontSize: '0.95rem' }}>
          {loading ? 'جاري الإضافة...' : 'إضافة العقار'}
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