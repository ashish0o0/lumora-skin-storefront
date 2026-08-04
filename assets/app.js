const CART_KEY = "lumora_cart";
const DISCOUNT_KEY = "lumora_discount";
const RECENT_KEY = "lumora_recently_viewed";
const QUIZ_KEY = "lumora_quiz_results";

/* ─── Cart Storage ─── */
function getCart() {
  const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  return raw.map((item) => {
    if (!item.qty) item.qty = 1;
    if (!item.image) {
      const p = PRODUCTS.find((pr) => pr.id === item.id);
      if (p) item.image = p.image;
    }
    return item;
  });
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function cartCount(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const count = cartCount(getCart());
  document.querySelectorAll("[data-cart-count]").forEach((badge) => {
    badge.textContent = count.toString();
  });
}

function money(value) {
  return `$${value.toFixed(2)}`;
}

function stars(rating) {
  const full = Math.round(rating);
  return `${"★".repeat(full)}${"☆".repeat(5 - full)}`;
}

function savePercent(product) {
  return Math.round(((product.compareAt - product.price) / product.compareAt) * 100);
}

/* ─── Recently Viewed Products ─── */
function trackRecentlyViewed(productId) {
  let viewed = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  viewed = viewed.filter((id) => id !== productId);
  viewed.unshift(productId);
  if (viewed.length > 4) viewed = viewed.slice(0, 4);
  localStorage.setItem(RECENT_KEY, JSON.stringify(viewed));
}

function renderRecentlyViewed(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const viewedIds = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  const viewedProducts = PRODUCTS.filter((p) => viewedIds.includes(p.id));
  if (!viewedProducts.length) {
    container.style.display = "none";
    return;
  }
  container.style.display = "block";
  container.innerHTML = `
    <h2>Recently Viewed</h2>
    <div class="grid grid-3 product-grid"></div>
  `;
  const grid = container.querySelector(".product-grid");
  viewedProducts.forEach((p) => grid.appendChild(createProductCard(p)));
}

/* ─── Toast System ─── */
function getToastContainer() {
  let c = document.querySelector(".toast-container");
  if (!c) {
    c = document.createElement("div");
    c.className = "toast-container";
    document.body.appendChild(c);
  }
  return c;
}

function showToast(message) {
  const container = getToastContainer();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("out");
    setTimeout(() => toast.remove(), 200);
  }, 2500);
}

/* ─── Product Card Component (Flex Layout & Stacked Badges) ─── */
function createProductCard(product) {
  const lowStockMap = {
    "night-renew": "Only 4 left",
    "calm-mist": "Only 7 left",
    "repair-moisturizer": "Only 6 left"
  };

  const card = document.createElement("article");
  card.className = "product-card";
  card.innerHTML = `
    <div class="product-image-wrap">
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      <div class="card-badges-corner">
        <span class="save-badge">${savePercent(product)}% OFF</span>
        ${lowStockMap[product.id] ? `<span class="stock-note">${lowStockMap[product.id]}</span>` : ""}
      </div>
    </div>
    <div class="product-body">
      <div class="product-meta-row">
        <span class="tag">${product.badge}</span>
        <span class="sku-tag">${product.sku || 'LUM-SKU'}</span>
      </div>
      <h3>${product.name}</h3>
      <p class="product-description">${product.description}</p>
      <div class="actives-chip">${product.activesPct || 'Clinical Actives'}</div>
      <p class="rating">${stars(product.rating)} ${product.rating} (${product.reviews})</p>
      <div class="price-row">
        <strong>${money(product.price)}</strong>
        <span>${money(product.compareAt)}</span>
      </div>
      <div class="button-row">
        <a href="product.html?id=${product.id}" class="btn btn-outline">Shop now</a>
        <button class="btn btn-primary" data-add-cart="${product.id}">Quick add</button>
      </div>
    </div>
  `;
  return card;
}

function renderProducts(containerSelector, list) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.classList.add("product-grid");
  container.innerHTML = "";
  if (list.length === 0) {
    container.innerHTML = '<p class="no-results" style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--muted)">No products match your criteria.</p>';
    return;
  }
  list.forEach((p) => container.appendChild(createProductCard(p)));
}

/* ─── Offer Timer (IBM Plex Mono) ─── */
function startOfferTimer() {
  const timerEl = document.querySelector("[data-offer-timer]");
  if (!timerEl) return;

  let seconds = 11 * 60 * 60 + 59 * 60 + 59;
  const tick = () => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    timerEl.textContent = `${h}:${m}:${s}`;
    seconds = seconds > 0 ? seconds - 1 : 11 * 60 * 60 + 59 * 60 + 59;
  };
  tick();
  setInterval(tick, 1000);
}

/* ─── Add to Cart ─── */
function addToCart(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.image
    });
  }
  saveCart(cart);
  updateCartBadge();
  showToast(`${product.name} added to cart`);
}

function bindCartButtons() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-cart]");
    if (!btn) return;
    e.preventDefault();
    const id = btn.getAttribute("data-add-cart");
    addToCart(id);
    btn.textContent = "Added ✓";
    setTimeout(() => (btn.textContent = "Quick add"), 1200);
  });
}

/* ─── Cart Quantity Stepper & Removal ─── */
function removeCartItem(id) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== id);
  saveCart(cart);
  updateCartBadge();
}

function updateCartItemQty(id, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeCartItem(id);
  } else {
    saveCart(cart);
    updateCartBadge();
  }
}

/* ─── Free Shipping Progress Bar ─── */
function renderShippingBar(containerSelector = "[data-shipping-bar]") {
  const barEl = document.querySelector(containerSelector);
  if (!barEl) return;
  const cart = getCart();
  const total = cartTotal(cart);
  const threshold = 50;
  const pct = Math.min((total / threshold) * 100, 100);
  if (total >= threshold) {
    barEl.innerHTML = `
      <p>🎉 You've unlocked <strong>free shipping!</strong></p>
      <div class="bar-track"><div class="bar-fill" style="width:100%"></div></div>
    `;
  } else {
    const remaining = (threshold - total).toFixed(2);
    barEl.innerHTML = `
      <p>Add <strong>$${remaining}</strong> more to unlock <strong>Free Shipping</strong></p>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
    `;
  }
}

/* ─── Discount Code ─── */
function getDiscount() {
  return JSON.parse(localStorage.getItem(DISCOUNT_KEY) || "null");
}

function applyDiscountCode(code) {
  const c = code.trim().toUpperCase();
  if (c === "LUMORA10") {
    localStorage.setItem(DISCOUNT_KEY, JSON.stringify({ code: c, percent: 10 }));
    showToast("Discount applied — 10% off!");
    return true;
  }
  showToast("Invalid discount code");
  return false;
}

/* ─── Render Cart Page & Empty Cart State ─── */
function renderCartPage() {
  const list = document.querySelector("[data-cart-list]");
  const totalEl = document.querySelector("[data-cart-total]");
  if (!list || !totalEl) return;

  const cart = getCart();
  renderShippingBar("[data-shipping-bar]");

  if (!cart.length) {
    list.innerHTML = `
      <div class="card" style="text-align:center;padding:3rem 1.5rem">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.5" style="margin-bottom:1rem"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        <h3 style="margin-bottom:0.5rem">Your cart is currently empty</h3>
        <p class="small" style="margin-bottom:1.5rem">Explore our clinically-inspired products and build your routine.</p>
        <a href="catalog.html" class="btn btn-primary">Browse All Products</a>
      </div>
    `;
    totalEl.textContent = money(0);
    const discountMsg = document.querySelector("[data-discount-msg]");
    if (discountMsg) discountMsg.textContent = "";
    renderCrossSells("[data-cart-cross-sell]");
    return;
  }

  list.innerHTML = "";
  cart.forEach((item) => {
    const row = document.createElement("article");
    row.className = "card cart-item";
    row.innerHTML = `
      <div class="cart-item-info">
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
        <div>
          <h4 style="margin:0">${item.name}</h4>
          <p class="small" style="margin:2px 0 0">${money(item.price)} each</p>
        </div>
      </div>
      <div class="cart-item-actions">
        <div class="qty-stepper">
          <button data-qty-change="${item.id}" data-delta="-1" aria-label="Decrease quantity">−</button>
          <span>${item.qty}</span>
          <button data-qty-change="${item.id}" data-delta="1" aria-label="Increase quantity">+</button>
        </div>
        <button class="btn-remove" data-remove-item="${item.id}">Remove</button>
      </div>
    `;
    list.appendChild(row);
  });

  const subtotal = cartTotal(cart);
  const discount = getDiscount();
  let discountAmount = 0;
  if (discount) {
    discountAmount = subtotal * (discount.percent / 100);
  }
  const finalTotal = subtotal - discountAmount;
  totalEl.textContent = money(finalTotal);

  const discountMsg = document.querySelector("[data-discount-msg]");
  if (discountMsg) {
    discountMsg.textContent = discount
      ? `${discount.code}: -${money(discountAmount)} (${discount.percent}% off)`
      : "";
  }

  renderCrossSells("[data-cart-cross-sell]");
}

function renderCrossSells(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const cartIds = getCart().map((i) => i.id);
  const available = PRODUCTS.filter((p) => !cartIds.includes(p.id));
  const crossSellProducts = available.slice(0, 3);
  if (!crossSellProducts.length) {
    container.style.display = "none";
    return;
  }
  container.style.display = "block";
  container.innerHTML = `
    <h3>Complete Your Routine</h3>
    <div class="cross-sell-grid"></div>
  `;
  const grid = container.querySelector(".cross-sell-grid");
  crossSellProducts.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.padding = "0.875rem";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" loading="lazy" style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:8px" />
      <span class="tag" style="margin-bottom:4px">${p.badge}</span>
      <h4 style="font-size:0.9375rem;margin:4px 0">${p.name}</h4>
      <p class="font-mono" style="margin:0 0 8px;font-size:0.875rem;font-weight:600">${money(p.price)}</p>
      <button class="btn btn-secondary" style="width:100%;padding:0.4rem;font-size:0.75rem" data-add-cart="${p.id}">Add to Order</button>
    `;
    grid.appendChild(card);
  });
}

function bindCartActions() {
  const cartList = document.querySelector("[data-cart-list]");
  if (!cartList) return;

  cartList.addEventListener("click", (e) => {
    const removeBtn = e.target.closest("[data-remove-item]");
    if (removeBtn) {
      removeCartItem(removeBtn.getAttribute("data-remove-item"));
      renderCartPage();
      return;
    }
    const qtyBtn = e.target.closest("[data-qty-change]");
    if (qtyBtn) {
      const id = qtyBtn.getAttribute("data-qty-change");
      const delta = parseInt(qtyBtn.getAttribute("data-delta"), 10);
      updateCartItemQty(id, delta);
      renderCartPage();
    }
  });

  const discountForm = document.querySelector("[data-discount-form]");
  if (discountForm) {
    discountForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = discountForm.querySelector("input");
      if (applyDiscountCode(input.value)) {
        renderCartPage();
      }
    });
  }
}

/* ─── Product Detail Page (PDP) & Ingredient Tooltips ─── */
function renderProductDetails() {
  const detail = document.querySelector("[data-product-detail]");
  if (!detail) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];

  document.title = `${product.name} | Lumora Skin`;
  trackRecentlyViewed(product.id);

  const ingredientsHtml = product.ingredients.map((ing) => {
    const info = INGREDIENT_DETAILS[ing] || "Clinical active ingredient.";
    return `
      <span class="ingredient-chip">
        ${ing} ℹ️
        <span class="tooltip">${info}</span>
      </span>
    `;
  }).join("");

  detail.innerHTML = `
    <div class="detail-grid">
      <img src="${product.image}" alt="${product.name}" />
      <div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
          <span class="tag">${product.badge}</span>
          <span class="sku-tag font-mono">${product.sku}</span>
        </div>
        <h1>${product.name}</h1>
        <p style="color:var(--muted);margin-bottom:1rem">${product.description}</p>
        <div class="actives-chip font-mono" style="margin-bottom:1rem;display:inline-block">${product.activesPct}</div>
        <p class="rating">${stars(product.rating)} ${product.rating} average (${product.reviews} verified reviews)</p>
        <div class="price-row" style="margin:1rem 0">
          <strong style="font-size:1.5rem">${money(product.price)}</strong>
          <span style="font-size:1.125rem">${money(product.compareAt)}</span>
        </div>
        <p><strong>Key Active Ingredients:</strong></p>
        <div class="ingredients-list">${ingredientsHtml}</div>
        <p style="margin-top:1rem"><strong>How to apply:</strong> ${product.use}</p>
        <ul style="padding-left:1.2rem;margin-bottom:1.5rem">
          ${product.benefits.map((b) => `<li>${b}</li>`).join("")}
        </ul>
        <div class="button-row" style="grid-template-columns:1fr 1fr;max-width:360px">
          <button class="btn btn-primary" data-add-cart="${product.id}">Add to cart</button>
          <a class="btn btn-secondary" href="cart.html">Go to cart</a>
        </div>
      </div>
    </div>
  `;

  renderRecentlyViewed("[data-recently-viewed]");
  renderCrossSells("[data-pdp-cross-sell]");
}

/* ─── Checkout Summary & Free Shipping Bar Extension ─── */
function renderCheckoutSummary() {
  const summaryEl = document.querySelector("[data-order-summary]");
  if (!summaryEl) return;
  const cart = getCart();

  renderShippingBar("[data-checkout-shipping-bar]");

  if (!cart.length) {
    summaryEl.innerHTML = `<p class="small">Your cart is empty. <a href="catalog.html">Add products first</a>.</p>`;
    return;
  }

  const subtotal = cartTotal(cart);
  const discount = getDiscount();
  let discountAmount = 0;
  if (discount) discountAmount = subtotal * (discount.percent / 100);
  const shipping = subtotal >= 50 ? 0 : 4.99;
  const total = subtotal - discountAmount + shipping;

  let itemsHtml = cart.map((item) => `
    <div class="summary-item">
      <div class="summary-item-info">
        <img src="${item.image}" alt="${item.name}" />
        <div>
          <h4 style="font-size:0.875rem;margin:0">${item.name}</h4>
          <p class="small font-mono" style="margin:0">Qty: ${item.qty}</p>
        </div>
      </div>
      <strong class="font-mono">${money(item.price * item.qty)}</strong>
    </div>
  `).join("");

  summaryEl.innerHTML = `
    <h3>Order Summary</h3>
    ${itemsHtml}
    <div class="summary-totals font-mono">
      <div class="row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
      ${discount ? `<div class="row"><span>Discount (${discount.code})</span><span>-${money(discountAmount)}</span></div>` : ""}
      <div class="row"><span>Shipping</span><span>${shipping === 0 ? "Free" : money(shipping)}</span></div>
      <div class="row total"><span>Total</span><span>${money(total)}</span></div>
    </div>
  `;
}

function bindCheckoutForm() {
  const form = document.querySelector("[data-checkout-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const cart = getCart();
    if (!cart.length) {
      const status = document.querySelector("[data-checkout-status]");
      if (status) status.textContent = "Your cart is empty. Add products before checkout.";
      return;
    }
    // Generate simulated order receipt data
    const orderData = {
      orderId: `LUM-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      total: cartTotal(cart),
      itemsCount: cartCount(cart)
    };
    localStorage.setItem("lumora_last_order", JSON.stringify(orderData));

    saveCart([]);
    localStorage.removeItem(DISCOUNT_KEY);
    updateCartBadge();
    window.location.href = "order-success.html";
  });
}

function renderOrderSuccessPage() {
  const orderDetailsEl = document.querySelector("[data-order-details]");
  if (!orderDetailsEl) return;
  const lastOrder = JSON.parse(localStorage.getItem("lumora_last_order") || "null");
  if (!lastOrder) return;

  orderDetailsEl.innerHTML = `
    <div class="card font-mono" style="background:var(--bg);border-style:dashed;margin:1rem 0;text-align:left">
      <p style="margin:4px 0"><strong>Order Number:</strong> ${lastOrder.orderId}</p>
      <p style="margin:4px 0"><strong>Order Date:</strong> ${lastOrder.date}</p>
      <p style="margin:4px 0"><strong>Estimated Delivery:</strong> 3-5 Business Days</p>
      <p style="margin:4px 0"><strong>Shipping Carrier:</strong> Lumora Express Dispatch</p>
    </div>
  `;
}

/* ─── Catalog Search & Filters ─── */
function initCatalogFilters() {
  const container = document.querySelector("[data-all-products]");
  const searchInput = document.querySelector("[data-catalog-search]");
  const filterContainer = document.querySelector("[data-filter-pills]");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const concernParam = params.get("concern");

  let activeCategory = "All";
  let activeConcern = concernParam || null;
  let searchQuery = "";

  function filterProducts() {
    let filtered = PRODUCTS;
    if (activeCategory !== "All") {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }
    if (activeConcern) {
      filtered = filtered.filter((p) =>
        p.concerns && p.concerns.includes(activeConcern.toLowerCase())
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    renderProducts("[data-all-products]", filtered);
  }

  if (filterContainer) {
    const categories = ["All", ...new Set(PRODUCTS.map((p) => p.category))];
    filterContainer.innerHTML = categories
      .map(
        (cat) =>
          `<button class="filter-pill${cat === "All" ? " active" : ""}" data-filter="${cat}">${cat}</button>`
      )
      .join("");

    filterContainer.addEventListener("click", (e) => {
      const pill = e.target.closest("[data-filter]");
      if (!pill) return;
      activeCategory = pill.getAttribute("data-filter");
      activeConcern = null;
      filterContainer.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      filterProducts();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchQuery = searchInput.value;
      filterProducts();
    });
  }

  if (concernParam) {
    const heading = document.querySelector("[data-catalog-heading]");
    if (heading) {
      heading.textContent = `Formulas for ${concernParam.charAt(0).toUpperCase() + concernParam.slice(1).replace("-", " ")}`;
    }
  }

  filterProducts();
}

/* ─── FAQ Accordion ─── */
function initFaqAccordion() {
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((el) => el.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });
}

/* ─── Mobile Menu ─── */
function initMobileMenu() {
  const hamburger = document.querySelector("[data-hamburger]");
  const menu = document.querySelector(".menu");
  if (!hamburger || !menu) return;

  hamburger.addEventListener("click", () => {
    menu.classList.toggle("menu-open");
    hamburger.textContent = menu.classList.contains("menu-open") ? "✕" : "☰";
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("menu-open");
      hamburger.textContent = "☰";
    });
  });
}

/* ─── Form Submissions ─── */
function initNewsletterForm() {
  document.querySelectorAll(".newsletter form, form.newsletter-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]');
      if (email && email.value) {
        showToast("Welcome to Lumora Skin! Check your inbox for 10% off 🧪");
        form.reset();
      }
    });
  });
}

function initContactForm() {
  const form = document.querySelector("main form");
  const heading = document.querySelector("main h1");
  if (!form || !heading || !heading.textContent.includes("Contact")) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Message received! Our team will respond within 24 hours.");
    form.reset();
  });
}

/* ─── Quiz Engine & Quiz Result Persistence ─── */
function initSkinQuiz() {
  const overlay = document.querySelector("[data-quiz-overlay]");
  if (!overlay) return;

  const quizData = { answers: {}, step: 0 };
  const steps = overlay.querySelectorAll(".quiz-step");
  const dots = overlay.querySelectorAll(".quiz-dot");

  function showStep(index) {
    quizData.step = index;
    steps.forEach((s, i) => s.classList.toggle("active", i === index));
    dots.forEach((d, i) => {
      d.classList.toggle("active", i === index);
      d.classList.toggle("done", i < index);
    });
  }

  document.querySelectorAll("[data-open-quiz]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      overlay.classList.add("active");
      
      // Check if user has saved quiz results
      const savedQuiz = JSON.parse(localStorage.getItem(QUIZ_KEY) || "null");
      if (savedQuiz && savedQuiz.answers) {
        showQuizResults(savedQuiz.answers);
        showStep(steps.length - 1);
      } else {
        quizData.answers = {};
        quizData.step = 0;
        overlay.querySelectorAll(".quiz-option").forEach((o) => o.classList.remove("selected"));
        showStep(0);
      }
    });
  });

  overlay.querySelector(".quiz-close").addEventListener("click", () => overlay.classList.remove("active"));
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.remove("active"); });

  overlay.querySelectorAll(".quiz-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      const step = opt.closest(".quiz-step");
      const key = step.getAttribute("data-quiz-key");
      step.querySelectorAll(".quiz-option").forEach((o) => o.classList.remove("selected"));
      opt.classList.add("selected");
      quizData.answers[key] = opt.getAttribute("data-value");
    });
  });

  overlay.querySelectorAll("[data-quiz-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const currentStep = steps[quizData.step];
      const key = currentStep.getAttribute("data-quiz-key");
      if (!quizData.answers[key]) {
        showToast("Please select an option");
        return;
      }
      if (quizData.step < steps.length - 2) {
        showStep(quizData.step + 1);
      } else {
        // Save quiz results persistently
        localStorage.setItem(QUIZ_KEY, JSON.stringify({ answers: quizData.answers, date: new Date().toISOString() }));
        showQuizResults(quizData.answers);
        showStep(steps.length - 1);
      }
    });
  });

  overlay.querySelectorAll("[data-quiz-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (quizData.step > 0) showStep(quizData.step - 1);
    });
  });
}

function showQuizResults(answers) {
  const resultsEl = document.querySelector("[data-quiz-results]");
  if (!resultsEl) return;

  const concern = answers.concern || "";
  const goal = answers.goal || "";

  let scored = PRODUCTS.map((p) => {
    let score = 0;
    if (p.concerns && p.concerns.includes(concern)) score += 3;
    if (goal === "glow" && p.concerns && p.concerns.includes("glow")) score += 2;
    if (goal === "repair" && p.concerns && p.concerns.includes("barrier-repair")) score += 2;
    if (goal === "calm" && p.concerns && p.concerns.includes("redness")) score += 2;
    if (goal === "hydrate" && p.concerns && p.concerns.includes("dryness")) score += 2;
    return { ...p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top3 = scored.slice(0, 3);

  resultsEl.innerHTML = `
    <h2>Your Custom Clinical Routine</h2>
    <p class="small">Based on your diagnostics, here is your 3-step prescription:</p>
    <div class="cross-sell-grid" style="margin-top:1rem;text-align:left">
      ${top3.map((p) => `
        <div class="card" style="padding:0.75rem">
          <img src="${p.image}" alt="${p.name}" style="width:100%;height:100px;object-fit:cover;border-radius:6px;margin-bottom:6px" />
          <h4 style="font-size:0.875rem;margin:0 0 2px">${p.name}</h4>
          <span class="tag" style="font-size:0.7rem">${p.badge}</span>
          <p class="font-mono" style="margin:4px 0;font-size:0.8125rem;font-weight:600">${money(p.price)}</p>
          <a href="product.html?id=${p.id}" class="btn btn-secondary" style="width:100%;padding:0.35rem;font-size:0.75rem">View Formula</a>
        </div>
      `).join("")}
    </div>
    <div style="margin-top:1.5rem;display:flex;gap:8px;justify-content:center">
      <button class="btn btn-outline" onclick="localStorage.removeItem('${QUIZ_KEY}');location.reload();">Retake Quiz</button>
      <a href="catalog.html" class="btn btn-primary">Browse All Products</a>
    </div>
  `;
}

/* ─── Initialization ─── */
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderProductDetails();
  renderCartPage();
  renderProducts("[data-featured-products]", PRODUCTS.slice(0, 3));
  initCatalogFilters();
  bindCartButtons();
  bindCartActions();
  bindCheckoutForm();
  renderCheckoutSummary();
  renderOrderSuccessPage();
  startOfferTimer();
  initFaqAccordion();
  initMobileMenu();
  initNewsletterForm();
  initContactForm();
  initSkinQuiz();
});
