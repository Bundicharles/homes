<?php
declare(strict_types=1);

class Response
{
    private static ?int $statusCode = 200;

    public static function send(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function success($data = [], string $message = '', int $statusCode = 200): void
    {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data
        ];
        if ($statusCode !== 200) {
            $response['status'] = $statusCode;
        }
        self::send($response, $statusCode);
    }

    public static function error(string $message = 'Unable to process request', array $errors = [], int $statusCode = 400): void
    {
        $response = [
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ];
        self::send($response, $statusCode);
    }

    public static function notFound(string $message = 'Resource not found'): void
    {
        self::error($message, [], 404);
    }

    public static function unauthorized(string $message = 'Unauthorized access'): void
    {
        self::error($message, [], 401);
    }

    public static function forbidden(string $message = 'Access denied'): void
    {
        self::error($message, [], 403);
    }

    public static function serverError(string $message = 'Internal server error'): void
    {
        self::error($message, [], 500);
    }

    public static function validationError(array $errors): void
    {
        self::error('Validation failed', $errors, 422);
    }

    public static function paginated(array $data, int $page, int $limit, int $total): void
    {
        $totalPages = ceil($total / $limit);
        self::success([
            'data' => $data,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => (int)$totalPages,
                'has_next' => $page < $totalPages,
                'has_prev' => $page > 1
            ]
        ]);
    }
}
