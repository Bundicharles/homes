<?php

ApiRouter::add('POST', '/viewing-requests', function($params) {
    $data = $GLOBALS['_INPUT'];
    $errors = Validation::validate($data, [
        'property_id' => ['required'],
        'name' => ['required', 'min' => 2],
        'email' => ['required', 'email'],
        'preferred_date' => ['required'],
    ]);

    if (empty($data['phone']) || !Validation::isValidPhone((string)$data['phone'])) {
        $errors['phone'] = 'A valid phone number is required';
    }

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $user = Auth::getCurrentUser();
    $userId = $user ? (int)$user['id'] : null;

    $propStmt = Database::getInstance()->prepare("SELECT id, name, slug FROM properties WHERE id = ?");
    $propStmt->execute([$data['property_id']]);
    $property = $propStmt->fetch();

    if (!$property) {
        Response::error('Selected property not found', [], 404);
    }

    $timeStart = !empty($data['preferred_time_start']) ? $data['preferred_time_start'] : null;
    $timeEnd = !empty($data['preferred_time_end']) ? $data['preferred_time_end'] : null;

    if (empty($timeStart) && !empty($data['preferred_time'])) {
        $pt = strtolower(trim((string)$data['preferred_time']));
        if ($pt === 'morning') {
            $timeStart = '09:00:00';
            $timeEnd = '12:00:00';
        } elseif ($pt === 'afternoon') {
            $timeStart = '13:00:00';
            $timeEnd = '17:00:00';
        } elseif ($pt === 'evening') {
            $timeStart = '17:00:00';
            $timeEnd = '19:00:00';
        }
    }

    $formattedPhone = Validation::formatPhoneNumber((string)$data['phone']);

    Database::beginTransaction();
    try {
        $stmt = Database::getInstance()->prepare(
            "INSERT INTO viewing_requests (property_id, user_id, name, email, phone, preferred_date, 
            preferred_time_start, preferred_time_end, message, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')"
        );
        $stmt->execute([
            $property['id'],
            $userId,
            Validation::sanitizeString((string)$data['name']),
            strtolower(trim((string)$data['email'])),
            $formattedPhone,
            $data['preferred_date'],
            $timeStart,
            $timeEnd,
            Validation::sanitizeString((string)($data['message'] ?? ''))
        ]);

        $requestId = (int)Database::lastInsertId();

        $admins = Database::getInstance()->query(
            "SELECT u.id FROM users u WHERE u.role_id IN (1,2,3,6) AND u.status = 'active'"
        );
        foreach ($admins as $admin) {
            Database::getInstance()->prepare(
                "INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id) 
                VALUES (?, 'viewing_request', 'New Viewing Request', ?, 'viewing', ?)"
            )->execute([
                $admin['id'],
                "Viewing request for {$property['name']} from " . Validation::sanitizeString((string)$data['name']),
                $requestId
            ]);
        }

        Database::commit();
        Response::success(['id' => $requestId], 'Viewing request submitted successfully', 201);
    } catch (Exception $e) {
        Database::rollback();
        error_log('Viewing request error: ' . $e->getMessage());
        Response::serverError('Failed to submit viewing request: ' . $e->getMessage());
    }
}, 'public');

ApiRouter::add('GET', '/admin/viewing-requests', function($params) {
    $user = Auth::getCurrentUser();

    $page = max(1, (int)($GLOBALS['_GET_PARAMS']['page'] ?? 1));
    $limit = max(1, min(50, (int)($GLOBALS['_GET_PARAMS']['limit'] ?? 15)));
    $offset = ($page - 1) * $limit;

    $where = [];
    $queryParams = [];

    if (!empty($GLOBALS['_GET_PARAMS']['status']) && $GLOBALS['_GET_PARAMS']['status'] !== 'all') {
        $where[] = "LOWER(vr.status) = LOWER(?)";
        $queryParams[] = $GLOBALS['_GET_PARAMS']['status'];
    }
    if (!empty($GLOBALS['_GET_PARAMS']['agent_id']) && $GLOBALS['_GET_PARAMS']['agent_id'] !== 'all') {
        $where[] = "vr.assigned_agent = ?";
        $queryParams[] = $GLOBALS['_GET_PARAMS']['agent_id'];
    }
    if (!empty($GLOBALS['_GET_PARAMS']['search'])) {
        $where[] = "(vr.name LIKE ? OR vr.email LIKE ? OR vr.phone LIKE ? OR p.name LIKE ?)";
        $search = '%' . $GLOBALS['_GET_PARAMS']['search'] . '%';
        $queryParams = array_merge($queryParams, [$search, $search, $search, $search]);
    }

    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $stmt = Database::getInstance()->prepare(
        "SELECT SQL_CALC_FOUND_ROWS vr.*, 
                vr.admin_notes as agent_notes,
                COALESCE(u.name, vr.name) as customer_name, 
                COALESCE(u.email, vr.email) as customer_email, 
                COALESCE(u.phone, vr.phone) as customer_phone, 
                a.name as agent_name, 
                p.name as property_name, 
                p.slug as property_slug,
                p.location as property_location,
                p.price as property_price,
                p.currency as property_currency,
                (SELECT pi.filename FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = TRUE LIMIT 1) as primary_image
        FROM viewing_requests vr
        LEFT JOIN users u ON vr.user_id = u.id
        LEFT JOIN agents a ON vr.assigned_agent = a.id
        LEFT JOIN properties p ON vr.property_id = p.id
        {$whereClause}
        ORDER BY vr.created_at DESC
        LIMIT ? OFFSET ?"
    );
    $stmt->execute([...$queryParams, $limit, $offset]);
    $requests = $stmt->fetchAll();

    $totalStmt = Database::getInstance()->prepare("SELECT FOUND_ROWS()");
    $totalStmt->execute();
    $total = (int)$totalStmt->fetchColumn();

    Response::paginated($requests, $page, $limit, $total);
}, 'permission', 'viewings.view');

ApiRouter::add('GET', '/admin/viewing-requests/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'viewings.view', true);

    $stmt = Database::getInstance()->prepare(
        "SELECT vr.*, 
                vr.admin_notes as agent_notes,
                COALESCE(u.name, vr.name) as customer_name, 
                COALESCE(u.email, vr.email) as customer_email, 
                COALESCE(u.phone, vr.phone) as customer_phone, 
                a.name as agent_name, 
                p.name as property_name, 
                p.slug as property_slug,
                p.location as property_location,
                p.price as property_price,
                p.currency as property_currency
        FROM viewing_requests vr
        LEFT JOIN users u ON vr.user_id = u.id
        LEFT JOIN agents a ON vr.assigned_agent = a.id
        LEFT JOIN properties p ON vr.property_id = p.id
        WHERE vr.id = ?"
    );
    $stmt->execute([$params['id']]);
    $request = $stmt->fetch();

    if (!$request) {
        Response::notFound('Viewing request not found');
    }

    Response::success($request);
}, 'permission', 'viewings.view');

ApiRouter::add('PATCH', '/admin/viewing-requests/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'viewings.edit', true);

    $data = $GLOBALS['_INPUT'];
    $updates = [];
    $updateParams = [];

    if (isset($data['status'])) {
        $updates[] = "status = ?";
        $updateParams[] = $data['status'];
    }
    if (array_key_exists('assigned_agent', $data)) {
        $updates[] = "assigned_agent = ?";
        $updateParams[] = !empty($data['assigned_agent']) ? (int)$data['assigned_agent'] : null;
    }
    if (isset($data['admin_notes'])) {
        $updates[] = "admin_notes = ?";
        $updateParams[] = Validation::sanitizeString((string)$data['admin_notes']);
    } elseif (isset($data['agent_notes'])) {
        $updates[] = "admin_notes = ?";
        $updateParams[] = Validation::sanitizeString((string)$data['agent_notes']);
    } elseif (isset($data['notes'])) {
        $updates[] = "admin_notes = ?";
        $updateParams[] = Validation::sanitizeString((string)$data['notes']);
    }
    if (isset($data['preferred_date'])) {
        $updates[] = "preferred_date = ?";
        $updateParams[] = $data['preferred_date'];
    }
    if (isset($data['preferred_time_start'])) {
        $updates[] = "preferred_time_start = ?";
        $updateParams[] = $data['preferred_time_start'];
    }
    if (isset($data['preferred_time_end'])) {
        $updates[] = "preferred_time_end = ?";
        $updateParams[] = $data['preferred_time_end'];
    }
    if (isset($data['message'])) {
        $updates[] = "message = ?";
        $updateParams[] = Validation::sanitizeString((string)$data['message']);
    }

    if (!empty($updates)) {
        $updateParams[] = $params['id'];
        Database::getInstance()->prepare("UPDATE viewing_requests SET " . implode(', ', $updates) . " WHERE id = ?")->execute($updateParams);
    }

    Security::logAudit($user['id'], 'updated_viewing_request', 'viewing_requests', $params['id']);
    Response::success(null, 'Viewing request updated');
}, 'permission', 'viewings.edit');

ApiRouter::add('PUT', '/admin/viewing-requests/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'viewings.edit', true);

    $data = $GLOBALS['_INPUT'];
    $updates = [];
    $updateParams = [];

    if (isset($data['status'])) {
        $updates[] = "status = ?";
        $updateParams[] = $data['status'];
    }
    if (array_key_exists('assigned_agent', $data)) {
        $updates[] = "assigned_agent = ?";
        $updateParams[] = !empty($data['assigned_agent']) ? (int)$data['assigned_agent'] : null;
    }
    if (isset($data['admin_notes'])) {
        $updates[] = "admin_notes = ?";
        $updateParams[] = Validation::sanitizeString((string)$data['admin_notes']);
    } elseif (isset($data['agent_notes'])) {
        $updates[] = "admin_notes = ?";
        $updateParams[] = Validation::sanitizeString((string)$data['agent_notes']);
    } elseif (isset($data['notes'])) {
        $updates[] = "admin_notes = ?";
        $updateParams[] = Validation::sanitizeString((string)$data['notes']);
    }
    if (isset($data['preferred_date'])) {
        $updates[] = "preferred_date = ?";
        $updateParams[] = $data['preferred_date'];
    }
    if (isset($data['preferred_time_start'])) {
        $updates[] = "preferred_time_start = ?";
        $updateParams[] = $data['preferred_time_start'];
    }
    if (isset($data['preferred_time_end'])) {
        $updates[] = "preferred_time_end = ?";
        $updateParams[] = $data['preferred_time_end'];
    }
    if (isset($data['message'])) {
        $updates[] = "message = ?";
        $updateParams[] = Validation::sanitizeString((string)$data['message']);
    }

    if (!empty($updates)) {
        $updateParams[] = $params['id'];
        Database::getInstance()->prepare("UPDATE viewing_requests SET " . implode(', ', $updates) . " WHERE id = ?")->execute($updateParams);
    }

    Security::logAudit($user['id'], 'updated_viewing_request', 'viewing_requests', $params['id']);
    Response::success(null, 'Viewing request updated');
}, 'permission', 'viewings.edit');

ApiRouter::add('PUT', '/admin/viewing-requests/{id}/status', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'viewings.edit', true);

    $data = $GLOBALS['_INPUT'];
    if (!isset($data['status'])) {
        Response::error('Status is required');
    }

    Database::getInstance()->prepare("UPDATE viewing_requests SET status = ? WHERE id = ?")->execute([$data['status'], $params['id']]);
    Security::logAudit($user['id'], 'updated_viewing_request_status', 'viewing_requests', $params['id']);
    Response::success(null, 'Viewing request updated');
}, 'permission', 'viewings.edit');

ApiRouter::add('DELETE', '/admin/viewing-requests/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'viewings.edit', true);

    Database::getInstance()->prepare("DELETE FROM viewing_requests WHERE id = ?")->execute([$params['id']]);
    Security::logAudit($user['id'], 'deleted_viewing_request', 'viewing_requests', $params['id']);
    Response::success(null, 'Viewing request deleted');
}, 'permission', 'viewings.edit');

ApiRouter::add('GET', '/customer/viewings', function($params) {
    $user = Auth::requireAuth();

    $stmt = Database::getInstance()->prepare(
        "SELECT vr.*, p.name as property_name, p.slug as property_slug, p.location as property_location, p.price as property_price, p.currency as property_currency,
                (SELECT pi.filename FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = TRUE LIMIT 1) as primary_image,
                a.name as agent_name, a.phone as agent_phone
         FROM viewing_requests vr
         LEFT JOIN properties p ON vr.property_id = p.id
         LEFT JOIN agents a ON vr.assigned_agent = a.id
         WHERE vr.user_id = ? OR (vr.email = ? AND vr.email != '')
         ORDER BY vr.created_at DESC"
    );
    $stmt->execute([$user['id'], $user['email']]);
    $viewings = $stmt->fetchAll();

    Response::success($viewings);
}, 'authenticated');

