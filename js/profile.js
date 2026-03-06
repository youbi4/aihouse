// ==========================================
// PROFILE PAGE - Manage user profile
// ==========================================

(function() {
    // Toggle between view and edit mode
    window.toggleEditMode = function() {
        const viewMode = document.getElementById('viewMode');
        const editMode = document.getElementById('editMode');
        
        viewMode.classList.toggle('hidden');
        editMode.classList.toggle('hidden');
        
        if (!editMode.classList.contains('hidden')) {
            populateFormFields();
        }
    };

    // Initialize profile page
    async function initProfile() {
        // Check if user is logged in
        const user = getCurrentUser();
        if (!user || user.guest) {
            showNotification('You must have an account first', 'warning');
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 2000);
            return;
        }

        // Load user profile data
        await loadUserProfile(user.id);
        setupFormHandler();
    }

    // Load user profile data
    async function loadUserProfile(userId) {
        try {
            const userData = await getUserById(userId);
            
            if (!userData) {
                showNotification('Failed to load profile', 'error');
                return;
            }

            // Update UI with user data
            updateProfileUI(userData);
            
            // Store for later use in edit form
            window.userData = userData;
        } catch (error) {
            console.error('[v0] Profile load error:', error);
            showNotification('Error loading profile', 'error');
        }
    }

    // Update profile UI with user data
    function updateProfileUI(userData) {
        const name = userData.full_name || 'User';
        const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

        // Avatar
        document.getElementById('profileAvatar').textContent = initials;

        // Name and role
        document.getElementById('profileName').textContent = name;
        document.getElementById('profileRole').textContent = userData.role || 'Member';
        document.getElementById('profileInfo').textContent = `@${userData.username || 'user'} · ${userData.department || 'Not specified'}`;

        // Bio
        document.getElementById('profileBio').textContent = userData.bio || 'No bio yet. Edit your profile to add one.';

        // Details
        document.getElementById('profileEmail').textContent = userData.email || '-';
        document.getElementById('profileDept').textContent = userData.department || '-';
        
        const joinDate = userData.created_at 
            ? new Date(userData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : 'Unknown';
        document.getElementById('profileJoined').textContent = joinDate;
    }

    // Populate form fields with current data
    function populateFormFields() {
        if (!window.userData) return;

        document.getElementById('editName').value = window.userData.full_name || '';
        document.getElementById('editEmail').value = window.userData.email || '';
        document.getElementById('editDept').value = window.userData.department || '';
        document.getElementById('editRole').value = window.userData.role || 'Student';
        document.getElementById('editBio').value = window.userData.bio || '';
    }

    // Setup form handler
    function setupFormHandler() {
        const form = document.getElementById('profileForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveProfile();
        });
    }

    // Save profile changes
    async function saveProfile() {
        try {
            const user = getCurrentUser();
            if (!user || !user.id) {
                showNotification('User not found', 'error');
                return;
            }

            const updates = {
                full_name: document.getElementById('editName').value.trim(),
                email: document.getElementById('editEmail').value.trim(),
                department: document.getElementById('editDept').value.trim(),
                role: document.getElementById('editRole').value,
                bio: document.getElementById('editBio').value.trim()
            };

            // Validate
            if (!updates.full_name || !updates.email) {
                showNotification('Name and email are required', 'error');
                return;
            }

            // Update in database
            const updated = await updateUserProfile(user.id, updates);
            
            if (updated) {
                // Update local storage
                setCurrentUser({
                    ...user,
                    ...updates
                });

                // Update UI
                updateProfileUI(updated);

                // Toggle back to view mode
                toggleEditMode();

                showNotification('Profile updated successfully!', 'success');
            }
        } catch (error) {
            console.error('[v0] Save profile error:', error);
            showNotification('Failed to save profile', 'error');
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfile);
    } else {
        initProfile();
    }
})();
