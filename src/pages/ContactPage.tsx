import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Toast, { type ToastType } from '../components/Toast'

export default function ContactPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: ToastType
  } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Here you would typically send this to your backend
      // For now, we'll just show a success message
      console.log('Contact form submitted:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setToast({
        message: t('contactPage.successMessage'),
        type: 'success'
      })
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
    } catch (error) {
      setToast({
        message: t('contactPage.errorMessage'),
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2 gradient-text">📧 {t('contactPage.title')}</h1>
        <p className="text-gray-400">{t('contactPage.subtitle')}</p>
      </div>

      {/* Contact Info */}
      <div className="glass rounded-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <h3 className="text-neon-blue font-semibold">{t('contactPage.email')}</h3>
            <p className="text-gray-400">
              <a href="mailto:hello@dreamchain.io" className="hover:text-neon-blue transition-all">
                hello@dreamchain.io
              </a>
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-neon-blue font-semibold">{t('contactPage.website')}</h3>
            <p className="text-gray-400">
              <a href="https://dreamchain.io" className="hover:text-neon-blue transition-all">
                dreamchain.io
              </a>
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">{t('contactPage.form.name')}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={t('contactPage.form.namePlaceholder')}
                className="w-full px-4 py-2 bg-dark-800 border border-neon-blue border-opacity-30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue focus:border-opacity-100 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">{t('contactPage.form.email')}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder={t('contactPage.form.emailPlaceholder')}
                className="w-full px-4 py-2 bg-dark-800 border border-neon-blue border-opacity-30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue focus:border-opacity-100 transition-all"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">{t('contactPage.form.subject')}</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder={t('contactPage.form.subjectPlaceholder')}
              className="w-full px-4 py-2 bg-dark-800 border border-neon-blue border-opacity-30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue focus:border-opacity-100 transition-all"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">{t('contactPage.form.message')}</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              placeholder={t('contactPage.form.messagePlaceholder')}
              className="w-full px-4 py-2 bg-dark-800 border border-neon-blue border-opacity-30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue focus:border-opacity-100 transition-all resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold rounded-lg hover:shadow-neon transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('contactPage.form.sending') : t('contactPage.form.submit')}
          </button>
        </form>
      </div>

      {/* FAQ */}
      <div className="glass rounded-xl p-8">
        <h2 className="text-2xl font-bold text-neon-blue mb-6">{t('contactPage.faq')}</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-semibold mb-2">{t('contactPage.faqItems.q1')}</h3>
            <p className="text-gray-400">{t('contactPage.faqItems.a1')}</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">{t('contactPage.faqItems.q2')}</h3>
            <p className="text-gray-400">{t('contactPage.faqItems.a2')}</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">{t('contactPage.faqItems.q3')}</h3>
            <p className="text-gray-400">{t('contactPage.faqItems.a3')}</p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
