import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import DreamCard from '../components/DreamCard'
import { useStore } from '../stores/StoreContext'
import type { Dream } from '../stores/DreamStore'

const TopDreamsPage = observer(function TopDreamsPage({ onOpenProfile }: { onOpenProfile: (walletAddress: string) => void }) {
  const { dreamStore } = useStore()

  useEffect(() => {
    dreamStore.loadDreamsByType('top')
  }, [dreamStore])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 gradient-text">🔥 Top Dreams</h1>
        <p className="text-gray-400">Most funded dreams on the platform</p>
      </div>

      {dreamStore.isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading top dreams...</div>
      ) : dreamStore.error ? (
        <div className="text-center py-12 text-red-400">{dreamStore.error}</div>
      ) : dreamStore.dreams.length > 0 ? (
        <div className="space-y-4">
          {dreamStore.dreams.map((dream: Dream, index) => (
            <div key={dream.id} className="flex gap-4">
              <div className="text-4xl font-bold text-neon-purple">#{index + 1}</div>
              <div className="flex-1">
                <DreamCard dream={dream} onOpenProfile={onOpenProfile} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">No dreams available</div>
      )}
    </div>
  )
})

export default TopDreamsPage
