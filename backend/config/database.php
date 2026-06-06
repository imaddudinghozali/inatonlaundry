<?php

declare(strict_types=1);

function env_value(string $key, string $default = ''): string
{
    $value = getenv($key);
    return ($value === false || $value === '') ? $default : (string) $value;
}

function mysql_url_config(): array
{
    $url = env_value('MYSQL_URL', env_value('DATABASE_URL'));
    if ($url === '') {
        return [];
    }

    $parts = parse_url($url);
    if (!is_array($parts)) {
        return [];
    }

    return [
        'host' => (string) ($parts['host'] ?? ''),
        'port' => (string) ($parts['port'] ?? ''),
        'user' => isset($parts['user']) ? urldecode((string) $parts['user']) : '',
        'pass' => isset($parts['pass']) ? urldecode((string) $parts['pass']) : '',
        'name' => isset($parts['path']) ? ltrim(urldecode((string) $parts['path']), '/') : '',
    ];
}

$mysqlUrl = array_merge([
    'host' => '',
    'port' => '',
    'user' => '',
    'pass' => '',
    'name' => '',
], mysql_url_config());

define('DB_HOST', env_value('DB_HOST', env_value('MYSQLHOST', $mysqlUrl['host'] ?: '127.0.0.1')));
define('DB_PORT', (int) env_value('DB_PORT', env_value('MYSQLPORT', $mysqlUrl['port'] ?: '3306')));
define('DB_NAME', env_value('DB_NAME', env_value('MYSQLDATABASE', $mysqlUrl['name'] ?: 'inaton_laundry')));
define('DB_USER', env_value('DB_USER', env_value('MYSQLUSER', $mysqlUrl['user'] ?: 'root')));
define('DB_PASS', env_value('DB_PASS', env_value('MYSQLPASSWORD', $mysqlUrl['pass'])));
define('DB_CHARSET', env_value('DB_CHARSET', 'utf8mb4'));

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        DB_HOST,
        DB_PORT,
        DB_NAME,
        DB_CHARSET
    );

    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}
