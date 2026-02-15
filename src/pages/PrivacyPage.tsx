import { useTranslation } from 'react-i18next'

export default function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold mb-2 gradient-text">🔒 {t('privacyPage.title')}</h1>
        <p className="text-gray-400">{t('privacyPage.subtitle')}</p>
      </div>

      <div className="glass rounded-xl p-8 space-y-6">
        {[1, 2, 3, 4, 5, 6].map((sectionNum) => {
          const sectionKey = `privacyPage.section${sectionNum}` as const
          const heading = t(`${sectionKey}.heading`)
          const content = t(`${sectionKey}.content`)
          const items = sectionNum === 2 ? t(`${sectionKey}.items`, { returnObjects: true }) as string[] : null
          const intro = sectionNum === 2 ? t(`${sectionKey}.intro`) : null

          return (
            <section key={sectionNum}>
              <h2 className="text-2xl font-bold text-neon-blue mb-4">{heading}</h2>
              {intro && <p className="text-gray-300 leading-relaxed">{intro}</p>}
              {items ? (
                <ul className="list-disc list-inside text-gray-300 space-y-2 mt-3">
                  {items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-300 leading-relaxed">{content}</p>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
