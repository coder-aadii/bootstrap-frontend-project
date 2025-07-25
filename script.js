/**
 * Template Main JS File
 */
(function () {
    "use strict";

    /**
     * Easy selector helper function
     */
    const select = (el, all = false) => {
        el = el.trim()
        if (all) {
            return [...document.querySelectorAll(el)]
        } else {
            return document.querySelector(el)
        }
    }

    /**
     * Easy event listener function
     */
    const on = (type, el, listener, all = false) => {
        let selectEl = select(el, all)
        if (selectEl) {
            if (all) {
                selectEl.forEach(e => e.addEventListener(type, listener))
            } else {
                selectEl.addEventListener(type, listener)
            }
        }
    }

    /**
     * Easy on scroll event listener 
     */
    const onscroll = (el, listener) => {
        el.addEventListener('scroll', listener)
    }

    /**
     * Navbar links active state on scroll
     */
    let navbarlinks = select('#navbar .scrollto', true)
    const navbarlinksActive = () => {
        let position = window.scrollY + 200
        navbarlinks.forEach(navbarlink => {
            if (!navbarlink.hash) return
            let section = select(navbarlink.hash)
            if (!section) return
            if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
                navbarlink.classList.add('active')
            } else {
                navbarlink.classList.remove('active')
            }
        })
    }
    window.addEventListener('load', navbarlinksActive)
    onscroll(document, navbarlinksActive)

    /**
     * Scrolls to an element with header offset
     */
    const scrollto = (el) => {
        let header = select('#header')
        let offset = header.offsetHeight

        let elementPos = select(el).offsetTop
        window.scrollTo({
            top: elementPos - offset,
            behavior: 'smooth'
        })
    }

    /**
     * Toggle .header-scrolled class to #header when page is scrolled
     */
    let selectHeader = select('#header')
    let selectTopbar = select('#topbar')
    if (selectHeader) {
        const headerScrolled = () => {
            if (window.scrollY > 100) {
                selectHeader.classList.add('header-scrolled')
                if (selectTopbar) {
                    selectTopbar.classList.add('topbar-scrolled')
                }
            } else {
                selectHeader.classList.remove('header-scrolled')
                if (selectTopbar) {
                    selectTopbar.classList.remove('topbar-scrolled')
                }
            }
        }
        window.addEventListener('load', headerScrolled)
        onscroll(document, headerScrolled)
    }

    /**
     * Back to top button
     */
    let backtotop = select('.back-to-top')
    if (backtotop) {
        const toggleBacktotop = () => {
            if (window.scrollY > 100) {
                backtotop.classList.add('active')
            } else {
                backtotop.classList.remove('active')
            }
        }
        window.addEventListener('load', toggleBacktotop)
        onscroll(document, toggleBacktotop)
        
        // Add click event to scroll to top
        backtotop.addEventListener('click', (e) => {
            e.preventDefault()
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            })
        })
    }

    /**
     * Mobile nav toggle
     */
    on('click', '.mobile-nav-toggle', function (e) {
        select('#navbar').classList.toggle('navbar-mobile')
        this.classList.toggle('bi-list')
        this.classList.toggle('bi-x')
    })

    /**
     * Mobile nav dropdowns activate
     */
    on('click', '.navbar .dropdown > a', function (e) {
        if (select('#navbar').classList.contains('navbar-mobile')) {
            e.preventDefault()
            this.nextElementSibling.classList.toggle('dropdown-active')
        }
    }, true)

    /**
     * Scroll with offset on links with a class name .scrollto
     */
    on('click', '.scrollto', function (e) {
        if (select(this.hash)) {
            e.preventDefault()

            let navbar = select('#navbar')
            if (navbar.classList.contains('navbar-mobile')) {
                navbar.classList.remove('navbar-mobile')
                let navbarToggle = select('.mobile-nav-toggle')
                navbarToggle.classList.toggle('bi-list')
                navbarToggle.classList.toggle('bi-x')
            }
            scrollto(this.hash)
        }
    }, true)

    /**
     * Scroll with offset on page load with hash links in the url
     */
    window.addEventListener('load', () => {
        if (window.location.hash) {
            if (select(window.location.hash)) {
                scrollto(window.location.hash)
            }
        }
    });

    /**
     * Hero carousel indicators
     */
    window.addEventListener('load', () => {
        let heroCarouselIndicators = select("#hero-carousel-indicators")
        let heroCarouselItems = select('#heroCarousel .carousel-item', true)

        if (heroCarouselIndicators && heroCarouselItems) {
            heroCarouselItems.forEach((item, index) => {
                (index === 0) ?
                    heroCarouselIndicators.innerHTML += "<li data-bs-target='#heroCarousel' data-bs-slide-to='" + index + "' class='active'></li>" :
                    heroCarouselIndicators.innerHTML += "<li data-bs-target='#heroCarousel' data-bs-slide-to='" + index + "'></li>"
            });
        }
    });

    /**
     * Load menu items from JSON and initialize isotope filtering
     */
    const loadMenuItems = async () => {
        try {
            const response = await fetch('data/menu-items.json');
            const menuItems = await response.json();
            
            const menuContainer = select('#menu-items-container');
            if (menuContainer) {
                // Clear existing content
                menuContainer.innerHTML = '';
                
                // Generate menu items HTML
                menuItems.forEach(item => {
                    const menuItemHTML = `
                        <div class="col-lg-6 menu-item filter-${item.type}">
                            <img src="${item['image-url']}" class="menu-img" alt="${item.name}" />
                            <div class="menu-item-details">
                                <div class="menu-content">
                                    <a href="#">${item.name}</a><span>${item.price}</span>
                                </div>
                                <div class="menu-ingredients">
                                    ${item.desc}
                                </div>
                            </div>
                        </div>
                    `;
                    menuContainer.innerHTML += menuItemHTML;
                });
                
                // Initialize Isotope after items are loaded
                if (typeof Isotope !== 'undefined') {
                    const menuIsotope = new Isotope(menuContainer, {
                        itemSelector: '.menu-item',
                        layoutMode: 'fitRows'
                    });

                    const menuFilters = select('#menu-flters li', true);

                    on('click', '#menu-flters li', function (e) {
                        e.preventDefault();
                        menuFilters.forEach(function (el) {
                            el.classList.remove('filter-active');
                        });
                        this.classList.add('filter-active');

                        menuIsotope.arrange({
                            filter: this.getAttribute('data-filter')
                        });
                    }, true);
                }
            }
        } catch (error) {
            console.error('Error loading menu items:', error);
            // Fallback: show error message
            const menuContainer = select('#menu-items-container');
            if (menuContainer) {
                menuContainer.innerHTML = '<div class="col-12"><p class="text-center">Unable to load menu items. Please try again later.</p></div>';
            }
        }
    };

    /**
     * Initialize menu when page loads
     */
    window.addEventListener('load', () => {
        loadMenuItems();
    });

    /**
     * Events slider
     */
    window.addEventListener('load', () => {
        if (typeof Swiper !== 'undefined') {
            new Swiper('.events-slider', {
                speed: 600,
                loop: true,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false
                },
                slidesPerView: 'auto',
                pagination: {
                    el: '.swiper-pagination',
                    type: 'bullets',
                    clickable: true
                }
            });
        }
    });

    /**
     * Testimonials slider
     */
    window.addEventListener('load', () => {
        if (typeof Swiper !== 'undefined') {
            new Swiper('.testimonials-slider', {
                speed: 600,
                loop: true,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false
                },
                slidesPerView: 'auto',
                pagination: {
                    el: '.swiper-pagination',
                    type: 'bullets',
                    clickable: true
                }
            });
        }
    });

})();