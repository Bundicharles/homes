<?php

ApiRouter::add('POST', '/contact', function($params) {
    $data = $GLOBALS['_INPUT'];
    $errors = Validation::validate($data, [
        'name' => ['required'],
        'email' => ['required', 'email'],
        'message' => ['required'],
    ]);

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $stmt = Database::getInstance()->prepare(
        "INSERT INTO contact_submissions (name, email, phone, subject, message, preferred_contact)
        VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        Validation::sanitizeString($data['name']),
        strtolower(trim($data['email'])),
        $data['phone'] ?? null,
        $data['subject'] ?? null,
        Validation::sanitizeString($data['message']),
        $data['preferred_contact'] ?? 'email'
    ]);

    $submissionId = Database::lastInsertId();
    $admins = Database::getInstance()->query(
        "SELECT u.id FROM users u WHERE u.role_id IN (1,2,6) AND u.status = 'active'"
    );
    foreach ($admins as $admin) {
        Database::getInstance()->prepare(
            "INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
            VALUES (?, 'new_inquiry', 'New Contact Form Submission', ?, 'contact', ?)"
        )->execute([
            $admin['id'], 'A new contact form submission has been received', $submissionId
        ]);
    }

    Response::success(null, 'Message sent successfully', 201);
}, 'public');
