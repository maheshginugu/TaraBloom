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
          if (card.dataset.category === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // On page load, apply category filter from URL query parameter (?category=...) or default to the active button
    var urlCategory = new URLSearchParams(window.location.search).get('category');
    var targetBtn = urlCategory
      ? document.querySelector('.filter-btn[data-filter="' + urlCategory + '"]')
      : document.querySelector('.filter-btn.active');
    if (targetBtn) {
      targetBtn.click();
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

  /* =============================================
     PRODUCT QUICK-VIEW MODAL
     ============================================= */
  var modal = document.getElementById('tb-product-modal');
  if (modal) {

  var modalMainImg  = document.getElementById('tb-modal-mainimg');
  var modalThumbs   = document.getElementById('tb-modal-thumbs');
  var modalTitle    = document.getElementById('tb-modal-title');
  var modalPrice    = document.getElementById('tb-modal-price');
  var modalAddCart  = document.getElementById('tb-modal-add-cart');
  var modalColors   = document.getElementById('tb-modal-colors');
  var modalColorOps = document.getElementById('tb-modal-color-options');
  var modalBadge    = modal.querySelector('.modal-product-badge');
  var modalPrev     = document.getElementById('tb-modal-prev');
  var modalNext     = document.getElementById('tb-modal-next');

  var activeImages = [];
  var activeIndex  = 0;
  var activeColorOptions = [];
  var activeColorStock = {};
  var activeColor = '';
  var lastFocused  = null;

  // ── helpers ──────────────────────────────────

  function setThumb(idx) {
    activeIndex = idx;
    if (modalMainImg) {
      modalMainImg.src = activeImages[idx];
      modalMainImg.alt = (modalTitle ? modalTitle.textContent : 'Product') + ' image ' + (idx + 1);
    }
    if (modalThumbs) {
      modalThumbs.querySelectorAll('button').forEach(function (btn, i) {
        btn.classList.toggle('is-active', i === idx);
        btn.setAttribute('aria-pressed', String(i === idx));
      });
    }
    updateNavVisibility();
  }

  function updateNavVisibility() {
    if (modalPrev) modalPrev.style.display = activeImages.length > 1 ? '' : 'none';
    if (modalNext) modalNext.style.display = activeImages.length > 1 ? '' : 'none';
  }

  function setModalCta(inStock) {
    if (!modalAddCart) return;
    modalAddCart.disabled = false;
    if (!inStock) {
      modalAddCart.classList.remove('add-to-cart');
      modalAddCart.classList.add('enquire-product');
      modalAddCart.innerHTML = '<i class="fab fa-whatsapp"></i> Enquire';
      modalAddCart.setAttribute('aria-label', 'Enquire about this product on WhatsApp');
    } else {
      modalAddCart.classList.remove('enquire-product');
      modalAddCart.classList.add('add-to-cart');
      modalAddCart.innerHTML = '<i class="fas fa-shopping-bag"></i> Add to Cart';
      modalAddCart.setAttribute('aria-label', 'Add to cart');
    }
  }

  function normalizeColorKey(value) {
    return String(value || '')
      .trim()
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map(function (part, idx) {
        var lower = part.toLowerCase();
        return idx === 0 ? lower : (lower.charAt(0).toUpperCase() + lower.slice(1));
      })
      .join('');
  }

  function toDisplayColor(value) {
    var key = normalizeColorKey(value);
    return key
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .split(' ')
      .filter(Boolean)
      .map(function (part) { return part.charAt(0).toUpperCase() + part.slice(1); })
      .join(' ');
  }

  function clearColorOptions() {
    activeColorOptions = [];
    activeColorStock = {};
    activeColor = '';
    if (modalColors) modalColors.style.display = 'none';
    if (modalColorOps) modalColorOps.innerHTML = '';
  }

  function updateSelectedColor(baseName, priceCurrent, colorKey) {
    var normalizedColor = normalizeColorKey(colorKey);
    var displayColor = toDisplayColor(normalizedColor);
    activeColor = normalizedColor;
    if (modalColorOps) {
      modalColorOps.querySelectorAll('.tb-color-option').forEach(function (btn) {
        var isActive = btn.dataset.color === normalizedColor;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-checked', String(isActive));
      });
    }
    if (modalAddCart) {
      modalAddCart.dataset.name = baseName + ' (' + displayColor + ')';
      modalAddCart.dataset.price = priceCurrent;
    }
    setModalCta(activeColorStock[normalizedColor] !== false);
  }

  function initColorOptions(card, baseName, priceCurrent) {
    clearColorOptions();
    if (!modalColors || !modalColorOps) return false;

    var colorsAttr = card.dataset.colorOptions || '';
    if (!colorsAttr) return false;

    try {
      activeColorOptions = JSON.parse(colorsAttr);
    } catch (_) {
      activeColorOptions = [];
    }
    activeColorOptions = activeColorOptions.map(normalizeColorKey).filter(Boolean);
    if (!activeColorOptions.length) return false;

    try {
      activeColorStock = JSON.parse(card.dataset.colorStock || '{}');
    } catch (_) {
      activeColorStock = {};
    }
    var normalizedColorStock = {};
    Object.keys(activeColorStock).forEach(function (key) {
      normalizedColorStock[normalizeColorKey(key)] = activeColorStock[key];
    });
    activeColorStock = normalizedColorStock;

    modalColors.style.display = '';
    modalColorOps.innerHTML = '';
    activeColorOptions.forEach(function (colorKey) {
      var inStock = activeColorStock[colorKey] !== false;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tb-color-option';
      if (!inStock) btn.classList.add('is-oos');
      btn.dataset.color = colorKey;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.setAttribute('aria-label', inStock ? toDisplayColor(colorKey) : (toDisplayColor(colorKey) + ' (Out of stock)'));
      btn.textContent = toDisplayColor(colorKey);
      btn.addEventListener('click', function () {
        updateSelectedColor(baseName, priceCurrent, colorKey);
      });
      modalColorOps.appendChild(btn);
    });

    if (modalAddCart) {
      modalAddCart.classList.remove('enquire-product');
      modalAddCart.classList.add('add-to-cart');
      modalAddCart.innerHTML = '<i class="fas fa-list"></i> Select Color';
      modalAddCart.setAttribute('aria-label', 'Select color before adding to cart');
      modalAddCart.dataset.name = baseName;
      modalAddCart.dataset.price = priceCurrent;
      modalAddCart.disabled = true;
    }
    return true;
  }

  function openModal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('tb-modal-open');
    // Move focus to close button
    var closeBtn = modal.querySelector('.tb-modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('tb-modal-open');
    // Return focus to the card that opened modal
    if (lastFocused) lastFocused.focus();
  }

  // ── close triggers ───────────────────────────

  modal.querySelectorAll('[data-modal-close]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', function (e) {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (activeImages.length > 1) {
        e.preventDefault();
        setThumb((activeIndex + 1) % activeImages.length);
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (activeImages.length > 1) {
        e.preventDefault();
        setThumb((activeIndex - 1 + activeImages.length) % activeImages.length);
      }
    } else if (e.key === 'Tab') {
      // Basic focus trap: keep focus inside modal
      var focusable = Array.from(modal.querySelectorAll(
        'button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])'
      )).filter(function (el) { return el.offsetParent !== null; });
      if (!focusable.length) return;
      var first = focusable[0];
      var last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  });

  // ── prev / next buttons ──────────────────────
  if (modalPrev) {
    modalPrev.addEventListener('click', function () {
      setThumb((activeIndex - 1 + activeImages.length) % activeImages.length);
    });
  }
  if (modalNext) {
    modalNext.addEventListener('click', function () {
      setThumb((activeIndex + 1) % activeImages.length);
    });
  }

  // ── touch/swipe on main image ────────────────
  if (modalMainImg) {
    var swipeStartX = 0;
    modalMainImg.addEventListener('touchstart', function (e) {
      swipeStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    modalMainImg.addEventListener('touchend', function (e) {
      var diff = swipeStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40 && activeImages.length > 1) {
        setThumb(diff > 0
          ? (activeIndex + 1) % activeImages.length
          : (activeIndex - 1 + activeImages.length) % activeImages.length);
      }
    }, { passive: true });
  }

  // ── open on card click (event delegation) ────
  document.addEventListener('click', function (e) {
    var chooseOptionsBtn = e.target.closest('.choose-options');
    var card = e.target.closest('.product-card');
    if (!card) return;

    // Don't open modal if the user clicked a link or button (e.g., Add to Cart)
    if (e.target.closest('a, button') && !chooseOptionsBtn) return;

    lastFocused = card;

    // Collect images from data-images (JSON array or comma-separated) or fall back to card img
    var imagesAttr = card.dataset.images || '';
    if (imagesAttr) {
      try {
        activeImages = JSON.parse(imagesAttr);
      } catch (_) {
        activeImages = imagesAttr.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      }
    }
    if (!activeImages || !activeImages.length) {
      var fallbackImg = card.querySelector('.product-card-img img');
      activeImages = fallbackImg ? [fallbackImg.src] : [];
    }

    // Product name
    var name = card.dataset.name ||
      (card.querySelector('.product-name') ? card.querySelector('.product-name').textContent.trim() : 'Product');

    // Prices
    var priceCurrent  = card.querySelector('.price-current')  ? card.querySelector('.price-current').textContent.trim()  : '';
    var priceOriginal = card.querySelector('.price-original') ? card.querySelector('.price-original').textContent.trim() : '';

    // Badge
    var badgeEl    = card.querySelector('.product-badge');
    var badgeText  = badgeEl ? badgeEl.textContent.trim() : '';
    var badgeClass = badgeEl
      ? Array.from(badgeEl.classList)
          .filter(function (c) { return c !== 'product-badge' && c !== 'modal-product-badge'; })
          .join(' ')
      : '';

    // Populate modal
    if (modalTitle)    modalTitle.textContent = name;
    if (modalBadge) {
      if (badgeText) {
        modalBadge.className = ('product-badge ' + badgeClass).trim();
        modalBadge.textContent = badgeText;
        modalBadge.style.display = '';
      } else {
        modalBadge.style.display = 'none';
      }
    }
    if (modalPrice) {
      modalPrice.innerHTML = priceOriginal
        ? '<span class="tb-price-current">' + priceCurrent + '</span>' +
          '<span class="tb-price-original">' + priceOriginal + '</span>'
        : '<span class="tb-price-current">' + priceCurrent + '</span>';
    }
    if (modalAddCart) {
      modalAddCart.dataset.name = name;
      modalAddCart.dataset.price = priceCurrent;
      var hasColorOptions = card.dataset.category === 'jewellery-box';
      if (!hasColorOptions || !initColorOptions(card, name, priceCurrent)) {
        clearColorOptions();
        var modalInStock = (card.dataset.inStock || 'true').toLowerCase() !== 'false';
        setModalCta(modalInStock);
      }
    }

    // Build thumbnails
    if (modalThumbs) {
      modalThumbs.innerHTML = '';
      activeImages.forEach(function (url, idx) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('aria-label', 'View image ' + (idx + 1));
        btn.setAttribute('aria-pressed', idx === 0 ? 'true' : 'false');
        var img = document.createElement('img');
        img.src = url;
        img.alt = name + ' image ' + (idx + 1);
        img.loading = 'lazy';
        btn.appendChild(img);
        btn.addEventListener('click', function () { setThumb(idx); });
        modalThumbs.appendChild(btn);
      });
    }

    activeIndex = 0;
    if (modalMainImg && activeImages.length) {
      modalMainImg.src = activeImages[0];
      modalMainImg.alt = name + ' image 1';
    }
    updateNavVisibility();

    openModal();
  });

  } // end if (modal)

}());

// ── Out of Stock (OOS) functionality ─────────────────────────────────────────

(function () {

  var WA_NUMBER = '918247382157';

  function buildEnquiryMessage(name, price) {
    var lines = [
      'Hi TaraBloom,',
      'I am interested in the following product:',
      'Product: ' + (name || 'N/A'),
      price ? 'Price: ' + price : '',
      'Status shown: Out of Stock',
      'Could you please let me know about availability and expected restock timeline?'
    ].filter(Boolean);
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  function initOosButtons() {
    document.querySelectorAll('.product-card').forEach(function (card) {
      var inStock = (card.dataset.inStock || 'true').toLowerCase() !== 'false';
      if (inStock) return;

      var btn = card.querySelector('.add-to-cart');
      if (!btn) return;

      var nameEl  = card.querySelector('.product-name');
      var priceEl = card.querySelector('.price-current');
      var name  = btn.dataset.name  || (nameEl  ? nameEl.textContent.trim()  : '');
      var price = btn.dataset.price || (priceEl ? priceEl.textContent.trim() : '');

      btn.classList.remove('add-to-cart');
      btn.classList.add('enquire-product');
      btn.innerHTML = '<i class="fab fa-whatsapp"></i> Enquire';
      btn.dataset.name  = name;
      btn.dataset.price = price;

      // Add "Out of Stock" badge, replacing any existing badge
      var imgWrapper = card.querySelector('.product-card-img');
      if (imgWrapper) {
        var existingBadge = imgWrapper.querySelector('.product-badge');
        if (existingBadge && existingBadge.classList.contains('badge-out-of-stock')) return;
        if (existingBadge) {
          existingBadge.remove();
        }
        var badge = document.createElement('span');
        badge.className = 'product-badge badge-out-of-stock';
        badge.textContent = 'Out of Stock';
        imgWrapper.appendChild(badge);
      }
    });
  }

  // Delegate enquire-product clicks (cards and modal)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.enquire-product');
    if (!btn) return;
    window.open(buildEnquiryMessage(btn.dataset.name || '', btn.dataset.price || ''), '_blank');
  });

  initOosButtons();

}());
