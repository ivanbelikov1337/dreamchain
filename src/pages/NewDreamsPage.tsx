import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import DreamCard from '../components/DreamCard'
import { useStore } from '../stores/StoreContext'
import type { Dream } from '../stores/DreamStore'

const NewDreamsPage = observer(function NewDreamsPage({ onOpenProfile }: { onOpenProfile: (walletAddress: string) => void }) {
  const { dreamStore } = useStore()

  useEffect(() => {
    dreamStore.loadDreamsByType('new')
  }, [dreamStore])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 gradient-text">🆕 New Dreams</h1>
        <p className="text-gray-400">Newly created community dreams</p>
      </div>

      {dreamStore.isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading new dreams...</div>
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
    </div>
  )
})

export default NewDreamsPage
