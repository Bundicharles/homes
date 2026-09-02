<?php
declare(strict_types=1);

class Auth
{
    private static ?array $currentUser = null;

    public static function login(string $email, string $password, bool $remember = false): array
    {
        $stmt = Database::getInstance()->prepare("SELECT u.*, r.slug as role_slug FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ? AND u.status = 'active'");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            self::logFailedLogin($email);
            return ['success' => false, 'message' => 'Invalid credentials'];
        }

        if (!password_verify($password, $user['password_hash'])) {
            self::logFailedLogin($email);
            return ['success' => false, 'message' => 'Invalid credentials'];
        }

        if ($user['login_attempts'] >= 5 && $user['lockout_until'] !== null && strtotime($user['lockout_until']) > time()) {
            return ['success' => false, 'message' => 'Account temporarily locked. Please try again later.'];
        }

        session_regenerate_id(true);

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role_id'] = $user['role_id'];
        $_SESSION['ip_address'] = Security::getClientIP();
        $_SESSION['user_agent'] = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);
        $_SESSION['login_time'] = time();

        $token = '';
        if ($remember) {
            try {
                $token = Security::generateSecureToken(32);
                $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));
                $stmt = Database::getInstance()->prepare("UPDATE users SET remember_token = ?, remember_token_expires = ? WHERE id = ?");
                $stmt->execute([$token, $expiresAt, $user['id']]);
                $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
                setcookie('remember_token', $token, time() + 2592000, '/', '', $secure, true);
            } catch (PDOException $e) {
                error_log('Remember token skipped: ' . $e->getMessage());
                $token = '';
            }
        }

        $stmt = Database::getInstance()->prepare("UPDATE users SET last_login = NOW(), login_attempts = 0, lockout_until = NULL WHERE id = ?");
        $stmt->execute([$user['id']]);

        Security::logAudit($user['id'], 'login', 'users', $user['id'], [], ['ip' => Security::getClientIP()]);

        unset($user['password_hash']);

        return ['success' => true, 'user' => $user, 'remember_token' => $token];
    }

    public static function logout(): void
    {
        if (isset($_SESSION['user_id'])) {
            Security::logAudit($_SESSION['user_id'], 'logout', 'users', $_SESSION['user_id']);
        }

        $token = $_COOKIE['remember_token'] ?? null;
        if ($token) {
            $stmt = Database::getInstance()->prepare("UPDATE users SET remember_token = NULL, remember_token_expires = NULL WHERE remember_token = ?");
            $stmt->execute([$token]);
            setcookie('remember_token', '', time() - 3600, '/', '', true, true);
        }

        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 3600, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();
    }

    public static function checkRememberToken(): ?array
    {
        $token = $_COOKIE['remember_token'] ?? null;
        if (!$token) {
            return null;
        }

        try {
            $stmt = Database::getInstance()->prepare("SELECT * FROM users WHERE remember_token = ? AND remember_token_expires > NOW() AND status = 'active'");
            $stmt->execute([$token]);
            $user = $stmt->fetch();
        } catch (PDOException $e) {
            error_log('Remember token lookup skipped: ' . $e->getMessage());
            return null;
        }

        if ($user) {
            return self::loginWithToken($token);
        }

        return null;
    }

    public static function loginWithToken(string $token): ?array
    {
        $stmt = Database::getInstance()->prepare("SELECT * FROM users WHERE remember_token = ? AND remember_token_expires > NOW() AND status = 'active'");
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if ($user) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role_id'] = $user['role_id'];
            $_SESSION['ip_address'] = Security::getClientIP();
            $_SESSION['user_agent'] = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);
            $_SESSION['login_time'] = time();

            unset($user['password_hash'], $user['remember_token']);
            return $user;
        }

        return null;
    }

    public static function getCurrentUser(): ?array
    {
        if (self::$currentUser !== null) {
            return self::$currentUser;
        }

        if (!isset($_SESSION['user_id'])) {
            $remembered = self::checkRememberToken();
            if (!$remembered) {
                return null;
            }
        }

        $stmt = Database::getInstance()->prepare(
            "SELECT u.*, r.slug as role_slug FROM users u 
             JOIN roles r ON u.role_id = r.id 
             WHERE u.id = ? AND u.status = 'active'"
        );
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();

        if ($user) {
            unset($user['password_hash'], $user['remember_token']);
            self::$currentUser = $user;
            return $user;
        }

        return null;
    }

    public static function isLoggedIn(): bool
    {
        return self::getCurrentUser() !== null;
    }

    public static function requireAuth(): array
    {
        $user = self::getCurrentUser();
        if (!$user) {
            Response::unauthorized('Authentication required');
        }
        return $user;
    }

    public static function requireAdmin(): array
    {
        $user = self::requireAuth();
        if ($user['role_id'] > 6) {
            Response::forbidden('Admin access required');
        }
        return $user;
    }

    public static function getUserRole(): ?string
    {
        $user = self::getCurrentUser();
        return $user ? $user['role_slug'] : null;
    }

    public static function getUserRoleName(): ?string
    {
        $user = self::getCurrentUser();
        if (!$user) {
            return null;
        }
        $stmt = Database::getInstance()->prepare("SELECT name FROM roles WHERE id = ?");
        $stmt->execute([$user['role_id']]);
        return $stmt->fetchColumn();
    }

    public static function register(array $data): array
    {
        $email = strtolower(trim($data['email'] ?? ''));
        $stmt = Database::getInstance()->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => 'Email already registered'];
        }

        if (!Validation::isValidEmail($email)) {
            return ['success' => false, 'message' => 'Invalid email address'];
        }

        $password = $data['password'] ?? '';
        if (strlen($password) < 8) {
            return ['success' => false, 'message' => 'Password must be at least 8 characters'];
        }

        $name = trim($data['name'] ?? '');
        if (empty($name)) {
            return ['success' => false, 'message' => 'Name is required'];
        }

        $phone = trim($data['phone'] ?? '');
        if (empty($phone)) {
            return ['success' => false, 'message' => 'Phone number is required'];
        }

        $verificationToken = Security::generateSecureToken();

        Database::beginTransaction();
        try {
            $stmt = Database::getInstance()->prepare(
                "INSERT INTO users (role_id, name, email, phone, password_hash, email_verification_token, email_verified, status) 
                 VALUES (7, ?, ?, ?, ?, ?, FALSE, 'active')"
            );
            $stmt->execute([
                $name,
                $email,
                $phone,
                Security::hashPassword($password),
                $verificationToken
            ]);
            $userId = Database::lastInsertId();
            $roleStmt = Database::getInstance()->prepare("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, 7)");
            $roleStmt->execute([$userId]);
            Database::commit();

            return ['success' => true, 'user_id' => $userId, 'verification_token' => $verificationToken];
        } catch (Exception $e) {
            Database::rollback();
            error_log('Registration error: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Registration failed'];
        }
    }

    private static function logFailedLogin(string $email): void
    {
        $stmt = Database::getInstance()->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            $attempts = $user['login_attempts'] + 1;
            $lockout = null;
            if ($attempts >= 5) {
                $lockout = date('Y-m-d H:i:s', strtotime('+30 minutes'));
            }
            $stmt = Database::getInstance()->prepare(
                "UPDATE users SET login_attempts = ?, lockout_until = ? WHERE id = ?"
            );
            $stmt->execute([$attempts, $lockout, $user['id']]);
        }

        Security::logAudit(0, 'failed_login', 'users', $user['id'] ?? null, [], ['email' => $email, 'ip' => Security::getClientIP()]);
    }

    public static function setResetToken(string $email): ?string
    {
        $stmt = Database::getInstance()->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if (!$stmt->fetch()) {
            return null;
        }

        $token = Security::generateSecureToken(32);
        $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

        $stmt = Database::getInstance()->prepare("UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?");
        $stmt->execute([$token, $expires, $email]);

        return $token;
    }

    public static function resetPassword(string $token, string $password): bool
    {
        if (strlen($password) < 8) {
            return false;
        }

        $stmt = Database::getInstance()->prepare(
            "SELECT id FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()"
        );
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if (!$user) {
            return false;
        }

        $stmt = Database::getInstance()->prepare(
            "UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?"
        );
        $stmt->execute([Security::hashPassword($password), $user['id']]);

        Security::logAudit($user['id'], 'password_reset', 'users', $user['id']);

        return true;
    }

    public static function verifyEmail(string $token): bool
    {
        $stmt = Database::getInstance()->prepare(
            "UPDATE users SET email_verified = TRUE, email_verification_token = NULL WHERE email_verification_token = ? AND email_verified = FALSE"
        );
        $stmt->execute([$token]);
        return $stmt->rowCount() > 0;
    }
}
