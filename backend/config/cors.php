<?php
declare(strict_types=1);

Config::get('allowed_origins');

class Cors
{
    private static array $allowedOrigins = [];

    public static function init(): void
    {
        self::$allowedOrigins = array_filter(
            array_map('trim', explode(',', Config::get('allowed_origins', 'http://localhost:5173')))
        );

        $origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';

        if (self::isOriginAllowed($origin)) {
            header("Access-Control-Allow-Origin: {$origin}");
        } elseif (self::isOriginAllowed($_SERVER['HTTP_ORIGIN'] ?? '')) {
            // Fallback for direct origin
            $origin = rtrim($_SERVER['HTTP_ORIGIN'] ?? '', '/');
            header("Access-Control-Allow-Origin: {$origin}");
        }

        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token, X-Admin-Token');
        header('Access-Control-Expose-Headers: X-CSRF-Token, X-Total-Count');
        header('Access-Control-Max-Age: 86400');
    }

    public static function isOriginAllowed(string $origin): bool
    {
        if (empty($origin)) {
            return false;
        }
        $origin = rtrim($origin, '/');

        // Automatically allow same-host requests
        $originHost = parse_url($origin, PHP_URL_HOST);
        $serverHost = $_SERVER['HTTP_HOST'] ?? '';
        if (str_contains($serverHost, ':')) {
            $serverHost = explode(':', $serverHost)[0];
        }
        if ($originHost && $serverHost && strcasecmp($originHost, $serverHost) === 0) {
            return true;
        }

        foreach (self::$allowedOrigins as $allowed) {
            $allowed = rtrim($allowed, '/');
            if ($origin === $allowed) {
                return true;
            }
        }
        return false;
    }

    public static function handlePreflight(): void
    {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
