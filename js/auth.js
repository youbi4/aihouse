(function() {
    // --- Supabase config: replace with your project URL and anon key from Supabase Dashboard → Settings → API ---
    const SUPABASE_URL = 'https://rmmgzviytfpwedstuhly.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbWd6dml5dGZwd2Vkc3R1aGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NzAwNTYsImV4cCI6MjA4ODE0NjA1Nn0.KemNQ3DUcyDwtCL5MZuFmcL-0COiIs2-yyoXxfIZ1P8';

    var SUPABASE_SCRIPT_URLS = [
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',
        'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js'
    ];

    let supabase = null;
    let resetEmail = '';
    let supabaseReady = null;

    function loadSupabaseScript() {
        if (supabaseReady !== null) return supabaseReady;
        if (typeof window.supabase !== 'undefined') {
            supabaseReady = Promise.resolve();
            return supabaseReady;
        }
        var tryIndex = 0;
        function tryLoad() {
            return new Promise(function(resolve, reject) {
                if (tryIndex >= SUPABASE_SCRIPT_URLS.length) {
                    reject(new Error('Could not load Supabase. Check your connection or try again.'));
                    return;
                }
                var url = SUPABASE_SCRIPT_URLS[tryIndex];
                var s = document.createElement('script');
                s.src = url;
                s.crossOrigin = 'anonymous';
                s.async = false;
                s.onload = function() {
                    if (typeof window.supabase !== 'undefined') resolve();
                    else reject(new Error('Supabase script loaded but not ready.'));
                };
                s.onerror = function() {
                    tryIndex++;
                    tryLoad().then(resolve, reject);
                };
                document.head.appendChild(s);
            });
        }
        supabaseReady = tryLoad();
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
        document.getElementById('forgot-step1').classList.remove('hidden');
        document.getElementById('forgot-step2').classList.add('hidden');
        document.getElementById('forgot-step3').classList.add('hidden');
    }

    function isRecoveryHash() {
        var hash = window.location.hash || '';
        return hash.indexOf('type=recovery') !== -1 || hash.indexOf('recovery') !== -1;
    }

    function showRecoveryStep() {
        document.getElementById('login-default').classList.add('hidden');
        document.getElementById('forgot-container').classList.remove('hidden');
        document.getElementById('forgot-step1').classList.add('hidden');
        document.getElementById('forgot-step2').classList.add('hidden');
        document.getElementById('forgot-step3').classList.remove('hidden');
        document.getElementById('new-password-input').value = '';
        document.getElementById('confirm-password-input').value = '';
        document.getElementById('new-password-error').textContent = '';
        document.getElementById('new-password-error').style.display = 'none';
        document.getElementById('confirm-password-error').textContent = '';
        document.getElementById('confirm-password-error').style.display = 'none';
    }

    function hideRecoveryStep() {
        document.getElementById('forgot-step3').classList.add('hidden');
        document.getElementById('login-default').classList.remove('hidden');
        document.getElementById('forgot-container').classList.add('hidden');
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } else {
            window.location.hash = '';
        }
    }

    async function handleSetNewPassword() {
        var newPwd = document.getElementById('new-password-input').value;
        var confirmPwd = document.getElementById('confirm-password-input').value;
        var errNew = document.getElementById('new-password-error');
        var errConfirm = document.getElementById('confirm-password-error');
        errNew.textContent = '';
        errNew.style.display = 'none';
        errConfirm.textContent = '';
        errConfirm.style.display = 'none';

        if (!newPwd || newPwd.length < 8) {
            errNew.textContent = 'Password must be at least 8 characters';
            errNew.style.display = 'block';
            return;
        }
        if (newPwd !== confirmPwd) {
            errConfirm.textContent = 'Passwords do not match';
            errConfirm.style.display = 'block';
            return;
        }

        try {
            await loadSupabaseScript();
        } catch (err) {
            showNotification(err.message || 'Supabase failed to load.', 'error');
            return;
        }

        var btn = document.getElementById('set-new-password-btn');
        btn.disabled = true;
        btn.textContent = 'Updating...';

        var _supabase = getSupabase();
        var _session = await _supabase.auth.getSession();
        if (!_session.data.session) {
            showNotification('Session expired. Please request a new reset link.', 'error');
            hideRecoveryStep();
            btn.disabled = false;
            btn.textContent = 'Set new password';
            return;
        }

        var _result = await _supabase.auth.updateUser({ password: newPwd });
        btn.disabled = false;
        btn.textContent = 'Set new password';

        if (_result.error) {
            showNotification(_result.error.message || 'Failed to update password', 'error');
            return;
        }

        showNotification('Password updated! You can sign in with your new password.', 'success');
        await _supabase.auth.signOut();
        hideRecoveryStep();
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
                .eq('username', identifier.toLowerCase())
                .limit(1);
            if (error || !rows?.length) {
                showNotification('No account found with that username or email.', 'error');
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
                showNotification(error.message || 'Invalid username/email or password.', 'error');
                return;
            }

            const fullName = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || 'User';
            localStorage.setItem('currentUser', JSON.stringify({
                id: data.user.id,
                email: data.user.email,
                full_name: fullName
            }));
            showNotification('Login successful!', 'success');
            setTimeout(function() { window.location.href = 'home.html'; }, 800);
        } catch (err) {
            showNotification(err.message || 'Invalid credentials', 'error');
        }
    }

    function continueAsGuest() {
        localStorage.setItem('currentUser', JSON.stringify({ guest: true, full_name: 'Guest' }));
        showNotification('You\'re browsing as Guest.', 'success');
        setTimeout(function() { window.location.href = 'home.html'; }, 600);
    }

    function showGuestBanner(forceShow) {
        var banner = document.getElementById('guest-banner');
        if (!banner) return;
        try {
            var current = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (forceShow === true || (forceShow !== false && current && current.guest)) {
                banner.classList.remove('hidden');
            } else {
                banner.classList.add('hidden');
            }
        } catch (_) {
            banner.classList.add('hidden');
        }
    }

    function signOutGuest() {
        localStorage.removeItem('currentUser');
        showGuestBanner(false);
        showNotification('Signed out of guest mode.', 'success');
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

    document.addEventListener('DOMContentLoaded', function() {
        loadSupabaseScript().catch(function() { /* will show message when user tries sign up / sign in */ });

        document.getElementById('show-login-link').addEventListener('click', function(e) { e.preventDefault(); showLogin(); });
        document.getElementById('show-register-link').addEventListener('click', function(e) { e.preventDefault(); showRegister(); });
        document.getElementById('forgot-password-link').addEventListener('click', function(e) { e.preventDefault(); showForgotStep1(); });
        document.getElementById('cancel-forgot-step1').addEventListener('click', function(e) { e.preventDefault(); cancelForgot(); });
        document.getElementById('cancel-forgot-step2').addEventListener('click', function(e) { e.preventDefault(); cancelForgot(); });
        document.getElementById('send-code-btn').addEventListener('click', function(e) { e.preventDefault(); requestResetCode(); });
        document.getElementById('resend-link').addEventListener('click', function(e) { e.preventDefault(); resendCode(); });

        document.getElementById('guest-btn').addEventListener('click', function(e) { e.preventDefault(); continueAsGuest(); });
        var guestSignUp = document.getElementById('guest-sign-up-link');
        if (guestSignUp) guestSignUp.addEventListener('click', function(e) { e.preventDefault(); showRegister(); });
        var guestSignOut = document.getElementById('guest-sign-out-link');
        if (guestSignOut) guestSignOut.addEventListener('click', function(e) { e.preventDefault(); signOutGuest(); });

        var setNewPwdBtn = document.getElementById('set-new-password-btn');
        if (setNewPwdBtn) setNewPwdBtn.addEventListener('click', function(e) { e.preventDefault(); handleSetNewPassword(); });
        var cancelRecovery = document.getElementById('cancel-recovery-link');
        if (cancelRecovery) cancelRecovery.addEventListener('click', function(e) { e.preventDefault(); hideRecoveryStep(); showLogin(); });

        document.getElementById('role').addEventListener('change', handleRoleChange);

        document.querySelectorAll('.toggle-password').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var targetId = this.getAttribute('data-target');
                togglePassword(targetId);
            });
        });

        document.getElementById('register-form').addEventListener('submit', handleRegister);
        document.getElementById('login-form').addEventListener('submit', handleLogin);

        if (isRecoveryHash()) {
            showLogin();
            loadSupabaseScript().then(function() {
                getSupabase();
                showRecoveryStep();
            }).catch(function() {
                showNotification('Could not load. Please try the reset link again.', 'error');
                if (window.history && window.history.replaceState) {
                    window.history.replaceState(null, '', window.location.pathname + window.location.search);
                }
            });
            return;
        }

        showGuestBanner();
        showLogin();
        if (window.location.hash === '#register') showRegister();
    });
})();
