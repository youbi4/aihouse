// zoom while scrolling
const heroBg = document.querySelector(".hero-bg");

window.addEventListener("scroll", () => {

    let scrollY = window.scrollY;

    let scale = 1 + scrollY * 0.0005;

    heroBg.style.transform = `scale(${scale})`;

});

// ===== Mini Image Slider =====
(function() {
    const slides = document.querySelectorAll('.mini-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.slick-prev');
    const nextBtn = document.querySelector('.slick-next');
    
    let currentSlide = 0;
    let slideInterval;
    const intervalTime = 5000; // 5 seconds
    
    // Show specific slide
    function showSlide(index) {
        // clear exiting/active from all slides
        slides.forEach(slide => {
            slide.classList.remove('active', 'exiting');
        });
        dots.forEach(dot => dot.classList.remove('active'));

        // handle index bounds
        if (index >= slides.length) index = 0;
        else if (index < 0) index = slides.length - 1;

        // mark outgoing slide (currentSlide) if exists
        if (slides[currentSlide]) {
            slides[currentSlide].classList.add('exiting');
        }

        currentSlide = index;

        // new slide will animate in from right due to base transform
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }
    
    // Next slide
    function nextSlide() {
        showSlide(currentSlide + 1);
    }
    
    // Previous slide
    function prevSlide() {
        showSlide(currentSlide - 1);
    }
    
    // Start auto-slide
    function startAutoSlide() {
        slideInterval = setInterval(nextSlide, intervalTime);
    }
    
    // Stop auto-slide
    function stopAutoSlide() {
        clearInterval(slideInterval);
    }
    
    // Event listeners for arrows
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }
    
    // Event listeners for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            stopAutoSlide();
            startAutoSlide();
        });
    });
    
    // Pause on hover
    const slider = document.querySelector('.hero-slider');
    if (slider) {
        slider.addEventListener('mouseenter', stopAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);
    }
    
    // Start auto-slide on load
    startAutoSlide();
})();

// ===== Mobile Navigation Toggle =====
(function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            document.body.classList.toggle('nav-open');
        });
    }
    
    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            document.body.classList.remove('nav-open');
        });
    });
})();

// ===== Active Navigation Link on Scroll & Reveal Animation =====
(function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    const reveals = document.querySelectorAll(".reveal");
    
    function handleScroll() {
        let current = '';
        const scrollPos = window.pageYOffset + 100;
        const windowHeight = window.innerHeight;
        const elementVisible = 150;
        
        // Active Link
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });

        // Reveal Animation
        reveals.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                el.classList.add("active");
            }
        });
    }
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('load', () => {
        handleScroll();
        // Performance: Lazy load images
        document.querySelectorAll('img').forEach(img => {
            if (!img.getAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    });
})();

// ===== Smooth Scroll for Anchor Links =====
(function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 70;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
})();
