<?php

ApiRouter::add('GET', '/admin/roles', function($params) {
    $user = Auth::getCurrentUser();

    $stmt = Database::getInstance()->prepare("SELECT r.*, COUNT(DISTINCT u.id) as user_count FROM roles r LEFT JOIN users u ON r.id = u.role_id GROUP BY r.id ORDER BY r.name");
    $stmt->execute();
    $roles = $stmt->fetchAll();

    Response::success($roles);
}, 'permission', 'roles.view');

ApiRouter::add('GET', '/admin/roles/{id}', function($params) {
    $user = Auth::getCurrentUser();

    $stmt = Database::getInstance()->prepare("SELECT * FROM roles WHERE id = ?");
    $stmt->execute([$params['id']]);
    $role = $stmt->fetch();

    if (!$role) {
        Response::notFound('Role not found');
    }

    $stmt = Database::getInstance()->prepare("SELECT p.* FROM permissions p JOIN role_permissions rp ON p.id = rp.permission_id WHERE rp.role_id = ?");
    $stmt->execute([$params['id']]);
    $role['permissions'] = $stmt->fetchAll();

    Response::success($role);
}, 'permission', 'roles.view');

ApiRouter::add('POST', '/admin/roles', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'roles.create');

    $data = $GLOBALS['_INPUT'];
    $errors = Validation::validate($data, [
        'name' => ['required', 'min' => 2, 'max' => 100],
        'slug' => ['required', 'slug'],
    ]);

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $stmt = Database::getInstance()->prepare("SELECT id FROM roles WHERE slug = ?");
    $stmt->execute([$data['slug']]);
    if ($stmt->fetch()) {
        Response::error('Role slug already exists');
    }

    Database::getInstance()->prepare(
        "INSERT INTO roles (name, slug, description) VALUES (?, ?, ?)"
    )->execute([
        Validation::sanitizeString($data['name']),
        $data['slug'],
        $data['description'] ?? null
    ]);

    $roleId = (int)Database::lastInsertId();

    if (isset($data['permission_ids']) && is_array($data['permission_ids'])) {
        $stmt = Database::getInstance()->prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)");
        foreach ($data['permission_ids'] as $permId) {
            $stmt->execute([$roleId, (int)$permId]);
        }
    }

    Security::logAudit($user['id'], 'created_role', 'roles', $roleId);
    Response::success(['id' => $roleId], 'Role created successfully', 201);
}, 'permission', 'roles.create');

ApiRouter::add('PUT', '/admin/roles/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'roles.edit');

    $data = $GLOBALS['_INPUT'];
    $stmt = Database::getInstance()->prepare("SELECT * FROM roles WHERE id = ?");
    $stmt->execute([$params['id']]);
    $role = $stmt->fetch();

    if (!$role) {
        Response::notFound('Role not found');
    }

    $updates = [];
    $updateParams = [];

    if (isset($data['name'])) {
        $updates[] = "name = ?";
        $updateParams[] = Validation::sanitizeString($data['name']);
    }
    if (isset($data['description'])) {
        $updates[] = "description = ?";
        $updateParams[] = $data['description'];
    }

    if (!empty($updates)) {
        $updateParams[] = $params['id'];
        Database::getInstance()->prepare("UPDATE roles SET " . implode(', ', $updates) . " WHERE id = ?")->execute($updateParams);
    }

    if (isset($data['permission_ids']) && is_array($data['permission_ids'])) {
        Database::getInstance()->prepare("DELETE FROM role_permissions WHERE role_id = ?")->execute([$params['id']]);
        $stmt = Database::getInstance()->prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)");
        foreach ($data['permission_ids'] as $permId) {
            $stmt->execute([$params['id'], (int)$permId]);
        }
    }

    Security::logAudit($user['id'], 'updated_role', 'roles', $params['id']);
    Response::success(null, 'Role updated successfully');
}, 'permission', 'roles.edit');

ApiRouter::add('DELETE', '/admin/roles/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'roles.delete');

    // Prevent deletion of system roles (id 1-2)
    if (in_array((int)$params['id'], [1, 2])) {
        Response::error('Cannot delete system role');
    }

    $stmt = Database::getInstance()->prepare("SELECT id FROM roles WHERE id = ?");
    $stmt->execute([$params['id']]);
    if (!$stmt->fetch()) {
        Response::notFound('Role not found');
    }

    Database::getInstance()->prepare("DELETE FROM role_permissions WHERE role_id = ?")->execute([$params['id']]);
    Database::getInstance()->prepare("UPDATE users SET role_id = 2 WHERE role_id = ?")->execute([$params['id']]);
    Database::getInstance()->prepare("DELETE FROM roles WHERE id = ?")->execute([$params['id']]);

    Security::logAudit($user['id'], 'deleted_role', 'roles', $params['id']);
    Response::success(null, 'Role deleted');
}, 'permission', 'roles.delete');
