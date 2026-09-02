<?php

ApiRouter::add('GET', '/admin/agents', function($params) {
    $user = Auth::getCurrentUser();

    $page = max(1, (int)($GLOBALS['_GET_PARAMS']['page'] ?? 1));
    $limit = max(1, min(50, (int)($GLOBALS['_GET_PARAMS']['limit'] ?? 15)));
    $offset = ($page - 1) * $limit;

    $where = [];
    $queryParams = [];

    if (!empty($GLOBALS['_GET_PARAMS']['search'])) {
        $where[] = "(a.name LIKE ? OR a.email LIKE ? OR a.phone LIKE ?)";
        $search = '%' . $GLOBALS['_GET_PARAMS']['search'] . '%';
        $queryParams = array_merge($queryParams, [$search, $search, $search]);
    }

    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $stmt = Database::getInstance()->prepare(
        "SELECT SQL_CALC_FOUND_ROWS a.* FROM agents a {$whereClause} ORDER BY a.created_at DESC LIMIT ? OFFSET ?"
    );
    $stmt->execute([...$queryParams, $limit, $offset]);
    $agents = $stmt->fetchAll();

    $totalStmt = Database::getInstance()->prepare("SELECT FOUND_ROWS()");
    $totalStmt->execute();
    $total = (int)$totalStmt->fetchColumn();

    Response::paginated($agents, $page, $limit, $total);
}, 'permission', 'agents.view');

ApiRouter::add('GET', '/admin/agents/{id}', function($params) {
    $user = Auth::getCurrentUser();

    $stmt = Database::getInstance()->prepare("SELECT * FROM agents WHERE id = ?");
    $stmt->execute([$params['id']]);
    $agent = $stmt->fetch();

    if (!$agent) {
        Response::notFound('Agent not found');
    }

    Response::success($agent);
}, 'permission', 'agents.view');

ApiRouter::add('POST', '/admin/agents', function($params) {
    $user = Auth::getCurrentUser();

    $data = $GLOBALS['_INPUT'];
    $errors = Validation::validate($data, [
        'name' => ['required', 'min' => 2, 'max' => 255],
        'email' => ['required', 'email'],
        'phone' => ['required'],
    ]);

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $photo = null;
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $result = Upload::uploadImage($_FILES['photo']);
        if ($result['success']) {
            $photo = $result['file_path'];
        }
    }

    Database::getInstance()->prepare(
        "INSERT INTO agents (name, photo, phone, email, bio, registration_number, credentials, license_number, license_expiry, specialization, properties_sold, rating, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )->execute([
        Validation::sanitizeString($data['name']),
        $photo,
        Validation::formatPhoneNumber($data['phone']),
        strtolower(trim($data['email'])),
        $data['bio'] ?? null,
        $data['registration_number'] ?? null,
        isset($data['credentials']) ? json_encode($data['credentials']) : null,
        $data['license_number'] ?? null,
        $data['license_expiry'] ?? null,
        $data['specialization'] ?? null,
        $data['properties_sold'] ?? 0,
        $data['rating'] ?? 0.0,
        $data['status'] ?? 'inactive'
    ]);

    $id = (int)Database::lastInsertId();
    Security::logAudit($user['id'], 'created_agent', 'agents', $id);
    Response::success(['id' => $id], 'Agent created successfully', 201);
}, 'permission', 'agents.create');

ApiRouter::add('PUT', '/admin/agents/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'agents.edit');

    $data = $GLOBALS['_INPUT'];
    $updates = [];
    $updateParams = [];

    foreach (['name', 'phone', 'email', 'bio', 'registration_number', 'credentials', 'license_number', 'license_expiry', 'specialization'] as $field) {
        if (isset($data[$field])) {
            $updates[] = "{$field} = ?";
            if ($field === 'email') {
                $updateParams[] = strtolower(trim($data[$field]));
            } elseif ($field === 'phone') {
                $updateParams[] = Validation::formatPhoneNumber($data[$field]);
            } elseif ($field === 'credentials') {
                $updateParams[] = json_encode($data[$field]);
            } else {
                $updateParams[] = Validation::sanitizeString($data[$field]);
            }
        }
    }

    if (isset($data['properties_sold'])) {
        $updates[] = "properties_sold = ?";
        $updateParams[] = (int)$data['properties_sold'];
    }
    if (isset($data['rating'])) {
        $updates[] = "rating = ?";
        $updateParams[] = $data['rating'];
    }
    if (isset($data['status'])) {
        $updates[] = "status = ?";
        $updateParams[] = $data['status'];
    }

    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $result = Upload::uploadImage($_FILES['photo']);
        if ($result['success']) {
            $updates[] = "photo = ?";
            $updateParams[] = $result['file_path'];
        }
    }

    if (empty($updates)) {
        Response::error('No updates provided');
    }

    $updateParams[] = $params['id'];
    Database::getInstance()->prepare("UPDATE agents SET " . implode(', ', $updates) . " WHERE id = ?")->execute($updateParams);

    Security::logAudit($user['id'], 'updated_agent', 'agents', $params['id']);
    Response::success(null, 'Agent updated successfully');
}, 'permission', 'agents.edit');

ApiRouter::add('DELETE', '/admin/agents/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'agents.delete');

    Database::getInstance()->prepare("DELETE FROM agents WHERE id = ?")->execute([$params['id']]);
    Security::logAudit($user['id'], 'deleted_agent', 'agents', $params['id']);
    Response::success(null, 'Agent deleted');
}, 'permission', 'agents.delete');
