<?php

ApiRouter::add('GET', '/sitemap.xml', function($params) {
    $baseUrl = rtrim(Config::get('frontend_url'), '/');

    $urls = [];

    $urls[] = [
        'loc' => $baseUrl . '/',
        'changefreq' => 'daily',
        'priority' => '1.0'
    ];

    $pages = Database::getInstance()->query("SELECT slug, updated_at FROM pages WHERE status = 'published' AND is_system = TRUE");
    foreach ($pages as $page) {
        $urls[] = [
            'loc' => $baseUrl . '/' . $page['slug'],
            'changefreq' => 'monthly',
            'priority' => '0.8'
        ];
    }

    $stmt = Database::getInstance()->query("SELECT slug, updated_at FROM properties WHERE status IN ('Published','Available') ORDER BY published_at DESC LIMIT 100");
    foreach ($stmt as $prop) {
        $urls[] = [
            'loc' => $baseUrl . '/properties/' . $prop['slug'],
            'changefreq' => 'weekly',
            'priority' => '0.9'
        ];
    }

    header('Content-Type: application/xml; charset=utf-8');
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    foreach ($urls as $url) {
        echo "  <url>\n";
        echo "    <loc>" . htmlspecialchars($url['loc'], ENT_XML1) . "</loc>\n";
        echo "    <changefreq>{$url['changefreq']}</changefreq>\n";
        echo "    <priority>{$url['priority']}</priority>\n";
        echo "  </url>\n";
    }
    echo '</urlset>';
    exit;
}, 'public');

ApiRouter::add('GET', '/robots.txt', function($params) {
    $baseUrl = rtrim(Config::get('frontend_url'), '/');

    $robots = "User-agent: *\n";
    $robots .= "Allow: /\n\n";
    $robots .= "Disallow: /admin/\n";
    $robots .= "Disallow: /api/private/\n";
    $robots .= "Disallow: /account/\n";
    $robots .= "Disallow: /uploads/documents/\n";
    $robots .= "Disallow: /uploads/branding/\n\n";
    $robots .= "Sitemap: {$baseUrl}/sitemap.xml\n";

    header('Content-Type: text/plain; charset=utf-8');
    echo $robots;
    exit;
}, 'public');

ApiRouter::add('GET', '/seo/metadata', function($params) {
    $pageType = $GLOBALS['_GET_PARAMS']['page_type'] ?? 'home';
    $slug = $GLOBALS['_GET_PARAMS']['slug'] ?? null;

    $stmt = Database::getInstance()->prepare(
        "SELECT * FROM seo_metadata WHERE page_type = ? AND (slug = ? OR slug IS NULL)"
    );
    $stmt->execute([$pageType, $slug]);
    $seo = $stmt->fetch();

    if (!$seo) {
        $stmt = Database::getInstance()->prepare("SELECT * FROM seo_metadata WHERE page_type = ? AND is_indexed = TRUE");
        $stmt->execute([$pageType]);
        $seo = $stmt->fetch();
    }

    if (!$seo) {
        $stmt = Database::getInstance()->query("SELECT * FROM seo_metadata WHERE page_type = 'global' OR page_type = 'home' LIMIT 1");
        $seo = $stmt->fetch();
    }

    Response::success($seo ?? []);
}, 'public');

ApiRouter::add('GET', '/seo/metadata/{page_type}', function($params) {
    $stmt = Database::getInstance()->prepare("SELECT * FROM seo_metadata WHERE page_type = ? LIMIT 1");
    $stmt->execute([$params['page_type']]);
    $seo = $stmt->fetch();

    if (!$seo) {
        $stmt = Database::getInstance()->query("SELECT * FROM seo_metadata WHERE page_type = 'global' OR page_type = 'home' LIMIT 1");
        $seo = $stmt->fetch();
    }

    Response::success($seo ?? []);
}, 'public');

ApiRouter::add('PUT', '/admin/seo/{page_type}', function($params) {
    $user = Auth::getCurrentUser();
    Permissions::requirePermission($user['id'], 'seo.edit');

    $data = $GLOBALS['_INPUT'];
    $stmt = Database::getInstance()->prepare(
        "INSERT INTO seo_metadata (page_type, slug, meta_title, meta_description, meta_keywords, 
        canonical_url, og_title, og_description, og_image, og_type, twitter_card, is_indexed) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        meta_title = VALUES(meta_title), meta_description = VALUES(meta_description), 
        meta_keywords = VALUES(meta_keywords), canonical_url = VALUES(canonical_url),
        og_title = VALUES(og_title), og_description = VALUES(og_description), 
        og_image = VALUES(og_image), og_type = VALUES(og_type), 
        twitter_card = VALUES(twitter_card), is_indexed = VALUES(is_indexed)"
    );
    $stmt->execute([
        $params['page_type'],
        $data['slug'] ?? null,
        $data['meta_title'] ?? null,
        $data['meta_description'] ?? null,
        $data['meta_keywords'] ?? null,
        $data['canonical_url'] ?? null,
        $data['og_title'] ?? null,
        $data['og_description'] ?? null,
        $data['og_image'] ?? null,
        $data['og_type'] ?? 'website',
        $data['twitter_card'] ?? 'summary_large_image',
        $data['is_indexed'] ? 1 : 0
    ]);

    Security::logAudit($user['id'], 'updated_seo', 'seo_metadata', null, [], $data);
    Response::success(null, 'SEO settings updated');
}, 'permission', 'seo.edit');
