<?php

ApiRouter::add('GET', '/admin/menus', function($params) {
    $stmt = Database::getInstance()->prepare("SELECT * FROM menus ORDER BY name ASC");
    $stmt->execute();
    $menus = $stmt->fetchAll();

    foreach ($menus as &$menu) {
        $itemsStmt = Database::getInstance()->prepare("SELECT * FROM menu_items WHERE menu_id = ? ORDER BY sort_order ASC");
        $itemsStmt->execute([$menu['id']]);
        $menu['items'] = $itemsStmt->fetchAll();
    }

    Response::success($menus);
}, 'permission', 'pages.view');

ApiRouter::add('GET', '/admin/menus/{id}', function($params) {
    $stmt = Database::getInstance()->prepare("SELECT * FROM menus WHERE id = ?");
    $stmt->execute([$params['id']]);
    $menu = $stmt->fetch();

    if (!$menu) {
        Response::notFound('Menu not found');
    }

    $itemsStmt = Database::getInstance()->prepare("SELECT * FROM menu_items WHERE menu_id = ? ORDER BY sort_order ASC");
    $itemsStmt->execute([$params['id']]);
    $menu['items'] = $itemsStmt->fetchAll();

    Response::success($menu);
}, 'permission', 'pages.view');

ApiRouter::add('POST', '/admin/menus', function($params) {
    $user = Auth::requireAuth();
    $data = $GLOBALS['_INPUT'];
    $errors = Validation::validate($data, [
        'name' => ['required', 'min' => 2, 'max' => 100],
    ]);

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $slug = Security::generateUniqueSlug($data['slug'] ?? Security::generateSlug($data['name']), 'menus');

    Database::getInstance()->prepare(
        "INSERT INTO menus (name, slug, location, is_active) VALUES (?, ?, ?, ?)"
    )->execute([
        Validation::sanitizeString($data['name']),
        $slug,
        $data['location'] ?? 'header',
        isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1,
    ]);

    $menuId = (int)Database::lastInsertId();
    Security::logAudit($user['id'], 'created_menu', 'menus', $menuId);
    Response::success(['id' => $menuId], 'Menu created successfully', 201);
}, 'permission', 'pages.edit');

ApiRouter::add('PUT', '/admin/menus/{id}', function($params) {
    $user = Auth::requireAuth();
    $data = $GLOBALS['_INPUT'];
    $updates = [];
    $updateParams = [];

    if (isset($data['name'])) {
        $updates[] = "name = ?";
        $updateParams[] = Validation::sanitizeString($data['name']);
    }
    if (isset($data['slug'])) {
        $updates[] = "slug = ?";
        $updateParams[] = $data['slug'];
    }
    if (isset($data['location'])) {
        $updates[] = "location = ?";
        $updateParams[] = $data['location'];
    }
    if (isset($data['is_active'])) {
        $updates[] = "is_active = ?";
        $updateParams[] = $data['is_active'] ? 1 : 0;
    }

    if (!empty($updates)) {
        $updateParams[] = $params['id'];
        Database::getInstance()->prepare("UPDATE menus SET " . implode(', ', $updates) . " WHERE id = ?")->execute($updateParams);
    }

    if (isset($data['items']) && is_array($data['items'])) {
        Database::getInstance()->prepare("DELETE FROM menu_items WHERE menu_id = ?")->execute([$params['id']]);
        $stmt = Database::getInstance()->prepare(
            "INSERT INTO menu_items (menu_id, title, url, target, sort_order, parent_id, is_active, icon, css_class)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        foreach ($data['items'] as $i => $item) {
            $stmt->execute([
                $params['id'],
                $item['title'] ?? $item['label'] ?? 'Item',
                $item['url'] ?? '/',
                $item['target'] ?? '_self',
                $item['sort_order'] ?? $i,
                $item['parent_id'] ?? 0,
                isset($item['is_active']) ? ($item['is_active'] ? 1 : 0) : 1,
                $item['icon'] ?? null,
                $item['css_class'] ?? null,
            ]);
        }
    }

    Security::logAudit($user['id'], 'updated_menu', 'menus', $params['id']);
    Response::success(null, 'Menu updated successfully');
}, 'permission', 'pages.edit');

ApiRouter::add('DELETE', '/admin/menus/{id}', function($params) {
    $user = Auth::requireAuth();
    Database::getInstance()->prepare("DELETE FROM menu_items WHERE menu_id = ?")->execute([$params['id']]);
    Database::getInstance()->prepare("DELETE FROM menus WHERE id = ?")->execute([$params['id']]);
    Security::logAudit($user['id'], 'deleted_menu', 'menus', $params['id']);
    Response::success(null, 'Menu deleted');
}, 'permission', 'pages.edit');
