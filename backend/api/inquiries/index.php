<?php

ApiRouter::add('POST', '/inquiries', function($params) {
    $data = $GLOBALS['_INPUT'];
    $errors = Validation::validate($data, [
        'name' => ['required', 'min' => 2, 'max' => 255],
        'email' => ['required', 'email'],
        'phone' => ['required', 'phone'],
        'message' => ['required', 'min' => 10],
    ]);

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $user = Auth::getCurrentUser();
    $userId = $user ? $user['id'] : null;

    Database::beginTransaction();
    try {
        $stmt = Database::getInstance()->prepare(
            "INSERT INTO inquiries (user_id, property_id, name, email, phone, subject, message, status, source) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Unread', ?)"
        );
        $stmt->execute([
            $userId,
            $data['property_id'] ?? null,
            Validation::sanitizeString($data['name']),
            strtolower(trim($data['email'])),
            Validation::formatPhoneNumber($data['phone']),
            $data['subject'] ?? 'Property Inquiry',
            Validation::sanitizeString($data['message']),
            $data['source'] ?? 'website'
        ]);

        $inquiryId = Database::lastInsertId();

        $stmt = Database::getInstance()->prepare(
            "INSERT INTO inquiry_messages (inquiry_id, sender_id, sender_type, message) VALUES (?, ?, ?, ?)"
        );
        $senderType = $user ? ($user['role_slug'] === 'customer' ? 'customer' : 'admin') : 'customer';
        $stmt->execute([$inquiryId, $userId, $senderType, Validation::sanitizeString($data['message'])]);

        $admins = Database::getInstance()->query(
            "SELECT u.id FROM users u WHERE u.role_id IN (1,2,3,6) AND u.status = 'active'"
        );
        foreach ($admins as $admin) {
            Database::getInstance()->prepare(
                "INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id) VALUES (?, 'new_inquiry', 'New Inquiry Received', ?, 'inquiry', ?)"
            )->execute([$admin['id'], 'A new inquiry has been received regarding property inquiry', $inquiryId]);
        }

        $smtpConfig = [
            'host' => Config::get('smtp_host'),
            'port' => Config::get('smtp_port'),
            'username' => Config::get('smtp_username'),
            'password' => Config::get('smtp_password'),
            'encryption' => Config::get('smtp_encryption'),
            'from_name' => Config::get('smtp_from_name'),
            'from_email' => Config::get('smtp_from_email'),
        ];

        Database::commit();
        Response::success(['inquiry_id' => $inquiryId], 'Inquiry submitted successfully', 201);
    } catch (Exception $e) {
        Database::rollback();
        error_log('Inquiry creation error: ' . $e->getMessage());
        Response::serverError('Failed to submit inquiry');
    }
}, 'public');

ApiRouter::add('GET', '/admin/inquiries', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'messages.view', true);

    $page = max(1, (int)($GLOBALS['_GET_PARAMS']['page'] ?? 1));
    $limit = max(1, min(50, (int)($GLOBALS['_GET_PARAMS']['limit'] ?? 15)));
    $offset = ($page - 1) * $limit;

    $where = [];
    $queryParams = [];

    if (!empty($GLOBALS['_GET_PARAMS']['status'])) {
        $where[] = "i.status = ?";
        $queryParams[] = $GLOBALS['_GET_PARAMS']['status'];
    }
    if (!empty($GLOBALS['_GET_PARAMS']['search'])) {
        $where[] = "(i.name LIKE ? OR i.email LIKE ? OR i.subject LIKE ?)";
        $search = '%' . $GLOBALS['_GET_PARAMS']['search'] . '%';
        $queryParams = array_merge($queryParams, [$search, $search, $search]);
    }
    if (isset($GLOBALS['_GET_PARAMS']['unread']) && $GLOBALS['_GET_PARAMS']['unread'] === 'true') {
        $where[] = "i.status = 'Unread'";
    }

    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $stmt = Database::getInstance()->prepare(
        "SELECT SQL_CALC_FOUND_ROWS 
            i.id, i.property_id, i.name, i.email, i.phone, i.subject, i.message, i.status, 
            i.assigned_to, i.source, i.created_at, i.updated_at,
            p.name as property_name, p.slug as property_slug,
            u.name as assigned_agent_name,
            (SELECT COUNT(*) FROM inquiry_messages WHERE inquiry_id = i.id) as message_count,
            (SELECT COUNT(*) FROM inquiry_messages im WHERE im.inquiry_id = i.id AND im.sender_id != i.assigned_to AND im.created_at > COALESCE(i.updated_at, i.created_at)) as unread_count
        FROM inquiries i
        LEFT JOIN properties p ON i.property_id = p.id
        LEFT JOIN users u ON i.assigned_to = u.id
        {$whereClause}
        ORDER BY i.created_at DESC
        LIMIT ? OFFSET ?"
    );
    $stmt->execute([...$queryParams, $limit, $offset]);
    $inquiries = $stmt->fetchAll();

    $totalStmt = Database::getInstance()->prepare("SELECT FOUND_ROWS()");
    $totalStmt->execute();
    $total = (int)$totalStmt->fetchColumn();

    Response::paginated($inquiries, $page, $limit, $total);
}, 'permission', 'messages.view');

ApiRouter::add('GET', '/admin/inquiries/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'messages.view', true);

    $stmt = Database::getInstance()->prepare(
        "SELECT i.*, p.name as property_name, p.slug as property_slug, p.price, p.currency,
        u.name as assigned_agent_name
        FROM inquiries i
        LEFT JOIN properties p ON i.property_id = p.id
        LEFT JOIN users u ON i.assigned_to = u.id
        WHERE i.id = ?"
    );
    $stmt->execute([$params['id']]);
    $inquiry = $stmt->fetch();

    if (!$inquiry) {
        Response::notFound('Inquiry not found');
    }

    $stmt = Database::getInstance()->prepare(
        "SELECT im.*, u.name as sender_name, r.name as role_name 
        FROM inquiry_messages im
        LEFT JOIN users u ON im.sender_id = u.id
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE im.inquiry_id = ?
        ORDER BY im.created_at ASC"
    );
    $stmt->execute([$params['id']]);
    $inquiry['messages'] = $stmt->fetchAll();

    Database::getInstance()->prepare("UPDATE inquiries SET status = 'Read' WHERE id = ? AND status = 'Unread'")->execute([$params['id']]);

    Response::success($inquiry);
}, 'permission', 'messages.view');

ApiRouter::add('PATCH', '/admin/inquiries/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'messages.reply');

    $data = $GLOBALS['_INPUT'];
    $updates = [];
    $params_update = [];

    if (isset($data['status'])) {
        $updates[] = "status = ?";
        $params_update[] = $data['status'];
    }
    if (isset($data['assigned_to'])) {
        $updates[] = "assigned_to = ?";
        $params_update[] = $data['assigned_to'];
    }
    if (isset($data['subject'])) {
        $updates[] = "subject = ?";
        $params_update[] = Validation::sanitizeString($data['subject']);
    }

    if (empty($updates)) {
        Response::error('No updates provided');
    }

    $params_update[] = $params['id'];
    $sql = "UPDATE inquiries SET " . implode(', ', $updates) . " WHERE id = ?";
    Database::getInstance()->prepare($sql)->execute($params_update);

    if (isset($data['status'])) {
        Security::logAudit($user['id'], 'changed_inquiry_status', 'inquiries', $params['id'], [], ['status' => $data['status']]);
    }

    Response::success(null, 'Inquiry updated successfully');
}, 'permission', 'messages.reply');

ApiRouter::add('POST', '/admin/inquiries/{id}/messages', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'messages.reply');

    $data = $GLOBALS['_INPUT'];
    $errors = Validation::validate($data, ['message' => ['required']]);

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    Database::getInstance()->prepare(
        "INSERT INTO inquiry_messages (inquiry_id, sender_id, sender_type, message, is_internal_note) VALUES (?, ?, 'agent', ?, ?)"
    )->execute([$params['id'], $user['id'], Validation::sanitizeString($data['message']), $data['is_internal_note'] ?? false ? 1 : 0]);

    $status = $data['update_status'] ?? null;
    if ($status) {
        Database::getInstance()->prepare("UPDATE inquiries SET status = ? WHERE id = ?")->execute([$status, $params['id']]);
    } else {
        Database::getInstance()->prepare("UPDATE inquiries SET status = 'In Progress' WHERE id = ? AND status = 'Unread'")->execute([$params['id']]);
    }

    Database::getInstance()->prepare("UPDATE inquiries SET updated_at = NOW() WHERE id = ?")->execute([$params['id']]);

    if (empty($data['is_internal_note'])) {
        $ownerStmt = Database::getInstance()->prepare("SELECT user_id, email FROM inquiries WHERE id = ?");
        $ownerStmt->execute([$params['id']]);
        $inquiry = $ownerStmt->fetch();
        if ($inquiry && !empty($inquiry['user_id'])) {
            Database::getInstance()->prepare(
                "INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id) VALUES (?, 'inquiry_admin_reply', 'New reply on your inquiry', ?, 'inquiry', ?)"
            )->execute([$inquiry['user_id'], 'You have a new message regarding inquiry #' . $params['id'], $params['id']]);
        }
    }

    Security::logAudit($user['id'], 'replied_to_inquiry', 'inquiries', $params['id']);
    Response::success(null, 'Message sent');
}, 'permission', 'messages.reply');

ApiRouter::add('GET', '/admin/inquiries/stats', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'messages.view', true);

    $stats = Database::getInstance()->query(
        "SELECT status, COUNT(*) as count FROM inquiries GROUP BY status"
    );

    $result = [];
    foreach ($stats as $stat) {
        $result[$stat['status']] = (int)$stat['count'];
    }

    Response::success($result);
}, 'permission', 'messages.view');

ApiRouter::add('PUT', '/admin/inquiries/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'messages.reply');

    $data = $GLOBALS['_INPUT'];
    $updates = [];
    $params_update = [];

    if (isset($data['status'])) {
        $updates[] = "status = ?";
        $params_update[] = $data['status'];
    }
    if (isset($data['assigned_to'])) {
        $updates[] = "assigned_to = ?";
        $params_update[] = $data['assigned_to'];
    }
    if (isset($data['subject'])) {
        $updates[] = "subject = ?";
        $params_update[] = Validation::sanitizeString($data['subject']);
    }

    if (!empty($updates)) {
        $params_update[] = $params['id'];
        $sql = "UPDATE inquiries SET " . implode(', ', $updates) . " WHERE id = ?";
        Database::getInstance()->prepare($sql)->execute($params_update);
    }

    Security::logAudit($user['id'], 'updated_inquiry', 'inquiries', $params['id']);
    Response::success(null, 'Inquiry updated successfully');
}, 'permission', 'messages.reply');

ApiRouter::add('DELETE', '/admin/inquiries/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'messages.delete');

    Database::getInstance()->prepare("DELETE FROM inquiry_messages WHERE inquiry_id = ?")->execute([$params['id']]);
    Database::getInstance()->prepare("DELETE FROM inquiries WHERE id = ?")->execute([$params['id']]);
    Security::logAudit($user['id'], 'deleted_inquiry', 'inquiries', $params['id']);
    Response::success(null, 'Inquiry deleted');
}, 'permission', 'messages.delete');

ApiRouter::add('GET', '/customer/inquiries', function($params) {
    $user = Auth::requireAuth();

    $stmt = Database::getInstance()->prepare(
        "SELECT i.*, p.name as property_name, p.slug as property_slug, p.location, p.price, p.currency,
                (SELECT pi.filename FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = TRUE LIMIT 1) as primary_image,
                (SELECT COUNT(*) FROM inquiry_messages im WHERE im.inquiry_id = i.id) as message_count
         FROM inquiries i
         LEFT JOIN properties p ON i.property_id = p.id
         WHERE i.user_id = ? OR (i.email = ? AND i.email != '')
         ORDER BY i.created_at DESC"
    );
    $stmt->execute([$user['id'], $user['email']]);
    $inquiries = $stmt->fetchAll();

    Response::success($inquiries);
}, 'authenticated');

ApiRouter::add('GET', '/customer/inquiries/{id}', function($params) {
    $user = Auth::requireAuth();

    $stmt = Database::getInstance()->prepare(
        "SELECT i.*, p.name as property_name, p.slug as property_slug, p.location, p.price, p.currency,
                (SELECT pi.filename FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = TRUE LIMIT 1) as primary_image
         FROM inquiries i
         LEFT JOIN properties p ON i.property_id = p.id
         WHERE i.id = ? AND (i.user_id = ? OR i.email = ?)"
    );
    $stmt->execute([$params['id'], $user['id'], $user['email']]);
    $inquiry = $stmt->fetch();

    if (!$inquiry) {
        Response::notFound('Inquiry not found');
    }

    $msgStmt = Database::getInstance()->prepare(
        "SELECT im.*, u.name as sender_name, r.name as role_name
         FROM inquiry_messages im
         LEFT JOIN users u ON im.sender_id = u.id
         LEFT JOIN roles r ON u.role_id = r.id
         WHERE im.inquiry_id = ? AND (im.is_internal_note = 0 OR im.is_internal_note IS NULL)
         ORDER BY im.created_at ASC"
    );
    $msgStmt->execute([$params['id']]);
    $inquiry['messages'] = $msgStmt->fetchAll();

    Response::success($inquiry);
}, 'authenticated');

ApiRouter::add('POST', '/customer/inquiries/{id}/messages', function($params) {
    $user = Auth::requireAuth();
    $data = $GLOBALS['_INPUT'];

    $errors = Validation::validate($data, ['message' => ['required', 'min' => 1, 'max' => 5000]]);
    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $stmt = Database::getInstance()->prepare(
        "SELECT id, user_id, assigned_to, status FROM inquiries WHERE id = ? AND (user_id = ? OR email = ?)"
    );
    $stmt->execute([$params['id'], $user['id'], $user['email']]);
    $inquiry = $stmt->fetch();

    if (!$inquiry) {
        Response::notFound('Inquiry not found');
    }

    Database::getInstance()->prepare(
        "INSERT INTO inquiry_messages (inquiry_id, sender_id, sender_type, message) VALUES (?, ?, 'customer', ?)"
    )->execute([$params['id'], $user['id'], Validation::sanitizeString($data['message'])]);

    Database::getInstance()->prepare("UPDATE inquiries SET status = 'In Progress', updated_at = NOW() WHERE id = ?")
        ->execute([$params['id']]);

    $notifyStmt = Database::getInstance()->prepare(
        "SELECT u.id FROM users u WHERE u.role_id IN (1,2,3,6) AND u.status = 'active'"
    );
    $notifyStmt->execute();
    foreach ($notifyStmt->fetchAll() as $admin) {
        Database::getInstance()->prepare(
            "INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id) VALUES (?, 'inquiry_customer_reply', 'Customer replied', ?, 'inquiry', ?)"
        )->execute([$admin['id'], $user['name'] . ' replied to inquiry #' . $params['id'], $params['id']]);
    }

    if (!empty($inquiry['assigned_to'])) {
        Database::getInstance()->prepare(
            "INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id) VALUES (?, 'inquiry_customer_reply', 'Customer replied', ?, 'inquiry', ?)"
        )->execute([$inquiry['assigned_to'], $user['name'] . ' replied to inquiry #' . $params['id'], $params['id']]);
    }

    Response::success(null, 'Reply sent');
}, 'authenticated');

