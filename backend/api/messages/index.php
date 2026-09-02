<?php

ApiRouter::add('GET', '/admin/messages', function($params) {
    $user = Auth::getCurrentUser();

    $page = max(1, (int)($GLOBALS['_GET_PARAMS']['page'] ?? 1));
    $limit = max(1, min(50, (int)($GLOBALS['_GET_PARAMS']['limit'] ?? 15)));
    $offset = ($page - 1) * $limit;

    $where = [];
    $queryParams = [];

    if (!empty($GLOBALS['_GET_PARAMS']['status'])) {
        $where[] = "i.status = ?";
        $queryParams[] = $GLOBALS['_GET_PARAMS']['status'];
    }
    if (isset($GLOBALS['_GET_PARAMS']['is_read'])) {
        if ($GLOBALS['_GET_PARAMS']['is_read'] == '1' || $GLOBALS['_GET_PARAMS']['is_read'] === 'true') {
            $where[] = "i.status IN ('Read', 'Replied', 'Closed')";
        } else {
            $where[] = "i.status = 'Unread'";
        }
    }
    if (!empty($GLOBALS['_GET_PARAMS']['type'])) {
        $where[] = "i.source = ?";
        $queryParams[] = $GLOBALS['_GET_PARAMS']['type'];
    }
    if (!empty($GLOBALS['_GET_PARAMS']['search'])) {
        $where[] = "(i.name LIKE ? OR i.email LIKE ? OR i.phone LIKE ? OR i.subject LIKE ? OR i.message LIKE ?)";
        $search = '%' . $GLOBALS['_GET_PARAMS']['search'] . '%';
        $queryParams = array_merge($queryParams, [$search, $search, $search, $search, $search]);
    }

    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $stmt = Database::getInstance()->prepare(
        "SELECT SQL_CALC_FOUND_ROWS i.*, p.name as property_name, p.slug as property_slug,
                (CASE WHEN i.status IN ('Read', 'Replied', 'Closed') THEN 1 ELSE 0 END) as is_read
        FROM inquiries i
        LEFT JOIN properties p ON i.property_id = p.id
        {$whereClause}
        ORDER BY i.created_at DESC
        LIMIT ? OFFSET ?"
    );
    $stmt->execute([...$queryParams, $limit, $offset]);
    $messages = $stmt->fetchAll();

    $totalStmt = Database::getInstance()->prepare("SELECT FOUND_ROWS()");
    $totalStmt->execute();
    $total = (int)$totalStmt->fetchColumn();

    Response::paginated($messages, $page, $limit, $total);
}, 'permission', 'messages.view');

ApiRouter::add('GET', '/admin/messages/{id}', function($params) {
    $user = Auth::getCurrentUser();

    $stmt = Database::getInstance()->prepare(
        "SELECT i.*, p.name as property_name, p.slug as property_slug, p.price, p.currency,
                (CASE WHEN i.status IN ('Read', 'Replied', 'Closed') THEN 1 ELSE 0 END) as is_read
        FROM inquiries i
        LEFT JOIN properties p ON i.property_id = p.id
        WHERE i.id = ?"
    );
    $stmt->execute([$params['id']]);
    $message = $stmt->fetch();

    if (!$message) {
        Response::notFound('Message not found');
    }

    if ($message['status'] === 'Unread') {
        Database::getInstance()->prepare("UPDATE inquiries SET status = 'Read' WHERE id = ?")->execute([$params['id']]);
        $message['status'] = 'Read';
        $message['is_read'] = 1;
    }

    $msgStmt = Database::getInstance()->prepare(
        "SELECT im.*, u.name as sender_name 
         FROM inquiry_messages im 
         LEFT JOIN users u ON im.sender_id = u.id 
         WHERE im.inquiry_id = ? 
         ORDER BY im.created_at ASC"
    );
    $msgStmt->execute([$params['id']]);
    $message['messages'] = $msgStmt->fetchAll();

    Response::success($message);
}, 'permission', 'messages.view');

ApiRouter::add('PUT', '/admin/messages/{id}/read', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'messages.edit');

    Database::getInstance()->prepare("UPDATE inquiries SET status = 'Read' WHERE id = ?")->execute([$params['id']]);
    Security::logAudit($user['id'], 'marked_message_read', 'inquiries', $params['id']);
    Response::success(null, 'Message marked as read');
}, 'permission', 'messages.edit');

ApiRouter::add('DELETE', '/admin/messages/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'messages.delete');

    Database::getInstance()->prepare("DELETE FROM inquiry_messages WHERE inquiry_id = ?")->execute([$params['id']]);
    Database::getInstance()->prepare("DELETE FROM inquiries WHERE id = ?")->execute([$params['id']]);
    Security::logAudit($user['id'], 'deleted_message', 'inquiries', $params['id']);
    Response::success(null, 'Message deleted');
}, 'permission', 'messages.delete');

