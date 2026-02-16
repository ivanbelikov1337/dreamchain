import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { useAccount } from 'wagmi'
import DreamCard from '../components/DreamCard'
import { useStore } from '../stores/StoreContext'

const MyDreamsPage = observer(function MyDreamsPage() {
  const navigate = useNavigate()
  const { address } = useAccount()
  const { dreamStore, userStore, donationStore } = useStore()

  useEffect(() => {
    const fetchData = async () => {
      if (!address) {
        return
      }

      try {
        await userStore.getOrCreateUserByWallet(address)
        await dreamStore.loadUserDreams(address)
        await donationStore.loadByWallet(address)
      } catch (err) {
        console.error('Error fetching data:', err)
      }
    }

    fetchData()
  }, [address, dreamStore, userStore, donationStore])

  if (!address) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 gradient-text">👤 My Dreams</h1>
          <p className="text-gray-400">Your dreams and their progress</p>
        </div>
        <div className="glass rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">🤖</div>
          <h3 className="text-xl font-bold text-gray-300 mb-2">Please Connect Your Wallet</h3>
          <p className="text-gray-500">
            You need to connect your wallet to see your dreams and donations.
          </p>
        </div>
      </div>
    )
  }

  if (userStore.currentUserLoading || dreamStore.isLoading || donationStore.donationsLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 gradient-text">👤 My Dreams</h1>
          <p className="text-gray-400">Your dreams and their progress</p>
        </div>
        <div className="text-center py-12 text-gray-400">Loading your data...</div>
      </div>
    )
  }

  if (userStore.currentUserError || dreamStore.error || donationStore.donationsError) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 gradient-text">👤 My Dreams</h1>
          <p className="text-gray-400">Your dreams and their progress</p>
        </div>
        <div className="text-center py-12 text-red-400">
          {userStore.currentUserError || dreamStore.error || donationStore.donationsError}
        </div>
      </div>
    )
  }

  const totalRaised = dreamStore.dreams.reduce((sum, d) => sum + d.raised, 0)
  const totalDonorsCount = dreamStore.dreams.reduce((sum, d) => sum + d.donorsCount, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 gradient-text">👤 My Dreams</h1>
        <p className="text-gray-400">Your dreams and their progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-neon-blue">{dreamStore.dreams.length}</div>
          <div className="text-sm text-gray-400">Dreams</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-neon-green">{totalRaised} USDC</div>
          <div className="text-sm text-gray-400">Raised</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-neon-purple">{totalDonorsCount}</div>
          <div className="text-sm text-gray-400">Donors</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-neon-blue">⭐ {userStore.currentUser?.rating || 0}</div>
          <div className="text-sm text-gray-400">Rating</div>
        </div>
      </div>

      {/* User's dreams */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Your Active Dreams</h2>
        <div className="space-y-6">
          {dreamStore.dreams.length > 0 ? (
            dreamStore.dreams.map((dream) => (
              <div key={dream.id}>
                <DreamCard 
                  dream={dream} 
                  onOpenProfile={(walletAddress) => navigate(`/profile/${walletAddress}`)}
                />
              </div>
            ))
          ) : (
            <div className="glass rounded-xl p-12 text-center">
              <div className="text-5xl mb-4">😴</div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No dreams yet</h3>
              <p className="text-gray-500 mb-6">
                To create a dream, first help others! 💝
              </p>
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold rounded-lg hover:shadow-neon"
              >
                Support a dream ✨
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User's donations */}
      {donationStore.donationsByWallet.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Donations</h2>
          <div className="space-y-3">
            {donationStore.donationsByWallet.map((donation) => (
              <div key={donation.id} className="glass rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-white">{donation.dream?.title || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{donation.txHash}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-neon-blue">{donation.amount} USDC</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

export default MyDreamsPage
