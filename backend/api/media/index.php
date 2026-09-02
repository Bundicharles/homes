<?php

ApiRouter::add('POST', '/admin/upload', function($params) {
    $user = Auth::requireAuth();
    if (empty($_FILES['file'])) {
        Response::error('No file uploaded');
    }

    $directory = preg_replace('/[^a-z0-9_\-\/]/i', '', $_POST['directory'] ?? 'media') ?: 'media';
    $result = Upload::uploadFile($_FILES['file'], $directory);

    if (!$result['success']) {
        Response::error($result['message']);
    }

    $width = null;
    $height = null;
    if (!empty($result['dimensions']) && str_contains((string)$result['dimensions'], 'x')) {
        [$width, $height] = array_map('intval', explode('x', $result['dimensions'], 2));
    }

    Database::getInstance()->prepare(
        "INSERT INTO media (filename, original_name, file_path, file_size, mime_type, width, height, alt_text, caption, title, description, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )->execute([
        $result['filename'],
        $_FILES['file']['name'] ?? $result['filename'],
        $result['file_path'],
        $result['file_size'],
        $result['mime_type'],
        $width,
        $height,
        $_POST['alt_text'] ?? null,
        $_POST['caption'] ?? null,
        $_POST['title'] ?? null,
        $_POST['description'] ?? null,
        $user['id'],
    ]);

    $id = (int)Database::lastInsertId();
    Security::logAudit($user['id'], 'uploaded_media', 'media', $id);
    Response::success([
        'id' => $id,
        'filename' => $result['filename'],
        'file_path' => $result['file_path'],
        'url' => '/homes/backend/' . $result['file_path'],
    ], 'File uploaded', 201);
}, 'permission', 'settings.edit');

ApiRouter::add('GET', '/admin/media', function($params) {
    $page = max(1, (int)($GLOBALS['_GET_PARAMS']['page'] ?? 1));
    $limit = max(1, min(50, (int)($GLOBALS['_GET_PARAMS']['limit'] ?? 24)));
    $offset = ($page - 1) * $limit;

    $stmt = Database::getInstance()->prepare(
        "SELECT SQL_CALC_FOUND_ROWS * FROM media ORDER BY uploaded_at DESC LIMIT ? OFFSET ?"
    );
    $stmt->execute([$limit, $offset]);
    $items = $stmt->fetchAll();
    $total = (int)Database::getInstance()->query("SELECT FOUND_ROWS()")->fetchColumn();

    Response::paginated($items, $page, $limit, $total);
}, 'permission', 'settings.view');

ApiRouter::add('PUT', '/admin/media/{id}', function($params) {
    $user = Auth::requireAuth();
    $data = $GLOBALS['_INPUT'];
    $updates = [];
    $updateParams = [];

    foreach (['alt_text', 'caption', 'title', 'description'] as $field) {
        if (isset($data[$field])) {
            $updates[] = "{$field} = ?";
            $updateParams[] = $data[$field];
        }
    }

    if (empty($updates)) {
        Response::error('No updates provided');
    }

    $updateParams[] = $params['id'];
    Database::getInstance()->prepare("UPDATE media SET " . implode(', ', $updates) . " WHERE id = ?")->execute($updateParams);
    Security::logAudit($user['id'], 'updated_media', 'media', $params['id']);
    Response::success(null, 'Media updated');
}, 'permission', 'settings.edit');

ApiRouter::add('DELETE', '/admin/media/{id}', function($params) {
    $user = Auth::requireAuth();
    $stmt = Database::getInstance()->prepare("SELECT file_path FROM media WHERE id = ?");
    $stmt->execute([$params['id']]);
    $row = $stmt->fetch();
    if (!$row) {
        Response::notFound('Media not found');
    }

    $fullPath = __DIR__ . '/../../' . $row['file_path'];
    if (is_file($fullPath)) {
        @unlink($fullPath);
    }

    Database::getInstance()->prepare("DELETE FROM media WHERE id = ?")->execute([$params['id']]);
    Security::logAudit($user['id'], 'deleted_media', 'media', $params['id']);
    Response::success(null, 'Media deleted');
}, 'permission', 'settings.edit');
