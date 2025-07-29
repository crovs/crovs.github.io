// Apple-inspired JavaScript for enhanced interactions
(function() {
    'use strict';

    // Utility functions
    const utils = {
        throttle: (func, limit) => {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        debounce: (func, delay) => {
            let timeoutId;
            return function() {
                const args = arguments;
                const context = this;
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(context, args), delay);
            };
        },

        isMobile: () => window.innerWidth <= 768,

        prefersReducedMotion: () => {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
    };

    // Theme management
    const themeManager = {
        init() {
            this.setupThemeToggle();
            this.loadSavedTheme();
        },

        setupThemeToggle() {
            const themeToggle = document.querySelector('[data-theme-toggle]');
            const themeIcon = document.querySelector('.theme-icon');
            
            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    this.toggleTheme();
                });
            }
        },

        toggleTheme() {
            const body = document.body;
            const themeIcon = document.querySelector('.theme-icon');
            const isDark = body.classList.contains('dark-mode');
            
            // Record the time of manual theme change
            localStorage.setItem('lastManualThemeChange', Date.now().toString());
            
            if (isDark) {
                body.classList.remove('dark-mode');
                if (themeIcon) themeIcon.textContent = '🌙';
                localStorage.setItem('theme', 'light');
            } else {
                body.classList.add('dark-mode');
                if (themeIcon) themeIcon.textContent = '☀️';
                localStorage.setItem('theme', 'dark');
            }
        },

        loadSavedTheme() {
            const savedTheme = localStorage.getItem('theme');
            const themeIcon = document.querySelector('.theme-icon');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            // If no saved preference, use system preference
            const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
            
            if (shouldUseDark) {
                document.body.classList.add('dark-mode');
                if (themeIcon) themeIcon.textContent = '☀️';
                // Save the initial system preference if no saved theme exists
                if (!savedTheme) {
                    localStorage.setItem('theme', 'dark');
                }
            } else {
                document.body.classList.remove('dark-mode');
                if (themeIcon) themeIcon.textContent = '🌙';
                // Save the initial system preference if no saved theme exists
                if (!savedTheme) {
                    localStorage.setItem('theme', 'light');
                }
            }
            
            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a preference recently
                const lastManualChange = localStorage.getItem('lastManualThemeChange');
                const now = Date.now();
                const oneHour = 60 * 60 * 1000;
                
                if (!lastManualChange || (now - parseInt(lastManualChange)) > oneHour) {
                    if (e.matches) {
                        document.body.classList.add('dark-mode');
                        if (themeIcon) themeIcon.textContent = '☀️';
                        localStorage.setItem('theme', 'dark');
                    } else {
                        document.body.classList.remove('dark-mode');
                        if (themeIcon) themeIcon.textContent = '🌙';
                        localStorage.setItem('theme', 'light');
                    }
                }
            });
        }
    };

    // Background effects management
    const backgroundManager = {
        vantaEffect: null,
        currentMode: 'css', // 'css' or 'vanta'
        
        init() {
            this.setupBackgroundToggle();
            this.loadSavedBackground();
            this.setupResizeHandler();
        },
        
        setupBackgroundToggle() {
            const bgToggle = document.querySelector('[data-bg-toggle]');
            const bgIcon = document.querySelector('.bg-icon');
            
            if (bgToggle) {
                bgToggle.addEventListener('click', () => {
                    this.toggleBackground();
                });
            }
        },
        
        toggleBackground() {
            if (this.currentMode === 'css') {
                this.switchToVanta();
            } else {
                this.switchToCSS();
            }
            
            // Save preference
            localStorage.setItem('backgroundMode', this.currentMode);
        },
        
        switchToCSS() {
            const cssGradient = document.getElementById('css-gradient');
            const vantaBg = document.getElementById('vanta-bg');
            const bgIcon = document.querySelector('.bg-icon');
            
            // Destroy Vanta effect
            if (this.vantaEffect) {
                this.vantaEffect.destroy();
                this.vantaEffect = null;
            }
            
            // Show CSS gradient, hide Vanta
            if (cssGradient) cssGradient.style.display = 'block';
            if (vantaBg) vantaBg.style.display = 'none';
            if (bgIcon) bgIcon.textContent = '🌊';
            
            this.currentMode = 'css';
        },
        
        switchToVanta() {
            const cssGradient = document.getElementById('css-gradient');
            const vantaBg = document.getElementById('vanta-bg');
            const bgIcon = document.querySelector('.bg-icon');
            
            // Hide CSS gradient, show Vanta
            if (cssGradient) cssGradient.style.display = 'none';
            if (vantaBg) vantaBg.style.display = 'block';
            if (bgIcon) bgIcon.textContent = '🎨';
            
            // Initialize Vanta effect with desktop optimizations
            if (window.VANTA && window.VANTA.WAVES && !this.vantaEffect) {
                const isDesktop = window.innerWidth >= 1024;
                this.vantaEffect = window.VANTA.WAVES({
                    el: '#vanta-bg',
                    color: 0x007AFF,
                    shininess: isDesktop ? 60 : 50,
                    waveHeight: isDesktop ? 25 : 20,
                    waveSpeed: isDesktop ? 1.2 : 1.0,
                    zoom: isDesktop ? 1.1 : 1.0,
                    backgroundAlpha: 0.3,
                    scale: isDesktop ? 1.2 : 1.0,
                    scaleMobile: 1.0
                });
            }
            
            this.currentMode = 'vanta';
        },
        
        loadSavedBackground() {
            const savedMode = localStorage.getItem('backgroundMode');
            
            // Default to CSS gradient
            if (savedMode === 'vanta') {
                // Wait for Vanta to load
                const checkVanta = () => {
                    if (window.VANTA && window.VANTA.WAVES) {
                        this.switchToVanta();
                    } else {
                        setTimeout(checkVanta, 100);
                    }
                };
                checkVanta();
            } else {
                this.switchToCSS();
            }
        },
        
        setupResizeHandler() {
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    // Refresh Vanta effect on resize if active
                    if (this.currentMode === 'vanta' && this.vantaEffect) {
                        this.vantaEffect.destroy();
                        this.vantaEffect = null;
                        setTimeout(() => {
                            this.switchToVanta();
                        }, 100);
                    }
                }, 250);
            });
        }
    };

    // Navigation functionality
    const navigation = {
        init() {
            this.setupNavigation();
            this.setupMobileNav();
            this.setupScrollEffects();
        },

        setupNavigation() {
            const navLinks = document.querySelectorAll('[data-nav-link]');
            const sections = document.querySelectorAll('[data-section]');
            
            // Smooth scrolling for navigation links
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    const targetSection = document.querySelector(targetId);
                    
                    if (targetSection) {
                        const offsetTop = targetSection.offsetTop - 72; // Account for fixed nav
                        window.scrollTo({
                            top: offsetTop,
                            behavior: utils.prefersReducedMotion() ? 'auto' : 'smooth'
                        });
                    }
                });
            });

            // Active navigation highlighting
            const observerOptions = {
                root: null,
                rootMargin: '-20% 0px -70% 0px',
                threshold: 0
            };

            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        const activeLink = document.querySelector(`[data-nav-link][href="#${id}"]`);
                        
                        navLinks.forEach(link => link.classList.remove('active'));
                        if (activeLink) {
                            activeLink.classList.add('active');
                        }
                    }
                });
            }, observerOptions);

            sections.forEach(section => {
                sectionObserver.observe(section);
            });
        },

        setupMobileNav() {
            const navToggle = document.querySelector('[data-nav-toggle]');
            const navBar = document.querySelector('[data-nav]');
            
            if (navToggle && navBar) {
                navToggle.addEventListener('click', () => {
                    navBar.classList.toggle('mobile-open');
                    document.body.classList.toggle('nav-open');
                });

                // Close mobile nav when clicking outside
                document.addEventListener('click', (e) => {
                    if (!navBar.contains(e.target) && navBar.classList.contains('mobile-open')) {
                        navBar.classList.remove('mobile-open');
                        document.body.classList.remove('nav-open');
                    }
                });
            }
        },

        setupScrollEffects() {
            const navBar = document.querySelector('[data-nav]');
            let lastScrollY = window.scrollY;

            const handleScroll = utils.throttle(() => {
                const currentScrollY = window.scrollY;
                
                if (currentScrollY > 100) {
                    navBar.classList.add('scrolled');
                } else {
                    navBar.classList.remove('scrolled');
                }

                // Hide/show nav on scroll
                if (currentScrollY > lastScrollY && currentScrollY > 200) {
                    navBar.classList.add('nav-hidden');
                } else {
                    navBar.classList.remove('nav-hidden');
                }

                lastScrollY = currentScrollY;
            }, 100);

            window.addEventListener('scroll', handleScroll);
        }
    };

    // Parallax effects
    const parallax = {
        init() {
            if (utils.prefersReducedMotion()) return;
            
            this.setupParallaxElements();
            this.setupMouseParallax();
        },

        setupParallaxElements() {
            const parallaxElements = document.querySelectorAll('[data-parallax]');
            
            if (parallaxElements.length === 0) return;

            const handleParallax = utils.throttle(() => {
                const scrolled = window.pageYOffset;
                
                parallaxElements.forEach(element => {
                    const speed = parseFloat(element.dataset.parallax) || 0.3;
                    const yPos = -(scrolled * speed);
                    element.style.transform = `translateY(${yPos}px)`;
                });
            }, 16);

            window.addEventListener('scroll', handleParallax);
        },

        setupMouseParallax() {
            const heroParticles = document.querySelector('[data-particles]');
            
            if (!heroParticles) return;

            const handleMouseMove = utils.throttle((e) => {
                const { clientX, clientY } = e;
                const { innerWidth, innerHeight } = window;
                
                const xPercent = (clientX / innerWidth - 0.5) * 2;
                const yPercent = (clientY / innerHeight - 0.5) * 2;
                
                heroParticles.style.transform = `translate(${xPercent * 10}px, ${yPercent * 10}px)`;
            }, 16);

            document.addEventListener('mousemove', handleMouseMove);
        }
    };

    // Intersection Observer for animations
    const animations = {
        init() {
            this.setupScrollAnimations();
            this.setupCounters();
            this.setupHoverEffects();
        },

        setupScrollAnimations() {
            if (utils.prefersReducedMotion()) return;

            const animatedElements = document.querySelectorAll('[data-section], [data-animate]');
            
            const observerOptions = {
                root: null,
                rootMargin: '-20% 0px -20% 0px',
                threshold: 0.05
            };

            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        
                        // Special handling for counters
                        if (entry.target.hasAttribute('data-counter')) {
                            this.animateCounter(entry.target);
                        }
                    }
                });
            }, observerOptions);

            animatedElements.forEach(element => {
                animationObserver.observe(element);
            });
        },

        setupCounters() {
            const counters = document.querySelectorAll('[data-counter]');
            
            counters.forEach(counter => {
                const target = parseInt(counter.dataset.counter);
                const duration = parseInt(counter.dataset.duration) || 2000;
                const suffix = counter.dataset.suffix || '';
                
                counter.dataset.target = target;
                counter.dataset.duration = duration;
                counter.dataset.suffix = suffix;
            });
        },

        animateCounter(element) {
            const target = parseInt(element.dataset.target);
            const duration = parseInt(element.dataset.duration);
            const suffix = element.dataset.suffix;
            
            if (element.classList.contains('animated')) return;
            element.classList.add('animated');
            
            let startTime = null;
            const startValue = 0;
            
            const animate = (currentTime) => {
                if (!startTime) startTime = currentTime;
                
                const progress = Math.min((currentTime - startTime) / duration, 1);
                const currentValue = Math.floor(progress * target);
                
                element.textContent = currentValue.toLocaleString() + suffix;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        },

        setupHoverEffects() {
            // 3D hover effects for cards
            const cards = document.querySelectorAll('.feature-card, .app-showcase');
            
            cards.forEach(card => {
                card.addEventListener('mouseenter', (e) => {
                    if (utils.isMobile()) return;
                    
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = (y - centerY) / 60;
                    const rotateY = (centerX - x) / 60;
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(1px)`;
                });
                
                card.addEventListener('mouseleave', () => {
                    if (utils.isMobile()) return;
                    card.style.transform = '';
                });
                
                card.addEventListener('mousemove', (e) => {
                    if (utils.isMobile()) return;
                    
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = (y - centerY) / 40;
                    const rotateY = (centerX - x) / 40;
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(2px)`;
                });
            });
        }
    };

    // Performance optimizations
    const performance = {
        init() {
            this.setupLazyLoading();
            this.setupPreloadHints();
            this.setupResourceHints();
        },

        setupLazyLoading() {
            const images = document.querySelectorAll('img[data-lazy]');
            
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.lazy;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    });
                });
                
                images.forEach(img => imageObserver.observe(img));
            } else {
                // Fallback for older browsers
                images.forEach(img => {
                    img.src = img.dataset.lazy;
                });
            }
        },

        setupPreloadHints() {
            // Preload critical resources
            const preloadLinks = [
                { href: 'style.css', as: 'style' },
                { href: 'images/hero-gradient.png', as: 'image' }
            ];
            
            preloadLinks.forEach(link => {
                const linkElement = document.createElement('link');
                linkElement.rel = 'preload';
                linkElement.href = link.href;
                linkElement.as = link.as;
                document.head.appendChild(linkElement);
            });
        },

        setupResourceHints() {
            // DNS prefetch for external domains
            const dnsPrefetchLinks = [
                'https://fonts.googleapis.com',
                'https://fonts.gstatic.com'
            ];
            
            dnsPrefetchLinks.forEach(domain => {
                const link = document.createElement('link');
                link.rel = 'dns-prefetch';
                link.href = domain;
                document.head.appendChild(link);
            });
        }
    };

    // Touch and gesture handling
    const gestures = {
        init() {
            this.setupSwipeGestures();
            this.setupTouchEffects();
        },

        setupSwipeGestures() {
            let touchStartX = 0;
            let touchStartY = 0;
            let touchEndX = 0;
            let touchEndY = 0;

            document.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            });

            document.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                
                const deltaX = touchEndX - touchStartX;
                const deltaY = touchEndY - touchStartY;
                
                // Only handle horizontal swipes
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                    if (deltaX > 0) {
                        // Swipe right - previous section
                        this.navigateSection('prev');
                    } else {
                        // Swipe left - next section
                        this.navigateSection('next');
                    }
                }
            });
        },

        navigateSection(direction) {
            const sections = document.querySelectorAll('[data-section]');
            const currentSection = [...sections].find(section => {
                const rect = section.getBoundingClientRect();
                return rect.top <= 100 && rect.bottom > 100;
            });
            
            if (!currentSection) return;
            
            const currentIndex = [...sections].indexOf(currentSection);
            let targetIndex;
            
            if (direction === 'next') {
                targetIndex = Math.min(currentIndex + 1, sections.length - 1);
            } else {
                targetIndex = Math.max(currentIndex - 1, 0);
            }
            
            const targetSection = sections[targetIndex];
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        },

        setupTouchEffects() {
            const touchElements = document.querySelectorAll('.hero-cta, .app-store-btn, .contact-btn');
            
            touchElements.forEach(element => {
                element.addEventListener('touchstart', () => {
                    element.classList.add('touch-active');
                });
                
                element.addEventListener('touchend', () => {
                    element.classList.remove('touch-active');
                });
            });
        }
    };

    // Analytics and tracking (privacy-focused)
    const analytics = {
        init() {
            this.setupPerformanceTracking();
            this.setupErrorHandling();
        },

        setupPerformanceTracking() {
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.entryType === 'navigation') {
                            console.log('Page load time:', entry.loadEventEnd - entry.loadEventStart);
                        }
                    });
                });
                
                observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
            }
        },

        setupErrorHandling() {
            window.addEventListener('error', (e) => {
                console.error('JavaScript error:', e.error);
            });
            
            window.addEventListener('unhandledrejection', (e) => {
                console.error('Unhandled promise rejection:', e.reason);
            });
        }
    };

    // Initialize everything
    const init = () => {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeApp);
        } else {
            initializeApp();
        }
    };

    const initializeApp = () => {
        // Initialize all modules
        themeManager.init();
        backgroundManager.init();
        navigation.init();
        parallax.init();
        animations.init();
        performance.init();
        gestures.init();
        analytics.init();

        // Add loading class removal
        document.body.classList.add('loaded');
        
        // Log successful initialization
        console.log('🎯 Ahmet\'s Apps - Apple-inspired experience loaded');
    };

    // Start the application
    init();

})();