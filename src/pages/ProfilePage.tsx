import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAccount } from 'wagmi'
import { FaCog } from 'react-icons/fa'
import React from 'react'
import { useStore } from '../stores/StoreContext'
import CreatedTab from '../components/profile/CreatedTab'
import DonatedTab from '../components/profile/DonatedTab'
import CompletedTab from '../components/profile/CompletedTab'
import EditUsernameModal from '../components/EditUsernameModal'
import Toast, { type ToastType } from '../components/Toast'

type ProfileTab = 'created' | 'donated' | 'completed'

interface ProfilePageProps {
  walletAddress: string
  onOpenProfile?: (walletAddress: string) => void
}

function ProfilePageComponent({ walletAddress, onOpenProfile }: ProfilePageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { address } = useAccount()
  const { profileStore } = useStore()
  const [activeTab, setActiveTab] = React.useState<ProfileTab>('created')
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [toast, setToast] = React.useState<{
    message: string
    type: ToastType
  } | null>(null)

  // Load user profile on mount and when walletAddress changes
  useEffect(() => {
    // Clear old data immediately when switching users
    profileStore.clearProfileData()
    profileStore.loadUserProfile(walletAddress)
    // Reset tab to 'created' when user changes
    setActiveTab('created')
  }, [walletAddress, profileStore])

  // Load tab data when active tab changes
  useEffect(() => {
    if (profileStore.currentUser) {
      profileStore.loadTabDreams(walletAddress, activeTab)
    }
  }, [activeTab, walletAddress, profileStore])

  const isOwnProfile = address?.toLowerCase() === walletAddress.toLowerCase()

  if (profileStore.initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-400">{t('common.loading')}</div>
      </div>
    )
  }

  if (profileStore.userError || !profileStore.currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-6 px-4">
          {/* 404 Number */}
          <div className="text-8xl font-bold gradient-text">404</div>
          
          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">User Not Found</h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              {profileStore.userError ? profileStore.userError : 'The user profile you are looking for does not exist.'}
            </p>
          </div>

          {/* Home Button */}
          <button
            onClick={() => navigate('/')}
            className="inline-block px-8 py-3 bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue hover:to-neon-blue text-white font-medium rounded-lg transition-all shadow-lg shadow-neon-blue/50"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  const user = profileStore.currentUser
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.walletAddress}`

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: 'created', label: 'Created' },
    { id: 'donated', label: t('profile.tabDonated') },
    { id: 'completed', label: t('profile.tabCompleted') },
  ]

  return (
    <>
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-dark-800 to-dark-700 rounded-2xl p-8 border border-neon-blue border-opacity-30 relative">
          {/* Edit username button for own profile */}
          {isOwnProfile && (
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute top-4 right-4 p-2 text-neon-blue hover:text-neon-purple hover:bg-dark-800 rounded-lg transition-all"
              title="Edit username"
            >
              <FaCog size={20} />
            </button>
          )}

          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Avatar */}
            <img
              src={avatarUrl}
              alt={user.username || 'Anonymous'}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-neon-blue shadow-lg shadow-neon-blue/50"
            />

            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold gradient-text">
                  {user.username || 'Anonymous'}
                </h1>
                <p className="text-gray-400 text-sm mt-2 font-mono break-all">
                  {user.walletAddress}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4">
                <div className="bg-dark-900 bg-opacity-50 rounded-lg p-4 border border-neon-yellow border-opacity-20">
                  <div className="text-gray-400 text-xs md:text-sm">{t('profile.created')}</div>
                  <div className="text-xl md:text-2xl font-bold text-neon-yellow">
                    {profileStore.createdDreams.length}
                  </div>
                </div>

                <div className="bg-dark-900 bg-opacity-50 rounded-lg p-4 border border-neon-blue border-opacity-20">
                  <div className="text-gray-400 text-xs md:text-sm">{t('profile.rating')}</div>
                  <div className="text-xl md:text-2xl font-bold text-neon-blue">
                    {user.rating || 0}
                  </div>
                </div>

                <div className="bg-dark-900 bg-opacity-50 rounded-lg p-4 border border-neon-pink border-opacity-20">
                  <div className="text-gray-400 text-xs md:text-sm">{t('profile.donated')}</div>
                  <div className="text-xl md:text-2xl font-bold text-neon-pink">
                    ${(user.totalDonated || 0).toFixed(2)}
                  </div>
                </div>

                <div className="bg-dark-900 bg-opacity-50 rounded-lg p-4 border border-neon-green border-opacity-20">
                  <div className="text-gray-400 text-xs md:text-sm">{t('profile.received')}</div>
                  <div className="text-xl md:text-2xl font-bold text-neon-green">
                    ${(user.totalReceived || 0).toFixed(2)}
                  </div>
                </div>

                {isOwnProfile && (
                  <div className="bg-dark-900 bg-opacity-50 rounded-lg p-4 border border-neon-purple border-opacity-20">
                    <div className="text-gray-400 text-xs md:text-sm">{t('profile.chances')}</div>
                    <div className="text-xl md:text-2xl font-bold text-neon-purple">
                      {user.chances || 0}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="space-y-4">
          {/* Tab Buttons */}
          <div className="flex gap-2 border-b border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-neon-blue text-neon-blue'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'created' && <CreatedTab walletAddress={walletAddress} onOpenProfile={onOpenProfile} />}
          {activeTab === 'donated' && <DonatedTab walletAddress={walletAddress} onOpenProfile={onOpenProfile} />}
          {activeTab === 'completed' && <CompletedTab walletAddress={walletAddress} onOpenProfile={onOpenProfile} />}
        </div>
      </div>

    {/* Edit username modal */}
    {showEditModal && (
      <EditUsernameModal
        walletAddress={walletAddress}
        currentUsername={user.username || null}
        onClose={() => setShowEditModal(false)}
        onSuccess={(message) => {
          profileStore.loadUserProfile(walletAddress)
          setToast({
            message,
            type: 'success',
          })
        }}
      />
    )}

    {/* Success toast */}
    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
      />
    )}
  </>
  )
}

const ProfilePage = observer(ProfilePageComponent)
export default ProfilePage
