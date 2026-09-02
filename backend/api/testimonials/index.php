<?php

ApiRouter::add('GET', '/testimonials', function($params) {
    $stmt = Database::getInstance()->query(
        "SELECT name, rating, title, content, property_id FROM testimonials WHERE status = 'approved' ORDER BY sort_order, created_at DESC"
    );
    Response::success($stmt->fetchAll());
}, 'public');

ApiRouter::add('GET', '/admin/testimonials', function($params) {
    $page = max(1, (int)($GLOBALS['_GET_PARAMS']['page'] ?? 1));
    $limit = max(1, min(50, (int)($GLOBALS['_GET_PARAMS']['limit'] ?? 15)));
    $offset = ($page - 1) * $limit;

    $where = [];
    $queryParams = [];

    if (!empty($GLOBALS['_GET_PARAMS']['status'])) {
        $where[] = "t.status = ?";
        $queryParams[] = $GLOBALS['_GET_PARAMS']['status'];
    }

    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $stmt = Database::getInstance()->prepare(
        "SELECT SQL_CALC_FOUND_ROWS t.*, u.name as created_by_name
        FROM testimonials t
        LEFT JOIN users u ON t.user_id = u.id
        {$whereClause}
        ORDER BY t.sort_order ASC, t.created_at DESC
        LIMIT ? OFFSET ?"
    );
    $stmt->execute([...$queryParams, $limit, $offset]);
    $testimonials = $stmt->fetchAll();

    $total = (int)Database::getInstance()->query("SELECT FOUND_ROWS()")->fetchColumn();
    Response::paginated($testimonials, $page, $limit, $total);
}, 'permission', 'testimonials.view');

ApiRouter::add('POST', '/admin/testimonials', function($params) {
    $user = Auth::requireAuth();
    $data = $GLOBALS['_INPUT'];
    $errors = Validation::validate($data, [
        'name' => ['required', 'min' => 2, 'max' => 255],
        'content' => ['required'],
    ]);

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $status = $data['status'] ?? (!empty($data['is_published']) ? 'approved' : 'pending');
    $maxSort = (int)Database::getInstance()->query("SELECT MAX(sort_order) FROM testimonials")->fetchColumn();

    Database::getInstance()->prepare(
        "INSERT INTO testimonials (user_id, name, email, phone, rating, title, content, property_id, status, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )->execute([
        $user['id'],
        Validation::sanitizeString($data['name']),
        $data['email'] ?? null,
        $data['phone'] ?? null,
        max(1, min(5, (int)($data['rating'] ?? 5))),
        $data['title'] ?? $data['role'] ?? null,
        $data['content'],
        $data['property_id'] ?? null,
        $status,
        $maxSort + 1,
    ]);

    $id = (int)Database::lastInsertId();
    Security::logAudit($user['id'], 'created_testimonial', 'testimonials', $id);
    Response::success(['id' => $id], 'Testimonial created successfully', 201);
}, 'permission', 'testimonials.create');

ApiRouter::add('PUT', '/admin/testimonials/{id}', function($params) {
    $user = Auth::requireAuth();
    $data = $GLOBALS['_INPUT'];
    $updates = [];
    $updateParams = [];

    foreach (['name', 'email', 'phone', 'title', 'content'] as $field) {
        if (isset($data[$field])) {
            $updates[] = "{$field} = ?";
            $updateParams[] = in_array($field, ['content', 'email'], true) ? $data[$field] : Validation::sanitizeString((string)$data[$field]);
        }
    }
    if (isset($data['role']) && !isset($data['title'])) {
        $updates[] = "title = ?";
        $updateParams[] = Validation::sanitizeString($data['role']);
    }
    if (isset($data['rating'])) {
        $updates[] = "rating = ?";
        $updateParams[] = max(1, min(5, (int)$data['rating']));
    }
    if (isset($data['status'])) {
        $updates[] = "status = ?";
        $updateParams[] = $data['status'];
    } elseif (isset($data['is_published'])) {
        $updates[] = "status = ?";
        $updateParams[] = $data['is_published'] ? 'approved' : 'pending';
    }
    if (isset($data['sort_order'])) {
        $updates[] = "sort_order = ?";
        $updateParams[] = (int)$data['sort_order'];
    }

    if (empty($updates)) {
        Response::error('No updates provided');
    }

    $updateParams[] = $params['id'];
    Database::getInstance()->prepare("UPDATE testimonials SET " . implode(', ', $updates) . " WHERE id = ?")->execute($updateParams);

    Security::logAudit($user['id'], 'updated_testimonial', 'testimonials', $params['id']);
    Response::success(null, 'Testimonial updated successfully');
}, 'permission', 'testimonials.edit');

ApiRouter::add('DELETE', '/admin/testimonials/{id}', function($params) {
    $user = Auth::requireAuth();
    Database::getInstance()->prepare("DELETE FROM testimonials WHERE id = ?")->execute([$params['id']]);
    Security::logAudit($user['id'], 'deleted_testimonial', 'testimonials', $params['id']);
    Response::success(null, 'Testimonial deleted');
}, 'permission', 'testimonials.delete');
