import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { donateToDream, withdrawDream } from '../services/contracts'
import { useStore } from '../stores/StoreContext'
import type { Dream } from '../stores/DreamStore'
import Toast, { type ToastType } from './Toast'

// CSS to hide number input arrows
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

interface DreamCardProps {
  dream: Dream
  onDonationSuccess?: () => void | Promise<void>
  onOpenProfile?: (walletAddress: string) => void
}

const DreamCard = observer(function DreamCard({
  dream,
  onDonationSuccess,
  onOpenProfile,
}: DreamCardProps) {
  const [donationAmount, setDonationAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{
    message: string
    type: ToastType
    txHash?: string
  } | null>(null)
  // const [usdcBalance, setUsdcBalance] = useState('')
  // const [showBalanceInfo, setShowBalanceInfo] = useState(false)

  const { dreamStore } = useStore()
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const { id, title, description, image, owner, raised, goal, currency, rating } = dream

  const raisedAmount = typeof raised === 'string' ? parseFloat(raised) : raised
  const goalAmount = typeof goal === 'string' ? parseFloat(goal) : goal
  const progressPercent = goalAmount ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0
  
  console.log(`🎯 Dream #${id} Progress: ${raisedAmount}/${goalAmount} = ${progressPercent.toFixed(2)}%`)
  
  const isOwner = address?.toLowerCase() === owner.address.toLowerCase()
  const isFulfilled = progressPercent >= 100
  const canWithdraw = isOwner && isFulfilled

  const truncateAddress = (addr: string) => `${addr.slice(0, 3)}...${addr.slice(-4)}`

  // Helper function to shorten error messages to simple text
  const shortErrorMessage = (message: string): string => {
    // If it's a revert error, just say that
    if (message.includes('reverted')) {
      return 'Transaction reverted'
    }
    // If it mentions gas, say that
    if (message.includes('gas')) {
      return 'Gas limit exceeded'
    }
    // Otherwise take first 2-3 words
    const words = message.split(' ').slice(0, 3).join(' ')
    return words.length > 0 ? words : 'Transaction failed'
  }

  // Helper to get USDC balance
  // const checkBalance = async () => {
  //   if (!address || !publicClient) return
  //   try {
  //     setShowBalanceInfo(true)
  //     const balance = await getUSDCBalance(publicClient, address)
  //     setUsdcBalance(balance)
  //   } catch (err) {
  //     console.error('Failed to check balance:', err)
  //   }
  // }

  // Handle donation
  const handleDonate = async () => {
    if (!address || !publicClient || !walletClient || !donationAmount) {
      setError('Please connect wallet and enter an amount')
      return
    }

    const amount = parseFloat(donationAmount)
    if (amount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    setIsLoading(true)
    setError('')
    
    console.log(
      `💝 Starting donation process...\n` +
      `   Dream: #${id} (${title})\n` +
      `   Amount: ${donationAmount} USDC\n` +
      `   Donor: ${address}`
    )

    try {
      const result = await donateToDream({
        dreamId: parseInt(id),
        amount: donationAmount,
        userAddress: address,
        publicClient,
        walletClient,
      })

      console.log(
        `✅ Donation completed!\n` +
        `   TX: ${result.txHash}\n` +
        `   Amount: ${result.amount} USDC`
      )
      setDonationAmount('')
      setToast({
        message: 'Donation successful! 🎉',
        type: 'success',
        txHash: result.txHash,
      })
      await dreamStore.recordDonation(
        parseInt(id),
        donationAmount,
        address,
        result.txHash,
        currency || 'USDC',
      )

      if (onDonationSuccess) {
        await onDonationSuccess()
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Donation failed'
      
      // Check if this is a user rejection error
      if (
        errorMessage.includes('User rejected') ||
        errorMessage.includes('User denied') ||
        errorMessage.includes('user rejected') ||
        errorMessage.includes('user denied') ||
        errorMessage.includes('Request arguments')
      ) {
        // Don't show error for user cancellation, show info toast instead
        setToast({
          message: 'Transaction cancelled',
          type: 'cancelled',
        })
      } else {
        // Show actual error
        const shortError = shortErrorMessage(errorMessage)
        setError(errorMessage)
        setToast({
          message: shortError,
          type: 'error',
        })
      }
      console.error('Donation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle withdrawal  
  const handleWithdraw = async () => {
    if (!address || !publicClient || !walletClient) return

    setIsLoading(true)
    setError('')

    try {
      console.log(`💸 Starting withdrawal for dream #${id}...`)
      
      // Step 1: Send transaction to blockchain and wait for confirmation
      const txHash = await withdrawDream(walletClient, publicClient, parseInt(id))
      console.log(`✅ Withdrawal transaction confirmed: ${txHash}`)

      // Step 2: Only after successful blockchain transaction, update backend
      await dreamStore.withdrawFunds(id)
      
      setToast({
        message: 'Funds withdrawn successfully! 🎉',
        type: 'success',
        txHash: txHash,
      })
      if (onDonationSuccess) {
        await onDonationSuccess()
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Withdrawal failed'
      
      // Check if this is a user rejection error
      if (
        errorMessage.includes('User rejected') ||
        errorMessage.includes('User denied') ||
        errorMessage.includes('user rejected') ||
        errorMessage.includes('user denied') ||
        errorMessage.includes('Request arguments')
      ) {
        setToast({
          message: 'Withdrawal cancelled',
          type: 'cancelled',
        })
      } else {
        setError(errorMessage)
        setToast({
          message: 'Withdrawal failed',
          type: 'error',
        })
      }
      console.error('Withdrawal error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style>{numberInputStyle}</style>
      <div className="dream-card-glow glass rounded-xl overflow-hidden hover:shadow-neon transition-all">
      {/* Image */}
      {image && (
        <div className="h-40 bg-gradient-to-br from-neon-blue to-neon-purple overflow-hidden relative">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover opacity-80"
          />
        </div>
      )}

      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Owner */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => onOpenProfile && onOpenProfile(owner.address)}
            className="group relative flex-shrink-0 hover:opacity-80 transition-opacity"
            title="View creator profile"
          >
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${owner.address}`}
              alt={owner.address}
              className="w-8 h-8 rounded-full border border-neon-blue group-hover:border-neon-purple transition-colors"
            />
          </button>
          <span className="text-sm text-gray-400 truncate">
            {truncateAddress(owner.address)}
          </span>
          <span className="text-neon-green flex items-center gap-1 whitespace-nowrap ml-auto">
            ⭐ {rating.toFixed(0)}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">{description}</p>

        {/* Progress bar */}
        {goal && (
          <div className="mb-4">
            <div className="mb-2 flex justify-between items-center text-xs">
              <span className="text-gray-500">{progressPercent.toFixed(0)}% raised</span>
              <span className="text-neon-blue font-semibold">
                {raisedAmount} / {goalAmount} {currency || 'USDC'}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden border border-gray-600">
              <div
                className="h-full transition-all duration-500 ease-out block"
                style={{ 
                  width: `${Math.max(progressPercent, 0)}%`,
                  background: `linear-gradient(90deg, #00d9ff 0%, #b537f2 100%)`,
                  display: 'block'
                }}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-700 mb-4">
          <div className="text-center flex-1">
            <div className="text-lg font-bold text-neon-blue">
              {dream.donorsCount}
            </div>
            <div className="text-xs text-gray-500">donors</div>
          </div>
          <div className="text-center flex-1 border-l border-r border-gray-700">
            <div className="text-sm text-gray-400">
              {new Date(dream.createdAt).toLocaleDateString('uk-UA')}
            </div>
          </div>
          <div className="text-center flex-1 border-l border-gray-700">
            <div className="text-sm text-gray-400">
              {isFulfilled ? '✅ Complete' : '⏳ In progress'}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-3 p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 flex-col sm:flex-row">
          {!isOwner && !isFulfilled ? (
            <>
              {/* Donation Input */}
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => {
                    setDonationAmount(e.target.value)
                    setError('')
                  }}
                  placeholder="USDC amount"
                  disabled={isLoading}
                  className="w-full sm:flex-1 px-3 sm:px-4 py-2 bg-gray-900 bg-opacity-40 border border-gray-700 border-opacity-60 rounded-lg text-white placeholder-gray-400 text-sm sm:text-base focus:border-neon-blue focus:border-opacity-100 focus:ring-2 focus:ring-neon-blue focus:ring-opacity-50 focus:outline-none disabled:opacity-40 transition-all backdrop-blur-sm"
                />
                <button
                  onClick={handleDonate}
                  disabled={isLoading || !donationAmount}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-lg font-semibold text-sm sm:text-base hover:shadow-neon hover:brightness-125 transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {isLoading ? '🔄' : '💝'} {isLoading ? 'Sending...' : 'Donate'}
                </button>
              </div>
            </>
          ) : !isOwner && isFulfilled ? (
            <button
              disabled
              className="flex-1 bg-gray-700 text-gray-400 py-2 rounded-lg font-semibold opacity-50 cursor-not-allowed text-center"
            >
              🎉 Goal reached
            </button>
          ) : isOwner ? (
            <>
              {dream.isWithdrawn ? (
                <button
                  disabled
                  className="flex-1 bg-gray-700 text-gray-400 py-2 rounded-lg font-semibold opacity-50 cursor-not-allowed"
                >
                  ✅ Funds received
                </button>
              ) : canWithdraw ? (
                <button
                  onClick={handleWithdraw}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-neon-green to-neon-blue text-white py-2 rounded-lg font-semibold hover:shadow-neon transition-all disabled:opacity-50"
                >
                  {isLoading ? '⏳ Withdrawing...' : '💰 Withdraw'}
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-gray-700 text-gray-400 py-2 rounded-lg font-semibold opacity-50 cursor-not-allowed"
                >
                  🔒 Not ready
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>

    {/* Toast Notification */}
    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        txHash={toast.txHash}
        duration={toast.type === 'success' ? 8000 : 4000}
        onClose={() => setToast(null)}
      />
    )}
    </>
  )
})

export default DreamCard
