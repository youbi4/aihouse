// ==========================================
// EVENTS PAGE - Display and manage events
// ==========================================

(function() {
    let allEvents = [];
    let filteredEvents = [];
    
    // Initialize events page
    async function initEvents() {
        await loadEvents();
        setupEventListeners();
    }
    
    // Load All Events
    async function loadEvents() {
        try {
            const events = await getAllEvents();
            allEvents = events;
            filteredEvents = [...events];
            renderEventsGrid(events);
        } catch (e) {
            console.error('Error loading events:', e);
            showNotification('Failed to load events', 'error');
        }
    }
    
    // Render Events Grid
    function renderEventsGrid(events) {
        const grid = document.getElementById('eventsGrid');
        const noEventsMsg = document.getElementById('noEventsMessage');
        
        if (events.length === 0) {
            grid.innerHTML = '';
            noEventsMsg.classList.remove('hidden');
            return;
        }
        
        noEventsMsg.classList.add('hidden');
        grid.innerHTML = events.map((event, index) => `
            <div class="event-card" style="animation-delay: ${index * 0.1}s;">
                <div class="event-image">
                    <img src="${event.image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&w=600'}" 
                         alt="${escapeHtml(event.title)}" 
                         onerror="this.src='https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&w=600'">
                    <div class="date-badge">${formatDate(event.date)}</div>
                </div>
                <div class="event-content">
                    <span class="cat-tag">${escapeHtml(event.category || 'Event')}</span>
                    <h3 class="event-title">${escapeHtml(event.title)}</h3>
                    <p class="event-description">${escapeHtml(event.description || '').substring(0, 100)}...</p>
                    <div class="event-details">
                        <span>📍 ${escapeHtml(event.location || 'TBA')}</span>
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-primary" onclick="window.viewEventDetails('${event.id}')">View Details</button>
                        <button class="btn btn-secondary" onclick="window.registerEvent('${event.id}')">Register</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Setup Event Listeners
    function setupEventListeners() {
        // Search
        const searchInput = document.getElementById('eventSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                filterEvents();
            });
        }
        
        // Category Filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                filterEvents();
            });
        }
        
        // Reset Filters
        const resetBtn = document.getElementById('resetFilters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                document.getElementById('eventSearch').value = '';
                document.getElementById('categoryFilter').value = '';
                filterEvents();
            });
        }
        
        // Clear Search Button
        const clearSearchBtn = document.getElementById('clearSearch');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                document.getElementById('eventSearch').value = '';
                document.getElementById('categoryFilter').value = '';
                filterEvents();
            });
        }
        
        // Modal Close
        const closeModalBtn = document.getElementById('closeModal');
        const modal = document.getElementById('eventModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }
        
        // Close modal on outside click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        }
    }
    
    // Filter Events
    function filterEvents() {
        const searchTerm = document.getElementById('eventSearch').value.toLowerCase();
        const selectedCategory = document.getElementById('categoryFilter').value;
        
        filteredEvents = allEvents.filter(event => {
            const matchesSearch = 
                event.title.toLowerCase().includes(searchTerm) ||
                (event.description && event.description.toLowerCase().includes(searchTerm)) ||
                event.location.toLowerCase().includes(searchTerm);
            
            const matchesCategory = !selectedCategory || event.category === selectedCategory;
            
            return matchesSearch && matchesCategory;
        });
        
        renderEventsGrid(filteredEvents);
    }
    
    // View Event Details
    window.viewEventDetails = function(eventId) {
        const event = allEvents.find(e => e.id === eventId);
        if (!event) return;
        
        const modal = document.getElementById('eventModal');
        const modalBody = document.getElementById('modalBody');
        
        const user = getCurrentUser();
        const isRegistered = false; // TODO: Check if user is registered
        
        modalBody.innerHTML = `
            <div class="event-detail-header" style="background: linear-gradient(135deg, #FF6B00, #ff8a2a); color: white; margin: -40px -40px 30px; padding: 40px 40px 30px;">
                <h2 style="margin-bottom: 12px; font-size: 1.8rem;">${escapeHtml(event.title)}</h2>
                <p style="opacity: 0.9; font-size: 1rem;">${escapeHtml(event.category || 'Event')}</p>
            </div>
            
            <div class="event-detail-content" style="color: #333;">
                <img src="${event.image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&w=600'}" 
                     alt="${escapeHtml(event.title)}" 
                     style="width: 100%; border-radius: 12px; margin-bottom: 24px; max-height: 300px; object-fit: cover;"
                     onerror="this.src='https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&w=600'">
                
                <div style="margin-bottom: 24px;">
                    <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 12px; color: #FF6B00;">Event Details</h3>
                    <p style="margin-bottom: 8px;"><strong>Date:</strong> ${formatDate(event.date)}</p>
                    <p style="margin-bottom: 8px;"><strong>Location:</strong> ${escapeHtml(event.location)}</p>
                    <p style="margin-bottom: 8px;"><strong>Category:</strong> ${escapeHtml(event.category || 'N/A')}</p>
                </div>
                
                <div style="margin-bottom: 24px;">
                    <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 12px; color: #FF6B00;">Description</h3>
                    <p style="line-height: 1.6; color: #666;">${escapeHtml(event.description)}</p>
                </div>
                
                <div style="display: flex; gap: 12px;">
                    ${user ? `
                        <button class="btn btn-primary" style="flex: 1; padding: 12px 16px;" onclick="window.registerEvent('${event.id}')">
                            ${isRegistered ? 'Unregister' : 'Register Now'}
                        </button>
                    ` : `
                        <button class="btn btn-primary" style="flex: 1; padding: 12px 16px;" onclick="window.registerAsGuest()">
                            Register (Sign In Required)
                        </button>
                    `}
                    <button class="btn btn-secondary" style="flex: 1; padding: 12px 16px;" onclick="document.getElementById('eventModal').classList.add('hidden')">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
    };
    
    // Register for Event
    window.registerEvent = async function(eventId) {
        const user = getCurrentUser();
        
        if (!user) {
            showNotification('Please sign in to register for events', 'warning');
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
            return;
        }
        
        try {
            await registerForEvent(eventId);
            showNotification('Successfully registered for event!', 'success');
            document.getElementById('eventModal').classList.add('hidden');
        } catch (e) {
            console.error('Error registering:', e);
            if (e.message.includes('UNIQUE')) {
                showNotification('You are already registered for this event', 'warning');
            } else {
                showNotification('Failed to register: ' + e.message, 'error');
            }
        }
    };
    
    // Register as Guest (redirect to login)
    window.registerAsGuest = function() {
        showNotification('Please create an account to register', 'info');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1500);
    };
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEvents);
    } else {
        initEvents();
    }
})();
