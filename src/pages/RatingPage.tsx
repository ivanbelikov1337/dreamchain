import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/StoreContext'
import type { UserRating } from '../stores/UserStore'

const getLevelIcon = (level: string) => {
  switch (level) {
    case 'Dreamer':
      return '💭'
    case 'Supporter':
      return '🤝'
    case 'Angel':
      return '😇'
    case 'Visionary':
      return '👑'
    default:
      return '⭐'
  }
}

const RatingPage = observer(function RatingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { userStore } = useStore()

  useEffect(() => {
    userStore.loadUsers()
  }, [userStore])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 gradient-text">{t('ratingPage.title')}</h1>
        <p className="text-gray-400">{t('ratingPage.subtitle')}</p>
      </div>

      {/* Level explanation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-lg p-4">
          <div className="text-2xl mb-2">💭 {t('ratingPage.dreamer')}</div>
          <p className="text-xs text-gray-400">{t('ratingPage.dreamerDesc')}</p>
        </div>
        <div className="glass rounded-lg p-4">
          <div className="text-2xl mb-2">🤝 {t('ratingPage.donor')}</div>
          <p className="text-xs text-gray-400">{t('ratingPage.donorDesc')}</p>
        </div>
        <div className="glass rounded-lg p-4">
          <div className="text-2xl mb-2">😇 {t('ratingPage.angel')}</div>
          <p className="text-xs text-gray-400">{t('ratingPage.angelDesc')}</p>
        </div>
        <div className="glass rounded-lg p-4">
          <div className="text-2xl mb-2">👑 {t('ratingPage.visionary')}</div>
          <p className="text-xs text-gray-400">{t('ratingPage.visionaryDesc')}</p>
        </div>
      </div>

      {/* Rankings table */}
      <div className="glass rounded-xl overflow-hidden">
        {userStore.usersLoading ? (
          <div className="p-8 text-center text-gray-400">Loading users...</div>
        ) : userStore.usersError ? (
          <div className="p-8 text-center text-red-400">{userStore.usersError}</div>
        ) : userStore.userRatings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">{t('ratingPage.table.rank')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">{t('ratingPage.table.user')}</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">{t('ratingPage.table.level')}</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">{t('ratingPage.table.rating')}</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">{t('ratingPage.table.sent')}</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">{t('ratingPage.table.received')}</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">{t('ratingPage.table.dreams')}</th>
                </tr>
              </thead>
              <tbody>
                {userStore.userRatings.map((user: UserRating, index) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-gray-700 hover:bg-dark-800 transition-all cursor-pointer"
                    onClick={() => navigate(`/profile/${user.walletAddress}`)}
                  >
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-neon-purple">#{index + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.walletAddress}`}
                          alt={user.username || 'Anonymous'}
                          className="w-9 h-9 rounded-full border border-neon-blue hover:border-neon-purple transition-colors"
                        />
                        <div>
                          <p className="font-semibold text-white">{user.username || 'Anonymous'}</p>
                          <p className="text-xs text-gray-500">{user.walletAddress}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xl">{getLevelIcon(user.level)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-neon-blue">{user.totalDonated}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-green-400">{user.totalDonated} USDC</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-blue-600">{user.totalReceived} USDC</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-purple-400">{user.dreamsCreated}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">No users available</div>
        )}
      </div>
    </div>
  )
})

export default RatingPage
