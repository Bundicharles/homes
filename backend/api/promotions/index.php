<?php

ApiRouter::add('GET', '/promotions', function($params) {
    $now = date('Y-m-d H:i:s');
    $stmt = Database::getInstance()->prepare(
        "SELECT * FROM promotions 
        WHERE active = TRUE 
        AND (start_date IS NULL OR start_date <= ?) 
        AND (end_date IS NULL OR end_date >= ?)
        ORDER BY priority DESC, created_at DESC"
    );
    $stmt->execute([$now, $now]);
    $promotions = $stmt->fetchAll();

    foreach ($promotions as &$promo) {
        if ($promo['page_visibility']) {
            $promo['page_visibility'] = json_decode($promo['page_visibility'], true);
        }
    }

    Response::success($promotions);
}, 'public');

ApiRouter::add('GET', '/admin/promotions', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'promotions.view', true);

    $stmt = Database::getInstance()->query("SELECT * FROM promotions ORDER BY priority DESC, created_at DESC");
    Response::success($stmt->fetchAll());
}, 'permission', 'promotions.view');

ApiRouter::add('GET', '/admin/promotions/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'promotions.view', true);

    $stmt = Database::getInstance()->prepare("SELECT * FROM promotions WHERE id = ?");
    $stmt->execute([$params['id']]);
    $promotion = $stmt->fetch();

    if (!$promotion) {
        Response::notFound('Promotion not found');
    }

    if ($promotion['page_visibility']) {
        $promotion['page_visibility'] = json_decode($promotion['page_visibility'], true);
    }

    Response::success($promotion);
}, 'permission', 'promotions.view');

ApiRouter::add('POST', '/admin/promotions', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'promotions.create');

    $data = $GLOBALS['_INPUT'];
    $errors = Validation::validate($data, [
        'title' => ['required'],
        'display_type' => ['required'],
    ]);

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $stmt = Database::getInstance()->prepare(
        "INSERT INTO promotions (title, description, image, button_text, button_url, start_date, end_date, active, 
        display_type, display_frequency, frequency_value, position, priority, close_button, background_color, text_color, 
        page_visibility, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $data['title'],
        $data['description'] ?? null,
        $data['image'] ?? null,
        $data['button_text'] ?? null,
        $data['button_url'] ?? null,
        $data['start_date'] ?? null,
        $data['end_date'] ?? null,
        $data['active'] ? 1 : 0,
        $data['display_type'],
        $data['display_frequency'] ?? 'always',
        $data['frequency_value'] ?? 1,
        $data['position'] ?? 'top',
        $data['priority'] ?? 0,
        $data['close_button'] ? 1 : 0,
        $data['background_color'] ?? null,
        $data['text_color'] ?? null,
        isset($data['page_visibility']) ? json_encode($data['page_visibility']) : null,
        $user['id']
    ]);

    Security::logAudit($user['id'], 'created_promotion', 'promotions', (int)Database::lastInsertId());
    Response::success(['id' => Database::lastInsertId()], 'Promotion created successfully', 201);
}, 'permission', 'promotions.create');

ApiRouter::add('PUT', '/admin/promotions/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'promotions.edit');

    $data = $GLOBALS['_INPUT'];
    $stmt = Database::getInstance()->prepare(
        "UPDATE promotions SET title = ?, description = ?, image = ?, button_text = ?, button_url = ?, 
        start_date = ?, end_date = ?, active = ?, display_type = ?, display_frequency = ?, frequency_value = ?, 
        position = ?, priority = ?, close_button = ?, background_color = ?, text_color = ?, page_visibility = ? WHERE id = ?"
    );
    $stmt->execute([
        $data['title'],
        $data['description'] ?? null,
        $data['image'] ?? null,
        $data['button_text'] ?? null,
        $data['button_url'] ?? null,
        $data['start_date'] ?? null,
        $data['end_date'] ?? null,
        $data['active'] ? 1 : 0,
        $data['display_type'],
        $data['display_frequency'] ?? 'always',
        $data['frequency_value'] ?? 1,
        $data['position'] ?? 'top',
        $data['priority'] ?? 0,
        $data['close_button'] ? 1 : 0,
        $data['background_color'] ?? null,
        $data['text_color'] ?? null,
        isset($data['page_visibility']) ? json_encode($data['page_visibility']) : null,
        $params['id']
    ]);

    Security::logAudit($user['id'], 'updated_promotion', 'promotions', $params['id']);
    Response::success(null, 'Promotion updated successfully');
}, 'permission', 'promotions.edit');

ApiRouter::add('DELETE', '/admin/promotions/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'promotions.delete');

    Database::getInstance()->prepare("DELETE FROM promotions WHERE id = ?")->execute([$params['id']]);
    Security::logAudit($user['id'], 'deleted_promotion', 'promotions', $params['id']);
    Response::success(null, 'Promotion deleted');
}, 'permission', 'promotions.delete');

ApiRouter::add('POST', '/promotions/view', function($params) {
    $data = $GLOBALS['_INPUT'];
    $user = Auth::getCurrentUser();
    $userId = $user ? $user['id'] : null;

    Database::getInstance()->prepare(
        "INSERT INTO promotion_views (promotion_id, user_id, session_id, ip_address) VALUES (?, ?, ?, ?)"
    )->execute([
        $data['promotion_id'],
        $userId,
        session_id(),
        Security::getClientIP()
    ]);
} , 'public');

ApiRouter::add('POST', '/promotions/click', function($params) {
    $data = $GLOBALS['_INPUT'];
    $user = Auth::getCurrentUser();
    $userId = $user ? $user['id'] : null;

    Database::getInstance()->prepare(
        "INSERT INTO promotion_clicks (promotion_id, user_id, session_id, ip_address) VALUES (?, ?, ?, ?)"
    )->execute([
        $data['promotion_id'],
        $userId,
        session_id(),
        Security::getClientIP()
    ]);
}, 'public');
