<?php

ApiRouter::add('GET', '/faqs', function($params) {
    $stmt = Database::getInstance()->query("SELECT * FROM faqs WHERE is_active = TRUE ORDER BY sort_order, created_at DESC");
    Response::success($stmt->fetchAll());
}, 'public');

ApiRouter::add('GET', '/admin/faqs', function($params) {
    $stmt = Database::getInstance()->prepare("SELECT * FROM faqs ORDER BY sort_order ASC, created_at DESC");
    $stmt->execute();
    Response::success($stmt->fetchAll());
}, 'permission', 'pages.view');

ApiRouter::add('POST', '/admin/faqs', function($params) {
    $user = Auth::requireAuth();
    $data = $GLOBALS['_INPUT'];
    $errors = Validation::validate($data, [
        'question' => ['required', 'min' => 3, 'max' => 500],
        'answer' => ['required'],
    ]);

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $maxSort = Database::getInstance()->query("SELECT MAX(sort_order) FROM faqs")->fetchColumn();
    $isActive = array_key_exists('is_active', $data)
        ? (!empty($data['is_active']) ? 1 : 0)
        : (isset($data['is_published']) ? ($data['is_published'] ? 1 : 0) : 1);

    Database::getInstance()->prepare(
        "INSERT INTO faqs (question, answer, category, is_active, sort_order) VALUES (?, ?, ?, ?, ?)"
    )->execute([
        Validation::sanitizeString($data['question']),
        $data['answer'],
        $data['category'] ?? 'general',
        $isActive,
        (int)$maxSort + 1,
    ]);

    $id = (int)Database::lastInsertId();
    Security::logAudit($user['id'], 'created_faq', 'faqs', $id);
    Response::success(['id' => $id], 'FAQ created successfully', 201);
}, 'permission', 'pages.edit');

ApiRouter::add('PUT', '/admin/faqs/{id}', function($params) {
    $user = Auth::requireAuth();
    $data = $GLOBALS['_INPUT'];
    $updates = [];
    $updateParams = [];

    foreach (['question', 'answer', 'category'] as $field) {
        if (isset($data[$field])) {
            $updates[] = "{$field} = ?";
            $updateParams[] = $field === 'answer' ? $data[$field] : Validation::sanitizeString($data[$field]);
        }
    }

    if (isset($data['is_active']) || isset($data['is_published'])) {
        $updates[] = "is_active = ?";
        $updateParams[] = !empty($data['is_active'] ?? $data['is_published']) ? 1 : 0;
    }
    if (isset($data['sort_order'])) {
        $updates[] = "sort_order = ?";
        $updateParams[] = (int)$data['sort_order'];
    }

    if (empty($updates)) {
        Response::error('No updates provided');
    }

    $updateParams[] = $params['id'];
    Database::getInstance()->prepare("UPDATE faqs SET " . implode(', ', $updates) . " WHERE id = ?")->execute($updateParams);

    Security::logAudit($user['id'], 'updated_faq', 'faqs', $params['id']);
    Response::success(null, 'FAQ updated successfully');
}, 'permission', 'pages.edit');

ApiRouter::add('DELETE', '/admin/faqs/{id}', function($params) {
    $user = Auth::requireAuth();
    Database::getInstance()->prepare("DELETE FROM faqs WHERE id = ?")->execute([$params['id']]);
    Security::logAudit($user['id'], 'deleted_faq', 'faqs', $params['id']);
    Response::success(null, 'FAQ deleted');
}, 'permission', 'pages.edit');
