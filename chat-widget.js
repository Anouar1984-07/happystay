// Happy Stay Chat Widget
// Widget de chat moderne avec support multilingue et API mock

class ChatWidget {
    constructor() {
        this.isOpen = false;
        this.sessionId = this.getOrCreateSessionId();
        this.currentLanguage = 'fr';
        this.messages = [];
        this.chatApi = new ChatApi();
        this.welcomeMessageSent = false;
        
        this.init();
    }

    init() {
        this.createWidget();
        this.setupEventListeners();
        this.detectLanguage();
        
        // Envoyer le message de bienvenue après un court délai
        setTimeout(() => {
            if (!this.welcomeMessageSent) {
                this.sendWelcomeMessage();
                this.welcomeMessageSent = true;
            }
        }, 1000);
    }

    getOrCreateSessionId() {
        let sessionId = localStorage.getItem('happystay_chat_session');
        if (!sessionId) {
            sessionId = this.generateUUID();
            localStorage.setItem('happystay_chat_session', sessionId);
        }
        return sessionId;
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    detectLanguage() {
        // Détecter la langue actuelle depuis le script principal
        if (typeof window !== 'undefined' && window.currentLanguage) {
            this.currentLanguage = window.currentLanguage;
        }
        
        // Vérifier aussi la variable globale currentLanguage du script principal
        if (typeof currentLanguage !== 'undefined') {
            this.currentLanguage = currentLanguage;
        }
        
        // Écouter les changements de langue
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language;
            this.updateLanguage();
        });
        
        // Mettre à jour immédiatement l'interface
        this.updateLanguage();
    }

    createWidget() {
        const widgetHTML = `
            <div class="happystay-chat-widget">
                <!-- Bouton flottant -->
                <div class="chat-bubble" id="chat-bubble">
                    <i class="fas fa-comments"></i>
                    <div class="chat-notification" id="chat-notification">1</div>
                </div>
                
                <!-- Panneau de chat -->
                <div class="chat-panel" id="chat-panel">
                    <div class="chat-header">
                        <div class="chat-header-content">
                            <div class="chat-title">Chat Happy Stay</div>
                            <div class="chat-subtitle" id="chat-subtitle">
                                Posez votre question (FR / العربية / EN)
                            </div>
                        </div>
                        <button class="chat-close" id="chat-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="chat-body" id="chat-body">
                        <div class="chat-messages" id="chat-messages">
                            <!-- Messages seront ajoutés ici -->
                        </div>
                    </div>
                    
                    <div class="chat-suggestions" id="chat-suggestions">
                        <!-- Suggestions seront ajoutées ici -->
                    </div>
                    
                    <div class="chat-input-container">
                        <div class="chat-input-wrapper">
                            <input 
                                type="text" 
                                class="chat-input" 
                                id="chat-input" 
                                placeholder="Tapez votre message..."
                                maxlength="500"
                            >
                            <button class="chat-send" id="chat-send">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', widgetHTML);
    }

    setupEventListeners() {
        const bubble = document.getElementById('chat-bubble');
        const closeBtn = document.getElementById('chat-close');
        const sendBtn = document.getElementById('chat-send');
        const input = document.getElementById('chat-input');

        bubble.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.closeChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Fermer le chat en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            const widget = document.querySelector('.happystay-chat-widget');
            if (this.isOpen && !widget.contains(e.target)) {
                this.closeChat();
            }
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const panel = document.getElementById('chat-panel');
        const bubble = document.getElementById('chat-bubble');
        const notification = document.getElementById('chat-notification');
        
        this.isOpen = true;
        panel.classList.add('open');
        bubble.classList.add('active');
        
        // Masquer la notification
        if (notification) {
            notification.style.display = 'none';
        }
        
        // Focus sur l'input
        setTimeout(() => {
            document.getElementById('chat-input').focus();
        }, 300);
    }

    closeChat() {
        const panel = document.getElementById('chat-panel');
        const bubble = document.getElementById('chat-bubble');
        
        this.isOpen = false;
        panel.classList.remove('open');
        bubble.classList.remove('active');
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Ajouter le message utilisateur
        this.addMessage(message, 'user');
        input.value = '';
        
        // Masquer les suggestions
        this.hideSuggestions();
        
        // Afficher l'indicateur de frappe
        this.showTypingIndicator();
        
        try {
            // Envoyer à l'API mock
            const response = await this.chatApi.send(message, this.sessionId, this.currentLanguage);
            
            // Masquer l'indicateur de frappe
            this.hideTypingIndicator();
            
            if (response.success) {
                this.addMessage(response.message, 'bot');
                
                // Afficher les suggestions si disponibles
                if (response.suggestions && response.suggestions.length > 0) {
                    this.showSuggestions(response.suggestions);
                }
                
                // Afficher les actions si disponibles
                if (response.actions && response.actions.length > 0) {
                    this.showActions(response.actions);
                }
            } else {
                // Erreur ou pas de réponse, afficher le message d'erreur
                this.addMessage(response.message, 'bot');
                
                // Afficher les options de contact par défaut
                if (!response.suggestions || response.suggestions.length === 0) {
                    this.showContactOptions();
                } else {
                    this.showSuggestions(response.suggestions);
                }
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage(this.getTranslation('error_message'), 'bot');
        }
    }

    addMessage(text, type) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = text;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll vers le bas
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Stocker le message
        this.messages.push({ text, type, timestamp: new Date() });
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    showSuggestions(suggestions) {
        const suggestionsContainer = document.getElementById('chat-suggestions');
        suggestionsContainer.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const chip = document.createElement('button');
            chip.className = 'suggestion-chip';
            chip.textContent = suggestion;
            chip.addEventListener('click', () => {
                document.getElementById('chat-input').value = suggestion;
                this.sendMessage();
            });
            suggestionsContainer.appendChild(chip);
        });
        
        suggestionsContainer.style.display = 'flex';
    }

    hideSuggestions() {
        const suggestionsContainer = document.getElementById('chat-suggestions');
        suggestionsContainer.style.display = 'none';
    }

    showActions(actions) {
        // Trier les actions par priorité
        const sortedActions = actions.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
        });

        // Créer un message avec les actions
        const messagesContainer = document.getElementById('chat-messages');
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'chat-message bot actions-message';
        
        const actionsContent = sortedActions.map(action => {
            const priorityClass = action.priority === 'high' ? 'primary' : 
                                action.priority === 'low' ? 'secondary' : 'default';
            
            // Déterminer l'icône et le sous-titre
            let icon, subtitle;
            
            if (action.type === 'tel') {
                icon = 'fas fa-phone';
                subtitle = 'Appel direct';
            } else if (action.type === 'email') {
                icon = 'fas fa-envelope';
                subtitle = 'Envoyer un email';
            } else if (action.url.includes('whatsapp') || action.url.includes('wa.me')) {
                icon = 'fab fa-whatsapp';
                subtitle = 'Réponse rapide garantie';
            } else if (action.url.includes('booking') || action.url.includes('reservation') || action.url.includes('formulaire')) {
                icon = 'fas fa-calendar-plus';
                subtitle = 'Devis gratuit en 24h';
            } else {
                icon = 'fas fa-external-link-alt';
                subtitle = 'Ouvrir le lien';
            }
            
            const target = action.type === 'tel' || action.type === 'email' ? '' : 'target="_blank"';
            
            return `<a href="${action.url}" ${target} class="action-btn ${priorityClass}">
                <i class="${icon}"></i>
                <div class="action-btn-content">
                    <div class="action-btn-title">${action.label}</div>
                    <div class="action-btn-subtitle">${subtitle}</div>
                </div>
            </a>`;
        }).join('');
        
        actionsDiv.innerHTML = `
            <div class="message-content">
                <div class="action-buttons">
                    ${actionsContent}
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(actionsDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showContactOptions() {
        const messagesContainer = document.getElementById('chat-messages');
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'chat-message bot contact-options';
        
        const translations = this.getTranslations();
        
        optionsDiv.innerHTML = `
            <div class="message-content">
                <p>${translations.no_answer}</p>
                <div class="contact-buttons">
                    <a href="https://wa.me/212639887031" target="_blank" class="contact-btn whatsapp-btn">
                        <i class="fab fa-whatsapp"></i>
                        ${translations.whatsapp}
                    </a>
                    <button class="contact-btn booking-btn" onclick="document.querySelector('.hero-cta').click()">
                        <i class="fas fa-calendar-plus"></i>
                        ${translations.booking_form}
                    </button>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(optionsDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async sendWelcomeMessage() {
        const translations = this.getTranslations();
        
        // Message de bienvenue
        this.addMessage(translations.welcome, 'bot');
        
        // Suggestions initiales
        setTimeout(() => {
            this.showSuggestions(translations.initial_suggestions);
        }, 500);
    }

    updateLanguage() {
        const subtitle = document.getElementById('chat-subtitle');
        const input = document.getElementById('chat-input');
        const title = document.querySelector('.chat-title');
        
        const translations = this.getTranslations();
        
        if (title) {
            title.textContent = translations.title;
        }
        
        if (subtitle) {
            subtitle.textContent = translations.subtitle;
        }
        
        if (input) {
            input.placeholder = translations.input_placeholder;
        }
        
        // Mettre à jour les messages existants si nécessaire
        this.updateExistingMessages();
    }
    
    updateExistingMessages() {
        // Si le chat est vide, renvoyer le message de bienvenue dans la nouvelle langue
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer && this.welcomeMessageSent && messagesContainer.children.length > 0) {
            // Remplacer seulement le premier message (bienvenue) s'il existe
            messagesContainer.innerHTML = '';
            this.messages = [];
            this.welcomeMessageSent = false;
            setTimeout(() => {
                this.sendWelcomeMessage();
                this.welcomeMessageSent = true;
            }, 100);
        }
    }

    getTranslations() {
        const translations = {
            fr: {
                title: 'Chat Happy Stay',
                subtitle: 'Posez votre question (FR / العربية / EN)',
                input_placeholder: 'Tapez votre message...',
                welcome: 'Bonjour ! 👋 Je suis l\'assistant Happy Stay. Comment puis-je vous aider aujourd\'hui ?',
                initial_suggestions: [
                    'Quels services proposez-vous ?',
                    'Comment réserver un nettoyage ?',
                    'Quels sont vos horaires ?'
                ],
                no_answer: 'Je n\'ai pas trouvé de réponse à votre question. Nos conseillers peuvent vous aider :',
                whatsapp: 'WhatsApp',
                booking_form: 'Formulaire',
                error_message: 'Désolé, une erreur s\'est produite. Veuillez réessayer.'
            },
            ar: {
                title: 'دردشة Happy Stay',
                subtitle: 'اطرح سؤالك (FR / العربية / EN)',
                input_placeholder: 'اكتب رسالتك...',
                welcome: 'مرحباً ! 👋 أنا مساعد Happy Stay. كيف يمكنني مساعدتك اليوم؟',
                initial_suggestions: [
                    'ما هي الخدمات التي تقدمونها؟',
                    'كيف يمكنني حجز خدمة التنظيف؟',
                    'ما هي أوقات العمل؟'
                ],
                no_answer: 'لم أجد إجابة على سؤالك. يمكن لمستشارينا مساعدتك:',
                whatsapp: 'واتساب',
                booking_form: 'النموذج',
                error_message: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
            },
            en: {
                title: 'Happy Stay Chat',
                subtitle: 'Ask your question (FR / العربية / EN)',
                input_placeholder: 'Type your message...',
                welcome: 'Hello! 👋 I\'m the Happy Stay assistant. How can I help you today?',
                initial_suggestions: [
                    'What services do you offer?',
                    'How to book a cleaning?',
                    'What are your hours?'
                ],
                no_answer: 'I couldn\'t find an answer to your question. Our advisors can help you:',
                whatsapp: 'WhatsApp',
                booking_form: 'Form',
                error_message: 'Sorry, an error occurred. Please try again.'
            }
        };
        
        return translations[this.currentLanguage] || translations.fr;
    }

    getTranslation(key) {
        const translations = this.getTranslations();
        return translations[key] || key;
    }
}

// API Mock pour simuler les réponses du chatbot
class ChatApi {
    constructor() {
        this.webhookUrl = 'https://n8n.srv772899.hstgr.cloud/webhook/happystay-chat';
        this.responses = this.initializeResponses();
    }

    initializeResponses() {
        return {
            fr: {
                'services': 'Nous proposons plusieurs services : Nettoyage de canapés et fauteuils, nettoyage de matelas, nettoyage de chaises, ménage standard et grand ménage. Tous nos services utilisent des produits écologiques.',
                'horaires': 'Nous travaillons du lundi au samedi de 8h00 à 18h00. Nous sommes fermés le dimanche. Nos créneaux de rendez-vous sont à 10h30, 13h30 et 15h30.',
                'réservation': 'Pour réserver, vous pouvez utiliser notre formulaire de réservation ou nous contacter directement sur WhatsApp. Nous vous demanderons quelques photos pour établir un devis précis.',
                'prix': 'Nos tarifs varient selon le service : Canapés (150 DH), Fauteuils (100 DH), Matelas (120 DH), Ménage standard (200 DH), Grand ménage (350 DH). Devis gratuit !',
                'zone': 'Nous intervenons dans tout Agadir et sa région : Talborjt, Founty, Sonaba, Hay Mohammadi, Dakhla, Al Houda, Anza, et bien d\'autres quartiers.',
                'produits': 'Nous utilisons exclusivement des produits écologiques, non toxiques et sans danger pour les enfants et les animaux domestiques.'
            },
            ar: {
                'خدمات': 'نقدم عدة خدمات: تنظيف الأرائك والكراسي، تنظيف المراتب، تنظيف الكراسي، تنظيف عادي وتنظيف شامل. جميع خدماتنا تستخدم منتجات صديقة للبيئة.',
                'أوقات': 'نعمل من الاثنين إلى السبت من 8:00 إلى 18:00. نحن مغلقون يوم الأحد. مواعيد الحجز في 10:30، 13:30 و 15:30.',
                'حجز': 'للحجز، يمكنك استخدام نموذج الحجز أو الاتصال بنا مباشرة عبر الواتساب. سنطلب منك بعض الصور لإعداد عرض أسعار دقيق.',
                'أسعار': 'أسعارنا تختلف حسب الخدمة: الأرائك (150 درهم)، الكراسي (100 درهم)، المراتب (120 درهم)، تنظيف عادي (200 درهم)، تنظيف شامل (350 درهم). عرض أسعار مجاني!',
                'منطقة': 'نتدخل في جميع أنحاء أكادير ومنطقتها: تلبرجت، فونتي، صونابا، حي محمدي، الداخلة، الهدى، أنزا، وأحياء أخرى كثيرة.',
                'منتجات': 'نستخدم حصرياً منتجات صديقة للبيئة، غير سامة وآمنة للأطفال والحيوانات الأليفة.'
            },
            en: {
                'services': 'We offer several services: Sofa and chair cleaning, mattress cleaning, chair cleaning, standard cleaning and deep cleaning. All our services use eco-friendly products.',
                'hours': 'We work Monday to Saturday from 8:00 AM to 6:00 PM. We are closed on Sundays. Our appointment slots are at 10:30 AM, 1:30 PM and 3:30 PM.',
                'booking': 'To book, you can use our booking form or contact us directly on WhatsApp. We will ask you for some photos to provide an accurate quote.',
                'prices': 'Our rates vary by service: Sofas (150 DH), Chairs (100 DH), Mattresses (120 DH), Standard cleaning (200 DH), Deep cleaning (350 DH). Free quote!',
                'area': 'We operate throughout Agadir and its region: Talborjt, Founty, Sonaba, Hay Mohammadi, Dakhla, Al Houda, Anza, and many other neighborhoods.',
                'products': 'We use exclusively eco-friendly products, non-toxic and safe for children and pets.'
            }
        };
    }

    async send(message, sessionId, language = 'fr') {
        // Essayer d'abord le webhook n8n
        try {
            const response = await this.sendToWebhook(message, sessionId, language);
            if (response && response.success) {
                return response;
            }
        } catch (error) {
            console.warn('Webhook n8n non disponible, utilisation du fallback mock:', error);
        }
        
        // Fallback vers les données mock
        return await this.sendMockResponse(message, sessionId, language);
    }

    async sendToWebhook(message, sessionId, language) {
        const payload = {
            message: message,
            sessionId: sessionId,
            language: language,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: window.location.href
        };

        const response = await fetch(this.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(10000) // 10 secondes timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Adapter le nouveau format API au format attendu par le widget
        if (data && data.reply) {
            return {
                success: true,
                message: data.reply,
                suggestions: data.suggestions || [],
                actions: data.actions || [],
                metadata: {
                    language: language,
                    source: "AI",
                    confidence: data.confidence || 0.8,
                    serviceType: data.service_type,
                    sessionId: data.sessionId
                }
            };
        }
        
        // Gérer les erreurs API
        if (data && data.error) {
            return {
                success: false,
                message: data.errorMessage || 'Une erreur est survenue',
                suggestions: data.suggestions || [],
                metadata: {
                    language: language,
                    source: "AI",
                    confidence: 0,
                    error: data.errorCode || 'UNKNOWN_ERROR'
                }
            };
        }
        
        throw new Error('Format de réponse invalide');
    }

    async sendMockResponse(message, sessionId, language) {
        // Simuler un délai d'API
        const delay = Math.random() * 300 + 600; // 600-900ms
        await new Promise(resolve => setTimeout(resolve, delay));

        const lowerMessage = message.toLowerCase();
        const responses = this.responses[language] || this.responses.fr;

        // Recherche de mots-clés dans le message
        for (const [keyword, response] of Object.entries(responses)) {
            if (lowerMessage.includes(keyword.toLowerCase()) || 
                this.containsKeywordVariations(lowerMessage, keyword, language)) {
                return {
                    success: true,
                    message: response,
                    suggestions: this.getRelatedSuggestions(keyword, language),
                    metadata: {
                        language: language,
                        source: "mock",
                        confidence: 0.85,
                        category: keyword
                    }
                };
            }
        }

        // Aucune réponse trouvée
        return {
            success: false,
            message: null,
            metadata: {
                language: language,
                source: "mock",
                confidence: 0.0
            }
        };
    }

    containsKeywordVariations(message, keyword, language) {
        const variations = {
            fr: {
                'services': ['service', 'proposez', 'offrez', 'faites'],
                'horaires': ['heure', 'ouvert', 'fermé', 'disponible'],
                'réservation': ['réserver', 'rendez-vous', 'rdv', 'booking'],
                'prix': ['tarif', 'coût', 'combien', 'price'],
                'zone': ['où', 'secteur', 'région', 'quartier'],
                'produits': ['produit', 'écologique', 'toxique']
            },
            ar: {
                'خدمات': ['خدمة', 'تقدمون', 'تعملون'],
                'أوقات': ['وقت', 'ساعة', 'مفتوح', 'مغلق'],
                'حجز': ['موعد', 'حجز'],
                'أسعار': ['سعر', 'تكلفة', 'كم'],
                'منطقة': ['أين', 'منطقة', 'حي'],
                'منتجات': ['منتج', 'بيئة', 'سام']
            },
            en: {
                'services': ['service', 'offer', 'provide', 'do'],
                'hours': ['time', 'open', 'closed', 'available'],
                'booking': ['book', 'appointment', 'reserve'],
                'prices': ['price', 'cost', 'how much', 'rate'],
                'area': ['where', 'zone', 'region', 'area'],
                'products': ['product', 'eco', 'toxic', 'safe']
            }
        };

        const keywordVariations = variations[language]?.[keyword] || [];
        return keywordVariations.some(variation => message.includes(variation));
    }

    getRelatedSuggestions(keyword, language) {
        const suggestions = {
            fr: {
                'services': ['Quels sont vos tarifs ?', 'Dans quels quartiers intervenez-vous ?'],
                'horaires': ['Comment réserver ?', 'Travaillez-vous le week-end ?'],
                'réservation': ['Quels documents fournir ?', 'Délai de réservation ?'],
                'prix': ['Proposez-vous des forfaits ?', 'Le devis est-il gratuit ?'],
                'zone': ['Intervenez-vous à Taghazout ?', 'Frais de déplacement ?'],
                'produits': ['Produits pour animaux ?', 'Allergies ?']
            },
            ar: {
                'خدمات': ['ما هي أسعاركم؟', 'في أي أحياء تعملون؟'],
                'أوقات': ['كيف أحجز؟', 'هل تعملون في عطلة نهاية الأسبوع؟'],
                'حجز': ['ما الوثائق المطلوبة؟', 'مهلة الحجز؟'],
                'أسعار': ['هل تقدمون باقات؟', 'هل العرض مجاني؟'],
                'منطقة': ['هل تعملون في تغازوت؟', 'رسوم التنقل؟'],
                'منتجات': ['منتجات للحيوانات؟', 'الحساسية؟']
            },
            en: {
                'services': ['What are your rates?', 'Which areas do you cover?'],
                'hours': ['How to book?', 'Do you work weekends?'],
                'booking': ['What documents needed?', 'Booking deadline?'],
                'prices': ['Do you offer packages?', 'Is the quote free?'],
                'area': ['Do you work in Taghazout?', 'Travel fees?'],
                'products': ['Products for pets?', 'Allergies?']
            }
        };

        return suggestions[language]?.[keyword] || [];
    }
}

// Initialiser le widget quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    // Attendre un peu pour s'assurer que les autres scripts sont chargés
    setTimeout(() => {
        window.chatWidget = new ChatWidget();
    }, 500);
});

// Écouter les changements de langue du script principal
if (typeof window.changeLanguage === 'function') {
    const originalChangeLanguage = window.changeLanguage;
    window.changeLanguage = function(lang) {
        originalChangeLanguage(lang);
        // Émettre un événement pour le chat widget
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: lang }
        }));
    };
}