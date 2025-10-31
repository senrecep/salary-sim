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

    this.bindEvents();
    this.initialize();
  }

  initializeElements() {
    return {
      netMaasInput: document.getElementById("netMaasInput"),
      hesaplananBrutInput: document.getElementById("hesaplananBrutInput"),
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
    const formatter =
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

    return formatter.format(amount);
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
    if (isNaN(hedefAylikNetMaas) || hedefAylikNetMaas <= 0) {
      return { toplamVergi: 0, aylikDetay: [] };
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

    return {
      toplamVergi: toplamYillikVergi,
      aylikDetay: aylikDetay,
      ortalamaNeto:
        aylikDetay.reduce((sum, item) => sum + item.netMaas, 0) / 12,
      yilSonuDilimi: aylikDetay[11].vergiDilimi,
      toplamYillikBrut: toplamYillikBrut,
      zamParametreleri: zamParametreleri,
    };
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
    if (isNaN(yillikBrutMaas) || yillikBrutMaas <= 0) {
      return { totalCost: 0, employerPremiums: 0, brutMaas: 0 };
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

    return { totalCost, employerPremiums, brutMaas: yillikBrutMaas };
  }

  calculateBrutFromNet(yillikNet) {
    if (yillikNet <= 0) return 0;
    let low = yillikNet;
    let high = yillikNet * 2;
    let brutGuess = 0;

    for (let i = 0; i < 50; i++) {
      brutGuess = (low + high) / 2;
      let calculatedNet = this.calculateNetFromBrut(brutGuess);
      if (Math.abs(calculatedNet - yillikNet) < 1) {
        return brutGuess;
      }
      if (calculatedNet < yillikNet) {
        low = brutGuess;
      } else {
        high = brutGuess;
      }
    }
    return brutGuess;
  }

  // UI Methods
  updateUI() {
    try {
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
          '<div class="card p-6 text-gray-500 text-center">Lütfen geçerli bir maaş değeri girin.</div>';
        return;
      }

      const yillikBrutMaas = this.calculateBrutFromNet(yillikNetMaas);
      const yillikGiderTRY = this.state.baseAylikGiderTRY * 12;
      const yillikBagkurKazanciTRY = this.state.baseAylikBagkurPekTRY * 12;

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
        null, // tceData
        detailedBreakdownB
      );

      // Gider detayları tablosu renderlandıktan sonra eventleri bağla
      this.bindGiderDetaylariEvents();

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

      // Update Bağ-Kur value based on current gross salary if retirement equivalency is selected
      // Update input fields with correct annual gross salary (fixes dual-engine inconsistency)
      this.updateInputDisplays(yillikBrutMaasYeni);

      if (this.elements.matchSgkPrimCheck.checked) {
        this.setSmartBagkurValue(yillikBrutMaasYeni);
      }
    } catch (e) {
      console.error("UI Update failed:", e);
      this.elements.resultsPanel.innerHTML = `<div class="card p-6 text-red-500 text-center">Hesaplama sırasında bir hata oluştu. Lütfen girdileri kontrol ediniz.</div>`;
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
    detailedBreakdown = null
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
        tesvikNotlari += `<p class="text-xs text-green-600 mt-2 text-center">Genç Girişimci Bağ-Kur Desteği uygulandı (${timeLabel} ~${this.formatCurrency(
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
        tesvikNotlari += `<p class="text-xs text-green-600 mt-1 text-center">Genç Girişimci Vergi İstisnası uygulandı (${timeLabel} ~${this.formatCurrency(
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
        tesvikNotlari += `<p class="text-xs text-blue-600 mt-1 text-center">Hizmet İhracatı İstisnası: ${timeLabel} ${this.formatCurrency(
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


      let sgkDetayHTML = "";
      if (sgkDetaylari && title.includes("Model A") && sgkDetaylari.ortalamaNeto !== undefined) {
        const displayOrtalamaNeto =
          this.state.currentCurrency === "TRY"
            ? sgkDetaylari.ortalamaNeto
            : sgkDetaylari.ortalamaNeto / this.state.usdRate;

        sgkDetayHTML = `
                    <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 class="text-sm font-semibold text-blue-800 mb-2">📊 SGK Aylık Dönem Analizi</h4>
                        <div class="text-xs text-gray-700 space-y-1">
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
                                ? `<p class="text-orange-600"><strong>⚠️ ${sgkDetaylari.zamParametreleri.baslangicAy}. aydan itibaren %${sgkDetaylari.zamParametreleri.oran} zam etkisi dahil!</strong></p>`
                                : ""
                            }
                        </div>
                        <button class="text-xs text-blue-600 underline mt-2" onclick="window.toggleSGKDetay(this)">
                            📈 Aylık Detayları Göster
                        </button>
                        <div class="sgk-detay-panel hidden mt-3">
                            <div class="max-h-48 overflow-y-auto text-xs">
                                <table class="w-full border-collapse">
                                    <thead>
                                        <tr class="bg-blue-100">
                                            <th class="border text-left p-1">Ay</th>
                                            <th class="border text-right p-1">Brüt</th>
                                            <th class="border text-right p-1">Vergi</th>
                                            <th class="border text-right p-1">Net</th>
                                            <th class="border text-center p-1">Dilim</th>
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
            ? "bg-orange-100"
            : ay.ay % 2 === 0
            ? "bg-gray-50"
            : "";
          const zamIcon = ay.zamliAy ? " 📈" : "";

          sgkDetayHTML += `
                        <tr class="${rowClass}">
                            <td class="border p-1">${ay.ay}.${zamIcon}</td>
                            <td class="border text-right p-1">${this.formatCurrency(
                              displayBrut,
                              this.state.currentCurrency
                            )}</td>
                            <td class="border text-right p-1">${this.formatCurrency(
                              displayVergiAy,
                              this.state.currentCurrency
                            )}</td>
                            <td class="border text-right p-1">${this.formatCurrency(
                              displayNetAy,
                              this.state.currentCurrency
                            )}</td>
                            <td class="border text-center p-1">${
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
                <div class="mt-4 border-t pt-3">
                    <div class="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p class="text-sm text-gray-500">Brüt Maaş</p>
                            <p class="text-lg font-semibold text-gray-700">${this.formatCurrency(
                              brutMaas,
                              this.state.currentCurrency
                            )}</p>
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-blue-700">İşverene Toplam Maliyet</p>
                            <p class="text-2xl font-bold text-blue-600">${this.formatCurrency(
                              displayTCE,
                              this.state.currentCurrency
                            )}</p>
                        </div>
                    </div>
                </div>`;
      }

      // Add detailed breakdown section for Model A
      let detailedBreakdownHTML = "";
      if (detailedBreakdown && title.includes("Model A")) {
        detailedBreakdownHTML = `
                <div class="mt-4 border-t pt-3">
                    <h4 class="text-sm font-semibold text-gray-700 text-center mb-4">📋 Kesintiler ve Maliyetler</h4>
                    
                    <!-- Çalışan Kesintileri -->
                    <div class="mb-4">
                        <h5 class="text-xs font-semibold text-gray-600 mb-2">👤 Çalışan Kesintileri (Maaştan Düşenler)</h5>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div class="bg-red-50 p-3 rounded-lg border border-red-200">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-gray-600">SGK Primi</span>
                                    <span class="font-semibold text-red-600">${this.formatCurrency(
                                      this.state.currentCurrency === "TRY"
                                        ? detailedBreakdown.sgkPrimi / divisor
                                        : detailedBreakdown.sgkPrimi /
                                            divisor /
                                            this.state.usdRate,
                                      this.state.currentCurrency
                                    )}</span>
                                </div>
                                <div class="text-xs text-gray-500">%15</div>
                            </div>
                            <div class="bg-orange-50 p-3 rounded-lg border border-orange-200">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-gray-600">İşsizlik Sig.</span>
                                    <span class="font-semibold text-orange-600">${this.formatCurrency(
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
                            <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
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
                                <div class="text-xs text-gray-500">${
                                  detailedBreakdown.gelirVergisiDilimi
                                }</div>
                            </div>
                            <div class="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-gray-600">Damga Vergisi</span>
                                    <span class="font-semibold text-purple-600">${this.formatCurrency(
                                      this.state.currentCurrency === "TRY"
                                        ? detailedBreakdown.damgaVergisi / divisor
                                        : detailedBreakdown.damgaVergisi /
                                            divisor /
                                            this.state.usdRate,
                                      this.state.currentCurrency
                                    )}</span>
                                </div>
                                <div class="text-xs text-gray-500">%0.759</div>
                            </div>
                        </div>
                        <div class="mt-3 p-3 bg-gray-100 rounded-lg border">
                            <div class="flex justify-between items-center">
                                <span class="font-semibold text-gray-700">Toplam Kesinti:</span>
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
                    </div>

                    <!-- İşveren Maliyetleri -->
                    <div class="mt-4 pt-4 border-t">
                        <h5 class="text-xs font-semibold text-gray-600 mb-2">🏢 İşveren Maliyetleri (Brüt Maaş Dışında)</h5>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div class="bg-green-50 p-3 rounded-lg border border-green-200">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-gray-600">SGK İşveren Payı</span>
                                    <span class="font-semibold text-green-700">${this.formatCurrency(
                                      this.state.currentCurrency === "TRY"
                                        ? detailedBreakdown.sgkIsverenPayi / divisor
                                        : detailedBreakdown.sgkIsverenPayi /
                                            divisor /
                                            this.state.usdRate,
                                      this.state.currentCurrency
                                    )}</span>
                                </div>
                                <div class="text-xs text-gray-500">%15.75</div>
                            </div>
                            <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-gray-600">İşsizlik İşveren Payı</span>
                                    <span class="font-semibold text-yellow-700">${this.formatCurrency(
                                      this.state.currentCurrency === "TRY"
                                        ? detailedBreakdown.issizlikIsverenPayi / divisor
                                        : detailedBreakdown.issizlikIsverenPayi /
                                            divisor /
                                            this.state.usdRate,
                                      this.state.currentCurrency
                                    )}</span>
                                </div>
                                <div class="text-xs text-gray-500">%2</div>
                            </div>
                            ${detailedBreakdown.isTesEnabled && detailedBreakdown.tesIsverenPayi ? `
                            <div class="bg-amber-50 p-3 rounded-lg border border-amber-300">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-gray-600 flex items-center gap-1">
                                      TES İşveren Katkısı
                                      <span class="text-xs text-amber-700 bg-amber-100 px-1 rounded">2026</span>
                                    </span>
                                    <span class="font-semibold text-amber-700">${this.formatCurrency(
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
                        <div class="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
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
          <div class="mt-4 border-t pt-3">
            <h4 class="text-sm font-semibold text-gray-700 text-center mb-3">📋 Kesintiler</h4>
            <div class="mb-3">
              <button type="button" class="text-blue-700 text-sm font-semibold flex items-center gap-1 mx-auto outline-none" onclick="this.nextElementSibling.classList.toggle('hidden');this.querySelector('span').textContent = this.nextElementSibling.classList.contains('hidden') ? '[+]' : '[-]';">
                <span>[-]</span> Gider Detayları
              </button>
              <div class="mt-2" id="gider-detaylari-panel">
                <div class="overflow-x-auto">
                  <table class="min-w-full text-xs border rounded-lg bg-white">
                    <thead>
                      <tr class="bg-gray-50">
                        <th class="p-2 border-b text-left">Aktif</th>
                        <th class="p-2 border-b text-left">Etiket</th>
                        <th class="p-2 border-b text-left">Girdi Alanı</th>
                        <th class="p-2 border-b text-left">Bilgi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="p-2 border-b"><input type="checkbox" id="degiskenGiderCheck" ${
                          this.state.isDegiskenGiderEnabled ? "checked" : ""
                        }></td>
                        <td class="p-2 border-b">Değişken Giderler</td>
                        <td class="p-2 border-b"><input type="number" id="degiskenGiderInput" value="${
                          this.state.baseAylikDegiskenGiderTRY
                        }" class="w-20 border rounded p-1 text-xs"> (Aylık, TRY)</td>
                        <td class="p-2 border-b" title="Donanım, yazılım, seyahat gibi işinizle doğrudan ilgili, miktarı değişebilen harcamalarınız."><span class="cursor-help">Donanım, yazılım, seyahat gibi işinizle doğrudan ilgili, miktarı değişebilen harcamalarınız.</span></td>
                      </tr>
                      <tr>
                        <td class="p-2 border-b"><input type="checkbox" id="muhasebeciGiderCheck" ${
                          this.state.isMuhasebeciGiderEnabled ? "checked" : ""
                        }></td>
                        <td class="p-2 border-b">Muhasebeci Ücreti</td>
                        <td class="p-2 border-b"><input type="number" id="muhasebeciGiderInput" value="${
                          this.state.baseAylikMuhasebeciUcretiTRY
                        }" class="w-20 border rounded p-1 text-xs"> (Aylık, TRY)</td>
                        <td class="p-2 border-b" title="Mali müşavirinize ödediğiniz aylık standart hizmet bedeli. (Ortalama: 1.500-2.500 TL)"><span class="cursor-help">Mali müşavirinize ödediğiniz aylık standart hizmet bedeli. (Ortalama: 1.500-2.500 TL)</span></td>
                      </tr>
                      <tr>
                        <td class="p-2 border-b"><input type="checkbox" id="damgaVergisiCheck" ${
                          this.state.isDamgaVergisiEnabled ? "checked" : ""
                        }></td>
                        <td class="p-2 border-b">Damga Vergileri</td>
                        <td class="p-2 border-b"><input type="number" id="damgaVergisiInput" value="${
                          this.state.baseAylikDamgaVergileriTRY
                        }" class="w-20 border rounded p-1 text-xs"> (Aylık Ortalama, TRY)</td>
                        <td class="p-2 border-b" title="Yıl boyunca ödenen KDV, Muhtasar, Geçici ve Yıllık Gelir Vergisi beyannamelerinin zorunlu damga vergilerinin aylık ortalamasıdır."><span class="cursor-help">Yıl boyunca ödenen KDV, Muhtasar, Geçici ve Yıllık Gelir Vergisi beyannamelerinin zorunlu damga vergilerinin aylık ortalamasıdır.</span></td>
                      </tr>
                      <tr>
                        <td class="p-2 border-b"><input type="checkbox" id="digerGiderlerCheck" ${
                          this.state.isDigerGiderlerEnabled ? "checked" : ""
                        }></td>
                        <td class="p-2 border-b">Diğer Sabit Giderler</td>
                        <td class="p-2 border-b"><input type="number" id="digerGiderlerInput" value="${
                          this.state.baseAylikDigerSabitGiderlerTRY
                        }" class="w-20 border rounded p-1 text-xs"> (Aylık Ortalama, TRY)</td>
                        <td class="p-2 border-b" title="Yıllık oda aidatı, e-imza yenileme gibi diğer zorunlu idari masrafların aylık ortalamasıdır."><span class="cursor-help">Yıllık oda aidatı, e-imza yenileme gibi diğer zorunlu idari masrafların aylık ortalamasıdır.</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div class="bg-green-50 p-3 rounded-lg border border-green-200">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-gray-600">${timeLabel} Şirket Gideri</span>
                  <span class="font-semibold text-green-700">${this.formatCurrency(
                    this.state.currentCurrency === "TRY"
                      ? giderToplamiAylik * (this.state.currentMode === "yearly" ? 12 : 1)
                      : (giderToplamiAylik * (this.state.currentMode === "yearly" ? 12 : 1)) / this.state.usdRate,
                    this.state.currentCurrency
                  )}</span>
                </div>
                <div class="text-xs text-gray-500">Değişken</div>
              </div>
                        <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-gray-600 flex items-center gap-1">
                                  ${this.state.currentMode === "yearly" ? "Yıllık Bağ-Kur Primi" : "Aylık Bağ-Kur Primi"}
                                  <span
                                    class="info-icon text-blue-500 cursor-help inline-block"
                                    data-tooltip="${this.state.currentMode === "yearly" ? "Bu tutar, tüm yıl boyunca ödenecek toplam Bağ-Kur primidir (12 aylık). Prime Esas Kazanç (PEK) tutarının, 5 puanlık indirim uygulanmış halidir (PEK x %29,5). Her ay bu tutarın 1/12'si kadar prim ödenir." : "Bu tutar, her ay Bağ-Kur'a ödenecek primdir. 'Emeklilik Eşdeğerliği' için seçtiğiniz Prime Esas Kazanç (PEK) tutarının, 5 puanlık indirim uygulanmış halidir (PEK x %29,5). Bağ-Kur primi aylık ödeme yapılır (her ay sonunda)."}"
                                  >ℹ️</span>
                                </span>
                                <span class="font-semibold text-blue-600">${this.formatCurrency(
                                  this.state.currentCurrency === "TRY"
                                    ? detailedBreakdown.bagkurPrimi / divisor
                                    : detailedBreakdown.bagkurPrimi /
                                        divisor /
                                        this.state.usdRate,
                                  this.state.currentCurrency
                                )}</span>
                            </div>
                            <div class="text-xs text-gray-500">PEK x %29,5</div>
                        </div>
                        <div class="bg-orange-50 p-3 rounded-lg border border-orange-200">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-gray-600 flex items-center gap-1">
                                  ${this.state.currentMode === "yearly" ? "Yıllık Gelir Vergisi" : "Aylık Ortalama Vergi Yükü"}
                                  <span
                                    class="info-icon text-orange-500 cursor-help inline-block"
                                    data-tooltip="${this.state.currentMode === "yearly" ? "Bu tutar, tüm yıl boyunca ödenecek toplam gelir vergisidir. Şahıs şirketleri vergiyi yıl içinde 3 ayda bir (Mayıs, Ağustos, Kasım) 'Geçici Vergi' olarak toplu öder. Yıl sonunda (Mart ayında) nihai hesaplama yapılır." : "NAKİT AKIŞI UYARISI: Bu rakam, hesaplanan toplam yıllık verginin 12'ye bölünmüş ortalamasıdır.<br><br>Şahıs şirketleri vergiyi aylık ödemez. Yıl içinde 3 ayda bir (Mayıs, Ağustos, Kasım aylarında) kârınız üzerinden 'Geçici Vergi' adı altında toplu ödeme yaparsınız.<br><br>Bu tutarı her ay biriktirmeniz gereken bir fondur."}"
                                  >ℹ️</span>
                                </span>
                                <span class="font-semibold text-orange-600">${this.formatCurrency(
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

  return `<div class="card p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">${title}</h3>
                <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                        <p class="text-sm text-gray-500">${netGelirEtiketi}</p>
                        <p class="text-2xl font-bold text-green-600">${this.formatCurrency(
                          displayNet,
                          this.state.currentCurrency
                        )}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">${timeLabel} Toplam Prim Gideri</p>
                        <p class="text-2xl font-bold text-red-500">${this.formatCurrency(
                          displayPrim,
                          this.state.currentCurrency
                        )}</p>
                        ${
                          title.includes("Model B") &&
                          this.elements.sgkMuafiyetiCheck?.checked
                            ? '<p class="text-xs text-green-600 mt-1">🛡️ SGK Muafiyeti Aktif</p>'
                            : ""
                        }
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">${timeLabel} Vergi Yükü</p>
                        <p class="text-2xl font-bold text-orange-500">${this.formatCurrency(
                          displayVergi,
                          this.state.currentCurrency
                        )}</p>
                    </div>
                </div>
                ${tceHTML}
                ${detailedBreakdownHTML}
                <div class="mt-4">
                    <p class="text-sm text-gray-500 text-center">Gelire Oranla Net Kârlılık</p>
                    <div class="level-bar-container mt-2">
                      <div class="level-bar level-${scoreLevel}" style="width: ${score}%">${scoreText}</div>
                    </div>
                </div>
                ${tesvikNotlari}
                ${sgkDetayHTML}
            </div>`;
    } catch (e) {
      console.error("Result Card Error:", e);
      return `<div class="card p-6 text-red-500">Sonuçlar görüntülenemedi. Lütfen değerleri kontrol edin.</div>`;
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

    this.elements.hesaplananBrutInput.value = this.formatCurrency(
      this.state.currentCurrency === "TRY"
        ? valueToShow
        : valueToShow / this.state.usdRate,
      this.state.currentCurrency
    );

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
    this.elements.aylikBtn.classList.toggle("active", newMode === "monthly");
    this.elements.yillikBtn.classList.toggle("active", newMode === "yearly");
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
    this.elements.tryBtn.classList.toggle("active", newCurrency === "TRY");
    this.elements.usdBtn.classList.toggle("active", newCurrency === "USD");
    this.elements.currencyLabels.forEach((label) => {
      label.textContent = newCurrency;
    });
    this.updateInputDisplays();
    this.updateUI();
  }

  setComparisonBasis(newBasis) {
    if (this.state.comparisonBasis === newBasis) return;
    this.state.comparisonBasis = newBasis;

    // Update button states
    this.elements.brutBasisBtn.classList.toggle(
      "active",
      newBasis === "grossEquivalence"
    );
    this.elements.tceBasisBtn.classList.toggle(
      "active",
      newBasis === "tceEquivalence"
    );

    // Show/hide TCE percentage panel
    if (this.elements.tcePercentagePanel) {
      if (newBasis === "tceEquivalence") {
        this.elements.tcePercentagePanel.classList.remove("hidden");
      } else {
        this.elements.tcePercentagePanel.classList.add("hidden");
      }
    }

    // Update label for the calculated input field
    const brutInputLabel = document.querySelector(
      'label[for="hesaplananBrutInput"]'
    );
    if (brutInputLabel) {
      if (newBasis === "tceEquivalence") {
        brutInputLabel.innerHTML =
          'Hesaplanan Toplam Maliyet / Hasılat (<span class="currency-label">' +
          this.state.currentCurrency +
          "</span>)";
      } else {
        brutInputLabel.innerHTML =
          'Hesaplanan Brüt Maaş / Hasılat (<span class="currency-label">' +
          this.state.currentCurrency +
          "</span>)";
      }

      // Re-query currency labels since we just updated them
      this.elements.currencyLabels =
        document.querySelectorAll(".currency-label");
    }

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
        if (this.elements.zamEtkisiCheck.checked) {
          this.elements.zamDetayPanel.classList.remove("hidden");
        } else {
          this.elements.zamDetayPanel.classList.add("hidden");
        }

        // Clear all calculation state when salary increase status changes
        // This ensures both Bağ-Kur PEK and Model B calculations return to correct values
        this.state.dogru_yillik_brut_maas = null;

        // Update Bağ-Kur value as well
        if (this.elements.matchSgkPrimCheck.checked) {
          this.setSmartBagkurValue();
        }

        this.updateUI();
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
    this.elements.bagkurPrimiInput.addEventListener("input", () => {
      this.updateBaseValuesFromInputs();
      // Race condition fix: updateInputDisplays() call removed
      this.updateUI();
    });

    // Match SGK premium checkbox
    this.elements.matchSgkPrimCheck.addEventListener("change", () => {
      this.elements.bagkurPrimiInput.disabled =
        this.elements.matchSgkPrimCheck.checked;
      if (this.elements.matchSgkPrimCheck.checked) {
        this.setSmartBagkurValue();
        // Race condition fix: updateInputDisplays() call removed
        this.updateUI();
      }
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

    // Comparison basis buttons
    this.elements.brutBasisBtn.addEventListener("click", () =>
      this.setComparisonBasis("grossEquivalence")
    );
    this.elements.tceBasisBtn.addEventListener("click", () =>
      this.setComparisonBasis("tceEquivalence")
    );

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
        this.updateBaseValuesFromInputs();
        this.updateUI();
      });
    }

    // Accordion functionality - Hybrid Implementation
    this.elements.accordionContainer.addEventListener("click", (event) => {
      const button = event.target.closest(".accordion-button");
      if (!button) return;

      const content = button.nextElementSibling;
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      const newState = !isExpanded;

      // Update ARIA expanded state for accessibility
      button.setAttribute("aria-expanded", newState);

      // Update content state using data attribute
      content.setAttribute("data-expanded", newState);

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

    this.elements.aylikBtn.classList.add("active");
    this.elements.yillikBtn.classList.remove("active");
    this.elements.tryBtn.classList.add("active");
    this.elements.usdBtn.classList.remove("active");
    this.elements.brutBasisBtn.classList.add("active");
    this.elements.tceBasisBtn.classList.remove("active");

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
  new SalaryCalculator();
  initializeTooltipModal();
});

// Tooltip Modal functionality
function initializeTooltipModal() {
  const modal = document.getElementById('tooltipModal');
  const modalBody = modal.querySelector('.tooltip-modal-body');
  const closeBtn = modal.querySelector('.tooltip-modal-close');
  const overlay = modal.querySelector('.tooltip-modal-overlay');

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
  document.addEventListener('click', (e) => {
    const icon = e.target.closest('.info-icon');
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
