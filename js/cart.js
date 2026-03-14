(function () {
  'use strict';

  var WA_NUMBER = '918247382157';
  var STORAGE_KEY = 'tb-cart';

  /* =============================================
     CART STORAGE — localStorage
     ============================================= */

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (_) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function addToCart(name, price) {
    var cart = getCart();
    var found = false;
    cart.forEach(function (item) {
      if (item.name === name) {
        item.qty += 1;
        found = true;
      }
    });
    if (!found) {
      cart.push({ name: name, price: price || '', qty: 1 });
    }
    saveCart(cart);
    return cart;
  }

  function removeFromCart(name) {
    var cart = getCart().filter(function (item) { return item.name !== name; });
    saveCart(cart);
    return cart;
  }

  function updateQty(name, qty) {
    var cart = getCart();
    var idx = -1;
    cart.forEach(function (item, i) { if (item.name === name) idx = i; });
    if (idx > -1) {
      if (qty < 1) {
        cart.splice(idx, 1);
      } else {
        cart[idx].qty = qty;
      }
    }
    saveCart(cart);
    return cart;
  }

  /* =============================================
     BADGE — cart item count in header
     ============================================= */

  function getTotalCount(cart) {
    return cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
  }

  function updateBadges(cart) {
    var count = getTotalCount(cart || getCart());
    document.querySelectorAll('.cart-badge').forEach(function (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? '' : 'none';
    });
  }

  /* =============================================
     WHATSAPP MESSAGE BUILDER
     ============================================= */

  function buildWhatsAppUrl(cart) {
    var lines = ['Hi! I want to order the following items from TaraBloom:'];
    cart.forEach(function (item) {
      lines.push('\u2022 ' + item.name + (item.price ? ' \u2014 ' + item.price : '') + ' x' + item.qty);
    });
    lines.push('\nKindly confirm availability and total. Thank you! \uD83C\uDF38');
    var text = lines.join('\n');
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }

  /* =============================================
     CART DRAWER RENDER
     ============================================= */

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderCartDrawer() {
    var cart = getCart();
    updateBadges(cart);

    var body = document.getElementById('tb-cart-body');
    var footer = document.getElementById('tb-cart-footer');
    if (!body) return;

    if (!cart.length) {
      body.innerHTML =
        '<div class="tb-cart-empty">' +
          '<i class="fas fa-shopping-bag tb-cart-empty-icon"></i>' +
          '<p>Your cart is empty</p>' +
          '<a href="/collections/" class="btn btn-primary" style="font-size:0.82rem;padding:10px 22px;">Shop Now</a>' +
        '</div>';
      if (footer) footer.style.display = 'none';
      return;
    }

    if (footer) footer.style.display = '';

    var html = '<ul class="tb-cart-items">';
    cart.forEach(function (item) {
      html +=
        '<li class="tb-cart-item">' +
          '<div class="tb-cart-item-info">' +
            '<div class="tb-cart-item-name">' + escapeHtml(item.name) + '</div>' +
            '<div class="tb-cart-item-price">' + escapeHtml(item.price) + '</div>' +
          '</div>' +
          '<div class="tb-cart-item-controls">' +
            '<button class="tb-qty-btn" data-action="dec" data-name="' + escapeHtml(item.name) + '" aria-label="Decrease quantity">&#8722;</button>' +
            '<span class="tb-qty-val">' + item.qty + '</span>' +
            '<button class="tb-qty-btn" data-action="inc" data-name="' + escapeHtml(item.name) + '" aria-label="Increase quantity">&#43;</button>' +
            '<button class="tb-remove-btn" data-name="' + escapeHtml(item.name) + '" aria-label="Remove ' + escapeHtml(item.name) + '"><i class="fas fa-trash-alt"></i></button>' +
          '</div>' +
        '</li>';
    });
    html += '</ul>';
    body.innerHTML = html;

    var waBtn = document.getElementById('tb-cart-whatsapp');
    if (waBtn) {
      waBtn.href = buildWhatsAppUrl(cart);
    }
  }

  /* =============================================
     DRAWER OPEN / CLOSE
     ============================================= */

  function openDrawer() {
    var drawer = document.getElementById('tb-cart-drawer');
    if (!drawer) return;
    renderCartDrawer();
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('tb-cart-open');
    var closeBtn = drawer.querySelector('.tb-cart-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeDrawer() {
    var drawer = document.getElementById('tb-cart-drawer');
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('tb-cart-open');
  }

  /* =============================================
     ADD-TO-CART TOAST
     ============================================= */

  function showAddedFeedback(btn) {
    var origHTML = btn.innerHTML;
    var origDisabled = btn.disabled;
    btn.innerHTML = '<i class="fas fa-check"></i> Added!';
    btn.disabled = true;
    setTimeout(function () {
      btn.innerHTML = origHTML;
      btn.disabled = origDisabled;
    }, 1200);
  }

  /* =============================================
     EVENT DELEGATION
     ============================================= */

  document.addEventListener('click', function (e) {

    /* Open cart drawer (header button) */
    if (e.target.closest('#header-cart-btn')) {
      openDrawer();
      return;
    }

    /* Close cart drawer */
    if (e.target.closest('#tb-cart-close') || e.target.closest('#tb-cart-backdrop')) {
      closeDrawer();
      return;
    }

    /* Add to Cart buttons on product cards / modal */
    var addBtn = e.target.closest('.add-to-cart');
    if (addBtn) {
      e.preventDefault();
      var name = addBtn.dataset.name;
      var price = addBtn.dataset.price || '';
      // If price not stored in data attribute, try to read from parent product card
      if (!price) {
        var card = addBtn.closest('.product-card, .tb-modal-info');
        if (card) {
          var priceEl = card.querySelector('.price-current, .tb-price-current');
          if (priceEl) price = priceEl.textContent.trim();
        }
      }
      if (name) {
        var cart = addToCart(name, price);
        updateBadges(cart);
        showAddedFeedback(addBtn);
      }
      return;
    }

    /* Qty controls inside drawer */
    var qtyBtn = e.target.closest('.tb-qty-btn');
    if (qtyBtn) {
      var itemName = qtyBtn.dataset.name;
      var action = qtyBtn.dataset.action;
      var currentCart = getCart();
      var currentItem = null;
      currentCart.forEach(function (it) { if (it.name === itemName) currentItem = it; });
      if (currentItem) {
        updateQty(itemName, action === 'inc' ? currentItem.qty + 1 : currentItem.qty - 1);
        renderCartDrawer();
      }
      return;
    }

    /* Remove item from drawer */
    var removeBtn = e.target.closest('.tb-remove-btn');
    if (removeBtn) {
      removeFromCart(removeBtn.dataset.name);
      renderCartDrawer();
      return;
    }

  });

  /* Close drawer on Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var drawer = document.getElementById('tb-cart-drawer');
      if (drawer && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
    }
  });

  /* =============================================
     INIT — update badge on every page load
     ============================================= */
  updateBadges(getCart());

}());
