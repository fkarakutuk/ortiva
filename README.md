# Ortiva web sitesi

Bu klasör sitenin tamamıdır: düz HTML, CSS ve JavaScript. Derleme adımı, Python veya başka bir araç gerekmez; dosyaları herhangi bir web sunucusuna olduğu gibi yükleyebilirsiniz.

## Klasör yapısı

```
index.html                     Ana sayfa
products/index.html            Tüm kategoriler
products/<kategori>/index.html Kategori sayfaları (22 adet)
product/<ürün>/index.html      Ürün detay sayfaları (311 adet)
solutions/, about/, contact/, catalog/, sss/, vaka-calismalari/ ...  Diğer sayfalar
assets/css/style.css           Sitenin tüm stilleri
assets/css/hero3d.css          Ana sayfadaki 3D bölümün stilleri
assets/js/main.js              Menü, arama, mega menü, sayfa geçişleri
assets/js/category.js          Kategori sayfalarındaki filtreler
assets/js/product.js           Ürün görüntüleyici (açı değiştirme, yakınlaştırma)
assets/js/data.js              Arama ve filtreler için ürün/kategori listesi
assets/js/hero3d.bundle.js     Ana sayfa 3D sahnesi: Three.js r160 (MIT lisansı), sahne motoru,
                               GL 0096 modeli ve kaydırma anahtar kareleri tek dosyada
assets/img/                    Görseller (WebP) ve logolar (PNG)
sitemap.xml, robots.txt        Arama motorları için
```

## Önizleme

`index.html` dosyasına çift tıklamanız yeterlidir. Ana sayfadaki 3D bölüm dahil her şey sunucu olmadan da çalışır. Yayındaki sitede de ek bir ayar gerekmez.

## Düzenleme

- **Metinler:** İlgili sayfanın HTML dosyasını açıp doğrudan düzenleyin.
- **Üst menü ve alt bilgi:** Her sayfada tekrarlanır. Değişiklik yapmak için editörünüzün "tüm dosyalarda bul ve değiştir" özelliğini kullanın (VS Code'da Ctrl+Shift+H).
- **Yeni ürün eklemek için:**
  1. `product/` altındaki benzer bir ürün klasörünü kopyalayıp yeniden adlandırın ve içindeki bilgileri güncelleyin.
  2. Ürünün kategorisinin `products/<kategori>/index.html` dosyasına ürün kartını ekleyin. Var olan bir kartı kopyalamak en kolayıdır.
  3. Arama ve filtrelerde görünmesi için ürünü `assets/js/data.js` listesine ekleyin.
- **Görseller:** Ürün fotoğrafları `assets/img/products/<kategori>/<KOD>.webp` (1200×1200) ve `<KOD>-600.webp` (600×600) olarak durur. Yeni fotoğrafı kare, şeffaf arka planlı ve ürün ortada olacak şekilde bu iki boyutta kaydedin.

## Görseller hakkında

- **Ürün fotoğrafları:** Sağlanan katalog görsellerinin çoğu 250–500 piksel boyutundaydı. Bunlar Real-ESRGAN süper çözünürlük modeliyle büyütüldü; ürünün kendisi değiştirilmedi, yeni içerik eklenmedi. Her ürün kare tuvale ortalandı.
- **Uygulama ve detay fotoğrafları:** Proje afişlerinden kırpılıp aynı yöntemle büyütüldü.
- **Temsili görseller:** İki ürünün kendi fotoğrafı sağlanan setlerde yoktu. Zip'te o kodla gelen dosyalar aynı koddaki başka bir ürüne aitti.
  - GL 0987 Cat5 Plug için aynı seriden GL 0988 Cat6 Plug fotoğrafı kullanıldı.
  - GL 1052 beyaz kablo bağı için aynı seriden GL 1059 fotoğrafı kullanıldı.

  Bu iki üründe sayfada ve kartta "Temsili görsel" notu yer alır. Gerçek fotoğrafları gelince aynı dosya adlarıyla değiştirmeniz yeterlidir.
- **3D model:** Ana sayfadaki GL 0096 (3'lü kauçuk grup priz) modeli, gerçek ürünün her açıdan çekilmiş fotoğraflarından ölçülerek kodla kurulmuştur; CAD verisi gelirse onunla değiştirilebilir. Uç kapaktaki plakada numunedeki marka yerine Ortiva logosu vardır. Kapaklar askılarıyla birlikte açılır. Kaydırma sahnelerinin ayarları (`keyframes`) `hero3d.bundle.js` dosyasının sonundadır.
