import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import heroImage from '@/assets/hero-seafood.jpg';

export const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
      <div className="absolute inset-0 hero-gradient" />

      <div className="relative container mx-auto px-4 pt-20 pb-16 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 animate-fade-up">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-sm font-medium">{t('hero.badge')}</span>
          </div>

          <h1 className="hero-title animate-fade-up" style={{ animationDelay: '0.1s' }}>
            {t('hero.title')}
            <span className="block text-secondary">{t('hero.title_highlight')}</span>
          </h1>

          <p className="hero-subtitle animate-fade-up max-w-2xl mx-auto" style={{ animationDelay: '0.2s' }}>
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/products">
              <Button variant="hero" size="xl" className="group w-full sm:w-auto">
                {t('hero.shop_fresh')}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
              <Button variant="whatsapp" size="xl" className="w-full sm:w-auto">
                {t('hero.order_whatsapp')}
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {[
              { icon: Truck, title: t('hero.free_delivery'), subtitle: t('hero.free_delivery_sub') },
              { icon: Shield, title: t('hero.freshness'), subtitle: t('hero.freshness_sub') },
              { icon: Clock, title: t('hero.same_day'), subtitle: t('hero.same_day_sub') },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-secondary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-white/70 text-xs">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-2.5 bg-white/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};
