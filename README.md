# TaraBloom

TaraBloom is a multi-page static jewellery storefront built with HTML, CSS, and vanilla JavaScript.
The site includes product discovery, quick-view interactions, a localStorage-powered cart drawer, and WhatsApp checkout.

## Features

- Multi-page storefront: Home, Collections, New Arrivals, Best Sellers, About, Contact
- Responsive header/navigation with mobile menu toggle and active-link highlighting
- Home page product carousel with controls + touch swipe support
- Collections category filtering via query params (`/collections/?category=...`)
- Product quick-view modal with gallery, thumbnail switching, keyboard controls, and focus handling
- Out-of-stock flow that changes Add to Cart into WhatsApp Enquire buttons
- Cart drawer with:
  - localStorage persistence
  - quantity increase/decrease
  - remove item action
  - live cart badge updates
  - order summary (subtotal, shipping, total)
- Customer delivery form in cart with validation before checkout
- WhatsApp checkout URL builder that includes cart items, order totals, and customer details
- Newsletter and contact form success-state handling on submit

## Tech stack

- HTML5 (multi-page static site)
- CSS3 (`css/styles.css`)
- Vanilla JavaScript:
  - `js/main.js` for UI interactions and modal logic
  - `js/cart.js` for cart state, validation, and checkout link generation
- Jest + JSDOM for unit/integration tests (`tests/cart.test.js`)

## Project structure

```text
TaraBloom/
  index.html
  about/index.html
  best-sellers/index.html
  collections/index.html
  contact/index.html
  new-arrivals/index.html
  css/styles.css
  js/main.js
  js/cart.js
  tests/cart.test.js
  images/
  robots.txt
  sitemap.xml
  CNAME
```

## Local development

There is no build step for the site frontend. Use a static server from the project root so absolute paths like `/collections/` resolve correctly.

1. Install dev dependencies (for tests):

```powershell
npm install
```

2. Serve the project:

```powershell
py -m http.server 8080
```

3. Open in browser:

- `http://localhost:8080/`

## Scripts

```powershell
npm test
```

`npm test` runs Jest in JSDOM (`jest-environment-jsdom`) and executes files matching `**/tests/**/*.test.js`.

## Test coverage (current)

`tests/cart.test.js` validates:

- customer form validation rules
- customer persistence in localStorage
- cart add/remove/update behavior
- cart drawer rendering + customer form placement
- order summary calculation/rendering
- WhatsApp checkout URL content and fallback behavior
- drawer open/close behavior

## Cart and checkout details

- Cart localStorage key: `tb-cart`
- Customer localStorage key: `tb-customer`
- WhatsApp number used in checkout/enquiry: `918247382157`
- Shipping in `js/cart.js`:
  - default shipping: `Rs 100`
  - free shipping threshold: subtotal `> Rs 999`
- Checkout opens `https://wa.me/918247382157` with encoded order + delivery details

## Deployment notes

- Repository is structured for static hosting
- `CNAME`, `robots.txt`, and `sitemap.xml` are included for domain and SEO configuration

## Contact

- Instagram: `https://instagram.com/tarabloom.in`
- WhatsApp: `https://wa.me/918247382157`
- Email: `tarabloom.in@gmail.com`
