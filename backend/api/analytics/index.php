<?php

ApiRouter::add('GET', '/admin/dashboard/stats', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'analytics.view', true);

    $stats = [];

    $stats['total_properties'] = (int)Database::getInstance()->query("SELECT COUNT(*) FROM properties")->fetchColumn();
    $stats['published_properties'] = (int)Database::getInstance()->query("SELECT COUNT(*) FROM properties WHERE status = 'Published'")->fetchColumn();
    $stats['available_properties'] = (int)Database::getInstance()->query("SELECT COUNT(*) FROM properties WHERE status = 'Available'")->fetchColumn();
    $stats['reserved_properties'] = (int)Database::getInstance()->query("SELECT COUNT(*) FROM properties WHERE status = 'Reserved'")->fetchColumn();
    $stats['sold_properties'] = (int)Database::getInstance()->query("SELECT COUNT(*) FROM properties WHERE status = 'Sold'")->fetchColumn();
    $stats['featured_properties'] = (int)Database::getInstance()->query("SELECT COUNT(*) FROM properties WHERE featured = TRUE")->fetchColumn();

    $stats['total_customers'] = (int)Database::getInstance()->query("SELECT COUNT(*) FROM users WHERE role_id = 7")->fetchColumn();
    $stats['total_agents'] = (int)Database::getInstance()->query("SELECT COUNT(*) FROM agents WHERE status = 'active'")->fetchColumn();

    $stats['total_inquiries'] = (int)Database::getInstance()->query("SELECT COUNT(*) FROM inquiries")->fetchColumn();
    $stats['unread_messages'] = (int)Database::getInstance()->query("SELECT COUNT(*) FROM inquiries WHERE status = 'Unread'")->fetchColumn();
    $stats['viewing_requests'] = (int)Database::getInstance()->query("SELECT COUNT(*) FROM viewing_requests WHERE status = 'Pending'")->fetchColumn();
    $stats['total_favorites'] = (int)Database::getInstance()->query("SELECT COUNT(*) FROM favorites")->fetchColumn();
    $stats['total_property_views'] = (int)Database::getInstance()->query("SELECT COUNT(*) FROM property_views")->fetchColumn();

    $stats['total_promotions'] = (int)Database::getInstance()->query("SELECT COUNT(*) FROM promotions WHERE active = TRUE")->fetchColumn();

    Response::success($stats);
}, 'permission', 'analytics.view');

ApiRouter::add('GET', '/admin/analytics/charts', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'analytics.view', true);

    $range = $GLOBALS['_GET_PARAMS']['range'] ?? '30d';
    $whereDate = match ($range) {
        'today' => 'DATE(created_at) = CURDATE()',
        '7d' => 'created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)',
        '30d' => 'created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
        '90d' => 'created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)',
        default => 'created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
    };

    $dateField = $GLOBALS['_GET_PARAMS']['field'] ?? 'created_at';

    $stmt = Database::getInstance()->prepare(
        "SELECT DATE({$dateField}) as day, COUNT(*) as count 
        FROM property_views 
        WHERE {$whereDate} 
        GROUP BY DATE({$dateField}) 
        ORDER BY day ASC"
    );
    $stmt->execute();
    $propertyViews = $stmt->fetchAll();

    $stmt = Database::getInstance()->prepare(
        "SELECT DATE({$dateField}) as day, COUNT(*) as count 
        FROM inquiries 
        WHERE {$whereDate} 
        GROUP BY DATE({$dateField}) 
        ORDER BY day ASC"
    );
    $stmt->execute();
    $inquiries = $stmt->fetchAll();

    $stmt = Database::getInstance()->prepare(
        "SELECT DATE(created_at) as day, COUNT(*) as count 
        FROM users 
        WHERE role_id = 7 AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at) 
        ORDER BY day ASC"
    );
    $stmt->execute();
    $customers = $stmt->fetchAll();

    $stmt = Database::getInstance()->query(
        "SELECT p.id, p.name, COUNT(pv.id) as views 
        FROM properties p 
        LEFT JOIN property_views pv ON p.id = pv.property_id 
        WHERE p.status = 'Published'
        GROUP BY p.id 
        ORDER BY views DESC 
        LIMIT 10"
    );
    $topProperties = $stmt->fetchAll();

    $stmt = Database::getInstance()->query(
        "SELECT p.id, p.name, COUNT(f.id) as favorites 
        FROM properties p 
        LEFT JOIN favorites f ON p.id = f.property_id 
        GROUP BY p.id 
        ORDER BY favorites DESC 
        LIMIT 10"
    );
    $topFavorites = $stmt->fetchAll();

    $stmt = Database::getInstance()->query(
        "SELECT p.id, p.name, COUNT(i.id) as inquiries 
        FROM properties p 
        LEFT JOIN inquiries i ON p.id = i.property_id 
        GROUP BY p.id 
        ORDER BY inquiries DESC 
        LIMIT 10"
    );
    $topInquired = $stmt->fetchAll();

    $stmt = Database::getInstance()->query(
        "SELECT s, COUNT(*) as count FROM (
            SELECT CASE 
                WHEN status = 'Sold' THEN 'Sold'
                WHEN status = 'Available' THEN 'Available'
                WHEN status = 'Reserved' THEN 'Reserved'
                WHEN status = 'Under Offer' THEN 'Under Offer'
                WHEN status = 'Published' THEN 'Published'
                WHEN status = 'Draft' THEN 'Draft'
            ELSE status END as s
            FROM properties
        ) t GROUP BY s"
    );
    $propertyStatusDistribution = $stmt->fetchAll();

    Response::success([
        'property_views_chart' => $propertyViews,
        'inquiries_chart' => $inquiries,
        'customers_chart' => $customers,
        'top_properties' => $topProperties,
        'top_favorites' => $topFavorites,
        'top_inquired' => $topInquired,
        'property_status_distribution' => $propertyStatusDistribution
    ]);
}, 'permission', 'analytics.view');

ApiRouter::add('GET', '/admin/audit-logs', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'audit_logs.view', true);

    $page = max(1, (int)($GLOBALS['_GET_PARAMS']['page'] ?? 1));
    $limit = max(1, min(100, (int)($GLOBALS['_GET_PARAMS']['limit'] ?? 30)));
    $offset = ($page - 1) * $limit;

    $where = [];
    $queryParams = [];

    if (!empty($GLOBALS['_GET_PARAMS']['action'])) {
        $where[] = "action = ?";
        $queryParams[] = $GLOBALS['_GET_PARAMS']['action'];
    }
    if (!empty($GLOBALS['_GET_PARAMS']['user_id'])) {
        $where[] = "user_id = ?";
        $queryParams[] = (int)$GLOBALS['_GET_PARAMS']['user_id'];
    }
    if (!empty($GLOBALS['_GET_PARAMS']['table'])) {
        $where[] = "table_name = ?";
        $queryParams[] = $GLOBALS['_GET_PARAMS']['table'];
    }

    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $stmt = Database::getInstance()->prepare(
        "SELECT al.*, u.name as user_name 
        FROM audit_logs al 
        LEFT JOIN users u ON al.user_id = u.id 
        {$whereClause}
        ORDER BY al.created_at DESC 
        LIMIT ? OFFSET ?"
    );
    $stmt->execute([...$queryParams, $limit, $offset]);
    $logs = $stmt->fetchAll();

    $totalStmt = Database::getInstance()->prepare(
        "SELECT COUNT(*) FROM audit_logs al " . ($whereClause ? "WHERE " . implode(' AND ', array_slice(explode(' = ', implode(' AND ', $where)), 0, 0)) : "")
    );

    $stmt = Database::getInstance()->prepare(
        "SELECT COUNT(*) as total FROM audit_logs al 
        {$whereClause}"
    );
    $stmt->execute($queryParams);
    $total = (int)$stmt->fetchColumn();

    Response::paginated($logs, $page, $limit, $total);
}, 'permission', 'audit_logs.view');

ApiRouter::add('GET', '/admin/auditors-log', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'audit_logs.view', true);
    $stmt = Database::getInstance()->query(
        "SELECT al.*, u.name as user_name FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT 30"
    );
    $logs = $stmt->fetchAll();
    Response::success($logs);
}, 'permission', 'audit_logs.view');

ApiRouter::add('GET', '/admin/auditors/log', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'audit_logs.view', true);
    $stmt = Database::getInstance()->query(
        "SELECT al.*, u.name as user_name FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT 30"
    );
    $logs = $stmt->fetchAll();
    Response::success($logs);
}, 'permission', 'audit_logs.view');
