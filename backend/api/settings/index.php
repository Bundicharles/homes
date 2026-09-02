<?php

ApiRouter::add('GET', '/settings/public', function($params) {
    $stmt = Database::getInstance()->query("SELECT `key`, value FROM settings WHERE is_public = TRUE");
    $settings = $stmt->fetchAll();

    $result = [];
    foreach ($settings as $setting) {
        $result[$setting['key']] = $setting['value'];
    }

    $stmt = Database::getInstance()->query("SELECT platform, url, icon FROM social_links WHERE is_active = TRUE ORDER BY sort_order");
    $result['social_links'] = $stmt->fetchAll();

    $stmt = Database::getInstance()->query("SELECT id, name, slug, icon, sort_order FROM property_types WHERE is_active = TRUE ORDER BY sort_order");
    $result['property_types'] = $stmt->fetchAll();

    $stmt = Database::getInstance()->query("SELECT id, name, slug, icon FROM features ORDER BY sort_order");
    $result['features'] = $stmt->fetchAll();

    $stmt = Database::getInstance()->query("SELECT id, name, phone, email, bio, photo, registration_number, license_number, rating, properties_sold FROM agents WHERE status = 'active' ORDER BY properties_sold DESC");
    $result['agents'] = $stmt->fetchAll();

    $stmt = Database::getInstance()->query("SELECT id, title, slug, is_system, show_in_menu, parent_id FROM pages WHERE status = 'published' ORDER BY sort_order");
    $result['pages'] = $stmt->fetchAll();

    $stmt = Database::getInstance()->query("SELECT mi.title, mi.url, mi.target, mi.icon, mi.css_class FROM menu_items mi JOIN menus m ON mi.menu_id = m.id WHERE mi.is_active = TRUE AND m.is_active = TRUE AND m.location = 'main-menu' ORDER BY mi.sort_order");
    $result['main_menu'] = $stmt->fetchAll();

    $stmt = Database::getInstance()->query("SELECT * FROM earb_info WHERE is_active = TRUE ORDER BY sort_order");
    $result['earb_info'] = $stmt->fetchAll();

    $stmt = Database::getInstance()->query("SELECT * FROM pages WHERE slug = 'home' AND status = 'published' LIMIT 1");
    $homePage = $stmt->fetch();
    $result['home_page'] = $homePage;

    Response::success($result);
}, 'public');

ApiRouter::add('GET', '/pages/{slug}', function($params) {
    $stmt = Database::getInstance()->prepare("SELECT * FROM pages WHERE slug = ? AND status = 'published'");
    $stmt->execute([$params['slug']]);
    $page = $stmt->fetch();

    if (!$page) {
        Response::notFound('Page not found');
    }

    $stmt = Database::getInstance()->prepare("SELECT section_type, title, content FROM page_sections WHERE page_id = ? AND is_active = TRUE ORDER BY sort_order");
    $stmt->execute([$page['id']]);
    $page['sections'] = $stmt->fetchAll();

    Response::success($page);
}, 'public');

ApiRouter::add('GET', '/admin/settings', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'settings.view', true);

    $stmt = Database::getInstance()->query("SELECT * FROM settings ORDER BY group_name, sort_order");
    $settings = $stmt->fetchAll();

    $result = [];
    foreach ($settings as $setting) {
        $result[$setting['key']] = $setting;
    }

    Response::success($result);
}, 'permission', 'settings.view');

ApiRouter::add('PUT', '/admin/settings', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'settings.edit');

    $data = $GLOBALS['_INPUT'];
    if (!is_array($data)) {
        Response::error('Invalid settings data');
    }

    // Normalize input: accept both a { 'key' => 'value' } associative map
    // and a list of { 'key': ..., 'value': ... } objects.
    $normalized = [];
    foreach ($data as $index => $item) {
        if (is_array($item) && isset($item['key'])) {
            $normalized[$item['key']] = $item['value'] ?? '';
        } else {
            $normalized[$index] = $item;
        }
    }

    foreach ($normalized as $key => $value) {
        // Cast values to strings; keep the 'true'/'false' convention for booleans
        if (is_bool($value)) {
            $value = $value ? 'true' : 'false';
        } elseif (!is_scalar($value)) {
            $value = json_encode($value);
        }

        // `key` is a reserved word in MySQL/MariaDB and must be backtick-quoted.
        // Use INSERT ... ON DUPLICATE KEY UPDATE so missing keys are created too.
        Database::getInstance()->prepare(
            "INSERT INTO settings (`key`, `value`) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)"
        )->execute([(string)$key, (string)$value]);
    }

    Security::logAudit($user['id'], 'updated_settings', 'settings', null, [], $normalized);
    Response::success(null, 'Settings updated successfully');
}, 'permission', 'settings.edit');

ApiRouter::add('GET', '/admin/settings/{group}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'settings.view', true);

    $stmt = Database::getInstance()->prepare("SELECT * FROM settings WHERE group_name = ? ORDER BY sort_order");
    $stmt->execute([$params['group']]);
    $settings = $stmt->fetchAll();

    Response::success($settings);
}, 'permission', 'settings.view');

ApiRouter::add('GET', '/admin/social-links', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'settings.view', true);

    $stmt = Database::getInstance()->query("SELECT * FROM social_links ORDER BY sort_order");
    Response::success($stmt->fetchAll());
}, 'permission', 'settings.view');

ApiRouter::add('POST', '/admin/social-links', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'settings.edit');

    $data = $GLOBALS['_INPUT'];
    $stmt = Database::getInstance()->prepare(
        "INSERT INTO social_links (platform, url, icon, sort_order, is_active) VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $data['platform'],
        $data['url'],
        $data['icon'] ?? null,
        $data['sort_order'] ?? 0,
        $data['is_active'] ? 1 : 0
    ]);

    Security::logAudit($user['id'], 'created_social_link', 'social_links', (int)Database::lastInsertId());
    Response::success(['id' => Database::lastInsertId()], 'Social link created', 201);
}, 'permission', 'settings.edit');

ApiRouter::add('PUT', '/admin/social-links/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'settings.edit');

    $data = $GLOBALS['_INPUT'];
    $stmt = Database::getInstance()->prepare(
        "UPDATE social_links SET platform = ?, url = ?, icon = ?, sort_order = ?, is_active = ? WHERE id = ?"
    );
    $stmt->execute([
        $data['platform'],
        $data['url'],
        $data['icon'] ?? null,
        $data['sort_order'] ?? 0,
        $data['is_active'] ? 1 : 0,
        $params['id']
    ]);

    Security::logAudit($user['id'], 'updated_social_link', 'social_links', $params['id']);
    Response::success(null, 'Social link updated');
}, 'permission', 'settings.edit');

ApiRouter::add('DELETE', '/admin/social-links/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'settings.edit');

    Database::getInstance()->prepare("DELETE FROM social_links WHERE id = ?")->execute([$params['id']]);
    Security::logAudit($user['id'], 'deleted_social_link', 'social_links', $params['id']);
    Response::success(null, 'Social link deleted');
}, 'permission', 'settings.edit');

ApiRouter::add('GET', '/admin/earb', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'settings.view', true);

    $stmt = Database::getInstance()->query("SELECT * FROM earb_info ORDER BY sort_order");
    Response::success($stmt->fetchAll());
}, 'permission', 'settings.view');

ApiRouter::add('PUT', '/admin/earb', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'earb.edit');

    $data = $GLOBALS['_INPUT'];
    foreach ($data as $item) {
        if (isset($item['id'])) {
            Database::getInstance()->prepare("UPDATE earb_info SET display_name = ?, value = ?, field_type = ?, sort_order = ?, is_active = ? WHERE id = ?")->execute([
                $item['display_name'], $item['value'], $item['field_type'], $item['sort_order'], $item['is_active'] ? 1 : 0, $item['id']
            ]);
        } else {
            Database::getInstance()->prepare("INSERT INTO earb_info (key_name, display_name, value, field_type, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)")->execute([
                $item['key_name'], $item['display_name'], $item['value'], $item['field_type'], $item['sort_order'], $item['is_active'] ? 1 : 0
            ]);
        }
    }

    Security::logAudit($user['id'], 'updated_earb_info', 'earb_info');
    Response::success(null, 'EARB information updated');
}, 'permission', 'earb.edit');

ApiRouter::add('POST', '/upload', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'media.upload');

    if (!isset($_FILES['file'])) {
        Response::error('No file uploaded');
    }

    $directory = $GLOBALS['_INPUT']['directory'] ?? 'media';
    $allowedTypes = explode(',', Config::get('upload_allowed_types', 'jpg,jpeg,png,gif,webp,avif,pdf,doc,docx,xls,xlsx'));
    $maxSize = (int)Config::get('upload_max_size', 10);

    $result = Upload::uploadFile($_FILES['file'], $directory, $allowedTypes);
    if (!$result['success']) {
        Response::error($result['message']);
    }

    $stmt = Database::getInstance()->prepare(
        "INSERT INTO media (filename, original_name, file_path, file_size, mime_type, width, height, alt_text, caption, title, description, uploaded_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $result['filename'],
        $_FILES['file']['name'],
        $result['file_path'],
        $result['file_size'],
        $result['mime_type'],
        $result['dimensions'] ? explode('x', $result['dimensions'])[0] : null,
        $result['dimensions'] ? explode('x', $result['dimensions'])[1] : null,
        $GLOBALS['_INPUT']['alt_text'] ?? null,
        $GLOBALS['_INPUT']['caption'] ?? null,
        $GLOBALS['_INPUT']['title'] ?? null,
        $GLOBALS['_INPUT']['description'] ?? null,
        $user['id']
    ]);

    Security::logAudit($user['id'], 'uploaded_file', 'media', (int)Database::lastInsertId());
    Response::success($result, 'File uploaded successfully', 201);
}, 'permission', 'media.upload');

ApiRouter::add('GET', '/admin/media', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'media.view', true);

    $page = max(1, (int)($GLOBALS['_GET_PARAMS']['page'] ?? 1));
    $limit = max(1, min(100, (int)($GLOBALS['_GET_PARAMS']['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;

    $where = [];
    $queryParams = [];

    if (!empty($GLOBALS['_GET_PARAMS']['search'])) {
        $where[] = "(m.filename LIKE ? OR m.original_name LIKE ? OR m.alt_text LIKE ? OR m.title LIKE ?)";
        $search = '%' . $GLOBALS['_GET_PARAMS']['search'] . '%';
        $queryParams = array_merge($queryParams, [$search, $search, $search, $search]);
    }
    if (!empty($GLOBALS['_GET_PARAMS']['type'])) {
        $where[] = "m.mime_type LIKE ?";
        $queryParams[] = $GLOBALS['_GET_PARAMS']['type'] . '%';
    }

    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $stmt = Database::getInstance()->prepare(
        "SELECT SQL_CALC_FOUND_ROWS m.*, u.name as uploaded_by_name 
        FROM media m 
        LEFT JOIN users u ON m.uploaded_by = u.id
        {$whereClause}
        ORDER BY m.uploaded_at DESC 
        LIMIT ? OFFSET ?"
    );
    $stmt->execute([...$queryParams, $limit, $offset]);
    $media = $stmt->fetchAll();

    $totalStmt = Database::getInstance()->prepare("SELECT FOUND_ROWS()");
    $totalStmt->execute();
    $total = (int)$totalStmt->fetchColumn();

    Response::paginated($media, $page, $limit, $total);
}, 'permission', 'media.view');

ApiRouter::add('DELETE', '/admin/media/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'media.delete');

    $stmt = Database::getInstance()->prepare("SELECT file_path FROM media WHERE id = ?");
    $stmt->execute([$params['id']]);
    $media = $stmt->fetch();

    if (!$media) {
        Response::notFound('Media not found');
    }

    Upload::deleteFile($media['file_path']);
    Database::getInstance()->prepare("DELETE FROM media WHERE id = ?")->execute([$params['id']]);

    Security::logAudit($user['id'], 'deleted_media', 'media', $params['id']);
    Response::success(null, 'Media deleted');
}, 'permission', 'media.delete');

ApiRouter::add('PUT', '/admin/media/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'media.edit');

    $data = $GLOBALS['_INPUT'];
    $stmt = Database::getInstance()->prepare(
        "UPDATE media SET alt_text = ?, caption = ?, title = ?, description = ? WHERE id = ?"
    );
    $stmt->execute([
        $data['alt_text'] ?? null,
        $data['caption'] ?? null,
        $data['title'] ?? null,
        $data['description'] ?? null,
        $params['id']
    ]);

    Response::success(null, 'Media metadata updated');
}, 'permission', 'media.edit');
