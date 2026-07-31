'use client'
import { useState } from 'react'

export default function PropertyList({ properties }) {
  const [op, setOp] = useState('')
  const [quartier, setQuartier] = useState('')
  const [keyword, setKeyword] = useState('')

  const quartiers = [...new Set(properties.map(p => p.quartier))]

  const filtered = properties.filter(p => {
    if (op && p.operation !== op) return false
    if (quartier && p.quartier !== quartier) return false
    if (keyword && !p.title.toLowerCase().includes(keyword.toLowerCase())) return false
    return true
  })

  return (
    <>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 30, alignItems: 'center' }}>
        <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 2 }}>
          <button
            onClick={() => setOp('')}
            style={{ padding: '9px 18px', border: 'none', background: op === '' ? 'var(--ink)' : 'none', color: op === '' ? '#fff' : 'var(--ink)', cursor: 'pointer' }}
          >الكل</button>
          <button
            onClick={() => setOp('location')}
            style={{ padding: '9px 18px', border: 'none', background: op === 'location' ? 'var(--ink)' : 'none', color: op === 'location' ? '#fff' : 'var(--ink)', cursor: 'pointer' }}
          >كراء</button>
          <button
            onClick={() => setOp('vente')}
            style={{ padding: '9px 18px', border: 'none', background: op === 'vente' ? 'var(--ink)' : 'none', color: op === 'vente' ? '#fff' : 'var(--ink)', cursor: 'pointer' }}
          >بيع</button>
        </div>

        <select value={quartier} onChange={e => setQuartier(e.target.value)} style={{ padding: 9, border: '1px solid var(--line)', background: 'var(--bg)' }}>
          <option value="">كل الحومات</option>
          {quartiers.map(q => <option key={q} value={q}>{q}</option>)}
        </select>

        <input
          type="text"
          placeholder="بحث بالعنوان..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          style={{ padding: 9, border: '1px solid var(--line)', background: 'var(--bg)', flex: 1, minWidth: 160 }}
        />

        <span style={{ fontSize: '0.82rem', color: 'var(--soft)' }}>{filtered.length} عقار</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">ما فماش عقار يجاوب البحث.</div>
      ) : (
        <div>
          {filtered.map((p) => (
            <div className="listing" key={p.id}>
              <div className="thumb">
<img src={p.image_url || "https://loremflickr.com/640/480/tunisia,house"} alt={p.title} />              </div>
              <div>
                <span className="badge">
                  {p.operation === 'location' ? 'À louer' : 'À vendre'} · {p.type}
                </span>
                <h3>{p.title}</h3>
                <div className="loc">{p.quartier}, Médenine</div>
                <div className="specs">
                  <span>{p.surface} m²</span>
                  <span>{p.chambres} chambres</span>
                  <span>{p.sdb} sdb</span>
                </div>
              </div>
              <div className="price-col">
                <span className="price">{Number(p.price).toLocaleString('fr-FR')}</span>
                <span className="unit">{p.operation === 'location' ? 'TND / mois' : 'TND'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}