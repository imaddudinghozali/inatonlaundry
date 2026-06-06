# Inaton Laundry MVP

Sistem informasi laundry berbasis React, PHP Native REST API, dan MySQL sesuai PRD `PRD_InatonLaundry_1.0.md`.

## Struktur

- `database/schema.sql` - struktur database MySQL.
- `database/seed.sql` - data awal owner, admin, customer demo, layanan, dan konfigurasi.
- `backend/api/` - REST API PHP Native.
- `frontend/` - React + Vite UI.
- `frontend/public/brand/logo-inaton.png` - logo Inaton Laundry untuk UI dan nota.
- `frontend/public/payments/qris-inaton.png` - QRIS statis Inaton untuk halaman Top Up.

## Setup Database

Import schema dan seed:

```powershell
Get-Content database\schema.sql | C:\xampp\mysql\bin\mysql.exe -u root
Get-Content database\seed.sql | C:\xampp\mysql\bin\mysql.exe -u root
```

Database yang dibuat: `inaton_laundry`.

## Akun Demo

| Role | Username | Password |
|---|---|---|
| Owner | `owner` | `owner123` |
| Admin | `admin` | `admin123` |
| Customer | `customer` | `Admin123@` |

## Menjalankan Development

API PHP:

```bash
php -S 127.0.0.1:8000 -t backend/api
```

Frontend:

```bash
cd frontend
npm.cmd install
npm.cmd run dev -- --port 5173
```

Buka:

```text
http://127.0.0.1:5173/
```

## Verifikasi

Jalankan verifikasi MVP lengkap saat API dev sudah aktif di `http://127.0.0.1:8000`:

```powershell
.\scripts\verify-mvp.ps1
```

Script ini menjalankan build frontend, PHP syntax check, API health check, anonymous auth check, login semua role demo, dan smoke test customer top up.

Build frontend manual:

```bash
cd frontend
npm.cmd run build
```

Lint PHP:

```powershell
Get-ChildItem -Path backend -Recurse -Filter *.php | ForEach-Object { php -l $_.FullName }
```

## Deploy Demo Railway

Repo ini sudah disiapkan untuk Railway dengan `Dockerfile`. Container akan:

- build React dari `frontend/`;
- menaruh hasil build ke Apache document root;
- menaruh PHP API di `/api`;
- menjalankan Apache pada port dari environment variable `PORT`;
- membaca koneksi database dari env Railway/MySQL.

Langkah deploy demo:

1. Push commit terbaru ke GitHub.
2. Di Railway, buat New Project dari repo GitHub `imaddudinghozali/inatonlaundry`.
3. Tambahkan service MySQL di project yang sama.
4. Di service aplikasi, set variables berikut. Jika nama service database bukan `MySQL`, sesuaikan nama referensinya.

```text
MYSQLHOST=${{MySQL.MYSQLHOST}}
MYSQLPORT=${{MySQL.MYSQLPORT}}
MYSQLUSER=${{MySQL.MYSQLUSER}}
MYSQLPASSWORD=${{MySQL.MYSQLPASSWORD}}
MYSQLDATABASE=${{MySQL.MYSQLDATABASE}}
```

Alternatifnya, Railway juga bisa memakai `DATABASE_URL` atau `MYSQL_URL` jika variable tersebut tersedia.

5. Generate public domain untuk service aplikasi.
6. Import database ke MySQL Railway:

```bash
mysql -h <MYSQLHOST> -P <MYSQLPORT> -u <MYSQLUSER> -p<MYSQLPASSWORD> <MYSQLDATABASE> < database/schema.sql
mysql -h <MYSQLHOST> -P <MYSQLPORT> -u <MYSQLUSER> -p<MYSQLPASSWORD> <MYSQLDATABASE> < database/seed.sql
```

7. Buka domain Railway dan test akun demo.

Catatan demo Railway:

- Healthcheck memakai `/api/health`; deploy akan butuh MySQL variable yang benar.
- File bukti top up tersimpan di filesystem container. Untuk pemakaian serius, tambahkan Railway Volume atau storage eksternal agar file upload tidak hilang saat redeploy.
- Sebelum dipakai umum, hapus hint akun demo dari UI dan ganti semua password seed.

## Backup dan Restore Database

Backup harian direkomendasikan sebelum operasional tutup atau sebelum deploy perubahan:

```powershell
.\scripts\backup-database.ps1
```

Default script menyimpan backup ke `backup\`, memakai database `inaton_laundry`, dan menjaga 7 backup terbaru. Untuk password MySQL:

```powershell
.\scripts\backup-database.ps1 -Password "password_mysql"
```

Contoh penjadwalan harian Windows Task Scheduler pukul 21:00:

```powershell
schtasks /Create /SC DAILY /TN "InatonLaundryBackup" /TR "powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\xampp\htdocs\inatonlaundry.com\scripts\backup-database.ps1" /ST 21:00
```

Restore ke database lokal:

```powershell
Get-Content database\schema.sql | C:\xampp\mysql\bin\mysql.exe -u root
Get-Content backup\inaton_laundry-YYYYMMDD-HHMMSS.sql | C:\xampp\mysql\bin\mysql.exe -u root inaton_laundry
```

Simpan minimal 7 backup harian terakhir. Uji restore di database lokal/staging sebelum memakai file backup untuk pemulihan data produksi.

## Fitur MVP Yang Tersedia

- Login role Owner, Admin, dan Customer.
- Manajemen member termasuk edit, aktif/nonaktif, dan reset password.
- Manajemen layanan termasuk edit dan aktif/nonaktif. Seed layanan mengikuti dokumen membership: Cuci Komplit, Cuci Lipat, Setrika, dan pilihan pengerjaan Reguler, Reguler Cepat, Express, Same Day, Prioritas, Super Prioritas.
- Top up QRIS statis manual dengan panel QRIS Inaton, customer dapat mengajukan top up dari web, upload bukti pembayaran, lalu admin/owner approve atau reject.
- Konfirmasi top up, approve/reject top up, koreksi saldo, dan refund sebelum data saldo/transaksi berubah.
- Transaksi laundry multi-layanan, pembayaran cash/transfer/QRIS manual/saldo, update pembayaran, refund, dan status laundry.
- Halaman Status Laundry terpisah untuk Owner/Admin dan Pesanan Laundry untuk Customer.
- Detail top up, detail transaksi, dan cetak nota via browser print dari daftar transaksi.
- Menu Customer sesuai PRD: Saldo Saya, Riwayat Top Up, Pesanan Laundry, Riwayat Transaksi, dan Profil Saya.
- Mutasi saldo, koreksi saldo Owner, laporan web dengan filter tanggal/member/metode pembayaran/status, audit log, dan pengaturan sistem.
