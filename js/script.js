// Kidasichetu Africa storefront interactions
document.addEventListener("DOMContentLoaded", function () {
  const year = document.getElementById("year");
  const productGrid = document.getElementById("productGrid");
  const productLoading = document.getElementById("productLoading");
  const featuredSlider = document.getElementById("featuredSlider");
  const featuredSlides = document.getElementById("featuredSlides");
  const featuredControls = document.getElementById("featuredControls");
  const featuredDots = document.getElementById("featuredDots");
  const featuredEmpty = document.getElementById("featuredEmpty");
  const heroShowcase = document.getElementById("heroShowcase");
  const heroShowcaseSlides = document.getElementById("heroShowcaseSlides");
  const heroShowcaseControls = document.getElementById("heroShowcaseControls");
  const heroShowcaseDots = document.getElementById("heroShowcaseDots");
  const heroShowcaseStatus = document.getElementById("heroShowcaseStatus");
  const storyBagsCarousel = document.getElementById("storyBagsCarousel");
  const storyBagsSlides = document.getElementById("storyBagsSlides");
  const storyBagsStatus = document.getElementById("storyBagsStatus");
  const storyBagsAnnouncement = document.getElementById("storyBagsAnnouncement");
  const storyMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const whatsappNumber = "254759956943";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cartStorageKey = "kidasichetuCart";
  const cartToggle = document.getElementById("cartToggle");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartItems = document.getElementById("cartItems");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const cartCheckout = document.getElementById("cartCheckout");
  const cartCount = document.getElementById("cartCount");
  let featuredIndex = 0;
  let featuredTimer;
  let heroShowcaseIndex = 0;
  let heroShowcaseTimer;
  let storyBagsIndex = 0;
  let storyBagsTimer;

  if (year) year.textContent = new Date().getFullYear();

  document.querySelectorAll("#mainNav .nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      const nav = document.getElementById("mainNav");
      if (nav && nav.classList.contains("show") && window.bootstrap) {
        window.bootstrap.Collapse.getOrCreateInstance(nav).hide();
      }
    });
  });

  if (cartToggle && cartDrawer && cartOverlay) {
    cartToggle.addEventListener("click", function () {
      const isOpen = !cartDrawer.classList.contains("is-open");
      setCartOpen(isOpen);
    });
    cartOverlay.addEventListener("click", function () {
      setCartOpen(false);
    });
    document.getElementById("cartClose").addEventListener("click", function () {
      setCartOpen(false);
    });
  }

  function showStatus(message, isError) {
    productLoading.textContent = message;
    productLoading.hidden = false;
    productLoading.classList.toggle("is-error", Boolean(isError));
  }

  function readCart() {
    try {
      const rawCart = localStorage.getItem(cartStorageKey);
      if (!rawCart) {
        return [];
      }
      const parsed = JSON.parse(rawCart);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter(function (item) {
        return item && typeof item.id === "string" && Number(item.quantity) > 0;
      });
    } catch (error) {
      console.warn("Unable to read the shopping cart from localStorage.", error);
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(cartStorageKey, JSON.stringify(items));
  }

  function setCartOpen(isOpen) {
    if (!cartDrawer || !cartOverlay || !cartToggle) {
      return;
    }
    cartDrawer.classList.toggle("is-open", isOpen);
    cartDrawer.setAttribute("aria-hidden", String(!isOpen));
    cartOverlay.hidden = !isOpen;
    cartToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("cart-open", isOpen);
  }

  function formatPrice(price) {
    return "KSh " + Number(price).toLocaleString("en-KE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  function getCartTotal(items) {
    return items.reduce(function (sum, item) {
      return sum + Number(item.price) * Number(item.quantity);
    }, 0);
  }

  function updateCartCheckoutLink(items) {
    if (!cartCheckout) {
      return;
    }
    if (!items.length) {
      cartCheckout.classList.add("is-disabled");
      cartCheckout.setAttribute("aria-disabled", "true");
      cartCheckout.removeAttribute("href");
      return;
    }

    const messages = items.map(function (item) {
      return "- " + item.name + " x" + item.quantity + " (" + formatPrice(Number(item.price) * Number(item.quantity)) + ")";
    });
    const total = formatPrice(getCartTotal(items));
    const orderMessage = "Hello Kidasichetu Africa, I would like to order the following bags:%0A" +
      messages.join("%0A") + "%0A%0ATotal: " + total + "%0APlease confirm availability and next steps.";

    cartCheckout.classList.remove("is-disabled");
    cartCheckout.setAttribute("aria-disabled", "false");
    cartCheckout.href = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(orderMessage);
  }

  function renderCart() {
    if (!cartItems || !cartEmpty || !cartSubtotal || !cartCount) {
      return;
    }

    const items = readCart();
    const total = getCartTotal(items);
    const quantity = items.reduce(function (sum, item) {
      return sum + Number(item.quantity);
    }, 0);

    cartCount.textContent = String(quantity);
    cartSubtotal.textContent = formatPrice(total);
    cartItems.replaceChildren();

    if (!items.length) {
      cartEmpty.hidden = false;
      updateCartCheckoutLink([]);
      return;
    }

    cartEmpty.hidden = true;

    items.forEach(function (item) {
      const row = document.createElement("div");
      row.className = "cart-item";

      const imageWrap = document.createElement("div");
      imageWrap.className = "cart-item-image";
      if (typeof item.image === "string" && item.image) {
        const image = document.createElement("img");
        image.src = item.image;
        image.alt = item.name;
        image.loading = "lazy";
        imageWrap.appendChild(image);
      }

      const details = document.createElement("div");
      details.className = "cart-item-details";
      const name = document.createElement("h4");
      name.textContent = item.name;
      const price = document.createElement("p");
      price.textContent = formatPrice(item.price);

      const controls = document.createElement("div");
      controls.className = "cart-item-controls";

      const minus = document.createElement("button");
      minus.type = "button";
      minus.className = "cart-quantity-button";
      minus.setAttribute("aria-label", "Decrease quantity for " + item.name);
      minus.textContent = "−";
      minus.addEventListener("click", function () {
        const updated = readCart().map(function (cartItem) {
          if (cartItem.id === item.id) {
            return Object.assign({}, cartItem, {
              quantity: Math.max(0, Number(cartItem.quantity) - 1)
            });
          }
          return cartItem;
        }).filter(function (cartItem) {
          return Number(cartItem.quantity) > 0;
        });
        writeCart(updated);
        renderCart();
      });

      const quantityValue = document.createElement("span");
      quantityValue.textContent = String(item.quantity);

      const plus = document.createElement("button");
      plus.type = "button";
      plus.className = "cart-quantity-button";
      plus.setAttribute("aria-label", "Increase quantity for " + item.name);
      plus.textContent = "+";
      plus.addEventListener("click", function () {
        const updated = readCart().map(function (cartItem) {
          if (cartItem.id === item.id) {
            return Object.assign({}, cartItem, {
              quantity: Number(cartItem.quantity) + 1
            });
          }
          return cartItem;
        });
        writeCart(updated);
        renderCart();
      });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "cart-remove";
      remove.textContent = "Remove";
      remove.addEventListener("click", function () {
        writeCart(readCart().filter(function (cartItem) {
          return cartItem.id !== item.id;
        }));
        renderCart();
      });

      controls.append(minus, quantityValue, plus);
      details.append(name, price, controls, remove);
      row.append(imageWrap, details);
      cartItems.appendChild(row);
    });

    updateCartCheckoutLink(items);
  }

  function addItemToCart(product) {
    if (!product || typeof product !== "object") {
      return;
    }
    const productId = String(product.id || product.name);
    const cart = readCart();
    const matchedIndex = cart.findIndex(function (item) {
      return item.id === productId;
    });

    if (matchedIndex >= 0) {
      cart[matchedIndex].quantity = Number(cart[matchedIndex].quantity) + 1;
    } else {
      cart.push({
        id: productId,
        name: product.name,
        price: Number(product.price),
        image: typeof product.image === "string" ? product.image : "",
        quantity: 1
      });
    }

    writeCart(cart);
    renderCart();
    setCartOpen(true);
  }

  function createHeroShowcaseSlide(product, index) {
    const slide = document.createElement("figure");
    slide.className = "hero-showcase-slide" + (index === 0 ? " is-active" : "");
    slide.dataset.productId = String(product.id);
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", (index + 1) + " of featured bags: " + product.name);
    slide.setAttribute("aria-hidden", index === 0 ? "false" : "true");

    const imageWrap = document.createElement("div");
    imageWrap.className = "hero-showcase-image";
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;
    image.loading = index === 0 ? "eager" : "lazy";
    image.addEventListener("error", function () {
      slide.remove();
      const slides = Array.from(heroShowcaseSlides.children);
      if (!slides.length) {
        showHeroShowcaseStatus("Featured bag photos are temporarily unavailable.");
        return;
      }
      slides.forEach(function (item, slideIndex) {
        const name = item.querySelector(".hero-showcase-title").textContent;
        item.setAttribute("aria-label", (slideIndex + 1) + " of featured bags: " + name);
      });
      heroShowcaseIndex = Math.min(heroShowcaseIndex, slides.length - 1);
      setHeroShowcaseSlide(heroShowcaseIndex);
      renderHeroShowcaseDots(slides.length);
      heroShowcaseControls.hidden = slides.length < 2;
      restartHeroShowcaseAutoplay();
    }, { once: true });
    imageWrap.appendChild(image);

    const details = document.createElement("div");
    details.className = "hero-showcase-details";
    const category = document.createElement("p");
    category.className = "hero-showcase-category";
    category.textContent = product.category;
    const name = document.createElement("h2");
    name.className = "hero-showcase-title";
    name.textContent = product.name;
    details.append(category, name);

    if (typeof product.description === "string" && product.description.trim()) {
      const description = document.createElement("p");
      description.className = "hero-showcase-description";
      description.textContent = product.description;
      details.appendChild(description);
    }

    if (Number.isFinite(Number(product.price))) {
      const price = document.createElement("p");
      price.className = "hero-showcase-price";
      price.textContent = formatPrice(product.price);
      details.appendChild(price);
    }

    const actions = document.createElement("div");
    actions.className = "hero-showcase-actions";
    const viewBag = document.createElement("a");
    viewBag.className = "btn btn-gold";
    viewBag.href = "#product-" + product.id;
    viewBag.textContent = "View bag";
    viewBag.setAttribute("aria-label", "View " + product.name + " in the collection");

    const addButton = document.createElement("button");
    addButton.className = "btn btn-outline-dark hero-add-cart";
    addButton.type = "button";
    addButton.textContent = "Add to cart";
    addButton.addEventListener("click", function () {
      addItemToCart(product);
    });
    actions.append(viewBag, addButton);
    details.appendChild(actions);
    slide.append(imageWrap, details);
    return slide;
  }

  function renderHeroShowcaseDots(count) {
    heroShowcaseDots.replaceChildren();
    for (let index = 0; index < count; index++) {
      const dot = document.createElement("button");
      dot.className = "hero-showcase-dot" + (index === heroShowcaseIndex ? " is-active" : "");
      dot.type = "button";
      dot.setAttribute("aria-label", "Show featured bag " + (index + 1));
      dot.setAttribute("aria-current", index === heroShowcaseIndex ? "true" : "false");
      dot.addEventListener("click", function () {
        setHeroShowcaseSlide(index);
        restartHeroShowcaseAutoplay();
      });
      heroShowcaseDots.appendChild(dot);
    }
  }

  function setHeroShowcaseSlide(index) {
    const slides = Array.from(heroShowcaseSlides.children);
    if (!slides.length) return;
    heroShowcaseIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      const active = slideIndex === heroShowcaseIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
      slide.querySelectorAll("a, button").forEach(function (control) {
        control.tabIndex = active ? 0 : -1;
      });
    });
    heroShowcaseDots.querySelectorAll(".hero-showcase-dot").forEach(function (dot, dotIndex) {
      const active = dotIndex === heroShowcaseIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  function showHeroShowcaseStatus(message) {
    window.clearInterval(heroShowcaseTimer);
    heroShowcaseSlides.replaceChildren();
    heroShowcaseControls.hidden = true;
    heroShowcaseStatus.textContent = message;
    heroShowcaseStatus.hidden = false;
  }

  function startHeroShowcaseAutoplay() {
    window.clearInterval(heroShowcaseTimer);
    if (!reducedMotion && heroShowcaseSlides.children.length > 1 &&
        !heroShowcase.matches(":hover") && !heroShowcase.contains(document.activeElement) &&
        !document.hidden) {
      heroShowcaseTimer = window.setInterval(function () {
        setHeroShowcaseSlide(heroShowcaseIndex + 1);
      }, 4800);
    }
  }

  function restartHeroShowcaseAutoplay() {
    window.clearInterval(heroShowcaseTimer);
    startHeroShowcaseAutoplay();
  }

  function renderHeroSlides(products) {
    const seenImages = new Set();
    const imageProducts = products.filter(function (product) {
      if (!product || !/^\d+$/.test(String(product.id)) ||
          typeof product.name !== "string" || !product.name.trim() ||
          typeof product.category !== "string" ||
          typeof product.image !== "string" ||
          !product.image.startsWith("uploads/products/") ||
          seenImages.has(product.image)) {
        return false;
      }
      seenImages.add(product.image);
      return true;
    }).slice(0, 4);

    if (!imageProducts.length) {
      showHeroShowcaseStatus("Our featured bags will appear here soon. Please check back shortly.");
      return;
    }

    heroShowcaseSlides.replaceChildren(...imageProducts.map(createHeroShowcaseSlide));
    heroShowcaseStatus.hidden = true;
    heroShowcaseIndex = 0;
    heroShowcaseControls.hidden = imageProducts.length < 2;
    renderHeroShowcaseDots(imageProducts.length);
    setHeroShowcaseSlide(0);
    startHeroShowcaseAutoplay();
  }

  async function loadHeroShowcase() {
    try {
      const responses = await Promise.all([
        fetch("api/products.php?featured=1", { headers: { Accept: "application/json" } }),
        fetch("api/products.php", { headers: { Accept: "application/json" } })
      ]);
      if (!responses[0].ok) {
        throw new Error("The featured product request failed with status " + responses[0].status + ".");
      }
      if (!responses[1].ok) {
        throw new Error("The product request failed with status " + responses[1].status + ".");
      }

      const featuredProducts = await responses[0].json();
      const products = await responses[1].json();
      if (!Array.isArray(featuredProducts) || !Array.isArray(products)) {
        throw new Error("The product API returned an invalid response.");
      }

      const prioritizedProducts = new Map();
      featuredProducts.concat(products).forEach(function (product) {
        if (product && /^\d+$/.test(String(product.id)) &&
            !prioritizedProducts.has(String(product.id))) {
          prioritizedProducts.set(String(product.id), product);
        }
      });
      renderHeroSlides(Array.from(prioritizedProducts.values()));
    } catch (error) {
      console.error("Unable to load featured bags from api/products.php.", error);
      showHeroShowcaseStatus("Featured bags couldn't load right now. Please try again shortly.");
    }
  }

  document.getElementById("heroShowcasePrevious").addEventListener("click", function () {
    setHeroShowcaseSlide(heroShowcaseIndex - 1);
    restartHeroShowcaseAutoplay();
  });
  document.getElementById("heroShowcaseNext").addEventListener("click", function () {
    setHeroShowcaseSlide(heroShowcaseIndex + 1);
    restartHeroShowcaseAutoplay();
  });
  heroShowcase.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setHeroShowcaseSlide(heroShowcaseIndex - 1);
      restartHeroShowcaseAutoplay();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setHeroShowcaseSlide(heroShowcaseIndex + 1);
      restartHeroShowcaseAutoplay();
    }
  });
  let heroTouchStartX = null;
  heroShowcase.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "touch") {
      heroTouchStartX = event.clientX;
    }
  });
  heroShowcase.addEventListener("pointerup", function (event) {
    if (heroTouchStartX === null) return;
    const swipeDistance = event.clientX - heroTouchStartX;
    heroTouchStartX = null;
    if (Math.abs(swipeDistance) < 45) return;
    setHeroShowcaseSlide(heroShowcaseIndex + (swipeDistance < 0 ? 1 : -1));
    restartHeroShowcaseAutoplay();
  });
  heroShowcase.addEventListener("pointercancel", function () {
    heroTouchStartX = null;
  });
  heroShowcase.addEventListener("mouseenter", function () {
    window.clearInterval(heroShowcaseTimer);
  });
  heroShowcase.addEventListener("mouseleave", startHeroShowcaseAutoplay);
  heroShowcase.addEventListener("focusin", function () {
    window.clearInterval(heroShowcaseTimer);
  });
  heroShowcase.addEventListener("focusout", function (event) {
    if (!heroShowcase.contains(event.relatedTarget)) startHeroShowcaseAutoplay();
  });
  document.addEventListener("visibilitychange", startHeroShowcaseAutoplay);

  function createStoryBagSlide(product, index) {
    const slide = document.createElement("figure");
    slide.className = "story-bags-slide" + (index === 0 ? " is-active" : "");
    slide.dataset.productId = String(product.id);
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", "Bag " + (index + 1) + ": " + product.name);
    slide.setAttribute("aria-hidden", index === 0 ? "false" : "true");

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = "Kidasichetu Africa bag: " + product.name;
    image.loading = index === 0 ? "eager" : "lazy";
    image.addEventListener("error", function () {
      slide.remove();
      const slides = Array.from(storyBagsSlides.children);
      if (!slides.length) {
        showStoryBagsStatus("Bag photos are temporarily unavailable.");
        return;
      }
      slides.forEach(function (item, slideIndex) {
        const imageName = item.querySelector("img").alt.replace("Kidasichetu Africa bag: ", "");
        item.setAttribute("aria-label", "Bag " + (slideIndex + 1) + ": " + imageName);
      });
      storyBagsIndex = Math.min(storyBagsIndex, slides.length - 1);
      setStoryBagsSlide(storyBagsIndex);
      restartStoryBagsAutoplay();
    }, { once: true });
    slide.appendChild(image);
    return slide;
  }

  function setStoryBagsSlide(index, announce) {
    const slides = Array.from(storyBagsSlides.children);
    if (!slides.length) return;
    storyBagsIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      const active = slideIndex === storyBagsIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });
    if (announce) {
      storyBagsAnnouncement.textContent = slides[storyBagsIndex].getAttribute("aria-label");
    }
  }

  function showStoryBagsStatus(message) {
    window.clearInterval(storyBagsTimer);
    storyBagsSlides.replaceChildren();
    storyBagsStatus.textContent = message;
    storyBagsStatus.hidden = false;
  }

  function startStoryBagsAutoplay() {
    window.clearInterval(storyBagsTimer);
    if (!storyMotionPreference.matches && storyBagsSlides.children.length > 1 &&
        !storyBagsCarousel.matches(":hover") && !document.hidden) {
      storyBagsTimer = window.setInterval(function () {
        setStoryBagsSlide(storyBagsIndex + 1);
      }, 4500);
    }
  }

  function restartStoryBagsAutoplay() {
    startStoryBagsAutoplay();
  }

  function renderStoryBags(products) {
    const seenImages = new Set();
    const bags = products.filter(function (product) {
      if (!product || !/^\d+$/.test(String(product.id)) ||
          typeof product.name !== "string" || !product.name.trim() ||
          typeof product.category !== "string" ||
          typeof product.image !== "string" ||
          !product.image.startsWith("uploads/products/") ||
          seenImages.has(product.image)) {
        return false;
      }
      seenImages.add(product.image);
      return true;
    }).slice(0, 4);

    if (!bags.length) {
      showStoryBagsStatus("Our bag collection will appear here when products are uploaded.");
      return;
    }

    const slides = bags.map(createStoryBagSlide);
    slides.forEach(function (slide, index) {
      const imageName = slide.querySelector("img").alt.replace("Kidasichetu Africa bag: ", "");
      slide.setAttribute("aria-label", "Bag " + (index + 1) + " of " + slides.length + ": " + imageName);
    });
    storyBagsSlides.replaceChildren(...slides);
    storyBagsStatus.hidden = true;
    storyBagsIndex = 0;
    setStoryBagsSlide(0);
    startStoryBagsAutoplay();
  }

  async function loadStoryBags() {
    try {
      const responses = await Promise.all([
        fetch("api/products.php?featured=1", { headers: { Accept: "application/json" } }),
        fetch("api/products.php", { headers: { Accept: "application/json" } })
      ]);
      if (!responses[0].ok || !responses[1].ok) {
        throw new Error("Product API request failed while loading the bag showcase.");
      }

      const featuredProducts = await responses[0].json();
      const products = await responses[1].json();
      if (!Array.isArray(featuredProducts) || !Array.isArray(products)) {
        throw new Error("The product API returned an invalid response.");
      }

      const uniqueProducts = new Map();
      featuredProducts.concat(products).forEach(function (product) {
        if (product && /^\d+$/.test(String(product.id)) &&
            !uniqueProducts.has(String(product.id))) {
          uniqueProducts.set(String(product.id), product);
        }
      });
      renderStoryBags(Array.from(uniqueProducts.values()));
    } catch (error) {
      console.error("Unable to load bags for the Our Story showcase.", error);
      showStoryBagsStatus("We couldn't load the bag collection right now. Please try again shortly.");
    }
  }

  storyBagsCarousel.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setStoryBagsSlide(storyBagsIndex - 1, true);
      window.clearInterval(storyBagsTimer);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setStoryBagsSlide(storyBagsIndex + 1, true);
      window.clearInterval(storyBagsTimer);
    }
  });
  let storyBagsTouchStartX = null;
  storyBagsCarousel.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "touch") storyBagsTouchStartX = event.clientX;
  });
  storyBagsCarousel.addEventListener("pointerup", function (event) {
    if (storyBagsTouchStartX === null) return;
    const swipeDistance = event.clientX - storyBagsTouchStartX;
    storyBagsTouchStartX = null;
    if (Math.abs(swipeDistance) < 45) return;
    setStoryBagsSlide(storyBagsIndex + (swipeDistance < 0 ? 1 : -1), true);
    restartStoryBagsAutoplay();
  });
  storyBagsCarousel.addEventListener("pointercancel", function () {
    storyBagsTouchStartX = null;
  });
  storyBagsCarousel.addEventListener("mouseenter", function () {
    window.clearInterval(storyBagsTimer);
  });
  storyBagsCarousel.addEventListener("mouseleave", function () {
    startStoryBagsAutoplay();
  });
  storyBagsCarousel.addEventListener("focusin", function () {
    window.clearInterval(storyBagsTimer);
  });
  storyBagsCarousel.addEventListener("focusout", function (event) {
    if (!storyBagsCarousel.contains(event.relatedTarget)) {
      startStoryBagsAutoplay();
    }
  });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) startStoryBagsAutoplay();
    else window.clearInterval(storyBagsTimer);
  });

  storyMotionPreference.addEventListener("change", function (event) {
    if (event.matches) {
      window.clearInterval(storyBagsTimer);
    } else {
      startStoryBagsAutoplay();
    }
  });

  function createProductCard(product) {
    if (!product || typeof product !== "object" ||
        !product.name || !product.category ||
        !Number.isFinite(Number(product.price))) {
      throw new Error("The product list contains incomplete product information.");
    }

    const column = document.createElement("div");
    column.className = "col-6 col-lg-3";
    const card = document.createElement("article");
    card.className = "product-card";
    card.id = "product-" + product.id;
    card.tabIndex = -1;
    const imageWrap = document.createElement("div");
    imageWrap.className = "product-image";

    if (typeof product.image === "string" && product.image.startsWith("uploads/products/")) {
      const image = document.createElement("img");
      image.src = product.image;
      image.alt = product.name;
      image.loading = "lazy";
      image.addEventListener("error", function () {
        image.remove();
        imageWrap.classList.add("product-image-missing");
      }, { once: true });
      imageWrap.appendChild(image);
    } else {
      imageWrap.classList.add("product-image-missing");
      imageWrap.setAttribute("aria-label", "No product photo available");
    }

    const details = document.createElement("div");
    details.className = "product-info";
    const category = document.createElement("p");
    category.className = "product-category";
    category.textContent = product.category.toUpperCase();
    const name = document.createElement("h3");
    name.textContent = product.name;
    details.append(category, name);

    if (typeof product.description === "string" && product.description.trim()) {
      const description = document.createElement("p");
      description.className = "product-description";
      description.textContent = product.description;
      details.appendChild(description);
    }

    const bottom = document.createElement("div");
    bottom.className = "product-bottom";
    const price = document.createElement("strong");
    price.textContent = formatPrice(product.price);

    const actions = document.createElement("div");
    actions.className = "product-actions";

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "product-add-cart";
    addButton.textContent = "Add to cart";
    addButton.addEventListener("click", function () {
      addItemToCart(product);
    });

    const inquiry = document.createElement("a");
    const message = "Hello Kidasichetu Africa, I am interested in the " + product.name +
      ". Please share more details and availability.";
    inquiry.className = "product-link";
    inquiry.href = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
    inquiry.target = "_blank";
    inquiry.rel = "noopener noreferrer";
    inquiry.setAttribute("aria-label", "Ask about " + product.name + " on WhatsApp");
    inquiry.textContent = "↗";

    actions.append(addButton, inquiry);
    bottom.append(price, actions);
    details.appendChild(bottom);

    card.append(imageWrap, details);
    column.appendChild(card);
    return column;
  }

  function createFeaturedSlide(product, index) {
    if (!product || typeof product !== "object" ||
        !product.name || !product.category ||
        !Number.isFinite(Number(product.price)) ||
        typeof product.image !== "string" ||
        !product.image.startsWith("uploads/products/")) {
      throw new Error("The featured product list contains incomplete product information.");
    }

    const slide = document.createElement("article");
    slide.className = "featured-slide" + (index === 0 ? " is-active" : "");
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", (index + 1) + " of featured bags");
    slide.setAttribute("aria-hidden", index === 0 ? "false" : "true");

    const imageWrap = document.createElement("div");
    imageWrap.className = "featured-slide-image";
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;
    image.loading = index === 0 ? "eager" : "lazy";
    image.addEventListener("error", function () {
      slide.remove();
      const activeSlides = Array.from(featuredSlides.children);
      if (activeSlides.length === 0) {
        showFeaturedEmpty();
      } else {
        activeSlides.forEach(function (item, slideIndex) {
          item.setAttribute("aria-label", (slideIndex + 1) + " of featured bags");
        });
        featuredIndex = Math.min(featuredIndex, activeSlides.length - 1);
        setFeaturedSlide(featuredIndex);
        featuredControls.hidden = activeSlides.length < 2;
        renderFeaturedDots(activeSlides.length);
      }
    }, { once: true });
    imageWrap.appendChild(image);

    const details = document.createElement("div");
    details.className = "featured-slide-details";
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = product.category;
    const name = document.createElement("h3");
    name.textContent = product.name;
    details.append(eyebrow, name);

    if (typeof product.description === "string" && product.description.trim()) {
      const description = document.createElement("p");
      description.className = "featured-slide-description";
      description.textContent = product.description;
      details.appendChild(description);
    }

    const price = document.createElement("p");
    price.className = "featured-slide-price";
    price.textContent = formatPrice(product.price);
    const inquiry = document.createElement("a");
    const message = "Hello Kidasichetu Africa, I am interested in the " + product.name +
      ". Please share more details and availability.";
    inquiry.className = "btn btn-gold featured-slide-inquiry";
    inquiry.href = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
    inquiry.target = "_blank";
    inquiry.rel = "noopener noreferrer";
    inquiry.textContent = "Inquire on WhatsApp ↗";
    details.append(price, inquiry);
    slide.append(imageWrap, details);
    return slide;
  }

  function renderFeaturedDots(count) {
    featuredDots.replaceChildren();
    for (let index = 0; index < count; index++) {
      const dot = document.createElement("button");
      dot.className = "featured-dot" + (index === featuredIndex ? " is-active" : "");
      dot.type = "button";
      dot.setAttribute("aria-label", "Show featured bag " + (index + 1));
      dot.setAttribute("aria-current", index === featuredIndex ? "true" : "false");
      dot.addEventListener("click", function () {
        setFeaturedSlide(index);
        restartFeaturedAutoplay();
      });
      featuredDots.appendChild(dot);
    }
  }

  function setFeaturedSlide(index) {
    const slides = Array.from(featuredSlides.children);
    if (!slides.length) return;
    featuredIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      const active = slideIndex === featuredIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
      slide.querySelectorAll("a").forEach(function (link) {
        link.tabIndex = active ? 0 : -1;
      });
    });
    featuredDots.querySelectorAll(".featured-dot").forEach(function (dot, dotIndex) {
      const active = dotIndex === featuredIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  function showFeaturedEmpty() {
    window.clearInterval(featuredTimer);
    featuredSlider.hidden = true;
    featuredEmpty.hidden = false;
    featuredEmpty.textContent = "Featured bags are coming soon. Check back shortly.";
  }

  function startFeaturedAutoplay() {
    window.clearInterval(featuredTimer);
    if (!reducedMotion && featuredSlides.children.length > 1 &&
        !featuredSlider.matches(":hover") && !featuredSlider.contains(document.activeElement) &&
        !document.hidden) {
      featuredTimer = window.setInterval(function () {
        setFeaturedSlide(featuredIndex + 1);
      }, 4500);
    }
  }

  function restartFeaturedAutoplay() {
    window.clearInterval(featuredTimer);
    startFeaturedAutoplay();
  }

  async function loadFeaturedProducts() {
    try {
      const response = await fetch("api/products.php?featured=1", {
        headers: { Accept: "application/json" }
      });
      if (!response.ok) {
        throw new Error("Featured product request failed with status " + response.status + ".");
      }
      const products = await response.json();
      if (!Array.isArray(products)) {
        throw new Error("The featured product API returned an invalid response.");
      }

      const slides = products.slice(0, 4).map(createFeaturedSlide);
      if (!slides.length) {
        showFeaturedEmpty();
        return;
      }

      featuredSlides.replaceChildren(...slides);
      featuredIndex = 0;
      featuredSlider.hidden = false;
      featuredEmpty.hidden = true;
      featuredControls.hidden = slides.length < 2;
      renderFeaturedDots(slides.length);
      setFeaturedSlide(0);
      startFeaturedAutoplay();
    } catch (error) {
      console.error("Unable to load featured products from api/products.php.", error);
      window.clearInterval(featuredTimer);
      featuredSlider.hidden = true;
      featuredEmpty.hidden = false;
      featuredEmpty.textContent = "We couldn't load featured bags right now. Please check back shortly.";
    }
  }

  document.getElementById("featuredPrevious").addEventListener("click", function () {
    setFeaturedSlide(featuredIndex - 1);
    restartFeaturedAutoplay();
  });
  document.getElementById("featuredNext").addEventListener("click", function () {
    setFeaturedSlide(featuredIndex + 1);
    restartFeaturedAutoplay();
  });
  featuredSlider.addEventListener("mouseenter", function () {
    window.clearInterval(featuredTimer);
  });
  featuredSlider.addEventListener("mouseleave", startFeaturedAutoplay);
  featuredSlider.addEventListener("focusin", function () {
    window.clearInterval(featuredTimer);
  });
  featuredSlider.addEventListener("focusout", function (event) {
    if (!featuredSlider.contains(event.relatedTarget)) startFeaturedAutoplay();
  });
  document.addEventListener("visibilitychange", startFeaturedAutoplay);

  async function loadProducts() {
    try {
      const response = await fetch("api/products.php", {
        headers: { Accept: "application/json" }
      });
      if (!response.ok) {
        throw new Error("The product API returned status " + response.status + ".");
      }

      const products = await response.json();
      if (!Array.isArray(products)) {
        throw new Error("The product API returned an invalid response.");
      }

      const cards = products.map(createProductCard);
      productGrid.replaceChildren(...cards);
      if (cards.length === 0) {
        showStatus("Our collection is coming soon. Check back shortly.", false);
      } else {
        productLoading.hidden = true;
      }
    } catch (error) {
      console.error("Unable to load products from api/products.php.", error);
      showStatus("We couldn't load the collection right now. Please check back shortly.", true);
    }
  }

  renderCart();
  loadHeroShowcase();
  loadStoryBags();
  loadProducts();
  loadFeaturedProducts();
});
