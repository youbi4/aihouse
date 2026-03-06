
const SUPABASE_URL = 'https://rmmgzviytfpwedstuhly.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbWd6dml5dGZwd2Vkc3R1aGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NzAwNTYsImV4cCI6MjA4ODE0NjA1Nn0.KemNQ3DUcyDwtCL5MZuFmcL-0COiIs2-yyoXxfIZ1P8';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let supabaseClient = null;
let supabaseReady = null;

const SUPABASE_SCRIPT_URLS = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',
    'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js'
];

// Load Supabase Library
function loadSupabaseScript() {
    if (supabaseReady !== null) return supabaseReady;
    if (typeof window.supabase !== 'undefined') {
        supabaseReady = Promise.resolve();
        return supabaseReady;
    }
    
    let tryIndex = 0;
    function tryLoad() {
        return new Promise((resolve, reject) => {
            if (tryIndex >= SUPABASE_SCRIPT_URLS.length) {
                reject(new Error('Could not load Supabase'));
                return;
            }
            const url = SUPABASE_SCRIPT_URLS[tryIndex];
            const script = document.createElement('script');
            script.src = url;
            script.crossOrigin = 'anonymous';
            script.async = false;
            script.onload = () => {
                if (typeof window.supabase !== 'undefined') resolve();
                else reject(new Error('Supabase not ready'));
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

// Get Supabase Client
async function getSupabaseClient() {
    await loadSupabaseScript();
    if (!supabaseClient && window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabaseClient;
}

// Get Current User from localStorage
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    } catch (e) {
        return null;
    }
}

// Set Current User in localStorage
function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

// Check if User is Admin
async function isUserAdmin() {
    const user = getCurrentUser();
    if (!user || !user.id) return false;
    
    try {
        const client = await getSupabaseClient();
        const { data, error } = await client
            .from('users')
            .select('is_admin')
            .eq('id', user.id)
            .single();
        
        if (error) return false;
        return data?.is_admin === true;
    } catch (e) {
        return false;
    }
}

// Redirect if Not Admin
async function redirectIfNotAdmin() {
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
        showNotification('Access Denied: Admin only', 'error');
        window.location.href = '/pages/homepage.html';
        return false;
    }
    return true;
}

// Redirect if Guest
function redirectIfGuest() {
    const user = getCurrentUser();
    if (!user) {
        showNotification('You must have an account first', 'warning');
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

// Show Notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification-alert');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification-alert notification-${type}`;
    notification.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = `
        .notification-alert {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 14px 24px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10000;
            animation: slideDown 0.3s ease;
        }
        
        @keyframes slideDown {
            from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
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
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// Format Date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Fetch User Data by ID
async function getUserById(userId) {
    try {
        const client = await getSupabaseClient();
        const { data, error } = await client
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        return data;
    } catch (e) {
        console.error('Error fetching user:', e);
        return null;
    }
}

// Fetch All Users
async function getAllUsers() {
    try {
        const client = await getSupabaseClient();
        const { data, error } = await client
            .from('users')
            .select('*');
        
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('Error fetching users:', e);
        return [];
    }
}

// Fetch All Events
async function getAllEvents() {
    try {
        const client = await getSupabaseClient();
        const { data, error } = await client
            .from('events')
            .select('*')
            .order('date', { ascending: true });
        
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('Error fetching events:', e);
        return [];
    }
}

// Create Event
async function createEvent(eventData) {
    try {
        const client = await getSupabaseClient();
        const user = getCurrentUser();
        
        if (!user) throw new Error('No user logged in');
        
        const { data, error } = await client
            .from('events')
            .insert([{
                ...eventData,
                created_by: user.id
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (e) {
        console.error('Error creating event:', e);
        throw e;
    }
}

// Delete Event
async function deleteEvent(eventId) {
    try {
        const client = await getSupabaseClient();
        const { error } = await client
            .from('events')
            .delete()
            .eq('id', eventId);
        
        if (error) throw error;
        return true;
    } catch (e) {
        console.error('Error deleting event:', e);
        throw e;
    }
}

// Register for Event
async function registerForEvent(eventId) {
    try {
        const client = await getSupabaseClient();
        const user = getCurrentUser();
        
        if (!user) throw new Error('No user logged in');
        
        const { data, error } = await client
            .from('event_registrations')
            .insert([{
                event_id: eventId,
                user_id: user.id
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (e) {
        console.error('Error registering for event:', e);
        throw e;
    }
}

// Unregister from Event
async function unregisterFromEvent(eventId) {
    try {
        const client = await getSupabaseClient();
        const user = getCurrentUser();
        
        if (!user) throw new Error('No user logged in');
        
        const { error } = await client
            .from('event_registrations')
            .delete()
            .eq('event_id', eventId)
            .eq('user_id', user.id);
        
        if (error) throw error;
        return true;
    } catch (e) {
        console.error('Error unregistering from event:', e);
        throw e;
    }
}

// Update User Profile
async function updateUserProfile(userId, updates) {
    try {
        const client = await getSupabaseClient();
        const { data, error } = await client
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();
        
        if (error) throw error;
        
        // Update localStorage if it's the current user
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            setCurrentUser({ ...currentUser, ...data });
        }
        
        return data;
    } catch (e) {
        console.error('Error updating profile:', e);
        throw e;
    }
}

// Update User Role
async function updateUserRole(userId, role) {
    try {
        const client = await getSupabaseClient();
        const { data, error } = await client
            .from('users')
            .update({ role })
            .eq('id', userId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (e) {
        console.error('Error updating role:', e);
        throw e;
    }
}

// Delete User
async function deleteUser(userId) {
    try {
        const client = await getSupabaseClient();
        const { error } = await client
            .from('users')
            .delete()
            .eq('id', userId);
        
        if (error) throw error;
        return true;
    } catch (e) {
        console.error('Error deleting user:', e);
        throw e;
    }
}

// Make User Admin
async function makeUserAdmin(userId, isAdmin = true) {
    try {
        const client = await getSupabaseClient();
        const { data, error } = await client
            .from('users')
            .update({ is_admin: isAdmin })
            .eq('id', userId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (e) {
        console.error('Error updating admin status:', e);
        throw e;
    }
}


async function registerUser(email, password, userData) {
  // Creates auth user and users table entry
}

async function loginUser(email, password) {
  // Authenticates user and stores in localStorage
}
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}
async function getUserById(userId) {
  // Fetches user profile from database
}
async function updateUser(userId, data) {
  // Updates user profile with new data
}
const email = "user@example.com";
const password = "securePassword123";
const userData = {
  full_name: "John Doe",
  username: "johndoe",
  role: "Student",
  department: "Computer Science"
};

const result = await registerUser(email, password, userData);
if (result.success) {
  console.log("User registered successfully!");
}
const result = await loginUser("user@example.com", "securePassword123");
if (result.success) {
  // User is now logged in, stored in localStorage
  window.location.href = '/pages/homepage.html';
}
const user = getCurrentUser();
const updateData = {
  full_name: "Jane Doe",
  bio: "AI researcher",
  role: "Researcher"
};

const result = await updateUser(user.id, updateData);
if (result.success) {
  showNotification("Profile updated!", "success");
}
async function createEvent(eventData) {
  const { data, error } = await supabase
    .from('events')
    .insert([{
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      event_date: eventData.event_date,
      category: eventData.category,
      image_url: eventData.image_url,
      capacity: eventData.capacity,
      created_by: getCurrentUser().id
    }]);
  
  return { success: !error, data, error };
}
async function registerEvent(eventId) {
  const user = getCurrentUser();
  const { data, error } = await supabase
    .from('event_registrations')
    .insert([{
      user_id: user.id,
      event_id: eventId
    }]);
  
  return { success: !error, data, error };
}

async function getAllEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*');
  
  return { success: !error, data, error };
}
async function getUserEvents(userId) {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('events(*)')
    .eq('user_id', userId);
  
  return { success: !error, data, error };
}
