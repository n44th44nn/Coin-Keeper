# Analisis Pra-Implementasi Website CoinKeeper (Phase 0)

Dokumen ini merangkum hasil analisis menyeluruh terhadap seluruh materi perkuliahan (`material/IMK 00–06` & `IMK-10`), dokumen rujukan (`project-reference/referensi.pdf`), laporan proyek (`Laporan Proyek Akhir Tahap 1.pdf` & `Laporan Proyek Akhir IMK - Tahap 2 (CoinKeeper).pdf`), serta kanvas desain Figma halaman **`web-hi-fi`** (`node-id=124:2`) sebagai *source of truth* antarmuka web **CoinKeeper**.

---

## 1. Ringkasan Aplikasi, Target Pengguna, Aktor, dan Daftar Use Case

### 1.1 Identitas Proyek & Tujuan Aplikasi
- **Nama Aplikasi:** CoinKeeper (Aplikasi Pencatatan dan Rancangan Keuangan Pribadi Berbasis Web untuk Mahasiswa). *(Catatan: `referensi.pdf` memakai nama awal `Monee`, sedangkan Laporan Tahap 1–2 dan Figma menetapkan nama **CoinKeeper**).*
- **Tim Penyusun (dari Laporan Tahap 1 & 2):**
  1. `255150200111045` — Jonathan Simamora
  2. `255150200111048` — Joseph Mohr Dio Sinamo
  3. `255150207111071` — M. Reza Faris Al Faqih
- **Domain Masalah:** Berdasarkan survei kuesioner terhadap 32 mahasiswa pada `referensi.pdf`, **90,6%** bergantung pada uang saku orang tua, **53,2%** pernah/sangat sering mengalami kesulitan keuangan di akhir bulan, dan **68,7%** jarang atau tidak pernah mencatat pengeluaran secara rutin. Elisitasi wawancara pada Laporan Tahap 1 (Fahrizal Dwi Candra & Mohammad Fahmi Alfahrezy) mengonfirmasi bahwa pencatatan manual di catatan ponsel terasa merepotkan dan tidak memberi peringatan dini ketika pengeluaran mulai membengkak.
- **Tujuan Solusi:** Menyediakan aplikasi web yang sederhana, cepat (pencatatan transaksi dalam ≤ 3 langkah / ≤ 10 detik), dan informatif untuk memantau saldo, mengontrol batas anggaran per kategori (peringatan ambang 80% dan ≥ 100%), meninjau laporan pengeluaran bulanan, serta mengelola target tabungan mahasiswa.

### 1.2 Target Pengguna, Persona, dan Aktor
- **Aktor Tunggal (`referensi.pdf` Bab 3.1):** **Mahasiswa** — pengguna akhir yang berinteraksi langsung dengan sistem untuk memantau ringkasan keuangan, mencatat transaksi harian, menetapkan/memantau batas anggaran, menganalisis laporan visual, dan menyetor ke target tabungan.
- **Persona Utama (Laporan Tahap 1 Bab 2):** **Rizal** (Mahasiswa S1 Teknik Informatika Semester 4, anak kos perantau; pada antarmuka Hi-Fi Figma profil ditampilkan sebagai **Faqih / Akun pribadi**).
  - *Konteks Penggunaan:* Mencatat transaksi di sela kuliah/kantin setelah pembayaran QRIS atau saat mengevaluasi keuangan bulanan di kos.
  - *End Goal:* Uang saku cukup hingga akhir bulan dan tersedia sisa dana untuk ditabung.
  - *Experience Goal:* Merasa terkendali dan tenang (*in control*), mengetahui posisi keuangan secara instan tanpa merasa dihakimi.

### 1.3 Daftar Use Case, Kebutuhan Fungsional, dan Pemetaan HTA
Seluruh fungsionalitas inti pada situs statis ini merujuk pada Use Case `referensi.pdf` (Bab 3.4), Kebutuhan Fungsional (`KF-01`–`KF-07`), dan Dekomposisi Tugas HTA pada `Laporan Tahap 2` (Bab 1.1):

| Kode UC | Nama Use Case | Kebutuhan & HTA Terkait | Ringkasan Alur & Aturan Bisnis |
| :--- | :--- | :--- | :--- |
| **HTA-T1** | **Memantau Status Keuangan Terkini di Dasbor** | HTA Task 1 & Task 4 | Menampilkan saldo utama, total pengeluaran bulan berjalan, sisa anggaran terhadap total batas bulanan, 4 transaksi terbaru, dan kartu peringatan dini (*Perlu perhatian*) untuk kategori *Terlampaui* (≥ 100%) dan *Hampir habis* (80–99%). |
| **UC-01** | **Mencatat & Menghapus Transaksi Harian** | `KF-01`, `KF-02`, HTA Task 3 & 3.6 | Memilih jenis (*Pengeluaran* / *Pemasukan*), mengisi nominal (> 0), memilih kategori via chips, mengisi tanggal dan catatan opsional. Validasi kelengkapan sebelum simpan; hitung ulang saldo & progres anggaran; tampilkan dialog konfirmasi tersimpan. Mendukung penghapusan baris riwayat melalui modal konfirmasi destruktif + opsi **Urungkan (Undo)**. |
| **UC-02** | **Melihat Laporan Pengeluaran Bulanan** | `KF-03`, HTA Task 6 | Memilih filter periode bulan (`Sep`, `Okt`, `Nov` 2026); menampilkan grafik batang pengeluaran per kategori beserta garis batas anggaran tiap kategori; perbandingan delta terhadap bulan sebelumnya; total pengeluaran; serta sorotan kategori terbesar dan kategori perlu perhatian. Menyediakan *empty state* bila periode tanpa data. |
| **UC-03** | **Menetapkan & Memantau Batas Anggaran** | `KF-04`, `KF-05`, HTA Task 2 & 4 | Menampilkan 5 kartu kategori anggaran (*Makan*, *Belanja*, *Hiburan*, *Transport*, *Tagihan*) dengan progres meter dan badge status (*Aman* < 80%, *Hampir habis* 80–99%, *Terlampaui* ≥ 100%). Pengguna dapat mengubah batas nominal via modal dialog `Ubah`, lalu sistem mengevaluasi ulang seluruh status dan ringkasan bulanan secara otomatis. |
| **UC-04** | **Mengelola Target & Setoran Tabungan** | `KF-06`, `KF-07`, HTA Task 5 | Menampilkan daftar kartu target tabungan (*Laptop baru*, *Dana darurat*) lengkap dengan grafik cincin persentase, nominal terkumpul, target nominal, dan tenggat. Mendukung aksi **+ Setor** dengan validasi ketersediaan saldo utama (`KF-07`), penambahan **+ Target Baru**, serta aksi **Urungkan** (*Undo*) untuk koreksi cepat. |

### 1.4 Batasan Ruang Lingkup (Laporan Tahap 1 Bab 4.4)
- **IN-Scope:** 5 layar inti desktop & responsif, persistensi lokal berbasis `localStorage` + data awal terstruktur, validasi input & pencegahan error, peringatan anggaran 80% dan 100%, grafik perbandingan anggaran vs realisasi, serta pengelolaan target tabungan.
- **OUT-of-Scope:** Integrasi otomatis m-banking/e-wallet/QRIS, sistem autentikasi/login, backend/basis data server, fitur pinjaman/investasi, serta mode multi-pengguna/keluarga.

---

## 2. Inventaris Layar `web-hi-fi` (45 Frame) & Pemetaan Use Case

Halaman **`web-hi-fi`** pada Figma (`node-id=124:2`) berisi **45 frame desktop (`1440×1024`)** yang tersusun dalam grid 5 kolom × 9 baris. Semua layar utama berbagi **Sidebar Navigasi Utama kiri (`240×1024`)** yang persisten dan **Area Konten Utama kanan (`1200×1024`, lebar efektif `1136px` dengan padding `32px`)**.

### 2.1 Lima Layar Inti (Baris 1)

| No | Nama Frame Figma & ID | Target Berkas Web | Use Case / HTA | Struktur Zona Semantik & Elemen Utama (Berdasarkan XML `web-hi-fi`) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `01 · Dasbor` (`124:3`) | `index.html` | HTA Task 1, Task 4, UC-03 | `<header>`: Judul (`Halo, Faqih`), subjudul periode, tombol primer `+ Tambah Transaksi` (`240×48`).<br>`<section>` KPI 3 kolom (`362.67×145`, gap `24px`): **Saldo** (`Rp 1.430.000`, badge `✓ Aman`), **Pengeluaran bulan ini** (`Rp 1.730.000`, badge `⚠ Hampir habis`), **Sisa anggaran** (`Rp 270.000`, `dari Rp 2.000.000`).<br>`<section>` kiri (`744×551`): **Transaksi terbaru** (tombol `Semua transaksi`, 4 item: *Ojek kampus*, *Uang saku*, *Langganan streaming*, *Makan siang*).<br>`<aside>` kanan (`368px`): kartu **Perlu perhatian** (kategori *Hiburan* `Terlampaui` + *Makan* `Hampir habis` + tombol `Lihat laporan`) dan kartu **Catatan ringkasan**. |
| **2** | `02 · Catat Transaksi` (`124:101`) | `pages/catat-transaksi.html` | UC-01, `KF-01`, `KF-02`, HTA Task 3 & 3.6 | `<header>`: Judul & subjudul (`Catat Transaksi`).<br>Kolom kiri (`552×732`) `<form>` **Form transaksi**: Segmented control **Jenis** (`Pengeluaran` / `Pemasukan`), input **Nominal** + helper text, 7 chip **Kategori** (*Makan*, *Transport*, *Belanja*, *Hiburan*, *Tagihan*, *Pendidikan*, *Lainnya*) + label `Kategori terpilih`, input **Tanggal**, input **Catatan (opsional)**, tombol `Batal` (`254×48`) & `Simpan transaksi` (`254×48`).<br>Kolom kanan (`560px`): **Riwayat transaksi** (daftar item dengan tombol ikon tempat sampah `44×44` per baris) + kartu **Panduan transaksi** (serta banner **Urungkan** saat item dihapus). |
| **3** | `03 · Anggaran` (`124:219`) | `pages/anggaran.html` | UC-03, `KF-04`, `KF-05`, HTA Task 2 & 4 | `<header>`: Judul & subjudul (`Anggaran Kategori`).<br>Kolom kiri (`744px`, grid 2 kolom kartu `360×156`, gap `24px`): 5 kartu kategori (**Makan** `Rp 650.000 / Rp 700.000` `93%` `Hampir habis`, **Belanja** `Rp 310.000 / Rp 400.000` `78%` `Aman`, **Hiburan** `Rp 360.000 / Rp 300.000` `120%` `Terlampaui`, **Transport** `Rp 180.000 / Rp 300.000` `60%` `Aman`, **Tagihan** `Rp 230.000 / Rp 300.000` `77%` `Aman`), masing-masing memiliki tombol `Ubah` (`86×48`).<br>Kolom kanan (`368px`) `<aside>`: **Ringkasan bulanan** (`Rp 1.730.000 / Rp 2.000.000`, progres `87%`, badge `Hampir habis`, tombol `Lihat laporan`) dan **Peringatan hiburan** (alert box merah + tombol `Tinjau hiburan`). |
| **4** | `04 · Laporan` (`124:326`) | `pages/laporan.html` | UC-02, `KF-03`, HTA Task 6 | `<header>`: Judul & subjudul (`Laporan Bulanan`) + segmented filter bulan `Sep`, `Okt`, `Nov` (`358×56`, tiap tab `114×48`).<br>Kolom kiri (`744px`): **Grafik pengeluaran** (`744×488`, sumbu Y `0–800` dalam ribuan Rupiah, 5 batang kategori lebar `48px` dilengkapi garis putus-putus `Batas anggaran` & sorotan merah untuk kategori overbudget) + **Rincian laporan** (`744×200`, menampilkan kategori terbesar & kategori perlu perhatian).<br>Kolom kanan (`368px`) `<aside>`: **Perbandingan bulanan** (`368×224`, menampilkan delta terhadap bulan lalu & total bulan lalu) + **Total laporan** (`368×130`). |
| **5** | `05 · Tabungan` (`124:433`) | `pages/tabungan.html` | UC-04, `KF-06`, `KF-07`, HTA Task 5 | `<header>`: Judul & subjudul (`Rencana Tabungan`) + tombol primer `+ Target Baru` (`240×48`).<br>Kolom kiri (`744px`, grid 2 kolom kartu `360×340`, gap `24px`): **Laptop baru** (`Rp 1.200.000 / Rp 10.000.000`, `12%`, tenggat `31 Mar 2027`, tombol `+ Setor`), **Dana darurat** (`Rp 700.000 / Rp 3.000.000`, `23%`, tombol `+ Setor`), dilengkapi cincin progres donat `96×96` dan kartu dinamis untuk target baru.<br>Kolom kanan (`368px`) `<aside>`: **Ringkasan tabungan** (`Total terkumpul Rp 1.900.000`, pengingat konsistensi menabung + aksi `Urungkan setoran` pasca-setor) dan kartu **Catatan tabungan**. |

### 2.2 Inventaris 40 Frame State Interaktif & Dialog (Baris 2–9)
Seluruh 40 frame sisanya merepresentasikan state dinamis yang akan diimplementasikan secara nyata dengan JavaScript DOM & `<dialog>`:
1. **Variasi Filter Bulan Laporan (2 frame):** `04 · Laporan Sep 2026` (`124:512`, total `Rp 1.510.000`: Makan `620rb`, Belanja `280rb`, Hiburan `210rb`, Transport `170rb`, Tagihan `230rb`) dan `04 · Laporan Okt 2026` (`124:619`, total `Rp 1.770.000`: Makan `690rb`, Belanja `350rb`, Hiburan `310rb`, Transport `190rb`, Tagihan `230rb`).
2. **Variasi Form Transaksi — Jenis × Kategori (13 frame):** `02 · Pengeluaran · Transport/Belanja/Hiburan/Tagihan/Pendidikan/Lainnya` (`124:726`–`124:1316`) dan `02 · Pemasukan · Makan/Transport/Belanja/Hiburan/Tagihan/Pendidikan/Lainnya` (`124:1434`–`124:2142`).
3. **Dialog Feedback & Konfirmasi Transaksi (5 frame):** `Dialog · Transaksi tersimpan` (`124:2260`, panel `520×199`, tombol `Lanjutkan` & `Ke dasbor` & `×`) dan 4 `Dialog · Hapus [Item]` (`124:2271`–`124:2307`, panel `520×257`, judul spesifik, detail transaksi, teks konsekuensi, tombol `Batal` & `Ya, Hapus Transaksi`, tombol tutup `×`).
4. **State Pasca-Hapus Transaksi dengan Undo (4 frame):** `02 · Dihapus · Ojek kampus / Uang saku / Langganan streaming / Makan siang` (`124:2319`–`124:2679`), menampilkan banner/tombol `Urungkan`.
5. **Dialog Ubah Anggaran & State Terbarui (10 frame):** 5 `Dialog · Ubah anggaran [Kategori]` (`124:3578`–`124:3638`, panel `520×308`) beserta 5 state `03 · Anggaran [Kategori] diperbarui` (`124:2799`–`124:3227`).
6. **Dialog & State Tabungan (6 frame):** `Dialog · Setor Laptop baru` (`124:3653`, `520×308`), `Dialog · Setor Dana darurat` (`124:3668`, `520×308`), `Dialog · Target baru` (`124:3683`, `520×457`), 2 state `05 · Setoran ... tercatat` (`124:3334`, `124:3415`) dengan tombol `Urungkan setoran`, dan `05 · Target baru ditambahkan` (`124:3496`) dengan kartu target baru serta tombol `Urungkan target`.

---

## 3. Design Tokens (`css/variables.css`)

Token berikut diekstrak dari kanvas `web-hi-fi`, screenshot overview, dan spesifikasi Design System pada `Laporan Tahap 2` (Bab 2) yang telah diaudit terhadap ambang batas kontras W3C WCAG 2.2 Level AA:

### 3.1 Palet Warna (Proporsi 60-30-10 & Semantik)

| Kelompok Token | Nama CSS Custom Property | Nilai HEX / RGBA | Penggunaan & Catatan Kontras (WCAG 2.2) |
| :--- | :--- | :--- | :--- |
| **Sidebar Gelap** | `--color-sidebar-bg` | `#0F172A` | Latar panel navigasi samping desktop & bottom bar mobile |
| | `--color-sidebar-border` | `#1E293B` | Garis pemisah akun (`Pemisah akun`) |
| | `--color-sidebar-text` | `#CBD5E1` | Teks & ikon item navigasi tidak aktif (kontras tinggi di `#0F172A`) |
| | `--color-sidebar-text-active` | `#FFFFFF` | Teks & ikon menu aktif |
| | `--color-online-dot` | `#22C55E` | Titik indikator status akun (`Penanda akun`) |
| **60% Permukaan** | `--color-bg-canvas` | `#F8FAFC` | Latar kanvas utama (`Area utama`) |
| | `--color-bg-surface` | `#FFFFFF` | Latar kartu konten, input form, dan panel modal dialog |
| | `--color-bg-muted` | `#F1F5F9` | Jalur latar progress bar, hover permukaan netral |
| | `--color-bg-info-tint` | `#EFF6FF` | Latar kartu catatan (*Catatan ringkasan*, *Panduan transaksi*, *Catatan tabungan*) |
| **30% Teks & Struktur** | `--color-text-primary` | `#0F172A` | Heading, judul kartu, teks nominal utama (CR `17.85:1` AAA di `#FFFFFF`, `17.06:1` di `#F8FAFC`) |
| | `--color-text-secondary` | `#475569` | Subjudul, keterangan, teks bantu, meta riwayat (CR `7.58:1` AAA di `#FFFFFF`) |
| | `--color-text-muted` | `#64748B` | Footer, penanda layar, sumbu grafik, caption sekunder (CR `4.76:1` AA di `#FFFFFF`) |
| | `--color-border-card` | `#E2E8F0` | Garis bingkai kartu & garis pemisah horizontal antar-item |
| | `--color-border-input` | `#CBD5E1` | Border input field, chip non-aktif, tombol sekunder |
| **10% Aksen Primer** | `--color-action-primary` | `#1E40AF` | Tombol primer, tab aktif, chip terpilih, batang grafik normal, progres tabungan (CR `8.72:1` AAA dengan `#FFFFFF`) |
| | `--color-action-hover` | `#1D4ED8` | State `:hover` tombol primer & focus outline |
| | `--color-action-active` | `#172554` | State `:active` tombol primer |
| | `--color-action-disabled-bg` | `#E2E8F0` | Latar tombol saat status `disabled` |
| | `--color-action-disabled-text` | `#94A3B8` | Teks tombol saat status `disabled` |
| **Semantik: Success** | `--color-status-success-bg` | `#F0FDF4` | Latar badge `✓ Aman` |
| | `--color-status-success-text` | `#166534` | Teks badge `✓ Aman` & nominal pemasukan `+Rp` (CR `6.81:1` AA di `#F0FDF4`) |
| | `--color-status-success-bar` | `#15803D` | Isi progress bar kategori status `Aman` (< 80%) |
| **Semantik: Warning** | `--color-status-warning-bg` | `#FFFBEB` | Latar badge `⚠ Hampir habis` |
| | `--color-status-warning-text` | `#92400E` | Teks badge `⚠ Hampir habis` (CR `6.84:1` AA di `#FFFBEB`) |
| | `--color-status-warning-bar` | `#D97706` | Isi progress bar kategori status `Hampir habis` (80%–99%) |
| **Semantik: Danger** | `--color-status-danger-bg` | `#FEF2F2` | Latar badge `Terlampaui` & kartu `Peringatan hiburan` |
| | `--color-status-danger-text` | `#991B1B` | Teks badge/peringatan `Terlampaui` & nominal pengeluaran `-Rp` (CR `7.60:1` AAA di `#FEF2F2`) |
| | `--color-status-danger-solid` | `#B91C1C` | Tombol destruktif `Ya, Hapus Transaksi`, batang grafik overbudget, progress bar ≥ 100% (CR `6.47:1` AA dengan `#FFFFFF`) |
| **Overlay Modal** | `--color-backdrop` | `rgba(21, 26, 37, 0.60)` | Backdrop redup (`#151A25` 60%) untuk efek *Figure-Ground* |

### 3.2 Tipografi (Modular Type Scale — Major Third $r = 1.250$)
- **Font Keluarga Sans-Serif:** `--font-sans: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;`
- **Font Keluarga Monospace (Nominal Angka):** `--font-mono: 'JetBrains Mono', 'Roboto Mono', ui-monospace, monospace;` dipadukan dengan `font-variant-numeric: tabular-nums;` agar kolom angka sejajar vertikal.
- **Skala Ukuran & Line-Height (terverifikasi dengan dimensi `<text>` di XML `web-hi-fi`):**
  - `--text-h1`: `32px` / `40px` (`font-weight: 700`) — Judul halaman (`height="40"`).
  - `--text-kpi`: `28px` / `35px` (`font-weight: 700`) — Angka KPI nominal besar pada kartu ringkasan (`height="35"`).
  - `--text-h2`: `24px` / `29px`–`32px` (`font-weight: 700`) — Judul kartu seksi (`height="29"`).
  - `--text-h3`: `20px` / `24px`–`28px` (`font-weight: 600`) — Subjudul kartu, nominal sekunder (`height="24"`).
  - `--text-body`: `16px` / `24px` (`font-weight: 400`/`500`) — Subjudul halaman, isi catatan, teks input (`height="24"` / `"21"`).
  - `--text-label`: `14px` / `20px` (`font-weight: 600`) — Label form, tombol (`height="21"`), footer (`height="20"`).
  - `--text-caption`: `12px` / `16px` (`font-weight: 500`/`600`) — Badge status, label kecil (`Menu label`), helper text (`height="16"`–`"18"`).

### 3.3 Spasi (8-Point System), Layout, Radius, Bayangan, dan Transisi
- **Spasi (`8-Point System`):** `--space-1: 4px`, `--space-2: 8px`, `--space-3: 12px`, `--space-4: 16px`, `--space-5: 20px`, `--space-6: 24px`, `--space-8: 32px`, `--space-12: 48px` (tinggi standar seluruh tombol CTA & kontrol input utama `48px`; tombol ikon & chip minimal `44px`).
- **Dimensi Makro Desktop (`1440px`):** Sidebar `240px`, kontainer area utama `max-width: 1200px`, padding konten `32px` (`--space-8`), lebar grid efektif `1136px`, gutter kolom `24px` (`--space-6`).
  - *Proporsi 8+4 kolom:* `744px` + `368px` (Dasbor, Anggaran, Laporan, Tabungan).
  - *Proporsi 2 kolom seimbang:* `552px` + `560px` (Catat Transaksi).
- **Breakpoints Responsif:**
  - Desktop `≥ 1024px`: Sidebar kiri `240px` + layout 2 kolom / 3 kartu KPI horizontal.
  - Tablet `640px – 1023px`: Navigasi atas/laci atau bottom bar + penyederhanaan menjadi 1–2 kolom adaptif.
  - Mobile `< 640px` (hingga `320px` tanpa *horizontal scroll*): Tumpukan vertikal 1 kolom, header kompak dengan nama brand + profil, dan **sticky bottom navigation bar gelap (`#0F172A`)** dengan 5 menu berikon & label persis panduan halaman `hi-fi` mobile.
- **Border Radius:** `--radius-sm: 6px`, `--radius-md: 8px` (tombol, input, badge, chip), `--radius-lg: 12px` (kartu & modal dialog), `--radius-pill: 9999px`.
- **Elevasi & Bayangan:**
  - `--shadow-card: 0 1px 2px rgba(15, 23, 42, 0.04)`
  - `--shadow-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)`
  - `--shadow-modal: 0 20px 25px -5px rgba(15, 23, 42, 0.25)`
- **Durasi Transisi (Dan Saffer / Miller):** `--duration-instant: 80ms` (`≤ 100ms` tactile feedback tombol/hover), `--duration-ui: 200ms` (`150–300ms` modal, toast, dan transisi progress bar).

---

## 4. Inventaris Komponen (Atomic Design & 6-State FSM)

### 4.1 Hirarki Komponen (Atomic Design — Brad Frost)
- **Atoms:** Typography headings (`h1`–`h3`), teks monospace nominal (`data-tabular`), `<label>` persisten, `<input>` teks/angka/tanggal, tombol (`.btn--primary`, `.btn--secondary`, `.btn--danger`, `.btn--icon`), badge status *Dual-Signifier* (`.badge--success`, `.badge--warning`, `.badge--danger`), progress bar track & fill, donat SVG progres tabungan, ikon SVG inline (wallet, home, list, wallet-budget, chart, pig, trash, check, warning, close, plus).
- **Molecules:**
  - `nav-item`: Ikon + label menu dengan state active (`#1E40AF`) dan fokus keyboard kontras tinggi.
  - `form-group`: Label persisten (jarak `4px` ke input) + kontrol input + helper text / inline error (`aria-describedby`, `role="alert"`).
  - `segmented-control`: Toggle 2 opsi (`Pengeluaran` / `Pemasukan`) dan 3 opsi (`Sep` / `Okt` / `Nov`) menggunakan atribut ARIA `role="tablist"` / `aria-pressed`.
  - `category-chip`: Tombol pill (`44px`) untuk memilih salah satu dari 7 kategori (*Makan*, *Transport*, *Belanja*, *Hiburan*, *Tagihan*, *Pendidikan*, *Lainnya*).
  - `kpi-card`: Kartu ringkasan atas (label, nominal besar monospace, badge status atau keterangan batas).
  - `transaction-item`: Baris riwayat transaksi (nama, meta kategori & tanggal, nominal berwarna semantik `-Rp` / `+Rp`, tombol hapus `44×44`).
  - `budget-card`: Kartu kategori anggaran (judul, badge status, tombol `Ubah`, progress bar, rasio nominal & persentase).
  - `goal-card`: Kartu target tabungan (judul, SVG donut ring + persentase tengah, nominal terkumpul & target, tenggat, tombol `+ Setor`).
  - `undo-banner` & `toast`: Banner/notifikasi dinamis pasca-aksi dengan tombol **Urungkan** (`aria-live="polite"`).
  - `empty-state`: Komponen status kosong informatif ketika riwayat transaksi kosong, bulan laporan belum memiliki data, atau belum ada target tabungan.
- **Organisms:**
  - `app-sidebar` (desktop `240px`) & `app-bottom-nav` (mobile `< 640px`), disertai `skip-link` (*Lewati ke konten utama*).
  - `page-header` (judul, subjudul, tombol aksi primer / filter periode).
  - `transaction-form` & `transaction-history`.
  - `budget-grid`, `monthly-budget-summary`, & `budget-warning-card`.
  - `expense-bar-chart` (grafik batang SVG responsif + garis batas anggaran per kategori + tooltip nilai) & `report-breakdown`.
  - `savings-grid` & `savings-summary`.
  - **5 Modal `<dialog>`:** (1) `Transaksi Tersimpan`, (2) `Hapus Transaksi` (4 elemen wajib destruktif), (3) `Ubah Batas Anggaran`, (4) `Setor Tabungan`, dan (5) `Target Tabungan Baru`.

### 4.2 Matriks Status Komponen (6-State FSM)
Setiap tombol aksi utama (mis. `Simpan transaksi`, `Konfirmasi setor`, `Simpan batas`, `Buat target`) mengimplementasikan mesin status terbatas (*Finite State Machine*):
1. **Default:** Latar `#1E40AF`, teks `#FFFFFF`, tinggi `48px`, radius `8px`.
2. **Hover:** Latar `#1D4ED8`, bayangan `--shadow-hover`, kursor `pointer`, transisi `80ms`.
3. **Focus (`:focus-visible`):** `outline: 3px solid #1D4ED8; outline-offset: 2px;` (terlihat jelas pada navigasi papan ketik `Tab`, termasuk di latar gelap sidebar dengan `#93C5FD`/`#FFFFFF`).
4. **Active / Pressed:** Latar `#172554`, `transform: scale(0.98)` selama `50–80ms`.
5. **Disabled (Constraint):** Latar `#E2E8F0`, teks `#94A3B8`, kursor `not-allowed`, aktif saat form belum memenuhi syarat (atau melebihi saldo untuk setoran tabungan).
6. **Loading / Feedback:** Mengunci klik ganda (`disabled`), menampilkan indikator spinner mikro + teks status (`Menyimpan...`), lalu bertransisi mulus ke feedback modal/banner.

---

## 5. Pemetaan Konsep IMK (`material/` IMK 00–06 & IMK-10) ke Implementasi Website

| Sumber Materi | Konsep / Teori IMK | Penerapan Konkret di Website CoinKeeper |
| :--- | :--- | :--- |
| **IMK 01** | Evolusi Gaya Interaksi (*CLI → Menu/Form Fill-in → GUI/WIMP → Web & Mobile*) | Menggabungkan **Menu-Driven** (sidebar persisten desktop & bottom nav mobile), **Form Fill-in** terstruktur (Catat Transaksi & modal dialog), dan **Web/Mobile Responsive Interaction** dengan kontrol cepat satu ketukan/klik. |
| **IMK 02** | Persepsi Visual, Working Memory terbatas, *Recognition over Recall*, *Knowledge in the World*, Norman *Slips vs Mistakes*, *Gulf of Execution/Evaluation* | Label formulir selalu persisten di atas input (tidak mengandalkan placeholder yang hilang); 7 kategori ditampilkan serentak via **Category Chips** (mengganti *recall* menjadi *recognition*); **Dual-Signifier** mencegah *mistakes*; tombol hapus dipisahkan ke kanan dengan jarak aman (`44×44`) dan modal konfirmasi spesifik mencegah *slips*. |
| **IMK 03** | Kerangka Interaksi Abowd & Beale (*Articulation, Performance, Presentation, Observation*) & Ergonomi Perangkat I/O | Mempercepat *Articulation* (segmented toggle + chips), memastikan *Performance* instan (`< 100ms`), menampilkan *Presentation* angka tabular & grafik batang + batas anggaran, sehingga *Observation* pengguna langsung akurat baik lewat mouse/keyboard maupun layar sentuh. |
| **IMK 04** | Triad Usabilitas Dix (*Learnability, Flexibility, Robustness*), *Shneiderman's 8 Golden Rules*, & *Nielsen's 10 Usability Heuristics* | **Learnability:** Istilah sehari-hari bahasa Indonesia (*Match between system & real world*). **Flexibility:** Dukungan penuh keyboard (`Tab`, `Enter`, `Esc`), quick-add dari Dasbor, serta `Urungkan (Undo)`. **Robustness:** Validasi 3 fase, pencegahan error proaktif, modal konfirmasi destruktif, dan feedback closure pada setiap aksi simpan/ubah/setor/hapus. |
| **IMK 05** | HTA (*Goal → Task → Operation*), Information Architecture (maks. 5 layar, kedalaman ≤ 2), Hukum Fitts & Hukum Hick, Pemetaan Semantik HTML5 | Navigasi datar 5 layar (depth 1). **Hukum Fitts:** Tombol CTA tinggi `48px`, lebar penuh di kolom form/modal (`232–254px`). **Hukum Hick:** Segmented control hanya 2–3 opsi (`Pengeluaran`/`Pemasukan`, `Sep`/`Okt`/`Nov`), kategori diringkas ke 7 chip. Struktur memakai `<header>`, `<nav>`, `<main>`, `<section>`, `<aside>`, `<footer>`, `<dialog>`. |
| **IMK 06** | *Pre-attentive Processing* (< 250ms, Von Restorff Effect), *Eye-Tracking Patterns* (Z, F, Layer-Cake), 6 Hukum Gestalt, Grid & 8-Point System, Modular Type Scale, Proporsi 60-30-10, WCAG 2.2 Contrast & Dual-Signifier, Atomic Design, 6-State FSM, 4 Elemen Dialog Destruktif, Micro-interactions Saffer | **Z-Pattern** di Dasbor & Tabungan; **F-Pattern** di Catat Transaksi & Laporan; **Layer-Cake** pada grid 5 kartu Anggaran. **Gestalt:** *Proximity* (`4px` label–input, `16–24px` antar grup), *Common Region* (kartu putih di kanvas `#F8FAFC`), *Figure-Ground* (backdrop modal `rgba(21,26,37,0.6)`). **Dual-Signifier:** Badge selalu memadukan warna + ikon (`✓`, `⚠`, `!`) + teks status. |
| **IMK-10** | Praktikum Web Semantik & Aksesibel (WCAG 2.2 AA, *no div soup*, skip link, validasi 3 fase + fokus otomatis ke error, CSS `:root` tokens, `border-box`, Reflow 320px, DOM aman `textContent`/`createElement`, `aria-live="polite"`) | Seluruh manipulasi data dinamis menggunakan `document.createElement` & `textContent` (bebas XSS); tiap halaman memiliki `skip-link`, `<html lang="id">`, `:focus-visible` 3px, area `aria-live="polite"` untuk toast/status dinamis, dan lolos *reflow* `320px` tanpa *horizontal scroll*. |

---

## 6. Konflik & Ambiguitas (Figma vs Laporan) — Memerlukan Keputusan Pengguna

Berikut 7 perbedaan atau ambiguitas yang ditemukan antara `referensi.pdf`, `Laporan Tahap 1`, `Laporan Tahap 2`, dan kanvas Figma `web-hi-fi`:

1. **Nama Aplikasi & Jumlah Layar (`Monee` + Login/Pengaturan di `referensi.pdf` vs `CoinKeeper` 5 layar di Laporan 1–2 & Figma)**
   - *Temuan:* `referensi.pdf` (dokumen RPL) menggunakan nama *Monee* dan menyertakan halaman Pengaturan serta kondisi login, sedangkan Laporan Tahap 1–2 dan Figma memakai nama **CoinKeeper** dan membatasi tepat 5 layar tanpa autentikasi/pengaturan.
   - *Rekomendasi:* **Mengikuti Figma & Laporan 1–2** (`CoinKeeper`, 5 layar utama tanpa layar login/pengaturan).

2. **Fitur *Financial Planner 50/30/20* (`Laporan Tahap 1`) vs *Anggaran Kategori* (`web-hi-fi` & `Laporan Tahap 2`)**
   - *Temuan:* Laporan Tahap 1 menyebut alokasi template 50/30/20 di awal bulan, namun Laporan Tahap 2 dan Figma `web-hi-fi` (`03 · Anggaran`) langsung menampilkan 5 kartu anggaran kategori (*Makan, Belanja, Hiburan, Transport, Tagihan*) dengan tombol `Ubah` per kategori dan ringkasan batas bulanan total.
   - *Rekomendasi:* **Mengikuti Figma `web-hi-fi`** (5 kartu kategori + tombol `Ubah` batas per kategori).

3. **Jenis Grafik Laporan (`Pie Chart` di `referensi.pdf` vs `Bar Chart` + Garis Batas di Figma) & Teknologi Grafik**
   - *Temuan:* `referensi.pdf` menyebut diagram lingkaran (*pie chart*), sedangkan `web-hi-fi` (`04 · Laporan`) dan Laporan Tahap 2 secara tegas mendesain **diagram batang vertikal (*bar chart*)** dengan garis batas anggaran horizontal putus-putus pada tiap kategori dan sorotan warna merah untuk kategori *Terlampaui*.
   - *Rekomendasi:* **Mengikuti Figma (Bar Chart)** menggunakan **SVG murni + CSS** (tanpa library eksternal/CDN) sehingga tetap berfungsi 100% offline saat `index.html` dibuka langsung lewat `file://`, tampil presisi menyerupai garis batas per batang pada Figma, serta mendukung atribut aksesibilitas SVG. *(Alternatif: gunakan Chart.js via CDN jika Anda tetap menginginkan library eksternal).*

4. **Tabungan Otomatis / Autodebet (`referensi.pdf` UC-04) vs Setoran Manual Berbasis Target (`web-hi-fi` & `Laporan Tahap 2`)**
   - *Temuan:* `referensi.pdf` merancang penjadwalan autodebet harian otomatis, sedangkan Figma `web-hi-fi` (`05 · Tabungan`) dan Laporan Tahap 2 merancang kartu target tabungan dengan tombol `+ Setor` manual (disertai validasi saldo cukup & fitur `Urungkan setoran`) serta `+ Target Baru`.
   - *Rekomendasi:* **Mengikuti Figma `web-hi-fi`** (`+ Setor` dengan validasi kecukupan saldo utama sesuai `KF-07` + `+ Target Baru` + `Urungkan`).

5. **Data Mock Awal & Nama Profil (`Faqih` & angka Figma vs `Rizal`/`Jonathan` & angka teks HTA di Laporan 2)**
   - *Temuan:* Teks narasi HTA pada Laporan Tahap 2 sempat mencantumkan batas *Makan Rp500.000, Transport Rp300.000, Belanja Rp250.000, Hiburan Rp200.000, Tagihan Rp250.000* dan nama pengguna *Rizal* / *Jonathan Simamora*, sedangkan gambar Hi-Fi Laporan 2 dan `web-hi-fi` Figma menampilkan profil **Faqih (`Akun pribadi`)**, Saldo **Rp 1.430.000**, Pengeluaran **Rp 1.730.000**, Sisa anggaran **Rp 270.000 dari Rp 2.000.000** (*Makan 650rb/700rb, Belanja 310rb/400rb, Hiburan 360rb/300rb, Transport 180rb/300rb, Tagihan 230rb/300rb*), Tabungan **Laptop baru Rp 1.200.000 / Rp 10.000.000 (12%)** & **Dana darurat Rp 700.000 / Rp 3.000.000 (23%)**, serta transaksi **Ojek kampus Rp 18.000**.
   - *Rekomendasi:* **Menggunakan data & profil Figma `web-hi-fi`** karena seluruh angka pada dasbor, anggaran, laporan November 2026 (`Rp 1.730.000`), dan tabungan (`Rp 1.900.000`) konsisten secara matematis satu sama lain.

6. **Daftar Kategori pada Mode `Pemasukan` di `02 · Catat Transaksi`**
   - *Temuan:* Pada XML kanvas `web-hi-fi` (`02 · Pemasukan · Makan` s.d. `02 · Pemasukan · Lainnya`), ke-7 chip kategori (*Makan, Transport, Belanja, Hiburan, Tagihan, Pendidikan, Lainnya*) tampak identik pada mode `Pengeluaran` dan `Pemasukan`. Namun, tabel Wireflow Laporan Tahap 2 (Layar 2) menulis *"onClick tab Pemasukan/Pengeluaran → Merubah daftar opsi kategori secara kondisional"*.
   - *Pertanyaan untuk User:* Apakah Anda ingin **(a) tetap menampilkan 7 chip identik seperti Figma `web-hi-fi`** pada kedua mode (*Pengeluaran* & *Pemasukan*), atau **(b) mengubah chip kategori saat mode `Pemasukan`** menjadi kategori pemasukan mahasiswa (*Uang saku*, *Beasiswa*, *Paruh waktu*, *Hadiah*, *Lainnya*) sesuai catatan Wireflow Laporan 2? *(Rekomendasi default: opsi **a** untuk kesesuaian visual Figma, atau opsi **b** jika ingin lebih logis secara semantik saat mencatat pemasukan).*

7. **Catatan Transparansi Akses Detail Copy Teks Desktop Figma**
   - *Temuan:* Setelah menarik XML struktur lengkap 45 frame `web-hi-fi` dan gambar *overview* kanvas penuh, akun Figma MCP (Starter plan) mencapai batas kuota *tool call*, dan perkakas browser `chrome_devtools` tidak tersedia (`npx` tidak terpasang di PATH). Oleh karena itu, struktur, ukuran piksel, angka anggaran/laporan/tabungan, nama layar, label tombol, dan nama transaksi sudah terverifikasi dari XML + gambar *overview* + tangkapan layar Hi-Fi Laporan 2; sedangkan **teks paragraf sekunder pada panel samping** (*Catatan ringkasan*, *Panduan transaksi*, *Peringatan hiburan*, *Catatan tabungan*) serta **nominal awal 3 item transaksi lain selain Ojek kampus** (*Uang saku*, *Langganan streaming*, *Makan siang*) perlu disusun selaras dengan konteks & total `Rp 1.730.000` di Figma.
   - *Pertanyaan untuk User:* Apakah Anda menyetujui penyusunan copy teks sekunder yang selaras dengan konteks Figma dan konsisten secara matematis, atau ada teks/nominal spesifik dari Figma yang ingin Anda kirimkan langsung agar persis kata per kata?

---

## 7. Rencana Implementasi Singkat (Phase 1 & Phase 2)

1. **Phase 1 — Pembangunan Website di `website/` (Menunggu Persetujuan):**
   - **Fondasi Bersama:** `css/variables.css` (seluruh design tokens), `css/base.css` (reset `border-box`, tipografi, skip-link, `:focus-visible`), `css/components.css` (tombol 6-state FSM, badge dual-signifier, kartu, modal `<dialog>`, toast/undo banner, sidebar & mobile bottom nav), `js/data/seed.js`, `js/utils/format.js`, `js/utils/storage.js` (`localStorage` + fungsi reset/hitung ulang konsisten antarhalaman), `js/components/layout.js`, `js/components/modal.js`, `js/components/toast.js`.
   - **Implementasi Halaman demi Halaman + Verifikasi Browser & Figma:**
     1. `index.html` (`01 · Dasbor`) + `css/pages/dasbor.css` + `js/pages/dasbor.js`
     2. `pages/catat-transaksi.html` (`02 · Catat Transaksi`) + `css/pages/catat-transaksi.css` + `js/pages/catat-transaksi.js`
     3. `pages/anggaran.html` (`03 · Anggaran`) + `css/pages/anggaran.css` + `js/pages/anggaran.js`
     4. `pages/laporan.html` (`04 · Laporan`) + `css/pages/laporan.css` + `js/pages/laporan.js`
     5. `pages/tabungan.html` (`05 · Tabungan`) + `css/pages/tabungan.css` + `js/pages/tabungan.js`
   - **Pengujian Menyeluruh:** Klik seluruh alur Use Case (`UC-01`–`UC-04`), validasi responsif (`1440px`, `768px`, `390px`, `320px`), navigasi keyboard-only (`Tab`, `Enter`, `Esc`), rasio kontras WCAG 2.2 AA, dan memastikan 0 error konsol.
2. **Phase 2 — Penyusunan Dokumentasi PDF (`website/docs/Dokumentasi_Front-End_Coin-Keeper.pdf`):**
   - Mengambil tangkapan layar asli dari website yang berjalan, menyusun dokumen sumber HTML/CSS cetak berbahasa Indonesia (Bab 1–10 sesuai struktur wajib, lengkap dengan Daftar Isi, nomor halaman, gambar & tabel bernomor), serta mengonversinya menjadi PDF profesional.
