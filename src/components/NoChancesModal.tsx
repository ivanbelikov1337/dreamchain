import { useTranslation } from 'react-i18next'

interface NoChancesModalProps {
  isOpen: boolean
  onClose: () => void
  chances: number
}

export default function NoChancesModal({ isOpen, onClose, chances }: NoChancesModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="glass rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4 gradient-text">{t('noChancesModal.title')}</h2>

        <div className="space-y-4">
          <p className="text-gray-300 text-sm">
            {t('noChancesModal.description')} <span className="font-bold text-neon-blue">{t('noChancesModal.descriptionAmount')}</span> {t('noChancesModal.descriptionSuffix')}
          </p>

          <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              <span className="font-bold">{t('noChancesModal.howItWorks')}</span>
              <br />
              • {t('noChancesModal.tier1')}
              <br />
              • {t('noChancesModal.tier2')}
              <br />
              • {t('noChancesModal.tier3')}
              <br />
              • {t('noChancesModal.tierMore')}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-gray-400 text-xs">
              {t('noChancesModal.yourChances')} <span className="text-white font-bold">{chances}</span>
            </p>
          </div>

          <p className="text-gray-400 text-xs">
            {t('noChancesModal.callToAction')}
          </p>
        </div>

        <div className="flex gap-3 pt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-neon-blue text-black font-bold hover:bg-opacity-80 transition-all"
          >
            {t('noChancesModal.gotIt')}
          </button>
        </div>
      </div>
    </div>
  )
}
