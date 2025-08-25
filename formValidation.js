// Form Validation - Validation complète du formulaire
// Happy Stay - Formulaire de demande de devis

import { dataLayer } from './js/data-layer/index.js';
import { validateReservation } from './js/data-layer/reservation-schema.js';

class FormValidation {
    constructor() {
        this.errors = {};
        console.log('✅ FormValidation: Utilisation du DataLayer', dataLayer.constructor.name);
        this.init();
    }

    init() {
        this.form = document.getElementById('booking-form');
        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        if (!this.form) return;

        // Validation en temps réel pour les champs principaux
        const fields = [
            'firstName',
            'lastName', 
            'phone',
            'district',
            'date'
        ];

        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldName));
                field.addEventListener('input', () => this.clearFieldError(fieldName));
            }
        });

        // Validation spéciale pour le téléphone
        const phoneField = document.getElementById('phone');
        if (phoneField) {
            phoneField.addEventListener('input', (e) => {
                this.formatPhoneInput(e.target);
                this.clearFieldError('phone');
            });
        }

        // Validation de la date
        const dateField = document.getElementById('date');
        if (dateField) {
            dateField.addEventListener('change', () => {
                this.validateField('date');
                this.updateAvailableSlots();
            });
        }
    }

    formatPhoneInput(input) {
        let value = input.value;
        
        // Garder seulement les chiffres et le +
        value = value.replace(/[^\d+]/g, '');
        
        // S'assurer que ça commence par +
        if (!value.startsWith('+')) {
            value = '+' + value.replace(/^\+*/, '');
        }

        input.value = value;
    }

    validateField(fieldName) {
        const field = document.getElementById(fieldName);
        if (!field) return true;

        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'firstName':
                if (!field.value.trim()) {
                    isValid = false;
                    errorMessage = 'Le prénom est obligatoire';
                } else if (field.value.trim().length < 2) {
                    isValid = false;
                    errorMessage = 'Le prénom doit contenir au moins 2 caractères';
                }
                break;

            case 'lastName':
                if (!field.value.trim()) {
                    isValid = false;
                    errorMessage = 'Le nom est obligatoire';
                } else if (field.value.trim().length < 2) {
                    isValid = false;
                    errorMessage = 'Le nom doit contenir au moins 2 caractères';
                }
                break;

            case 'phone':
                const phoneValid = this.validatePhone(field.value);
                if (!phoneValid.isValid) {
                    isValid = false;
                    errorMessage = phoneValid.error;
                }
                break;

            case 'district':
                if (!field.value) {
                    isValid = false;
                    errorMessage = 'Le quartier est obligatoire';
                }
                // Vérifier le champ "Autre" si sélectionné
                if (field.value === 'Autre') {
                    const otherField = document.getElementById('otherDistrict');
                    if (!otherField || !otherField.value.trim()) {
                        isValid = false;
                        errorMessage = 'Veuillez préciser votre quartier';
                    }
                }
                break;

            case 'date':
                const dateValid = this.validateDate(field.value);
                if (!dateValid.isValid) {
                    isValid = false;
                    errorMessage = dateValid.error;
                }
                break;
        }

        if (isValid) {
            this.clearFieldError(fieldName);
        } else {
            this.showFieldError(fieldName, errorMessage);
        }

        return isValid;
    }

    validatePhone(phone) {
        if (!phone) {
            return { isValid: false, error: 'Le numéro de téléphone est obligatoire' };
        }

        // Doit commencer par +
        if (!phone.startsWith('+')) {
            return { isValid: false, error: 'Le numéro doit commencer par +' };
        }

        // Extraire les chiffres
        const digits = phone.replace(/\D/g, '');
        
        // Vérifier la longueur (8-15 chiffres au total)
        if (digits.length < 8) {
            return { isValid: false, error: 'Le numéro est trop court (minimum 8 chiffres)' };
        }
        
        if (digits.length > 15) {
            return { isValid: false, error: 'Le numéro est trop long (maximum 15 chiffres)' };
        }

        return { isValid: true };
    }

    validateDate(dateValue) {
        if (!dateValue) {
            return { isValid: false, error: 'La date est obligatoire' };
        }

        const selectedDate = new Date(dateValue);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            return { isValid: false, error: 'Impossible de réserver dans le passé' };
        }

        // Vérifier que ce n'est pas un dimanche (jour 0)
        if (selectedDate.getDay() === 0) {
            return { isValid: false, error: 'Nous ne travaillons pas le dimanche' };
        }

        return { isValid: true };
    }

    validateServices() {
        if (!window.servicesCart) {
            return { isValid: false, error: 'Erreur système: panier de services non initialisé' };
        }

        console.log('=== VALIDATION SERVICES ===');
        console.log('Total services dans le panier:', window.servicesCart.services.length);
        console.log('Services validés par l\'utilisateur:', window.servicesCart.validatedServices.size);
        
        // Nouvelle logique: vérifier qu'au moins un service a été validé
        if (!window.servicesCart.hasValidatedServices()) {
            console.log('❌ Aucun service validé');
            return { isValid: false, error: 'Veuillez valider au moins un service en cliquant sur "Valider ce service"' };
        }

        console.log('✅ Validation des services réussie');
        return { isValid: true };
    }

    getMissingFields(service) {
        const missing = [];
        const data = service.data;
        
        switch (service.type) {
            case 'Canapé/Fauteuil':
                if (!data.size) missing.push('Taille');
                if (!data.quantity || data.quantity <= 0) missing.push('Quantité');
                break;
            case 'Chaises':
                if (!data.quantity || data.quantity <= 0) missing.push('Quantité');
                if (!data.material) missing.push('Matière');
                break;
            case 'Matelas':
                if (!data.format) missing.push('Format');
                if (!data.faces) missing.push('Faces');
                break;
        }
        
        return missing;
    }

    validatePhotos() {
        if (!window.photosUploader) {
            return { isValid: false, error: 'Erreur système: gestionnaire de photos non initialisé' };
        }

        if (!window.photosUploader.isValid()) {
            const count = window.photosUploader.photos.length;
            if (count < window.photosUploader.minPhotos) {
                return { 
                    isValid: false, 
                    error: `Minimum ${window.photosUploader.minPhotos} photos requises (${count} actuellement)` 
                };
            }
            if (count > window.photosUploader.maxPhotos) {
                return { 
                    isValid: false, 
                    error: `Maximum ${window.photosUploader.maxPhotos} photos autorisées (${count} actuellement)` 
                };
            }
        }

        return { isValid: true };
    }

    validateTimeSlot() {
        const selectedTime = document.getElementById('selectedTime');
        if (!selectedTime || !selectedTime.value) {
            return { isValid: false, error: 'Le créneau horaire est obligatoire' };
        }

        // Vérifier que le créneau est toujours disponible
        const dateField = document.getElementById('date');
        if (dateField && dateField.value && window.mockDataLayer) {
            // TODO: Remplacer par dataLayer.getSlotsByDate()
            const isAvailable = window.mockDataLayer.isSlotAvailable(dateField.value, selectedTime.value);
            if (!isAvailable) {
                return { isValid: false, error: 'Ce créneau n\'est plus disponible' };
            }
        }

        return { isValid: true };
    }

    // Nouvelle méthode utilisant le schéma de validation
    async validateWithSchema(reservationData) {
        const validation = validateReservation(reservationData);
        
        if (!validation.isValid) {
            console.log('❌ Validation schéma échouée:', validation.errors);
            return {
                isValid: false,
                errors: validation.errors
            };
        }
        
        // Vérification supplémentaire de disponibilité du créneau
        const slots = await dataLayer.getSlotsByDate(reservationData.date);
        const targetSlot = slots.find(slot => slot.time === reservationData.time);
        
        if (!targetSlot || targetSlot.status !== 'FREE') {
            return { isValid: false, errors: ['Créneau non disponible'] };
        }
        
        return { isValid: true, errors: [] };
    }

    validateForm() {
        this.errors = {};
        this.clearGlobalError(); // Nettoyer les erreurs précédentes
        
        console.log('Début de la validation du formulaire');

        // 1. Validation des champs de base
        const basicFields = ['firstName', 'lastName', 'phone', 'district', 'date'];
        let hasBasicErrors = false;
        
        basicFields.forEach(field => {
            if (!this.validateField(field)) {
                this.errors[field] = true;
                hasBasicErrors = true;
                console.log(`Erreur de validation pour le champ: ${field}`);
            }
        });

        // 2. Validation des services
        const servicesValidation = this.validateServices();
        if (!servicesValidation.isValid) {
            this.errors.services = servicesValidation.error;
            console.log('Erreur de validation des services:', servicesValidation.error);
        }

        // 3. Validation des photos
        const photosValidation = this.validatePhotos();
        if (!photosValidation.isValid) {
            this.errors.photos = photosValidation.error;
            console.log('Erreur de validation des photos:', photosValidation.error);
        }

        // 4. Validation du créneau
        const timeSlotValidation = this.validateTimeSlot();
        if (!timeSlotValidation.isValid) {
            this.errors.timeSlot = timeSlotValidation.error;
            console.log('Erreur de validation du créneau:', timeSlotValidation.error);
        }

        // 5. Afficher le premier message d'erreur trouvé
        if (Object.keys(this.errors).length > 0) {
            this.showFirstError();
        }

        const isValid = Object.keys(this.errors).length === 0;
        console.log('Résultat de la validation:', isValid, 'Erreurs:', this.errors);
        
        return isValid;
    }

    showFirstError() {
        // Ordre de priorité des erreurs à afficher
        const errorPriority = [
            { key: 'firstName', message: 'Veuillez saisir votre prénom' },
            { key: 'lastName', message: 'Veuillez saisir votre nom' },
            { key: 'phone', message: 'Veuillez saisir un numéro de téléphone valide' },
            { key: 'district', message: 'Veuillez sélectionner votre quartier' },
            { key: 'services', message: this.errors.services },
            { key: 'date', message: 'Veuillez sélectionner une date' },
            { key: 'timeSlot', message: this.errors.timeSlot },
            { key: 'photos', message: this.errors.photos }
        ];

        // Trouver la première erreur dans l'ordre de priorité
        for (const errorInfo of errorPriority) {
            if (this.errors[errorInfo.key]) {
                this.showGlobalError(errorInfo.message);
                
                // Scroll vers le champ en erreur si possible
                this.scrollToError(errorInfo.key);
                break;
            }
        }
    }

    scrollToError(fieldKey) {
        let targetElement = null;

        switch (fieldKey) {
            case 'firstName':
            case 'lastName':
            case 'phone':
            case 'district':
            case 'date':
                targetElement = document.getElementById(fieldKey);
                break;
            case 'services':
                targetElement = document.getElementById('services-container');
                break;
            case 'timeSlot':
                targetElement = document.querySelector('.time-slots');
                break;
            case 'photos':
                targetElement = document.getElementById('photo-previews');
                break;
        }

        if (targetElement) {
            targetElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Ajouter un effet visuel temporaire
            targetElement.style.outline = '2px solid #dc3545';
            setTimeout(() => {
                targetElement.style.outline = '';
            }, 3000);
        }
    }

    showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        if (!field) return;

        // Ajouter la classe d'erreur au champ
        field.classList.add('error');

        // Chercher ou créer l'élément d'erreur
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }

        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    clearFieldError(fieldName) {
        const field = document.getElementById(fieldName);
        if (!field) return;

        field.classList.remove('error');
        
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }

        // Supprimer de la liste des erreurs
        delete this.errors[fieldName];
    }

    showGlobalError(message) {
        const errorContainer = document.getElementById('form-global-error');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
            
            // Scroll vers l'erreur
            errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    clearGlobalError() {
        const errorContainer = document.getElementById('form-global-error');
        if (errorContainer) {
            errorContainer.style.display = 'none';
            errorContainer.textContent = '';
        }
    }

    updateAvailableSlots() {
        const dateField = document.getElementById('date');
        const slotsContainer = document.querySelector('.time-slots');
        
        if (!dateField || !dateField.value || !slotsContainer) {
            // TODO: Utiliser dataLayer.getSlotsByDate() au lieu de mockDataLayer
            return;
        }

        const availableSlots = window.mockDataLayer.getSlotsForDate(dateField.value);
        const slotButtons = slotsContainer.querySelectorAll('.time-slot');

        slotButtons.forEach(button => {
            const time = button.dataset.time;
            const slotInfo = availableSlots.find(slot => slot.time === time);
            
            if (slotInfo) {
                button.disabled = !slotInfo.available;
                button.classList.toggle('unavailable', !slotInfo.available);
                
                if (!slotInfo.available) {
                    button.title = 'Créneau non disponible';
                    // Désélectionner si c'était sélectionné
                    if (button.classList.contains('selected')) {
                        button.classList.remove('selected');
                        document.getElementById('selectedTime').value = '';
                    }
                } else {
                    button.title = '';
                }
            }
        });
    }

    reset() {
        this.errors = {};
        this.clearGlobalError();
        
        // Nettoyer toutes les erreurs de champs
        const errorElements = this.form.querySelectorAll('.field-error');
        errorElements.forEach(el => el.style.display = 'none');
        
        const errorFields = this.form.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
    }
}

// Instance globale
window.formValidation = new FormValidation();