<?php
declare(strict_types=1);

class Validation
{
    public static function isValidEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function isValidPhone(string $phone): bool
    {
        $phone = preg_replace('/[\s\-\(\)]/', '', $phone);
        return preg_match('/^\+?\d{9,15}$/', $phone);
    }

    public static function isValidSlug(string $slug): bool
    {
        return preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug);
    }

    public static function sanitizeString(string $input): string
    {
        $input = trim($input);
        $input = strip_tags($input);
        return trim($input);
    }

    public static function sanitizeHtml(string $input): string
    {
        $allowedTags = '<p><br><strong><b><em><i><u><a><ul><ol><li><h1><h2><h3><h4><h5><h6><blockquote><code><pre><hr><span><div><table><thead><tbody><tr><td><th><img>';
        return trim(strip_tags($input, $allowedTags));
    }

    public static function validateRequired(array $data, array $requiredFields): array
    {
        $errors = [];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
                $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' is required';
            }
        }
        return $errors;
    }

    public static function validate(array $data, array $rules): array
    {
        $errors = [];

        foreach ($rules as $field => $rule) {
            $value = $data[$field] ?? null;
            $fieldLabel = str_replace('_', ' ', $field);

            if (in_array('required', $rule) && ($value === null || (is_string($value) && trim($value) === ''))) {
                $errors[$field] = ucfirst($fieldLabel) . ' is required';
                continue;
            }

            if ($value === null || $value === '') {
                continue;
            }

            if (in_array('email', $rule) && !self::isValidEmail($value)) {
                $errors[$field] = ucfirst($fieldLabel) . ' must be a valid email address';
            }

            if (in_array('phone', $rule) && !self::isValidPhone($value)) {
                $errors[$field] = ucfirst($fieldLabel) . ' must be a valid phone number';
            }

            if (in_array('url', $rule) && !filter_var($value, FILTER_VALIDATE_URL)) {
                $errors[$field] = ucfirst($fieldLabel) . ' must be a valid URL';
            }

            if (isset($rule['min']) && is_string($value) && strlen($value) < $rule['min']) {
                $errors[$field] = ucfirst($fieldLabel) . ' must be at least ' . $rule['min'] . ' characters';
            }

            if (isset($rule['max']) && is_string($value) && strlen($value) > $rule['max']) {
                $errors[$field] = ucfirst($fieldLabel) . ' must not exceed ' . $rule['max'] . ' characters';
            }

            if (isset($rule['min_numeric']) && is_numeric($value) && $value < $rule['min_numeric']) {
                $errors[$field] = ucfirst($fieldLabel) . ' must be at least ' . $rule['min_numeric'];
            }

            if (isset($rule['max_numeric']) && is_numeric($value) && $value > $rule['max_numeric']) {
                $errors[$field] = ucfirst($fieldLabel) . ' must not exceed ' . $rule['max_numeric'];
            }
        }

        return $errors;
    }

    public static function validateImageUpload(array $file): array
    {
        $errors = [];

        if (!isset($file['error']) || $file['error'] === UPLOAD_ERR_NO_FILE) {
            $errors[] = 'No file uploaded';
            return $errors;
        }

        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors[] = 'Upload error';
            return $errors;
        }

        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];
        if (!in_array($extension, $allowedExtensions)) {
            $errors[] = 'Only image files (JPG, PNG, GIF, WebP, AVIF) are allowed';
        }

        $maxSize = 10 * 1024 * 1024;
        if ($file['size'] > $maxSize) {
            $errors[] = 'Image must be under 10MB';
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
        if (!in_array($mimeType, $allowedMimes)) {
            $errors[] = 'Invalid image file type';
        }

        return $errors;
    }

    public static function formatPhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[\s\-\(\)]/', '', $phone);
        if (str_starts_with($phone, '0')) {
            $phone = '+254' . substr($phone, 1);
        } elseif (str_starts_with($phone, '254')) {
            $phone = '+' . $phone;
        }
        return $phone;
    }
}
