// Admin Script - Happy Stay Administration MVP

class AdminDashboard {
    constructor() {
        this.apiClient = new AdminApiClient();
        this.currentDate = new Date();
        this.currentQuoteReservationId = null;
        this.fixedTimeSlots = ['10:30', '13:30', '15:30'];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.updateCurrentDate();
        
        // Attendre que l'API client soit initialisé
        await this.waitForApiClient();
        
        // Check authentication
        if (await this.apiClient.isAuthenticated()) {
            this.showDashboard();
            await this.loadDashboardData();
        } else {
            this.showAuthModal();
        }
    }

    async waitForApiClient() {
        // Attendre que le DataLayer soit initialisé
        let attempts = 0;
        while (!this.apiClient.dataLayer && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        console.log('🔗 AdminDashboard: API Client prêt après', attempts * 100, 'ms');
    }

    setupEventListeners() {
        // Auth form
        const authForm = document.getElementById('auth-form');
        if (authForm) {
            authForm.addEventListener('submit', (e) => this.handleAuth(e));
        }

        // Date picker
        const datePicker = document.getElementById('date-picker');
        if (datePicker) {
            datePicker.value = this.formatDate(this.currentDate);
            datePicker.addEventListener('change', (e) => {
                this.currentDate = new Date(e.target.value);
                this.updateCurrentDate();
                this.loadDashboardData();
            });
        }

        // Quote form calculations
        document.addEventListener('input', (e) => {
            if (e.target.matches('.quote-quantity, .quote-price')) {
                this.calculateQuoteTotal();
            }
        });
    }

    formatDate(date) {
        const formatted = date.toISOString().split('T')[0];
        console.log('📅 Date formatée:', formatted);
        return formatted;
    }

    formatDisplayDate(date) {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    updateCurrentDate() {
        const currentDateElement = document.getElementById('current-date');
        const selectedDateElement = document.getElementById('selected-date-text');
        const datePicker = document.getElementById('date-picker');
        
        if (currentDateElement) {
            currentDateElement.textContent = this.formatDisplayDate(new Date());
        }
        
        if (selectedDateElement) {
            selectedDateElement.textContent = this.formatDisplayDate(this.currentDate);
        }

        if (datePicker) {
            datePicker.value = this.formatDate(this.currentDate);
        }
    }

    showAuthModal() {
        const authModal = document.getElementById('auth-modal');
        const dashboard = document.getElementById('admin-dashboard');
        
        if (authModal) authModal.classList.add('show');
        if (dashboard) dashboard.style.display = 'none';
    }

    showDashboard() {
        const authModal = document.getElementById('auth-modal');
        const dashboard = document.getElementById('admin-dashboard');
        
        if (authModal) authModal.classList.remove('show');
        if (dashboard) dashboard.style.display = 'block';
        
        console.log('📺 Dashboard affiché');
        
        // Vérifier que les éléments sont bien visibles
        const planningSlots = document.getElementById('planning-slots');
        const reservationsList = document.getElementById('reservations-list');
        
        console.log('🔍 Éléments trouvés:', {
            planningSlots: !!planningSlots,
            reservationsList: !!reservationsList
        });
    }

    async handleAuth(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const token = formData.get('adminToken');
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Vérification...';
        submitBtn.disabled = true;
        
        try {
            const result = await this.apiClient.authenticate(token);
            
            if (result.success) {
                console.log('✅ Authentification réussie, affichage du dashboard');
                this.showDashboard();
                // Forcer le rechargement des données après un court délai
                setTimeout(async () => {
                    await this.loadDashboardData();
                }, 100);
            } else {
                console.error('❌ Échec authentification:', result.message);
                this.showToast(result.message || 'Identifiants invalides. Veuillez réessayer.', 'error');
            }
        } catch (error) {
            console.error('❌ Erreur handleAuth:', error);
            this.showToast('Erreur de connexion. Veuillez réessayer.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async loadDashboardData() {
        console.log('🔄 Début loadDashboardData');
        this.showLoading();
        try {
            console.log('📅 Date actuelle:', this.formatDate(this.currentDate));
            await Promise.all([
                this.loadPlanning(),
                this.loadReservations()
            ]);
            console.log('✅ loadDashboardData terminé');
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showToast('Erreur lors du chargement des données', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadPlanning() {
        const dateStr = this.formatDate(this.currentDate);
        console.log('🔄 Chargement planning pour:', dateStr);
        const slots = await this.apiClient.getSlots(dateStr);
        console.log('📊 Créneaux reçus:', slots);
        
        const planningSlots = document.getElementById('planning-slots');
        if (!planningSlots) return;
        
        // Toujours afficher les 3 créneaux fixes
        planningSlots.innerHTML = this.fixedTimeSlots.map(time => {
            const slot = slots.find(s => s.time === time) || {
                id: `${dateStr}-${time}`,
                date: dateStr,
                time: time,
                status: 'available',
                reservationId: null
            };
            return this.renderPlanningSlot(slot);
        }).join('');
    }

renderPlanningSlot(slot) {
    const statusConfig = {
        'available': { label: 'LIBRE', class: 'available', color: 'green' },
        'reserved' : { label: 'RÉSERVÉ', class: 'reserved', color: 'blue' },
        'blocked'  : { label: 'BLOQUÉ', class: 'blocked', color: 'red' }
    };

    // 🔧 Normalisation des statuts (accepte FREE/BOOKED/BLOCKED ou available/reserved/blocked)
    const normalize = (s) => String(s || 'available')
        .toLowerCase()
        .replace('free', 'available')
        .replace('booked', 'reserved');

    const nstatus = normalize(slot.status);
    const config = statusConfig[nstatus] || statusConfig.available;

    let subtitle = '';
    let actionButton = '';

    if (nstatus === 'reserved' && slot.reservation) {
        subtitle = `<div class="slot-subtitle">Réservé par ${slot.reservation.customerName} — ${slot.reservation.service}</div>`;
        actionButton = `<button class="slot-action-btn view-reservation" onclick="scrollToReservation('${slot.reservationId}')">
            <i class="fas fa-eye"></i>
            Voir la réservation
        </button>`;
    } else if (nstatus === 'available') {
        actionButton = `<button class="slot-action-btn block" onclick="toggleSlotStatus('${slot.id}', 'blocked')">
            <i class="fas fa-lock"></i>
            Bloquer
        </button>`;
    } else if (nstatus === 'blocked') {
        actionButton = `<button class="slot-action-btn unblock" onclick="toggleSlotStatus('${slot.id}', 'available')">
            <i class="fas fa-unlock"></i>
            Débloquer
        </button>`;
    }

    return `
        <div class="planning-slot ${config.class}" id="slot-${slot.id}">
            <div class="slot-header">
                <div class="slot-time">${slot.time}</div>
                <div class="slot-status ${config.class}">${config.label}</div>
            </div>
            ${subtitle}
            <div class="slot-actions">
                ${actionButton}
            </div>
        </div>
    `;
}


    async loadReservations() {
        const dateStr = this.formatDate(this.currentDate);
        console.log('🔄 Chargement réservations pour:', dateStr);
        const reservations = await this.apiClient.getReservations(dateStr);
        console.log('📊 Réservations reçues:', reservations);
        
        const reservationsList = document.getElementById('reservations-list');
        const reservationsCount = document.getElementById('reservations-count');
        
        if (reservationsCount) {
            reservationsCount.textContent = reservations.length;
        }
        
        if (!reservationsList) return;
        
        if (reservations.length === 0) {
            reservationsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <h3>Aucune réservation</h3>
                    <p>Aucune réservation pour cette date</p>
                </div>
            `;
            console.log('📝 Affichage état vide pour les réservations');
            return;
        }
        
        // Trier par horaire
        const sortedReservations = reservations.sort((a, b) => a.time.localeCompare(b.time));
        
        reservationsList.innerHTML = sortedReservations.map(reservation => 
            this.renderReservationCard(reservation)
        ).join('');
        
        console.log('📝 Réservations affichées:', sortedReservations.length);
    }

    renderReservationCard(reservation) {
        const statusConfig = {
            'pending':   { label: 'En attente', class: 'pending' },
            'confirmed': { label: 'Confirmée', class: 'confirmed' },
            'canceled':  { label: 'Annulée',   class: 'canceled' },
            // tolérance orthographe UK si jamais :
            'cancelled': { label: 'Annulée',   class: 'canceled' }
        };

        // ✅ Normalise la valeur reçue du DataLayer (CONFIRMED, Pending, etc.)
        const statusKey = (reservation.status || '').toString().trim().toLowerCase();
        const config = statusConfig[statusKey] || statusConfig.pending;

        const hasPhotos = reservation.photos && reservation.photos.length > 0;
        
        // Tronquer les notes si trop longues
        const truncatedNotes = reservation.notes && reservation.notes.length > 100 
            ? reservation.notes.substring(0, 100) + '...' 
            : reservation.notes;

        // Générer l'affichage des services détaillés
        const servicesDisplay = this.generateServicesDisplay(reservation);

        // Boutons d'action selon le statut (utiliser la version normalisée)
        let actionButtons = '';
        if (statusKey === 'pending') {
            actionButtons = `
                <button class="reservation-btn confirm" onclick="confirmReservation('${reservation.id}')">
                    <i class="fas fa-check"></i>
                    Confirmer
                </button>
                <button class="reservation-btn create-quote" onclick="openQuoteModal('${reservation.id}')">
                    <i class="fas fa-file-invoice-dollar"></i>
                    Créer un devis
                </button>
            `;
        }
        
        if (statusKey !== 'canceled' && statusKey !== 'cancelled') {
            actionButtons += `
                <button class="reservation-btn cancel" onclick="cancelReservation('${reservation.id}')">
                    <i class="fas fa-times"></i>
                    Annuler
                </button>
            `;
        }

        // Badge devis si existant
        let quoteBadge = '';
        if (reservation.quote) {
            const quoteClass = reservation.quote.status === 'sent' ? 'sent' : 'draft';
            const quoteLabel = reservation.quote.status === 'sent' 
                ? `Devis : Envoyé (${reservation.quote.total} DH)` 
                : 'Devis : Brouillon';
            quoteBadge = `<div class="quote-badge ${quoteClass}">${quoteLabel}</div>`;
        }

        return `
            <div class="reservation-card" id="reservation-${reservation.id}">
                <div class="reservation-header">
                    <div class="reservation-time-status">
                        <span class="reservation-time">${reservation.time}</span>
                        <span class="reservation-status ${config.class}">${config.label}</span>
                    </div>
                    ${quoteBadge}
                </div>
                <div class="reservation-details">
                    <div class="reservation-customer">
                        <strong>${reservation.customerName}</strong>
                        <a href="https://wa.me/${reservation.customerPhone.replace(/\s/g, '')}" target="_blank" class="phone-link">
                            <i class="fab fa-whatsapp"></i>
                            ${reservation.customerPhone}
                        </a>
                    </div>
                    ${servicesDisplay}
                    <div class="reservation-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${reservation.district}${reservation.address ? ` - ${reservation.address}` : ''}
                    </div>
                    ${truncatedNotes ? `
                        <div class="reservation-notes">
                            <i class="fas fa-sticky-note"></i>
                            ${truncatedNotes}
                        </div>
                    ` : ''}
                    ${hasPhotos ? `
                        <div class="reservation-photos">
                            <i class="fas fa-camera"></i>
                            📷 ${reservation.photos.length} photo(s)
                        </div>
                    ` : ''}
                </div>
                <div class="reservation-actions">
                    ${actionButtons}
                    ${hasPhotos ? `
                        <button class="reservation-btn photos" onclick="showPhotos('${reservation.id}')">
                            <i class="fas fa-images"></i>
                            Voir photos
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    async changeDate(delta) {
        this.currentDate.setDate(this.currentDate.getDate() + delta);
        this.updateCurrentDate();
        await this.loadDashboardData();
    }

    async blockAllSlots() {
        const dateStr = this.formatDate(this.currentDate);
        this.showLoading();
        
        try {
            const result = await this.apiClient.blockAllSlots(dateStr);
            if (result.success) {
                this.showToast(result.message, 'success');
                await this.loadPlanning();
            } else {
                this.showToast(result.message, 'warning');
            }
        } catch (error) {
            this.showToast('Erreur lors du blocage des créneaux', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async unblockAllSlots() {
        const dateStr = this.formatDate(this.currentDate);
        this.showLoading();
        
        try {
            const result = await this.apiClient.unblockAllSlots(dateStr);
            if (result.success) {
                this.showToast(result.message, 'success');
                await this.loadPlanning();
            } else {
                this.showToast(result.message, 'warning');
            }
        } catch (error) {
            this.showToast('Erreur lors du déblocage des créneaux', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async toggleSlotStatus(slotId, newStatus) {
        this.showLoading();
        
        try {
            const result = await this.apiClient.updateSlotStatus(slotId, newStatus);
            if (result.success) {
                const action = newStatus === 'blocked' ? 'bloqué' : 'débloqué';
                this.showToast(`Créneau ${action}`, 'success');
                await this.loadPlanning();
            } else {
                this.showToast(result.message, 'error');
            }
        } catch (error) {
            this.showToast('Erreur lors de la mise à jour du créneau', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async confirmReservation(reservationId) {
        this.showLoading();
        
        try {
            const result = await this.apiClient.updateReservationStatus(reservationId, 'confirmed');
            if (result.success) {
                this.showToast('Réservation confirmée', 'success');
                await this.loadDashboardData();
            } else {
                this.showToast(result.message, 'error');
            }
        } catch (error) {
            this.showToast('Erreur lors de la confirmation', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async cancelReservation(reservationId) {
        this.showLoading();
        
        try {
            const result = await this.apiClient.updateReservationStatus(reservationId, 'cancelled');
            if (result.success) {
                this.showToast('Réservation annulée', 'success');
                await this.loadDashboardData();
            } else {
                this.showToast(result.message, 'error');
            }
        } catch (error) {
            this.showToast('Erreur lors de l\'annulation', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async showPhotos(reservationId) {
        try {
            const dateStr = this.formatDate(this.currentDate);
            const reservations = await this.apiClient.getReservations(dateStr);
            const reservation = reservations.find(r => r.id === reservationId);
            
            if (!reservation || !reservation.photos || reservation.photos.length === 0) {
                this.showToast('Aucune photo disponible', 'warning');
                return;
            }
            
            const modal = document.getElementById('photo-modal');
            const content = document.getElementById('photo-modal-content');
            
            if (!modal || !content) return;
            
            content.innerHTML = `
                <div class="photo-grid">
                    ${reservation.photos.map((photo, index) => `
                        <div class="photo-item">
                            <img src="${photo}" alt="Photo ${index + 1}" loading="lazy">
                        </div>
                    `).join('')}
                </div>
            `;
            
            modal.classList.add('show');
        } catch (error) {
            this.showToast('Erreur lors du chargement des photos', 'error');
        }
    }

    async openQuoteModal(reservationId) {
        this.currentQuoteReservationId = reservationId;
        
        try {
            const dateStr = this.formatDate(this.currentDate);
            const reservations = await this.apiClient.getReservations(dateStr);
            const reservation = reservations.find(r => r.id === reservationId);
            
            if (!reservation) return;
            
            const modal = document.getElementById('quote-modal');
            const itemsContainer = document.getElementById('quote-items');
            
            // Préremplir selon le service
            const serviceItems = this.getServiceQuoteItems(reservation.service);
            
            itemsContainer.innerHTML = serviceItems.map((item, index) => 
                this.renderQuoteItem(item, index)
            ).join('');
            
            this.calculateQuoteTotal();
            modal.classList.add('show');
        } catch (error) {
            this.showToast('Erreur lors de l\'ouverture du devis', 'error');
        }
    }

    renderQuoteItem(item, index) {
        return `
            <div class="quote-item" data-index="${index}">
                <div class="quote-item-label">
                    <input type="text" class="quote-label" value="${item.label}" placeholder="Libellé du service">
                </div>
                <div class="quote-item-quantity">
                    <input type="number" class="quote-quantity" value="${item.quantity}" min="1" max="10">
                </div>
                <div class="quote-item-price">
                    <input type="number" class="quote-price" value="${item.price}" min="0" step="0.01">
                    <span class="currency">DH</span>
                </div>
                <div class="quote-item-total">
                    <span class="item-total">${(item.quantity * item.price).toFixed(2)} DH</span>
                </div>
                <div class="quote-item-actions">
                    <button type="button" class="quote-item-remove" onclick="removeQuoteItem(${index})" title="Supprimer cette ligne">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    addQuoteItem() {
        const itemsContainer = document.getElementById('quote-items');
        const currentItems = itemsContainer.querySelectorAll('.quote-item');
        const newIndex = currentItems.length;
        
        const newItem = {
            label: '',
            quantity: 1,
            price: 0
        };
        
        const newItemHtml = this.renderQuoteItem(newItem, newIndex);
        itemsContainer.insertAdjacentHTML('beforeend', newItemHtml);
        
        // Focus sur le nouveau champ libellé
        const newItemElement = itemsContainer.lastElementChild;
        const labelInput = newItemElement.querySelector('.quote-label');
        if (labelInput) {
            labelInput.focus();
        }
        
        this.updateQuoteItemIndices();
        this.calculateQuoteTotal();
    }

    removeQuoteItem(index) {
        const itemsContainer = document.getElementById('quote-items');
        const items = itemsContainer.querySelectorAll('.quote-item');
        
        // Ne pas permettre de supprimer s'il n'y a qu'une seule ligne
        if (items.length <= 1) {
            this.showToast('Au moins une ligne est requise', 'warning');
            return;
        }
        
        const itemToRemove = itemsContainer.querySelector(`[data-index="${index}"]`);
        if (itemToRemove) {
            itemToRemove.remove();
            this.updateQuoteItemIndices();
            this.calculateQuoteTotal();
        }
    }

    updateQuoteItemIndices() {
        const itemsContainer = document.getElementById('quote-items');
        const items = itemsContainer.querySelectorAll('.quote-item');
        
        items.forEach((item, newIndex) => {
            item.setAttribute('data-index', newIndex);
            const removeBtn = item.querySelector('.quote-item-remove');
            if (removeBtn) {
                removeBtn.setAttribute('onclick', `removeQuoteItem(${newIndex})`);
            }
        });
    }

    getServiceQuoteItems(service) {
        // Nouvelle logique basée sur les détails de services
        const dateStr = this.formatDate(this.currentDate);
        const reservations = this.apiClient.mockData.reservations;
        const reservation = reservations.find(r => r.id === this.currentQuoteReservationId);
        
        if (!reservation || !reservation.serviceDetails) {
            // Fallback pour les anciennes données
            const serviceMap = {
                'Nettoyage Canapés': [{ label: 'Nettoyage canapé', quantity: 1, price: 150 }],
                'Nettoyage Fauteuils': [{ label: 'Nettoyage fauteuil', quantity: 1, price: 100 }],
                'Nettoyage Matelas': [{ label: 'Nettoyage matelas', quantity: 1, price: 120 }],
                'Ménage Standard': [{ label: 'Ménage standard', quantity: 1, price: 200 }],
                'Grand Ménage': [{ label: 'Grand ménage', quantity: 1, price: 350 }]
            };
            return serviceMap[service] || [{ label: service, quantity: 1, price: 0 }];
        }
        
        // Générer les items de devis basés sur les détails de services
        return reservation.serviceDetails.map(serviceDetail => {
            const data = serviceDetail.data;
            let basePrice = 0;
            let label = '';
            let quantity = 1;
            
            switch (serviceDetail.type) {
                case 'Canapé/Fauteuil':
                    basePrice = this.getSofaPrice(data.size);
                    if (data.options && data.options.includes('anti-acariens')) basePrice += 20;
                    if (data.options && data.options.includes('protection-anti-taches')) basePrice += 30;
                    label = `${serviceDetail.type} ${data.size || ''} ${data.material || ''}`.trim();
                    if (data.options && data.options.length > 0) {
                        label += ` + ${data.options.join(', ')}`;
                    }
                    quantity = data.quantity || 1;
                    break;
                    
                case 'Chaises':
                    basePrice = 25; // Prix par chaise
                    label = `Chaise ${data.material || ''}`;
                    if (data.removableCushion) label += ' (coussin amovible)';
                    quantity = data.quantity || 1;
                    break;
                    
                case 'Matelas':
                    basePrice = this.getMattressPrice(data.format, data.faces);
                    label = `Matelas ${data.format || ''} (${data.faces || 1} face${(data.faces || 1) > 1 ? 's' : ''})`;
                    quantity = 1;
                    break;
                    
                default:
                    basePrice = 100;
                    label = serviceDetail.type;
                    quantity = data.quantity || 1;
            }
            
            return { label: label.trim(), quantity, price: basePrice };
        });
    }
    
    getSofaPrice(size) {
        const priceMap = {
            '1 place': 100,
            '2 places': 130,
            '3 places': 150,
            'Angle': 200,
            'Méridienne': 140,
            'Convertible': 180
        };
        return priceMap[size] || 120;
    }
    
    getMattressPrice(format, faces) {
        const basePrice = {
            '90': 80,
            '140': 100,
            '160': 120,
            '180': 140,
            'King': 160
        }[format] || 100;
        
        return faces === 2 ? basePrice + 40 : basePrice;
    }

    calculateQuoteTotal() {
        const items = document.querySelectorAll('.quote-item');
        let total = 0;
        
        items.forEach(item => {
            const quantity = parseFloat(item.querySelector('.quote-quantity').value) || 0;
            const price = parseFloat(item.querySelector('.quote-price').value) || 0;
            const itemTotal = quantity * price;
            
            item.querySelector('.item-total').textContent = `${itemTotal.toFixed(2)} DH`;
            total += itemTotal;
        });
        
        document.getElementById('quote-total').textContent = `${total.toFixed(2)}`;
    }

    async saveQuoteDraft() {
        if (!this.currentQuoteReservationId) return;
        
        const items = this.getQuoteItems();
        const notes = document.getElementById('quote-notes').value;
        
        this.showLoading();
        
        try {
            const result = await this.apiClient.createQuote(this.currentQuoteReservationId, items, notes);
            if (result.success) {
                this.showToast('Devis enregistré en brouillon', 'success');
                this.closeQuoteModal();
                await this.loadReservations();
            } else {
                this.showToast('Erreur lors de l\'enregistrement', 'error');
            }
        } catch (error) {
            this.showToast('Erreur lors de l\'enregistrement du devis', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async sendQuoteWhatsApp() {
        if (!this.currentQuoteReservationId) return;
        
        const items = this.getQuoteItems();
        const notes = document.getElementById('quote-notes').value;
        
        this.showLoading();
        
        try {
            const result = await this.apiClient.sendQuote(this.currentQuoteReservationId, items, notes);
            if (result.success) {
                this.showToast('Devis envoyé sur WhatsApp', 'success');
                this.closeQuoteModal();
                await this.loadReservations();
            } else {
                this.showToast('Erreur lors de l\'envoi', 'error');
            }
        } catch (error) {
            this.showToast('Erreur lors de l\'envoi du devis', 'error');
        } finally {
            this.hideLoading();
        }
    }

    getQuoteItems() {
        const items = [];
        document.querySelectorAll('.quote-item').forEach(item => {
            const label = item.querySelector('.quote-label').value;
            const quantity = parseFloat(item.querySelector('.quote-quantity').value) || 0;
            const price = parseFloat(item.querySelector('.quote-price').value) || 0;
            
            if (label && quantity > 0) {
                items.push({ label, quantity, price });
            }
        });
        return items;
    }

    generateServicesDisplay(reservation) {
        if (!reservation.serviceDetails || reservation.serviceDetails.length === 0) {
            // Fallback pour les anciennes données
            return `<div class="reservation-service">${reservation.service}</div>`;
        }

        const servicesHtml = reservation.serviceDetails.map(service => {
            const serviceLabel = this.formatServiceLabel(service);
            return `<div class="service-detail-item">
                <i class="fas fa-check-circle"></i>
                <span>${serviceLabel}</span>
            </div>`;
        }).join('');

        return `<div class="reservation-services">
            <div class="services-header">
                <i class="fas fa-list"></i>
                <strong>Services demandés :</strong>
            </div>
            <div class="services-list">
                ${servicesHtml}
            </div>
        </div>`;
    }

    formatServiceLabel(service) {
        const data = service.data;
        
        switch (service.type) {
            case 'Canapé/Fauteuil':
                let label = `${data.quantity || 1}x ${service.type}`;
                if (data.size) label += ` ${data.size}`;
                if (data.material) label += ` (${data.material})`;
                if (data.stains && data.stains !== 'Aucune') label += ` - Taches ${data.stains.toLowerCase()}`;
                if (data.options && data.options.length > 0) {
                    const optionsText = data.options.map(opt => {
                        switch (opt) {
                            case 'anti-acariens': return 'Anti-acariens';
                            case 'protection-anti-taches': return 'Protection anti-taches';
                            default: return opt;
                        }
                    }).join(', ');
                    label += ` + ${optionsText}`;
                }
                return label;
                
            case 'Chaises':
                let chairLabel = `${data.quantity || 1}x Chaises`;
                if (data.material) chairLabel += ` ${data.material}`;
                if (data.removableCushion) chairLabel += ' (coussins amovibles)';
                return chairLabel;
                
            case 'Matelas':
                let mattressLabel = `Matelas ${data.format || 'standard'}`;
                if (data.faces) mattressLabel += ` (${data.faces} face${data.faces > 1 ? 's' : ''})`;
                if (data.note) mattressLabel += ` - ${data.note}`;
                return mattressLabel;
                
            default:
                return service.type;
        }
    }

    scrollToReservation(reservationId) {
        const element = document.getElementById(`reservation-${reservationId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight');
            setTimeout(() => element.classList.remove('highlight'), 2000);
        }
    }

    closePhotoModal() {
        const modal = document.getElementById('photo-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    closeQuoteModal() {
        const modal = document.getElementById('quote-modal');
        if (modal) {
            modal.classList.remove('show');
        }
        this.currentQuoteReservationId = null;
    }

    showLoading() {
        // Simple loading implementation - could be enhanced
        document.body.style.cursor = 'wait';
    }

    hideLoading() {
        document.body.style.cursor = 'default';
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        }[type] || 'fas fa-info-circle';
        
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    async logout() {
        try {
            await this.apiClient.logout();
    console.log('🔐 Déconnexion effectuée');
        } catch (error) {
            console.error('❌ Erreur lors de la déconnexion:', error);
        }
        this.showAuthModal();
    }
}

// Global functions for onclick handlers
window.changeDate = function(delta) {
    window.adminDashboard.changeDate(delta);
};

window.blockAllSlots = function() {
    window.adminDashboard.blockAllSlots();
};

window.unblockAllSlots = function() {
    window.adminDashboard.unblockAllSlots();
};

window.toggleSlotStatus = function(slotId, newStatus) {
    window.adminDashboard.toggleSlotStatus(slotId, newStatus);
};

window.confirmReservation = function(reservationId) {
    window.adminDashboard.confirmReservation(reservationId);
};

window.cancelReservation = function(reservationId) {
    window.adminDashboard.cancelReservation(reservationId);
};

window.showPhotos = function(reservationId) {
    window.adminDashboard.showPhotos(reservationId);
};

window.openQuoteModal = function(reservationId) {
    window.adminDashboard.openQuoteModal(reservationId);
};

window.saveQuoteDraft = function() {
    window.adminDashboard.saveQuoteDraft();
};

window.sendQuoteWhatsApp = function() {
    window.adminDashboard.sendQuoteWhatsApp();
};

window.closePhotoModal = function() {
    window.adminDashboard.closePhotoModal();
};

window.closeQuoteModal = function() {
    window.adminDashboard.closeQuoteModal();
};

window.addQuoteItem = function() {
    window.adminDashboard.addQuoteItem();
};

window.removeQuoteItem = function(index) {
    window.adminDashboard.removeQuoteItem(index);
};

window.logout = function() {
    if (window.adminDashboard) {
        window.adminDashboard.logout();
    }
};

// ✅ Binding manquant utilisé dans le planning
window.scrollToReservation = function(reservationId) {
    window.adminDashboard.scrollToReservation(reservationId);
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.adminDashboard = new AdminDashboard();
});
