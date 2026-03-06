// ==========================================
// PROFILE PAGE - Manage user profile
// ==========================================

(function() {
    // Initialize profile page
    async function initProfile() {
        if (!redirectIfGuest()) return;
        
        await loadUserProfile();
        setupFormHandlers();
        setupTabHandlers();
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
            
            // Generate initials for avatar
            const initials = userData.full_name
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
            
            // Set avatar
            const avatarContainer = document.getElementById('avatarContainer');
            if (avatarContainer) {
                avatarContainer.textContent = initials;
            }
            
            // Set display information
            document.getElementById('displayName').textContent = userData.full_name || 'User';
            document.getElementById('displayUsername').textContent = `@${userData.username || 'user'} · ${userData.department || 'N/A'} · UHBC`;
            document.getElementById('displayRole').textContent = userData.role || 'Member';
            document.getElementById('displayBio').textContent = userData.bio || 'No bio yet. Click Edit to add one!';
            
            // Populate form fields
            document.getElementById('fullName').value = userData.full_name || '';
            document.getElementById('department').value = userData.department || '';
            document.getElementById('role').value = userData.role || '';
            document.getElementById('bio').value = userData.bio || '';
            document.getElementById('settingsEmail').value = userData.email || '';
            
            if (userData.role === 'Other' && userData.other_role) {
                document.getElementById('otherRole').value = userData.other_role;
                document.getElementById('otherRoleContainer').style.display = 'block';
            }
            
            // Store for comparison
            window.originalUserData = userData;
        } catch (e) {
            console.error('Error loading profile:', e);
            showNotification('Error loading profile data', 'error');
        }
    }
    
    // Setup Form Handlers
    function setupFormHandlers() {
        const form = document.getElementById('profileForm');
        const editBtn = document.getElementById('editProfileBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');
        const editPanel = document.getElementById('editPanel');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                editPanel.classList.toggle('hidden');
                if (!editPanel.classList.contains('hidden')) {
                    editBtn.textContent = '✖️ Close';
                } else {
                    editBtn.textContent = '✏️ Edit Profile';
                }
            });
        }
        
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await saveProfile();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (window.originalUserData) {
                    document.getElementById('fullName').value = window.originalUserData.full_name || '';
                    document.getElementById('department').value = window.originalUserData.department || '';
                    document.getElementById('role').value = window.originalUserData.role || '';
                    document.getElementById('bio').value = window.originalUserData.bio || '';
                }
                editPanel.classList.add('hidden');
                editBtn.textContent = '✏️ Edit Profile';
            });
        }
    }
    
    // Save Profile Changes
    async function saveProfile() {
        const user = getCurrentUser();
        if (!user) return;
        
        const fullName = document.getElementById('fullName').value.trim();
        const department = document.getElementById('department').value.trim();
        const email = document.getElementById('email').value.trim();
        const role = document.getElementById('role').value;
        const bio = document.getElementById('bio').value.trim();
        const otherRole = document.getElementById('otherRole').value.trim();
        
        // Validate
        let hasError = false;
        
        if (!fullName) {
            showFieldError('fullName', 'Full name is required');
            hasError = true;
        }
        
        if (!role) {
            showFieldError('role', 'Role is required');
            hasError = true;
        }
        
        if (hasError) return;
        
        try {
            const updateData = {
                full_name: fullName,
                department: department,
                role: role,
                bio: bio,
                other_role: role === 'Other' ? otherRole : null,
                updated_at: new Date().toISOString()
            };
            
            const result = await updateUser(user.id, updateData);
            if (result.success) {
                showNotification('Profile updated successfully!', 'success');
                
                // Update display
                const initials = fullName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                
                document.getElementById('avatarContainer').textContent = initials;
                document.getElementById('displayName').textContent = fullName;
                document.getElementById('displayRole').textContent = role;
                document.getElementById('displayBio').textContent = bio || 'No bio yet. Click Edit to add one!';
                
                // Show success alert
                const successAlert = document.getElementById('successAlert');
                successAlert.classList.remove('hidden');
                setTimeout(() => {
                    successAlert.classList.add('hidden');
                }, 3000);
                
                // Close edit panel
                document.getElementById('editPanel').classList.add('hidden');
                document.getElementById('editProfileBtn').textContent = '✏️ Edit Profile';
                
                // Update stored data
                window.originalUserData = { ...window.originalUserData, ...updateData };
            } else {
                showNotification('Failed to update profile', 'error');
            }
        } catch (e) {
            console.error('Error saving profile:', e);
            showNotification('Error updating profile', 'error');
        }
    }
    
    // Setup Tab Handlers
    function setupTabHandlers() {
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                
                // Remove active class from all buttons and panes
                tabButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                
                // Add active class to clicked button and corresponding pane
                button.classList.add('active');
                const pane = document.getElementById(`${tabName}-tab`);
                if (pane) {
                    pane.classList.add('active');
                }
            });
        });
    }
    
    // Setup Role Change
    function setupRoleChange() {
        const roleSelect = document.getElementById('role');
        const otherRoleContainer = document.getElementById('otherRoleContainer');
        
        if (roleSelect) {
            roleSelect.addEventListener('change', (e) => {
                if (e.target.value === 'Other') {
                    otherRoleContainer.style.display = 'block';
                } else {
                    otherRoleContainer.style.display = 'none';
                }
            });
        }
    }
    
    // Setup Delete Account
    function setupDeleteAccount() {
        // Delete account functionality would go here
    }
    
    // Show Field Error
    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorEl = document.getElementById(`${fieldId}-error`);
        
        if (field) {
            field.classList.add('error');
        }
        
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
        }
        
        // Clear error on input
        if (field) {
            field.addEventListener('input', () => {
                field.classList.remove('error');
                if (errorEl) {
                    errorEl.textContent = '';
                    errorEl.classList.remove('show');
                }
            }, { once: true });
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfile);
    } else {
        initProfile();
    }
})();
