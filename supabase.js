// Configuration Supabase partagée avec admin.puydecom.fr
const SUPABASE_URL = 'https://ltqkbtfdjvslqktjtbod.supabase.co';
// Note: La clé publique sera ajoutée depuis les variables d'environnement
const SUPABASE_ANON_KEY = 'your_supabase_anon_key_here';

// Création du client Supabase
const { createClient } = supabase;
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Middleware d'authentification
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
            console.error('Erreur lors de la vérification de session:', error);
            redirectToLogin();
            return null;
        }
        
        if (!session) {
            redirectToLogin();
            return null;
        }
        
        return session;
    } catch (error) {
        console.error('Erreur de connexion:', error);
        redirectToLogin();
        return null;
    }
}

// Redirection vers la page de login
function redirectToLogin() {
    if (window.location.pathname !== '/login.html') {
        window.location.href = '/login.html';
    }
}

// Connexion utilisateur
async function signIn(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            throw error;
        }
        
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Déconnexion globale (valable pour admin et prod)
async function signOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        
        if (error) {
            throw error;
        }
        
        // Redirection vers login après déconnexion
        window.location.href = '/login.html';
        return { success: true };
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        return { success: false, error: error.message };
    }
}

// Obtenir l'utilisateur actuel
async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (error) {
            throw error;
        }
        
        return user;
    } catch (error) {
        console.error('Erreur lors de la récupération utilisateur:', error);
        return null;
    }
}

// Écouter les changements d'état d'authentification
function onAuthStateChange(callback) {
    return supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (event === 'SIGNED_OUT') {
            window.location.href = '/login.html';
        }
        
        if (callback) {
            callback(event, session);
        }
    });
}

// Initialisation automatique pour toutes les pages (sauf login)
async function initAuth() {
    if (window.location.pathname === '/login.html') {
        return;
    }
    
    const session = await checkAuth();
    if (session) {
        console.log('Utilisateur connecté:', session.user.email);
        
        // Mettre à jour l'interface utilisateur si nécessaire
        updateUIWithUser(session.user);
    }
}

// Mettre à jour l'interface avec les infos utilisateur
function updateUIWithUser(user) {
    const userEmailElements = document.querySelectorAll('[data-user-email]');
    userEmailElements.forEach(el => {
        el.textContent = user.email;
    });
    
    const userNameElements = document.querySelectorAll('[data-user-name]');
    userNameElements.forEach(el => {
        el.textContent = user.user_metadata?.full_name || user.email.split('@')[0];
    });
}

// Utilitaires pour les requêtes à la base de données
async function executeQuery(query, params = []) {
    try {
        const session = await checkAuth();
        if (!session) return null;
        
        // Exemple de requête - à adapter selon votre structure de base
        const { data, error } = await supabaseClient
            .from(query.table)
            .select(query.select)
            .eq(query.where?.field, query.where?.value);
            
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('Erreur de requête:', error);
        return null;
    }
}

// Fonctions spécifiques aux clients
async function getClients() {
    try {
        const { data, error } = await supabaseClient
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erreur lors de la récupération des clients:', error);
        return [];
    }
}

// Fonctions spécifiques aux posts
async function getPosts(clientId = null) {
    try {
        let query = supabaseClient
            .from('posts')
            .select('*, clients(name, logo_url)')
            .order('created_at', { ascending: false });
            
        if (clientId) {
            query = query.eq('client_id', clientId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erreur lors de la récupération des posts:', error);
        return [];
    }
}

// Créer un nouveau post
async function createPost(postData) {
    try {
        const session = await checkAuth();
        if (!session) return null;
        
        const { data, error } = await supabaseClient
            .from('posts')
            .insert([{
                ...postData,
                created_by: session.user.id,
                created_at: new Date().toISOString()
            }])
            .select();
            
        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Erreur lors de la création du post:', error);
        return null;
    }
}

// Utilitaires de notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-black' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', initAuth);

// Écouteur pour les boutons de déconnexion
document.addEventListener('click', (e) => {
    if (e.target.matches('[data-logout]')) {
        e.preventDefault();
        signOut();
    }
});

// Exposition des fonctions globales
window.PuyDeComAuth = {
    checkAuth,
    signIn,
    signOut,
    getCurrentUser,
    onAuthStateChange,
    getClients,
    getPosts,
    createPost,
    showNotification
};