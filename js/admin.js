document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verify user is logged in AND is an admin
    const isGuest = await isUserGuest();
    const isAdmin = await isUserAdmin();

    if (isGuest || !isAdmin) {
        showNotification('Unauthorized access', 'error');
        setTimeout(() => {
            window.location.href = '/pages/profile.html';
        }, 1500);
        return;
    }

    // 2. Load all users
    const allUsers = await getAllUsers();
    
    // 3. Update stats
    const adminsCount = allUsers.filter(u => u.is_admin).length;
    document.getElementById('stat-users').textContent = allUsers.length;
    document.getElementById('stat-admins').textContent = adminsCount;

    // 4. Render users table
    const tableBody = document.getElementById('adminUsersTableBody');
    if (!allUsers || allUsers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No users found.</td></tr>';
        return;
    }

    tableBody.innerHTML = allUsers.map(user => {
        let roleName = user.role || (user.guest ? 'Guest' : 'Member');
        let roleClass = user.guest ? 'role-guest' : 'role-user';

        const adminBadge = user.is_admin ? '<span class="role-badge role-admin" style="background: rgba(168, 85, 247, 0.1); color: #c084fc;">Yes</span>' : '<span class="role-badge role-user" style="background: rgba(156, 163, 175, 0.1); color: #9ca3af;">No</span>';
        
        const initials = getInitials(user.full_name || user.email);
        
        // Generate Action Buttons
        const isAdminBtnText = user.is_admin ? 'Remove Admin' : 'Make Admin';
        const isAdminBtnClass = user.is_admin ? 'btn-secondary' : 'btn-primary';
        
        return `
            <tr>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar-small">${initials}</div>
                        <strong>${escapeHtml?.(user.full_name) || 'Unknown'}</strong>
                    </div>
                </td>
                <td>${escapeHtml?.(user.email) || 'N/A'}</td>
                <td><span class="role-badge ${roleClass}">${roleName}</span></td>
                <td>${adminBadge}</td>
                <td>${formatDate?.(user.created_at) || 'Unknown'}</td>
                <td>
                    <button class="btn ${isAdminBtnClass} btn-sm toggle-admin-btn" style="padding: 4px 8px; font-size: 0.75rem;" data-id="${user.id}" data-isadmin="${user.is_admin}">
                        ${isAdminBtnText}
                    </button>
                    <button class="btn btn-secondary btn-sm delete-user-btn" style="padding: 4px 8px; font-size: 0.75rem; border-color: #ef4444; color: #ef4444;" data-id="${user.id}">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // 5. Setup Action Listeners
    setupAdminActions();
});

function setupAdminActions() {
    const adminToggleBtns = document.querySelectorAll('.toggle-admin-btn');
    const deleteBtns = document.querySelectorAll('.delete-user-btn');

    adminToggleBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const userId = btn.getAttribute('data-id');
            const currentStatus = btn.getAttribute('data-isadmin') === 'true';
            
            if (confirm(`Are you sure you want to ${currentStatus ? 'revoke admin rights from' : 'grant admin rights to'} this user?`)) {
                btn.disabled = true;
                btn.textContent = 'Updating...';
                
                const { error } = await toggleUserAdmin(userId, !currentStatus);
                if (error) {
                    showNotification('Failed to update admin status', 'error');
                    btn.disabled = false;
                    btn.textContent = currentStatus ? 'Remove Admin' : 'Make Admin';
                } else {
                    showNotification('User admin status updated', 'success');
                    setTimeout(() => window.location.reload(), 800);
                }
            }
        });
    });

    deleteBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const userId = btn.getAttribute('data-id');
            
            if (confirm('Are you ABSOLUTELY sure you want to delete this user? This cannot be undone.')) {
                btn.disabled = true;
                btn.textContent = 'Deleting...';
                
                const { error } = await deleteUser(userId);
                if (error) {
                    showNotification('Failed to delete user', 'error');
                    btn.disabled = false;
                    btn.textContent = 'Delete';
                } else {
                    showNotification('User deleted successfully', 'success');
                    setTimeout(() => window.location.reload(), 800);
                }
            }
        });
    });
}
