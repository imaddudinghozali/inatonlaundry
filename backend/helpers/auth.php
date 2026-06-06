<?php

declare(strict_types=1);

function public_user(array $user): array
{
    return [
        'id_user' => (int) $user['id_user'],
        'nama' => $user['nama'],
        'username' => $user['username'],
        'role' => $user['role'],
        'status' => $user['status'],
        'force_password_change' => (bool) $user['force_password_change'],
    ];
}

function current_user(): ?array
{
    return $_SESSION['user'] ?? null;
}

function require_auth(): array
{
    $timeout = (int) ($_SESSION['session_timeout_minutes'] ?? 60);
    $lastActivity = (int) ($_SESSION['last_activity'] ?? 0);
    if ($lastActivity > 0 && time() - $lastActivity > $timeout * 60) {
        $_SESSION = [];
        session_destroy();
        fail('Session berakhir. Silakan login kembali.', 401);
    }
    $_SESSION['last_activity'] = time();

    $user = current_user();
    if (!$user) {
        fail('Login diperlukan.', 401);
    }

    return $user;
}

function require_role(array $roles): array
{
    $user = require_auth();
    if (!in_array($user['role'], $roles, true)) {
        fail('Akses ditolak.', 403);
    }

    return $user;
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function verify_csrf(): void
{
    if (method() === 'GET' || method() === 'OPTIONS') {
        return;
    }

    $path = route_path();
    if ($path === '/auth/login') {
        return;
    }

    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if ($sent === '' || !hash_equals($_SESSION['csrf_token'] ?? '', $sent)) {
        fail('CSRF token tidak valid.', 419);
    }
}

function audit_log(
    PDO $pdo,
    string $action,
    string $targetType,
    string|int|null $targetId,
    mixed $beforeState = null,
    mixed $afterState = null
): void {
    $user = current_user();
    $stmt = $pdo->prepare(
        'INSERT INTO audit_logs
          (user_id, role, action, target_type, target_id, before_state, after_state, ip_address)
         VALUES
          (:user_id, :role, :action, :target_type, :target_id, :before_state, :after_state, :ip_address)'
    );
    $stmt->execute([
        ':user_id' => $user['id_user'] ?? null,
        ':role' => $user['role'] ?? null,
        ':action' => $action,
        ':target_type' => $targetType,
        ':target_id' => $targetId === null ? null : (string) $targetId,
        ':before_state' => $beforeState === null ? null : json_encode($beforeState, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ':after_state' => $afterState === null ? null : json_encode($afterState, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
    ]);
}

function get_config_int(PDO $pdo, string $key, int $default): int
{
    $stmt = $pdo->prepare('SELECT config_value FROM system_config WHERE config_key = :key LIMIT 1');
    $stmt->execute([':key' => $key]);
    $value = $stmt->fetchColumn();

    return $value === false ? $default : (int) $value;
}

function generate_code(PDO $pdo, string $prefix): string
{
    $today = date('Y-m-d');
    $compactDate = date('Ymd');

    $stmt = $pdo->prepare(
        'INSERT INTO daily_counters (counter_date, prefix, last_number)
         VALUES (:date, :prefix, LAST_INSERT_ID(1))
         ON DUPLICATE KEY UPDATE last_number = LAST_INSERT_ID(last_number + 1)'
    );
    $stmt->execute([
        ':date' => $today,
        ':prefix' => $prefix,
    ]);

    $number = (int) $pdo->query('SELECT LAST_INSERT_ID()')->fetchColumn();

    return sprintf('%s-%s-%03d', $prefix, $compactDate, $number);
}

function insert_mutation(
    PDO $pdo,
    int $memberId,
    string $type,
    int $nominal,
    string $direction,
    int $before,
    int $after,
    string $description,
    string $referenceType,
    int $referenceId,
    ?int $createdBy
): void {
    $stmt = $pdo->prepare(
        'INSERT INTO mutasi_saldo
          (id_member, tipe_mutasi, nominal, arah, saldo_sebelum, saldo_sesudah, keterangan, reference_type, reference_id, created_by)
         VALUES
          (:id_member, :tipe_mutasi, :nominal, :arah, :saldo_sebelum, :saldo_sesudah, :keterangan, :reference_type, :reference_id, :created_by)'
    );
    $stmt->execute([
        ':id_member' => $memberId,
        ':tipe_mutasi' => $type,
        ':nominal' => $nominal,
        ':arah' => $direction,
        ':saldo_sebelum' => $before,
        ':saldo_sesudah' => $after,
        ':keterangan' => $description,
        ':reference_type' => $referenceType,
        ':reference_id' => $referenceId,
        ':created_by' => $createdBy,
    ]);
}

function fetch_member_for_update(PDO $pdo, int $memberId): array
{
    $stmt = $pdo->prepare('SELECT * FROM members WHERE id_member = :id_member FOR UPDATE');
    $stmt->execute([':id_member' => $memberId]);
    $member = $stmt->fetch();

    if (!$member) {
        throw new RuntimeException('Member tidak ditemukan.', 404);
    }

    return $member;
}
