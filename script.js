(function() {
    // --- Supabase config: replace with your project URL and anon key from Supabase Dashboard → Settings → API ---
    const SUPABASE_URL = 'https://rmmgzviytfpwedstuhly.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbWd6dml5dGZwd2Vkc3R1aGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NzAwNTYsImV4cCI6MjA4ODE0NjA1Nn0.KemNQ3DUcyDwtCL5MZuFmcL-0COiIs2-yyoXxfIZ1P8';

    const SUPABASE_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase.min.js';

    let supabase = null;
    let resetEmail = '';
    let supabaseReady = null;

    function loadSupabaseScript() {
        if (supabaseReady !== null) return supabaseReady;
        if (typeof window.supabase !== 'undefined') {
            supabaseReady = Promise.resolve();
            return supabaseReady;
        }
        supabaseReady = new Promise(function(resolve, reject) {
            var s = document.createElement('script');
            s.src = SUPABASE_SCRIPT_URL;
            s.async = false;
            s.onload = function() { resolve(); };
            s.onerror = function() {
                reject(new Error('Could not load Supabase. Open this page from a local web server (e.g. Live Server) and check your internet connection.'));
            };
            document.head.appendChild(s);
        });
        return supabaseReady;
    }

    function getSupabase() {
        if (!supabase) {
            if (typeof window.supabase === 'undefined') {
                throw new Error('Supabase not loaded yet. Open this page from a local web server (e.g. Live Server in VS Code), not by double-clicking the file.');
            }
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        return supabase;
    }

    function showRegister() { switchPage('register'); }
    function showLogin() {
        switchPage('login');
        cancelForgot();
    }

    function switchPage(page) {
        const loginPage = document.getElementById('login-page');
        const registerPage = document.getElementById('register-page');
        const brandPanel = document.querySelector(page === 'login' ? '#login-page .brand-panel' : '#register-page .brand-panel');
        const formPanel = document.querySelector(page === 'login' ? '#login-page .form-panel' : '#register-page .form-panel');
        const brandContent = document.querySelector(page === 'login' ? '#login-page .brand-content' : '#register-page .brand-content');

        loginPage.style.display = page === 'login' ? 'flex' : 'none';
        registerPage.style.display = page === 'register' ? 'flex' : 'none';

        if (brandPanel) {
            brandPanel.classList.remove('animate-in');
            setTimeout(() => brandPanel.classList.add('animate-in'), 10);
        }
        if (formPanel) {
            formPanel.classList.remove('animate-in');
            setTimeout(() => formPanel.classList.add('animate-in'), 10);
        }
        if (brandContent) {
            brandContent.classList.remove('animate-fade');
            setTimeout(() => brandContent.classList.add('animate-fade'), 10);
        }

        clearForms();
        if (page === 'register') setupRegisterValidation();
    }

    function clearForms() {
        document.querySelectorAll('input, select').forEach(el => {
            el.value = '';
            el.classList.remove('success', 'error');
        });
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.style.display = 'none';
            msg.textContent = '';
        });
        document.getElementById('other-role-container').style.display = 'none';
        if (document.getElementById('other-role')) document.getElementById('other-role').value = '';
        const regBtn = document.getElementById('register-submit');
        if (regBtn) {
            regBtn.disabled = false;
            regBtn.classList.remove('loading');
            regBtn.textContent = 'Sign up';
        }
    }

    function showForgotStep1() {
        document.getElementById('login-default').classList.add('hidden');
        document.getElementById('forgot-container').classList.remove('hidden');
        document.getElementById('forgot-step1').classList.remove('hidden');
        document.getElementById('forgot-step2').classList.add('hidden');
        document.getElementById('reset-email').value = '';
    }

    function cancelForgot() {
        document.getElementById('login-default').classList.remove('hidden');
        document.getElementById('forgot-container').classList.add('hidden');
    }

    async function requestResetCode() {
        const email = document.getElementById('reset-email').value.trim();
        if (!email) { showNotification('Enter your email', 'error'); return; }

        try {
            await loadSupabaseScript();
        } catch (err) {
            showNotification(err.message || 'Supabase failed to load.', 'error');
            return;
        }

        getSupabase().auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + window.location.pathname
        }).then(({ error }) => {
            if (error) {
                showNotification(error.message || 'Failed to send reset email', 'error');
                return;
            }
            resetEmail = email;
            document.getElementById('reset-email-display').innerText = `📧 ${email}`;
            document.getElementById('forgot-step1').classList.add('hidden');
            document.getElementById('forgot-step2').classList.remove('hidden');
            showNotification('Check your email for the password reset link.', 'success');
        });
    }

    async function resendCode() {
        if (!resetEmail) return;
        try {
            await loadSupabaseScript();
        } catch (err) {
            showNotification(err.message || 'Supabase failed to load.', 'error');
            return;
        }
        getSupabase().auth.resetPasswordForEmail(resetEmail, {
            redirectTo: window.location.origin + window.location.pathname
        }).then(({ error }) => {
            if (error) showNotification(error.message || 'Failed to resend', 'error');
            else showNotification('Reset link sent again.', 'success');
        });
    }

    function togglePassword(id) {
        const input = document.getElementById(id);
        input.type = input.type === 'password' ? 'text' : 'password';
        const span = input.nextElementSibling;
        if (span && span.classList.contains('toggle-password')) span.textContent = input.type === 'password' ? '👁️' : '👁️‍🗨️';
    }

    function handleRoleChange() {
        const role = document.getElementById('role').value;
        document.getElementById('other-role-container').style.display = role === 'Other' ? 'block' : 'none';
    }

    async function handleRegister(e) {
        e.preventDefault();
        const fullname = document.getElementById('fullname').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const otherRole = document.getElementById('other-role').value.trim();
        const roleCustom = role === 'Other' ? otherRole : null;

        if (!fullname || !username || !email || !password || !role) {
            showNotification('All fields required', 'error');
            return;
        }
        if (password.length < 8) {
            showNotification('Password must be at least 8 characters', 'error');
            return;
        }

        try {
            await loadSupabaseScript();
        } catch (err) {
            showNotification(err.message || 'Supabase failed to load.', 'error');
            return;
        }

        const btn = document.getElementById('register-submit');
        const originalLabel = btn.textContent;
        btn.disabled = true;
        btn.classList.add('loading');
        btn.textContent = '';

        try {
            const { data, error } = await getSupabase().auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullname, username, role, role_custom: roleCustom }
                }
            });

            if (error) {
                showNotification(error.message || 'Sign up failed', 'error');
                btn.disabled = false;
                btn.classList.remove('loading');
                btn.textContent = originalLabel;
                return;
            }

            // Try to insert profile into public.users (works if RLS allows, e.g. when email confirmation is off)
            const { error: insertError } = await getSupabase().from('users').insert({
                id: data.user.id,
                full_name: fullname,
                username,
                email,
                password_hash: null,
                role,
                role_custom: roleCustom,
                is_guest: false
            });

            if (insertError) {
                // If insert fails (e.g. RLS with email confirmation on), the DB trigger will create the row
                console.warn('Profile insert skipped (trigger may create row):', insertError.message);
            }

            showNotification('Registered! Please sign in.', 'success');
            setTimeout(() => showLogin(), 1200);
        } catch (err) {
            showNotification(err.message || 'Sign up failed', 'error');
            btn.disabled = false;
            btn.classList.remove('loading');
            btn.textContent = originalLabel;
            return;
        }
        btn.disabled = false;
        btn.classList.remove('loading');
        btn.textContent = originalLabel;
    }

    async function handleLogin(e) {
        e.preventDefault();
        const identifier = document.getElementById('login-identifier').value.trim();
        const password = document.getElementById('login-password').value;
        if (!identifier || !password) {
            showNotification('Both fields required', 'error');
            return;
        }

        try {
            await loadSupabaseScript();
        } catch (err) {
            showNotification(err.message || 'Supabase failed to load.', 'error');
            return;
        }

        const isEmail = identifier.includes('@');
        let emailToUse = identifier;

        if (!isEmail) {
            const { data: rows, error } = await getSupabase()
                .from('users')
                .select('email')
                .eq('username', identifier)
                .limit(1);
            if (error || !rows?.length) {
                showNotification('Invalid credentials', 'error');
                return;
            }
            emailToUse = rows[0].email;
        }

        try {
            const { data, error } = await getSupabase().auth.signInWithPassword({
                email: emailToUse,
                password
            });

            if (error) {
                showNotification(error.message || 'Invalid credentials', 'error');
                return;
            }

            const fullName = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || 'User';
            localStorage.setItem('currentUser', JSON.stringify({
                id: data.user.id,
                email: data.user.email,
                full_name: fullName
            }));
            showNotification('Login successful!', 'success');
            setTimeout(() => alert(`Welcome ${fullName}!`), 800);
        } catch (err) {
            showNotification(err.message || 'Invalid credentials', 'error');
        }
    }

    function continueAsGuest() {
        localStorage.setItem('currentUser', JSON.stringify({ guest: true, fullname: 'Guest' }));
        showNotification('Guest access', 'success');
        setTimeout(() => alert('Guest mode'), 600);
    }

    function showNotification(msg, type) {
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.style.background = type === 'success' ? '#017f02' : type === 'error' ? '#dc3545' : '#ff8a02';
        notif.textContent = msg;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2500);
    }

    function setupRegisterValidation() {
        document.getElementById('fullname').addEventListener('input', function() {
            const full = this.value;
            if (full) document.getElementById('username').value = full.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0.9.]/g, '');
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadSupabaseScript().catch(function() { /* will show message when user tries sign up / sign in */ });
        document.getElementById('show-login-link').addEventListener('click', (e) => { e.preventDefault(); showLogin(); });
        document.getElementById('show-register-link').addEventListener('click', (e) => { e.preventDefault(); showRegister(); });
        document.getElementById('forgot-password-link').addEventListener('click', (e) => { e.preventDefault(); showForgotStep1(); });
        document.getElementById('cancel-forgot-step1').addEventListener('click', (e) => { e.preventDefault(); cancelForgot(); });
        document.getElementById('cancel-forgot-step2').addEventListener('click', (e) => { e.preventDefault(); cancelForgot(); });
        document.getElementById('send-code-btn').addEventListener('click', (e) => { e.preventDefault(); requestResetCode(); });
        document.getElementById('resend-link').addEventListener('click', (e) => { e.preventDefault(); resendCode(); });

        document.getElementById('role').addEventListener('change', handleRoleChange);

        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                togglePassword(targetId);
            });
        });

        document.getElementById('register-form').addEventListener('submit', handleRegister);
        document.getElementById('login-form').addEventListener('submit', handleLogin);

        showLogin();
        if (window.location.hash === '#register') showRegister();
    });
})();
