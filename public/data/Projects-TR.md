# PROJELER

### Distributed File Fragmentor – [github.com/ahmadmdabit/DistributedFileFragmentor](https://github.com/ahmadmdabit/DistributedFileFragmentor)

- **Teknolojiler:** .NET 9, Clean Architecture, SOLID Principles, CQRS, EF Core 9, System.CommandLine, Resilience Patterns
- .NET 9, Clean Architecture ve SOLID Principles kullanılarak, büyük dosyaları parçalara ayıran, bu parçaları birden fazla depolama sağlayıcısına (Dosya Sistemi, Veritabanı) dağıtan ve bütünlüğü SHA-256 ile doğrulayan dağıtık bir dosya depolama sistemi tasarlandı.
- Kaynak üreten (source-generated) bir Mediator ile CQRS deseni uygulandı ve paralel işlemleri güvenli ve verimli bir şekilde yönetmek için izole DbContext kapsamlarına sahip sağlam bir toplu işleme (batch processing) sistemi geliştirildi.
- Üstel geri çekilme (exponential backoff) ve devre kesici (circuit breaker) gibi ileri düzey dayanıklılık (resilience) desenleri entegre edildi ve path traversal ile symlink saldırılarına karşı güvenlik önlemleri alındı.

### SystemProcesses – [github.com/ahmadmdabit/SystemProcesses](https://github.com/ahmadmdabit/SystemProcesses)

- **Teknolojiler:** .NET, WPF, MVVM, Windows API, Zero‑Allocation Patterns, Thread‑Safe Data Structures
- Hiyerarşik işlem görünümleri ve gerçek zamanlı kaynak metrikleri (CPU, bellek, I/O, depolama) sunan, yüksek performanslı bir Windows sistem monitörü ve görev yöneticisi tasarlandı ve geliştirildi.
- Sıfır bellek tahsisatlı (zero-allocation) çalışma yolları ve iş parçacığı güvenli (thread-safe) veri yapıları ile performans optimize edilerek GC ek yükü azaltıldı ve yoğun sistem yükü altında arayüzün akıcı çalışması sağlandı.
- Bütünsel izleme ve sistem metriklerine hızlı erişim sağlamak için sistem tepsisi (tray) iyileştirmeleri ve depolama istatistikleri modülleri entegre edildi.
- Sistem kararlılığını ve uyumluluğunu korumaya yönelik güvenlik önlemleriyle donatılmış gelişmiş yönetim araçları (işlem sonlandırma, yetki yükseltme, inceleme) geliştirildi.
- Kurumsal düzeyde geliştirme pratikleriyle uyumlu ve MIT lisansı altında açık kaynaklı olarak sunulan, .NET WPF ve MVVM kullanan modüler, sürdürülebilir bir masaüstü çözümü tasarlandı.

### Semantic Tool Router – [github.com/ahmadmdabit/semantic-tool-router](https://github.com/ahmadmdabit/semantic-tool-router)

- **Teknolojiler:** TypeScript, Node.js, Commander.js, Ollama Embeddings, JSONL Vector Store, Mermaid/CLI tooling, Vitest
- Komut satırı üzerinden çalışan, yapay zekâ araç kataloğu için semantik yönlendirme yapan bir CLI geliştirildi; araçları offline olarak indeksleyip, çalışma anında yalnızca en alakalı ilk K araç şemasını enjekte ederek “fat agent” problemini çözdü.
- Kosinüs benzerliği, yapısal niyet tespiti ve anahtar kelime örtüşmesini Reciprocal-Rank Fusion ile birleştiren çok sinyalli bir geri getirme hattı tasarlandı; böylece yönlendirme doğruluğu artırılırken token şişmesi azaltıldı.
- Her araç için pozitif ve negatif gömme vektörleri tutan kutu işareti (polarity-aware) bir vektör deposu uygulandı; model/dimensions doğrulaması, eşik tabanlı güven filtresi ve JSONL kalıcılığı ile yerel, hızlı ve güvenilir bir yönlendirme akışı oluşturuldu.
- Araç bazlı trigger ve boost kurallarını çalışma anında derleyen veri odaklı bir niyet katmanı geliştirildi; yerleşik fiil tabanlı kurallar ve en uzun eşleşme önceliği ile sabit kodlu araç isimlerine bağımlılık olmadan ayrıştırma sağlandı.

### Meeting System - [github.com/ahmadmdabit/MeetingSystem](https://github.com/ahmadmdabit/MeetingSystem)

- **Teknolojiler:** .NET 9, Angular 20+, Clean Architecture, SOLID Principles, Docker, MinIO, Hangfire, Testcontainers, RxJS
- Backend için .NET 9 Clean Architecture ve SOLID Principles. Frontend için Angular 20+ Standalone Components kullanılarak full-stack ve konteynerize edilmiş bir toplantı yönetim sistemi tasarlandı.
- Nesne depolama (object storage) için MinIO ve arka plan görevlerinin (background jobs) işlenmesi için Hangfire gibi servisler entegre edilerek, Docker Compose kullanılarak eksiksiz bir DevOps ortamı kuruldu.
- Duyarlı ve öngörülebilir bir kullanıcı deneyimi oluşturmak amacıyla, bileşen durumunu (component state) deklaratif olarak yöneten, RxJS ile reaktif bir frontend geliştirildi.
- Yüksek güvenilirlik sağlamak amacıyla, gerçek bir SQL Server örneği üzerinde entegrasyon testleri çalıştırmak için Testcontainers kullanılarak backend için sağlam bir test stratejisi oluşturuldu.

### Linguistics (Yüksek Performanslı Arapça Doğal Dil İşleme [NLP] Kütüphanesi) - [github.com/ahmadmdabit/Linguistics](https://github.com/ahmadmdabit/Linguistics)

- **Teknolojiler:** C#, .NET 10, SOLID Principles, NLP, Span<T>, stackalloc, Morphological Analysis, Stemming, NUnit
- C# ile harici hiçbir bağımlılık barındırmayan, .NET 6'dan 10'a kadar olan sürümleri destekleyen sıfır bellek tahsisatlı (zero-allocation) Arapça Doğal Dil İşleme (NLP) kütüphanesi geliştirildi.
- Arama dizini oluşturma (search indexing) iş yüklerinde yüksek performans elde etmek için `Span<T>`, `stackalloc` ve tamsayı paketli (integer-packed) arama tabloları kullanılarak performans kritik yollar optimize edildi.
- Standart Regex tabanlı motorlara kıyasla yürütme hızını önemli ölçüde artıran gelişmiş hareke kaldırma (diacritic removal) ve regex içermeyen metin temizleme (text sanitization) algoritmaları uygulandı.

### App User Data Scanner (Yüksek Performanslı Dizin Tarayıcı) - [github.com/ahmadmdabit/AppUserDataScanner](https://github.com/ahmadmdabit/AppUserDataScanner)

- **Teknolojiler:** C#, .NET 10, NativeAOT, System.Threading.Channels, Producer-Consumer, ZLogger
- Chromium ve Electron profillerinin hızlı bir şekilde tespit edilmesi için .NET 10 ve NativeAOT kullanılarak çok iş parçacıklı (multi-threaded) bir sistem dizini tarayıcısı geliştirildi.
- Düşük kaynak tüketimiyle klasör yapılarını taramak amacıyla `System.Threading.Channels` ve `Parallel.ForEachAsync` kullanılarak bloklamayan bir producer-consumer veri yolu (pipeline) tasarlandı.
- Sıfır bellek tahsisatlı (zero-allocation) kritik çalışma yollarında `ReadOnlySpan<char>`, `FrozenDictionary` ve nesne havuzu (object pooling) kullanılarak bellek ayak izini en aza indirmek için yol ayrıştırma (path parsing) süreçleri optimize edildi.

### Data Import/Export Viewer (WPF Tablo Veri Uygulaması) - [github.com/ahmadmdabit/DataTablesApp](https://github.com/ahmadmdabit/DataTablesApp)

- **Teknolojiler:** C#, .NET 10, WPF, MVVM, IAsyncEnumerable, DataGrid Virtualization, OpenXML, YamlDotNet, Result Pattern
- CSV, JSON, XLSX, XML ve YAML formatlarında akış (streaming) üzerinden içe ve dışa aktarma işlemlerini destekleyen bir WPF masaüstü veri görüntüleme uygulaması geliştirildi.
- `IAsyncEnumerable<T>`, OpenXmlReader ve sıfır bellek tahsisatlı span tabanlı CSV satır ayrıştırma teknikleri kullanılarak bellek dostu bir veri akışı (data streaming) uygulandı.
- Büyük ölçekli tabloların sorunsuz render edilmesi için sanallaştırılmış DataGrid bileşenleri içeren, CommunityToolkit.Mvvm tabanlı, temiz ve bağımsız bir MVVM mimarisi tasarlandı.

### Kişisel Web Sitesi ve Yapay Zeka Asistanı (RAG) - [github.com/ahmadmdabit/ahmadmdabit.github.io](https://github.com/ahmadmdabit/ahmadmdabit.github.io)

- **Teknolojiler:** SOLID Principles, Atomic Design, React 19, TypeScript, Material-UI (MUI) v7, React Router v7, puter.js, MiniSearch, CSP, GitHub Pages
- Bileşen odaklı Atomic Design metodolojisi ve React Router v7 navigasyonu içeren, veri odaklı ve reaktif bir React 19 / TypeScript tek sayfa uygulaması (SPA) olarak kişisel portföy web sitesi geliştirildi.
- Yapılandırılmış özgeçmiş ve SSS (FAQ) belgeleri üzerinde çalışan iki dilli (bilingual) bir tam metin arama dizini oluşturmak amacıyla `MiniSearch` kütüphanesini kullanan istemci taraflı (client-side) RAG sistemi tasarlandı.
- `puter.js` entegrasyonu ile LLM akışını (streaming), araç çağırma (tool-calling) yeteneklerini, veri gizliliğini korumak için dinamik kişisel veri maskelemeyi (lazy PII hydration) ve gerçek zamanlı token kullanım göstergesini içeren yapay zeka asistanı geliştirildi.
- Token sınır aşımı hatalarını önlemek amacıyla, geçmiş konuşma verilerini arka planda dinamik olarak özetleyen, üstel geri çekilme (exponential backoff) mekanizmasına sahip bloklamayan bir bağlam sıkıştırma kuyruğu (`queueMicrotask`) tasarlandı.
- XSS vektörlerini engellemek için özelleştirilmiş `DOMPurify` HTML arındırma filtreleri ve katı İçerik Güvenliği Politikası (CSP) kuralları uygulanarak güvenlik altyapısı güçlendirildi; W3C ARIA erişilebilirlik standartlarına tam uyum sağlandı.

### Architectly (Yapay Zeka Destekli Döküman Üreticisi) - [github.com/ahmadmdabit/architectly](https://github.com/ahmadmdabit/architectly)

- **Teknolojiler:** SOLID Principles, TypeScript, Vite, Puter.js, i18next, IndexedDB, Signal-Based Reactivity, SCSS, WCAG 2.1 AA
- Sadece istemci tarafında (client-only) çalışan, strict TypeScript, SCSS ve Vite üzerine kurulu, %100 yerel çalışan yapay zeka destekli bir BRD/PRD döküman üreticisi geliştirildi.
- Uygulama arayüzü güncellemelerini koordine etmek için hafif sinyal primitifleri (`signal`, `computed`, `effect`) kullanan SolidJS tarzı özel bir reaktif durum yönetim (state management) sistemi tasarlandı.
- IndexedDB (FIFO tahliye mekanizmalı 100 dökümana kadar) ve localStorage kullanan istemci taraflı kalıcılık (persistence) katmanı uygulandı; Puter.js yapay zeka çağrıları AbortController ile güvence altına alındı.
- Odak tuzakları (focus trap), klavye navigasyonu ve dinamik RTL (sağdan sola) oluşturma özelliğine sahip çok dilli (EN/TR/AR) destek içeren, WCAG 2.1 AA standartlarıyla uyumlu erişilebilir bir arayüz tasarlandı.

### MCP CLI (Model Context Protocol Komut Satırı Arayüzü) - [github.com/ahmadmdabit/mcp-cli](https://github.com/ahmadmdabit/mcp-cli)

- **Teknolojiler:** TypeScript, @modelcontextprotocol/sdk, Bun, Commander.js, Unix Domain Sockets, Windows Named Pipes, GitHub Actions
- TypeScript ve resmi `@modelcontextprotocol/sdk` kütüphanesi kullanılarak Model Context Protocol (MCP) sunucuları için hafif ve tip güvenli (type-safe) bir komut satırı arayüzü (CLI) geliştirildi.
- CLI çağrıları arasında aktif oturumları sürdürmek için platforma özel soketler (Unix Domain Sockets ve Windows Named Pipes) kullanan kalıcı bir arka plan servisi (daemon mode) tasarlandı.
- Araç izin/engelleme listeleri (allowlist/denylist), kaynak erişim doğrulaması ve maksimum veri boyutu sınırlamalarını içeren istemci taraflı güvenlik kuralları (policy guards) ile JSONPath filtreleme özelliği entegre edildi.
- Windows, macOS ve Linux işletim sistemleri için ikili dosyaların (binaries) derlenmesi, imzalanması ve bütünlük doğrulaması (SHA-256) süreçlerini otomatikleştirmek amacıyla Bun derleyicisi ve GitHub Actions kullanan çok platformlu bir yayınlama (release) hattı kuruldu.

### Aided - [github.com/ahmadmdabit/aided](https://github.com/ahmadmdabit/aided)

- **Teknolojiler:** SOLID Principles, JavaScript, TypeScript, Fine-Grained Reactivity, Web Workers, Vitest, TestCafe, Web Security (XSS)
- SolidJS'ten esinlenerek, Virtual DOM kullanmadan kullanıcı arayüzleri oluşturmak için sahiplik grafiği (ownership graph) ile otomatik bellek yönetimi sunan bağımsız reaktif bir JavaScript kütüphanesi (5.92kb) geliştirildi ve yayınlandı.
- Bloklamayan arayüz işlemleri için arka planda **Web Workers** kullanan asenkron en uzun artan alt dizi (LIS) liste mutabakat algoritması ve sanal liste bileşeni (`VirtualFor`) tasarlandı.
- Hassas özniteliklerde güvenli olmayan URL protokollerini engelleme (`javascript:` vb.), otomatik olay yöneticisi (event handler) reddi ve katı etiket doğrulaması gibi proaktif XSS koruma mekanizmalarıyla kütüphane güvenliği artırıldı.
- Sıfır ek yük getiren performans profilleyicisi, hata izolasyonlu zamanlayıcı (scheduler) ve `AbortSignal` kullanan `createResource` istek iptal mekanizması entegre edildi.
- Sayfa Nesnesi Modeli (Page Object Model) kullanarak Vitest birim testlerini ve **TestCafe** uçtan uca (E2E) tarayıcı testlerini içeren otomatikleştirilmiş kapsamlı bir test altyapısı kuruldu.

### RepoAIfy - [github.com/ahmadmdabit/RepoAIfy](https://github.com/ahmadmdabit/RepoAIfy)

- **Teknolojiler:** C#, .NET 9, WPF, MVVM, .NET Class Library, .NET CLI, JSON, Git, Markdown
- MVVM desenini kullanarak temiz bir sorumlulukların ayrımı (separation of concerns) sağlayan, büyük kod tabanlarını analiz etmek ve belgelemek için çift arayüzlü (WPF ve CLI) bir .NET 9 çözümü tasarlandı ve geliştirildi.
- Duyarlı ve akıcı bir kullanıcı deneyimi için etkileşimli bir ağaç görünümü ve iptal edilebilir görevler içeren dinamik, gerçek zamanlı bir dosya filtreme sistemi uygulandı.
- Büyük kod analizlerini yönetilebilir Markdown dosyalarına bölmek ve bunları yapay zeka modelleri tarafından tüketilmeye ve incelenmeye uygun hale getirmek amacıyla otomatik bir çıktı bölme (chunking) özelliği geliştirildi.

### AI Utils Extension - [github.com/ahmadmdabit/ai-utils-extension](https://github.com/ahmadmdabit/ai-utils-extension)

- **Teknolojiler:** React 19, TypeScript, Tailwind CSS, Vite, Vitest, Chrome Manifest V3, Google Gemini AI
- Tarayıcı sekmelerinde özetleme, çeviri ve özel veri çıkarma dahil olmak üzere karmaşık işlemler gerçekleştirmek için Google'ın Gemini AI teknolojisini kullanan çok adımlı bir yapay zeka işlem hattı (pipeline) içeren bir Chrome eklentisi geliştirildi.
- React 19 ve Tailwind CSS ile gerçek zamanlı görev durumu güncellemeleri ve birden fazla sekmeden gelen verileri tek bir çıktıda birleştirme yeteneği sunan modern, duyarlı bir kullanıcı arayüzü geliştirildi.
- Vitest ve React Testing Library içeren sıkı bir test çerçevesi ile ESLint, Prettier ve Husky git kancaları (hooks) kullanılarak otomatikleştirilmiş kod kalitesi kontrollerine sahip profesyonel ve ölçeklenebilir bir geliştirme ortamı kuruldu.

### e-store - [github.com/ahmadmdabit/e-store](https://github.com/ahmadmdabit/e-store)

- **Teknolojiler:** .NET 6, ASP.NET Core, RESTful API, N-Tier Architecture, JWT, Entity Framework Core, SQL Server, MVC
- Veri Erişimi (DAL), İş Mantığı (BLL) ve API katmanlarını temiz bir şekilde ayırmak için ölçeklenebilir bir N-Tier tasarımı uygulanarak .NET 6 üzerinde full-stack bir e-ticaret uygulaması tasarlandı.
- Kullanıcı verilerini korumak ve uygulama erişimini yönetmek için JWT tabanlı kimlik doğrulama sunan ve Swagger ile tamamen belgelenmiş güvenli bir RESTful arka uç (backend) API'si uygulandı.
- Ürün kataloğu, alışveriş sepeti ve sipariş işleme gibi temel e-ticaret özelliklerini entegre eden, ASP.NET Core MVC ve Razor Views kullanan eksiksiz bir kullanıcı odaklı uygulama geliştirildi.

### NotificationSystem - [github.com/ahmadmdabit/NotificationSystem](https://github.com/ahmadmdabit/NotificationSystem)

- **Teknolojiler:** .NET Core, Microservices Architecture, Ocelot API Gateway, Dapper, SQL Server, RESTful API
- Kullanıcı ve bildirim işlevlerini bağımsız, ölçeklenebilir servislere ayıran, mikroservis mimarisine sahip dağıtık bir sistem tasarlandı ve uygulandı.
- Frontend için tek ve birleşik bir giriş noktası sağlamak, istek yönlendirmeyi merkezileştirmek ve servis keşfini (service discovery) basitleştirmek için Ocelot kullanılarak bir API Gateway yapılandırıldı.
- Servisler ve veritabanı arasında verimli iletişimi sağlamak amacıyla doğrudan SQL sorgusu yürütmek için Dapper ORM kullanılarak yüksek performanslı bir veri erişim katmanı kuruldu.

### SinavOlusturma (Exam Management System) - [github.com/ahmadmdabit/SinavOlusturma](https://github.com/ahmadmdabit/SinavOlusturma)

- **Teknolojiler:** .NET Core, ASP.NET Core, N-Tier Architecture, RESTful API, JWT, Dapper, SQLite, HtmlAgilityPack
- API arka ucu (backend), iş mantığı (business logic) ve veri erişim katmanlarını mantıksal olarak ayırmak için temiz bir N-Tier mimarisi kullanılarak full-stack bir sınav yönetim sistemi geliştirildi.
- Yönetici (Admin) ve standart Kullanıcı (User) rolleri için belirgin izinler ve uygulama görünümleri sağlamak amacıyla JWT ile güvenli, rol tabanlı bir kimlik doğrulama sistemi uygulandı.
- Sınav oluşturma sürecinde içerikleri dinamik olarak ayıklamak ve içe aktarmak için HtmlAgilityPack kullanan bir web kazıma (web scraping) modülü entegre edilerek pratik veri çıkarma becerileri sergilendi.

### Exchange (Real-time Exchange Rate Tracker) - [github.com/ahmadmdabit/Exchange](https://github.com/ahmadmdabit/Exchange)

- **Teknolojiler:** .NET Core, ASP.NET Core, WebSockets, Redis, Vue.js, MySQL, JWT, RESTful API
- Canlı döviz güncellemelerini .NET Core arka ucundan (backend) duyarlı bir Vue.js istemcisine aktarmak için WebSockets kullanılarak gerçek zamanlı bir veri hattı (data pipeline) geliştirildi.
- Veritabanı yükünü önemli ölçüde azaltmak ve yüksek frekanslı, düşük gecikmeli veri güncellemelerini mümkün kılmak için yüksek performanslı bellek içi önbellekleme (in-memory caching) amacıyla Redis uygulandı.
- JWT kimlik doğrulamasına sahip güvenli bir RESTful API ve piyasa verisi dalgalanmalarını simüle etmek için ayrı bir arka plan servisi (background service) içeren çok bileşenli bir sistem geliştirildi.

### Market (Customer Management System) - [github.com/ahmadmdabit/market](https://github.com/ahmadmdabit/market)

- **Teknolojiler:** .NET Core, Angular 11, TypeScript, N-Tier Architecture, NHibernate, SQL Server, RESTful API, ag-Grid
- Güçlü ve nesne yönelimli veri erişimi için NHibernate ORM kullanılarak temiz bir N-Tier mimarisine sahip full-stack bir müşteri yönetim uygulaması geliştirildi.
- Etkileşimli ag-Grid veri tabloları dahil olmak üzere kapsamlı veri yönetimi için Angular 11 ile zengin özelliklere sahip ve duyarlı bir tek sayfadan oluşan uygulama (SPA) geliştirildi.
- Angular ön ucu ile .NET arka ucu arasındaki iletişim katmanı olarak hizmet etmek ve sorunsuz CRUD işlemlerini sağlamak için temiz bir RESTful API tasarlandı ve uygulandı.

### SevenZipRunner – [github.com/ahmadmdabit/SevenZipRunner](https://github.com/ahmadmdabit/SevenZipRunner)

- **Teknolojiler:** .NET 6–10, C#, Dependency Injection, Options Pattern, Async Process Execution, Platform-Aware Runtime Logic
- Yönetilen kod üzerinden 7‑Zip çalıştırmak için hafif bir .NET kütüphanesi geliştirildi; sıkıştırma ve çıkarma işlemleri basit ve asenkron bir API ile sunuldu.
- Windows/Linux ve x86/x64 için doğru 7‑Zip çalıştırılabilir dosyasını seçen platform farkındalığına sahip yürütülebilir dosya çözümleme mantığı tasarlandı; 32-bit bellek sorunlarını önlemek için sıkıştırma ayarları otomatik olarak optimize edildi.
- `Balanced`, `Fastest`, `MaxCompression` ve `LogArchiving` gibi adlandırılmış sıkıştırma profilleri eklendi; böylece sıkıştırma seviyesi, iş parçacığı sayısı ve süreç önceliği iş yüküne göre yapılandırılabilir hale getirildi.
- Hata durumlarında çıkış kodu, stderr ve çalıştırılan argümanları ayrıntılı şekilde sunan özel `SevenZipException` ile yapılandırılmış hata yönetimi sağlandı.

### MCP Hub Web Interface – [github.com/ahmadmdabit/mcp-hub-web-interface](https://github.com/ahmadmdabit/mcp-hub-web-interface)

- **Teknolojiler:** Node.js, Koa.js, Vanilla JavaScript, CSS3, HTML5, MCP Protocol, node-fetch
- MCP Hub sunucularını izlemek ve yönetmek için, Spotify esintili bir arayüzle gerçek zamanlı durum takibi, yetenek sayıları, çalışma süresi izleme ve yönetim aksiyonları sunan sıfır-build, üretime hazır bir web paneli geliştirildi.
- `/api/servers/*` isteklerini port 3000’de çalışan MCP Hub’a şeffaf biçimde yönlendiren Koa tabanlı bir API forwarder tasarlandı; sorgu parametreleri korunarak backend erişilemediğinde zarif 502 hata yanıtları döndürüldü.
- JSON şemalarından dinamik form üretimiyle birlikte araçlar, kaynaklar ve prompt’lar için satır içi yetenek çalıştırma özelliği, çift modal akışı ve sunucu bazlı ile sistem geneli execution istatistik takibi uygulandı.
- XSS güvenli render için `escapeHtml()` ile korunan, duyarlı kart tabanlı yerleşime ve ölçeklenebilir tema/uyum için CSS değişkenleri mimarisine sahip güvenli bir istemci arayüzü tasarlandı.
