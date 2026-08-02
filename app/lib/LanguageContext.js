'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from './translations'

const LanguageContext = createContext({
  lang: 'ar',
  changeLang: () => {},
  t: translations.ar
})

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('ar')
  console.log('LanguageProvider render, lang =', lang)

  useEffect(() => {
    const saved = localStorage.getItem('medenine_lang')
    if (saved) setLang(saved)
  }, [])

  function changeLang(newLang) {
    console.log('تبديل اللغة إلى:', newLang)
    setLang(newLang)
    localStorage.setItem('medenine_lang', newLang)
  }

  const t = translations[lang]

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>{children}</div>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const value = useContext(LanguageContext)
  console.log('useLanguage returned:', value)
  return value
}
