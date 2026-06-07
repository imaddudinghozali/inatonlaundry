INSERT INTO users (id_user, nama, username, password, role, status, force_password_change)
VALUES
  (1, 'Owner Inaton Laundry', 'owner', '$2y$10$7uoi83OCXxVL2S.1B4W0s.7m/ZV3qQF8JfgtxInjEhSU6hXufrUA.', 'owner', 'aktif', 0),
  (2, 'Admin Kasir', 'admin', '$2y$10$tiuy328AZG0KAOocUl9ye.hfOYFIhdi1BJjq0YcmlEhcdePmmMyUe', 'admin', 'aktif', 0),
  (3, 'Customer Demo', 'customer', '$2y$10$OOanDeCmklL34REshv4Kxumcy.b/9VrKAFv6zVSdRE8rR8Ji4xUaW', 'customer', 'aktif', 0)
ON DUPLICATE KEY UPDATE
  nama = VALUES(nama),
  role = VALUES(role),
  status = VALUES(status);

INSERT INTO members (id_member, kode_member, id_user, nama, no_hp, alamat, saldo, status)
VALUES
  (1, 'MBR-20260604-001', 3, 'Customer Demo', '081234567890', 'Jakarta', 110000, 'aktif')
ON DUPLICATE KEY UPDATE
  nama = VALUES(nama),
  no_hp = VALUES(no_hp),
  alamat = VALUES(alamat),
  saldo = VALUES(saldo),
  status = VALUES(status);

INSERT INTO layanan (id_layanan, nama_layanan, satuan, harga, estimasi_hari, status)
VALUES
  (1, 'Cuci Komplit Reguler (3 Hari)', 'kg', 10000, 3, 'aktif'),
  (2, 'Cuci Lipat Reguler (3 Hari)', 'kg', 7000, 3, 'aktif'),
  (3, 'Setrika Reguler (3 Hari)', 'kg', 6000, 3, 'aktif'),
  (4, 'Cuci Komplit Reguler Cepat (2 Hari)', 'kg', 12000, 2, 'aktif'),
  (5, 'Cuci Komplit Express (24 Jam)', 'kg', 15000, 1, 'aktif'),
  (6, 'Cuci Komplit Same Day (6 Jam)', 'kg', 20000, 1, 'aktif'),
  (7, 'Cuci Komplit Prioritas (3 Jam)', 'kg', 25000, 1, 'aktif'),
  (8, 'Cuci Komplit Super Prioritas (1-2 Jam)', 'kg', 30000, 1, 'aktif')
ON DUPLICATE KEY UPDATE
  nama_layanan = VALUES(nama_layanan),
  satuan = VALUES(satuan),
  harga = VALUES(harga),
  estimasi_hari = VALUES(estimasi_hari),
  status = VALUES(status);

INSERT INTO system_config (config_key, config_value, description, updated_by)
VALUES
  ('minimum_topup', '10000', 'Minimum nominal top up saldo', 1),
  ('maximum_topup', '1000000', 'Maksimum nominal top up saldo', 1),
  ('session_timeout_minutes', '60', 'Batas idle session dalam menit', 1),
  ('nama_laundry', 'Inaton Laundry', 'Nama laundry pada nota', 1),
  ('alamat_laundry', 'Jakarta', 'Alamat laundry pada nota', 1),
  ('no_hp_laundry', '081234567890', 'Nomor kontak laundry pada nota', 1)
ON DUPLICATE KEY UPDATE
  config_value = VALUES(config_value),
  description = VALUES(description),
  updated_by = VALUES(updated_by);

INSERT INTO topups
  (id_topup, kode_topup, id_member, nominal, metode_pembayaran, nomor_referensi, bukti_pembayaran, status, diproses_oleh, approved_at, rejected_reason, catatan, created_at)
VALUES
  (1, 'TOP-20260604-001', 1, 10000, 'qris_statis', 'QRIS-DEMO-001', 'uploads/topups/34f039d84d9a12ad6f1f87d348eae775d916.png', 'success', 2, '2026-06-04 19:14:35', NULL, 'Top up demo terverifikasi', '2026-06-04 19:14:34'),
  (2, 'TOP-20260604-002', 1, 15000, 'qris_statis', 'QRIS-DEMO-002', 'uploads/topups/34f039d84d9a12ad6f1f87d348eae775d916.png', 'pending', 2, NULL, NULL, 'Top up pending untuk QA konfirmasi approve', '2026-06-04 20:05:00')
ON DUPLICATE KEY UPDATE
  id_member = VALUES(id_member),
  nominal = VALUES(nominal),
  metode_pembayaran = VALUES(metode_pembayaran),
  nomor_referensi = VALUES(nomor_referensi),
  bukti_pembayaran = VALUES(bukti_pembayaran),
  status = VALUES(status),
  diproses_oleh = VALUES(diproses_oleh),
  approved_at = VALUES(approved_at),
  rejected_reason = VALUES(rejected_reason),
  catatan = VALUES(catatan),
  created_at = VALUES(created_at);

INSERT INTO mutasi_saldo
  (id_mutasi, id_member, tipe_mutasi, nominal, arah, saldo_sebelum, saldo_sesudah, keterangan, reference_type, reference_id, created_by, created_at)
VALUES
  (1, 1, 'topup', 10000, 'credit', 100000, 110000, 'Top up saldo demo', 'topups', 1, 2, '2026-06-04 19:14:35')
ON DUPLICATE KEY UPDATE
  id_member = VALUES(id_member),
  tipe_mutasi = VALUES(tipe_mutasi),
  nominal = VALUES(nominal),
  arah = VALUES(arah),
  saldo_sebelum = VALUES(saldo_sebelum),
  saldo_sesudah = VALUES(saldo_sesudah),
  keterangan = VALUES(keterangan),
  reference_type = VALUES(reference_type),
  reference_id = VALUES(reference_id),
  created_by = VALUES(created_by),
  created_at = VALUES(created_at);

INSERT INTO transaksi_laundry
  (id_transaksi, kode_transaksi, id_member, tanggal_masuk, estimasi_selesai, tanggal_diambil, total_berat, total_harga, metode_pembayaran, status_pembayaran, status_laundry, is_refunded, catatan, created_by, created_at)
VALUES
  (1, 'TRX-20260604-001', 1, '2026-06-04 15:30:00', '2026-06-07', NULL, 2.50, 25000, 'cash', 'lunas', 'dicuci', 0, 'Transaksi demo untuk QA detail nota refund timeline', 2, '2026-06-04 15:30:00')
ON DUPLICATE KEY UPDATE
  id_member = VALUES(id_member),
  tanggal_masuk = VALUES(tanggal_masuk),
  estimasi_selesai = VALUES(estimasi_selesai),
  tanggal_diambil = VALUES(tanggal_diambil),
  total_berat = VALUES(total_berat),
  total_harga = VALUES(total_harga),
  metode_pembayaran = VALUES(metode_pembayaran),
  status_pembayaran = VALUES(status_pembayaran),
  status_laundry = VALUES(status_laundry),
  is_refunded = VALUES(is_refunded),
  catatan = VALUES(catatan),
  created_by = VALUES(created_by),
  created_at = VALUES(created_at);

INSERT INTO detail_transaksi
  (id_detail, id_transaksi, id_layanan, berat_jumlah, harga_satuan, subtotal)
VALUES
  (1, 1, 1, 2.50, 10000, 25000)
ON DUPLICATE KEY UPDATE
  id_transaksi = VALUES(id_transaksi),
  id_layanan = VALUES(id_layanan),
  berat_jumlah = VALUES(berat_jumlah),
  harga_satuan = VALUES(harga_satuan),
  subtotal = VALUES(subtotal);

INSERT INTO status_laundry_logs
  (id_log, id_transaksi, status_sebelum, status_sesudah, changed_by, catatan, created_at)
VALUES
  (1, 1, NULL, 'diterima', 2, 'Transaksi dibuat', '2026-06-04 15:30:00'),
  (2, 1, 'diterima', 'dicuci', 2, 'Cucian mulai diproses', '2026-06-04 16:05:00')
ON DUPLICATE KEY UPDATE
  id_transaksi = VALUES(id_transaksi),
  status_sebelum = VALUES(status_sebelum),
  status_sesudah = VALUES(status_sesudah),
  changed_by = VALUES(changed_by),
  catatan = VALUES(catatan),
  created_at = VALUES(created_at);
