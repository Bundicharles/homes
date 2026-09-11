<?php

ApiRouter::add('GET', '/admin/users', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'users.view', true);

    $page = max(1, (int)($GLOBALS['_GET_PARAMS']['page'] ?? 1));
    $limit = max(1, min(50, (int)($GLOBALS['_GET_PARAMS']['limit'] ?? 15)));
    $offset = ($page - 1) * $limit;

    $where = [];
    $queryParams = [];

    if (!empty($GLOBALS['_GET_PARAMS']['search'])) {
        $where[] = "(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
        $search = '%' . $GLOBALS['_GET_PARAMS']['search'] . '%';
        $queryParams = array_merge($queryParams, [$search, $search, $search]);
    }
    if (!empty($GLOBALS['_GET_PARAMS']['role'])) {
        $where[] = "u.role_id = ?";
        $queryParams[] = $GLOBALS['_GET_PARAMS']['role'];
    }
    if (isset($GLOBALS['_GET_PARAMS']['status']) && !empty($GLOBALS['_GET_PARAMS']['status'])) {
        $where[] = "u.status = ?";
        $queryParams[] = $GLOBALS['_GET_PARAMS']['status'];
    }

    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $stmt = Database::getInstance()->prepare(
        "SELECT SQL_CALC_FOUND_ROWS u.id, u.name, u.email, u.phone, u.profile_image, u.status, u.email_verified, u.last_login, u.created_at, r.name as role_name, r.slug as role_slug
        FROM users u
        JOIN roles r ON u.role_id = r.id
        {$whereClause}
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?"
    );
    $stmt->execute([...$queryParams, $limit, $offset]);
    $users = $stmt->fetchAll();

    $totalStmt = Database::getInstance()->prepare("SELECT FOUND_ROWS()");
    $totalStmt->execute();
    $total = (int)$totalStmt->fetchColumn();

    Response::paginated($users, $page, $limit, $total);
}, 'permission', 'users.view');

ApiRouter::add('GET', '/admin/users/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'users.view', true);

    $stmt = Database::getInstance()->prepare(
        "SELECT u.id, u.name, u.email, u.phone, u.profile_image, u.status, u.email_verified, u.last_login, u.created_at, r.name as role_name, r.slug as role_slug
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?"
    );
    $stmt->execute([$params['id']]);
    $userData = $stmt->fetch();

    if (!$userData) {
        Response::notFound('User not found');
    }

    $stmt = Database::getInstance()->prepare("SELECT r.id, r.name, r.slug FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?");
    $stmt->execute([$params['id']]);
    $userData['roles'] = $stmt->fetchAll();

    Response::success($userData);
}, 'permission', 'users.view');

ApiRouter::add('POST', '/admin/users', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'users.create');

    $data = $GLOBALS['_INPUT'];

    if (!isset($data['role_id']) && isset($data['role'])) {
        $roleStmt = Database::getInstance()->prepare("SELECT id FROM roles WHERE slug = ?");
        $roleStmt->execute([$data['role']]);
        $roleRow = $roleStmt->fetch();
        if ($roleRow) {
            $data['role_id'] = $roleRow['id'];
        }
    }

    if (isset($data['is_active'])) {
        $data['status'] = $data['is_active'] ? 'active' : 'inactive';
    }

    $errors = Validation::validate($data, [
        'name' => ['required', 'min' => 2, 'max' => 255],
        'email' => ['required', 'email'],
        'password' => ['required', 'min' => 8],
        'role_id' => ['required'],
    ]);

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $stmt = Database::getInstance()->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([strtolower(trim($data['email']))]);
    if ($stmt->fetch()) {
        Response::error('Email already exists');
    }

    Database::getInstance()->prepare(
        "INSERT INTO users (role_id, name, email, phone, password_hash, email_verified, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?)"
    )->execute([
        $data['role_id'],
        Validation::sanitizeString($data['name']),
        strtolower(trim($data['email'])),
        $data['phone'] ?? null,
        Security::hashPassword($data['password']),
        $data['email_verified'] ?? 0,
        $data['status'] ?? 'active'
    ]);

    $userId = (int)Database::lastInsertId();

    if (isset($data['roles']) && is_array($data['roles'])) {
        $stmt = Database::getInstance()->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)");
        foreach ($data['roles'] as $roleId) {
            $stmt->execute([$userId, (int)$roleId]);
        }
    }

    Security::logAudit($user['id'], 'created_user', 'users', $userId);
    Response::success(['id' => $userId], 'User created successfully', 201);
}, 'permission', 'users.create');

ApiRouter::add('PUT', '/admin/users/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'users.edit');

    $data = $GLOBALS['_INPUT'];

    if (!isset($data['role_id']) && isset($data['role'])) {
        $roleStmt = Database::getInstance()->prepare("SELECT id FROM roles WHERE slug = ?");
        $roleStmt->execute([$data['role']]);
        $roleRow = $roleStmt->fetch();
        if ($roleRow) {
            $data['role_id'] = $roleRow['id'];
        }
    }

    if (!isset($data['status']) && isset($data['is_active'])) {
        $data['status'] = $data['is_active'] ? 'active' : 'inactive';
    }

    $updates = [];
    $updateParams = [];

    if (isset($data['name'])) {
        $updates[] = "name = ?";
        $updateParams[] = Validation::sanitizeString($data['name']);
    }
    if (isset($data['email'])) {
        $updates[] = "email = ?";
        $updateParams[] = strtolower(trim($data['email']));
    }
    if (isset($data['phone'])) {
        $updates[] = "phone = ?";
        $updateParams[] = Validation::formatPhoneNumber($data['phone']);
    }
    if (isset($data['status'])) {
        $updates[] = "status = ?";
        $updateParams[] = $data['status'];
    }
    if (isset($data['email_verified'])) {
        $updates[] = "email_verified = ?";
        $updateParams[] = $data['email_verified'] ? 1 : 0;
    }
    if (isset($data['password']) && strlen($data['password']) >= 8) {
        $updates[] = "password_hash = ?";
        $updateParams[] = Security::hashPassword($data['password']);
    }

    if (empty($updates)) {
        Response::error('No updates provided');
    }

    $updateParams[] = $params['id'];
    Database::getInstance()->prepare("UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?")->execute($updateParams);

    if (isset($data['role_id'])) {
        Database::getInstance()->prepare("UPDATE users SET role_id = ? WHERE id = ?")->execute([$data['role_id'], $params['id']]);
    }

    Security::logAudit($user['id'], 'updated_user', 'users', $params['id'], [], $data);
    Response::success(null, 'User updated successfully');
}, 'permission', 'users.edit');

ApiRouter::add('DELETE', '/admin/users/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'users.delete');

    if ((int)$params['id'] === $user['id']) {
        Response::error('Cannot delete your own account');
    }

    Database::getInstance()->prepare("DELETE FROM users WHERE id = ?")->execute([$params['id']]);
    Security::logAudit($user['id'], 'deleted_user', 'users', $params['id']);
    Response::success(null, 'User deleted');
}, 'permission', 'users.delete');
