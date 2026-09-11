<?php

ApiRouter::add('GET', '/admin/customers', function($params) {
    $user = Auth::getCurrentUser();

    $page = max(1, (int)($GLOBALS['_GET_PARAMS']['page'] ?? 1));
    $limit = max(1, min(50, (int)($GLOBALS['_GET_PARAMS']['limit'] ?? 15)));
    $offset = ($page - 1) * $limit;

    $where = ["r.slug = 'customer'"];
    $queryParams = [];

    if (!empty($GLOBALS['_GET_PARAMS']['search'])) {
        $where[] = "(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
        $search = '%' . $GLOBALS['_GET_PARAMS']['search'] . '%';
        $queryParams = array_merge($queryParams, [$search, $search, $search]);
    }

    $whereClause = 'WHERE ' . implode(' AND ', $where);

    $stmt = Database::getInstance()->prepare(
        "SELECT SQL_CALC_FOUND_ROWS u.id, u.name, u.email, u.phone, u.profile_image, u.status, u.email_verified, u.last_login, u.created_at,
        COUNT(DISTINCT i.id) as inquiry_count, COUNT(DISTINCT f.id) as favorite_count, COUNT(DISTINCT vr.id) as viewing_count
        FROM users u
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN inquiries i ON i.user_id = u.id
        LEFT JOIN favorites f ON f.user_id = u.id
        LEFT JOIN viewing_requests vr ON vr.user_id = u.id
        {$whereClause}
        GROUP BY u.id
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?"
    );
    $stmt->execute([...$queryParams, $limit, $offset]);
    $customers = $stmt->fetchAll();

    $totalStmt = Database::getInstance()->prepare("SELECT FOUND_ROWS()");
    $totalStmt->execute();
    $total = (int)$totalStmt->fetchColumn();

    Response::paginated($customers, $page, $limit, $total);
}, 'permission', 'customers.view');

ApiRouter::add('GET', '/admin/customers/{id}', function($params) {
    $user = Auth::getCurrentUser();

    $stmt = Database::getInstance()->prepare(
        "SELECT u.id, u.name, u.email, u.phone, u.profile_image, u.status, u.email_verified, u.last_login, u.created_at
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ? AND r.slug = 'customer'"
    );
    $stmt->execute([$params['id']]);
    $customer = $stmt->fetch();

    if (!$customer) {
        Response::notFound('Customer not found');
    }

    // Inquiries
    $inqStmt = Database::getInstance()->prepare(
        "SELECT i.*, p.name as property_name, p.slug as property_slug 
         FROM inquiries i 
         LEFT JOIN properties p ON i.property_id = p.id 
         WHERE i.user_id = ? OR (i.email = ? AND i.email != '') 
         ORDER BY i.created_at DESC"
    );
    $inqStmt->execute([$customer['id'], $customer['email']]);
    $customer['inquiries'] = $inqStmt->fetchAll();

    // Viewings
    $viewStmt = Database::getInstance()->prepare(
        "SELECT vr.*, p.name as property_name, p.slug as property_slug, a.name as agent_name 
         FROM viewing_requests vr 
         LEFT JOIN properties p ON vr.property_id = p.id 
         LEFT JOIN agents a ON vr.assigned_agent = a.id 
         WHERE vr.user_id = ? OR (vr.email = ? AND vr.email != '') 
         ORDER BY vr.created_at DESC"
    );
    $viewStmt->execute([$customer['id'], $customer['email']]);
    $customer['viewings'] = $viewStmt->fetchAll();

    // Favorites
    $favStmt = Database::getInstance()->prepare(
        "SELECT f.id as favorite_id, f.created_at as favorited_at, p.*,
                (SELECT pi.filename FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = TRUE LIMIT 1) as primary_image
         FROM favorites f 
         JOIN properties p ON f.property_id = p.id 
         WHERE f.user_id = ? 
         ORDER BY f.created_at DESC"
    );
    $favStmt->execute([$customer['id']]);
    $customer['favorites'] = $favStmt->fetchAll();

    Response::success($customer);
}, 'permission', 'customers.view');

ApiRouter::add('PUT', '/admin/customers/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'customers.edit');

    $data = $GLOBALS['_INPUT'];
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

    if (!empty($updates)) {
        $updateParams[] = $params['id'];
        Database::getInstance()->prepare("UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?")->execute($updateParams);
        Security::logAudit($user['id'], 'updated_customer', 'users', $params['id']);
    }

    Response::success(null, 'Customer updated successfully');
}, 'permission', 'customers.edit');

ApiRouter::add('PATCH', '/admin/customers/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'customers.edit');

    $data = $GLOBALS['_INPUT'];
    $updates = [];
    $updateParams = [];

    if (isset($data['status'])) {
        $updates[] = "status = ?";
        $updateParams[] = $data['status'];
    }
    if (isset($data['name'])) {
        $updates[] = "name = ?";
        $updateParams[] = Validation::sanitizeString($data['name']);
    }
    if (isset($data['phone'])) {
        $updates[] = "phone = ?";
        $updateParams[] = Validation::formatPhoneNumber($data['phone']);
    }

    if (!empty($updates)) {
        $updateParams[] = $params['id'];
        Database::getInstance()->prepare("UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?")->execute($updateParams);
        Security::logAudit($user['id'], 'updated_customer', 'users', $params['id']);
    }

    Response::success(null, 'Customer updated successfully');
}, 'permission', 'customers.edit');

ApiRouter::add('PUT', '/admin/customers/{id}/status', function($params) {
    $user = Auth::getCurrentUser();

    $data = $GLOBALS['_INPUT'];
    if (!isset($data['status'])) {
        Response::error('Status is required');
    }

    Database::getInstance()->prepare("UPDATE users SET status = ? WHERE id = ?")->execute([$data['status'], $params['id']]);
    Security::logAudit($user['id'], 'updated_customer_status', 'users', $params['id']);
    Response::success(null, 'Customer status updated');
}, 'permission', 'customers.edit');

// Convenience endpoint: enable/disable a customer account
ApiRouter::add('POST', '/admin/customers/disable', function($params) {
    $user = Auth::getCurrentUser();

    $data = $GLOBALS['_INPUT'];
    if (empty($data['id'])) {
        Response::error('Customer id is required');
    }

    $status = 'Disabled';
    if (isset($data['status'])) {
        $status = $data['status'];
    } elseif (isset($data['active']) && $data['active'] === true) {
        $status = 'Active';
    }

    Database::getInstance()->prepare("UPDATE users SET status = ? WHERE id = ?")->execute([$status, $data['id']]);
    Security::logAudit($user['id'], 'updated_customer_status', 'users', $data['id']);
    Response::success(null, 'Customer ' . strtolower($status));
}, 'permission', 'customers.edit');

ApiRouter::add('DELETE', '/admin/customers/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'customers.delete', true);

    Database::getInstance()->prepare("DELETE FROM users WHERE id = ? AND role_id = (SELECT id FROM roles WHERE slug = 'customer')")->execute([$params['id']]);
    Security::logAudit($user['id'], 'deleted_customer', 'users', $params['id']);
    Response::success(null, 'Customer deleted successfully');
}, 'permission', 'customers.delete');

// ==========================================
// CUSTOMER FAVORITES API
// ==========================================

ApiRouter::add('GET', '/favorites', function($params) {
    $user = Auth::requireAuth();

    $stmt = Database::getInstance()->prepare(
        "SELECT f.id as favorite_id, f.created_at as favorited_at, p.*,
                pt.name as type_name, pt.slug as type_slug,
                (SELECT pi.filename FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = TRUE LIMIT 1) as primary_image
         FROM favorites f 
         JOIN properties p ON f.property_id = p.id 
         LEFT JOIN property_types pt ON p.property_type_id = pt.id
         WHERE f.user_id = ? 
         ORDER BY f.created_at DESC"
    );
    $stmt->execute([$user['id']]);
    $favorites = $stmt->fetchAll();

    Response::success($favorites);
}, 'authenticated');

ApiRouter::add('POST', '/favorites', function($params) {
    $user = Auth::requireAuth();
    $data = $GLOBALS['_INPUT'];

    if (empty($data['property_id'])) {
        Response::error('Property ID is required');
    }

    $propertyId = (int)$data['property_id'];
    Database::getInstance()->prepare(
        "INSERT IGNORE INTO favorites (user_id, property_id) VALUES (?, ?)"
    )->execute([$user['id'], $propertyId]);

    Response::success(null, 'Added to favorites', 201);
}, 'authenticated');

ApiRouter::add('DELETE', '/favorites/{id}', function($params) {
    $user = Auth::requireAuth();
    $id = (int)$params['id'];

    // Can delete by favorite_id or property_id
    Database::getInstance()->prepare(
        "DELETE FROM favorites WHERE user_id = ? AND (id = ? OR property_id = ?)"
    )->execute([$user['id'], $id, $id]);

    Response::success(null, 'Removed from favorites');
}, 'authenticated');

// ==========================================
// CUSTOMER INTERESTED PROPERTIES API
// ==========================================

ApiRouter::add('GET', '/interested-properties', function($params) {
    $user = Auth::requireAuth();

    $stmt = Database::getInstance()->prepare(
        "SELECT ip.id as interested_id, ip.notes, ip.created_at as added_at, p.*,
                pt.name as type_name, pt.slug as type_slug,
                (SELECT pi.filename FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = TRUE LIMIT 1) as primary_image
         FROM interested_properties ip 
         JOIN properties p ON ip.property_id = p.id 
         LEFT JOIN property_types pt ON p.property_type_id = pt.id
         WHERE ip.user_id = ? 
         ORDER BY ip.created_at DESC"
    );
    $stmt->execute([$user['id']]);
    $items = $stmt->fetchAll();

    Response::success($items);
}, 'authenticated');

ApiRouter::add('POST', '/interested-properties', function($params) {
    $user = Auth::requireAuth();
    $data = $GLOBALS['_INPUT'];

    if (empty($data['property_id'])) {
        Response::error('Property ID is required');
    }

    $propertyId = (int)$data['property_id'];
    $notes = !empty($data['notes']) ? Validation::sanitizeString($data['notes']) : null;

    Database::getInstance()->prepare(
        "INSERT INTO interested_properties (user_id, property_id, notes) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE notes = VALUES(notes)"
    )->execute([$user['id'], $propertyId, $notes]);

    Response::success(null, 'Added to interested properties', 201);
}, 'authenticated');

ApiRouter::add('DELETE', '/interested-properties/{id}', function($params) {
    $user = Auth::requireAuth();
    $id = (int)$params['id'];

    Database::getInstance()->prepare(
        "DELETE FROM interested_properties WHERE user_id = ? AND (id = ? OR property_id = ?)"
    )->execute([$user['id'], $id, $id]);

    Response::success(null, 'Removed from interested properties');
}, 'authenticated');

// ==========================================
// USER SELF-SERVICE PROFILE & PASSWORD API
// ==========================================

ApiRouter::add('PUT', '/auth/profile', function($params) {
    $user = Auth::requireAuth();
    $data = $GLOBALS['_INPUT'];

    $updates = [];
    $updateParams = [];

    if (isset($data['name']) && trim($data['name']) !== '') {
        $updates[] = "name = ?";
        $updateParams[] = Validation::sanitizeString($data['name']);
    }
    if (isset($data['phone'])) {
        $updates[] = "phone = ?";
        $updateParams[] = Validation::formatPhoneNumber($data['phone']);
    }
    if (isset($data['profile_image'])) {
        $updates[] = "profile_image = ?";
        $updateParams[] = $data['profile_image'];
    }

    if (!empty($updates)) {
        $updateParams[] = $user['id'];
        Database::getInstance()->prepare("UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?")->execute($updateParams);
    }

    $stmt = Database::getInstance()->prepare("SELECT u.id, u.name, u.email, u.phone, u.profile_image, r.slug as role_slug FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?");
    $stmt->execute([$user['id']]);
    $updatedUser = $stmt->fetch();

    Response::success($updatedUser, 'Profile updated successfully');
}, 'authenticated');

ApiRouter::add('PUT', '/auth/password', function($params) {
    $user = Auth::requireAuth();
    $data = $GLOBALS['_INPUT'];

    if (empty($data['current_password']) || empty($data['new_password'])) {
        Response::error('Current password and new password are required');
    }

    $stmt = Database::getInstance()->prepare("SELECT password_hash FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $hash = $stmt->fetchColumn();

    if (!password_verify($data['current_password'], $hash)) {
        Response::error('Current password is incorrect');
    }

    if (strlen($data['new_password']) < 8) {
        Response::error('New password must be at least 8 characters long');
    }

    $newHash = password_hash($data['new_password'], PASSWORD_DEFAULT);
    Database::getInstance()->prepare("UPDATE users SET password_hash = ? WHERE id = ?")->execute([$newHash, $user['id']]);

    Response::success(null, 'Password updated successfully');
}, 'authenticated');

