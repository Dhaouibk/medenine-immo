'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const PAGE_SIZE = 20

export default function PropertyList({ t }) {
  const [op, setOp] = useState('')
  const [quartier, setQuartier] = useState('')
  const [keyword, setKeyword] = useState('')

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [quartiers, setQuartiers] = useState([])

  const [galleryProperty, setGalleryProperty] = useState(null)
  const [galleryIndex, setGalleryIndex] = useState(0)

  // نجيب قائمة الحومات مرة وحدة
  useEffect(() => {
    supabase.from('proprieties').select('quartier').eq('disponible', true).then(({ data }) => {
      if (data) setQuartiers([...new Set(data.map(d => d.quartier))])
    })
  }, [])

  const fetchPage = useCallback(async (from) => {
    let query = supabase
      .from('proprieties')
      .select('*')
      .eq('disponible', true)
      .range(from, from + PAGE_SIZE - 1)

    if (op) query = query.eq('operation', op)
    if (quartier) query = query.eq('quartier', quartier)
    if (keyword) query = query.ilike('title', `%${keyword}%`)

    const { data, error } = await query
    return error ? [] : data
  }, [op, quartier, keyword])

  // كي تتبدل الفلاتر، نبدا من جديد
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchPage(0).then(data => {
      if (cancelled) return
      setItems(data)
      setHasMore(data.length === PAGE_SIZE)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [fetchPage])

  async function loadMore() {
    const data = await fetchPage(items.length)
    setItems(prev => [...prev, ...data])
    setHasMore(data.length === PAGE_SIZE)
  }

  function getImages(p) {
    if (p.images && p.images.length > 0) return p.images
    if (p.image_url) return [p.image_url]
    return ['https://loremflickr.com/640/480/tunisia,house']
  }

  function openGallery(p) {
    setGalleryProperty(p)
    setGalleryIndex(0)
  }
  function closeGallery() { setGalleryProperty(null) }
  function nextImage(e) {
    e.stopPropagation()
    const imgs = getImages(galleryProperty)
    setGalleryIndex((galleryIndex + 1) % imgs.length)
  }
  function prevImage(e) {
    e.stopPropagation()
    const imgs = getImages(galleryProperty)
    setGalleryIndex((galleryIndex - 1 + imgs.length) % imgs.length)
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 30, alignItems: 'center' }}>
        <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 2 }}>
          <button onClick={() => setOp('')} style={{ padding: '9px 18px', border: 'none', background: op === '' ? 'var(--ink)' : 'none', color: op === '' ? '#fff' : 'var(--ink)', cursor: 'pointer' }}>{t.all}</button>
          <button onClick={() => setOp('location')} style={{ padding: '9px 18px', border: 'none', background: op === 'location' ? 'var(--ink)' : 'none', color: op === 'location' ? '#fff' : 'var(--ink)', cursor: 'pointer' }}>{t.rent}</button>
          <button onClick={() => setOp('vente')} style={{ padding: '9px 18px', border: 'none', background: op === 'vente' ? 'var(--ink)' : 'none', color: op === 'vente' ? '#fff' : 'var(--ink)', cursor: 'pointer' }}>{t.sale}</button>
        </div>

        <select value={quartier} onChange={e => setQuartier(e.target.value)} style={{ padding: 9, border: '1px solid var(--line)', background: 'var(--bg)' }}>
          <option value="">{t.allNeighborhoods}</option>
          {quartiers.map(q => <option key={q} value={q}>{q}</option>)}
        </select>

        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          style={{ padding: 9, border: '1px solid var(--line)', background: 'var(--bg)', flex: 1, minWidth: 160 }}
        />
      </div>

      {loading ? (
        <p style={{ color: 'var(--soft)' }}>...</p>
      ) : items.length === 0 ? (
        <div className="empty">{t.noResults}</div>
      ) : (
        <div>
          {items.map((p) => {
            const imgs = getImages(p)
            return (
              <div className="listing" key={p.id} onClick={() => openGallery(p)} style={{ cursor: 'pointer' }}>
                <div className="thumb" style={{ position: 'relative' }}>
                  <img src={imgs[0]} alt={p.title} />
                  {imgs.length > 1 && (
                    <span style={{
                      position: 'absolute', bottom: 8, right: 8,
                      background: 'rgba(0,0,0,0.65)', color: '#fff',
                      fontSize: '0.72rem', padding: '3px 9px', borderRadius: 999
                    }}>
                      📷 {imgs.length}
                    </span>
                  )}
                </div>
                <div>
                  <span className="badge">
                    {p.operation === 'location' ? t.forRent : t.forSale} · {p.type}
                  </span>
                  <h3>{p.title}</h3>
                  <div className="loc">{p.quartier}, Médenine</div>
                  <div className="specs">
                    <span>{p.surface} m²</span>
                    <span>{p.chambres} {t.rooms}</span>
                    <span>{p.sdb} {t.bathrooms}</span>
                  </div>
                </div>
                <div className="price-col">
                  <span className="price">{Number(p.price).toLocaleString('fr-FR')}</span>
                  <span className="unit">{p.operation === 'location' ? 'TND / mois' : 'TND'}</span>
                </div>
              </div>
            )
          })}

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button
                onClick={loadMore}
                style={{ border: '1px solid var(--line)', background: 'none', padding: '12px 30px', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                عرض المزيد
              </button>
            </div>
          )}
        </div>
      )}

      {galleryProperty && (
        <div
          onClick={closeGallery}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 20
          }}
        >
          <button
            onClick={closeGallery}
            style={{
              position: 'absolute', top: 20, right: 20, background: 'none',
              border: 'none', color: '#fff', fontSize: '1.8rem', cursor: 'pointer'
            }}
          >✕</button>

          <div style={{ color: '#fff', marginBottom: 14, fontSize: '0.95rem' }}>{galleryProperty.title}</div>
          {galleryProperty.description && (
            <div style={{ color: '#5B9BD5', marginBottom: 14, fontSize: '1rem', maxWidth: 500, textAlign: 'center' }}>
              {galleryProperty.description}
            </div>
          )}
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '75vh', display: 'flex', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
            {getImages(galleryProperty).length > 1 && (
              <button onClick={prevImage} style={navBtnStyle}>‹</button>
            )}
            <img
              src={getImages(galleryProperty)[galleryIndex]}
              alt=""
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }}
            />
            {getImages(galleryProperty).length > 1 && (
              <button onClick={nextImage} style={{ ...navBtnStyle, right: -50, left: 'auto' }}>›</button>
            )}
          </div>

          <div style={{ color: '#ccc', marginTop: 14, fontSize: '0.85rem' }}>
            {galleryIndex + 1} / {getImages(galleryProperty).length}
          </div>
        </div>
      )}
    </>
  )
}

const navBtnStyle = {
  position: 'absolute', left: -50, background: 'rgba(255,255,255,0.15)',
  border: 'none', color: '#fff', fontSize: '2rem', width: 44, height: 44,
  borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
}