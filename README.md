# SRT Altyazı Düzenleyici ve Çevirmen

Gelişmiş, tarayıcı tabanlı bir SRT (altyazı) düzenleme ve çeviri aracı. Hiçbir sunucu veya veritabanı bağlantısı gerektirmeden, tüm işlemleri doğrudan tarayıcınızda gerçekleştirir.

🔗 **Canlı Demo:** [mertarslna.github.io/cevirmen](https://mertarslna.github.io/cevirmen/)

## 🚀 Özellikler

- **Yerel Çalışma:** Tüm verileriniz tarayıcınızın `localStorage` alanında saklanır. Dosyalarınız hiçbir sunucuya yüklenmez, böylece verileriniz güvende kalır.
- **Sürükle & Bırak Desteği:** Tekli `.srt` dosyalarını veya klasörleri ekrana sürükleyip bırakarak kolayca içe aktarabilirsiniz.
- **Çoklu Dil Desteği:** Altyazılarınızı Türkçe, İngilizce, Çince, Almanca, Fransızca, İspanyolca ve Rusça dilleri arasında çevirebilirsiniz.
- **Otomatik Kaydetme:** Yaptığınız tüm değişiklikler anında otomatik olarak kaydedilir; tarayıcıyı kapatsanız dahi işinize kaldığınız yerden devam edebilirsiniz.
- **Karakter Sınırı Uyarıları:** Standart altyazı kurallarına uygun olarak 27 karakter sınırını aşan satırlar için akıllı uyarı sistemi (Uyarılar arası hızlı gezinme desteği).
- **Özel İsimler Sözlüğü:** Çevirilerde tutarlılık sağlamak amacıyla, projeye veya diziye özel kelime sözlüğü oluşturabilirsiniz.
- **Altyazı Karşılaştırma (`compare.html`):** Farklı altyazı dosyalarını veya çevirileri yan yana karşılaştırma imkanı.
- **Dışa Aktarma:** Düzenlenen altyazıları kolayca tek tıkla `.srt` formatında cihazınıza indirebilirsiniz.

## 🛠️ Kurulum ve Kullanım

Bu proje tamamen istemci tarafında (client-side) çalışır, Node.js veya herhangi bir sunucu kurulumu gerektirmez.

1. Projeyi bilgisayarınıza indirin veya klonlayın:
   ```bash
   git clone https://github.com/kullaniciadi/Cevirmen.git
   ```
2. İndirdiğiniz klasördeki `index.html` dosyasını favori web tarayıcınızda (Chrome, Edge, Firefox vb.) açın.
3. `.srt` dosyalarınızı ekrana sürükleyip bırakın veya sol menüdeki **Dosya/Klasör Ekle** butonlarını kullanın.
4. Çeviri ve düzenlemelerinizi yapın. Sonuçları bilgisayarınıza kaydetmek için sağ üstteki **İndir** butonunu kullanın.

## 📂 Proje Yapısı

- `index.html`: Ana uygulama arayüzü ve gelişmiş SRT düzenleyici.
- `compare.html`: İki farklı altyazı dosyasını karşılaştırma aracı.
- `extractor.html`: Altyazı ayıklama ve kontrol modülü.
- `styles.css`: Uygulamanın modern ve karanlık mod (dark-mode) odaklı özel arayüz tasarımı.
- `storage.js`: Yerel veri depolama (`localStorage`) ve dosya yönetimini sağlayan çekirdek kütüphane.
- `srtlogo.png`: Uygulama ikon ve logosu.

## 💻 Kullanılan Teknolojiler

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)

## 🤝 Katkıda Bulunma

Hata bildirimleri, yeni özellik önerileri ve pull request'ler her zaman kabul edilir! Katkıda bulunmak isterseniz lütfen bir Issue açın veya projeyi forklayıp Pull Request gönderin.

## 📝 Lisans

Bu proje kişisel kullanım için geliştirilmiş olup serbestçe kullanılabilir ve geliştirilebilir.
