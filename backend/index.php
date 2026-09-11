<?php
/**
 * Fallback front controller for requests that reach /backend/ directly.
 * The real API lives under /backend/api/ (see api/index.php).
 */
http_response_code(404);
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');
echo json_encode([
    'success' => false,
    'message' => 'Not found. The API lives under /api — e.g. /backend/api/properties',
]);

