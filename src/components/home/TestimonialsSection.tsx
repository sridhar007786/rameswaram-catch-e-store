import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sundaram',
    location: 'Chennai',
    rating: 5,
    text: 'The freshness is unmatched! The King Fish I ordered arrived perfectly packed and tasted like it was just caught. Will definitely order again.',
    avatar: '👩',
  },
  {
    name: 'Rajesh Kumar',
    location: 'Madurai',
    rating: 5,
    text: 'Best dry fish I\'ve ever had! The traditional sun-drying method really makes a difference. Authentic Kanyakumari taste.',
    avatar: '👨',
  },
  {
    name: 'Lakshmi Venkat',
    location: 'Coimbatore',
    rating: 5,
    text: 'Quick delivery and excellent quality. The prawns were huge and so fresh. My family loved the seafood curry I made!',
    avatar: '👩',
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-ocean-gradient text-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">
            What Our Customers Say
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Don't just take our word for it — hear from our happy customers 
            across Tamil Nadu.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote icon */}
              <Quote className="h-8 w-8 text-secondary mb-4 opacity-50" />

              {/* Text */}
              <p className="text-white/90 leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-white/60 text-sm">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
