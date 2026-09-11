<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

// Buffer all output so an uncaught exception below can still emit a clean
// JSON 500 (instead of a blank/HTML 500 that is impossible to diagnose).
ob_start();

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../includes/security.php';
require_once __DIR__ . '/../includes/response.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/permissions.php';
require_once __DIR__ . '/../includes/validation.php';
require_once __DIR__ . '/../includes/upload.php';

Security::init();
Cors::init();
Cors::handlePreflight();

$method = $_SERVER['REQUEST_METHOD'];

// ---------------------------------------------------------------------------
// Resolve the API base path dynamically so the backend works at ANY hosting
// path depth (XAMPP: /homes/backend/api, TrueHost: /backend/api, subfolders...).
// SCRIPT_NAME points to this file, e.g. "/homes/backend/api/index.php".
// ---------------------------------------------------------------------------
$rawPath = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
$scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '');
$apiBase = rtrim(preg_replace('#/index\.php$#', '', $scriptName), '/'); // e.g. /homes/backend/api

if ($apiBase !== '' && strpos($rawPath, $apiBase) === 0) {
    $path = substr($rawPath, strlen($apiBase));
} else {
    // Fallback for legacy/edge server configurations
    $path = preg_replace('#^/homes/backend/api(/index\.php)?#', '', $rawPath);
    $path = preg_replace('#^/homes/backend(/index\.php)?#', '', $path);
    $path = preg_replace('#^/backend/api(/index\.php)?#', '', $path);
    $path = preg_replace('#^/backend(/index\.php)?#', '', $path);
}

$path = preg_replace('#^/index\.php#', '', $path);
$path = rtrim($path, '/');
$path = $path === '' ? '/' : $path;

$queryString = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_QUERY);
$GLOBALS['_GET_PARAMS'] = [];
parse_str($queryString ?? '', $GLOBALS['_GET_PARAMS']);

$rawInput = file_get_contents('php://input');
$GLOBALS['_INPUT'] = json_decode($rawInput, true) ?? [];

class ApiRouter
{
    private static array $routes = [];
    private static array $middleware = [];

    public static function add(string $method, string $path, callable $handler, string $auth = 'public', ?string $permission = null): void
    {
        self::$routes[] = compact('method', 'path', 'handler', 'auth', 'permission');
    }

    public static function dispatch(string $method, string $path): void
    {
        $pathSegments = array_values(array_filter(explode('/', trim($path, '/')), fn($s) => $s !== ''));

        // Pass 1: Prioritize exact static matches (routes without parameters)
        foreach (self::$routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            if (strpos($route['path'], '{') === false) {
                $routeSegments = array_values(array_filter(explode('/', trim($route['path'], '/')), fn($s) => $s !== ''));
                if ($routeSegments === $pathSegments) {
                    self::executeRoute($route, []);
                    return;
                }
            }
        }

        // Pass 2: Match parameterized routes
        foreach (self::$routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            $routeSegments = array_values(array_filter(explode('/', trim($route['path'], '/')), fn($s) => $s !== ''));

            if (count($routeSegments) !== count($pathSegments)) {
                continue;
            }

            $params = [];
            $match = true;
            for ($i = 0; $i < count($routeSegments); $i++) {
                if (isset($routeSegments[$i][0]) && $routeSegments[$i][0] === '{') {
                    $paramName = trim($routeSegments[$i], '{}');
                    $params[$paramName] = $pathSegments[$i];
                } elseif ($routeSegments[$i] !== $pathSegments[$i]) {
                    $match = false;
                    break;
                }
            }

            if ($match) {
                self::executeRoute($route, $params);
                return;
            }
        }

        Response::notFound('Endpoint not found');
    }

    private static function executeRoute(array $route, array $params): void
    {
        if ($route['auth'] !== 'public') {
            $user = Auth::getCurrentUser();
            if (!$user) {
                Response::unauthorized('Authentication required');
            }
            if ($route['auth'] === 'admin' && !Permissions::isStaff((int)$user['id'])) {
                Response::forbidden('Admin access required');
            }
            if ($route['auth'] === 'permission' && $route['permission']) {
                Permissions::requirePermission((int)$user['id'], $route['permission'], true);
            }
        }

        $handler = $route['handler'];
        $handler($params);
    }
}

require_once __DIR__ . '/auth/index.php';
require_once __DIR__ . '/properties/index.php';
require_once __DIR__ . '/properties/admin.php';
require_once __DIR__ . '/inquiries/index.php';
require_once __DIR__ . '/customers/index.php';
require_once __DIR__ . '/settings/index.php';
require_once __DIR__ . '/promotions/index.php';
require_once __DIR__ . '/notifications/index.php';
require_once __DIR__ . '/documents/index.php';
require_once __DIR__ . '/users/index.php';
require_once __DIR__ . '/agents/index.php';
require_once __DIR__ . '/roles/index.php';
require_once __DIR__ . '/messages/index.php';
require_once __DIR__ . '/analytics/index.php';
require_once __DIR__ . '/seo/index.php';
require_once __DIR__ . '/viewing_requests/index.php';
require_once __DIR__ . '/pages/index.php';
require_once __DIR__ . '/faqs/index.php';
require_once __DIR__ . '/testimonials/index.php';
require_once __DIR__ . '/menus/index.php';
require_once __DIR__ . '/media/index.php';

try {
    ApiRouter::dispatch($method, $path);
} catch (Throwable $e) {
    // Discard any partial output so the error response stays valid JSON.
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    // Full context goes to backend/logs/php_errors.log — never to the client.
    error_log('[API] ' . $method . ' ' . ($_SERVER['REQUEST_URI'] ?? '') . ' :: '
        . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode([
        'success' => false,
        'message' => 'Service temporarily unavailable. Please try again later.',
    ]);
}
