// ==========================================
// PROFILE PAGE - Manage user profile
// ==========================================

(function() {
    // Initialize profile page
    async function initProfile() {
        // Redirect if not logged in
        if (!redirectIfGuest()) return;
        
        await loadUserProfile();
        setupFormHandlers();
        setupRoleChange();
        setupDeleteAccount();
    }
    
    // Load User Profile Data
    async function loadUserProfile() {
        const user = getCurrentUser();
        if (!user) return;
        
        try {
            const userData = await getUserById(user.id);
            if (!userData) {
                showNotification('Failed to load profile', 'error');
                return;
            }
            
            // Populate form with user data
            document.getElementById('fullName').value = userData.full_name || '';
            document.getElementById('username').value = userData.username || '';
            document.getElementById('email').value = userData.email || '';
            document.getElementById('role').value = userData.role || '';
            
            // Set display name and role
            document.getElementById('displayName').textContent = userData.full_name || 'User';
            document.getElementById('displayRole').textContent = userData.role || 'Member';
            
            // Handle "Other" role
            if (userData.role === 'Other' && userData.other_role) {
                document.getElementById('otherRole').value = userData.other_role;
                document.getElementById('otherRoleContainer').style.display = 'block';
            }
            
            // Load avatar if exists
            if (userData.avatar_url) {
                document.getElementById('profileImage').src = userData.avatar_url;
            }
            
            // Store for later comparison
            window.originalUserData = userData;
        } catch (e) {
            console.error('Error loading profile:', e);
            showNotification('Error loading profile data', 'error');
        }
    }
    
    // Setup Form Handlers
    function setupFormHandlers() {
        const form = document.getElementById('profileForm');
        const cancelBtn = document.getElementById('cancelBtn');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveProfile();
        });
        
        cancelBtn.addEventListener('click', () => {
            if (window.originalUserData) {
                document.getElementById('fullName').value = window.originalUserData.full_name || '';
                document.getElementById('username').value = window.originalUserData.username || '';
                document.getElementById('email').value = window.originalUserData.email || '';
                document.getElementById('role').value = window.originalUserData.role || '';
                document.getElementById('successMessage').classList.add('hidden');
            }
        });
    }
    
    // Save Profile Changes
    async function saveProfile() {
        const user = getCurrentUser();
        if (!user) return;
        
        const fullName = document.getElementById('fullName').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const role = document.getElementById('role').value;
        const otherRole = document.getElementById('otherRole').value.trim();
        
        // Validate
        let hasError = false;
        
        if (!fullName) {
            showFieldError('fullName', 'Full name is required');
            hasError = true;
        }
        if (!username) {
            showFieldError('username', 'Username is required');
            hasError = true;
        }
        if (!email) {
            showFieldError('email', 'Email is required');
            hasError = true;
        }
        if (!role) {
            showFieldError('role', 'Role is required');
            hasError = true;
        }
        
        if (hasError) return;
        
        const submitBtn = document.querySelector('.btn-primary');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        
        try {
            const updates = {
                full_name: fullName,
                username: username,
                email: email,
                role: role,
                other_role: role === 'Other' ? otherRole : null
            };
            
            await updateUserProfile(user.id, updates);
            
            document.getElementById('displayName').textContent = fullName;
            document.getElementById('displayRole').textContent = role === 'Other' ? otherRole : role;
            window.originalUserData = { ...window.originalUserData, ...updates };
            
            document.getElementById('successMessage').classList.remove('hidden');
            showNotification('Profile updated successfully!', 'success');
            
            setTimeout(() => {
                document.getElementById('successMessage').classList.add('hidden');
            }, 4000);
        } catch (e) {
            console.error('Error saving profile:', e);
            showNotification('Failed to save profile: ' + e.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Changes';
        }
    }
    
    // Setup Role Change Handler
    function setupRoleChange() {
        const roleSelect = document.getElementById('role');
        const otherRoleContainer = document.getElementById('otherRoleContainer');
        
        roleSelect.addEventListener('change', () => {
            if (roleSelect.value === 'Other') {
                otherRoleContainer.style.display = 'block';
            } else {
                otherRoleContainer.style.display = 'none';
            }
        });
    }
    
    // Setup Delete Account
    function setupDeleteAccount() {
        const deleteBtn = document.getElementById('deleteAccountBtn');
        
        deleteBtn.addEventListener('click', async () => {
            const confirmed = confirm(
                'Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.'
            );
            
            if (!confirmed) return;
            
            const doubleConfirmed = confirm(
                'This is your last chance to cancel. Click OK to permanently delete your account.'
            );
            
            if (!doubleConfirmed) return;
            
            deleteBtn.disabled = true;
            deleteBtn.textContent = 'Deleting...';
            
            try {
                const user = getCurrentUser();
                await deleteUser(user.id);
                
                localStorage.removeItem('currentUser');
                showNotification('Account deleted successfully', 'success');
                
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 2000);
            } catch (e) {
                console.error('Error deleting account:', e);
                showNotification('Failed to delete account: ' + e.message, 'error');
                deleteBtn.disabled = false;
                deleteBtn.textContent = 'Delete Account';
            }
        });
    }
    
    // Show Field Error
    function showFieldError(fieldName, message) {
        const errorElement = document.getElementById(fieldName + '-error');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
    
    // Clear Field Errors
    function clearFieldErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
    }
    
    // Clear errors on input
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('form-group') || 
            e.target.parentElement.classList.contains('form-group')) {
            clearFieldErrors();
        }
    });
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfile);
    } else {
        initProfile();
    }
})();
