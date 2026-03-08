import { Anchor, Waves, Sun, ThermometerSnowflake } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const WhyChooseUs = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Anchor, titleKey: 'why.direct_fishermen', descKey: 'why.direct_fishermen_desc' },
    { icon: Waves, titleKey: 'why.pristine_waters', descKey: 'why.pristine_waters_desc' },
    { icon: ThermometerSnowflake, titleKey: 'why.cold_chain', descKey: 'why.cold_chain_desc' },
    { icon: Sun, titleKey: 'why.traditional', descKey: 'why.traditional_desc' },
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-teal-light rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-ocean-light rounded-full blur-3xl opacity-50" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="section-title text-foreground mb-4">{t('why.title')}</h2>
          <p className="section-subtitle">{t('why.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl p-6 shadow-ocean hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {t(feature.titleKey)}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(feature.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
