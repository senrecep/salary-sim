/**
 * Performance Optimization Test Runner
 * 
 * Bu script tüm performans optimizasyon testlerini otomatik olarak çalıştırır.
 * Browser Console'a yapıştırıp çalıştırabilirsiniz.
 * 
 * Kullanım:
 * 1. Sayfayı açın ve hesaplamaların yapıldığından emin olun
 * 2. Browser Console'u açın (F12)
 * 3. Bu script'i yapıştırıp Enter'a basın
 * 4. Test sonuçlarını bekleyin
 */

(function() {
  'use strict';

  // Test sonuçları
  const testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
  };

  // Helper: Test sonucu kaydet
  function recordTest(name, passed, message = '', details = {}) {
    try {
      const test = {
        name,
        passed,
        message: String(message || ''),
        details: details || {},
        timestamp: new Date().toISOString()
      };
      testResults.tests.push(test);
      if (passed) {
        testResults.passed++;
        console.log(`✅ PASS: ${name}${message ? ' - ' + message : ''}`);
      } else {
        testResults.failed++;
        console.error(`❌ FAIL: ${name}${message ? ' - ' + message : ''}`);
        if (details && Object.keys(details).length > 0) {
          console.error('Details:', details);
        }
      }
    } catch (error) {
      console.error('recordTest hatası:', error);
    }
  }

  // Helper: Warning kaydet
  function recordWarning(name, message, details = {}) {
    try {
      testResults.warnings++;
      testResults.tests.push({
        name,
        passed: null,
        message: String(message || ''),
        details: details || {},
        timestamp: new Date().toISOString(),
        warning: true
      });
      console.warn(`⚠️  WARN: ${name} - ${message}`);
      if (details && Object.keys(details).length > 0) {
        console.warn('Details:', details);
      }
    } catch (error) {
      console.error('recordWarning hatası:', error);
    }
  }

  // Helper: Bekleme
  function wait(ms) {
    return new Promise(resolve => {
      try {
        setTimeout(() => resolve(), ms);
      } catch (error) {
        console.error('wait() hatası:', error);
        resolve(); // Hata olsa bile devam et
      }
    });
  }

  // Helper: Güvenli fonksiyon çağrısı
  async function safeCall(fn, name, ...args) {
    try {
      if (typeof fn !== 'function') {
        throw new Error(`${name} is not a function`);
      }
      // apply kullanmak yerine spread operator kullan (daha güvenli)
      return await fn(...args);
    } catch (error) {
      console.error(`${name} çağrısında hata:`, error);
      throw error;
    }
  }

  // Test 1: Debounce Manager Kontrolü
  async function testDebounceManager() {
    console.log('\n📋 Test 1: Debounce Manager Kontrolü');
    
    if (!window.calculator) {
      recordTest('Debounce Manager Exists', false, 'Calculator instance not found');
      return;
    }

    const calc = window.calculator;
    
    // Debounce timers objesi var mı?
    const hasDebounceTimers = calc._debounceTimers !== undefined;
    recordTest('Debounce Timers Object Exists', hasDebounceTimers);
    
    // Debounce metodları var mı?
    const hasDebounceMethod = typeof calc.debounce === 'function';
    const hasCancelDebounceMethod = typeof calc.cancelDebounce === 'function';
    const hasClearAllDebouncesMethod = typeof calc.clearAllDebounces === 'function';
    
    recordTest('debounce() Method Exists', hasDebounceMethod);
    recordTest('cancelDebounce() Method Exists', hasCancelDebounceMethod);
    recordTest('clearAllDebounces() Method Exists', hasClearAllDebouncesMethod);
    
    // Test debounce çalışması
    let debounceCalled = false;
    calc.debounce('test-debounce', () => {
      debounceCalled = true;
    }, 100);
    
    await wait(50);
    recordTest('Debounce Not Immediate', !debounceCalled, 'Debounce should not execute immediately');
    
    await wait(100);
    recordTest('Debounce Executes After Delay', debounceCalled, 'Debounce should execute after delay');
  }

  // Test 2: Calculation Cache Kontrolü
  async function testCalculationCache() {
    console.log('\n📋 Test 2: Calculation Cache Kontrolü');
    
    if (!window.calculator) {
      recordTest('Calculation Cache Exists', false, 'Calculator instance not found');
      return;
    }

    const calc = window.calculator;
    
    // Cache objesi var mı?
    const hasCache = calc._calculationCache !== undefined;
    recordTest('Calculation Cache Object Exists', hasCache);
    
    // Cache metodları var mı?
    const hasGetCached = typeof calc.getCached === 'function';
    const hasSetCached = typeof calc.setCached === 'function';
    const hasClearCache = typeof calc.clearCache === 'function';
    
    recordTest('getCached() Method Exists', hasGetCached);
    recordTest('setCached() Method Exists', hasSetCached);
    recordTest('clearCache() Method Exists', hasClearCache);
    
    // Test cache çalışması
    if (hasSetCached && hasGetCached) {
      calc.setCached('test-function', 'test-value', 123);
      const cached = calc.getCached('test-function', 123);
      recordTest('Cache Set/Get Works', cached === 'test-value');
      
      // Cache temizle
      calc.clearCache('test-function');
      const afterClear = calc.getCached('test-function', 123);
      recordTest('Cache Clear Works', afterClear === null);
    }
    
    // Memoized fonksiyonları test et
    const testValue = 100000;
    const brut1 = calc.calculateBrutFromNet(testValue);
    const brut2 = calc.calculateBrutFromNet(testValue);
    recordTest('calculateBrutFromNet Uses Cache', brut1 === brut2, 'Second call should use cache');
  }

  // Test 3: FormatCurrency Cache Kontrolü
  async function testFormatCache() {
    console.log('\n📋 Test 3: FormatCurrency Cache Kontrolü');
    
    if (!window.calculator) {
      recordTest('Format Cache Exists', false, 'Calculator instance not found');
      return;
    }

    const calc = window.calculator;
    
    // Format cache var mı?
    const hasFormatCache = calc._formatCache !== undefined;
    const hasFormatters = calc._formatters !== undefined;
    
    recordTest('Format Cache Object Exists', hasFormatCache);
    recordTest('Formatters Object Exists', hasFormatters);
    
    // Format cache metodları
    const hasClearFormatCache = typeof calc.clearFormatCache === 'function';
    recordTest('clearFormatCache() Method Exists', hasClearFormatCache);
    
    // Test format cache çalışması
    if (hasFormatCache) {
      const testAmount = 157648;
      const formatted1 = calc.formatCurrency(testAmount, 'TRY');
      const formatted2 = calc.formatCurrency(testAmount, 'TRY');
      
      recordTest('Format Cache Works', formatted1 === formatted2, 'Second call should use cache');
      
      // Cache limit testi
      const initialCacheSize = Object.keys(calc._formatCache).length;
      for (let i = 0; i < 150; i++) {
        calc.formatCurrency(i * 1000, 'TRY');
      }
      const finalCacheSize = Object.keys(calc._formatCache).length;
      const cacheLimited = finalCacheSize <= 100;
      recordTest('Format Cache Limited to 100', cacheLimited, 
        `Cache size: ${finalCacheSize} (should be <= 100)`);
      
      // Formatter cache testi
      const formatterCount = Object.keys(calc._formatters).length;
      recordTest('Formatter Cache Works', formatterCount <= 2, 
        `Formatter count: ${formatterCount} (should be <= 2 for TRY/USD)`);
    }
  }

  // Test 4: Stable Element ID'leri Kontrolü
  async function testStableElementIds() {
    console.log('\n📋 Test 4: Stable Element ID\'leri Kontrolü');
    
    if (!window.calculator) {
      recordTest('Element IDs Check', false, 'Calculator instance not found');
      return;
    }

    // Model A card kontrolü
    const modelACard = document.getElementById('model-a-card');
    const modelANetGelir = document.getElementById('model-a-card-net-gelir');
    const modelAPrimGideri = document.getElementById('model-a-card-prim-gideri');
    const modelAVergiYuku = document.getElementById('model-a-card-vergi-yuku');
    const modelABrutMaas = document.getElementById('model-a-card-brut-maas');
    const modelATCE = document.getElementById('model-a-card-tce');
    
    recordTest('Model A Card ID Exists', !!modelACard);
    recordTest('Model A Net Gelir ID Exists', !!modelANetGelir);
    recordTest('Model A Prim Gideri ID Exists', !!modelAPrimGideri);
    recordTest('Model A Vergi Yuku ID Exists', !!modelAVergiYuku);
    recordTest('Model A Brüt Maaş ID Exists', !!modelABrutMaas, 
      'May not exist if TCE section not rendered');
    recordTest('Model A TCE ID Exists', !!modelATCE,
      'May not exist if TCE section not rendered');
    
    // Model B card kontrolü
    const modelBCard = document.getElementById('model-b-card');
    const modelBNetGelir = document.getElementById('model-b-card-net-gelir');
    const modelBPrimGideri = document.getElementById('model-b-card-prim-gideri');
    const modelBVergiYuku = document.getElementById('model-b-card-vergi-yuku');
    
    recordTest('Model B Card ID Exists', !!modelBCard);
    recordTest('Model B Net Gelir ID Exists', !!modelBNetGelir);
    recordTest('Model B Prim Gideri ID Exists', !!modelBPrimGideri);
    recordTest('Model B Vergi Yuku ID Exists', !!modelBVergiYuku);
  }

  // Test 5: Selective Update Helper Kontrolü
  async function testSelectiveUpdateHelpers() {
    console.log('\n📋 Test 5: Selective Update Helper Kontrolü');
    
    if (!window.calculator) {
      recordTest('Selective Update Helpers', false, 'Calculator instance not found');
      return;
    }

    const calc = window.calculator;
    
    // Helper metodları var mı?
    const hasUpdateResultCardDisplay = typeof calc.updateResultCardDisplay === 'function';
    const hasCanSelectiveUpdate = typeof calc.canSelectiveUpdate === 'function';
    
    recordTest('updateResultCardDisplay() Method Exists', hasUpdateResultCardDisplay);
    recordTest('canSelectiveUpdate() Method Exists', hasCanSelectiveUpdate);
    
    // canSelectiveUpdate testi
    if (hasCanSelectiveUpdate) {
      const canUpdate = calc.canSelectiveUpdate();
      recordTest('canSelectiveUpdate() Returns Value', typeof canUpdate === 'boolean');
      
      if (canUpdate) {
        // Selective update testi
        if (hasUpdateResultCardDisplay) {
          const initialNetGelir = document.getElementById('model-a-card-net-gelir')?.textContent;
          const initialPrimGideri = document.getElementById('model-a-card-prim-gideri')?.textContent;
          
          // Farklı değerler kullan (mevcut değerlerden farklı olmalı)
          // Yıllık değerler olarak veriyoruz, function içinde mode'a göre bölünecek
          const testNet = 1500000; // Yıllık net gelir (aylık modda 125k olacak)
          const testPrim = 400000; // Yıllık prim (aylık modda ~33k olacak)
          const testVergi = 500000; // Yıllık vergi
          
          const updated = calc.updateResultCardDisplay('model-a', {
            net: testNet,
            prim: testPrim,
            vergi: testVergi,
            brut: 2500000,
            tce: 3000000
          });
          recordTest('updateResultCardDisplay() Executes', updated === true || updated === false);
          
          if (updated) {
            // Kısa bir bekleme ekle (DOM güncellemesi için)
            await wait(50);
            
            const newNetGelir = document.getElementById('model-a-card-net-gelir')?.textContent;
            const newPrimGideri = document.getElementById('model-a-card-prim-gideri')?.textContent;
            
            const netChanged = newNetGelir && newNetGelir !== initialNetGelir;
            const primChanged = newPrimGideri && newPrimGideri !== initialPrimGideri;
            
            recordTest('Selective Update Changes Display', netChanged || primChanged,
              `Net changed: ${netChanged}, Prim changed: ${primChanged}. Initial: ${initialNetGelir}, New: ${newNetGelir}`,
              {
                initialNetGelir,
                newNetGelir,
                initialPrimGideri,
                newPrimGideri,
                netChanged,
                primChanged
              });
            
            // Değerleri geri al (test sonrası temizlik)
            if (netChanged || primChanged) {
              // Geri almak için updateUI çağır (orijinal değerler geri gelir)
              calc.updateUI();
              await wait(500); // updateUI tamamlansın
            }
          }
        }
      } else {
        recordWarning('Selective Update Not Available', 
          'Cards may not be rendered yet. Run calculations first.');
      }
    }
  }

  // Test 6: Template Cache Kontrolü
  async function testTemplateCache() {
    console.log('\n📋 Test 6: Template Cache Kontrolü');
    
    if (!window.calculator) {
      recordTest('Template Cache', false, 'Calculator instance not found');
      return;
    }

    const calc = window.calculator;
    
    // Template cache var mı?
    const hasTemplateCache = calc._htmlTemplateCache !== undefined;
    recordTest('Template Cache Object Exists', hasTemplateCache);
    
    // Template cache metodları
    const hasGetTemplate = typeof calc.getTemplate === 'function';
    const hasClearTemplateCache = typeof calc.clearTemplateCache === 'function';
    
    recordTest('getTemplate() Method Exists', hasGetTemplate);
    recordTest('clearTemplateCache() Method Exists', hasClearTemplateCache);
    
    // Template cache testi
    if (hasGetTemplate && hasClearTemplateCache) {
      const template1 = calc.getTemplate('test-template', () => '<div>test</div>');
      const template2 = calc.getTemplate('test-template', () => '<div>different</div>');
      
      recordTest('Template Cache Works', template1 === template2, 
        'Second call should return cached template');
      
      calc.clearTemplateCache('test-template');
      const template3 = calc.getTemplate('test-template', () => '<div>new</div>');
      recordTest('Template Cache Clear Works', template3 === '<div>new</div>',
        'After clear, should generate new template');
    }
  }

  // Test 7: Debounce Timer Cleanup Kontrolü
  async function testDebounceCleanup() {
    console.log('\n📋 Test 7: Debounce Timer Cleanup Kontrolü');
    
    if (!window.calculator) {
      recordTest('Debounce Cleanup', false, 'Calculator instance not found');
      return;
    }

    const calc = window.calculator;
    
    // Birkaç debounce timer oluştur
    calc.debounce('test-1', () => {}, 1000);
    calc.debounce('test-2', () => {}, 1000);
    calc.debounce('test-3', () => {}, 1000);
    
    const timerCountBefore = Object.keys(calc._debounceTimers).length;
    recordTest('Debounce Timers Created', timerCountBefore >= 3, 
      `Active timers: ${timerCountBefore}`);
    
    // clearAllDebounces testi
    calc.clearAllDebounces();
    await wait(50); // Kısa bekleme
    const timerCountAfter = Object.keys(calc._debounceTimers).length;
    recordTest('clearAllDebounces() Works', timerCountAfter === 0,
      `Timers after clear: ${timerCountAfter} (should be 0)`);
  }

  // Test 8: Memory Leak Kontrolü
  async function testMemoryLeak() {
    console.log('\n📋 Test 8: Memory Leak Kontrolü');
    
    if (!window.calculator) {
      recordTest('Memory Leak Check', false, 'Calculator instance not found');
      return;
    }

    const calc = window.calculator;
    
    // İlk durumu kaydet
    const initialDebounceCount = Object.keys(calc._debounceTimers).length;
    const initialCacheCount = Object.keys(calc._calculationCache).length;
    const initialFormatCount = Object.keys(calc._formatCache).length;
    
    // Çoklu işlem simülasyonu
    for (let i = 0; i < 50; i++) {
      calc.debounce(`test-${i}`, () => {}, 100);
      calc.setCached('test-func', i, i);
      calc.formatCurrency(i * 1000, 'TRY');
      
      // Her 10 işlemde bir temizle (gerçek kullanım simülasyonu)
      if (i % 10 === 0) {
        calc.clearAllDebounces();
        calc.clearCache();
      }
    }
    
    // Final durum
    const finalDebounceCount = Object.keys(calc._debounceTimers).length;
    const finalCacheCount = Object.keys(calc._calculationCache).length;
    const finalFormatCount = Object.keys(calc._formatCache).length;
    
    // Debounce timer'lar temizlenmiş olmalı
    const debounceCleaned = finalDebounceCount <= initialDebounceCount + 10;
    recordTest('Debounce Timers Cleaned', debounceCleaned,
      `Final debounce count: ${finalDebounceCount}`);
    
    // Format cache limit kontrolü
    const formatCacheLimited = finalFormatCount <= 100;
    recordTest('Format Cache Limited', formatCacheLimited,
      `Final format cache: ${finalFormatCount} (should be <= 100)`);
    
    if (!debounceCleaned) {
      recordWarning('Potential Debounce Memory Leak', 
        'Debounce timers may not be cleaned properly');
    }
  }

  // Test 9: Performans Testi
  async function testPerformance() {
    console.log('\n📋 Test 9: Performans Testi');
    
    if (!window.calculator) {
      recordTest('Performance Test', false, 'Calculator instance not found');
      return;
    }

    const calc = window.calculator;
    
    // updateUI performans testi
    console.time('updateUI Performance');
    calc.updateUI();
    console.timeEnd('updateUI Performance');
    
    // Format performans testi
    console.time('Format Currency (No Cache)');
    calc.clearFormatCache();
    for (let i = 0; i < 100; i++) {
      calc.formatCurrency(i * 1000, 'TRY');
    }
    console.timeEnd('Format Currency (No Cache)');
    
    // Format cache hit performansı
    console.time('Format Currency (With Cache)');
    for (let i = 0; i < 100; i++) {
      calc.formatCurrency(i * 1000, 'TRY');
    }
    console.timeEnd('Format Currency (With Cache)');
    
    recordTest('Performance Test Completed', true, 'Check console for timing results');
  }

  // Test 10: Integration Test - TCE Input Debounce
  async function testTCEInputDebounce() {
    console.log('\n📋 Test 10: TCE Input Debounce Integration Testi');
    
    // Model B kartındaki TCE input'unu bul
    const tceInput = document.querySelector('[data-sync-id="tcePercentageInput"]');
    
    if (!tceInput) {
      recordWarning('TCE Input Not Found', 
        'Model B card may not be rendered. Enter salary value first.');
      return;
    }
    
    // Input değerini değiştir
    const originalValue = tceInput.value;
    tceInput.value = '120';
    
    // Input event'i tetikle
    const inputEvent = new Event('input', { bubbles: true });
    tceInput.dispatchEvent(inputEvent);
    
    // Debounce timer'ın oluşturulduğunu kontrol et
    await wait(100);
    const calculator = window.calculator;
    const hasDebounce = calculator._debounceTimers['tcePercentageInput'] !== undefined;
    
    recordTest('TCE Input Creates Debounce', hasDebounce,
      'Debounce timer should be created on input');
    
    // Değeri geri al
    tceInput.value = originalValue;
  }

  // Ana test fonksiyonu
  async function runAllTests() {
    console.log('🚀 Performance Optimization Test Runner Başlatılıyor...\n');
    console.log('='.repeat(60));
    
    // Calculator instance kontrolü
    if (!window.calculator) {
      console.error('❌ Calculator instance bulunamadı!');
      console.error('Lütfen sayfayı yenileyin ve hesaplamaların yapıldığından emin olun.');
      return testResults;
    }
    
    const startTime = performance.now();
    
    // Test fonksiyonları listesi
    const testFunctions = [
      { name: 'Debounce Manager', fn: testDebounceManager },
      { name: 'Calculation Cache', fn: testCalculationCache },
      { name: 'Format Cache', fn: testFormatCache },
      { name: 'Stable Element IDs', fn: testStableElementIds },
      { name: 'Selective Update Helpers', fn: testSelectiveUpdateHelpers },
      { name: 'Template Cache', fn: testTemplateCache },
      { name: 'Debounce Cleanup', fn: testDebounceCleanup },
      { name: 'Memory Leak', fn: testMemoryLeak },
      { name: 'Performance', fn: testPerformance },
      { name: 'TCE Input Debounce', fn: testTCEInputDebounce }
    ];
    
    // Her testi güvenli şekilde çalıştır
    for (const test of testFunctions) {
      try {
        if (typeof test.fn === 'function') {
          await test.fn();
        } else {
          throw new Error(`${test.name} test fonksiyonu bulunamadı`);
        }
        await wait(200); // Her test arasında kısa bekleme
      } catch (error) {
        console.error(`❌ ${test.name} testi sırasında hata:`, error);
        const errorDetails = {
          error: error?.toString() || 'Unknown error',
          message: error?.message || 'No error message',
          stack: error?.stack || 'No stack trace'
        };
        recordTest(`${test.name} Execution`, false, errorDetails.message, errorDetails);
        // Hata olsa bile diğer testlere devam et
        await wait(200);
      }
    }
    
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    
    // Özet rapor
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST ÖZET RAPORU');
    console.log('='.repeat(60));
    console.log(`✅ Başarılı: ${testResults.passed}`);
    console.log(`❌ Başarısız: ${testResults.failed}`);
    console.log(`⚠️  Uyarılar: ${testResults.warnings}`);
    console.log(`⏱️  Süre: ${duration}ms`);
    console.log('\n');
    
    // Detaylı sonuçlar
    if (testResults.failed > 0) {
      console.log('❌ BAŞARISIZ TESTLER:');
      testResults.tests.filter(t => t.passed === false).forEach(test => {
        console.log(`  - ${test.name}: ${test.message}`);
        if (test.details && Object.keys(test.details).length > 0) {
          console.log('    Details:', test.details);
        }
      });
      console.log('\n');
    }
    
    if (testResults.warnings > 0) {
      console.log('⚠️  UYARILAR:');
      testResults.tests.filter(t => t.warning).forEach(test => {
        console.log(`  - ${test.name}: ${test.message}`);
      });
      console.log('\n');
    }
    
    // JSON export
    console.log('💾 Detaylı sonuçlar için:');
    console.log('JSON.stringify(testResults, null, 2)');
    console.log('\n');
    
    // Sonuç objesini global yap
    window.testResults = testResults;
    
    return testResults;
  }

  // Test runner'ı başlat
  console.log('Test scripti yüklendi. Çalıştırmak için runAllTests() fonksiyonunu çağırın.\n');
  console.log('Hızlı başlatma: await runAllTests()');
  
  // Global olarak erişilebilir yap
  window.runAllTests = runAllTests;
  window.testResults = testResults;
  
  // Otomatik başlat (opsiyonel - comment out edilebilir)
  // runAllTests();
  
})();

