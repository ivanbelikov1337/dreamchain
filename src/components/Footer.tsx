import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FaFacebook, FaXTwitter, FaInstagram, FaYoutube } from 'react-icons/fa6'

interface FooterProps {
  setCurrentPage?: () => void
}

export default function Footer({ }: FooterProps) {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()
  const navigate = useNavigate()

  return (
    <footer className="border-t border-neon-blue border-opacity-20 bg-dark-tertiary mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="text-center">
            <h3 className="text-2xl font-bold gradient-text mb-2">✨ DreamChain</h3>
            <p className="text-gray-400 text-sm">{t('footer.description')}</p>
          </div>

          {/* Navigation */}
          <div className="text-center">
            <h4 className="text-white font-semibold mb-4">{t('footer.navigation')}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><button onClick={() => navigate('/')} className="hover:text-neon-blue transition-all">{t('footer.links.home')}</button></li>
              <li><button onClick={() => navigate('/top')} className="hover:text-neon-blue transition-all">{t('footer.links.topDreams')}</button></li>
              <li><button onClick={() => navigate('/my')} className="hover:text-neon-blue transition-all">{t('footer.links.myDreams')}</button></li>
              <li><button onClick={() => navigate('/rating')} className="hover:text-neon-blue transition-all">{t('footer.links.rating')}</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="text-center">
            <h4 className="text-white font-semibold mb-4">{t('footer.information')}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><button onClick={() => navigate('/about')} className="hover:text-neon-blue transition-all">{t('footer.links.about')}</button></li>
              <li><button onClick={() => navigate('/terms')} className="hover:text-neon-blue transition-all">{t('footer.links.terms')}</button></li>
              <li><button onClick={() => navigate('/privacy')} className="hover:text-neon-blue transition-all">{t('footer.links.privacy')}</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-neon-blue transition-all">{t('footer.links.contact')}</button></li>
            </ul>
          </div>

          {/* Social */}
          <div className="text-center">
            <h4 className="text-white font-semibold mb-4">{t('footer.followUs')}</h4>
            <div className="flex gap-4 justify-center">
              <a href="#" className="text-neon-blue hover:text-neon-purple transition-all text-xl">
                <FaFacebook />
              </a>
              <a href="#" className="text-neon-blue hover:text-neon-purple transition-all text-xl">
                <FaXTwitter />
              </a>
              <a href="#" className="text-neon-blue hover:text-neon-purple transition-all text-xl">
                <FaInstagram />
              </a>
              <a href="#" className="text-neon-blue hover:text-neon-purple transition-all text-xl">
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>&copy; {currentYear} {t('footer.copyright')}</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <button onClick={() => navigate('/terms')} className="hover:text-neon-blue transition-all">{t('footer.bottomLinks.terms')}</button>
              <button onClick={() => navigate('/privacy')} className="hover:text-neon-blue transition-all">{t('footer.bottomLinks.privacy')}</button>
              <a href="#" className="hover:text-neon-blue transition-all">{t('footer.bottomLinks.cookies')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
