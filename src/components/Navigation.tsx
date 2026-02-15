import { useTranslation } from 'react-i18next'

type Page = 'home' | 'top' | 'new' | 'completed' | 'my' | 'rating'

interface NavigationProps {
  currentPage: Page
  setCurrentPage: (page: Page) => void
}

export default function Navigation({ currentPage, setCurrentPage }: NavigationProps) {
  const { t } = useTranslation()

  const navItems: { label: string; value: Page; icon: string }[] = [
    { label: t('navigation.home'), value: 'home', icon: '🏠' },
    { label: t('navigation.top'), value: 'top', icon: '🔥' },
    { label: t('navigation.new'), value: 'new', icon: '🆕' },
    { label: t('navigation.completed'), value: 'completed', icon: '✅' },
    { label: t('navigation.myDreams'), value: 'my', icon: '👤' },
    { label: t('navigation.rating'), value: 'rating', icon: '⭐' },
  ]

  return (
    <nav className="bg-dark-900 bg-opacity-50 border-b border-neon-purple border-opacity-20">
      <div className="container mx-auto px-4">
        <div className="flex gap-1 py-3 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => setCurrentPage(item.value)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                currentPage === item.value
                  ? 'bg-neon-blue text-white font-semibold shadow-neon'
                  : 'text-gray-300 hover:text-neon-blue'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
