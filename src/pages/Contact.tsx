import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const ContactPage = () => {
  return (
    <Layout>
      <div className="pt-24 pb-20 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          {/* Page header */}
          <div className="text-center mb-12">
            <h1 className="section-title text-foreground mb-4">Contact Us</h1>
            <p className="section-subtitle">
              Have questions or need help with your order? We're here for you!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact info */}
            <div className="space-y-8">
              <div className="bg-card rounded-2xl p-8 shadow-ocean">
                <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                  Get in Touch
                </h2>

                <div className="space-y-6">
                  {/* Phone */}
                  <a
                    href="tel:+919876543210"
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <Phone className="h-5 w-5 text-primary group-hover:text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Phone</p>
                      <p className="text-muted-foreground">+91 98765 43210</p>
                      <p className="text-muted-foreground">+91 98765 43211</p>
                    </div>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366] transition-colors">
                      <MessageCircle className="h-5 w-5 text-[#25D366] group-hover:text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">WhatsApp</p>
                      <p className="text-muted-foreground">Chat with us directly</p>
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:order@autokaaranseafoods.com"
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <Mail className="h-5 w-5 text-primary group-hover:text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Email</p>
                      <p className="text-muted-foreground">order@autokaaranseafoods.com</p>
                    </div>
                  </a>

                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Address</p>
                      <p className="text-muted-foreground">
                        Fishing Harbour Road,<br />
                        Rameswaram, Tamil Nadu 623526
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Business Hours</p>
                      <p className="text-muted-foreground">
                        Mon - Sat: 6:00 AM - 8:00 PM<br />
                        Sunday: 6:00 AM - 2:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick order */}
              <div className="bg-ocean-gradient rounded-2xl p-8 text-white">
                <h3 className="font-display text-xl font-semibold mb-4">
                  Quick Order via WhatsApp
                </h3>
                <p className="text-white/80 mb-6">
                  The fastest way to order! Just send us a message with what you need.
                </p>
                <a
                  href="https://wa.me/919876543210?text=Hi!%20I%20would%20like%20to%20order%20fresh%20seafood."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="hero" className="w-full">
                    <MessageCircle className="h-5 w-5" />
                    Start WhatsApp Chat
                  </Button>
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="bg-card rounded-2xl overflow-hidden shadow-ocean h-[500px] lg:h-auto">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31461.48844279167!2d79.2856!3d9.2876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b01ebbab7d3e7c9%3A0xd0e8b8c2d8f0f0c0!2sRameswaram%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="AutoKaaran Seafoods Location"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
