(function () {
  'use strict';

  /* =============================================
     STICKY HEADER — add shadow on scroll
     ============================================= */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  /* =============================================
     HAMBURGER — mobile nav toggle
     ============================================= */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
    // Close mobile nav when a link inside it is clicked
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* =============================================
     ACTIVE NAV LINK — highlight current page
     ============================================= */
  var currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.main-nav a, .mobile-nav a').forEach(function (link) {
    var linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, '') || '/';
    if (linkPath === currentPath) {
      link.classList.add('active');
    }
  });

  /* =============================================
     CAROUSEL — home page new-arrivals
     ============================================= */
  var carouselTrack = document.querySelector('.carousel-track');
  if (carouselTrack) {
    var prevBtn = document.querySelector('.carousel-btn-prev');
    var nextBtn = document.querySelector('.carousel-btn-next');
    var cardWidth = 0;
    var position = 0;

    function getCardWidth() {
      var card = carouselTrack.querySelector('.product-card');
      if (!card) return 0;
      var style = window.getComputedStyle(carouselTrack);
      var gap = parseFloat(style.gap) || 24;
      return card.offsetWidth + gap;
    }

    function getMaxPosition() {
      var outer = document.querySelector('.carousel-track-outer');
      if (!outer) return 0;
      return Math.max(0, carouselTrack.scrollWidth - outer.offsetWidth);
    }

    function slideTo(pos) {
      position = Math.max(0, Math.min(pos, getMaxPosition()));
      carouselTrack.style.transform = 'translateX(-' + position + 'px)';
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        cardWidth = getCardWidth();
        slideTo(position - cardWidth);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        cardWidth = getCardWidth();
        slideTo(position + cardWidth);
      });
    }

    // Touch/swipe support for carousel
    var touchStartX = 0;
    carouselTrack.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    carouselTrack.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        cardWidth = getCardWidth();
        slideTo(position + (diff > 0 ? cardWidth : -cardWidth));
      }
    }, { passive: true });
  }

  /* =============================================
     FILTER BUTTONS — collections page
     ============================================= */
  var filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.dataset.filter;
        document.querySelectorAll('.product-card').forEach(function (card) {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // On page load, apply category filter from URL query parameter (?category=...)
    var urlCategory = new URLSearchParams(window.location.search).get('category');
    if (urlCategory) {
      var targetBtn = document.querySelector('.filter-btn[data-filter="' + urlCategory + '"]');
      if (targetBtn) {
        targetBtn.click();
      }
    }
  }

  /* =============================================
     FADE-IN ANIMATIONS — IntersectionObserver
     ============================================= */
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.fade-in').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll('.fade-in').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* =============================================
     NEWSLETTER FORM
     ============================================= */
  var newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = newsletterForm.querySelector('input[type="email"]');
      if (input && input.value) {
        var msg = newsletterForm.querySelector('.form-success');
        if (!msg) {
          msg = document.createElement('p');
          msg.className = 'form-success';
          msg.style.cssText = 'color:#fff;margin-top:12px;font-weight:600;';
          newsletterForm.appendChild(msg);
        }
        msg.textContent = 'Thank you for subscribing! 🌸';
        input.value = '';
      }
    });
  }

  /* =============================================
     CONTACT FORM
     ============================================= */
  var contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = contactForm.querySelector('.form-success');
      if (!msg) {
        msg = document.createElement('p');
        msg.className = 'form-success';
        msg.style.cssText = 'color:var(--accent-pink);margin-top:12px;font-weight:600;';
        contactForm.appendChild(msg);
      }
      msg.textContent = 'Thank you! We\'ll get back to you soon. 💌';
      contactForm.reset();
    });
  }


}());
