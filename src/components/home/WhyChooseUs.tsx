import { Anchor, Waves, Sun, ThermometerSnowflake } from 'lucide-react';

const features = [
  {
    icon: Anchor,
    title: 'Direct from Fishermen',
    titleTamil: 'மீனவர்களிடம் நேரடியாக',
    description: 'We partner directly with local fishermen in Rameswaram, ensuring you get the freshest catch at the best prices.',
  },
  {
    icon: Waves,
    title: 'Pristine Waters',
    titleTamil: 'தூய்மையான கடல்',
    description: 'Our seafood comes from the clean, mineral-rich waters where the Bay of Bengal meets the Indian Ocean.',
  },
  {
    icon: ThermometerSnowflake,
    title: 'Cold Chain Delivery',
    titleTamil: 'குளிர்ச்சி பாதுகாப்பு',
    description: 'From catch to your kitchen, we maintain optimal temperature to preserve freshness and nutrition.',
  },
  {
    icon: Sun,
    title: 'Traditional Methods',
    titleTamil: 'பாரம்பரிய முறை',
    description: 'Our dry fish is prepared using age-old sun-drying techniques passed down through generations.',
  },
];

export const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-teal-light rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-ocean-light rounded-full blur-3xl opacity-50" />

      <div className="container mx-auto px-4 relative">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="section-title text-foreground mb-4">
            Why Choose AutoKaaran?
          </h2>
          <p className="section-subtitle">
            We're not just selling seafood — we're delivering the authentic taste of 
            Rameswaram's ocean heritage to your table.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl p-6 shadow-ocean hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <feature.icon className="h-7 w-7 text-white" />
              </div>

              {/* Title */}
              <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm tamil-text mb-3">
                {feature.titleTamil}
              </p>

              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
