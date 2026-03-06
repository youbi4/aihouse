// ==========================================
// ADMIN DASHBOARD - Manage users and events
// ==========================================

(function() {
    let allMembers = [];
    let allEvents = [];
    let selectedMemberId = null;
    
    // Initialize admin page
    async function initAdmin() {
        // Check if user is admin
        if (!(await redirectIfNotAdmin())) return;
        
        await loadMembers();
        await loadEvents();
        setupEventListeners();
        updateStats();
    }
    
    // Load All Members
    async function loadMembers() {
        try {
            const members = await getAllUsers();
            allMembers = members;
            renderMembersTable(members);
        } catch (e) {
            console.error('Error loading members:', e);
            showNotification('Failed to load members', 'error');
        }
    }
    
    // Render Members Table
    function renderMembersTable(members) {
        const tbody = document.getElementById('membersTableBody');
        
        if (members.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No members found</td></tr>';
            return;
        }
        
        tbody.innerHTML = members.map(member => `
            <tr>
                <td>${escapeHtml(member.full_name || 'N/A')}</td>
                <td>${escapeHtml(member.username || 'N/A')}</td>
                <td>${escapeHtml(member.email || 'N/A')}</td>
                <td>
                    <span>${escapeHtml(member.role || 'N/A')}</span>
                    ${member.is_admin ? '<span class="admin-badge">ADMIN</span>' : ''}
                </td>
                <td><span class="status-badge">Active</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-edit" onclick="window.changeRole('${member.id}', '${member.role}')">Change Role</button>
                        <button class="action-btn btn-delete" onclick="window.deleteMember('${member.id}', '${escapeHtml(member.full_name)}')">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    // Load All Events
    async function loadEvents() {
        try {
            const events = await getAllEvents();
            allEvents = events;
            renderEventsGrid(events);
        } catch (e) {
            console.error('Error loading events:', e);
            showNotification('Failed to load events', 'error');
        }
    }
    
    // Render Events Grid
    function renderEventsGrid(events) {
        const grid = document.getElementById('eventsGrid');
        
        if (events.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px;">No events found. Create one to get started.</div>';
            return;
        }
        
        grid.innerHTML = events.map(event => `
            <div class="event-card">
                <div class="event-card-header">
                    <h3>${escapeHtml(event.title)}</h3>
                    <p>${escapeHtml(event.category || 'Event')}</p>
                </div>
                <div class="event-card-body">
                    <div class="event-details">
                        <p><strong>Date:</strong> ${formatDate(event.date)}</p>
                        <p><strong>Location:</strong> ${escapeHtml(event.location || 'N/A')}</p>
                        <p><strong>Description:</strong> ${escapeHtml(event.description || 'N/A').substring(0, 100)}...</p>
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-primary" onclick="window.editEvent('${event.id}')">Edit</button>
                        <button class="btn btn-delete" onclick="window.deleteEvent('${event.id}', '${escapeHtml(event.title)}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Update Stats
    function updateStats() {
        document.getElementById('totalMembers').textContent = allMembers.length;
        document.getElementById('totalEvents').textContent = allEvents.length;
    }
    
    // Setup Event Listeners
    function setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                switchTab(tabName);
            });
        });
        
        // Add Event Button
        const addEventBtn = document.getElementById('addEventBtn');
        if (addEventBtn) {
            addEventBtn.addEventListener('click', () => {
                document.getElementById('addEventForm').classList.toggle('hidden');
            });
        }
        
        // Cancel Event Button
        const cancelEventBtn = document.getElementById('cancelEventBtn');
        if (cancelEventBtn) {
            cancelEventBtn.addEventListener('click', () => {
                document.getElementById('addEventForm').classList.add('hidden');
                document.getElementById('eventForm').reset();
            });
        }
        
        // Event Form Submit
        const eventForm = document.getElementById('eventForm');
        if (eventForm) {
            eventForm.addEventListener('submit', handleAddEvent);
        }
        
        // Member Search
        const memberSearch = document.getElementById('memberSearch');
        if (memberSearch) {
            memberSearch.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filtered = allMembers.filter(m => 
                    m.full_name.toLowerCase().includes(searchTerm) ||
                    m.username.toLowerCase().includes(searchTerm) ||
                    m.email.toLowerCase().includes(searchTerm)
                );
                renderMembersTable(filtered);
            });
        }
        
        // Role Modal
        const cancelRoleBtn = document.getElementById('cancelRoleBtn');
        if (cancelRoleBtn) {
            cancelRoleBtn.addEventListener('click', () => {
                document.getElementById('roleModal').classList.add('hidden');
            });
        }
        
        const confirmRoleBtn = document.getElementById('confirmRoleBtn');
        if (confirmRoleBtn) {
            confirmRoleBtn.addEventListener('click', handleRoleChange);
        }
    }
    
    // Switch Tab
    function switchTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.getElementById(tabName + '-tab').classList.add('active');
        event.target.classList.add('active');
    }
    
    // Handle Add Event
    async function handleAddEvent(e) {
        e.preventDefault();
        
        const title = document.getElementById('eventTitle').value.trim();
        const description = document.getElementById('eventDescription').value.trim();
        const date = document.getElementById('eventDate').value;
        const location = document.getElementById('eventLocation').value.trim();
        const category = document.getElementById('eventCategory').value;
        
        if (!title || !description || !date || !location || !category) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        const submitBtn = document.querySelector('#eventForm button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';
        
        try {
            await createEvent({
                title,
                description,
                date,
                location,
                category,
                image_url: ''
            });
            
            showNotification('Event created successfully!', 'success');
            document.getElementById('addEventForm').classList.add('hidden');
            document.getElementById('eventForm').reset();
            await loadEvents();
            updateStats();
        } catch (e) {
            console.error('Error creating event:', e);
            showNotification('Failed to create event: ' + e.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Event';
        }
    }
    
    // Delete Member
    window.deleteMember = async function(memberId, memberName) {
        if (!confirm(`Delete member "${memberName}"? This action cannot be undone.`)) return;
        
        try {
            await deleteUser(memberId);
            showNotification('Member deleted successfully', 'success');
            await loadMembers();
            updateStats();
        } catch (e) {
            console.error('Error deleting member:', e);
            showNotification('Failed to delete member: ' + e.message, 'error');
        }
    };
    
    // Delete Event
    window.deleteEvent = async function(eventId, eventTitle) {
        if (!confirm(`Delete event "${eventTitle}"? This action cannot be undone.`)) return;
        
        try {
            await deleteEvent(eventId);
            showNotification('Event deleted successfully', 'success');
            await loadEvents();
            updateStats();
        } catch (e) {
            console.error('Error deleting event:', e);
            showNotification('Failed to delete event: ' + e.message, 'error');
        }
    };
    
    // Change Member Role
    window.changeRole = function(memberId, currentRole) {
        selectedMemberId = memberId;
        const roleModal = document.getElementById('roleModal');
        const newRoleSelect = document.getElementById('newRole');
        
        newRoleSelect.value = currentRole || '';
        roleModal.classList.remove('hidden');
    };
    
    // Handle Role Change
    async function handleRoleChange() {
        if (!selectedMemberId) return;
        
        const newRole = document.getElementById('newRole').value;
        
        if (!newRole) {
            showNotification('Please select a role', 'error');
            return;
        }
        
        const confirmBtn = document.getElementById('confirmRoleBtn');
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Changing...';
        
        try {
            await updateUserRole(selectedMemberId, newRole);
            showNotification('Member role updated successfully', 'success');
            document.getElementById('roleModal').classList.add('hidden');
            await loadMembers();
        } catch (e) {
            console.error('Error changing role:', e);
            showNotification('Failed to change role: ' + e.message, 'error');
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm';
        }
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Edit Event (placeholder)
    window.editEvent = function(eventId) {
        showNotification('Edit functionality coming soon', 'info');
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdmin);
    } else {
        initAdmin();
    }
})();
