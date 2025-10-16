/**
 * Maaş Karşılaştırma Simülatörü
 * SGK vs Bağ-Kur karşılaştırması için gelişmiş hesaplama sistemi
 */

class SalaryCalculator {
  constructor() {
    this.state = {
      currentMode: "monthly",
      currentCurrency: "TRY",
      usdRate: 42.0,
      baseAylikNetMaasTRY: 0,
      baseAylikGiderTRY: 0,
      baseAylikBagkurPekTRY: 0,
    };

    this.constants = {
      YILLIK_MIN_BAGKUR_KAZANCI: 312066,
      YILLIK_MAX_BAGKUR_KAZANCI: 2340495,
      AYLIK_BRUT_ASGARI_UCRET: 26005.5,
      AYLIK_PEK_TAVAN: 195041.4,
      DAMGA_VERGISI_ORANI: 0.00759,
      SGK_ISCI_PAYI_ORANI: 0.15,
      SGK_ISVEREN_IMALAT_ORANI: 0.155,
      SGK_ISVEREN_DIGER_ORANI: 0.165,
      BAGKUR_INDIRIMLI_ORAN: 0.295,
      GENC_GIRISIMCI_ISTISNA_TUTARI: 150000, // 2025 revaluation amount
      HIZMET_IHRACATI_INDIRIM_ORANI: 0.8,
    };

    this.elements = this.initializeElements();
    this.reportContent = this.initializeReportContent();

    this.bindEvents();
    this.initialize();
  }

  initializeElements() {
    return {
      netMaasInput: document.getElementById("netMaasInput"),
      hesaplananBrutInput: document.getElementById("hesaplananBrutInput"),
      giderInput: document.getElementById("giderInput"),
      bagkurPrimiInput: document.getElementById("bagkurPrimiInput"),
      matchSgkPrimCheck: document.getElementById("matchSgkPrim"),
      sgkMuafiyetiCheck: document.getElementById("sgkMuafiyeti"),
      gencGirisimciCheck: document.getElementById("gencGirisimci"),
      hizmetIhracatiCheck: document.getElementById("hizmetIhracati"),
      bagkurPrimLabel: document.getElementById("bagkurPrimLabel"),
      resultsPanel: document.getElementById("results-panel"),
      accordionContainer: document.getElementById("accordion-container"),
      aylikBtn: document.getElementById("aylikBtn"),
      yillikBtn: document.getElementById("yillikBtn"),
      tryBtn: document.getElementById("tryBtn"),
      usdBtn: document.getElementById("usdBtn"),
      modeLabels: document.querySelectorAll(".mode-label"),
      currencyLabels: document.querySelectorAll(".currency-label"),
      kurStatus: document.getElementById("kur-status"),
      zamEtkisiCheck: document.getElementById("zamEtkisiCheck"),
      zamDetayPanel: document.getElementById("zamDetayPanel"),
      zamOrani: document.getElementById("zamOrani"),
      zamAyi: document.getElementById("zamAyi"),
    };
  }

  async fetchExchangeRates() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD",
        {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const tryRate = data.rates?.TRY;

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
    return {
      "Simülatör Kullanım Kılavuzu": `
                <h4>Bu Simülatör Ne Yapar?</h4>
                <p>Bu araç, Türkiye'de çalışanların iki temel kariyer modelini finansal olarak karşılaştırmasını sağlar: <strong>Maaşlı Çalışan</strong> ve <strong>Freelance/Şahıs Şirketi Sahibi</strong>.</p>
                
                <div style="background-color: #fefce8; border: 1px solid #eab308; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0;">
                    <p><strong>📋 Not:</strong> Bu hesaplama aracı genel olarak tüm meslekler için kullanılabilir. Özellikle bilgi işçiliği, danışmanlık, tasarım, eğitim ve benzeri hizmet sektörlerinde çalışanlar için optimize edilmiştir. İstisnai imalat ve ağır sanayi gibi özel düzenlemelerin olduğu sektörlerde farklı kurallar geçerli olabilir.</p>
                </div>
                
                <h4>Nasıl Kullanılır?</h4>
                <ol>
                    <li><strong>Net Maaşınızı Girin:</strong> Mevcut veya hedeflediğiniz aylık net maaşı TL olarak girin.</li>
                    <li><strong>Brüt Maaş/Hasılatı Gözlemleyin:</strong> Simülatör, girdiğiniz net maaşa karşılık gelen brüt maaşı otomatik olarak hesaplar.</li>
                    <li><strong>Freelance Giderlerinizi Belirleyin:</strong> SaaS abonelikleri, donanım, ev ofis giderleri gibi işle ilgili aylık masraflarınızı girin.</li>
                    <li><strong>Emeklilik Stratejinizi Seçin:</strong> Emeklilik haklarınızın maaşlı çalışandaki seviyeyi koruması için otomatik ayar kullanabilir veya manuel olarak ayarlayabilirsiniz.</li>
                    <li><strong>Teşvikleri Uygulayın:</strong> 29 yaş altıysanız ve ilk şirketinizse 'Genç Girişimci' teşvikini, yurtdışına hizmet veriyorsanız 'Hizmet İhracatı' teşvikini aktif bırakın.</li>
                    <li><strong>Sonuçları Karşılaştırın:</strong> İki model arasındaki net gelir, prim gideri ve vergi yükü farkını inceleyin.</li>
                </ol>
            `,
      "Model A: Maaşlı Çalışan (SGK - 4a) Detayları": `
                <p>Bu model, bir işverene hizmet akdiyle bağlı olarak çalışmayı ve sosyal güvencenin 4a (SGK) kapsamında sağlanmasını ifade eder. Finansal yapı, brüt maaş üzerinden yapılan yasal kesintilerle belirlenir.</p>
                
                <h4>Gelir ve Kesintiler</h4>
                <ul>
                    <li><strong>Brüt Maaş:</strong> İşverenle anlaşılan, kesintiler yapılmamış toplam ücret. Bu tutar aynı zamanda SGK'ya bildirilen Prime Esas Kazanç'tır (PEK).</li>
                    <li><strong>SGK Primi İşçi Payı (%15):</strong> %14 işçi payı ve %1 işsizlik payı olmak üzere brüt maaştan kesilir.</li>
                    <li><strong>SGK Primi İşveren Payı (%16.5):</strong> %16.5 işveren payı olmak üzere işveren tarafından ödenir. İşsizlik sigortası işveren payı ayrıca %2'dir. Toplam SGK maliyeti brüt maaşın %33.5'idir.</li>
                    <li><strong>Gelir Vergisi Matrahı:</strong> Brüt maaştan SGK işçi primi düşüldükten sonra kalan tutardır (PEK tavanı uygulanır).</li>
                    <li><strong>Gelir Vergisi:</strong> Matrah üzerinden, Gelir Vergisi Kanunu'ndaki artan oranlı tarifeye (%15'ten başlar) göre hesaplanır. Yıl içinde kümülatif matrah arttıkça vergi oranı da yükselir. Asgari ücret gelir vergisi istisnası uygulanır.</li>
                    <li><strong>Damga Vergisi:</strong> Asgari ücret üzerindeki brüt maaş kısmı üzerinden binde 7,59 oranında kesilir (26.005,50 TL'nin üzerindeki kısım).</li>
                    <li><strong>Net Maaş:</strong> Brüt maaştan işçi payı prim, gelir vergisi ve damga vergisi kesintileri yapıldıktan sonra çalışanın eline geçen tutardır.</li>
                </ul>
                
                <h4>Avantajları ve Dezavantajları</h4>
                <ul>
                    <li><strong>Avantajlar:</strong> Finansal öngörülebilirlik, düşük operasyonel sorumluluk (beyanları işveren yapar), kapsamlı kısa vadeli güvenceler (rapor parası, işsizlik maaşı vb.), 65 yaşında emeklilik hakkı.</li>
                    <li><strong>Dezavantajlar:</strong> Daha düşük net gelir potansiyeli, artan oranlı vergi dilimlerinin yıl içinde net maaşı düşürmesi, giderleri vergiden düşme imkanının olmaması.</li>
                </ul>
            `,
      "Model B: Şahıs Şirketi Sahibi (Bağ-Kur - 4b) Detayları": `
                <p>Bu model, kendi adınıza bir şahıs şirketi (serbest meslek mükellefiyeti) kurarak mal veya hizmet satmayı ve sosyal güvencenin 4b (Bağ-Kur) kapsamında sağlanmasını ifade eder. Gelir, fatura edilen hasılattan giderler, primler ve vergiler düşülerek hesaplanır.</p>
                
                <h4>Gelir ve Giderler</h4>
                <ul>
                    <li><strong>Hasılat:</strong> Müşterilerinize kestiğiniz faturaların KDV hariç toplam tutarıdır.</li>
                    <li><strong>Giderler:</strong> İşi yapmak için katlanılan ve belgelendirilen tüm masraflar (ekipman, donanım, ofis, eğitim, yazılım vb.). Giderler, kârı ve dolayısıyla ödenecek vergiyi azaltır.</li>
                    <li><strong>Bağ-Kur Prime Esas Kazanç (PEK):</strong> Emekliliğinizi ve alacağınız sağlık hizmetlerini belirleyen tutardır. Bu tutarı yasal limitler dahilinde siz belirlersiniz. Emeklilik haklarınızın SGK'lı bir çalışanla eşdeğer olması için PEK'i, o çalışanın brüt maaşına eşitlemeniz önerilir.</li>
                    <li><strong>Bağ-Kur Primi:</strong> Belirlediğiniz PEK üzerinden %34,5 oranında hesaplanır. Düzenli ödemede 5 puan indirimle %29,5 olur. Sorumluluğu tamamen size aittir ve ödenen primin tamamı vergi matrahından düşülebilir.</li>
                    <li><strong>Gelir Vergisi:</strong> İlgili teşvikler (Genç Girişimci, Hizmet İhracatı) düşüldükten sonra kalan nihai matrah üzerinden artan oranlı tarifeye göre hesaplanır.</li>
                    <li><strong>Net Gelir:</strong> (Hasılat - Giderler - Ödenen Bağ-Kur Primi - Gelir Vergisi) sonrası kalan tutardır.</li>
                </ul>
                
                <h4>Avantajları ve Dezavantajları</h4>
                <ul>
                    <li><strong>Avantajlar:</strong> Çok daha yüksek net gelir potansiyeli, vergi teşviklerinden yararlanma, işle ilgili tüm giderleri vergiden düşme, emeklilik primini belirlemede esneklik.</li>
                    <li><strong>Dezavantajlar:</strong> Daha yüksek operasyonel sorumluluk (fatura kesme, beyan takibi), gelirde dalgalanma riski, Bağ-Kur'un kısa vadeli güvencelerinin 4a'ya göre daha sınırlı olması.</li>
                </ul>
            `,
      "Model B İçin Kritik Avantajlar: Giderler ve Teşvikler": `
                <h3>Gider Yönetimi: Vergi Matrahını Optimize Etme Sanatı</h3>
                <p>Bir girişimci olarak en büyük avantajlarınızdan biri, işle ilgili harcamalarınızı yasal olarak gelirinizden düşerek daha az vergi ödemektir. Mesleğinize göre düşebileceğiniz temel giderler:</p>
                
                <ul>
                    <li><strong>Teknoloji ve Donanım:</strong> İş için alınan bilgisayar, monitör, klavye, harici disk vb. cihazlar. 2025 yılı için 9.900 TL (KDV hariç) altındaki alımlar doğrudan gider yazılırken, üzerindeki alımlar amortisman yoluyla (genellikle 5 yıla bölünerek) giderleştirilir.</li>
                    <li><strong>Yazılım ve Lisanslar:</strong> Mesleğinizle ilgili tüm yazılım araçları, bulut servisleri, abonelik hizmetleri ve profesyonel lisanslar gider olarak düşülebilir.</li>
                    <li><strong>Home-Office Giderleri:</strong> Evden çalışıyorsanız, kira kontratınız varsa kiranın tamamı, ev size aitse emlak vergisinin yarısı gider yazılabilir. Ayrıca elektrik, su, doğalgaz ve internet gibi faturaların %50'si gider olarak kabul edilir.</li>
                </ul>
                
                <h3>Vergi Kalkanları: Gelirinizi Koruyan İki Güçlü Teşvik</h3>
                
                <h4>a) Genç Girişimci Desteği (GVK Mükerrer Md. 20)</h4>
                <ul>
                    <li><strong>Gelir Vergisi İstisnası:</strong> 3 yıl boyunca, yıllık kazancın <strong>150.000 TL'lik kısmı gelir vergisinden muaftır</strong> (2025 yılı için).</li>
                    <li><strong>Bağ-Kur Prim Desteği:</strong> 1 yıl boyunca, devlet sizin adınıza minimum Bağ-Kur primini öder. Eğer daha yüksek bir seviyeden prim öderseniz, aradaki farkı siz karşılarsınız. Bu destek yıllık yaklaşık <strong>92.059 TL'lik</strong> bir nakit avantajıdır (312.066 × 0.295).</li>
                    <li><strong>Yaş Şartı:</strong> 18 yaşını doldurmuş, 29 yaşını geçmemiş olmak gerekir.</li>
                    <li><strong>İlk Mükellefiyet:</strong> İlk kez gelir vergisi mükellefi olmak şarttır.</li>
                </ul>
                
                <h4>b) Hizmet İhracatı Kazanç İstisnası (GVK Md. 89/13)</h4>
                <ul>
                    <li><strong>Uygulama:</strong> Yurt dışı faaliyetlerden elde edilen kazancın <strong>%80'ini</strong> yıllık gelir vergisi beyannamenizde matrahtan indirebilirsiniz.</li>
                    <li><strong>2025 Yılı Durumu:</strong> Araştırılan kaynaklara göre <strong>üst limit bulunmamaktadır</strong>. Tüm hizmet ihracatı kazancı %80 istisna kapsamındadır.</li>
                    <li><strong>Koşullar:</strong> Hizmet bedeli döviz olarak Türkiye'ye getirilmeli, yurt dışı mukim müşteriye hizmet verilmeli.</li>
                    <li><strong>%5 Kurumlar Vergisi İndirimi:</strong> Hizmet ihracatı kazançları için ek olarak %5 puanlık kurumlar vergisi indirimi de uygulanır.</li>
                </ul>
            `,
      "Önemli Kavram: Bağ-Kur Prim Kazancı vs. Prim Gideri": `
                <h4>Bu İki Kavram Neden Farklı?</h4>
                <p>Simülatördeki en önemli ayrım, 'Bağ-Kur Prim Kazancı' ile 'Toplam Prim Gideri' arasındaki farktır. Bu farkı anlamak, Model B'nin finansal yapısını çözmek için anahtardır.</p>
                
                <ul>
                    <li><strong>Bağ-Kur Prim Kazancı (PEK):</strong> Bu, slider ile ayarladığınız tutardır. Cebinizden çıkan para <strong>değildir</strong>. Bu, SGK'daki 'Brüt Maaş'ın karşılığıdır ve gelecekteki emekli maaşınızın hesaplanacağı <strong>baz tutardır</strong>. Rakam ne kadar yüksekse, emekliliğiniz o kadar güçlü olur.</li>
                    <li><strong>Toplam Prim Gideri:</strong> Bu, sonuç kartında gördüğünüz ve her ay cebinizden <strong>fiilen çıkacak olan net ödeme tutarıdır</strong>. Bu tutar, yukarıda belirlediğiniz 'Bağ-Kur Prim Kazancı'nın yaklaşık <strong>%29,5</strong>'i alınarak hesaplanır.</li>
                </ul>
                
                <h4>Örnek:</h4>
                <p>Eğer 'Bağ-Kur Prim Kazancı'nı 100.000 TL olarak belirlerseniz, bu 100.000 TL brüt maaş üzerinden emekli olmayı hedeflediğiniz anlamına gelir. Bu hedef için her ay cebinizden çıkacak olan prim ödemesi ise yaklaşık 29.500 TL olacaktır.</p>
            `,
      "Emeklilik Hakları: SGK vs Bağ-Kur Karşılaştırması": `
                <h4>Emeklilik Maaşı Hesaplama Formülü (Her İki Sistemde Aynı)</h4>
                <div style="background-color: #f0f9ff; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5em; border-left: 4px solid #0ea5e9;">
                    <pre><code><strong>Emekli Maaşı = (Toplam Prim Gün Sayısı × Ortalama PEK × Yaş Katsayısı) ÷ 365</strong></code></pre>
                    <p style="margin-top: 0.5em; font-size: 0.9em;"><strong>Yaş Katsayısı:</strong> 65 yaşında %100, her ay erken emeklilikte %0.5 azalır</p>
                </div>
                
                <h4>🚨 Kritik Fark: Prim Oranları ve Gerçek Ödemeler</h4>
                
                <h5><strong>SGK (4a) - Maaşlı Çalışan:</strong></h5>
                <ul>
                    <li><strong>Toplam Prim Oranı:</strong> %33.5 (İşçi %15 + İşveren %16.5 + İşsizlik %2)</li>
                    <li><strong>Kişisel Maliyet:</strong> Sadece %15 (işçi payı) çalışanın maaşından kesilir</li>
                    <li><strong>Devlet/İşveren Katkısı:</strong> %18.5'lik kısım işveren tarafından karşılanır</li>
                    <li><strong>Prim Güvenilirliği:</strong> Otomatik kesinti, eksik ödeme riski yok</li>
                    <li><strong>Emeklilik Yaşı:</strong> 65 yaş (erkek/kadın fark yok, 2025 itibariyle)</li>
                </ul>
                
                <h5><strong>Bağ-Kur (4b) - Şahıs Şirketi Sahibi:</strong></h5>
                <ul>
                    <li><strong>Toplam Prim Oranı:</strong> %29.5 (düzenli ödemede, normal %34.5)</li>
                    <li><strong>Kişisel Maliyet:</strong> %29.5'in tamamı kişi tarafından ödenir</li>
                    <li><strong>Devlet Katkısı:</strong> Yok (Genç Girişimci desteği hariç)</li>
                    <li><strong>Prim Güvenilirliği:</strong> Kişisel sorumluluk, gecikme/eksik ödeme riski var</li>
                    <li><strong>Emeklilik Yaşı:</strong> 65 yaş (SGK ile aynı)</li>
                </ul>
                
                <h4>💰 Praktik Örnek: 100.000 TL PEK Üzerinden</h4>
                <table style="width: 100%; border-collapse: collapse; margin: 1em 0;">
                    <tr style="background-color: #f9fafb; font-weight: bold;">
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Kriter</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">SGK (4a)</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Bağ-Kur (4b)</th>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #d1d5db; padding: 8px;"><strong>Toplam Sistem Primi</strong></td>
                        <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">₺33.500 (%33.5)</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">₺29.500 (%29.5)</td>
                    </tr>
                    <tr style="background-color: #fef3c7;">
                        <td style="border: 1px solid #d1d5db; padding: 8px;"><strong>Çalışanın Ödediği</strong></td>
                        <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">₺15.000 (%15)</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">₺29.500 (%29.5)</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #d1d5db; padding: 8px;"><strong>İşverenin Ödediği</strong></td>
                        <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">₺18.500 (%18.5)</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">₺0</td>
                    </tr>
                    <tr style="background-color: #dcfce7;">
                        <td style="border: 1px solid #d1d5db; padding: 8px;"><strong>Beklenen Emekli Maaşı</strong></td>
                        <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Teorik olarak aynı*</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Teorik olarak aynı*</td>
                    </tr>
                </table>
                
                <p style="font-size: 0.8em; color: #666; margin-top: 0.5em;"><strong>*Not:</strong> Aynı PEK ve aynı prim gün sayısında teorik olarak aynı emekli maaşı alırsınız.</p>
                
                <h4>⚠️ Gerçek Hayattaki Farklar ve Riskler</h4>
                
                <h5><strong>Bağ-Kur'da Dikkat Edilmesi Gerekenler:</strong></h5>
                <ul>
                    <li><strong>Ödeme Düzeni:</strong> Eksik veya geç ödenen primler emeklilik haklarınızı azaltır</li>
                    <li><strong>PEK Tutarlılığı:</strong> Her yıl aynı seviyede PEK belirlemeniz önemli (SGK'da otomatik)</li>
                    <li><strong>Enflasyon Koruması:</strong> PEK'inizi yıllık enflasyona göre artırmanız gerekir</li>
                    <li><strong>Borçlanma İmkanı:</strong> SGK'ya göre daha sınırlı borçlanma seçenekleri</li>
                </ul>
                
                <h5><strong>SGK'da Avantajlar:</strong></h5>
                <ul>
                    <li><strong>Otomatik Sistem:</strong> İşveren sorumluluğunda, eksik ödeme riski yok</li>
                    <li><strong>İlave Güvenceler:</strong> İşsizlik maaşı, kısa vadeli güvenceler</li>
                    <li><strong>Yasal Koruma:</strong> İş Kanunu koruması, kıdem-ihbar tazminatı</li>
                    <li><strong>Sağlık Güvenceleri:</strong> Daha kapsamlı tedavi hakları</li>
                </ul>
                
                <h4>🎯 Emeklilik Eşitliği İçin Öneriler</h4>
                
                <ol>
                    <li><strong>PEK Eşitlemesi:</strong> Bağ-Kur PEK'inizi, SGK'daki brüt maaşınıza eşit tutun</li>
                    <li><strong>Düzenli Ödeme:</strong> %29.5 indirimli orandan yararlanmak için zamanında ödeyin</li>
                    <li><strong>Prim Farkı Yatırımı:</strong> SGK'ya göre az ödediğiniz primi (₺4.000 fark) bireysel emeklilikte değerlendirin</li>
                    <li><strong>Yıllık Güncelleme:</strong> Her yıl PEK'inizi enflasyon + gerçek ücret artışına göre yükseltin</li>
                    <li><strong>Borçlanma Planı:</strong> Eksik prim günlerinizi stratejik olarak borçlanarak tamamlayın</li>
                </ol>
                
                <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0;">
                    <h6 style="margin-top: 0; color: #0c4a6e;"><strong>🔄 Beklenen Yasal Düzenleme (2025):</strong></h6>
                    <p style="margin-bottom: 0; font-size: 0.9em; color: #164e63;">Bağ-Kur'lular için gerekli olan 9000 prim gününün, SGK'lılar gibi 7200 güne düşürülmesine yönenek yasal düzenleme beklentisi yüksektir. Bu reform gerçekleşirse, iki sistem arasındaki en büyük dezavantajlardan biri ortadan kalkacaktır.</p>
                </div>
                
                <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0;">
                    <p><strong>💡 Sonuç:</strong> Aynı PEK seviyesinde teorik olarak aynı emekli maaşı alırsınız, ancak Bağ-Kur'da kişisel disiplin çok kritiktir. SGK'nın otomatik güvencesi vs Bağ-Kur'un esnekliği arasında bilinçli bir tercih yapmalısınız.</p>
                </div>
            `,
      "Şahıs Şirketi ve Hizmet İhracatı Rehberi": `
                <div style="background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 0.75rem; padding: 1.5rem; margin: 2rem 0;">
                    <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                        <div style="background-color: #0ea5e9; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 0.5rem; font-weight: bold;">⚖️</div>
                        <h3 style="margin: 0; color: #0c4a6e;">Önemli Hukuki Uyarı</h3>
                    </div>
                    <p style="margin: 0; font-size: 0.9em; color: #164e63;"><strong>Bu bölüm sadece genel bilgi amaçlıdır ve profesyonel vergi/hukuk danışmanlığı yerine geçmez.</strong> Kişisel durumunuza özgü kararlar almadan önce mutlaka uzman bir mali müşavir ve/veya vergi hukuku uzmanından danışmanlık alınız. Vergi mevzuatı sürekli değişmektedir ve bireysel durumlar farklılık gösterebilir.</p>
                </div>

                <h4>📋 Bölüm 1: İkili Statü Yönetimi - SGK + Bağ-Kur Kombinasyonu</h4>
                
                <h5><strong>1.1. Sigortalılık Çakışması Prensibinin Anlaşılması</strong></h5>
                <p>5510 sayılı Sosyal Sigortalar Kanunu'nun 53. maddesi gereği, bir kişinin aynı anda hem 4/a (SGK işçi sigortası) hem de 4/b (Bağ-Kur) kapsamında sigortalı olması gereken durumlarda, <strong>4/a statüsü önceliklidir</strong>.</p>
                
                <div style="background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 1rem; margin: 1rem 0;">
                    <h6 style="margin-top: 0;"><strong>Pratik Avantaj:</strong></h6>
                    <p style="margin-bottom: 0;">Mevcut SGK'lı işiniz devam ederken şahıs şirketi kurduğunuzda, yasal olarak Bağ-Kur primi ödeme yükümlülüğünüz bulunmaz. Bu, aylık yaklaşık <strong>7.671 TL</strong> (2025 minimum Bağ-Kur primi) tasarruf demektir.</p>
                </div>
                
                <h5><strong>1.2. Kritik Prosedür: Bağ-Kur Muafiyet Başvurusu</strong></h5>
                <p>Bu avantajdan yararlanmak otomatik değildir. Şirket kuruluşu sırasında:</p>
                <ul>
                    <li>Mali müşaviriniz SGK müdürlüğüne başvurarak mevcut 4/a sigortalılığınızı belgeler</li>
                    <li>Bağ-Kur tescilinizin yapılmamasını talep eder</li>
                    <li>Bu adım atlanırsa geriye dönük borç ve ceza riski oluşur</li>
                </ul>
                
                <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0;">
                    <p><strong>⚠️ Önemli:</strong> SGK'lı işiniz sona erdiği anda Bağ-Kur yükümlülüğü otomatik başlar. Bu potansiyel maliyeti finansal planlamanızda mutlaka hesaba katın.</p>
                </div>

                <h4>💰 Bölüm 2: Vergi Optimizasyon Stratejileri</h4>
                
                <h5><strong>2.1. Hizmet İhracatında %80 Gelir Vergisi İstisnası</strong></h5>
                <p>Yurt dışına verilen hizmetlerden elde edilen net kârın <strong>%80'i gelir vergisinden muaftır</strong>. Bu, yazılım mühendisleri için en güçlü vergi avantajıdır.</p>
                
                <h6><strong>Zorunlu Şartlar (Tamamı Gerekli):</strong></h6>
                <ol>
                    <li><strong>Yurt Dışı Müşteri:</strong> Faturalanan şirketin kanuni merkezi Türkiye dışında olmalı</li>
                    <li><strong>Yurt Dışında Faydalanma:</strong> Hizmetten yalnızca yurt dışında yararlanılmalı</li>
                    <li><strong>Yurt Dışına Faturalama:</strong> Fatura yurt dışı müşteri adına düzenlenmeli</li>
                    <li><strong>Dövizin Yurda Getirilmesi:</strong> Fatura bedeli beyanname verme tarihine kadar Türkiye'deki banka hesabına transfer edilmeli</li>
                </ol>
                
                <h6><strong>Finansal Etki Örneği:</strong></h6>
                <table style="width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 0.9em;">
                    <tr style="background-color: #f9fafb; font-weight: bold;">
                        <th style="border: 1px solid #d1d5db; padding: 8px;">Senaryo</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px;">İstisna Yok</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px;">%80 İstisna</th>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">Net Kâr</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">1.200.000 TL</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">1.200.000 TL</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">Vergi Matrahı</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">1.200.000 TL</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">240.000 TL</td>
                    </tr>
                    <tr style="background-color: #fef3c7;">
                        <td style="border: 1px solid #d1d5db; padding: 8px;"><strong>Gelir Vergisi</strong></td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;"><strong>~345.900 TL</strong></td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;"><strong>~58.500 TL</strong></td>
                    </tr>
                    <tr style="background-color: #dcfce7;">
                        <td style="border: 1px solid #d1d5db; padding: 8px;"><strong>Vergi Tasarrufu</strong></td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">-</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;"><strong>287.400 TL</strong></td>
                    </tr>
                </table>
                
                <h5><strong>2.2. KDV İstisnası</strong></h5>
                <p>Hizmet ihracatı %0 KDV ile "İstisna Faturası" olarak düzenlenir. Bu size %20'lik fiyat rekabeti avantajı sağlar ve nakit akışını basitleştirir.</p>
                
                <h5><strong>2.3. Genç Girişimci Desteği (29 Yaş Altı İçin)</strong></h5>
                <p>Eğer uygunluk şartlarını sağlıyorsanız, katmanlı vergi avantajı elde edebilirsiniz:</p>
                <ul>
                    <li><strong>1. Katman:</strong> Yıllık 150.000 TL'ye kadar %100 gelir vergisi istisnası (3 yıl)</li>
                    <li><strong>2. Katman:</strong> Bu sınırı aşan kısım %80 hizmet ihracatı istisnasına tabi</li>
                    <li><strong>Bağ-Kur Prim Desteği:</strong> 1 yıl boyunca minimum prim devlet tarafından karşılanır</li>
                </ul>

                <h4>📊 Bölüm 3: İndirilebilir Gider Kataloğu</h4>
                
                <p>Vergi matrahınızı yasal yollarla optimize etmenin en etkili yolu, işle ilgili tüm harcamaları doğru belgeleyerek gider göstermektir.</p>
                
                <h5><strong>3.1. Teknoloji ve Altyapı Giderleri</strong></h5>
                <table style="width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 0.9em;">
                    <tr style="background-color: #f9fafb; font-weight: bold;">
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Gider Türü</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">İndirilebilirlik</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Örnekler</th>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #d1d5db; padding: 8px;"><strong>Yazılım ve Abonelikler</strong></td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">%100 gider</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">IDE lisansları, SaaS araçları, cloud servisleri</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #d1d5db; padding: 8px;"><strong>Donanım</strong></td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">Amortismana tabi</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">Bilgisayar, monitör, sunucu, ağ cihazları</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #d1d5db; padding: 8px;"><strong>Hosting ve Domain</strong></td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">%100 gider</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">Web barındırma, alan adı, SSL sertifikası</td>
                    </tr>
                </table>
                
                <h5><strong>3.2. Ev Ofis (Home Office) Giderleri</strong></h5>
                <table style="width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 0.9em;">
                    <tr style="background-color: #f9fafb; font-weight: bold;">
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Gider Kalemi</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Kiralık Konut</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Kendi Mülkü</th>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #d1d5db; padding: 8px;"><strong>Kira Bedeli</strong></td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">%100 gider yazılabilir</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">Uygulanmaz</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #d1d5db; padding: 8px;"><strong>Faturalar</strong></td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">%50 (elektrik, su, gaz, internet)</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">%50 (elektrik, su, gaz, internet)</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #d1d5db; padding: 8px;"><strong>Aidat</strong></td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">%50 gider yazılabilir</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">%50 gider yazılabilir</td>
                    </tr>
                </table>
                
                <h5><strong>3.3. Ulaşım ve Seyahat Giderleri</strong></h5>
                <ul>
                    <li><strong>İş Seyahatleri:</strong> Uçak/tren bileti, otel, işle ilgili yemekler (%100 gider)</li>
                    <li><strong>Şehir İçi Ulaşım:</strong> Toplu taşıma abonmanları (%100 gider)</li>
                    <li><strong>Şahsi Araç:</strong> Özel sınırlamalar ve oranlar uygulanır</li>
                </ul>
                
                <div style="background-color: #fef2f2; border: 1px solid #ef4444; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0;">
                    <h6 style="margin-top: 0; color: #dc2626;"><strong>🚫 Şahsi Araç Gider Sınırları (2025):</strong></h6>
                    <ul style="margin-bottom: 0;">
                        <li><strong>Kiralama:</strong> Aylık 37.000 TL'ye kadar</li>
                        <li><strong>İşletme Giderleri:</strong> Toplam harcamanın sadece %70'i</li>
                        <li><strong>Satın Alma:</strong> 1.100.000 TL üzerinden amortisman sınırı</li>
                        <li><strong>ÖTV+KDV:</strong> 990.000 TL'ye kadar doğrudan gider</li>
                    </ul>
                </div>
                
                <h5><strong>3.4. Profesyonel Gelişim ve Hizmetler</strong></h5>
                <ul>
                    <li><strong>Mali Müşavirlik:</strong> Aylık danışmanlık ücretleri (%100 gider)</li>
                    <li><strong>Eğitim:</strong> Mesleki kurslar, seminerler, teknik kitaplar (%100 gider)</li>
                    <li><strong>Hukuki Danışmanlık:</strong> İşle ilgili hukuki hizmetler (%100 gider)</li>
                </ul>
                
                <h5><strong>3.5. Sigorta ve Primler</strong></h5>
                <ul>
                    <li><strong>Bağ-Kur Primleri:</strong> Ödendiği yılda %100 gider (zarar halinde bile)</li>
                    <li><strong>Özel Sağlık/Hayat Sigortası:</strong> Yıllık gelirin %15'ini ve asgari ücret tutarını aşmamak kaydıyla gider</li>
                </ul>

                <h4>⚠️ Bölüm 4: Gider Olamayacak Harcamalar</h4>
                
                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 1rem; margin: 1rem 0;">
                    <h6 style="margin-top: 0;"><strong>Kesinlikle Gider Gösterilemez:</strong></h6>
                    <ul style="margin-bottom: 0;">
                        <li>Ödenen gelir vergisi ve geçici vergiler</li>
                        <li>Vergi cezaları ve gecikme faizleri</li>
                        <li>Kişisel nitelikteki harcamalar (giyim, market, özel yemekler)</li>
                        <li>İş seyahatlerinde aile üyelerinin masrafları</li>
                        <li>Kişisel tatil ve eğlence harcamaları</li>
                    </ul>
                </div>

                <h4>📋 Bölüm 5: Uyum ve Risk Yönetimi</h4>
                
                <h5><strong>5.1. Belgelendirme Disiplini</strong></h5>
                <p>Her gider mutlaka şirket adına düzenlenmiş geçerli fatura/fiş ile belgelenmelidir. Belgesiz giderler reddedilir ve geriye dönük vergi/ceza doğurur.</p>
                
                <h5><strong>5.2. İlişkili Taraf Riski</strong></h5>
                <p>Mevcut işvereninizin yurt dışı şubesi ile çalışma durumu "ilişkili taraf işlemi" yaratır. Risk azaltmak için:</p>
                <ul>
                    <li>Detaylı hizmet sözleşmesi hazırlayın</li>
                    <li>Piyasa koşullarına uygun fiyatlama yapın</li>
                    <li>Hizmet teslimatını dokümante edin</li>
                    <li>Tüm iletişimi kayıt altına alın</li>
                </ul>
                
                <h5><strong>5.3. Dijital Kayıt Sistemi</strong></h5>
                <p>Tüm fatura ve belgeleri anında dijital ortama aktarıp düzenli klasörleyin. Bu sistem hem beyanname hazırlığını kolaylaştırır hem de olası denetimlerde hayat kurtarır.</p>

                <h4>🎯 Bölüm 6: Stratejik Eylem Planı</h4>
                
                <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0;">
                    <h6 style="margin-top: 0;"><strong>Öncelikli Adımlar:</strong></h6>
                    <ol style="margin-bottom: 0;">
                        <li><strong>Uzman Mali Müşavir:</strong> Teknoloji ve hizmet ihracatı deneyimli danışman seçin</li>
                        <li><strong>Bağ-Kur Muafiyeti:</strong> SGK statünüzü bildirerek muafiyet başvurusu yapın</li>
                        <li><strong>Ayrı Banka Hesabı:</strong> Şirket adına ticari hesap açın</li>
                        <li><strong>Dijital Arşiv:</strong> Belge takip sistemi kurun</li>
                        <li><strong>Hizmet Sözleşmesi:</strong> Yurt dışı şube ile resmi anlaşma imzalayın</li>
                    </ol>
                </div>
                
                <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0;">
                    <p style="margin: 0;"><strong>💡 Önemli Hatırlatma:</strong> Bu rehber genel bilgilendirme amaçlıdır. Kişisel durumunuza özel kararlar için mutlaka profesyonel danışmanlık alın. Vergi mevzuatı sürekli değişir ve bireysel şartlar farklılık gösterebilir.</p>
                </div>
            `,
      "Hesaplamaların Arkasındaki Matematik": `
                <h4>Sabit Değerler ve Anlamları</h4>
                <div style="background-color: #f0f9ff; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5em; border-left: 4px solid #0ea5e9;">
                    <h5><strong>SGK Oranları (2025):</strong></h5>
                    <ul>
                        <li><code>0.15</code> = SGK İşçi Payı (%15: %14 emeklilik + %1 işsizlik)</li>
                        <li><code>0.165</code> = SGK İşveren Payı (%16.5: genel oran)</li>
                        <li><code>0.02</code> = İşsizlik Sigortası İşveren Payı (%2: ayrı hesaplanır)</li>
                        <li><code>0.335</code> = Toplam SGK Oranı (%33.5: işçi + işveren + işsizlik)</li>
                    </ul>
                    
                    <h5><strong>Vergi Oranları:</strong></h5>
                    <ul>
                        <li><code>0.00759</code> = Damga Vergisi Oranı (Binde 7.59)</li>
                        <li><strong>Gelir Vergisi Dilimleri - Ücretli Çalışanlar (2025):</strong>
                            <ul>
                                <li>0-158.000 TL: %15</li>
                                <li>158.001-330.000 TL: %20</li>
                                <li>330.001-1.200.000 TL: %27</li>
                                <li>1.200.001-4.300.000 TL: %35</li>
                                <li>4.300.001 TL+: %40</li>
                            </ul>
                        </li>
                        <li><strong>Gelir Vergisi Dilimleri - Ücret Dışı Kazançlar (2025):</strong>
                            <ul>
                                <li>0-158.000 TL: %15</li>
                                <li>158.001-330.000 TL: %20</li>
                                <li>330.001-800.000 TL: %27</li>
                                <li>800.001-4.300.000 TL: %35</li>
                                <li>4.300.001 TL+: %40</li>
                            </ul>
                            <p style="font-size: 0.8em; color: #666; margin-top: 0.5em;"><strong>Not:</strong> Model B (Şahıs Şirketi) ücret dışı kazanç olduğu için bu tarifeyi kullanır.</p>
                        </li>
                    </ul>
                    
                    <h5><strong>Bağ-Kur Değerleri (2025):</strong></h5>
                    <ul>
                        <li><code>26.005,50 TL</code> = Aylık Minimum Bağ-Kur Kazancı</li>
                        <li><code>312.066 TL</code> = Yıllık Minimum Bağ-Kur Kazancı</li>
                        <li><code>195.041,40 TL</code> = Aylık Maximum Bağ-Kur Kazancı (PEK Tavanı)</li>
                        <li><code>2.340.495 TL</code> = Yıllık Maximum Bağ-Kur Kazancı (Tavan)</li>
                        <li><code>0.295</code> = İndirimli Bağ-Kur Primi (%29.5, düzenli ödemede %34.5'ten %29.5'e düşer)</li>
                    </ul>
                    
                    <h5><strong>Vergi İstisnaları:</strong></h5>
                    <ul>
                        <li><code>312.066 TL</code> = Asgari Ücret Gelir Vergisi İstisnası (yıllık, sadece ücret gelirleri)</li>
                        <li><code>150.000 TL</code> = Genç Girişimci Gelir Vergisi İstisnası (yıllık, 2025)</li>
                        <li><code>0.80</code> = Hizmet İhracatı İndirim Oranı (%80 istisna, limit yok)</li>
                    </ul>
                </div>
                
                <hr style="margin: 2em 0; border: 1px solid #e5e7eb;">
                
                <h4>Model A: Maaşlı Çalışan (SGK)</h4>
                
                <h5><strong>Brüt Maaştan Net Maaşa:</strong></h5>
                <ul>
                    <li><pre><code>PEK Tavanı = min(Brüt Maaş, 2.340.495 TL)</code></pre></li>
                    <li><pre><code>SGK İşçi Payı = PEK Tavanı × 0.15</code></pre></li>
                    <li><pre><code>GV Matrahı = PEK Tavanı - SGK İşçi Payı</code></pre></li>
                    <li><pre><code>Gelir Vergisi = Artan Oranlı Tarifeye Göre Hesaplanır (Asgari Ücret İstisnası ile)</code></pre></li>
                    <li><pre><code>Damga Vergisi = max(0, (Brüt Maaş - Yıllık Asgari Ücret)) × 0.00759</code></pre></li>
                    <li><small><strong>Not:</strong> Yıllık Asgari Ücret = 26.005,50 × 12 = 312.066 TL</small></li>
                    <li><pre><code><strong>Net Maaş = Brüt Maaş - SGK İşçi Payı - Gelir Vergisi - Damga Vergisi</strong></code></pre></li>
                    <li><small><strong>Not:</strong> SGK ve Gelir Vergisi hesaplarında PEK tavanı uygulanır, ancak Damga Vergisi brüt maaş üzerinden hesaplanır</small></li>
                </ul>
                
                <h5><strong>Net Maaştan Brüt Maaşa:</strong></h5>
                <p>Simülatör, bu denklemi tersine çözmek için gelişmiş bir sayısal analiz (ikili arama) yöntemi kullanır.</p>
                
                <h5><strong>Toplam Prim Gideri:</strong></h5>
                <pre><code>Prim Gideri = PEK Tavanı × 0.335 (%15 işçi + %16.5 işveren + %2 işsizlik)</code></pre>
                
                <h5><strong>Vergi Yükü:</strong></h5>
                <pre><code>Vergi Yükü = Gelir Vergisi + Damga Vergisi</code></pre>
                
                <hr style="margin: 2em 0; border: 1px solid #e5e7eb;">
                
                <h4>Model B: Şahıs Şirketi Sahibi (Bağ-Kur)</h4>
                
                <h5><strong>Temel Değerler:</strong></h5>
                <ul>
                    <li><pre><code>Hasılat = Model A'daki hesaplanan Brüt Maaş</code></pre></li>
                    <li><pre><code>Kâr = Hasılat - Şirket Giderleri</code></pre></li>
                    <li><pre><code>Bağ-Kur PEK = Slider ile seçilen 'Prim Kazancı'</code></pre></li>
                    <li><pre><code>Hesaplanan Prim Gideri = Bağ-Kur PEK × 0.295</code></pre></li>
                </ul>
                
                <h5><strong>Vergi Matrahı Hesaplama Sırası:</strong></h5>
                <ol>
                    <li><pre><code>Başlangıç Matrahı = Kâr - Hesaplanan Bağ-Kur Primi</code></pre></li>
                    <li><pre><code>Genç Girişimci İstisnası: Matrah = max(0, Matrah - 150.000)</code></pre></li>
                    <li><strong>Hizmet İhracatı İstisnası (%80 İndirim):</strong>
                        <ul>
                            <li><pre><code>İstisna Tutarı = Matrah × 0.80</code></pre></li>
                            <li><pre><code>Final Matrah = Matrah - İstisna Tutarı</code></pre></li>
                            <li><small>Not: 2025 yılında limit bulunmamaktadır</small></li>
                        </ul>
                    </li>
                    <li><pre><code><strong>Gelir Vergisi = Ücret Dışı Kazanç Tarife(Final Matrah)</strong></code></pre></li>
                </ol>
                
                <h5><strong>Ödenecek Prim (Genç Girişimci Desteği ile):</strong></h5>
                <ul>
                    <li><strong>Normal Durum:</strong>
                        <pre><code>Ödenecek Prim = Bağ-Kur PEK × 0.295</code></pre>
                    </li>
                    <li><strong>Genç Girişimci Desteği ile:</strong>
                        <pre><code>Hesaplanan Prim = Bağ-Kur PEK × 0.295</code></pre>
                        <pre><code>Minimum Prim Desteği = 312.066 × 0.295 = 92.059 TL</code></pre>
                        <pre><code>Ödenecek Prim = max(0, Hesaplanan Prim - 92.059)</code></pre>
                        <p><small>(Devlet minimum primi karşılar, fazlası kişi tarafından ödenir)</small></p>
                    </li>
                </ul>
                
                <h5><strong>Final Hesaplama:</strong></h5>
                <pre><code><strong>Net Gelir = Kâr - Ödenecek Prim - Gelir Vergisi</strong></code></pre>
                <p><small><strong>Not:</strong> "Ödenecek Prim" yukarıdaki Genç Girişimci desteği hesaplamasına göre belirlenir.</small></p>
            `,
    };
  }

  initializeAccordion() {
    // Performance optimization: Use DocumentFragment for batch DOM updates
    const fragment = document.createDocumentFragment();

    Object.keys(this.reportContent).forEach((title) => {
      const item = document.createElement("div");
      item.className =
        "accordion-item border rounded-lg bg-white overflow-hidden";
      item.innerHTML = `
                <button class="accordion-button w-full flex justify-between items-center text-left p-4 font-semibold text-lg text-gray-800 bg-gray-50 hover:bg-gray-100 transition" aria-expanded="false">
                    <span>${title}</span>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div class="accordion-content" data-expanded="false">
                    <div class="prose max-w-none p-4">${this.reportContent[title]}</div>
                </div>
            `;
      fragment.appendChild(item);
    });

    // Single DOM update instead of multiple appendChild calls
    this.elements.accordionContainer.appendChild(fragment);
  }
  // SGK calculation methods
  calculateSGKSabitNetMaas(hedefAylikNetMaas, zamParametreleri = null) {
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
        ay
      );

      const aylikPekTavan = this.constants.AYLIK_PEK_TAVAN;
      const sgkMatrahi = Math.min(ayinBrutu, aylikPekTavan);
      const sgkIsciPayi = sgkMatrahi * this.constants.SGK_ISCI_PAYI_ORANI;
      const aylikGelirVergisiMatrahi = sgkMatrahi - sgkIsciPayi;

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
    mevcutAy = 1
  ) {
    if (aylikNet <= 0) return 0;
    let low = aylikNet;
    let high = aylikNet * 3;
    let brutGuess = 0;

    for (let i = 0; i < 100; i++) {
      brutGuess = (low + high) / 2;

      const sgkMatrahi = Math.min(brutGuess, this.constants.AYLIK_PEK_TAVAN);
      const sgkIsciPayi = sgkMatrahi * this.constants.SGK_ISCI_PAYI_ORANI;
      const aylikGelirVergisiMatrahi = sgkMatrahi - sgkIsciPayi;

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
        brutGuess - (sgkIsciPayi + buAyinVergisi + damgaVergisi);

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
      const yillikNetMaas = this.state.baseAylikNetMaasTRY * 12;
      const yillikBrutMaas = this.calculateBrutFromNet(yillikNetMaas);
      const yillikGiderTRY = this.state.baseAylikGiderTRY * 12;
      const yillikBagkurKazanciTRY = this.state.baseAylikBagkurPekTRY * 12;

      const isGencGirisimci = this.elements.gencGirisimciCheck.checked;
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

      this.elements.resultsPanel.innerHTML = "";

      // Model A - SGK calculation
      const aylikNetMaasHedefi = this.state.baseAylikNetMaasTRY;
      const sgkSabitNetData = this.calculateSGKSabitNetMaas(
        aylikNetMaasHedefi,
        zamParametreleri
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
      const toplamPrimGideriA =
        sgkMatrahiA *
        (this.constants.SGK_ISCI_PAYI_ORANI + sgkIsverenOrani + 0.02);

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

      this.elements.resultsPanel.innerHTML += this.createResultCard(
        "Model A: Maaşlı Çalışan (SGK - 4a)",
        netGelirA,
        toplamPrimGideriA,
        toplamVergiYukuA,
        yillikBrutMaasYeni,
        false,
        false,
        0,
        sgkDetaylari
      );

      // Model B calculation
      // Correction for accurate revenue during mid-year salary increases
      const yillikHasilat = yillikBrutMaasYeni;
      const karB = yillikHasilat - yillikGiderTRY;
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
      } else {
        odenecekBagkurPrimi = isGencGirisimci
          ? Math.max(0, yillikBagkurPrimiHesaplanan - yillikMinimumBagkurPrimi)
          : yillikBagkurPrimiHesaplanan;
      }

      let vergiMatrahiB = Math.max(0, karB - yillikBagkurPrimiHesaplanan);

      if (isGencGirisimci) {
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

      this.elements.resultsPanel.innerHTML += this.createResultCard(
        "Model B: Şahıs Şirketi Sahibi (Bağ-Kur - 4b)",
        netGelirB,
        odenecekBagkurPrimi,
        yillikGelirVergisiB,
        yillikHasilat,
        isGencGirisimci,
        isHizmetIhracati,
        hizmetIhracatiIstisnaTutari
      );

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
    isGencGirisimci = false,
    isHizmetIhracati = false,
    hizmetIhracatiIstisnaTutari = 0,
    sgkDetaylari = null
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
      if (title.includes("Model B") && isGencGirisimci) {
        const yillikMinimumBagkurPrimi =
          this.constants.YILLIK_MIN_BAGKUR_KAZANCI *
          this.constants.BAGKUR_INDIRIMLI_ORAN;
        const destekMiktari = yillikMinimumBagkurPrimi / divisor;
        const displayDestek =
          this.state.currentCurrency === "TRY"
            ? destekMiktari
            : destekMiktari / this.state.usdRate;
        tesvikNotlari += `<p class="text-xs text-green-600 mt-2 text-center">Genç Girişimci Desteği uygulandı (${timeLabel} ~${this.formatCurrency(
          displayDestek,
          this.state.currentCurrency
        )} prim devlet tarafından karşılanır).</p>`;
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
      if (sgkDetaylari && title.includes("Model A")) {
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

        sgkDetayHTML += `
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
      }

      return `<div class="card p-6">
                <h3 class="text-xl font-bold text-gray-800">${title}</h3>
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
                <div class="mt-4">
                    <p class="text-sm text-gray-500 text-center">Gelire Oranla Net Kârlılık</p>
                    <div class="level-bar-container mt-2">
                        <div class="level-bar level-${scoreLevel}" style="width: ${score}%;">${scoreText}</div>
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
    this.state.baseAylikNetMaasTRY = isNaN(netMaasVal)
      ? 0
      : this.state.currentMode === "yearly"
      ? netMaasVal / 12
      : netMaasVal;

    const giderVal = parseFloat(this.elements.giderInput.value);
    this.state.baseAylikGiderTRY = isNaN(giderVal)
      ? 0
      : this.state.currentMode === "yearly"
      ? giderVal / 12
      : giderVal;

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
    this.elements.giderInput.value = Math.round(
      this.state.baseAylikGiderTRY * timeMultiplier
    );

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

    const brutToShow = (yillikBrut / 12) * timeMultiplier;
    this.elements.hesaplananBrutInput.value = this.formatCurrency(
      this.state.currentCurrency === "TRY"
        ? brutToShow
        : brutToShow / this.state.usdRate,
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
      this.elements.giderInput,
      this.elements.sgkMuafiyetiCheck,
      this.elements.gencGirisimciCheck,
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
  async initialize() {
    await this.fetchExchangeRates();

    this.state.currentMode = "monthly";
    this.state.currentCurrency = "TRY";

    this.elements.aylikBtn.classList.add("active");
    this.elements.yillikBtn.classList.remove("active");
    this.elements.tryBtn.classList.add("active");
    this.elements.usdBtn.classList.remove("active");

    this.elements.modeLabels.forEach((label) => {
      label.textContent = "Aylık";
    });
    this.elements.currencyLabels.forEach((label) => {
      label.textContent = "TRY";
    });

    this.elements.netMaasInput.value = 67050;
    this.elements.giderInput.value = 8000;

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
});
