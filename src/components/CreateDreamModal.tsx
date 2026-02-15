import { useState, useEffect } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { useStore } from '../stores/StoreContext'
import { createDreamInContract } from '../services/contracts'
import Toast, { type ToastType } from './Toast'

// Hide number input spinners
const numberInputStyle = `
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
`

export default function CreateDreamModal({
  isOpen,
  onClose,
  onDreamCreated,
}: {
  isOpen: boolean
  onClose: () => void
  onDreamCreated?: () => void
}) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { userStore, dreamStore } = useStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
  })
  const [loading, setLoading] = useState(false)
  const [, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: ToastType
    txHash?: string
  } | null>(null)

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      goal: '',
    })
  }

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : ''
    } else {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = ''
    }

    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = ''
    }
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address) {
      setError(null)
      setToast({
        message: 'Please connect your wallet first',
        type: 'error',
      })
      resetForm()
      return
    }

    if (!formData.title || !formData.description || !formData.goal) {
      setError(null)
      setToast({
        message: 'Please fill in all required fields',
        type: 'error',
      })
      resetForm()
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log(`\n📝 Creating dream...`)
      console.log(`   Title: ${formData.title}`)
      console.log(`   Description: ${formData.description}`)
      console.log(`   Goal: ${formData.goal} USDC`)
      console.log(`   Creator: ${address}`)

      if (!walletClient || !publicClient) {
        setError(null)
        setToast({
          message: 'Wallet is not ready. Please connect and try again.',
          type: 'error',
        })
        resetForm()
        return
      }

      // Reserve a dream id without creating a record
      console.log(`🔢 Reserving dream ID...`)
      const dreamId = await dreamStore.getNextDreamId()

      // Create dream in smart contract
      console.log(`\n⛓️ Creating dream in smart contract...`)
      const contractTxHash = await createDreamInContract(
        walletClient,
        publicClient,
        dreamId,
        formData.title,
        formData.description,
        formData.goal,
        address,
        true // Skip database sync since we already created it above
      )

      console.log(`✅ Dream created on blockchain!`)
      console.log(`   Contract TX: ${contractTxHash}`)

      // Get or create user
      console.log(`🔍 Looking for existing user...`)
      const user = await userStore.getOrCreateUserByWallet(address)

      // Create dream in database after tx confirmation
      console.log(`💾 Creating dream in database...`)
      const createdDream = await dreamStore.createDream({
        id: dreamId,
        title: formData.title,
        description: formData.description,
        goal: parseFloat(formData.goal),
        userId: user.id,
      })
      console.log(`✅ Dream created in database: Database ID=${createdDream.id}`)
      console.log(`   Title: ${createdDream.title}`)
      console.log(`   Goal: ${createdDream.goal} USDC`)

      // Insert into UI only after tx confirmation
      dreamStore.addDreamFromApi(createdDream)

      // Show success toast with BaseScan link
      setToast({
        message: `Dream "${formData.title}" created successfully!`,
        type: 'success',
        txHash: contractTxHash,
      })

      // Call callback to refresh dreams data
      onDreamCreated?.()

      // Close modal immediately while toast stays visible
      resetForm()
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create dream'
      const isUserRejected =
        errorMessage.includes('User rejected') ||
        errorMessage.includes('User denied') ||
        errorMessage.includes('user rejected') ||
        errorMessage.includes('user denied') ||
        errorMessage.includes('Request arguments')

      setError(null)

      if (isUserRejected) {
        setToast({
          message: 'Transaction cancelled',
          type: 'cancelled',
        })
        resetForm()
        onClose()
        return
      }

      setToast({
        message: errorMessage,
        type: 'error',
      })
      resetForm()
      console.error(`\n❌ Error creating dream:`, err)
      console.error(`   Message: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen && !toast) return null

  return (
    <>
      <style>{numberInputStyle}</style>
      {isOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={handleBackdropClick}>
          <div className="glass rounded-2xl p-8 max-w-md w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6 gradient-text">Create a Dream ✨</h2>

        {!address && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400 text-sm">
            Please connect your wallet to create a dream
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Dream Name</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Write your dream here..."
              disabled={!address || loading}
              className="w-full px-3 sm:px-4 py-2 bg-gray-900 bg-opacity-40 border border-gray-700 border-opacity-60 rounded-lg text-white placeholder-gray-400 text-sm sm:text-base focus:border-neon-blue focus:border-opacity-100 focus:ring-2 focus:ring-neon-blue focus:ring-opacity-50 focus:outline-none disabled:opacity-40 transition-all backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us more about your dream..."
              disabled={!address || loading}
              className="w-full px-3 sm:px-4 py-2 bg-gray-900 bg-opacity-40 border border-gray-700 border-opacity-60 rounded-lg text-white placeholder-gray-400 text-sm sm:text-base focus:border-neon-blue focus:border-opacity-100 focus:ring-2 focus:ring-neon-blue focus:ring-opacity-50 focus:outline-none h-24 resize-none disabled:opacity-40 transition-all backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Fundraising Goal (USDC)</label>
            <input
              type="number"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              placeholder="100"
              step="0.01"
              disabled={!address || loading}
              className="w-full px-3 sm:px-4 py-2 bg-gray-900 bg-opacity-40 border border-gray-700 border-opacity-60 rounded-lg text-white placeholder-gray-400 text-sm sm:text-base focus:border-neon-blue focus:border-opacity-100 focus:ring-2 focus:ring-neon-blue focus:ring-opacity-50 focus:outline-none disabled:opacity-40 transition-all backdrop-blur-sm"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!address || loading}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create ✨'}
            </button>
          </div>
          </form>
        </div>
      </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} txHash={toast.txHash} onClose={() => setToast(null)} />}
    </>
  )
}
