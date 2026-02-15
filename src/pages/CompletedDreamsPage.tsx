import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import DreamCard from '../components/DreamCard'
import { useStore } from '../stores/StoreContext'
import type { Dream } from '../stores/DreamStore'

const CompletedDreamsPage = observer(function CompletedDreamsPage({ onOpenProfile }: { onOpenProfile: (walletAddress: string) => void }) {
  const { dreamStore } = useStore()

  useEffect(() => {
    dreamStore.loadDreamsByType('completed')
  }, [dreamStore])

  if (dreamStore.isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 gradient-text">✅ Completed Dreams</h1>
          <p className="text-gray-400">Dreams that reached their goals</p>
        </div>
        <div className="text-center py-12 text-gray-400">Loading completed dreams...</div>
      </div>
    )
  }

  if (dreamStore.error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 gradient-text">✅ Completed Dreams</h1>
          <p className="text-gray-400">Dreams that reached their goals</p>
        </div>
        <div className="text-center py-12 text-red-400">{dreamStore.error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 gradient-text">✅ Completed Dreams</h1>
        <p className="text-gray-400">Dreams that reached their goals</p>
      </div>

      {dreamStore.dreams.length > 0 ? (
        <div className="space-y-4">
          {dreamStore.dreams.map((dream: Dream) => (
            <div key={dream.id} className="max-w-4xl mx-auto">
              <DreamCard dream={dream} onOpenProfile={onOpenProfile} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">No completed dreams yet</div>
      )}
    </div>
  )
})

export default CompletedDreamsPage
