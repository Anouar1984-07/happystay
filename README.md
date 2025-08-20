# Happy Stay - Landing Page

Landing page professionnelle pour Happy Stay, entreprise de nettoyage à domicile basée à Agadir, Maroc.

## 🌟 Fonctionnalités

- **Design Responsive** : Optimisé pour mobile, tablette et desktop
- **Multilingue** : Support complet FR/AR/EN avec sélecteur de langue
- **Performance Optimisée** : Images WebP, lazy loading, compression
- **Contact WhatsApp** : Intégration directe pour faciliter les contacts
- **SEO Optimisé** : Meta tags, structure sémantique, performance
- **Hébergement Hostinger** : Configuration prête pour déploiement

## 🎨 Design

- Palette de couleurs professionnelle (bleus #007BFF, #4BB5FF, #004C99)
- Typographie Inter pour une lisibilité optimale
- Animations et micro-interactions subtiles
- Interface inspirée des standards modernes du web

## 📱 Services Présentés

- Nettoyage de canapés, fauteuils et chaises
- Nettoyage de matelas avec désinfection
- Ménage standard et grand ménage
- Zone d'intervention : Agadir et région

## 🚀 Structure du Projet

```
/
├── index.html          # Page principale
├── styles.css          # Styles CSS
├── script.js           # JavaScript (multilingue + interactions)
├── .htaccess           # Configuration Apache
└── README.md          # Documentation
```

## ⚙️ Installation sur Hostinger

1. **Télécharger les fichiers** : Uploadez tous les fichiers via le gestionnaire de fichiers Hostinger
2. **Vérification** : Assurez-vous que `index.html` est dans le dossier `public_html`
3. **Configuration** : Le fichier `.htaccess` configure automatiquement :
   - Compression GZIP
   - Cache des ressources
   - Redirections
   - Sécurité

## 📞 Configuration Contact

**Important** : Mettez à jour les numéros de téléphone dans :
- `index.html` : Remplacez `+212600000000` par le vrai numéro
- `script.js` : Mettez à jour les URLs WhatsApp

## 🌍 Gestion Multilingue

Le système de traduction est géré en JavaScript :
- Français (par défaut)
- Arabe (avec support RTL)
- Anglais

## 📊 Optimisations Performance

- **Images** : Format WebP avec fallback
- **CSS/JS** : Minification et compression
- **Cache** : Configuration optimisée via .htaccess
- **SEO** : Structure HTML sémantique

## 🔧 Personnalisation

### Couleurs
Modifiez les variables CSS dans `styles.css` :
```css
:root {
    --primary-blue: #007BFF;
    --light-blue: #4BB5FF;
    --dark-blue: #004C99;
}
```

### Contenu
Mettez à jour les traductions dans `script.js` section `translations`.

## 📈 Analytics et Tracking

Ajoutez vos codes de suivi dans `script.js` fonction `initializeAnalytics()` :
- Google Analytics
- Facebook Pixel
- Autres outils de tracking

## 🛠️ Technologies Utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Grid, Flexbox, Animations
- **JavaScript ES6+** : Interactions et multilingue
- **Font Awesome** : Icônes
- **Google Fonts** : Typographie Inter

## 📱 Compatibilité

- ✅ Chrome, Firefox, Safari, Edge
- ✅ iOS Safari, Chrome Mobile
- ✅ Responsive : 320px → 1920px+
- ✅ Support RTL pour l'arabe

## 🚀 Déploiement Rapide

1. Compressez tous les fichiers en ZIP
2. Connectez-vous à votre panneau Hostinger
3. Allez dans le Gestionnaire de fichiers
4. Uploadez et extrayez dans `public_html`
5. Testez votre site !

## 📞 Support

Pour toute question technique, contactez le développeur ou consultez la documentation Hostinger.

---

**Happy Stay** - Votre partenaire de confiance pour le nettoyage à Agadir ! 🏠✨