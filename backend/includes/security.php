<?php
declare(strict_types=1);

class Security
{
    public static function init(): void
    {
        self::disableErrorDisplay();
        self::setSecurityHeaders();
        self::configureSession();
    }

    private static function disableErrorDisplay(): void
    {
        ini_set('display_errors', '0');
        ini_set('display_startup_errors', '0');
        ini_set('log_errors', '1');
        ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');
        if (!is_dir(__DIR__ . '/../../logs')) {
            @mkdir(__DIR__ . '/../../logs', 0755, true);
        }
    }

    private static function setSecurityHeaders(): void
    {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Content-Security-Policy: default-src \'self\'; img-src \'self\' data: https: http:; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\' https:; connect-src \'self\' https:; font-src \'self\' data: https:; object-src \'none\'; frame-ancestors \'self\'');
        header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
    }

    private static function configureSession(): void
    {
        $sessionName = Config::get('session_name', 'real_estate_session');
        $sessionLifetime = Config::get('session_lifetime', 1440);
        $sessionSecure = Config::get('session_secure', false);

        ini_set('session.cookie_httponly', '1');
        ini_set('session.use_strict_mode', '1');
        ini_set('session.cookie_samesite', 'Lax');

        if ($sessionSecure) {
            ini_set('session.cookie_secure', '1');
        }
        ini_set('session.cookie_lifetime', (string)$sessionLifetime);
        ini_set('session.gc_maxlifetime', (string)$sessionLifetime);

        if (session_status() === PHP_SESSION_NONE) {
            session_name($sessionName);
            session_start();
        }
    }

    public static function escapeOutput(string $input): string
    {
        return htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    public static function sanitizeInput($input): mixed
    {
        if (is_array($input)) {
            return array_map([self::class, 'sanitizeInput'], $input);
        }
        if (is_string($input)) {
            return trim($input);
        }
        return $input;
    }

    public static function generateCSRFToken(): string
    {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    public static function validateCSRFToken(string $token): bool
    {
        if (!isset($_SESSION['csrf_token'])) {
            return false;
        }
        return hash_equals($_SESSION['csrf_token'], $token);
    }

    public static function generateSecureToken(int $length = 32): string
    {
        return bin2hex(random_bytes($length));
    }

    public static function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_ARGON2ID, [
            'memory_cost' => 65536,
            'time_cost' => 4,
            'threads' => 3,
        ]);
    }

    public static function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    public static function checkRateLimit(string $key, int $maxAttempts = 5, int $window = 3600): bool
    {
        if (!isset($_SESSION['rate_limits'])) {
            $_SESSION['rate_limits'] = [];
        }

        $now = time();
        $windowKey = $key . '_' . floor($now / $window);

        if (!isset($_SESSION['rate_limits'][$windowKey])) {
            $_SESSION['rate_limits'][$windowKey] = 0;
        }

        $_SESSION['rate_limits'][$windowKey]++;

        return $_SESSION['rate_limits'][$windowKey] <= $maxAttempts;
    }

    public static function getClientIP(): string
    {
        $headers = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_REAL_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_CLIENT_IP'];
        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                return trim($ips[0]);
            }
        }
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    public static function validateFileUpload(string $tmpName, array $fileInfo, array $allowedTypes, int $maxSize): array
    {
        $errors = [];

        if (!file_exists($tmpName) || !is_uploaded_file($tmpName)) {
            $errors[] = 'Invalid file upload.';
            return $errors;
        }

        $fileSize = filesize($tmpName);
        $maxBytes = $maxSize * 1024 * 1024;

        if ($fileSize > $maxBytes) {
            $errors[] = 'File size exceeds the maximum allowed size.';
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($tmpName);
        $extension = strtolower(pathinfo($fileInfo['name'], PATHINFO_EXTENSION));

        $forbiddenExtensions = ['php', 'php3', 'php4', 'php5', 'phtml', 'phar', 'exe', 'sh', 'bat', 'cmd', 'ps1', 'js', 'jsp', 'asp', 'aspx', 'cgi', 'pl', 'py', 'rb'];
        if (in_array($extension, $forbiddenExtensions)) {
            $errors[] = 'File type not allowed.';
        }

        $allowedMimeMap = [
            'jpg' => ['image/jpeg'],
            'jpeg' => ['image/jpeg'],
            'png' => ['image/png'],
            'gif' => ['image/gif'],
            'webp' => ['image/webp'],
            'avif' => ['image/avif'],
            'pdf' => ['application/pdf'],
            'doc' => ['application/msword'],
            'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'xls' => ['application/vnd.ms-excel'],
            'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        ];

        if (isset($allowedMimeMap[$extension]) && !in_array($mimeType, $allowedMimeMap[$extension])) {
            $errors[] = 'File MIME type does not match extension.';
        }

        if (!in_array($extension, $allowedTypes)) {
            $errors[] = 'File extension not allowed.';
        }

        if ($fileSize === 0) {
            $errors[] = 'File is empty.';
        }

        return $errors;
    }

    public static function logAudit(int $userId, string $action, string $table = '', $recordId = null, array $oldValues = [], array $newValues = []): void
    {
        $ipAddress = self::getClientIP();
        $userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500);

        $stmt = Database::getInstance()->prepare(
            "INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $userId,
            $action,
            $table,
            $recordId,
            json_encode($oldValues),
            json_encode($newValues),
            $ipAddress,
            $userAgent
        ]);
    }

    public static function generateSlug(string $text): string
    {
        $text = preg_replace('~[^\pL\d]+~u', '-', $text);
        $text = trim($text, '-');
        $text = strtolower($text);
        $text = preg_replace('~[^-\w]+~', '', $text);
        return $text ?: 'n-a';
    }

    public static function generateUniqueSlug(string $baseSlug, string $table, string $column = 'slug'): string
    {
        $slug = $baseSlug;
        $counter = 2;
        while (true) {
            $stmt = Database::getInstance()->prepare("SELECT COUNT(*) FROM {$table} WHERE {$column} = ?");
            $stmt->execute([$slug]);
            if ($stmt->fetchColumn() == 0) {
                break;
            }
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }
        return $slug;
    }
}
