import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { useAccount } from 'wagmi'
import DreamCard from '../components/DreamCard'
import { useStore } from '../stores/StoreContext'
import type { Dream } from '../stores/DreamStore'

const HomePage = observer(function HomePage({
  setIsModalOpen,
  onOpenProfile,
}: {
  isModalOpen: boolean
  setIsModalOpen: (open: boolean) => void
  onOpenProfile: (walletAddress: string) => void
}) {
  const { t } = useTranslation()
  const { dreamStore, userStore, uiStore } = useStore()
  const { address } = useAccount()

  useEffect(() => {
    dreamStore.loadDreams(1, 6)
    dreamStore.loadDreamStats()
  }, [dreamStore])

  const handleCreateDreamClick = async () => {
    if (!address) {
      setIsModalOpen(true)
      return
    }

    try {
      // Refresh current user to get latest chances data from server
      const user = await userStore.refreshCurrentUser(address)
      
      if (user && user.chances && user.chances > 0) {
        uiStore.openCreateDreamModal()
      } else {
        uiStore.openNoChancesModal()
      }
    } catch (err) {
      console.error('Error loading user data:', err)
      // Fallback: try to create/get user
      const user = await userStore.getOrCreateUserByWallet(address)
      if (user && user.chances && user.chances > 0) {
        uiStore.openCreateDreamModal()
      } else {
        uiStore.openNoChancesModal()
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold mb-4">
          <span className="gradient-text">{t('homePage.title')}</span>
          <br />
          <span className="text-white">{t('homePage.subtitle')}</span>
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          {t('homePage.description')}
        </p>
        <button
          onClick={handleCreateDreamClick}
          className="px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold rounded-lg hover:shadow-neon transition-all text-2xl hover:scale-105 hover:brightness-110"
        >
          {t('homePage.createDreamBtn')}
        </button>
      </section>

      {/* Featured section */}
      <section>
        <h2 className="text-3xl font-bold mb-6 gradient-text">{t('homePage.featuredDreams')}</h2>
        {dreamStore.isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading dreams...</div>
        ) : dreamStore.error ? (
          <div className="text-center py-12 text-red-400">{dreamStore.error}</div>
        ) : dreamStore.dreams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dreamStore.dreams.map((dream: Dream) => (
              <DreamCard key={dream.id} dream={dream} onOpenProfile={onOpenProfile} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">No dreams available</div>
        )}
      </section>

      {/* Stats section */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 py-8">
        <div className="glass rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-neon-blue mb-2">
            {dreamStore.stats ? `${dreamStore.stats.totalDreams}+` : '-'}
          </div>
          <div className="text-gray-400">{t('homePage.totalDreams')}</div>
        </div>
        <div className="glass rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-neon-purple mb-2">
            {dreamStore.stats ? dreamStore.stats.activeDonors : '-'}
          </div>
          <div className="text-gray-400">{t('homePage.activeDonors')}</div>
        </div>
        <div className="glass rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-neon-pink mb-2">
            {dreamStore.stats ? dreamStore.stats.completedDreams : '-'}
          </div>
          <div className="text-gray-400">{t('homePage.completedDreams')}</div>
        </div>
        <div className="glass rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-neon-green mb-2">
            {dreamStore.stats
              ? `${dreamStore.stats.totalRaised.toFixed(0)} USDC`
              : '-'}
          </div>
          <div className="text-gray-400">{t('homePage.totalRaised')}</div>
        </div>
      </section>
    </div>
  )
})

export default HomePage
