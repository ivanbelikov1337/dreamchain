import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en', name: 'English', display: 'EN', flag: '🇬🇧' },
    { code: 'uk', name: 'Українська', display: 'UA', flag: '🇺🇦' },
    { code: 'ru', name: 'Русский', display: 'RU', flag: '🇷🇺' },
    { code: 'es', name: 'Español', display: 'ES', flag: '🇪🇸' },
    { code: 'pl', name: 'Polski', display: 'PL', flag: '🇵🇱' },
  ]

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0]

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem('language', code)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-secondary text-gray-300 hover:bg-dark-tertiary transition-all"
      >
        <span className="text-sm font-medium uppercase">{currentLanguage.display}</span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-gray-800/90 backdrop-blur border border-gray-700 rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full px-4 py-3 text-left flex items-center gap-2 transition-all ${
                i18n.language === lang.code
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                  : 'text-gray-300 hover:bg-dark-tertiary'
              }`}
            >
              <span className="text-sm font-semibold">{lang.display}</span>
              <span className="text-xs opacity-75">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
