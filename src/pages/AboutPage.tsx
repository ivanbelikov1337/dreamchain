import { useTranslation } from 'react-i18next'

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold mb-2 gradient-text">✨ {t('aboutPage.title')}</h1>
        <p className="text-gray-400">{t('aboutPage.subtitle')}</p>
      </div>

      <div className="glass rounded-xl p-8 space-y-6">
        {/* Mission */}
        <section>
          <h2 className="text-2xl font-bold text-neon-blue mb-4">{t('aboutPage.section1.heading')}</h2>
          <p className="text-gray-300 leading-relaxed">{t('aboutPage.section1.content')}</p>
        </section>

        {/* Vision */}
        <section>
          <h2 className="text-2xl font-bold text-neon-blue mb-4">{t('aboutPage.section2.heading')}</h2>
          <p className="text-gray-300 leading-relaxed">{t('aboutPage.section2.content')}</p>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-2xl font-bold text-neon-blue mb-4">{t('aboutPage.section3.heading')}</h2>
          <p className="text-gray-300 leading-relaxed mb-4">{t('aboutPage.section3.intro')}</p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            {(t('aboutPage.section3.items', { returnObjects: true }) as string[]).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-2xl font-bold text-neon-blue mb-4">{t('aboutPage.section4.heading')}</h2>
          <p className="text-gray-300 leading-relaxed mb-4">{t('aboutPage.section4.intro')}</p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            {(t('aboutPage.section4.items', { returnObjects: true }) as string[]).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Community */}
        <section>
          <h2 className="text-2xl font-bold text-neon-blue mb-4">{t('aboutPage.section5.heading')}</h2>
          <p className="text-gray-300 leading-relaxed">{t('aboutPage.section5.content')}</p>
        </section>
      </div>

      <div className="bg-neon-purple bg-opacity-10 border border-neon-purple border-opacity-30 rounded-xl p-6">
        <p className="text-purple-300 text-sm leading-relaxed">
          {t('aboutPage.section6.content')}
        </p>
      </div>
    </div>
  )
}
