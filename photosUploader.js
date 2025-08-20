// Photos Uploader - Gestion des photos obligatoires (2-4)
// Happy Stay - Formulaire de demande de devis

import { dataLayer } from './js/data-layer/index.js';

class PhotosUploader {
    constructor() {
        this.photos = [];
        const limits = window.HS_CONFIG?.getPhotoLimits() || { min: 2, max: 4 };
        this.maxPhotos = limits.max;
        this.minPhotos = limits.min;
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        console.log('📸 PhotosUploader: Utilisation du DataLayer', dataLayer.constructor.name);
        this.init();
    }

    init() {
        this.galleryBtn = document.getElementById('gallery-btn');
        this.cameraBtn = document.getElementById('camera-btn');
        this.galleryInput = document.getElementById('photos-gallery');
        this.cameraInput = document.getElementById('photos-camera');
        this.previewContainer = document.getElementById('photo-previews');
        this.counter = document.getElementById('photos-counter');
        this.errorContainer = document.getElementById('photos-error');

        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        if (this.galleryBtn) {
            this.galleryBtn.addEventListener('click', () => {
                if (this.photos.length < this.maxPhotos) {
                    this.galleryInput.click();
                }
            });
        }

        if (this.cameraBtn) {
            this.cameraBtn.addEventListener('click', () => {
                if (this.photos.length < this.maxPhotos) {
                    this.cameraInput.click();
                }
            });
        }

        if (this.galleryInput) {
            this.galleryInput.addEventListener('change', (e) => this.handleFileSelection(e));
        }

        if (this.cameraInput) {
            this.cameraInput.addEventListener('change', (e) => this.handleFileSelection(e));
        }
    }

    handleFileSelection(event) {
        const files = Array.from(event.target.files);
        
        // Réinitialiser l'input pour permettre la sélection du même fichier
        event.target.value = '';

        files.forEach(file => {
            if (this.photos.length >= this.maxPhotos) {
                this.showError(`Maximum ${this.maxPhotos} photos autorisées`);
                return;
            }

            if (!this.validateFile(file)) {
                return;
            }

            this.addPhoto(file);
        });
    }

    validateFile(file) {
        // Vérifier le type
        if (!this.acceptedTypes.includes(file.type)) {
            this.showError(`Format non supporté: ${file.name}. Utilisez JPG, PNG ou WebP.`);
            return false;
        }

        // Vérifier la taille
        if (file.size > this.maxFileSize) {
            this.showError(`Fichier trop volumineux: ${file.name}. Maximum 5MB.`);
            return false;
        }

        return true;
    }

    addPhoto(file) {
        const photoId = Date.now() + Math.random().toString(36).substr(2, 9);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const photo = {
                id: photoId,
                file: file,
                url: e.target.result,
                name: file.name,
                size: file.size
            };

            this.photos.push(photo);
            this.renderPhoto(photo);
            this.updateUI();
            this.clearError();
        };

        reader.onerror = () => {
            this.showError(`Erreur lors de la lecture du fichier: ${file.name}`);
        };

        reader.readAsDataURL(file);
    }

    renderPhoto(photo) {
        if (!this.previewContainer) return;

        const photoElement = document.createElement('div');
        photoElement.className = 'photo-preview';
        photoElement.id = `photo-${photo.id}`;
        
        photoElement.innerHTML = `
            <div class="photo-image">
                <img src="${photo.url}" alt="${photo.name}" loading="lazy">
                <div class="photo-overlay">
                    <button type="button" class="remove-photo-btn" onclick="removePhoto('${photo.id}')" title="Supprimer cette photo">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="photo-info">
                <span class="photo-name">${this.truncateFileName(photo.name)}</span>
                <span class="photo-size">${this.formatFileSize(photo.size)}</span>
            </div>
        `;

        this.previewContainer.appendChild(photoElement);
    }

    removePhoto(photoId) {
        this.photos = this.photos.filter(photo => photo.id !== photoId);
        
        const photoElement = document.getElementById(`photo-${photoId}`);
        if (photoElement) {
            photoElement.remove();
        }

        this.updateUI();
        this.clearError();
    }

    // Nouvelle méthode pour upload via DataLayer
    async uploadToDataLayer() {
        if (this.photos.length === 0) {
            return { success: false, error: 'Aucune photo à uploader' };
        }
        
        const files = this.photos.map(photo => photo.file);
        
        try {
            return await dataLayer.uploadPhotos(files);
        } catch (error) {
            console.error('Erreur upload photos:', error);
            return { success: false, error: error.message };
        }
    }

    updateUI() {
        // Mettre à jour le compteur
        if (this.counter) {
            this.counter.textContent = `${this.photos.length}/${this.maxPhotos}`;
            
            // Changer la couleur selon le statut
            this.counter.className = 'photos-counter';
            if (this.photos.length < this.minPhotos) {
                this.counter.classList.add('insufficient');
            } else if (this.photos.length >= this.maxPhotos) {
                this.counter.classList.add('full');
            } else {
                this.counter.classList.add('valid');
            }
        }

        // Mettre à jour les boutons
        const isMaxReached = this.photos.length >= this.maxPhotos;
        
        if (this.galleryBtn) {
            this.galleryBtn.disabled = isMaxReached;
            this.galleryBtn.classList.toggle('disabled', isMaxReached);
        }

        if (this.cameraBtn) {
            this.cameraBtn.disabled = isMaxReached;
            this.cameraBtn.classList.toggle('disabled', isMaxReached);
        }

        // Mettre à jour le message d'aide
        this.updateHelpMessage();
    }

    updateHelpMessage() {
        const helpElement = document.getElementById('photos-help');
        if (!helpElement) return;

        let message = '';
        const count = this.photos.length;

        if (count === 0) {
            message = 'Ajoutez 2 à 4 photos (vue d\'ensemble + zones à traiter).';
        } else if (count < this.minPhotos) {
            const needed = this.minPhotos - count;
            message = `Ajoutez encore ${needed} photo${needed > 1 ? 's' : ''} (minimum ${this.minPhotos}).`;
        } else if (count >= this.minPhotos && count < this.maxPhotos) {
            const remaining = this.maxPhotos - count;
            message = `Parfait ! Vous pouvez ajouter ${remaining} photo${remaining > 1 ? 's' : ''} de plus.`;
        } else {
            message = 'Maximum atteint (4 photos).';
        }

        helpElement.textContent = message;
    }

    showError(message) {
        if (this.errorContainer) {
            this.errorContainer.textContent = message;
            this.errorContainer.style.display = 'block';
            
            // Auto-hide après 5 secondes
            setTimeout(() => this.clearError(), 5000);
        }
    }

    clearError() {
        if (this.errorContainer) {
            this.errorContainer.style.display = 'none';
            this.errorContainer.textContent = '';
        }
    }

    truncateFileName(name, maxLength = 20) {
        if (name.length <= maxLength) return name;
        
        const extension = name.split('.').pop();
        const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
        const truncated = nameWithoutExt.substring(0, maxLength - extension.length - 4) + '...';
        
        return truncated + '.' + extension;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    isValid() {
        return this.photos.length >= this.minPhotos && this.photos.length <= this.maxPhotos;
    }

    getPhotos() {
        console.log('Photos disponibles:', this.photos.length);
        return this.photos.map(photo => ({
            url: photo.url,
            name: photo.name,
            size: photo.size
        }));
    }

    reset() {
        this.photos = [];
        if (this.previewContainer) {
            this.previewContainer.innerHTML = '';
        }
        this.updateUI();
        this.clearError();
    }
}

// Fonction globale pour supprimer une photo
window.removePhoto = function(photoId) {
    if (window.photosUploader) {
        window.photosUploader.removePhoto(photoId);
    }
};

// Instance globale
window.photosUploader = new PhotosUploader();