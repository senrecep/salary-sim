// ES6 Module Import
import { initializeReportContent, initializeAccordion } from './reportContent.js';

// GitHub yıldız sayısını backend'den çek (cache'li)
fetch('/api/github-stars')
  .then(response => response.json())
  .then(data => {
    const starCountElem = document.getElementById('github-stars-count');
    if (data.success && typeof data.stars === 'number') {
      if (starCountElem) starCountElem.textContent = data.stars;
    } else {
      if (starCountElem) starCountElem.textContent = '?';
    }
  })
  .catch(() => {
    const starCountElem = document.getElementById('github-stars-count');
    if (starCountElem) starCountElem.textContent = '?';
  });

class SalaryCalculator {
  // Event binding for syncing model option inputs in result cards with original inputs
  bindModelOptionSyncEvents() {
    // Use event delegation - only bind once, events will bubble up
    const resultsPanel = this.elements.resultsPanel;
    if (!resultsPanel || resultsPanel.dataset.modelOptionsBound) return;
    
    // Mark as bound to avoid duplicate listeners
    resultsPanel.dataset.modelOptionsBound = 'true';

    // Handle checkbox changes
    resultsPanel.addEventListener('change', (e) => {
      const checkbox = e.target;
      if (checkbox.classList.contains('model-option-checkbox')) {
        const syncId = checkbox.getAttribute('data-sync-id');
        if (syncId) {
          const originalInput = document.getElementById(syncId);
          if (originalInput) {
            originalInput.checked = checkbox.checked;
            // Trigger change event on original input to update calculations
            originalInput.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Special handling for zamEtkisiCheck to show/hide panel
            if (syncId === 'zamEtkisiCheck') {
              // Find the zam-detay-panel that's a sibling or child of the checkbox's parent container
              const parentDiv = checkbox.closest('div');
              if (parentDiv) {
                const detayPanel = parentDiv.querySelector('.zam-detay-panel');
                if (detayPanel) {
                  if (checkbox.checked) {
                    detayPanel.classList.remove('hidden');
                  } else {
                    detayPanel.classList.add('hidden');
                  }
                }
              }
            }
          }
        }
      }
    });

    // Handle input changes (number inputs)
    resultsPanel.addEventListener('input', (e) => {
      const input = e.target;
      if (input.classList.contains('model-option-input')) {
        const syncId = input.getAttribute('data-sync-id');
        if (syncId) {
          // Special handling for TCE percentage input - update state and trigger recalculation
          if (syncId === 'tcePercentageInput') {
            const val = parseFloat(input.value);
            if (!isNaN(val) && val >= 1 && val <= 200) {
              this.state.tcePercentage = val;
              // Debounce UI update to avoid excessive recalculations while user is typing
              this.debounce('tcePercentageInput', () => {
                this.updateUI();
              }, 500); // 500ms delay after user stops typing
            }
            return; // Don't continue with original input sync for TCE percentage
          }
          
          // For other inputs, try to sync with original input if it exists
          const originalInput = document.getElementById(syncId);
          if (originalInput) {
            originalInput.value = input.value;
            originalInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      }
    });
    
    // Handle blur events for TCE percentage input to ensure final value is applied immediately
    resultsPanel.addEventListener('blur', (e) => {
      const input = e.target;
      if (input.classList.contains('model-option-input') && 
          input.getAttribute('data-sync-id') === 'tcePercentageInput') {
        const val = parseFloat(input.value);
        if (!isNaN(val)) {
          // Clamp value to valid range
          const clampedVal = Math.max(1, Math.min(200, val));
          if (clampedVal !== val) {
            input.value = clampedVal;
          }
          this.state.tcePercentage = clampedVal;
          // Execute immediately and cancel pending debounce
          this.flushDebounce('tcePercentageInput', () => {
            this.updateUI();
          });
        }
      }
    }, true); // Use capture phase to catch blur before it bubbles

    // Handle select changes
    resultsPanel.addEventListener('change', (e) => {
      const select = e.target;
      if (select.classList.contains('model-option-select')) {
        const syncId = select.getAttribute('data-sync-id');
        if (syncId) {
          const originalSelect = document.getElementById(syncId);
          if (originalSelect) {
            originalSelect.value = select.value;
            originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }
    });

    // Handle Bağ-Kur slider changes in Model B card
    // Use separate handlers for input (visual update only) and change (full recalculation)
    resultsPanel.addEventListener('input', (e) => {
      const slider = e.target;
      if (slider.classList.contains('model-bagkur-slider') || slider.id === 'bagkurPrimiInput') {
        const originalSlider = document.getElementById('bagkurPrimiInput');
        if (originalSlider && originalSlider !== slider) {
          // Update original slider value immediately
          originalSlider.value = slider.value;
          
          // Update label in Model B card visually without full recalculation
          const modelBBagkurLabel = resultsPanel.querySelector('#bagkurPrimLabel');
          if (modelBBagkurLabel) {
            const timeMultiplier = this.state.currentMode === "yearly" ? 12 : 1;
            const displayValue = parseFloat(slider.value) * timeMultiplier;
            modelBBagkurLabel.textContent = this.formatCurrency(displayValue, "TRY");
          }
          
          // Update original label too
          if (this.elements.bagkurPrimLabel) {
            const timeMultiplier = this.state.currentMode === "yearly" ? 12 : 1;
            const displayValue = parseFloat(slider.value) * timeMultiplier;
            this.elements.bagkurPrimLabel.textContent = this.formatCurrency(displayValue, "TRY");
          }
          
          // Debounce full recalculation - only trigger after user stops dragging
          this.debounce('bagkurSlider', () => {
            originalSlider.dispatchEvent(new Event('change', { bubbles: true }));
          }, 300); // 300ms delay after user stops dragging
        }
      }
    });
    
    // Also handle change event for immediate update when slider is released
    resultsPanel.addEventListener('change', (e) => {
      const slider = e.target;
      if (slider.classList.contains('model-bagkur-slider') || slider.id === 'bagkurPrimiInput') {
        const originalSlider = document.getElementById('bagkurPrimiInput');
        if (originalSlider && originalSlider !== slider) {
          originalSlider.value = slider.value;
          originalSlider.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });

    // Handle comparison basis button clicks in Model B card
    resultsPanel.addEventListener('click', (e) => {
      const button = e.target;
      if (button.classList.contains('comparison-basis-btn')) {
        e.preventDefault();
        const newBasis = button.getAttribute('data-comparison-basis');
        if (newBasis) {
          this.setComparisonBasis(newBasis);
        }
      }
    });
  }

  // Event binding for Model B expense details table
  bindGiderDetaylariEvents() {
    // Bind checkbox and input events for each expense item
    const giderKalemleri = [
      {
        enabledKey: "isDegiskenGiderEnabled",
        valueKey: "baseAylikDegiskenGiderTRY",
        checkboxId: "degiskenGiderCheck",
        inputId: "degiskenGiderInput",
      },
      {
        enabledKey: "isMuhasebeciGiderEnabled",
        valueKey: "baseAylikMuhasebeciUcretiTRY",
        checkboxId: "muhasebeciGiderCheck",
        inputId: "muhasebeciGiderInput",
      },
      {
        enabledKey: "isDamgaVergisiEnabled",
        valueKey: "baseAylikDamgaVergileriTRY",
        checkboxId: "damgaVergisiCheck",
        inputId: "damgaVergisiInput",
      },
      {
        enabledKey: "isDigerGiderlerEnabled",
        valueKey: "baseAylikDigerSabitGiderlerTRY",
        checkboxId: "digerGiderlerCheck",
        inputId: "digerGiderlerInput",
      },
    ];

    giderKalemleri.forEach((kalem) => {
      const check = document.getElementById(kalem.checkboxId);
      const input = document.getElementById(kalem.inputId);
      if (check) {
        check.onchange = (e) => {
          this.state[kalem.enabledKey] = check.checked;
          this.updateUI();
        };
      }
      if (input) {
        // Only update state on blur (when editing is finished)
        input.onblur = (e) => {
          let val = parseFloat(
            input.value.replace(/[^\d.,-]/g, "").replace(",", ".")
          );
          if (isNaN(val) || val < 0) val = 0;
          this.state[kalem.valueKey] = val;
          this.updateUI();
        };
        // Also trigger blur on Enter key
        input.onkeydown = (e) => {
          if (e.key === "Enter") {
            input.blur();
          }
        };
      }
    });
  }
  constructor() {
    this.state = {
      currentMode: "monthly",
      currentCurrency: "TRY",
      usdRate: 42,
      baseAylikNetMaasTRY: 0,
      baseAylikBagkurPekTRY: 0,
      comparisonBasis: "grossEquivalence", // Default comparison mode
      tcePercentage: 100, // Default 100% of employer cost
      // Default values for expense items
      isDegiskenGiderEnabled: true,
      baseAylikDegiskenGiderTRY: 5000,
      isMuhasebeciGiderEnabled: true,
      baseAylikMuhasebeciUcretiTRY: 2000,
      isDamgaVergisiEnabled: true,
      baseAylikDamgaVergileriTRY: 500,
      isDigerGiderlerEnabled: false,
      baseAylikDigerSabitGiderlerTRY: 0,
    };

    this.constants = {
      AYLIK_BRUT_ASGARI_UCRET: 26005.5,
      YILLIK_MIN_BAGKUR_KAZANCI: null, // asgari ücret x 12
      YILLIK_MAX_BAGKUR_KAZANCI: null, // asgari ücret x 7.5 x 12
      AYLIK_PEK_TAVAN: null, // asgari ücret x 7.5
      DAMGA_VERGISI_ORANI: 0.00759,
      SGK_ISCI_PAYI_ORANI: 0.15,
      SGK_ISVEREN_IMALAT_ORANI: 0.155,
      SGK_ISVEREN_DIGER_ORANI: 0.165,
      SGK_ISVEREN_STANDART_ORANI: 0.2075,
      SGK_ISVEREN_TESVIKLI_ORANI: 0.1575,
      ISSIZLIK_ISVEREN_PAYI_ORANI: 0.02,
      TOPLAM_ISVEREN_PRIM_ORANI: 0.1775,
      BAGKUR_INDIRIMLI_ORAN: 0.295,
      GENC_GIRISIMCI_ISTISNA_TUTARI: 330000,
      HIZMET_IHRACATI_INDIRIM_ORANI: 0.8,
    };
    // Asgari ücrete bağlı alanlar dinamik olarak hesaplanır
    this.constants.YILLIK_MIN_BAGKUR_KAZANCI = this.constants.AYLIK_BRUT_ASGARI_UCRET * 12;
    this.constants.AYLIK_PEK_TAVAN = this.constants.AYLIK_BRUT_ASGARI_UCRET * 7.5;
    this.constants.YILLIK_MAX_BAGKUR_KAZANCI = this.constants.AYLIK_PEK_TAVAN * 12;

    this.elements = this.initializeElements();
    // reportContent will be initialized via initializeReportContent()
    this.reportContent = null;

    // Debounce manager - centralized timeout handling
    this._debounceTimers = {};

    // Calculation cache - memoization for expensive operations
    this._calculationCache = {};

    // Format currency cache - memoization for formatCurrency
    this._formatCache = {};
    this._formatters = {}; // Cache formatter objects to avoid recreation

    // HTML template cache - cache static HTML structures
    this._htmlTemplateCache = {};

    this.bindEvents();
    this.initialize();
  }

  // Debounce Manager Methods
  /**
   * Debounce a function call with a unique key
   * @param {string} key - Unique identifier for this debounce operation
   * @param {Function} fn - Function to execute after delay
   * @param {number} delay - Delay in milliseconds (default: 300)
   */
  debounce(key, fn, delay = 300) {
    // Clear existing timer for this key
    if (this._debounceTimers[key]) {
      clearTimeout(this._debounceTimers[key]);
      delete this._debounceTimers[key];
    }
    
    // Set new timer
    this._debounceTimers[key] = setTimeout(() => {
      fn();
      delete this._debounceTimers[key];
    }, delay);
  }

  /**
   * Cancel a pending debounced operation
   * @param {string} key - Unique identifier for the debounce operation to cancel
   */
  cancelDebounce(key) {
    if (this._debounceTimers[key]) {
      clearTimeout(this._debounceTimers[key]);
      delete this._debounceTimers[key];
    }
  }

  /**
   * Execute a debounced function immediately and cancel pending debounce
   * @param {string} key - Unique identifier for the debounce operation
   * @param {Function} fn - Function to execute immediately
   */
  flushDebounce(key, fn) {
    this.cancelDebounce(key);
    fn();
  }

  /**
   * Clear all pending debounce timers
   */
  clearAllDebounces() {
    Object.keys(this._debounceTimers).forEach(key => {
      clearTimeout(this._debounceTimers[key]);
      delete this._debounceTimers[key];
    });
  }

  // Calculation Cache Methods
  /**
   * Generate a cache key from input parameters
   * @param {string} functionName - Name of the function being cached
   * @param {...any} args - Arguments to the function
   * @returns {string} Cache key
   */
  _generateCacheKey(functionName, ...args) {
    // Create a stable string representation of the arguments
    const argsKey = args.map(arg => {
      if (arg === null || arg === undefined) return String(arg);
      if (typeof arg === 'object') {
        // For objects, create a sorted key-value string
        return JSON.stringify(arg, Object.keys(arg).sort());
      }
      return String(arg);
    }).join('|');
    return `${functionName}:${argsKey}`;
  }

  /**
   * Get a cached calculation result
   * @param {string} functionName - Name of the function
   * @param {...any} args - Arguments used for cache key
   * @returns {any|null} Cached result or null if not found
   */
  getCached(functionName, ...args) {
    const key = this._generateCacheKey(functionName, ...args);
    const cached = this._calculationCache[key];
    if (cached) {
      return cached.value;
    }
    return null;
  }

  /**
   * Store a calculation result in cache
   * @param {string} functionName - Name of the function
   * @param {any} value - Result to cache
   * @param {...any} args - Arguments used for cache key
   */
  setCached(functionName, value, ...args) {
    const key = this._generateCacheKey(functionName, ...args);
    this._calculationCache[key] = {
      value,
      timestamp: Date.now()
    };
  }

  /**
   * Clear calculation cache
   * @param {string|null} functionName - If provided, clear only this function's cache. Otherwise clear all.
   */
  clearCache(functionName = null) {
    if (functionName) {
      // Clear only entries for this function
      Object.keys(this._calculationCache).forEach(key => {
        if (key.startsWith(`${functionName}:`)) {
          delete this._calculationCache[key];
        }
      });
    } else {
      // Clear all cache
      this._calculationCache = {};
    }
  }

  /**
   * Clear format currency cache
   */
  clearFormatCache() {
    this._formatCache = {};
    // Note: We keep formatters as they are lightweight and reusable
  }

  initializeElements() {
    return {
      netMaasInput: document.getElementById("netMaasInput"),
      // hesaplananBrutInput removed - no longer displayed in UI
      bagkurPrimiInput: document.getElementById("bagkurPrimiInput"),
      matchSgkPrimCheck: document.getElementById("matchSgkPrim"),
      sgkMuafiyetiCheck: document.getElementById("sgkMuafiyeti"),
      gencGirisimciVergiCheck: document.getElementById("gencGirisimciVergi"),
      gencGirisimciPrimCheck: document.getElementById("gencGirisimciPrim"),
      hizmetIhracatiCheck: document.getElementById("hizmetIhracati"),
      bagkurPrimLabel: document.getElementById("bagkurPrimLabel"),
      resultsPanel: document.getElementById("results-panel"),
      accordionContainer: document.getElementById("accordion-container"),
      aylikBtn: document.getElementById("aylikBtn"),
      yillikBtn: document.getElementById("yillikBtn"),
      tryBtn: document.getElementById("tryBtn"),
      usdBtn: document.getElementById("usdBtn"),
      brutBasisBtn: document.getElementById("brutBasisBtn"),
      tceBasisBtn: document.getElementById("tceBasisBtn"),
      tcePercentageInput: document.getElementById("tcePercentageInput"),
      tcePercentagePanel: document.getElementById("tcePercentagePanel"),
      modeLabels: document.querySelectorAll(".mode-label"),
      currencyLabels: document.querySelectorAll(".currency-label"),
      kurStatus: document.getElementById("kur-status"),
      zamEtkisiCheck: document.getElementById("zamEtkisiCheck"),
      zamDetayPanel: document.getElementById("zamDetayPanel"),
      zamOrani: document.getElementById("zamOrani"),
      zamAyi: document.getElementById("zamAyi"),
      tesReformuUygulaCheck: document.getElementById("tesReformuUygula"),
    };
  }

  async fetchExchangeRates() {
    // Show loading state
    this.showExchangeRateLoading();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      // Try proxy first
      let response = await fetch("/api/exchange-rate", {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      // If proxy fails, skip direct API (CORS issues)
      if (!response.ok) {
        throw new Error(`Proxy failed with status: ${response.status}`);
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // Handle our backend API response format
      const tryRate = data.usd_try;

      if (!tryRate || isNaN(tryRate) || tryRate <= 0) {
        throw new Error(`Invalid TRY rate received: ${tryRate}`);
      }

      // Makul aralık kontrolü (1-100 TL arasında)
      if (tryRate < 1 || tryRate > 100) {
        console.warn(`Unusual TRY rate: ${tryRate}, using fallback`);
        throw new Error(`TRY rate out of expected range: ${tryRate}`);
      }

      this.state.usdRate = Math.round(tryRate * 10000) / 10000; // 4 decimal precision
      this.updateExchangeRateDisplay(false);

      // Recalculate if currency is USD and inputs have values
      if (
        this.state.currentCurrency === "USD" &&
        this.elements.netMaasInput.value
      ) {
        this.performCalculations();
      }

      return true;
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("Döviz kuru API timeout:", error);
      } else {
        console.warn("Döviz kuru API hatası:", error);
      }
      this.updateExchangeRateDisplay(true);
      return false;
    }
  }

  updateExchangeRateDisplay(isDefault) {
    const statusText = isDefault
      ? `1 USD = ${this.state.usdRate.toFixed(4)} TRY (Varsayılan)`
      : `1 USD = ${this.state.usdRate.toFixed(4)} TRY (Güncel)`;

    this.elements.kurStatus.textContent = statusText;
  }

  showExchangeRateLoading() {
    this.elements.kurStatus.textContent = `1 USD = ${this.state.usdRate.toFixed(
      4
    )} TRY (Güncelleniyor...)`;
  }

  // Utility Functions
  formatCurrency(amount, currency = "TRY") {
    // Round amount to avoid floating point precision issues in cache key
    const roundedAmount = Math.round(amount * 100) / 100;
    
    // Check format cache first
    const cacheKey = `${currency}:${roundedAmount}`;
    if (this._formatCache[cacheKey]) {
      return this._formatCache[cacheKey];
    }

    // Get or create formatter (cache formatter objects to avoid recreation)
    if (!this._formatters[currency]) {
      this._formatters[currency] =
        currency === "USD"
          ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          : new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: "TRY",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            });
    }

    const formatted = this._formatters[currency].format(roundedAmount);
    
    // Cache the formatted result
    this._formatCache[cacheKey] = formatted;
    
    // Limit cache size to prevent memory issues (keep last 100 entries)
    const cacheKeys = Object.keys(this._formatCache);
    if (cacheKeys.length > 100) {
      // Remove oldest entries (simple FIFO)
      const toRemove = cacheKeys.slice(0, cacheKeys.length - 100);
      toRemove.forEach(key => delete this._formatCache[key]);
    }
    
    return formatted;
  }

  // Tax bracket utility functions
  getTaxBracket(matrah, isUcretDisi = false) {
    const ucretliBrackets = [
      { min: 0, max: 158000, rate: 0.15, label: "%15" },
      { min: 158001, max: 330000, rate: 0.2, label: "%20" },
      { min: 330001, max: 1200000, rate: 0.27, label: "%27" },
      { min: 1200001, max: 4300000, rate: 0.35, label: "%35" },
      { min: 4300001, max: Infinity, rate: 0.4, label: "%40" },
    ];

    const ucretDisiBrackets = [
      { min: 0, max: 158000, rate: 0.15, label: "%15" },
      { min: 158001, max: 330000, rate: 0.2, label: "%20" },
      { min: 330001, max: 800000, rate: 0.27, label: "%27" },
      { min: 800001, max: 4300000, rate: 0.35, label: "%35" },
      { min: 4300001, max: Infinity, rate: 0.4, label: "%40" },
    ];

    const brackets = isUcretDisi ? ucretDisiBrackets : ucretliBrackets;

    for (const bracket of brackets) {
      if (matrah >= bracket.min && matrah <= bracket.max) {
        return bracket;
      }
    }

    // Fallback to highest bracket
    return brackets[brackets.length - 1];
  }

  calculateProgressiveTax(matrah, isUcretDisi = false) {
    if (isNaN(matrah) || matrah <= 0) return 0;

    const brackets = isUcretDisi
      ? [
          { limit: 158000, rate: 0.15 },
          { limit: 330000, rate: 0.2 },
          { limit: 800000, rate: 0.27 },
          { limit: 4300000, rate: 0.35 },
          { limit: Infinity, rate: 0.4 },
        ]
      : [
          { limit: 158000, rate: 0.15 },
          { limit: 330000, rate: 0.2 },
          { limit: 1200000, rate: 0.27 },
          { limit: 4300000, rate: 0.35 },
          { limit: Infinity, rate: 0.4 },
        ];

    let vergi = 0;
    let oncekiLimit = 0;

    for (const bracket of brackets) {
      if (matrah > oncekiLimit) {
        const vergilendirilecekTutar =
          Math.min(matrah, bracket.limit) - oncekiLimit;
        vergi += vergilendirilecekTutar * bracket.rate;
      }
      oncekiLimit = bracket.limit;
    }

    return vergi;
  }

  // Tax calculation functions
  calculateGelirVergisi(matrah) {
    if (isNaN(matrah) || matrah <= 0) return 0;

    const vergi = this.calculateProgressiveTax(matrah, false);

    // Minimum wage income tax exemption (salary income only)
    const yillikAsgariUcretMatrahi =
      (this.constants.AYLIK_BRUT_ASGARI_UCRET -
        this.constants.AYLIK_BRUT_ASGARI_UCRET *
          this.constants.SGK_ISCI_PAYI_ORANI) *
      12;
    const asgariUcretVergisi = Math.min(vergi, yillikAsgariUcretMatrahi * 0.15);

    return Math.max(0, vergi - asgariUcretVergisi);
  }

  calculateGelirVergisiUcretDisi(matrah) {
    if (isNaN(matrah) || matrah <= 0) return 0;
    return this.calculateProgressiveTax(matrah, true);
  }

  initializeReportContent() {
    // Use the imported reportContent module
    return initializeReportContent();
  }

  initializeAccordion() {
    // Initialize report content if not already initialized
    if (!this.reportContent) {
      this.reportContent = this.initializeReportContent();
    }

    // Use the imported reportContent module
    initializeAccordion(this.reportContent, this.elements.accordionContainer);
  }
  
  // SGK calculation methods
  calculateSGKSabitNetMaas(hedefAylikNetMaas, zamParametreleri = null, tesOranlari = { calisan: 0 }) {
    // Check cache first
    const cached = this.getCached('calculateSGKSabitNetMaas', hedefAylikNetMaas, zamParametreleri, tesOranlari);
    if (cached !== null) {
      return cached;
    }

    if (isNaN(hedefAylikNetMaas) || hedefAylikNetMaas <= 0) {
      const result = { toplamVergi: 0, aylikDetay: [] };
      this.setCached('calculateSGKSabitNetMaas', result, hedefAylikNetMaas, zamParametreleri, tesOranlari);
      return result;
    }

    let toplamYillikVergi = 0;
    let toplamYillikBrut = 0;
    let kumulatifGelirVergisiMatrahi = 0;
    let aylikDetay = [];

    for (let ay = 1; ay <= 12; ay++) {
      let hedefNetMaas = hedefAylikNetMaas;

      if (
        zamParametreleri &&
        zamParametreleri.aktif &&
        ay >= zamParametreleri.baslangicAy
      ) {
        hedefNetMaas = hedefAylikNetMaas * (1 + zamParametreleri.oran / 100);
      }

      let ayinBrutu = this.calculateBrutFromNetAylikKumulatif(
        hedefNetMaas,
        kumulatifGelirVergisiMatrahi,
        ay,
        tesOranlari.calisan
      );

      const aylikPekTavan = this.constants.AYLIK_PEK_TAVAN;
      const sgkMatrahi = Math.min(ayinBrutu, aylikPekTavan);
      const sgkIsciPayi = sgkMatrahi * this.constants.SGK_ISCI_PAYI_ORANI;
      
      // TES Kesintisi (SGK Matrahı üzerinden hesaplanır)
      const tesCalisanPayi = sgkMatrahi * tesOranlari.calisan;
      
      // Gelir Vergisi Matrahı (TES payı da matrahtan düşülür)
      const aylikGelirVergisiMatrahi = sgkMatrahi - sgkIsciPayi - tesCalisanPayi;

      kumulatifGelirVergisiMatrahi += aylikGelirVergisiMatrahi;

      // Calculate cumulative tax (for employees)
      let kumulatifVergi = this.calculateProgressiveTax(
        kumulatifGelirVergisiMatrahi,
        false
      );

      // Minimum wage exemption (cumulative)
      const kumulatifAsgariUcretMatrahi =
        (this.constants.AYLIK_BRUT_ASGARI_UCRET -
          this.constants.AYLIK_BRUT_ASGARI_UCRET *
            this.constants.SGK_ISCI_PAYI_ORANI) *
        ay;
      const asgariUcretVergisi = Math.min(
        kumulatifVergi,
        kumulatifAsgariUcretMatrahi * 0.15
      );
      kumulatifVergi = Math.max(0, kumulatifVergi - asgariUcretVergisi);

      const buAyinVergisi = kumulatifVergi - toplamYillikVergi;
      toplamYillikVergi = kumulatifVergi;

      const damgaVergisi =
        Math.max(0, ayinBrutu - this.constants.AYLIK_BRUT_ASGARI_UCRET) *
        this.constants.DAMGA_VERGISI_ORANI;
      const gerceklesenNet = hedefNetMaas;

      toplamYillikBrut += ayinBrutu;

      aylikDetay.push({
        ay: ay,
        brutMaas: ayinBrutu,
        sgkMatrahi: sgkMatrahi,
        sgkIsciPayi: sgkIsciPayi,
        tesCalisanPayi: tesCalisanPayi,
        gelirVergisiMatrahi: aylikGelirVergisiMatrahi,
        kumulatifMatrah: kumulatifGelirVergisiMatrahi,
        buAyinVergisi: buAyinVergisi,
        damgaVergisi: damgaVergisi,
        netMaas: gerceklesenNet,
        hedefNetMaas: hedefNetMaas,
        vergiDilimi: this.getTaxBracket(kumulatifGelirVergisiMatrahi, false)
          .label,
        zamliAy:
          zamParametreleri &&
          zamParametreleri.aktif &&
          ay >= zamParametreleri.baslangicAy,
      });
    }

    const result = {
      toplamVergi: toplamYillikVergi,
      aylikDetay: aylikDetay,
      ortalamaNeto:
        aylikDetay.reduce((sum, item) => sum + item.netMaas, 0) / 12,
      yilSonuDilimi: aylikDetay[11].vergiDilimi,
      toplamYillikBrut: toplamYillikBrut,
      zamParametreleri: zamParametreleri,
    };
    
    // Cache the result
    this.setCached('calculateSGKSabitNetMaas', result, hedefAylikNetMaas, zamParametreleri, tesOranlari);
    
    return result;
  }

  calculateBrutFromNetAylikKumulatif(
    aylikNet,
    oncekiKumulatifMatrah = 0,
    mevcutAy = 1,
    tesCalisanOrani = 0
  ) {
    if (aylikNet <= 0) return 0;
    let low = aylikNet;
    let high = aylikNet * 3;
    let brutGuess = 0;

    for (let i = 0; i < 100; i++) {
      brutGuess = (low + high) / 2;

      const sgkMatrahi = Math.min(brutGuess, this.constants.AYLIK_PEK_TAVAN);
      const sgkIsciPayi = sgkMatrahi * this.constants.SGK_ISCI_PAYI_ORANI;
      
      // TES Kesintisi (SGK Matrahı üzerinden hesaplanır)
      const tesCalisanPayi = sgkMatrahi * tesCalisanOrani;
      
      // Gelir Vergisi Matrahı (TES payı da matrahtan düşülür)
      const aylikGelirVergisiMatrahi = sgkMatrahi - sgkIsciPayi - tesCalisanPayi;

      const toplamKumulatifMatrah =
        oncekiKumulatifMatrah + aylikGelirVergisiMatrahi;

      // Calculate cumulative tax (for employees)
      let kumulatifVergi = this.calculateProgressiveTax(
        toplamKumulatifMatrah,
        false
      );

      // Minimum wage exemption - using correct month
      const aylikAsgariUcretMatrahi =
        this.constants.AYLIK_BRUT_ASGARI_UCRET -
        this.constants.AYLIK_BRUT_ASGARI_UCRET *
          this.constants.SGK_ISCI_PAYI_ORANI;
      const kumulatifAsgariUcretMatrahi = aylikAsgariUcretMatrahi * mevcutAy;
      const asgariUcretVergisi = Math.min(
        kumulatifVergi,
        kumulatifAsgariUcretMatrahi * 0.15
      );
      kumulatifVergi = Math.max(0, kumulatifVergi - asgariUcretVergisi);

      // Calculate total tax for previous months
      let oncekiKumulatifVergi = 0;
      if (oncekiKumulatifMatrah > 0) {
        let oncekiVergi = this.calculateProgressiveTax(
          oncekiKumulatifMatrah,
          false
        );
        const oncekiAy = mevcutAy - 1;
        const oncekiAsgariUcretMatrahi =
          aylikAsgariUcretMatrahi * Math.max(1, oncekiAy);
        const oncekiAsgariUcretVergisi = Math.min(
          oncekiVergi,
          oncekiAsgariUcretMatrahi * 0.15
        );
        oncekiKumulatifVergi = Math.max(
          0,
          oncekiVergi - oncekiAsgariUcretVergisi
        );
      }

      const buAyinVergisi = Math.max(0, kumulatifVergi - oncekiKumulatifVergi);
      const damgaVergisi =
        Math.max(0, brutGuess - this.constants.AYLIK_BRUT_ASGARI_UCRET) *
        this.constants.DAMGA_VERGISI_ORANI;
      const hesaplananNet =
        brutGuess - (sgkIsciPayi + buAyinVergisi + damgaVergisi + tesCalisanPayi);

      if (Math.abs(hesaplananNet - aylikNet) < 10) {
        return brutGuess;
      }
      if (hesaplananNet < aylikNet) {
        low = brutGuess;
      } else {
        high = brutGuess;
      }
    }
    return brutGuess;
  }
  // Additional calculation methods
  calculateNetFromBrut(yillikBrut) {
    if (isNaN(yillikBrut) || yillikBrut <= 0) return 0;

    const yillikPekTavan = this.constants.AYLIK_PEK_TAVAN * 12;
    const sgkMatrahi = Math.min(yillikBrut, yillikPekTavan);

    const sgkIsciPayi = sgkMatrahi * this.constants.SGK_ISCI_PAYI_ORANI;
    const yillikGelirVergisi = this.calculateGelirVergisi(
      sgkMatrahi - sgkIsciPayi
    );
    const yillikAsgariUcret = this.constants.AYLIK_BRUT_ASGARI_UCRET * 12;
    const damgaVergisi =
      Math.max(0, yillikBrut - yillikAsgariUcret) *
      this.constants.DAMGA_VERGISI_ORANI;

    return yillikBrut - (sgkIsciPayi + yillikGelirVergisi + damgaVergisi);
  }

  calculateTotalCostToEmployer(yillikBrutMaas, tesOranlari = { isveren: 0, kidemFonu: 0 }) {
    // Check cache first
    const cached = this.getCached('calculateTotalCostToEmployer', yillikBrutMaas, tesOranlari);
    if (cached !== null) {
      return cached;
    }

    if (isNaN(yillikBrutMaas) || yillikBrutMaas <= 0) {
      const result = { totalCost: 0, employerPremiums: 0, brutMaas: 0 };
      this.setCached('calculateTotalCostToEmployer', result, yillikBrutMaas, tesOranlari);
      return result;
    }

    const YILLIK_PEK_TAVAN = this.constants.AYLIK_PEK_TAVAN * 12;
    const SGK_MATRAHI = Math.min(yillikBrutMaas, YILLIK_PEK_TAVAN);

    const SGK_ISVEREN_PAYI =
      SGK_MATRAHI * this.constants.SGK_ISVEREN_TESVIKLI_ORANI;
    const ISSIZLIK_ISVEREN_PAYI =
      SGK_MATRAHI * this.constants.ISSIZLIK_ISVEREN_PAYI_ORANI;

    // TES Reformu Maliyetleri (SGK Matrahı üzerinden hesaplanır)
    const TES_ISVEREN_PAYI = SGK_MATRAHI * tesOranlari.isveren;
    const KIDEM_FON_PAYI = SGK_MATRAHI * tesOranlari.kidemFonu;

    const totalCost = yillikBrutMaas + SGK_ISVEREN_PAYI + ISSIZLIK_ISVEREN_PAYI + TES_ISVEREN_PAYI + KIDEM_FON_PAYI;
    const employerPremiums = SGK_ISVEREN_PAYI + ISSIZLIK_ISVEREN_PAYI;

    const result = { totalCost, employerPremiums, brutMaas: yillikBrutMaas };
    
    // Cache the result
    this.setCached('calculateTotalCostToEmployer', result, yillikBrutMaas, tesOranlari);
    
    return result;
  }

  calculateBrutFromNet(yillikNet) {
    // Check cache first
    const cached = this.getCached('calculateBrutFromNet', yillikNet);
    if (cached !== null) {
      return cached;
    }

    if (yillikNet <= 0) {
      this.setCached('calculateBrutFromNet', 0, yillikNet);
      return 0;
    }
    
    let low = yillikNet;
    let high = yillikNet * 2;
    let brutGuess = 0;

    for (let i = 0; i < 50; i++) {
      brutGuess = (low + high) / 2;
      let calculatedNet = this.calculateNetFromBrut(brutGuess);
      if (Math.abs(calculatedNet - yillikNet) < 1) {
        this.setCached('calculateBrutFromNet', brutGuess, yillikNet);
        return brutGuess;
      }
      if (calculatedNet < yillikNet) {
        low = brutGuess;
      } else {
        high = brutGuess;
      }
    }
    
    // Cache the result even if not perfect match
    this.setCached('calculateBrutFromNet', brutGuess, yillikNet);
    return brutGuess;
  }

  // UI Methods
  updateUI() {
    try {
      // Clear any pending debounce operations before starting UI update
      // This ensures we don't have stale updates queued
      this.clearAllDebounces();
      
      // Clear calculation cache when UI updates - calculations may depend on current state
      // This ensures cache doesn't become stale when inputs/options change
      this.clearCache();
      
      // Format cache can persist across updates as currency rarely changes
      // It will automatically limit itself to 100 entries
      
      // --- Gider input focus/caret koruma başlangıcı ---
      // Gider inputlarının id'leri
      const giderInputIds = [
        "degiskenGiderInput",
        "muhasebeciGiderInput",
        "damgaVergisiInput",
        "digerGiderlerInput",
      ];
      // Aktif inputu ve caret pozisyonunu bul
      let activeInputId = null;
      let caretPos = null;
      const activeElem = document.activeElement;
      if (activeElem && giderInputIds.includes(activeElem.id)) {
        activeInputId = activeElem.id;
        caretPos = activeElem.selectionStart;
      }
      // --- Gider input focus/caret koruma sonu ---

      const yillikNetMaas = this.state.baseAylikNetMaasTRY * 12;

      // Early return if no valid input
      if (isNaN(yillikNetMaas) || yillikNetMaas <= 0) {
        this.elements.resultsPanel.innerHTML =
          '<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 text-gray-500 dark:text-gray-400 text-center">Lütfen geçerli bir maaş değeri girin.</div>';
        return;
      }

      const yillikBrutMaas = this.calculateBrutFromNet(yillikNetMaas);
      const yillikGiderTRY = this.state.baseAylikGiderTRY * 12;
      // Note: yillikBagkurKazanciTRY is now defined later in the code, just before Model B calculation

      const isGencGirisimci_Vergi = this.elements.gencGirisimciVergiCheck.checked;
      const isGencGirisimci_Prim = this.elements.gencGirisimciPrimCheck.checked;
      const isHizmetIhracati = this.elements.hizmetIhracatiCheck.checked;
      const zamlariGoster = this.elements.zamEtkisiCheck?.checked || false;

      let zamParametreleri = null;
      if (zamlariGoster) {
        const zamOraniVal = parseFloat(this.elements.zamOrani?.value);
        const zamAyiVal = parseInt(this.elements.zamAyi?.value);
        const zamOrani = isNaN(zamOraniVal) ? 20 : zamOraniVal;
        const zamAyi = isNaN(zamAyiVal) ? 7 : zamAyiVal;
        zamParametreleri = {
          aktif: true,
          oran: zamOrani,
          baslangicAy: zamAyi,
        };
      }

      // TES Reformu Oranlarını Tanımla
      const isTesEnabled = this.elements.tesReformuUygulaCheck?.checked || false;
      const tesOranlari = {
        calisan: isTesEnabled ? 0.03 : 0,    // %3 Çalışan Kesintisi
        isveren: isTesEnabled ? 0.01 : 0,    // %1 İşveren Katkısı
        kidemFonu: isTesEnabled ? 0.03 : 0    // %3 Kıdem Fonu Katkısı
      };

      this.elements.resultsPanel.innerHTML = "";

      // Model A - SGK calculation
      const aylikNetMaasHedefi = this.state.baseAylikNetMaasTRY;
      const sgkSabitNetData = this.calculateSGKSabitNetMaas(
        aylikNetMaasHedefi,
        zamParametreleri,
        tesOranlari
      );

      const yillikBrutMaasYeni = sgkSabitNetData.aylikDetay.reduce(
        (toplam, ay) => toplam + ay.brutMaas,
        0
      );

      // Store correct annual gross salary calculation in state (fixes dual-engine inconsistency)
      this.state.dogru_yillik_brut_maas = yillikBrutMaasYeni;
      const yillikPekTavan = this.constants.AYLIK_PEK_TAVAN * 12;
      const sgkMatrahiA = Math.min(yillikBrutMaasYeni, yillikPekTavan);
      const sgkIsciPayi = sgkMatrahiA * this.constants.SGK_ISCI_PAYI_ORANI;

      const yillikAsgariUcret = this.constants.AYLIK_BRUT_ASGARI_UCRET * 12;
      const damgaVergisiA =
        Math.max(0, yillikBrutMaasYeni - yillikAsgariUcret) *
        this.constants.DAMGA_VERGISI_ORANI;

      const sgkIsverenOrani = this.constants.SGK_ISVEREN_DIGER_ORANI;
      const sgkIsciPayiA = sgkMatrahiA * this.constants.SGK_ISCI_PAYI_ORANI; // SGK employee's share
      const issizlikIsciPayiA = sgkMatrahiA * 0.01; // Unemployment insurance employee's share (1%)
      const tesCalisanPayiA = sgkMatrahiA * tesOranlari.calisan; // TES employee's share (%3)
      const toplamPrimGideriA = sgkIsciPayiA + issizlikIsciPayiA + tesCalisanPayiA; // Total employee premiums including TES

      const netGelirA = sgkSabitNetData.aylikDetay.reduce(
        (toplam, ay) => toplam + ay.netMaas,
        0
      );
      const toplamVergiYukuA = sgkSabitNetData.toplamVergi + damgaVergisiA;

      const sgkDetaylari = {
        ortalamaNeto: sgkSabitNetData.ortalamaNeto,
        yilSonuDilimi: sgkSabitNetData.yilSonuDilimi,
        aylikDetay: sgkSabitNetData.aylikDetay,
        zamParametreleri: zamParametreleri,
      };

      // Calculate TCE for Model A
      const tceData = this.calculateTotalCostToEmployer(yillikBrutMaasYeni, tesOranlari);

      // Update Bağ-Kur PEK BEFORE Model B calculation if retirement equivalency is enabled
      // This ensures Model B uses the correct PEK value based on current Model A gross salary
      // IMPORTANT: This must be done BEFORE Model B calculation to ensure correct PEK value
      // Note: We update state directly here for precision, then update UI elements later
      if (this.elements.matchSgkPrimCheck.checked) {
        // Update PEK based on current (TES-adjusted) gross salary
        const aylikBrut = yillikBrutMaasYeni / 12;
        const min = this.constants.YILLIK_MIN_BAGKUR_KAZANCI / 12;
        const max = this.constants.YILLIK_MAX_BAGKUR_KAZANCI / 12;
        // Store precise value (no rounding) for calculations
        this.state.baseAylikBagkurPekTRY = Math.max(min, Math.min(max, aylikBrut));
      } else {
        // If retirement equivalency is NOT enabled, still initialize with gross salary if slider value is 0 or invalid
        // This ensures slider shows correct initial value based on gross salary
        if (!this.state.baseAylikBagkurPekTRY || this.state.baseAylikBagkurPekTRY <= 0) {
          const aylikBrut = yillikBrutMaasYeni / 12;
          const min = this.constants.YILLIK_MIN_BAGKUR_KAZANCI / 12;
          const max = this.constants.YILLIK_MAX_BAGKUR_KAZANCI / 12;
          this.state.baseAylikBagkurPekTRY = Math.max(min, Math.min(max, aylikBrut));
        }
      }
      
      // Update slider input and label to reflect current state value
      // This ensures the slider displays the correct value when Model B card is created
      const timeMultiplier = this.state.currentMode === "yearly" ? 12 : 1;
      if (this.elements.bagkurPrimiInput) {
        this.elements.bagkurPrimiInput.value = Math.round(this.state.baseAylikBagkurPekTRY * timeMultiplier);
      }
      if (this.elements.bagkurPrimLabel) {
        this.elements.bagkurPrimLabel.textContent = this.formatCurrency(
          Math.round(this.state.baseAylikBagkurPekTRY * timeMultiplier),
          "TRY"
        );
      }

      // İşveren maliyetlerini hesapla
      const sgkIsverenPayiA = sgkMatrahiA * this.constants.SGK_ISVEREN_TESVIKLI_ORANI;
      const issizlikIsverenPayiA = sgkMatrahiA * this.constants.ISSIZLIK_ISVEREN_PAYI_ORANI;
      const tesIsverenPayiA = sgkMatrahiA * tesOranlari.isveren; // TES İşveren Katkısı
      const kidemFonPayiA = sgkMatrahiA * tesOranlari.kidemFonu; // Kıdem Fonu Katkısı

      // Create detailed breakdown for Model A
      const gelirVergisiDilimiA = sgkSabitNetData.yilSonuDilimi || "%15-40";
      const detailedBreakdownA = {
        // Çalışan Kesintileri
        sgkPrimi: sgkIsciPayiA,
        issizlikSigortasi: issizlikIsciPayiA,
        tesPrimi: tesCalisanPayiA, // TES Kesintisi
        damgaVergisi: damgaVergisiA,
        gelirVergisi: sgkSabitNetData.toplamVergi,
        gelirVergisiDilimi: gelirVergisiDilimiA,
        // İşveren Maliyetleri
        sgkIsverenPayi: sgkIsverenPayiA,
        issizlikIsverenPayi: issizlikIsverenPayiA,
        tesIsverenPayi: tesIsverenPayiA,
        kidemFonPayi: kidemFonPayiA,
        // Toplamlar
        toplamKesinti:
          sgkIsciPayiA +
          issizlikIsciPayiA +
          tesCalisanPayiA +
          damgaVergisiA +
          sgkSabitNetData.toplamVergi,
        toplamIsverenMaliyeti: 
          sgkIsverenPayiA +
          issizlikIsverenPayiA +
          tesIsverenPayiA +
          kidemFonPayiA,
        isTesEnabled: isTesEnabled, // TES durumu için flag
      };

      this.elements.resultsPanel.innerHTML += this.createResultCard(
        "Model A: Maaşlı Çalışan (SGK - 4a)",
        netGelirA,
        toplamPrimGideriA,
        toplamVergiYukuA,
        yillikBrutMaasYeni,
        false, // isGencGirisimci_Vergi
        false, // isGencGirisimci_Prim
        false, // isHizmetIhracati
        0, // hizmetIhracatiIstisnaTutari
        sgkDetaylari,
        tceData, // Pass entire TCE data object to card
        detailedBreakdownA
      );

      // Model B calculation
      // Determine revenue base based on comparison mode
      let yillikHasilat;
      if (this.state.comparisonBasis === "tceEquivalence") {
        // Apply TCE percentage to derive the yearly revenue when using TCE equivalence mode
        yillikHasilat = tceData.totalCost * (this.state.tcePercentage / 100);
      } else {
        yillikHasilat = yillikBrutMaasYeni;
      }

      // Gelişmiş gider modülü: aktif giderleri topla
      let toplamYillikGiderler = 0;
      if (this.state.isDegiskenGiderEnabled) {
        toplamYillikGiderler += this.state.baseAylikDegiskenGiderTRY * 12;
      }
      if (this.state.isMuhasebeciGiderEnabled) {
        toplamYillikGiderler += this.state.baseAylikMuhasebeciUcretiTRY * 12;
      }
      if (this.state.isDamgaVergisiEnabled) {
        toplamYillikGiderler += this.state.baseAylikDamgaVergileriTRY * 12;
      }
      if (this.state.isDigerGiderlerEnabled) {
        toplamYillikGiderler += this.state.baseAylikDigerSabitGiderlerTRY * 12;
      }

      const karB = yillikHasilat - toplamYillikGiderler;

      // Get current Bağ-Kur PEK value (may have been updated above if retirement equivalency is enabled)
      // Use precise calculation without rounding to avoid precision loss
      const yillikBagkurKazanciTRY = this.state.baseAylikBagkurPekTRY * 12;

      const yillikBagkurPrimiHesaplanan =
        yillikBagkurKazanciTRY * this.constants.BAGKUR_INDIRIMLI_ORAN;
      const yillikMinimumBagkurPrimi =
        this.constants.YILLIK_MIN_BAGKUR_KAZANCI *
        this.constants.BAGKUR_INDIRIMLI_ORAN;

      // Check for SGK exemption first
      const isSgkMuafiyeti = this.elements.sgkMuafiyetiCheck?.checked || false;

      let odenecekBagkurPrimi;
      if (isSgkMuafiyeti) {
        // No Bağ-Kur premium required due to existing SGK status
        odenecekBagkurPrimi = 0;
      } else if (isGencGirisimci_Prim) {
        // Genç Girişimci Bağ-Kur Desteği aktif: Devlet minimum primi karşılar
        odenecekBagkurPrimi = Math.max(0, yillikBagkurPrimiHesaplanan - yillikMinimumBagkurPrimi);
      } else {
        // Normal durum: Tüm prim ödenir
        odenecekBagkurPrimi = yillikBagkurPrimiHesaplanan;
      }

      let vergiMatrahiB = Math.max(0, karB - yillikBagkurPrimiHesaplanan);

      if (isGencGirisimci_Vergi) {
        // Genç Girişimci Vergi İstisnası aktif: 330.000 TL kâr muafiyeti
        vergiMatrahiB = Math.max(
          0,
          vergiMatrahiB - this.constants.GENC_GIRISIMCI_ISTISNA_TUTARI
        );
      }

      let hizmetIhracatiIstisnaTutari = 0;
      if (isHizmetIhracati && vergiMatrahiB > 0) {
        hizmetIhracatiIstisnaTutari =
          vergiMatrahiB * this.constants.HIZMET_IHRACATI_INDIRIM_ORANI;
        vergiMatrahiB = vergiMatrahiB - hizmetIhracatiIstisnaTutari;
      }

      let yillikGelirVergisiB =
        vergiMatrahiB > 0
          ? this.calculateGelirVergisiUcretDisi(vergiMatrahiB)
          : 0;
      const netGelirB = karB - odenecekBagkurPrimi - yillikGelirVergisiB;

      // Create detailed breakdown for Model B
      const gelirVergisiDilimiB = this.getTaxBracket(vergiMatrahiB, true).label;
      const detailedBreakdownB = {
        sirketGideri: toplamYillikGiderler,
        bagkurPrimi: odenecekBagkurPrimi,
        gelirVergisi: yillikGelirVergisiB,
        gelirVergisiDilimi: gelirVergisiDilimiB,
        toplamKesinti:
          toplamYillikGiderler + odenecekBagkurPrimi + yillikGelirVergisiB,
      };

      this.elements.resultsPanel.innerHTML += this.createResultCard(
        "Model B: Şahıs Şirketi Sahibi (Bağ-Kur - 4b)",
        netGelirB,
        odenecekBagkurPrimi,
        yillikGelirVergisiB,
        yillikHasilat,
        isGencGirisimci_Vergi,
        isGencGirisimci_Prim,
        isHizmetIhracati,
        hizmetIhracatiIstisnaTutari,
        null, // sgkDetaylari
        tceData, // tceData - pass for comparison basis display
        detailedBreakdownB,
        yillikBrutMaasYeni // Model A gross salary for comparison basis display
      );

      // Gider detayları tablosu renderlandıktan sonra eventleri bağla
      this.bindGiderDetaylariEvents();

      // Bind model option sync events (for options displayed in result cards)
      this.bindModelOptionSyncEvents();

      // Update Bağ-Kur label in Model B card if it exists
      const modelBBagkurLabel = this.elements.resultsPanel.querySelector('#bagkurPrimLabel');
      if (modelBBagkurLabel && this.elements.bagkurPrimLabel) {
        modelBBagkurLabel.textContent = this.elements.bagkurPrimLabel.textContent;
      }

      // --- Gider input focus/caret geri yükleme ---
      if (activeInputId) {
        const yeniInput = document.getElementById(activeInputId);
        if (yeniInput) {
          yeniInput.focus();
          if (caretPos !== null && yeniInput.setSelectionRange) {
            // caretPos büyükse inputun uzunluğuna sabitle
            const len = yeniInput.value.length;
            yeniInput.setSelectionRange(
              Math.min(caretPos, len),
              Math.min(caretPos, len)
            );
          }
        }
      }

      // Update input fields with correct annual gross salary (fixes dual-engine inconsistency)
      // Note: Bağ-Kur PEK update moved earlier (before Model B calculation) to ensure correct Model B results
      this.updateInputDisplays(yillikBrutMaasYeni);

      // Update Bağ-Kur input fields and labels AFTER calculations are complete
      // This ensures UI shows correct values but doesn't affect calculations
      if (this.elements.matchSgkPrimCheck.checked) {
        // Update input field value and label for display (use rounded value for UI)
        const timeMultiplier = this.state.currentMode === "yearly" ? 12 : 1;
        const roundedPekValue = Math.round(this.state.baseAylikBagkurPekTRY * timeMultiplier);
        if (this.elements.bagkurPrimiInput) {
          this.elements.bagkurPrimiInput.value = roundedPekValue;
        }
        if (this.elements.bagkurPrimLabel) {
          this.elements.bagkurPrimLabel.textContent = this.formatCurrency(
            roundedPekValue,
            "TRY"
          );
        }
      }
    } catch (e) {
      console.error("UI Update failed:", e);
      this.elements.resultsPanel.innerHTML = `<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 text-red-500 dark:text-red-400 text-center">Hesaplama sırasında bir hata oluştu. Lütfen girdileri kontrol ediniz.</div>`;
    }
  }

  createResultCard(
    title,
    netGelir,
    primGideri,
    vergiYuku,
    toplamGelir,
    isGencGirisimci_Vergi = false,
    isGencGirisimci_Prim = false,
    isHizmetIhracati = false,
    hizmetIhracatiIstisnaTutari = 0,
    sgkDetaylari = null,
    tceData = null,
    detailedBreakdown = null,
    yillikBrutMaasModelA = null // Model A annual gross salary for comparison basis display
  ) {
    try {
      const score = toplamGelir > 0 ? (netGelir / toplamGelir) * 100 : 0;
      const timeLabel =
        this.state.currentMode === "yearly" ? "Yıllık" : "Aylık";
      const divisor = this.state.currentMode === "yearly" ? 1 : 12;

      const displayNet =
        this.state.currentCurrency === "TRY"
          ? netGelir / divisor
          : netGelir / divisor / this.state.usdRate;
      const displayPrim =
        this.state.currentCurrency === "TRY"
          ? primGideri / divisor
          : primGideri / divisor / this.state.usdRate;
      const displayVergi =
        this.state.currentCurrency === "TRY"
          ? vergiYuku / divisor
          : vergiYuku / divisor / this.state.usdRate;

      let scoreText = "Düşük";
      let scoreLevel = 1;
      if (!isNaN(score)) {
        if (score >= 40) {
          scoreText = "Orta";
          scoreLevel = 2;
        }
        if (score >= 60) {
          scoreText = "İyi";
          scoreLevel = 3;
        }
        if (score >= 75) {
          scoreText = "Çok İyi";
          scoreLevel = 4;
        }
        if (score >= 85) {
          scoreText = "Mükemmel";
          scoreLevel = 5;
        }
      }

      let tesvikNotlari = "";
      if (title.includes("Model B") && isGencGirisimci_Prim) {
        const yillikMinimumBagkurPrimi =
          this.constants.YILLIK_MIN_BAGKUR_KAZANCI *
          this.constants.BAGKUR_INDIRIMLI_ORAN;
        const destekMiktari = yillikMinimumBagkurPrimi / divisor;
        const displayDestek =
          this.state.currentCurrency === "TRY"
            ? destekMiktari
            : destekMiktari / this.state.usdRate;
        tesvikNotlari += `<p class="text-xs text-green-600 dark:text-green-400 mt-2 text-center">Genç Girişimci Bağ-Kur Desteği uygulandı (${timeLabel} ~${this.formatCurrency(
          displayDestek,
          this.state.currentCurrency
        )} prim devlet tarafından karşılanır).</p>`;
      }

      if (title.includes("Model B") && isGencGirisimci_Vergi) {
        const istisnaMiktari = this.constants.GENC_GIRISIMCI_ISTISNA_TUTARI / divisor;
        const displayIstisna =
          this.state.currentCurrency === "TRY"
            ? istisnaMiktari
            : istisnaMiktari / this.state.usdRate;
        tesvikNotlari += `<p class="text-xs text-green-600 dark:text-green-400 mt-1 text-center">Genç Girişimci Vergi İstisnası uygulandı (${timeLabel} ~${this.formatCurrency(
          displayIstisna,
          this.state.currentCurrency
        )} kâr muafiyeti).</p>`;
      }

      if (
        title.includes("Model B") &&
        isHizmetIhracati &&
        hizmetIhracatiIstisnaTutari > 0
      ) {
        const displayIstisna =
          this.state.currentCurrency === "TRY"
            ? hizmetIhracatiIstisnaTutari / divisor
            : hizmetIhracatiIstisnaTutari / divisor / this.state.usdRate;
        tesvikNotlari += `<p class="text-xs text-blue-600 dark:text-blue-400 mt-1 text-center">Hizmet İhracatı İstisnası: ${timeLabel} ${this.formatCurrency(
          displayIstisna,
          this.state.currentCurrency
        )} vergi tasarrufu (%80 istisna)</p>`;
      }


      let netGelirEtiketi = timeLabel + " Net Gelir";
      if (
        title.includes("Model A") &&
        sgkDetaylari &&
        sgkDetaylari.zamParametreleri &&
        sgkDetaylari.zamParametreleri.aktif
      ) {
        netGelirEtiketi = timeLabel + " Ortalama Net Gelir";
      }

      // Generate stable card ID based on title
      const cardId = title.includes("Model A") ? "model-a-card" : "model-b-card";


      let sgkDetayHTML = "";
      if (sgkDetaylari && title.includes("Model A") && sgkDetaylari.ortalamaNeto !== undefined) {
        const displayOrtalamaNeto =
          this.state.currentCurrency === "TRY"
            ? sgkDetaylari.ortalamaNeto
            : sgkDetaylari.ortalamaNeto / this.state.usdRate;

        sgkDetayHTML = `
                    <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">📊 SGK Aylık Dönem Analizi</h4>
                        <div class="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                            <p><strong>Gerçek Aylık Ortalama Net:</strong> ${this.formatCurrency(
                              displayOrtalamaNeto,
                              this.state.currentCurrency
                            )}</p>
                            <p><strong>Yıl Sonu Vergi Dilimi:</strong> ${
                              sgkDetaylari.yilSonuDilimi
                            }</p>
                            ${
                              sgkDetaylari.zamParametreleri &&
                              sgkDetaylari.zamParametreleri.aktif
                                ? `<p class="text-orange-600 dark:text-orange-400"><strong>⚠️ ${sgkDetaylari.zamParametreleri.baslangicAy}. aydan itibaren %${sgkDetaylari.zamParametreleri.oran} zam etkisi dahil!</strong></p>`
                                : ""
                            }
                        </div>
                        <button class="text-xs text-blue-600 dark:text-blue-400 underline mt-2" onclick="window.toggleSGKDetay(this)">
                            📈 Aylık Detayları Göster
                        </button>
                        <div class="sgk-detay-panel hidden mt-3">
                            <div class="max-h-48 overflow-y-auto text-xs">
                                <table class="w-full border-collapse dark:text-gray-100">
                                    <thead>
                                        <tr class="bg-blue-100 dark:bg-blue-900/40 dark:text-gray-100">
                                            <th class="border border-gray-300 dark:border-gray-600 text-left p-1 dark:text-gray-100">Ay</th>
                                            <th class="border border-gray-300 dark:border-gray-600 text-right p-1 dark:text-gray-100">Brüt</th>
                                            <th class="border border-gray-300 dark:border-gray-600 text-right p-1 dark:text-gray-100">Vergi</th>
                                            <th class="border border-gray-300 dark:border-gray-600 text-right p-1 dark:text-gray-100">Net</th>
                                            <th class="border border-gray-300 dark:border-gray-600 text-center p-1 dark:text-gray-100">Dilim</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                `;

        if (sgkDetaylari.aylikDetay && Array.isArray(sgkDetaylari.aylikDetay)) {
          sgkDetaylari.aylikDetay.forEach((ay) => {
          const displayBrut =
            this.state.currentCurrency === "TRY"
              ? ay.brutMaas
              : ay.brutMaas / this.state.usdRate;
          const displayVergiAy =
            this.state.currentCurrency === "TRY"
              ? ay.buAyinVergisi
              : ay.buAyinVergisi / this.state.usdRate;
          const displayNetAy =
            this.state.currentCurrency === "TRY"
              ? ay.netMaas
              : ay.netMaas / this.state.usdRate;

          const rowClass = ay.zamliAy
            ? "bg-orange-100 dark:bg-orange-900/40 dark:text-gray-100"
            : ay.ay % 2 === 0
            ? "bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
            : "dark:text-gray-100";
          const zamIcon = ay.zamliAy ? " 📈" : "";

          sgkDetayHTML += `
                        <tr class="${rowClass}">
                            <td class="border border-gray-300 dark:border-gray-700 p-1">${ay.ay}.${zamIcon}</td>
                            <td class="border border-gray-300 dark:border-gray-700 text-right p-1">${this.formatCurrency(
                              displayBrut,
                              this.state.currentCurrency
                            )}</td>
                            <td class="border border-gray-300 dark:border-gray-700 text-right p-1">${this.formatCurrency(
                              displayVergiAy,
                              this.state.currentCurrency
                            )}</td>
                            <td class="border border-gray-300 dark:border-gray-700 text-right p-1">${this.formatCurrency(
                              displayNetAy,
                              this.state.currentCurrency
                            )}</td>
                            <td class="border border-gray-300 dark:border-gray-700 text-center p-1">${
                              ay.vergiDilimi
                            }</td>
                        </tr>
                    `;
          });
        }

        sgkDetayHTML += `
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
      }

      // Add TCE section for Model A
      let tceHTML = "";
      if (
        tceData &&
        title.includes("Model A") &&
        tceData.totalCost &&
        !isNaN(tceData.totalCost)
      ) {
        const displayTCE =
          this.state.currentCurrency === "TRY"
            ? tceData.totalCost / divisor
            : tceData.totalCost / divisor / this.state.usdRate;

        // Calculate brüt maaş for TCE display
        const brutMaas =
          this.state.currentCurrency === "TRY"
            ? tceData.brutMaas / divisor
            : tceData.brutMaas / divisor / this.state.usdRate;

        tceHTML = `
                <div class="mt-4 border-t border-gray-300 dark:border-gray-700 pt-3">
                    <div class="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Brüt Maaş</p>
                            <p id="${cardId}-brut-maas" class="text-lg font-semibold text-gray-700 dark:text-gray-200">${this.formatCurrency(
                              brutMaas,
                              this.state.currentCurrency
                            )}</p>
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-blue-700 dark:text-blue-400">İşverene Toplam Maliyet</p>
                            <p id="${cardId}-tce" class="text-2xl font-bold text-blue-600 dark:text-blue-400">${this.formatCurrency(
                              displayTCE,
                              this.state.currentCurrency
                            )}</p>
                        </div>
                    </div>
                </div>`;
      }

      // Add Model A options section
      let modelAOptionsHTML = "";
      if (title.includes("Model A")) {
        const isZamEnabled = this.elements.zamEtkisiCheck?.checked || false;
        const isTesEnabled = this.elements.tesReformuUygulaCheck?.checked || false;
        
        modelAOptionsHTML = `
          <div class="mt-4 border-t border-gray-300 dark:border-gray-700 pt-3">
            <h4 class="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3">⚙️ Model A Seçenekleri</h4>
            <div class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 space-y-3">
              <!-- Mid-Year Raise Effect -->
              <div>
                <div class="flex items-center space-x-2">
                  <input
                    data-sync-id="zamEtkisiCheck"
                    type="checkbox"
                    ${isZamEnabled ? "checked" : ""}
                    class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 model-option-checkbox"
                  />
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">🔄 Yıl İçi Zam Simülasyonu</label>
                </div>
                <div
                  class="zam-detay-panel ${isZamEnabled ? "" : "hidden"} mt-2 pl-6 border-l-2 border-blue-200 dark:border-blue-700"
                >
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Zam Oranı (%)</label>
                      <input
                        data-sync-id="zamOrani"
                        type="number"
                        min="0"
                        max="200"
                        step="5"
                        value="${this.elements.zamOrani?.value || 20}"
                        class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 model-option-input"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Hangi Aydan İtibaren</label>
                      <select
                        data-sync-id="zamAyi"
                        class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 model-option-select"
                      >
                        <option value="1">Ocak</option>
                        <option value="2">Şubat</option>
                        <option value="3">Mart</option>
                        <option value="4">Nisan</option>
                        <option value="5">Mayıs</option>
                        <option value="6">Haziran</option>
                        <option value="7" ${this.elements.zamAyi?.value == 7 ? "selected" : ""}>Temmuz</option>
                        <option value="8">Ağustos</option>
                        <option value="9">Eylül</option>
                        <option value="10">Ekim</option>
                        <option value="11">Kasım</option>
                        <option value="12">Aralık</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2026 TES Reformu Simulation -->
              <div class="flex items-center space-x-2">
                <input
                  data-sync-id="tesReformuUygula"
                  type="checkbox"
                  ${isTesEnabled ? "checked" : ""}
                  class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 model-option-checkbox"
                />
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">2026 TES Reformu Simülasyonu (Deneysel)</label>
                  <span
                    class="inline-flex items-center justify-center text-base cursor-pointer transition-transform duration-150 select-none w-5 h-5 rounded-full text-gray-600 dark:text-gray-400 hover:scale-105 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:outline-offset-1"
                    data-tooltip="DİKKAT: Bu seçeneği işaretlemek, 2026'da planlanan Tamamlayıcı Emeklilik Sistemi'ni (TES) simüle eder. Model A'nın (Maaşlı) net maaşından %3 kesinti yapar ve işveren maliyetini (TCE) %4 artırır. Raporlara göre Model B (Bağ-Kur) bu sistemden etkilenmez."
                  >ℹ️</span>
              </div>
            </div>
          </div>
        `;
      }

      // Add Model B options section
      let modelBOptionsHTML = "";
      if (title.includes("Model B")) {
        const isMatchSgkPrim = this.elements.matchSgkPrimCheck?.checked || false;
        const isGencGirisimciVergi = this.elements.gencGirisimciVergiCheck?.checked || false;
        const isGencGirisimciPrim = this.elements.gencGirisimciPrimCheck?.checked || false;
        const isSgkMuafiyeti = this.elements.sgkMuafiyetiCheck?.checked || false;
        const isHizmetIhracati = this.elements.hizmetIhracatiCheck?.checked || false;

        // Get current Bağ-Kur PEK value
        // Ensure we get the value in the correct time unit (monthly or yearly) for the slider
        const timeMultiplier = this.state.currentMode === "yearly" ? 12 : 1;
        const bagkurMin = Math.round(this.constants.YILLIK_MIN_BAGKUR_KAZANCI / (this.state.currentMode === "yearly" ? 1 : 12));
        const bagkurMax = Math.round(this.constants.YILLIK_MAX_BAGKUR_KAZANCI / (this.state.currentMode === "yearly" ? 1 : 12));
        const timeLabel = this.state.currentMode === "yearly" ? "Yıllık" : "Aylık";
        
        // Calculate slider value from state (always stored as monthly, convert to display unit)
        // Use state value directly since it's always up-to-date after Model A calculation
        let bagkurPekValue = Math.round(this.state.baseAylikBagkurPekTRY * timeMultiplier);
        
        // Ensure value is within min/max bounds
        bagkurPekValue = Math.max(bagkurMin, Math.min(bagkurMax, bagkurPekValue));

        // Get current comparison basis state
        const currentComparisonBasis = this.state.comparisonBasis || "grossEquivalence";
        const isBrutBasis = currentComparisonBasis === "grossEquivalence";
        const tcePercentage = this.state.tcePercentage || 100;

        // Calculate values for comparison basis display
        let comparisonValue = 0;
        let comparisonLabel = "";
        const divisor = this.state.currentMode === "yearly" ? 1 : 12;
        
        if (isBrutBasis && yillikBrutMaasModelA !== null) {
          // Show Model A gross salary
          comparisonValue = this.state.currentCurrency === "TRY"
            ? yillikBrutMaasModelA / divisor
            : (yillikBrutMaasModelA / divisor) / this.state.usdRate;
          comparisonLabel = "Brüt Maaş";
        } else if (!isBrutBasis && tceData && tceData.totalCost) {
          // Show total cost to employer (with percentage applied)
          const totalCostWithPercentage = tceData.totalCost * (tcePercentage / 100);
          comparisonValue = this.state.currentCurrency === "TRY"
            ? totalCostWithPercentage / divisor
            : (totalCostWithPercentage / divisor) / this.state.usdRate;
          comparisonLabel = "Toplam Maliyet";
        }

        modelBOptionsHTML = `
          <div class="mt-4 border-t border-gray-300 dark:border-gray-700 pt-3">
            <h4 class="text-sm font-semibold text-green-700 dark:text-green-400 mb-3">⚙️ Model B Seçenekleri</h4>
            <div class="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4 space-y-3">
              <!-- Karşılaştırma Bazı Seçici -->
              <div class="mb-4 pb-4 border-b border-gray-300 dark:border-gray-700">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Hasılat Karşılaştırma Bazı
                </label>
                <div class="flex flex-col sm:flex-row sm:items-center sm:flex-nowrap gap-2 sm:gap-3 rounded-lg p-2 sm:p-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <!-- Left side: Info icon and buttons -->
                  <div class="flex items-center gap-2 sm:gap-1 w-full sm:w-auto flex-wrap sm:flex-nowrap sm:flex-shrink-0">
                    <span
                      class="inline-flex items-center justify-center text-base cursor-pointer transition-transform duration-150 select-none w-5 h-5 rounded-full text-gray-600 dark:text-gray-400 flex-shrink-0 hover:scale-105 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-1"
                      data-tooltip="Varsayılan modda, freelance hasılatı maaşlı çalışanın brüt maaşına eşitlenir. 'İşveren Maliyeti' modunda ise hasılat, işverenin SGK payları dahil toplam maliyetine eşitlenir. Bu, bir pozisyon için ayrılan toplam bütçenin daha doğru bir karşılaştırmasını sağlar."
                    >ℹ️</span>
                    <div class="flex items-center gap-1 flex-1 sm:flex-initial flex-wrap sm:flex-nowrap">
                      <button
                        data-comparison-basis="grossEquivalence"
                        class="comparison-basis-btn py-1.5 px-3 h-auto leading-[1.25] text-xs font-semibold rounded-md transition-colors flex-1 sm:flex-initial min-w-0 ${isBrutBasis ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
                      >
                        Brüt Maaş
                      </button>
                      <button
                        data-comparison-basis="tceEquivalence"
                        class="comparison-basis-btn py-1.5 px-3 h-auto leading-[1.25] text-xs font-semibold rounded-md transition-colors flex-1 sm:flex-initial min-w-0 ${!isBrutBasis ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
                      >
                        İşveren Maliyeti
                      </button>
                      <div class="tce-percentage-panel flex items-center gap-1 ${isBrutBasis ? 'hidden' : ''} w-full sm:w-auto sm:ml-1 mt-1 sm:mt-0">
                        <input
                          type="number"
                          data-sync-id="tcePercentageInput"
                          min="1"
                          max="200"
                          step="1"
                          value="${tcePercentage}"
                          class="w-20 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 model-option-input"
                          title="İşveren maliyeti oranı (%)"
                        />
                        <span class="text-xs text-gray-600 dark:text-gray-300">%</span>
                      </div>
                    </div>
                  </div>
                  <!-- Right side: Value display -->
                  ${comparisonLabel && comparisonValue > 0 ? `
                  <div class="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-auto sm:flex-shrink-0">
                    <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">${comparisonLabel}</span>
                    <span class="text-sm font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">${this.formatCurrency(comparisonValue, this.state.currentCurrency)}</span>
                  </div>
                  ` : ''}
                </div>
              </div>

              <!-- Bağ-Kur Prim Kazancı Slider -->
              <div class="mb-4 pb-4 sm:pb-3 border-b border-gray-300 dark:border-gray-700">
                <label
                  for="bagkurPrimiInput"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-1.5"
                >Bağ-Kur Prim Kazancı (${timeLabel} TRY)</label>
                <input
                  type="range"
                  id="bagkurPrimiInput"
                  min="${bagkurMin}"
                  max="${bagkurMax}"
                  value="${bagkurPekValue}"
                  ${isMatchSgkPrim ? "disabled" : ""}
                  class="w-full h-2 bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg appearance-none cursor-pointer mt-2 sm:mt-1.5 model-bagkur-slider"
                  aria-describedby="bagkurHelp"
                />
                <div id="bagkurHelp" class="sr-only">
                  Select Bağ-Kur premium income level
                </div>
                <div class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-1 gap-1">
                  <span class="flex-shrink-0">Min</span>
                  <span
                    id="bagkurPrimLabel"
                    class="font-semibold text-blue-600 dark:text-blue-400 text-center px-1"
                  >${this.formatCurrency(Math.round(bagkurPekValue), "TRY")}</span>
                  <span class="flex-shrink-0">Tavan</span>
                </div>
                ${isMatchSgkPrim ? '<p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-1 italic leading-relaxed">Emeklilik Eşdeğerliği aktif olduğu için otomatik ayarlanıyor</p>' : ''}
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <!-- Retirement Equivalence -->
                <div class="flex items-center space-x-2">
                  <input
                    data-sync-id="matchSgkPrim"
                    type="checkbox"
                    ${isMatchSgkPrim ? "checked" : ""}
                    class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 model-option-checkbox"
                  />
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">Emeklilik Eşdeğerliği</label>
                  <span
                    class="inline-flex items-center justify-center text-base cursor-pointer transition-transform duration-150 select-none w-5 h-5 rounded-full text-gray-600 dark:text-gray-400 hover:scale-105 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-1"
                    data-tooltip="Bu seçenek, Bağ-Kur emekli maaşınızın, maaşlı çalışandakiyle aynı seviyede olmasını sağlamak için ödemeniz gereken prim kazancını (PEK) otomatik olarak ayarlar."
                  >ℹ️</span>
                </div>

                <!-- Young Entrepreneur Tax Exemption -->
                <div class="flex items-center space-x-2">
                  <input
                    data-sync-id="gencGirisimciVergi"
                    type="checkbox"
                    ${isGencGirisimciVergi ? "checked" : ""}
                    class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 model-option-checkbox"
                  />
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Genç Girişimci Vergi İstisnası</label>
                  <span
                    class="inline-flex items-center justify-center text-base cursor-pointer transition-transform duration-150 select-none w-5 h-5 rounded-full text-gray-600 dark:text-gray-400 hover:scale-105 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-1"
                    data-tooltip="3 yıl boyunca, 2025 yılı için 330.000 TL'ye kadar olan kârınız için Gelir Vergisi muafiyeti sağlar."
                  >ℹ️</span>
                </div>

                <!-- Young Entrepreneur Bağ-Kur Support -->
                <div class="flex items-center space-x-2">
                  <input
                    data-sync-id="gencGirisimciPrim"
                    type="checkbox"
                    ${isGencGirisimciPrim ? "checked" : ""}
                    class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 model-option-checkbox"
                  />
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Genç Girişimci Bağ-Kur Desteği</label>
                  <span
                    class="inline-flex items-center justify-center text-base cursor-pointer transition-transform duration-150 select-none w-5 h-5 rounded-full text-gray-600 dark:text-gray-400 hover:scale-105 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:outline-offset-1"
                    data-tooltip="DİKKAT: TBMM'ye sunulan yasa teklifine göre 12 aylık Bağ-Kur prim desteğinin 2026 itibarıyla kaldırılması planlanmaktadır. 2026 ve sonrası için simülasyon yapıyorsanız bu seçeneğin işaretini kaldırın."
                  >ℹ️</span>
                </div>

                <!-- SGK Exemption -->
                <div class="flex items-center space-x-2">
                  <input
                    data-sync-id="sgkMuafiyeti"
                    type="checkbox"
                    ${isSgkMuafiyeti ? "checked" : ""}
                    class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 model-option-checkbox"
                  />
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">SGK Muafiyeti</label>
                  <span
                    class="inline-flex items-center justify-center text-base cursor-pointer transition-transform duration-150 select-none w-5 h-5 rounded-full text-gray-600 dark:text-gray-400 hover:scale-105 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-1"
                    data-tooltip="Mevcut SGK'lı işiniz devam ederken şahıs şirketi kurduğunuzda, 5510 sayılı kanunun 53. maddesi gereği Bağ-Kur primi ödeme yükümlülüğünüz bulunmaz. Bu seçenek bu durumu simüle eder."
                  >ℹ️</span>
                </div>

                <!-- Service Export -->
                <div class="flex items-center space-x-2">
                  <input
                    data-sync-id="hizmetIhracati"
                    type="checkbox"
                    ${isHizmetIhracati ? "checked" : ""}
                    class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 model-option-checkbox"
                  />
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">%80 Hizmet İhracatı</label>
                  <span
                    class="inline-flex items-center justify-center text-base cursor-pointer transition-transform duration-150 select-none w-5 h-5 rounded-full text-gray-600 dark:text-gray-400 hover:scale-105 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-1"
                    data-tooltip="Yurt dışına yaptığınız hizmet satışlarında, gelir vergisi matrahından %80 oranında istisna uygulanır. 2025 yılında bu istisna için limit bulunmamaktadır. Örneğin, %27 vergi dilimindeyseniz ve 100.000 TL'lik kârınız varsa, 80.000 TL'si vergiden muaf tutulur, sadece 20.000 TL üzerinden vergi ödersiniz."
                  >ℹ️</span>
                </div>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                <strong>SGK Muafiyeti:</strong> Mevcut SGK'lı iş devam ederken Bağ-Kur primi ödeme yükümlülüğü olmaz (5510 SK m.53)<br />
                <strong>Emeklilik Eşdeğerliği:</strong> SGK ile aynı emekli maaşı için gerekli PEK'i otomatik ayarlar
              </div>
            </div>
          </div>
        `;
      }

      // Add detailed breakdown section for Model A
      let detailedBreakdownHTML = "";
      if (detailedBreakdown && title.includes("Model A")) {
        detailedBreakdownHTML = `
                <div class="mt-4 border-t border-gray-300 dark:border-gray-700 pt-3">
                    <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center mb-4">📋 Kesintiler ve Maliyetler</h4>
                    
                    <!-- Çalışan Kesintileri -->
                    <div class="mb-4">
                        <h5 class="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">👤 Çalışan Kesintileri (Maaştan Düşenler)</h5>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div class="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-700">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-gray-600 dark:text-gray-300">SGK Primi</span>
                                    <span class="font-semibold text-red-600 dark:text-red-400">${this.formatCurrency(
                                      this.state.currentCurrency === "TRY"
                                        ? detailedBreakdown.sgkPrimi / divisor
                                        : detailedBreakdown.sgkPrimi /
                                            divisor /
                                            this.state.usdRate,
                                      this.state.currentCurrency
                                    )}</span>
                                </div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">%15</div>
                            </div>
                            <div class="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-gray-600 dark:text-gray-300">İşsizlik Sig.</span>
                                    <span class="font-semibold text-orange-600 dark:text-orange-400">${this.formatCurrency(
                                      this.state.currentCurrency === "TRY"
                                        ? detailedBreakdown.issizlikSigortasi /
                                            divisor
                                        : detailedBreakdown.issizlikSigortasi /
                                            divisor /
                                            this.state.usdRate,
                                      this.state.currentCurrency
                                    )}</span>
                                </div>
                                <div class="text-xs text-gray-500">%1</div>
                            </div>
                            ${detailedBreakdown.isTesEnabled && detailedBreakdown.tesPrimi ? `
                            <div class="bg-amber-50 p-3 rounded-lg border border-amber-300">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-gray-600 flex items-center gap-1">
                                      TES Kesintisi
                                      <span class="text-xs text-amber-700 bg-amber-100 px-1 rounded">2026</span>
                                    </span>
                                    <span class="font-semibold text-amber-700">${this.formatCurrency(
                                      this.state.currentCurrency === "TRY"
                                        ? detailedBreakdown.tesPrimi / divisor
                                        : detailedBreakdown.tesPrimi /
                                            divisor /
                                            this.state.usdRate,
                                      this.state.currentCurrency
                                    )}</span>
                                </div>
                                <div class="text-xs text-gray-500">%3</div>
                            </div>
                            ` : ''}
                            <div class="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-gray-600">Gelir Vergisi</span>
                                    <span class="font-semibold text-blue-600">${this.formatCurrency(
                                      this.state.currentCurrency === "TRY"
                                        ? detailedBreakdown.gelirVergisi / divisor
                                        : detailedBreakdown.gelirVergisi /
                                            divisor /
                                            this.state.usdRate,
                                      this.state.currentCurrency
                                    )}</span>
                                </div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">${
                                  detailedBreakdown.gelirVergisiDilimi
                                }</div>
                            </div>
                            <div class="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-gray-600 dark:text-gray-300">Damga Vergisi</span>
                                    <span class="font-semibold text-purple-600 dark:text-purple-400">${this.formatCurrency(
                                      this.state.currentCurrency === "TRY"
                                        ? detailedBreakdown.damgaVergisi / divisor
                                        : detailedBreakdown.damgaVergisi /
                                            divisor /
                                            this.state.usdRate,
                                      this.state.currentCurrency
                                    )}</span>
                                </div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">%0.759</div>
                            </div>
                        </div>
                        <div class="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
                            <div class="flex justify-between items-center">
                                <span class="font-semibold text-gray-700 dark:text-gray-300">Toplam Kesinti:</span>
                                <span class="font-bold text-red-700 dark:text-red-400">${this.formatCurrency(
                                  this.state.currentCurrency === "TRY"
                                    ? detailedBreakdown.toplamKesinti / divisor
                                    : detailedBreakdown.toplamKesinti /
                                        divisor /
                                        this.state.usdRate,
                                  this.state.currentCurrency
                                )}</span>
                            </div>
                        </div>
                    </div>

                    <!-- İşveren Maliyetleri -->
                    <div class="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                        <h5 class="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">🏢 İşveren Maliyetleri (Brüt Maaş Dışında)</h5>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div class="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-700">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-gray-600 dark:text-gray-300">SGK İşveren Payı</span>
                                    <span class="font-semibold text-green-700 dark:text-green-400">${this.formatCurrency(
                                      this.state.currentCurrency === "TRY"
                                        ? detailedBreakdown.sgkIsverenPayi / divisor
                                        : detailedBreakdown.sgkIsverenPayi /
                                            divisor /
                                            this.state.usdRate,
                                      this.state.currentCurrency
                                    )}</span>
                                </div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">%15.75</div>
                            </div>
                            <div class="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-gray-600 dark:text-gray-300">İşsizlik İşveren Payı</span>
                                    <span class="font-semibold text-yellow-700 dark:text-yellow-400">${this.formatCurrency(
                                      this.state.currentCurrency === "TRY"
                                        ? detailedBreakdown.issizlikIsverenPayi / divisor
                                        : detailedBreakdown.issizlikIsverenPayi /
                                            divisor /
                                            this.state.usdRate,
                                      this.state.currentCurrency
                                    )}</span>
                                </div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">%2</div>
                            </div>
                            ${detailedBreakdown.isTesEnabled && detailedBreakdown.tesIsverenPayi ? `
                            <div class="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg border border-amber-300 dark:border-amber-700">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                      TES İşveren Katkısı
                                      <span class="text-xs text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-1 rounded">2026</span>
                                    </span>
                                    <span class="font-semibold text-amber-700 dark:text-amber-400">${this.formatCurrency(
                                      this.state.currentCurrency === "TRY"
                                        ? detailedBreakdown.tesIsverenPayi / divisor
                                        : detailedBreakdown.tesIsverenPayi /
                                            divisor /
                                            this.state.usdRate,
                                      this.state.currentCurrency
                                    )}</span>
                                </div>
                                <div class="text-xs text-gray-500">%1</div>
                            </div>
                            ` : ''}
                            ${detailedBreakdown.isTesEnabled && detailedBreakdown.kidemFonPayi ? `
                            <div class="bg-indigo-50 p-3 rounded-lg border border-indigo-300">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-gray-600 flex items-center gap-1">
                                      Kıdem Fonu Katkısı
                                      <span class="text-xs text-indigo-700 bg-indigo-100 px-1 rounded">2026</span>
                                    </span>
                                    <span class="font-semibold text-indigo-700">${this.formatCurrency(
                                      this.state.currentCurrency === "TRY"
                                        ? detailedBreakdown.kidemFonPayi / divisor
                                        : detailedBreakdown.kidemFonPayi /
                                            divisor /
                                            this.state.usdRate,
                                      this.state.currentCurrency
                                    )}</span>
                                </div>
                                <div class="text-xs text-gray-500">%3</div>
                            </div>
                            ` : ''}
                        </div>
                        <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div class="flex justify-between items-center">
                                <span class="font-semibold text-blue-700">Toplam İşveren Maliyeti:</span>
                                <span class="font-bold text-blue-800">${this.formatCurrency(
                                  this.state.currentCurrency === "TRY"
                                    ? detailedBreakdown.toplamIsverenMaliyeti / divisor
                                    : detailedBreakdown.toplamIsverenMaliyeti /
                                        divisor /
                                        this.state.usdRate,
                                  this.state.currentCurrency
                                )}</span>
                            </div>
                        </div>
                    </div>
                </div>`;
      }

      // Add detailed breakdown section for Model B
      if (detailedBreakdown && title.includes("Model B")) {
        // Gider kalemlerinin toplamını göster (aylık)
        const giderToplamiAylik =
          (this.state.isDegiskenGiderEnabled
            ? this.state.baseAylikDegiskenGiderTRY
            : 0) +
          (this.state.isMuhasebeciGiderEnabled
            ? this.state.baseAylikMuhasebeciUcretiTRY
            : 0) +
          (this.state.isDamgaVergisiEnabled
            ? this.state.baseAylikDamgaVergileriTRY
            : 0) +
          (this.state.isDigerGiderlerEnabled
            ? this.state.baseAylikDigerSabitGiderlerTRY
            : 0);

        detailedBreakdownHTML = `
          <div class="mt-4 border-t border-gray-300 dark:border-gray-700 pt-3">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center mb-3">📋 Kesintiler</h4>
            <div class="mb-3">
              <button type="button" class="text-blue-700 dark:text-blue-400 text-sm font-semibold flex items-center gap-1 mx-auto outline-none" onclick="this.nextElementSibling.classList.toggle('hidden');this.querySelector('span').textContent = this.nextElementSibling.classList.contains('hidden') ? '[+]' : '[-]';">
                <span>[-]</span> Gider Detayları
              </button>
              <div class="mt-2" id="gider-detaylari-panel">
                <div class="overflow-x-auto">
                  <table class="min-w-full text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
                    <thead>
                      <tr class="bg-gray-50 dark:bg-gray-700">
                        <th class="p-2 border-b border-gray-300 dark:border-gray-600 text-left dark:text-gray-100">Aktif</th>
                        <th class="p-2 border-b border-gray-300 dark:border-gray-600 text-left dark:text-gray-100">Etiket</th>
                        <th class="p-2 border-b border-gray-300 dark:border-gray-600 text-left dark:text-gray-100">Girdi Alanı</th>
                        <th class="p-2 border-b border-gray-300 dark:border-gray-600 text-left dark:text-gray-100">Bilgi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="p-2 border-b border-gray-300 dark:border-gray-700 dark:text-gray-100"><input type="checkbox" id="degiskenGiderCheck" ${
                          this.state.isDegiskenGiderEnabled ? "checked" : ""
                        } class="border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400"></td>
                        <td class="p-2 border-b border-gray-300 dark:border-gray-700 dark:text-gray-100">Değişken Giderler</td>
                        <td class="p-2 border-b border-gray-300 dark:border-gray-700 dark:text-gray-100"><input type="number" id="degiskenGiderInput" value="${
                          this.state.baseAylikDegiskenGiderTRY
                        }" class="w-28 border border-gray-300 dark:border-gray-600 rounded p-1 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"> (Aylık, TRY)</td>
                        <td class="p-2 border-b border-gray-300 dark:border-gray-700 dark:text-gray-100" title="Donanım, yazılım, seyahat gibi işinizle doğrudan ilgili, miktarı değişebilen harcamalarınız."><span class="cursor-help">Donanım, yazılım, seyahat gibi işinizle doğrudan ilgili, miktarı değişebilen harcamalarınız.</span></td>
                      </tr>
                      <tr>
                        <td class="p-2 border-b border-gray-300 dark:border-gray-700 dark:text-gray-100"><input type="checkbox" id="muhasebeciGiderCheck" ${
                          this.state.isMuhasebeciGiderEnabled ? "checked" : ""
                        } class="border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400"></td>
                        <td class="p-2 border-b border-gray-300 dark:border-gray-700 dark:text-gray-100">Muhasebeci Ücreti</td>
                        <td class="p-2 border-b border-gray-300 dark:border-gray-700 dark:text-gray-100"><input type="number" id="muhasebeciGiderInput" value="${
                          this.state.baseAylikMuhasebeciUcretiTRY
                        }" class="w-28 border border-gray-300 dark:border-gray-600 rounded p-1 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"> (Aylık, TRY)</td>
                        <td class="p-2 border-b border-gray-300 dark:border-gray-700 dark:text-gray-100" title="Mali müşavirinize ödediğiniz aylık standart hizmet bedeli. (Ortalama: 1.500-2.500 TL)"><span class="cursor-help">Mali müşavirinize ödediğiniz aylık standart hizmet bedeli. (Ortalama: 1.500-2.500 TL)</span></td>
                      </tr>
                      <tr>
                        <td class="p-2 border-b border-gray-300 dark:border-gray-700 dark:text-gray-100"><input type="checkbox" id="damgaVergisiCheck" ${
                          this.state.isDamgaVergisiEnabled ? "checked" : ""
                        } class="border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400"></td>
                        <td class="p-2 border-b border-gray-300 dark:border-gray-700 dark:text-gray-100">Damga Vergileri</td>
                        <td class="p-2 border-b border-gray-300 dark:border-gray-700 dark:text-gray-100"><input type="number" id="damgaVergisiInput" value="${
                          this.state.baseAylikDamgaVergileriTRY
                        }" class="w-28 border border-gray-300 dark:border-gray-600 rounded p-1 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"> (Aylık Ortalama, TRY)</td>
                        <td class="p-2 border-b border-gray-300 dark:border-gray-700 dark:text-gray-100" title="Yıl boyunca ödenen KDV, Muhtasar, Geçici ve Yıllık Gelir Vergisi beyannamelerinin zorunlu damga vergilerinin aylık ortalamasıdır."><span class="cursor-help">Yıl boyunca ödenen KDV, Muhtasar, Geçici ve Yıllık Gelir Vergisi beyannamelerinin zorunlu damga vergilerinin aylık ortalamasıdır.</span></td>
                      </tr>
                      <tr>
                        <td class="p-2 border-b border-gray-300 dark:border-gray-700 dark:text-gray-100"><input type="checkbox" id="digerGiderlerCheck" ${
                          this.state.isDigerGiderlerEnabled ? "checked" : ""
                        } class="border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400"></td>
                        <td class="p-2 border-b border-gray-300 dark:border-gray-700 dark:text-gray-100">Diğer Sabit Giderler</td>
                        <td class="p-2 border-b border-gray-300 dark:border-gray-700 dark:text-gray-100"><input type="number" id="digerGiderlerInput" value="${
                          this.state.baseAylikDigerSabitGiderlerTRY
                        }" class="w-28 border border-gray-300 dark:border-gray-600 rounded p-1 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"> (Aylık Ortalama, TRY)</td>
                        <td class="p-2 border-b border-gray-300 dark:border-gray-700 dark:text-gray-100" title="Yıllık oda aidatı, e-imza yenileme gibi diğer zorunlu idari masrafların aylık ortalamasıdır."><span class="cursor-help">Yıllık oda aidatı, e-imza yenileme gibi diğer zorunlu idari masrafların aylık ortalamasıdır.</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div class="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-700">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-gray-600 dark:text-gray-300">${timeLabel} Şirket Gideri</span>
                                <span class="font-semibold text-green-700 dark:text-green-400">${this.formatCurrency(
                    this.state.currentCurrency === "TRY"
                      ? giderToplamiAylik * (this.state.currentMode === "yearly" ? 12 : 1)
                      : (giderToplamiAylik * (this.state.currentMode === "yearly" ? 12 : 1)) / this.state.usdRate,
                    this.state.currentCurrency
                  )}</span>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Değişken</div>
              </div>
                        <div class="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                  ${this.state.currentMode === "yearly" ? "Yıllık Bağ-Kur Primi" : "Aylık Bağ-Kur Primi"}
                                  <span
                                    class="inline-flex items-center justify-center text-base cursor-pointer transition-transform duration-150 select-none w-5 h-5 rounded-full text-gray-600 dark:text-gray-400 inline-block hover:scale-105 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-1"
                                    data-tooltip="${this.state.currentMode === "yearly" ? "Bu tutar, tüm yıl boyunca ödenecek toplam Bağ-Kur primidir (12 aylık). Prime Esas Kazanç (PEK) tutarının, 5 puanlık indirim uygulanmış halidir (PEK x %29,5). Her ay bu tutarın 1/12'si kadar prim ödenir." : "Bu tutar, her ay Bağ-Kur'a ödenecek primdir. 'Emeklilik Eşdeğerliği' için seçtiğiniz Prime Esas Kazanç (PEK) tutarının, 5 puanlık indirim uygulanmış halidir (PEK x %29,5). Bağ-Kur primi aylık ödeme yapılır (her ay sonunda)."}"
                                  >ℹ️</span>
                                </span>
                                <span class="font-semibold text-blue-600 dark:text-blue-400">${this.formatCurrency(
                                  this.state.currentCurrency === "TRY"
                                    ? detailedBreakdown.bagkurPrimi / divisor
                                    : detailedBreakdown.bagkurPrimi /
                                        divisor /
                                        this.state.usdRate,
                                  this.state.currentCurrency
                                )}</span>
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">PEK x %29,5</div>
                        </div>
                        <div class="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                  ${this.state.currentMode === "yearly" ? "Yıllık Gelir Vergisi" : "Aylık Ortalama Vergi Yükü"}
                                  <span
                                    class="inline-flex items-center justify-center text-base cursor-pointer transition-transform duration-150 select-none w-5 h-5 rounded-full text-gray-600 dark:text-gray-400 inline-block hover:scale-105 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-1"
                                    data-tooltip="${this.state.currentMode === "yearly" ? "Bu tutar, tüm yıl boyunca ödenecek toplam gelir vergisidir. Şahıs şirketleri vergiyi yıl içinde 3 ayda bir (Mayıs, Ağustos, Kasım) 'Geçici Vergi' olarak toplu öder. Yıl sonunda (Mart ayında) nihai hesaplama yapılır." : "NAKİT AKIŞI UYARISI: Bu rakam, hesaplanan toplam yıllık verginin 12'ye bölünmüş ortalamasıdır.<br><br>Şahıs şirketleri vergiyi aylık ödemez. Yıl içinde 3 ayda bir (Mayıs, Ağustos, Kasım aylarında) kârınız üzerinden 'Geçici Vergi' adı altında toplu ödeme yaparsınız.<br><br>Bu tutarı her ay biriktirmeniz gereken bir fondur."}"
                                  >ℹ️</span>
                                </span>
                                <span class="font-semibold text-orange-600 dark:text-orange-400">${this.formatCurrency(
                                  this.state.currentCurrency === "TRY"
                                    ? detailedBreakdown.gelirVergisi / divisor
                                    : detailedBreakdown.gelirVergisi /
                                        divisor /
                                        this.state.usdRate,
                                  this.state.currentCurrency
                                )}</span>
                            </div>
                            <div class="text-xs text-gray-500">Nihai Dilim: ${
                              detailedBreakdown.gelirVergisiDilimi
                            }</div>
                        </div>
                    </div>
                    <div class="mt-3 p-3 bg-gray-100 rounded-lg border">
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-gray-700">${timeLabel} Toplam Gider:</span>
                            <span class="font-bold text-red-700">${this.formatCurrency(
                              this.state.currentCurrency === "TRY"
                                ? detailedBreakdown.toplamKesinti / divisor
                                : detailedBreakdown.toplamKesinti /
                                    divisor /
                                    this.state.usdRate,
                              this.state.currentCurrency
                            )}</span>
                        </div>
                    </div>
                </div>`;
      }

  return `<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow p-6" id="${cardId}" data-model-type="${title.includes('Model A') ? 'model-a' : 'model-b'}">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">${title}</h3>
                <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${netGelirEtiketi}</p>
                        <p id="${cardId}-net-gelir" class="text-2xl font-bold text-green-600 dark:text-green-400">${this.formatCurrency(
                          displayNet,
                          this.state.currentCurrency
                        )}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">${timeLabel} Toplam Prim Gideri</p>
                        <p id="${cardId}-prim-gideri" class="text-2xl font-bold text-red-500 dark:text-red-400">${this.formatCurrency(
                          displayPrim,
                          this.state.currentCurrency
                        )}</p>
                        ${
                          title.includes("Model B") &&
                          this.elements.sgkMuafiyetiCheck?.checked
                            ? '<p class="text-xs text-green-600 dark:text-green-400 mt-1">🛡️ SGK Muafiyeti Aktif</p>'
                            : ""
                        }
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${timeLabel} Vergi Yükü</p>
                        <p id="${cardId}-vergi-yuku" class="text-2xl font-bold text-orange-500 dark:text-orange-400">${this.formatCurrency(
                          displayVergi,
                          this.state.currentCurrency
                        )}</p>
                    </div>
                </div>
                ${modelAOptionsHTML}
                ${modelBOptionsHTML}
                ${tceHTML}
                ${detailedBreakdownHTML}
                <div class="mt-4">
                    <p class="text-sm text-gray-500 text-center">Gelire Oranla Net Kârlılık</p>
                    <div class="h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative shadow-[inset_0_2px_4px_0_rgb(0_0_0_/_0.06)] mt-2">
                      <div class="level-bar level-${scoreLevel} h-full transition-all duration-300 ease-out text-right pr-[10px] text-white font-semibold text-xs leading-6 relative overflow-hidden" style="width: ${score}%">${scoreText}</div>
                    </div>
                </div>
                ${tesvikNotlari}
                ${sgkDetayHTML}
            </div>`;
    } catch (e) {
      console.error("Result Card Error:", e);
      return `<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 text-red-500 dark:text-red-400">Sonuçlar görüntülenemedi. Lütfen değerleri kontrol edin.</div>`;
    }
  }

  // Selective Update Helper Methods
  /**
   * Update display values in result cards without full rebuild
   * @param {string} modelType - 'model-a' or 'model-b'
   * @param {Object} values - Object with net, prim, vergi values
   */
  updateResultCardDisplay(modelType, values) {
    const cardId = modelType === 'model-a' ? 'model-a-card' : 'model-b-card';
    const card = document.getElementById(cardId);
    
    if (!card) {
      // Card doesn't exist yet, need full rebuild
      return false;
    }

    const divisor = this.state.currentMode === "yearly" ? 1 : 12;
    const currency = this.state.currentCurrency;

    // Update net gelir
    if (values.net !== undefined) {
      const displayNet = currency === "TRY"
        ? values.net / divisor
        : values.net / divisor / this.state.usdRate;
      const netElement = card.querySelector(`#${cardId}-net-gelir`);
      if (netElement) {
        netElement.textContent = this.formatCurrency(displayNet, currency);
      }
    }

    // Update prim gideri
    if (values.prim !== undefined) {
      const displayPrim = currency === "TRY"
        ? values.prim / divisor
        : values.prim / divisor / this.state.usdRate;
      const primElement = card.querySelector(`#${cardId}-prim-gideri`);
      if (primElement) {
        primElement.textContent = this.formatCurrency(displayPrim, currency);
      }
    }

    // Update vergi yuku
    if (values.vergi !== undefined) {
      const displayVergi = currency === "TRY"
        ? values.vergi / divisor
        : values.vergi / divisor / this.state.usdRate;
      const vergiElement = card.querySelector(`#${cardId}-vergi-yuku`);
      if (vergiElement) {
        vergiElement.textContent = this.formatCurrency(displayVergi, currency);
      }
    }

    // Update TCE for Model A
    if (modelType === 'model-a' && values.brut !== undefined && values.tce !== undefined) {
      const displayBrut = currency === "TRY"
        ? values.brut / divisor
        : values.brut / divisor / this.state.usdRate;
      const displayTCE = currency === "TRY"
        ? values.tce / divisor
        : values.tce / divisor / this.state.usdRate;
      
      const brutElement = card.querySelector(`#${cardId}-brut-maas`);
      if (brutElement) {
        brutElement.textContent = this.formatCurrency(displayBrut, currency);
      }
      
      const tceElement = card.querySelector(`#${cardId}-tce`);
      if (tceElement) {
        tceElement.textContent = this.formatCurrency(displayTCE, currency);
      }
    }

    return true; // Successfully updated
  }

  /**
   * Check if result cards exist and can be selectively updated
   * @returns {boolean} True if cards exist and selective update is possible
   */
  canSelectiveUpdate() {
    const modelACard = document.getElementById('model-a-card');
    const modelBCard = document.getElementById('model-b-card');
    return !!(modelACard && modelBCard);
  }

  // Template Cache Methods
  /**
   * Get cached HTML template or create and cache it
   * @param {string} templateKey - Unique key for the template
   * @param {Function} templateFn - Function that generates the template
   * @returns {string} Cached or generated template
   */
  getTemplate(templateKey, templateFn) {
    if (!this._htmlTemplateCache[templateKey]) {
      this._htmlTemplateCache[templateKey] = templateFn();
    }
    return this._htmlTemplateCache[templateKey];
  }

  /**
   * Clear HTML template cache
   * @param {string|null} templateKey - If provided, clear only this template. Otherwise clear all.
   */
  clearTemplateCache(templateKey = null) {
    if (templateKey) {
      delete this._htmlTemplateCache[templateKey];
    } else {
      this._htmlTemplateCache = {};
    }
  }

  // State management methods
  updateBaseValuesFromInputs() {
    const netMaasVal = parseFloat(this.elements.netMaasInput.value);
    const MAX_AYLIK_NET_MAAS = 1000000000; // 1 milyar TL maksimum limit
    let validNetMaas = isNaN(netMaasVal) ? 0 : netMaasVal;
    
    // Yıllık modda kontrol
    if (this.state.currentMode === "yearly") {
      validNetMaas = validNetMaas / 12;
    }
    
    // Maksimum değer kontrolü
    if (validNetMaas > MAX_AYLIK_NET_MAAS) {
      validNetMaas = MAX_AYLIK_NET_MAAS;
      // Input değerini de güncelle
      const displayValue = this.state.currentMode === "yearly" 
        ? MAX_AYLIK_NET_MAAS * 12 
        : MAX_AYLIK_NET_MAAS;
      this.elements.netMaasInput.value = Math.round(displayValue);
      // Kullanıcıyı bilgilendir
      console.warn(`Maksimum aylık net maaş limiti: ₺${MAX_AYLIK_NET_MAAS.toLocaleString('tr-TR')}`);
    }
    
    this.state.baseAylikNetMaasTRY = validNetMaas < 0 ? 0 : validNetMaas;

    const bagkurVal = parseFloat(this.elements.bagkurPrimiInput.value);
    this.state.baseAylikBagkurPekTRY = isNaN(bagkurVal)
      ? 0
      : this.state.currentMode === "yearly"
      ? bagkurVal / 12
      : bagkurVal;
  }

  updateInputDisplays(yillikBrutMaas = null) {
    const timeMultiplier = this.state.currentMode === "yearly" ? 12 : 1;

    this.elements.netMaasInput.value = Math.round(
      this.state.baseAylikNetMaasTRY * timeMultiplier
    );
    // giderInput removed

    // Correct gross salary calculation - dual-engine inconsistency resolved
    let yillikBrut;
    if (yillikBrutMaas !== null) {
      // Correct engine: Parameter value
      yillikBrut = yillikBrutMaas;
    } else if (this.state.dogru_yillik_brut_maas) {
      // Correct engine: Value calculated from sgkSabitNetData from updateUI
      yillikBrut = this.state.dogru_yillik_brut_maas;
    } else {
      // Fallback: Legacy incorrect engine (initialization state only)
      yillikBrut = this.calculateBrutFromNet(
        this.state.baseAylikNetMaasTRY * 12
      );
    }

    // Calculate the value to show based on comparison mode
    let valueToShow;
    if (this.state.comparisonBasis === "tceEquivalence" && yillikBrut > 0) {
      // TCE mode: show total cost to employer with percentage applied
      const tceData = this.calculateTotalCostToEmployer(yillikBrut);
      valueToShow =
        (tceData.totalCost * (this.state.tcePercentage / 100) / 12) *
        timeMultiplier;
    } else {
      // Default mode: show gross salary
      valueToShow = (yillikBrut / 12) * timeMultiplier;
    }

    // hesaplananBrutInput field removed - no longer needed since comparison basis is in Model B card
    // if (this.elements.hesaplananBrutInput) {
    //   this.elements.hesaplananBrutInput.value = this.formatCurrency(
    //     this.state.currentCurrency === "TRY"
    //       ? valueToShow
    //       : valueToShow / this.state.usdRate,
    //     this.state.currentCurrency
    //   );
    // }

    this.updateBagkurSliderLimits();

    this.elements.bagkurPrimiInput.value = Math.round(
      this.state.baseAylikBagkurPekTRY * timeMultiplier
    );
    this.elements.bagkurPrimLabel.textContent = this.formatCurrency(
      this.elements.bagkurPrimiInput.value,
      "TRY"
    );
  }

  setMode(newMode) {
    if (this.state.currentMode === newMode) return;
    this.state.currentMode = newMode;
    // Update toggle button styles with Tailwind classes
    if (newMode === "monthly") {
      this.elements.aylikBtn.className = "px-3 py-1 text-sm font-semibold rounded-md transition-colors bg-blue-600 dark:bg-blue-700 text-white shadow-sm";
      this.elements.yillikBtn.className = "px-3 py-1 text-sm font-semibold rounded-md transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600";
      this.elements.aylikBtn.setAttribute("aria-pressed", "true");
      this.elements.yillikBtn.setAttribute("aria-pressed", "false");
    } else {
      this.elements.aylikBtn.className = "px-3 py-1 text-sm font-semibold rounded-md transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600";
      this.elements.yillikBtn.className = "px-3 py-1 text-sm font-semibold rounded-md transition-colors bg-blue-600 dark:bg-blue-700 text-white shadow-sm";
      this.elements.aylikBtn.setAttribute("aria-pressed", "false");
      this.elements.yillikBtn.setAttribute("aria-pressed", "true");
    }
    this.elements.modeLabels.forEach((label) => {
      label.textContent = newMode === "yearly" ? "Yıllık" : "Aylık";
    });
    // Net maaş input max değerini güncelle
    const MAX_AYLIK_NET_MAAS = 1000000000; // 1 milyar TL
    this.elements.netMaasInput.max = newMode === "yearly" 
      ? MAX_AYLIK_NET_MAAS * 12 
      : MAX_AYLIK_NET_MAAS;
    this.updateInputDisplays();
    this.updateUI();
  }

  setCurrency(newCurrency) {
    if (this.state.currentCurrency === newCurrency) return;
    this.state.currentCurrency = newCurrency;
    // Update toggle button styles with Tailwind classes
    if (newCurrency === "TRY") {
      this.elements.tryBtn.className = "px-2 py-1 text-xs font-semibold rounded-md transition-colors bg-blue-600 dark:bg-blue-700 text-white shadow-sm";
      this.elements.usdBtn.className = "px-2 py-1 text-xs font-semibold rounded-md transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600";
      this.elements.tryBtn.setAttribute("aria-pressed", "true");
      this.elements.usdBtn.setAttribute("aria-pressed", "false");
    } else {
      this.elements.tryBtn.className = "px-2 py-1 text-xs font-semibold rounded-md transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600";
      this.elements.usdBtn.className = "px-2 py-1 text-xs font-semibold rounded-md transition-colors bg-blue-600 dark:bg-blue-700 text-white shadow-sm";
      this.elements.tryBtn.setAttribute("aria-pressed", "false");
      this.elements.usdBtn.setAttribute("aria-pressed", "true");
    }
    this.elements.currencyLabels.forEach((label) => {
      label.textContent = newCurrency;
    });
    this.updateInputDisplays();
    this.updateUI();
  }

  setComparisonBasis(newBasis) {
    if (this.state.comparisonBasis === newBasis) return;
    this.state.comparisonBasis = newBasis;

    // Update button states in header (if they exist)
    if (this.elements.brutBasisBtn) {
      this.elements.brutBasisBtn.classList.toggle(
        "active",
        newBasis === "grossEquivalence"
      );
    }
    if (this.elements.tceBasisBtn) {
      this.elements.tceBasisBtn.classList.toggle(
        "active",
        newBasis === "tceEquivalence"
      );
    }

    // Update button states in Model B card (dynamically rendered)
    const resultsPanel = this.elements.resultsPanel;
    if (resultsPanel) {
      const comparisonButtons = resultsPanel.querySelectorAll('.comparison-basis-btn');
      comparisonButtons.forEach((btn) => {
        const btnBasis = btn.getAttribute('data-comparison-basis');
        if (btnBasis === newBasis) {
          btn.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
          btn.classList.add('bg-blue-600', 'text-white');
        } else {
          btn.classList.remove('bg-blue-600', 'text-white');
          btn.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
        }
      });

      // Show/hide TCE percentage panel in Model B card
      const tcePanels = resultsPanel.querySelectorAll('.tce-percentage-panel');
      tcePanels.forEach((panel) => {
        if (newBasis === "tceEquivalence") {
          panel.classList.remove("hidden");
        } else {
          panel.classList.add("hidden");
        }
      });
    }

    // Show/hide TCE percentage panel in header (if it exists)
    if (this.elements.tcePercentagePanel) {
      if (newBasis === "tceEquivalence") {
        this.elements.tcePercentagePanel.classList.remove("hidden");
      } else {
        this.elements.tcePercentagePanel.classList.add("hidden");
      }
    }

    // Label update removed - hesaplananBrutInput field is no longer displayed

    // Update input field value immediately to reflect new comparison basis
    this.updateInputDisplays();
    this.updateUI();
  }

  updateBagkurSliderLimits() {
    const timeDivisor = this.state.currentMode === "yearly" ? 1 : 12;
    this.elements.bagkurPrimiInput.min = Math.round(
      this.constants.YILLIK_MIN_BAGKUR_KAZANCI / timeDivisor
    );
    this.elements.bagkurPrimiInput.max = Math.round(
      this.constants.YILLIK_MAX_BAGKUR_KAZANCI / timeDivisor
    );
  }

  setSmartBagkurValue(guncelYillikBrut = null) {
    // Use correct gross salary for retirement equivalency
    let yillikBrut;
    if (guncelYillikBrut) {
      // Current (increased) gross salary from updateUI
      yillikBrut = guncelYillikBrut;
    } else {
      // Fallback: Calculate base (non-increased) gross salary
      yillikBrut = this.calculateBrutFromNet(
        this.state.baseAylikNetMaasTRY * 12
      );
    }

    try {
      const aylikBrut = yillikBrut / 12;
      const min = this.constants.YILLIK_MIN_BAGKUR_KAZANCI / 12;
      const max = this.constants.YILLIK_MAX_BAGKUR_KAZANCI / 12;
      this.state.baseAylikBagkurPekTRY = Math.round(
        Math.max(min, Math.min(max, aylikBrut))
      );

      // Update input field after state update
      const timeMultiplier = this.state.currentMode === "yearly" ? 12 : 1;
      this.elements.bagkurPrimiInput.value = Math.round(
        this.state.baseAylikBagkurPekTRY * timeMultiplier
      );
      this.elements.bagkurPrimLabel.textContent = this.formatCurrency(
        this.elements.bagkurPrimiInput.value,
        "TRY"
      );
    } catch (error) {
      console.warn("Bağ-Kur hesaplaması hatası:", error);
      this.state.baseAylikBagkurPekTRY =
        this.constants.YILLIK_MIN_BAGKUR_KAZANCI / 12;

      // Hata durumunda da input alanını güncelle
      const timeMultiplier = this.state.currentMode === "yearly" ? 12 : 1;
      this.elements.bagkurPrimiInput.value = Math.round(
        this.state.baseAylikBagkurPekTRY * timeMultiplier
      );
      this.elements.bagkurPrimLabel.textContent = this.formatCurrency(
        this.elements.bagkurPrimiInput.value,
        "TRY"
      );
    }
  }

  // Helper methods for inline event handlers
  handleZamEtkisiChange() {
    if (this.elements.zamEtkisiCheck) {
      // Clear all calculation state when salary increase status changes
      // This ensures both Bağ-Kur PEK and Model B calculations return to correct values
      this.state.dogru_yillik_brut_maas = null;

      // Update Bağ-Kur value as well
      if (this.elements.matchSgkPrimCheck?.checked) {
        this.setSmartBagkurValue();
      }

      this.updateUI();
    }
  }

  handleMatchSgkPrimChange() {
    if (this.elements.matchSgkPrimCheck && this.elements.bagkurPrimiInput) {
      this.elements.bagkurPrimiInput.disabled =
        this.elements.matchSgkPrimCheck.checked;
      if (this.elements.matchSgkPrimCheck.checked) {
        this.setSmartBagkurValue();
        this.updateUI();
      } else {
        this.updateUI();
      }
    }
  }

  // Event binding
  bindEvents() {
    // Input change events
    [
      this.elements.sgkMuafiyetiCheck,
      this.elements.gencGirisimciVergiCheck,
      this.elements.gencGirisimciPrimCheck,
      this.elements.hizmetIhracatiCheck,
    ].forEach((input) => {
      input.addEventListener("input", () => {
        this.updateBaseValuesFromInputs();
        this.updateUI();
      });
      input.addEventListener("change", () => {
        this.updateBaseValuesFromInputs();
        this.updateUI();
      });
    });

    // Salary increase effects
    if (this.elements.zamEtkisiCheck) {
      this.elements.zamEtkisiCheck.addEventListener("change", () => {
        this.handleZamEtkisiChange();
      });
    }

    // Salary increase parameters
    [this.elements.zamOrani, this.elements.zamAyi].forEach((input) => {
      if (input) {
        input.addEventListener("input", () => {
          // Clear state when salary increase parameters change
          this.state.dogru_yillik_brut_maas = null;
          this.updateUI();
        });
        input.addEventListener("change", () => {
          // Clear state when salary increase parameters change
          this.state.dogru_yillik_brut_maas = null;
          this.updateUI();
        });
      }
    });

    // Net salary input
    this.elements.netMaasInput.addEventListener("input", () => {
      this.updateBaseValuesFromInputs();
      if (this.elements.matchSgkPrimCheck.checked) {
        this.setSmartBagkurValue();
      }
      // Race condition fix: updateInputDisplays() call removed
      // Already called with correct parameters at the end of updateUI()
      this.updateUI();
    });

    // Bagkur premium input
    // Use change event for Bağ-Kur slider to avoid UI freeze during dragging
    // Input event will be handled separately for visual updates only
    this.elements.bagkurPrimiInput.addEventListener("change", () => {
      this.updateBaseValuesFromInputs();
      // Race condition fix: updateInputDisplays() call removed
      this.updateUI();
    });
    
    // Handle input event for real-time label update without full recalculation
    this.elements.bagkurPrimiInput.addEventListener("input", () => {
      // Update label immediately for visual feedback
      if (this.elements.bagkurPrimLabel) {
        const timeMultiplier = this.state.currentMode === "yearly" ? 12 : 1;
        const displayValue = parseFloat(this.elements.bagkurPrimiInput.value) * timeMultiplier;
        this.elements.bagkurPrimLabel.textContent = this.formatCurrency(displayValue, "TRY");
      }
      
      // Debounce full recalculation - update after user stops dragging
      this.debounce('bagkurInput', () => {
        this.updateBaseValuesFromInputs();
        this.updateUI();
      }, 300);
    });

    // Match SGK premium checkbox
    this.elements.matchSgkPrimCheck.addEventListener("change", () => {
      this.handleMatchSgkPrimChange();
    });

    // Mode and currency buttons
    this.elements.aylikBtn.addEventListener("click", () =>
      this.setMode("monthly")
    );
    this.elements.yillikBtn.addEventListener("click", () =>
      this.setMode("yearly")
    );
    this.elements.tryBtn.addEventListener("click", () =>
      this.setCurrency("TRY")
    );
    this.elements.usdBtn.addEventListener("click", () =>
      this.setCurrency("USD")
    );

    // Comparison basis buttons (handled via event delegation for Model B card, but keep for header if exists)
    if (this.elements.brutBasisBtn) {
      this.elements.brutBasisBtn.addEventListener("click", () =>
        this.setComparisonBasis("grossEquivalence")
      );
    }
    if (this.elements.tceBasisBtn) {
      this.elements.tceBasisBtn.addEventListener("click", () =>
        this.setComparisonBasis("tceEquivalence")
      );
    }

    // TCE Percentage Input
    if (this.elements.tcePercentageInput) {
      this.elements.tcePercentageInput.addEventListener("blur", (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 200) val = 200;
        this.state.tcePercentage = val;
        e.target.value = val;
        // Reflect change in UI and calculated displays
        this.updateInputDisplays();
        this.updateUI();
      });

      this.elements.tcePercentageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.target.blur();
        }
      });
    }

    // TES Reformu checkbox
    if (this.elements.tesReformuUygulaCheck) {
      this.elements.tesReformuUygulaCheck.addEventListener("change", () => {
        // Clear calculation state to force recalculation with new TES settings
        this.state.dogru_yillik_brut_maas = null;
        this.updateBaseValuesFromInputs();
        // Bağ-Kur PEK will be updated in updateUI if retirement equivalency is enabled
        this.updateUI();
      });
    }

    // Accordion functionality - Hybrid Implementation
    this.elements.accordionContainer.addEventListener("click", (event) => {
      const button = event.target.closest(".accordion-button");
      if (!button) return;

      const content = button.nextElementSibling;
      const svg = button.querySelector("svg");
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      const newState = !isExpanded;

      // Update ARIA expanded state for accessibility
      button.setAttribute("aria-expanded", newState);

      // Update content state using data attribute
      content.setAttribute("data-expanded", newState);

      // Update SVG rotation with Tailwind class
      if (newState) {
        svg.classList.add("rotate-180");
      } else {
        svg.classList.remove("rotate-180");
      }

      // Set maxHeight for smooth animation
      if (newState) {
        content.style.maxHeight = content.scrollHeight + "px";
      } else {
        content.style.maxHeight = "0px";
      }
    });
  }

  // Initialization
  initialize() {
    // Show default exchange rate immediately
    this.updateExchangeRateDisplay(true);

    // Fetch real exchange rate in background
    this.fetchExchangeRates();

    this.state.currentMode = "monthly";
    this.state.currentCurrency = "TRY";

    // Set initial toggle button states with Tailwind classes
    this.elements.aylikBtn.className = "px-3 py-1 text-sm font-semibold rounded-md transition-colors bg-blue-600 dark:bg-blue-700 text-white shadow-sm";
    this.elements.yillikBtn.className = "px-3 py-1 text-sm font-semibold rounded-md transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600";
    this.elements.tryBtn.className = "px-2 py-1 text-xs font-semibold rounded-md transition-colors bg-blue-600 dark:bg-blue-700 text-white shadow-sm";
    this.elements.usdBtn.className = "px-2 py-1 text-xs font-semibold rounded-md transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600";
    // Comparison basis buttons are now in Model B card, only update if they exist in header
    if (this.elements.brutBasisBtn) {
      this.elements.brutBasisBtn.classList.add("active");
    }
    if (this.elements.tceBasisBtn) {
      this.elements.tceBasisBtn.classList.remove("active");
    }

    // Initialize TCE percentage input and hide panel
    if (this.elements.tcePercentageInput) {
      this.elements.tcePercentageInput.value = this.state.tcePercentage;
    }
    if (this.elements.tcePercentagePanel) {
      this.elements.tcePercentagePanel.classList.add("hidden");
    }

    this.elements.modeLabels.forEach((label) => {
      label.textContent = "Aylık";
    });
    this.elements.currencyLabels.forEach((label) => {
      label.textContent = "TRY";
    });

    this.elements.netMaasInput.value = 100000;

    if (this.elements.zamEtkisiCheck) {
      this.elements.zamEtkisiCheck.checked = false;
      this.elements.zamDetayPanel.classList.add("hidden");
      this.elements.zamOrani.value = 20;
      this.elements.zamAyi.value = 7;
    }

    this.elements.matchSgkPrimCheck.checked = true;
    this.elements.bagkurPrimiInput.disabled = true;

    // Genç Girişimci özellikleri varsayılan olarak kapalı
    if (this.elements.gencGirisimciVergiCheck) {
      this.elements.gencGirisimciVergiCheck.checked = false;
    }
    if (this.elements.gencGirisimciPrimCheck) {
      this.elements.gencGirisimciPrimCheck.checked = false;
    }

    this.updateBaseValuesFromInputs();
    this.setSmartBagkurValue();
    // Race condition fix: updateInputDisplays() call removed
    // Already called with correct parameters at the end of updateUI()
    this.initializeAccordion();
    this.updateUI();
  }
}

// Global function for SGK detail toggle (called from HTML)
window.toggleSGKDetay = function (button) {
  const detayPanel = button.parentElement.querySelector(".sgk-detay-panel");
  if (detayPanel.classList.contains("hidden")) {
    detayPanel.classList.remove("hidden");
    button.textContent = "📉 Aylık Detayları Gizle";
  } else {
    detayPanel.classList.add("hidden");
    button.textContent = "📈 Aylık Detayları Göster";
  }
};

 // Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.calculator = new SalaryCalculator();
  initializeTooltipModal();
  initializeDarkMode();
});

// Tooltip Modal functionality
function initializeTooltipModal() {
  const modal = document.getElementById('tooltipModal');
  const modalBody = modal.querySelector('.tooltip-modal-body');
  // Close button is the first button in the modal content div
  const closeBtn = modal.querySelector('button[aria-label="Kapat"]');
  // Overlay is the first div inside modal
  const overlay = modal.querySelector('div[class*="bg-black"]');

  function openModal(text) {
    modalBody.innerHTML = text;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // Use event delegation to handle dynamically added icons
  // Look for info icons by data-tooltip attribute instead of class
  document.addEventListener('click', (e) => {
    const icon = e.target.closest('[data-tooltip]');
    if (icon) {
      e.preventDefault();
      e.stopPropagation();
      const tooltipText = icon.getAttribute('data-tooltip');
      if (tooltipText) {
        openModal(tooltipText);
      }
    }
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

// Dark Mode functionality
function initializeDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');
  
  if (!darkModeToggle) return;
  
  // Check for saved theme preference, default to light mode
  const getThemePreference = () => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    // Default to light mode (don't follow system preference on first load)
    return false;
  };
  
  // Apply theme
  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      if (sunIcon) {
        sunIcon.classList.remove('hidden');
      }
      if (moonIcon) {
        moonIcon.classList.add('hidden');
      }
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      if (sunIcon) {
        sunIcon.classList.add('hidden');
      }
      if (moonIcon) {
        moonIcon.classList.remove('hidden');
      }
      localStorage.setItem('theme', 'light');
    }
  };
  
  // Initialize theme
  const isDark = getThemePreference();
  applyTheme(isDark);
  
  // Toggle theme on button click
  darkModeToggle.addEventListener('click', () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    applyTheme(!isCurrentlyDark);
  });
}
