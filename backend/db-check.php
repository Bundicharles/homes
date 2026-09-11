<?php
/**
 * TEMPORARY DATABASE DIAGNOSTIC — DELETE THIS FILE AFTER USE.
 *
 * Upload to:  public_html/backend/db-check.php
 * Open:       https://yourdomain.com/backend/db-check.php?diag=1
 *
 * Reports: PHP version, PDO driver availability, whether backend/.env exists,
 * the resolved DB host/port/name (user and password are NEVER printed),
 * a connection test with and without the database selected, and any missing
 * core tables — enough to distinguish wrong credentials vs wrong DB name vs
 * a missing schema import in a single request.
 */
declare(strict_types=1);

if (!isset($_GET['diag'])) {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'Append ?diag=1 to run. DELETE THIS FILE AFTER USE.']);
    exit;
}

ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/logs/db_check.log');
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

$report = [
    'php_version' => PHP_VERSION,
    'pdo_mysql'   => in_array('mysql', PDO::getAvailableDrivers(), true),
    'env_file'    => file_exists(__DIR__ . '/.env')
        ? 'FOUND (backend/.env is being used)'
        : 'MISSING — falling back to the hard-coded credentials in config/config.php',
];

require_once __DIR__ . '/config/config.php';

$host = (string) Config::get('db_host', 'localhost');
$port = (string) Config::get('db_port', '3306');
$name = (string) Config::get('db_name', '');
$user = (string) Config::get('db_user', '');
$pass = (string) Config::get('db_pass', '');

// Host and database NAME are printed (needed for triage); user & password never are.
$report['resolved_db_host'] = $host;
$report['resolved_db_port'] = $port;
$report['resolved_db_name'] = $name;

$opts = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_TIMEOUT => 5,
];

// Step 1 — MySQL server reachable + credentials accepted (no database selected)
try {
    new PDO("mysql:host={$host};port={$port};charset=utf8mb4", $user, $pass, $opts);
    $report['step1_server_and_credentials'] = 'PASS';
} catch (PDOException $e) {
    $report['step1_server_and_credentials'] = 'FAIL: ' . $e->getMessage();
    $report['verdict'] = 'DB_HOST / DB_USER / DB_PASSWORD are wrong or the MySQL user lacks privileges. '
        . 'Create/confirm the database + user in cPanel "MySQL Databases", put the EXACT values in backend/.env '
        . '(cPanel names are prefixed, e.g. cpaneluser_homes), re-upload, then DELETE this file.';
    echo json_encode($report, JSON_PRETTY_PRINT);
    exit;
}

// Step 2 — the database itself exists
try {
    $pdoDb = new PDO("mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4", $user, $pass, $opts);
    $report['step2_database_selected'] = 'PASS';
} catch (PDOException $e) {
    $report['step2_database_selected'] = 'FAIL: ' . $e->getMessage();
    $report['verdict'] = 'Server + credentials are OK but the DATABASE is wrong or missing. '
        . 'Fix DB_NAME in backend/.env to the exact cPanel database name, re-upload, then DELETE this file.';
    echo json_encode($report, JSON_PRETTY_PRINT);
    exit;
}

// Step 3 — schema present?
$coreTables = [
    'properties', 'promotions', 'settings', 'users', 'property_types', 'features',
    'agents', 'pages', 'menu_items', 'menus', 'social_links', 'earb_info',
];
try {
    $existing = $pdoDb->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    $missing  = array_values(array_diff($coreTables, $existing));
    $report['tables_in_db']      = count($existing);
    $report['missing_core_tables'] = $missing;
    $report['verdict'] = $missing === []
        ? 'Database and schema are OK. If an endpoint still 500s, read backend/logs/php_errors.log for the exact query error.'
        : 'Connection OK but tables are missing — import backend/database/production_complete.sql via cPanel phpMyAdmin, then DELETE this file.';
} catch (PDOException $e) {
    $report['step3_schema_check'] = 'FAIL: ' . $e->getMessage();
    $report['verdict'] = 'Connected but the schema check failed — import backend/database/production_complete.sql, then DELETE this file.';
}

$report['delete_this_file'] = 'YES — remove backend/db-check.php from the server after triage';
echo json_encode($report, JSON_PRETTY_PRINT);
