import { Button } from '@/components/ui/button';
import { ArrowRight, Phone } from 'lucide-react';

export const CTASection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative bg-coral-gradient rounded-3xl overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

          <div className="relative px-8 py-16 md:py-20 text-center text-white">
            {/* Content */}
            <h2 className="section-title mb-4">
              Ready to Taste the Ocean?
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
              Order now and experience the freshest seafood from Kanyakumari. 
              Free delivery on orders above ₹500!
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" className="group">
                Shop Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <a href="tel:+919876543210">
                <Button variant="glass" size="xl" className="w-full sm:w-auto">
                  <Phone className="h-5 w-5" />
                  Call to Order
                </Button>
              </a>
            </div>

            {/* Trust note */}
            <p className="text-white/60 text-sm mt-8">
              🛡️ 100% Freshness Guarantee • 🚚 Same Day Delivery • 💳 Secure Payment
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
