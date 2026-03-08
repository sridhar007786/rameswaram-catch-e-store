import { createContext, useContext, useState, ReactNode } from 'react';

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
  'nav.admin_panel': { en: 'Admin Panel', ta: 'நிர்வாக பேனல்', hi: 'एडमिन पैनल' },
  'nav.sign_up': { en: 'Sign Up', ta: 'பதிவு செய்', hi: 'साइन अप' },

  // Hero Section
  'hero.badge': { en: 'Direct from Kanyakumari Fishermen', ta: 'கன்னியாகுமரி மீனவர்களிடம் நேரடியாக', hi: 'कन्याकुमारी मछुआरों से सीधे' },
  'hero.title': { en: 'Fresh Seafood', ta: 'புதிய கடல் உணவு', hi: 'ताज़ा समुद्री भोजन' },
  'hero.title_highlight': { en: 'Delivered to Your Door', ta: 'உங்கள் வீட்டு வாசலில்', hi: 'आपके दरवाजे तक' },
  'hero.subtitle': { en: 'Experience the taste of the ocean with our premium seafood, caught fresh daily and delivered to your doorstep with guaranteed freshness. From the shores of Kanyakumari!', ta: 'கன்னியாகுமரி கடற்கரையிலிருந்து தினமும் புதிதாக பிடிக்கப்பட்ட உயர்தர கடல் உணவு, புத்துணர்வு உத்தரவாதத்துடன் உங்கள் வீட்டு வாசலில் டெலிவரி!', hi: 'कन्याकुमारी के तटों से रोज़ाना ताज़ी पकड़ी गई प्रीमियम सीफ़ूड, ताज़गी की गारंटी के साथ आपके दरवाजे तक!' },
  'hero.shop_fresh': { en: 'Shop Fresh Catch', ta: 'புதிய மீன் வாங்கு', hi: 'ताज़ी मछली खरीदें' },
  'hero.order_whatsapp': { en: 'Order via WhatsApp', ta: 'WhatsApp வழியாக ஆர்டர்', hi: 'WhatsApp से ऑर्डर करें' },
  'hero.free_delivery': { en: 'Free Delivery', ta: 'இலவச டெலிவரி', hi: 'मुफ्त डिलीवरी' },
  'hero.free_delivery_sub': { en: 'On orders above ₹500', ta: '₹500 மேல் ஆர்டருக்கு', hi: '₹500 से ऊपर के ऑर्डर पर' },
  'hero.freshness': { en: 'Freshness Guaranteed', ta: 'புத்துணர்வு உத்தரவாதம்', hi: 'ताज़गी की गारंटी' },
  'hero.freshness_sub': { en: 'Or your money back', ta: 'அல்லது பணம் திரும்ப', hi: 'या पैसे वापस' },
  'hero.same_day': { en: 'Same Day Delivery', ta: 'அதே நாள் டெலிவரி', hi: 'उसी दिन डिलीवरी' },
  'hero.same_day_sub': { en: 'Order before 10 AM', ta: 'காலை 10 மணிக்கு முன் ஆர்டர்', hi: 'सुबह 10 बजे से पहले ऑर्डर करें' },

  // Categories Section
  'categories.title': { en: 'Explore Our Collection', ta: 'எங்கள் தொகுப்பை ஆராயுங்கள்', hi: 'हमारा संग्रह देखें' },
  'categories.subtitle': { en: 'From fresh catches to traditional dried fish, discover the finest seafood from the shores of Kanyakumari.', ta: 'புதிய மீன் முதல் பாரம்பரிய கருவாடு வரை, கன்னியாகுமரி கடற்கரையின் சிறந்த கடல் உணவுகளை கண்டறியுங்கள்.', hi: 'ताज़ी मछली से लेकर पारंपरिक सूखी मछली तक, कन्याकुमारी के तटों से बेहतरीन समुद्री भोजन खोजें।' },
  'categories.shop_now': { en: 'Shop Now', ta: 'இப்போது வாங்கு', hi: 'अभी खरीदें' },

  // Category names & descriptions
  'category.fresh_fish': { en: 'Fresh Fish', ta: 'புதிய மீன்', hi: 'ताज़ी मछली' },
  'category.fresh_fish_desc': { en: 'Caught fresh daily from Kanyakumari waters', ta: 'கன்னியாகுமரி கடலில் தினமும் புதிதாக பிடிக்கப்படுகிறது', hi: 'कन्याकुमारी के पानी से रोज़ाना ताज़ा पकड़ी जाती है' },
  'category.dry_fish': { en: 'Dry Fish', ta: 'காய்ந்த மீன்', hi: 'सूखी मछली' },
  'category.dry_fish_desc': { en: 'Traditional sun-dried seafood', ta: 'பாரம்பரிய வெயிலில் உலர்த்தப்பட்ட கடல் உணவு', hi: 'पारंपरिक धूप में सुखाया हुआ समुद्री भोजन' },
  'category.seafood_specials': { en: 'Seafood Specials', ta: 'கடல் உணவு சிறப்பு', hi: 'सीफ़ूड स्पेशल' },
  'category.seafood_specials_desc': { en: 'Premium prawns, crabs & more', ta: 'உயர்தர இறால், நண்டு மற்றும் பல', hi: 'प्रीमियम झींगा, केकड़ा और बहुत कुछ' },
  'category.pickles': { en: 'Pickles', ta: 'ஊறுகாய்', hi: 'अचार' },
  'category.pickles_desc': { en: 'Homemade seafood pickles from Kanyakumari', ta: 'கன்னியாகுமரி வீட்டு கடல் உணவு ஊறுகாய்', hi: 'कन्याकुमारी से घर का बना समुद्री अचार' },

  // Featured Products
  'featured.title': { en: "Today's Fresh Catch", ta: 'இன்றைய புதிய மீன்', hi: 'आज की ताज़ी पकड़' },
  'featured.subtitle': { en: 'Our most popular picks, handpicked for freshness and quality.', ta: 'புத்துணர்வு மற்றும் தரத்திற்காக தேர்ந்தெடுக்கப்பட்ட எங்கள் மிகவும் பிரபலமான தேர்வுகள்.', hi: 'ताज़गी और गुणवत्ता के लिए हमारे सबसे लोकप्रिय चयन।' },
  'featured.view_all': { en: 'View All Products', ta: 'அனைத்து பொருட்களையும் காண்', hi: 'सभी उत्पाद देखें' },

  // Why Choose Us
  'why.title': { en: 'Why Choose Meenava Sonthangal?', ta: 'ஏன் மீனவ சொந்தங்கள்?', hi: 'मीनवा सोन्थंगल क्यों चुनें?' },
  'why.subtitle': { en: "We're not just selling seafood — we're delivering the authentic taste of Kanyakumari's ocean heritage to your table.", ta: "நாங்கள் கடல் உணவை மட்டும் விற்கவில்லை — கன்னியாகுமரியின் கடல் பாரம்பரியத்தின் உண்மையான சுவையை உங்கள் மேசைக்கு டெலிவரி செய்கிறோம்.", hi: "हम सिर्फ समुद्री भोजन नहीं बेच रहे — हम कन्याकुमारी की समुद्री विरासत का असली स्वाद आपकी मेज तक पहुंचा रहे हैं।" },
  'why.direct_fishermen': { en: 'Direct from Fishermen', ta: 'மீனவர்களிடம் நேரடியாக', hi: 'मछुआरों से सीधे' },
  'why.direct_fishermen_desc': { en: 'We partner directly with local fishermen in Kanyakumari, ensuring you get the freshest catch at the best prices.', ta: 'கன்னியாகுமரி உள்ளூர் மீனவர்களுடன் நேரடியாக இணைந்து, சிறந்த விலையில் புதிய மீன்களை உங்களுக்கு வழங்குகிறோம்.', hi: 'हम कन्याकुमारी के स्थानीय मछुआरों से सीधे जुड़े हैं, जिससे आपको सबसे ताज़ी मछली सर्वोत्तम कीमत पर मिलती है।' },
  'why.pristine_waters': { en: 'Pristine Waters', ta: 'தூய்மையான கடல்', hi: 'स्वच्छ जल' },
  'why.pristine_waters_desc': { en: 'Our seafood comes from the clean, mineral-rich waters where the Bay of Bengal meets the Indian Ocean.', ta: 'வங்காள விரிகுடா இந்தியப் பெருங்கடலை சந்திக்கும் தூய்மையான, கனிம வளம் மிக்க நீரிலிருந்து எங்கள் கடல் உணவு வருகிறது.', hi: 'हमारा समुद्री भोजन बंगाल की खाड़ी और हिंद महासागर के मिलन स्थल के स्वच्छ, खनिज युक्त पानी से आता है।' },
  'why.cold_chain': { en: 'Cold Chain Delivery', ta: 'குளிர்ச்சி பாதுகாப்பு', hi: 'कोल्ड चेन डिलीवरी' },
  'why.cold_chain_desc': { en: 'From catch to your kitchen, we maintain optimal temperature to preserve freshness and nutrition.', ta: 'பிடிப்பு முதல் உங்கள் சமையலறை வரை, புத்துணர்வு மற்றும் ஊட்டச்சத்தை பாதுகாக்க உகந்த வெப்பநிலையை பராமரிக்கிறோம்.', hi: 'पकड़ने से लेकर आपकी रसोई तक, हम ताज़गी और पोषण बनाए रखने के लिए इष्टतम तापमान बनाए रखते हैं।' },
  'why.traditional': { en: 'Traditional Methods', ta: 'பாரம்பரிய முறை', hi: 'पारंपरिक तरीके' },
  'why.traditional_desc': { en: 'Our dry fish is prepared using age-old sun-drying techniques passed down through generations.', ta: 'பல தலைமுறைகளாக கடத்தப்பட்ட பழமையான வெயிலில் உலர்த்தும் நுட்பங்களைப் பயன்படுத்தி எங்கள் கருவாடு தயாரிக்கப்படுகிறது.', hi: 'हमारी सूखी मछली पीढ़ियों से चली आ रही पुरानी धूप में सुखाने की तकनीकों से तैयार की जाती है।' },

  // Testimonials
  'testimonials.title': { en: 'What Our Customers Say', ta: 'எங்கள் வாடிக்கையாளர்கள் என்ன சொல்கிறார்கள்', hi: 'हमारे ग्राहक क्या कहते हैं' },
  'testimonials.subtitle': { en: "Don't just take our word for it — hear from our happy customers across Tamil Nadu.", ta: 'எங்கள் வார்த்தையை மட்டும் நம்ப வேண்டாம் — தமிழ்நாடு முழுவதும் உள்ள எங்கள் மகிழ்ச்சியான வாடிக்கையாளர்களிடம் கேளுங்கள்.', hi: 'सिर्फ हमारी बात पर भरोसा न करें — तमिलनाडु भर में हमारे खुश ग्राहकों से सुनें।' },
  'testimonial.1': { en: 'The freshness is unmatched! The King Fish I ordered arrived perfectly packed and tasted like it was just caught. Will definitely order again.', ta: 'புத்துணர்வு ஒப்பற்றது! நான் ஆர்டர் செய்த வஞ்சிரம் சரியாக பேக் செய்யப்பட்டு வந்தது, இப்போது பிடித்தது போல் சுவையாக இருந்தது. கண்டிப்பாக மீண்டும் ஆர்டர் செய்வேன்.', hi: 'ताज़गी बेजोड़ है! मैंने जो किंग फ़िश ऑर्डर की थी वह बिल्कुल सही पैक होकर आई और ऐसे स्वाद लगी जैसे अभी पकड़ी गई हो। ज़रूर फिर ऑर्डर करूंगी।' },
  'testimonial.2': { en: "Best dry fish I've ever had! The traditional sun-drying method really makes a difference. Authentic Kanyakumari taste.", ta: 'இதுவரை சாப்பிட்டதிலேயே சிறந்த கருவாடு! பாரம்பரிய வெயிலில் உலர்த்தும் முறை உண்மையிலேயே வித்தியாசத்தை ஏற்படுத்துகிறது. உண்மையான கன்னியாகுமரி சுவை.', hi: 'अब तक की सबसे अच्छी सूखी मछली! पारंपरिक धूप में सुखाने की विधि वाकई फर्क डालती है। असली कन्याकुमारी स्वाद।' },
  'testimonial.3': { en: 'Quick delivery and excellent quality. The prawns were huge and so fresh. My family loved the seafood curry I made!', ta: 'விரைவான டெலிவரி மற்றும் சிறந்த தரம். இறால்கள் பெரியதாகவும் புதிதாகவும் இருந்தன. நான் செய்த கடல் உணவு குழம்பு என் குடும்பத்துக்கு மிகவும் பிடித்தது!', hi: 'तेज़ डिलीवरी और बेहतरीन गुणवत्ता। झींगे बड़े और बहुत ताज़े थे। मेरे परिवार को मेरी बनाई सीफ़ूड करी बहुत पसंद आई!' },

  // CTA Section
  'cta.title': { en: 'Ready to Taste the Ocean?', ta: 'கடலின் சுவையை ருசிக்க தயாரா?', hi: 'समुद्र का स्वाद चखने के लिए तैयार?' },
  'cta.subtitle': { en: 'Order now and experience the freshest seafood from Kanyakumari. Free delivery on orders above ₹500!', ta: 'இப்போதே ஆர்டர் செய்து கன்னியாகுமரியின் புதிய கடல் உணவை அனுபவியுங்கள். ₹500 மேல் ஆர்டருக்கு இலவச டெலிவரி!', hi: 'अभी ऑर्डर करें और कन्याकुमारी का सबसे ताज़ा समुद्री भोजन अनुभव करें। ₹500 से ऊपर के ऑर्डर पर मुफ्त डिलीवरी!' },
  'cta.shop_now': { en: 'Shop Now', ta: 'இப்போது வாங்கு', hi: 'अभी खरीदें' },
  'cta.call_to_order': { en: 'Call to Order', ta: 'ஆர்டர் செய்ய அழைக்கவும்', hi: 'ऑर्डर के लिए कॉल करें' },
  'cta.trust': { en: '🛡️ 100% Freshness Guarantee • 🚚 Same Day Delivery • 💳 Secure Payment', ta: '🛡️ 100% புத்துணர்வு உத்தரவாதம் • 🚚 அதே நாள் டெலிவரி • 💳 பாதுகாப்பான பணம் செலுத்தல்', hi: '🛡️ 100% ताज़गी गारंटी • 🚚 उसी दिन डिलीवरी • 💳 सुरक्षित भुगतान' },

  // Products Page
  'products.page_title': { en: 'Our Products', ta: 'எங்கள் பொருட்கள்', hi: 'हमारे उत्पाद' },
  'products.page_subtitle': { en: 'Fresh seafood delivered to your doorstep. Browse our selection of premium fish, prawns, crabs, and more.', ta: 'உங்கள் வீட்டு வாசலில் புதிய கடல் உணவு. உயர்தர மீன், இறால், நண்டு மற்றும் பலவற்றை உலாவுங்கள்.', hi: 'आपके दरवाजे तक ताज़ा समुद्री भोजन। प्रीमियम मछली, झींगा, केकड़ा और बहुत कुछ ब्राउज़ करें।' },
  'products.search_placeholder': { en: 'Search products... (e.g., King Fish, Prawns)', ta: 'பொருட்களைத் தேடு... (எ.கா., வஞ்சிரம், இறால்)', hi: 'उत्पाद खोजें... (जैसे, किंग फ़िश, झींगा)' },
  'products.showing': { en: 'Showing', ta: 'காட்டுகிறது', hi: 'दिखा रहे हैं' },
  'products.product': { en: 'product', ta: 'பொருள்', hi: 'उत्पाद' },
  'products.products_plural': { en: 'products', ta: 'பொருட்கள்', hi: 'उत्पाद' },
  'products.in_selected': { en: 'in selected category', ta: 'தேர்ந்தெடுக்கப்பட்ட வகையில்', hi: 'चयनित श्रेणी में' },
  'products.all': { en: 'All Products', ta: 'அனைத்து பொருட்கள்', hi: 'सभी उत्पाद' },
  'products.add_to_cart': { en: 'Add to Cart', ta: 'கூடையில் சேர்', hi: 'कार्ट में जोड़ें' },
  'products.add': { en: 'Add', ta: 'சேர்', hi: 'जोड़ें' },
  'products.in_stock': { en: 'In Stock', ta: 'கையிருப்பில்', hi: 'स्टॉक में' },
  'products.out_of_stock': { en: 'Out of Stock', ta: 'கையிருப்பில் இல்லை', hi: 'स्टॉक में नहीं' },
  'products.select_weight': { en: 'Select Weight:', ta: 'எடையைத் தேர்ந்தெடு:', hi: 'वजन चुनें:' },
  'products.fresh_today': { en: '🌊 Fresh Today', ta: '🌊 இன்று புதிது', hi: '🌊 आज ताज़ा' },
  'products.reviews': { en: 'reviews', ta: 'மதிப்புரைகள்', hi: 'समीक्षाएं' },
  'products.added_to_cart': { en: 'Added to cart!', ta: 'கூடையில் சேர்க்கப்பட்டது!', hi: 'कार्ट में जोड़ा गया!' },
  'products.added_desc': { en: 'added to your cart.', ta: 'உங்கள் கூடையில் சேர்க்கப்பட்டது.', hi: 'आपके कार्ट में जोड़ा गया।' },
  'products.not_found': { en: 'Product Not Found', ta: 'பொருள் கிடைக்கவில்லை', hi: 'उत्पाद नहीं मिला' },
  'products.browse': { en: 'Browse Products', ta: 'பொருட்களை உலாவு', hi: 'उत्पाद ब्राउज़ करें' },

  // Product names
  'product.red_snapper': { en: 'Red Snapper', ta: 'சங்கரா மீன்', hi: 'लाल स्नैपर' },
  'product.tiger_prawns': { en: 'Tiger Prawns', ta: 'கருவாடு இறால்', hi: 'टाइगर झींगा' },
  'product.dry_anchovies': { en: 'Dry Anchovies', ta: 'நெத்திலி கருவாடு', hi: 'सूखी ऐंचोवी' },
  'product.blue_crab': { en: 'Blue Swimming Crab', ta: 'நண்டு', hi: 'नीला केकड़ा' },
  'product.silver_pomfret': { en: 'Silver Pomfret', ta: 'வாவல் மீன்', hi: 'सिल्वर पोम्फ्रेट' },
  'product.fresh_squid': { en: 'Fresh Squid', ta: 'கணவாய்', hi: 'ताज़ा स्क्विड' },
  'product.king_fish': { en: 'King Fish (Seer Fish)', ta: 'வஞ்சிரம்', hi: 'किंग फ़िश (सीर फ़िश)' },
  'product.fish_pickle': { en: 'Fish Pickle', ta: 'மீன் ஊறுகாய்', hi: 'मछली का अचार' },
  'product.prawn_pickle': { en: 'Prawn Pickle', ta: 'இறால் ஊறுகாய்', hi: 'झींगा अचार' },
  'product.dry_fish_pickle': { en: 'Dry Fish Pickle', ta: 'கருவாடு ஊறுகாய்', hi: 'सूखी मछली का अचार' },

  // Product descriptions
  'product.red_snapper_desc': { en: 'Fresh Red Snapper caught daily from the pristine waters of Kanyakumari. Perfect for frying or curry.', ta: 'கன்னியாகுமரியின் தூய்மையான நீரிலிருந்து தினமும் பிடிக்கப்படும் புதிய சங்கரா மீன். வறுக்க அல்லது குழம்புக்கு ஏற்றது.', hi: 'कन्याकुमारी के स्वच्छ पानी से रोज़ाना पकड़ी जाने वाली ताज़ी लाल स्नैपर। फ्राई या करी के लिए बिल्कुल सही।' },
  'product.tiger_prawns_desc': { en: 'Large, succulent tiger prawns. Excellent for grilling, curries, or biryani. Cleaned and deveined on request.', ta: 'பெரிய, சதைப்பற்றுள்ள இறால்கள். கிரில், குழம்பு அல்லது பிரியாணிக்கு சிறந்தது. கோரிக்கையின் பேரில் சுத்தம் செய்யப்படும்.', hi: 'बड़े, रसीले टाइगर झींगे। ग्रिलिंग, करी या बिरयानी के लिए उत्कृष्ट। अनुरोध पर साफ किया जाता है।' },
  'product.dry_anchovies_desc': { en: 'Traditional sun-dried anchovies from Kanyakumari. Rich in flavor, perfect for chutneys and fry dishes.', ta: 'கன்னியாகுமரியின் பாரம்பரிய வெயிலில் உலர்த்தப்பட்ட நெத்திலி. சுவை நிறைந்தது, சட்னி மற்றும் வறுவலுக்கு ஏற்றது.', hi: 'कन्याकुमारी से पारंपरिक धूप में सुखाई गई ऐंचोवी। स्वाद से भरपूर, चटनी और फ्राई के लिए बिल्कुल सही।' },
  'product.blue_crab_desc': { en: 'Fresh blue crabs, perfect for crab curry or pepper crab. Sweet, tender meat that melts in your mouth.', ta: 'புதிய நீல நண்டுகள், நண்டு குழம்பு அல்லது மிளகு நண்டுக்கு ஏற்றது. உங்கள் வாயில் உருகும் இனிமையான, மென்மையான இறைச்சி.', hi: 'ताज़े नीले केकड़े, केकड़ा करी या काली मिर्च केकड़े के लिए बिल्कुल सही। मीठा, कोमल मांस जो मुंह में घुल जाता है।' },
  'product.silver_pomfret_desc': { en: 'Premium silver pomfret, a delicacy from the Arabian Sea. Best for frying or steaming with mild spices.', ta: 'உயர்தர வாவல் மீன், அரபிக் கடலின் சுவையான உணவு. லேசான மசாலாவுடன் வறுக்க அல்லது ஆவியில் வேகவைக்க சிறந்தது.', hi: 'प्रीमियम सिल्वर पोम्फ्रेट, अरब सागर से एक स्वादिष्ट व्यंजन। हल्के मसालों के साथ फ्राई या स्टीम के लिए सर्वोत्तम।' },
  'product.fresh_squid_desc': { en: 'Tender squid rings and tentacles, cleaned and ready to cook. Ideal for grilling, frying, or curry.', ta: 'மென்மையான கணவாய் வளையங்கள் மற்றும் கால்கள், சுத்தம் செய்யப்பட்டு சமைக்க தயாராக உள்ளது. கிரில், வறுவல் அல்லது குழம்புக்கு ஏற்றது.', hi: 'कोमल स्क्विड रिंग्स और टेंटेकल्स, साफ और पकाने के लिए तैयार। ग्रिलिंग, फ्राई या करी के लिए आदर्श।' },
  'product.king_fish_desc': { en: 'Premium king fish steaks, the king of Indian seafood. Rich, flavorful meat perfect for fry or curry.', ta: 'உயர்தர வஞ்சிரம் துண்டுகள், இந்திய கடல் உணவின் அரசன். வறுவல் அல்லது குழம்புக்கு ஏற்ற சுவையான இறைச்சி.', hi: 'प्रीमियम किंग फ़िश स्टेक, भारतीय समुद्री भोजन का राजा। फ्राई या करी के लिए समृद्ध, स्वादिष्ट मांस।' },
  'product.fish_pickle_desc': { en: 'Authentic Kanyakumari-style fish pickle made with fresh seer fish, traditional spices, and gingelly oil. Perfect with rice or roti.', ta: 'புதிய வஞ்சிரம், பாரம்பரிய மசாலா மற்றும் நல்லெண்ணெய் கொண்டு தயாரிக்கப்பட்ட உண்மையான கன்னியாகுமரி பாணி மீன் ஊறுகாய். சோறு அல்லது ரொட்டியுடன் சிறந்தது.', hi: 'ताज़ी सीर फ़िश, पारंपरिक मसालों और तिल के तेल से बना असली कन्याकुमारी शैली का मछली अचार। चावल या रोटी के साथ बिल्कुल सही।' },
  'product.prawn_pickle_desc': { en: 'Spicy prawn pickle with hand-picked prawns and aromatic spices. A true Kanyakumari delicacy.', ta: 'கையால் தேர்ந்தெடுக்கப்பட்ட இறால்கள் மற்றும் நறுமண மசாலாவுடன் கூடிய காரமான இறால் ஊறுகாய். உண்மையான கன்னியாகுமரி சுவை.', hi: 'हाथ से चुने गए झींगों और सुगंधित मसालों के साथ मसालेदार झींगा अचार। एक सच्ची कन्याकुमारी स्वादिष्टता।' },
  'product.dry_fish_pickle_desc': { en: 'Traditional dry fish pickle with sun-dried anchovies and fiery red chillies. A staple in every South Indian home.', ta: 'வெயிலில் உலர்த்தப்பட்ட நெத்திலி மற்றும் காரமான சிவப்பு மிளகாயுடன் கூடிய பாரம்பரிய கருவாடு ஊறுகாய். ஒவ்வொரு தென்னிந்திய வீட்டிலும் அத்தியாவசியம்.', hi: 'धूप में सुखाई गई ऐंचोवी और तीखी लाल मिर्च के साथ पारंपरिक सूखी मछली अचार। हर दक्षिण भारतीय घर में ज़रूरी।' },

  // Product Detail Page
  'detail.add_to_cart': { en: 'Add to Cart', ta: 'கூடையில் சேர்', hi: 'कार्ट में जोड़ें' },
  'detail.customer_reviews': { en: 'Customer Reviews', ta: 'வாடிக்கையாளர் மதிப்புரைகள்', hi: 'ग्राहक समीक्षाएं' },
  'detail.write_review': { en: 'Write a Review', ta: 'மதிப்புரை எழுது', hi: 'समीक्षा लिखें' },
  'detail.review_placeholder': { en: 'Share your experience with this product...', ta: 'இந்த பொருளைப் பற்றிய உங்கள் அனுபவத்தைப் பகிரவும்...', hi: 'इस उत्पाद के साथ अपना अनुभव साझा करें...' },
  'detail.submit_review': { en: 'Submit Review', ta: 'மதிப்புரையை சமர்ப்பி', hi: 'समीक्षा जमा करें' },
  'detail.submitting': { en: 'Submitting...', ta: 'சமர்ப்பிக்கிறது...', hi: 'जमा हो रहा है...' },
  'detail.review_submitted': { en: 'Review submitted!', ta: 'மதிப்புரை சமர்ப்பிக்கப்பட்டது!', hi: 'समीक्षा जमा हो गई!' },
  'detail.review_after_approval': { en: 'Your review will appear after approval.', ta: 'உங்கள் மதிப்புரை அனுமதிக்கப்பட்ட பிறகு தோன்றும்.', hi: 'आपकी समीक्षा स्वीकृति के बाद दिखाई देगी।' },
  'detail.please_login': { en: 'Please login', ta: 'தயவுசெய்து உள்நுழையவும்', hi: 'कृपया लॉगिन करें' },
  'detail.login_to_review': { en: 'You need to be logged in to write a review.', ta: 'மதிப்புரை எழுத நீங்கள் உள்நுழைந்திருக்க வேண்டும்.', hi: 'समीक्षा लिखने के लिए आपको लॉगिन करना होगा।' },
  'detail.you_may_like': { en: 'You May Also Like', ta: 'உங்களுக்கு பிடிக்கலாம்', hi: 'आपको ये भी पसंद आ सकते हैं' },
  'detail.link_copied': { en: 'Link copied!', ta: 'லிங்க் நகலெடுக்கப்பட்டது!', hi: 'लिंक कॉपी हो गया!' },
  'detail.link_copied_desc': { en: 'Product link copied to clipboard.', ta: 'பொருள் லிங்க் கிளிப்போர்டில் நகலெடுக்கப்பட்டது.', hi: 'उत्पाद लिंक क्लिपबोर्ड पर कॉपी किया गया।' },
  'detail.save_off': { en: 'Save', ta: 'சேமிக்கவும்', hi: 'बचाएं' },
  'detail.featured': { en: '⭐ Featured', ta: '⭐ சிறப்பு', hi: '⭐ विशेष' },

  // Cart Page
  'cart.title': { en: 'Shopping Cart', ta: 'பொருட்கள் கூடை', hi: 'शॉपिंग कार्ट' },
  'cart.your_cart': { en: 'Your Cart', ta: 'உங்கள் கூடை', hi: 'आपकी कार्ट' },
  'cart.empty': { en: 'Your Cart is Empty', ta: 'உங்கள் கூடை காலியாக உள்ளது', hi: 'आपकी कार्ट खाली है' },
  'cart.empty_desc': { en: "Looks like you haven't added any fresh catch yet. Start shopping to fill your cart with delicious seafood!", ta: 'நீங்கள் இன்னும் எந்த புதிய மீனையும் சேர்க்கவில்லை போல் தெரிகிறது. சுவையான கடல் உணவுகளால் உங்கள் கூடையை நிரப்ப ஷாப்பிங் தொடங்குங்கள்!', hi: 'लगता है आपने अभी तक कोई ताज़ी मछली नहीं जोड़ी है। स्वादिष्ट समुद्री भोजन से अपनी कार्ट भरने के लिए शॉपिंग शुरू करें!' },
  'cart.browse': { en: 'Browse Products', ta: 'பொருட்களை உலாவு', hi: 'उत्पाद ब्राउज़ करें' },
  'cart.clear': { en: 'Clear entire cart', ta: 'முழு கூடையையும் அழி', hi: 'पूरी कार्ट खाली करें' },
  'cart.order_summary': { en: 'Order Summary', ta: 'ஆர்டர் சுருக்கம்', hi: 'ऑर्डर सारांश' },
  'cart.subtotal': { en: 'Subtotal', ta: 'கூட்டுத்தொகை', hi: 'उप-कुल' },
  'cart.items': { en: 'items', ta: 'பொருட்கள்', hi: 'आइटम' },
  'cart.delivery': { en: 'Delivery', ta: 'டெலிவரி', hi: 'डिलीवरी' },
  'cart.free': { en: 'FREE', ta: 'இலவசம்', hi: 'मुफ्त' },
  'cart.add_more_free': { en: 'Add ₹{amount} more for free delivery!', ta: 'இலவச டெலிவரிக்கு ₹{amount} மேலும் சேருங்கள்!', hi: 'मुफ्त डिलीवरी के लिए ₹{amount} और जोड़ें!' },
  'cart.total': { en: 'Total', ta: 'மொத்தம்', hi: 'कुल' },
  'cart.checkout': { en: 'Proceed to Checkout', ta: 'செக்அவுட்க்கு செல்', hi: 'चेकआउट पर जाएं' },
  'cart.order_whatsapp': { en: 'Order via WhatsApp', ta: 'WhatsApp வழியாக ஆர்டர்', hi: 'WhatsApp से ऑर्डर करें' },

  // Checkout Page
  'checkout.title': { en: 'Checkout', ta: 'செக்அவுட்', hi: 'चेकआउट' },
  'checkout.back_to_cart': { en: 'Back to Cart', ta: 'கூடைக்கு திரும்பு', hi: 'कार्ट पर वापस' },
  'checkout.delivery_details': { en: 'Delivery Details', ta: 'டெலிவரி விவரங்கள்', hi: 'डिलीवरी विवरण' },
  'checkout.full_name': { en: 'Full Name', ta: 'முழு பெயர்', hi: 'पूरा नाम' },
  'checkout.phone': { en: 'Phone Number', ta: 'தொலைபேசி எண்', hi: 'फ़ोन नंबर' },
  'checkout.email': { en: 'Email', ta: 'மின்னஞ்சல்', hi: 'ईमेल' },
  'checkout.address': { en: 'Delivery Address', ta: 'டெலிவரி முகவரி', hi: 'डिलीवरी पता' },
  'checkout.address_placeholder': { en: 'House/Flat No, Street, Landmark...', ta: 'வீடு/பிளாட் எண், தெரு, அடையாளம்...', hi: 'घर/फ्लैट नंबर, गली, लैंडमार्क...' },
  'checkout.city': { en: 'City', ta: 'நகரம்', hi: 'शहर' },
  'checkout.pincode': { en: 'Pincode', ta: 'பின்கோட்', hi: 'पिनकोड' },
  'checkout.notes': { en: 'Order Notes (optional)', ta: 'ஆர்டர் குறிப்புகள் (விரும்பினால்)', hi: 'ऑर्डर नोट्स (वैकल्पिक)' },
  'checkout.notes_placeholder': { en: 'e.g. Clean and cut the fish', ta: 'எ.கா. மீனை சுத்தம் செய்து வெட்டுங்கள்', hi: 'जैसे मछली साफ करके काटें' },
  'checkout.payment_method': { en: 'Payment Method', ta: 'பணம் செலுத்தும் முறை', hi: 'भुगतान विधि' },
  'checkout.cod': { en: 'Cash on Delivery', ta: 'டெலிவரியில் பணம்', hi: 'कैश ऑन डिलीवरी' },
  'checkout.cod_desc': { en: 'Pay when order arrives', ta: 'ஆர்டர் வரும்போது பணம் செலுத்துங்கள்', hi: 'ऑर्डर आने पर भुगतान करें' },
  'checkout.upi': { en: 'UPI Payment', ta: 'UPI பணம் செலுத்தல்', hi: 'UPI भुगतान' },
  'checkout.upi_desc': { en: 'GPay, PhonePe, Paytm', ta: 'GPay, PhonePe, Paytm', hi: 'GPay, PhonePe, Paytm' },
  'checkout.whatsapp_order': { en: 'WhatsApp Order', ta: 'WhatsApp ஆர்டர்', hi: 'WhatsApp ऑर्डर' },
  'checkout.whatsapp_desc': { en: 'Confirm via WhatsApp', ta: 'WhatsApp வழியாக உறுதிப்படுத்து', hi: 'WhatsApp से पुष्टि करें' },
  'checkout.place_order': { en: 'Place Order', ta: 'ஆர்டர் செய்', hi: 'ऑर्डर करें' },
  'checkout.fill_fields': { en: 'Please fill all required fields.', ta: 'தயவுசெய்து அனைத்து தேவையான புலங்களையும் நிரப்பவும்.', hi: 'कृपया सभी आवश्यक फ़ील्ड भरें।' },
  'checkout.order_placed': { en: 'Order Placed!', ta: 'ஆர்டர் செய்யப்பட்டது!', hi: 'ऑर्डर हो गया!' },
  'checkout.thank_you': { en: 'Thank you for your order.', ta: 'உங்கள் ஆர்டருக்கு நன்றி.', hi: 'आपके ऑर्डर के लिए धन्यवाद।' },
  'checkout.order_id': { en: 'Order ID', ta: 'ஆர்டர் ஐடி', hi: 'ऑर्डर आईडी' },
  'checkout.cod_msg': { en: "Pay when your order arrives. We'll call you to confirm.", ta: 'ஆர்டர் வரும்போது பணம் செலுத்துங்கள். உறுதிப்படுத்த நாங்கள் உங்களை அழைப்போம்.', hi: 'ऑर्डर आने पर भुगतान करें। पुष्टि के लिए हम आपको कॉल करेंगे।' },
  'checkout.upi_msg': { en: "Please complete payment via UPI. We'll send details on WhatsApp.", ta: 'UPI வழியாக பணம் செலுத்தவும். WhatsApp இல் விவரங்களை அனுப்புவோம்.', hi: 'कृपया UPI से भुगतान पूरा करें। हम WhatsApp पर विवरण भेजेंगे।' },
  'checkout.whatsapp_msg': { en: "We'll confirm your order via WhatsApp shortly.", ta: 'விரைவில் WhatsApp வழியாக உங்கள் ஆர்டரை உறுதிப்படுத்துவோம்.', hi: 'हम जल्द ही WhatsApp से आपके ऑर्डर की पुष्टि करेंगे।' },
  'checkout.continue_shopping': { en: 'Continue Shopping', ta: 'ஷாப்பிங் தொடரவும்', hi: 'शॉपिंग जारी रखें' },
  'checkout.back_home': { en: 'Back to Home', ta: 'முகப்புக்கு திரும்பு', hi: 'होम पर वापस' },
  'checkout.cart_empty': { en: 'Cart is Empty', ta: 'கூடை காலியாக உள்ளது', hi: 'कार्ट खाली है' },
  'checkout.add_before': { en: 'Add some products before checkout.', ta: 'செக்அவுட்டுக்கு முன் சில பொருட்களை சேருங்கள்.', hi: 'चेकआउट से पहले कुछ उत्पाद जोड़ें।' },
  'checkout.secure_info': { en: "🛡️ Your information is secure. We'll confirm via call/WhatsApp.", ta: "🛡️ உங்கள் தகவல் பாதுகாப்பாக உள்ளது. அழைப்பு/WhatsApp வழியாக உறுதிப்படுத்துவோம்.", hi: "🛡️ आपकी जानकारी सुरक्षित है। हम कॉल/WhatsApp से पुष्टि करेंगे।" },
  'checkout.order_success': { en: 'Order placed successfully!', ta: 'ஆர்டர் வெற்றிகரமாக செய்யப்பட்டது!', hi: 'ऑर्डर सफलतापूर्वक हो गया!' },

  // Contact Page
  'contact.title': { en: 'Contact Us', ta: 'எங்களை தொடர்பு கொள்ளுங்கள்', hi: 'हमसे संपर्क करें' },
  'contact.subtitle': { en: "Have questions or need help with your order? We're here for you!", ta: 'கேள்விகள் உள்ளதா அல்லது உங்கள் ஆர்டருக்கு உதவி தேவையா? நாங்கள் உங்களுக்காக இருக்கிறோம்!', hi: 'कोई सवाल है या अपने ऑर्डर में मदद चाहिए? हम आपके लिए यहां हैं!' },
  'contact.get_in_touch': { en: 'Get in Touch', ta: 'தொடர்பில் இருங்கள்', hi: 'संपर्क करें' },
  'contact.phone': { en: 'Phone', ta: 'தொலைபேசி', hi: 'फ़ोन' },
  'contact.whatsapp': { en: 'WhatsApp', ta: 'WhatsApp', hi: 'WhatsApp' },
  'contact.chat_directly': { en: 'Chat with us directly', ta: 'நேரடியாக எங்களிடம் அரட்டையடியுங்கள்', hi: 'हमसे सीधे चैट करें' },
  'contact.email': { en: 'Email', ta: 'மின்னஞ்சல்', hi: 'ईमेल' },
  'contact.address': { en: 'Address', ta: 'முகவரி', hi: 'पता' },
  'contact.hours': { en: 'Business Hours', ta: 'வணிக நேரம்', hi: 'कार्य समय' },
  'contact.hours_weekday': { en: 'Mon - Sat: 6:00 AM - 8:00 PM', ta: 'திங்கள் - சனி: காலை 6:00 - இரவு 8:00', hi: 'सोम - शनि: सुबह 6:00 - रात 8:00' },
  'contact.hours_sunday': { en: 'Sunday: 6:00 AM - 2:00 PM', ta: 'ஞாயிறு: காலை 6:00 - மதியம் 2:00', hi: 'रविवार: सुबह 6:00 - दोपहर 2:00' },
  'contact.quick_order': { en: 'Quick Order via WhatsApp', ta: 'WhatsApp வழியாக விரைவு ஆர்டர்', hi: 'WhatsApp से त्वरित ऑर्डर' },
  'contact.quick_order_desc': { en: 'The fastest way to order! Just send us a message with what you need.', ta: 'ஆர்டர் செய்ய மிக வேகமான வழி! உங்களுக்கு என்ன தேவை என்று ஒரு செய்தி அனுப்புங்கள்.', hi: 'ऑर्डर करने का सबसे तेज़ तरीका! बस हमें एक संदेश भेजें।' },
  'contact.start_chat': { en: 'Start WhatsApp Chat', ta: 'WhatsApp அரட்டை தொடங்கு', hi: 'WhatsApp चैट शुरू करें' },

  // Auth Page
  'auth.sign_in': { en: 'Sign in to your account', ta: 'உங்கள் கணக்கில் உள்நுழையவும்', hi: 'अपने खाते में साइन इन करें' },
  'auth.create_account': { en: 'Create a new account', ta: 'புதிய கணக்கை உருவாக்கு', hi: 'नया खाता बनाएं' },
  'auth.full_name': { en: 'Full Name', ta: 'முழு பெயர்', hi: 'पूरा नाम' },
  'auth.enter_name': { en: 'Enter your name', ta: 'உங்கள் பெயரை உள்ளிடவும்', hi: 'अपना नाम दर्ज करें' },
  'auth.email': { en: 'Email', ta: 'மின்னஞ்சல்', hi: 'ईमेल' },
  'auth.password': { en: 'Password', ta: 'கடவுச்சொல்', hi: 'पासवर्ड' },
  'auth.sign_in_btn': { en: 'Sign In', ta: 'உள்நுழை', hi: 'साइन इन' },
  'auth.create_btn': { en: 'Create Account', ta: 'கணக்கை உருவாக்கு', hi: 'खाता बनाएं' },
  'auth.no_account': { en: "Don't have an account? Sign Up", ta: 'கணக்கு இல்லையா? பதிவு செய்யுங்கள்', hi: 'खाता नहीं है? साइन अप करें' },
  'auth.has_account': { en: 'Already have an account? Sign In', ta: 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும்', hi: 'पहले से खाता है? साइन इन करें' },
  'auth.fill_fields': { en: 'Please fill in all fields.', ta: 'அனைத்து புலங்களையும் நிரப்பவும்.', hi: 'कृपया सभी फ़ील्ड भरें।' },
  'auth.enter_full_name': { en: 'Please enter your full name.', ta: 'உங்கள் முழு பெயரை உள்ளிடவும்.', hi: 'कृपया अपना पूरा नाम दर्ज करें।' },
  'auth.login_failed': { en: 'Login Failed', ta: 'உள்நுழைவு தோல்வி', hi: 'लॉगिन विफल' },
  'auth.signup_failed': { en: 'Signup Failed', ta: 'பதிவு தோல்வி', hi: 'साइनअप विफल' },
  'auth.account_created': { en: 'Account Created!', ta: 'கணக்கு உருவாக்கப்பட்டது!', hi: 'खाता बन गया!' },
  'auth.check_email': { en: 'Please check your email to verify your account.', ta: 'உங்கள் கணக்கை சரிபார்க்க உங்கள் மின்னஞ்சலை சரிபார்க்கவும்.', hi: 'अपना खाता सत्यापित करने के लिए कृपया अपना ईमेल जांचें।' },

  // Account Page
  'account.orders': { en: 'Orders', ta: 'ஆர்டர்கள்', hi: 'ऑर्डर' },
  'account.profile': { en: 'Profile', ta: 'சுயவிவரம்', hi: 'प्रोफ़ाइल' },
  'account.addresses': { en: 'Addresses', ta: 'முகவரிகள்', hi: 'पते' },
  'account.sign_out': { en: 'Sign Out', ta: 'வெளியேறு', hi: 'साइन आउट' },
  'account.no_orders': { en: 'No Orders Yet', ta: 'இன்னும் ஆர்டர்கள் இல்லை', hi: 'अभी तक कोई ऑर्डर नहीं' },
  'account.no_orders_desc': { en: 'Your order history will appear here after your first purchase.', ta: 'உங்கள் முதல் வாங்குதலுக்குப் பிறகு ஆர்டர் வரலாறு இங்கே தோன்றும்.', hi: 'आपकी पहली खरीद के बाद ऑर्डर इतिहास यहां दिखाई देगा।' },
  'account.personal_info': { en: 'Personal Information', ta: 'தனிப்பட்ட தகவல்', hi: 'व्यक्तिगत जानकारी' },
  'account.edit': { en: 'Edit', ta: 'திருத்து', hi: 'संपादित करें' },
  'account.save': { en: 'Save', ta: 'சேமி', hi: 'सेव करें' },
  'account.full_name': { en: 'Full Name', ta: 'முழு பெயர்', hi: 'पूरा नाम' },
  'account.phone': { en: 'Phone Number', ta: 'தொலைபேசி எண்', hi: 'फ़ोन नंबर' },
  'account.saved_addresses': { en: 'Saved Addresses', ta: 'சேமிக்கப்பட்ட முகவரிகள்', hi: 'सहेजे गए पते' },
  'account.no_addresses': { en: 'No saved addresses yet. Addresses from your orders will appear here.', ta: 'இன்னும் சேமிக்கப்பட்ட முகவரிகள் இல்லை. உங்கள் ஆர்டர்களிலிருந்து முகவரிகள் இங்கே தோன்றும்.', hi: 'अभी तक कोई सहेजा गया पता नहीं। आपके ऑर्डर से पते यहां दिखाई देंगे।' },
  'account.used_in': { en: 'Used in', ta: 'பயன்படுத்தப்பட்டது', hi: 'उपयोग किया गया' },
  'account.orders_count': { en: 'order(s)', ta: 'ஆர்டர்(கள்)', hi: 'ऑर्डर' },
  'account.profile_updated': { en: 'Profile updated!', ta: 'சுயவிவரம் புதுப்பிக்கப்பட்டது!', hi: 'प्रोफ़ाइल अपडेट हो गई!' },
  'account.update_failed': { en: 'Failed to update profile.', ta: 'சுயவிவரத்தை புதுப்பிக்க முடியவில்லை.', hi: 'प्रोफ़ाइल अपडेट करने में विफल।' },
  'account.seafood_lover': { en: 'Seafood Lover', ta: 'கடல் உணவு பிரியர்', hi: 'सीफ़ूड प्रेमी' },

  // Order statuses
  'status.pending': { en: 'New', ta: 'புதியது', hi: 'नया' },
  'status.confirmed': { en: 'Confirmed', ta: 'உறுதிசெய்யப்பட்டது', hi: 'पुष्टि हो गई' },
  'status.packed': { en: 'Packed', ta: 'பேக் செய்யப்பட்டது', hi: 'पैक हो गया' },
  'status.shipped': { en: 'Shipped', ta: 'அனுப்பப்பட்டது', hi: 'शिप हो गया' },
  'status.delivered': { en: 'Delivered', ta: 'டெலிவரி செய்யப்பட்டது', hi: 'डिलीवर हो गया' },

  // Footer
  'footer.description': { en: 'Fresh seafood delivered straight from the pristine waters of Kanyakumari. Quality and freshness guaranteed since 2018.', ta: 'கன்னியாகுமரியின் தூய்மையான நீரிலிருந்து நேரடியாக புதிய கடல் உணவு. 2018 முதல் தரம் மற்றும் புத்துணர்வு உத்தரவாதம்.', hi: 'कन्याकुमारी के स्वच्छ पानी से सीधे ताज़ा समुद्री भोजन। 2018 से गुणवत्ता और ताज़गी की गारंटी।' },
  'footer.quick_links': { en: 'Quick Links', ta: 'விரைவு இணைப்புகள்', hi: 'त्वरित लिंक' },
  'footer.fresh_fish': { en: 'Fresh Fish', ta: 'புதிய மீன்', hi: 'ताज़ी मछली' },
  'footer.dry_fish': { en: 'Dry Fish', ta: 'காய்ந்த மீன்', hi: 'सूखी मछली' },
  'footer.seafood_specials': { en: 'Seafood Specials', ta: 'கடல் உணவு சிறப்பு', hi: 'सीफ़ूड स्पेशल' },
  'footer.todays_catch': { en: "Today's Catch", ta: 'இன்றைய மீன்', hi: 'आज की पकड़' },
  'footer.offers': { en: 'Offers', ta: 'சலுகைகள்', hi: 'ऑफ़र' },
  'footer.customer_service': { en: 'Customer Service', ta: 'வாடிக்கையாளர் சேவை', hi: 'ग्राहक सेवा' },
  'footer.about': { en: 'About Us', ta: 'எங்களைப் பற்றி', hi: 'हमारे बारे में' },
  'footer.contact': { en: 'Contact', ta: 'தொடர்பு', hi: 'संपर्क' },
  'footer.faq': { en: 'FAQs', ta: 'அடிக்கடி கேட்கும் கேள்விகள்', hi: 'अक्सर पूछे जाने वाले प्रश्न' },
  'footer.shipping': { en: 'Shipping Policy', ta: 'ஷிப்பிங் கொள்கை', hi: 'शिपिंग नीति' },
  'footer.refund': { en: 'Refund Policy', ta: 'பணத்திரும்ப கொள்கை', hi: 'रिफंड नीति' },
  'footer.contact_us': { en: 'Contact Us', ta: 'எங்களை தொடர்பு கொள்ளுங்கள்', hi: 'हमसे संपर्क करें' },
  'footer.rights': { en: '© 2024 Meenava Sonthangal. All rights reserved.', ta: '© 2024 மீனவ சொந்தங்கள். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.', hi: '© 2024 मीनवा सोन्थंगल। सभी अधिकार सुरक्षित।' },
  'footer.privacy': { en: 'Privacy Policy', ta: 'தனியுரிமை கொள்கை', hi: 'गोपनीयता नीति' },
  'footer.terms': { en: 'Terms of Service', ta: 'சேவை விதிமுறைகள்', hi: 'सेवा की शर्तें' },

  // Common
  'common.error': { en: 'Error', ta: 'பிழை', hi: 'त्रुटि' },
  'common.search': { en: 'Search', ta: 'தேடு', hi: 'खोजें' },
  'common.loading': { en: 'Loading...', ta: 'ஏற்றுகிறது...', hi: 'लोड हो रहा है...' },
  'common.save': { en: 'Save', ta: 'சேமி', hi: 'सेव करें' },
  'common.cancel': { en: 'Cancel', ta: 'ரத்து', hi: 'रद्द करें' },
  'common.free_delivery': { en: 'Free Delivery above ₹500', ta: '₹500 மேல் இலவச டெலிவரி', hi: '₹500 से ऊपर मुफ्त डिलीवरी' },
  'common.freshness': { en: 'Freshness Guaranteed', ta: 'புத்துணர்வு உத்தரவாதம்', hi: 'ताज़गी की गारंटी' },
  'common.same_day': { en: 'Same Day Delivery', ta: 'அதே நாள் டெலிவரி', hi: 'उसी दिन डिलीवरी' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
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

  const t = (key: string, params?: Record<string, string | number>) => {
    let text = translations[key]?.[language] || translations[key]?.['en'] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
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
