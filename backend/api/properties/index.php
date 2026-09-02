<?php

ApiRouter::add('GET', '/properties', function($params) {
    $page = max(1, (int)($GLOBALS['_GET_PARAMS']['page'] ?? 1));
    $limit = max(1, min(50, (int)($GLOBALS['_GET_PARAMS']['limit'] ?? 12)));
    $offset = ($page - 1) * $limit;

    $status = $GLOBALS['_GET_PARAMS']['status'] ?? 'Published';
    $featured = isset($GLOBALS['_GET_PARAMS']['featured']) && $GLOBALS['_GET_PARAMS']['featured'] === 'true';

    $where = ["p.status IN (?, ?, ?, ?)"];
    $params = ['Published', 'Available', 'Reserved', 'Under Offer'];

    if ($featured) {
        $where[] = "featured = TRUE";
    }

    if (!empty($GLOBALS['_GET_PARAMS']['type'])) {
        $where[] = "pt.slug = ?";
        $params[] = $GLOBALS['_GET_PARAMS']['type'];
    }
    if (!empty($GLOBALS['_GET_PARAMS']['county'])) {
        $where[] = "p.county LIKE ?";
        $params[] = '%' . $GLOBALS['_GET_PARAMS']['county'] . '%';
    }
    if (!empty($GLOBALS['_GET_PARAMS']['town'])) {
        $where[] = "p.town LIKE ?";
        $params[] = '%' . $GLOBALS['_GET_PARAMS']['town'] . '%';
    }
    if (!empty($GLOBALS['_GET_PARAMS']['area'])) {
        $where[] = "p.area LIKE ?";
        $params[] = '%' . $GLOBALS['_GET_PARAMS']['area'] . '%';
    }
    if (!empty($GLOBALS['_GET_PARAMS']['keyword'])) {
        $where[] = "(p.name LIKE ? OR p.description LIKE ? OR p.location LIKE ? OR p.county LIKE ? OR p.town LIKE ? OR p.area LIKE ?)";
        $keyword = '%' . $GLOBALS['_GET_PARAMS']['keyword'] . '%';
        $params = array_merge($params, [$keyword, $keyword, $keyword, $keyword, $keyword, $keyword]);
    }
    if (isset($GLOBALS['_GET_PARAMS']['min_price']) && is_numeric($GLOBALS['_GET_PARAMS']['min_price'])) {
        $where[] = "p.price >= ?";
        $params[] = (float)$GLOBALS['_GET_PARAMS']['min_price'];
    }
    if (isset($GLOBALS['_GET_PARAMS']['max_price']) && is_numeric($GLOBALS['_GET_PARAMS']['max_price'])) {
        $where[] = "p.price <= ?";
        $params[] = (float)$GLOBALS['_GET_PARAMS']['max_price'];
    }
    if (isset($GLOBALS['_GET_PARAMS']['bedrooms'])) {
        $bedrooms = (int)$GLOBALS['_GET_PARAMS']['bedrooms'];
        if ($bedrooms >= 5) {
            $where[] = "p.bedrooms >= ?";
        } else {
            $where[] = "p.bedrooms = ?";
        }
        $params[] = $bedrooms;
    }
    if (isset($GLOBALS['_GET_PARAMS']['bathrooms'])) {
        $bathrooms = (int)$GLOBALS['_GET_PARAMS']['bathrooms'];
        if ($bathrooms >= 4) {
            $where[] = "p.bathrooms >= ?";
        } else {
            $where[] = "p.bathrooms = ?";
        }
        $params[] = $bathrooms;
    }
    if (isset($GLOBALS['_GET_PARAMS']['verification_status'])) {
        $where[] = "p.verification_status = ?";
        $params[] = $GLOBALS['_GET_PARAMS']['verification_status'];
    }

    $sortBy = $GLOBALS['_GET_PARAMS']['sort'] ?? 'newest';
    $orderMap = [
        'newest' => 'p.created_at DESC',
        'oldest' => 'p.created_at ASC',
        'price_low' => 'p.price ASC',
        'price_high' => 'p.price DESC',
        'most_viewed' => 'p.views_count DESC',
        'featured' => 'p.featured DESC, p.created_at DESC',
    ];
    $orderBy = $orderMap[$sortBy] ?? $orderMap['newest'];

    $whereClause = implode(' AND ', $where);

    $stmt = Database::getInstance()->prepare(
        "SELECT SQL_CALC_FOUND_ROWS 
            p.id, p.name, p.slug, p.price, p.currency, p.location, p.county, p.town, 
            p.area, p.bedrooms, p.bathrooms, p.parking_spaces, p.house_size, p.land_size, 
            p.status, p.verification_status, p.featured, p.views_count, p.published_at,
            pt.name as type_name, pt.slug as type_slug,
            (SELECT pi.filename FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = TRUE LIMIT 1) as primary_image,
            GROUP_CONCAT(f.slug) as feature_slugs
        FROM properties p
        JOIN property_types pt ON p.property_type_id = pt.id
        LEFT JOIN property_features pf ON p.id = pf.property_id
        LEFT JOIN features f ON pf.feature_id = f.id
        WHERE {$whereClause}
        GROUP BY p.id
        ORDER BY {$orderBy}
        LIMIT ? OFFSET ?"
    );
    $stmt->execute([...$params, $limit, $offset]);
    $properties = $stmt->fetchAll();

    $totalStmt = Database::getInstance()->prepare("SELECT FOUND_ROWS()");
    $totalStmt->execute();
    $total = (int)$totalStmt->fetchColumn();

    Response::paginated($properties, $page, $limit, $total);
}, 'public');

ApiRouter::add('GET', '/properties/featured', function($params) {
    $limit = (int)($GLOBALS['_GET_PARAMS']['limit'] ?? 6);
    $stmt = Database::getInstance()->prepare(
        "SELECT 
            p.id, p.name, p.slug, p.price, p.currency, p.location, p.county, p.town, 
            p.bedrooms, p.bathrooms, p.parking_spaces, p.house_size, p.land_size, 
            p.status, p.verification_status, p.featured, p.views_count, p.published_at,
            pt.name as type_name, pt.slug as type_slug,
            (SELECT pi.filename FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = TRUE LIMIT 1) as primary_image
        FROM properties p
        JOIN property_types pt ON p.property_type_id = pt.id
        WHERE p.status = 'Available' AND p.featured = TRUE
        ORDER BY p.views_count DESC, p.created_at DESC
        LIMIT ?"
    );
    $stmt->execute([$limit]);
    $properties = $stmt->fetchAll();
    Response::success($properties);
}, 'public');

ApiRouter::add('GET', '/properties/latest', function($params) {
    $limit = (int)($GLOBALS['_GET_PARAMS']['limit'] ?? 6);
    $stmt = Database::getInstance()->prepare(
        "SELECT 
            p.id, p.name, p.slug, p.price, p.currency, p.location, p.county, p.town,
            p.bedrooms, p.bathrooms, p.parking_spaces, p.house_size, p.land_size,
            p.status, p.verification_status, p.featured, p.views_count, p.published_at,
            pt.name as type_name, pt.slug as type_slug,
            (SELECT pi.filename FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = TRUE LIMIT 1) as primary_image
        FROM properties p
        JOIN property_types pt ON p.property_type_id = pt.id
        WHERE p.status = 'Available'
        ORDER BY p.published_at DESC, p.created_at DESC
        LIMIT ?"
    );
    $stmt->execute([$limit]);
    $properties = $stmt->fetchAll();
    Response::success($properties);
}, 'public');

ApiRouter::add('GET', '/properties/{slug}', function($params) {
    $slug = $params['slug'];
    $stmt = Database::getInstance()->prepare(
        "SELECT 
            p.*, pt.name as type_name, pt.slug as type_slug
        FROM properties p
        JOIN property_types pt ON p.property_type_id = pt.id
        WHERE p.slug = ? AND p.status IN ('Published', 'Available', 'Reserved', 'Under Offer')"
    );
    $stmt->execute([$slug]);
    $property = $stmt->fetch();

    if (!$property) {
        Response::notFound('Property not found');
    }

    $stmt = Database::getInstance()->prepare("SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order ASC");
    $stmt->execute([$property['id']]);
    $property['images'] = $stmt->fetchAll();

    $stmt = Database::getInstance()->prepare(
        "SELECT f.id, f.name, f.slug, f.icon, f.category FROM property_features pf
         JOIN features f ON pf.feature_id = f.id
         WHERE pf.property_id = ?"
    );
    $stmt->execute([$property['id']]);
    $property['features'] = $stmt->fetchAll();

    $stmt = Database::getInstance()->prepare("SELECT * FROM property_documents WHERE property_id = ? AND visibility IN ('private', 'admin_only') ORDER BY created_at DESC");
    $stmt->execute([$property['id']]);
    $documents = $stmt->fetchAll();
    foreach ($documents as &$doc) {
        $doc['is_protected'] = true;
    }

    $stmt = Database::getInstance()->prepare(
        "SELECT pa.*, a.name, a.phone, a.email, a.bio, a.photo, a.registration_number, a.credentials, a.license_number, a.rating, a.properties_sold
         FROM property_agents pa
         JOIN agents a ON pa.agent_id = a.id
         WHERE pa.property_id = ?
         ORDER BY pa.is_primary DESC"
    );
    $stmt->execute([$property['id']]);
    $property['agents'] = $stmt->fetchAll();

    $stmt = Database::getInstance()->prepare("SELECT COUNT(*) FROM property_views WHERE property_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
    $stmt->execute([$property['id']]);
    $property['views_last_30_days'] = (int)$stmt->fetchColumn();

    $stmt = Database::getInstance()->prepare("SELECT COUNT(*) FROM favorites WHERE property_id = ?");
    $stmt->execute([$property['id']]);
    $property['favorites_count'] = (int)$stmt->fetchColumn();

    $property['documents'] = $documents;

    $stmt = Database::getInstance()->prepare("UPDATE properties SET views_count = views_count + 1 WHERE id = ?");
    $stmt->execute([$property['id']]);

    $stmt = Database::getInstance()->prepare(
        "INSERT INTO property_views (property_id, ip_address, user_agent, referrer) 
         VALUES (?, ?, ?, ?)"
    );
    $stmt->execute([
        $property['id'],
        Security::getClientIP(),
        substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500),
        $_SERVER['HTTP_REFERER'] ?? ''
    ]);

    Response::success($property);
}, 'public');

ApiRouter::add('GET', '/properties/filter/options', function($params) {
    $stmt = Database::getInstance()->query("SELECT id, name, slug FROM property_types WHERE is_active = TRUE ORDER BY sort_order");
    $types = $stmt->fetchAll();

    $stmt = Database::getInstance()->query("SELECT id, name, slug, category FROM features WHERE is_default = TRUE ORDER BY sort_order");
    $features = $stmt->fetchAll();

    $stmt = Database::getInstance()->query("SELECT DISTINCT county FROM properties WHERE county IS NOT NULL AND county != '' ORDER BY county");
    $counties = $stmt->fetchAll();

    Response::success(['types' => $types, 'features' => $features, 'counties' => $counties]);
}, 'public');

ApiRouter::add('GET', '/property-types', function($params) {
    $stmt = Database::getInstance()->query("SELECT id, name, slug, icon FROM property_types WHERE is_active = TRUE ORDER BY sort_order");
    Response::success($stmt->fetchAll());
}, 'public');

ApiRouter::add('GET', '/features', function($params) {
    $stmt = Database::getInstance()->query("SELECT id, name, slug, icon, category FROM features ORDER BY category, sort_order");
    Response::success($stmt->fetchAll());
}, 'public');

ApiRouter::add('POST', '/properties/{id}/view', function($params) {
    $id = (int)$params['id'];
    Database::getInstance()->prepare("UPDATE properties SET views_count = views_count + 1 WHERE id = ?")->execute([$id]);
    Database::getInstance()->prepare(
        "INSERT INTO property_views (property_id, ip_address, user_agent, referrer) VALUES (?, ?, ?, ?)"
    )->execute([
        $id,
        Security::getClientIP(),
        substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500),
        $_SERVER['HTTP_REFERER'] ?? ''
    ]);
    Response::success(null, 'View tracked');
}, 'public');

