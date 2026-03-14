/* =============================================
   TaraBloom — JavaScript (main.js)
   ============================================= */

(function () {
  'use strict';

  /* --------------------------------------------------
     Sticky header shadow on scroll
  -------------------------------------------------- */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  /* --------------------------------------------------
     Hamburger / mobile nav toggle
  -------------------------------------------------- */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      if (isOpen) {
        mobileNav.classList.add('open');
        mobileNav.style.display = 'flex';
      } else {
        mobileNav.classList.remove('open');
      }
    });

    // Close on nav link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target) && !mobileNav.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      }
    });
  }

  /* --------------------------------------------------
     Active nav link highlight
  -------------------------------------------------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* --------------------------------------------------
     Product carousel (New Arrivals on home page)
  -------------------------------------------------- */
  const track = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');

  if (track && prevBtn && nextBtn) {
    let currentIndex = 0;

    const getCardWidth = () => {
      const card = track.querySelector('.product-card');
      if (!card) return 284;
      const gap = 24;
      return card.offsetWidth + gap;
    };

    const getVisibleCount = () => {
      const outer = track.parentElement;
      if (!outer) return 1;
      return Math.floor(outer.offsetWidth / getCardWidth()) || 1;
    };

    const totalCards = track.querySelectorAll('.product-card').length;

    const updateCarousel = () => {
      const maxIndex = Math.max(0, totalCards - getVisibleCount());
      currentIndex = Math.min(currentIndex, maxIndex);
      track.style.transform = `translateX(-${currentIndex * getCardWidth()}px)`;
      prevBtn.style.opacity = currentIndex === 0 ? '0.4' : '1';
      nextBtn.style.opacity = currentIndex >= maxIndex ? '0.4' : '1';
    };

    prevBtn.addEventListener('click', () => { currentIndex = Math.max(0, currentIndex - 1); updateCarousel(); });
    nextBtn.addEventListener('click', () => {
      const maxIndex = Math.max(0, totalCards - getVisibleCount());
      currentIndex = Math.min(maxIndex, currentIndex + 1);
      updateCarousel();
    });

    window.addEventListener('resize', updateCarousel, { passive: true });
    updateCarousel();
  }

  /* --------------------------------------------------
     Collection filter (collections.html)
  -------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card[data-category]');

  if (filterBtns.length && productCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        productCards.forEach(card => {
          const show = filter === 'all' || card.dataset.category === filter;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* --------------------------------------------------
     Scroll-based fade-in animations
  -------------------------------------------------- */
  const fadeEls = document.querySelectorAll('.fade-in');

  if (fadeEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    fadeEls.forEach(el => observer.observe(el));
  }

  /* --------------------------------------------------
     Newsletter form submit (prevent default + confirm)
  -------------------------------------------------- */
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      if (input && input.value) {
        input.value = '';
        const btn = newsletterForm.querySelector('button');
        if (btn) {
          const orig = btn.textContent;
          btn.textContent = '✓ Subscribed!';
          setTimeout(() => { btn.textContent = orig; }, 3000);
        }
      }
    });
  }

  /* --------------------------------------------------
     Contact form submit (prevent default + confirm)
  -------------------------------------------------- */
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✓ Message Sent!';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = orig;
          btn.disabled = false;
          contactForm.reset();
        }, 3500);
      }
    });
  }

})();
