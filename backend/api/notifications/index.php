<?php

ApiRouter::add('GET', '/notifications', function($params) {
    $user = Auth::requireAuth();

    $page = max(1, (int)($GLOBALS['_GET_PARAMS']['page'] ?? 1));
    $limit = max(1, min(50, (int)($GLOBALS['_GET_PARAMS']['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;

    $stmt = Database::getInstance()->prepare(
        "SELECT id, type, title, message, reference_type, reference_id, is_read, created_at 
        FROM notifications WHERE user_id = ? 
        ORDER BY created_at DESC LIMIT ? OFFSET ?"
    );
    $stmt->execute([$user['id'], $limit, $offset]);
    $notifications = $stmt->fetchAll();

    $totalStmt = Database::getInstance()->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ?");
    $totalStmt->execute([$user['id']]);
    $total = (int)$totalStmt->fetchColumn();

    Response::paginated($notifications, $page, $limit, $total);
}, 'authenticated');

ApiRouter::add('GET', '/notifications/unread-count', function($params) {
    $user = Auth::requireAuth();
    $stmt = Database::getInstance()->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = FALSE");
    $stmt->execute([$user['id']]);
    Response::success(['count' => (int)$stmt->fetchColumn()]);
}, 'authenticated');

ApiRouter::add('PATCH', '/notifications/read', function($params) {
    $user = Auth::getCurrentUser();
    if ($user) {
        Database::getInstance()->prepare("UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE")->execute([$user['id']]);
    }
    Response::success(null, 'Notifications marked as read');
}, 'authenticated');

ApiRouter::add('PATCH', '/notifications/{id}/read', function($params) {
    $user = Auth::getCurrentUser();
    if ($user) {
        Database::getInstance()->prepare("UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?")->execute([$params['id'], $user['id']]);
    }
    Response::success(null, 'Notification marked as read');
}, 'authenticated');

ApiRouter::add('DELETE', '/notifications/{id}', function($params) {
    $user = Auth::getCurrentUser();
    if ($user) {
        Database::getInstance()->prepare("DELETE FROM notifications WHERE id = ? AND user_id = ?")->execute([$params['id'], $user['id']]);
    }
    Response::success(null, 'Notification deleted');
}, 'authenticated');

ApiRouter::add('POST', '/admin/notifications', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'settings.view', true);

    $data = $GLOBALS['_INPUT'];
    $stmt = Database::getInstance()->prepare(
        "INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id) VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $data['user_id'],
        $data['type'],
        $data['title'],
        $data['message'],
        $data['reference_type'] ?? null,
        $data['reference_id'] ?? null
    ]);

    Response::success(['id' => Database::lastInsertId()], 'Notification created', 201);
}, 'permission', 'settings.view');

ApiRouter::add('POST', '/viewing-requests', function($params) {
    $data = $GLOBALS['_INPUT'];
    $errors = Validation::validate($data, [
        'property_id' => ['required'],
        'name' => ['required', 'min' => 2],
        'email' => ['required', 'email'],
        'phone' => ['required', 'phone'],
        'preferred_date' => ['required'],
    ]);

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $user = Auth::getCurrentUser();
    $userId = $user ? $user['id'] : null;

    Database::beginTransaction();
    try {
        $stmt = Database::getInstance()->prepare(
            "INSERT INTO viewing_requests (property_id, user_id, name, email, phone, preferred_date, 
            preferred_time_start, preferred_time_end, message, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')"
        );
        $stmt->execute([
            $data['property_id'],
            $userId,
            Validation::sanitizeString($data['name']),
            strtolower(trim($data['email'])),
            Validation::formatPhoneNumber($data['phone']),
            $data['preferred_date'],
            $data['preferred_time_start'] ?? null,
            $data['preferred_time_end'] ?? null,
            Validation::sanitizeString($data['message'] ?? '')
        ]);

        $requestId = Database::lastInsertId();

        $admins = Database::getInstance()->query(
            "SELECT u.id FROM users u WHERE u.role_id IN (1,2,3,6) AND u.status = 'active'"
        );
        foreach ($admins as $admin) {
            Database::getInstance()->prepare(
                "INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id) 
                VALUES (?, 'viewing_request', 'New Viewing Request', ?, 'viewing', ?)"
            )->execute([
                $admin['id'],
                'A new viewing request has been submitted',
                $requestId
            ]);
        }

        Database::commit();
        Response::success(['id' => $requestId], 'Viewing request submitted successfully', 201);
    } catch (Exception $e) {
        Database::rollback();
        error_log('Viewing request error: ' . $e->getMessage());
        Response::serverError('Failed to submit viewing request');
    }
}, 'public');
