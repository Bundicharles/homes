-- ============================================================================
-- REAL ESTATE PLATFORM - SEED DATA
-- ============================================================================
-- Run AFTER importing schema.sql
-- ============================================================================

USE real_estate_platform;

-- ============================================================================
-- ROLES
-- ============================================================================

INSERT INTO roles (name, slug, description, sort_order) VALUES
('Super Admin', 'super-admin', 'Full system access', 1),
('Administrator', 'administrator', 'Administrative access', 2),
('Property Manager', 'property-manager', 'Manage properties and agents', 3),
('Sales Agent', 'sales-agent', 'Sales and client management', 4),
('Content Manager', 'content-manager', 'Manage website content', 5),
('Support', 'support', 'Customer support access', 6),
('Customer', 'customer', 'Registered customer/visitor', 7);

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

INSERT INTO permissions (name, description, group_name) VALUES
-- Properties
('properties.view', 'View properties', 'properties'),
('properties.create', 'Create properties', 'properties'),
('properties.edit', 'Edit properties', 'properties'),
('properties.delete', 'Delete properties', 'properties'),
('properties.publish', 'Publish properties', 'properties'),
('properties.unpublish', 'Unpublish properties', 'properties'),
('properties.feature', 'Feature properties', 'properties'),

-- Property Types
('property_types.view', 'View property types', 'properties'),
('property_types.create', 'Create property types', 'properties'),
('property_types.edit', 'Edit property types', 'properties'),
('property_types.delete', 'Delete property types', 'properties'),

-- Features
('features.view', 'View features', 'properties'),
('features.create', 'Create features', 'properties'),
('features.edit', 'Edit features', 'properties'),
('features.delete', 'Delete features', 'properties'),

-- Documents
('documents.view', 'View documents', 'properties'),
('documents.upload', 'Upload documents', 'properties'),
('documents.delete', 'Delete documents', 'properties'),

-- Verification
('verification.view', 'View verifications', 'properties'),
('verification.edit', 'Edit verifications', 'properties'),

-- Messages
('messages.view', 'View messages', 'messages'),
('messages.reply', 'Reply to messages', 'messages'),
('messages.delete', 'Delete messages', 'messages'),
('messages.assign', 'Assign messages', 'messages'),

-- Customers
('customers.view', 'View customers', 'customers'),
('customers.edit', 'Edit customers', 'customers'),
('customers.disable', 'Disable customers', 'customers'),

-- Agents
('agents.view', 'View agents', 'agents'),
('agents.create', 'Create agents', 'agents'),
('agents.edit', 'Edit agents', 'agents'),
('agents.delete', 'Delete agents', 'agents'),

-- Viewing Requests
('viewings.view', 'View viewing requests', 'viewings'),
('viewings.edit', 'Edit viewing requests', 'viewings'),
('viewings.assign', 'Assign viewing requests', 'viewings'),

-- Promotions
('promotions.view', 'View promotions', 'promotions'),
('promotions.create', 'Create promotions', 'promotions'),
('promotions.edit', 'Edit promotions', 'promotions'),
('promotions.delete', 'Delete promotions', 'promotions'),

-- Media
('media.view', 'View media', 'media'),
('media.upload', 'Upload media', 'media'),
('media.delete', 'Delete media', 'media'),

-- Pages
('pages.view', 'View pages', 'pages'),
('pages.create', 'Create pages', 'pages'),
('pages.edit', 'Edit pages', 'pages'),
('pages.delete', 'Delete pages', 'pages'),

-- Menus
('menus.view', 'View menus', 'pages'),
('menus.edit', 'Edit menus', 'pages'),

-- Testimonials
('testimonials.view', 'View testimonials', 'content'),
('testimonials.create', 'Create testimonials', 'content'),
('testimonials.edit', 'Edit testimonials', 'content'),
('testimonials.delete', 'Delete testimonials', 'content'),
('testimonials.approve', 'Approve testimonials', 'content'),

-- FAQs
('faqs.view', 'View FAQs', 'content'),
('faqs.create', 'Create FAQs', 'content'),
('faqs.edit', 'Edit FAQs', 'content'),
('faqs.delete', 'Delete FAQs', 'content'),

-- Settings
('settings.view', 'View settings', 'settings'),
('settings.edit', 'Edit settings', 'settings'),

-- Users
('users.view', 'View users', 'users'),
('users.create', 'Create users', 'users'),
('users.edit', 'Edit users', 'users'),
('users.delete', 'Delete users', 'users'),

-- Roles
('roles.view', 'View roles', 'users'),
('roles.edit', 'Edit roles', 'users'),

-- Analytics
('analytics.view', 'View analytics', 'analytics'),

-- Audit Logs
('audit_logs.view', 'View audit logs', 'settings'),

-- SEO
('seo.view', 'View SEO settings', 'settings'),
('seo.edit', 'Edit SEO settings', 'settings'),

-- EARB
('earb.view', 'View EARB info', 'settings'),
('earb.edit', 'Edit EARB info', 'settings');

-- ============================================================================
-- ROLE PERMISSIONS (Super Admin gets all)
-- ============================================================================

INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, p.id FROM permissions p;

-- Administrator gets all except system-level
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, p.id FROM permissions p WHERE p.name NOT IN ('roles.edit', 'audit_logs.view');

-- Property Manager
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, (SELECT id FROM permissions WHERE name='properties.view')),
(3, (SELECT id FROM permissions WHERE name='properties.create')),
(3, (SELECT id FROM permissions WHERE name='properties.edit')),
(3, (SELECT id FROM permissions WHERE name='properties.publish')),
(3, (SELECT id FROM permissions WHERE name='properties.unpublish')),
(3, (SELECT id FROM permissions WHERE name='property_types.view')),
(3, (SELECT id FROM permissions WHERE name='features.view')),
(3, (SELECT id FROM permissions WHERE name='documents.view')),
(3, (SELECT id FROM permissions WHERE name='verification.view')),
(3, (SELECT id FROM permissions WHERE name='verification.edit')),
(3, (SELECT id FROM permissions WHERE name='agents.view')),
(3, (SELECT id FROM permissions WHERE name='messages.view')),
(3, (SELECT id FROM permissions WHERE name='messages.reply')),
(3, (SELECT id FROM permissions WHERE name='viewings.view')),
(3, (SELECT id FROM permissions WHERE name='viewings.edit')),
(3, (SELECT id FROM permissions WHERE name='viewings.assign')),
(3, (SELECT id FROM permissions WHERE name='analytics.view')),
(3, (SELECT id FROM permissions WHERE name='pages.view'));

-- ============================================================================
-- SUPER ADMIN USER
-- ============================================================================

INSERT INTO users (role_id, name, email, phone, password_hash, email_verified, status) VALUES
(1, 'Super Administrator', 'admin@realestate.co.ke', '+254 700 000 001', '$2y$10$2M4qSHP2ZWRM8ZKi0s0bGeDgnLgnb/AB/Y8g.eNsrSk9TJU/dLGEm', TRUE, 'active');

-- ============================================================================
-- PROPERTY TYPES
-- ============================================================================

INSERT INTO property_types (name, slug, icon, sort_order, is_active) VALUES
('Apartment', 'apartment', 'Home', 1, TRUE),
('Villa', 'villa', 'Home', 2, TRUE),
('Maisonette', 'maisonette', 'Home', 3, TRUE),
('Bungalow', 'bungalow', 'Home', 4, TRUE),
('Townhouse', 'townhouse', 'Home', 5, TRUE),
('Mansion', 'mansion', 'Home', 6, TRUE),
('Office', 'office', 'Building', 7, TRUE),
('Warehouse', 'warehouse', 'Building', 8, TRUE),
('Commercial Property', 'commercial', 'Building', 9, TRUE),
('Land', 'land', 'Land', 10, TRUE);

-- ============================================================================
-- FEATURES
-- ============================================================================

INSERT INTO features (name, slug, icon, category, is_default, sort_order) VALUES
('Swimming Pool', 'swimming-pool', 'Pool', 'amenities', TRUE, 1),
('Garden', 'garden', 'Tree', 'amenities', TRUE, 2),
('Garage', 'garage', 'Car', 'amenities', TRUE, 3),
('CCTV', 'cctv', 'Video', 'security', TRUE, 4),
('Security', 'security', 'Shield', 'security', TRUE, 5),
('Borehole', 'borehole', 'Water', 'utilities', TRUE, 6),
('Solar Power', 'solar', 'Sun', 'utilities', TRUE, 7),
('Generator', 'generator', 'Zap', 'utilities', TRUE, 8),
('Balcony', 'balcony', 'Wind', 'interior', TRUE, 9),
('DSQ', 'dsq', 'Home', 'interior', TRUE, 10),
('Gym', 'gym', 'Dumbbell', 'amenities', TRUE, 11),
('Playground', 'playground', 'Children', 'amenities', TRUE, 12),
('Internet', 'internet', 'Wifi', 'utilities', TRUE, 13),
('Air Conditioning', 'air-conditioning', 'Snowflake', 'interior', TRUE, 14),
('Built-in Wardrobes', 'wardrobes', 'Wardrobe', 'interior', TRUE, 15),
('Lift/Elevator', 'elevator', 'Elevator', 'building', TRUE, 16),
('Parking', 'parking', 'Car', 'amenities', TRUE, 17),
('Gymnasium', 'gymnasium', 'Dumbbell', 'amenities', TRUE, 18),
('Spa', 'spa', 'Droplet', 'amenities', TRUE, 19),
('Clubhouse', 'clubhouse', 'Building', 'amenities', TRUE, 20),
('Fireplace', 'fireplace', 'Flame', 'interior', TRUE, 21),
('Cinema Room', 'cinema', 'Tv', 'interior', TRUE, 22),
('Study Room', 'study', 'BookOpen', 'interior', TRUE, 23),
('Laundry Room', 'laundry', 'WashingMachine', 'interior', TRUE, 24),
('Walk-in Wardrobe', 'walk-in', 'Wardrobe', 'interior', TRUE, 25);

-- ============================================================================
-- AGENTS
-- ============================================================================

INSERT INTO agents (name, photo, phone, email, bio, registration_number, credentials, license_number, license_expiry, specialization, properties_sold, rating, status) VALUES
('John Mwangi', '/uploads/agents/default-agent-1.jpg', '+254 711 234 567', 'john.mwangi@realestate.co.ke', 'Senior property consultant with over 8 years of experience in Nairobi and Kiambu markets. Specializes in residential luxury properties and commercial investments.', 'REA-00123', '{"registration_number": "REA-00123", "certifying_body": "Real Estate Regulatory Authority", "license_type": "Sales Agent", "valid_until": "2027-12-31"}', 'LIC-2023-0845', '2027-12-31', 'Residential, Commercial', 156, 4.8, 'active'),
('Sarah Atieno', '/uploads/agents/default-agent-2.jpg', '+254 722 345 678', 'sarah.atieno@realestate.co.ke', 'Dedicated real estate professional with expertise in coastal and western Kenya properties. Passionate about helping families find their dream homes.', 'REA-00234', '{"registration_number": "REA-00234", "certifying_body": "Real Estate Regulatory Authority", "license_type": "Sales Agent", "valid_until": "2026-11-30"}', 'LIC-2023-0912', '2026-11-30', 'Coastal Properties', 98, 4.6, 'active'),
('David Ochieng', '/uploads/agents/default-agent-3.jpg', '+254 733 456 789', 'david.ochieng@realestate.co.ke', 'Commercial property specialist with a focus on office spaces and retail outlets in Nairobi''s central business district.', 'REA-00345', '{"registration_number": "REA-00345", "certifying_body": "Real Estate Regulatory Authority", "license_type": "Sales Agent", "valid_until": "2026-09-15"}', 'LIC-2023-1023', '2026-09-15', 'Commercial', 203, 4.9, 'active'),
('Grace Wanjiru', '/uploads/agents/default-agent-4.jpg', '+254 744 567 890', 'grace.wanjiru@realestate.co.ke', 'Residential property expert with deep knowledge of suburban Nairobi markets. Award-winning agent with 10+ years experience.', 'REA-00456', '{"registration_number": "REA-00456", "certifying_body": "Real Estate Regulatory Authority", "license_type": "Sales Agent", "valid_until": "2027-03-20"}', 'LIC-2023-1134', '2027-03-20', 'Residential', 187, 4.7, 'active');

-- ============================================================================
-- EARB INFORMATION
-- ============================================================================

INSERT INTO earb_info (key_name, display_name, value, field_type, sort_order, is_active) VALUES
('earb_registration_number', 'EARB Registration Number', 'REA-001-123456', 'text', 1, TRUE),
('practicing_certificate', 'Practicing Certificate Number', 'PC-2024-001', 'text', 2, TRUE),
('practicing_certificate_expiry', 'Practicing Certificate Expiry', '2025-12-31', 'date', 3, TRUE),
('broker_name', 'Broker Name', 'Prime Realty Kenya Ltd', 'text', 4, TRUE),
('broker_license', 'Broker License Number', 'BL-2024-REAL-789', 'text', 5, TRUE),
('regulatory_body', 'Regulatory Body', 'Real Estate Regulatory Authority (EARBA)', 'text', 6, TRUE),
('verification_notes', 'Verification Notes', 'All agents are duly registered and certified by the Real Estate Regulatory Authority of Kenya.', 'textarea', 7, TRUE);

-- ============================================================================
-- SETTINGS - General
-- ============================================================================

INSERT INTO settings (`key`, `value`, type, group_name, label, description, sort_order, is_public) VALUES
('business_name', 'Prime Realty Kenya Ltd', 'text', 'general', 'Business Name', 'Official business name', 1, TRUE),
('website_name', 'Prime Realty Kenya', 'text', 'general', 'Website Name', 'Name displayed on website', 2, TRUE),
('tagline', 'Your Trusted Partner in Kenyan Real Estate', 'text', 'general', 'Tagline', 'Website tagline', 3, TRUE),
('description', 'Prime Realty Kenya offers professionally managed residential and commercial properties across Kenya. With over 15 years of experience, we help you find, buy, and sell properties with confidence.', 'textarea', 'general', 'Description', 'Website meta description', 4, TRUE),
('default_currency', 'KES', 'select', 'general', 'Default Currency', 'Default currency for property prices', 5, TRUE),
('country', 'Kenya', 'text', 'general', 'Country', 'Primary operating country', 6, TRUE),
('timezone', 'Africa/Nairobi', 'select', 'general', 'Timezone', 'Default timezone', 7, TRUE),
('language', 'en', 'select', 'general', 'Language', 'Default website language', 8, TRUE),
('admin_email', 'admin@realestate.co.ke', 'email', 'general', 'Admin Email', 'Primary admin contact email', 9, FALSE),
('items_per_page', '12', 'number', 'general', 'Items Per Page', 'Number of items per page on website', 10, TRUE),
('maintenance_mode', '0', 'boolean', 'system', 'Maintenance Mode', 'Enable/disable maintenance mode', 1, FALSE),
('customer_registration', '1', 'boolean', 'system', 'Customer Registration', 'Allow public customer registration', 2, FALSE),
('property_inquiries', '1', 'boolean', 'system', 'Property Inquiries', 'Enable property inquiry system', 3, FALSE),
('viewing_requests', '1', 'boolean', 'system', 'Viewing Requests', 'Enable viewing request system', 4, FALSE),
('whatsapp_enabled', '1', 'boolean', 'system', 'WhatsApp Integration', 'Enable WhatsApp integration', 5, FALSE),
('floating_social', '1', 'boolean', 'system', 'Floating Social Buttons', 'Show floating social media buttons', 6, FALSE),
('promotions_enabled', '1', 'boolean', 'system', 'Promotions', 'Enable promotional cards/popups', 7, FALSE),
('testimonials_enabled', '1', 'boolean', 'system', 'Testimonials', 'Enable testimonials section', 8, FALSE),

('contact_phone', '+254 700 000 001', 'text', 'contact', 'Phone Number', 'Primary contact phone number', 1, TRUE),
('contact_whatsapp', '+254 700 000 001', 'text', 'contact', 'WhatsApp Number', 'WhatsApp contact number', 2, TRUE),
('contact_email', 'info@realestate.co.ke', 'email', 'contact', 'Email Address', 'Primary contact email', 3, TRUE),
('contact_secondary_email', 'support@realestate.co.ke', 'email', 'contact', 'Secondary Email', 'Secondary support email', 4, TRUE),
('contact_address', 'Suite 201, Capital Centre, Westlands, Nairobi, Kenya', 'textarea', 'contact', 'Address', 'Physical business address', 5, TRUE),
('contact_county', 'Nairobi', 'text', 'contact', 'County', 'County of operation', 6, TRUE),
('contact_country', 'Kenya', 'text', 'contact', 'Country', 'Country of operation', 7, TRUE),
('contact_opening_hours', 'Monday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 4:00 PM\nSunday: Closed\nPublic Holidays: Closed', 'textarea', 'contact', 'Opening Hours', 'Business opening hours', 8, TRUE),
('contact_map_lat', '-1.2864', 'text', 'contact', 'Map Latitude', 'Google Maps latitude', 9, TRUE),
('contact_map_lng', '36.8172', 'text', 'contact', 'Map Longitude', 'Google Maps longitude', 10, TRUE),
('contact_map_zoom', '12', 'number', 'contact', 'Map Zoom', 'Default map zoom level', 11, TRUE),

('branding_logo', '/uploads/branding/logo-light.png', 'image', 'branding', 'Main Logo', 'Primary website logo', 1, TRUE),
('branding_mobile_logo', '/uploads/branding/logo-mobile.png', 'image', 'branding', 'Mobile Logo', 'Logo for mobile devices', 2, TRUE),
('branding_light_logo', '/uploads/branding/logo-light.png', 'image', 'branding', 'Light Logo', 'Logo for dark backgrounds', 3, TRUE),
('branding_dark_logo', '/uploads/branding/logo-dark.png', 'image', 'branding', 'Dark Logo', 'Logo for light backgrounds', 4, TRUE),
('branding_favicon', '/uploads/branding/favicon.png', 'image', 'branding', 'Favicon', 'Browser favicon', 5, TRUE),
('branding_primary_color', '#2563eb', 'color', 'branding', 'Primary Color', 'Primary brand color', 6, TRUE),
('branding_secondary_color', '#7c3aed', 'color', 'branding', 'Secondary Color', 'Secondary brand color', 7, TRUE),
('branding_accent_color', '#ea580c', 'color', 'branding', 'Accent Color', 'Accent/warm color', 8, TRUE),
('branding_background', '#ffffff', 'color', 'branding', 'Background', 'Page background color', 9, TRUE),
('branding_surface', '#f8fafc', 'color', 'branding', 'Surface', 'Card/surface background color', 10, TRUE),
('branding_text_color', '#1e293b', 'color', 'branding', 'Text Color', 'Primary text color', 11, TRUE),
('branding_muted_text', '#64748b', 'color', 'branding', 'Muted Text', 'Secondary/muted text color', 12, TRUE),
('branding_heading_font', 'Inter', 'select', 'branding', 'Heading Font', 'Font for headings', 13, TRUE),
('branding_body_font', 'Inter', 'select', 'branding', 'Body Font', 'Font for body text', 14, TRUE),

('seo_site_title', 'Prime Realty Kenya | Property Marketplace', 'text', 'seo', 'Site Title', 'SEO site title', 1, TRUE),
('seo_meta_description', 'Prime Realty Kenya offers professionally managed residential and commercial properties across Kenya. Find your perfect home or investment property with our expert agents.', 'textarea', 'seo', 'Meta Description', 'SEO meta description', 2, TRUE),
('seo_default_og_image', '/uploads/branding/og-image.jpg', 'image', 'seo', 'Default OG Image', 'Default Open Graph image', 3, TRUE),
('seo_google_verification', '', 'text', 'seo', 'Google Verification', 'Google Search Console verification code', 4, FALSE),
('seo_bing_verification', '', 'text', 'seo', 'Bing Verification', 'Bing Webmaster verification code', 5, FALSE),
('seo_twitter_card', 'summary_large_image', 'select', 'seo', 'Twitter Card', 'Default Twitter card type', 6, TRUE),
('seo_favicon', '/uploads/branding/favicon.png', 'image', 'seo', 'SEO Favicon', 'SEO favicon path', 7, TRUE),

('smtp_host', '', 'text', 'email', 'SMTP Host', 'SMTP server hostname', 1, FALSE),
('smtp_port', '587', 'number', 'email', 'SMTP Port', 'SMTP server port', 2, FALSE),
('smtp_username', '', 'text', 'email', 'SMTP Username', 'SMTP authentication username', 3, FALSE),
('smtp_password', '', 'text', 'email', 'SMTP Password', 'SMTP authentication password', 4, FALSE),
('smtp_encryption', 'tls', 'select', 'email', 'SMTP Encryption', 'SMTP encryption method', 5, FALSE),
('smtp_from_name', 'Prime Realty Kenya', 'text', 'email', 'From Name', 'Email from name', 6, FALSE),
('smtp_from_email', 'info@realestate.co.ke', 'email', 'email', 'From Email', 'Email from address', 7, FALSE);

-- Security settings (consumed by Admin -> Security Settings)
-- Idempotent: re-running seed.sql will update values instead of failing on duplicates
INSERT INTO settings (`key`, `value`, type, group_name, label, description, sort_order, is_public) VALUES
('session_timeout_minutes', '60', 'number', 'security', 'Session Timeout (minutes)', 'Admin session idle timeout in minutes', 1, FALSE),
('max_login_attempts', '5', 'number', 'security', 'Max Login Attempts', 'Maximum failed login attempts before lockout', 2, FALSE),
('lockout_duration_minutes', '15', 'number', 'security', 'Lockout Duration (minutes)', 'How long an account stays locked after failed attempts', 3, FALSE),
('require_strong_passwords', 'true', 'boolean', 'security', 'Require Strong Passwords', 'Enforce uppercase, lowercase, number, and special character', 4, FALSE),
('enable_two_factor', 'false', 'boolean', 'security', 'Enable 2FA', 'Require two-factor authentication for admin logins', 5, FALSE),
('password_min_length', '8', 'number', 'security', 'Password Minimum Length', 'Minimum length for new passwords', 6, FALSE),
('force_password_reset_days', '0', 'number', 'security', 'Force Password Reset (days)', 'Force password change every N days (0 = never)', 7, FALSE)
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- ============================================================================
-- SOCIAL LINKS
-- ============================================================================

INSERT INTO social_links (platform, url, icon, sort_order, is_active) VALUES
('WhatsApp', 'https://wa.me/254700000001', 'WhatsApp', 1, TRUE),
('Facebook', 'https://facebook.com/primerealtykenya', 'Facebook', 2, TRUE),
('Instagram', 'https://instagram.com/primerealtykenya', 'Instagram', 3, TRUE),
('TikTok', 'https://tiktok.com/@primerealtykenya', 'TikTok', 4, TRUE),
('YouTube', 'https://youtube.com/primerealtykenya', 'YouTube', 5, TRUE),
('LinkedIn', 'https://linkedin.com/company/primerealtykenya', 'LinkedIn', 6, TRUE),
('X', 'https://x.com/primerealtykenya', 'Twitter', 7, TRUE),
('Telegram', 'https://t.me/primerealtykenya', 'Telegram', 8, TRUE);

-- ============================================================================
-- TESTIMONIALS
-- ============================================================================

INSERT INTO testimonials (name, email, phone, rating, title, content, property_id, status, sort_order) VALUES
('Wanjiru Mwangi', 'wanjiru@example.com', '+254 712 345 678', 5, 'Excellent Service!', 'Prime Realty helped me find the perfect home for my family in Karen. The entire process was smooth and professional. Highly recommended!', NULL, 'approved', 1),
('James Ochieng', 'james@example.com', '+254 733 456 789', 5, 'Outstanding!', 'Sold my villa in Mombasa through Prime Realty. They handled everything with professionalism and got me a great deal. Will definitely use again.', NULL, 'approved', 2),
('Mary Atieno', 'mary@example.com', '+254 722 345 678', 4, 'Very Professional', 'The team at Prime Realty made buying my first home a breeze. Great communication and expert guidance throughout.', NULL, 'approved', 3),
('Peter Mutua', 'peter@example.com', '+254 744 567 890', 5, 'Amazing Experience', 'I was able to sell my commercial property quickly thanks to Prime Realty. Their marketing reached the right buyers.', NULL, 'approved', 4);

-- ============================================================================
-- FAQS
-- ============================================================================

INSERT INTO faqs (question, answer, category, sort_order, is_active) VALUES
('How do I search for properties?', 'Use the search bar on the homepage or visit the Properties page. You can filter by location, price, property type, bedrooms, and more.', 'General', 1, TRUE),
('Are the properties verified?', 'We have a multi-step verification process. Look for the "Verified" badge on property listings for properties that have passed our verification checks.', 'Verification', 2, TRUE),
('Can I schedule a viewing?', 'Yes! Each property listing has a "Request Viewing" button. Fill in your preferred date and time, and our agent will confirm your appointment.', 'Process', 3, TRUE),
('How do I save properties I like?', 'Click the heart icon on any property card or listing to save it to your favorites. You can view all your favorites in your customer dashboard.', 'Account', 4, TRUE),
('What documents do I need to buy a property?', 'Typically you need: ID/Passport, KRA PIN, bank statements for the last 3 months, andproof of payment for valuation. We provide a complete checklist after you submit an inquiry.', 'Process', 5, TRUE),
('Can I sell my property through Prime Realty?', 'Absolutely! Contact us through the inquiry form, and our team will provide a free property valuation and discuss our selling packages.', 'Selling', 6, TRUE),
('Do you help with property financing?', 'We have partnerships with major Kenyan banks and financial institutions. Our team can connect you with mortgage advisors who will help you secure financing.', 'Financing', 7, TRUE),
('What areas do you cover?', 'We operate nationwide with offices in Nairobi, Mombasa, Kisumu, and Nakuru. We cover residential and commercial properties across all 47 counties of Kenya.', 'General', 8, TRUE);

-- ============================================================================
-- PAGES
-- ============================================================================

INSERT INTO pages (title, slug, content, status, is_system, sort_order, show_in_menu, parent_id) VALUES
('Home', 'home', '', 'published', TRUE, 1, TRUE, 0),
('About Us', 'about', '', 'published', TRUE, 2, TRUE, 0),
('Services', 'services', '', 'published', TRUE, 3, TRUE, 0),
('Contact', 'contact', '', 'published', TRUE, 4, TRUE, 0),
('Properties', 'properties', '', 'published', TRUE, 5, TRUE, 0),
('Privacy Policy', 'privacy', '', 'published', TRUE, 6, FALSE, 0),
('Terms of Service', 'terms', '', 'published', TRUE, 7, FALSE, 0),
('Property Disclaimer', 'disclaimer', '', 'published', TRUE, 8, FALSE, 0);

-- ============================================================================
-- MENUS
-- ============================================================================

INSERT INTO menus (name, slug, location, is_active) VALUES
('Main Menu', 'main-menu', 'header', TRUE),
('Footer Menu', 'footer-menu', 'footer', TRUE),
('Mobile Menu', 'mobile-menu', 'mobile', TRUE);

INSERT INTO menu_items (menu_id, title, url, target, sort_order, parent_id, is_active, icon) VALUES
(1, 'Home', '/', '_self', 1, 0, TRUE, 'Home'),
(1, 'Properties', '/properties', '_self', 2, 0, TRUE, 'Building'),
(1, 'About', '/about', '_self', 3, 0, TRUE, 'Info'),
(1, 'Services', '/services', '_self', 4, 0, TRUE, 'Tool'),
(1, 'Testimonials', '/#testimonials', '_self', 5, 0, TRUE, 'MessageCircle'),
(1, 'Contact', '/contact', '_self', 6, 0, TRUE, 'Phone'),
(1, 'Login', '/login', '_self', 7, 0, TRUE, 'LogIn'),

(2, 'About', '/about', '_self', 1, 0, TRUE, NULL),
(2, 'Services', '/services', '_self', 2, 0, TRUE, NULL),
(2, 'Contact', '/contact', '_self', 3, 0, TRUE, NULL),
(2, 'Privacy Policy', '/privacy', '_self', 4, 0, TRUE, NULL),
(2, 'Terms', '/terms', '_self', 5, 0, TRUE, NULL),

(3, 'Home', '/', '_self', 1, 0, TRUE, NULL),
(3, 'Properties', '/properties', '_self', 2, 0, TRUE, NULL),
(3, 'About', '/about', '_self', 3, 0, TRUE, NULL),
(3, 'Contact', '/contact', '_self', 4, 0, TRUE, NULL),
(3, 'Login', '/login', '_self', 5, 0, TRUE, NULL);

-- ============================================================================
-- SAMPLE PROPERTIES (3 published, 1 draft)
-- ============================================================================

INSERT INTO properties (property_type_id, name, slug, description, price, currency, location, county, town, area, estate, address, latitude, longitude, bedrooms, bathrooms, parking_spaces, house_size, land_size, floors, year_built, furnishing_status, status, verification_status, featured, views_count, published_at, created_by) VALUES
(2, 'Modern 4-Bedroom Villa in Kitusuru', 'modern-4-bedroom-villa-kitusuru', '<h3>Modern 4-Bedroom Villa in Kitusuru</h3><p>This stunning modern villa is located in the prestigious Kitusuru neighborhood...</p>', 85000000.00, 'KES', 'Kitusuru, Nairobi', 'Nairobi', 'Nairobi', 'Kitusuru', 'Kitusuru', '12 Kitusuru Drive, Nairobi, Kenya', -1.2667, 36.8167, 4, 5, 3, 520.00, 1200.00, 2, 2020, 'Furnished', 'Available', 'Verified', TRUE, 528, '2024-01-15 09:30:00', 1),
(1, 'Luxury 3-Bedroom Apartment in Westlands', 'luxury-3-bedroom-apartment-westlands', '<h3>Luxury 3-Bedroom Apartment in Westlands</h3><p>Spacious luxury apartment with panoramic city views...</p>', 42500000.00, 'KES', 'Westlands, Nairobi', 'Nairobi', 'Nairobi', 'Westlands', 'The Village', 'The Village Apartments, Waiyuki Road, Nairobi', -1.2667, 36.8167, 3, 3, 2, 280.00, 0.00, 1, 2022, 'Semi-Furnished', 'Available', 'Verified', FALSE, 290, '2024-02-10 14:15:00', 1),
(3, 'Beautiful Maisonette in Runda', 'beautiful-maisonette-runda', '<h3>Beautiful Maisonette in Runda</h3><p>Charming maisonette in the heart of Runda with mature gardens...</p>', 58000000.00, 'KES', 'Runda, Nairobi', 'Nairobi', 'Nairobi', 'Runda', 'Runda', '45 Runda Drive, Nairobi, Kenya', -1.2667, 36.8167, 4, 4, 2, 350.00, 800.00, 2, 2019, 'Furnished', 'Reserved', 'Verified', TRUE, 410, '2024-01-20 11:00:00', 1),
(4, 'Executive Bungalow in Karen', 'executive-bungalow-karen', '<h3>Executive Bungalow in Karen</h3><p>Magnificent executive bungalow set on 1 acre of pristine land...</p>', 75000000.00, 'KES', 'Karen, Nairobi', 'Nairobi', 'Nairobi', 'Karen', 'Karen', '189 Karen-Langata Road, Nairobi', -1.2667, 36.8167, 5, 4, 4, 680.00, 4356.00, 1, 2018, 'Furnished', 'Under Offer', 'Documents Submitted', FALSE, 180, '2024-03-05 08:45:00', 1),
(5, 'Modern Townhouse in Kilimani', 'modern-townhouse-kilimani', '<h3>Modern Townhouse in Kilimani</h3><p>Elegant townhouse in a gated community with premium amenities...</p>', 38500000.00, 'KES', 'Kilimani, Nairobi', 'Nairobi', 'Nairobi', 'Kilimani', 'Kilimani Heights', 'Kilimani Drive, Nairobi, Kenya', -1.2667, 36.8167, 3, 3, 2, 240.00, 0.00, 3, 2021, 'Semi-Furnished', 'Available', 'Verified', FALSE, 155, '2024-02-28 16:20:00', 1);

-- ============================================================================
-- PROPERTY IMAGES (references placeholder images)
-- ============================================================================

INSERT INTO property_images (property_id, filename, alt_text, caption, is_primary, sort_order, file_size, mime_type, width, height) VALUES
(1, 'villa-kitusuru-exterior.jpg', 'Modern villa exterior in Kitusuru', 'Main exterior view of the villa', TRUE, 0, 245760, 'image/jpeg', 1200, 800),
(1, 'villa-kitusuru-living.jpg', 'Living room interior', 'Spacious living room with city view', FALSE, 1, 184320, 'image/jpeg', 1000, 750),
(1, 'villa-kitusuru-kitchen.jpg', 'Modern kitchen', 'Fully equipped modern kitchen', FALSE, 2, 196608, 'image/jpeg', 1100, 800),
(1, 'villa-kitusuru-garden.jpg', 'Swimming pool and garden', 'Private swimming pool surrounded by landscaped garden', FALSE, 3, 229376, 'image/jpeg', 1200, 800),
(1, 'villa-kitusuru-master.jpg', 'Master bedroom', 'Luxury master bedroom with en-suite bathroom', FALSE, 4, 163840, 'image/jpeg', 900, 700),

(2, 'apartment-westlands-exterior.jpg', 'Westlands luxury apartment exterior', 'Building exterior at sunset', TRUE, 0, 204800, 'image/jpeg', 1200, 800),
(2, 'apartment-westlands-living.jpg', 'Living room with city view', 'Panoramic views of Westlands skyline', FALSE, 1, 172032, 'image/jpeg', 1000, 667),
(2, 'apartment-westlands-kitchen.jpg', 'Modern kitchen', 'Contemporary kitchen with high-end appliances', FALSE, 2, 188743, 'image/jpeg', 1100, 733),
(2, 'apartment-westlands-balcony.jpg', 'Balcony view', 'Private balcony overlooking the city', FALSE, 3, 155648, 'image/jpeg', 900, 600),

(3, 'maisonette-runda-garden.jpg', 'Runda maisonette garden', 'Charming maisonette surrounded by mature trees', TRUE, 0, 235520, 'image/jpeg', 1200, 800),
(3, 'maisonette-runda-interior.jpg', 'Interior living space', 'Elegant living room with natural light', FALSE, 1, 169984, 'image/jpeg', 1000, 750),
(3, 'maisonette-runda-bedroom.jpg', 'Main bedroom', 'Spacious master bedroom with walk-in closet', FALSE, 2, 159744, 'image/jpeg', 950, 700),

(4, 'bungalow-karen-exterior.jpg', 'Karen bungalow exterior', 'Executive bungalow on one acre of land', TRUE, 0, 240000, 'image/jpeg', 1200, 800),
(4, 'bungalow-karen-garden.jpg', 'Garden view', 'Mature garden with indigenous trees', FALSE, 1, 190000, 'image/jpeg', 1100, 733),
(4, 'bungalow-karen-living.jpg', 'Interior living area', 'Spacious open-plan living area', FALSE, 2, 175000, 'image/jpeg', 1050, 700),

(5, 'townhouse-kilimani-exterior.jpg', 'Kilimani townhouse exterior', 'Modern townhouse in gated community', TRUE, 0, 210000, 'image/jpeg', 1200, 800),
(5, 'townhouse-kilimani-living.jpg', 'Living area interior', 'Contemporary living room with large windows', FALSE, 1, 165000, 'image/jpeg', 1000, 750),
(5, 'townhouse-kilimani-balcony.jpg', 'Balcony garden', 'Private balcony with potted plants', FALSE, 2, 140000, 'image/jpeg', 900, 600);

-- ============================================================================
-- PROPERTY FEATURES
-- ============================================================================

INSERT INTO property_features (property_id, feature_id) VALUES
(1, 1),  (1, 2),  (1, 3),  (1, 4),  (1, 5),  (1, 6),  (1, 7),  (1, 8),  (1, 14), (1, 20),
(2, 14), (2, 16), (2, 17), (2, 7),  (2, 13),
(3, 2),  (3, 3),  (3, 5),  (3, 6),  (3, 8),  (3, 9),  (3, 15), (3, 25),
(4, 2),  (4, 3),  (4, 5),  (4, 6),  (4, 8),  (4, 9),  (4, 13), (4, 15), (4, 24),
(5, 13), (5, 14), (5, 17), (5, 16), (5, 9),  (5, 25), (5, 22), (5, 23);

-- ============================================================================
-- PROPERTY AGENTS ASSIGNMENTS
-- ============================================================================

INSERT INTO property_agents (property_id, agent_id, is_primary) VALUES
(1, 1, TRUE),
(2, 4, TRUE),
(3, 2, TRUE),
(4, 3, TRUE),
(5, 4, TRUE),
(1, 3, FALSE),
(2, 1, FALSE),
(4, 2, FALSE);

-- ============================================================================
-- PROPERTY DOCUMENTS (sample verification documents)
-- ============================================================================

INSERT INTO property_documents (property_id, title, description, filename, file_path, file_size, mime_type, document_type, visibility, uploaded_by) VALUES
(1, 'Title Deed - Kitusuru Villa', 'Copy of the registered title deed', 'title-deed-kitusuru-villa.pdf', '/uploads/documents/private/title-deed-kitusuru-villa.pdf', 2048576, 'application/pdf', 'title', 'admin_only', 1),
(1, 'Rates Clearance Certificate', 'Nairobi County rates clearance certificate', 'rates-clearance-kitusuru.pdf', '/uploads/documents/private/rates-clearance-kitusuru.pdf', 1536000, 'application/pdf', 'approval', 'admin_only', 1),
(2, 'Approval Plan - Westlands Apt', 'Approved building plan', 'approval-plan-westlands-apt.pdf', '/uploads/documents/private/approval-plan-westlands-apt.pdf', 1792000, 'application/pdf', 'approval', 'admin_only', 1),
(4, 'Land Survey - Karen Bungalow', 'Property survey plan for Karen bungalow', 'land-survey-karen-bungalow.pdf', 'survey-plan-karen-bungalow.pdf', 2150000, 'application/pdf', 'survey', 'admin_only', 1);

-- ============================================================================
-- PROPERTY VERIFICATIONS
-- ============================================================================

INSERT INTO property_verifications (property_id, notes, submitted_by, reviewed_by, status, reviewed_at) VALUES
(1, 'All documents submitted and verified. Property is confirmed to be legitimate.', 1, 1, 'Verified', '2024-01-20 10:30:00'),
(2, 'Documents under review. Awaiting approval plan verification.', 1, 1, 'Under Review', NULL),
(3, 'Property fully verified with title deed and rates clearance confirmed.', 1, 1, 'Verified', '2024-01-25 14:15:00'),
(4, 'Documents submitted. Pending rates clearance.', 1, 1, 'Documents Submitted', NULL),
(5, 'Verification completed successfully.', 1, 1, 'Verified', '2024-02-28 16:45:00');

-- ============================================================================
-- PROMOTIONS
-- ============================================================================

INSERT INTO promotions (title, description, image, button_text, button_url, start_date, end_date, active, display_type, display_frequency, frequency_value, position, priority, close_button, background_color, text_color, page_visibility, created_by) VALUES
('Premium Property Alert - 2024', 'Discover our exclusive premium property listings across Kenya', '/uploads/promotions/promo-banner-1.jpg', 'View Premium Listings', '/properties?featured=true', '2024-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, 'banner', 'always', 1, 'top', 10, TRUE, '#2563eb', '#ffffff', NULL, 1),
('Free Property Valuation', 'Get a free professional valuation of your property today', '/uploads/promotions/promo-card-1.jpg', 'Get Valuation', '/contact', '2024-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, 'card', 'once_per_session', 1, 'bottom', 5, TRUE, '#ffffff', '#33415b', NULL, 1),
('Mortgage Calculator Now Available', 'Calculate your mortgage payments with our new calculator tool', '/uploads/promotions/promo-popup-1.jpg', 'Try Calculator', '/mortgage-calculator', '2024-01-01 00:00:00', '2025-06-30 23:59:59', TRUE, 'popup', 'after_x_seconds', 30, 'center', 3, TRUE, '#ffffff', '#1e293b', '["home","properties"]', 1),
('Agent of the Month', 'Meet our top-performing agent John Mwangi', '/uploads/promotions/promo-agent-of-month.jpg', 'View Profile', '/agents/john-mwangi', '2024-04-01 00:00:00', '2024-04-30 23:59:59', TRUE, 'corner', 'always', 1, 'right', 8, TRUE, '#7c3aed', '#ffffff', NULL, 1);

-- ============================================================================
-- USER ACCOUNTS (demo customers)
-- ============================================================================

INSERT INTO users (role_id, name, email, phone, password_hash, phone_verified, email_verified, status) VALUES
(7, 'Alice Wanjiru', 'alice@example.com', '+254 711 111 222', '$2y$10$2M4qSHP2ZWRM8ZKi0s0bGeDgnLgnb/AB/Y8g.eNsrSk9TJU/dLGEm', TRUE, TRUE, 'active'),
(7, 'Bob Ochieng', 'bob@example.com', '+254 722 222 333', '$2y$10$2M4qSHP2ZWRM8ZKi0s0bGeDgnLgnb/AB/Y8g.eNsrSk9TJU/dLGEm', TRUE, TRUE, 'active'),
(7, 'Carol Atieno', 'carol@example.com', '+254 733 333 444', '$2y$10$2M4qSHP2ZWRM8ZKi0s0bGeDgnLgnb/AB/Y8g.eNsrSk9TJU/dLGEm', TRUE, TRUE, 'active'),
(7, 'David Mutua', 'david@example.com', '+254 744 444 555', '$2y$10$2M4qSHP2ZWRM8ZKi0s0bGeDgnLgnb/AB/Y8g.eNsrSk9TJU/dLGEm', TRUE, TRUE, 'active');

-- ============================================================================
-- FAVORITES
-- ============================================================================

INSERT INTO favorites (user_id, property_id) VALUES
(2, 1), (2, 3), (2, 5),
(3, 2), (3, 4),
(4, 1), (4, 5);

-- ============================================================================
-- INTERESTED PROPERTIES
-- ============================================================================

INSERT INTO interested_properties (user_id, property_id, notes) VALUES
(2, 1, 'Interested in scheduling a viewing'),
(3, 2, ''),
(4, 3, 'Please send property details'),
(5, 4, 'Want to discuss financing options');

-- ============================================================================
-- INQUIRIES
-- ============================================================================

INSERT INTO inquiries (user_id, property_id, name, email, phone, subject, message, status, assigned_to, source) VALUES
(2, 1, 'Alice Wanjiru', 'alice@example.com', '+254 711 111 222', 'Inquiry about Kitusuru Villa', 'I am very interested in the Modern 4-Bedroom Villa in Kitusuru. Could you please provide more details about the property and schedule a viewing?', 'Unread', NULL, 'property_page'),
(3, 2, 'Bob Ochieng', 'bob@example.com', '+254 722 222 333', 'Westlands Apartment Viewing', 'I would like to schedule a viewing for the luxury 3-bedroom apartment in Westlands. Please let me know available dates.', 'In Progress', 1, 'property_page'),
(2, 3, 'Alice Wanjiru', 'alice@example.com', '+254 711 111 222', 'Question about Runda Maisonette', 'Could you confirm the year of construction and current status of the maisonette?', 'Replied', 1, 'property_page');

INSERT INTO inquiry_messages (inquiry_id, sender_id, sender_type, message) VALUES
(1, 2, 'customer', 'I am very interested in the Modern 4-Bedroom Villa in Kitusuru. Could you please provide more details about the property and schedule a viewing?'),
(1, 1, 'agent', 'Thank you for your interest, Alice. I am happy to provide additional information about the villa and schedule a viewing. The property features a modern kitchen, spacious living areas, and a private garden. Would you prefer a viewing this weekend?'),
(2, 3, 'customer', 'I would like to schedule a viewing for the luxury 3-bedroom apartment in Westlands. Please let me know available dates.'),
(2, 1, 'agent', 'Hi Bob, I have several slots available next week. Thursday at 10 AM or Friday at 2 PM would work best. Please let me know which you prefer.'),
(3, 2, 'customer', 'Could you confirm the year of construction and current status of the maisonette?'),
(3, 1, 'agent', 'The maisonette was built in 2019 and is currently in "Reserved" status. I can check if the reservation is still active or has been released.');

-- ============================================================================
-- VIEWING REQUESTS
-- ============================================================================

INSERT INTO viewing_requests (property_id, user_id, name, email, phone, preferred_date, preferred_time_start, preferred_time_end, message, status, assigned_agent, admin_notes) VALUES
(1, 2, 'Alice Wanjiru', 'alice@example.com', '+254 711 111 222', '2024-04-15', '10:00:00', '11:00:00', 'Would prefer morning viewing please', 'Pending', 1, ''),
(2, 3, 'Bob Ochieng', 'bob@example.com', '+254 722 222 333', '2024-04-12', '14:00:00', '15:00:00', 'Available anytime in the afternoon', 'Confirmed', 1, 'Agent assigned - confirmed via WhatsApp'),
(3, 4, 'Carol Atieno', 'carol@example.com', '+254 733 333 444', '2024-04-20', '09:00:00', '10:00:00', '', 'Pending', 2, '');

-- ============================================================================
-- PROPERTY VIEWS (sample analytics data)
-- ============================================================================

INSERT INTO property_views (property_id, user_id, session_id, ip_address, user_agent, city, country) VALUES
(1, NULL, 'sess_a1b2c3', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Nairobi', 'Kenya'),
(1, 2, 'sess_d4e5f6', '192.168.1.2', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 'Nairobi', 'Kenya'),
(2, NULL, 'sess_g7h8i9', '192.168.1.3', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'Nairobi', 'Kenya'),
(3, 3, 'sess_j1k2l3', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Nairobi', 'Kenya'),
(1, NULL, 'sess_m4n5o6', '192.168.1.5', 'Mozilla/5.0 (Linux; Android 13) Chrome Mobile', 'Kisumu', 'Kenya'),
(4, NULL, 'sess_p7q8r9', '192.168.1.6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Mombasa', 'Kenya'),
(2, 4, 'sess_s1t2u3', '192.168.1.7', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari', 'Nairobi', 'Kenya'),
(5, 5, 'sess_v4w5x6', '192.168.1.8', 'Mozilla/5.0 (Linux; Android 13) Chrome Mobile', 'Nakuru', 'Kenya');

-- ============================================================================
-- SEO METADATA
-- ============================================================================

INSERT INTO seo_metadata (page_type, page_id, slug, meta_title, meta_description, canonical_url, og_type) VALUES
('home', 1, 'home', 'Prime Realty Kenya | Your Trusted Property Partner', 'Prime Realty Kenya offers professionally managed residential and commercial properties across Kenya. Find your perfect home or investment property with our expert agents.', '/', 'website'),
('about', 2, 'about', 'About Us - Prime Realty Kenya', 'Learn about Prime Realty Kenya, your trusted real estate partner with over 15 years of experience in the Kenyan property market.', '/about', 'website'),
('contact', 4, 'contact', 'Contact Us - Prime Realty Kenya', 'Contact Prime Realty Kenya to find your dream property. We have offices in Nairobi, Mombasa, Kisumu, and Nakuru.', '/contact', 'website'),
('properties', NULL, 'properties', 'Properties for Sale in Kenya - Prime Realty Kenya', 'Browse our comprehensive list of residential and commercial properties for sale across Kenya. Filter by location, price, and property type.', '/properties', 'website');

-- ============================================================================
-- AUDIT LOGS (sample)
-- ============================================================================

INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values, ip_address) VALUES
(1, 'created_property', 'properties', 1, '{"name":"Modern 4-Bedroom Villa in Kitusuru","price":85000000.00}', '127.0.0.1'),
(1, 'published_property', 'properties', 1, '{"status":"Available"}', '127.0.0.1'),
(1, 'changed_whatsapp_number', 'settings', NULL, '{"contact_whatsapp":"+254 700 000 001"}', '127.0.0.1'),
(1, 'changed_website_colors', 'settings', NULL, '{"branding_primary_color":"#2563eb"}', '127.0.0.1'),
(1, 'created_user', 'users', 1, '{"name":"Super Administrator","email":"admin@realestate.co.ke"}', '127.0.0.1'),
(1, 'deleted_image', 'property_images', 10, '{"filename":"old-image.jpg"}', '127.0.0.1');

-- ============================================================================
-- NOTIFICATIONS (sample)
-- ============================================================================

INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id, is_read) VALUES
(1, 'new_inquiry', 'New Inquiry Received', 'Alice Wanjiru submitted an inquiry about the Kitusuru Villa.', 'inquiry', 1, FALSE),
(1, 'new_inquiry', 'New Inquiry Received', 'Bob Ochieng submitted an inquiry about the Westlands Apartment.', 'inquiry', 2, FALSE),
(1, 'viewing_request', 'New Viewing Request', 'Alice Wanjiru requested a viewing for the Kitusuru Villa.', 'viewing', 1, FALSE),
(1, 'new_customer', 'New Customer Registered', 'Carol Atieno has registered on the website.', 'customer', 4, FALSE),
(1, 'property_activity', 'Property Viewed', 'Your featured property was viewed 50 times today.', 'property', 1, TRUE);
