import { Link } from 'react-router-dom';
import { categories } from '@/data/products';

export const CategoriesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="section-title text-foreground mb-4">
            Explore Our Collection
          </h2>
          <p className="section-subtitle">
            From fresh catches to traditional dried fish, discover the finest seafood 
            from the shores of Kanyakumari.
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-ocean-medium p-8 text-white transition-transform duration-300 hover:scale-[1.02] hover:shadow-elevated animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background pattern */}
              <div className="absolute top-0 right-0 text-[150px] opacity-10 -mr-8 -mt-8 transform group-hover:scale-110 transition-transform duration-500">
                {category.icon}
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="text-5xl mb-4">{category.icon}</div>
                <h3 className="font-display text-2xl font-bold mb-2">
                  {category.name}
                </h3>
                <p className="text-white/70 text-sm tamil-text mb-1">
                  {category.nameTamil}
                </p>
                <p className="text-white/80 text-sm mb-4">
                  {category.description}
                </p>
                <span className="inline-flex items-center gap-2 text-secondary font-semibold group-hover:gap-3 transition-all">
                  Shop Now
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
