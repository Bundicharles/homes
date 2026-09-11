<?php
/**
 * Prime Realty Kenya - Root Entry Point
 *
 * Serves the frontend Single Page Application (SPA) for navigation requests.
 * For static-asset requests (js, css, manifest, images…) we return a bare 404
 * so the browser does NOT receive an HTML document that could be mistaken
 * for a script (which causes MIME-type errors).
 */

declare(strict_types=1);

$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

// If the request is for a static asset extension, never serve HTML.
$assetExtensions = ['js', 'mjs', 'css', 'json', 'webmanifest', 'svg', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'ico', 'woff', 'woff2', 'ttf', 'eot', 'map', 'txt', 'xml'];
$extension = strtolower(pathinfo($requestPath, PATHINFO_EXTENSION));
if (in_array($extension, $assetExtensions, true)) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Not Found';
    exit;
}

// 1. If index.html exists in root (e.g. deployed to public_html)
if (file_exists(__DIR__ . '/index.html')) {
    header('Content-Type: text/html; charset=utf-8');
    readfile(__DIR__ . '/index.html');
    exit;
}

// 2. If dist/index.html exists (fallback if assets were only built to dist)
if (file_exists(__DIR__ . '/dist/index.html')) {
    header('Content-Type: text/html; charset=utf-8');
    readfile(__DIR__ . '/dist/index.html');
    exit;
}

// Fallback message if build hasn't been created yet
http_response_code(503);
echo "<!DOCTYPE html><html><head><title>App Initializing</title></head><body style='font-family:sans-serif;text-align:center;padding:50px;'>";
echo "<h2>Prime Realty Kenya</h2><p>Frontend assets not found. Please run <code>npm run build</code> or deploy build files.</p>";
echo "</body></html>";

