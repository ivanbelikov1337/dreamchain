import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { useStore } from '../../stores/StoreContext'
import type { Dream as ApiDream } from '../../services/api'
import type { Dream } from '../../stores/DreamStore'
import DreamCard from '../DreamCard'

interface CreatedTabProps {
  walletAddress: string
  onOpenProfile?: (walletAddress: string) => void
}

const mapApiDreamToDreamCardDream = (apiDream: ApiDream, walletAddress: string): Dream => {
  return {
    id: String(apiDream.id),
    title: apiDream.title,
    description: apiDream.description,
    image: apiDream.imageUrl,
    owner: {
      address: apiDream.user?.walletAddress || walletAddress,
      rating: apiDream.user?.rating,
    },
    raised: apiDream.totalDonations,
    rating: apiDream.rating || 0,
    goal: apiDream.goal,
    currency: 'USDC',
    donorsCount: 0,
    createdAt: apiDream.createdAt,
    status: apiDream.status,
    isWithdrawn: apiDream.isWithdrawn,
  }
}

const CreatedTab = observer(function CreatedTab({ walletAddress, onOpenProfile }: CreatedTabProps) {
  const { t } = useTranslation()
  const { profileStore } = useStore()

  useEffect(() => {
    profileStore.loadCreatedDreams(walletAddress)
  }, [walletAddress, profileStore])

  const dreams = profileStore.createdDreams
  const isLoading = profileStore.loadingCreated

  if (isLoading) {
    return (
      <div className="text-center py-12 min-h-[300px] flex items-center justify-center">
        <div className="text-gray-400">{t('common.loading')}</div>
      </div>
    )
  }

  if (dreams.length === 0) {
    return (
      <div className="text-center py-12 min-h-[300px] flex items-center justify-center">
        <p className="text-gray-400 text-lg">{t('profile.noDreams')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dreams.map((dream) => {
        const mappedDream = mapApiDreamToDreamCardDream(dream, walletAddress)
        return (
          <DreamCard key={dream.id} dream={mappedDream} onOpenProfile={onOpenProfile} />
        )
      })}
    </div>
  )
})

export default CreatedTab
