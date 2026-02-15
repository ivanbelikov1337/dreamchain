import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'cancelled'

interface ToastProps {
  message: string
  type: ToastType
  txHash?: string
  duration?: number
  onClose: () => void
}

export default function Toast({ message, type, txHash, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true)
      setTimeout(() => {
        setIsVisible(false)
        onClose()
      }, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const bgColor = {
    success: 'bg-green-500/20 border-green-500',
    error: 'bg-red-500/20 border-red-500',
    cancelled: 'bg-gray-600/20 border-gray-600',
  }[type]

  const textColor = {
    success: 'text-green-400',
    error: 'text-red-400',
    cancelled: 'text-gray-400',
  }[type]

  const icon = {
    success: '✅',
    error: '❌',
    cancelled: '❌',
  }[type]

  const baseScanUrl = txHash
    ? `https://sepolia.basescan.org/tx/${txHash}`
    : null

  return (
    <div 
      className="fixed left-4 right-4 top-4 sm:left-auto sm:top-auto sm:bottom-4 sm:right-4 sm:max-w-md sm:w-96 z-[60] transition-all duration-300"
      style={{
        opacity: isClosing ? 0 : 1,
        transform: isClosing ? 'translateY(100%)' : 'translateY(0)',
      }}
    >
      <div className={`rounded-lg border p-5 min-h-[88px] backdrop-blur-sm ${bgColor}`}>
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">{icon}</span>
          <div className="flex-1">
            <p className={`text-lg font-medium ${textColor}`}>
              {message}
            </p>
            {baseScanUrl && (
              <a
                href={baseScanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-neon-blue hover:text-neon-purple underline mt-1 inline-block transition-colors"
              >
                View on BaseScan →
              </a>
            )}
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              onClose()
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
