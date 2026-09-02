<?php

ApiRouter::add('GET', '/admin/properties', function($params) {
    Permissions::requirePermission(Auth::getCurrentUser()['id'], 'properties.view', true);

    $page = max(1, (int)($GLOBALS['_GET_PARAMS']['page'] ?? 1));
    $limit = max(1, min(50, (int)($GLOBALS['_GET_PARAMS']['limit'] ?? 15)));
    $offset = ($page - 1) * $limit;

    $where = [];
    $params = [];

    if (!empty($GLOBALS['_GET_PARAMS']['status'])) {
        $where[] = "p.status = ?";
        $params[] = $GLOBALS['_GET_PARAMS']['status'];
    }
    if (!empty($GLOBALS['_GET_PARAMS']['search'])) {
        $where[] = "(p.name LIKE ? OR p.slug LIKE ? OR p.location LIKE ?)";
        $search = '%' . $GLOBALS['_GET_PARAMS']['search'] . '%';
        $params = array_merge($params, [$search, $search, $search]);
    }
    if (!empty($GLOBALS['_GET_PARAMS']['type'])) {
        $where[] = "p.property_type_id = ?";
        $params[] = $GLOBALS['_GET_PARAMS']['type'];
    }
    if (isset($GLOBALS['_GET_PARAMS']['featured']) && $GLOBALS['_GET_PARAMS']['featured'] !== '') {
        $where[] = "p.featured = ?";
        $params[] = $GLOBALS['_GET_PARAMS']['featured'] === 'true' ? 1 : 0;
    }
    if (isset($GLOBALS['_GET_PARAMS']['verification']) && !empty($GLOBALS['_GET_PARAMS']['verification'])) {
        $where[] = "p.verification_status = ?";
        $params[] = $GLOBALS['_GET_PARAMS']['verification'];
    }

    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $stmt = Database::getInstance()->prepare(
        "SELECT SQL_CALC_FOUND_ROWS 
            p.id, p.name, p.slug, p.price, p.currency, p.location, p.county, p.town,
            p.bedrooms, p.bathrooms, p.parking_spaces, p.house_size, p.status, p.verification_status, 
            p.featured, p.views_count, p.published_at, p.created_at, p.updated_at,
            pt.name as type_name, pt.slug as type_slug,
            ag.name as agent_name,
            (SELECT pi.filename FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = TRUE LIMIT 1) as primary_image
        FROM properties p
        JOIN property_types pt ON p.property_type_id = pt.id
        LEFT JOIN property_agents pa ON p.id = pa.property_id AND pa.is_primary = TRUE
        LEFT JOIN agents ag ON pa.agent_id = ag.id
        {$whereClause}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?"
    );
    $stmt->execute([...$params, $limit, $offset]);
    $properties = $stmt->fetchAll();

    $totalStmt = Database::getInstance()->prepare("SELECT FOUND_ROWS()");
    $totalStmt->execute();
    $total = (int)$totalStmt->fetchColumn();

    Response::paginated($properties, $page, $limit, $total);
}, 'permission', 'properties.view');

ApiRouter::add('GET', '/admin/properties/{id}', function($params) {
    Permissions::requirePermission(Auth::getCurrentUser()['id'], 'properties.view', true);

    $stmt = Database::getInstance()->prepare("SELECT p.*, pt.name as type_name, pt.slug as type_slug FROM properties p JOIN property_types pt ON p.property_type_id = pt.id WHERE p.id = ?");
    $stmt->execute([$params['id']]);
    $property = $stmt->fetch();

    if (!$property) {
        Response::notFound('Property not found');
    }

    $stmt = Database::getInstance()->prepare("SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order ASC");
    $stmt->execute([$property['id']]);
    $property['images'] = $stmt->fetchAll();

    $stmt = Database::getInstance()->prepare("SELECT pf.feature_id as id, f.name, f.slug FROM property_features pf JOIN features f ON pf.feature_id = f.id WHERE pf.property_id = ?");
    $stmt->execute([$property['id']]);
    $property['features'] = array_column($stmt->fetchAll(), 'id');

    $stmt = Database::getInstance()->prepare("SELECT * FROM property_documents WHERE property_id = ? ORDER BY created_at DESC");
    $stmt->execute([$property['id']]);
    $property['documents'] = $stmt->fetchAll();

    $stmt = Database::getInstance()->prepare("SELECT pa.*, a.name, a.photo FROM property_agents pa JOIN agents a ON pa.agent_id = a.id WHERE pa.property_id = ? ORDER BY pa.is_primary DESC");
    $stmt->execute([$property['id']]);
    $property['agents'] = $stmt->fetchAll();

    $stmt = Database::getInstance()->prepare("SELECT * FROM property_verifications WHERE property_id = ? ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([$property['id']]);
    $property['verification'] = $stmt->fetch();

    $stmt = Database::getInstance()->prepare("SELECT meta_title, meta_description FROM seo_metadata WHERE page_type = 'property' AND page_id = ?");
    $stmt->execute([$property['id']]);
    $property['seo'] = $stmt->fetch();

    Response::success($property);
}, 'permission', 'properties.view');

ApiRouter::add('POST', '/admin/properties', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'properties.create');

    $data = $GLOBALS['_INPUT'];
    $errors = Validation::validate($data, [
        'name' => ['required', 'min' => 5, 'max' => 255],
        'slug' => ['required'],
        'price' => ['required', 'min_numeric' => 0],
        'location' => ['required'],
        'county' => ['required'],
        'town' => ['required'],
        'property_type_id' => ['required'],
        'description' => ['required'],
    ]);

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $description = Validation::sanitizeHtml($data['description']);
    $slug = Security::generateUniqueSlug($data['slug'] ?? Security::generateSlug($data['name']), 'properties');

    Database::beginTransaction();
    try {
        $stmt = Database::getInstance()->prepare(
            "INSERT INTO properties 
            (property_type_id, name, slug, description, price, currency, location, county, town, area, estate, address, 
             latitude, longitude, bedrooms, bathrooms, parking_spaces, house_size, land_size, floors, year_built, 
             furnishing_status, status, verification_status, featured, published_at, created_by, updated_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $data['property_type_id'],
            $data['name'],
            $slug,
            $description,
            $data['price'],
            $data['currency'] ?? 'KES',
            $data['location'],
            $data['county'],
            $data['town'],
            $data['area'] ?? null,
            $data['estate'] ?? null,
            $data['address'] ?? null,
            $data['latitude'] ?? null,
            $data['longitude'] ?? null,
            $data['bedrooms'] ?? 0,
            $data['bathrooms'] ?? 0,
            $data['parking_spaces'] ?? 0,
            $data['house_size'] ?? null,
            $data['land_size'] ?? null,
            $data['floors'] ?? 1,
            $data['year_built'] ?? null,
            $data['furnishing_status'] ?? 'Unfurnished',
            $data['status'] ?? 'Draft',
            $data['verification_status'] ?? 'Pending',
            $data['featured'] ? 1 : 0,
            $data['status'] === 'Published' ? date('Y-m-d H:i:s') : null,
            $user['id'],
            $user['id']
        ]);

        $propertyId = (int)Database::lastInsertId();

        if (!empty($data['features']) && is_array($data['features'])) {
            $stmt = Database::getInstance()->prepare("INSERT INTO property_features (property_id, feature_id) VALUES (?, ?)");
            foreach ($data['features'] as $featureId) {
                $stmt->execute([$propertyId, (int)$featureId]);
            }
        }

        if (!empty($data['agents']) && is_array($data['agents'])) {
            foreach ($data['agents'] as $index => $agentId) {
                $stmt = Database::getInstance()->prepare("INSERT INTO property_agents (property_id, agent_id, is_primary) VALUES (?, ?, ?)");
                $stmt->execute([$propertyId, (int)$agentId, $index === 0 ? 1 : 0]);
            }
        }

        if (isset($data['seo'])) {
            $stmt = Database::getInstance()->prepare(
                "INSERT INTO seo_metadata (page_type, page_id, meta_title, meta_description, canonical_url, og_title, og_description, og_image) 
                 VALUES ('property', ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->execute([
                $propertyId,
                $data['seo']['meta_title'] ?? null,
                $data['seo']['meta_description'] ?? null,
                $data['seo']['canonical_url'] ?? null,
                $data['seo']['og_title'] ?? null,
                $data['seo']['og_description'] ?? null,
                $data['seo']['og_image'] ?? null
            ]);
        }

        if (!empty($data['images'])) {
            $stmt = Database::getInstance()->prepare(
                "INSERT INTO property_images (property_id, filename, alt_text, caption, is_primary, sort_order, file_size, mime_type, width, height) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            foreach ($data['images'] as $index => $image) {
                $stmt->execute([
                    $propertyId,
                    $image['filename'],
                    $image['alt_text'] ?? null,
                    $image['caption'] ?? null,
                    $index === 0 ? 1 : 0,
                    $index,
                    $image['file_size'] ?? null,
                    $image['mime_type'] ?? null,
                    $image['width'] ?? null,
                    $image['height'] ?? null
                ]);
            }
        }

        Database::commit();
        Security::logAudit($user['id'], 'created_property', 'properties', $propertyId, [], $data);
        Response::success(['id' => $propertyId, 'slug' => $slug], 'Property created successfully', 201);
    } catch (Exception $e) {
        Database::rollback();
        error_log('Property creation error: ' . $e->getMessage());
        Response::serverError('Failed to create property');
    }
}, 'permission', 'properties.create');

ApiRouter::add('PUT', '/admin/properties/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'properties.edit');

    $data = $GLOBALS['_INPUT'];
    $stmt = Database::getInstance()->prepare("SELECT * FROM properties WHERE id = ?");
    $stmt->execute([$params['id']]);
    $property = $stmt->fetch();

    if (!$property) {
        Response::notFound('Property not found');
    }

    $oldValues = $property;
    $description = isset($data['description']) ? Validation::sanitizeHtml($data['description']) : $property['description'];
    $slug = $data['slug'] ?? $property['slug'];

    if ($slug !== $property['slug']) {
        $slug = Security::generateUniqueSlug($slug, 'properties', 'id', $params['id']);
    }

    $stmt = Database::getInstance()->prepare(
        "UPDATE properties SET 
        property_type_id = ?, name = ?, slug = ?, description = ?, price = ?, currency = ?, location = ?, county = ?, 
        town = ?, area = ?, estate = ?, address = ?, latitude = ?, longitude = ?, bedrooms = ?, bathrooms = ?, 
        parking_spaces = ?, house_size = ?, land_size = ?, floors = ?, year_built = ?, furnishing_status = ?, 
        status = ?, verification_status = ?, featured = ?, published_at = ?, updated_by = ?
        WHERE id = ?"
    );

    $publishedAt = $property['published_at'];
    if ($data['status'] === 'Published' && $publishedAt === null) {
        $publishedAt = date('Y-m-d H:i:s');
    } elseif (in_array($data['status'] ?? '', ['Draft', 'Hidden'])) {
        $publishedAt = null;
    }

    $stmt->execute([
        $data['property_type_id'] ?? $property['property_type_id'],
        $data['name'] ?? $property['name'],
        $slug,
        $description,
        $data['price'] ?? $property['price'],
        $data['currency'] ?? $property['currency'],
        $data['location'] ?? $property['location'],
        $data['county'] ?? $property['county'],
        $data['town'] ?? $property['town'],
        $data['area'] ?? $property['area'],
        $data['estate'] ?? $property['estate'],
        $data['address'] ?? $property['address'],
        $data['latitude'] ?? $property['latitude'],
        $data['longitude'] ?? $property['longitude'],
        $data['bedrooms'] ?? $property['bedrooms'],
        $data['bathrooms'] ?? $property['bathrooms'],
        $data['parking_spaces'] ?? $property['parking_spaces'],
        $data['house_size'] ?? $property['house_size'],
        $data['land_size'] ?? $property['land_size'],
        $data['floors'] ?? $property['floors'],
        $data['year_built'] ?? $property['year_built'],
        $data['furnishing_status'] ?? $property['furnishing_status'],
        $data['status'] ?? $property['status'],
        $data['verification_status'] ?? $property['verification_status'],
        $data['featured'] ? 1 : 0,
        $publishedAt,
        $user['id'],
        $params['id']
    ]);

    if (isset($data['features'])) {
        Database::getInstance()->prepare("DELETE FROM property_features WHERE property_id = ?")->execute([$params['id']]);
        if (!empty($data['features'])) {
            $stmt = Database::getInstance()->prepare("INSERT INTO property_features (property_id, feature_id) VALUES (?, ?)");
            foreach ($data['features'] as $featureId) {
                $stmt->execute([$params['id'], (int)$featureId]);
            }
        }
    }

    if (isset($data['agents'])) {
        Database::getInstance()->prepare("DELETE FROM property_agents WHERE property_id = ?")->execute([$params['id']]);
        if (!empty($data['agents'])) {
            foreach ($data['agents'] as $index => $agentId) {
                $stmt = Database::getInstance()->prepare("INSERT INTO property_agents (property_id, agent_id, is_primary) VALUES (?, ?, ?)");
                $stmt->execute([$params['id'], (int)$agentId, $index === 0 ? 1 : 0]);
            }
        }
    }

    if (isset($data['seo'])) {
        Database::getInstance()->prepare(
            "INSERT INTO seo_metadata (page_type, page_id, meta_title, meta_description, canonical_url, og_title, og_description, og_image) 
             VALUES ('property', ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             meta_title = VALUES(meta_title), meta_description = VALUES(meta_description), 
             canonical_url = VALUES(canonical_url), og_title = VALUES(og_title), 
             og_description = VALUES(og_description), og_image = VALUES(og_image)"
        )->execute([
            $params['id'],
            $data['seo']['meta_title'] ?? null,
            $data['seo']['meta_description'] ?? null,
            $data['seo']['canonical_url'] ?? null,
            $data['seo']['og_title'] ?? null,
            $data['seo']['og_description'] ?? null,
            $data['seo']['og_image'] ?? null
        ]);
    }

    $newValues = array_merge($oldValues, $data);
    Security::logAudit($user['id'], 'updated_property', 'properties', $params['id'], $oldValues, $newValues);
    Response::success(null, 'Property updated successfully');
}, 'permission', 'properties.edit');

ApiRouter::add('DELETE', '/admin/properties/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'properties.delete');

    $stmt = Database::getInstance()->prepare("SELECT * FROM properties WHERE id = ?");
    $stmt->execute([$params['id']]);
    $property = $stmt->fetch();

    if (!$property) {
        Response::notFound('Property not found');
    }

    Database::getInstance()->prepare("DELETE FROM property_features WHERE property_id = ?")->execute([$params['id']]);
    Database::getInstance()->prepare("DELETE FROM property_agents WHERE property_id = ?")->execute([$params['id']]);
    Database::getInstance()->prepare("DELETE FROM property_documents WHERE property_id = ?")->execute([$params['id']]);
    Database::getInstance()->prepare("DELETE FROM seo_metadata WHERE page_type = 'property' AND page_id = ?")->execute([$params['id']]);

    $stmt = Database::getInstance()->prepare("SELECT filename FROM property_images WHERE property_id = ?");
    $stmt->execute([$params['id']]);
    foreach ($stmt->fetchAll() as $img) {
        Upload::deleteFile('uploads/properties/' . $img['filename']);
    }
    Database::getInstance()->prepare("DELETE FROM property_images WHERE property_id = ?")->execute([$params['id']]);

    Database::getInstance()->prepare("DELETE FROM properties WHERE id = ?")->execute([$params['id']]);

    Security::logAudit($user['id'], 'deleted_property', 'properties', $params['id'], $property, []);
    Response::success(null, 'Property deleted successfully');
}, 'permission', 'properties.delete');

ApiRouter::add('PATCH', '/admin/properties/{id}/status', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'properties.publish');

    $data = $GLOBALS['_INPUT'];
    $status = $data['status'] ?? 'Published';

    $stmt = Database::getInstance()->prepare("UPDATE properties SET status = ?, published_at = ? WHERE id = ?");
    $publishedAt = $status === 'Published' ? date('Y-m-d H:i:s') : null;
    $stmt->execute([$status, $publishedAt, $params['id']]);

    if (!$stmt->rowCount()) {
        Response::notFound('Property not found');
    }

    Security::logAudit($user['id'], 'changed_property_status', 'properties', $params['id'], [], ['status' => $status]);
    Response::success(null, 'Property status updated');
}, 'permission', 'properties.publish');

ApiRouter::add('POST', '/admin/properties/bulk', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'properties.edit');

    $data = $GLOBALS['_INPUT'];
    $action = $data['action'] ?? '';
    $ids = $data['ids'] ?? [];

    if (empty($ids)) {
        Response::error('No properties selected');
    }

    $placeholders = str_repeat('?,', count($ids) - 1) . '?';
    $sql = '';
    $logAction = '';

    switch ($action) {
        case 'publish':
            $sql = "UPDATE properties SET status = 'Published', published_at = NOW() WHERE id IN ({$placeholders})";
            $logAction = 'bulk_publish';
            break;
        case 'unpublish':
            $sql = "UPDATE properties SET status = 'Draft', published_at = NULL WHERE id IN ({$placeholders})";
            $logAction = 'bulk_unpublish';
            break;
        case 'feature':
            $sql = "UPDATE properties SET featured = TRUE WHERE id IN ({$placeholders})";
            $logAction = 'bulk_feature';
            break;
        case 'archive':
            $sql = "UPDATE properties SET status = 'Hidden' WHERE id IN ({$placeholders})";
            $logAction = 'bulk_archive';
            break;
        case 'delete':
            $sql = "UPDATE properties SET status = 'Draft' WHERE id IN ({$placeholders})";
            $logAction = 'bulk_delete';
            break;
        default:
            Response::error('Invalid action');
    }

    Database::getInstance()->prepare($sql)->execute($ids);
    Security::logAudit($user['id'], $logAction, 'properties', null, [], ['ids' => $ids]);
    Response::success(null, 'Bulk action completed');
}, 'permission', 'properties.edit');

ApiRouter::add('POST', '/admin/properties/{id}/duplicate', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'properties.create');

    $stmt = Database::getInstance()->prepare("SELECT * FROM properties WHERE id = ?");
    $stmt->execute([$params['id']]);
    $property = $stmt->fetch();

    if (!$property) {
        Response::notFound('Property not found');
    }

    $newSlug = Security::generateUniqueSlug($property['slug'] . '-copy', 'properties');

    Database::getInstance()->prepare(
        "INSERT INTO properties (property_type_id, name, slug, description, price, currency, location, county, town, area, estate, address, 
        latitude, longitude, bedrooms, bathrooms, parking_spaces, house_size, land_size, floors, year_built, furnishing_status, 
        status, verification_status, featured, views_count, published_at, created_by, updated_by) 
        SELECT property_type_id, CONCAT(name, ' (Copy)'), ?, description, price, currency, location, county, town, area, estate, address, 
        latitude, longitude, bedrooms, bathrooms, parking_spaces, house_size, land_size, floors, year_built, furnishing_status, 
        'Draft', 'Pending', FALSE, 0, NULL, ?, ? FROM properties WHERE id = ?"
    )->execute([$newSlug, $user['id'], $user['id'], $params['id']]);

    $newId = (int)Database::lastInsertId();

    Database::getInstance()->prepare(
        "INSERT INTO property_features (property_id, feature_id) 
        SELECT ?, feature_id FROM property_features WHERE property_id = ?"
    )->execute([$newId, $params['id']]);

    Database::getInstance()->prepare(
        "INSERT INTO property_agents (property_id, agent_id, is_primary) 
        SELECT ?, agent_id, is_primary FROM property_agents WHERE property_id = ?"
    )->execute([$newId, $params['id']]);

    Database::getInstance()->prepare(
        "INSERT INTO property_images (property_id, filename, alt_text, caption, is_primary, sort_order, file_size, mime_type, width, height) 
        SELECT ?, filename, alt_text, caption, is_primary, sort_order, file_size, mime_type, width, height 
        FROM property_images WHERE property_id = ?"
    )->execute([$newId, $params['id']]);

    Security::logAudit($user['id'], 'duplicated_property', 'properties', $params['id'], [], ['new_id' => $newId]);
    Response::success(['id' => $newId, 'slug' => $newSlug], 'Property duplicated successfully', 201);
}, 'permission', 'properties.create');

// ==========================================
// PROPERTY TYPES ADMIN API
// ==========================================

ApiRouter::add('GET', '/admin/property-types', function($params) {
    $stmt = Database::getInstance()->query("SELECT * FROM property_types ORDER BY sort_order ASC, name ASC");
    Response::success($stmt->fetchAll());
}, 'permission', 'properties.view');

ApiRouter::add('POST', '/admin/property-types', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'properties.create');
    $data = $GLOBALS['_INPUT'];

    if (empty($data['name'])) {
        Response::validationError(['name' => 'Property type name is required']);
    }

    $slug = Security::generateUniqueSlug($data['slug'] ?? Security::generateSlug($data['name']), 'property_types');
    $stmt = Database::getInstance()->prepare(
        "INSERT INTO property_types (name, slug, icon, sort_order, is_active) VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        Validation::sanitizeString($data['name']),
        $slug,
        $data['icon'] ?? 'Home',
        (int)($data['sort_order'] ?? 0),
        isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1
    ]);

    $id = (int)Database::lastInsertId();
    Security::logAudit($user['id'], 'created_property_type', 'property_types', $id);
    Response::success(['id' => $id, 'slug' => $slug], 'Property type created successfully', 201);
}, 'permission', 'properties.create');

ApiRouter::add('PUT', '/admin/property-types/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'properties.edit');
    $data = $GLOBALS['_INPUT'];

    $stmt = Database::getInstance()->prepare("SELECT * FROM property_types WHERE id = ?");
    $stmt->execute([$params['id']]);
    $type = $stmt->fetch();
    if (!$type) {
        Response::notFound('Property type not found');
    }

    $name = $data['name'] ?? $type['name'];
    $slug = $data['slug'] ?? $type['slug'];
    $icon = $data['icon'] ?? $type['icon'];
    $sortOrder = isset($data['sort_order']) ? (int)$data['sort_order'] : (int)$type['sort_order'];
    $isActive = isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : (int)$type['is_active'];

    $updateStmt = Database::getInstance()->prepare(
        "UPDATE property_types SET name = ?, slug = ?, icon = ?, sort_order = ?, is_active = ? WHERE id = ?"
    );
    $updateStmt->execute([
        Validation::sanitizeString($name),
        $slug,
        $icon,
        $sortOrder,
        $isActive,
        $params['id']
    ]);

    Security::logAudit($user['id'], 'updated_property_type', 'property_types', $params['id']);
    Response::success(null, 'Property type updated successfully');
}, 'permission', 'properties.edit');

ApiRouter::add('DELETE', '/admin/property-types/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'properties.delete');

    Database::getInstance()->prepare("DELETE FROM property_types WHERE id = ?")->execute([$params['id']]);
    Security::logAudit($user['id'], 'deleted_property_type', 'property_types', $params['id']);
    Response::success(null, 'Property type deleted successfully');
}, 'permission', 'properties.delete');

// ==========================================
// PROPERTY FEATURES ADMIN API
// ==========================================

ApiRouter::add('GET', '/admin/features', function($params) {
    $stmt = Database::getInstance()->query("SELECT * FROM features ORDER BY category ASC, sort_order ASC, name ASC");
    Response::success($stmt->fetchAll());
}, 'permission', 'properties.view');

ApiRouter::add('POST', '/admin/features', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'properties.create');
    $data = $GLOBALS['_INPUT'];

    if (empty($data['name'])) {
        Response::validationError(['name' => 'Feature name is required']);
    }

    $slug = Security::generateUniqueSlug($data['slug'] ?? Security::generateSlug($data['name']), 'features');
    $stmt = Database::getInstance()->prepare(
        "INSERT INTO features (name, slug, icon, category, is_default, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        Validation::sanitizeString($data['name']),
        $slug,
        $data['icon'] ?? 'CheckCircle',
        $data['category'] ?? 'general',
        isset($data['is_default']) ? ($data['is_default'] ? 1 : 0) : 1,
        (int)($data['sort_order'] ?? 0)
    ]);

    $id = (int)Database::lastInsertId();
    Security::logAudit($user['id'], 'created_feature', 'features', $id);
    Response::success(['id' => $id, 'slug' => $slug], 'Feature created successfully', 201);
}, 'permission', 'properties.create');

ApiRouter::add('PUT', '/admin/features/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'properties.edit');
    $data = $GLOBALS['_INPUT'];

    $stmt = Database::getInstance()->prepare("SELECT * FROM features WHERE id = ?");
    $stmt->execute([$params['id']]);
    $feature = $stmt->fetch();
    if (!$feature) {
        Response::notFound('Feature not found');
    }

    $name = $data['name'] ?? $feature['name'];
    $slug = $data['slug'] ?? $feature['slug'];
    $icon = $data['icon'] ?? $feature['icon'];
    $category = $data['category'] ?? $feature['category'];
    $isDefault = isset($data['is_default']) ? ($data['is_default'] ? 1 : 0) : (int)$feature['is_default'];
    $sortOrder = isset($data['sort_order']) ? (int)$data['sort_order'] : (int)$feature['sort_order'];

    $updateStmt = Database::getInstance()->prepare(
        "UPDATE features SET name = ?, slug = ?, icon = ?, category = ?, is_default = ?, sort_order = ? WHERE id = ?"
    );
    $updateStmt->execute([
        Validation::sanitizeString($name),
        $slug,
        $icon,
        $category,
        $isDefault,
        $sortOrder,
        $params['id']
    ]);

    Security::logAudit($user['id'], 'updated_feature', 'features', $params['id']);
    Response::success(null, 'Feature updated successfully');
}, 'permission', 'properties.edit');

ApiRouter::add('DELETE', '/admin/features/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'properties.delete');

    Database::getInstance()->prepare("DELETE FROM property_features WHERE feature_id = ?")->execute([$params['id']]);
    Database::getInstance()->prepare("DELETE FROM features WHERE id = ?")->execute([$params['id']]);
    Security::logAudit($user['id'], 'deleted_feature', 'features', $params['id']);
    Response::success(null, 'Feature deleted successfully');
}, 'permission', 'properties.delete');

// ==========================================
// PROPERTY VERIFICATION ADMIN API
// ==========================================

ApiRouter::add('GET', '/admin/verifications', function($params) {
    $page = max(1, (int)($GLOBALS['_GET_PARAMS']['page'] ?? 1));
    $limit = max(1, min(50, (int)($GLOBALS['_GET_PARAMS']['limit'] ?? 15)));
    $offset = ($page - 1) * $limit;

    $status = $GLOBALS['_GET_PARAMS']['status'] ?? '';
    $where = [];
    $queryParams = [];

    if (!empty($status) && $status !== 'all') {
        $where[] = "p.verification_status = ?";
        $queryParams[] = $status;
    }

    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $stmt = Database::getInstance()->prepare(
        "SELECT SQL_CALC_FOUND_ROWS p.id, p.name, p.slug, p.location, p.price, p.currency, p.status, 
                p.verification_status, p.verification_notes, p.verified_at,
                u.name as verified_by_name,
                (SELECT COUNT(*) FROM property_documents pd WHERE pd.property_id = p.id) as document_count,
                (SELECT pi.filename FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = TRUE LIMIT 1) as primary_image
         FROM properties p
         LEFT JOIN users u ON p.verified_by = u.id
         {$whereClause}
         ORDER BY p.updated_at DESC
         LIMIT ? OFFSET ?"
    );
    $stmt->execute([...$queryParams, $limit, $offset]);
    $items = $stmt->fetchAll();

    $total = (int)Database::getInstance()->query("SELECT FOUND_ROWS()")->fetchColumn();
    Response::paginated($items, $page, $limit, $total);
}, 'permission', 'properties.view');

ApiRouter::add('PATCH', '/admin/verifications/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'properties.edit');
    $data = $GLOBALS['_INPUT'];

    $status = $data['status'] ?? $data['verification_status'] ?? 'Verified';
    $notes = $data['notes'] ?? $data['verification_notes'] ?? null;
    $verifiedAt = $status === 'Verified' ? date('Y-m-d H:i:s') : null;

    $stmt = Database::getInstance()->prepare(
        "UPDATE properties SET verification_status = ?, verification_notes = ?, verified_by = ?, verified_at = ? WHERE id = ?"
    );
    $stmt->execute([
        $status,
        $notes,
        $user['id'],
        $verifiedAt,
        $params['id']
    ]);

    // Record in property_verifications table
    Database::getInstance()->prepare(
        "INSERT INTO property_verifications (property_id, notes, reviewed_by, status, reviewed_at) VALUES (?, ?, ?, ?, ?)"
    )->execute([
        $params['id'],
        $notes,
        $user['id'],
        $status,
        $verifiedAt
    ]);

    Security::logAudit($user['id'], 'updated_property_verification', 'properties', $params['id'], [], ['status' => $status]);
    Response::success(null, 'Verification status updated successfully');
}, 'permission', 'properties.edit');

