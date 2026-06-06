<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/http.php';
require_once __DIR__ . '/../helpers/auth.php';

boot_api();

if (method() === 'OPTIONS') {
    ok();
}

$pdo = db();
$path = route_path();
$segments = array_values(array_filter(explode('/', trim($path, '/'))));

try {
    verify_csrf();
    dispatch($pdo, method(), $segments);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    $code = $e->getCode();
    $status = $code >= 400 && $code <= 499 ? $code : 500;
    fail($status === 500 ? 'Terjadi kesalahan server.' : $e->getMessage(), $status, [
        'detail' => $status === 500 ? $e->getMessage() : null,
    ]);
}

function dispatch(PDO $pdo, string $method, array $segments): never
{
    if ($segments === ['health'] && $method === 'GET') {
        ok(['status' => 'healthy', 'time' => date(DATE_ATOM)]);
    }

    if (($segments[0] ?? '') === 'auth') {
        handle_auth($pdo, $method, array_slice($segments, 1));
    }

    if (($segments[0] ?? '') === 'dashboard' && $method === 'GET') {
        handle_dashboard($pdo);
    }

    if (($segments[0] ?? '') === 'members') {
        handle_members($pdo, $method, array_slice($segments, 1));
    }

    if (($segments[0] ?? '') === 'services') {
        handle_services($pdo, $method, array_slice($segments, 1));
    }

    if (($segments[0] ?? '') === 'topups') {
        handle_topups($pdo, $method, array_slice($segments, 1));
    }

    if (($segments[0] ?? '') === 'transactions') {
        handle_transactions($pdo, $method, array_slice($segments, 1));
    }

    if (($segments[0] ?? '') === 'balance') {
        handle_balance($pdo, $method, array_slice($segments, 1));
    }

    if (($segments[0] ?? '') === 'reports' && $method === 'GET') {
        handle_reports($pdo);
    }

    if (($segments[0] ?? '') === 'settings') {
        handle_settings($pdo, $method);
    }

    if (($segments[0] ?? '') === 'mutations' && $method === 'GET') {
        list_mutations($pdo);
    }

    if (($segments[0] ?? '') === 'audit' && $method === 'GET') {
        list_audit_logs($pdo);
    }

    fail('Endpoint tidak ditemukan.', 404);
}

function handle_auth(PDO $pdo, string $method, array $segments): never
{
    $action = $segments[0] ?? '';

    if ($action === 'login' && $method === 'POST') {
        $body = read_json();
        $username = trim((string) ($body['username'] ?? ''));
        $password = (string) ($body['password'] ?? '');

        if ($username === '' || $password === '') {
            fail('Username dan password wajib diisi.', 422);
        }

        $stmt = $pdo->prepare('SELECT * FROM users WHERE username = :username AND status = "aktif" LIMIT 1');
        $stmt->execute([':username' => $username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            fail('Username atau password salah.', 401);
        }

        session_regenerate_id(true);
        $_SESSION['user'] = public_user($user);
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['last_activity'] = time();
        $_SESSION['session_timeout_minutes'] = get_config_int($pdo, 'session_timeout_minutes', 60);

        $stmt = $pdo->prepare('UPDATE users SET last_login_at = NOW() WHERE id_user = :id');
        $stmt->execute([':id' => $user['id_user']]);
        audit_log($pdo, 'login', 'users', $user['id_user']);

        ok([
            'user' => $_SESSION['user'],
            'csrf_token' => csrf_token(),
        ], 'Login berhasil.');
    }

    if ($action === 'me' && $method === 'GET') {
        if (!current_user()) {
            ok([
                'user' => null,
                'csrf_token' => csrf_token(),
            ]);
        }

        ok([
            'user' => require_auth(),
            'csrf_token' => csrf_token(),
        ]);
    }

    if ($action === 'logout' && $method === 'POST') {
        $user = require_auth();
        audit_log($pdo, 'logout', 'users', $user['id_user']);
        $_SESSION = [];
        session_destroy();
        ok([], 'Logout berhasil.');
    }

    if ($action === 'change-password' && $method === 'POST') {
        $user = require_auth();
        $body = read_json();
        $currentPassword = (string) ($body['current_password'] ?? '');
        $newPassword = (string) ($body['new_password'] ?? '');

        if (strlen($newPassword) < 8) {
            fail('Password baru minimal 8 karakter.', 422);
        }

        $stmt = $pdo->prepare('SELECT password FROM users WHERE id_user = :id LIMIT 1');
        $stmt->execute([':id' => $user['id_user']]);
        $hash = (string) $stmt->fetchColumn();

        if (!password_verify($currentPassword, $hash)) {
            fail('Password saat ini salah.', 422);
        }

        $stmt = $pdo->prepare('UPDATE users SET password = :password, force_password_change = 0 WHERE id_user = :id');
        $stmt->execute([
            ':password' => password_hash($newPassword, PASSWORD_BCRYPT),
            ':id' => $user['id_user'],
        ]);

        $_SESSION['user']['force_password_change'] = false;
        audit_log($pdo, 'change_password', 'users', $user['id_user']);
        ok([], 'Password berhasil diganti.');
    }

    fail('Endpoint auth tidak ditemukan.', 404);
}

function handle_dashboard(PDO $pdo): never
{
    $user = require_auth();

    if ($user['role'] === 'customer') {
        $stmt = $pdo->prepare('SELECT * FROM members WHERE id_user = :id_user LIMIT 1');
        $stmt->execute([':id_user' => $user['id_user']]);
        $member = $stmt->fetch();

        if (!$member) {
            fail('Data member tidak ditemukan.', 404);
        }

        $stmt = $pdo->prepare(
            'SELECT kode_transaksi, total_harga, status_pembayaran, status_laundry, tanggal_masuk
             FROM transaksi_laundry
             WHERE id_member = :id_member
             ORDER BY tanggal_masuk DESC
             LIMIT 5'
        );
        $stmt->execute([':id_member' => $member['id_member']]);

        ok([
            'saldo' => (int) $member['saldo'],
            'member' => $member,
            'recent_transactions' => $stmt->fetchAll(),
        ]);
    }

    require_role(['owner', 'admin']);
    $summary = [
        'members' => (int) $pdo->query('SELECT COUNT(*) FROM members')->fetchColumn(),
        'active_orders' => (int) $pdo->query('SELECT COUNT(*) FROM transaksi_laundry WHERE status_laundry <> "diambil"')->fetchColumn(),
        'today_transactions' => (int) $pdo->query('SELECT COUNT(*) FROM transaksi_laundry WHERE DATE(tanggal_masuk) = CURDATE()')->fetchColumn(),
        'today_revenue' => (int) $pdo->query('SELECT COALESCE(SUM(total_harga), 0) FROM transaksi_laundry WHERE DATE(tanggal_masuk) = CURDATE() AND status_pembayaran = "lunas"')->fetchColumn(),
    ];

    ok($summary);
}

function handle_members(PDO $pdo, string $method, array $segments): never
{
    if ($method === 'GET' && $segments === []) {
        $user = require_auth();
        if ($user['role'] === 'customer') {
            $stmt = $pdo->prepare('SELECT * FROM members WHERE id_user = :id_user LIMIT 1');
            $stmt->execute([':id_user' => $user['id_user']]);
            ok(['items' => $stmt->fetchAll()]);
        }

        require_role(['owner', 'admin']);
        $search = trim((string) ($_GET['search'] ?? ''));
        $sql = 'SELECT * FROM members';
        $params = [];
        if ($search !== '') {
            $sql .= ' WHERE nama LIKE :search OR no_hp LIKE :search OR kode_member LIKE :search';
            $params[':search'] = '%' . $search . '%';
        }
        $sql .= ' ORDER BY created_at DESC LIMIT 100';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        ok(['items' => $stmt->fetchAll()]);
    }

    if ($method === 'POST' && $segments === []) {
        $user = require_role(['owner', 'admin']);
        $body = read_json();
        $nama = trim((string) ($body['nama'] ?? ''));
        $noHp = trim((string) ($body['no_hp'] ?? ''));
        $alamat = trim((string) ($body['alamat'] ?? ''));
        $username = trim((string) ($body['username'] ?? $noHp));
        $password = (string) ($body['password'] ?? 'member123');

        if ($nama === '' || $noHp === '' || $username === '') {
            fail('Nama, nomor HP, dan username wajib diisi.', 422);
        }

        $pdo->beginTransaction();
        $stmt = $pdo->prepare(
            'INSERT INTO users (nama, username, password, role, status, force_password_change)
             VALUES (:nama, :username, :password, "customer", "aktif", 1)'
        );
        $stmt->execute([
            ':nama' => $nama,
            ':username' => $username,
            ':password' => password_hash($password, PASSWORD_BCRYPT),
        ]);
        $userId = (int) $pdo->lastInsertId();
        $code = generate_code($pdo, 'MBR');

        $stmt = $pdo->prepare(
            'INSERT INTO members (kode_member, id_user, nama, no_hp, alamat)
             VALUES (:kode_member, :id_user, :nama, :no_hp, :alamat)'
        );
        $stmt->execute([
            ':kode_member' => $code,
            ':id_user' => $userId,
            ':nama' => $nama,
            ':no_hp' => $noHp,
            ':alamat' => $alamat,
        ]);
        $memberId = (int) $pdo->lastInsertId();
        audit_log($pdo, 'create_member', 'members', $memberId, null, $body);
        $pdo->commit();

        ok(['id_member' => $memberId, 'kode_member' => $code], 'Member berhasil dibuat.');
    }

    if (count($segments) >= 1 && ctype_digit($segments[0])) {
        $id = (int) $segments[0];

        if ($method === 'PUT' && count($segments) === 1) {
            require_role(['owner', 'admin']);
            $body = read_json();
            $stmt = $pdo->prepare('SELECT * FROM members WHERE id_member = :id');
            $stmt->execute([':id' => $id]);
            $before = $stmt->fetch();
            if (!$before) {
                fail('Member tidak ditemukan.', 404);
            }

            $stmt = $pdo->prepare(
                'UPDATE members SET nama = :nama, no_hp = :no_hp, alamat = :alamat WHERE id_member = :id'
            );
            $stmt->execute([
                ':nama' => trim((string) ($body['nama'] ?? $before['nama'])),
                ':no_hp' => trim((string) ($body['no_hp'] ?? $before['no_hp'])),
                ':alamat' => trim((string) ($body['alamat'] ?? $before['alamat'])),
                ':id' => $id,
            ]);
            audit_log($pdo, 'update_member', 'members', $id, $before, $body);
            ok([], 'Member berhasil diperbarui.');
        }

        if ($method === 'PATCH' && ($segments[1] ?? '') === 'status') {
            require_role(['owner', 'admin']);
            $body = read_json();
            $status = (string) ($body['status'] ?? '');
            if (!in_array($status, ['aktif', 'nonaktif'], true)) {
                fail('Status member tidak valid.', 422);
            }

            $stmt = $pdo->prepare('UPDATE members SET status = :status WHERE id_member = :id');
            $stmt->execute([':status' => $status, ':id' => $id]);
            audit_log($pdo, 'change_member_status', 'members', $id, null, ['status' => $status]);
            ok([], 'Status member berhasil diperbarui.');
        }

        if ($method === 'POST' && ($segments[1] ?? '') === 'reset-password') {
            require_role(['owner', 'admin']);
            $temporary = 'tmp' . random_int(100000, 999999);
            $stmt = $pdo->prepare(
                'UPDATE users u
                 JOIN members m ON m.id_user = u.id_user
                 SET u.password = :password, u.force_password_change = 1
                 WHERE m.id_member = :id'
            );
            $stmt->execute([
                ':password' => password_hash($temporary, PASSWORD_BCRYPT),
                ':id' => $id,
            ]);
            audit_log($pdo, 'reset_member_password', 'members', $id);
            ok(['temporary_password' => $temporary], 'Password sementara berhasil dibuat.');
        }
    }

    fail('Endpoint member tidak ditemukan.', 404);
}

function handle_services(PDO $pdo, string $method, array $segments): never
{
    if ($method === 'GET' && $segments === []) {
        require_auth();
        $stmt = $pdo->query('SELECT * FROM layanan ORDER BY nama_layanan ASC');
        ok(['items' => $stmt->fetchAll()]);
    }

    if ($method === 'POST' && $segments === []) {
        require_role(['owner', 'admin']);
        $body = read_json();
        $stmt = $pdo->prepare(
            'INSERT INTO layanan (nama_layanan, satuan, harga, estimasi_hari, status)
             VALUES (:nama, :satuan, :harga, :estimasi, :status)'
        );
        $stmt->execute([
            ':nama' => trim((string) ($body['nama_layanan'] ?? '')),
            ':satuan' => (string) ($body['satuan'] ?? 'kg'),
            ':harga' => (int) ($body['harga'] ?? 0),
            ':estimasi' => (int) ($body['estimasi_hari'] ?? 1),
            ':status' => (string) ($body['status'] ?? 'aktif'),
        ]);
        $id = (int) $pdo->lastInsertId();
        audit_log($pdo, 'create_service', 'layanan', $id, null, $body);
        ok(['id_layanan' => $id], 'Layanan berhasil dibuat.');
    }

    if (count($segments) === 1 && ctype_digit($segments[0]) && $method === 'PUT') {
        require_role(['owner', 'admin']);
        $id = (int) $segments[0];
        $body = read_json();
        $stmt = $pdo->prepare(
            'UPDATE layanan
             SET nama_layanan = :nama, satuan = :satuan, harga = :harga, estimasi_hari = :estimasi, status = :status
             WHERE id_layanan = :id'
        );
        $stmt->execute([
            ':nama' => trim((string) ($body['nama_layanan'] ?? '')),
            ':satuan' => (string) ($body['satuan'] ?? 'kg'),
            ':harga' => (int) ($body['harga'] ?? 0),
            ':estimasi' => (int) ($body['estimasi_hari'] ?? 1),
            ':status' => (string) ($body['status'] ?? 'aktif'),
            ':id' => $id,
        ]);
        audit_log($pdo, 'update_service', 'layanan', $id, null, $body);
        ok([], 'Layanan berhasil diperbarui.');
    }

    fail('Endpoint layanan tidak ditemukan.', 404);
}

function handle_topups(PDO $pdo, string $method, array $segments): never
{
    if ($method === 'GET' && $segments === []) {
        $user = require_auth();
        $params = [];
        $where = [];
        if ($user['role'] === 'customer') {
            $where[] = 'm.id_user = :id_user';
            $params[':id_user'] = $user['id_user'];
        } else {
            require_role(['owner', 'admin']);
        }

        $sql = 'SELECT t.*, m.nama AS nama_member, m.kode_member, m.saldo AS saldo_member
                FROM topups t
                JOIN members m ON m.id_member = t.id_member';
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY t.created_at DESC LIMIT 100';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        ok(['items' => $stmt->fetchAll()]);
    }

    if ($method === 'POST' && $segments === []) {
        $user = require_auth();
        $body = read_json();
        $memberId = 0;
        if ($user['role'] === 'customer') {
            $stmt = $pdo->prepare('SELECT id_member FROM members WHERE id_user = :id_user AND status = "aktif" LIMIT 1');
            $stmt->execute([':id_user' => $user['id_user']]);
            $memberId = (int) $stmt->fetchColumn();
        } else {
            require_role(['owner', 'admin']);
            $memberId = (int) ($body['id_member'] ?? 0);
        }
        $nominal = (int) ($body['nominal'] ?? 0);
        $paymentMethod = $user['role'] === 'customer' ? 'qris_statis' : (string) ($body['metode_pembayaran'] ?? 'qris_statis');
        $min = get_config_int($pdo, 'minimum_topup', 10000);
        $max = get_config_int($pdo, 'maximum_topup', 1000000);

        if ($memberId <= 0) {
            fail('Member wajib dipilih.', 422);
        }
        if (!in_array($paymentMethod, ['qris_statis', 'transfer', 'cash'], true)) {
            fail('Metode pembayaran top up tidak valid.', 422);
        }
        if ($nominal < $min || $nominal > $max) {
            fail("Nominal top up harus antara {$min} dan {$max}.", 422);
        }

        $code = generate_code($pdo, 'TOP');
        $stmt = $pdo->prepare(
            'INSERT INTO topups
              (kode_topup, id_member, nominal, metode_pembayaran, nomor_referensi, catatan, diproses_oleh)
             VALUES
              (:kode, :id_member, :nominal, :metode, :referensi, :catatan, :user)'
        );
        $stmt->execute([
            ':kode' => $code,
            ':id_member' => $memberId,
            ':nominal' => $nominal,
            ':metode' => $paymentMethod,
            ':referensi' => trim((string) ($body['nomor_referensi'] ?? '')),
            ':catatan' => trim((string) ($body['catatan'] ?? '')),
            ':user' => $user['role'] === 'customer' ? null : $user['id_user'],
        ]);
        $id = (int) $pdo->lastInsertId();
        audit_log($pdo, 'create_topup', 'topups', $id, null, $body);
        ok(['id_topup' => $id, 'kode_topup' => $code], 'Top up pending berhasil dibuat.');
    }

    if (count($segments) === 2 && ctype_digit($segments[0]) && $method === 'POST' && $segments[1] === 'proof') {
        $user = require_auth();
        $id = (int) $segments[0];

        if ($user['role'] === 'customer') {
            $stmt = $pdo->prepare(
                'SELECT t.*
                 FROM topups t
                 JOIN members m ON m.id_member = t.id_member
                 WHERE t.id_topup = :id AND m.id_user = :id_user
                 LIMIT 1'
            );
            $stmt->execute([':id' => $id, ':id_user' => $user['id_user']]);
        } else {
            require_role(['owner', 'admin']);
            $stmt = $pdo->prepare('SELECT * FROM topups WHERE id_topup = :id');
            $stmt->execute([':id' => $id]);
        }
        $topup = $stmt->fetch();
        if (!$topup) {
            fail('Top up tidak ditemukan.', 404);
        }
        if ($topup['status'] !== 'pending') {
            fail('Bukti hanya dapat diupload untuk top up pending.', 422);
        }

        $path = save_topup_proof($_FILES['bukti'] ?? null);
        if ($user['role'] === 'customer') {
            $stmt = $pdo->prepare('UPDATE topups SET bukti_pembayaran = :path WHERE id_topup = :id');
            $stmt->execute([
                ':path' => $path,
                ':id' => $id,
            ]);
        } else {
            $stmt = $pdo->prepare('UPDATE topups SET bukti_pembayaran = :path, diproses_oleh = :user WHERE id_topup = :id');
            $stmt->execute([
                ':path' => $path,
                ':user' => $user['id_user'],
                ':id' => $id,
            ]);
        }
        audit_log($pdo, 'upload_topup_proof', 'topups', $id, ['bukti_pembayaran' => $topup['bukti_pembayaran']], ['bukti_pembayaran' => $path]);
        ok(['bukti_pembayaran' => $path], 'Bukti pembayaran berhasil diupload.');
    }

    if (count($segments) === 2 && ctype_digit($segments[0]) && $method === 'PATCH') {
        $user = require_role(['owner', 'admin']);
        $id = (int) $segments[0];
        $action = $segments[1];
        $body = read_json();

        if ($action === 'approve') {
            $pdo->beginTransaction();
            $stmt = $pdo->prepare('SELECT * FROM topups WHERE id_topup = :id FOR UPDATE');
            $stmt->execute([':id' => $id]);
            $topup = $stmt->fetch();
            if (!$topup) {
                throw new RuntimeException('Top up tidak ditemukan.', 404);
            }
            if ($topup['status'] !== 'pending') {
                throw new RuntimeException('Hanya top up pending yang dapat disetujui.', 422);
            }
            if (empty($topup['bukti_pembayaran'])) {
                throw new RuntimeException('Bukti pembayaran wajib diupload sebelum top up disetujui.', 422);
            }

            $member = fetch_member_for_update($pdo, (int) $topup['id_member']);
            $before = (int) $member['saldo'];
            $after = $before + (int) $topup['nominal'];
            $stmt = $pdo->prepare('UPDATE members SET saldo = :saldo WHERE id_member = :id_member');
            $stmt->execute([':saldo' => $after, ':id_member' => $member['id_member']]);
            $stmt = $pdo->prepare(
                'UPDATE topups
                 SET status = "success", approved_at = NOW(), diproses_oleh = :user
                 WHERE id_topup = :id'
            );
            $stmt->execute([':user' => $user['id_user'], ':id' => $id]);
            insert_mutation($pdo, (int) $member['id_member'], 'topup', (int) $topup['nominal'], 'credit', $before, $after, 'Top up saldo', 'topups', $id, (int) $user['id_user']);
            audit_log($pdo, 'approve_topup', 'topups', $id, $topup, ['status' => 'success']);
            $pdo->commit();
            ok([], 'Top up berhasil disetujui.');
        }

        if ($action === 'reject') {
            $reason = trim((string) ($body['reason'] ?? ''));
            if (strlen($reason) < 5) {
                fail('Alasan penolakan wajib diisi.', 422);
            }
            $stmt = $pdo->prepare('UPDATE topups SET status = "rejected", rejected_reason = :reason, diproses_oleh = :user WHERE id_topup = :id AND status = "pending"');
            $stmt->execute([':reason' => $reason, ':user' => $user['id_user'], ':id' => $id]);
            audit_log($pdo, 'reject_topup', 'topups', $id, null, ['reason' => $reason]);
            ok([], 'Top up berhasil ditolak.');
        }
    }

    fail('Endpoint top up tidak ditemukan.', 404);
}

function handle_transactions(PDO $pdo, string $method, array $segments): never
{
    if ($method === 'GET' && $segments === []) {
        $user = require_auth();
        $params = [];
        $where = [];
        if ($user['role'] === 'customer') {
            $where[] = 'm.id_user = :id_user';
            $params[':id_user'] = $user['id_user'];
        } else {
            require_role(['owner', 'admin']);
        }

        $sql = 'SELECT t.*, m.nama AS nama_member, m.kode_member
                FROM transaksi_laundry t
                JOIN members m ON m.id_member = t.id_member';
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY t.tanggal_masuk DESC LIMIT 100';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        ok(['items' => $stmt->fetchAll()]);
    }

    if ($method === 'GET' && count($segments) === 1 && ctype_digit($segments[0])) {
        $id = (int) $segments[0];
        $user = require_auth();
        $params = [':id' => $id];
        $customerWhere = '';
        if ($user['role'] === 'customer') {
            $customerWhere = ' AND m.id_user = :id_user';
            $params[':id_user'] = $user['id_user'];
        } else {
            require_role(['owner', 'admin']);
        }

        $stmt = $pdo->prepare(
            'SELECT t.*, m.nama AS nama_member, m.no_hp, m.alamat, m.kode_member
             FROM transaksi_laundry t
             JOIN members m ON m.id_member = t.id_member
             WHERE t.id_transaksi = :id' . $customerWhere . '
             LIMIT 1'
        );
        $stmt->execute($params);
        $transaction = $stmt->fetch();
        if (!$transaction) {
            fail('Transaksi tidak ditemukan.', 404);
        }

        $stmt = $pdo->prepare(
            'SELECT d.*, l.nama_layanan, l.satuan
             FROM detail_transaksi d
             JOIN layanan l ON l.id_layanan = d.id_layanan
             WHERE d.id_transaksi = :id
             ORDER BY d.id_detail ASC'
        );
        $stmt->execute([':id' => $id]);
        $details = $stmt->fetchAll();

        $stmt = $pdo->prepare(
            'SELECT s.*, u.nama AS changed_by_name
             FROM status_laundry_logs s
             LEFT JOIN users u ON u.id_user = s.changed_by
             WHERE s.id_transaksi = :id
             ORDER BY s.created_at ASC'
        );
        $stmt->execute([':id' => $id]);
        $logs = $stmt->fetchAll();

        $config = read_public_settings($pdo);
        ok([
            'transaction' => $transaction,
            'details' => $details,
            'status_logs' => $logs,
            'laundry' => $config,
        ]);
    }

    if ($method === 'POST' && $segments === []) {
        $user = require_role(['owner', 'admin']);
        $body = read_json();
        $memberId = (int) ($body['id_member'] ?? 0);
        $items = $body['items'] ?? [];
        $payment = (string) ($body['metode_pembayaran'] ?? 'cash');

        if ($memberId <= 0 || !is_array($items) || count($items) === 0) {
            fail('Member dan minimal satu layanan wajib diisi.', 422);
        }

        $pdo->beginTransaction();
        $member = fetch_member_for_update($pdo, $memberId);
        if ($member['status'] !== 'aktif') {
            throw new RuntimeException('Member nonaktif tidak dapat membuat transaksi.', 422);
        }

        $total = 0;
        $totalWeight = 0.0;
        $details = [];
        foreach ($items as $item) {
            $serviceId = (int) ($item['id_layanan'] ?? 0);
            $qty = (float) ($item['berat_jumlah'] ?? 0);
            if ($serviceId <= 0 || $qty <= 0) {
                throw new RuntimeException('Detail layanan tidak valid.', 422);
            }

            $stmt = $pdo->prepare('SELECT * FROM layanan WHERE id_layanan = :id AND status = "aktif"');
            $stmt->execute([':id' => $serviceId]);
            $service = $stmt->fetch();
            if (!$service) {
                throw new RuntimeException('Layanan tidak aktif atau tidak ditemukan.', 422);
            }

            $subtotal = (int) round($qty * (int) $service['harga']);
            $total += $subtotal;
            $totalWeight += $qty;
            $details[] = [$serviceId, $qty, (int) $service['harga'], $subtotal];
        }

        $statusPayment = $payment === 'saldo' ? 'lunas' : (string) ($body['status_pembayaran'] ?? 'lunas');
        if (!in_array($statusPayment, ['belum_bayar', 'lunas'], true)) {
            throw new RuntimeException('Status pembayaran awal tidak valid.', 422);
        }

        if ($payment === 'saldo') {
            $before = (int) $member['saldo'];
            if ($before < $total) {
                throw new RuntimeException('Saldo member tidak cukup.', 422);
            }
            $after = $before - $total;
            $stmt = $pdo->prepare('UPDATE members SET saldo = :saldo WHERE id_member = :id_member');
            $stmt->execute([':saldo' => $after, ':id_member' => $memberId]);
        }

        $code = generate_code($pdo, 'TRX');
        $estimate = (new DateTimeImmutable())->modify('+2 days')->format('Y-m-d');
        $stmt = $pdo->prepare(
            'INSERT INTO transaksi_laundry
              (kode_transaksi, id_member, estimasi_selesai, total_berat, total_harga, metode_pembayaran, status_pembayaran, catatan, created_by)
             VALUES
              (:kode, :member, :estimasi, :berat, :harga, :metode, :status_bayar, :catatan, :user)'
        );
        $stmt->execute([
            ':kode' => $code,
            ':member' => $memberId,
            ':estimasi' => $estimate,
            ':berat' => $totalWeight,
            ':harga' => $total,
            ':metode' => $payment,
            ':status_bayar' => $statusPayment,
            ':catatan' => trim((string) ($body['catatan'] ?? '')),
            ':user' => $user['id_user'],
        ]);
        $transactionId = (int) $pdo->lastInsertId();

        $stmt = $pdo->prepare(
            'INSERT INTO detail_transaksi
              (id_transaksi, id_layanan, berat_jumlah, harga_satuan, subtotal)
             VALUES
              (:trx, :layanan, :qty, :harga, :subtotal)'
        );
        foreach ($details as [$serviceId, $qty, $price, $subtotal]) {
            $stmt->execute([
                ':trx' => $transactionId,
                ':layanan' => $serviceId,
                ':qty' => $qty,
                ':harga' => $price,
                ':subtotal' => $subtotal,
            ]);
        }

        if ($payment === 'saldo') {
            insert_mutation($pdo, $memberId, 'pembayaran_transaksi', $total, 'debit', (int) $member['saldo'], (int) $member['saldo'] - $total, 'Pembayaran transaksi laundry', 'transaksi_laundry', $transactionId, (int) $user['id_user']);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO status_laundry_logs (id_transaksi, status_sebelum, status_sesudah, changed_by, catatan)
             VALUES (:trx, NULL, "diterima", :user, "Transaksi dibuat")'
        );
        $stmt->execute([':trx' => $transactionId, ':user' => $user['id_user']]);
        audit_log($pdo, 'create_transaction', 'transaksi_laundry', $transactionId, null, $body);
        $pdo->commit();

        ok(['id_transaksi' => $transactionId, 'kode_transaksi' => $code], 'Transaksi berhasil dibuat.');
    }

    if (count($segments) === 2 && ctype_digit($segments[0]) && $method === 'PATCH' && $segments[1] === 'payment') {
        $user = require_role(['owner', 'admin']);
        $id = (int) $segments[0];
        $body = read_json();
        $next = (string) ($body['status_pembayaran'] ?? '');
        if (!in_array($next, ['lunas', 'dibatalkan'], true)) {
            fail('Status pembayaran tidak valid.', 422);
        }

        $stmt = $pdo->prepare('SELECT * FROM transaksi_laundry WHERE id_transaksi = :id');
        $stmt->execute([':id' => $id]);
        $before = $stmt->fetch();
        if (!$before) {
            fail('Transaksi tidak ditemukan.', 404);
        }
        if ($before['status_pembayaran'] !== 'belum_bayar') {
            fail('Hanya transaksi belum bayar yang dapat diperbarui pembayaran.', 422);
        }

        $stmt = $pdo->prepare('UPDATE transaksi_laundry SET status_pembayaran = :status WHERE id_transaksi = :id');
        $stmt->execute([':status' => $next, ':id' => $id]);
        audit_log($pdo, 'change_payment_status', 'transaksi_laundry', $id, ['status_pembayaran' => $before['status_pembayaran']], ['status_pembayaran' => $next, 'by' => $user['id_user']]);
        ok([], 'Status pembayaran berhasil diperbarui.');
    }

    if (count($segments) === 2 && ctype_digit($segments[0]) && $method === 'PATCH' && $segments[1] === 'status') {
        $user = require_role(['owner', 'admin']);
        $id = (int) $segments[0];
        $body = read_json();
        $next = (string) ($body['status_laundry'] ?? '');
        $order = ['diterima', 'dicuci', 'dikeringkan', 'disetrika', 'selesai', 'diambil'];

        if (!in_array($next, $order, true)) {
            fail('Status laundry tidak valid.', 422);
        }

        $stmt = $pdo->prepare('SELECT status_laundry FROM transaksi_laundry WHERE id_transaksi = :id');
        $stmt->execute([':id' => $id]);
        $current = $stmt->fetchColumn();
        if ($current === false) {
            fail('Transaksi tidak ditemukan.', 404);
        }

        if ($user['role'] !== 'owner' && array_search($next, $order, true) <= array_search((string) $current, $order, true)) {
            fail('Admin hanya dapat memajukan status laundry.', 422);
        }
        $note = trim((string) ($body['catatan'] ?? ''));
        if ($user['role'] === 'owner' && array_search($next, $order, true) < array_search((string) $current, $order, true) && strlen($note) < 10) {
            fail('Alasan koreksi status minimal 10 karakter.', 422);
        }

        $takenSql = $next === 'diambil' ? ', tanggal_diambil = NOW()' : '';
        $stmt = $pdo->prepare('UPDATE transaksi_laundry SET status_laundry = :status ' . $takenSql . ' WHERE id_transaksi = :id');
        $stmt->execute([':status' => $next, ':id' => $id]);
        $stmt = $pdo->prepare(
            'INSERT INTO status_laundry_logs (id_transaksi, status_sebelum, status_sesudah, changed_by, catatan)
             VALUES (:id, :before, :after, :user, :catatan)'
        );
        $stmt->execute([
            ':id' => $id,
            ':before' => $current,
            ':after' => $next,
            ':user' => $user['id_user'],
            ':catatan' => $note,
        ]);
        audit_log($pdo, 'change_laundry_status', 'transaksi_laundry', $id, ['status_laundry' => $current], ['status_laundry' => $next]);
        ok([], 'Status laundry berhasil diperbarui.');
    }

    if (count($segments) === 2 && ctype_digit($segments[0]) && $method === 'POST' && $segments[1] === 'refund') {
        refund_transaction($pdo, (int) $segments[0]);
    }

    fail('Endpoint transaksi tidak ditemukan.', 404);
}

function refund_transaction(PDO $pdo, int $transactionId): never
{
    $user = require_role(['owner', 'admin']);
    $body = read_json();
    $reason = trim((string) ($body['alasan'] ?? ''));
    if (strlen($reason) < 10) {
        fail('Alasan refund minimal 10 karakter.', 422);
    }

    $pdo->beginTransaction();
    $stmt = $pdo->prepare('SELECT * FROM transaksi_laundry WHERE id_transaksi = :id FOR UPDATE');
    $stmt->execute([':id' => $transactionId]);
    $trx = $stmt->fetch();
    if (!$trx) {
        throw new RuntimeException('Transaksi tidak ditemukan.', 404);
    }
    if ((int) $trx['is_refunded'] === 1 || $trx['status_pembayaran'] === 'direfund') {
        throw new RuntimeException('Transaksi sudah pernah direfund.', 422);
    }
    if (!in_array($trx['status_laundry'], ['diterima', 'dicuci'], true)) {
        throw new RuntimeException('Refund hanya untuk status diterima atau dicuci.', 422);
    }
    if ($trx['status_pembayaran'] !== 'lunas') {
        throw new RuntimeException('Refund hanya untuk transaksi lunas.', 422);
    }

    $code = generate_code($pdo, 'RFD');
    $stmt = $pdo->prepare(
        'INSERT INTO refunds (kode_refund, id_transaksi, id_member, nominal_refund, alasan, diproses_oleh)
         VALUES (:kode, :trx, :member, :nominal, :alasan, :user)'
    );
    $stmt->execute([
        ':kode' => $code,
        ':trx' => $transactionId,
        ':member' => $trx['id_member'],
        ':nominal' => $trx['total_harga'],
        ':alasan' => $reason,
        ':user' => $user['id_user'],
    ]);
    $refundId = (int) $pdo->lastInsertId();

    if ($trx['metode_pembayaran'] === 'saldo') {
        $member = fetch_member_for_update($pdo, (int) $trx['id_member']);
        $before = (int) $member['saldo'];
        $after = $before + (int) $trx['total_harga'];
        $stmt = $pdo->prepare('UPDATE members SET saldo = :saldo WHERE id_member = :id_member');
        $stmt->execute([':saldo' => $after, ':id_member' => $trx['id_member']]);
        insert_mutation($pdo, (int) $trx['id_member'], 'refund', (int) $trx['total_harga'], 'credit', $before, $after, 'Refund transaksi laundry', 'refunds', $refundId, (int) $user['id_user']);
    }

    $stmt = $pdo->prepare('UPDATE transaksi_laundry SET status_pembayaran = "direfund", is_refunded = 1 WHERE id_transaksi = :id');
    $stmt->execute([':id' => $transactionId]);
    audit_log($pdo, 'refund_transaction', 'transaksi_laundry', $transactionId, $trx, ['kode_refund' => $code, 'alasan' => $reason]);
    $pdo->commit();

    ok(['id_refund' => $refundId, 'kode_refund' => $code], 'Refund berhasil dicatat.');
}

function handle_balance(PDO $pdo, string $method, array $segments): never
{
    if ($method === 'POST' && ($segments[0] ?? '') === 'corrections') {
        $user = require_role(['owner']);
        $body = read_json();
        $memberId = (int) ($body['id_member'] ?? 0);
        $direction = (string) ($body['arah'] ?? '');
        $nominal = (int) ($body['nominal'] ?? 0);
        $reason = trim((string) ($body['alasan'] ?? ''));

        if ($memberId <= 0 || !in_array($direction, ['credit', 'debit'], true) || $nominal <= 0 || strlen($reason) < 20) {
            fail('Data koreksi saldo tidak valid.', 422);
        }

        $pdo->beginTransaction();
        $member = fetch_member_for_update($pdo, $memberId);
        $before = (int) $member['saldo'];
        if ($direction === 'debit' && $nominal > $before) {
            throw new RuntimeException('Koreksi debit melebihi saldo member.', 422);
        }
        $after = $direction === 'credit' ? $before + $nominal : $before - $nominal;
        $stmt = $pdo->prepare('UPDATE members SET saldo = :saldo WHERE id_member = :id_member');
        $stmt->execute([':saldo' => $after, ':id_member' => $memberId]);
        insert_mutation($pdo, $memberId, 'koreksi_saldo', $nominal, $direction, $before, $after, $reason, 'members', $memberId, (int) $user['id_user']);
        audit_log($pdo, 'balance_correction', 'members', $memberId, ['saldo' => $before], ['saldo' => $after, 'alasan' => $reason]);
        $pdo->commit();
        ok(['saldo_sebelum' => $before, 'saldo_sesudah' => $after], 'Koreksi saldo berhasil.');
    }

    fail('Endpoint saldo tidak ditemukan.', 404);
}

function handle_reports(PDO $pdo): never
{
    $user = require_auth();
    $type = (string) ($_GET['type'] ?? 'transactions');
    $ownerOnly = ['mutations', 'corrections', 'audit'];
    if (in_array($type, $ownerOnly, true)) {
        require_role(['owner']);
    } else {
        require_role(['owner', 'admin']);
    }

    $start = trim((string) ($_GET['start_date'] ?? ''));
    $end = trim((string) ($_GET['end_date'] ?? ''));
    $memberId = (int) ($_GET['member_id'] ?? 0);
    $params = [];

    $dateFilter = function (string $column) use ($start, $end, &$params): string {
        $where = [];
        if ($start !== '') {
            $where[] = "{$column} >= :start_date";
            $params[':start_date'] = $start . ' 00:00:00';
        }
        if ($end !== '') {
            $where[] = "{$column} <= :end_date";
            $params[':end_date'] = $end . ' 23:59:59';
        }
        return $where ? implode(' AND ', $where) : '';
    };

    if ($type === 'transactions') {
        $where = [];
        $date = $dateFilter('t.tanggal_masuk');
        if ($date !== '') {
            $where[] = $date;
        }
        if ($memberId > 0) {
            $where[] = 't.id_member = :member_id';
            $params[':member_id'] = $memberId;
        }
        foreach (['metode_pembayaran', 'status_pembayaran', 'status_laundry'] as $field) {
            $value = trim((string) ($_GET[$field] ?? ''));
            if ($value !== '') {
                $where[] = "t.{$field} = :{$field}";
                $params[":{$field}"] = $value;
            }
        }

        $sql = 'SELECT t.*, m.nama AS nama_member, m.kode_member
                FROM transaksi_laundry t
                JOIN members m ON m.id_member = t.id_member';
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY t.tanggal_masuk DESC LIMIT 500';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        ok([
            'items' => $rows,
            'summary' => [
                'count' => count($rows),
                'total_harga' => array_sum(array_map(fn ($row) => (int) $row['total_harga'], $rows)),
            ],
        ]);
    }

    if ($type === 'topups') {
        $where = [];
        $date = $dateFilter('t.created_at');
        if ($date !== '') {
            $where[] = $date;
        }
        if ($memberId > 0) {
            $where[] = 't.id_member = :member_id';
            $params[':member_id'] = $memberId;
        }
        $status = trim((string) ($_GET['status'] ?? ''));
        if ($status !== '') {
            $where[] = 't.status = :status';
            $params[':status'] = $status;
        }
        $paymentMethod = trim((string) ($_GET['metode_pembayaran'] ?? ''));
        if ($paymentMethod !== '') {
            $where[] = 't.metode_pembayaran = :metode_pembayaran';
            $params[':metode_pembayaran'] = $paymentMethod;
        }

        $sql = 'SELECT t.*, m.nama AS nama_member, m.kode_member
                FROM topups t
                JOIN members m ON m.id_member = t.id_member';
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY t.created_at DESC LIMIT 500';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        ok([
            'items' => $rows,
            'summary' => [
                'count' => count($rows),
                'total_success' => array_sum(array_map(fn ($row) => $row['status'] === 'success' ? (int) $row['nominal'] : 0, $rows)),
            ],
        ]);
    }

    if ($type === 'balances') {
        $stmt = $pdo->query('SELECT kode_member, nama, no_hp, saldo, status FROM members ORDER BY saldo DESC, nama ASC');
        $rows = $stmt->fetchAll();
        ok([
            'items' => $rows,
            'summary' => [
                'count' => count($rows),
                'total_saldo' => array_sum(array_map(fn ($row) => (int) $row['saldo'], $rows)),
            ],
        ]);
    }

    if ($type === 'status') {
        $stmt = $pdo->query(
            'SELECT status_laundry, COUNT(*) AS total
             FROM transaksi_laundry
             GROUP BY status_laundry
             ORDER BY FIELD(status_laundry, "diterima", "dicuci", "dikeringkan", "disetrika", "selesai", "diambil")'
        );
        ok(['items' => $stmt->fetchAll(), 'summary' => []]);
    }

    if ($type === 'mutations' || $type === 'corrections') {
        $where = [];
        $date = $dateFilter('ms.created_at');
        if ($date !== '') {
            $where[] = $date;
        }
        if ($memberId > 0) {
            $where[] = 'ms.id_member = :member_id';
            $params[':member_id'] = $memberId;
        }
        if ($type === 'corrections') {
            $where[] = 'ms.tipe_mutasi = "koreksi_saldo"';
        }
        $sql = 'SELECT ms.*, m.nama AS nama_member, m.kode_member
                FROM mutasi_saldo ms
                JOIN members m ON m.id_member = ms.id_member';
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY ms.created_at DESC LIMIT 500';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        ok(['items' => $stmt->fetchAll(), 'summary' => []]);
    }

    if ($type === 'audit') {
        $where = [];
        $date = $dateFilter('created_at');
        if ($date !== '') {
            $where[] = $date;
        }
        $sql = 'SELECT * FROM audit_logs';
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY created_at DESC LIMIT 500';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        ok(['items' => $stmt->fetchAll(), 'summary' => []]);
    }

    fail('Tipe laporan tidak valid.', 422);
}

function handle_settings(PDO $pdo, string $method): never
{
    if ($method === 'GET') {
        require_role(['owner']);
        ok(['settings' => read_public_settings($pdo)]);
    }

    if ($method === 'PUT') {
        $user = require_role(['owner']);
        $body = read_json();
        $allowed = [
            'minimum_topup',
            'maximum_topup',
            'session_timeout_minutes',
            'nama_laundry',
            'alamat_laundry',
            'no_hp_laundry',
        ];
        $settings = $body['settings'] ?? $body;
        if (!is_array($settings)) {
            fail('Payload pengaturan tidak valid.', 422);
        }

        $min = isset($settings['minimum_topup']) ? (int) $settings['minimum_topup'] : get_config_int($pdo, 'minimum_topup', 10000);
        $max = isset($settings['maximum_topup']) ? (int) $settings['maximum_topup'] : get_config_int($pdo, 'maximum_topup', 1000000);
        if ($min <= 0 || $max < $min) {
            fail('Minimum dan maksimum top up tidak valid.', 422);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO system_config (config_key, config_value, description, updated_by)
             VALUES (:key, :value, :description, :user)
             ON DUPLICATE KEY UPDATE config_value = VALUES(config_value), updated_by = VALUES(updated_by)'
        );
        foreach ($settings as $key => $value) {
            if (!in_array($key, $allowed, true)) {
                continue;
            }
            $stmt->execute([
                ':key' => $key,
                ':value' => (string) $value,
                ':description' => 'Diubah dari panel pengaturan',
                ':user' => $user['id_user'],
            ]);
        }
        audit_log($pdo, 'update_settings', 'system_config', null, null, $settings);
        ok(['settings' => read_public_settings($pdo)], 'Pengaturan berhasil disimpan.');
    }

    fail('Endpoint pengaturan tidak ditemukan.', 404);
}

function read_public_settings(PDO $pdo): array
{
    $keys = [
        'minimum_topup',
        'maximum_topup',
        'session_timeout_minutes',
        'nama_laundry',
        'alamat_laundry',
        'no_hp_laundry',
    ];
    $placeholders = implode(',', array_fill(0, count($keys), '?'));
    $stmt = $pdo->prepare("SELECT config_key, config_value FROM system_config WHERE config_key IN ({$placeholders})");
    $stmt->execute($keys);
    $settings = [
        'minimum_topup' => '10000',
        'maximum_topup' => '1000000',
        'session_timeout_minutes' => '60',
        'nama_laundry' => 'Inaton Laundry',
        'alamat_laundry' => '',
        'no_hp_laundry' => '',
    ];
    foreach ($stmt->fetchAll() as $row) {
        $settings[$row['config_key']] = $row['config_value'];
    }

    return $settings;
}

function save_topup_proof(?array $file): string
{
    if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        fail('File bukti pembayaran wajib diupload.', 422);
    }

    if (($file['size'] ?? 0) > 2 * 1024 * 1024) {
        fail('Ukuran bukti pembayaran maksimal 2 MB.', 422);
    }

    $tmp = (string) ($file['tmp_name'] ?? '');
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($tmp);
    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'application/pdf' => 'pdf',
    ];

    if (!isset($extensions[$mime])) {
        fail('Format bukti harus JPG, PNG, atau PDF.', 422);
    }

    $dir = dirname(__DIR__) . '/uploads/topups';
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }

    $filename = bin2hex(random_bytes(18)) . '.' . $extensions[$mime];
    $target = $dir . '/' . $filename;
    if (!move_uploaded_file($tmp, $target)) {
        fail('Gagal menyimpan bukti pembayaran.', 500);
    }

    return 'uploads/topups/' . $filename;
}

function list_mutations(PDO $pdo): never
{
    $user = require_auth();
    $params = [];
    $where = [];
    if ($user['role'] === 'customer') {
        $where[] = 'm.id_user = :id_user';
        $params[':id_user'] = $user['id_user'];
    } else {
        require_role(['owner']);
    }

    $sql = 'SELECT ms.*, m.nama AS nama_member, m.kode_member
            FROM mutasi_saldo ms
            JOIN members m ON m.id_member = ms.id_member';
    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY ms.created_at DESC LIMIT 100';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    ok(['items' => $stmt->fetchAll()]);
}

function list_audit_logs(PDO $pdo): never
{
    require_role(['owner']);
    $stmt = $pdo->query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
    ok(['items' => $stmt->fetchAll()]);
}
