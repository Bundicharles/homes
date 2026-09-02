<?php

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
}, 'permission', 'viewing_requests.view');

ApiRouter::add('GET', '/admin/viewing-requests/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'viewing_requests.view', true);

    $stmt = Database::getInstance()->prepare(
        "SELECT vr.*, 
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
}, 'permission', 'viewing_requests.view');

ApiRouter::add('PATCH', '/admin/viewing-requests/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'viewing_requests.edit');

    $data = $GLOBALS['_INPUT'];
    $updates = [];
    $updateParams = [];

    if (isset($data['status'])) {
        $updates[] = "status = ?";
        $updateParams[] = $data['status'];
    }
    if (isset($data['assigned_agent'])) {
        $updates[] = "assigned_agent = ?";
        $updateParams[] = !empty($data['assigned_agent']) ? (int)$data['assigned_agent'] : null;
    }
    if (isset($data['agent_notes'])) {
        $updates[] = "agent_notes = ?";
        $updateParams[] = Validation::sanitizeString($data['agent_notes']);
    }
    if (isset($data['notes'])) {
        $updates[] = "agent_notes = ?";
        $updateParams[] = Validation::sanitizeString($data['notes']);
    }
    if (isset($data['preferred_date'])) {
        $updates[] = "preferred_date = ?";
        $updateParams[] = $data['preferred_date'];
    }

    if (!empty($updates)) {
        $updateParams[] = $params['id'];
        Database::getInstance()->prepare("UPDATE viewing_requests SET " . implode(', ', $updates) . " WHERE id = ?")->execute($updateParams);
    }

    Security::logAudit($user['id'], 'updated_viewing_request', 'viewing_requests', $params['id']);
    Response::success(null, 'Viewing request updated');
}, 'permission', 'viewing_requests.edit');

ApiRouter::add('PUT', '/admin/viewing-requests/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'viewing_requests.edit');

    $data = $GLOBALS['_INPUT'];
    $updates = [];
    $updateParams = [];

    foreach (['status', 'assigned_agent', 'agent_notes', 'preferred_date', 'preferred_time_start', 'preferred_time_end', 'message'] as $field) {
        if (isset($data[$field])) {
            $updates[] = "{$field} = ?";
            if ($field === 'assigned_agent') {
                $updateParams[] = !empty($data[$field]) ? (int)$data[$field] : null;
            } elseif (in_array($field, ['agent_notes', 'message'], true)) {
                $updateParams[] = Validation::sanitizeString((string)$data[$field]);
            } else {
                $updateParams[] = $data[$field];
            }
        }
    }

    if (!empty($updates)) {
        $updateParams[] = $params['id'];
        Database::getInstance()->prepare("UPDATE viewing_requests SET " . implode(', ', $updates) . " WHERE id = ?")->execute($updateParams);
    }

    Security::logAudit($user['id'], 'updated_viewing_request', 'viewing_requests', $params['id']);
    Response::success(null, 'Viewing request updated');
}, 'permission', 'viewing_requests.edit');

ApiRouter::add('PUT', '/admin/viewing-requests/{id}/status', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'viewing_requests.edit');

    $data = $GLOBALS['_INPUT'];
    if (!isset($data['status'])) {
        Response::error('Status is required');
    }

    Database::getInstance()->prepare("UPDATE viewing_requests SET status = ? WHERE id = ?")->execute([$data['status'], $params['id']]);
    Security::logAudit($user['id'], 'updated_viewing_request_status', 'viewing_requests', $params['id']);
    Response::success(null, 'Viewing request updated');
}, 'permission', 'viewing_requests.edit');

ApiRouter::add('DELETE', '/admin/viewing-requests/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'viewing_requests.edit');

    Database::getInstance()->prepare("DELETE FROM viewing_requests WHERE id = ?")->execute([$params['id']]);
    Security::logAudit($user['id'], 'deleted_viewing_request', 'viewing_requests', $params['id']);
    Response::success(null, 'Viewing request deleted');
}, 'permission', 'viewing_requests.edit');

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

