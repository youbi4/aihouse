const CONFIG = {
    SUPABASE_URL: 'https://rmmgzviytfpwedstuhly.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbWd6dml5dGZwd2Vkc3R1aGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NzAwNTYsImV4cCI6MjA4ODE0NjA1Nn0.KemNQ3DUcyDwtCL5MZuFmcL-0COiIs2-yyoXxfIZ1P8',
    SCRIPT_URLS: [
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',
        'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js'
    ]
};

let supabaseClient = null;
let supabaseReady = null;
function loadSupabaseScript() {
    if (supabaseReady !== null) return supabaseReady;
    if (typeof window.supabase !== 'undefined') {
        supabaseReady = Promise.resolve();
        return supabaseReady;
    }
    
    let tryIndex = 0;
    function tryLoad() {
        return new Promise((resolve, reject) => {
            if (tryIndex >= CONFIG.SCRIPT_URLS.length) {
                reject(new Error('Could not load Supabase library'));
                return;
            }
            const url = CONFIG.SCRIPT_URLS[tryIndex];
            const script = document.createElement('script');
            script.src = url;
            script.crossOrigin = 'anonymous';
            script.async = false;
            script.onload = () => {
                if (typeof window.supabase !== 'undefined') resolve();
                else reject(new Error('Supabase loaded but not ready'));
            };
            script.onerror = () => {
                tryIndex++;
                tryLoad().then(resolve, reject);
            };
            document.head.appendChild(script);
        });
    }
    
    supabaseReady = tryLoad();
    return supabaseReady;
}

async function getSupabaseClient() {
    await loadSupabaseScript();
    if (!supabaseClient && window.supabase) {
        supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    }
    return supabaseClient;
}

async function isUserAdmin() {
    try {
        const client = await getSupabaseClient();

        const { data: { user }, error: userError } = await client.auth.getUser();
        if (userError || !user) return false;
        const { data, error } = await client
            .from('users')
            .select('is_admin')
            .eq('id', user.id)
            .single();
        if (error) throw error;
        return data?.is_admin === true;
    } catch (e) {
        console.error('Error checking admin status:', e);
        return false;
    }
}

async function isUserGuest() {
    const client = await getSupabaseClient();
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user) return false;
    return user.guest === true;
}

async function redirectIfNotAdmin() {
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
        showNotification('Access Denied: Admin only', 'error');
        setTimeout(() => {
            window.location.href = '/pages/homepage.html';
        }, 1500);
        return false;
    }
    return true;
}

async function redirectIfGuest() {
    const client = await getSupabaseClient();
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user) return false;
    if (user.guest) {
        showNotification('You must have an account first', 'warning');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 2000);
        return false;
    }
    return true;
}

//notification
function showNotification(message, type = 'info', duration = 3000) {
    const existing = document.querySelectorAll('.notification-alert');
    existing.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification-alert notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${escapeHtml(message)}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification-alert {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 20px;
                border-radius: 12px;
                font-weight: 500;
                font-size: 14px;
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 300px;
                max-width: 400px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(100%); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            @keyframes slideOutRight {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(100%); }
            }
            
            .notification-info {
                background: #3b82f6;
                color: white;
            }
            
            .notification-success {
                background: #10b981;
                color: white;
            }
            
            .notification-error {
                background: #ef4444;
                color: white;
            }
            
            .notification-warning {
                background: #f59e0b;
                color: white;
            }
            
            .notification-close {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: auto;
                transition: background 0.2s;
            }
            
            .notification-close:hover {
                background: rgba(255,255,255,0.3);
            }
            
            @media (max-width: 480px) {
                .notification-alert {
                    left: 16px;
                    right: 16px;
                    min-width: auto;
                    max-width: none;
                    top: 80px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}


function getDefaultAvatarUrl(name) {
    return '/assets/uhbc_logo.svg';
}

function getAvatarUrl(user) {
    if (!user) return getDefaultAvatarUrl('User');
    
    if (user.avatar_url && user.avatar_url.trim() !== '') {
        return user.avatar_url;
    }
    
    return getDefaultAvatarUrl(user.full_name || user.email || 'User');
}

function hasCustomAvatar(user) {
    return !!(user?.avatar_url && user.avatar_url.trim() !== '');
}

function getInitials(name) {
    if (!name) return 'U';
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}


// ==========================================
// DATABASE / USER FUNCTIONS
// ==========================================

async function getUserById(userId) {
    if (!userId) return null;
    const client = await getSupabaseClient();
    const { data } = await client.from('users').select('*').eq('id', userId).single();
    return data;
}

async function getAllUsers() {
    const client = await getSupabaseClient();
    const { data } = await client.from('users').select('*').order('created_at', { ascending: false });
    return data || [];
}

async function updateUserProfile(userId, updates) {
    if (!userId) return { error: new Error('User ID missing') };
    const client = await getSupabaseClient();
    return await client.from('users').update(updates).eq('id', userId).select().single();
}

async function deleteUser(userId) {
    if (!userId) return { error: new Error('User ID missing') };
    const client = await getSupabaseClient();
    return await client.from('users').delete().eq('id', userId);
}

async function toggleUserAdmin(userId, isAdmin) {
    if (!userId) return { error: new Error('User ID missing') };
    const client = await getSupabaseClient();
    return await client.from('users').update({ is_admin: isAdmin }).eq('id', userId).select().single();
}



function formatDate(dateString, options = {}) {
    if (!dateString) return 'Unknown';
    const defaultOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        ...options 
    };
    try {
        return new Date(dateString).toLocaleDateString('en-US', defaultOptions);
    } catch (e) {
        return 'Invalid Date';
    }
}

function formatDateTime(dateString) {
    return formatDate(dateString, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getInitials(name) {
    if (!name) return 'U';
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
