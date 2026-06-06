# PRD FINAL - Sistem Informasi Laundry Berbasis Web
## Membership, Saldo, Top Up QRIS Statis, React Frontend, PHP Native REST API, dan UI Dominan Blue

**Versi:** 1.0 Final  
**Status:** Siap Implementasi MVP  
**Jenis Dokumen:** Product Requirements Document  
**Teknologi:** React.js + PHP Native REST API + MySQL  
**Target Implementasi:** Laundry yang sudah berjalan secara operasional

---

## 1. Nama Produk

**Sistem Informasi Laundry Berbasis Web dengan Fitur Membership, Saldo, Top Up QRIS Statis, dan UI/UX Dominan Blue**

---

## 2. Latar Belakang

Usaha laundry membutuhkan sistem berbasis web untuk membantu pengelolaan pelanggan, transaksi laundry, saldo member, top up saldo, status cucian, nota transaksi, serta laporan operasional. Pada operasional yang masih dilakukan secara manual, pencatatan transaksi dan saldo pelanggan berisiko mengalami kesalahan input, kehilangan data, kesulitan pelacakan riwayat transaksi, dan kurangnya transparansi terhadap saldo member.

Sistem ini dirancang untuk mendukung operasional laundry yang sudah berjalan dengan konsep membership. Setiap pelanggan dapat memiliki akun member dan saldo internal yang dapat digunakan sebagai metode pembayaran transaksi laundry.

Pada tahap awal, top up saldo dilakukan menggunakan **QRIS statis**. Customer melakukan pembayaran melalui QRIS milik laundry, kemudian admin atau kasir melakukan verifikasi manual melalui aplikasi merchant atau mutasi rekening. Setelah pembayaran dipastikan masuk, admin mencatat top up ke sistem dan saldo member bertambah.

Pendekatan QRIS statis dipilih karena lebih aman dan sederhana untuk tahap awal, mengurangi risiko error pada integrasi payment gateway otomatis, dan tetap memberikan kontrol penuh kepada pihak laundry.

Dari sisi teknologi, sistem menggunakan **React.js** sebagai frontend agar tampilan modern, interaktif, responsif, dan nyaman digunakan. Backend menggunakan **PHP Native REST API** agar ringan, mudah dijalankan di XAMPP/hosting PHP, serta tetap mampu menangani proses bisnis utama seperti transaksi, saldo, top up, refund, mutasi saldo, laporan, dan audit log.

---

## 3. Tujuan Produk

Tujuan sistem ini adalah:

1. Membantu pengelolaan data member secara terpusat.
2. Mempermudah pencatatan dan pengelolaan saldo member.
3. Memfasilitasi top up saldo melalui QRIS statis dengan verifikasi manual.
4. Mengurangi risiko kesalahan pencatatan transaksi laundry.
5. Menyediakan riwayat mutasi saldo yang transparan dan terdokumentasi.
6. Mempermudah kasir dalam mencatat transaksi laundry.
7. Mempermudah pemantauan status cucian.
8. Menyediakan laporan transaksi, top up, saldo, dan status laundry.
9. Memberikan customer akses mandiri untuk melihat saldo dan status laundry.
10. Menyediakan desain UI dominan biru yang modern, bersih, dan mudah digunakan.
11. Menyediakan audit trail untuk setiap aksi penting, terutama yang berdampak pada saldo.

---

## 4. Target Pengguna

### 4.1 Owner / Pemilik Laundry

Owner memiliki akses tertinggi dalam sistem. Owner dapat melihat seluruh data, laporan, audit log, mutasi saldo, transaksi, top up, refund, koreksi saldo, data member, dan pengaturan sistem.

Owner adalah satu-satunya role yang dapat melakukan koreksi saldo.

### 4.2 Admin / Kasir

Admin atau kasir bertugas menjalankan operasional harian, seperti mengelola member, mencatat top up, membuat transaksi laundry, memperbarui status laundry, melakukan refund sesuai aturan, dan mencetak nota.

Admin tidak dapat melakukan koreksi saldo langsung.

### 4.3 Customer / Member

Customer dapat login untuk melihat saldo, riwayat top up, riwayat transaksi, status laundry, dan profil miliknya sendiri. Customer tidak dapat melihat data customer lain.

---

## 5. Ruang Lingkup Produk

Sistem mencakup:

1. Login dan manajemen role.
2. Reset password manual melalui admin.
3. Manajemen data member.
4. Aktivasi dan nonaktivasi member.
5. Manajemen layanan laundry.
6. Top up saldo QRIS statis dengan verifikasi manual.
7. Mutasi saldo otomatis.
8. Transaksi laundry multi-layanan.
9. Pembayaran menggunakan saldo member.
10. Pembayaran cash, transfer, dan QRIS manual.
11. Refund transaksi.
12. Koreksi saldo khusus Owner.
13. Status laundry dan timeline proses cucian.
14. Cetak nota transaksi.
15. Laporan transaksi, top up, saldo, mutasi, dan status laundry.
16. Audit log.
17. Dashboard admin/owner.
18. Dashboard customer/member.
19. UI/UX dominan warna biru.
20. Responsive design untuk desktop, tablet, dan mobile.
21. Backend PHP Native REST API.
22. Frontend React.js.
23. Database MySQL.

### 5.1 Keputusan MVP

Keputusan berikut menjadi acuan implementasi versi 1:

1. Sistem MVP hanya melayani transaksi untuk member aktif. Customer walk-in wajib dibuatkan data member terlebih dahulu sebelum transaksi.
2. Authentication menggunakan PHP session cookie dengan cookie `HttpOnly`, `SameSite=Lax`, dan regenerasi session ID setelah login.
3. Frontend React dan backend PHP disarankan berjalan pada origin yang sama di XAMPP/Apache untuk menyederhanakan session dan mengurangi risiko konfigurasi CORS.
4. Styling menggunakan Bootstrap 5 dan custom CSS variables agar UI tetap cepat dibuat, konsisten, dan mudah disesuaikan dengan palet biru.
5. Nominal uang disimpan sebagai integer rupiah, bukan floating point, untuk menghindari kesalahan pembulatan.
6. Semua kode transaksi, top up, refund, dan member wajib memiliki unique index di database.
7. Nomor urut harian pada kode seperti `TRX-YYYYMMDD-XXX` dibuat di backend dan aman terhadap input bersamaan.
8. Pada development, Vite menggunakan proxy `/api` ke backend PHP agar request API tetap sederhana.
9. Export PDF/Excel penuh, QRIS dinamis, webhook pembayaran, dan transaksi non-member tidak termasuk MVP.

---

## 6. Konsep Utama Sistem

### 6.1 Saldo Internal Member

Saldo member adalah saldo internal yang dicatat di database sistem laundry. Dana asli dari top up masuk ke rekening atau akun merchant QRIS milik laundry, sedangkan saldo member hanya menjadi catatan digital dalam sistem.

Contoh:

Customer top up Rp100.000 melalui QRIS.  
Uang asli masuk ke rekening/merchant laundry.  
Sistem mencatat saldo customer bertambah Rp100.000.

### 6.2 Prinsip Perubahan Saldo

Saldo member hanya dapat berubah melalui:

1. Top up saldo.
2. Pembayaran transaksi laundry.
3. Refund transaksi.
4. Koreksi saldo oleh Owner.

Tidak ada fitur edit saldo langsung untuk role apapun.

Setiap perubahan saldo wajib mencatat:

1. Member.
2. Tipe mutasi.
3. Arah mutasi: credit/debit.
4. Nominal.
5. Saldo sebelum.
6. Saldo sesudah.
7. Keterangan.
8. Reference data.
9. User yang melakukan aksi.
10. Waktu aksi.

### 6.3 Database Transaction

Semua proses yang mengubah saldo wajib menggunakan database transaction. Jika salah satu proses gagal, sistem harus melakukan rollback.

Proses yang wajib menggunakan database transaction:

1. Top up menjadi success.
2. Pembayaran transaksi menggunakan saldo.
3. Refund.
4. Koreksi saldo.

---

## 7. Fitur MVP

### 7.1 Login dan Role

Role sistem:

1. Owner.
2. Admin/Kasir.
3. Customer/Member.

Hak akses:

| Role | Hak Akses |
|---|---|
| Owner | Semua data, laporan, audit log, koreksi saldo, pengaturan |
| Admin/Kasir | Member, layanan, top up, transaksi, status laundry, refund, nota |
| Customer | Saldo, riwayat transaksi, riwayat top up, status laundry, profil |

Password wajib disimpan menggunakan hashing, seperti `password_hash()` dengan bcrypt atau Argon2.

### 7.2 Reset Password

Reset password pada MVP dilakukan secara manual.

Ketentuan:

1. Customer meminta reset password kepada admin secara offline.
2. Admin membuka panel admin.
3. Admin memilih member.
4. Sistem membuat password sementara.
5. Admin memberikan password sementara kepada customer.
6. Sistem menandai akun dengan `force_password_change`.
7. Customer wajib mengganti password setelah login menggunakan password sementara.

Reset password mandiri menggunakan OTP masuk roadmap versi 2.

### 7.3 Manajemen Member

Admin dapat:

1. Menambah member.
2. Mengedit data member.
3. Mencari member.
4. Menonaktifkan member.
5. Mengaktifkan kembali member.
6. Reset password member.
7. Melihat saldo member.

Data member:

1. Kode member.
2. Nama.
3. Nomor HP.
4. Alamat.
5. Saldo.
6. Status.
7. Akun login customer.

Format kode member:

`MBR-YYYYMMDD-XXX`

Contoh:

`MBR-20260604-001`

Member nonaktif tidak dapat melakukan transaksi baru, tetapi saldo dan riwayat tetap tersimpan.

### 7.4 Manajemen Layanan Laundry

Admin dapat mengelola layanan laundry.

Data layanan:

1. Nama layanan.
2. Satuan.
3. Harga.
4. Estimasi selesai.
5. Status layanan.

Contoh layanan:

1. Cuci kering.
2. Cuci setrika.
3. Setrika saja.
4. Express.
5. Bed cover.
6. Sepatu.
7. Karpet.
8. Laundry satuan.

Satuan layanan:

1. Per kg.
2. Per item.
3. Per pasang.

Layanan nonaktif tidak dapat dipilih saat membuat transaksi baru.

### 7.5 Top Up Saldo QRIS Statis

Top up dilakukan menggunakan QRIS statis milik laundry.

Alur:

1. Customer membayar melalui QRIS.
2. Admin memverifikasi pembayaran.
3. Admin mencatat top up ke sistem dengan status awal `pending`.
4. Sistem menampilkan konfirmasi data top up.
5. Admin menyetujui top up setelah pembayaran dipastikan masuk.
6. Status top up berubah menjadi `success`.
7. Saldo member bertambah.
8. Mutasi saldo tercatat.
9. Audit log tercatat.

Jika pembayaran belum bisa dipastikan, top up tetap berstatus `pending`. Jika data pembayaran tidak valid, admin dapat mengubah status top up `pending` menjadi `rejected` dengan alasan penolakan. Saldo hanya berubah saat status berubah menjadi `success`. Perubahan status top up menjadi `success` atau `rejected` wajib tercatat di audit log.

Batas nominal:

1. Minimum top up: Rp10.000.
2. Maksimum top up: Rp1.000.000.
3. Batas dapat dikonfigurasi oleh Owner.

Data top up:

1. Kode top up.
2. Member.
3. Nominal.
4. Metode pembayaran.
5. Nomor referensi.
6. Bukti pembayaran.
7. Status.
8. Admin pemroses.
9. Alasan penolakan.
10. Tanggal.

Format kode top up:

`TOP-YYYYMMDD-XXX`

Status top up:

1. Pending.
2. Success.
3. Rejected.

Top up yang sudah success tidak dapat diedit atau dibatalkan langsung. Jika terjadi kesalahan, Owner melakukan koreksi saldo.

Ketentuan bukti pembayaran:

1. Bukti pembayaran bersifat wajib untuk top up yang dicatat sebagai `success`.
2. Format file yang diterima: JPG, JPEG, PNG, dan PDF.
3. Ukuran maksimal file: 2 MB.
4. File disimpan dengan nama acak di folder upload backend.
5. File upload tidak boleh dapat dieksekusi sebagai script.

### 7.6 Transaksi Laundry

Admin dapat membuat transaksi laundry untuk member aktif.

Jika customer belum menjadi member, admin wajib membuat data member terlebih dahulu. Transaksi non-member tidak termasuk MVP.

Data transaksi:

1. Nomor transaksi.
2. Member.
3. Tanggal masuk.
4. Estimasi selesai.
5. Layanan.
6. Berat/jumlah.
7. Harga satuan.
8. Subtotal.
9. Total harga.
10. Metode pembayaran.
11. Status pembayaran.
12. Status laundry.
13. Catatan.
14. Admin pembuat.

Format nomor transaksi:

`TRX-YYYYMMDD-XXX`

Metode pembayaran:

1. Saldo member.
2. Cash.
3. Transfer.
4. QRIS manual.

Jika menggunakan saldo member, sistem wajib mengecek saldo. Jika saldo kurang, transaksi tidak dapat dilanjutkan dengan metode saldo.

Status pembayaran:

1. Belum bayar.
2. Lunas.
3. Direfund.
4. Dibatalkan.

Ketentuan pembayaran:

1. Pembayaran dengan saldo member langsung memotong saldo saat transaksi dibuat dan status pembayaran menjadi `lunas`.
2. Pembayaran cash, transfer, dan QRIS manual dapat dicatat sebagai `lunas` setelah admin memastikan pembayaran diterima.
3. Jika transaksi dicatat sebagai `belum bayar`, status pembayaran dapat diperbarui menjadi `lunas` oleh admin setelah pembayaran diterima.
4. Transaksi dengan status pembayaran `direfund` atau `dibatalkan` tidak dapat dibayar ulang.
5. Perubahan status pembayaran menjadi `lunas`, `direfund`, atau `dibatalkan` wajib tercatat di audit log.

### 7.7 Refund Transaksi

Refund digunakan untuk pembatalan transaksi.

Ketentuan refund:

1. Admin dapat melakukan refund transaksi.
2. Refund wajib memiliki alasan minimal 10 karakter.
3. Refund hanya dapat dilakukan satu kali.
4. Refund tidak dapat dilakukan jika transaksi sudah pernah direfund.
5. Refund hanya dapat dilakukan pada status laundry `diterima` atau `dicuci`.
6. Refund hanya dapat dilakukan untuk transaksi dengan status pembayaran `lunas`.
7. Transaksi `belum_bayar` yang tidak jadi diproses menggunakan status `dibatalkan`, bukan refund.
8. Jika pembayaran menggunakan saldo member, saldo dikembalikan ke member.
9. Jika pembayaran menggunakan cash, transfer, atau QRIS manual, pengembalian dana dilakukan offline dan sistem hanya mencatat status refund.
10. Setelah refund berhasil, status pembayaran menjadi `direfund`.
11. Setelah refund berhasil, transaksi ditandai `is_refunded = 1`.
12. Sistem mencatat data refund.
13. Sistem mencatat mutasi saldo jika pembayaran awal menggunakan saldo member.
14. Sistem mencatat audit log.

Format kode refund:

`RFD-YYYYMMDD-XXX`

### 7.8 Koreksi Saldo

Koreksi saldo hanya dapat dilakukan oleh Owner.

Ketentuan:

1. Owner memilih member.
2. Owner memilih arah koreksi: credit atau debit.
3. Owner mengisi nominal.
4. Owner wajib mengisi alasan minimal 20 karakter.
5. Sistem menampilkan konfirmasi saldo sebelum dan sesudah.
6. Jika koreksi debit lebih besar dari saldo member, sistem menolak proses.
7. Setelah dikonfirmasi, saldo berubah.
8. Mutasi saldo tercatat dengan tipe `koreksi_saldo`.
9. Audit log tercatat.

Koreksi saldo tidak menghapus riwayat transaksi sebelumnya.

Laporan koreksi saldo diambil dari `mutasi_saldo` dengan tipe `koreksi_saldo`.

### 7.9 Status Laundry

Urutan status laundry:

1. Diterima.
2. Dicuci.
3. Dikeringkan.
4. Disetrika.
5. Selesai.
6. Diambil.

Ketentuan:

1. Admin hanya dapat memajukan status.
2. Admin tidak dapat memundurkan status.
3. Owner dapat mengoreksi status jika diperlukan dengan alasan wajib.
4. Setiap perubahan status tercatat di status laundry logs.
5. Jika status menjadi `diambil`, tanggal diambil terisi otomatis.
6. Status `diambil` tidak dapat diubah oleh admin.

### 7.10 Cetak Nota

Sistem menyediakan cetak nota menggunakan browser print.

Isi nota:

1. Nama laundry.
2. Nomor transaksi.
3. Nama member.
4. Nomor HP.
5. Daftar layanan.
6. Berat/jumlah.
7. Harga satuan.
8. Subtotal.
9. Total harga.
10. Metode pembayaran.
11. Status pembayaran.
12. Status laundry.
13. Tanggal masuk.
14. Estimasi selesai.
15. Catatan.

PDF nota bersifat opsional setelah fitur browser print selesai.

### 7.11 Laporan

Laporan sistem:

| Laporan | Akses | Keterangan |
|---|---|---|
| Transaksi Harian | Owner, Admin | Data transaksi per hari |
| Transaksi Bulanan | Owner, Admin | Data transaksi per bulan |
| Top Up Saldo | Owner, Admin | Riwayat top up |
| Mutasi Saldo | Owner | Seluruh mutasi saldo |
| Saldo Member | Owner, Admin | Daftar saldo member |
| Status Laundry | Owner, Admin | Status cucian |
| Koreksi Saldo | Owner | Riwayat koreksi saldo |
| Audit Log | Owner | Riwayat aksi penting |

Filter laporan:

1. Rentang tanggal.
2. Member.
3. Metode pembayaran.
4. Status pembayaran.
5. Status laundry.
6. Status top up.

Output laporan:

1. Tampilan web wajib.
2. Export PDF/Excel bersifat opsional setelah tampilan web selesai.

---

## 8. UI/UX Design Dominan Blue

### 8.1 Konsep Visual

Sistem menggunakan desain modern, bersih, profesional, dan dominan warna biru. Warna biru dipilih karena memberikan kesan bersih, aman, rapi, dan terpercaya.

Prinsip tampilan:

1. Sederhana dan mudah dipahami.
2. Dominan warna biru.
3. Background terang.
4. Komponen berbentuk card.
5. Navigasi sidebar.
6. Badge status berwarna.
7. Modal konfirmasi.
8. Responsive design.

### 8.2 Palet Warna

| Elemen | Kode Warna |
|---|---|
| Primary Blue | `#0057D9` |
| Dark Blue | `#003B95` |
| Light Blue | `#EAF3FF` |
| Accent Blue | `#2F80ED` |
| White | `#FFFFFF` |
| Light Gray | `#F5F8FC` |
| Text Dark | `#1F2937` |
| Text Muted | `#6B7280` |
| Success | `#16A34A` |
| Warning | `#F59E0B` |
| Danger | `#DC2626` |

### 8.3 Layout Utama

Layout terdiri dari:

1. Sidebar kiri.
2. Topbar.
3. Content area.
4. Card statistic.
5. Data table.
6. Modal.
7. Timeline status.
8. Form input.

### 8.4 Menu Admin/Owner

Menu admin/owner:

1. Dashboard.
2. Data Member.
3. Data Layanan.
4. Top Up Saldo.
5. Transaksi Laundry.
6. Status Laundry.
7. Mutasi Saldo.
8. Koreksi Saldo.
9. Laporan.
10. Audit Log.
11. Pengaturan.
12. Logout.

Menu Koreksi Saldo dan Audit Log hanya tampil untuk Owner.

### 8.5 Menu Customer

Menu customer:

1. Dashboard.
2. Saldo Saya.
3. Riwayat Top Up.
4. Pesanan Laundry.
5. Riwayat Transaksi.
6. Profil Saya.
7. Logout.

### 8.6 Halaman UI MVP

Halaman yang dibuat:

1. Login.
2. Dashboard Admin/Owner.
3. Data Member.
4. Tambah/Edit Member.
5. Reset Password Member.
6. Data Layanan.
7. Top Up Saldo.
8. Detail Top Up.
9. Konfirmasi Top Up.
10. Transaksi Laundry.
11. Detail Transaksi.
12. Cetak Nota.
13. Status Laundry.
14. Mutasi Saldo.
15. Koreksi Saldo.
16. Laporan.
17. Audit Log.
18. Dashboard Customer.
19. Riwayat Top Up Customer.
20. Status Laundry Customer.
21. Riwayat Transaksi Customer.
22. Profil Customer.

---

## 9. Teknologi dan Arsitektur Sistem

### 9.1 Teknologi

| Komponen | Teknologi |
|---|---|
| Frontend | React.js |
| Build Tool | Vite |
| Styling | Bootstrap 5 + custom CSS variables |
| Backend | PHP Native REST API |
| Database | MySQL |
| Local Server | XAMPP / Apache |
| Dev API Routing | Vite proxy `/api` ke backend PHP |
| API Format | JSON |
| Upload File | PHP Upload Handler |
| Authentication | PHP session cookie |
| UI Identity | Dominan biru |

### 9.2 Arsitektur

```text
React Frontend
      -> HTTP Request JSON
PHP Native REST API
      -> Query + Database Transaction
MySQL Database
```

React hanya digunakan untuk tampilan dan komunikasi API. Semua logika penting, terutama saldo, transaksi, role access, audit log, dan validasi final, tetap dilakukan di backend PHP.

### 9.3 Struktur Folder

```text
laundry-app/
|
+-- frontend/
|   +-- src/
|   |   +-- components/
|   |   +-- pages/
|   |   +-- services/
|   |   +-- routes/
|   |   +-- styles/
|   |   +-- App.jsx
|   |   +-- main.jsx
|   +-- package.json
|   +-- vite.config.js
|
+-- backend/
|   +-- config/
|   +-- api/
|   |   +-- auth/
|   |   +-- members/
|   |   +-- services/
|   |   +-- topups/
|   |   +-- transactions/
|   |   +-- balance/
|   |   +-- reports/
|   |   +-- customer/
|   |   +-- audit/
|   +-- helpers/
|   +-- uploads/
|       +-- topups/
|
+-- database/
|   +-- schema.sql
|   +-- seed.sql
|
+-- README.md
```

### 9.4 Aturan Frontend React

1. Menggunakan component-based structure.
2. Menggunakan reusable component.
3. Menu mengikuti role user.
4. Protected route wajib untuk halaman login.
5. Customer tidak melihat menu admin.
6. Owner melihat menu tambahan.
7. Aksi saldo wajib memiliki modal konfirmasi.
8. Error API ditampilkan dengan pesan yang jelas.

### 9.5 Aturan Backend PHP Native

1. Semua endpoint mengembalikan JSON.
2. Query menggunakan PDO/MySQLi prepared statement.
3. Password menggunakan `password_hash()`.
4. Login menggunakan `password_verify()`.
5. Session diregenerasi setelah login.
6. Cookie session menggunakan `HttpOnly` dan `SameSite=Lax`.
7. Request yang mengubah data wajib menyertakan CSRF token.
8. Validasi role dilakukan di backend.
9. Upload file divalidasi tipe dan ukuran.
10. Proses saldo wajib menggunakan transaction.
11. Audit log wajib dicatat untuk aksi penting.

---

## 10. Struktur Database

Tabel utama:

1. `users`
2. `members`
3. `layanan`
4. `topups`
5. `mutasi_saldo`
6. `transaksi_laundry`
7. `detail_transaksi`
8. `system_config`
9. `refunds`
10. `audit_logs`
11. `status_laundry_logs`

### 10.0 Standar Database

Ketentuan umum database:

1. Semua nominal uang menggunakan integer rupiah.
2. Semua tabel utama menggunakan `created_at` dan tabel yang dapat diubah menggunakan `updated_at`.
3. Semua kode bisnis seperti `kode_member`, `kode_topup`, `kode_transaksi`, dan `kode_refund` wajib unique.
4. Foreign key digunakan untuk menjaga relasi data.
5. Index wajib dibuat untuk kolom pencarian dan filter laporan, seperti tanggal, status, member, dan kode transaksi.
6. Perubahan saldo tidak boleh dilakukan dengan update langsung tanpa pencatatan `mutasi_saldo`.

### 10.1 users

Menyimpan akun login owner, admin, dan customer.

Kolom utama:

1. id_user
2. nama
3. username
4. password
5. role
6. status
7. force_password_change
8. last_login_at
9. created_at
10. updated_at

### 10.2 members

Menyimpan data pelanggan member.

Kolom utama:

1. id_member
2. kode_member
3. id_user
4. nama
5. no_hp
6. alamat
7. saldo
8. status
9. created_at
10. updated_at

### 10.3 layanan

Menyimpan layanan laundry.

Kolom utama:

1. id_layanan
2. nama_layanan
3. satuan
4. harga
5. estimasi_hari
6. status
7. created_at
8. updated_at

### 10.4 topups

Menyimpan data top up saldo.

Kolom utama:

1. id_topup
2. kode_topup
3. id_member
4. nominal
5. metode_pembayaran
6. nomor_referensi
7. bukti_pembayaran
8. status
9. diproses_oleh
10. approved_at
11. rejected_reason
12. catatan
13. created_at
14. updated_at

Nilai status top up:

1. `pending`
2. `success`
3. `rejected`

### 10.5 mutasi_saldo

Menyimpan seluruh perubahan saldo.

Kolom utama:

1. id_mutasi
2. id_member
3. tipe_mutasi
4. nominal
5. arah
6. saldo_sebelum
7. saldo_sesudah
8. keterangan
9. reference_type
10. reference_id
11. created_by
12. created_at

Nilai tipe mutasi:

1. `topup`
2. `pembayaran_transaksi`
3. `refund`
4. `koreksi_saldo`

Nilai arah:

1. `credit`
2. `debit`

### 10.6 transaksi_laundry

Menyimpan transaksi laundry.

Kolom utama:

1. id_transaksi
2. kode_transaksi
3. id_member
4. tanggal_masuk
5. estimasi_selesai
6. tanggal_diambil
7. total_berat
8. total_harga
9. metode_pembayaran
10. status_pembayaran
11. status_laundry
12. is_refunded
13. catatan
14. created_by
15. created_at
16. updated_at

Nilai status pembayaran:

1. `belum_bayar`
2. `lunas`
3. `direfund`
4. `dibatalkan`

Nilai status laundry:

1. `diterima`
2. `dicuci`
3. `dikeringkan`
4. `disetrika`
5. `selesai`
6. `diambil`

### 10.7 detail_transaksi

Menyimpan detail layanan per transaksi.

Kolom utama:

1. id_detail
2. id_transaksi
3. id_layanan
4. berat_jumlah
5. harga_satuan
6. subtotal
7. created_at
8. updated_at

### 10.8 system_config

Menyimpan konfigurasi sistem yang dapat diubah Owner.

Kolom utama:

1. id_config
2. config_key
3. config_value
4. description
5. updated_by
6. updated_at

Contoh konfigurasi:

1. `minimum_topup`
2. `maximum_topup`
3. `session_timeout_minutes`
4. `nama_laundry`
5. `alamat_laundry`
6. `no_hp_laundry`

### 10.9 refunds

Menyimpan data refund.

Kolom utama:

1. id_refund
2. kode_refund
3. id_transaksi
4. id_member
5. nominal_refund
6. alasan
7. diproses_oleh
8. created_at

### 10.10 audit_logs

Menyimpan jejak audit.

Kolom utama:

1. id_log
2. user_id
3. role
4. action
5. target_type
6. target_id
7. before_state
8. after_state
9. ip_address
10. created_at

### 10.11 status_laundry_logs

Menyimpan riwayat perubahan status laundry.

Kolom utama:

1. id_log
2. id_transaksi
3. status_sebelum
4. status_sesudah
5. changed_by
6. catatan
7. created_at

---

## 11. Functional Requirements

| Kode | Requirement | Prioritas |
|---|---|---|
| FR-01 | Login owner, admin, dan customer | Tinggi |
| FR-02 | Role access berdasarkan pengguna | Tinggi |
| FR-03 | Manajemen member | Tinggi |
| FR-04 | Manajemen layanan laundry | Tinggi |
| FR-05 | Top up saldo QRIS statis manual | Tinggi |
| FR-06 | Riwayat top up saldo | Tinggi |
| FR-07 | Mutasi saldo lengkap | Tinggi |
| FR-08 | Tidak ada edit saldo langsung | Tinggi |
| FR-09 | Transaksi laundry multi-layanan | Tinggi |
| FR-10 | Pembayaran pakai saldo member | Tinggi |
| FR-11 | Validasi saldo tidak cukup | Tinggi |
| FR-12 | Update status laundry | Tinggi |
| FR-13 | Dashboard customer | Tinggi |
| FR-14 | Cetak nota browser print | Sedang |
| FR-15 | Laporan dasar | Sedang |
| FR-16 | Koreksi saldo Owner | Sedang |
| FR-17 | Auto-generate kode | Sedang |
| FR-18 | Reset password manual | Sedang |
| FR-19 | Refund transaksi | Sedang |
| FR-20 | UI dominan biru | Sedang |
| FR-21 | Dashboard admin/owner | Tinggi |
| FR-22 | Timeline status laundry | Sedang |
| FR-23 | Modal konfirmasi aksi saldo | Tinggi |
| FR-24 | Audit log | Tinggi |
| FR-25 | Backend PHP Native REST API | Tinggi |
| FR-26 | Frontend React | Tinggi |
| FR-27 | Top up pending tidak mengubah saldo | Tinggi |
| FR-28 | Reset password wajib ganti password saat login pertama | Sedang |
| FR-29 | Transaksi hanya untuk member aktif | Tinggi |

---

## 12. Non-Functional Requirements

### 12.1 Keamanan

1. Password menggunakan hashing.
2. Query menggunakan prepared statement.
3. Role access divalidasi backend.
4. Customer tidak bisa mengakses data customer lain.
5. Upload file divalidasi.
6. Session timeout setelah 60 menit tidak aktif.
7. Endpoint saldo wajib aman.
8. Request POST, PUT, PATCH, dan DELETE wajib memvalidasi CSRF token.
9. File upload disimpan di folder yang tidak mengeksekusi script.
10. Password sementara reset password wajib diganti saat login pertama.

### 12.2 Audit Trail

1. Aksi penting tercatat.
2. Audit log append-only.
3. Audit log hanya dilihat Owner.
4. Log menyimpan user, role, aksi, target, data sebelum/sesudah, IP, dan waktu.

### 12.3 Performa

1. Minimal 100 transaksi per hari.
2. Dashboard dan tabel utama maksimal 3 detik.
3. Target MVP untuk 1 gerai.
4. Query penting diberi index.

### 12.4 UI/UX

1. Dominan warna biru.
2. Responsive.
3. Mudah digunakan kasir non-teknis.
4. Status menggunakan badge.
5. Timeline laundry mudah dipahami.
6. Aksi saldo wajib konfirmasi.

### 12.5 Backup

1. Backup database harian.
2. Retensi backup minimal 30 hari.
3. Prosedur restore terdokumentasi.

---

## 13. Acceptance Criteria

### AC-01 Top Up Success

Given admin sudah login.  
When admin menyetujui top up valid.  
Then saldo member bertambah.  
And mutasi saldo tercatat.  
And audit log tercatat.

### AC-02 Top Up Tanpa Member Ditolak

Given admin membuka halaman top up.  
When admin menyimpan tanpa member.  
Then sistem menolak proses.

### AC-03 Nominal Top Up di Bawah Minimum Ditolak

Given minimum top up Rp10.000.  
When admin input Rp5.000.  
Then sistem menolak.

### AC-04 Pembayaran Saldo Berhasil

Given saldo member Rp100.000.  
When transaksi Rp35.000 dibayar saldo.  
Then saldo menjadi Rp65.000.  
And mutasi pembayaran tercatat.

### AC-05 Saldo Tidak Cukup

Given saldo Rp20.000.  
When transaksi Rp35.000 dibayar saldo.  
Then sistem menolak dan menampilkan kekurangan Rp15.000.

### AC-06 Customer Hanya Melihat Data Sendiri

Given customer login.  
When membuka status laundry.  
Then hanya data miliknya yang tampil.

### AC-07 Koreksi Saldo Hanya Owner

Given admin bukan owner.  
When mengakses koreksi saldo.  
Then akses ditolak.

### AC-08 Refund Tidak Boleh Double

Given transaksi sudah direfund.  
When admin refund ulang.  
Then sistem menolak.

### AC-09 Perubahan Status Laundry Tercatat

Given admin mengubah status.  
When status berhasil diperbarui.  
Then status log tercatat.

### AC-10 Aksi Saldo Menggunakan Transaction

Given proses top up, pembayaran, refund, atau koreksi.  
When salah satu proses gagal.  
Then sistem rollback dan data tidak setengah tersimpan.

### AC-11 UI Responsif

Given user membuka dari mobile/tablet.  
When halaman tampil.  
Then layout menyesuaikan ukuran layar.

### AC-12 Dashboard Customer

Given customer login.  
When membuka dashboard.  
Then saldo, status laundry, dan riwayat transaksi tampil.

### AC-13 Top Up Pending Tidak Mengubah Saldo

Given admin mencatat top up dengan status `pending`.  
When top up belum disetujui menjadi `success`.  
Then saldo member tidak berubah.  
And mutasi saldo belum tercatat.

### AC-14 Reset Password Wajib Ganti Password

Given admin mereset password customer.  
When customer login menggunakan password sementara.  
Then sistem meminta customer mengganti password terlebih dahulu.

### AC-15 Transaksi Non-Member Ditolak

Given admin membuat transaksi laundry.  
When admin tidak memilih member aktif.  
Then sistem menolak transaksi.

---

## 14. Out of Scope Versi 1

Tidak termasuk versi 1:

1. Payment gateway otomatis.
2. QRIS dinamis.
3. Webhook pembayaran.
4. Notifikasi WhatsApp otomatis.
5. Aplikasi Android/iOS native.
6. Multi-cabang.
7. Loyalty point.
8. Promo otomatis.
9. Integrasi akuntansi.
10. Refund otomatis ke rekening/e-wallet.
11. Manajemen stok bahan laundry.
12. Reset password OTP mandiri.
13. Export PDF/Excel penuh untuk semua laporan.
14. Transaksi tanpa data member.

---

## 15. Roadmap Pengembangan

### 15.1 Versi 1 - MVP Operasional

1. Login dan role.
2. Member.
3. Layanan.
4. Top up QRIS statis.
5. Mutasi saldo.
6. Transaksi laundry.
7. Pembayaran saldo.
8. Refund.
9. Koreksi saldo.
10. Status laundry.
11. Audit log.
12. Dashboard admin.
13. Dashboard customer.
14. UI dominan biru.
15. Laporan dasar.
16. Cetak nota.

### 15.2 Versi 2 - Otomatisasi

1. Payment gateway.
2. QRIS dinamis.
3. Webhook pembayaran.
4. Reset password OTP.
5. Notifikasi pembayaran.

### 15.3 Versi 3 - Customer Experience

1. WhatsApp notification.
2. Promo member.
3. Loyalty point.
4. Reminder laundry selesai.
5. Riwayat customer lebih lengkap.

### 15.4 Versi 4 - Skala Bisnis

1. Multi-cabang.
2. Manajemen pegawai.
3. Manajemen shift.
4. Stok bahan laundry.
5. Laporan keuangan lanjutan.
6. Integrasi akuntansi.

---

## 16. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Admin salah input top up | Saldo tidak sesuai | Konfirmasi, audit log, koreksi Owner |
| Customer mengaku sudah bayar | Konflik pembayaran | Wajib cek merchant/mutasi rekening |
| Saldo berubah tanpa jejak | Hilang kepercayaan | Mutasi saldo dan audit log wajib |
| Refund double | Saldo berlebih | Validasi `is_refunded` |
| Data hilang | Gangguan operasional | Backup harian |
| UI membingungkan | Kasir lambat | UI sederhana dominan biru |
| Status salah klik | Customer salah info | Status log dan koreksi Owner |
| Query lambat | Kasir terganggu | Index database |
| API tidak aman | Data bocor | Auth, role, prepared statement |

---

## 17. Kesimpulan

Sistem Informasi Laundry Berbasis Web ini dirancang untuk mendukung operasional laundry yang telah berjalan dengan fitur membership, saldo internal, top up QRIS statis, transaksi laundry, status cucian, refund, koreksi saldo, laporan, audit log, dan dashboard customer.

Versi final ini menggunakan arsitektur modern dengan **React.js sebagai frontend** dan **PHP Native REST API sebagai backend**, serta **MySQL sebagai database**. Pendekatan ini memberikan tampilan modern dan responsif, namun tetap ringan dan mudah diterapkan pada hosting PHP atau XAMPP.

Pada versi MVP, top up saldo menggunakan QRIS statis dengan verifikasi manual agar lebih aman dan mudah dikontrol. Seluruh perubahan saldo dicatat melalui mutasi saldo dan audit log untuk menjaga transparansi.

PRD ini menjadi dasar untuk tahap desain UI, pembuatan ERD, penyusunan backlog development, implementasi sistem, pengujian, dan presentasi kepada client.
