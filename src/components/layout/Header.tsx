import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, Phone, Search, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Products', path: '/products' },
  { name: 'Fresh Catch', path: '/products?category=fresh-fish' },
  { name: 'Contact', path: '/contact' },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { state } = useCart();
  const { user, isAdmin } = useAuth();

  const isHome = location.pathname === '/';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isHome ? 'bg-transparent' : 'bg-primary shadow-lg'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-2xl">
              🐟
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-display text-xl font-bold leading-tight">
                Meenava Sonthangal
              </h1>
              <p className="text-white/70 text-xs">Rameswaram Seafoods</p>
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
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="glass" size="icon" className="hidden md:flex">
                  <Shield className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Button variant="glass" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>

            <Link to="/cart">
              <Button variant="glass" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {state.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {state.itemCount}
                  </span>
                )}
              </Button>
            </Link>

            <a href="tel:+919876543210" className="hidden md:block">
              <Button variant="hero" size="sm" className="gap-2">
                <Phone className="h-4 w-4" />
                Order Now
              </Button>
            </a>

            {/* Mobile menu button */}
            <Button
              variant="glass"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden bg-primary/95 backdrop-blur-lg rounded-2xl mb-4 p-4 animate-scale-in">
            <nav className="flex flex-col gap-2">
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
              <a href="tel:+919876543210" className="mt-2">
                <Button variant="cta" className="w-full gap-2">
                  <Phone className="h-4 w-4" />
                  Call to Order
                </Button>
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
