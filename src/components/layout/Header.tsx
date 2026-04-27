import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, Phone, User, Shield, LogOut, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { useStoreSettings, cleanPhone } from '@/hooks/useStoreSettings';

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();
  const { state } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const { language, setLanguage, t, languages } = useLanguage();
  const { settings } = useStoreSettings();
  const telHref = `tel:${cleanPhone(settings.store_phone)}`;

  const isHome = location.pathname === '/';

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.products'), path: '/products' },
    { name: t('nav.fresh_catch'), path: '/products?category=fresh-fish' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close language dropdown on outside click
  useEffect(() => {
    if (!langOpen) return;
    const close = () => setLangOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [langOpen]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isHome && !scrolled ? 'bg-transparent' : 'bg-primary shadow-lg'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-xl md:text-2xl shrink-0">
              🐟
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-display text-sm sm:text-lg md:text-xl font-bold leading-tight truncate">
                {settings.store_name}
              </h1>
              <p className="text-white/70 text-[10px] sm:text-xs hidden xs:block">Kanyakumari Seafoods</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'text-white/90 hover:text-white font-medium transition-colors relative py-2',
                  location.pathname === link.path &&
                    "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-secondary after:rounded-full"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Language Toggle */}
            <div className="relative">
              <Button
                variant="glass"
                size="icon"
                className="h-9 w-9 md:h-10 md:w-10"
                onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); }}
              >
                <Globe className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[140px] z-50 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                      className={cn(
                        'w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between',
                        language === lang.code
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground hover:bg-muted'
                      )}
                    >
                      <span>{lang.nativeName}</span>
                      {language === lang.code && <span className="text-primary">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAdmin && (
              <Link to="/admin">
                <Button variant="glass" size="icon" className="hidden md:flex h-9 w-9 md:h-10 md:w-10">
                  <Shield className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Link>
            )}

            {user ? (
              <Link to="/account">
                <Button variant="glass" size="icon" className="h-9 w-9 md:h-10 md:w-10">
                  <User className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <Button variant="glass" size="sm" className="gap-1.5 text-sm">
                  <User className="h-4 w-4" />
                  {t('nav.login')}
                </Button>
              </Link>
            )}

            <Link to="/cart">
              <Button variant="glass" size="icon" className="relative h-9 w-9 md:h-10 md:w-10">
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                {state.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {state.itemCount}
                  </span>
                )}
              </Button>
            </Link>

            <a href={telHref} className="hidden md:block">
              <Button variant="hero" size="sm" className="gap-2">
                <Phone className="h-4 w-4" />
                {t('nav.order_now')}
              </Button>
            </a>

            {/* Mobile menu button */}
            <Button
              variant="glass"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden bg-primary/95 backdrop-blur-lg rounded-2xl mb-4 p-4 animate-scale-in">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'text-white/90 hover:text-white font-medium transition-colors py-3 px-4 rounded-lg hover:bg-white/10',
                    location.pathname === link.path && 'bg-white/10'
                  )}
                >
                  {link.name}
                </Link>
              ))}

              {user ? (
                <>
                  <Link to="/account" onClick={() => setIsOpen(false)}
                    className="text-white/90 hover:text-white font-medium transition-colors py-3 px-4 rounded-lg hover:bg-white/10 flex items-center gap-2">
                    <User className="h-4 w-4" /> {t('account.profile')}
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)}
                      className="text-white/90 hover:text-white font-medium transition-colors py-3 px-4 rounded-lg hover:bg-white/10 flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Link>
                  )}
                  <button onClick={() => { signOut(); setIsOpen(false); }}
                    className="text-white/90 hover:text-white font-medium transition-colors py-3 px-4 rounded-lg hover:bg-white/10 flex items-center gap-2 text-left">
                    <LogOut className="h-4 w-4" /> {t('account.sign_out')}
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}
                  className="text-white/90 hover:text-white font-medium transition-colors py-3 px-4 rounded-lg hover:bg-white/10 flex items-center gap-2">
                  <User className="h-4 w-4" /> {t('nav.login')} / Sign Up
                </Link>
              )}

              <a href={telHref} className="mt-2">
                <Button variant="cta" className="w-full gap-2">
                  <Phone className="h-4 w-4" /> {t('nav.order_now')}
                </Button>
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
