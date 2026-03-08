import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-white">
      <div className="wave-divider bg-background" />
      
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">🐟</div>
              <div>
                <h3 className="font-display text-xl font-bold">Meenava Sonthangal</h3>
                <p className="text-white/70 text-sm">Kanyakumari Seafoods</p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{t('footer.description')}</p>
            <div className="flex gap-3">
              <a href="https://instagram.com/autokaaran_seafoods" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">{t('footer.quick_links')}</h4>
            <ul className="space-y-3">
              {[
                { name: t('footer.fresh_fish'), path: '/products?category=fresh-fish' },
                { name: 'Premium Fish', path: '/products?category=premium-fish' },
                { name: 'Ready to Cook', path: '/products?category=ready-to-cook' },
                { name: t('footer.dry_fish'), path: '/products?category=dry-fish' },
                { name: 'Special Offers', path: '/products?category=special-offers' },
                { name: 'Fish Pickles', path: '/products?category=pickles' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-white/70 hover:text-white transition-colors text-sm">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">{t('footer.customer_service')}</h4>
            <ul className="space-y-3">
              {[
                { name: t('footer.about'), path: '/about' },
                { name: t('footer.contact'), path: '/contact' },
                { name: t('footer.faq'), path: '/faq' },
                { name: t('footer.shipping'), path: '/shipping' },
                { name: t('footer.refund'), path: '/refund' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-white/70 hover:text-white transition-colors text-sm">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">{t('footer.contact_us')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <span className="text-white/70 text-sm">Beach Road, Kanyakumari, Tamil Nadu 629702</span>
              </li>
              <li>
                <a href="tel:+919876543210" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                  <Phone className="h-5 w-5 text-secondary" />
                  <span className="text-sm">+91 98765 43210</span>
                </a>
              </li>
              <li>
                <a href="mailto:order@meenavasonthangal.com" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                  <Mail className="h-5 w-5 text-secondary" />
                  <span className="text-sm">order@meenavasonthangal.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">{t('footer.rights')}</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-white/50 hover:text-white text-sm transition-colors">{t('footer.privacy')}</Link>
            <Link to="/terms" className="text-white/50 hover:text-white text-sm transition-colors">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
