// ========================================================================
// Rapor Bölümleri
// Her bölüm, daha kolay yönetilebilmesi için ayrı bir sabite atanmıştır.
// ========================================================================

const reportKullanimKilavuzu = {
    title: "Simülatör Kullanım Kılavuzu",
    type: "info", // Bilgilendirme
    content: `
          <h4>Bu Simülatör Ne Yapar?</h4>
          <p>Bu araç, Türkiye'de çalışanların iki temel kariyer modelini finansal olarak karşılaştırmasını sağlar: <strong>Maaşlı Çalışan</strong> ve <strong>Freelance/Şahıs Şirketi Sahibi</strong>.</p>
          
  <div class="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 rounded-lg p-4 my-4 dark:text-gray-100">
    <p><strong>📋 Not:</strong> Bu hesaplama aracı genel olarak tüm meslekler için kullanılabilir. Özellikle bilgi işçiliği, danışmanlık, tasarım, eğitim ve benzeri hizmet sektörlerinde çalışanlar için optimize edilmiştir. İstisnai imalat ve ağır sanayi gibi özel düzenlemelerin olduğu sektörlerde farklı kurallar geçerli olabilir.</p>
  </div>
          
          <h4>Nasıl Kullanılır?</h4>
          <ol>
              <li><strong>Net Maaşınızı Girin:</strong> Mevcut veya hedeflediğiniz aylık net maaşı TL olarak girin.</li>
              <li><strong>Karşılaştırma Bazını Seçin:</strong> Simülasyonun "Brüt Maaş" üzerinden mi, yoksa işverenin tüm prim paylarını içeren "İşveren Maliyeti" üzerinden mi yapılacağını seçin. Bu, Model B'nin hasılatını belirler.</li>
              <li><strong>Hesaplanan Değeri Gözlemleyin:</strong> Simülatör, seçtiğiniz baza göre brüt maaşı veya işverene toplam maliyeti otomatik olarak hesaplar.</li>
              <li><strong>Freelance Giderlerinizi Belirleyin:</strong> SaaS abonelikleri, donanım, ev ofis giderleri gibi işle ilgili aylık masraflarınızı girin.</li>
              <li><strong>Emeklilik Stratejinizi Seçin:</strong> Emeklilik haklarınızın maaşlı çalışandaki seviyeyi koruması için otomatik ayar kullanabilir veya manuel olarak ayarlayabilirsiniz.</li>
              <li><strong>Teşvikleri Uygulayın:</strong> 29 yaş altıysanız ve ilk şirketinizse 'Genç Girişimci' teşvikini, yurtdışına hizmet veriyorsanız 'Hizmet İhracatı' teşvikini aktif bırakın.</li>
              <li><strong>Sonuçları Karşılaştırın:</strong> İki model arasındaki net gelir, prim gideri ve vergi yükü farkını inceleyin.</li>
          </ol>
      `,
  };
  
  const reportIsverenMaliyetiUyari = {
    title: "İşveren Maliyeti Modu Hakkında Uyarı",
    type: "warning", // Uyarı
    content: `
  <div class="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 dark:border-blue-600 p-4 my-4 rounded dark:text-gray-100">
    <span class="font-bold text-blue-900 dark:text-blue-200">ℹ️ Bilgilendirme:</span> "İşveren Maliyeti" (TCE) modunda, Model B'de hasılatınız işverenin toplam maliyetine eşitlenir. Bu, gerçek dünyada nadiren %100 oranında gerçekleşir ve en iyi senaryoyu yansıtır. Pazarlık gücünüz, müşteri portföyünüz ve piyasa koşulları bu oranın altına düşebilir. Kendi işinizi kurarken bu iyimserliği göz önünde bulundurun.<br><br>
    <span class="font-semibold">Pratikte, bir pozisyon için ayrılan toplam bütçenin %85-95'ini hedeflemek, müzakereler için daha gerçekçi bir başlangıç noktası olabilir. Ancak, güçlü bir pazarlık ve değer önerisiyle %100'e yakın bir oran da elde edebilirsiniz.</span>
  </div>
  `,
  };
  
  const reportBagKur7200Reformu = {
    title: "Bağ-Kur 7200 Gün Reformu ve Emeklilik Şartları",
    type: "success", // Olumlu değişiklik
    content: `
  <div class="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-400 dark:border-green-600 p-4 my-4 rounded dark:text-gray-100">
    <span class="font-bold text-green-900 dark:text-green-200">🔄 Beklenen Yasal Değişiklik:</span> Bağ-Kur'lular için gerekli olan <b>9000 prim günü</b> şartının, SGK'lılar gibi <b>7200 güne</b> düşürülmesine yönelik yasal düzenleme 2025'te gündemdedir. Bu reform gerçekleşirse, serbest meslek sahiplerinin emeklilikteki en büyük dezavantajı ortadan kalkacak ve iki sistem neredeyse eşitlenecektir. <b>Uzun vadeli planlarınızda bu değişikliği dikkate alın.</b>
  </div>
  `,
  };
  
  const reportSirketlesmeZamani = {
    title: "Ne Zaman Şirketleşmeli? Şahıs vs. Limited",
    type: "info", // Bilgilendirme
    content: `
  <div class="bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-400 dark:border-purple-600 p-4 my-4 rounded dark:text-gray-100">
    <span class="font-bold text-purple-900 dark:text-purple-200">💡 Bilgilendirme:</span> Şahıs şirketi, küçük ve orta ölçekli girişimler için hızlı ve düşük maliyetli bir başlangıç sunar. Ancak geliriniz arttıkça, artan oranlı gelir vergisi (%15-%40) nedeniyle vergi yükünüz hızla artar. <b>Limited/Anonim şirketlerde</b> ise sabit kurumlar vergisi (%25) uygulanır, ancak temettü çekmek için ek vergi ödersiniz. <br><br>
    <b>Genel kural:</b> Yıllık net kârınız 2 milyon TL'yi aşıyorsa, şirketleşmeyi (limited/anonim) düşünmeye başlayın. Şahıs şirketi, belirli bir eşiğe kadar avantajlıdır; sonrasında vergi planlaması için şirketleşme gereklidir.
  </div>
  `,
  };
  
  const reportSorumlulukMatrisi = {
    title: "Finansal Sorumluluk Matrisi: Maaşlı vs. Serbest Çalışan",
    type: "info", // Bilgilendirme
    content: `
  <div class="overflow-x-auto">
  <table class="min-w-full text-xs text-left border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded dark:text-gray-100">
    <thead class="bg-gray-100 dark:bg-gray-700">
      <tr>
        <th class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-100">Finansal Görev/Fayda</th>
        <th class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-100">Model A: Maaşlı Çalışan (4a)</th>
        <th class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-100">Model B: Serbest Çalışan (4b)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">Gelir Vergisi Beyanı</td>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">İşveren tarafından yönetilir ve ödenir</td>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">Birey tarafından yönetilir ve ödenir (Üç Aylık ve Yıllık)</td>
      </tr>
      <tr>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">KDV Yönetimi</td>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">Uygulanmaz</td>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">Birey tarafından yönetilir ve ödenir (Aylık)</td>
      </tr>
      <tr>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">Sosyal Güvenlik Primleri</td>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">İşveren tarafından ödenir (çalışan katkısıyla)</td>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">Tamamen Birey tarafından ödenir (Aylık)</td>
      </tr>
      <tr>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">Kıdem Tazminatı</td>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">Yasal hak, İşveren tarafından finanse edilir</td>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">Yasal hak yok, Birey tarafından kendi kendine finanse edilmelidir</td>
      </tr>
      <tr>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">Ücretli Hastalık İzni</td>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">Yasal hak, İşveren/SGK tarafından finanse edilir</td>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">Hak yok (iş kazaları hariç), Bireyin birikimleriyle karşılanmalıdır</td>
      </tr>
      <tr>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">İşsizlik Sigortası</td>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">Kapsam dahilinde</td>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">Kapsam dışı</td>
      </tr>
      <tr>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">İşletme Giderleri</td>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">Genellikle indirilemez</td>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">Tamamen Birey tarafından indirilebilir</td>
      </tr>
      <tr>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">İdari Yük</td>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">Düşük</td>
        <td class="p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-200">Yüksek (Faturalama, defter tutma, vergi beyanları)</td>
      </tr>
    </tbody>
  </table>
  </div>
  `,
  };
  
  const reportModelADetaylari = {
    title: "Model A: Maaşlı Çalışan (SGK - 4a) Detayları",
    type: "info", // Bilgilendirme
    content: `
          <p>Bu model, bir işverene hizmet akdiyle bağlı olarak çalışmayı ve sosyal güvencenin 4a (SGK) kapsamında sağlanmasını ifade eder. Finansal yapı, brüt maaş üzerinden yapılan yasal kesintilerle belirlenir.</p>
          <h4>Gelir ve Kesintiler</h4>
          <ul>
              <li><strong>Brüt Maaş:</strong> İşverenle anlaşılan, kesintiler yapılmamış toplam ücret. Bu tutar aynı zamanda SGK'ya bildirilen Prime Esas Kazanç'tır (PEK).</li>
               <li><strong>SGK Primi İşçi Payı (%15):</strong> %14 SGK primi ve %1 işsizlik sigortası primi olmak üzere brüt maaştan kesilir.</li>
               <li><strong>SGK Primi İşveren Payı (%17.75):</strong> Yasal olarak %20.75 olan SGK işveren payı, 5 puanlık Hazine teşviki ile %15.75'e düşer. Buna %2'lik işsizlik sigortası işveren payı da eklenince, işverenin brüt maaşa ek olarak ödediği toplam oran %17.75 olur.</li>
               <li><strong>İşverene Toplam Maliyet:</strong> Brüt Maaş + SGK İşveren Payı (%15.75) + İşsizlik Sigortası İşveren Payı (%2). Bu, bir çalışanın işverene olan gerçek ekonomik maliyetidir.</li>
               <li><strong>Gelir Vergisi Matrahı:</strong> Brüt maaştan SGK işçi primi (%15) düşüldükten sonra kalan tutardır (PEK tavanı uygulanır).</li>
               <li><strong>Gelir Vergisi:</strong> Matrah üzerinden, Gelir Vergisi Kanunu'ndaki artan oranlı tarifeye (%15'ten başlar) göre hesaplanır. Yıl içinde kümülatif matrah arttıkça vergi oranı da yükselir. Asgari ücret gelir vergisi istisnası uygulanır.</li>
               <li><strong>Damga Vergisi:</strong> Asgari ücreti aşan brüt maaş kısmı üzerinden binde 7,59 oranında kesilir.</li>
               <li><strong>Net Maaş:</strong> Brüt maaştan işçi payı primleri, gelir vergisi ve damga vergisi kesintileri yapıldıktan sonra çalışanın eline geçen tutardır.</li>
          </ul>
             
        <h4>Avantajları ve Dezavantajları</h4>
    <div class="space-y-2 text-sm">
        <p><strong>Avantajlar:</strong> İş güvenliği ve düzenli gelir, otomatik vergi ve prim kesintileri (yönetim yükü yok), kıdem ve ihbar tazminatı gibi yasal güvenceler, ücretli hastalık izni (rapor parası), işsizlik sigortası, düşük idari yük.</p>
        <p><strong>Dezavantajlar:</strong> Gelir potansiyeli sınırlı (işverenin belirlediği maaş), işle ilgili giderleri vergiden düşememe, vergi teşviklerinden (Genç Girişimci, Hizmet İhracatı) yararlanamama, emeklilik priminde esneklik yok (işveren belirler), bağımlılık ilişkisi.</p>
    </div>
         `,
  };
  
  const reportModelBDetaylari = {
    title: "Model B: Şahıs Şirketi Sahibi (Bağ-Kur - 4b) Detayları",
    type: "info", // Bilgilendirme
    content: `
          <p>Bu model, kendi adınıza bir şahıs şirketi (serbest meslek mükellefiyeti) kurarak mal veya hizmet satmayı ve sosyal güvencenin 4b (Bağ-Kur) kapsamında sağlanmasını ifade eder. Gelir, fatura edilen hasılattan giderler, primler ve vergiler düşülerek hesaplanır.</p>
             
          <h4>Gelir ve Giderler</h4>
          <ul>
               <li><strong>Hasılat:</strong> Müşterilerinize kestiğiniz faturaların KDV hariç toplam tutarıdır. Simülatör bu değeri, seçiminize göre Model A'daki Brüt Maaş'a veya İşverene Toplam Maliyet'e eşitler.</li>
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
              <li><strong>Kıdem tazminatı ve ihbar tazminatı gibi yasal güvencelerin olmaması.</li>
              <li>İş kazası ve analık halleri dışında, genel hastalık durumlarında iş göremezlik ödeneği (rapor parası) alınamaması.</li> 
          </ul>
         `,
  };
  
  const reportModelBAvantajlar = {
    title: "Model B İçin Kritik Avantajlar: Giderler ve Teşvikler",
    type: "success", // Olumlu/avantaj
    content: `
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
              <li><strong>Gelir Vergisi İstisnası:</strong> 3 yıl boyunca, yıllık kazancın <strong>330.000 TL'lik kısmı gelir vergisinden muaftır</strong> (2025 yılı için).</li>
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
  };
  
  const reportModelBRiskleri = {
    title: "Model B'nin Gizli Sorumlulukları ve Riskleri",
    type: "warning", // Uyarı
    content: `
          <p>Şahıs şirketi kurmak önemli finansal avantajlar sunsa da, maaşlı çalışanın alışık olmadığı bazı "gizli" sorumluluklar ve riskler içerir. Bu konuları önceden bilmek, sürprizlerle karşılaşmadan sağlam bir finansal plan yapmanızı sağlar.</p>
          
          <h4 class="mt-6 font-bold text-lg text-yellow-800 dark:text-yellow-200">1. KDV ve Geçici Vergi Yükümlülükleri</h4>
          <div class="bg-yellow-100 dark:bg-yellow-900/40 border-l-4 border-yellow-400 dark:border-yellow-700 p-4 my-4 rounded dark:text-gray-100">
            <span class="font-bold text-yellow-900 dark:text-yellow-200">⚠️ Kritik Uyarı:</span> Şahıs şirketi olarak kestiğiniz <span class="font-semibold">her faturada</span> çoğu hizmet için <span class="font-semibold">%20 KDV</span> eklemek zorundasınız. Bu KDV, sizin geliriniz değildir; devlet adına tahsil ettiğiniz ve <span class="font-semibold">her ay</span> beyan edip ödemeniz gereken <span class="font-semibold">emanet paradır</span>.<br><br>
            <span class="font-semibold">KDV'yi nakit akışınıza dahil etmeyin!</span> KDV'yi ayrı bir hesapta tutmak, vergi zamanı nakit sıkışıklığı yaşamamanız için şarttır.<br><br>
            <span class="font-semibold">Geçici Vergi:</span> Yıllık gelir vergisi, yıl sonunda tek seferde ödenmez. Her yıl <span class="font-semibold">Mayıs, Ağustos ve Kasım</span> aylarında, son 3 aylık kârınıza göre <span class="font-semibold">geçici vergi</span> ödersiniz. Bu büyük, toplu ödemelere hazırlıklı olun. Simülatör, bu yükümlülükleri <span class="font-semibold">nakit akışınızda dikkate almanız</span> için uyarı verir.
          </div>
  
  <h4 class="mt-6">2. Kaybedilen Sosyal Haklar ve Telafi Stratejileri</h4>
  <p>4A'lı bir çalışanın işvereni tarafından finanse edilen ve genellikle fark edilmeyen bazı önemli sosyal hakları vardır. 4B'li olduğunuzda bu haklar ortadan kalkar ve bunları kendiniz telafi etmelisiniz.</p>
  <ul>
    <li><strong>Kıdem Tazminatı:</strong> 4A'lıların yasal hakkı olan kıdem tazminatı, 4B'liler için mevcut değildir. <b>Bu hakkı telafi etmek için, her ay KDV hariç hasılatınızın en az <u>%8,33'ünü (1/12'sini)</u> "Kişisel Kıdem Fonu" olarak biriktirin.</b> Simülatör, bu tutarı isteğe bağlı olarak net gelirden düşerek daha gerçekçi bir harcanabilir gelir gösterebilir.</li>
    <li><strong>Acil Durum Fonu:</strong> 4B'liler genel hastalıklarda <b>rapor parası alamaz</b>. <b>En az 3-6 aylık temel yaşam ve işletme giderinizi karşılayacak bir "Acil Durum Fonu" oluşturun.</b> Bu fon, hastalık, müşteri kaybı veya ekonomik kriz gibi beklenmedik durumlarda finansal güvenliğiniz için zorunludur.</li>
  </ul>
  
          <h4 class="mt-6">3. Hibrit Çalışma ve Statü Değişiklikleri</h4>
          <p>Şahıs şirketinizi açık tutarken tekrar 4A'lı olarak maaşlı bir işe başlayabilirsiniz. Bu durumda bilmeniz gerekenler:</p>
          <ul>
              <li><strong>Bağ-Kur Primi Durur:</strong> 5510 sayılı kanun gereği 4A sigortası önceliklidir. 4A'lı olduğunuz sürece Bağ-Kur primi ödemezsiniz (SGK Muafiyeti).</li>
              <li><strong>Şirket Giderleri Devam Eder:</strong> Şirketinizi yasal olarak kapatmadığınız (terk-i faaliyet bildirimi yapmadığınız) sürece, şirket "faal" kabul edilir. Hiç fatura kesmeseniz bile, mali müşavirinize aylık ücretini ödemeye ve boş beyannameler için damga vergilerini karşılamaya devam etmeniz gerekir. Şirketi kapatmanın da kendine ait bir prosedürü ve maliyeti olduğunu unutmayın.</li>
          </ul>
      `,
  };
  
  const reportBagKurKavramlari = {
    title: "Önemli Kavram: Bağ-Kur Prim Kazancı vs. Prim Gideri",
    type: "info", // Bilgilendirme
    content: `
          <h4>Bu İki Kavram Neden Farklı?</h4>
          <p>Simülatördeki en önemli ayrım, 'Bağ-Kur Prim Kazancı' ile 'Toplam Prim Gideri' arasındaki farktır. Bu farkı anlamak, Model B'nin finansal yapısını çözmek için anahtardır.</p>
          
          <ul>
              <li><strong>Bağ-Kur Prim Kazancı (PEK):</strong> Bu, slider ile ayarladığınız tutardır. Cebinizden çıkan para <strong>değildir</strong>. Bu, SGK'daki 'Brüt Maaş'ın karşılığıdır ve gelecekteki emekli maaşınızın hesaplanacağı <strong>baz tutardır</strong>. Rakam ne kadar yüksekse, emekliliğiniz o kadar güçlü olur.</li>
              <li><strong>Toplam Prim Gideri:</strong> Bu, sonuç kartında gördüğünüz ve her ay cebinizden <strong>fiilen çıkacak olan net ödeme tutarıdır</strong>. Bu tutar, yukarıda belirlediğiniz 'Bağ-Kur Prim Kazancı'nın yaklaşık <strong>%29,5</strong>'i alınarak hesaplanır.</li>
          </ul>
          
          <h4>Örnek:</h4>
          <p>Eğer 'Bağ-Kur Prim Kazancı'nı 100.000 TL olarak belirlerseniz, bu 100.000 TL brüt maaş üzerinden emekli olmayı hedeflediğiniz anlamına gelir. Bu hedef için her ay cebinizden çıkacak olan prim ödemesi ise yaklaşık 29.500 TL olacaktır.</p>
      `,
  };
  
  const reportEmeklilikKarsilastirmasi = {
    title: "Emeklilik Hakları: SGK vs Bağ-Kur Karşılaştırması",
    type: "info", // Bilgilendirme
    content: `
          <h4>Emeklilik Maaşı Hesaplama Formülü (Her İki Sistemde Aynı)</h4>
          <div class="bg-sky-50 dark:bg-sky-900/30 p-4 rounded-lg mb-6 border-l-4 border-sky-400 dark:border-sky-600">
               <pre class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded border border-gray-300 dark:border-gray-700"><code class="text-gray-900 dark:text-gray-100"><strong>Emekli Maaşı = (Toplam Prim Gün Sayısı × Ortalama PEK × Yaş Katsayısı) ÷ 365</strong></code></pre>
               <p class="mt-2 text-[0.9em] text-gray-700 dark:text-gray-200"><strong>Yaş Katsayısı:</strong> 65 yaşında %100, her ay erken emeklilikte %0.5 azalır</p>
          </div>
             
          <h4>🚨 Kritik Fark: Prim Oranları ve Gerçek Ödemeler</h4>
             
          <h5><strong>SGK (4a) - Maaşlı Çalışan:</strong></h5>
          <ul>
               <li><strong>Toplam Sistem Primi:</strong> %32.75 (İşçi %15 + İşveren %17.75)</li>
               <li><strong>Kişisel Maliyet:</strong> Sadece %15 (işçi payı) çalışanın maaşından kesilir.</li>
               <li><strong>İşveren Katkısı:</strong> %17.75'lik kısım işveren tarafından karşılanır.</li>
               <li><strong>Prim Güvenilirliği:</strong> Otomatik kesinti, eksik ödeme riski yok.</li>
               <li><strong>Emeklilik Yaşı:</strong> Koşullara göre değişir (Simülatörde 65 yaş baz alınmıştır).</li>
          </ul>
             
          <h5><strong>Bağ-Kur (4b) - Şahıs Şirketi Sahibi:</strong></h5>
          <ul>
               <li><strong>Toplam Prim Oranı:</strong> %29.5 (düzenli ödemede, normal %34.5)</li>
               <li><strong>Kişisel Maliyet:</strong> %29.5'in tamamı kişi tarafından ödenir.</li>
               <li><strong>Devlet Katkısı:</strong> Yok (Genç Girişimci desteği hariç).</li>
               <li><strong>Prim Güvenilirliği:</strong> Kişisel sorumluluk, gecikme/eksik ödeme riski var.</li>
               <li><strong>Emeklilik Yaşı:</strong> Koşullara göre değişir (Simülatörde 65 yaş baz alınmıştır).</li>
          </ul>
             
          <h4>💰 Pratik Örnek: 100.000 TL PEK Üzerinden</h4>
          <table class="w-full border-collapse my-4 dark:text-gray-100">
               <tr class="bg-gray-50 dark:bg-gray-700 font-bold">
                    <th class="border border-gray-300 dark:border-gray-600 p-2 text-left dark:text-gray-100">Kriter</th>
                    <th class="border border-gray-300 dark:border-gray-600 p-2 text-center dark:text-gray-100">SGK (4a)</th>
                    <th class="border border-gray-300 dark:border-gray-600 p-2 text-center dark:text-gray-100">Bağ-Kur (4b)</th>
               </tr>
               <tr>
                    <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200"><strong>Toplam Sistem Primi</strong></td>
                    <td class="border border-gray-300 dark:border-gray-600 p-2 text-center dark:text-gray-200">₺32.750 (%32.75)</td>
                    <td class="border border-gray-300 dark:border-gray-600 p-2 text-center dark:text-gray-200">₺29.500 (%29.5)</td>
               </tr>
               <tr class="bg-yellow-100 dark:bg-yellow-900/40 dark:text-gray-100">
                    <td class="border border-gray-300 dark:border-gray-600 p-2"><strong>Kişinin Ödediği</strong></td>
                    <td class="border border-gray-300 dark:border-gray-600 p-2 text-center">₺15.000 (%15)</td>
                    <td class="border border-gray-300 dark:border-gray-600 p-2 text-center">₺29.500 (%29.5)</td>
               </tr>
               <tr>
                    <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200"><strong>İşverenin Ödediği</strong></td>
                    <td class="border border-gray-300 dark:border-gray-600 p-2 text-center dark:text-gray-200">₺17.750 (%17.75)</td>
                    <td class="border border-gray-300 dark:border-gray-600 p-2 text-center dark:text-gray-200">₺0</td>
               </tr>
               <tr class="bg-green-100 dark:bg-green-900/40 dark:text-gray-100">
                    <td class="border border-gray-300 dark:border-gray-600 p-2"><strong>Beklenen Emekli Maaşı</strong></td>
                    <td class="border border-gray-300 dark:border-gray-600 p-2 text-center">Teorik olarak aynı*</td>
                    <td class="border border-gray-300 dark:border-gray-600 p-2 text-center">Teorik olarak aynı*</td>
               </tr>
          </table>
             
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2"><strong>*Not:</strong> Aynı PEK ve aynı prim gün sayısında teorik olarak aynı emekli maaşı alırsınız.</p>
             
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
             
          <div class="bg-sky-50 dark:bg-sky-900/30 border border-sky-400 dark:border-sky-600 rounded-lg p-4 my-4">
               <h6 class="mt-0 text-sky-900 dark:text-sky-200"><strong>🔄 Beklenen Yasal Düzenleme (2025):</strong></h6>
               <p class="mb-0 text-[0.9em] text-sky-800 dark:text-sky-200">Bağ-Kur'lular için gerekli olan 9000 prim gününün, SGK'lılar gibi 7200 güne düşürülmesine yönenek yasal düzenleme beklentisi yüksektir. Bu reform gerçekleşirse, iki sistem arasındaki en büyük dezavantajlardan biri ortadan kalkacaktır.</p>
          </div>
             
          <div class="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 rounded-lg p-4 my-4 dark:text-gray-100">
               <p><strong>💡 Sonuç:</strong> Aynı PEK seviyesinde teorik olarak aynı emekli maaşı alırsınız, ancak Bağ-Kur'da kişisel disiplin çok kritiktir. SGK'nın otomatik güvencesi vs Bağ-Kur'un esnekliği arasında bilinçli bir tercih yapmalısınız.</p>
          </div>
         `,
  };
  
  const reportHizmetIhracatiRehberi = {
    title: "Şahıs Şirketi ve Hizmet İhracatı Rehberi",
    type: "info", // Bilgilendirme
    content: `
          <div class="bg-sky-50 dark:bg-sky-900/30 border-2 border-sky-400 dark:border-sky-600 rounded-xl p-6 my-8">
              <div class="flex items-center mb-4">
                  <div class="bg-sky-50 dark:bg-sky-900/300 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 font-bold">⚖️</div>
                  <h3 class="m-0 text-sky-900 dark:text-sky-200">Önemli Hukuki Uyarı</h3>
              </div>
              <p class="m-0 text-[0.9em] text-sky-800 dark:text-sky-200"><strong>Bu bölüm sadece genel bilgi amaçlıdır ve profesyonel vergi/hukuk danışmanlığı yerine geçmez.</strong> Kişisel durumunuza özgü kararlar almadan önce mutlaka uzman bir mali müşavir ve/veya vergi hukuku uzmanından danışmanlık alınız. Vergi mevzuatı sürekli değişmektedir ve bireysel durumlar farklılık gösterebilir.</p>
          </div>
  
          <h4>📋 Bölüm 1: İkili Statü Yönetimi - SGK + Bağ-Kur Kombinasyonu</h4>
          
          <h5><strong>1.1. Sigortalılık Çakışması Prensibinin Anlaşılması</strong></h5>
          <p>5510 sayılı Sosyal Sigortalar Kanunu'nun 53. maddesi gereği, bir kişinin aynı anda hem 4/a (SGK işçi sigortası) hem de 4/b (Bağ-Kur) kapsamında sigortalı olması gereken durumlarda, <strong>4/a statüsü önceliklidir</strong>.</p>
          
          <div class="bg-green-100 dark:bg-green-900/40 border-l-4 border-green-600 dark:border-green-700 p-4 my-4 dark:text-gray-100">
              <h6 class="mt-0"><strong>Pratik Avantaj:</strong></h6>
              <p class="mb-0">Mevcut SGK'lı işiniz devam ederken şahıs şirketi kurduğunuzda, yasal olarak Bağ-Kur primi ödeme yükümlülüğünüz bulunmaz. Bu, aylık yaklaşık <strong>7.671 TL</strong> (2025 minimum Bağ-Kur primi) tasarruf demektir.</p>
          </div>
          
          <h5><strong>1.2. Kritik Prosedür: Bağ-Kur Muafiyet Başvurusu</strong></h5>
          <p>Bu avantajdan yararlanmak otomatik değildir. Şirket kuruluşu sırasında:</p>
          <ul>
              <li>Mali müşaviriniz SGK müdürlüğüne başvurarak mevcut 4/a sigortalılığınızı belgeler</li>
              <li>Bağ-Kur tescilinizin yapılmamasını talep eder</li>
              <li>Bu adım atlanırsa geriye dönük borç ve ceza riski oluşur</li>
          </ul>
          
          <div class="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 rounded-lg p-4 my-4 dark:text-gray-100">
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
          <table class="w-full border-collapse my-4 text-[0.9em] dark:text-gray-100">
              <tr class="bg-gray-50 dark:bg-gray-700 font-bold">
                  <th class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-100">Senaryo</th>
                  <th class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-100">İstisna Yok</th>
                  <th class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-100">%80 İstisna</th>
              </tr>
              <tr>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200">Net Kâr</td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200">1.200.000 TL</td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200">1.200.000 TL</td>
              </tr>
              <tr>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200">Vergi Matrahı</td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200">1.200.000 TL</td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200">240.000 TL</td>
              </tr>
              <tr class="bg-yellow-100 dark:bg-yellow-900/40 dark:text-gray-100">
                  <td class="border border-gray-300 dark:border-gray-600 p-2"><strong>Gelir Vergisi</strong></td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2"><strong>~345.900 TL</strong></td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2"><strong>~58.500 TL</strong></td>
              </tr>
              <tr class="bg-green-100 dark:bg-green-900/40 dark:text-gray-100">
                  <td class="border border-gray-300 dark:border-gray-600 p-2"><strong>Vergi Tasarrufu</strong></td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2">-</td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2"><strong>287.400 TL</strong></td>
              </tr>
          </table>
          
          <h5><strong>2.2. KDV İstisnası</strong></h5>
          <p>Hizmet ihracatı %0 KDV ile "İstisna Faturası" olarak düzenlenir. Bu size %20'lik fiyat rekabeti avantajı sağlar ve nakit akışını basitleştirir.</p>
          
        <h5><strong>2.3. Genç Girişimci Desteği (29 Yaş Altı İçin)</strong></h5>
        <p>Eğer uygunluk şartlarını sağlıyorsanız, katmanlı vergi avantajı elde edebilirsiniz:</p>
        <ul>
          <li><strong>1. Katman:</strong> Yıllık 330.000 TL'ye kadar %100 gelir vergisi istisnası (3 yıl)</li>
          <li><strong>2. Katman:</strong> Bu sınırı aşan kısım %80 hizmet ihracatı istisnasına tabi</li>
          <li><strong>Bağ-Kur Prim Desteği:</strong> 1 yıl boyunca minimum prim devlet tarafından karşılanır (2025 için 26.005,50 TL x 12 x 0.295 = 92.059 TL)</li>
        </ul>
  
          <h4>📊 Bölüm 3: İndirilebilir Gider Kataloğu</h4>
          
          <p>Vergi matrahınızı yasal yollarla optimize etmenin en etkili yolu, işle ilgili tüm harcamaları doğru belgeleyerek gider göstermektir.</p>
          
          <h5><strong>3.1. Teknoloji ve Altyapı Giderleri</strong></h5>
          <table class="w-full border-collapse my-4 text-[0.9em] dark:text-gray-100">
              <tr class="bg-gray-50 dark:bg-gray-700 font-bold">
                  <th class="border border-gray-300 dark:border-gray-600 p-2 text-left dark:text-gray-100">Gider Türü</th>
                  <th class="border border-gray-300 dark:border-gray-600 p-2 text-left dark:text-gray-100">İndirilebilirlik</th>
                  <th class="border border-gray-300 dark:border-gray-600 p-2 text-left dark:text-gray-100">Örnekler</th>
              </tr>
              <tr>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200"><strong>Yazılım ve Abonelikler</strong></td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200">%100 gider</td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200">IDE lisansları, SaaS araçları, cloud servisleri</td>
              </tr>
              <tr>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200"><strong>Donanım</strong></td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200">Amortismana tabi</td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200">Bilgisayar, monitör, sunucu, ağ cihazları</td>
              </tr>
              <tr>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200"><strong>Hosting ve Domain</strong></td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200">%100 gider</td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200">Web barındırma, alan adı, SSL sertifikası</td>
              </tr>
          </table>
          
          <h5><strong>3.2. Ev Ofis (Home Office) Giderleri</strong></h5>
          <table class="w-full border-collapse my-4 text-[0.9em] dark:text-gray-100">
              <tr class="bg-gray-50 dark:bg-gray-700 font-bold">
                  <th class="border border-gray-300 dark:border-gray-600 p-2 text-left dark:text-gray-100">Gider Kalemi</th>
                  <th class="border border-gray-300 dark:border-gray-600 p-2 text-left dark:text-gray-100">Kiralık Konut</th>
                  <th class="border border-gray-300 dark:border-gray-600 p-2 text-left dark:text-gray-100">Kendi Mülkü</th>
              </tr>
              <tr>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200"><strong>Kira Bedeli</strong></td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200">%100 gider yazılabilir</td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200">Uygulanmaz</td>
              </tr>
              <tr>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200"><strong>Faturalar</strong></td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200">%50 (elektrik, su, gaz, internet)</td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200">%50 (elektrik, su, gaz, internet)</td>
              </tr>
              <tr>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200"><strong>Aidat</strong></td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200">%50 gider yazılabilir</td>
                  <td class="border border-gray-300 dark:border-gray-600 p-2 dark:text-gray-200">%50 gider yazılabilir</td>
              </tr>
          </table>
          
          <h5><strong>3.3. Ulaşım ve Seyahat Giderleri</strong></h5>
          <ul>
              <li><strong>İş Seyahatleri:</strong> Uçak/tren bileti, otel, işle ilgili yemekler (%100 gider)</li>
              <li><strong>Şehir İçi Ulaşım:</strong> Toplu taşıma abonmanları (%100 gider)</li>
              <li><strong>Şahsi Araç:</strong> Özel sınırlamalar ve oranlar uygulanır</li>
          </ul>
          
          <div class="bg-red-50 dark:bg-red-900/30 border border-red-500 dark:border-red-700 rounded-lg p-4 my-4 dark:text-gray-100">
              <h6 class="mt-0 text-red-700 dark:text-red-300"><strong>🚫 Şahsi Araç Gider Sınırları (2025):</strong></h6>
              <ul class="mb-0">
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
          
          <div class="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-700 p-4 my-4 dark:text-gray-100">
              <h6 class="mt-0"><strong>Kesinlikle Gider Gösterilemez:</strong></h6>
              <ul class="mb-0">
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
          
          <div class="bg-sky-50 dark:bg-sky-900/30 border border-sky-400 dark:border-sky-600 rounded-lg p-4 my-4">
              <h6 class="mt-0"><strong>Öncelikli Adımlar:</strong></h6>
              <ol class="mb-0">
                  <li><strong>Uzman Mali Müşavir:</strong> Teknoloji ve hizmet ihracatı deneyimli danışman seçin</li>
                  <li><strong>Bağ-Kur Muafiyeti:</strong> SGK statünüzü bildirerek muafiyet başvurusu yapın</li>
                  <li><strong>Ayrı Banka Hesabı:</strong> Şirket adına ticari hesap açın</li>
                  <li><strong>Dijital Arşiv:</strong> Belge takip sistemi kurun</li>
                  <li><strong>Hizmet Sözleşmesi:</strong> Yurt dışı şube ile resmi anlaşma imzalayın</li>
              </ol>
          </div>
          
          <div class="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 rounded-lg p-4 my-4 dark:text-gray-100">
              <p class="m-0 text-yellow-900 dark:text-yellow-200"><strong>💡 Önemli Hatırlatma:</strong> Bu rehber genel bilgilendirme amaçlıdır. Kişisel durumunuza özel kararlar için mutlaka profesyonel danışmanlık alın. Vergi mevzuatı sürekli değişir ve bireysel şartlar farklılık gösterebilir.</p>
          </div>
      `,
  };
  
  const reportGencGirisimciGelecegi = {
    title: "Genç Girişimci Desteğinin Geleceği (2026 Yasa Teklifi Analizi)",
    type: "warning", // Uyarı - gelecekteki değişiklik
    content: `
          <h4>Özet: Yasal Değişiklik Tehdidi</h4>
          <p>Simülatör kullanıcımız tarafından sağlanan ve TBMM'ye sunulan bir "Mali Torba Kanun Teklifi" analizine göre, Genç Girişimci Desteği programının geleceği belirsizdir. Mevcut teklif, programın iki ana direğinden birini doğrudan hedef almaktadır.</p>
          
          <div class="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-700 p-4 my-4 rounded dark:text-gray-100">
              <span class="font-bold text-yellow-900 dark:text-yellow-200">Mevcut Durum (2025) İki Faydayı İçerir:</span>
              <ul class="list-disc pl-5 mt-2">
                  <li><strong>Gelir Vergisi İstisnası:</strong> 3 yıl boyunca, yıllık 330.000 TL (2025) kâr için vergi muafiyeti.</li>
                  <li><strong>Bağ-Kur Prim Desteği:</strong> 12 ay boyunca Hazine tarafından ödenen Bağ-Kur primi (Yıllık ~92.000 TL tasarruf).</li>
              </ul>
          </div>
          <div class="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-700 p-4 my-4 rounded dark:text-gray-100">
              <span class="font-bold text-red-900 dark:text-red-200">Risk Altındaki Değişiklik:</span>
              <ul class="list-disc pl-5 mt-2">
                  <li><strong>Bağ-Kur Prim Desteği:</strong> Yasa teklifi, bu desteğin 2026 itibarıyla <strong>KALDIRILMASINI</strong> açıkça içermektedir.</li>
                  <li><strong>Gelir Vergisi İstisnası:</strong> Mevcut teklifte bu istisnanın kaldırılmasına dair bir madde <strong>BULUNMAMAKTADIR</strong>. Ancak geleceği belirsizliğini korumaktadır.</li>
              </ul>
          </div>
          <h4>Simülatör Nasıl Güncellendi?</h4>
          <p>Bu belirsizliği ve potansiyel gelecek senaryolarını doğru modelleyebilmeniz için, "Genç Girişimci" seçeneğini ikiye ayırdık:</p>
          <ul class="list-disc pl-5 mt-2">
              <li><strong>Genç Girişimci Vergi İstisnası</strong></li>
              <li><strong>Genç Girişimci Bağ-Kur Desteği</strong></li>
          </ul>
          
          <p><strong>2026 ve sonrası için bir senaryo analizi yapmak istiyorsanız, "Genç Girişimci Bağ-Kur Desteği" seçeneğinin işaretini kaldırarak</strong>, sadece vergi istisnasının devam ettiği "yeni normal" durumu simüle edebilirsiniz. Bu, size yasa teklifinin geçmesi durumunda Model B'nin net gelirinizi nasıl etkileyeceğini gösterecektir.</p>
      `,
  };
  
  const reportTesReformu = {
    title: "2026 TES Reformu: Kıdem Tazminatı ve Maaş Kesintisi Analizi (2026 Yasa Teklifi Analizi)",
    type: "warning", // Uyarı - gelecekteki değişiklik
    content: `
          <h4>Özet: Tamamlayıcı Emeklilik Sistemi (TES) Nedir?</h4>
          <p>Hükümetin Orta Vadeli Programı'nda (OVP) yer alan plana göre, 2026 yılının ikinci yarısında <strong>Tamamlayıcı Emeklilik Sistemi (TES)</strong> adı verilen yeni bir sistemin hayata geçirilmesi hedeflenmektedir. Bu sistem, mevcut SGK emekliliğine ek olarak ikinci bir emeklilik maaşı sağlamayı amaçlamaktadır.</p>
          
          <div class="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-700 p-4 my-4 rounded dark:text-gray-100">
              <span class="font-bold text-red-900 dark:text-red-200">TES Reformunun Simülatörümüzdeki Etkileri:</span>
              <p>Yaptığımız analize göre, bu reform <strong>sadece Model A (Maaşlı Çalışan)</strong> statüsündekileri etkileyecek, Model B (Bağ-Kur) şimdilik bu kapsama dahil edilmeyecektir.</p>
              <ul class="list-disc pl-5 mt-2">
                  <li><strong>Model A (Maaşlı) için YENİ ZORUNLU KESİNTİLER:</strong>
                      <ul class="list-disc pl-6">
                          <li><strong>%3 Çalışan Katkısı:</strong> Brüt maaşınızdan %3 oranında zorunlu TES kesintisi yapılacak. Bu, elinize geçen <strong>net maaşı doğrudan azaltacaktır.</strong></li>
                          <li><strong>~%4 İşveren Ek Maliyeti:</strong> İşvereniniz, brüt maaşınız üzerinden ek olarak ~%1 TES katkısı ve ~%3 Kıdem Fonu katkısı ödeyecek. Bu, <strong>İşverene Toplam Maliyeti (TCE) ciddi oranda artıracaktır.</strong></li>
                      </ul>
                  </li>
                  <li><strong>Model B (Bağ-Kur) için ETKİ YOK:</strong> Kendi nam ve hesabına çalışanlar (4/B) mevcut planlarda TES kapsamı dışındadır.</li>
              </ul>
          </div>

          <h4>Bu Simülatörde Nasıl Test Edebilirim?</h4>
          <p>'Seçenekler' bölümüne <strong>"2026 TES Reformu Simülasyonu (Deneysel)"</strong> adında yeni bir onay kutusu ekledik.</p>
          <ul class="list-disc pl-5 mt-2">
              <li><strong>Kutu İşaretli Değilken (Varsayılan):</strong> Simülatör, mevcut 2025 yılı yasal durumuna göre hesaplama yapar.</li>
              <li><strong>Kutuyu İşaretlediğinizde:</strong> Simülatör, Model A'nın net maaşını ve işveren maliyetini TES reformu uygulanmış gibi yeniden hesaplar. Model B ise aynı kalır.</li>
          </ul>
          <p>Bu aracı kullanarak, reformun Model A ve Model B arasındaki finansal dengeyi ne kadar güçlü bir şekilde <strong>Model B (Şahıs Şirketi) lehine</strong> değiştirdiğini kendiniz analiz edebilirsiniz.</p>
      `,
  };
  
  const reportGecisZamanlamasi = {
    title: "4A'dan 4B'ye Geçiş: Yükümlülükler ve Zaman Çizelgesi",
    type: "info", // Bilgilendirme
    content: `
          <p>Maaşlı bir işten (4A) ayrılıp tamamen kendi işinizin (4B - Şahıs Şirketi) başına geçme kararı, finansal ve yasal yükümlülüklerin zamanlamasını doğru anlamayı gerektirir. Bu bölüm, geçiş sürecindeki kritik adımları ve mali sorumluluklarınızın ne zaman başladığını netleştirmek için tasarlanmıştır.</p>
  
    <h4 class="mt-6">Temel Prensip: Yükümlülüklerin Tetiklenmesi</h4>
          <p>Unutulmaması gereken en önemli kural şudur: Bağ-Kur (4B) sigortalılığı ve buna bağlı prim ödeme yükümlülüğü, mevcut 4A sigortanızın sona ermesiyle tetiklenir. Ancak, şirketinizin yasal varlığı ve muhasebe sorumluluklarınız bu tarihten önce başlamalıdır.</p>
  
    <h5 class="mt-4">1. Mali Müşavirlik Yükümlülüğü</h5>
          <p><strong>Başlangıç Zamanı:</strong> Şirket kuruluşundan <strong>hemen önce</strong>.<br/>Türkiye'de bir şahıs şirketi kurmak için vergi dairesine kayıt yaptırmadan önce bir Serbest Muhasebeci Mali Müşavir (SMMM) ile anlaşma yapmanız yasal bir zorunluluktur. Bu nedenle, mali müşavirinize ödeyeceğiniz ücret, 4A'lı işinizden ayrılmadan önce başlayan ilk gideriniz olacaktır. Bu adımı proaktif olarak planlamalısınız.</p>
  
    <h5 class="mt-4">2. Bağ-Kur (4B) Prim Yükümlülüğü</h5>
          <p><strong>Başlangıç Zamanı:</strong> 4A sigortalılığınızın sona erdiği günü <strong>takip eden ilk gün</strong>.<br/>5510 sayılı kanun gereği, 4A sigortanız kesildiği anda sistem sizi otomatik olarak 4B'li (Bağ-Kur) olarak tescil eder. Örneğin, 31 Mayıs'ta işten ayrıldıysanız, 1 Haziran itibarıyla Bağ-Kur sigortalılığınız ve prim borcunuz işlemeye başlar. Haziran ayının primi, Temmuz ayının sonuna kadar ödenmelidir.</p>
  
    <h4 class="mt-6">Geçiş Süreci Zaman Çizelgesi</h4>
          <p>Aşağıdaki tablo, adımları ve zamanlamayı özetlemektedir:</p>
    <table class="w-full mt-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden dark:text-gray-100">
            <thead class="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th class="p-2 border-b border-gray-200 dark:border-gray-600 dark:text-gray-100">Yükümlülük</th>
                <th class="p-2 border-b border-gray-200 dark:border-gray-600 dark:text-gray-100">Başlangıç Zamanı</th>
                <th class="p-2 border-b border-gray-200 dark:border-gray-600 dark:text-gray-100">Önemli Notlar ve Eylem Planı</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="p-2 dark:text-gray-200">Mali Müşavir Sözleşmesi</td>
                <td class="p-2 dark:text-gray-200">Şirket kuruluşundan önce.</td>
                <td class="p-2 dark:text-gray-200">İlk maliyet, 4A maaşınız devam ederken ortaya çıkar. Bütçenize ekleyin.</td>
              </tr>
              <tr>
                <td class="p-2 dark:text-gray-200">Şirket Kuruluşu</td>
                <td class="p-2 dark:text-gray-200">4A işten ayrılmadan hemen önce.</td>
                <td class="p-2 dark:text-gray-200">İş sürekliliği ve ilk faturanızı kesebilmek için kritik adımdır.</td>
              </tr>
              <tr>
                <td class="p-2 dark:text-gray-200">Bağ-Kur (4B) Sigortalılığı</td>
                <td class="p-2 dark:text-gray-200">4A sigortalılığının bittiği günü takip eden ilk gün.</td>
                <td class="p-2 dark:text-gray-200">Otomatik olarak başlar. SGK'ya ayrıca bir bildirim gerekmez, sistemler entegredir.</td>
              </tr>
              <tr>
                <td class="p-2 dark:text-gray-200">İlk Bağ-Kur Prim Ödemesi</td>
                <td class="p-2 dark:text-gray-200">Başlangıç ayını takip eden ayın sonu.</td>
                <td class="p-2 dark:text-gray-200">Örn: Haziran'da başladıysanız, ilk ödeme Temmuz sonuna kadardır.</td>
              </tr>
              <tr>
                <td class="p-2 dark:text-gray-200">İlk KDV Beyannamesi</td>
                <td class="p-2 dark:text-gray-200">Faaliyete başlanan ayı takip eden ayın 28'i.</td>
                <td class="p-2 dark:text-gray-200">Fatura kesmeye başladığınız ilk aydan itibaren sorumluluk başlar.</td>
              </tr>
              <tr>
                <td class="p-2 dark:text-gray-200">İlk Muhtasar Beyanname</td>
                <td class="p-2 dark:text-gray-200">Faaliyete başlanan ayı takip eden ayın 26'sı.</td>
                <td class="p-2 dark:text-gray-200">Kiranız veya personeliniz varsa geçerlidir.</td>
              </tr>
            </tbody>
          </table>
    <div class="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-700 p-4 mt-6 dark:text-gray-100">
              <h6 class="mt-0"><strong>Stratejik Tavsiye: "Çifte Statü" Dönemi</strong></h6>
              <p class="mb-0">Finansal riski en aza indirmek için, mümkünse 4A'lı işinizden ayrılmadan önce şahıs şirketinizi kurun. Bu sayede, "SGK Muafiyeti" seçeneğinden yararlanarak Bağ-Kur primi ödemeden ilk müşterilerinizi bulabilir ve gelir akışı oluşturabilirsiniz. Bu, tam zamanlı geçişi çok daha güvenli hale getirir.</p>
          </div>
      `,
  };
  
  const reportVergiNakitAkisi = {
    title: "Model B Vergi Hesaplaması: 'Aylık Ortalama' vs 'Geçici Vergi' Nedir?",
    type: "info", // Bilgilendirme
    content: `
          <p>Model A (Maaşlı Çalışan) ile Model B (Şahıs Şirketi) arasındaki en temel fark, verginin ödenme şeklinde, yani nakit akışında ortaya çıkar.</p>
  
          <h4 class="mt-6">Model A (Maaşlı): Düzenli ve Otomatik</h4>
          <p>Maaşlı çalışırken, gelir verginiz her ay maaşınızdan otomatik olarak kesilir (kaynakta kesinti). Yıl içinde vergi diliminiz artsa bile, bu artış aylık kesintilere yansır. Nakit akışınız tahmin edilebilirdir.</p>
  
          <h4 class="mt-6">Model B (Şahıs Şirketi): Toplu ve Proaktif</h4>
          <p>Şahıs şirketi sahibi olarak vergi sorumluluğu tamamen sizdedir ve ödemeler toplu halde yapılır:</p>
  
          <ul class="mt-3">
            <li><strong>Geçici Vergi (3 Ayda Bir):</strong> Her 3 aylık dönemin sonunda (Ocak-Mart, Nisan-Haziran, Temmuz-Eylül), o döneme ait kârınız üzerinden hesaplanan vergiyi devlete peşin olarak ödersiniz. Bu ödemeler sırasıyla <strong>Mayıs, Ağustos ve Kasım</strong> aylarında yapılır.</li>
            <li><strong>Yıllık Beyanname (Yıl Sonu):</strong> Ertesi yılın Mart ayında, tüm yılın kârı üzerinden nihai vergi hesaplanır. Yıl içinde ödediğiniz 3 adet Geçici Vergi tutarı bu nihai vergiden düşülür, kalan farkı öder (veya fazla ödediyseniz iade alırsınız).</li>
          </ul>
  
          <h4 class="mt-6">Simülatör Bu Durumu Nasıl Gösteriyor?</h4>
  
          <div class="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 dark:border-blue-600 p-4 my-4 dark:text-gray-100">
            <h5 class="mt-0 font-semibold text-blue-900 dark:text-blue-200">📊 'Yıllık' Mod</h5>
            <p class="mb-0">Bu mod, Model B'nin maliyetini görmek için en doğru yöntemdir. Size tüm yıl boyunca ödeyeceğiniz toplam vergi yükünü (örn: ₺41.848) gösterir.</p>
          </div>
  
          <div class="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-700 p-4 my-4 dark:text-gray-100">
            <h5 class="mt-0 font-semibold text-yellow-900 dark:text-yellow-200">📅 'Aylık' Mod</h5>
            <p class="mb-0">'Aylık' modu seçtiğinizde, simülatör size o 'Yıllık Vergi Yükü'nün 12'ye bölünmüş ortalamasını (örn: ₺3.487) gösterir. Bu, Model A'daki 'Aylık Net Maaş' ile elma-elma karşılaştırması yapabilmeniz içindir.</p>
          </div>
  
          <div class="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-700 p-4 my-4 dark:text-gray-100">
            <h5 class="mt-0 font-semibold text-red-900 dark:text-red-200">⚠️ UYARI: Nakit Akışı Planlaması</h5>
            <p class="mb-0"><strong>'Aylık Ortalama Vergi Yükü' tutarını (örn: ₺3.487), her ay kenara koymanız gereken bir birikim hedefi olarak düşünmelisiniz.</strong> Bu tutar, 3 ayda bir toplu olarak ödeyeceğiniz Geçici Vergi faturası için bir fondur.</p>
          </div>
  
          <h4 class="mt-6">Pratik Örnek</h4>
          <p>Yıllık toplam vergi yükünüz ₺41.848 ise:</p>
          <ul class="mt-2">
            <li><strong>Aylık Ortalama:</strong> ₺41.848 ÷ 12 = <strong>₺3.487</strong> (Her ay biriktirmeniz gereken tutar)</li>
            <li><strong>Geçici Vergi Ödemeleri (3 ayda bir):</strong> ~₺10.461 (Mayıs, Ağustos, Kasım'da ödenir)</li>
            <li><strong>Yıl Sonu Ayarı:</strong> Mart ayında nihai hesaplama yapılır ve kalan/faiz farkı ödenir/alınır</li>
          </ul>
      `,
  };
  
  const reportHesaplamaMatematigi = {
    title: "Hesaplamaların Arkasındaki Matematik",
    type: "technical", // Teknik detay
    content: `
          <h4>Sabit Değerler ve Anlamları</h4>
          <div class="bg-sky-50 dark:bg-sky-900/30 p-4 rounded-lg mb-6 border-l-4 border-sky-400 dark:border-sky-600">
               <h5><strong>SGK Oranları (2025):</strong></h5>
               <ul>
                    <li><code class="dark:text-blue-300">0.15</code> = SGK İşçi Payı (%14 SGK + %1 İşsizlik)</li>
                    <li><code class="dark:text-blue-300">0.1575</code> = SGK İşveren Payı (Teşvikli, %20.75 - 5 puan)</li>
                    <li><code class="dark:text-blue-300">0.02</code> = İşsizlik Sigortası İşveren Payı</li>
                    <li><code class="dark:text-blue-300">0.1775</code> = Toplam İşveren Prim Oranı (%15.75 + %2)</li>
               </ul>
              
               <h5><strong>Vergi Oranları:</strong></h5>
               <ul>
                    <li><code class="dark:text-blue-300">0.00759</code> = Damga Vergisi Oranı (Binde 7.59)</li>
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
                         <p class="text-xs text-gray-500 dark:text-gray-400 mt-2"><strong>Not:</strong> Model B (Şahıs Şirketi) ücret dışı kazanç olduğu için bu tarifeyi kullanır.</p>
                    </li>
               </ul>
              
               <h5><strong>Bağ-Kur Değerleri (2025):</strong></h5>
               <ul>
                    <li><code class="dark:text-blue-300">26.005,50 TL</code> = Aylık Minimum Bağ-Kur Kazancı</li>
                    <li><code class="dark:text-blue-300">312.066 TL</code> = Yıllık Minimum Bağ-Kur Kazancı</li>
                    <li><code class="dark:text-blue-300">195.041,40 TL</code> = Aylık Maximum Bağ-Kur Kazancı (PEK Tavanı)</li>
                    <li><code class="dark:text-blue-300">2.340.495 TL</code> = Yıllık Maximum Bağ-Kur Kazancı (Tavan)</li>
                    <li><code class="dark:text-blue-300">0.295</code> = İndirimli Bağ-Kur Primi (%29.5, düzenli ödemede %34.5'ten %29.5'e düşer)</li>
               </ul>
              
   <h5><strong>Vergi İstisnaları:</strong></h5>
   <ul>
     <li><code class="dark:text-blue-300">312.066 TL</code> = Asgari Ücret Gelir Vergisi İstisnası (yıllık, sadece ücret gelirleri)</li>
     <li><code class="dark:text-blue-300">330.000 TL</code> = Genç Girişimci Gelir Vergisi İstisnası (yıllık, 2025)</li>
     <li><code class="dark:text-blue-300">0.80</code> = Hizmet İhracatı İndirim Oranı (%80 istisna, limit yok)</li>
   </ul>
          </div>
             
          <hr class="my-8 border border-gray-200 dark:border-gray-700">
             
          <h4>Model A: Maaşlı Çalışan (SGK)</h4>
             
          <h5><strong>İşverene Toplam Maliyet:</strong></h5>
          <ul>
               <li><pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100">SGK Matrahı = min(Brüt Maaş, PEK Tavanı)</code></pre></li>
               <li><pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100">İşveren Primleri = SGK Matrahı × 0.1775</code></pre></li>
               <li><pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100"><strong>Toplam Maliyet = Brüt Maaş + İşveren Primleri</strong></code></pre></li>
          </ul>
             
          <h5><strong>Net Maaş:</strong></h5>
          <ul>
               <li><pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100">SGK İşçi Payı = SGK Matrahı × 0.15</code></pre></li>
               <li><pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100">GV Matrahı = SGK Matrahı - SGK İşçi Payı</code></pre></li>
               <li><pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100">Gelir Vergisi = Artan Oranlı Tarifeye Göre Hesaplanır (Asgari Ücret İstisnası ile)</code></pre></li>
               <li><pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100">Damga Vergisi = max(0, (Brüt Maaş - Yıllık Asgari Ücret)) × 0.00759</code></pre></li>
               <li><pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100"><strong>Net Maaş = Brüt Maaş - SGK İşçi Payı - Gelir Vergisi - Damga Vergisi</strong></code></pre></li>
          </ul>
             
          <hr class="my-8 border border-gray-200 dark:border-gray-700">
             
          <h4>Model B: Şahıs Şirketi Sahibi (Bağ-Kur)</h4>
  
          <hr class="my-8 border border-gray-200 dark:border-gray-700">
          <h4>Giderlerin Vergiye Etkisi: Vergi Kalkanı Mekanizması</h4>
          <div>
            <h4>Giderler Net Gelirinizi Nasıl Etkiler?</h4>
            <p>Bir şahıs şirketinde yaptığınız her yasal harcama, sizin için bir <strong>"vergi kalkanı"</strong> görevi görür. Bu, giderlerin sadece kârınızı değil, aynı zamanda ödeyeceğiniz vergiyi de azalttığı anlamına gelir. Mekanizma şu şekilde işler:</p>
            <ol>
                <li><strong>Kârı Azaltır:</strong> Giderleriniz, toplam hasılatınızdan düşülerek vergilendirilecek olan kârınızı azaltır.</li>
                <li><strong>Vergi Matrahını Düşürür:</strong> Daha düşük kâr, üzerinden vergi hesaplanacak olan matrahın da daha düşük olması demektir.</li>
                <li><strong>Ödenecek Vergiyi Azaltır:</strong> Düşük matrah üzerinden hesaplanan gelir vergisi tutarı da doğal olarak azalır.</li>
            </ol>
            <div class="bg-sky-50 dark:bg-sky-900/30 border-l-4 border-sky-400 dark:border-sky-600 p-4 mt-4">
                <h5 class="mt-0">Somut Örnek:</h5>
                <p>Eğer %27'lik vergi dilimindeyseniz, yaptığınız <strong>10.000 TL</strong>'lik bir gider, ödeyeceğiniz vergiyi yaklaşık <strong>2.700 TL</strong> azaltır. Yani bu harcamanın size olan net maliyeti aslında <strong>7.300 TL</strong>'dir. Bu nedenle, işle ilgili tüm harcamalarınızı doğru bir şekilde belgelendirip gider olarak göstermek, net gelirinizi optimize etmenin en önemli yoludur.</p>
            </div>
          </div>
             
          <h5><strong>Temel Değerler:</strong></h5>
          <ul>
               <li><pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100">Hasılat = (Seçime göre) Model A Brüt Maaş VEYA Model A Toplam Maliyet</code></pre></li>
               <li><pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100">Kâr = Hasılat - Şirket Giderleri</code></pre></li>
               <li><pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100">Bağ-Kur PEK = Slider ile seçilen 'Prim Kazancı'</code></pre></li>
               <li><pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100">Hesaplanan Prim Gideri = Bağ-Kur PEK × 0.295</code></pre></li>
          </ul>
             
          <h5><strong>Vergi Matrahı Hesaplama Sırası:</strong></h5>
          <ol>
               <li><pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100">Başlangıç Matrahı = Kâr - Hesaplanan Bağ-Kur Primi</code></pre></li>
               <li><pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100">Genç Girişimci İstisnası: Matrah = max(0, Matrah - 330.000)</code></pre></li>
               <li><strong>Hizmet İhracatı İstisnası (%80 İndirim):</strong>
                    <ul>
                         <li><pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100">İstisna Tutarı = Matrah × 0.80</code></pre></li>
                         <li><pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100">Final Matrah = Matrah - İstisna Tutarı</code></pre></li>
                         <li><small class="dark:text-gray-300">Not: 2025 yılında limit bulunmamaktadır</small></li>
                    </ul>
               </li>
               <li><pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100"><strong>Gelir Vergisi = Ücret Dışı Kazanç Tarife(Final Matrah)</strong></code></pre></li>
          </ol>
             
          <h5><strong>Ödenecek Prim (Genç Girişimci Desteği ile):</strong></h5>
          <ul>
               <li><strong>Normal Durum:</strong>
                    <pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100">Ödenecek Prim = Bağ-Kur PEK × 0.295</code></pre>
               </li>
               <li><strong>Genç Girişimci Desteği ile:</strong>
                    <pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100">Hesaplanan Prim = Bağ-Kur PEK × 0.295</code></pre>
                    <pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100">Minimum Prim Desteği = 26.005,50 × 12 × 0.295 = 92.059 TL</code></pre>
                    <pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100">Ödenecek Prim = max(0, Hesaplanan Prim - 92.059)</code></pre>
                    <p><small class="dark:text-gray-300">(Devlet minimum primi karşılar, fazlası kişi tarafından ödenir)</small></p>
               </li>
          </ul>
             
          <h5><strong>Final Hesaplama:</strong></h5>
          <pre class="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded border dark:border-gray-700"><code class="dark:text-gray-100"><strong>Net Gelir = Kâr - Ödenecek Prim - Gelir Vergisi</strong></code></pre>
          <p><small class="dark:text-gray-300"><strong>Not:</strong> "Ödenecek Prim" yukarıdaki Genç Girişimci desteği hesaplamasına göre belirlenir.</small></p>
      `,
  };
  
  // ========================================================================
  // Ana Fonksiyonlar - Export ediliyor
  // ========================================================================
  
  /**
   * Rapor içeriğini, kolayca yeniden sıralanabilen bir dizi olarak başlatır.
   * Her dizi öğesi, { title: string, content: string } formatında bir nesnedir.
   */
  function initializeReportContent() {
      // Sadece bu dizinin sırasını değiştirerek akordiyon sırasını yönetebilirsiniz.
      // Mantıksal sıralama: Kullanım → Temel Bilgiler → Model Karşılaştırmaları → Detaylar → Gelecek Planlama → Teknik Detaylar
      return [
          // 1. KULLANIM VE TEMEL BİLGİLER
          reportKullanimKilavuzu,              // Nasıl kullanılır?
          reportIsverenMaliyetiUyari,          // Önemli uyarı: İşveren maliyeti modu
          
          // 2. GENEL KARŞILAŞTIRMA VE MODELLER
          reportSorumlulukMatrisi,             // Yüksek seviye karşılaştırma tablosu
          reportModelADetaylari,               // Model A: Maaşlı çalışan detayları
          reportModelBDetaylari,               // Model B: Şahıs şirketi detayları
          
          // 3. MODEL B'Yİ ANLAMA (Kavramlar ve Finansal Yapı)
          reportBagKurKavramlari,              // Önemli kavram: PEK vs Prim Gideri
          reportModelBAvantajlar,              // Model B'nin avantajları (giderler, teşvikler)
          reportModelBRiskleri,                // Model B'nin riskleri ve gizli sorumluluklar
          
          // 4. DETAYLI KARŞILAŞTIRMA
          reportEmeklilikKarsilastirmasi,      // Emeklilik hakları karşılaştırması
          reportVergiNakitAkisi,               // Vergi ödeme şekilleri ve nakit akışı
          
          // 5. GEÇİŞ VE UYGULAMA
          reportGecisZamanlamasi,              // 4A'dan 4B'ye geçiş süreci
          reportHizmetIhracatiRehberi,        // Özel durum: Hizmet ihracatı
          
          // 6. GELECEK PLANLAMA VE UYARILAR
          reportGencGirisimciGelecegi,         // Genç girişimci desteğinin geleceği
          reportTesReformu,                    // 2026 TES Reformu analizi
          reportBagKur7200Reformu,             // Beklenen yasal değişiklikler
          reportSirketlesmeZamani,             // Şirketleşme kararı (şahıs → limited)
          
          // 7. TEKNİK DETAYLAR
          reportHesaplamaMatematigi,           // Hesaplamaların arkasındaki matematik (son)
      ];
  }
  
  /**
   * Başlatılan rapor içeriğini alır ve DOM'a akordiyon yapısı olarak ekler.
   * @param {Array} reportContent - Rapor içeriği dizisi
   * @param {HTMLElement} accordionContainer - Akordiyon container elementi
   */
  function initializeAccordion(reportContent, accordionContainer) {
      // Performance optimization: Use DocumentFragment for batch DOM updates
      const fragment = document.createDocumentFragment();
  
      // Renk kodlaması: type'a göre stil belirleme
      const getColorClasses = (type) => {
          switch(type) {
              case 'info':
                  return {
                      border: 'border-blue-300 dark:border-blue-700',
                      button: 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-l-4 border-l-blue-500 dark:border-l-blue-600',
                      text: 'text-blue-900 dark:text-blue-200'
                  };
              case 'warning':
                  return {
                      border: 'border-orange-300 dark:border-orange-700',
                      button: 'bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/40 border-l-4 border-l-orange-500 dark:border-l-orange-600',
                      text: 'text-orange-900 dark:text-orange-200'
                  };
              case 'success':
                  return {
                      border: 'border-green-300 dark:border-green-700',
                      button: 'bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/40 border-l-4 border-l-green-500 dark:border-l-green-600',
                      text: 'text-green-900 dark:text-green-200'
                  };
              case 'technical':
                  return {
                      border: 'border-gray-300 dark:border-gray-700',
                      button: 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-l-4 border-l-gray-500 dark:border-l-gray-600',
                      text: 'text-gray-900 dark:text-gray-100'
                  };
              default:
                  return {
                      border: 'border-gray-300 dark:border-gray-700',
                      button: 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700',
                      text: 'text-gray-800 dark:text-gray-100'
                  };
          }
      };
  
      reportContent.forEach((section) => {
          const colors = getColorClasses(section.type || 'default');
          const item = document.createElement("div");
          item.className = `${colors.border} border rounded-lg bg-white dark:bg-gray-800 overflow-hidden shadow-sm`;
          item.innerHTML = `
              <button class="accordion-button w-full flex justify-between items-center text-left p-4 font-semibold text-lg ${colors.text} ${colors.button} transition-all cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-700/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2" aria-expanded="false">
                  <span>${section.title}</span>
                  <svg class="w-5 h-5 flex-shrink-0 transition-transform duration-300 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
              </button>
              <div class="accordion-content" data-expanded="false">
                  <div class="prose max-w-none p-4 dark:text-gray-100 dark:[&_h3]:text-gray-100 dark:[&_h4]:text-gray-100 dark:[&_h5]:text-gray-100 dark:[&_h6]:text-gray-100 dark:[&_p]:text-gray-200 dark:[&_li]:text-gray-200 dark:[&_strong]:text-gray-50 dark:[&_table]:border-gray-600 dark:[&_th]:border-gray-600 dark:[&_td]:border-gray-600 dark:[&_th]:text-gray-200 dark:[&_td]:text-gray-200 dark:[&_thead_th]:bg-gray-700 dark:[&_thead_th]:text-gray-100 prose-dark-table">${section.content}</div>
              </div>
          `;
          fragment.appendChild(item);
      });
  
      // Single DOM update instead of multiple appendChild calls
      accordionContainer.appendChild(fragment);
  }
  
  // ES6 Module Export
  export { initializeReportContent, initializeAccordion };