import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../stores/StoreContext'

interface EditUsernameModalProps {
  walletAddress: string
  currentUsername: string | null
  onClose: () => void
  onSuccess?: (message: string) => void
}

const EditUsernameModal = observer(function EditUsernameModal({
  walletAddress,
  currentUsername,
  onClose,
  onSuccess,
}: EditUsernameModalProps) {
  const { userStore } = useStore()
  const [username, setUsername] = useState(currentUsername || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      setError('Username cannot be empty')
      return
    }

    if (username === currentUsername) {
      setError('Username is the same as current')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await userStore.updateUsername(walletAddress, username.trim())
      // Close modal immediately and notify parent about success
      onClose()
      onSuccess?.('Username updated successfully! 🎉')
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to update username'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={handleBackdropClick}>
        <div className="glass rounded-2xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-6 gradient-text">Profile Settings ✨</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError('')
                }}
                placeholder="Enter new username..."
                disabled={isLoading}
                className="w-full px-3 sm:px-4 py-2 bg-gray-900 bg-opacity-40 border border-gray-700 border-opacity-60 rounded-lg text-white placeholder-gray-400 text-sm sm:text-base focus:border-neon-blue focus:border-opacity-100 focus:ring-2 focus:ring-neon-blue focus:ring-opacity-50 focus:outline-none disabled:opacity-40 transition-all backdrop-blur-sm"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">Max 50 characters</p>
            </div>

            {error && (
              <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                {isLoading ? '🔄 Saving...' : '✨ Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
})

export default EditUsernameModal
