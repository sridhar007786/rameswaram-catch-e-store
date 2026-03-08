import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ta' | 'hi';

interface Translations {
  [key: string]: { en: string; ta: string; hi: string };
}

const translations: Translations = {
  // Navigation
  'nav.home': { en: 'Home', ta: 'முகப்பு', hi: 'होम' },
  'nav.products': { en: 'Products', ta: 'பொருட்கள்', hi: 'उत्पाद' },
  'nav.fresh_catch': { en: 'Fresh Catch', ta: 'புதிய மீன்', hi: 'ताज़ी मछली' },
  'nav.contact': { en: 'Contact', ta: 'தொடர்பு', hi: 'संपर्क' },
  'nav.login': { en: 'Login', ta: 'உள்நுழை', hi: 'लॉगिन' },
  'nav.order_now': { en: 'Order Now', ta: 'இப்போது ஆர்டர்', hi: 'अभी ऑर्डर करें' },

  // Hero
  'hero.title': { en: 'Fresh Seafood from Kanyakumari', ta: 'கன்னியாகுமரி புதிய கடல் உணவு', hi: 'कन्याकुमारी से ताज़ा समुद्री भोजन' },
  'hero.subtitle': { en: 'Delivered to your doorstep', ta: 'உங்கள் வீட்டு வாசலில்', hi: 'आपके दरवाजे तक' },

  // Products
  'products.all': { en: 'All Products', ta: 'அனைத்து பொருட்கள்', hi: 'सभी उत्पाद' },
  'products.add_to_cart': { en: 'Add to Cart', ta: 'கூடையில் சேர்', hi: 'कार्ट में जोड़ें' },
  'products.in_stock': { en: 'In Stock', ta: 'கையிருப்பில்', hi: 'स्टॉक में' },
  'products.out_of_stock': { en: 'Out of Stock', ta: 'கையிருப்பில் இல்லை', hi: 'स्टॉक में नहीं' },
  'products.select_weight': { en: 'Select Weight', ta: 'எடையைத் தேர்ந்தெடு', hi: 'वजन चुनें' },
  'products.fresh_today': { en: '🌊 Fresh Today', ta: '🌊 இன்று புதிது', hi: '🌊 आज ताज़ा' },
  'products.reviews': { en: 'reviews', ta: 'மதிப்புரைகள்', hi: 'समीक्षाएं' },

  // Cart
  'cart.title': { en: 'Shopping Cart', ta: 'பொருட்கள் கூடை', hi: 'शॉपिंग कार्ट' },
  'cart.empty': { en: 'Your cart is empty', ta: 'உங்கள் கூடை காலியாக உள்ளது', hi: 'आपकी कार्ट खाली है' },
  'cart.checkout': { en: 'Checkout', ta: 'செக்அவுட்', hi: 'चेकआउट' },
  'cart.total': { en: 'Total', ta: 'மொத்தம்', hi: 'कुल' },

  // Account
  'account.orders': { en: 'Orders', ta: 'ஆர்டர்கள்', hi: 'ऑर्डर' },
  'account.profile': { en: 'Profile', ta: 'சுயவிவரம்', hi: 'प्रोफ़ाइल' },
  'account.addresses': { en: 'Addresses', ta: 'முகவரிகள்', hi: 'पते' },
  'account.sign_out': { en: 'Sign Out', ta: 'வெளியேறு', hi: 'साइन आउट' },

  // Common
  'common.search': { en: 'Search', ta: 'தேடு', hi: 'खोजें' },
  'common.loading': { en: 'Loading...', ta: 'ஏற்றுகிறது...', hi: 'लोड हो रहा है...' },
  'common.save': { en: 'Save', ta: 'சேமி', hi: 'सेव करें' },
  'common.cancel': { en: 'Cancel', ta: 'ரத்து', hi: 'रद्द करें' },
  'common.free_delivery': { en: 'Free Delivery above ₹500', ta: '₹500 மேல் இலவச டெலிவரி', hi: '₹500 से ऊपर मुफ्त डिलीवरी' },
  'common.freshness': { en: 'Freshness Guaranteed', ta: 'புத்துணர்வு உத்தரவாதம்', hi: 'ताज़गी की गारंटी' },
  'common.same_day': { en: 'Same Day Delivery', ta: 'அதே நாள் டெலிவரி', hi: 'उसी दिन डिलीवरी' },

  // Checkout
  'checkout.title': { en: 'Checkout', ta: 'செக்அவுட்', hi: 'चेकआउट' },
  'checkout.place_order': { en: 'Place Order', ta: 'ஆர்டர் செய்', hi: 'ऑर्डर करें' },
  'checkout.delivery_details': { en: 'Delivery Details', ta: 'டெலிவரி விவரங்கள்', hi: 'डिलीवरी विवरण' },
  'checkout.payment_method': { en: 'Payment Method', ta: 'பணம் செலுத்தும் முறை', hi: 'भुगतान विधि' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: { code: Language; name: string; nativeName: string }[];
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const languageOptions: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language.slice(0, 2);
  if (browserLang === 'ta') return 'ta';
  if (browserLang === 'hi') return 'hi';
  return 'en';
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    if (saved === 'ta' || saved === 'hi' || saved === 'en') return saved;
    return detectBrowserLanguage();
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string) => {
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: languageOptions }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
