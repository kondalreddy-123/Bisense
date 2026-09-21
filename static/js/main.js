/**
 * BISENSE - Main Application Entrypoint
 * Coordinates UI components, 3D scenes, navigation, and product explorer.
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[BISENSE] Initializing 3D AI Indian Standards Discovery Platform...');

  // 0. Initialize Multilingual i18n Controller
  if (window.I18nManager) {
    window.I18nManager.init();
  }

  // 1. Initialize Navbar & Scroll Effects
  initNavbar();

  // 2. Initialize Three.js Scenes
  if (window.BISENSE_3D) {
    try {
      window.BISENSE_3D.initHeroScene();
      window.BISENSE_3D.initArchScene();
      window.BISENSE_3D.initCtaScene();
    } catch (err) {
      console.warn('[BISENSE] WebGL initialization notice:', err);
    }
  }

  // 3. Initialize Search Controller
  if (window.SearchController) {
    window.SearchController.init();
  }

  // 4. Load Products dynamically into Grid and Select Dropdown
  await loadProducts();

  // 5. Initialize Architecture Flow Click Listeners
  initArchInteractions();

  // 6. Initialize How It Works Interactive Flow Simulator
  initHowItWorksFlow();
});

/**
 * Navbar scroll and mobile toggle
 */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Scroll spy
    const fromTop = window.scrollY + 120;
    navLinks.forEach(link => {
      const section = document.querySelector(link.getAttribute('href'));
      if (section) {
        if (
          section.offsetTop <= fromTop &&
          section.offsetTop + section.offsetHeight > fromTop
        ) {
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  }, { passive: true });

  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }
}

/**
 * Product icon map
 */
const PRODUCT_ICONS = {
  electric_cooker: '🍲',
  electric_iron: '♨️',
  electric_fan: '💨',
  refrigerator: '❄️',
  washing_machine: '🧺',
  led_lamp: '💡',
  switches: '🎛️',
  plugs_sockets: '🔌',
  electrical_cables: '⚡',
  extension_boards: '🔋',
  water_heater: '🚿',
  microwave_oven: '⏲️'
};

/**
 * Fetch and render products in Electrical & Electronic Products domain
 */
async function loadProducts() {
  const products = await BISENSE_API.getProducts();
  const grid = document.getElementById('productsGrid');

  if (!products || products.length === 0) return;

  // Clear existing items
  if (grid) grid.innerHTML = '';

  products.forEach(p => {
    const icon = PRODUCT_ICONS[p.id] || '⚡';

    // Populate 3D Product Cards in Products Section
    if (grid) {
      const card = document.createElement('div');
      card.className = 'product-card glass-card';
      card.innerHTML = `
        <div class="product-badge-row">
          <div class="product-3d-icon">${icon}</div>
          <span class="badge badge-cyan">${p.category || 'Appliance'}</span>
        </div>
        <h3 class="product-card-title">${p.name}</h3>
        <p class="product-card-desc">${p.description}</p>
        <button type="button" class="btn btn-secondary btn-sm product-btn" data-product-id="${p.id}">
          <span data-i18n="prod_btn">${window.I18nManager ? window.I18nManager.t('prod_btn') : '🔍 Discover Standards'}</span>
        </button>
      `;

      // Click card button -> Populate query and scroll to demo
      const btn = card.querySelector('button');
      btn.addEventListener('click', () => {
        selectProductAndSearch(p);
      });

      grid.appendChild(card);
    }
  });
}

/**
 * Jump to demo with product requirement pre-populated
 */
function selectProductAndSearch(product) {
  // If product is bulb or has subtypes (Electric vs LED), open bulb type selection modal
  if (product.id === 'led_lamp' || product.id === 'bulb' || product.has_subtypes || (product.name && product.name.toLowerCase().includes('bulb'))) {
    openBulbTypeModal();
    return;
  }

  const input = document.getElementById('queryInput');

  if (input && product.sample_queries && product.sample_queries.length > 0) {
    input.value = product.sample_queries[0];
  } else if (input) {
    input.value = `I need standards and technical requirements for ${product.name} intended for domestic and general use.`;
  }

  const demoSection = document.getElementById('demo');
  if (demoSection) {
    demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (input) input.focus();
  }
}

/**
 * Bulb Type Modal (Electric vs LED) Controls
 */
function openBulbTypeModal() {
  const modal = document.getElementById('bulbTypeModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeBulbTypeModal() {
  const modal = document.getElementById('bulbTypeModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function selectBulbType(type) {
  closeBulbTypeModal();
  const input = document.getElementById('queryInput');
  const demoSection = document.getElementById('demo');

  if (type === 'electric_bulb' || type === 'electric') {
    if (input) {
      input.value = "Tungsten filament electric bulb 60W 230V AC for domestic lighting with B22 bayonet cap";
    }
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (window.SearchController) {
      window.SearchController.hideBulbDisambiguation();
      window.SearchController.executeSearch(true, 'electric_bulb');
    }
  } else {
    if (input) {
      input.value = "9W B22 self-ballasted LED bulb for indoor general domestic illumination";
    }
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (window.SearchController) {
      window.SearchController.hideBulbDisambiguation();
      window.SearchController.executeSearch(true, 'led_lamp');
    }
  }
}

// Global exposure for event listeners
window.openBulbTypeModal = openBulbTypeModal;
window.closeBulbTypeModal = closeBulbTypeModal;
window.selectBulbType = selectBulbType;

/**
 * Architecture interaction syncing
 */
function initArchInteractions() {
  const flowItems = document.querySelectorAll('.arch-flow-item');
  flowItems.forEach(item => {
    item.addEventListener('click', () => {
      flowItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

/**
 * Interactive How It Works Flow Simulator
 */
const HOW_FLOW_DATA = {
  cooker: {
    query: "I need a 2000W electric cooker for domestic kitchen use with automatic temperature shut-off",
    lang: "Language: English (or Hindi, Telugu, Tamil, etc.)",
    tags: [
      { label: "Product", val: "Electric Cooker" },
      { label: "Rating", val: "2000W" },
      { label: "Application", val: "Domestic Kitchen" },
      { label: "Safety", val: "Auto Cut-off" }
    ],
    clauses: [
      { icon: "🛡️", text: "Clause 19: Abnormal Operation & Thermal Cut-off" },
      { icon: "⚡", text: "Clause 10: Power Input & Current Limits" },
      { icon: "🔬", text: "Clause 13: High-Voltage Leakage Current" }
    ],
    standard: "IS 302-2-15",
    match: "96% High Match",
    title: "Safety of Household Electrical Appliances - Particular Requirements for Electric Cookers",
    searchQuery: "I need a 2000W electric cooker for domestic use with automatic temperature control",
    product: "electric_cooker"
  },
  geyser: {
    query: "25-litre storage electric water heater for bathroom with thermal cut-out and shock protection",
    lang: "Language: English / Hindi (गीज़र 25 लीटर...)",
    tags: [
      { label: "Product", val: "Storage Water Heater (Geyser)" },
      { label: "Capacity", val: "25 Litres" },
      { label: "Application", val: "Domestic Bathroom" },
      { label: "Safety", val: "Thermal Cut-out & Shock Protection" }
    ],
    clauses: [
      { icon: "🛡️", text: "Clause 19: Safety Cut-out & Overheat Protection" },
      { icon: "⚡", text: "Clause 22: Construction & Pressure Withstand (8 bar)" },
      { icon: "🔬", text: "Clause 13: Dielectric Withstand & Insulation Test" }
    ],
    standard: "IS 2082:2018",
    match: "95% High Match",
    title: "Stationary Storage Type Electric Water Heaters for Household Use - Specification",
    searchQuery: "25L electric storage water heater geyser for domestic bathroom with thermal cut out and high pressure tank",
    product: "water_heater"
  },
  fan: {
    query: "Energy efficient 28W BLDC ceiling fan with remote speed control for home with 5-star rating",
    lang: "Language: English / Tamil / Telugu",
    tags: [
      { label: "Product", val: "BLDC Ceiling Fan" },
      { label: "Power", val: "28W (Low Consumption)" },
      { label: "Control", val: "Electronic Remote Regulation" },
      { label: "Efficiency", val: "5-Star Service Value" }
    ],
    clauses: [
      { icon: "⚡", text: "Clause 14: Air Delivery & Energy Service Value" },
      { icon: "🛡️", text: "Clause 8: Suspension System & Safety Fall Protection" },
      { icon: "🔬", text: "Clause 19: Thermal Endurance & Bearing Temperature Rise" }
    ],
    standard: "IS 374:2019",
    match: "94% High Match",
    title: "Electric Ceiling Type Fans and Regulators - Specification (including BLDC Motors)",
    searchQuery: "BLDC ceiling fan 28W energy efficient with remote control and safety fall protection",
    product: "electric_fan"
  },
  fridge: {
    query: "Frost free double door domestic refrigerator 260 litre capacity with inverter compressor",
    lang: "Language: English / Marathi / Bengali",
    tags: [
      { label: "Product", val: "Frost-Free Refrigerator" },
      { label: "Capacity", val: "260 Litres" },
      { label: "Technology", val: "Inverter Compressor" },
      { label: "Safety", val: "Refrigerant Circuit Protection" }
    ],
    clauses: [
      { icon: "⚡", text: "Clause 15: Pull-Down & Freezing Performance Limits" },
      { icon: "🛡️", text: "Clause 22: Refrigerant Circuit Leakage & Electrical Safety" },
      { icon: "🔬", text: "Clause 16: Energy Consumption & Star Labelling Compliance" }
    ],
    standard: "IS 15750:2006",
    match: "93% High Match",
    title: "Household Frost-Free Refrigerating Appliances - Characteristics and Test Methods",
    searchQuery: "Frost free domestic refrigerator 260L with inverter compressor and energy efficiency",
    product: "refrigerator"
  }
};

function initHowItWorksFlow() {
  const tabs = document.querySelectorAll('#howFlowTabs .flow-tab-btn');
  const inputQuery = document.getElementById('flowInputQuery');
  const inputLang = document.getElementById('flowInputLang');
  const aiTags = document.getElementById('flowAiTags');
  const clausesList = document.getElementById('flowClausesList');
  const resultCard = document.getElementById('flowResultCard');
  const tryBtn = document.getElementById('flowTryBtn');

  if (!tabs.length || !inputQuery || !aiTags || !clausesList || !resultCard) return;

  let currentKey = 'cooker';

  function renderFlow(key) {
    const data = HOW_FLOW_DATA[key];
    if (!data) return;
    currentKey = key;

    // 1. Input query
    inputQuery.textContent = `"${data.query}"`;
    if (inputLang) inputLang.textContent = data.lang;

    // 2. AI Tags
    aiTags.innerHTML = data.tags.map(t =>
      `<span class="flow-spec-tag"><strong>${t.label}:</strong> ${t.val}</span>`
    ).join('');

    // 3. Clauses
    clausesList.innerHTML = data.clauses.map(c =>
      `<div class="flow-clause-item"><span class="cl-icon">${c.icon}</span> ${c.text}</div>`
    ).join('');

    // 4. Standard Result
    resultCard.innerHTML = `
      <div class="res-code-row">
        <span class="res-is-badge">${data.standard}</span>
        <span class="res-score-badge">${data.match}</span>
      </div>
      <div class="res-std-title">${data.title}</div>
      <button type="button" class="btn btn-primary btn-sm flow-try-btn" id="flowTryBtn">
        <span>🚀 Try This in Live Search</span>
      </button>
    `;

    // Re-bind Try button
    const newTryBtn = document.getElementById('flowTryBtn');
    if (newTryBtn) {
      newTryBtn.addEventListener('click', () => {
        executeFlowSearch(data);
      });
    }
  }

  function executeFlowSearch(data) {
    const demoSection = document.getElementById('demo');
    const queryInput = document.getElementById('queryInput');

    if (queryInput) {
      queryInput.value = data.searchQuery;
    }
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (window.SearchController) {
      window.SearchController.hideDidYouMean();
      window.SearchController.hideBulbDisambiguation();
      window.SearchController.executeSearch(false, data.product);
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const key = tab.dataset.flow;
      renderFlow(key);
    });
  });

  // Initial binding of Try button
  if (tryBtn) {
    tryBtn.addEventListener('click', () => {
      executeFlowSearch(HOW_FLOW_DATA[currentKey]);
    });
  }
}

