CREATE DATABASE IF NOT EXISTS inaton_laundry
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE inaton_laundry;

CREATE TABLE IF NOT EXISTS users (
  id_user INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(120) NOT NULL,
  username VARCHAR(80) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('owner', 'admin', 'customer') NOT NULL,
  status ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
  force_password_change TINYINT(1) NOT NULL DEFAULT 0,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role_status (role, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS members (
  id_member INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kode_member VARCHAR(32) NOT NULL UNIQUE,
  id_user INT UNSIGNED NULL UNIQUE,
  nama VARCHAR(120) NOT NULL,
  no_hp VARCHAR(30) NOT NULL,
  alamat TEXT NULL,
  saldo BIGINT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_members_user
    FOREIGN KEY (id_user) REFERENCES users(id_user)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_members_search (nama, no_hp),
  INDEX idx_members_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS layanan (
  id_layanan INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama_layanan VARCHAR(120) NOT NULL,
  satuan ENUM('kg', 'item', 'pasang') NOT NULL,
  harga BIGINT UNSIGNED NOT NULL,
  estimasi_hari INT UNSIGNED NOT NULL DEFAULT 1,
  status ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_layanan_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS system_config (
  id_config INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(80) NOT NULL UNIQUE,
  config_value TEXT NOT NULL,
  description VARCHAR(255) NULL,
  updated_by INT UNSIGNED NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_system_config_user
    FOREIGN KEY (updated_by) REFERENCES users(id_user)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS topups (
  id_topup INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kode_topup VARCHAR(32) NOT NULL UNIQUE,
  id_member INT UNSIGNED NOT NULL,
  nominal BIGINT UNSIGNED NOT NULL,
  metode_pembayaran ENUM('qris_statis', 'transfer', 'cash') NOT NULL DEFAULT 'qris_statis',
  nomor_referensi VARCHAR(120) NULL,
  bukti_pembayaran VARCHAR(255) NULL,
  status ENUM('pending', 'success', 'rejected') NOT NULL DEFAULT 'pending',
  diproses_oleh INT UNSIGNED NULL,
  approved_at DATETIME NULL,
  rejected_reason VARCHAR(255) NULL,
  catatan TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_topups_member
    FOREIGN KEY (id_member) REFERENCES members(id_member)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_topups_processor
    FOREIGN KEY (diproses_oleh) REFERENCES users(id_user)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_topups_status_date (status, created_at),
  INDEX idx_topups_member_date (id_member, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transaksi_laundry (
  id_transaksi INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kode_transaksi VARCHAR(32) NOT NULL UNIQUE,
  id_member INT UNSIGNED NOT NULL,
  tanggal_masuk DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estimasi_selesai DATE NOT NULL,
  tanggal_diambil DATETIME NULL,
  total_berat DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_harga BIGINT UNSIGNED NOT NULL,
  metode_pembayaran ENUM('saldo', 'cash', 'transfer', 'qris_manual') NOT NULL,
  status_pembayaran ENUM('belum_bayar', 'lunas', 'direfund', 'dibatalkan') NOT NULL DEFAULT 'belum_bayar',
  status_laundry ENUM('diterima', 'dicuci', 'dikeringkan', 'disetrika', 'selesai', 'diambil') NOT NULL DEFAULT 'diterima',
  is_refunded TINYINT(1) NOT NULL DEFAULT 0,
  catatan TEXT NULL,
  created_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_member
    FOREIGN KEY (id_member) REFERENCES members(id_member)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_transactions_creator
    FOREIGN KEY (created_by) REFERENCES users(id_user)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_transactions_date (tanggal_masuk),
  INDEX idx_transactions_member_date (id_member, tanggal_masuk),
  INDEX idx_transactions_status (status_pembayaran, status_laundry)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detail_transaksi (
  id_detail INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_transaksi INT UNSIGNED NOT NULL,
  id_layanan INT UNSIGNED NOT NULL,
  berat_jumlah DECIMAL(10,2) NOT NULL,
  harga_satuan BIGINT UNSIGNED NOT NULL,
  subtotal BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_details_transaction
    FOREIGN KEY (id_transaksi) REFERENCES transaksi_laundry(id_transaksi)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_details_service
    FOREIGN KEY (id_layanan) REFERENCES layanan(id_layanan)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mutasi_saldo (
  id_mutasi INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_member INT UNSIGNED NOT NULL,
  tipe_mutasi ENUM('topup', 'pembayaran_transaksi', 'refund', 'koreksi_saldo') NOT NULL,
  nominal BIGINT UNSIGNED NOT NULL,
  arah ENUM('credit', 'debit') NOT NULL,
  saldo_sebelum BIGINT UNSIGNED NOT NULL,
  saldo_sesudah BIGINT UNSIGNED NOT NULL,
  keterangan TEXT NOT NULL,
  reference_type VARCHAR(50) NOT NULL,
  reference_id INT UNSIGNED NOT NULL,
  created_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mutations_member
    FOREIGN KEY (id_member) REFERENCES members(id_member)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_mutations_user
    FOREIGN KEY (created_by) REFERENCES users(id_user)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_mutations_member_date (id_member, created_at),
  INDEX idx_mutations_type_date (tipe_mutasi, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refunds (
  id_refund INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kode_refund VARCHAR(32) NOT NULL UNIQUE,
  id_transaksi INT UNSIGNED NOT NULL UNIQUE,
  id_member INT UNSIGNED NOT NULL,
  nominal_refund BIGINT UNSIGNED NOT NULL,
  alasan TEXT NOT NULL,
  diproses_oleh INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refunds_transaction
    FOREIGN KEY (id_transaksi) REFERENCES transaksi_laundry(id_transaksi)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_refunds_member
    FOREIGN KEY (id_member) REFERENCES members(id_member)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_refunds_processor
    FOREIGN KEY (diproses_oleh) REFERENCES users(id_user)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  id_log BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  role VARCHAR(30) NULL,
  action VARCHAR(80) NOT NULL,
  target_type VARCHAR(80) NOT NULL,
  target_id VARCHAR(80) NULL,
  before_state JSON NULL,
  after_state JSON NULL,
  ip_address VARCHAR(45) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user
    FOREIGN KEY (user_id) REFERENCES users(id_user)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_audit_target (target_type, target_id),
  INDEX idx_audit_date (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS status_laundry_logs (
  id_log INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_transaksi INT UNSIGNED NOT NULL,
  status_sebelum VARCHAR(30) NULL,
  status_sesudah VARCHAR(30) NOT NULL,
  changed_by INT UNSIGNED NULL,
  catatan TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_status_logs_transaction
    FOREIGN KEY (id_transaksi) REFERENCES transaksi_laundry(id_transaksi)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_status_logs_user
    FOREIGN KEY (changed_by) REFERENCES users(id_user)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_status_logs_transaction (id_transaksi, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS daily_counters (
  counter_date DATE NOT NULL,
  prefix VARCHAR(8) NOT NULL,
  last_number INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (counter_date, prefix)
) ENGINE=InnoDB;
