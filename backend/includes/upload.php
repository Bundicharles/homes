<?php
declare(strict_types=1);

class Upload
{
    public static function uploadFile(array $file, string $directory, ?array $allowedTypes = null): array
    {
        if (!isset($file['error']) || $file['error'] === UPLOAD_ERR_NO_FILE) {
            return ['success' => false, 'message' => 'No file uploaded'];
        }

        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => self::getUploadErrorMessage($file['error'])];
        }

        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $forbiddenExtensions = ['php', 'php3', 'php4', 'php5', 'phtml', 'phar', 'exe', 'sh', 'bat', 'cmd', 'ps1', 'js', 'jsp', 'asp', 'aspx', 'cgi', 'pl', 'py', 'rb'];

        if (in_array($extension, $forbiddenExtensions)) {
            return ['success' => false, 'message' => 'File type not allowed'];
        }

        if ($allowedTypes === null) {
            $allowedTypesConfig = Config::get('upload_allowed_types', 'jpg,jpeg,png,gif,webp,avif,svg,pdf,doc,docx,xls,xlsx,txt,mp4,webm,mov,avi,mkv,mp3,wav');
            $allowedTypes = array_map('trim', explode(',', $allowedTypesConfig));
        }

        if (!in_array($extension, $allowedTypes)) {
            return ['success' => false, 'message' => 'File type not allowed'];
        }

        $maxSizeConfig = Config::get('upload_max_size', 10240);
        $maxSize = self::parseSizeToBytes($maxSizeConfig);
        if ($file['size'] > $maxSize) {
            return ['success' => false, 'message' => 'File size exceeds maximum allowed size'];
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']) ?: 'application/octet-stream';

        $mimeValidationErrors = self::validateMimeType($extension, $mimeType);
        if (!empty($mimeValidationErrors)) {
            return ['success' => false, 'message' => $mimeValidationErrors[0]];
        }

        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];
        if (in_array($extension, $imageExtensions) && (str_contains($directory, 'images') || str_contains($directory, 'properties') || str_contains($directory, 'branding'))) {
            $imageCheck = @getimagesize($file['tmp_name']);
            if ($imageCheck === false && in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                return ['success' => false, 'message' => 'Invalid image file'];
            }
        }

        $uploadDir = __DIR__ . '/../uploads/' . $directory;
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $filename = self::generateUniqueFilename($extension, $uploadDir);
        $filePath = $uploadDir . '/' . $filename;
        $relativePath = 'uploads/' . $directory . '/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            return ['success' => false, 'message' => 'Failed to move uploaded file'];
        }

        $fileSize = filesize($filePath);
        $dimensions = null;
        if (str_contains($mimeType, 'image')) {
            $imageInfo = @getimagesize($filePath);
            if ($imageInfo) {
                $dimensions = $imageInfo[0] . 'x' . $imageInfo[1];
            }
        }

        return [
            'success' => true,
            'filename' => $filename,
            'file_path' => $relativePath,
            'full_path' => $filePath,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'dimensions' => $dimensions
        ];
    }

    public static function uploadPropertyImage(array $file): array
    {
        $result = self::uploadFile($file, 'properties', ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif']);
        if (!$result['success']) {
            return $result;
        }

        $optimized = self::optimizeImage($result['full_path'], $result['mime_type']);
        if (!$optimized) {
            return ['success' => false, 'message' => 'Failed to process image'];
        }

        $result['file_size'] = filesize($result['full_path']);
        $imageInfo = @getimagesize($result['full_path']);
        $result['width'] = $imageInfo[0] ?? null;
        $result['height'] = $imageInfo[1] ?? null;

        return $result;
    }

    public static function uploadImage(array $file, string $directory = 'agents'): array
    {
        return self::uploadFile($file, $directory, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif']);
    }

    public static function uploadDocument(array $file): array
    {
        $allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
        return self::uploadFile($file, 'documents', $allowedTypes);
    }

    public static function uploadMedia(array $file): array
    {
        $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'mp4', 'webm', 'mov', 'avi', 'mkv', 'mp3', 'wav', 'pdf'];
        return self::uploadFile($file, 'media', $allowedTypes);
    }

    public static function uploadBranding(array $file): array
    {
        return self::uploadFile($file, 'branding', ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico']);
    }

    public static function deleteFile(string $relativePath): bool
    {
        $fullPath = __DIR__ . '/../' . $relativePath;
        if (file_exists($fullPath)) {
            return unlink($fullPath);
        }
        return false;
    }

    public static function serveProtectedDocument(int $documentId): void
    {
        $stmt = Database::getInstance()->prepare(
            "SELECT * FROM property_documents WHERE id = ?"
        );
        $stmt->execute([$documentId]);
        $document = $stmt->fetch();

        if (!$document) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Document not found']);
            exit;
        }

        $user = Auth::getCurrentUser();
        if (!$user) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            exit;
        }

        $stmt = Database::getInstance()->prepare(
            "SELECT p.id, p.created_by FROM properties p 
             WHERE p.id = (SELECT property_id FROM property_documents WHERE id = ?)"
        );
        $stmt->execute([$documentId]);
        $property = $stmt->fetch();

        $isPropertyAdmin = $property && (
            $property['created_by'] == $user['id'] ||
            Permissions::isAdmin($user['id'])
        );

        $stmt = Database::getInstance()->prepare(
            "SELECT id FROM property_agents pa JOIN properties p ON pa.property_id = p.id 
             WHERE p.id = ? AND pa.agent_id IN (
                 SELECT a.id FROM agents a 
                 JOIN properties p2 ON TRUE 
                 WHERE a.email = ?
             )"
        );
        $stmt->execute([$document['property_id'], $user['email']]);
        $isAssignedAgent = $stmt->fetch() !== false;

        $isInquirer = false;
        $stmt = Database::getInstance()->prepare(
            "SELECT id FROM inquiries WHERE property_id = ? AND (user_id = ? OR email = ?)"
        );
        $stmt->execute([$document['property_id'], $user['id'], $user['email']]);
        $isInquirer = $stmt->fetch() !== false;

        if (!$isPropertyAdmin && !$isAssignedAgent && !$isInquirer && !Permissions::isAdmin($user['id'])) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Access denied']);
            exit;
        }

        $fullPath = __DIR__ . '/../' . $document['file_path'];
        if (!file_exists($fullPath)) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'File not found on disk']);
            exit;
        }

        $extension = strtolower(pathinfo($document['filename'], PATHINFO_EXTENSION));
        $mimeTypes = [
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'txt' => 'text/plain',
        ];
        $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';

        header('Content-Type: ' . $mimeType);
        header('Content-Disposition: inline; filename="' . basename($document['filename']) . '"');
        header('Content-Length: ' . filesize($fullPath));
        header('Cache-Control: private, max-age=3600');
        readfile($fullPath);
        exit;
    }

    private static function generateUniqueFilename(string $extension, string $directory): string
    {
        $maxAttempts = 100;
        for ($i = 0; $i < $maxAttempts; $i++) {
            $filename = date('Ymd') . '_' . uniqid() . '.' . $extension;
            if (!file_exists($directory . '/' . $filename)) {
                return $filename;
            }
        }
        return date('Ymd') . '_' . uniqid() . '_' . random_int(1000, 9999) . '.' . $extension;
    }

    private static function getUploadErrorMessage(int $error): string
    {
        return match ($error) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'File is too large',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload',
            default => 'Unknown upload error',
        };
    }

    public static function parseSizeToBytes(int|string $size): int
    {
        if (is_numeric($size)) {
            // If configured as an integer, it is in Megabytes (e.g. 10240 for 10GB)
            return (int)$size * 1024 * 1024;
        }

        $size = trim((string)$size);
        $upper = strtoupper($size);
        $val = (float)$size;

        if (str_ends_with($upper, 'GB') || str_ends_with($upper, 'G')) {
            return (int)($val * 1024 * 1024 * 1024);
        }
        if (str_ends_with($upper, 'MB') || str_ends_with($upper, 'M')) {
            return (int)($val * 1024 * 1024);
        }
        if (str_ends_with($upper, 'KB') || str_ends_with($upper, 'K')) {
            return (int)($val * 1024);
        }
        return (int)$val;
    }

    private static function validateMimeType(string $extension, string $mimeType): array
    {
        $allowedMimes = [
            'jpg' => ['image/jpeg', 'image/pjpeg'],
            'jpeg' => ['image/jpeg', 'image/pjpeg'],
            'png' => ['image/png', 'image/x-png'],
            'gif' => ['image/gif'],
            'webp' => ['image/webp'],
            'avif' => ['image/avif'],
            'svg' => ['image/svg+xml', 'text/plain', 'text/xml'],
            'ico' => ['image/x-icon', 'image/vnd.microsoft.icon'],
            'pdf' => ['application/pdf'],
            'doc' => ['application/msword'],
            'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'xls' => ['application/vnd.ms-excel'],
            'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            'txt' => ['text/plain'],
            'mp4' => ['video/mp4', 'application/mp4'],
            'webm' => ['video/webm', 'audio/webm'],
            'mov' => ['video/quicktime'],
            'avi' => ['video/x-msvideo', 'video/avi', 'video/msvideo'],
            'mkv' => ['video/x-matroska', 'video/mkv'],
            'mp3' => ['audio/mpeg', 'audio/mp3', 'audio/mpg'],
            'wav' => ['audio/wav', 'audio/x-wav', 'audio/wave'],
        ];

        if (isset($allowedMimes[$extension]) && !in_array($mimeType, $allowedMimes[$extension])) {
            return ['MIME type does not match file extension'];
        }

        return [];
    }

    private static function optimizeImage(string $filePath, string $mimeType): bool
    {
        $quality = 85;
        $maxWidth = 1920;
        $maxHeight = 1080;

        if (str_starts_with($mimeType, 'image/webp')) {
            $image = @imagecreatefromwebp($filePath);
        } elseif (str_starts_with($mimeType, 'image/avif')) {
            $image = @imagecreatefromavif($filePath);
        } elseif (str_starts_with($mimeType, 'image/jpeg')) {
            $image = @imagecreatefromjpeg($filePath);
        } elseif (str_starts_with($mimeType, 'image/png')) {
            $image = @imagecreatefrompng($filePath);
        } elseif (str_starts_with($mimeType, 'image/gif')) {
            $image = @imagecreatefromgif($filePath);
        }

        if (!$image) {
            $image = @imagecreatefromstring(file_get_contents($filePath));
            if (!$image) {
                return true;
            }
        }

        $width = imagesx($image);
        $height = imagesy($image);

        if ($width > $maxWidth || $height > $maxHeight) {
            $ratio = min($maxWidth / $width, $maxHeight / $height);
            $newWidth = (int)($width * $ratio);
            $newHeight = (int)($height * $ratio);

            $resized = imagecreatetruecolor($newWidth, $newHeight);

            if ($mimeType === 'image/png' || $mimeType === 'image/gif' || $mimeType === 'image/webp' || $mimeType === 'image/avif') {
                imagealphablending($resized, false);
                imagesavealpha($resized, true);
                $transparent = imagecolorallocatealpha($resized, 255, 255, 255, 127);
                imagefilledrectangle($resized, 0, 0, $newWidth, $newHeight, $transparent);
            }

            imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagedestroy($image);
            $image = $resized;
            $width = $newWidth;
            $height = $newHeight;
        }

        $result = false;
        switch ($mimeType) {
            case 'image/jpeg':
                $result = imagejpeg($image, $filePath, $quality);
                break;
            case 'image/png':
                $result = imagepng($image, $filePath, 6);
                break;
            case 'image/gif':
                $result = imagegif($image, $filePath);
                break;
            case 'image/webp':
                $result = imagewebp($image, $filePath, $quality);
                break;
            case 'image/avif':
                $result = imageavif($image, $filePath, $quality);
                break;
        }

        imagedestroy($image);
        return $result !== false;
    }
}
