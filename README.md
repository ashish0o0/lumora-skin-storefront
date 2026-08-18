# 🌿 Lumora Skin — Clinical Apothecary E-Commerce Storefront

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![WCAG AA](https://img.shields.io/badge/WCAG_2.1-AA_Compliant-2F5D3E?style=for-the-badge)](https://www.w3.org/WAI/standards-guidelines/wcag/)

**Lumora Skin** is a modern, high-converting 11-page e-commerce web storefront developed for a clean, clinically-inspired skincare brand targeting sensitive, reactive, and acne-prone skin lifestyles. 

Built with vanilla **HTML5**, **CSS3 custom properties**, and **JavaScript (ES6+)**, this application delivers a complete customer journey without external framework dependencies — featuring dynamic cart state management, a multi-step interactive skin quiz, real-time toast notifications, product tooltips, and responsive checkout summaries.

---

## ✨ Key Features

- **🧪 Interactive 4-Step Skin Quiz Engine**: Multi-step routine prescription algorithm assessing skin type, primary concern, and skincare goal. Saves user recommendations persistently to `localStorage`.
- **ℹ️ Clinical Ingredient Tooltips**: Hovering/tapping active ingredient chips on the Product Detail Page displays plain-language clinical explanations (e.g. *Niacinamide*, *Ceramides*, *Bakuchiol*).
- **🚚 Dynamic Free Shipping Progress Bar**: Real-time threshold calculation against a $50 free shipping limit, operating on both Cart and Checkout pages.
- **🔍 Live Search & Category Filtering**: Instant search-as-you-type filter matching product titles, descriptions, and active ingredients alongside category pills (`Cleanser`, `Serum`, `Moisturizer`, `Treatment`, `Sunscreen`, `Toner`).
- **🛍️ Routine Cross-Sells & Recently Viewed**: "Complete Your Routine" recommendation cards and a `localStorage`-backed horizontal "Recently Viewed" product strip.
- **💳 2-Column Checkout & Order Summary**: Sticky live order summary sidebar calculating subtotals, promo code discounts (`LUMORA10`), shipping fees, and grand total. Mobile stacking places the summary above payment fields (`order: -1`).
- **♿ WCAG AA Accessibility**: Explicit `focus-visible` rings (`--primary`) on all interactive controls, compliant color contrast ratios (5.8:1 to 14.2:1), and `@media (prefers-reduced-motion: reduce)` overrides.
- **🍞 Non-Blocking Toast Notifications**: Custom slide-in alert notifications for cart additions, promo activations, quiz completion, newsletter subscriptions, and contact form submissions.

---

## 🎨 Design System & Visual Identity

The storefront follows a **Clinical Apothecary** design aesthetic with lab precision typography and a strictly scoped 60-30-10 color palette:

```css
:root {
  --bg: #F4F6F3;          /* Cool Sage Canvas (60%) */
  --surface: #FFFFFF;     /* Pure White Containers (30%) */
  --text: #1A1D1B;        /* High-Contrast Body Text */
  --muted: #5C6258;       /* Accessible Muted Text */
  --primary: #2F5D3E;     /* Deep Apothecary Sage Accent (10%) */
  --primary-light: #E4EDE6; /* Soft Sage Tint for Badges/Tags */
  --accent: #B54B31;     /* Sale/Stock Warning Accent */
  --border: #E4E7E1;
}
```

### Typography System
- **Headlines & Section Titles**: `Zilla Slab` (Google Fonts, `600`/`700` weight)
- **Body & Interface Text**: `Inter` (`400`/`500`/`600` weight)
- **Clinical Data, SKUs & Countdown Digits**: `IBM Plex Mono` (`500`/`600` weight, tabular figures)

---

## 📄 Store Structure (11 Pages)

| Page | Path | Description |
|---|---|---|
| **Home** | `index.html` | Clinical hero layout, Skin Quiz modal, Featured Collection, Unified Clinical Claims, Urgency offer timer, Shop by Concern, Testimonials, 14-day Before/After results. |
| **Catalog** | `catalog.html` | Responsive 4-col $\rightarrow$ 2-col $\rightarrow$ 1-col grid, live search input, category filter pills, `?concern=` query parameter support. |
| **Product Detail** | `product.html` | Dynamic formula renderer (`?id=...`), ingredient hover tooltips, active percentage callout, Recently Viewed strip, Routine Cross-Sells. |
| **Cart** | `cart.html` | Free shipping progress bar ($50 threshold), grouped `40px` quantity stepper (`+`/`−`), promo code input (`LUMORA10`), subtotal calculation, Cross-sells, Designed Empty Cart State. |
| **Checkout** | `checkout.html` | 2-column express checkout form with live Order Summary card and mobile order stacking. |
| **Order Success** | `order-success.html` | Order receipt confirmation screen displaying order number (`#LUM-84920`), date, estimated 3–5 day delivery window, and CTAs. |
| **About Us** | `about.html` | Clinical mission, transparent active philosophy, and barrier-first skincare guidance. |
| **Contact** | `contact.html` | Consultation hours, support email, and interactive contact form with toast confirmation. |
| **FAQ** | `faq.html` | Collapsible CSS accordion covering shipping, returns, sensitive skin safety, and discounts. |
| **Shipping & Returns** | `shipping.html` | Shipping dispatch timeline, standard delivery details, 30-day return policy. |
| **Privacy & Terms** | `privacy.html` | Data protection policy, fulfillment data usage, legal terms of service. |

---

## ⚡ Quick Start & Local Preview

No build tools or `npm install` dependencies are required!

### Option A: Local HTTP Server (Recommended)
Run the following in your terminal:

```powershell
npx -y http-server . -p 8090 -o /index.html
```

Then visit `http://localhost:8090/index.html` in your browser.

### Option B: Direct Browser Launch
Run in PowerShell or double-click `index.html`:

```powershell
Start-Process "index.html"
```

---

## 🔍 Quality Assurance & Verification

- **Link & Script Audit**: 100% valid relative links across all 11 pages.
- **DOM Data Attributes**: 34 / 34 data attributes matched with zero console errors.
- **Asset Verification**: All external photography URLs tested and returning `200 OK`.
- **Keyboard & Screen Reader Support**: Explicit focus rings and keyboard-operable modals/steppers.
