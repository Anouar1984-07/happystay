// Happy Stay - Script Principal (Version Nettoyée)
// Suppression de tout le code backend pour repartir sur une base propre

import { ServicesCart } from './servicesCart.js';

// Variables globales
let currentLanguage = 'fr';
let currentReviewIndex = 0;
let reviewInterval;

// Traductions
const translations = {
    fr: {
        // Navigation
        'nav-home': 'Accueil',
        'nav-services': 'Nos Services',
        'nav-how': 'Comment ça marche',
        'nav-why': 'Pourquoi nous choisir',
        'nav-contact': 'Contact',

        // Hero Section
        'hero-subtitle': 'Le Souci Du Détail',
        'hero-title': 'VOTRE SATISFACTION, NOTRE PRIORITÉ',
        'hero-cta': 'Réservation et\nDemande de Devis',

        // Services
        'services-title': 'Nos Services',
        'services-subtitle': 'Un accompagnement sur mesure pour votre confort : conciergerie, entretien professionnel et prestations exclusives.',
        'service-concierge': 'Service Conciergerie',
        'service-concierge-desc': 'Prise en charge de vos besoins quotidiens : gestion des clés, assistance logistique, accueil et suivi de vos invités.',
        'service-sofa-chair': 'Nettoyage Canapés / Fauteuils',
        'service-sofa-chair-desc': 'Un nettoyage en profondeur qui redonne éclat et fraîcheur à vos tissus et prolonge la durée de vie de vos assises.',
        'service-chairs': 'Nettoyage Chaises',
        'service-chairs-desc': 'Traitement adapté pour éliminer taches et saletés, en préservant le confort et l\'esthétique de vos chaises.',
        'service-mattress': 'Nettoyage Matelas',
        'service-mattress-desc': 'Désinfection et nettoyage en profondeur de vos matelas pour un sommeil sain et hygiénique.',
        'service-cleaning': 'Ménage Standard',
        'service-cleaning-desc': 'Entretien régulier de votre logement avec des produits adaptés, pour un intérieur propre et agréable au quotidien.',
        'service-deep': 'Grand Ménage',
        'service-deep-desc': 'Une prestation complète et minutieuse pour un nettoyage en profondeur de toutes les pièces, idéale avant/après événement.',

        // Video Section
        'video-title': 'Découvrez Notre Expertise',
        'video-subtitle': 'Voyez notre équipe à l\'œuvre pour un service de qualité professionnelle.',
        'video-fallback': 'Votre navigateur ne supporte pas la lecture vidéo.',
        'video-error': 'Impossible de charger la vidéo. Vérifiez votre connexion internet.',

        // How It Works
        'how-title': 'Accédez à Nos Services',
        'path-concierge-title': 'Service Conciergerie',
        'concierge-step1-title': 'Contactez-nous',
        'concierge-step1-desc': 'Envoyez-nous un message WhatsApp directement',
        'concierge-step2-title': 'Expliquez vos besoins',
        'concierge-step2-desc': 'Décrivez vos besoins de conciergerie',
        'concierge-step3-title': 'Confirmation rapide',
        'concierge-step3-desc': 'Nous confirmons votre demande immédiatement',
        'path-cleaning-title': 'Services de Nettoyage',
        'cleaning-step1-title': 'Remplir le formulaire',
        'cleaning-step1-desc': 'Complétez notre formulaire de réservation',
        'cleaning-step2-title': 'Envoyer des photos',
        'cleaning-step2-desc': 'Ajoutez des photos pour un devis précis',
        'cleaning-step3-title': 'Devis + Confirmation',
        'cleaning-step3-desc': 'Recevez votre devis et confirmez votre RDV',
        'contact-whatsapp': 'Contacter sur WhatsApp',
        'open-booking-form': 'Ouvrir le formulaire',

        // Why Choose Us
        'why-title': 'Pourquoi Nous Choisir ?',
        'feature-quality': 'Qualité Garantie',
        'feature-quality-desc': 'Satisfaction client garantie avec nos équipes expérimentées.',
        'feature-punctual': 'Ponctualité',
        'feature-punctual-desc': 'Respect des horaires convenus et service rapide.',
        'feature-eco': 'Produits Écologiques',
        'feature-eco-desc': 'Utilisation de produits respectueux de l\'environnement.',
        'feature-price': 'Prix Compétitifs',
        'feature-price-desc': 'Tarifs transparents et compétitifs sur le marché.',

        // Reviews
        'reviews-title': 'Avis Clients',
        'reviews-count': '127 avis',
        'review-1': '"Service impeccable ! Mon canapé est comme neuf. L\'équipe est professionnelle et ponctuelle."',
        'review-2': '"Très satisfait du grand ménage. Chaque coin de la maison a été nettoyé avec soin."',
        'review-3': '"Excellent travail sur le nettoyage de matelas. Service rapide et efficace."',
        'review-4': '"Équipe très professionnelle pour le nettoyage de fauteuils. Résultat parfait !"',
        'review-5': '"Service de ménage impeccable. Je recommande vivement Happy Stay !"',

        // Service Area
        'area-title': 'Zone d\'Intervention',
        'area-subtitle': 'Nous intervenons dans tout Agadir et sa région',

        // Instagram
        'instagram-follow': 'Suivre',

        // Footer
        'footer-desc': 'Votre partenaire de confiance pour tous vos besoins de nettoyage à Agadir et sa région.',
        'footer-contact': 'Contact',
        'phone-number': '063 988 7031',
        'footer-hours': 'Horaires',
        'weekdays': 'Lun - Sam',
        'weekend': 'Dimanche',
        'footer-services': 'Services',
        'footer-service1': 'Service Conciergerie',
        'footer-service2': 'Nettoyage Canapés/Fauteuils',
        'footer-service3': 'Nettoyage Chaises',
        'footer-service4': 'Nettoyage Matelas',
        'footer-service5': 'Ménage Standard',
        'footer-service6': 'Grand Ménage',
        'rights': 'Tous droits réservés.',

        // Booking Form
        'booking-title': 'Demande de Devis',
        'form-name': 'Nom & Prénom *',
        'form-district': 'Quartier à Agadir *',
        'form-other-district': 'Précisez votre quartier',
        'form-phone': 'Numéro de téléphone *',
        'form-service': 'Type de service *',
        'service-note': 'Pour les services Ménage Standard et Grand Ménage, nous contacter directement par WhatsApp',
        'form-date': 'Date souhaitée *',
        'form-time': 'Créneau horaire *',
        'form-photos': 'Photos (pour la réalisation du devis)',
        'form-comments': 'Informations complémentaires (optionnel)',
        'form-comments-help': 'Détails utiles pour le devis ou l\'accès (tissu/taches, étage/ascenseur, codes, dispos…).',
        'form-submit': 'Envoyer la demande',
        'form-firstname': 'Prénom *',
        'form-lastname': 'Nom *',
        'select-district': 'Sélectionnez votre quartier',
        'other-option': 'Autre',
        'services-title-form': 'Services demandés *',
        'add-service': 'Ajouter un service',
        'photos-help': 'Ajoutez 2 à 4 photos (vue d\'ensemble + zones à traiter).',
        'gallery': 'Galerie',
        'camera': 'Appareil photo',
        'comments-placeholder': 'Ex. : velours beige, tache café, 3e sans ascenseur, interphone 12B, dispo après 13h.',
        'booking-success-title': 'Demande envoyée avec succès !',
        'booking-success-message': 'Votre demande de devis a bien été reçue. Nous vous contacterons très prochainement sur WhatsApp pour finaliser les détails.',
        'close-modal': 'Fermer',
        'contact-whatsapp-btn': 'Nous contacter sur WhatsApp',
        
        // Services Cart
        'service-card-title': 'Service',
        'service-card-summary-config': 'Configuration en cours...',
        'service-card-summary-select': 'Sélectionnez un type de service',
        'service-type-label': 'Type de service *',
        'service-type-select': 'Sélectionnez un service',
        'service-type-sofa': 'Canapé/Fauteuil',
        'service-type-chairs': 'Chaises',
        'service-type-mattress': 'Matelas',
        'sofa-size-label': 'Taille *',
        'sofa-size-select': 'Sélectionnez',
        'sofa-size-1': '1 place',
        'sofa-size-2': '2 places',
        'sofa-size-3': '3 places',
        'sofa-size-angle': 'Angle',
        'sofa-size-meridienne': 'Méridienne',
        'sofa-size-convertible': 'Convertible',
        'sofa-material-label': 'Matière',
        'sofa-material-select': 'Sélectionnez',
        'sofa-material-tissu': 'Tissu',
        'sofa-material-velours': 'Velours',
        'sofa-material-microfibre': 'Microfibre',
        'sofa-material-cuir': 'Cuir',
        'sofa-material-simili': 'Simili',
        'sofa-stains-label': 'Niveau de taches',
        'sofa-stains-select': 'Sélectionnez',
        'sofa-stains-none': 'Aucune',
        'sofa-stains-light': 'Légères',
        'sofa-stains-heavy': 'Importantes',
        'quantity-label': 'Quantité *',
        'options-label': 'Options (facultatives)',
        'option-anti-mites': 'Anti-acariens',
        'option-protection': 'Protection anti-taches',
        'chair-material-label': 'Matière *',
        'chair-material-tissu': 'Tissu',
        'chair-material-simili': 'Similicuir',
        'chair-material-wood': 'Bois + coussin',
        'removable-cushion': 'Coussin amovible',
        'mattress-format-label': 'Format *',
        'mattress-format-select': 'Sélectionnez',
        'mattress-faces-label': 'Faces *',
        'mattress-faces-select': 'Sélectionnez',
        'mattress-faces-1': '1 face',
        'mattress-faces-2': '2 faces',
        'mattress-note-label': 'Remarque (optionnel)',
        'mattress-note-placeholder': 'Remarque optionnelle',
        'validate-service-btn': 'Valider ce service',
        'validate-service-btn-complete': 'Compléter le service',
        'validate-service-btn-validated': 'Service validé',
        'service-status-not-configured': 'Service non configuré',
        'service-status-incomplete': 'Service incomplet',
        'service-status-complete': 'Service complet - cliquez pour valider',
        'service-status-validated': 'Service validé et prêt',
        
        // Success message summary
        'summary-title': 'Résumé de votre demande',
        'summary-client-info': 'Informations client',
        'summary-name': 'Nom',
        'summary-phone': 'Téléphone',
        'summary-district': 'Quartier',
        'summary-date': 'Date',
        'summary-time': 'Créneau',
        'summary-services': 'Services demandés',
        'summary-additional': 'Informations complémentaires',
        'summary-photos': 'Photos',
        'summary-photos-count': 'photo(s) jointe(s)',
        'summary-comments': 'Commentaires'
    },
    ar: {
        // Navigation
        'nav-home': 'الرئيسية',
        'nav-services': 'خدماتنا',
        'nav-how': 'كيف يعمل',
        'nav-why': 'لماذا تختارنا',
        'nav-contact': 'اتصل بنا',

        // Hero Section
        'hero-subtitle': 'الاهتمام بالتفاصيل',
        'hero-title': 'رضاكم أولويتنا',
        'hero-cta': 'الحجز وطلب\nعرض الأسعار',

        // Services
        'services-title': 'خدماتنا',
        'services-subtitle': 'مرافقة مخصصة لراحتكم: خدمة البواب، الصيانة المهنية والخدمات الحصرية.',
        'service-concierge': 'خدمة البواب',
        'service-concierge-desc': 'تولي احتياجاتكم اليومية: إدارة المفاتيح، المساعدة اللوجستية، استقبال ومتابعة ضيوفكم.',
        'service-sofa-chair': 'تنظيف الأرائك / الكراسي',
        'service-sofa-chair-desc': 'تنظيف عميق يعيد البريق والنضارة لأقمشتكم ويطيل عمر مقاعدكم.',
        'service-chairs': 'تنظيف الكراسي',
        'service-chairs-desc': 'معالجة مناسبة لإزالة البقع والأوساخ، مع الحفاظ على راحة وجمالية كراسيكم.',
        'service-mattress': 'تنظيف المراتب',
        'service-mattress-desc': 'تطهير وتنظيف عميق لمراتبكم من أجل نوم صحي ونظيف.',
        'service-cleaning': 'تنظيف عادي',
        'service-cleaning-desc': 'صيانة منتظمة لمسكنكم بمنتجات مناسبة، لداخل نظيف ومريح يومياً.',
        'service-deep': 'تنظيف شامل',
        'service-deep-desc': 'خدمة كاملة ودقيقة لتنظيف عميق لجميع الغرف، مثالية قبل/بعد الأحداث.',

        // Video Section
        'video-title': 'اكتشف خبرتنا',
        'video-subtitle': 'شاهد فريقنا في العمل لخدمة ذات جودة مهنية.',
        'video-fallback': 'متصفحك لا يدعم تشغيل الفيديو.',
        'video-error': 'تعذر تحميل الفيديو. تحقق من اتصالك بالإنترنت.',

        // How It Works
        'how-title': 'الوصول إلى خدماتنا',
        'path-concierge-title': 'خدمة البواب',
        'concierge-step1-title': 'اتصل بنا',
        'concierge-step1-desc': 'أرسل لنا رسالة واتساب مباشرة',
        'concierge-step2-title': 'اشرح احتياجاتك',
        'concierge-step2-desc': 'صف احتياجاتك من خدمة البواب',
        'concierge-step3-title': 'تأكيد سريع',
        'concierge-step3-desc': 'نؤكد طلبك فوراً',
        'path-cleaning-title': 'خدمات التنظيف',
        'cleaning-step1-title': 'املأ النموذج',
        'cleaning-step1-desc': 'أكمل نموذج الحجز الخاص بنا',
        'cleaning-step2-title': 'أرسل الصور',
        'cleaning-step2-desc': 'أضف صوراً لعرض أسعار دقيق',
        'cleaning-step3-title': 'عرض الأسعار + التأكيد',
        'cleaning-step3-desc': 'احصل على عرض الأسعار وأكد موعدك',
        'contact-whatsapp': 'اتصل عبر الواتساب',
        'open-booking-form': 'افتح النموذج',

        // Why Choose Us
        'why-title': 'لماذا تختارنا؟',
        'feature-quality': 'جودة مضمونة',
        'feature-quality-desc': 'رضا العملاء مضمون مع فرقنا ذات الخبرة.',
        'feature-punctual': 'الالتزام بالمواعيد',
        'feature-punctual-desc': 'احترام المواعيد المتفق عليها وخدمة سريعة.',
        'feature-eco': 'منتجات صديقة للبيئة',
        'feature-eco-desc': 'استخدام منتجات صديقة للبيئة.',
        'feature-price': 'أسعار تنافسية',
        'feature-price-desc': 'أسعار شفافة وتنافسية في السوق.',

        // Reviews
        'reviews-title': 'آراء العملاء',
        'reviews-count': '127 رأي',
        'review-1': '"خدمة ممتازة! أريكتي أصبحت كالجديدة. الفريق محترف وملتزم بالمواعيد."',
        'review-2': '"راضٍ جداً عن التنظيف الشامل. تم تنظيف كل زاوية في المنزل بعناية."',
        'review-3': '"عمل ممتاز في تنظيف المراتب. خدمة سريعة وفعالة."',
        'review-4': '"فريق محترف جداً لتنظيف الكراسي. النتيجة مثالية!"',
        'review-5': '"خدمة تنظيف ممتازة. أنصح بشدة بـ Happy Stay!"',

        // Service Area
        'area-title': 'منطقة التدخل',
        'area-subtitle': 'نتدخل في جميع أنحاء أكادير ومنطقتها',

        // Instagram
        'instagram-follow': 'متابعة',

        // Footer
        'footer-desc': 'شريككم الموثوق لجميع احتياجاتكم من التنظيف في أكادير ومنطقتها.',
        'footer-contact': 'اتصل بنا',
        'phone-number': '063 988 7031',
        'footer-hours': 'ساعات العمل',
        'weekdays': 'الإثنين - السبت',
        'weekend': 'الأحد',
        'footer-services': 'الخدمات',
        'footer-service1': 'خدمة البواب',
        'footer-service2': 'تنظيف الأرائك/الكراسي',
        'footer-service3': 'تنظيف الكراسي',
        'footer-service4': 'تنظيف المراتب',
        'footer-service5': 'تنظيف عادي',
        'footer-service6': 'تنظيف شامل',
        'rights': 'جميع الحقوق محفوظة.',

        // Booking Form
        'booking-title': 'طلب عرض أسعار',
        'form-firstname': 'الاسم الأول *',
        'form-lastname': 'اللقب *',
        'form-district': 'الحي في أكادير *',
        'select-district': 'اختر حيك',
        'other-option': 'أخرى',
        'form-other-district': 'حدد حيك',
        'form-phone': 'رقم الهاتف *',
        'services-title-form': 'الخدمات المطلوبة *',
        'add-service': 'إضافة خدمة',
        'form-date': 'التاريخ المرغوب *',
        'form-time': 'الوقت المحدد *',
        'form-photos': 'الصور (2 إلى 4 إجبارية) *',
        'photos-help': 'أضف 2 إلى 4 صور (منظر عام + المناطق المراد معالجتها).',
        'gallery': 'المعرض',
        'camera': 'الكاميرا',
        'form-comments': 'معلومات إضافية (اختياري)',
        'comments-placeholder': 'مثال: مخمل بيج، بقعة قهوة، الطابق الثالث بدون مصعد، الاتصال الداخلي 12B، متاح بعد الساعة 13.',
        'form-comments-help': 'تفاصيل مفيدة لعرض الأسعار أو الوصول (نوع القماش/البقع، الطابق/المصعد، الرموز، الأوقات المتاحة...).',
        'form-submit': 'إرسال الطلب',
        'booking-success-title': 'تم إرسال الطلب بنجاح!',
        'booking-success-message': 'تم استلام طلب عرض الأسعار الخاص بك. سنتصل بك قريباً عبر الواتساب لإنهاء التفاصيل.',
        'close-modal': 'إغلاق',
        'contact-whatsapp-btn': 'اتصل بنا عبر الواتساب',
        
        // Services Cart
        'service-card-title': 'خدمة',
        'service-card-summary-config': 'جاري التكوين...',
        'service-card-summary-select': 'اختر نوع الخدمة',
        'service-type-label': 'نوع الخدمة *',
        'service-type-select': 'اختر خدمة',
        'service-type-sofa': 'أريكة/كرسي',
        'service-type-chairs': 'كراسي',
        'service-type-mattress': 'مرتبة',
        'sofa-size-label': 'الحجم *',
        'sofa-size-select': 'اختر',
        'sofa-size-1': 'مقعد واحد',
        'sofa-size-2': 'مقعدان',
        'sofa-size-3': '3 مقاعد',
        'sofa-size-angle': 'زاوية',
        'sofa-size-meridienne': 'ميريديان',
        'sofa-size-convertible': 'قابل للتحويل',
        'sofa-material-label': 'المادة',
        'sofa-material-select': 'اختر',
        'sofa-material-tissu': 'قماش',
        'sofa-material-velours': 'مخمل',
        'sofa-material-microfibre': 'ألياف دقيقة',
        'sofa-material-cuir': 'جلد',
        'sofa-material-simili': 'جلد صناعي',
        'sofa-stains-label': 'مستوى البقع',
        'sofa-stains-select': 'اختر',
        'sofa-stains-none': 'لا توجد',
        'sofa-stains-light': 'خفيفة',
        'sofa-stains-heavy': 'كثيرة',
        'quantity-label': 'الكمية *',
        'options-label': 'خيارات (اختيارية)',
        'option-anti-mites': 'مضاد للعث',
        'option-protection': 'حماية ضد البقع',
        'chair-material-label': 'المادة *',
        'chair-material-tissu': 'قماش',
        'chair-material-simili': 'جلد صناعي',
        'chair-material-wood': 'خشب + وسادة',
        'removable-cushion': 'وسادة قابلة للإزالة',
        'mattress-format-label': 'التنسيق *',
        'mattress-format-select': 'اختر',
        'mattress-faces-label': 'الوجوه *',
        'mattress-faces-select': 'اختر',
        'mattress-faces-1': 'وجه واحد',
        'mattress-faces-2': 'وجهان',
        'mattress-note-label': 'ملاحظة (اختيارية)',
        'mattress-note-placeholder': 'ملاحظة اختيارية',
        'validate-service-btn': 'تأكيد هذه الخدمة',
        'validate-service-btn-complete': 'إكمال الخدمة',
        'validate-service-btn-validated': 'تم تأكيد الخدمة',
        'service-status-not-configured': 'الخدمة غير مكونة',
        'service-status-incomplete': 'الخدمة غير مكتملة',
        'service-status-complete': 'الخدمة مكتملة - انقر للتأكيد',
        'service-status-validated': 'الخدمة مؤكدة وجاهزة',
        
        // Success message summary
        'summary-title': 'ملخص طلبك',
        'summary-client-info': 'معلومات العميل',
        'summary-name': 'الاسم',
        'summary-phone': 'الهاتف',
        'summary-district': 'الحي',
        'summary-date': 'التاريخ',
        'summary-time': 'الوقت',
        'summary-services': 'الخدمات المطلوبة',
        'summary-additional': 'معلومات إضافية',
        'summary-photos': 'الصور',
        'summary-photos-count': 'صورة مرفقة',
        'summary-comments': 'التعليقات'
    },
    en: {
        // Navigation
        'nav-home': 'Home',
        'nav-services': 'Our Services',
        'nav-how': 'How It Works',
        'nav-why': 'Why Choose Us',
        'nav-contact': 'Contact',

        // Hero Section
        'hero-subtitle': 'Attention to Detail',
        'hero-title': 'YOUR SATISFACTION, OUR PRIORITY',
        'hero-cta': 'Booking and\nQuote Request',

        // Services
        'services-title': 'Our Services',
        'services-subtitle': 'Personalized support for your comfort: concierge service, professional maintenance and exclusive services.',
        'service-concierge': 'Concierge Service',
        'service-concierge-desc': 'Taking care of your daily needs: key management, logistical assistance, welcoming and monitoring your guests.',
        'service-sofa-chair': 'Sofa / Chair Cleaning',
        'service-sofa-chair-desc': 'Deep cleaning that restores shine and freshness to your fabrics and extends the life of your seating.',
        'service-chairs': 'Chair Cleaning',
        'service-chairs-desc': 'Appropriate treatment to eliminate stains and dirt, while preserving the comfort and aesthetics of your chairs.',
        'service-mattress': 'Mattress Cleaning',
        'service-mattress-desc': 'Disinfection and deep cleaning of your mattresses for healthy and hygienic sleep.',
        'service-cleaning': 'Standard Cleaning',
        'service-cleaning-desc': 'Regular maintenance of your home with suitable products, for a clean and pleasant interior on a daily basis.',
        'service-deep': 'Deep Cleaning',
        'service-deep-desc': 'A complete and meticulous service for deep cleaning of all rooms, ideal before/after events.',

        // Video Section
        'video-title': 'Discover Our Expertise',
        'video-subtitle': 'See our team at work for professional quality service.',
        'video-fallback': 'Your browser does not support video playback.',
        'video-error': 'Unable to load video. Check your internet connection.',

        // How It Works
        'how-title': 'Access Our Services',
        'path-concierge-title': 'Concierge Service',
        'concierge-step1-title': 'Contact us',
        'concierge-step1-desc': 'Send us a WhatsApp message directly',
        'concierge-step2-title': 'Explain your needs',
        'concierge-step2-desc': 'Describe your concierge needs',
        'concierge-step3-title': 'Quick confirmation',
        'concierge-step3-desc': 'We confirm your request immediately',
        'path-cleaning-title': 'Cleaning Services',
        'cleaning-step1-title': 'Fill out the form',
        'cleaning-step1-desc': 'Complete our booking form',
        'cleaning-step2-title': 'Send photos',
        'cleaning-step2-desc': 'Add photos for an accurate quote',
        'cleaning-step3-title': 'Quote + Confirmation',
        'cleaning-step3-desc': 'Receive your quote and confirm your appointment',
        'contact-whatsapp': 'Contact on WhatsApp',
        'open-booking-form': 'Open the form',

        // Why Choose Us
        'why-title': 'Why Choose Us?',
        'feature-quality': 'Guaranteed Quality',
        'feature-quality-desc': 'Customer satisfaction guaranteed with our experienced teams.',
        'feature-punctual': 'Punctuality',
        'feature-punctual-desc': 'Respect for agreed schedules and fast service.',
        'feature-eco': 'Eco-friendly Products',
        'feature-eco-desc': 'Use of environmentally friendly products.',
        'feature-price': 'Competitive Prices',
        'feature-price-desc': 'Transparent and competitive prices in the market.',

        // Reviews
        'reviews-title': 'Customer Reviews',
        'reviews-count': '127 reviews',
        'review-1': '"Impeccable service! My sofa is like new. The team is professional and punctual."',
        'review-2': '"Very satisfied with the deep cleaning. Every corner of the house was cleaned with care."',
        'review-3': '"Excellent work on mattress cleaning. Fast and efficient service."',
        'review-4': '"Very professional team for chair cleaning. Perfect result!"',
        'review-5': '"Impeccable cleaning service. I highly recommend Happy Stay!"',

        // Service Area
        'area-title': 'Service Area',
        'area-subtitle': 'We operate throughout Agadir and its region',

        // Instagram
        'instagram-follow': 'Follow',

        // Footer
        'footer-desc': 'Your trusted partner for all your cleaning needs in Agadir and its region.',
        'footer-contact': 'Contact',
        'phone-number': '063 988 7031',
        'footer-hours': 'Hours',
        'weekdays': 'Mon - Sat',
        'weekend': 'Sunday',
        'footer-services': 'Services',
        'footer-service1': 'Concierge Service',
        'footer-service2': 'Sofa/Chair Cleaning',
        'footer-service3': 'Chair Cleaning',
        'footer-service4': 'Mattress Cleaning',
        'footer-service5': 'Standard Cleaning',
        'footer-service6': 'Deep Cleaning',
        'rights': 'All rights reserved.',

        // Booking Form
        'booking-title': 'Quote Request',
        'form-firstname': 'First Name *',
        'form-lastname': 'Last Name *',
        'form-district': 'District in Agadir *',
        'select-district': 'Select your district',
        'other-option': 'Other',
        'form-other-district': 'Specify your district',
        'form-phone': 'Phone Number *',
        'services-title-form': 'Requested Services *',
        'add-service': 'Add a service',
        'form-date': 'Desired Date *',
        'form-time': 'Time Slot *',
        'form-photos': 'Photos (2 to 4 required) *',
        'photos-help': 'Add 2 to 4 photos (overview + areas to be treated).',
        'gallery': 'Gallery',
        'camera': 'Camera',
        'form-comments': 'Additional Information (optional)',
        'comments-placeholder': 'Ex.: beige velvet, coffee stain, 3rd floor no elevator, intercom 12B, available after 1pm.',
        'form-comments-help': 'Useful details for quote or access (fabric/stains, floor/elevator, codes, availability...).',
        'form-submit': 'Send Request',
        'booking-success-title': 'Request sent successfully!',
        'booking-success-message': 'Your quote request has been received. We will contact you very soon on WhatsApp to finalize the details.',
        'close-modal': 'Close',
        'contact-whatsapp-btn': 'Contact us on WhatsApp',
        
        // Services Cart
        'service-card-title': 'Service',
        'service-card-summary-config': 'Configuration in progress...',
        'service-card-summary-select': 'Select a service type',
        'service-type-label': 'Service type *',
        'service-type-select': 'Select a service',
        'service-type-sofa': 'Sofa/Chair',
        'service-type-chairs': 'Chairs',
        'service-type-mattress': 'Mattress',
        'sofa-size-label': 'Size *',
        'sofa-size-select': 'Select',
        'sofa-size-1': '1 seat',
        'sofa-size-2': '2 seats',
        'sofa-size-3': '3 seats',
        'sofa-size-angle': 'Corner',
        'sofa-size-meridienne': 'Chaise lounge',
        'sofa-size-convertible': 'Convertible',
        'sofa-material-label': 'Material',
        'sofa-material-select': 'Select',
        'sofa-material-tissu': 'Fabric',
        'sofa-material-velours': 'Velvet',
        'sofa-material-microfibre': 'Microfiber',
        'sofa-material-cuir': 'Leather',
        'sofa-material-simili': 'Faux leather',
        'sofa-stains-label': 'Stain level',
        'sofa-stains-select': 'Select',
        'sofa-stains-none': 'None',
        'sofa-stains-light': 'Light',
        'sofa-stains-heavy': 'Heavy',
        'quantity-label': 'Quantity *',
        'options-label': 'Options (optional)',
        'option-anti-mites': 'Anti-mites',
        'option-protection': 'Stain protection',
        'chair-material-label': 'Material *',
        'chair-material-tissu': 'Fabric',
        'chair-material-simili': 'Faux leather',
        'chair-material-wood': 'Wood + cushion',
        'removable-cushion': 'Removable cushion',
        'mattress-format-label': 'Format *',
        'mattress-format-select': 'Select',
        'mattress-faces-label': 'Faces *',
        'mattress-faces-select': 'Select',
        'mattress-faces-1': '1 face',
        'mattress-faces-2': '2 faces',
        'mattress-note-label': 'Note (optional)',
        'mattress-note-placeholder': 'Optional note',
        'validate-service-btn': 'Validate this service',
        'validate-service-btn-complete': 'Complete the service',
        'validate-service-btn-validated': 'Service validated',
        'service-status-not-configured': 'Service not configured',
        'service-status-incomplete': 'Service incomplete',
        'service-status-complete': 'Service complete - click to validate',
        'service-status-validated': 'Service validated and ready',
        
        // Success message summary
        'summary-title': 'Summary of your request',
        'summary-client-info': 'Client information',
        'summary-name': 'Name',
        'summary-phone': 'Phone',
        'summary-district': 'District',
        'summary-date': 'Date',
        'summary-time': 'Time slot',
        'summary-services': 'Requested services',
        'summary-additional': 'Additional information',
        'summary-photos': 'Photos',
        'summary-photos-count': 'photo(s) attached',
        'summary-comments': 'Comments'
    }
};



// Initialisation au chargement de la page


document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});




function initializeApp() {
    // Initialiser les composants
    initializeLanguage();
    initializeNavigation();
    initializeHero();
    initializeVideo();
    initializeReviews();
    initializeInstagram();
    initializeBookingModal();
    initializeMap();
    
    console.log('Happy Stay - Application initialisée');
}

// ===== GESTION DES LANGUES =====
function initializeLanguage() {
    // Détecter la langue du navigateur
    const browserLang = navigator.language.substring(0, 2);
    if (translations[browserLang]) {
        currentLanguage = browserLang;
    }
    
    // Appliquer la langue
    changeLanguage(currentLanguage);
    
    // Ajouter les événements pour les boutons de langue
    document.querySelectorAll('[data-lang-code]').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang-code');
            changeLanguage(lang);
        });
    });
}

function changeLanguage(lang) {
    if (!translations[lang]) return;
    
    currentLanguage = lang;
    
    // Mettre à jour tous les éléments avec data-lang
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[lang][key]) {
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translations[lang][key];
            } else if (element.tagName === 'TEXTAREA') {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });
    
    // Gérer le RTL pour l'arabe
    if (lang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.body.classList.add('rtl');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.body.classList.remove('rtl');
    }
    
    // Mettre à jour les boutons actifs
    document.querySelectorAll('[data-lang-code]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang-code') === lang);
    });
    
    // Mettre à jour les boutons du dropdown mobile
    document.querySelectorAll('.lang-dropdown-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    
    // Mettre à jour les titres des services avec l'ID
    document.querySelectorAll('.service-title').forEach(title => {
        const serviceCard = title.closest('.service-card');
        if (serviceCard) {
            const serviceId = serviceCard.id.replace('service-', '');
            title.textContent = `${translations[lang]['service-card-title']} ${serviceId}`;
        }
    });
    
    // Émettre un événement pour les autres composants
    document.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language: lang }
    }));
    
    console.log(`Langue changée vers: ${lang}`);
}

// ===== NAVIGATION =====
function initializeNavigation() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
        
        // Fermer le menu mobile lors du clic sur un lien
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }
    
    // Smooth scroll pour les liens d'ancrage
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== HERO SECTION =====
function initializeHero() {
    const heroBtn = document.querySelector('.hero-cta');
    if (heroBtn) {
        heroBtn.addEventListener('click', function() {
            openBookingModal();
        });
    }
}

// ===== VIDEO =====
function initializeVideo() {
    const video = document.getElementById('presentation-video');
    const errorDiv = document.getElementById('video-error');
    
    if (video && errorDiv) {
        video.addEventListener('error', function() {
            video.style.display = 'none';
            errorDiv.style.display = 'flex';
        });
        
        video.addEventListener('loadeddata', function() {
            errorDiv.style.display = 'none';
            video.style.display = 'block';
        });
    }
}

// ===== AVIS CLIENTS (CAROUSEL) =====
function initializeReviews() {
    const track = document.querySelector('.reviews-track');
    const cards = document.querySelectorAll('.review-card');
    const indicators = document.querySelectorAll('.carousel-indicators .indicator');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    if (!track || !cards.length) return;
    
    function showReview(index) {
        // Mettre à jour les cartes
        cards.forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });
        
        // Mettre à jour les indicateurs
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        // Déplacer le track
        const offset = -index * 100;
        track.style.transform = `translateX(${offset}%)`;
        
        currentReviewIndex = index;
    }
    
    function nextReview() {
        const nextIndex = (currentReviewIndex + 1) % cards.length;
        showReview(nextIndex);
    }
    
    function prevReview() {
        const prevIndex = (currentReviewIndex - 1 + cards.length) % cards.length;
        showReview(prevIndex);
    }
    
    // Événements des boutons
    if (nextBtn) nextBtn.addEventListener('click', nextReview);
    if (prevBtn) prevBtn.addEventListener('click', prevReview);
    
    // Événements des indicateurs
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => showReview(index));
    });
    
    // Auto-play
    function startAutoPlay() {
        reviewInterval = setInterval(nextReview, 5000);
    }
    
    function stopAutoPlay() {
        if (reviewInterval) {
            clearInterval(reviewInterval);
        }
    }
    
    // Démarrer l'auto-play
    startAutoPlay();
    
    // Pause au hover
    const carousel = document.querySelector('.reviews-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
    }
}

// ===== INSTAGRAM CAROUSEL =====
function initializeInstagram() {
    const track = document.querySelector('.instagram-posts-track');
    const posts = document.querySelectorAll('.instagram-post');
    const prevBtn = document.querySelector('.instagram-prev');
    const nextBtn = document.querySelector('.instagram-next');
    
    if (!track || !posts.length) return;
    
    let currentIndex = 0;
    const postsPerView = window.innerWidth <= 768 ? 1 : 3;
    const maxIndex = Math.max(0, posts.length - postsPerView);
    
    function updateCarousel() {
        const offset = -currentIndex * (100 / postsPerView);
        track.style.transform = `translateX(${offset}%)`;
        
        // Mettre à jour les boutons
        if (prevBtn) prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        if (nextBtn) nextBtn.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (currentIndex < maxIndex) {
                currentIndex++;
                updateCarousel();
            }
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });
    }
    
    // Initialiser
    updateCarousel();
    
    // Réajuster au redimensionnement
    window.addEventListener('resize', function() {
        const newPostsPerView = window.innerWidth <= 768 ? 1 : 3;
        if (newPostsPerView !== postsPerView) {
            location.reload(); // Simple reload pour recalculer
        }
    });
}

// ===== MODAL DE RÉSERVATION =====
function initializeBookingModal() {
    const modal = document.getElementById('booking-modal');
    const form = document.getElementById('booking-form');
    const closeBtn = document.querySelector('.booking-modal-close');
    const backdrop = document.querySelector('.booking-modal-backdrop');
    
    // Fermeture du modal
    if (closeBtn) closeBtn.addEventListener('click', closeBookingModal);
    if (backdrop) backdrop.addEventListener('click', closeBookingModal);
    
    // Gestion du formulaire
    if (form) {
        initializeBookingForm();
    }
    
    // Initialiser les nouveaux composants
    initializeNewBookingComponents();
}

function initializeNewBookingComponents() {
    // Les composants sont initialisés automatiquement via leurs scripts
    // Mais on peut ajouter des configurations spécifiques ici si nécessaire
    // Initialiser le panier de services une seule fois
    if (!window.servicesCart || !window.servicesCart.initialized) {
        window.servicesCart = new ServicesCart();
        window.servicesCart.init();
        console.log('ServicesCart créé et initialisé');
    } else {
        console.log('ServicesCart déjà initialisé, réutilisation');
    }
    
    // Initialiser l'uploader de photos
    if (!window.photosUploader) {
        window.photosUploader = new PhotosUploader();
        console.log('PhotosUploader créé');
    }
    
    // Initialiser la validation
    if (!window.formValidation) {
        window.formValidation = new FormValidation();
        console.log('FormValidation créé');
    }
    
    
    
    
    
    
// Configurer la date (min + valeur par défaut)
const dateInput = document.getElementById('date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;

  // 👉 Définir la valeur par défaut si vide
  if (!dateInput.value) {
    dateInput.value = today;
  }

  // Mettre à jour les créneaux quand la date change
  dateInput.addEventListener('change', function () {
    if (window.formValidation && typeof window.formValidation.updateAvailableSlots === 'function') {
      window.formValidation.updateAvailableSlots();
    }
  });

  // 👉 Déclencher un premier calcul des créneaux si nécessaire
  if (window.formValidation && typeof window.formValidation.updateAvailableSlots === 'function') {
    window.formValidation.updateAvailableSlots();
  }
}
    
    
    
    
    
    
    
    // Configurer le téléphone avec +212 par défaut
    const phoneInput = document.getElementById('phone');
    if (phoneInput && !phoneInput.value) {
        phoneInput.value = '+212';
    }
    
    // Ajouter un service par défaut après un délai pour s'assurer que tout est chargé
    setTimeout(() => {
        console.log('Vérification du panier de services...');
        if (window.servicesCart && window.servicesCart.initialized) {
            if (window.servicesCart.services.length === 0) {
                console.log('Ajout d\'un service par défaut');
                window.servicesCart.addService();
            } else {
                console.log('Services déjà présents:', window.servicesCart.services.length);
            }
        } else {
            console.log('ServicesCart non disponible ou non initialisé');
        }
    }, 1000);
}

function openBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Réinitialiser le formulaire
        resetBookingForm();
    }
}

function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function initializeBookingForm() {
    // Nouvelle gestion simplifiée du formulaire
    const form = document.getElementById('booking-form');
    if (form) {
        form.addEventListener('submit', handleBookingSubmission);
    }
    
    // Gestion des créneaux horaires
    setupTimeSlots();
    
    // Gestion du quartier "Autre"
    setupDistrictSelector();
    
    // Gestion des commentaires
    setupCommentsCounter();
    
    // Ajouter un service par défaut si le panier est vide
    setTimeout(() => {
        if (window.servicesCart && window.servicesCart.services.length === 0) {
            window.servicesCart.addService();
        }
    }, 100);
}

function setupTimeSlots() {
    const timeSlots = document.querySelectorAll('.time-slot');
    const selectedTimeInput = document.getElementById('selectedTime');
    
    timeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            if (this.disabled) return;
            
            timeSlots.forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
            if (selectedTimeInput) {
                selectedTimeInput.value = this.dataset.time;
            }
        });
    });
}

function setupDistrictSelector() {
    const districtSelect = document.getElementById('district');
    const otherDistrictGroup = document.getElementById('other-district-group');
    
    if (districtSelect && otherDistrictGroup) {
        districtSelect.addEventListener('change', function() {
            if (this.value === 'Autre') {
                otherDistrictGroup.style.display = 'block';
                document.getElementById('otherDistrict').required = true;
            } else {
                otherDistrictGroup.style.display = 'none';
                document.getElementById('otherDistrict').required = false;
            }
        });
    }
}

function setupCommentsCounter() {
    const commentsTextarea = document.getElementById('comments');
    const commentsCounter = document.getElementById('comments-count');
    
    if (commentsTextarea && commentsCounter) {
        commentsTextarea.addEventListener('input', function() {
            const count = this.value.length;
            commentsCounter.textContent = `${count}/600`;
            
            if (count > 600) {
                commentsCounter.style.color = '#dc3545';
            } else if (count > 500) {
                commentsCounter.style.color = '#ffc107';
            } else {
                commentsCounter.style.color = '#6c757d';
            }
        });
    }
}




async function handleBookingSubmission(event) {
    event.preventDefault();
    
    console.log('Soumission du formulaire déclenchée');
    
    // Valider le formulaire
    if (window.formValidation && !window.formValidation.validateForm()) {
        console.log('Validation échouée');
        return;
    }
    
    // Générer le payload
    const payload = generateBookingPayload();
    
    if (!payload) {
        console.error('Erreur lors de la génération du payload');
        showBookingError('Erreur lors de la préparation des données');
        return;
    }
    
    console.log('Payload généré:', payload);
    
    try {
        // 👉 Envoi direct vers Supabase via dataLayer
        const result = await dataLayer.createReservation(payload);

        if (result && result.success) {
            showBookingSuccess();
            console.log('Réservation créée en DB:', result);
        } else {
            console.error('Erreur lors de la création en DB:', result);
            showBookingError('Erreur lors de l\'enregistrement en base');
        }
    } catch (err) {
        console.error('Exception lors de la création de la réservation:', err);
        showBookingError('Erreur de communication avec la base');
    }
}








function generateBookingPayload() {
    try {
        // Récupérer les données du formulaire
        const firstName = document.getElementById('firstName')?.value?.trim();
        const lastName = document.getElementById('lastName')?.value?.trim();
        const phone = document.getElementById('phone')?.value?.trim();
        const district = document.getElementById('district')?.value;
        const otherDistrict = document.getElementById('otherDistrict')?.value?.trim();
        const date = document.getElementById('date')?.value;
        const time = document.getElementById('selectedTime')?.value;
        const comments = document.getElementById('comments')?.value?.trim();
        
        console.log('Données formulaire récupérées:', {
            firstName, lastName, phone, district, date, time
        });
        
        // Récupérer les services
        const items = window.servicesCart ? window.servicesCart.generatePayloadItems() : [];
        console.log('Services récupérés:', items);
        
        // Récupérer les photos
        const photos = window.photosUploader ? 
            window.photosUploader.getPhotos().map(photo => ({
                name: photo.name,
                size: photo.size,
                type: photo.type || 'image/jpeg'
            })) : [];
        console.log('Photos récupérées:', photos.length);
        
        // Construire le payload
        const payload = {
            firstName,
            lastName,
            phone,
            district: district === 'Autre' ? otherDistrict : district,
            date,
            time,
            items,
            photos,
            comments: comments || null
        };
        
        return payload;
    } catch (error) {
        console.error('Erreur lors de la génération du payload:', error);
        return null;
    }
}

function showBookingSuccess() {
    const form = document.getElementById('booking-form');
    const statusMessage = document.getElementById('booking-status-message');
    
    if (form && statusMessage) {
        form.style.display = 'none';
        
        statusMessage.style.display = 'block';
        
        // Générer et afficher le résumé après un court délai
        setTimeout(() => {
            const summaryContainer = document.getElementById('booking-summary');
            if (summaryContainer) {
                const summaryHTML = generateBookingSummary();
                console.log('Résumé généré:', summaryHTML);
                summaryContainer.innerHTML = summaryHTML;
            } else {
                console.error('Conteneur booking-summary non trouvé');
            }
        }, 100);
    }
}

function generateBookingSummary() {
    try {
        // Récupérer les données du formulaire
        const firstName = document.getElementById('firstName')?.value?.trim();
        const lastName = document.getElementById('lastName')?.value?.trim();
        const phone = document.getElementById('phone')?.value?.trim();
        const district = document.getElementById('district')?.value;
        const otherDistrict = document.getElementById('otherDistrict')?.value?.trim();
        const date = document.getElementById('date')?.value;
        const time = document.getElementById('selectedTime')?.value;
        const comments = document.getElementById('comments')?.value?.trim();
        
        // Récupérer les services
        const services = window.servicesCart ? window.servicesCart.services : [];
        
        // Récupérer les photos
        const photosCount = window.photosUploader ? window.photosUploader.getPhotos().length : 0;
        
        // Formater la date
        let formattedDate = date;
        if (date) {
            const dateObj = new Date(date);
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            const locale = currentLanguage === 'ar' ? 'ar-MA' : currentLanguage === 'en' ? 'en-US' : 'fr-FR';
            formattedDate = dateObj.toLocaleDateString(locale, options);
        }
        
        // Obtenir les traductions pour la langue actuelle
        const t = translations[currentLanguage] || translations.fr;
        
        // Construire le HTML du résumé
        let summaryHTML = `
            <div class="booking-summary-content">
                <h4>📋 ${t['summary-title']}</h4>
                
                <div class="summary-section">
                    <h5>👤 ${t['summary-client-info']}</h5>
                    <p><strong>${t['summary-name']} :</strong> ${firstName} ${lastName}</p>
                    <p><strong>${t['summary-phone']} :</strong> ${phone}</p>
                    <p><strong>${t['summary-district']} :</strong> ${district === 'Autre' ? otherDistrict : district}</p>
                    <p><strong>${t['summary-date']} :</strong> ${formattedDate}</p>
                    <p><strong>${t['summary-time']} :</strong> ${time}</p>
                </div>
        `;
        
        // Ajouter les services
        if (services.length > 0) {
            summaryHTML += `
                <div class="summary-section">
                    <h5>🛠️ ${t['summary-services']}</h5>
            `;
            
            services.forEach((service, index) => {
                let serviceText = service.type;
                
                if (service.quantity > 1) {
                    serviceText += ` (${service.quantity}x)`;
                }
                
                if (service.material) {
                    serviceText += ` en ${service.material}`;
                }
                
                if (service.details) {
                    serviceText += ` - ${service.details}`;
                }
                
                if (service.options && service.options.length > 0) {
                    serviceText += ` + ${service.options.join(' + ')}`;
                }
                
                if (service.remarks) {
                    serviceText += ` (${service.remarks})`;
                }
                
                summaryHTML += `<p>• ${serviceText}</p>`;
            });
            
            summaryHTML += `</div>`;
        }
        
        // Ajouter photos et commentaires
        if (photosCount > 0 || comments) {
            summaryHTML += `
                <div class="summary-section">
                    <h5>📷 ${t['summary-additional']}</h5>
            `;
            
            if (photosCount > 0) {
                summaryHTML += `<p><strong>${t['summary-photos']} :</strong> ${photosCount} ${t['summary-photos-count']}</p>`;
            }
            
            if (comments) {
                summaryHTML += `
                    <div class="comments-box">
                        <strong>${t['summary-comments']} :</strong><br>
                        ${comments}
                    </div>
                `;
            }
            
            summaryHTML += `</div>`;
        }
        
        summaryHTML += `</div>`;
        
        return summaryHTML;
        
    } catch (error) {
        console.error('Erreur lors de la génération du résumé:', error);
        return '<p>Erreur lors de la génération du résumé</p>';
    }
}

function showBookingError(message) {
    if (window.formValidation) {
        window.formValidation.showGlobalError(message);
    } else {
        alert(message);
    }
}

function resetBookingForm() {
    const form = document.getElementById('booking-form');
    const statusMessage = document.getElementById('booking-status-message');
    
    if (form) {
        form.reset();
        form.style.display = 'block';
    }
    
    if (statusMessage) {
        statusMessage.style.display = 'none';
    }
    
    // Réinitialiser les composants
    if (window.servicesCart) {
        window.servicesCart.reset();
    }
    
    if (window.photosUploader) {
        window.photosUploader.reset();
    }
    
    if (window.formValidation) {
        window.formValidation.reset();
    }
    
    // Réinitialiser les champs spéciaux
    resetSpecialFields();
}

function resetSpecialFields() {
    // Réinitialiser le téléphone avec +212
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.value = '+212';
    }
    
    // Masquer le champ "Autre quartier"
    const otherDistrictGroup = document.getElementById('other-district-group');
    if (otherDistrictGroup) {
        otherDistrictGroup.style.display = 'none';
        const otherDistrictInput = document.getElementById('otherDistrict');
        if (otherDistrictInput) {
            otherDistrictInput.required = false;
        }
    }
    
    // Réinitialiser le compteur de commentaires
    const commentsCounter = document.getElementById('comments-count');
    if (commentsCounter) {
        commentsCounter.textContent = '0/600';
        commentsCounter.style.color = '#6c757d';
    }
    
    // Réinitialiser les créneaux horaires
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    const selectedTimeInput = document.getElementById('selectedTime');
    if (selectedTimeInput) {
        selectedTimeInput.value = '';
    }
}

// ===== CARTE GOOGLE MAPS =====
function initializeMap() {
    // Fallback vers une carte statique si Google Maps n'est pas disponible
    initializeMapFallback();
}

function initializeMapFallback() {
    const mapContainer = document.getElementById('google-map');
    if (!mapContainer) return;
    
    // Créer une carte statique avec les quartiers d'Agadir
    mapContainer.innerHTML = `
        <div class="static-map">
            <div class="map-header">
                <h3>Zones d'intervention à Agadir</h3>
            </div>
            <div class="districts-grid">
                <div class="district-item">📍 Al Houda</div>
                <div class="district-item">📍 Anza</div>
                <div class="district-item">📍 Bensergao</div>
                <div class="district-item">📍 Dakhla</div>
                <div class="district-item">📍 Founty</div>
                <div class="district-item">📍 Hay Mohammadi</div>
                <div class="district-item">📍 Sonaba</div>
                <div class="district-item">📍 Taghazout</div>
                <div class="district-item">📍 Talborjt</div>
                <div class="district-item">📍 Tikiouine</div>
            </div>
            <div class="map-footer">
                <p>Et bien d'autres quartiers dans la région d'Agadir</p>
            </div>
        </div>
    `;
}

// Fonction globale pour Google Maps (si l'API est chargée)
window.initializeGoogleMap = function() {
    const mapContainer = document.getElementById('google-map');
    if (!mapContainer) return;
    
    const agadirCenter = { lat: 30.4278, lng: -9.5981 };
    
    const map = new google.maps.Map(mapContainer, {
        zoom: 11,
        center: agadirCenter,
        styles: [
            {
                featureType: 'all',
                elementType: 'geometry.fill',
                stylers: [{ color: '#f8f9fa' }]
            }
        ]
    });
    
    // Ajouter des marqueurs pour les principales zones
    const districts = [
        { name: 'Agadir Centre', lat: 30.4278, lng: -9.5981 },
        { name: 'Founty', lat: 30.4089, lng: -9.5844 },
        { name: 'Anza', lat: 30.3847, lng: -9.5364 },
        { name: 'Talborjt', lat: 30.4456, lng: -9.6178 }
    ];
    
    districts.forEach(district => {
        new google.maps.Marker({
            position: { lat: district.lat, lng: district.lng },
            map: map,
            title: district.name,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#007BFF"/>
                        <circle cx="12" cy="9" r="2.5" fill="white"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(24, 24)
            }
        });
    });
};

// Fonction de fallback si Google Maps échoue
window.initializeMapFallback = initializeMapFallback;

// Export des fonctions globales nécessaires
window.changeLanguage = changeLanguage;
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;

// Fonction pour le sélecteur de langue mobile
window.toggleLanguageDropdown = function() {
    const dropdown = document.getElementById('language-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
};

// Fermer le dropdown si on clique ailleurs
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('language-dropdown');
    const globeButton = document.querySelector('.globe-button');
    
    if (dropdown && globeButton && !globeButton.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// --- Dispo des créneaux : grisage automatique ---
import { dataLayer } from './js/data-layer/index.js';

(function initSlotAvailability() {
  const dateInput = document.querySelector('#date');          // <input type="date" id="date">
  const slotsWrap = document.querySelector('.time-slots');    // conteneur des 3 boutons
  if (!dateInput || !slotsWrap) return;

  const buttons = [...slotsWrap.querySelectorAll('.time-slot')]; // 3 boutons
  const mapBtn  = Object.fromEntries(buttons.map(b => [b.dataset.time, b]));
  const hidden  = document.querySelector('#selectedTime');        // <input type="hidden" id="selectedTime">

  // Rafraîchir quand on ouvre le modal (ton bouton .hero-cta ouvre le modal)
  document.querySelector('.hero-cta')?.addEventListener('click', refreshSlots);

  // Rafraîchir quand la date change
  dateInput.addEventListener('change', refreshSlots);

  // Premier passage si la date est déjà remplie
  if (dateInput.value) refreshSlots();

  async function refreshSlots() {
    const ymd = dateInput.value;
    if (!ymd) return;

    // Dimanche => tout grisé
    if (new Date(ymd).getDay() === 0) {
      setAll(true, 'Dimanche (fermé)');
      clearSelectedIfDisabled();
      return;
    }

    try {
      const slots  = await dataLayer.getSlotsForDate(ymd);
      const byTime = Object.fromEntries(slots.map(s => [s.time, s]));

      setDisabled('10:30', isNotFree(byTime['10:30']), reason(byTime['10:30']));
      setDisabled('13:30', isNotFree(byTime['13:30']), reason(byTime['13:30']));
      setDisabled('15:30', isNotFree(byTime['15:30']), reason(byTime['15:30']));

      clearSelectedIfDisabled();
    } catch (e) {
      console.error('refreshSlots', e);
      setAll(true, 'Indisponible pour le moment');
      clearSelectedIfDisabled();
    }
  }

  function isNotFree(slot) {
    return !slot || slot.blocked || (slot.available ?? 0) <= 0;
  }
  function reason(slot) {
    if (!slot) return 'Indisponible';
    if (slot.blocked) return 'Créneau bloqué';
    if ((slot.available ?? 0) <= 0) return 'Déjà réservé';
    return '';
  }

  function setAll(disabled, title='') { buttons.forEach(b => toggle(b, disabled, title)); }
  function setDisabled(hhmm, disabled, title='') { const b = mapBtn[hhmm]; if (b) toggle(b, disabled, title); }
  function toggle(btn, disabled, title) {
    btn.toggleAttribute('disabled', disabled);
    btn.classList.toggle('unavailable', disabled); // ta CSS gère déjà .time-slot.unavailable
    btn.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    btn.title = disabled ? title : '';
  }
  function clearSelectedIfDisabled() {
    const selected = buttons.find(b => b.classList.contains('selected'));
    if (selected && selected.hasAttribute('disabled')) {
      selected.classList.remove('selected');
      if (hidden?.value === selected.dataset.time) hidden.value = '';
    }
  }
})();

