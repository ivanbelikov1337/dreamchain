import { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import DreamCard from '../components/DreamCard'
import { useStore } from '../stores/StoreContext'
import type { Dream } from '../stores/DreamStore'

const RandomDreamPage = observer(function RandomDreamPage() {
  const { dreamStore, userStore } = useStore()
  const [randomDreamId, setRandomDreamId] = useState<string | null>(null)

  const pickRandomDreamId = () => {
    const otherPeopleDreams = dreamStore.dreams.filter(
      (d) => d.owner.address.toLowerCase() !== userStore.currentUser?.walletAddress?.toLowerCase()
    )
    if (otherPeopleDreams.length === 0) return null
    const randomIndex = Math.floor(Math.random() * otherPeopleDreams.length)
    return otherPeopleDreams[randomIndex].id
  }

  useEffect(() => {
    dreamStore.loadDreamsByType('random')
  }, [dreamStore])

  useEffect(() => {
    if (!randomDreamId && dreamStore.dreams.length > 0) {
      setRandomDreamId(pickRandomDreamId())
    }
  }, [randomDreamId, dreamStore.dreams.length])

  const getRandomDream = () => {
    setRandomDreamId(pickRandomDreamId())
  }

  const randomDream = randomDreamId ? dreamStore.getDreamById(randomDreamId) : undefined

  if (dreamStore.isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 gradient-text">🎲 Random Dream</h1>
            <p className="text-gray-400">Discover today's surprise</p>
          </div>
        </div>
        <div className="text-center py-12 text-gray-400">Loading dreams...</div>
      </div>
    )
  }

  if (dreamStore.error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 gradient-text">🎲 Random Dream</h1>
          <p className="text-gray-400">Discover today's surprise</p>
        </div>
        <div className="text-center py-12 text-red-400">{dreamStore.error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2 gradient-text">🎲 Random Dream</h1>
          <p className="text-gray-400">Discover today's surprise</p>
        </div>
        <button
          onClick={getRandomDream}
          className="px-6 py-3 bg-gradient-to-r from-neon-pink to-neon-purple text-white font-bold rounded-lg hover:shadow-neon-pink transition-all"
        >
          🎲 Another
        </button>
      </div>

      {randomDream && (
        <div className="max-w-2xl mx-auto">
          <DreamCard dream={randomDream} />
        </div>
      )}

      {/* More random dreams */}
      {dreamStore.dreams.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 gradient-text">💫 More Dreams to Explore</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dreamStore.dreams
              .filter(
                (d: Dream) =>
                  d.id !== randomDream?.id &&
                  d.owner.address.toLowerCase() !== userStore.currentUser?.walletAddress?.toLowerCase()
              )
              .slice(0, 4)
              .map((dream: Dream) => (
                <DreamCard key={dream.id} dream={dream} />
              ))}
          </div>
        </div>
      )}
    </div>
  )
})

export default RandomDreamPage
