/**
 * Tests for cart.js — customer details, validation, persistence, and checkout integration.
 * @jest-environment jest-environment-jsdom
 */

'use strict';

/* ------------------------------------------------------------------ */
/*  DOM scaffold required by cart.js on load                           */
/* ------------------------------------------------------------------ */
function setupDOM() {
  document.body.innerHTML = `
    <button id="header-cart-btn">Cart</button>
    <span class="cart-badge"></span>
    <div class="tb-cart-drawer" id="tb-cart-drawer" aria-hidden="true">
      <div class="tb-cart-backdrop" id="tb-cart-backdrop"></div>
      <div class="tb-cart-panel">
        <div class="tb-cart-header">
          <h3>My Cart</h3>
          <button class="tb-cart-close" id="tb-cart-close">&times;</button>
        </div>
        <div class="tb-cart-body" id="tb-cart-body"></div>
        <div class="tb-cart-footer" id="tb-cart-footer" style="display:none">
          <a class="btn btn-whatsapp" id="tb-cart-whatsapp" href="#">Send Cart to WhatsApp</a>
        </div>
      </div>
    </div>`;
}

/* ------------------------------------------------------------------ */
/*  localStorage mock                                                   */
/* ------------------------------------------------------------------ */
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

/* ------------------------------------------------------------------ */
/*  Load cart.js (after DOM + localStorage are set up)                 */
/* ------------------------------------------------------------------ */
setupDOM();
const { _test } = require('../js/cart.js');
const {
  validateCustomer,
  buildWhatsAppUrl,
  getCart,
  saveCart,
  getCustomer,
  saveCustomer,
  clearCustomer,
  addToCart,
  removeFromCart,
  updateQty,
  escapeHtml,
  renderCustomerForm,
  renderCartDrawer,
  calcOrderSummary,
  renderOrderSummary
} = _test;

/* ================================================================== */
/*  SECTION 1: validateCustomer                                        */
/* ================================================================== */
describe('validateCustomer', () => {
  const validData = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+91 9876543210',
    address1: '12 Rose Street',
    address2: 'Near Park',
    city: 'Mumbai',
    state: 'Maharashtra',
    pin: '400001'
  };

  test('returns no errors for fully valid data', () => {
    expect(validateCustomer(validData)).toEqual({});
  });

  test('requires fullName', () => {
    const errors = validateCustomer({ ...validData, fullName: '' });
    expect(errors.fullName).toBe('Full name is required.');
  });

  test('requires email', () => {
    const errors = validateCustomer({ ...validData, email: '' });
    expect(errors.email).toBe('Email address is required.');
  });

  test('rejects invalid email format', () => {
    const errors = validateCustomer({ ...validData, email: 'not-an-email' });
    expect(errors.email).toBe('Enter a valid email address.');
  });

  test('accepts valid email with sub-domains', () => {
    const errors = validateCustomer({ ...validData, email: 'user@mail.example.co.in' });
    expect(errors.email).toBeUndefined();
  });

  test('requires phone', () => {
    const errors = validateCustomer({ ...validData, phone: '' });
    expect(errors.phone).toBe('Phone number is required.');
  });

  test('rejects invalid phone (too short)', () => {
    const errors = validateCustomer({ ...validData, phone: '123' });
    expect(errors.phone).toBe('Enter a valid phone number.');
  });

  test('requires address1', () => {
    const errors = validateCustomer({ ...validData, address1: '  ' });
    expect(errors.address1).toBe('Address line 1 is required.');
  });

  test('address2 is optional — no error when missing', () => {
    const { address2, ...withoutAddress2 } = validData;
    expect(validateCustomer(withoutAddress2).address2).toBeUndefined();
  });

  test('requires city', () => {
    const errors = validateCustomer({ ...validData, city: '' });
    expect(errors.city).toBe('City is required.');
  });

  test('requires state', () => {
    const errors = validateCustomer({ ...validData, state: '' });
    expect(errors.state).toBe('State/Region is required.');
  });

  test('requires PIN code', () => {
    const errors = validateCustomer({ ...validData, pin: '' });
    expect(errors.pin).toBe('PIN code is required.');
  });

  test('rejects non-numeric PIN code', () => {
    const errors = validateCustomer({ ...validData, pin: 'ABCDEF' });
    expect(errors.pin).toBe('Enter a valid 6-digit PIN code.');
  });

  test('rejects PIN code shorter than 6 digits', () => {
    const errors = validateCustomer({ ...validData, pin: '12345' });
    expect(errors.pin).toBe('Enter a valid 6-digit PIN code.');
  });

  test('rejects PIN code longer than 6 digits', () => {
    const errors = validateCustomer({ ...validData, pin: '1234567' });
    expect(errors.pin).toBe('Enter a valid 6-digit PIN code.');
  });

  test('does not include a country field error', () => {
    const errors = validateCustomer(validData);
    expect(errors.country).toBeUndefined();
  });

  test('reports multiple errors at once', () => {
    const errors = validateCustomer({ fullName: '', email: 'bad', phone: '', address1: '', city: '', state: '', pin: '' });
    expect(Object.keys(errors).length).toBeGreaterThan(1);
  });
});

/* ================================================================== */
/*  SECTION 2: Customer details storage (persistence)                  */
/* ================================================================== */
describe('Customer details storage', () => {
  beforeEach(() => localStorage.clear());

  test('getCustomer returns empty object when nothing saved', () => {
    expect(getCustomer()).toEqual({});
  });

  test('saveCustomer persists data to localStorage', () => {
    const data = { fullName: 'Test User', email: 'test@example.com', pin: '560001' };
    saveCustomer(data);
    expect(getCustomer()).toMatchObject(data);
  });

  test('clearCustomer removes data from localStorage', () => {
    saveCustomer({ fullName: 'Test User' });
    clearCustomer();
    expect(getCustomer()).toEqual({});
  });

  test('customer details persist across cart item changes', () => {
    const customerData = { fullName: 'Persist Test', email: 'p@example.com', phone: '9999999999', address1: '1 Test St', city: 'City', state: 'State', pin: '123456' };
    saveCustomer(customerData);

    // Simulate a cart update
    addToCart('Ring', '₹999');
    updateQty('Ring', 3);
    removeFromCart('Ring');

    // Customer details unchanged
    expect(getCustomer()).toMatchObject({ fullName: 'Persist Test' });
  });

  test('customer details persist through multiple renderCartDrawer calls', () => {
    saveCustomer({ fullName: 'Re-render Test', email: 're@example.com', phone: '8888888888', address1: '2 St', city: 'C', state: 'S', pin: '654321' });
    addToCart('Bracelet', '₹499');

    renderCartDrawer();
    renderCartDrawer();
    renderCartDrawer();

    // Customer data still available
    expect(getCustomer().fullName).toBe('Re-render Test');
  });
});

/* ================================================================== */
/*  SECTION 3: Customer details form rendering                         */
/* ================================================================== */
describe('Customer form rendering', () => {
  beforeEach(() => {
    localStorage.clear();
    setupDOM();
  });

  test('renderCustomerForm returns HTML containing all required fields', () => {
    const html = renderCustomerForm();
    expect(html).toContain('id="tb-cust-name"');
    expect(html).toContain('id="tb-cust-email"');
    expect(html).toContain('id="tb-cust-phone"');
    expect(html).toContain('id="tb-cust-address1"');
    expect(html).toContain('id="tb-cust-address2"');
    expect(html).toContain('id="tb-cust-city"');
    expect(html).toContain('id="tb-cust-state"');
    expect(html).toContain('id="tb-cust-pin"');
  });

  test('renderCustomerForm uses label "PIN Code" (not Postal/ZIP)', () => {
    const html = renderCustomerForm();
    const div = document.createElement('div');
    div.innerHTML = html;
    const labelTexts = Array.from(div.querySelectorAll('label')).map(l => l.textContent.trim());
    const pinLabel = labelTexts.find(t => /pin/i.test(t));
    expect(pinLabel).toBeDefined();
    // No label should say "Postal" or "ZIP code" as the field name
    expect(labelTexts.some(t => /postal\s*code/i.test(t) || /zip\s*code/i.test(t))).toBe(false);
  });

  test('renderCustomerForm does not include a country field', () => {
    const html = renderCustomerForm();
    expect(html).not.toMatch(/country/i);
    expect(html).not.toContain('tb-cust-country');
  });

  test('renderCustomerForm marks address2 as optional', () => {
    const html = renderCustomerForm();
    expect(html).toContain('optional');
  });

  test('renderCustomerForm prefills fields from saved customer data', () => {
    saveCustomer({ fullName: 'Pre Fill', email: 'pre@fill.com', phone: '7777777777', address1: 'Prefill St', city: 'PCity', state: 'PState', pin: '500001' });
    const html = renderCustomerForm();
    expect(html).toContain('value="Pre Fill"');
    expect(html).toContain('value="pre@fill.com"');
    expect(html).toContain('value="7777777777"');
    expect(html).toContain('value="PCity"');
    expect(html).toContain('value="PState"');
    expect(html).toContain('value="500001"');
  });

  test('renderCartDrawer appends customer form after cart items', () => {
    addToCart('Necklace', '₹1299');
    renderCartDrawer();
    const body = document.getElementById('tb-cart-body');
    const form = body.querySelector('#tb-customer-form');
    const items = body.querySelector('.tb-cart-items');
    expect(form).not.toBeNull();
    expect(items).not.toBeNull();
    // Form should appear after items
    expect(body.innerHTML.indexOf('tb-cart-items')).toBeLessThan(body.innerHTML.indexOf('tb-customer-form'));
  });

  test('renderCartDrawer does not show customer form when cart is empty', () => {
    saveCart([]);
    renderCartDrawer();
    const form = document.getElementById('tb-customer-form');
    expect(form).toBeNull();
  });
});

/* ================================================================== */
/*  SECTION 4: buildWhatsAppUrl — checkout integration                 */
/* ================================================================== */
describe('buildWhatsAppUrl with customer details', () => {
  const cart = [
    { name: 'Gold Ring', price: '₹2499', qty: 1 },
    { name: 'Silver Bracelet', price: '₹999', qty: 2 }
  ];
  const customer = {
    fullName: 'Ananya Sharma',
    email: 'ananya@example.com',
    phone: '+91 9988776655',
    address1: '7 Lotus Lane',
    address2: 'Near Temple',
    city: 'Bangalore',
    state: 'Karnataka',
    pin: '560001'
  };

  test('URL contains cart items', () => {
    const url = buildWhatsAppUrl(cart, customer);
    expect(url).toContain(encodeURIComponent('Gold Ring'));
    expect(url).toContain(encodeURIComponent('Silver Bracelet'));
  });

  test('URL contains customer full name', () => {
    const url = buildWhatsAppUrl(cart, customer);
    expect(url).toContain(encodeURIComponent('Ananya Sharma'));
  });

  test('URL contains customer phone', () => {
    const url = buildWhatsAppUrl(cart, customer);
    expect(url).toContain(encodeURIComponent('+91 9988776655'));
  });

  test('URL contains customer email', () => {
    const url = buildWhatsAppUrl(cart, customer);
    expect(url).toContain(encodeURIComponent('ananya@example.com'));
  });

  test('URL contains customer address including city, state and PIN', () => {
    const url = buildWhatsAppUrl(cart, customer);
    expect(url).toContain(encodeURIComponent('Bangalore'));
    expect(url).toContain(encodeURIComponent('Karnataka'));
    expect(url).toContain(encodeURIComponent('560001'));
  });

  test('URL contains optional address line 2 when provided', () => {
    const url = buildWhatsAppUrl(cart, customer);
    expect(url).toContain(encodeURIComponent('Near Temple'));
  });

  test('URL works without customer details (legacy fallback)', () => {
    const url = buildWhatsAppUrl(cart);
    expect(url).toContain('wa.me/918247382157');
    expect(url).toContain(encodeURIComponent('Gold Ring'));
    expect(url).not.toContain(encodeURIComponent('Delivery Details'));
  });

  test('URL does not include customer section when customer has no fullName', () => {
    const url = buildWhatsAppUrl(cart, {});
    expect(url).not.toContain(encodeURIComponent('Delivery Details'));
  });

  test('does not include country in the URL', () => {
    const custWithCountry = { ...customer, country: 'India' };
    const url = buildWhatsAppUrl(cart, custWithCountry);
    // The field 'country' itself should not appear as a label in the message
    expect(url).not.toContain(encodeURIComponent('Country:'));
  });
});

/* ================================================================== */
/*  SECTION 5: escapeHtml                                               */
/* ================================================================== */
describe('escapeHtml', () => {
  test('escapes ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });
  test('escapes less-than', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });
  test('escapes double quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });
  test('handles non-string input', () => {
    expect(escapeHtml(42)).toBe('42');
  });
});

/* ================================================================== */
/*  SECTION 6: calcOrderSummary — cart total calculations              */
/* ================================================================== */
describe('calcOrderSummary', () => {
  test('subtotal ₹1000 => shipping ₹0, total ₹1000', () => {
    const cart = [{ name: 'Ring', price: '₹1000', qty: 1 }];
    const summary = calcOrderSummary(cart);
    expect(summary.subtotal).toBe(1000);
    expect(summary.shipping).toBe(0);
    expect(summary.total).toBe(1000);
  });

  test('subtotal ₹999 => shipping ₹100, total ₹1099', () => {
    const cart = [{ name: 'Ring', price: '₹999', qty: 1 }];
    const summary = calcOrderSummary(cart);
    expect(summary.subtotal).toBe(999);
    expect(summary.shipping).toBe(100);
    expect(summary.total).toBe(1099);
  });

  test('subtotal ₹500 => shipping ₹100, total ₹600', () => {
    const cart = [{ name: 'Bracelet', price: '₹500', qty: 1 }];
    const summary = calcOrderSummary(cart);
    expect(summary.subtotal).toBe(500);
    expect(summary.shipping).toBe(100);
    expect(summary.total).toBe(600);
  });

  test('accumulates price * qty across multiple items', () => {
    const cart = [
      { name: 'Necklace', price: '₹600', qty: 2 },
      { name: 'Ring', price: '₹200', qty: 1 }
    ];
    const summary = calcOrderSummary(cart);
    expect(summary.subtotal).toBe(1400);
    expect(summary.shipping).toBe(0);
    expect(summary.total).toBe(1400);
  });

  test('empty cart => subtotal 0, shipping ₹100, total ₹100', () => {
    const summary = calcOrderSummary([]);
    expect(summary.subtotal).toBe(0);
    expect(summary.shipping).toBe(100);
    expect(summary.total).toBe(100);
  });

  test('free shipping is strictly > 999, not >= 999', () => {
    const cartAtThreshold = [{ name: 'Item', price: '₹999', qty: 1 }];
    const cartAboveThreshold = [{ name: 'Item', price: '₹1000', qty: 1 }];
    expect(calcOrderSummary(cartAtThreshold).shipping).toBe(100);
    expect(calcOrderSummary(cartAboveThreshold).shipping).toBe(0);
  });
});

/* ================================================================== */
/*  SECTION 7: renderOrderSummary — HTML rendering                     */
/* ================================================================== */
describe('renderOrderSummary', () => {
  test('contains Subtotal, Shipping and Total labels', () => {
    const cart = [{ name: 'Ring', price: '₹500', qty: 1 }];
    const html = renderOrderSummary(cart);
    expect(html).toContain('Subtotal');
    expect(html).toContain('Shipping');
    expect(html).toContain('Total');
  });

  test('shows FREE when shipping is zero', () => {
    const cart = [{ name: 'Item', price: '₹1000', qty: 1 }];
    const html = renderOrderSummary(cart);
    expect(html).toContain('FREE');
  });

  test('shows ₹100 shipping when subtotal <= 999', () => {
    const cart = [{ name: 'Item', price: '₹500', qty: 1 }];
    const html = renderOrderSummary(cart);
    expect(html).toContain('100');
  });

  test('renderCartDrawer includes order summary section for non-empty cart', () => {
    setupDOM();
    localStorage.clear();
    saveCart([{ name: 'Necklace', price: '₹600', qty: 1 }]);
    renderCartDrawer();
    const body = document.getElementById('tb-cart-body');
    expect(body.innerHTML).toContain('tb-order-summary');
    expect(body.innerHTML).toContain('Order Summary');
  });

  test('order summary appears between cart items and customer form', () => {
    setupDOM();
    localStorage.clear();
    saveCart([{ name: 'Necklace', price: '₹600', qty: 1 }]);
    renderCartDrawer();
    const body = document.getElementById('tb-cart-body');
    const itemsIdx = body.innerHTML.indexOf('tb-cart-items');
    const summaryIdx = body.innerHTML.indexOf('tb-order-summary');
    const formIdx = body.innerHTML.indexOf('tb-customer-form');
    expect(itemsIdx).toBeLessThan(summaryIdx);
    expect(summaryIdx).toBeLessThan(formIdx);
  });
});
