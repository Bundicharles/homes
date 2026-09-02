<?php

ApiRouter::add('GET', '/pages/{slug}', function($params) {
    $stmt = Database::getInstance()->prepare("SELECT * FROM pages WHERE slug = ? AND status = 'published'");
    $stmt->execute([$params['slug']]);
    $page = $stmt->fetch();

    if (!$page) {
        Response::notFound('Page not found');
    }

    $stmt = Database::getInstance()->prepare("SELECT * FROM page_sections WHERE page_id = ? AND is_active = 1 ORDER BY sort_order");
    $stmt->execute([$page['id']]);
    $page['sections'] = $stmt->fetchAll();

    Response::success($page);
}, 'public');

ApiRouter::add('GET', '/admin/pages', function($params) {
    $stmt = Database::getInstance()->prepare("SELECT * FROM pages ORDER BY sort_order ASC, created_at DESC");
    $stmt->execute();
    Response::success($stmt->fetchAll());
}, 'permission', 'pages.view');

ApiRouter::add('GET', '/admin/pages/{id}', function($params) {
    $stmt = Database::getInstance()->prepare("SELECT * FROM pages WHERE id = ?");
    $stmt->execute([$params['id']]);
    $page = $stmt->fetch();

    if (!$page) {
        Response::notFound('Page not found');
    }

    $stmt = Database::getInstance()->prepare("SELECT * FROM page_sections WHERE page_id = ? ORDER BY sort_order");
    $stmt->execute([$page['id']]);
    $page['sections'] = $stmt->fetchAll();

    Response::success($page);
}, 'permission', 'pages.view');

ApiRouter::add('POST', '/admin/pages', function($params) {
    $user = Auth::requireAuth();
    $data = $GLOBALS['_INPUT'];
    $errors = Validation::validate($data, [
        'title' => ['required', 'min' => 2, 'max' => 255],
        'slug' => ['required'],
    ]);

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $slug = Security::generateUniqueSlug($data['slug'] ?: Security::generateSlug($data['title']), 'pages');
    $status = ($data['status'] ?? '') === 'published' || !empty($data['is_published']) ? 'published' : 'draft';

    Database::getInstance()->prepare(
        "INSERT INTO pages (title, slug, content, status, is_system, sort_order, show_in_menu, parent_id, meta_title, meta_description, meta_keywords)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )->execute([
        Validation::sanitizeString($data['title']),
        $slug,
        $data['content'] ?? '',
        $status,
        !empty($data['is_system']) ? 1 : 0,
        (int)($data['sort_order'] ?? 0),
        isset($data['show_in_menu']) ? ($data['show_in_menu'] ? 1 : 0) : 1,
        (int)($data['parent_id'] ?? 0),
        $data['meta_title'] ?? $data['title'],
        $data['meta_description'] ?? null,
        $data['meta_keywords'] ?? null,
    ]);

    $pageId = (int)Database::lastInsertId();
    Security::logAudit($user['id'], 'created_page', 'pages', $pageId);
    Response::success(['id' => $pageId, 'slug' => $slug], 'Page created successfully', 201);
}, 'permission', 'pages.create');

ApiRouter::add('PUT', '/admin/pages/{id}', function($params) {
    $user = Auth::requireAuth();
    $data = $GLOBALS['_INPUT'];

    $stmt = Database::getInstance()->prepare("SELECT * FROM pages WHERE id = ?");
    $stmt->execute([$params['id']]);
    $existing = $stmt->fetch();
    if (!$existing) {
        Response::notFound('Page not found');
    }

    $status = $existing['status'];
    if (isset($data['status'])) {
        $status = $data['status'] === 'published' ? 'published' : 'draft';
    } elseif (isset($data['is_published'])) {
        $status = $data['is_published'] ? 'published' : 'draft';
    }

    Database::getInstance()->prepare(
        "UPDATE pages SET title = ?, slug = ?, content = ?, status = ?, sort_order = ?,
        show_in_menu = ?, parent_id = ?, meta_title = ?, meta_description = ?, meta_keywords = ? WHERE id = ?"
    )->execute([
        Validation::sanitizeString($data['title'] ?? $existing['title']),
        $data['slug'] ?? $existing['slug'],
        $data['content'] ?? $existing['content'],
        $status,
        (int)($data['sort_order'] ?? $existing['sort_order']),
        isset($data['show_in_menu']) ? ($data['show_in_menu'] ? 1 : 0) : $existing['show_in_menu'],
        (int)($data['parent_id'] ?? $existing['parent_id']),
        $data['meta_title'] ?? $existing['meta_title'],
        $data['meta_description'] ?? $existing['meta_description'],
        $data['meta_keywords'] ?? $existing['meta_keywords'],
        $params['id'],
    ]);

    if (isset($data['sections']) && is_array($data['sections'])) {
        Database::getInstance()->prepare("DELETE FROM page_sections WHERE page_id = ?")->execute([$params['id']]);
        $insert = Database::getInstance()->prepare(
            "INSERT INTO page_sections (page_id, section_type, title, content, sort_order, is_active)
            VALUES (?, ?, ?, ?, ?, ?)"
        );
        foreach ($data['sections'] as $i => $section) {
            $content = $section['content'] ?? [];
            $insert->execute([
                $params['id'],
                $section['section_type'] ?? 'html',
                $section['title'] ?? null,
                is_string($content) ? $content : json_encode($content),
                $section['sort_order'] ?? $i,
                isset($section['is_active']) ? ($section['is_active'] ? 1 : 0) : 1,
            ]);
        }
    }

    Security::logAudit($user['id'], 'updated_page', 'pages', $params['id']);
    Response::success(null, 'Page updated successfully');
}, 'permission', 'pages.edit');

ApiRouter::add('DELETE', '/admin/pages/{id}', function($params) {
    $user = Auth::requireAuth();
    $stmt = Database::getInstance()->prepare("SELECT id, is_system FROM pages WHERE id = ?");
    $stmt->execute([$params['id']]);
    $page = $stmt->fetch();
    if (!$page) {
        Response::notFound('Page not found');
    }
    if (!empty($page['is_system'])) {
        Response::error('System pages cannot be deleted');
    }

    Database::getInstance()->prepare("DELETE FROM page_sections WHERE page_id = ?")->execute([$params['id']]);
    Database::getInstance()->prepare("DELETE FROM pages WHERE id = ?")->execute([$params['id']]);
    Security::logAudit($user['id'], 'deleted_page', 'pages', $params['id']);
    Response::success(null, 'Page deleted');
}, 'permission', 'pages.delete');
