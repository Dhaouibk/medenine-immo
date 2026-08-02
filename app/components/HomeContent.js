'use client'
import { useState, useEffect } from 'react'
import { translations } from '../lib/translations'
import PropertyList from './PropertyList'

export function HomeContent({ properties }) {
  const [lang, setLang] = useState('ar')

  useEffect(() => {
    const saved = localStorage.getItem('medenine_lang')
    if (saved) setLang(saved)
  }, [])

  function changeLang(newLang) {
    setLang(newLang)
    localStorage.setItem('medenine_lang', newLang)
  }

  const t = translations[lang]

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header>
        <div className="wrap nav">
      <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
  <img src="/logo.png" alt="Médenine Immo" style={{ height: 100, width: 'auto' }} />
  <span>Médenine <em>Immo</em></span>
</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 4, overflow: 'hidden' }}>
              <button
                onClick={() => changeLang('ar')}
                style={{
                  padding: '7px 14px', border: 'none', cursor: 'pointer',
                  background: lang === 'ar' ? 'var(--ink)' : 'none',
                  color: lang === 'ar' ? '#fff' : 'var(--ink)', fontSize: '0.8rem'
                }}
              >عربي</button>
              <button
                onClick={() => changeLang('fr')}
                style={{
                  padding: '7px 14px', border: 'none', cursor: 'pointer',
                  background: lang === 'fr' ? 'var(--ink)' : 'none',
                  color: lang === 'fr' ? '#fff' : 'var(--ink)', fontSize: '0.8rem'
                }}
              >FR</button>
            </div>
         <a href="/gerer" style={{ border: '1px solid var(--line)', padding: '9px 20px', fontSize: '0.85rem' }}>{t.manage}</a>
           
            <a href="/ajouter-client" style={{ border: '1px solid var(--line)', padding: '9px 20px', fontSize: '0.85rem' }}>{t.addClient}</a>
<a href="/confirmer-clients" style={{ border: '1px solid var(--line)', padding: '9px 20px', fontSize: '0.85rem' }}>{t.clientsList}</a>
            <a href="/ajouter" style={{ border: '1px solid var(--line)', padding: '9px 20px', fontSize: '0.85rem' }}>{t.addProperty}</a>
          </div>
        </div>
      </header>

      <section className="wrap section">
        <div className="section-top">
          <div>
            <span className="kicker">{t.kicker}</span>
            <h2>{t.tagline}</h2>
          </div>
        </div>

        <PropertyList properties={properties} t={t} />
      </section>
    </div>
  )
}