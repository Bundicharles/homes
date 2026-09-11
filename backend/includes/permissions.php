<?php
declare(strict_types=1);

class Permissions
{
    private static array $permissionsCache = [];

    private static array $aliases = [
        'viewing_requests.view' => 'viewings.view',
        'viewing_requests.edit' => 'viewings.edit',
        'viewing_requests.assign' => 'viewings.assign',
        'viewings.view' => 'viewing_requests.view',
        'viewings.edit' => 'viewing_requests.edit',
        'viewings.assign' => 'viewing_requests.assign',
    ];

    public static function hasPermission(int $userId, string $permission): bool
    {
        $userPermissions = self::getUserPermissions($userId);
        if (in_array($permission, $userPermissions, true)) {
            return true;
        }
        if (isset(self::$aliases[$permission]) && in_array(self::$aliases[$permission], $userPermissions, true)) {
            return true;
        }
        return false;
    }

    public static function hasPermissionByRole(int $roleId, string $permission): bool
    {
        $rolePermissions = self::getRolePermissions($roleId);
        if (in_array($permission, $rolePermissions, true)) {
            return true;
        }
        if (isset(self::$aliases[$permission]) && in_array(self::$aliases[$permission], $rolePermissions, true)) {
            return true;
        }
        return false;
    }

    public static function getUserPermissions(int $userId): array
    {
        if (isset(self::$permissionsCache[$userId])) {
            return self::$permissionsCache[$userId];
        }

        $stmt = Database::getInstance()->prepare(
            "SELECT DISTINCT p.name as permission FROM permissions p
             JOIN role_permissions rp ON rp.permission_id = p.id
             WHERE rp.role_id IN (
                SELECT u.role_id FROM users u WHERE u.id = ? AND u.role_id IS NOT NULL
                UNION
                SELECT ur.role_id FROM user_roles ur WHERE ur.user_id = ?
             )"
        );
        $stmt->execute([$userId, $userId]);
        $permissions = array_column($stmt->fetchAll(), 'permission');

        self::$permissionsCache[$userId] = $permissions;
        return $permissions;
    }

    public static function getRolePermissions(int $roleId): array
    {
        $cacheKey = "role_{$roleId}";
        if (isset(self::$permissionsCache[$cacheKey])) {
            return self::$permissionsCache[$cacheKey];
        }

        $stmt = Database::getInstance()->prepare(
            "SELECT p.name as permission FROM role_permissions rp
             JOIN permissions p ON rp.permission_id = p.id
             WHERE rp.role_id = ?"
        );
        $stmt->execute([$roleId]);
        $permissions = array_column($stmt->fetchAll(), 'permission');

        self::$permissionsCache[$cacheKey] = $permissions;
        return $permissions;
    }

    public static function requirePermission(?int $userId, string $permission, bool $orAdmin = true): void
    {
        if ($userId === null) {
            Response::unauthorized('Authentication required');
        }
        if ($orAdmin && self::isAdmin($userId)) {
            return;
        }

        if (!self::hasPermission($userId, $permission)) {
            Response::forbidden('Insufficient permissions to perform this action');
        }
    }

    public static function isAdmin(int $userId): bool
    {
        $user = Auth::getCurrentUser();
        if (!$user) {
            return false;
        }
        return in_array($user['role_slug'], ['super-admin', 'administrator'], true);
    }

    public static function isStaff(int $userId): bool
    {
        $user = Auth::getCurrentUser();
        if (!$user) {
            return false;
        }
        return !empty($user['role_slug']) && $user['role_slug'] !== 'customer';
    }

    public static function isCustomer(): bool
    {
        $user = Auth::getCurrentUser();
        if (!$user) {
            return false;
        }
        return $user['role_slug'] === 'customer';
    }

    public static function getCurrentUserPermissions(): array
    {
        $user = Auth::getCurrentUser();
        if (!$user) {
            return [];
        }
        return self::getUserPermissions($user['id']);
    }

    public static function getPermissionList(): array
    {
        $stmt = Database::getInstance()->query("SELECT name, description, group_name FROM permissions ORDER BY group_name, name");
        return $stmt->fetchAll();
    }

    public static function getRolePermissionMatrix(): array
    {
        $roles = Database::getInstance()->query("SELECT id, name, slug FROM roles ORDER BY sort_order");
        $permissions = self::getPermissionList();
        $matrix = [];
        foreach ($roles as $role) {
            $matrix[$role['slug']] = [
                'id' => $role['id'],
                'name' => $role['name'],
                'permissions' => self::getRolePermissions($role['id'])
            ];
        }
        return $matrix;
    }
}
