import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useDisconnect } from "wagmi";
import { ImExit } from "react-icons/im";
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../stores/StoreContext'
import LanguageSwitcher from "./LanguageSwitcher";

type Page = 'home' | 'top' | 'new' | 'completed' | 'my' | 'rating' | 'terms' | 'privacy' | 'profile'

interface HeaderProps {
  currentPage: Page
  setCurrentPage: (page: Page) => void
  onOpenProfile: (walletAddress: string) => void
}

// Generate avatar URL from wallet address
const getAvatarUrl = (address: string | undefined) => {
  if (!address) return null;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`;
};

const getPageFromPath = (pathname: string): Page => {
  if (pathname === '/') return 'home'
  if (pathname === '/top') return 'top'
  if (pathname === '/new') return 'new'
  if (pathname === '/completed') return 'completed'
  if (pathname === '/my') return 'my'
  if (pathname === '/rating') return 'rating'
  if (pathname === '/terms') return 'terms'
  if (pathname === '/privacy') return 'privacy'
  if (pathname.startsWith('/profile/')) return 'profile'
  return 'home'
}

export default function Header({ currentPage: _, setCurrentPage, onOpenProfile }: HeaderProps) {
  const { t } = useTranslation()
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { userStore } = useStore()
  const avatarUrl = getAvatarUrl(address);
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const currentPage = getPageFromPath(location.pathname)

  // Create user on backend when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      userStore.getOrCreateUserByWallet(address).catch((err) => {
        console.error('Error creating/getting user on wallet connect:', err)
      })
    }
  }, [isConnected, address, userStore])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const navItems: { label: string; value: Page; icon: string }[] = [
    { label: t('navigation.home'), value: 'home', icon: '🏠' },
    { label: t('navigation.top'), value: 'top', icon: '🔥' },
    { label: t('navigation.new'), value: 'new', icon: '🆕' },
    { label: t('navigation.completed'), value: 'completed', icon: '✅' },
    { label: t('navigation.myDreams'), value: 'my', icon: '👤' },
    { label: t('navigation.rating'), value: 'rating', icon: '⭐' },
  ]

  return (
    <>
      <header className="border-b border-neon-blue border-opacity-20 sticky top-0 z-50 glass">
        <div className="container mx-auto px-4">
          {/* Header top row */}
          <div className="py-4 flex justify-between items-center">
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 flex-shrink-0 min-w-fit hover:opacity-80 transition-opacity cursor-pointer"
              title="Go to home"
            >
              <div className="text-2xl sm:text-3xl font-bold gradient-text whitespace-nowrap">✨ DreamChain</div>
            </button>

            {/* Navigation centered - hidden on mobile, shown on xl+ */}
            <nav className="hidden xl:flex gap-1 flex-1 justify-center px-4">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setCurrentPage(item.value)}
                  className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium ${
                    currentPage === item.value
                      ? 'bg-neon-blue text-blue-800 font-semibold shadow-neon'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <LanguageSwitcher />
              
              {/* Desktop wallet button and avatar - hidden on xl below */}
              <div className="hidden xl:flex items-center gap-2 sm:gap-4">
                {isConnected && avatarUrl && (
                  <button
                    onClick={() => address && onOpenProfile(address)}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-neon-blue hover:border-neon-purple flex-shrink-0 transition-colors"
                    title="View your profile"
                  >
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </button>
                )}
                <button
                  onClick={() => open()}
                  className="px-2 sm:px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold rounded-lg hover:shadow-neon transition-all text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
                >
                  {isConnected
                    ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                    : "Connect"}
                </button>
                {isConnected && (
                  <button
                    onClick={() => disconnect()}
                    className="p-2 text-neon-blue hover:text-neon-purple transition-all text-lg flex-shrink-0"
                    title="Disconnect Wallet"
                  >
                    <ImExit />
                  </button>
                )}
              </div>

              {/* Burger menu button - shown on xl below */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="xl:hidden p-2 text-neon-blue hover:text-neon-purple transition-all text-2xl flex-shrink-0"
                title={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu - fullscreen overlay rendered outside header */}
      {isMenuOpen && (
        <div className="fixed inset-0 xl:hidden glass z-50 flex flex-col">
          {/* Close button in top right */}
          <div className="flex justify-between items-center p-4 border-b border-neon-blue border-opacity-20">
            <div className="text-2xl font-bold gradient-text">✨ DreamChain</div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-neon-blue hover:text-neon-purple transition-all text-3xl"
              title="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Menu content */}
          <div className="flex flex-col h-full overflow-y-auto">
            {/* User avatar and wallet info */}
            {isConnected && avatarUrl && (
              <div 
                className="flex flex-col items-center gap-4 py-8 border-b border-neon-blue border-opacity-20 px-4"
              >
                <button
                  onClick={() => {
                    if (address) {
                      onOpenProfile(address)
                    }
                    setIsMenuOpen(false)
                  }}
                  title="View your profile"
                  className="w-20 h-20 rounded-full border-3 border-neon-blue hover:border-neon-purple transition-colors"
                >
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                </button>
                <div className="text-center">
                  <button
                    onClick={() => open()}
                    className="text-neon-blue font-semibold text-lg hover:text-neon-purple transition-all cursor-pointer"
                  >
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </button>
                  <p className="text-gray-400 text-sm">Click to manage</p>
                </div>
              </div>
            )}

            {/* Navigation items */}
            <nav className="flex flex-col gap-3 py-6 px-4 flex-1">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    setCurrentPage(item.value)
                    setIsMenuOpen(false)
                  }}
                  className={`w-full text-left px-4 py-4 rounded-lg transition-all font-medium text-lg ${
                    currentPage === item.value
                      ? 'bg-neon-blue text-blue-400 font-semibold'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </nav>

            {/* Wallet controls at bottom */}
            <div className="border-t border-neon-blue border-opacity-20 p-4 flex flex-col gap-3">
              {!isConnected && (
                <button
                  onClick={() => {
                    open()
                    setIsMenuOpen(false)
                  }}
                  className="w-full px-4 py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold rounded-lg hover:shadow-neon transition-all text-base"
                >
                  Connect Wallet
                </button>
              )}
              {isConnected && (
                <button
                  onClick={() => {
                    disconnect()
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 text-neon-blue hover:bg-gray-700 rounded-lg transition-all text-base border border-neon-blue border-opacity-30"
                >
                  <ImExit className="text-xl" /> Disconnect
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
