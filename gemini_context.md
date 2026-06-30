# PROJE BAĞLAM DOSYASI (CONTEXT)

## 1. Genel Bakış & Hedef

ErenStore, çok kullanıcı tipli bir e-ticaret platformunun RESTful Web API backend'idir. Sistemde üç farklı kullanıcı rolü bulunur: **Admin**, **Seller** (Satıcı) ve **Customer** (Müşteri). Satıcılar, ürün ekleyebilmek için önce Admin onayından geçmek zorundadır. Müşteriler ürün listesini inceleyip sipariş oluşturabilir; Admin ve Satıcılar sipariş durumlarını güncelleyebilir. Hedef mimari; rol tabanlı yetkilendirme, soft-delete, JWT kimlik doğrulama ve merkezi exception handling içeren, production-ready bir Layered Architecture API'dır.

---

## 2. Teknoloji Yığını (Tech Stack)

| Katman / Alan        | Teknoloji / Paket                                    | Sürüm      |
|----------------------|------------------------------------------------------|------------|
| Dil                  | C#                                                   | 13 (.NET 10)|
| Framework            | ASP.NET Core Web API                                 | net10.0    |
| ORM                  | Entity Framework Core                                | 10.0.9     |
| Veritabanı sürücüsü  | Npgsql.EntityFrameworkCore.PostgreSQL                | 10.0.2     |
| Veritabanı           | PostgreSQL                                           | (local)    |
| Kimlik Doğrulama     | Microsoft.AspNetCore.Authentication.JwtBearer        | 10.0.9     |
| Şifre Hashleme       | BCrypt.Net-Next                                      | 4.2.0      |
| Nesne Haritalama      | AutoMapper                                           | 16.1.1     |
| DI Altyapısı         | Microsoft.Extensions.DependencyInjection             | 10.0.9     |
| OpenAPI / Swagger    | Microsoft.AspNetCore.OpenApi                         | 10.0.9     |
| IDE                  | JetBrains Rider                                      | —          |

**Veritabanı Bağlantı Dizisi** (`appsettings.json`):
```
Host=localhost;Port=5432;Database=ErenStoreDb;Username=erenkurt
```

**JWT Ayarları**:
- Issuer: `ErenStore`
- Audience: `ErenStoreUsers`
- Token süresi: 60 dakika
- Algoritma: HmacSha256

---

## 3. Klasör ve Mimari Yapısı

```
ErenStore/                          ← Solution kökü
├── Entities/                       ← Domain Katmanı (bağımlılıksız)
│   ├── Models/
│   │   ├── BaseModel.cs
│   │   ├── User.cs
│   │   ├── Product.cs
│   │   ├── Order.cs
│   │   └── OrderItem.cs
│   └── Enums/
│       ├── UserTypes.cs
│       ├── SellerStatus.cs
│       └── OrderStatus.cs
│
├── Application/                    ← Uygulama Katmanı (iş kuralları, arayüzler)
│   ├── Interfaces/
│   │   ├── IRepository.cs          ← Generic repository kontratı
│   │   ├── IProductRepository.cs   ← Ürüne özgü ek metotlar
│   │   ├── IAuthService.cs
│   │   ├── IProductService.cs
│   │   └── IOrderService.cs
│   ├── Services/
│   │   ├── AuthManager.cs
│   │   ├── ProductManager.cs
│   │   └── OrderManager.cs
│   ├── DTOs/
│   │   ├── RegisterDto.cs
│   │   ├── LoginDto.cs
│   │   ├── ProductDto.cs
│   │   ├── CreateProductDto.cs
│   │   ├── UpdateProductDto.cs
│   │   ├── OrderDto.cs             ← OrderItemDto da bu dosyada tanımlı
│   │   ├── CreateOrderDto.cs
│   │   ├── CreateOrderItemDto.cs
│   │   ├── UpdateOrderStatusDto.cs
│   │   ├── SellerAplicationDto.cs
│   │   └── UpdateSellerStatusDto.cs
│   ├── MappingProfile.cs           ← AutoMapper profili
│   └── DependencyInjection.cs      ← AddApplicationServices() extension
│
├── Infrastructure/                 ← Altyapı Katmanı (EF Core, DB)
│   ├── Context/
│   │   ├── AppDbContext.cs
│   │   └── DbContextFactory.cs     ← Migration için tasarım-zamanı factory
│   ├── Repositories/
│   │   ├── GenericRepository.cs    ← IRepository<T> implementasyonu
│   │   └── ProductRepository.cs    ← IProductRepository implementasyonu
│   └── Migrations/                 ← EF Core migration dosyaları
│
└── WebAPI/                         ← Sunum Katmanı
    ├── Controllers/
    │   ├── AuthController.cs
    │   ├── AdminController.cs
    │   ├── ProductsController.cs
    │   └── OrderController.cs
    ├── Middlewares/
    │   └── ExceptionHandlingMiddleware.cs
    ├── Program.cs
    └── appsettings.json
```

**Tercih Edilen Mimari Desen:** Klasik N-Tier / Katmanlı Mimari (Layered Architecture)

| Katman         | Sorumluluk                                                                      |
|----------------|---------------------------------------------------------------------------------|
| Entities       | Saf domain modelleri ve enum'lar. Hiçbir katmana bağımlı değil.                 |
| Application    | İş kuralları, servis arayüzleri, DTO'lar ve AutoMapper profilleri.              |
| Infrastructure | EF Core DbContext, Generic/özel Repository implementasyonları, migration'lar.   |
| WebAPI         | HTTP controller'ları, JWT middleware, exception handling, DI kaydı.             |

---

## 4. Veri Modelleri & Entity İlişkileri

### BaseModel (tüm entity'lerin kalıtım aldığı taban)
| Property      | Tip       | Açıklama                          |
|---------------|-----------|-----------------------------------|
| Id            | int       | Primary key                       |
| CreatedDate   | DateTime  | UtcNow ile otomatik set edilir    |
| UpdatedDate   | DateTime? | Güncellemelerde set edilir        |
| IsDeleted     | bool      | Soft-delete bayrağı (default: false) |

### User : BaseModel
| Property     | Tip           | Açıklama                                          |
|--------------|---------------|---------------------------------------------------|
| FirstName    | string        |                                                   |
| LastName     | string        |                                                   |
| Email        | string        | Unique (uygulama seviyesinde kontrol edilir)       |
| Password     | string        | BCrypt hash'lenmiş                                |
| PhoneNumber  | string?       |                                                   |
| UserType     | UserTypes     | Admin=1, Seller=2, Customer=3                     |
| StoreName    | string?       | Yalnızca Seller rolü için dolu                    |
| SellerStatus | SellerStatus? | Yalnızca Seller için; Pending/Approved/Rejected/Suspended |

### Product : BaseModel
| Property    | Tip     | Açıklama                                        |
|-------------|---------|--------------------------------------------------|
| Name        | string  |                                                  |
| Description | string  |                                                  |
| Price       | decimal |                                                  |
| Stock       | int     | Sipariş oluşturulduğunda otomatik düşülür        |
| ImageUrl    | string? |                                                  |
| IsActive    | bool    | default: true                                    |
| SellerId    | int     | FK → User.Id                                     |

### Order : BaseModel
| Property    | Tip                    | Açıklama                          |
|-------------|------------------------|-----------------------------------|
| CustomerId  | int                    | FK → User.Id                      |
| TotalAmount | decimal                | Siparişte hesaplanıp kilitlenir   |
| Status      | OrderStatus            | New=1, Processing=2, Shipped=3, Delivered=4, Cancelled=5 |

### OrderItem : BaseModel
| Property  | Tip     | Açıklama                                        |
|-----------|---------|--------------------------------------------------|
| OrderId   | int     | FK → Order.Id                                   |
| ProductId | int     | FK → Product.Id                                 |
| Quantity  | int     |                                                  |
| Price     | decimal | Sipariş anındaki birim fiyat (snapshot)          |

### İlişkiler (EF Core Fluent API ile tanımlı)
- **User → Product**: Bire-Çok (bir satıcının birden fazla ürünü). `OnDelete: Cascade`.
- **User → Order**: Bire-Çok (bir müşterinin birden fazla siparişi). `OnDelete: Restrict` (müşteri silinince sipariş patlamaması için).
- **Order → OrderItem**: Bire-Çok. `OnDelete: Cascade`.
- **Product → OrderItem**: Bire-Çok. `OnDelete: Restrict`.

### AppDbContext
- `DbSet<User> Users`
- `DbSet<Product> Products`
- `DbSet<Order> Orders`
- `DbSet<OrderItem> OrderItems`
- Fluent API konfigürasyonları `OnModelCreating` içinde tanımlı.

---

## 5. Mevcut Durum & Tamamlanan Modüller

### AuthController (`/api/auth`)
| Method | Endpoint   | Yetki     | Açıklama                                          |
|--------|------------|-----------|---------------------------------------------------|
| POST   | /register  | Herkese açık | Kullanıcı kaydı. Satıcılar `SellerStatus=Pending` ile başlar. |
| POST   | /login     | Herkese açık | BCrypt doğrulama, başarılı ise JWT token döner.   |

### AdminController (`/api/admin`)
| Method | Endpoint        | Yetki      | Açıklama                                   |
|--------|-----------------|------------|--------------------------------------------|
| PUT    | /approve-seller | Admin only | Satıcıyı Approved veya Rejected yapar.     |

### ProductsController (`/api/products`)
| Method | Endpoint          | Yetki      | Açıklama                                           |
|--------|-------------------|------------|----------------------------------------------------|
| GET    | /                 | Herkese açık | Tüm aktif ürünleri listeler.                     |
| GET    | /{id}             | Herkese açık | ID'ye göre ürün getirir.                         |
| POST   | /                 | Seller     | Yeni ürün ekler (sadece Approved satıcılar).       |
| PUT    | /                 | Seller     | Ürün günceller (IDOR korumalı — sadece sahibi).   |
| DELETE | /{id}             | Seller     | Soft-delete ile ürünü siler (IDOR korumalı).       |
| GET    | /my-products      | Seller     | Token'daki satıcının kendi ürünlerini listeler.    |

### OrdersController (`/api/orders`)
| Method | Endpoint        | Yetki         | Açıklama                                              |
|--------|-----------------|---------------|-------------------------------------------------------|
| POST   | /               | Customer      | Sipariş oluşturur (stok kontrolü + stok düşümü yapılır, fiyat kilitlenir). |
| GET    | /my-orders      | Customer      | Token'daki müşterinin kendi siparişlerini listeler (eager loading ile OrderItems.Product). |
| GET    | /all-orders     | Admin         | Sistemdeki tüm siparişleri listeler.                  |
| PUT    | /{id}/status    | Admin, Seller | Sipariş durumunu günceller (OrderStatus enum ile).    |

### Altyapı & Çapraz Kesimler
- **GenericRepository\<T\>**: `GetByIdAsync`, `GetAllAsync` (opsiyonel predicate + include desteği), `AddAsync`, `UpdateAsync` (soft-update), `DeleteAsync` (soft-delete), `SaveChangesAsync` — tümü `IsDeleted` filtresi uygular.
- **ProductRepository**: `GetBySellerIdAsync` ek metodu ile GenericRepository'yi genişletir.
- **ExceptionHandlingMiddleware**: `UnauthorizedAccessException → 401`, `KeyNotFoundException → 404`, `InvalidOperationException → 400`, diğerleri `→ 500` olarak camelCase JSON formatında döner.
- **JWT Authentication**: `[Authorize(Roles = "Admin|Seller|Customer")]` attribute tabanlı, token'dan `ClaimTypes.NameIdentifier` ile userId okunur.
- **AutoMapper**: `MappingProfile` — Product↔ProductDto, Order↔OrderDto, OrderItem↔OrderItemDto (ProductName eager-loaded), User→SellerApplicationDto.

---

## 6. Sırada Bekleyen Görev (Current/Next Task)

Bilinen bir sonraki adım henüz bu dosyada netleştirilmemiştir. Önceki commit geçmişine göre tamamlanan son işler şunlardır:
- Sipariş oluşturma ve listeleme endpoint'leri
- Sipariş durum güncelleme endpoint'i
- `OrderStatus` alanının `string`'den `enum`'a dönüştürülmesi (migration: `UpdateOrderStatusToEnum`)
- Eager loading ile `OrderItems.Product` ilişkisinin çözülmesi
- BCrypt ile şifre hashleme

Olası bir sonraki aşama adayları (commit mesajlarından çıkarılan sıra):
1. **Ürün arama / filtreleme** (kategori, fiyat aralığı vb.)
2. **Sepet (Cart) modülü** — sipariş öncesi ara katman
3. **Frontend entegrasyonu** (henüz mevcut değil)
4. **Admin paneli** için satıcı başvurularını listeleme endpoint'i

> Kullanıcıyla bir sonraki spesifik görevi netleştirmek gerekiyor.

---

## 7. Kodlama Standartları ve Kuralları

| Kural                          | Uygulama Şekli                                                                                  |
|--------------------------------|-------------------------------------------------------------------------------------------------|
| **Katmanlı bağımlılık**        | Controller → Interface → Manager (concrete sınıf). Controller asla Repository'ye doğrudan erişmez. |
| **Repository Pattern**         | Generic `IRepository<T>` + entity'e özgü interface (`IProductRepository`). DI ile Scoped kayıt. |
| **DTO Kullanımı**              | Entity'ler controller katmanına çıkmaz. Giriş ve çıkış için ayrı DTO'lar (CreateDto, UpdateDto, ResponseDto). |
| **Asenkron Programlama**        | Tüm I/O işlemleri `async/await` kullanır. `Task<T>` dönüş tipleri.                            |
| **Soft-Delete**                | `DeleteAsync` fiziksel silme yapmaz; `IsDeleted = true` set eder. Repository tüm sorgularda `!IsDeleted` filtresi uygular. |
| **IDOR Koruması**              | Kaynak güncelleme/silme işlemlerinde `SellerId != userId` kontrolü servis katmanında yapılır; `UnauthorizedAccessException` fırlatılır. |
| **Fiyat Kilitleme (Price Snapshot)** | `OrderItem.Price`, sipariş anında `product.Price`'dan kopyalanır. Sonraki ürün fiyat değişikliklerinden etkilenmez. |
| **Merkezi Hata Yönetimi**      | Controller'larda try-catch yoktur; tüm istisnalar `ExceptionHandlingMiddleware` tarafından yakalanır. |
| **İsimlendirme**               | Sınıflar PascalCase, özel alanlar `_camelCase`, interface'ler `I` öneki. Manager suffix'i concrete service'ler için kullanılır. |
| **Token'dan Kimlik Okuma**     | `User.FindFirst(ClaimTypes.NameIdentifier)` ile userId okunur; controller'larda tekrarlanan kod yerine `GetUserIdFromToken()` private helper mevcuttur (ProductsController'da). |
| **Yorum Politikası**           | Türkçe inline yorumlar öğretici amaçlı yazılmıştır (proje eğitim amaçlı). Production kodda tercih edilmez. |

---

## 8. Bilinen Sorunlar veya Kritik Çözümler Logu

### Çözülmüş Kritik Problemler

**1. `OrderStatus` alanı enum'a dönüştürüldü**
- **Problem:** `Order.Status` başlangıçta `string` tipindeydi; bu durum tip güvenliğini ve DB tutarlılığını zayıflatıyordu.
- **Çözüm:** `OrderStatus` enum'u tanımlandı, migration (`UpdateOrderStatusToEnum`) yazılarak DB şeması güncellendi.

**2. Eager Loading eksikliği**
- **Problem:** Sipariş listelendiğinde `OrderItems` ve içindeki `Product` ilişkileri null dönüyordu.
- **Çözüm:** `GetAllAsync` metoduna `"OrderItems.Product"` include string'i eklenerek çözüldü. AutoMapper'da `ProductName` alanı eager-loaded `Product.Name`'den map'leniyor.

**3. Satıcı onay iş kuralı**
- **Problem:** Onaylanmamış satıcılar ürün ekleyebiliyordu.
- **Çözüm:** `ProductManager.CreateProductAsync` içinde `SellerStatus != Approved` kontrolü eklendi; `InvalidOperationException` fırlatılır (middleware 400 döner).

**4. IDOR Güvenlik Açığı**
- **Problem:** Herhangi bir satıcı, başkasının ürününü güncelleyip silebiliyordu.
- **Çözüm:** Güncelleme ve silme işlemlerinde `product.SellerId != userId` kontrolü servis katmanında uygulandı.

**5. Password Security**
- **Problem:** İlk implementasyonda şifreler plaintext saklanıyordu.
- **Çözüm:** `BCrypt.Net-Next` paketi eklendi; kayıtta `BCrypt.HashPassword`, girişte `BCrypt.Verify` kullanılıyor.

### Mevcut Bilinen Durumlar

- **Admin için satıcı listeleme endpoint'i yok:** Admin, `PUT /api/admin/approve-seller` ile satıcı onaylayabilir ama onay bekleyen satıcıları listeleyecek bir endpoint henüz yazılmamış.
- **CORS:** `AllowAnyOrigin()` ile tamamen açık; production'a geçmeden önce kısıtlanmalı.
- **JWT SecretKey:** `appsettings.json`'da plaintext duruyor; production için `User Secrets` veya `environment variables` kullanılmalı.
- **Validasyon:** DTO'larda `[Required]`, `[MaxLength]` gibi Data Annotation'lar henüz eklenmemiş (sadece `ModelState.IsValid` kontrolü var).
- **`OrdersController` namespace'i:** Dosya `WebAPI.Controllers` namespace'indeyken `ProductsController` `ErenStore.WebAPI.Controllers` namespace'ini kullanıyor — bu tutarsızlık işlevselliği etkilemez ama ileride düzeltilmeli.
