<?php

ApiRouter::add('GET', '/admin/documents', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'documents.view', true);

    $page = max(1, (int)($GLOBALS['_GET_PARAMS']['page'] ?? 1));
    $limit = max(1, min(50, (int)($GLOBALS['_GET_PARAMS']['limit'] ?? 15)));
    $offset = ($page - 1) * $limit;

    $where = [];
    $queryParams = [];

    if (!empty($GLOBALS['_GET_PARAMS']['property_id'])) {
        $where[] = "pd.property_id = ?";
        $queryParams[] = $GLOBALS['_GET_PARAMS']['property_id'];
    }
    if (!empty($GLOBALS['_GET_PARAMS']['search'])) {
        $where[] = "(pd.title LIKE ? OR pd.description LIKE ?)";
        $search = '%' . $GLOBALS['_GET_PARAMS']['search'] . '%';
        $queryParams = array_merge($queryParams, [$search, $search]);
    }

    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $stmt = Database::getInstance()->prepare(
        "SELECT SQL_CALC_FOUND_ROWS pd.*, p.name as property_name, p.slug as property_slug, u.name as uploaded_by_name
        FROM property_documents pd
        JOIN properties p ON pd.property_id = p.id
        LEFT JOIN users u ON pd.uploaded_by = u.id
        {$whereClause}
        ORDER BY pd.created_at DESC
        LIMIT ? OFFSET ?"
    );
    $stmt->execute([...$queryParams, $limit, $offset]);
    $documents = $stmt->fetchAll();

    $totalStmt = Database::getInstance()->prepare("SELECT FOUND_ROWS()");
    $totalStmt->execute();
    $total = (int)$totalStmt->fetchColumn();

    Response::paginated($documents, $page, $limit, $total);
}, 'permission', 'documents.view');

ApiRouter::add('GET', '/admin/documents/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'documents.view', true);

    $stmt = Database::getInstance()->prepare(
        "SELECT pd.*, p.name as property_name, p.slug as property_slug
        FROM property_documents pd
        JOIN properties p ON pd.property_id = p.id
        WHERE pd.id = ?"
    );
    $stmt->execute([$params['id']]);
    $document = $stmt->fetch();

    if (!$document) {
        Response::notFound('Document not found');
    }

    Response::success($document);
}, 'permission', 'documents.view');

ApiRouter::add('POST', '/admin/documents', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'documents.upload');

    if (!isset($_FILES['file'])) {
        Response::error('No file uploaded');
    }

    $data = !empty($_POST) ? $_POST : $GLOBALS['_INPUT'];
    $result = Upload::uploadDocument($_FILES['file']);
    if (!$result['success']) {
        Response::error($result['message']);
    }

    $propertyId = !empty($data['property_id']) ? (int)$data['property_id'] : null;
    $stmt = Database::getInstance()->prepare(
        "INSERT INTO property_documents (property_id, title, description, filename, file_path, file_size, mime_type, document_type, visibility, uploaded_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $propertyId,
        $data['title'] ?? $result['filename'],
        $data['description'] ?? null,
        $result['filename'],
        $result['file_path'],
        $result['file_size'],
        $result['mime_type'],
        $data['document_type'] ?? 'other',
        $data['visibility'] ?? 'private',
        $user['id']
    ]);

    Security::logAudit($user['id'], 'uploaded_document', 'property_documents', (int)Database::lastInsertId());
    Response::success(['id' => Database::lastInsertId()], 'Document uploaded successfully', 201);
}, 'permission', 'documents.upload');

ApiRouter::add('PUT', '/admin/documents/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'documents.upload');

    $data = $GLOBALS['_INPUT'];
    $stmt = Database::getInstance()->prepare(
        "UPDATE property_documents SET title = ?, description = ?, document_type = ?, visibility = ? WHERE id = ?"
    );
    $stmt->execute([
        $data['title'],
        $data['description'] ?? null,
        $data['document_type'] ?? 'other',
        $data['visibility'] ?? 'private',
        $params['id']
    ]);

    Security::logAudit($user['id'], 'updated_document', 'property_documents', $params['id']);
    Response::success(null, 'Document updated successfully');
}, 'permission', 'documents.upload');

ApiRouter::add('DELETE', '/admin/documents/{id}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'documents.delete');

    $stmt = Database::getInstance()->prepare("SELECT file_path FROM property_documents WHERE id = ?");
    $stmt->execute([$params['id']]);
    $document = $stmt->fetch();

    if ($document) {
        Upload::deleteFile($document['file_path']);
    }

    Database::getInstance()->prepare("DELETE FROM property_documents WHERE id = ?")->execute([$params['id']]);
    Security::logAudit($user['id'], 'deleted_document', 'property_documents', $params['id']);
    Response::success(null, 'Document deleted');
}, 'permission', 'documents.delete');
