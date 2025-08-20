// Services Cart - Gestion du panier multi-services
// Happy Stay - Formulaire de demande de devis

import { dataLayer } from './js/data-layer/index.js';
import { validateReservation } from './js/data-layer/reservation-schema.js';

export class ServicesCart {
    constructor() {
        this.services = [];
        this.nextId = 1;
        this.container = null;
        this.addButton = null;
        this.initialized = false;
        this.validatedServices = new Set(); // Services validés par l'utilisateur
        console.log('🛒 ServicesCart: Utilisation du DataLayer', dataLayer.constructor.name);
    }

    init() {
        if (this.initialized) {
            console.log('ServicesCart déjà initialisé, ignoré');
            return;
        }
        
        console.log('ServicesCart.init() appelé');
        this.container = document.getElementById('services-container');
        this.addButton = document.getElementById('add-service-btn');
        
        console.log('Container trouvé:', !!this.container);
        console.log('Bouton trouvé:', !!this.addButton);
        
        if (this.addButton) {
            // Supprimer les anciens event listeners pour éviter les doublons
            this.addButton.removeEventListener('click', this.handleAddService);
            this.handleAddService = () => this.addService();
            this.addButton.addEventListener('click', this.handleAddService);
            console.log('Event listener ajouté au bouton');
        } else {
            console.error('Bouton add-service-btn non trouvé !');
        }
        
        if (!this.container) {
            console.error('Container services-container non trouvé !');
            return;
        }
        
        // Marquer comme initialisé
        this.initialized = true;
        console.log('ServicesCart initialisé');
    }

    addService(serviceType = '') {
        console.log('addService() appelé avec type:', serviceType);
        
        if (!this.container) {
            console.error('Container non disponible pour ajouter un service');
            return null;
        }
        
        const serviceId = this.nextId++;
        const service = {
            id: serviceId,
            type: serviceType,
            data: {}
        };
        
        this.services.push(service);
        console.log('Service ajouté:', service);
        this.renderService(service);
        this.updateAddButton();
        
        return serviceId;
    }

    removeService(serviceId) {
        this.services = this.services.filter(s => s.id !== serviceId);
        const element = document.getElementById(`service-${serviceId}`);
        if (element) {
            element.remove();
        }
        console.log('Service supprimé, services restants:', this.services.length);
        this.updateAddButton();
    }

    validateService(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;

        if (this.isServiceValid(service)) {
            this.validatedServices.add(serviceId);
            console.log('Service validé:', serviceId);
            this.updateServiceStatus(serviceId, 'validated');
            this.updateValidationButton(serviceId);
            this.collapseAndRenameService(serviceId);
        } else {
            console.log('Service incomplet, impossible de valider:', serviceId);
            this.showServiceError(serviceId, 'Veuillez remplir tous les champs obligatoires');
        }
    }

    updateValidationButton(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        const button = document.getElementById(`validate-btn-${serviceId}`);
        
        if (!service || !button) return;

        const isComplete = this.isServiceValid(service);
        const isValidated = this.validatedServices.has(serviceId);

        button.disabled = !isComplete || isValidated;
        
        if (isValidated) {
            button.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span data-lang="validate-service-btn-validated">Service validé</span>
            `;
            button.classList.add('validated');
        } else if (isComplete) {
            button.innerHTML = `
                <i class="fas fa-check"></i>
                <span data-lang="validate-service-btn">Valider ce service</span>
            `;
            button.classList.remove('validated');
        } else {
            button.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span data-lang="validate-service-btn-complete">Compléter le service</span>
            `;
            button.classList.remove('validated');
        }
    }

    updateServiceStatus(serviceId, status) {
        const statusElement = document.getElementById(`service-status-${serviceId}`);
        if (!statusElement) return;

        const statusText = statusElement.querySelector('.status-text');
        if (!statusText) return;

        switch (status) {
            case 'validated':
                statusText.setAttribute('data-lang', 'service-status-validated');
                statusText.textContent = '✅ Service validé et prêt';
                statusElement.className = 'service-status validated';
                break;
            case 'complete':
                statusText.setAttribute('data-lang', 'service-status-complete');
                statusText.textContent = '⚠️ Service complet - cliquez pour valider';
                statusElement.className = 'service-status complete';
                break;
            case 'incomplete':
                statusText.setAttribute('data-lang', 'service-status-incomplete');
                statusText.textContent = '❌ Service incomplet';
                statusElement.className = 'service-status incomplete';
                break;
            default:
                statusText.setAttribute('data-lang', 'service-status-not-configured');
                statusText.textContent = 'Service non configuré';
                statusElement.className = 'service-status';
        }
    }

    showServiceError(serviceId, message) {
        const statusElement = document.getElementById(`service-status-${serviceId}`);
        if (!statusElement) return;

        const statusText = statusElement.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = `❌ ${message}`;
            statusElement.className = 'service-status error';
            
            // Retour au statut normal après 3 secondes
            setTimeout(() => {
                this.updateServiceStatus(serviceId, 'incomplete');
            }, 3000);
        }
    }

    updateService(serviceId, data) {
        const service = this.services.find(s => s.id === serviceId);
        if (service) {
            service.data = { ...service.data, ...data };
            console.log('Service mis à jour:', service);
            this.updateServiceSummary(serviceId);
            this.updateValidationButton(serviceId);
            
            // Mettre à jour le statut
            if (this.isServiceValid(service)) {
                this.updateServiceStatus(serviceId, 'complete');
            } else {
                this.updateServiceStatus(serviceId, 'incomplete');
            }
        }
    }

    updateServiceSummary(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;

        const summaryElement = document.querySelector(`#service-${serviceId} .service-summary`);
        if (!summaryElement) return;

        let summary = '';
        const data = service.data;

        switch (service.type) {
            case 'Canapé/Fauteuil':
                const size = data.size || '';
                const quantity = data.quantity || 1;
                summary = `${size}, ${quantity}x`.trim();
                if (data.material) {
                    summary = `${size} ${data.material}, ${quantity}x`.trim();
                }
                break;
            case 'Chaises':
                const chairQuantity = data.quantity || 1;
                const chairMaterial = data.material || '';
                summary = `${chairQuantity}x chaises ${chairMaterial}`.trim();
                break;
            case 'Matelas':
                const format = data.format || '';
                const faces = data.faces || 1;
                summary = `Matelas ${format}, ${faces} face${faces > 1 ? 's' : ''}`.trim();
                break;
        }

        if (summary) {
            summaryElement.textContent = summary;
            summaryElement.removeAttribute('data-lang');
        } else {
            summaryElement.setAttribute('data-lang', 'service-card-summary-config');
            summaryElement.textContent = 'Configuration en cours...';
        }
    }

    renderService(service) {
        if (!this.container) return;

        const serviceElement = document.createElement('div');
        serviceElement.className = 'service-card';
        serviceElement.id = `service-${service.id}`;
        
        serviceElement.innerHTML = `
            <div class="service-header" onclick="toggleService(${service.id})">
                <div class="service-info">
                    <h4 class="service-title" data-lang="service-card-title">Service</h4>
                    <p class="service-summary" data-lang="service-card-summary-select">Sélectionnez un type de service</p>
                </div>
                <div class="service-actions">
                    <button type="button" class="remove-service-btn" onclick="removeService(${service.id})" title="Supprimer ce service">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button type="button" class="toggle-service-btn">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            </div>
            <div class="service-content">
                ${this.renderServiceTypeSelector(service.id)}
                <div id="service-fields-${service.id}" class="service-fields">
                    <!-- Les champs spécifiques apparaîtront ici -->
                </div>
                <div class="service-validation">
                    <button type="button" class="validate-service-btn" id="validate-btn-${service.id}" onclick="validateService(${service.id})" disabled data-lang="validate-service-btn">
                        <i class="fas fa-check"></i>
                        <span data-lang="validate-service-btn">Valider ce service</span>
                    </button>
                    <div class="service-status" id="service-status-${service.id}">
                        <span class="status-text" data-lang="service-status-not-configured">Service non configuré</span>
                    </div>
                </div>
            </div>
        `;

        this.container.appendChild(serviceElement);
    }

    renderServiceTypeSelector(serviceId) {
        return `
            <div class="form-group">
                <label for="service-type-${serviceId}" data-lang="service-type-label">Type de service *</label>
                <select id="service-type-${serviceId}" name="serviceType" required onchange="updateServiceType(${serviceId}, this.value)">
                    <option value="" data-lang="service-type-select">Sélectionnez un service</option>
                    <option value="Canapé/Fauteuil" data-lang="service-type-sofa">Canapé/Fauteuil</option>
                    <option value="Chaises" data-lang="service-type-chairs">Chaises</option>
                    <option value="Matelas" data-lang="service-type-mattress">Matelas</option>
                </select>
            </div>
        `;
    }

    renderServiceFields(serviceId, serviceType) {
        const fieldsContainer = document.getElementById(`service-fields-${serviceId}`);
        if (!fieldsContainer) return;

        let fieldsHTML = '';

        switch (serviceType) {
            case 'Canapé/Fauteuil':
                fieldsHTML = `
                    <div class="form-row">
                        <div class="form-group">
                            <label for="sofa-size-${serviceId}" data-lang="sofa-size-label">Taille *</label>
                            <select id="sofa-size-${serviceId}" name="size" required onchange="updateServiceData(${serviceId}, 'size', this.value)">
                                <option value="" data-lang="sofa-size-select">Sélectionnez</option>
                                <option value="1 place" data-lang="sofa-size-1">1 place</option>
                                <option value="2 places" data-lang="sofa-size-2">2 places</option>
                                <option value="3 places" data-lang="sofa-size-3">3 places</option>
                                <option value="Angle" data-lang="sofa-size-angle">Angle</option>
                                <option value="Méridienne" data-lang="sofa-size-meridienne">Méridienne</option>
                                <option value="Convertible" data-lang="sofa-size-convertible">Convertible</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="sofa-material-${serviceId}" data-lang="sofa-material-label">Matière</label>
                            <select id="sofa-material-${serviceId}" name="material" onchange="updateServiceData(${serviceId}, 'material', this.value)">
                                <option value="" data-lang="sofa-material-select">Sélectionnez</option>
                                <option value="Tissu" data-lang="sofa-material-tissu">Tissu</option>
                                <option value="Velours" data-lang="sofa-material-velours">Velours</option>
                                <option value="Microfibre" data-lang="sofa-material-microfibre">Microfibre</option>
                                <option value="Cuir" data-lang="sofa-material-cuir">Cuir</option>
                                <option value="Simili" data-lang="sofa-material-simili">Simili</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="sofa-stains-${serviceId}" data-lang="sofa-stains-label">Niveau de taches</label>
                            <select id="sofa-stains-${serviceId}" name="stains" onchange="updateServiceData(${serviceId}, 'stains', this.value)">
                                <option value="" data-lang="sofa-stains-select">Sélectionnez</option>
                                <option value="Aucune" data-lang="sofa-stains-none">Aucune</option>
                                <option value="Légères" data-lang="sofa-stains-light">Légères</option>
                                <option value="Importantes" data-lang="sofa-stains-heavy">Importantes</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="sofa-quantity-${serviceId}" data-lang="quantity-label">Quantité *</label>
                            <input type="number" id="sofa-quantity-${serviceId}" name="quantity" min="0" max="10" value="0" required onchange="updateServiceData(${serviceId}, 'quantity', this.value)">
                        </div>
                    </div>
                    <div class="form-group">
                        <label data-lang="options-label">Options (facultatives)</label>
                        <div class="checkbox-group">
                            <label class="checkbox-item">
                                <input type="checkbox" name="options" value="anti-acariens" onchange="updateServiceOptions(${serviceId}, this)">
                                <span class="checkmark"></span>
                                <span data-lang="option-anti-mites">Anti-acariens</span>
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" name="options" value="protection-anti-taches" onchange="updateServiceOptions(${serviceId}, this)">
                                <span class="checkmark"></span>
                                <span data-lang="option-protection">Protection anti-taches</span>
                            </label>
                        </div>
                    </div>
                `;
                break;

            case 'Chaises':
                fieldsHTML = `
                    <div class="form-row">
                        <div class="form-group">
                            <label for="chair-quantity-${serviceId}" data-lang="quantity-label">Quantité *</label>
                            <input type="number" id="chair-quantity-${serviceId}" name="quantity" min="0" max="20" value="0" required onchange="updateServiceData(${serviceId}, 'quantity', this.value)">
                        </div>
                        <div class="form-group">
                            <label for="chair-material-${serviceId}" data-lang="chair-material-label">Matière *</label>
                            <select id="chair-material-${serviceId}" name="material" required onchange="updateServiceData(${serviceId}, 'material', this.value)">
                                <option value="" data-lang="sofa-material-select">Sélectionnez</option>
                                <option value="Tissu" data-lang="chair-material-tissu">Tissu</option>
                                <option value="Similicuir" data-lang="chair-material-simili">Similicuir</option>
                                <option value="Bois + coussin" data-lang="chair-material-wood">Bois + coussin</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-item">
                            <input type="checkbox" name="removableCushion" onchange="updateServiceData(${serviceId}, 'removableCushion', this.checked)">
                            <span class="checkmark"></span>
                            <span data-lang="removable-cushion">Coussin amovible</span>
                        </label>
                    </div>
                `;
                break;

            case 'Matelas':
                fieldsHTML = `
                    <div class="form-row">
                        <div class="form-group">
                            <label for="mattress-format-${serviceId}" data-lang="mattress-format-label">Format *</label>
                            <select id="mattress-format-${serviceId}" name="format" required onchange="updateServiceData(${serviceId}, 'format', this.value)">
                                <option value="" data-lang="mattress-format-select">Sélectionnez</option>
                                <option value="90">90 cm</option>
                                <option value="140">140 cm</option>
                                <option value="160">160 cm</option>
                                <option value="180">180 cm</option>
                                <option value="King">King Size</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="mattress-faces-${serviceId}" data-lang="mattress-faces-label">Faces *</label>
                            <select id="mattress-faces-${serviceId}" name="faces" required onchange="updateServiceData(${serviceId}, 'faces', this.value)">
                                <option value="" data-lang="mattress-faces-select">Sélectionnez</option>
                                <option value="1" data-lang="mattress-faces-1">1 face</option>
                                <option value="2" data-lang="mattress-faces-2">2 faces</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="mattress-note-${serviceId}" data-lang="mattress-note-label">Remarque (optionnel)</label>
                        <input type="text" id="mattress-note-${serviceId}" name="note" maxlength="100" data-lang="mattress-note-placeholder" onchange="updateServiceData(${serviceId}, 'note', this.value)">
                    </div>
                `;
                break;
        }

        fieldsContainer.innerHTML = fieldsHTML;
    }

    updateAddButton() {
        if (this.addButton) {
            const maxServices = 5; // Limite raisonnable
            this.addButton.style.display = this.services.length >= maxServices ? 'none' : 'flex';
        }
    }

    hasValidatedServices() {
        return this.validatedServices.size > 0;
    }

    collapseAndRenameService(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;

        // Réduire la carte
        const serviceElement = document.getElementById(`service-${serviceId}`);
        if (serviceElement) {
            serviceElement.classList.add('collapsed');
        }

        // Renommer le titre avec le type de service
        const titleElement = serviceElement?.querySelector('.service-title');
        if (titleElement && service.type) {
            titleElement.textContent = service.type;
        }
    }

    getServices() {
        console.log('getServices() - Filtrage des services valides...');
        const validServices = this.services.filter(service => {
            const hasType = service.type && service.type.trim() !== '';
            const isValid = hasType && this.isServiceValid(service);
            console.log(`Service ${service.id}: type="${service.type}", hasType=${hasType}, isValid=${isValid}`);
            return isValid;
        });
        console.log(`Résultat: ${validServices.length} services valides sur ${this.services.length}`);
        return validServices;
    }

    // Nouvelle méthode pour générer le payload selon le schéma
    generateReservationPayload(formData) {
        const validServices = this.getServices();
        
        return {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            district: formData.district,
            date: formData.date,
            time: formData.selectedTime,
            items: validServices.map(service => ({
                service: service.type,
                label: this.generateServiceLabel(service),
                quantity: service.data.quantity || 1,
                ...service.data
            })),
            comments: formData.comments || ''
        };
    }

    generateServiceLabel(service) {
        const data = service.data;
        
        switch (service.type) {
            case 'Canapé/Fauteuil':
                let label = `${service.type}`;
                if (data.size) label += ` ${data.size}`;
                if (data.material) label += ` ${data.material}`;
                if (data.quantity > 1) label += ` (x${data.quantity})`;
                return label;
                
            case 'Chaises':
                let chairLabel = `${data.quantity || 1}x Chaises`;
                if (data.material) chairLabel += ` ${data.material}`;
                return chairLabel;
                
            case 'Matelas':
                let mattressLabel = `Matelas`;
                if (data.format) mattressLabel += ` ${data.format}`;
                if (data.faces) mattressLabel += ` (${data.faces} face${data.faces > 1 ? 's' : ''})`;
                return mattressLabel;
                
            default:
                return service.type;
        }
    }

    isServiceValid(service) {
        const data = service.data;
        
        console.log(`🔍 Validation service ${service.id} (${service.type}):`, data);
        
        switch (service.type) {
            case 'Canapé/Fauteuil':
                const isValidSofa = data.size && data.quantity > 0;
                console.log(`  Canapé/Fauteuil valide: ${isValidSofa}`, {
                    size: !!data.size,
                    quantity: data.quantity > 0
                });
                return isValidSofa;
            case 'Chaises':
                const isValidChair = data.quantity > 0 && data.material;
                console.log(`  Chaises valide: ${isValidChair}`, {
                    quantity: data.quantity > 0,
                    material: !!data.material
                });
                return isValidChair;
            case 'Matelas':
                const isValidMattress = data.format && data.faces;
                console.log(`  Matelas valide: ${isValidMattress}`, {
                    format: !!data.format,
                    faces: !!data.faces
                });
                return isValidMattress;
            default:
                console.log(`  ❌ Type de service non reconnu: ${service.type}`);
                return false;
        }
    }

    generatePayloadItems() {
        const validServices = this.getServices();
        console.log('Services valides pour le payload:', validServices);
        
        return validServices.map(service => {
            const item = {
                service: service.type,
                ...service.data
            };

            // Générer un label descriptif
            switch (service.type) {
                case 'Canapé/Fauteuil':
                    item.label = `${service.data.size} ${service.data.material}`;
                    break;
                case 'Chaises':
                    item.label = `${service.data.quantity}x Chaises ${service.data.material}`;
                    break;
                case 'Matelas':
                    item.label = `Matelas ${service.data.format}`;
                    break;
            }

            return item;
        });
    }

    reset() {
        this.services = [];
        this.nextId = 1;
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.updateAddButton();
    }
}

// Fonctions globales pour les événements
window.toggleService = function(serviceId) {
    const serviceElement = document.getElementById(`service-${serviceId}`);
    if (serviceElement) {
        serviceElement.classList.toggle('collapsed');
    }
};

window.removeService = function(serviceId) {
    if (window.servicesCart) {
        console.log('Suppression du service:', serviceId);
        window.servicesCart.removeService(serviceId);
    }
};

window.updateServiceType = function(serviceId, serviceType) {
    if (window.servicesCart) {
        const service = window.servicesCart.services.find(s => s.id === serviceId);
        if (service) {
            console.log('Mise à jour type de service:', serviceId, serviceType);
            service.type = serviceType;
            service.data = {}; // Reset data when type changes
            
            // Retirer de la liste des services validés si le type change
            window.servicesCart.validatedServices.delete(serviceId);
            
            // Remettre le titre par défaut et déplier la carte
            const serviceElement = document.getElementById(`service-${serviceId}`);
            if (serviceElement) {
                serviceElement.classList.remove('collapsed');
                const titleElement = serviceElement.querySelector('.service-title');
                if (titleElement) {
                    titleElement.textContent = `Service ${serviceId}`;
                }
            }
            
            window.servicesCart.renderServiceFields(serviceId, serviceType);
            window.servicesCart.updateServiceSummary(serviceId);
        }
    }
};

window.updateServiceData = function(serviceId, field, value) {
    if (window.servicesCart) {
        const updateData = {};
        updateData[field] = value;
        console.log('Mise à jour données service:', serviceId, field, value);
        window.servicesCart.updateService(serviceId, updateData);
    }
};

window.updateServiceOptions = function(serviceId, checkbox) {
    if (window.servicesCart) {
        const service = window.servicesCart.services.find(s => s.id === serviceId);
        if (service) {
            if (!service.data.options) {
                service.data.options = [];
            }
            
            if (checkbox.checked) {
                if (!service.data.options.includes(checkbox.value)) {
                    service.data.options.push(checkbox.value);
                }
            } else {
                service.data.options = service.data.options.filter(opt => opt !== checkbox.value);
            }
            
            console.log('Options mises à jour:', service.data.options);
            window.servicesCart.updateServiceSummary(serviceId);
        }
    }
};

// Fonctions globales pour les événements
window.toggleService = function(serviceId) {
    console.log('toggleService appelé pour:', serviceId);
    const serviceElement = document.getElementById(`service-${serviceId}`);
    if (serviceElement) {
        serviceElement.classList.toggle('collapsed');
    }
};

window.removeService = function(serviceId) {
    console.log('removeService appelé pour:', serviceId);
    if (window.servicesCart) {
        console.log('Suppression du service:', serviceId);
        window.servicesCart.removeService(serviceId);
    }
};

window.updateServiceType = function(serviceId, serviceType) {
    console.log('updateServiceType appelé:', serviceId, serviceType);
    if (window.servicesCart) {
        const service = window.servicesCart.services.find(s => s.id === serviceId);
        if (service) {
            console.log('Mise à jour type de service:', serviceId, serviceType);
            service.type = serviceType;
            service.data = {}; // Reset data when type changes
            
            // Retirer de la liste des services validés si le type change
            window.servicesCart.validatedServices.delete(serviceId);
            
            // Remettre le titre par défaut et déplier la carte
            const serviceElement = document.getElementById(`service-${serviceId}`);
            if (serviceElement) {
                serviceElement.classList.remove('collapsed');
                const titleElement = serviceElement.querySelector('.service-title');
                if (titleElement) {
                    titleElement.textContent = `Service ${serviceId}`;
                }
            }
            
            window.servicesCart.renderServiceFields(serviceId, serviceType);
            window.servicesCart.updateServiceSummary(serviceId);
        }
    }
};

window.updateServiceData = function(serviceId, field, value) {
    console.log('updateServiceData appelé:', serviceId, field, value);
    if (window.servicesCart) {
        const updateData = {};
        updateData[field] = value;
        console.log('Mise à jour données service:', serviceId, field, value);
        window.servicesCart.updateService(serviceId, updateData);
    }
};

window.updateServiceOptions = function(serviceId, checkbox) {
    console.log('updateServiceOptions appelé:', serviceId, checkbox.value, checkbox.checked);
    if (window.servicesCart) {
        const service = window.servicesCart.services.find(s => s.id === serviceId);
        if (service) {
            if (!service.data.options) {
                service.data.options = [];
            }
            
            if (checkbox.checked) {
                if (!service.data.options.includes(checkbox.value)) {
                    service.data.options.push(checkbox.value);
                }
            } else {
                service.data.options = service.data.options.filter(opt => opt !== checkbox.value);
            }
            
            console.log('Options mises à jour:', service.data.options);
            window.servicesCart.updateServiceSummary(serviceId);
        }
    }
};

// Fonction globale pour valider un service
window.validateService = function(serviceId) {
    console.log('validateService appelé pour:', serviceId);
    if (window.servicesCart) {
        window.servicesCart.validateService(serviceId);
    }
};
