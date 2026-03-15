(function () {
  'use strict';

  var WA_NUMBER = '918247382157';
  var STORAGE_KEY = 'tb-cart';
  var CUSTOMER_KEY = 'tb-customer';

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
     CUSTOMER DETAILS STORAGE — localStorage
     ============================================= */

  function getCustomer() {
    try {
      return JSON.parse(localStorage.getItem(CUSTOMER_KEY)) || {};
    } catch (_) {
      return {};
    }
  }

  function saveCustomer(data) {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(data));
  }

  function clearCustomer() {
    localStorage.removeItem(CUSTOMER_KEY);
  }

  /* =============================================
     CUSTOMER DETAILS VALIDATION
     ============================================= */

  function validateCustomer(data) {
    var errors = {};
    if (!data.fullName || !data.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    }
    if (!data.email || !data.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (!data.phone || !data.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!/^\+?[\d\s\-]{7,15}$/.test(data.phone.trim())) {
      errors.phone = 'Enter a valid phone number.';
    }
    if (!data.address1 || !data.address1.trim()) {
      errors.address1 = 'Address line 1 is required.';
    }
    if (!data.city || !data.city.trim()) {
      errors.city = 'City is required.';
    }
    if (!data.state || !data.state.trim()) {
      errors.state = 'State/Region is required.';
    }
    if (!data.pin || !data.pin.trim()) {
      errors.pin = 'PIN code is required.';
    } else if (!/^\d{6}$/.test(data.pin.trim())) {
      errors.pin = 'Enter a valid 6-digit PIN code.';
    }
    return errors;
  }

  /* =============================================
     ORDER SUMMARY CALCULATION
     ============================================= */

  var DEFAULT_SHIPPING = 100;
  var FREE_SHIPPING_THRESHOLD = 999;

  function parsePrice(price) {
    return parseFloat(String(price).replace(/[^\d.]/g, '')) || 0;
  }

  function calcOrderSummary(cart) {
    var subtotal = cart.reduce(function (sum, item) {
      return sum + parsePrice(item.price) * item.qty;
    }, 0);
    var shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING;
    var total = subtotal + shipping;
    return { subtotal: subtotal, shipping: shipping, total: total };
  }

  function renderOrderSummary(cart) {
    var s = calcOrderSummary(cart);
    return (
      '<div class="tb-order-summary">' +
        '<h4 class="tb-order-summary-title">Order Summary</h4>' +
        '<div class="tb-order-summary-row">' +
          '<span>Subtotal</span>' +
          '<span>\u20b9' + s.subtotal + '</span>' +
        '</div>' +
        '<div class="tb-order-summary-row">' +
          '<span>Shipping</span>' +
          '<span>' + (s.shipping === 0 ? 'FREE' : '\u20b9' + s.shipping) + '</span>' +
        '</div>' +
        '<div class="tb-order-summary-row tb-order-summary-total">' +
          '<span>Total</span>' +
          '<span>\u20b9' + s.total + '</span>' +
        '</div>' +
      '</div>'
    );
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

  function buildWhatsAppUrl(cart, customer) {
    var lines = ['Hi! I want to order the following items from TaraBloom:'];
    cart.forEach(function (item) {
      lines.push('\u2022 ' + item.name + (item.price ? ' \u2014 ' + item.price : '') + ' x' + item.qty);
    });
    if (customer && customer.fullName) {
      lines.push('\n*Delivery Details:*');
      lines.push('Name: ' + customer.fullName);
      if (customer.phone) lines.push('Phone: ' + customer.phone);
      if (customer.email) lines.push('Email: ' + customer.email);
      var addr = customer.address1 || '';
      if (customer.address2) addr += ', ' + customer.address2;
      if (customer.city) addr += ', ' + customer.city;
      if (customer.state) addr += ', ' + customer.state;
      if (customer.pin) addr += ' \u2014 ' + customer.pin;
      if (addr) lines.push('Address: ' + addr);
    }
    lines.push('\nKindly confirm availability and total. Thank you! \uD83C\uDF38');
    var text = lines.join('\n');
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }

  /* =============================================
     CUSTOMER DETAILS FORM RENDER
     ============================================= */

  function renderCustomerForm() {
    var c = getCustomer();
    return (
      '<div class="tb-customer-form" id="tb-customer-form">' +
        '<h4 class="tb-customer-form-title">Delivery Details</h4>' +
        '<div class="tb-form-row">' +
          '<label class="tb-form-label" for="tb-cust-name">Full Name <span class="tb-req" aria-hidden="true">*</span></label>' +
          '<input class="tb-form-input" type="text" id="tb-cust-name" name="fullName" autocomplete="name" placeholder="Your full name" value="' + escapeHtml(c.fullName || '') + '" aria-required="true">' +
          '<span class="tb-form-error" id="tb-err-fullName" aria-live="polite"></span>' +
        '</div>' +
        '<div class="tb-form-row">' +
          '<label class="tb-form-label" for="tb-cust-email">Email Address <span class="tb-req" aria-hidden="true">*</span></label>' +
          '<input class="tb-form-input" type="email" id="tb-cust-email" name="email" autocomplete="email" placeholder="you@example.com" value="' + escapeHtml(c.email || '') + '" aria-required="true">' +
          '<span class="tb-form-error" id="tb-err-email" aria-live="polite"></span>' +
        '</div>' +
        '<div class="tb-form-row">' +
          '<label class="tb-form-label" for="tb-cust-phone">Phone Number <span class="tb-req" aria-hidden="true">*</span></label>' +
          '<input class="tb-form-input" type="tel" id="tb-cust-phone" name="phone" autocomplete="tel" placeholder="+91 9876543210" value="' + escapeHtml(c.phone || '') + '" aria-required="true">' +
          '<span class="tb-form-error" id="tb-err-phone" aria-live="polite"></span>' +
        '</div>' +
        '<div class="tb-form-row">' +
          '<label class="tb-form-label" for="tb-cust-address1">Address Line 1 <span class="tb-req" aria-hidden="true">*</span></label>' +
          '<input class="tb-form-input" type="text" id="tb-cust-address1" name="address1" autocomplete="address-line1" placeholder="House/Flat no., Street" value="' + escapeHtml(c.address1 || '') + '" aria-required="true">' +
          '<span class="tb-form-error" id="tb-err-address1" aria-live="polite"></span>' +
        '</div>' +
        '<div class="tb-form-row">' +
          '<label class="tb-form-label" for="tb-cust-address2">Address Line 2 <span class="tb-opt">(optional)</span></label>' +
          '<input class="tb-form-input" type="text" id="tb-cust-address2" name="address2" autocomplete="address-line2" placeholder="Area, Landmark" value="' + escapeHtml(c.address2 || '') + '">' +
        '</div>' +
        '<div class="tb-form-row tb-form-row-half">' +
          '<div>' +
            '<label class="tb-form-label" for="tb-cust-city">City <span class="tb-req" aria-hidden="true">*</span></label>' +
            '<input class="tb-form-input" type="text" id="tb-cust-city" name="city" autocomplete="address-level2" placeholder="City" value="' + escapeHtml(c.city || '') + '" aria-required="true">' +
            '<span class="tb-form-error" id="tb-err-city" aria-live="polite"></span>' +
          '</div>' +
          '<div>' +
            '<label class="tb-form-label" for="tb-cust-state">State / Region <span class="tb-req" aria-hidden="true">*</span></label>' +
            '<input class="tb-form-input" type="text" id="tb-cust-state" name="state" autocomplete="address-level1" placeholder="State" value="' + escapeHtml(c.state || '') + '" aria-required="true">' +
            '<span class="tb-form-error" id="tb-err-state" aria-live="polite"></span>' +
          '</div>' +
        '</div>' +
        '<div class="tb-form-row">' +
          '<label class="tb-form-label" for="tb-cust-pin">PIN Code <span class="tb-req" aria-hidden="true">*</span></label>' +
          '<input class="tb-form-input" type="text" id="tb-cust-pin" name="pin" autocomplete="postal-code" placeholder="6-digit PIN code" maxlength="6" value="' + escapeHtml(c.pin || '') + '" aria-required="true">' +
          '<span class="tb-form-error" id="tb-err-pin" aria-live="polite"></span>' +
        '</div>' +
      '</div>'
    );
  }

  function showCustomerErrors(errors) {
    var fields = ['fullName', 'email', 'phone', 'address1', 'city', 'state', 'pin'];
    fields.forEach(function (field) {
      var el = document.getElementById('tb-err-' + field);
      if (el) el.textContent = errors[field] || '';
    });
  }

  function clearCustomerErrors() {
    var fields = ['fullName', 'email', 'phone', 'address1', 'city', 'state', 'pin'];
    fields.forEach(function (field) {
      var el = document.getElementById('tb-err-' + field);
      if (el) el.textContent = '';
    });
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
    html += renderOrderSummary(cart);
    html += renderCustomerForm();
    body.innerHTML = html;

    var waBtn = document.getElementById('tb-cart-whatsapp');
    if (waBtn) {
      waBtn.href = buildWhatsAppUrl(cart, getCustomer());
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
        var card = addBtn.closest('.product-card');
        if (card) {
          var priceEl = card.querySelector('.price-current');
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

    /* WhatsApp checkout button — validate customer details first */
    if (e.target.closest('#tb-cart-whatsapp')) {
      var customer = getCustomer();
      var errors = validateCustomer(customer);
      if (Object.keys(errors).length > 0) {
        e.preventDefault();
        showCustomerErrors(errors);
        var form = document.getElementById('tb-customer-form');
        if (form) {
          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
          var firstErrField = form.querySelector('.tb-form-error:not(:empty)');
          if (firstErrField) {
            var input = firstErrField.previousElementSibling;
            if (input && input.focus) input.focus();
          }
        }
        return;
      }
      /* Update href with latest data before navigating */
      var waBtn = document.getElementById('tb-cart-whatsapp');
      if (waBtn) waBtn.href = buildWhatsAppUrl(getCart(), customer);
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

  /* Persist customer details on input change */
  document.addEventListener('input', function (e) {
    var input = e.target;
    if (!input.closest || !input.closest('#tb-customer-form')) return;
    var name = input.name;
    if (!name) return;
    var customer = getCustomer();
    customer[name] = input.value;
    saveCustomer(customer);
    /* Clear error for this field as user types */
    var errEl = document.getElementById('tb-err-' + name);
    if (errEl) errEl.textContent = '';
    /* Keep WhatsApp button href in sync */
    var waBtn = document.getElementById('tb-cart-whatsapp');
    if (waBtn) waBtn.href = buildWhatsAppUrl(getCart(), getCustomer());
  });

  /* =============================================
     INIT — update badge on every page load
     ============================================= */
  updateBadges(getCart());

  /* =============================================
     TEST EXPORTS (Node/Jest environment only)
     ============================================= */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      _test: {
        validateCustomer: validateCustomer,
        buildWhatsAppUrl: buildWhatsAppUrl,
        getCart: getCart,
        saveCart: saveCart,
        getCustomer: getCustomer,
        saveCustomer: saveCustomer,
        clearCustomer: clearCustomer,
        addToCart: addToCart,
        removeFromCart: removeFromCart,
        updateQty: updateQty,
        escapeHtml: escapeHtml,
        renderCustomerForm: renderCustomerForm,
        renderCartDrawer: renderCartDrawer,
        calcOrderSummary: calcOrderSummary,
        renderOrderSummary: renderOrderSummary,
        parsePrice: parsePrice
      }
    };
  }

}());
