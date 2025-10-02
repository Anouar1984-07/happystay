// Composant Sidebar réutilisable pour PuyDeCom Admin
class AdminSidebar {
    constructor() {
        this.currentPage = this.getCurrentPage();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '');
        return page || 'dashboard';
    }

    generateSidebar() {
        return `
            <!-- Sidebar -->
            <div id="sidebar" class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200 transform -translate-x-full transition-transform duration-300 ease-in-out md:translate-x-0">
                <!-- Header Sidebar -->
                <div class="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-gradient-to-r from-puy-orange to-orange-500">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <span class="text-puy-orange font-bold text-sm">PC</span>
                        </div>
                        <div>
                            <h1 class="font-bold text-white text-sm">PuyDeCom</h1>
                            <p class="text-orange-100 text-xs">Admin Dashboard</p>
                        </div>
                    </div>
                    <button id="sidebar-close" class="md:hidden text-white hover:bg-white/20 p-1 rounded">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- Navigation -->
                <nav class="mt-8 pb-8 overflow-y-auto">
                    <!-- Section Général -->
                    <div class="px-6 mb-8">
                        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Général</h3>
                        <ul class="space-y-1">
                            ${this.createNavItem('dashboard', '📊', 'Dashboard', './dashboard.html')}
                            ${this.createNavItem('clients', '👥', 'Clients', './clients.html')}
                            ${this.createNavItem('projets', '🎯', 'Projets', './projets.html')}
                            ${this.createNavItem('leads', '🎣', 'Leads', './leads.html')}
                        </ul>
                    </div>

                    <!-- Section Analyse -->
                    <div class="px-6 mb-8">
                        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Analyse</h3>
                        <ul class="space-y-1">
                            ${this.createNavItem('calendrier', '📅', 'Calendrier', './calendrier.html')}
                            ${this.createNavItem('analyse360', '📈', 'Analyse 360', './analyse360.html')}
                        </ul>
                    </div>

                    <!-- Section Intelligence -->
                    <div class="px-6 mb-8">
                        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Intelligence</h3>
                        <ul class="space-y-1">
                            ${this.createNavItem('agents-ia', '🤖', 'Agents IA', './agents-ia.html')}
                        </ul>
                    </div>

                    <!-- Section Support -->
                    <div class="px-6">
                        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Support</h3>
                        <ul class="space-y-1">
                            <li>
                                <a href="https://puydecom.fr" target="_blank" class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                                    <span class="text-lg">🌐</span>
                                    <span class="font-medium text-sm">Site Principal</span>
                                    <svg class="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                    </svg>
                                </a>
                            </li>
                        </ul>
                    </div>
                </nav>

                <!-- Footer Sidebar -->
                <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <div class="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                                <span class="text-white text-xs font-bold" id="user-initials">AD</span>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-900" id="user-name">Admin</p>
                                <p class="text-xs text-gray-500">Connecté</p>
                            </div>
                        </div>
                        <button id="logout-sidebar" class="text-gray-400 hover:text-red-500 transition-colors" title="Déconnexion">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Overlay pour mobile -->
            <div id="sidebar-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden hidden"></div>
        `;
    }

    createNavItem(page, icon, label, href) {
        const isActive = this.currentPage === page;
        const activeClass = isActive
            ? 'bg-puy-orange text-white shadow-lg'
            : 'text-gray-700 hover:bg-gray-100';

        return `
            <li>
                <a href="${href}" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${activeClass} group">
                    <span class="text-lg">${icon}</span>
                    <span class="font-medium text-sm">${label}</span>
                    ${isActive ? '<div class="w-2 h-2 bg-white rounded-full ml-auto opacity-80"></div>' : ''}
                </a>
            </li>
        `;
    }

    generateTopBar() {
        return `
            <!-- Top Bar -->
            <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:ml-64">
                <!-- Bouton menu mobile + Titre -->
                <div class="flex items-center space-x-4">
                    <button id="sidebar-toggle" class="md:hidden text-gray-600 hover:text-gray-900 p-1">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                    <div>
                        <h1 id="page-title" class="text-xl font-semibold text-gray-900">Dashboard</h1>
                        <p id="page-subtitle" class="text-sm text-gray-600 hidden md:block">Vue d'ensemble de l'activité</p>
                    </div>
                </div>

                <!-- Actions rapides -->
                <div class="flex items-center space-x-3">
                    <!-- Notifications -->
                    <button class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-4-4V8a6 6 0 10-12 0v5L0 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                        </svg>
                        <div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                    </button>

                    <!-- Profil -->
                    <div class="flex items-center space-x-2">
                        <div class="hidden sm:block text-right">
                            <p class="text-sm font-medium text-gray-900" id="header-user-name">Admin</p>
                            <p class="text-xs text-gray-500" id="header-user-email">admin@puydecom.fr</p>
                        </div>
                        <button id="logout-header" class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </header>
        `;
    }

    setupEventListeners() {
        // Toggle sidebar mobile
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const sidebarClose = document.getElementById('sidebar-close');

        const toggleSidebar = () => {
            sidebar.classList.toggle('-translate-x-full');
            overlay.classList.toggle('hidden');
        };

        if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
        if (sidebarClose) sidebarClose.addEventListener('click', toggleSidebar);
        if (overlay) overlay.addEventListener('click', toggleSidebar);

        // Fermer sidebar au clic sur un lien (mobile)
        const sidebarLinks = document.querySelectorAll('#sidebar a[href^="./"]');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    sidebar.classList.add('-translate-x-full');
                    overlay.classList.add('hidden');
                }
            });
        });

        // Logout buttons
        const logoutButtons = document.querySelectorAll('#logout-sidebar, #logout-header');
        logoutButtons.forEach(button => {
            button.addEventListener('click', async () => {
                if (window.supabaseClient) {
                    await window.supabaseClient.auth.signOut();
                }
                window.location.href = './index.html';
            });
        });
    }

    updatePageInfo(title, subtitle = '') {
        const pageTitle = document.getElementById('page-title');
        const pageSubtitle = document.getElementById('page-subtitle');

        if (pageTitle) pageTitle.textContent = title;
        if (pageSubtitle) {
            pageSubtitle.textContent = subtitle;
            pageSubtitle.classList.toggle('hidden', !subtitle);
        }
    }

    async loadUserInfo() {
        if (window.supabaseClient) {
            try {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (user) {
                    const initials = user.email.substring(0, 2).toUpperCase();
                    const name = user.user_metadata?.full_name || 'Admin';

                    // Update sidebar user info
                    const userInitials = document.getElementById('user-initials');
                    const userName = document.getElementById('user-name');
                    if (userInitials) userInitials.textContent = initials;
                    if (userName) userName.textContent = name;

                    // Update header user info
                    const headerUserName = document.getElementById('header-user-name');
                    const headerUserEmail = document.getElementById('header-user-email');
                    if (headerUserName) headerUserName.textContent = name;
                    if (headerUserEmail) headerUserEmail.textContent = user.email;
                }
            } catch (error) {
                console.error('Erreur lors du chargement des infos utilisateur:', error);
            }
        }
    }

    init() {
        // Générer la structure HTML
        const sidebarHTML = this.generateSidebar();
        const topBarHTML = this.generateTopBar();

        // Injecter au début du body
        document.body.insertAdjacentHTML('afterbegin', sidebarHTML + topBarHTML);

        // Ajuster le contenu principal
        const mainContent = document.querySelector('main, .main-content, #main-content');
        if (mainContent) {
            mainContent.classList.add('md:ml-64', 'pt-16');
        }

        // Setup event listeners
        this.setupEventListeners();

        // Charger les infos utilisateur
        this.loadUserInfo();

        console.log('✅ AdminSidebar initialisé');
    }
}

// Fonction utilitaire pour initialiser la sidebar
window.initAdminSidebar = function(pageTitle, pageSubtitle) {
    const sidebar = new AdminSidebar();
    sidebar.init();

    // Mettre à jour le titre de la page si fourni
    if (pageTitle) {
        sidebar.updatePageInfo(pageTitle, pageSubtitle);
    }

    return sidebar;
};