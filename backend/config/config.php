<?php
declare(strict_types=1);

class Config
{
    private static ?Config $instance = null;
    private array $config = [];

    private function __construct()
    {
        $envPaths = [
            __DIR__ . '/../.env',
            __DIR__ . '/../../.env',
            __DIR__ . '/.env'
        ];
        foreach ($envPaths as $envFile) {
            if (file_exists($envFile) && is_readable($envFile)) {
                $this->loadEnv($envFile);
                break;
            }
        }
        $this->loadDefaults();
    }

    public static function get(string $key, $default = null)
    {
        $instance = self::getInstance();
        return $instance->config[$key] ?? $default;
    }

    public static function getRequired(string $key): string
    {
        $value = self::get($key);
        if ($value === null) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => "Required environment variable {$key} is not set"]);
            exit;
        }
        return $value;
    }

    private static function getInstance(): Config
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function loadEnv(string $filePath): void
    {
        if (!is_readable($filePath)) {
            return;
        }
        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (str_starts_with($line, '#') || str_starts_with($line, '//')) {
                continue;
            }
            if (str_contains($line, '=')) {
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                if (str_starts_with($value, '"') && str_ends_with($value, '"')) {
                    $value = substr($value, 1, -1);
                } elseif (str_starts_with($value, "'") && str_ends_with($value, "'")) {
                    $value = substr($value, 1, -1);
                }
                if (isset($_ENV[$key])) {
                    continue;
                }
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
                putenv("{$key}={$value}");
            }
        }
    }

    private function loadDefaults(): void
    {
        $this->config = [
            'db_host' => $_ENV['DB_HOST'] ?? 'localhost',
            'db_port' => $_ENV['DB_PORT'] ?? '3306',
            'db_name' => $_ENV['DB_NAME'] ?? 'rmwugypy_homes',
            'db_user' => $_ENV['DB_USER'] ?? 'rmwugypy_homes',
            'db_pass' => $_ENV['DB_PASSWORD'] ?? 'Henry@2026',
            'db_charset' => 'utf8mb4',
            'jwt_secret' => $_ENV['JWT_SECRET'] ?? 'change-this-secret-key-in-production-' . bin2hex(random_bytes(16)),
            'jwt_algorithm' => 'HS256',
            'jwt_expiry' => $_ENV['JWT_EXPIRY'] ?? '7d',
            'session_name' => $_ENV['SESSION_NAME'] ?? 'real_estate_session',
            'session_lifetime' => (int)($_ENV['SESSION_LIFETIME'] ?? 1440),
            'session_secure' => filter_var($_ENV['SESSION_SECURE'] ?? 'false', FILTER_VALIDATE_BOOLEAN),
            'allowed_origins' => $_ENV['ALLOWED_ORIGINS'] ?? 'http://localhost:5173,http://localhost:3000',
            'upload_max_size' => (int)($_ENV['UPLOAD_MAX_SIZE'] ?? 10240),
            'upload_allowed_types' => $_ENV['UPLOAD_ALLOWED_TYPES'] ?? 'jpg,jpeg,png,gif,webp,avif,svg,pdf,doc,docx,xls,xlsx,txt,mp4,webm,mov,avi,mkv,mp3,wav',
            'base_url' => $_ENV['BASE_URL'] ?? 'http://localhost/homes/backend',
            'frontend_url' => $_ENV['FRONTEND_URL'] ?? 'http://localhost:5173',
            'smtp_host' => $_ENV['SMTP_HOST'] ?? '',
            'smtp_port' => (int)($_ENV['SMTP_PORT'] ?? 587),
            'smtp_username' => $_ENV['SMTP_USERNAME'] ?? '',
            'smtp_password' => $_ENV['SMTP_PASSWORD'] ?? '',
            'smtp_encryption' => $_ENV['SMTP_ENCRYPTION'] ?? 'tls',
            'smtp_from_name' => $_ENV['SMTP_FROM_NAME'] ?? 'Prime Realty Kenya',
            'smtp_from_email' => $_ENV['SMTP_FROM_EMAIL'] ?? 'info@realestate.co.ke',
        ];
    }
}
