<?php

ApiRouter::add('POST', '/auth/register', function($params) {
    $data = $GLOBALS['_INPUT'];
    $errors = Validation::validate($data, [
        'name' => ['required', 'min' => 2, 'max' => 255],
        'email' => ['required', 'email'],
        'phone' => ['required', 'phone'],
        'password' => ['required', 'min' => 8],
        'password_confirmation' => ['required'],
    ]);

    if ($data['password'] !== ($data['password_confirmation'] ?? '')) {
        $errors['password_confirmation'] = 'Password confirmation does not match';
    }

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $result = Auth::register($data);
    if ($result['success']) {
        $token = Security::generateSecureToken();
        $_SESSION['email_verification_token'] = $token;
        $verificationLink = Config::get('frontend_url') . '/verify-email?token=' . $token;

        Response::success(['user_id' => $result['user_id'], 'verification_link' => $verificationLink], 'Registration successful. Please check your email for verification.', 201);
    }
    Response::error($result['message'], [], 400);
}, 'public');

ApiRouter::add('POST', '/auth/login', function($params) {
    $data = $GLOBALS['_INPUT'];
    $errors = Validation::validate($data, [
        'email' => ['required', 'email'],
        'password' => ['required'],
    ]);

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $rateLimitKey = 'login_' . Security::getClientIP();
    if (!Security::checkRateLimit($rateLimitKey, 5, 3600)) {
        Response::error('Too many login attempts. Please try again later.', [], 429);
    }

    $result = Auth::login(strtolower(trim($data['email'])), $data['password'], $data['remember'] ?? false);
    if ($result['success']) {
        Response::success(['user' => $result['user'], 'remember_token' => $result['remember_token']], 'Login successful');
    }
    Response::error($result['message'], [], 401);
}, 'public');

ApiRouter::add('POST', '/auth/logout', function($params) {
    Auth::logout();
    Response::success(null, 'Logout successful');
}, 'authenticated');

ApiRouter::add('GET', '/auth/me', function($params) {
    $user = Auth::getCurrentUser();
    if (!$user) {
        Response::unauthorized('Not authenticated');
    }
    Response::success($user, 'User data retrieved');
}, 'authenticated');

ApiRouter::add('POST', '/auth/forgot-password', function($params) {
    $data = $GLOBALS['_INPUT'];
    $errors = Validation::validate($data, [
        'email' => ['required', 'email'],
    ]);

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $token = Auth::setResetToken(strtolower(trim($data['email'])));
    if ($token) {
        $resetLink = Config::get('frontend_url') . '/reset-password?token=' . $token;
        Response::success(['reset_link' => $resetLink], 'If the email exists, a reset link has been sent');
    } else {
        Response::success(null, 'If the email exists, a reset link has been sent');
    }
}, 'public');

ApiRouter::add('POST', '/auth/reset-password', function($params) {
    $data = $GLOBALS['_INPUT'];
    $errors = Validation::validate($data, [
        'token' => ['required'],
        'password' => ['required', 'min' => 8],
        'password_confirmation' => ['required'],
    ]);

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    if ($data['password'] !== ($data['password_confirmation'] ?? '')) {
        Response::validationError(['password_confirmation' => 'Password confirmation does not match']);
    }

    $success = Auth::resetPassword($data['token'], $data['password']);
    if ($success) {
        Response::success(null, 'Password reset successfully');
    }
    Response::error('Invalid or expired token', [], 400);
}, 'public');

ApiRouter::add('POST', '/auth/verify-email', function($params) {
    $data = $GLOBALS['_INPUT'];
    $errors = Validation::validate($data, [
        'token' => ['required'],
    ]);

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $success = Auth::verifyEmail($data['token']);
    if ($success) {
        Response::success(null, 'Email verified successfully');
    }
    Response::error('Invalid verification token', [], 400);
}, 'public');

ApiRouter::add('GET', '/auth/check', function($params) {
    $user = Auth::getCurrentUser();
    Response::success(['authenticated' => $user !== null, 'user' => $user]);
}, 'public');
