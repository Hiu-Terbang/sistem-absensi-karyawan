ABSEN — Sistem Absensi Karyawan

Aplikasi web sederhana untuk membantu pencatatan absensi karyawan secara digital. Aplikasi ini dibuat untuk menggantikan proses pencatatan absensi manual serta mempermudah rekapitulasi jumlah hari kerja, lembur, bon, dan total pembayaran karyawan.

📌 Fitur
Menambahkan karyawan baru
Menghapus karyawan
Mengubah nama dan tarif karyawan
Memilih bulan dan tahun absensi
Mencatat absensi harian
Mendukung absensi:
1 = satu hari penuh
½ = setengah hari
0 = tidak masuk
X dan R = kode tambahan
Mencatat jumlah lembur
Mencatat bon karyawan
Menghitung total hari kerja secara otomatis
Menghitung estimasi total pembayaran
Menyimpan data secara otomatis di browser
Mencetak laporan absensi
Export data ke Excel
Rekap pembayaran karyawan
🖥️ Teknologi

Project ini dibuat menggunakan:

HTML5
CSS3
JavaScript
LocalStorage
SheetJS untuk export Excel
📂 Struktur Project
ABSEN/
│
├── index.html
├── style.css
└── script.js
index.html

Digunakan untuk membuat struktur halaman dan komponen aplikasi.

style.css

Digunakan untuk mengatur tampilan, layout, tabel, modal, responsive design, dan print layout.

script.js

Digunakan untuk menangani:

Data karyawan
Data absensi
Perhitungan total
Penyimpanan data
Tambah/hapus karyawan
Export Excel
Print
⚙️ Cara Menjalankan
Download atau clone repository.
Buka folder project.
Jalankan index.html menggunakan browser.
Tambahkan karyawan menggunakan tombol Tambah Karyawan.
Pilih bulan dan tahun.
Masukkan data absensi.
Data akan tersimpan otomatis pada browser.

Untuk fitur Export Excel, koneksi internet diperlukan karena aplikasi menggunakan library SheetJS melalui CDN.

🧮 Perhitungan

Total hari kerja dihitung berdasarkan absensi:

1   = 1 hari
½   = 0.5 hari
0   = 0 hari
X/R = tidak dihitung

Total pembayaran sementara menggunakan rumus:

Total Bayar =
(Total Hari × Tarif/Hari)
+ (Total Lembur × Tarif Lembur)
- Bon
📊 Export Excel

Aplikasi menyediakan export ke file .xlsx.

File Excel terdiri dari:

Sheet ABSEN

Berisi detail absensi setiap karyawan berdasarkan tanggal.

Sheet REKAP

Berisi ringkasan:

Nama
Tarif / Hari
Total Hari
Lembur
Bon
Total Bayar
🖨️ Print

Laporan dapat langsung dicetak menggunakan tombol Print.

Layout print menggunakan format landscape agar tabel absensi yang memiliki banyak kolom tanggal tetap dapat dicetak dengan lebih baik.

🔮 Pengembangan Selanjutnya

Versi saat ini masih menggunakan penyimpanan lokal pada browser. Pengembangan berikutnya dapat mencakup:

Backend
Database
Sistem login
Multi-user
Riwayat absensi
Backup data
Manajemen karyawan
Rekap gaji bulanan
Slip pembayaran
Dashboard statistik
Hak akses admin
Sinkronisasi data antar perangkat
🎯 Tujuan Project

Project ini dibuat sebagai implementasi pengembangan aplikasi web sederhana sekaligus sebagai solusi digital untuk menggantikan proses pencatatan absensi karyawan yang sebelumnya dilakukan secara manual.
