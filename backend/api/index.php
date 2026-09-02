<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

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
$rawPath = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
$path = preg_replace('#^/homes/backend/api(/index\.php)?#', '', $rawPath);
$path = preg_replace('#^/homes/backend(/index\.php)?#', '', $path);
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

        foreach (self::$routes as $route) {
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

            if ($match && $route['method'] === $method) {
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
require_once __DIR__ . '/menu/index.php';

ApiRouter::dispatch($method, $path);
