const CART_KEY = "lumora_cart";

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price, 0);
}

function updateCartBadge() {
  const count = getCart().length;
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
      <span class="save-badge">${savePercent(product)}% OFF</span>
      ${lowStockMap[product.id] ? `<span class="stock-note">${lowStockMap[product.id]}</span>` : ""}
    </div>
    <div class="product-body">
      <span class="tag">${product.badge}</span>
      <h3>${product.name}</h3>
      <p class="product-description">${product.description}</p>
      <p class="rating">${stars(product.rating)} ${product.rating} (${product.reviews})</p>
      <div class="price-row">
        <strong>${money(product.price)}</strong>
        <span>${money(product.compareAt)}</span>
      </div>
      <div class="button-row">
        <a href="product.html?id=${product.id}" class="btn btn-outline">Shop now</a>
        <button class="btn btn-dark" data-add-cart="${product.id}">Quick add</button>
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
  list.forEach((p) => container.appendChild(createProductCard(p)));
}

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

function bindCartButtons() {
  document.querySelectorAll("[data-add-cart]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-add-cart");
      const product = PRODUCTS.find((p) => p.id === id);
      if (!product) return;
      const cart = getCart();
      cart.push({ id: product.id, name: product.name, price: product.price });
      saveCart(cart);
      updateCartBadge();
      button.textContent = "Added";
      setTimeout(() => (button.textContent = "Add to cart"), 900);
    });
  });
}

function removeCartItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  updateCartBadge();
}

function renderProductDetails() {
  const detail = document.querySelector("[data-product-detail]");
  if (!detail) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];

  detail.innerHTML = `
    <div class="detail-grid">
      <img src="${product.image}" alt="${product.name}" />
      <div>
        <span class="tag">${product.badge}</span>
        <h1>${product.name}</h1>
        <p>${product.description}</p>
        <p class="rating">${stars(product.rating)} ${product.rating} average from ${product.reviews} reviews</p>
        <div class="price-row big">
          <strong>${money(product.price)}</strong>
          <span>${money(product.compareAt)}</span>
        </div>
        <p><strong>How to use:</strong> ${product.use}</p>
        <p><strong>Key ingredients:</strong> ${product.ingredients.join(", ")}</p>
        <ul class="benefits">
          ${product.benefits.map((b) => `<li>${b}</li>`).join("")}
        </ul>
        <div class="button-row">
          <button class="btn btn-dark" data-add-cart="${product.id}">Add to cart</button>
          <a class="btn btn-outline" href="cart.html">Go to cart</a>
        </div>
      </div>
    </div>
    <div class="trust-strip">
      <div>Dermatologist-informed</div>
      <div>30-day returns</div>
      <div>Cruelty-free</div>
      <div>Secure checkout</div>
    </div>
    <div class="sticky-cart">
      <div>
        <strong>${product.name}</strong>
        <p>${money(product.price)}</p>
      </div>
      <button class="btn btn-dark" data-add-cart="${product.id}">Add to cart</button>
    </div>
  `;
}

function renderCartPage() {
  const list = document.querySelector("[data-cart-list]");
  const totalEl = document.querySelector("[data-cart-total]");
  if (!list || !totalEl) return;

  const cart = getCart();
  if (!cart.length) {
    list.innerHTML = `<div class="card"><p>Your cart is empty. <a href="catalog.html">Browse products</a></p></div>`;
    totalEl.textContent = money(0);
    return;
  }

  list.innerHTML = "";
  cart.forEach((item, index) => {
    const row = document.createElement("article");
    row.className = "card cart-item";
    row.innerHTML = `
      <div>
        <h3>${item.name}</h3>
        <p class="small">${money(item.price)}</p>
      </div>
      <button class="btn btn-outline" data-remove-item="${index}">Remove</button>
    `;
    list.appendChild(row);
  });

  totalEl.textContent = money(cartTotal(cart));
}

function bindCartActions() {
  document.querySelectorAll("[data-remove-item]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.getAttribute("data-remove-item"));
      removeCartItem(index);
      renderCartPage();
    });
  });
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
    saveCart([]);
    updateCartBadge();
    window.location.href = "order-success.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderProductDetails();
  renderCartPage();
  renderProducts("[data-featured-products]", PRODUCTS.slice(0, 3));
  renderProducts("[data-best-sellers]", PRODUCTS.slice(0, 4));
  renderProducts("[data-all-products]", PRODUCTS);
  bindCartButtons();
  bindCartActions();
  bindCheckoutForm();
  startOfferTimer();
});
