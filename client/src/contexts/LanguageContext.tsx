import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Translation } from '@/lib/translations'

type Language = 'en' | 'fa'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translation
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('lifeplan-language')
    return (saved === 'fa' || saved === 'en') ? saved : 'en'
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('lifeplan-language', lang)
  }

  useEffect(() => {
    // Set document direction based on language
    if (language === 'fa') {
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = 'fa'
    } else {
      document.documentElement.dir = 'ltr'
      document.documentElement.lang = 'en'
    }
  }, [language])

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    isRTL: language === 'fa'
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}