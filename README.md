# 💼 Kariyer ve Maaş Karşılaştırma Simülatörü

## 📖 Proje Hakkında

Bu web uygulaması, Türkiye'de çalışanların **SGK'lı maaşlı pozisyon** ile **freelance/şahıs şirketi** çalışma modelleri arasında net gelir karşılaştırması yapabilmelerini sağlar. Özellikle bilgi işçiliği, danışmanlık, tasarım, eğitim ve benzeri hizmet sektörlerinde çalışanlar için optimize edilmiştir.

## ✨ Özellikler

### 🧮 Hesaplama Modülleri

- **SGK (4/a) Maaş Hesaplaması**: Net maaştan brüt hesaplama ve vergi/prim kesintileri
- **Bağ-Kur (4/b) Hesaplaması**: Freelance/şahıs şirketi gelir ve gider analizi
- **Gelir Vergisi Hesaplaması**: 2025 projeksiyonlu vergi dilimleri
- **Prim Hesaplamaları**: SGK ve Bağ-Kur prim tutarları

### 💰 Para Birimi ve Dönem Seçenekleri

- **Para Birimi**: TRY ve USD desteği (güncel döviz kurları ile)
- **Dönem**: Aylık ve yıllık hesaplama modu
- **Gerçek Zamanlı**: Anlık hesaplama ve sonuç güncellemesi

### 📊 Karşılaştırma ve Analiz

- **Side-by-Side Karşılaştırma**: SGK vs Bağ-Kur detaylı analizi
- **Net Gelir Farkı**: Hangi modelin daha avantajlı olduğunu gösterir
- **Prim Yükü Analizi**: Toplam sosyal güvenlik maliyetleri
- **Vergi Yükü Karşılaştırması**: Farklı vergi oranları ve matrahları

### 🏥 Emeklilik Şartları Bilgilendirmesi

- **SGK (4/a) Şartları**: 60 yaş/7200 gün (tam), 63 yaş/5400 gün (kısmi)
- **Bağ-Kur (4/b) Şartları**: 65 yaş/9000 gün (tam)
- **PEK Seviye Karşılaştırması**: Emeklilik maaşı projeksiyonları

### 📱 Kullanıcı Deneyimi

- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **Accessibility**: Ekran okuyucu desteği ve WCAG uyumluluğu
- **Kullanıcı Dostu Arayüz**: Sezgisel ve temiz tasarım
- **Gerçek Zamanlı Geri Bildirim**: Anında hesaplama sonuçları

## 🚀 Kullanım

### Basit Başlangıç

1. **Net maaşınızı girin** (SGK'lı çalışan olarak)
2. **Para birimi ve dönem seçin** (TRY/USD, Aylık/Yıllık)
3. **Bağ-Kur seçeneklerini ayarlayın** (prim seviyesi, Bağ-Kur durumu)
4. **Sonuçları karşılaştırın** ve hangi modelin size daha uygun olduğunu görün

### Detaylı Analiz

- 📋 **Emeklilik şartlarını** inceleyin
- 💡 **Vergi avantajlarını** keşfedin
- 📊 **Uzun vadeli finansal planlamalar** yapın
- 🔍 **Farklı senaryoları** test edin

## 📋 Yasal Uyarılar

> **⚠️ Önemli:** Bu simülatör bilgilendirme amaçlıdır. Kesin hesaplamalar için muhasebe uzmanınıza danışın.

### 2025 Projeksiyonu

- Bu uygulamada kullanılan 2025 yılı gelir vergisi dilimleri ve istisna tutarları, beklenen yeniden değerleme oranlarına göre yapılmış projeksiyonlardır
- Resmi rakamlar yıl sonunda netleşecektir

### Meslek Grupları

- Genel olarak tüm meslekler için kullanılabilir
- Özellikle **bilgi işçiliği, danışmanlık, tasarım, eğitim** ve benzeri hizmet sektörleri için optimize edilmiştir
- İstisnai imalat ve ağır sanayi gibi özel düzenlemelerin olduğu sektörlerde farklı kurallar geçerli olabilir

## 🎯 Hedef Kullanıcılar

- 💻 **Yazılım Geliştiriciler** ve IT profesyonelleri
- 🎨 **Tasarımcılar** ve kreatif sektör çalışanları
- 📊 **Danışmanlar** ve freelance hizmet sağlayıcıları
- 🎓 **Eğitmenler** ve online eğitim uzmanları
- 📝 **İçerik Üreticileri** ve dijital pazarlama uzmanları
- 🏢 **Şirket sahipleri** ve girişimciler

---

## 🛠️ Technical Details

### Technologies

- **HTML5**: Semantic and accessible markup
- **CSS3**: Modern flexbox/grid layout, responsive design
- **Vanilla JavaScript**: High-performance calculation engines
- **Tailwind CSS**: Utility-first CSS framework
- **Google Fonts**: Inter font family

### Calculation Engines

```javascript
// Income Tax Calculation (Progressive Tax)
calculateProgressiveTax(matrah, isUcretDisi = false)

// SGK Premium Calculation
calculateSGKPrimi(brutMaas)

// Bağ-Kur Premium Calculation
calculateBagkurPrimi(primKazanci)
```

### Features

- 🔄 **Real-time Calculation**: Automatic updates on input changes
- 🌐 **Exchange Rates**: Current USD/TRY parity integration
- 📊 **2025 Tax Brackets**: Current legal regulations
- ♿ **Accessibility**: ARIA labels and screen reader support

## 📁 Project Structure

```text
salary-sim/
├── src/                    # Source files
│   ├── index.html          # Main application file
│   ├── index.css           # Stylesheet
│   ├── index.js            # JavaScript logic
│   └── favicon.ico         # Website favicon
├── README.md               # This file
├── LICENSE                 # MIT License
├── CODE_OF_CONDUCT.md      # Code of conduct
├── CONTRIBUTING.md         # Contributing guidelines
├── .gitignore              # Git ignore rules
```

## 🤝 Contributing

This project is developed in the open source spirit. Your suggestions and contributions are welcomed:

1. 🍴 Fork the project
2. 🌟 Create a feature branch (`git checkout -b feature/new-feature`)
3. 💻 Commit your changes (`git commit -am 'Add new feature'`)
4. 📤 Push your branch (`git push origin feature/new-feature`)
5. 🔄 Create a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## 📞 Support

- 🐛 **Bug Reports**: Use the Issues tab
- 💡 **Suggestions**: Open Issues for new feature suggestions
- 📖 **Documentation**: README file is continuously updated

## 📄 License

This project is distributed under the [MIT License](LICENSE).

---

Last Update: October 2025
