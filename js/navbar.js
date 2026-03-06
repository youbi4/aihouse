// ==========================================
// NAVBAR MODULE - Handles navbar across all pages
// ==========================================

(function() {
    // Initialize navbar when DOM is ready
    function initNavbar() {
        setupActiveNavLink();
        setupProfileIcon();
        setupJoinCommunityButton();
        setupMobileNav();
    }
    
    // Setup Active Navigation Link Highlight
    function setupActiveNavLink() {
        const navLinks = document.querySelectorAll('.nav-links a');
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'homepage.html';
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isCurrentPage = 
                (currentPage === 'homepage.html' && href === '#home') ||
                (href === '/pages/contact.html' && currentPage === 'contact.html') ||
                (href === '/pages/events.html' && currentPage === 'events.html') ||
                (href === '#events' && currentPage === 'homepage.html') ||
                false;
            
            if (isCurrentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // Setup Profile Icon
    function setupProfileIcon() {
        const headerActions = document.getElementById('header-actions');
        if (!headerActions) return;
        
        const user = getCurrentUser();
        const profileIcon = document.createElement('div');
        profileIcon.className = 'profile-icon-container';
        
        const profileImg = document.createElement('img');
        profileImg.src = '/assets/default-avatar.png'; // Default avatar
        profileImg.alt = 'Profile';
        profileImg.className = 'profile-icon';
        
        const dropdown = document.createElement('div');
        dropdown.className = 'profile-dropdown hidden';
        
        profileIcon.appendChild(profileImg);
        profileIcon.appendChild(dropdown);
        headerActions.appendChild(profileIcon);
        
        // Profile Icon Click Handler
        profileImg.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (!user) {
                // Guest user - show message and redirect
                showNotification('You must have an account first', 'warning');
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 2000);
            } else {
                // Logged in user - toggle dropdown
                dropdown.classList.toggle('hidden');
                if (!dropdown.classList.contains('hidden')) {
                    populateProfileDropdown(dropdown, user);
                }
            }
        });
        
        // Close dropdown on outside click
        document.addEventListener('click', () => {
            dropdown.classList.add('hidden');
        });
    }
    
    // Populate Profile Dropdown Menu
    function populateProfileDropdown(dropdown, user) {
        const isAdmin = user.is_admin || false;
        
        dropdown.innerHTML = `
            <div class="dropdown-item" data-action="profile">
                <span>Profile</span>
            </div>
            ${isAdmin ? '<div class="dropdown-item" data-action="admin"><span>Admin Dashboard</span></div>' : ''}
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" data-action="logout">
                <span>Logout</span>
            </div>
        `;
        
        dropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = item.dataset.action;
                
                if (action === 'profile') {
                    window.location.href = '/pages/profile.html';
                } else if (action === 'admin') {
                    window.location.href = '/pages/admin.html';
                } else if (action === 'logout') {
                    logout();
                }
                
                dropdown.classList.add('hidden');
            });
        });
    }
    
    // Logout Function
    function logout() {
        localStorage.removeItem('currentUser');
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
    }
    
    // Setup Join Community Button Logic
    function setupJoinCommunityButton() {
        const joinBtn = document.querySelector('[href="/index.html"][class*="btn-secondary"]');
        if (!joinBtn) return;
        
        const user = getCurrentUser();
        if (user) {
            // Hide join button for logged-in users
            joinBtn.style.display = 'none';
        } else {
            // Show for guests with click handler
            joinBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showNotification('You must have an account first', 'warning');
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);
            });
        }
    }
    
    // Setup Mobile Navigation Toggle
    function setupMobileNav() {
        const navToggle = document.querySelector('.nav-toggle');
        const navLinksList = document.querySelector('.nav-links');
        const user = getCurrentUser();
        
        if (!navToggle) return;
        
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navToggle.classList.toggle('active');
            
            if (navLinksList) {
                navLinksList.classList.toggle('active');
            }
            
            // Add mobile dropdown items if not already there
            if (!navLinksList || !navLinksList.querySelector('.mobile-actions')) {
                createMobileMenu(navToggle, user);
            }
        });
        
        // Close menu on outside click
        document.addEventListener('click', () => {
            if (navToggle && navToggle.classList.contains('active')) {
                navToggle.classList.remove('active');
                if (navLinksList) {
                    navLinksList.classList.remove('active');
                }
            }
        });
    }
    
    // Create Mobile Menu with animations
    function createMobileMenu(navToggle, user) {
        const navLinksContainer = document.querySelector('.nav-container');
        let mobileMenu = document.querySelector('.mobile-menu-dropdown');
        
        if (!mobileMenu) {
            mobileMenu = document.createElement('div');
            mobileMenu.className = 'mobile-menu-dropdown';
            navLinksContainer.appendChild(mobileMenu);
        }
        
        // Build menu items
        let menuHTML = `<div class="mobile-menu-content">`;
        
        // Navigation links
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const text = link.textContent;
            menuHTML += `<a href="${href}" class="mobile-menu-item">${text}</a>`;
        });
        
        // Profile and logout for logged-in users
        if (user) {
            menuHTML += `<div class="mobile-menu-divider"></div>`;
            menuHTML += `<a href="/pages/profile.html" class="mobile-menu-item">Profile</a>`;
            if (user.is_admin) {
                menuHTML += `<a href="/pages/admin.html" class="mobile-menu-item">Admin Dashboard</a>`;
            }
            menuHTML += `<a href="#" class="mobile-menu-item logout-item" onclick="logoutFromMobile(event)">Logout</a>`;
        }
        
        menuHTML += `</div>`;
        mobileMenu.innerHTML = menuHTML;
        
        // Add click handlers
        mobileMenu.querySelectorAll('.mobile-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                navToggle.classList.remove('active');
                const navLinks = document.querySelector('.nav-links');
                if (navLinks) {
                    navLinks.classList.remove('active');
                }
                mobileMenu.classList.remove('active');
            });
        });
    }
    
    // Global logout function for mobile menu
    window.logoutFromMobile = function(e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
    };
    
    // Setup Mobile Navigation Toggle - OLD
    function setupMobileNavOld() {
        const navToggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelectorAll('.nav-links li');
        
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                document.body.classList.toggle('nav-open');
            });
        }
        
        // Close menu when clicking a link
        navLinks.forEach(item => {
            const link = item.querySelector('a');
            if (link) {
                link.addEventListener('click', () => {
                    document.body.classList.remove('nav-open');
                });
            }
        });
    }
    
    // Initialize on DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }
})();

// Add CSS for profile icon and dropdown
const style = document.createElement('style');
style.textContent = `
    #header-actions {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .profile-icon-container {
        position: relative;
        display: flex;
        align-items: center;
    }
    
    .profile-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        object-fit: cover;
        border: 2px solid #FF6B00;
        transition: transform 0.2s ease;
    }
    
    .profile-icon:hover {
        transform: scale(1.05);
    }
    
    .profile-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        min-width: 160px;
        z-index: 2001;
        margin-top: 8px;
    }
    
    .profile-dropdown.hidden {
        display: none;
    }
    
    .dropdown-item {
        padding: 12px 16px;
        cursor: pointer;
        color: #1e293b;
        transition: background 0.2s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        white-space: nowrap;
    }
    
    .dropdown-item:hover {
        background: #f8fafc;
        color: #FF6B00;
    }
    
    .dropdown-item:first-child {
        border-radius: 8px 8px 0 0;
    }
    
    .dropdown-item:last-child {
        border-radius: 0 0 8px 8px;
    }
    
    .dropdown-divider {
        height: 1px;
        background: #e2e8f0;
        margin: 4px 0;
    }
    
    @media (max-width: 768px) {
        .profile-icon {
            width: 36px;
            height: 36px;
        }
        
        .profile-dropdown {
            min-width: 140px;
        }
        
        .dropdown-item {
            padding: 10px 12px;
            font-size: 0.9rem;
        }
    }
`;
document.head.appendChild(style);
