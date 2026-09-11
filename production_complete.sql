-- ============================================================================
-- HEMAPRIN HOMES - COMPLETE PRODUCTION DATABASE DUMP
-- Universal Schema & Live Data (MySQL 5.7+ / MySQL 8.0+ / MariaDB 10.3+)
-- Compiled into a single file for live hosting / cPanel / TrueHost
-- ============================================================================
--
-- HOW TO IMPORT INTO CPANEL / TRUEHOST / SHARED HOSTING:
-- 1. In your hosting cPanel, go to "MySQL Databases":
--    - Create a database (e.g. cpaneluser_homes).
--    - Create a database user with a strong password.
--    - Add the user to the database and check ALL PRIVILEGES.
-- 2. Open "phpMyAdmin" from cPanel:
--    - Click on your newly created database in the left sidebar.
--    - Click the "Import" tab at the top.
--    - Choose this file (production_complete.sql).
--    - Click "Import" / "Go" at the bottom.
-- 3. Configure backend/.env with your production credentials:
--    DB_HOST=localhost
--    DB_PORT=3306
--    DB_NAME=cpaneluser_homes
--    DB_USER=cpaneluser_homesuser
--    DB_PASSWORD=your_database_password
--
-- NOTE: This file does NOT contain DROP DATABASE, CREATE DATABASE, or USE statements.
-- It safely imports into whatever database you have selected in phpMyAdmin.
-- ============================================================================

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agents`
--

DROP TABLE IF EXISTS `agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `agents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `registration_number` varchar(100) DEFAULT NULL,
  `credentials` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `license_number` varchar(100) DEFAULT NULL,
  `license_expiry` date DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `properties_sold` int(11) DEFAULT 0,
  `rating` decimal(3,2) DEFAULT 0.00,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_registration` (`registration_number`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agents`
--

LOCK TABLES `agents` WRITE;
/*!40000 ALTER TABLE `agents` DISABLE KEYS */;
INSERT INTO `agents` VALUES (1,'John Mwangi','/uploads/agents/default-agent-1.jpg','+254 711 234 567','john.mwangi@realestate.co.ke','Senior property consultant with over 8 years of experience in Nairobi and Kiambu markets. Specializes in residential luxury properties and commercial investments.','REA-00123','{\"registration_number\": \"REA-00123\", \"certifying_body\": \"Real Estate Regulatory Authority\", \"license_type\": \"Sales Agent\", \"valid_until\": \"2027-12-31\"}','LIC-2023-0845','2027-12-31','Residential, Commercial',156,4.80,'active','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `agents` VALUES (2,'Sarah Atieno','/uploads/agents/default-agent-2.jpg','+254 722 345 678','sarah.atieno@realestate.co.ke','Dedicated real estate professional with expertise in coastal and western Kenya properties. Passionate about helping families find their dream homes.','REA-00234','{\"registration_number\": \"REA-00234\", \"certifying_body\": \"Real Estate Regulatory Authority\", \"license_type\": \"Sales Agent\", \"valid_until\": \"2026-11-30\"}','LIC-2023-0912','2026-11-30','Coastal Properties',98,4.60,'active','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `agents` VALUES (3,'David Ochieng','/uploads/agents/default-agent-3.jpg','+254 733 456 789','david.ochieng@realestate.co.ke','Commercial property specialist with a focus on office spaces and retail outlets in Nairobi\'s central business district.','REA-00345','{\"registration_number\": \"REA-00345\", \"certifying_body\": \"Real Estate Regulatory Authority\", \"license_type\": \"Sales Agent\", \"valid_until\": \"2026-09-15\"}','LIC-2023-1023','2026-09-15','Commercial',203,4.90,'active','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `agents` VALUES (4,'Grace Wanjiru','/uploads/agents/default-agent-4.jpg','+254 744 567 890','grace.wanjiru@realestate.co.ke','Residential property expert with deep knowledge of suburban Nairobi markets. Award-winning agent with 10+ years experience.','REA-00456','{\"registration_number\": \"REA-00456\", \"certifying_body\": \"Real Estate Regulatory Authority\", \"license_type\": \"Sales Agent\", \"valid_until\": \"2027-03-20\"}','LIC-2023-1134','2027-03-20','Residential',187,4.70,'active','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `agents` VALUES (5,'charles',NULL,'+254000000','bundicharles37@gmail.com','','99',NULL,'77777','2026-09-07','UUU',0,0.00,'active','2026-09-06 14:41:59','2026-09-06 14:41:59');
INSERT INTO `agents` VALUES (6,'lucy',NULL,'555555','bundicharles37@gmail.com','','',NULL,'','2026-09-08','',0,0.00,'active','2026-09-07 09:22:43','2026-09-07 09:22:43');
INSERT INTO `agents` VALUES (7,'charles',NULL,'fff','bundicharles37@gmail.com','ssss','',NULL,'','2026-09-08','',0,0.00,'active','2026-09-07 14:24:27','2026-09-07 14:24:27');
/*!40000 ALTER TABLE `agents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_table` (`table_name`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=204 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'created_property','properties',1,NULL,'{\"name\":\"Modern 4-Bedroom Villa in Kitusuru\",\"price\":85000000.00}','127.0.0.1',NULL,'2026-08-26 09:37:01');
INSERT INTO `audit_logs` VALUES (2,1,'published_property','properties',1,NULL,'{\"status\":\"Available\"}','127.0.0.1',NULL,'2026-08-26 09:37:01');
INSERT INTO `audit_logs` VALUES (3,1,'changed_whatsapp_number','settings',NULL,NULL,'{\"contact_whatsapp\":\"+254 700 000 001\"}','127.0.0.1',NULL,'2026-08-26 09:37:01');
INSERT INTO `audit_logs` VALUES (4,1,'changed_website_colors','settings',NULL,NULL,'{\"branding_primary_color\":\"#2563eb\"}','127.0.0.1',NULL,'2026-08-26 09:37:01');
INSERT INTO `audit_logs` VALUES (5,1,'created_user','users',1,NULL,'{\"name\":\"Super Administrator\",\"email\":\"admin@realestate.co.ke\"}','127.0.0.1',NULL,'2026-08-26 09:37:01');
INSERT INTO `audit_logs` VALUES (6,1,'deleted_image','property_images',10,NULL,'{\"filename\":\"old-image.jpg\"}','127.0.0.1',NULL,'2026-08-26 09:37:01');
INSERT INTO `audit_logs` VALUES (7,1,'login','users',1,'[]','{\"ip\":\"0.0.0.0\"}','0.0.0.0','','2026-08-27 06:39:35');
INSERT INTO `audit_logs` VALUES (8,1,'login','users',1,'[]','{\"ip\":\"0.0.0.0\"}','0.0.0.0','','2026-08-27 06:45:19');
INSERT INTO `audit_logs` VALUES (9,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','curl/8.21.0','2026-08-27 06:45:28');
INSERT INTO `audit_logs` VALUES (10,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.9168','2026-08-27 06:45:46');
INSERT INTO `audit_logs` VALUES (11,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.9168','2026-08-27 06:50:17');
INSERT INTO `audit_logs` VALUES (12,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.9168','2026-08-27 06:50:37');
INSERT INTO `audit_logs` VALUES (13,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.9168','2026-08-27 06:55:45');
INSERT INTO `audit_logs` VALUES (14,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.9168','2026-08-27 06:56:23');
INSERT INTO `audit_logs` VALUES (15,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.9168','2026-08-27 06:59:41');
INSERT INTO `audit_logs` VALUES (16,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.9168','2026-08-27 06:59:57');
INSERT INTO `audit_logs` VALUES (17,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.9168','2026-08-27 07:10:07');
INSERT INTO `audit_logs` VALUES (18,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.9168','2026-08-27 07:11:47');
INSERT INTO `audit_logs` VALUES (19,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.9168','2026-08-27 07:12:39');
INSERT INTO `audit_logs` VALUES (20,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.9168','2026-08-27 07:13:15');
INSERT INTO `audit_logs` VALUES (21,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.9168','2026-08-27 07:13:43');
INSERT INTO `audit_logs` VALUES (22,1,'login','users',1,'[]','{\"ip\":\"0.0.0.0\"}','0.0.0.0','','2026-08-27 11:15:00');
INSERT INTO `audit_logs` VALUES (23,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.9168','2026-08-27 11:15:13');
INSERT INTO `audit_logs` VALUES (24,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-08-27 11:17:52');
INSERT INTO `audit_logs` VALUES (25,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-GB) WindowsPowerShell/5.1.26100.9168','2026-08-27 12:30:56');
INSERT INTO `audit_logs` VALUES (26,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-01 07:49:59');
INSERT INTO `audit_logs` VALUES (27,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-02 07:23:50');
INSERT INTO `audit_logs` VALUES (28,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-02 07:31:33');
INSERT INTO `audit_logs` VALUES (29,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','curl/8.21.0','2026-09-02 09:34:04');
INSERT INTO `audit_logs` VALUES (30,1,'updated_settings','settings',NULL,'[]','{\"session_timeout_minutes\":\"60\",\"max_login_attempts\":\"5\"}','::1','curl/8.21.0','2026-09-02 09:34:04');
INSERT INTO `audit_logs` VALUES (31,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','curl/8.21.0','2026-09-02 09:34:34');
INSERT INTO `audit_logs` VALUES (32,1,'updated_settings','settings',NULL,'[]','{\"session_timeout_minutes\":\"60\",\"max_login_attempts\":\"5\"}','::1','curl/8.21.0','2026-09-02 09:34:34');
INSERT INTO `audit_logs` VALUES (33,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','curl/8.21.0','2026-09-02 09:35:01');
INSERT INTO `audit_logs` VALUES (34,1,'updated_settings','settings',NULL,'[]','{\"max_login_attempts\":\"5\",\"session_timeout_minutes\":\"60\"}','::1','curl/8.21.0','2026-09-02 09:35:01');
INSERT INTO `audit_logs` VALUES (35,2,'login','users',2,'[]','{\"ip\":\"::1\"}','::1','curl/8.21.0','2026-09-02 09:38:30');
INSERT INTO `audit_logs` VALUES (36,2,'login','users',2,'[]','{\"ip\":\"::1\"}','::1','curl/8.21.0','2026-09-02 09:38:58');
INSERT INTO `audit_logs` VALUES (37,2,'login','users',2,'[]','{\"ip\":\"::1\"}','::1','curl/8.21.0','2026-09-02 09:39:50');
INSERT INTO `audit_logs` VALUES (38,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-02 14:15:12');
INSERT INTO `audit_logs` VALUES (39,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-02 16:01:03');
INSERT INTO `audit_logs` VALUES (40,0,'failed_login','users',NULL,'[]','{\"email\":\"admin@joyvista.com\",\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-03 07:21:37');
INSERT INTO `audit_logs` VALUES (41,0,'failed_login','users',NULL,'[]','{\"email\":\"admin@joyvista.com\",\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-03 07:21:43');
INSERT INTO `audit_logs` VALUES (42,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-03 07:21:58');
INSERT INTO `audit_logs` VALUES (43,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 06:02:27');
INSERT INTO `audit_logs` VALUES (44,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 06:02:54');
INSERT INTO `audit_logs` VALUES (45,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 07:41:37');
INSERT INTO `audit_logs` VALUES (46,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 08:00:16');
INSERT INTO `audit_logs` VALUES (47,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 08:00:46');
INSERT INTO `audit_logs` VALUES (48,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 08:02:26');
INSERT INTO `audit_logs` VALUES (49,1,'uploaded_media','media',1,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 08:03:29');
INSERT INTO `audit_logs` VALUES (50,1,'uploaded_media','media',2,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 08:03:41');
INSERT INTO `audit_logs` VALUES (51,1,'uploaded_media','media',3,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 08:03:57');
INSERT INTO `audit_logs` VALUES (52,1,'updated_settings','settings',NULL,'[]','{\"branding_logo\":\"\\/uploads\\/branding\\/20260906_6a9d1e5184f95.jpg\",\"branding_mobile_logo\":\"\\/uploads\\/branding\\/20260906_6a9d1e5dde9ed.jpg\",\"branding_light_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/logo-white.svg\",\"branding_dark_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/logo-white.svg\",\"branding_favicon\":\"\\/uploads\\/branding\\/20260906_6a9d1e6d70449.jpg\",\"branding_primary_color\":\"#2563eb\",\"branding_secondary_color\":\"#7c3aed\",\"branding_accent_color\":\"#ea580c\",\"branding_background\":\"#ffffff\",\"branding_surface\":\"#f8fafc\",\"branding_text_color\":\"#1e293b\",\"branding_muted_text\":\"#64748b\",\"branding_heading_font\":\"Inter\",\"branding_body_font\":\"Inter\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 08:04:06');
INSERT INTO `audit_logs` VALUES (53,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 08:04:40');
INSERT INTO `audit_logs` VALUES (54,1,'uploaded_media','media',4,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 08:05:33');
INSERT INTO `audit_logs` VALUES (55,1,'uploaded_media','media',5,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 08:05:42');
INSERT INTO `audit_logs` VALUES (56,1,'updated_property','properties',1,'{\"id\":1,\"property_type_id\":2,\"name\":\"Modern 4-Bedroom Villa in Kitusuru\",\"slug\":\"modern-4-bedroom-villa-kitusuru\",\"description\":\"<h3>Modern 4-Bedroom Villa in Kitusuru<\\/h3><p>This stunning modern villa is located in the prestigious Kitusuru neighborhood...<\\/p>\",\"price\":\"85000000.00\",\"currency\":\"KES\",\"location\":\"Kitusuru, Nairobi\",\"county\":\"Nairobi\",\"town\":\"Nairobi\",\"area\":\"Kitusuru\",\"estate\":\"Kitusuru\",\"address\":\"12 Kitusuru Drive, Nairobi, Kenya\",\"latitude\":\"-1.26670000\",\"longitude\":\"36.81670000\",\"bedrooms\":4,\"bathrooms\":5,\"parking_spaces\":3,\"house_size\":\"520.00\",\"land_size\":\"1200.00\",\"floors\":2,\"year_built\":\"2020\",\"furnishing_status\":\"Furnished\",\"status\":\"Available\",\"verification_status\":\"Verified\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":533,\"published_at\":\"2024-01-15 09:30:00\",\"created_by\":1,\"updated_by\":null,\"created_at\":\"2026-08-26 12:37:01\",\"updated_at\":\"2026-09-02 17:09:34\"}','{\"id\":1,\"property_type_id\":2,\"name\":\"Modern 4-Bedroom Villa in Kitusuru\",\"slug\":\"modern-4-bedroom-villa-kitusuru\",\"description\":\"<h3>Modern 4-Bedroom Villa in Kitusuru<\\/h3><p>This stunning modern villa is located in the prestigious Kitusuru neighborhood...<\\/p>\",\"price\":85000000,\"currency\":\"KES\",\"location\":\"Kitusuru, Nairobi\",\"county\":\"Nairobi\",\"town\":\"Nairobi\",\"area\":\"Kitusuru\",\"estate\":\"Kitusuru\",\"address\":\"12 Kitusuru Drive, Nairobi, Kenya\",\"latitude\":\"-1.26670000\",\"longitude\":\"36.81670000\",\"bedrooms\":4,\"bathrooms\":5,\"parking_spaces\":3,\"house_size\":520,\"land_size\":1200,\"floors\":2,\"year_built\":2020,\"furnishing_status\":\"Furnished\",\"status\":\"Available\",\"verification_status\":\"Verified\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":533,\"published_at\":\"2024-01-15 09:30:00\",\"created_by\":1,\"updated_by\":null,\"created_at\":\"2026-08-26 12:37:01\",\"updated_at\":\"2026-09-02 17:09:34\",\"features\":[1,2,3,4,5,6,7,8,14,20],\"agent_id\":1,\"seo_title\":\"\",\"seo_description\":\"\",\"canonical_url\":\"\",\"images\":[{\"id\":1,\"property_id\":1,\"filename\":\"villa-kitusuru-exterior.jpg\",\"alt_text\":\"Modern villa exterior in Kitusuru\",\"caption\":\"Main exterior view of the villa\",\"is_primary\":1,\"sort_order\":0,\"file_size\":245760,\"mime_type\":\"image\\/jpeg\",\"width\":1200,\"height\":800,\"created_at\":\"2026-08-26 12:37:01\"},{\"id\":2,\"property_id\":1,\"filename\":\"villa-kitusuru-living.jpg\",\"alt_text\":\"Living room interior\",\"caption\":\"Spacious living room with city view\",\"is_primary\":0,\"sort_order\":1,\"file_size\":184320,\"mime_type\":\"image\\/jpeg\",\"width\":1000,\"height\":750,\"created_at\":\"2026-08-26 12:37:01\"},{\"id\":3,\"property_id\":1,\"filename\":\"villa-kitusuru-kitchen.jpg\",\"alt_text\":\"Modern kitchen\",\"caption\":\"Fully equipped modern kitchen\",\"is_primary\":0,\"sort_order\":2,\"file_size\":196608,\"mime_type\":\"image\\/jpeg\",\"width\":1100,\"height\":800,\"created_at\":\"2026-08-26 12:37:01\"},{\"id\":4,\"property_id\":1,\"filename\":\"villa-kitusuru-garden.jpg\",\"alt_text\":\"Swimming pool and garden\",\"caption\":\"Private swimming pool surrounded by landscaped garden\",\"is_primary\":0,\"sort_order\":3,\"file_size\":229376,\"mime_type\":\"image\\/jpeg\",\"width\":1200,\"height\":800,\"created_at\":\"2026-08-26 12:37:01\"},{\"id\":5,\"property_id\":1,\"filename\":\"villa-kitusuru-master.jpg\",\"alt_text\":\"Master bedroom\",\"caption\":\"Luxury master bedroom with en-suite bathroom\",\"is_primary\":0,\"sort_order\":4,\"file_size\":163840,\"mime_type\":\"image\\/jpeg\",\"width\":900,\"height\":700,\"created_at\":\"2026-08-26 12:37:01\"},{\"filename\":\"20260906_6a9d1ecd23e24.jpg\",\"file_path\":\"uploads\\/properties\\/20260906_6a9d1ecd23e24.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260906_6a9d1ecd23e24.jpg\",\"is_primary\":false,\"alt_text\":\"Modern 4-Bedroom Villa in Kitusuru\",\"caption\":\"\",\"sort_order\":5},{\"filename\":\"20260906_6a9d1ed64341a.jpg\",\"file_path\":\"uploads\\/properties\\/20260906_6a9d1ed64341a.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260906_6a9d1ed64341a.jpg\",\"is_primary\":false,\"alt_text\":\"Modern 4-Bedroom Villa in Kitusuru\",\"caption\":\"\",\"sort_order\":6}],\"agents\":[{\"agent_id\":1,\"is_primary\":1}]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 08:05:47');
INSERT INTO `audit_logs` VALUES (57,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 08:06:01');
INSERT INTO `audit_logs` VALUES (58,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 10:09:27');
INSERT INTO `audit_logs` VALUES (59,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 10:09:49');
INSERT INTO `audit_logs` VALUES (60,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 11:39:31');
INSERT INTO `audit_logs` VALUES (61,1,'uploaded_media','media',6,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 11:40:34');
INSERT INTO `audit_logs` VALUES (62,1,'updated_property','properties',1,'{\"id\":1,\"property_type_id\":2,\"name\":\"Modern 4-Bedroom Villa in Kitusuru\",\"slug\":\"modern-4-bedroom-villa-kitusuru\",\"description\":\"<h3>Modern 4-Bedroom Villa in Kitusuru<\\/h3><p>This stunning modern villa is located in the prestigious Kitusuru neighborhood...<\\/p>\",\"price\":\"85000000.00\",\"currency\":\"KES\",\"location\":\"Kitusuru, Nairobi\",\"county\":\"Nairobi\",\"town\":\"Nairobi\",\"area\":\"Kitusuru\",\"estate\":\"Kitusuru\",\"address\":\"12 Kitusuru Drive, Nairobi, Kenya\",\"latitude\":\"-1.26670000\",\"longitude\":\"36.81670000\",\"bedrooms\":4,\"bathrooms\":5,\"parking_spaces\":3,\"house_size\":\"520.00\",\"land_size\":\"1200.00\",\"floors\":2,\"year_built\":\"2020\",\"furnishing_status\":\"Furnished\",\"status\":\"Available\",\"verification_status\":\"Verified\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":533,\"published_at\":\"2024-01-15 09:30:00\",\"created_by\":1,\"updated_by\":1,\"created_at\":\"2026-08-26 12:37:01\",\"updated_at\":\"2026-09-06 11:05:47\"}','{\"id\":1,\"property_type_id\":2,\"name\":\"Modern 4-Bedroom Villa in Kitusuru\",\"slug\":\"modern-4-bedroom-villa-kitusuru\",\"description\":\"<h3>Modern 4-Bedroom Villa in Kitusuru<\\/h3><p>This stunning modern villa is located in the prestigious Kitusuru neighborhood...<\\/p>\",\"price\":85000000,\"currency\":\"KES\",\"location\":\"Kitusuru, Nairobi\",\"county\":\"Nairobi\",\"town\":\"Nairobi\",\"area\":\"Kitusuru\",\"estate\":\"Kitusuru\",\"address\":\"12 Kitusuru Drive, Nairobi, Kenya\",\"latitude\":\"-1.26670000\",\"longitude\":\"36.81670000\",\"bedrooms\":4,\"bathrooms\":5,\"parking_spaces\":3,\"house_size\":520,\"land_size\":1200,\"floors\":2,\"year_built\":2020,\"furnishing_status\":\"Furnished\",\"status\":\"Available\",\"verification_status\":\"Verified\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":533,\"published_at\":\"2024-01-15 09:30:00\",\"created_by\":1,\"updated_by\":1,\"created_at\":\"2026-08-26 12:37:01\",\"updated_at\":\"2026-09-06 11:05:47\",\"features\":[1,2,3,4,5,6,7,8,14,20],\"agent_id\":1,\"seo_title\":\"\",\"seo_description\":\"\",\"canonical_url\":\"\",\"images\":[{\"id\":1,\"property_id\":1,\"filename\":\"villa-kitusuru-exterior.jpg\",\"alt_text\":\"Modern villa exterior in Kitusuru\",\"caption\":\"Main exterior view of the villa\",\"is_primary\":1,\"sort_order\":0,\"file_size\":245760,\"mime_type\":\"image\\/jpeg\",\"width\":1200,\"height\":800,\"created_at\":\"2026-08-26 12:37:01\"},{\"id\":2,\"property_id\":1,\"filename\":\"villa-kitusuru-living.jpg\",\"alt_text\":\"Living room interior\",\"caption\":\"Spacious living room with city view\",\"is_primary\":0,\"sort_order\":1,\"file_size\":184320,\"mime_type\":\"image\\/jpeg\",\"width\":1000,\"height\":750,\"created_at\":\"2026-08-26 12:37:01\"},{\"id\":3,\"property_id\":1,\"filename\":\"villa-kitusuru-kitchen.jpg\",\"alt_text\":\"Modern kitchen\",\"caption\":\"Fully equipped modern kitchen\",\"is_primary\":0,\"sort_order\":2,\"file_size\":196608,\"mime_type\":\"image\\/jpeg\",\"width\":1100,\"height\":800,\"created_at\":\"2026-08-26 12:37:01\"},{\"id\":4,\"property_id\":1,\"filename\":\"villa-kitusuru-garden.jpg\",\"alt_text\":\"Swimming pool and garden\",\"caption\":\"Private swimming pool surrounded by landscaped garden\",\"is_primary\":0,\"sort_order\":3,\"file_size\":229376,\"mime_type\":\"image\\/jpeg\",\"width\":1200,\"height\":800,\"created_at\":\"2026-08-26 12:37:01\"},{\"id\":5,\"property_id\":1,\"filename\":\"villa-kitusuru-master.jpg\",\"alt_text\":\"Master bedroom\",\"caption\":\"Luxury master bedroom with en-suite bathroom\",\"is_primary\":0,\"sort_order\":4,\"file_size\":163840,\"mime_type\":\"image\\/jpeg\",\"width\":900,\"height\":700,\"created_at\":\"2026-08-26 12:37:01\"},{\"filename\":\"20260906_6a9d51327f720.jpg\",\"file_path\":\"uploads\\/properties\\/20260906_6a9d51327f720.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260906_6a9d51327f720.jpg\",\"is_primary\":false,\"alt_text\":\"Modern 4-Bedroom Villa in Kitusuru\",\"caption\":\"\",\"sort_order\":5}],\"agents\":[{\"agent_id\":1,\"is_primary\":1}]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 11:40:39');
INSERT INTO `audit_logs` VALUES (63,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 11:40:50');
INSERT INTO `audit_logs` VALUES (64,1,'uploaded_media','media',7,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 11:41:42');
INSERT INTO `audit_logs` VALUES (65,1,'uploaded_media','media',8,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 11:41:43');
INSERT INTO `audit_logs` VALUES (66,1,'uploaded_media','media',9,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 11:41:43');
INSERT INTO `audit_logs` VALUES (67,1,'created_property','properties',6,'[]','{\"name\":\"charles\",\"slug\":\"charles\",\"property_type_id\":1,\"price\":8888870,\"currency\":\"KES\",\"description\":\"jjkk\",\"location\":\"Naivasha Sopa Resort, Kenya\",\"county\":\"Nairobi\",\"town\":\"kiambu\",\"area\":\"\",\"estate\":\"\",\"address\":\"\",\"latitude\":\"\",\"longitude\":\"\",\"bedrooms\":3,\"bathrooms\":2,\"parking_spaces\":1,\"house_size\":null,\"land_size\":null,\"floors\":1,\"year_built\":2026,\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Pending\",\"featured\":1,\"features\":[],\"agent_id\":\"\",\"seo_title\":\"\",\"seo_description\":\"\",\"canonical_url\":\"\",\"images\":[{\"filename\":\"20260906_6a9d5176e3ad4.jpg\",\"file_path\":\"uploads\\/properties\\/20260906_6a9d5176e3ad4.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260906_6a9d5176e3ad4.jpg\",\"is_primary\":true,\"alt_text\":\"charles\",\"caption\":\"\",\"sort_order\":0},{\"filename\":\"20260906_6a9d517702d85.jpg\",\"file_path\":\"uploads\\/properties\\/20260906_6a9d517702d85.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260906_6a9d517702d85.jpg\",\"is_primary\":true,\"alt_text\":\"charles\",\"caption\":\"\",\"sort_order\":0},{\"filename\":\"20260906_6a9d517713901.jpg\",\"file_path\":\"uploads\\/properties\\/20260906_6a9d517713901.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260906_6a9d517713901.jpg\",\"is_primary\":true,\"alt_text\":\"charles\",\"caption\":\"\",\"sort_order\":0}],\"agents\":[]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 11:42:01');
INSERT INTO `audit_logs` VALUES (68,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 11:43:13');
INSERT INTO `audit_logs` VALUES (69,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 12:49:31');
INSERT INTO `audit_logs` VALUES (70,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 12:50:47');
INSERT INTO `audit_logs` VALUES (71,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 12:51:25');
INSERT INTO `audit_logs` VALUES (72,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 12:52:20');
INSERT INTO `audit_logs` VALUES (73,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 13:17:28');
INSERT INTO `audit_logs` VALUES (74,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 13:18:05');
INSERT INTO `audit_logs` VALUES (75,1,'logout','users',1,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 14:02:43');
INSERT INTO `audit_logs` VALUES (76,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 14:03:04');
INSERT INTO `audit_logs` VALUES (77,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 14:03:45');
INSERT INTO `audit_logs` VALUES (78,1,'updated_viewing_request','viewing_requests',6,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 14:40:44');
INSERT INTO `audit_logs` VALUES (79,1,'updated_viewing_request','viewing_requests',5,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 14:40:52');
INSERT INTO `audit_logs` VALUES (80,1,'updated_viewing_request','viewing_requests',5,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 14:40:59');
INSERT INTO `audit_logs` VALUES (81,1,'updated_viewing_request','viewing_requests',6,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 14:41:16');
INSERT INTO `audit_logs` VALUES (82,1,'created_agent','agents',5,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-06 14:41:59');
INSERT INTO `audit_logs` VALUES (83,1,'updated_settings','settings',NULL,'[]','{\"branding_logo\":\"\\/uploads\\/branding\\/20260906_6a9d1e5184f95.jpg\",\"branding_mobile_logo\":\"\\/uploads\\/branding\\/20260906_6a9d1e5dde9ed.jpg\",\"branding_light_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/logo-white.svg\",\"branding_dark_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/logo-white.svg\",\"branding_favicon\":\"\\/uploads\\/branding\\/20260906_6a9d1e6d70449.jpg\",\"branding_primary_color\":\"#1e3a8a\",\"branding_secondary_color\":\"#4c1d95\",\"branding_accent_color\":\"#92400e\",\"branding_background\":\"#ffffff\",\"branding_surface\":\"#f8fafc\",\"branding_text_color\":\"#1e293b\",\"branding_muted_text\":\"#64748b\",\"branding_heading_font\":\"Inter\",\"branding_body_font\":\"Inter\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 01:52:14');
INSERT INTO `audit_logs` VALUES (84,1,'updated_user','users',1,'[]','{\"name\":\"Super Administrator\",\"email\":\"admin@realestate.co.ke\",\"phone\":\"+254 700 000 001\",\"role\":\"administrator\",\"password\":\"password\",\"password_confirmation\":\"\",\"is_active\":true,\"role_id\":2,\"status\":\"active\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 01:53:15');
INSERT INTO `audit_logs` VALUES (85,1,'updated_user','users',1,'[]','{\"name\":\"Super Administrator\",\"email\":\"admin@realestate.co.ke\",\"phone\":\"+254700000001\",\"role\":\"super-admin\",\"password\":\"password\",\"password_confirmation\":\"\",\"is_active\":true,\"role_id\":1,\"status\":\"active\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 01:53:24');
INSERT INTO `audit_logs` VALUES (86,1,'updated_user','users',2,'[]','{\"name\":\"Alice Wanjiru\",\"email\":\"alice@example.com\",\"phone\":\"+254 711 111 222\",\"role\":\"property-manager\",\"is_active\":true,\"role_id\":3,\"status\":\"active\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 01:53:48');
INSERT INTO `audit_logs` VALUES (87,1,'uploaded_media','media',10,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 02:19:24');
INSERT INTO `audit_logs` VALUES (88,1,'updated_property','properties',1,'{\"id\":1,\"property_type_id\":2,\"name\":\"Modern 4-Bedroom Villa in Kitusuru\",\"slug\":\"modern-4-bedroom-villa-kitusuru\",\"description\":\"<h3>Modern 4-Bedroom Villa in Kitusuru<\\/h3><p>This stunning modern villa is located in the prestigious Kitusuru neighborhood...<\\/p>\",\"price\":\"85000000.00\",\"currency\":\"KES\",\"location\":\"Kitusuru, Nairobi\",\"county\":\"Nairobi\",\"town\":\"Nairobi\",\"area\":\"Kitusuru\",\"estate\":\"Kitusuru\",\"address\":\"12 Kitusuru Drive, Nairobi, Kenya\",\"latitude\":\"-1.26670000\",\"longitude\":\"36.81670000\",\"bedrooms\":4,\"bathrooms\":5,\"parking_spaces\":3,\"house_size\":\"520.00\",\"land_size\":\"1200.00\",\"floors\":2,\"year_built\":\"2020\",\"furnishing_status\":\"Furnished\",\"status\":\"Available\",\"verification_status\":\"Verified\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":533,\"published_at\":\"2024-01-15 09:30:00\",\"created_by\":1,\"updated_by\":1,\"created_at\":\"2026-08-26 12:37:01\",\"updated_at\":\"2026-09-06 11:05:47\"}','{\"id\":1,\"property_type_id\":2,\"name\":\"Modern 4-Bedroom Villa in Kitusuru\",\"slug\":\"modern-4-bedroom-villa-kitusuru\",\"description\":\"<h3>Modern 4-Bedroom Villa in Kitusuru<\\/h3><p>This stunning modern villa is located in the prestigious Kitusuru neighborhood...<\\/p>\",\"price\":85000000,\"currency\":\"KES\",\"location\":\"Kitusuru, Nairobi\",\"county\":\"Nairobi\",\"town\":\"Nairobi\",\"area\":\"Kitusuru\",\"estate\":\"Kitusuru\",\"address\":\"12 Kitusuru Drive, Nairobi, Kenya\",\"latitude\":\"-1.26670000\",\"longitude\":\"36.81670000\",\"bedrooms\":4,\"bathrooms\":5,\"parking_spaces\":3,\"house_size\":520,\"land_size\":1200,\"floors\":2,\"year_built\":2020,\"furnishing_status\":\"Furnished\",\"status\":\"Available\",\"verification_status\":\"Verified\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":533,\"published_at\":\"2024-01-15 09:30:00\",\"created_by\":1,\"updated_by\":1,\"created_at\":\"2026-08-26 12:37:01\",\"updated_at\":\"2026-09-06 11:05:47\",\"features\":[1,2,3,4,5,6,7,8,14,20],\"agent_id\":1,\"seo_title\":\"\",\"seo_description\":\"\",\"canonical_url\":\"\",\"images\":[{\"id\":1,\"property_id\":1,\"filename\":\"villa-kitusuru-exterior.jpg\",\"alt_text\":\"Modern villa exterior in Kitusuru\",\"caption\":\"Main exterior view of the villa\",\"is_primary\":1,\"sort_order\":0,\"file_size\":245760,\"mime_type\":\"image\\/jpeg\",\"width\":1200,\"height\":800,\"created_at\":\"2026-08-26 12:37:01\"},{\"id\":2,\"property_id\":1,\"filename\":\"villa-kitusuru-living.jpg\",\"alt_text\":\"Living room interior\",\"caption\":\"Spacious living room with city view\",\"is_primary\":0,\"sort_order\":1,\"file_size\":184320,\"mime_type\":\"image\\/jpeg\",\"width\":1000,\"height\":750,\"created_at\":\"2026-08-26 12:37:01\"},{\"id\":3,\"property_id\":1,\"filename\":\"villa-kitusuru-kitchen.jpg\",\"alt_text\":\"Modern kitchen\",\"caption\":\"Fully equipped modern kitchen\",\"is_primary\":0,\"sort_order\":2,\"file_size\":196608,\"mime_type\":\"image\\/jpeg\",\"width\":1100,\"height\":800,\"created_at\":\"2026-08-26 12:37:01\"},{\"id\":4,\"property_id\":1,\"filename\":\"villa-kitusuru-garden.jpg\",\"alt_text\":\"Swimming pool and garden\",\"caption\":\"Private swimming pool surrounded by landscaped garden\",\"is_primary\":0,\"sort_order\":3,\"file_size\":229376,\"mime_type\":\"image\\/jpeg\",\"width\":1200,\"height\":800,\"created_at\":\"2026-08-26 12:37:01\"},{\"id\":5,\"property_id\":1,\"filename\":\"villa-kitusuru-master.jpg\",\"alt_text\":\"Master bedroom\",\"caption\":\"Luxury master bedroom with en-suite bathroom\",\"is_primary\":0,\"sort_order\":4,\"file_size\":163840,\"mime_type\":\"image\\/jpeg\",\"width\":900,\"height\":700,\"created_at\":\"2026-08-26 12:37:01\"},{\"filename\":\"20260907_6a9e1f2c07132.jpg\",\"file_path\":\"uploads\\/properties\\/20260907_6a9e1f2c07132.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260907_6a9e1f2c07132.jpg\",\"is_primary\":false,\"alt_text\":\"Modern 4-Bedroom Villa in Kitusuru\",\"caption\":\"\",\"sort_order\":5}],\"agents\":[{\"agent_id\":1,\"is_primary\":1}]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 02:19:28');
INSERT INTO `audit_logs` VALUES (89,1,'uploaded_media','media',11,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 02:20:01');
INSERT INTO `audit_logs` VALUES (90,1,'uploaded_media','media',12,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 02:21:06');
INSERT INTO `audit_logs` VALUES (91,1,'created_property','properties',7,'[]','{\"name\":\"scoffie\",\"slug\":\"scoffie\",\"property_type_id\":1,\"price\":8888888,\"currency\":\"KES\",\"description\":\"uuuuuuu\",\"location\":\"Naivasha Sopa Resort, Kenya\",\"county\":\"Kajiado\",\"town\":\"kiambu\",\"area\":\"kkk\",\"estate\":\"\",\"address\":\"2344\",\"latitude\":\"\",\"longitude\":\"\",\"bedrooms\":3,\"bathrooms\":2,\"parking_spaces\":1,\"house_size\":null,\"land_size\":null,\"floors\":1,\"year_built\":2026,\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Verified\",\"featured\":1,\"features\":[],\"agent_id\":\"\",\"seo_title\":\"\",\"seo_description\":\"\",\"canonical_url\":\"\",\"images\":[{\"filename\":\"20260907_6a9e1f92db806.jpg\",\"file_path\":\"uploads\\/properties\\/20260907_6a9e1f92db806.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260907_6a9e1f92db806.jpg\",\"is_primary\":true,\"alt_text\":\"scoffie\",\"caption\":\"\",\"sort_order\":0}],\"agents\":[]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 02:21:50');
INSERT INTO `audit_logs` VALUES (92,1,'uploaded_media','media',13,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 02:22:38');
INSERT INTO `audit_logs` VALUES (93,1,'uploaded_media','media',14,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 02:22:38');
INSERT INTO `audit_logs` VALUES (94,1,'updated_property','properties',7,'{\"id\":7,\"property_type_id\":1,\"name\":\"scoffie\",\"slug\":\"scoffie\",\"description\":\"uuuuuuu\",\"price\":\"8888888.00\",\"currency\":\"KES\",\"location\":\"Naivasha Sopa Resort, Kenya\",\"county\":\"Kajiado\",\"town\":\"kiambu\",\"area\":\"kkk\",\"estate\":\"\",\"address\":\"2344\",\"latitude\":\"0.00000000\",\"longitude\":\"0.00000000\",\"bedrooms\":3,\"bathrooms\":2,\"parking_spaces\":1,\"house_size\":null,\"land_size\":null,\"floors\":1,\"year_built\":\"2026\",\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Verified\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":1,\"published_at\":null,\"created_by\":1,\"updated_by\":1,\"created_at\":\"2026-09-07 05:21:50\",\"updated_at\":\"2026-09-07 05:22:18\"}','{\"id\":7,\"property_type_id\":1,\"name\":\"scoffie\",\"slug\":\"scoffie\",\"description\":\"uuuuuuu\",\"price\":8888888,\"currency\":\"KES\",\"location\":\"Naivasha Sopa Resort, Kenya\",\"county\":\"Kajiado\",\"town\":\"kiambu\",\"area\":\"kkk\",\"estate\":\"\",\"address\":\"2344\",\"latitude\":\"0.00000000\",\"longitude\":\"0.00000000\",\"bedrooms\":3,\"bathrooms\":2,\"parking_spaces\":1,\"house_size\":null,\"land_size\":null,\"floors\":1,\"year_built\":2026,\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Verified\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":1,\"published_at\":null,\"created_by\":1,\"updated_by\":1,\"created_at\":\"2026-09-07 05:21:50\",\"updated_at\":\"2026-09-07 05:22:18\",\"features\":[],\"agent_id\":\"\",\"seo_title\":\"\",\"seo_description\":\"\",\"canonical_url\":\"\",\"images\":[{\"id\":22,\"property_id\":7,\"filename\":\"20260907_6a9e1f92db806.jpg\",\"alt_text\":\"scoffie\",\"caption\":\"\",\"is_primary\":1,\"sort_order\":0,\"file_size\":null,\"mime_type\":null,\"width\":null,\"height\":null,\"created_at\":\"2026-09-07 05:21:50\"},{\"filename\":\"20260907_6a9e1fee1b689.jpg\",\"file_path\":\"uploads\\/properties\\/20260907_6a9e1fee1b689.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260907_6a9e1fee1b689.jpg\",\"is_primary\":false,\"alt_text\":\"scoffie\",\"caption\":\"\",\"sort_order\":1},{\"filename\":\"20260907_6a9e1fee30202.jpg\",\"file_path\":\"uploads\\/properties\\/20260907_6a9e1fee30202.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260907_6a9e1fee30202.jpg\",\"is_primary\":false,\"alt_text\":\"scoffie\",\"caption\":\"\",\"sort_order\":1}],\"agents\":[]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 02:22:40');
INSERT INTO `audit_logs` VALUES (95,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 07:32:06');
INSERT INTO `audit_logs` VALUES (96,1,'uploaded_media','media',15,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 07:32:26');
INSERT INTO `audit_logs` VALUES (97,1,'uploaded_media','media',16,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 07:32:26');
INSERT INTO `audit_logs` VALUES (98,1,'updated_property','properties',7,'{\"id\":7,\"property_type_id\":1,\"name\":\"scoffie\",\"slug\":\"scoffie\",\"description\":\"uuuuuuu\",\"price\":\"8888888.00\",\"currency\":\"KES\",\"location\":\"Naivasha Sopa Resort, Kenya\",\"county\":\"Kajiado\",\"town\":\"kiambu\",\"area\":\"kkk\",\"estate\":\"\",\"address\":\"2344\",\"latitude\":\"0.00000000\",\"longitude\":\"0.00000000\",\"bedrooms\":3,\"bathrooms\":2,\"parking_spaces\":1,\"house_size\":null,\"land_size\":null,\"floors\":1,\"year_built\":\"2026\",\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Verified\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":3,\"published_at\":null,\"created_by\":1,\"updated_by\":1,\"created_at\":\"2026-09-07 05:21:50\",\"updated_at\":\"2026-09-07 10:32:01\"}','{\"id\":7,\"property_type_id\":1,\"name\":\"scoffie\",\"slug\":\"scoffie\",\"description\":\"uuuuuuu\",\"price\":8888888,\"currency\":\"KES\",\"location\":\"Naivasha Sopa Resort, Kenya\",\"county\":\"Kajiado\",\"town\":\"kiambu\",\"area\":\"kkk\",\"estate\":\"\",\"address\":\"2344\",\"latitude\":\"0.00000000\",\"longitude\":\"0.00000000\",\"bedrooms\":3,\"bathrooms\":2,\"parking_spaces\":1,\"house_size\":null,\"land_size\":null,\"floors\":1,\"year_built\":2026,\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Verified\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":3,\"published_at\":null,\"created_by\":1,\"updated_by\":1,\"created_at\":\"2026-09-07 05:21:50\",\"updated_at\":\"2026-09-07 10:32:01\",\"features\":[],\"agent_id\":\"\",\"seo_title\":\"\",\"seo_description\":\"\",\"canonical_url\":\"\",\"images\":[{\"id\":22,\"property_id\":7,\"filename\":\"20260907_6a9e1f92db806.jpg\",\"alt_text\":\"scoffie\",\"caption\":\"\",\"is_primary\":1,\"sort_order\":0,\"file_size\":null,\"mime_type\":null,\"width\":null,\"height\":null,\"created_at\":\"2026-09-07 05:21:50\"},{\"filename\":\"20260907_6a9e688aab2ba.jpg\",\"file_path\":\"uploads\\/properties\\/20260907_6a9e688aab2ba.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260907_6a9e688aab2ba.jpg\",\"is_primary\":false,\"alt_text\":\"scoffie\",\"caption\":\"\",\"sort_order\":1},{\"filename\":\"20260907_6a9e688abb5ba.jpg\",\"file_path\":\"uploads\\/properties\\/20260907_6a9e688abb5ba.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260907_6a9e688abb5ba.jpg\",\"is_primary\":false,\"alt_text\":\"scoffie\",\"caption\":\"\",\"sort_order\":1}],\"agents\":[]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 07:32:28');
INSERT INTO `audit_logs` VALUES (99,1,'updated_settings','settings',NULL,'[]','{\"branding_logo\":\"\\/uploads\\/branding\\/20260906_6a9d1e5184f95.jpg\",\"branding_mobile_logo\":\"\\/uploads\\/branding\\/20260906_6a9d1e5dde9ed.jpg\",\"branding_light_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/logo-white.svg\",\"branding_dark_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/logo-white.svg\",\"branding_favicon\":\"\\/uploads\\/branding\\/20260906_6a9d1e6d70449.jpg\",\"branding_primary_color\":\"#1e3a8a\",\"branding_secondary_color\":\"#4c1d95\",\"branding_accent_color\":\"#92400e\",\"branding_background\":\"#ffffff\",\"branding_surface\":\"#f8fafc\",\"branding_text_color\":\"#1e293b\",\"branding_muted_text\":\"#64748b\",\"branding_heading_font\":\"Inter\",\"branding_body_font\":\"Inter\",\"contact_phone\":\"+254 700 000 001\",\"contact_whatsapp\":\"+254 700 000 001\",\"contact_email\":\"info@realestate.co.ke\",\"contact_secondary_email\":\"support@realestate.co.ke\",\"contact_address\":\"Suite 201, Capital Centre, Westlands, Nairobi, Kenya\",\"contact_county\":\"Nairobi\",\"contact_country\":\"Kenya\",\"contact_opening_hours\":\"Monday - Friday: 8:00 AM - 6:00 PM\\nSaturday: 9:00 AM - 4:00 PM\\nSunday: Closed\\nPublic Holidays: Closed\",\"contact_map_lat\":\"-1.2864\",\"contact_map_lng\":\"36.8172\",\"contact_map_zoom\":\"12\",\"smtp_host\":\"\",\"smtp_port\":\"587\",\"smtp_username\":\"\",\"smtp_password\":\"\",\"smtp_encryption\":\"tls\",\"smtp_from_name\":\"Prime Realty Kenya\",\"smtp_from_email\":\"info@realestate.co.ke\",\"business_name\":\"Hemaprin Homes\",\"website_name\":\"Hemaprin Homes\",\"tagline\":\"Your Trusted Partner in Kenyan Real Estate\",\"description\":\"Prime Realty Kenya offers professionally managed residential and commercial properties across Kenya. With over 15 years of experience, we help you find, buy, and sell properties with confidence.\",\"default_currency\":\"KES\",\"country\":\"Kenya\",\"timezone\":\"Africa\\/Nairobi\",\"language\":\"en\",\"admin_email\":\"admin@realestate.co.ke\",\"items_per_page\":\"12\",\"session_timeout_minutes\":\"60\",\"max_login_attempts\":\"5\",\"lockout_duration_minutes\":\"15\",\"require_strong_passwords\":\"true\",\"enable_two_factor\":\"false\",\"password_min_length\":\"8\",\"force_password_reset_days\":\"0\",\"seo_site_title\":\"Prime Realty Kenya | Property Marketplace\",\"seo_meta_description\":\"Prime Realty Kenya offers professionally managed residential and commercial properties across Kenya. Find your perfect home or investment property with our expert agents.\",\"seo_default_og_image\":\"\\/uploads\\/branding\\/og-image.jpg\",\"seo_google_verification\":\"\",\"seo_bing_verification\":\"\",\"seo_twitter_card\":\"summary_large_image\",\"seo_favicon\":\"\\/uploads\\/branding\\/favicon.png\",\"maintenance_mode\":\"0\",\"customer_registration\":\"1\",\"property_inquiries\":\"1\",\"viewing_requests\":\"1\",\"whatsapp_enabled\":\"1\",\"floating_social\":\"1\",\"promotions_enabled\":\"1\",\"testimonials_enabled\":\"1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 08:10:54');
INSERT INTO `audit_logs` VALUES (100,1,'updated_settings','settings',NULL,'[]','{\"session_timeout_minutes\":\"60\",\"max_login_attempts\":\"5\",\"lockout_duration_minutes\":\"15\",\"require_strong_passwords\":\"true\",\"enable_two_factor\":\"true\",\"password_min_length\":\"8\",\"force_password_reset_days\":\"0\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 08:14:14');
INSERT INTO `audit_logs` VALUES (101,1,'deleted_viewing_request','viewing_requests',7,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 08:53:02');
INSERT INTO `audit_logs` VALUES (102,1,'updated_settings','settings',NULL,'[]','{\"branding_logo\":\"\\/uploads\\/branding\\/20260906_6a9d1e5184f95.jpg\",\"branding_mobile_logo\":\"\\/uploads\\/branding\\/20260906_6a9d1e5dde9ed.jpg\",\"branding_light_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/logo-white.svg\",\"branding_dark_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/logo-white.svg\",\"branding_favicon\":\"\\/uploads\\/branding\\/20260906_6a9d1e6d70449.jpg\",\"branding_primary_color\":\"#1e3a8a\",\"branding_secondary_color\":\"#4c1d95\",\"branding_accent_color\":\"#92400e\",\"branding_background\":\"#ffffff\",\"branding_surface\":\"#f8fafc\",\"branding_text_color\":\"#1e293b\",\"branding_muted_text\":\"#64748b\",\"branding_heading_font\":\"Roboto\",\"branding_body_font\":\"Inter\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:07:29');
INSERT INTO `audit_logs` VALUES (103,1,'created_agent','agents',6,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:22:43');
INSERT INTO `audit_logs` VALUES (104,1,'uploaded_media','media',17,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:31:05');
INSERT INTO `audit_logs` VALUES (105,1,'updated_promotion','promotions',1,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:31:08');
INSERT INTO `audit_logs` VALUES (106,1,'deleted_media','media',17,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:57:22');
INSERT INTO `audit_logs` VALUES (107,1,'deleted_media','media',15,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:57:23');
INSERT INTO `audit_logs` VALUES (108,1,'deleted_media','media',16,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:57:26');
INSERT INTO `audit_logs` VALUES (109,1,'deleted_media','media',13,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:57:28');
INSERT INTO `audit_logs` VALUES (110,1,'deleted_media','media',14,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:57:30');
INSERT INTO `audit_logs` VALUES (111,1,'deleted_media','media',12,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:57:33');
INSERT INTO `audit_logs` VALUES (112,1,'deleted_media','media',11,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:57:35');
INSERT INTO `audit_logs` VALUES (113,1,'deleted_media','media',10,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:57:37');
INSERT INTO `audit_logs` VALUES (114,1,'deleted_media','media',8,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:57:39');
INSERT INTO `audit_logs` VALUES (115,1,'deleted_media','media',9,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:57:41');
INSERT INTO `audit_logs` VALUES (116,1,'deleted_media','media',7,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:57:43');
INSERT INTO `audit_logs` VALUES (117,1,'deleted_media','media',6,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:57:44');
INSERT INTO `audit_logs` VALUES (118,1,'deleted_media','media',5,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:57:46');
INSERT INTO `audit_logs` VALUES (119,1,'deleted_media','media',4,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:57:48');
INSERT INTO `audit_logs` VALUES (120,1,'deleted_media','media',3,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:57:49');
INSERT INTO `audit_logs` VALUES (121,1,'deleted_media','media',2,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:57:51');
INSERT INTO `audit_logs` VALUES (122,1,'deleted_media','media',1,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:57:53');
INSERT INTO `audit_logs` VALUES (123,1,'uploaded_media','media',18,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 09:58:02');
INSERT INTO `audit_logs` VALUES (124,1,'uploaded_media','media',19,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 10:03:05');
INSERT INTO `audit_logs` VALUES (125,1,'uploaded_media','media',20,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 10:56:46');
INSERT INTO `audit_logs` VALUES (126,1,'uploaded_media','media',21,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 12:31:08');
INSERT INTO `audit_logs` VALUES (127,1,'uploaded_media','media',22,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 12:31:21');
INSERT INTO `audit_logs` VALUES (128,1,'uploaded_media','media',23,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 12:31:28');
INSERT INTO `audit_logs` VALUES (129,1,'uploaded_media','media',24,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 12:31:34');
INSERT INTO `audit_logs` VALUES (130,1,'uploaded_media','media',25,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 12:31:40');
INSERT INTO `audit_logs` VALUES (131,1,'updated_settings','settings',NULL,'[]','{\"branding_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/20260907_6a9eae8c33e5a.jpeg\",\"branding_mobile_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/20260907_6a9eae99bd0e9.jpeg\",\"branding_light_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/20260907_6a9eaea0601c4.jpeg\",\"branding_dark_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/20260907_6a9eaea6a581f.jpeg\",\"branding_favicon\":\"\\/homes\\/backend\\/uploads\\/branding\\/20260907_6a9eaeabf2d0f.jpeg\",\"branding_primary_color\":\"#1e3a8a\",\"branding_secondary_color\":\"#4c1d95\",\"branding_accent_color\":\"#92400e\",\"branding_background\":\"#ffffff\",\"branding_surface\":\"#f8fafc\",\"branding_text_color\":\"#1e293b\",\"branding_muted_text\":\"#64748b\",\"branding_heading_font\":\"Roboto\",\"branding_body_font\":\"Inter\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 12:31:44');
INSERT INTO `audit_logs` VALUES (132,1,'uploaded_media','media',26,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 12:56:22');
INSERT INTO `audit_logs` VALUES (133,1,'updated_settings','settings',NULL,'[]','{\"branding_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/20260907_6a9eb476ac25c.jpeg\",\"branding_mobile_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/20260907_6a9eae99bd0e9.jpeg\",\"branding_light_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/20260907_6a9eaea0601c4.jpeg\",\"branding_dark_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/20260907_6a9eaea6a581f.jpeg\",\"branding_favicon\":\"\\/homes\\/backend\\/uploads\\/branding\\/20260907_6a9eaeabf2d0f.jpeg\",\"branding_primary_color\":\"#1e3a8a\",\"branding_secondary_color\":\"#4c1d95\",\"branding_accent_color\":\"#92400e\",\"branding_background\":\"#ffffff\",\"branding_surface\":\"#f8fafc\",\"branding_text_color\":\"#1e293b\",\"branding_muted_text\":\"#64748b\",\"branding_heading_font\":\"Roboto\",\"branding_body_font\":\"Inter\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 12:56:27');
INSERT INTO `audit_logs` VALUES (134,1,'uploaded_media','media',27,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:03:06');
INSERT INTO `audit_logs` VALUES (135,1,'updated_settings','settings',NULL,'[]','{\"branding_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/20260907_6a9eb609f257a.jpeg\",\"branding_mobile_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/20260907_6a9eae99bd0e9.jpeg\",\"branding_light_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/20260907_6a9eaea0601c4.jpeg\",\"branding_dark_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/20260907_6a9eaea6a581f.jpeg\",\"branding_favicon\":\"\\/homes\\/backend\\/uploads\\/branding\\/20260907_6a9eaeabf2d0f.jpeg\",\"branding_primary_color\":\"#1e3a8a\",\"branding_secondary_color\":\"#4c1d95\",\"branding_accent_color\":\"#92400e\",\"branding_background\":\"#ffffff\",\"branding_surface\":\"#f8fafc\",\"branding_text_color\":\"#1e293b\",\"branding_muted_text\":\"#64748b\",\"branding_heading_font\":\"Roboto\",\"branding_body_font\":\"Inter\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:03:08');
INSERT INTO `audit_logs` VALUES (136,1,'deleted_media','media',27,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:03:30');
INSERT INTO `audit_logs` VALUES (137,1,'deleted_media','media',25,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:03:32');
INSERT INTO `audit_logs` VALUES (138,1,'deleted_media','media',26,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:03:34');
INSERT INTO `audit_logs` VALUES (139,1,'deleted_media','media',23,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:03:37');
INSERT INTO `audit_logs` VALUES (140,1,'deleted_media','media',24,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:03:41');
INSERT INTO `audit_logs` VALUES (141,1,'deleted_media','media',21,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:03:43');
INSERT INTO `audit_logs` VALUES (142,1,'deleted_media','media',22,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:03:46');
INSERT INTO `audit_logs` VALUES (143,1,'deleted_media','media',19,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:03:48');
INSERT INTO `audit_logs` VALUES (144,1,'uploaded_media','media',28,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:04:45');
INSERT INTO `audit_logs` VALUES (145,1,'updated_promotion','promotions',1,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:04:48');
INSERT INTO `audit_logs` VALUES (146,1,'uploaded_media','media',29,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:05:05');
INSERT INTO `audit_logs` VALUES (147,1,'updated_promotion','promotions',1,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:05:11');
INSERT INTO `audit_logs` VALUES (148,1,'uploaded_media','media',30,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:07:27');
INSERT INTO `audit_logs` VALUES (149,1,'uploaded_media','media',31,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:07:39');
INSERT INTO `audit_logs` VALUES (150,1,'updated_property','properties',7,'{\"id\":7,\"property_type_id\":1,\"name\":\"scoffie\",\"slug\":\"scoffie\",\"description\":\"uuuuuuu\",\"price\":\"8888888.00\",\"currency\":\"KES\",\"location\":\"Naivasha Sopa Resort, Kenya\",\"county\":\"Kajiado\",\"town\":\"kiambu\",\"area\":\"kkk\",\"estate\":\"\",\"address\":\"2344\",\"latitude\":\"0.00000000\",\"longitude\":\"0.00000000\",\"bedrooms\":3,\"bathrooms\":2,\"parking_spaces\":1,\"house_size\":null,\"land_size\":null,\"floors\":1,\"year_built\":\"2026\",\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Verified\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":6,\"published_at\":null,\"created_by\":1,\"updated_by\":1,\"created_at\":\"2026-09-07 05:21:50\",\"updated_at\":\"2026-09-07 12:00:48\"}','{\"id\":7,\"property_type_id\":1,\"name\":\"scoffie\",\"slug\":\"scoffie\",\"description\":\"uuuuuuu\",\"price\":8888888,\"currency\":\"KES\",\"location\":\"Naivasha Sopa Resort, Kenya\",\"county\":\"Kajiado\",\"town\":\"kiambu\",\"area\":\"kkk\",\"estate\":\"\",\"address\":\"2344\",\"latitude\":\"0.00000000\",\"longitude\":\"0.00000000\",\"bedrooms\":3,\"bathrooms\":2,\"parking_spaces\":1,\"house_size\":null,\"land_size\":null,\"floors\":1,\"year_built\":2026,\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Verified\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":6,\"published_at\":null,\"created_by\":1,\"updated_by\":1,\"created_at\":\"2026-09-07 05:21:50\",\"updated_at\":\"2026-09-07 12:00:48\",\"features\":[],\"agent_id\":\"\",\"seo_title\":\"\",\"seo_description\":\"\",\"canonical_url\":\"\",\"images\":[{\"id\":23,\"property_id\":7,\"filename\":\"20260907_6a9e1f92db806.jpg\",\"alt_text\":\"scoffie\",\"caption\":\"\",\"is_primary\":1,\"sort_order\":0,\"file_size\":null,\"mime_type\":null,\"width\":null,\"height\":null,\"created_at\":\"2026-09-07 10:32:28\"},{\"id\":24,\"property_id\":7,\"filename\":\"20260907_6a9e688aab2ba.jpg\",\"alt_text\":\"scoffie\",\"caption\":\"\",\"is_primary\":0,\"sort_order\":1,\"file_size\":null,\"mime_type\":null,\"width\":null,\"height\":null,\"created_at\":\"2026-09-07 10:32:28\"},{\"id\":25,\"property_id\":7,\"filename\":\"20260907_6a9e688abb5ba.jpg\",\"alt_text\":\"scoffie\",\"caption\":\"\",\"is_primary\":0,\"sort_order\":1,\"file_size\":null,\"mime_type\":null,\"width\":null,\"height\":null,\"created_at\":\"2026-09-07 10:32:28\"},{\"filename\":\"20260907_6a9eb70f28596.jpg\",\"file_path\":\"uploads\\/properties\\/20260907_6a9eb70f28596.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260907_6a9eb70f28596.jpg\",\"is_primary\":false,\"alt_text\":\"scoffie\",\"caption\":\"\",\"sort_order\":3},{\"filename\":\"20260907_6a9eb71b5fff1.jpg\",\"file_path\":\"uploads\\/properties\\/20260907_6a9eb71b5fff1.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260907_6a9eb71b5fff1.jpg\",\"is_primary\":false,\"alt_text\":\"scoffie\",\"caption\":\"\",\"sort_order\":4}],\"agents\":[]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:07:41');
INSERT INTO `audit_logs` VALUES (151,1,'updated_property','properties',7,'{\"id\":7,\"property_type_id\":1,\"name\":\"scoffie\",\"slug\":\"scoffie\",\"description\":\"uuuuuuu\",\"price\":\"8888888.00\",\"currency\":\"KES\",\"location\":\"Naivasha Sopa Resort, Kenya\",\"county\":\"Kajiado\",\"town\":\"kiambu\",\"area\":\"kkk\",\"estate\":\"\",\"address\":\"2344\",\"latitude\":\"0.00000000\",\"longitude\":\"0.00000000\",\"bedrooms\":3,\"bathrooms\":2,\"parking_spaces\":1,\"house_size\":null,\"land_size\":null,\"floors\":1,\"year_built\":\"2026\",\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Verified\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":7,\"published_at\":null,\"created_by\":1,\"updated_by\":1,\"created_at\":\"2026-09-07 05:21:50\",\"updated_at\":\"2026-09-07 16:08:01\"}','{\"id\":7,\"property_type_id\":1,\"name\":\"scoffie\",\"slug\":\"scoffie\",\"description\":\"uuuuuuu\",\"price\":8888888,\"currency\":\"KES\",\"location\":\"Naivasha Sopa Resort, Kenya\",\"county\":\"Kajiado\",\"town\":\"kiambu\",\"area\":\"kkk\",\"estate\":\"\",\"address\":\"2344\",\"latitude\":\"0.00000000\",\"longitude\":\"0.00000000\",\"bedrooms\":3,\"bathrooms\":2,\"parking_spaces\":1,\"house_size\":null,\"land_size\":null,\"floors\":1,\"year_built\":2026,\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Verified\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":7,\"published_at\":null,\"created_by\":1,\"updated_by\":1,\"created_at\":\"2026-09-07 05:21:50\",\"updated_at\":\"2026-09-07 16:08:01\",\"features\":[],\"agent_id\":\"\",\"seo_title\":\"\",\"seo_description\":\"\",\"canonical_url\":\"\",\"images\":[{\"id\":29,\"property_id\":7,\"filename\":\"20260907_6a9eb70f28596.jpg\",\"alt_text\":\"scoffie\",\"caption\":\"\",\"is_primary\":true,\"sort_order\":3,\"file_size\":null,\"mime_type\":null,\"width\":null,\"height\":null,\"created_at\":\"2026-09-07 16:07:41\"},{\"id\":30,\"property_id\":7,\"filename\":\"20260907_6a9eb71b5fff1.jpg\",\"alt_text\":\"scoffie\",\"caption\":\"\",\"is_primary\":0,\"sort_order\":4,\"file_size\":null,\"mime_type\":null,\"width\":null,\"height\":null,\"created_at\":\"2026-09-07 16:07:41\"}],\"agents\":[]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:08:12');
INSERT INTO `audit_logs` VALUES (152,1,'uploaded_media','media',32,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:08:23');
INSERT INTO `audit_logs` VALUES (153,1,'uploaded_media','media',33,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:08:23');
INSERT INTO `audit_logs` VALUES (154,1,'updated_property','properties',6,'{\"id\":6,\"property_type_id\":1,\"name\":\"charles\",\"slug\":\"charles\",\"description\":\"jjkk\",\"price\":\"8888870.00\",\"currency\":\"KES\",\"location\":\"Naivasha Sopa Resort, Kenya\",\"county\":\"Nairobi\",\"town\":\"kiambu\",\"area\":\"\",\"estate\":\"\",\"address\":\"\",\"latitude\":\"0.00000000\",\"longitude\":\"0.00000000\",\"bedrooms\":3,\"bathrooms\":2,\"parking_spaces\":1,\"house_size\":null,\"land_size\":null,\"floors\":1,\"year_built\":\"2026\",\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Pending\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":3,\"published_at\":null,\"created_by\":1,\"updated_by\":1,\"created_at\":\"2026-09-06 14:42:01\",\"updated_at\":\"2026-09-06 16:19:19\"}','{\"id\":6,\"property_type_id\":1,\"name\":\"charles\",\"slug\":\"charles\",\"description\":\"jjkk\",\"price\":8888870,\"currency\":\"KES\",\"location\":\"Naivasha Sopa Resort, Kenya\",\"county\":\"Nairobi\",\"town\":\"kiambu\",\"area\":\"\",\"estate\":\"\",\"address\":\"\",\"latitude\":\"0.00000000\",\"longitude\":\"0.00000000\",\"bedrooms\":3,\"bathrooms\":2,\"parking_spaces\":1,\"house_size\":null,\"land_size\":null,\"floors\":1,\"year_built\":2026,\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Pending\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":3,\"published_at\":null,\"created_by\":1,\"updated_by\":1,\"created_at\":\"2026-09-06 14:42:01\",\"updated_at\":\"2026-09-06 16:19:19\",\"features\":[],\"agent_id\":\"\",\"seo_title\":\"\",\"seo_description\":\"\",\"canonical_url\":\"\",\"images\":[],\"agents\":[]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:08:30');
INSERT INTO `audit_logs` VALUES (155,1,'uploaded_media','media',34,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:08:40');
INSERT INTO `audit_logs` VALUES (156,1,'uploaded_media','media',35,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:08:40');
INSERT INTO `audit_logs` VALUES (157,1,'updated_property','properties',6,'{\"id\":6,\"property_type_id\":1,\"name\":\"charles\",\"slug\":\"charles\",\"description\":\"jjkk\",\"price\":\"8888870.00\",\"currency\":\"KES\",\"location\":\"Naivasha Sopa Resort, Kenya\",\"county\":\"Nairobi\",\"town\":\"kiambu\",\"area\":\"\",\"estate\":\"\",\"address\":\"\",\"latitude\":\"0.00000000\",\"longitude\":\"0.00000000\",\"bedrooms\":3,\"bathrooms\":2,\"parking_spaces\":1,\"house_size\":null,\"land_size\":null,\"floors\":1,\"year_built\":\"2026\",\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Pending\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":3,\"published_at\":null,\"created_by\":1,\"updated_by\":1,\"created_at\":\"2026-09-06 14:42:01\",\"updated_at\":\"2026-09-06 16:19:19\"}','{\"id\":6,\"property_type_id\":1,\"name\":\"charles\",\"slug\":\"charles\",\"description\":\"jjkk\",\"price\":8888870,\"currency\":\"KES\",\"location\":\"Naivasha Sopa Resort, Kenya\",\"county\":\"Nairobi\",\"town\":\"kiambu\",\"area\":\"\",\"estate\":\"\",\"address\":\"\",\"latitude\":\"0.00000000\",\"longitude\":\"0.00000000\",\"bedrooms\":3,\"bathrooms\":2,\"parking_spaces\":1,\"house_size\":null,\"land_size\":null,\"floors\":1,\"year_built\":2026,\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Pending\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":3,\"published_at\":null,\"created_by\":1,\"updated_by\":1,\"created_at\":\"2026-09-06 14:42:01\",\"updated_at\":\"2026-09-06 16:19:19\",\"features\":[],\"agent_id\":\"\",\"seo_title\":\"\",\"seo_description\":\"\",\"canonical_url\":\"\",\"images\":[{\"filename\":\"20260907_6a9eb7589cbb7.jpg\",\"file_path\":\"uploads\\/properties\\/20260907_6a9eb7589cbb7.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260907_6a9eb7589cbb7.jpg\",\"is_primary\":true,\"alt_text\":\"charles\",\"caption\":\"\",\"sort_order\":0},{\"filename\":\"20260907_6a9eb758cb224.jpg\",\"file_path\":\"uploads\\/properties\\/20260907_6a9eb758cb224.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260907_6a9eb758cb224.jpg\",\"is_primary\":true,\"alt_text\":\"charles\",\"caption\":\"\",\"sort_order\":0}],\"agents\":[]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:08:43');
INSERT INTO `audit_logs` VALUES (158,1,'uploaded_media','media',36,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:28:20');
INSERT INTO `audit_logs` VALUES (159,1,'updated_settings','settings',NULL,'[]','{\"branding_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/20260907_6a9ebbf466a20.jpeg\",\"branding_mobile_logo\":\"\\/backend\\/uploads\\/branding\\/logo-mobile.svg\",\"branding_light_logo\":\"\\/backend\\/uploads\\/branding\\/logo-white.svg\",\"branding_dark_logo\":\"\\/backend\\/uploads\\/branding\\/logo-white.svg\",\"branding_favicon\":\"\\/backend\\/uploads\\/branding\\/favicon.svg\",\"branding_primary_color\":\"#1e3a8a\",\"branding_secondary_color\":\"#4c1d95\",\"branding_accent_color\":\"#92400e\",\"branding_background\":\"#ffffff\",\"branding_surface\":\"#f8fafc\",\"branding_text_color\":\"#1e293b\",\"branding_muted_text\":\"#64748b\",\"branding_heading_font\":\"Roboto\",\"branding_body_font\":\"Inter\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 13:28:22');
INSERT INTO `audit_logs` VALUES (160,0,'failed_login','users',NULL,'[]','{\"email\":\"test@invalid.com\",\"ip\":\"::1\"}','::1','','2026-09-07 13:32:16');
INSERT INTO `audit_logs` VALUES (161,1,'created_agent','agents',7,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 14:24:27');
INSERT INTO `audit_logs` VALUES (162,1,'uploaded_media','media',37,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 14:24:41');
INSERT INTO `audit_logs` VALUES (163,1,'updated_promotion','promotions',1,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 14:24:50');
INSERT INTO `audit_logs` VALUES (164,1,'uploaded_media','media',38,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 14:26:32');
INSERT INTO `audit_logs` VALUES (165,1,'created_promotion','promotions',5,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 14:26:39');
INSERT INTO `audit_logs` VALUES (166,1,'uploaded_media','media',39,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 14:27:07');
INSERT INTO `audit_logs` VALUES (167,1,'created_promotion','promotions',6,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 14:27:09');
INSERT INTO `audit_logs` VALUES (168,1,'uploaded_media','media',40,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 14:27:27');
INSERT INTO `audit_logs` VALUES (169,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','','2026-09-07 18:37:59');
INSERT INTO `audit_logs` VALUES (170,3,'login','users',3,'[]','{\"ip\":\"::1\"}','::1','','2026-09-07 18:42:39');
INSERT INTO `audit_logs` VALUES (171,1,'uploaded_media','media',41,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 20:25:24');
INSERT INTO `audit_logs` VALUES (172,1,'uploaded_media','media',42,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 20:25:24');
INSERT INTO `audit_logs` VALUES (173,1,'uploaded_media','media',43,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 20:25:24');
INSERT INTO `audit_logs` VALUES (174,1,'uploaded_media','media',44,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 20:35:55');
INSERT INTO `audit_logs` VALUES (175,1,'uploaded_media','media',45,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 20:35:55');
INSERT INTO `audit_logs` VALUES (176,1,'uploaded_media','media',46,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 20:35:55');
INSERT INTO `audit_logs` VALUES (177,1,'created_property','properties',12,'[]','{\"name\":\"charles\",\"slug\":\"charles\",\"property_type_id\":1,\"price\":7777,\"currency\":\"KES\",\"description\":\"GEGEGEGFG\",\"location\":\"jhjhh\",\"county\":\"Nairobi\",\"town\":\"kiambu\",\"area\":\"5GT\",\"estate\":\"7UU\",\"address\":\"\",\"latitude\":\"\",\"longitude\":\"\",\"bedrooms\":3,\"bathrooms\":2,\"parking_spaces\":1,\"house_size\":null,\"land_size\":null,\"floors\":1,\"year_built\":2026,\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Verified\",\"featured\":1,\"features\":[1,2,3],\"agent_id\":\"\",\"seo_title\":\"\",\"seo_description\":\"\",\"canonical_url\":\"\",\"images\":[{\"filename\":\"20260907_6a9f202b35478.jpg\",\"file_path\":\"uploads\\/properties\\/20260907_6a9f202b35478.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260907_6a9f202b35478.jpg\",\"is_primary\":true,\"alt_text\":\"charles\",\"caption\":\"\",\"sort_order\":0},{\"filename\":\"20260907_6a9f202b52f3b.jpg\",\"file_path\":\"uploads\\/properties\\/20260907_6a9f202b52f3b.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260907_6a9f202b52f3b.jpg\",\"is_primary\":true,\"alt_text\":\"charles\",\"caption\":\"\",\"sort_order\":0},{\"filename\":\"20260907_6a9f202b78545.jpg\",\"file_path\":\"uploads\\/properties\\/20260907_6a9f202b78545.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260907_6a9f202b78545.jpg\",\"is_primary\":true,\"alt_text\":\"charles\",\"caption\":\"\",\"sort_order\":0}],\"agents\":[]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 20:35:59');
INSERT INTO `audit_logs` VALUES (178,1,'uploaded_media','media',47,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 20:56:16');
INSERT INTO `audit_logs` VALUES (179,1,'uploaded_media','media',48,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 20:56:16');
INSERT INTO `audit_logs` VALUES (180,1,'uploaded_media','media',49,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 20:56:16');
INSERT INTO `audit_logs` VALUES (181,1,'created_property','properties',13,'[]','{\"name\":\"BBBB\",\"slug\":\"bbbb\",\"property_type_id\":1,\"price\":88888,\"currency\":\"KES\",\"description\":\"HHH\",\"location\":\"TTTRRERR\",\"county\":\"Nairobi\",\"town\":\"ERRR\",\"area\":\"TR5\",\"estate\":\"YTYY\",\"address\":\"TRY\",\"latitude\":\"\",\"longitude\":\"\",\"bedrooms\":3,\"bathrooms\":2,\"parking_spaces\":1,\"house_size\":null,\"land_size\":null,\"floors\":1,\"year_built\":2026,\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Pending\",\"featured\":1,\"features\":[1,12,3],\"agent_id\":\"\",\"seo_title\":\"\",\"seo_description\":\"\",\"canonical_url\":\"\",\"images\":[{\"filename\":\"20260907_6a9f24f02e9ba.jpeg\",\"file_path\":\"uploads\\/properties\\/20260907_6a9f24f02e9ba.jpeg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260907_6a9f24f02e9ba.jpeg\",\"is_primary\":true,\"alt_text\":\"BBBB\",\"caption\":\"\",\"sort_order\":0},{\"filename\":\"20260907_6a9f24f03ec1b.jpeg\",\"file_path\":\"uploads\\/properties\\/20260907_6a9f24f03ec1b.jpeg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260907_6a9f24f03ec1b.jpeg\",\"is_primary\":true,\"alt_text\":\"BBBB\",\"caption\":\"\",\"sort_order\":0},{\"filename\":\"20260907_6a9f24f04f96a.jpeg\",\"file_path\":\"uploads\\/properties\\/20260907_6a9f24f04f96a.jpeg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260907_6a9f24f04f96a.jpeg\",\"is_primary\":true,\"alt_text\":\"BBBB\",\"caption\":\"\",\"sort_order\":0}],\"agents\":[]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 20:56:19');
INSERT INTO `audit_logs` VALUES (182,1,'updated_property','properties',13,'{\"id\":13,\"property_type_id\":1,\"name\":\"BBBB\",\"slug\":\"bbbb\",\"description\":\"HHH\",\"price\":\"88888.00\",\"currency\":\"KES\",\"location\":\"TTTRRERR\",\"county\":\"Nairobi\",\"town\":\"ERRR\",\"area\":\"TR5\",\"estate\":\"YTYY\",\"address\":\"TRY\",\"latitude\":null,\"longitude\":null,\"bedrooms\":3,\"bathrooms\":2,\"parking_spaces\":1,\"house_size\":null,\"land_size\":null,\"floors\":1,\"year_built\":\"2026\",\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Pending\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":1,\"published_at\":null,\"created_by\":1,\"updated_by\":1,\"created_at\":\"2026-09-07 23:56:19\",\"updated_at\":\"2026-09-07 23:56:48\"}','{\"id\":13,\"property_type_id\":11,\"name\":\"BBBB\",\"slug\":\"bbbb\",\"description\":\"HHH\",\"price\":88888,\"currency\":\"KES\",\"location\":\"TTTRRERR\",\"county\":\"Nairobi\",\"town\":\"ERRR\",\"area\":\"TR5\",\"estate\":\"YTYY\",\"address\":\"TRY\",\"latitude\":\"\",\"longitude\":\"\",\"bedrooms\":3,\"bathrooms\":2,\"parking_spaces\":1,\"house_size\":null,\"land_size\":null,\"floors\":1,\"year_built\":2026,\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Pending\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":1,\"published_at\":null,\"created_by\":1,\"updated_by\":1,\"created_at\":\"2026-09-07 23:56:19\",\"updated_at\":\"2026-09-07 23:56:48\",\"features\":[1,3,12],\"agent_id\":\"\",\"seo_title\":\"\",\"seo_description\":\"\",\"canonical_url\":\"\",\"images\":[{\"id\":42,\"property_id\":13,\"filename\":\"20260907_6a9f24f02e9ba.jpeg\",\"alt_text\":\"BBBB\",\"caption\":\"\",\"is_primary\":1,\"sort_order\":0,\"file_size\":null,\"mime_type\":null,\"width\":null,\"height\":null,\"created_at\":\"2026-09-07 23:56:19\"},{\"id\":43,\"property_id\":13,\"filename\":\"20260907_6a9f24f03ec1b.jpeg\",\"alt_text\":\"BBBB\",\"caption\":\"\",\"is_primary\":1,\"sort_order\":0,\"file_size\":null,\"mime_type\":null,\"width\":null,\"height\":null,\"created_at\":\"2026-09-07 23:56:19\"},{\"id\":44,\"property_id\":13,\"filename\":\"20260907_6a9f24f04f96a.jpeg\",\"alt_text\":\"BBBB\",\"caption\":\"\",\"is_primary\":1,\"sort_order\":0,\"file_size\":null,\"mime_type\":null,\"width\":null,\"height\":null,\"created_at\":\"2026-09-07 23:56:19\"}],\"agents\":[]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-07 20:56:58');
INSERT INTO `audit_logs` VALUES (183,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 05:54:47');
INSERT INTO `audit_logs` VALUES (184,1,'uploaded_media','media',50,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 06:22:32');
INSERT INTO `audit_logs` VALUES (185,1,'uploaded_media','media',51,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 06:22:32');
INSERT INTO `audit_logs` VALUES (186,1,'uploaded_media','media',52,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 06:22:32');
INSERT INTO `audit_logs` VALUES (187,1,'updated_property','properties',9,'{\"id\":9,\"property_type_id\":10,\"name\":\"1\\/4 Acre Commercial Plot along Ruiru Eastern Bypass\",\"slug\":\"quarter-acre-commercial-plot-ruiru-eastern-bypass\",\"description\":\"Prime 1\\/4 acre commercial \\/ mixed-use plot situated just 150 meters off the bustling Ruiru Eastern Bypass. High capital appreciation corridor with intense ongoing commercial and residential developments. Perfect for commercial apartments, medical center, corporate offices, or institutional use. Has a clear freehold title deed, 3-phase electricity nearby, and water connection.\",\"price\":\"9500000.00\",\"currency\":\"KES\",\"location\":\"Eastern Bypass, Ruiru\",\"county\":\"Kiambu\",\"town\":\"Ruiru\",\"area\":\"Eastern Bypass\",\"estate\":\"Corner Brook Area\",\"address\":\"2nd row from Ruiru Eastern Bypass tarmac\",\"latitude\":null,\"longitude\":null,\"bedrooms\":0,\"bathrooms\":0,\"parking_spaces\":0,\"house_size\":null,\"land_size\":\"1012.00\",\"floors\":1,\"year_built\":null,\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Verified\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":12,\"published_at\":null,\"created_by\":1,\"updated_by\":null,\"created_at\":\"2026-09-07 22:31:17\",\"updated_at\":\"2026-09-07 22:31:17\"}','{\"id\":9,\"property_type_id\":10,\"name\":\"1\\/4 Acre Commercial Plot along Ruiru Eastern Bypass\",\"slug\":\"quarter-acre-commercial-plot-ruiru-eastern-bypass\",\"description\":\"Prime 1\\/4 acre commercial \\/ mixed-use plot situated just 150 meters off the bustling Ruiru Eastern Bypass. High capital appreciation corridor with intense ongoing commercial and residential developments. Perfect for commercial apartments, medical center, corporate offices, or institutional use. Has a clear freehold title deed, 3-phase electricity nearby, and water connection.\",\"price\":9500000,\"currency\":\"KES\",\"location\":\"Eastern Bypass, Ruiru\",\"county\":\"Kiambu\",\"town\":\"Ruiru\",\"area\":\"Eastern Bypass\",\"estate\":\"Corner Brook Area\",\"address\":\"2nd row from Ruiru Eastern Bypass tarmac\",\"latitude\":\"\",\"longitude\":\"\",\"bedrooms\":0,\"bathrooms\":0,\"parking_spaces\":0,\"house_size\":null,\"land_size\":1012,\"floors\":1,\"year_built\":null,\"furnishing_status\":\"Unfurnished\",\"status\":\"Available\",\"verification_status\":\"Verified\",\"verification_notes\":null,\"verified_by\":null,\"verified_at\":null,\"featured\":1,\"views_count\":12,\"published_at\":null,\"created_by\":1,\"updated_by\":null,\"created_at\":\"2026-09-07 22:31:17\",\"updated_at\":\"2026-09-07 22:31:17\",\"features\":[26,27,28,31],\"agent_id\":\"\",\"seo_title\":\"\",\"seo_description\":\"\",\"canonical_url\":\"\",\"images\":[{\"filename\":\"20260908_6a9fa9a8407d0.jpg\",\"file_path\":\"uploads\\/properties\\/20260908_6a9fa9a8407d0.jpg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260908_6a9fa9a8407d0.jpg\",\"is_primary\":true,\"alt_text\":\"1\\/4 Acre Commercial Plot along Ruiru Eastern Bypass\",\"caption\":\"\",\"sort_order\":1},{\"filename\":\"20260908_6a9fa9a852d43.jpeg\",\"file_path\":\"uploads\\/properties\\/20260908_6a9fa9a852d43.jpeg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260908_6a9fa9a852d43.jpeg\",\"is_primary\":false,\"alt_text\":\"1\\/4 Acre Commercial Plot along Ruiru Eastern Bypass\",\"caption\":\"\",\"sort_order\":1},{\"filename\":\"20260908_6a9fa9a864576.jpeg\",\"file_path\":\"uploads\\/properties\\/20260908_6a9fa9a864576.jpeg\",\"url\":\"\\/homes\\/backend\\/uploads\\/properties\\/20260908_6a9fa9a864576.jpeg\",\"is_primary\":false,\"alt_text\":\"1\\/4 Acre Commercial Plot along Ruiru Eastern Bypass\",\"caption\":\"\",\"sort_order\":1}],\"agents\":[]}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 06:22:36');
INSERT INTO `audit_logs` VALUES (188,1,'updated_property_verification','properties',9,'[]','{\"status\":\"verified\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 06:44:06');
INSERT INTO `audit_logs` VALUES (189,1,'updated_property_verification','properties',9,'[]','{\"status\":\"verified\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 06:44:12');
INSERT INTO `audit_logs` VALUES (190,1,'logout','users',1,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 06:44:50');
INSERT INTO `audit_logs` VALUES (191,6,'login','users',6,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 06:46:17');
INSERT INTO `audit_logs` VALUES (192,6,'logout','users',6,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 06:48:07');
INSERT INTO `audit_logs` VALUES (193,0,'failed_login','users',1,'[]','{\"email\":\"admin@realestate.co.ke\",\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 06:48:44');
INSERT INTO `audit_logs` VALUES (194,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 06:48:58');
INSERT INTO `audit_logs` VALUES (195,1,'updated_property_verification','properties',9,'[]','{\"status\":\"rejected\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 06:49:32');
INSERT INTO `audit_logs` VALUES (196,1,'updated_property_verification','properties',12,'[]','{\"status\":\"Available\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 07:57:19');
INSERT INTO `audit_logs` VALUES (197,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 09:20:59');
INSERT INTO `audit_logs` VALUES (198,1,'login','users',1,'[]','{\"ip\":\"::1\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 09:21:02');
INSERT INTO `audit_logs` VALUES (199,1,'uploaded_media','media',53,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 09:50:07');
INSERT INTO `audit_logs` VALUES (200,1,'uploaded_media','media',54,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 09:50:13');
INSERT INTO `audit_logs` VALUES (201,1,'uploaded_media','media',55,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 09:50:19');
INSERT INTO `audit_logs` VALUES (202,1,'uploaded_media','media',56,'[]','[]','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 09:50:23');
INSERT INTO `audit_logs` VALUES (203,1,'updated_settings','settings',NULL,'[]','{\"branding_logo\":\"\\/homes\\/backend\\/uploads\\/branding\\/20260907_6a9ebbf466a20.jpeg\",\"branding_mobile_logo\":\"uploads\\/branding\\/20260908_6a9fda5f54cf4.jpeg\",\"branding_light_logo\":\"uploads\\/branding\\/20260908_6a9fda551d38a.jpeg\",\"branding_dark_logo\":\"uploads\\/branding\\/20260908_6a9fda5b1ba11.jpeg\",\"branding_favicon\":\"uploads\\/branding\\/20260908_6a9fda4fd0c2e.jpeg\",\"branding_primary_color\":\"#1e3a8a\",\"branding_secondary_color\":\"#4c1d95\",\"branding_accent_color\":\"#92400e\",\"branding_background\":\"#ffffff\",\"branding_surface\":\"#f8fafc\",\"branding_text_color\":\"#1e293b\",\"branding_muted_text\":\"#64748b\",\"branding_heading_font\":\"Roboto\",\"branding_body_font\":\"Inter\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','2026-09-08 09:50:25');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_submissions`
--

DROP TABLE IF EXISTS `contact_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contact_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `preferred_contact` enum('email','phone','whatsapp') DEFAULT 'email',
  `status` enum('unread','read','responded','spam') DEFAULT 'unread',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_submissions`
--

LOCK TABLES `contact_submissions` WRITE;
/*!40000 ALTER TABLE `contact_submissions` DISABLE KEYS */;
INSERT INTO `contact_submissions` VALUES (1,'Super Administrator','admin@realestate.co.ke','+254 700 000 001','6tooiy','kkkkkkkkkkkk','phone','unread','2026-09-07 01:55:05','2026-09-07 01:55:05');
INSERT INTO `contact_submissions` VALUES (2,'Super Administrator','admin@realestate.co.ke','+254700000001','6tooiy','jjjjjkkkkkklllll','email','unread','2026-09-07 02:17:52','2026-09-07 02:17:52');
INSERT INTO `contact_submissions` VALUES (3,'ggg','admin@realestate.co.ke','+254700000001','gggg','ggggjyuyuyyy','email','unread','2026-09-08 09:42:42','2026-09-08 09:42:42');
INSERT INTO `contact_submissions` VALUES (4,'Super Administrator','admin@realestate.co.ke','+254700000001','6tooiyjujjjjj','hhhhh','email','unread','2026-09-08 09:45:59','2026-09-08 09:45:59');
/*!40000 ALTER TABLE `contact_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `earb_info`
--

DROP TABLE IF EXISTS `earb_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `earb_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key_name` varchar(100) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `field_type` enum('text','textarea','number','date','file','boolean') DEFAULT 'text',
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_name` (`key_name`),
  KEY `idx_key` (`key_name`),
  KEY `idx_order` (`sort_order`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `earb_info`
--

LOCK TABLES `earb_info` WRITE;
/*!40000 ALTER TABLE `earb_info` DISABLE KEYS */;
INSERT INTO `earb_info` VALUES (1,'earb_registration_number','EARB Registration Number','REA-001-123456','text',1,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `earb_info` VALUES (2,'practicing_certificate','Practicing Certificate Number','PC-2024-001','text',2,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `earb_info` VALUES (3,'practicing_certificate_expiry','Practicing Certificate Expiry','2025-12-31','date',3,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `earb_info` VALUES (4,'broker_name','Broker Name','Prime Realty Kenya Ltd','text',4,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `earb_info` VALUES (5,'broker_license','Broker License Number','BL-2024-REAL-789','text',5,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `earb_info` VALUES (6,'regulatory_body','Regulatory Body','Real Estate Regulatory Authority (EARBA)','text',6,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `earb_info` VALUES (7,'verification_notes','Verification Notes','All agents are duly registered and certified by the Real Estate Regulatory Authority of Kenya.','textarea',7,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
/*!40000 ALTER TABLE `earb_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faqs`
--

DROP TABLE IF EXISTS `faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `faqs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_active` (`is_active`),
  KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqs`
--

LOCK TABLES `faqs` WRITE;
/*!40000 ALTER TABLE `faqs` DISABLE KEYS */;
INSERT INTO `faqs` VALUES (1,'How do I search for properties?','Use the search bar on the homepage or visit the Properties page. You can filter by location, price, property type, bedrooms, and more.','General',1,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `faqs` VALUES (2,'Are the properties verified?','We have a multi-step verification process. Look for the \"Verified\" badge on property listings for properties that have passed our verification checks.','Verification',2,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `faqs` VALUES (3,'Can I schedule a viewing?','Yes! Each property listing has a \"Request Viewing\" button. Fill in your preferred date and time, and our agent will confirm your appointment.','Process',3,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `faqs` VALUES (4,'How do I save properties I like?','Click the heart icon on any property card or listing to save it to your favorites. You can view all your favorites in your customer dashboard.','Account',4,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `faqs` VALUES (5,'What documents do I need to buy a property?','Typically you need: ID/Passport, KRA PIN, bank statements for the last 3 months, andproof of payment for valuation. We provide a complete checklist after you submit an inquiry.','Process',5,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `faqs` VALUES (6,'Can I sell my property through Prime Realty?','Absolutely! Contact us through the inquiry form, and our team will provide a free property valuation and discuss our selling packages.','Selling',6,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `faqs` VALUES (7,'Do you help with property financing?','We have partnerships with major Kenyan banks and financial institutions. Our team can connect you with mortgage advisors who will help you secure financing.','Financing',7,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `faqs` VALUES (8,'What areas do you cover?','We operate nationwide with offices in Nairobi, Mombasa, Kisumu, and Nakuru. We cover residential and commercial properties across all 47 counties of Kenya.','General',8,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
/*!40000 ALTER TABLE `faqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `favorites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_property_fav` (`user_id`,`property_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_property` (`property_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (1,2,1,'2026-08-26 09:37:01');
INSERT INTO `favorites` VALUES (2,2,3,'2026-08-26 09:37:01');
INSERT INTO `favorites` VALUES (3,2,5,'2026-08-26 09:37:01');
INSERT INTO `favorites` VALUES (4,3,2,'2026-08-26 09:37:01');
INSERT INTO `favorites` VALUES (5,3,4,'2026-08-26 09:37:01');
INSERT INTO `favorites` VALUES (6,4,1,'2026-08-26 09:37:01');
INSERT INTO `favorites` VALUES (7,4,5,'2026-08-26 09:37:01');
INSERT INTO `favorites` VALUES (14,1,9,'2026-09-08 06:42:50');
INSERT INTO `favorites` VALUES (15,6,9,'2026-09-08 06:46:59');
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `features`
--

DROP TABLE IF EXISTS `features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `features` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `category` varchar(50) DEFAULT 'general',
  `is_default` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_category` (`category`),
  KEY `idx_default` (`is_default`),
  KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `features`
--

LOCK TABLES `features` WRITE;
/*!40000 ALTER TABLE `features` DISABLE KEYS */;
INSERT INTO `features` VALUES (1,'Swimming Pool','swimming-pool','Pool','amenities',1,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (2,'Garden','garden','Tree','amenities',1,2,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (3,'Garage','garage','Car','amenities',1,3,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (4,'CCTV','cctv','Video','security',1,4,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (5,'Security','security','Shield','security',1,5,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (6,'Borehole','borehole','Water','utilities',1,6,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (7,'Solar Power','solar','Sun','utilities',1,7,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (8,'Generator','generator','Zap','utilities',1,8,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (9,'Balcony','balcony','Wind','interior',1,9,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (10,'DSQ','dsq','Home','interior',1,10,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (11,'Gym','gym','Dumbbell','amenities',1,11,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (12,'Playground','playground','Children','amenities',1,12,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (13,'Internet','internet','Wifi','utilities',1,13,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (14,'Air Conditioning','air-conditioning','Snowflake','interior',1,14,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (15,'Built-in Wardrobes','wardrobes','Wardrobe','interior',1,15,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (16,'Lift/Elevator','elevator','Elevator','building',1,16,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (17,'Parking','parking','Car','amenities',1,17,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (18,'Gymnasium','gymnasium','Dumbbell','amenities',1,18,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (19,'Spa','spa','Droplet','amenities',1,19,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (20,'Clubhouse','clubhouse','Building','amenities',1,20,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (21,'Fireplace','fireplace','Flame','interior',1,21,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (22,'Cinema Room','cinema','Tv','interior',1,22,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (23,'Study Room','study','BookOpen','interior',1,23,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (24,'Laundry Room','laundry','WashingMachine','interior',1,24,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (25,'Walk-in Wardrobe','walk-in','Wardrobe','interior',1,25,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `features` VALUES (26,'Ready Title Deed','ready-title-deed','FileCheck','legal',1,30,'2026-09-07 19:31:17','2026-09-07 19:31:17');
INSERT INTO `features` VALUES (27,'Electricity on Site','electricity-on-site','Zap','utilities',1,30,'2026-09-07 19:31:17','2026-09-07 19:31:17');
INSERT INTO `features` VALUES (28,'Piped Water on Site','piped-water','Droplets','utilities',1,30,'2026-09-07 19:31:17','2026-09-07 19:31:17');
INSERT INTO `features` VALUES (29,'Gated Community','gated-community','ShieldCheck','security',1,30,'2026-09-07 19:31:17','2026-09-07 19:31:17');
INSERT INTO `features` VALUES (30,'Perimeter Wall / Fenced','perimeter-wall','Fence','security',1,30,'2026-09-07 19:31:17','2026-09-07 19:31:17');
INSERT INTO `features` VALUES (31,'Tarmac / Good Access Road','good-access-road','Navigation','infrastructure',1,30,'2026-09-07 19:31:17','2026-09-07 19:31:17');
INSERT INTO `features` VALUES (32,'Red Soil','red-soil','Layers','geography',1,30,'2026-09-07 19:31:17','2026-09-07 19:31:17');
INSERT INTO `features` VALUES (33,'Scenic Views','scenic-views','Mountain','amenities',1,30,'2026-09-07 19:31:17','2026-09-07 19:31:17');
/*!40000 ALTER TABLE `features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inquiries`
--

DROP TABLE IF EXISTS `inquiries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inquiries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `property_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('Unread','Read','In Progress','Replied','Closed','Spam') DEFAULT 'Unread',
  `assigned_to` int(11) DEFAULT NULL,
  `source` enum('website','property_page','contact_form','api','other') DEFAULT 'website',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_user` (`user_id`),
  KEY `idx_property` (`property_id`),
  KEY `idx_assigned` (`assigned_to`),
  KEY `idx_source` (`source`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `inquiries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `inquiries_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL,
  CONSTRAINT `inquiries_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inquiries`
--

LOCK TABLES `inquiries` WRITE;
/*!40000 ALTER TABLE `inquiries` DISABLE KEYS */;
INSERT INTO `inquiries` VALUES (1,2,1,'Alice Wanjiru','alice@example.com','+254 711 111 222','Inquiry about Kitusuru Villa','I am very interested in the Modern 4-Bedroom Villa in Kitusuru. Could you please provide more details about the property and schedule a viewing?','Unread',NULL,'property_page','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `inquiries` VALUES (2,3,2,'Bob Ochieng','bob@example.com','+254 722 222 333','Westlands Apartment Viewing','I would like to schedule a viewing for the luxury 3-bedroom apartment in Westlands. Please let me know available dates.','In Progress',1,'property_page','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `inquiries` VALUES (3,2,3,'Alice Wanjiru','alice@example.com','+254 711 111 222','Question about Runda Maisonette','Could you confirm the year of construction and current status of the maisonette?','Replied',1,'property_page','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `inquiries` VALUES (4,1,NULL,'Super Administrator','admin@realestate.co.ke','+254 700 000 001','6tooiy','kkkkkkkkkkkk','Unread',NULL,'contact_form','2026-09-07 01:55:05','2026-09-07 02:14:25');
INSERT INTO `inquiries` VALUES (5,NULL,NULL,'Jane Doe Frontend Test','janedoe.test@example.com','+254711999888','Inquiry about Villa in Karen','Hello, I saw your listing and would like to know if the price is negotiable.','Unread',NULL,'contact_form','2026-09-07 02:16:20','2026-09-07 02:16:20');
INSERT INTO `inquiries` VALUES (6,1,NULL,'Super Administrator','admin@realestate.co.ke','+254700000001','6tooiy','jjjjjkkkkkklllll','Unread',NULL,'contact_form','2026-09-07 02:17:52','2026-09-07 02:17:52');
INSERT INTO `inquiries` VALUES (7,1,NULL,'ggg','admin@realestate.co.ke','+254700000001','gggg','ggggjyuyuyyy','Unread',NULL,'contact_form','2026-09-08 09:42:42','2026-09-08 09:42:42');
INSERT INTO `inquiries` VALUES (8,1,NULL,'Super Administrator','admin@realestate.co.ke','+254700000001','6tooiyjujjjjj','hhhhh','Unread',NULL,'contact_form','2026-09-08 09:45:59','2026-09-08 09:45:59');
/*!40000 ALTER TABLE `inquiries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inquiry_messages`
--

DROP TABLE IF EXISTS `inquiry_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inquiry_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `inquiry_id` int(11) NOT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `sender_type` enum('customer','agent','admin') DEFAULT 'customer',
  `message` text NOT NULL,
  `is_internal_note` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_inquiry` (`inquiry_id`),
  KEY `idx_sender` (`sender_id`),
  KEY `idx_type` (`sender_type`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `inquiry_messages_ibfk_1` FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inquiry_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inquiry_messages`
--

LOCK TABLES `inquiry_messages` WRITE;
/*!40000 ALTER TABLE `inquiry_messages` DISABLE KEYS */;
INSERT INTO `inquiry_messages` VALUES (1,1,2,'customer','I am very interested in the Modern 4-Bedroom Villa in Kitusuru. Could you please provide more details about the property and schedule a viewing?',0,'2026-08-26 09:37:01');
INSERT INTO `inquiry_messages` VALUES (2,1,1,'agent','Thank you for your interest, Alice. I am happy to provide additional information about the villa and schedule a viewing. The property features a modern kitchen, spacious living areas, and a private garden. Would you prefer a viewing this weekend?',0,'2026-08-26 09:37:01');
INSERT INTO `inquiry_messages` VALUES (3,2,3,'customer','I would like to schedule a viewing for the luxury 3-bedroom apartment in Westlands. Please let me know available dates.',0,'2026-08-26 09:37:01');
INSERT INTO `inquiry_messages` VALUES (4,2,1,'agent','Hi Bob, I have several slots available next week. Thursday at 10 AM or Friday at 2 PM would work best. Please let me know which you prefer.',0,'2026-08-26 09:37:01');
INSERT INTO `inquiry_messages` VALUES (5,3,2,'customer','Could you confirm the year of construction and current status of the maisonette?',0,'2026-08-26 09:37:01');
INSERT INTO `inquiry_messages` VALUES (6,3,1,'agent','The maisonette was built in 2019 and is currently in \"Reserved\" status. I can check if the reservation is still active or has been released.',0,'2026-08-26 09:37:01');
INSERT INTO `inquiry_messages` VALUES (7,4,1,'customer','kkkkkkkkkkkk',0,'2026-09-07 01:55:05');
INSERT INTO `inquiry_messages` VALUES (8,5,NULL,'customer','Hello, I saw your listing and would like to know if the price is negotiable.',0,'2026-09-07 02:16:20');
INSERT INTO `inquiry_messages` VALUES (9,6,1,'admin','jjjjjkkkkkklllll',0,'2026-09-07 02:17:52');
INSERT INTO `inquiry_messages` VALUES (10,7,1,'admin','ggggjyuyuyyy',0,'2026-09-08 09:42:42');
INSERT INTO `inquiry_messages` VALUES (11,8,1,'admin','hhhhh',0,'2026-09-08 09:45:59');
/*!40000 ALTER TABLE `inquiry_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interested_properties`
--

DROP TABLE IF EXISTS `interested_properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interested_properties` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_property_interested` (`user_id`,`property_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_property` (`property_id`),
  CONSTRAINT `interested_properties_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `interested_properties_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interested_properties`
--

LOCK TABLES `interested_properties` WRITE;
/*!40000 ALTER TABLE `interested_properties` DISABLE KEYS */;
INSERT INTO `interested_properties` VALUES (1,2,1,'Interested in scheduling a viewing','2026-08-26 09:37:01');
INSERT INTO `interested_properties` VALUES (2,3,2,'','2026-08-26 09:37:01');
INSERT INTO `interested_properties` VALUES (3,4,3,'Please send property details','2026-08-26 09:37:01');
INSERT INTO `interested_properties` VALUES (4,5,4,'Want to discuss financing options','2026-08-26 09:37:01');
INSERT INTO `interested_properties` VALUES (7,1,1,NULL,'2026-09-07 08:15:53');
INSERT INTO `interested_properties` VALUES (11,1,9,NULL,'2026-09-08 06:42:51');
/*!40000 ALTER TABLE `interested_properties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `media` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint(20) unsigned NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `width` smallint(6) DEFAULT NULL,
  `height` smallint(6) DEFAULT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `usage_count` int(11) DEFAULT 0,
  `uploaded_by` int(11) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_filename` (`filename`),
  KEY `idx_type` (`mime_type`),
  KEY `idx_uploaded` (`uploaded_at`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `media_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media`
--

LOCK TABLES `media` WRITE;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
INSERT INTO `media` VALUES (18,'20260907_6a9e8aaa5dfbf.jpg','10.2.jpg','uploads/media/20260907_6a9e8aaa5dfbf.jpg',8523,'image/jpeg',500,500,NULL,NULL,'10.2.jpg',NULL,0,1,'2026-09-07 09:58:02');
INSERT INTO `media` VALUES (20,'20260907_6a9e986e12c1c.mp4','From Klickpin.com- Kitchen organization ideas that are perfect when you want something stylish modern and easy to copy for women who love classy P.mp4','uploads/media/20260907_6a9e986e12c1c.mp4',3231952,'video/mp4',NULL,NULL,NULL,NULL,'From Klickpin.com- Kitchen organization ideas that are perfect when you want something stylish modern and easy to copy for women who love classy P.mp4',NULL,0,1,'2026-09-07 10:56:46');
INSERT INTO `media` VALUES (28,'20260907_6a9eb66dc7196.jpg','images (3).jpg','uploads/promotions/20260907_6a9eb66dc7196.jpg',2920,'image/jpeg',225,225,NULL,NULL,NULL,NULL,0,1,'2026-09-07 13:04:45');
INSERT INTO `media` VALUES (29,'20260907_6a9eb6811290d.jpg','images (2).jpg','uploads/promotions/20260907_6a9eb6811290d.jpg',12504,'image/jpeg',576,432,NULL,NULL,NULL,NULL,0,1,'2026-09-07 13:05:05');
INSERT INTO `media` VALUES (30,'20260907_6a9eb70f28596.jpg','images (3).jpg','uploads/properties/20260907_6a9eb70f28596.jpg',2920,'image/jpeg',225,225,'scoffie',NULL,'scoffie',NULL,0,1,'2026-09-07 13:07:27');
INSERT INTO `media` VALUES (31,'20260907_6a9eb71b5fff1.jpg','images (3).jpg','uploads/properties/20260907_6a9eb71b5fff1.jpg',2920,'image/jpeg',225,225,'scoffie',NULL,'scoffie',NULL,0,1,'2026-09-07 13:07:39');
INSERT INTO `media` VALUES (32,'20260907_6a9eb74759c22.jpg','images (2).jpg','uploads/properties/20260907_6a9eb74759c22.jpg',12504,'image/jpeg',576,432,'charles',NULL,'charles',NULL,0,1,'2026-09-07 13:08:23');
INSERT INTO `media` VALUES (33,'20260907_6a9eb74772513.jpg','images (1).jpg','uploads/properties/20260907_6a9eb74772513.jpg',17428,'image/jpeg',447,447,'charles',NULL,'charles',NULL,0,1,'2026-09-07 13:08:23');
INSERT INTO `media` VALUES (34,'20260907_6a9eb7589cbb7.jpg','images (3).jpg','uploads/properties/20260907_6a9eb7589cbb7.jpg',2920,'image/jpeg',225,225,'charles',NULL,'charles',NULL,0,1,'2026-09-07 13:08:40');
INSERT INTO `media` VALUES (35,'20260907_6a9eb758cb224.jpg','images (2).jpg','uploads/properties/20260907_6a9eb758cb224.jpg',12504,'image/jpeg',576,432,'charles',NULL,'charles',NULL,0,1,'2026-09-07 13:08:40');
INSERT INTO `media` VALUES (36,'20260907_6a9ebbf466a20.jpeg','hemaprin.jpeg','uploads/branding/20260907_6a9ebbf466a20.jpeg',9711,'image/jpeg',492,492,NULL,NULL,NULL,NULL,0,1,'2026-09-07 13:28:20');
INSERT INTO `media` VALUES (37,'20260907_6a9ec9298df91.jpg','images (3).jpg','uploads/promotions/20260907_6a9ec9298df91.jpg',2920,'image/jpeg',225,225,NULL,NULL,NULL,NULL,0,1,'2026-09-07 14:24:41');
INSERT INTO `media` VALUES (38,'20260907_6a9ec998f105f.jpg','images (2).jpg','uploads/promotions/20260907_6a9ec998f105f.jpg',12504,'image/jpeg',576,432,NULL,NULL,NULL,NULL,0,1,'2026-09-07 14:26:32');
INSERT INTO `media` VALUES (39,'20260907_6a9ec9bb39127.jpg','images (3).jpg','uploads/promotions/20260907_6a9ec9bb39127.jpg',2920,'image/jpeg',225,225,NULL,NULL,NULL,NULL,0,1,'2026-09-07 14:27:07');
INSERT INTO `media` VALUES (40,'20260907_6a9ec9cf99162.jpg','images (3).jpg','uploads/media/20260907_6a9ec9cf99162.jpg',2920,'image/jpeg',225,225,NULL,NULL,'images (3).jpg',NULL,0,1,'2026-09-07 14:27:27');
INSERT INTO `media` VALUES (41,'20260907_6a9f1db49df9a.jpg','images (3).jpg','uploads/properties/20260907_6a9f1db49df9a.jpg',2920,'image/jpeg',225,225,'charles',NULL,'charles',NULL,0,1,'2026-09-07 20:25:24');
INSERT INTO `media` VALUES (42,'20260907_6a9f1db4bacf3.jpg','images (2).jpg','uploads/properties/20260907_6a9f1db4bacf3.jpg',12504,'image/jpeg',576,432,'charles',NULL,'charles',NULL,0,1,'2026-09-07 20:25:24');
INSERT INTO `media` VALUES (43,'20260907_6a9f1db4cdaf7.jpg','images (1).jpg','uploads/properties/20260907_6a9f1db4cdaf7.jpg',17428,'image/jpeg',447,447,'charles',NULL,'charles',NULL,0,1,'2026-09-07 20:25:24');
INSERT INTO `media` VALUES (44,'20260907_6a9f202b35478.jpg','images (3).jpg','uploads/properties/20260907_6a9f202b35478.jpg',2920,'image/jpeg',225,225,'charles',NULL,'charles',NULL,0,1,'2026-09-07 20:35:55');
INSERT INTO `media` VALUES (45,'20260907_6a9f202b52f3b.jpg','images (2).jpg','uploads/properties/20260907_6a9f202b52f3b.jpg',12504,'image/jpeg',576,432,'charles',NULL,'charles',NULL,0,1,'2026-09-07 20:35:55');
INSERT INTO `media` VALUES (46,'20260907_6a9f202b78545.jpg','images (1).jpg','uploads/properties/20260907_6a9f202b78545.jpg',17428,'image/jpeg',447,447,'charles',NULL,'charles',NULL,0,1,'2026-09-07 20:35:55');
INSERT INTO `media` VALUES (47,'20260907_6a9f24f02e9ba.jpeg','Air-Flow-Meter-300x300.jpeg','uploads/properties/20260907_6a9f24f02e9ba.jpeg',11437,'image/jpeg',300,300,'BBBB',NULL,'BBBB',NULL,0,1,'2026-09-07 20:56:16');
INSERT INTO `media` VALUES (48,'20260907_6a9f24f03ec1b.jpeg','Air-con-drain-pump-300x300.jpeg','uploads/properties/20260907_6a9f24f03ec1b.jpeg',18022,'image/jpeg',300,300,'BBBB',NULL,'BBBB',NULL,0,1,'2026-09-07 20:56:16');
INSERT INTO `media` VALUES (49,'20260907_6a9f24f04f96a.jpeg','evaporators1.jpeg','uploads/properties/20260907_6a9f24f04f96a.jpeg',31863,'image/jpeg',736,345,'BBBB',NULL,'BBBB',NULL,0,1,'2026-09-07 20:56:16');
INSERT INTO `media` VALUES (50,'20260908_6a9fa9a8407d0.jpg','HP ZBook.jpg','uploads/properties/20260908_6a9fa9a8407d0.jpg',39653,'image/jpeg',554,554,'1/4 Acre Commercial Plot along Ruiru Eastern Bypass',NULL,'1/4 Acre Commercial Plot along Ruiru Eastern Bypass',NULL,0,1,'2026-09-08 06:22:32');
INSERT INTO `media` VALUES (51,'20260908_6a9fa9a852d43.jpeg','WhatsApp Image 2026-08-24 at 2.14.51 PMm.jpeg','uploads/properties/20260908_6a9fa9a852d43.jpeg',316286,'image/jpeg',1280,960,'1/4 Acre Commercial Plot along Ruiru Eastern Bypass',NULL,'1/4 Acre Commercial Plot along Ruiru Eastern Bypass',NULL,0,1,'2026-09-08 06:22:32');
INSERT INTO `media` VALUES (52,'20260908_6a9fa9a864576.jpeg','WhatsApp Image 2026-08-24 at 2.14.51 PM.jpeg','uploads/properties/20260908_6a9fa9a864576.jpeg',319423,'image/jpeg',1280,960,'1/4 Acre Commercial Plot along Ruiru Eastern Bypass',NULL,'1/4 Acre Commercial Plot along Ruiru Eastern Bypass',NULL,0,1,'2026-09-08 06:22:32');
INSERT INTO `media` VALUES (53,'20260908_6a9fda4fd0c2e.jpeg','hemaprin.jpeg','uploads/branding/20260908_6a9fda4fd0c2e.jpeg',9711,'image/jpeg',492,492,NULL,NULL,NULL,NULL,0,1,'2026-09-08 09:50:07');
INSERT INTO `media` VALUES (54,'20260908_6a9fda551d38a.jpeg','hemaprin.jpeg','uploads/branding/20260908_6a9fda551d38a.jpeg',9711,'image/jpeg',492,492,NULL,NULL,NULL,NULL,0,1,'2026-09-08 09:50:13');
INSERT INTO `media` VALUES (55,'20260908_6a9fda5b1ba11.jpeg','hemaprin.jpeg','uploads/branding/20260908_6a9fda5b1ba11.jpeg',9711,'image/jpeg',492,492,NULL,NULL,NULL,NULL,0,1,'2026-09-08 09:50:19');
INSERT INTO `media` VALUES (56,'20260908_6a9fda5f54cf4.jpeg','hemaprin.jpeg','uploads/branding/20260908_6a9fda5f54cf4.jpeg',9711,'image/jpeg',492,492,NULL,NULL,NULL,NULL,0,1,'2026-09-08 09:50:23');
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `menu_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `menu_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `url` varchar(500) DEFAULT NULL,
  `target` varchar(20) DEFAULT '_self',
  `sort_order` int(11) DEFAULT 0,
  `parent_id` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `css_class` varchar(255) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_menu` (`menu_id`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_sort` (`sort_order`),
  CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES (1,1,'Home','/','_self',1,0,1,NULL,'Home','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `menu_items` VALUES (2,1,'Properties','/properties','_self',2,0,1,NULL,'Building','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `menu_items` VALUES (3,1,'About','/about','_self',3,0,1,NULL,'Info','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `menu_items` VALUES (4,1,'Services','/services','_self',4,0,1,NULL,'Tool','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `menu_items` VALUES (5,1,'Testimonials','/#testimonials','_self',5,0,1,NULL,'MessageCircle','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `menu_items` VALUES (6,1,'Contact','/contact','_self',6,0,1,NULL,'Phone','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `menu_items` VALUES (7,1,'Login','/login','_self',7,0,1,NULL,'LogIn','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `menu_items` VALUES (8,2,'About','/about','_self',1,0,1,NULL,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `menu_items` VALUES (9,2,'Services','/services','_self',2,0,1,NULL,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `menu_items` VALUES (10,2,'Contact','/contact','_self',3,0,1,NULL,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `menu_items` VALUES (11,2,'Privacy Policy','/privacy','_self',4,0,1,NULL,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `menu_items` VALUES (12,2,'Terms','/terms','_self',5,0,1,NULL,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `menu_items` VALUES (13,3,'Home','/','_self',1,0,1,NULL,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `menu_items` VALUES (14,3,'Properties','/properties','_self',2,0,1,NULL,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `menu_items` VALUES (15,3,'About','/about','_self',3,0,1,NULL,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `menu_items` VALUES (16,3,'Contact','/contact','_self',4,0,1,NULL,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `menu_items` VALUES (17,3,'Login','/login','_self',5,0,1,NULL,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `menus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `location` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_location` (`location`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES (1,'Main Menu','main-menu','header',1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `menus` VALUES (2,'Footer Menu','footer-menu','footer',1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `menus` VALUES (3,'Mobile Menu','mobile-menu','mobile',1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `reference_type` varchar(100) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_read` (`is_read`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'new_inquiry','New Inquiry Received','Alice Wanjiru submitted an inquiry about the Kitusuru Villa.','inquiry',1,1,'2026-08-26 09:37:01');
INSERT INTO `notifications` VALUES (2,1,'new_inquiry','New Inquiry Received','Bob Ochieng submitted an inquiry about the Westlands Apartment.','inquiry',2,1,'2026-08-26 09:37:01');
INSERT INTO `notifications` VALUES (3,1,'viewing_request','New Viewing Request','Alice Wanjiru requested a viewing for the Kitusuru Villa.','viewing',1,1,'2026-08-26 09:37:01');
INSERT INTO `notifications` VALUES (4,1,'new_customer','New Customer Registered','Carol Atieno has registered on the website.','customer',4,1,'2026-08-26 09:37:01');
INSERT INTO `notifications` VALUES (5,1,'property_activity','Property Viewed','Your featured property was viewed 50 times today.','property',1,1,'2026-08-26 09:37:01');
INSERT INTO `notifications` VALUES (6,1,'viewing_request','New Viewing Request','A new viewing request has been submitted','viewing',4,1,'2026-09-06 12:07:13');
INSERT INTO `notifications` VALUES (7,1,'viewing_request','New Viewing Request','A new viewing request has been submitted','viewing',5,1,'2026-09-06 12:32:30');
INSERT INTO `notifications` VALUES (8,1,'viewing_request','New Viewing Request','A new viewing request has been submitted','viewing',6,1,'2026-09-06 12:51:14');
INSERT INTO `notifications` VALUES (9,1,'new_inquiry','New Contact Form Submission','A new contact form submission has been received','contact',1,1,'2026-09-07 01:55:05');
INSERT INTO `notifications` VALUES (10,1,'new_inquiry','New Contact Message','New contact message from Super Administrator: kkkkkkkkkkkk','inquiry',4,0,'2026-09-07 02:14:25');
INSERT INTO `notifications` VALUES (11,1,'new_inquiry','New Contact Message','New message from Super Administrator: jjjjjkkkkkklllll','inquiry',6,0,'2026-09-07 02:17:52');
INSERT INTO `notifications` VALUES (12,2,'new_inquiry','New Contact Message','New message from Super Administrator: jjjjjkkkkkklllll','inquiry',6,0,'2026-09-07 02:17:52');
INSERT INTO `notifications` VALUES (13,1,'viewing_request','New Viewing Request','Viewing request for Modern 4-Bedroom Villa in Kitusuru from Super Administrator','viewing',8,0,'2026-09-07 14:20:50');
INSERT INTO `notifications` VALUES (14,2,'viewing_request','New Viewing Request','Viewing request for Modern 4-Bedroom Villa in Kitusuru from Super Administrator','viewing',8,0,'2026-09-07 14:20:50');
INSERT INTO `notifications` VALUES (15,1,'viewing_request','New Viewing Request','Viewing request for Modern 4-Bedroom Villa in Kitusuru from vvvv','viewing',9,0,'2026-09-07 14:23:01');
INSERT INTO `notifications` VALUES (16,2,'viewing_request','New Viewing Request','Viewing request for Modern 4-Bedroom Villa in Kitusuru from vvvv','viewing',9,0,'2026-09-07 14:23:01');
INSERT INTO `notifications` VALUES (17,1,'viewing_request','New Viewing Request','Viewing request for Modern 4-Bedroom Villa in Kitusuru from vvvvvv','viewing',10,0,'2026-09-07 14:23:24');
INSERT INTO `notifications` VALUES (18,2,'viewing_request','New Viewing Request','Viewing request for Modern 4-Bedroom Villa in Kitusuru from vvvvvv','viewing',10,0,'2026-09-07 14:23:24');
INSERT INTO `notifications` VALUES (19,1,'new_inquiry','New Contact Message','New message from ggg: ggggjyuyuyyy','inquiry',7,0,'2026-09-08 09:42:42');
INSERT INTO `notifications` VALUES (20,2,'new_inquiry','New Contact Message','New message from ggg: ggggjyuyuyyy','inquiry',7,0,'2026-09-08 09:42:42');
INSERT INTO `notifications` VALUES (21,1,'new_inquiry','New Contact Message','New message from Super Administrator: hhhhh','inquiry',8,0,'2026-09-08 09:45:59');
INSERT INTO `notifications` VALUES (22,2,'new_inquiry','New Contact Message','New message from Super Administrator: hhhhh','inquiry',8,0,'2026-09-08 09:45:59');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `page_sections`
--

DROP TABLE IF EXISTS `page_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `page_sections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page_id` int(11) NOT NULL,
  `section_type` varchar(50) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_page` (`page_id`),
  KEY `idx_type` (`section_type`),
  KEY `idx_active` (`is_active`),
  KEY `idx_sort` (`sort_order`),
  CONSTRAINT `page_sections_ibfk_1` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_sections`
--

LOCK TABLES `page_sections` WRITE;
/*!40000 ALTER TABLE `page_sections` DISABLE KEYS */;
/*!40000 ALTER TABLE `page_sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext DEFAULT NULL,
  `status` enum('draft','published') DEFAULT 'draft',
  `is_system` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `show_in_menu` tinyint(1) DEFAULT 1,
  `parent_id` int(11) DEFAULT 0,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_menu` (`show_in_menu`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
INSERT INTO `pages` VALUES (1,'Home','home','','published',1,1,1,0,NULL,NULL,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `pages` VALUES (2,'About Us','about','','published',1,2,1,0,NULL,NULL,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `pages` VALUES (3,'Services','services','','published',1,3,1,0,NULL,NULL,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `pages` VALUES (4,'Contact','contact','','published',1,4,1,0,NULL,NULL,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `pages` VALUES (5,'Properties','properties','','published',1,5,1,0,NULL,NULL,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `pages` VALUES (6,'Privacy Policy','privacy','','published',1,6,0,0,NULL,NULL,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `pages` VALUES (7,'Terms of Service','terms','','published',1,7,0,0,NULL,NULL,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `pages` VALUES (8,'Property Disclaimer','disclaimer','','published',1,8,0,0,NULL,NULL,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `group_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_group` (`group_name`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'properties.view','View properties','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (2,'properties.create','Create properties','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (3,'properties.edit','Edit properties','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (4,'properties.delete','Delete properties','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (5,'properties.publish','Publish properties','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (6,'properties.unpublish','Unpublish properties','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (7,'properties.feature','Feature properties','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (8,'property_types.view','View property types','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (9,'property_types.create','Create property types','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (10,'property_types.edit','Edit property types','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (11,'property_types.delete','Delete property types','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (12,'features.view','View features','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (13,'features.create','Create features','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (14,'features.edit','Edit features','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (15,'features.delete','Delete features','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (16,'documents.view','View documents','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (17,'documents.upload','Upload documents','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (18,'documents.delete','Delete documents','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (19,'verification.view','View verifications','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (20,'verification.edit','Edit verifications','properties','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (21,'messages.view','View messages','messages','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (22,'messages.reply','Reply to messages','messages','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (23,'messages.delete','Delete messages','messages','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (24,'messages.assign','Assign messages','messages','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (25,'customers.view','View customers','customers','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (26,'customers.edit','Edit customers','customers','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (27,'customers.disable','Disable customers','customers','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (28,'agents.view','View agents','agents','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (29,'agents.create','Create agents','agents','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (30,'agents.edit','Edit agents','agents','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (31,'agents.delete','Delete agents','agents','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (32,'viewings.view','View viewing requests','viewings','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (33,'viewings.edit','Edit viewing requests','viewings','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (34,'viewings.assign','Assign viewing requests','viewings','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (35,'promotions.view','View promotions','promotions','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (36,'promotions.create','Create promotions','promotions','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (37,'promotions.edit','Edit promotions','promotions','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (38,'promotions.delete','Delete promotions','promotions','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (39,'media.view','View media','media','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (40,'media.upload','Upload media','media','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (41,'media.delete','Delete media','media','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (42,'pages.view','View pages','pages','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (43,'pages.create','Create pages','pages','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (44,'pages.edit','Edit pages','pages','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (45,'pages.delete','Delete pages','pages','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (46,'menus.view','View menus','pages','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (47,'menus.edit','Edit menus','pages','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (48,'testimonials.view','View testimonials','content','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (49,'testimonials.create','Create testimonials','content','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (50,'testimonials.edit','Edit testimonials','content','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (51,'testimonials.delete','Delete testimonials','content','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (52,'testimonials.approve','Approve testimonials','content','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (53,'faqs.view','View FAQs','content','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (54,'faqs.create','Create FAQs','content','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (55,'faqs.edit','Edit FAQs','content','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (56,'faqs.delete','Delete FAQs','content','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (57,'settings.view','View settings','settings','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (58,'settings.edit','Edit settings','settings','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (59,'users.view','View users','users','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (60,'users.create','Create users','users','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (61,'users.edit','Edit users','users','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (62,'users.delete','Delete users','users','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (63,'roles.view','View roles','users','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (64,'roles.edit','Edit roles','users','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (65,'analytics.view','View analytics','analytics','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (66,'audit_logs.view','View audit logs','settings','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (67,'seo.view','View SEO settings','settings','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (68,'seo.edit','Edit SEO settings','settings','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (69,'earb.view','View EARB info','settings','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (70,'earb.edit','Edit EARB info','settings','2026-08-26 09:37:01');
INSERT INTO `permissions` VALUES (71,'viewing_requests.view','View viewing requests','viewings','2026-09-06 14:32:12');
INSERT INTO `permissions` VALUES (72,'viewing_requests.edit','Edit viewing requests','viewings','2026-09-06 14:32:13');
INSERT INTO `permissions` VALUES (73,'viewing_requests.assign','Assign viewing requests','viewings','2026-09-06 14:32:13');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotion_clicks`
--

DROP TABLE IF EXISTS `promotion_clicks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `promotion_clicks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `promotion_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_promotion` (`promotion_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `promotion_clicks_ibfk_1` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotion_clicks`
--

LOCK TABLES `promotion_clicks` WRITE;
/*!40000 ALTER TABLE `promotion_clicks` DISABLE KEYS */;
/*!40000 ALTER TABLE `promotion_clicks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotion_views`
--

DROP TABLE IF EXISTS `promotion_views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `promotion_views` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `promotion_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_promotion` (`promotion_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `promotion_views_ibfk_1` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotion_views`
--

LOCK TABLES `promotion_views` WRITE;
/*!40000 ALTER TABLE `promotion_views` DISABLE KEYS */;
/*!40000 ALTER TABLE `promotion_views` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `promotions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `button_text` varchar(100) DEFAULT NULL,
  `button_url` varchar(500) DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `display_type` enum('banner','card','popup','modal','corner','inline','footer') DEFAULT 'banner',
  `display_frequency` enum('always','once_per_session','once_per_day','once_per_week','once_per_month','every_x_visits','on_scroll','after_x_seconds') DEFAULT 'always',
  `frequency_value` int(11) DEFAULT 1,
  `position` enum('top','bottom','left','right','center','header','footer','sidebar') DEFAULT 'top',
  `priority` int(11) DEFAULT 0,
  `close_button` tinyint(1) DEFAULT 1,
  `background_color` varchar(50) DEFAULT NULL,
  `text_color` varchar(50) DEFAULT NULL,
  `page_visibility` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_active` (`active`),
  KEY `idx_dates` (`start_date`,`end_date`),
  KEY `idx_type` (`display_type`),
  KEY `idx_priority` (`priority`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `promotions_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES (1,'Premium Property Alert - 2024','Discover our exclusive premium property listings across Kenya','/backend/uploads/promotions/20260907_6a9ec9298df91.jpg','View Premium Listings','/properties?featured=true','2024-01-01 00:00:00','2025-12-31 23:59:59',1,'banner','always',1,'top',10,1,'#2563eb','#ffffff',NULL,1,'2026-08-26 09:37:01','2026-09-07 14:24:50');
INSERT INTO `promotions` VALUES (2,'Free Property Valuation','Get a free professional valuation of your property today','/uploads/promotions/promo-card-1.jpg','Get Valuation','/contact','2024-01-01 00:00:00','2025-12-31 23:59:59',1,'card','once_per_session',1,'bottom',5,1,'#ffffff','#33415b',NULL,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `promotions` VALUES (3,'Mortgage Calculator Now Available','Calculate your mortgage payments with our new calculator tool','/uploads/promotions/promo-popup-1.jpg','Try Calculator','/mortgage-calculator','2024-01-01 00:00:00','2025-06-30 23:59:59',1,'popup','after_x_seconds',30,'center',3,1,'#ffffff','#1e293b','[\"home\",\"properties\"]',1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `promotions` VALUES (4,'Agent of the Month','Meet our top-performing agent John Mwangi','/uploads/promotions/promo-agent-of-month.jpg','View Profile','/agents/john-mwangi','2024-04-01 00:00:00','2024-04-30 23:59:59',1,'corner','always',1,'right',8,1,'#7c3aed','#ffffff',NULL,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `promotions` VALUES (5,'frrrrr','fff','/backend/uploads/promotions/20260907_6a9ec998f105f.jpg','','','0000-00-00 00:00:00','0000-00-00 00:00:00',1,'banner','always',1,'top',0,1,'#2563eb','#ffffff',NULL,1,'2026-09-07 14:26:39','2026-09-07 14:26:39');
INSERT INTO `promotions` VALUES (6,'fgfgf','rfee','/backend/uploads/promotions/20260907_6a9ec9bb39127.jpg','','','0000-00-00 00:00:00','0000-00-00 00:00:00',1,'banner','always',1,'top',0,1,'#2563eb','#ffffff',NULL,1,'2026-09-07 14:27:09','2026-09-07 14:27:09');
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `properties` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `property_type_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(10) DEFAULT 'KES',
  `location` varchar(255) NOT NULL,
  `county` varchar(100) DEFAULT NULL,
  `town` varchar(100) DEFAULT NULL,
  `area` varchar(100) DEFAULT NULL,
  `estate` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `bedrooms` tinyint(3) unsigned DEFAULT 0,
  `bathrooms` tinyint(3) unsigned DEFAULT 0,
  `parking_spaces` tinyint(3) unsigned DEFAULT 0,
  `house_size` decimal(10,2) DEFAULT NULL COMMENT 'Square meters',
  `land_size` decimal(10,2) DEFAULT NULL COMMENT 'Square meters',
  `floors` tinyint(3) unsigned DEFAULT 1,
  `year_built` year(4) DEFAULT NULL,
  `furnishing_status` enum('Unfurnished','Semi-Furnished','Furnished','Finished','Shell') DEFAULT 'Unfurnished',
  `status` enum('Draft','Published','Available','Reserved','Under Offer','Sold','Coming Soon','Hidden') DEFAULT 'Draft',
  `verification_status` enum('Pending','Under Review','Documents Submitted','Verified','Verification Required','Not Verified') DEFAULT 'Pending',
  `verification_notes` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `featured` tinyint(1) DEFAULT 0,
  `views_count` int(11) DEFAULT 0,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_price` (`price`),
  KEY `idx_county` (`county`),
  KEY `idx_town` (`town`),
  KEY `idx_area` (`area`),
  KEY `idx_type` (`property_type_id`),
  KEY `idx_published` (`published_at`),
  KEY `idx_featured` (`featured`),
  KEY `idx_verification` (`verification_status`),
  KEY `idx_views` (`views_count`),
  KEY `idx_created` (`created_at`),
  KEY `verified_by` (`verified_by`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  FULLTEXT KEY `idx_search` (`name`,`location`,`county`,`town`,`area`,`estate`,`address`,`description`),
  CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`property_type_id`) REFERENCES `property_types` (`id`),
  CONSTRAINT `properties_ibfk_2` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `properties_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `properties_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES (1,2,'Modern 4-Bedroom Villa in Kitusuru','modern-4-bedroom-villa-kitusuru','<h3>Modern 4-Bedroom Villa in Kitusuru</h3><p>This stunning modern villa is located in the prestigious Kitusuru neighborhood...</p>',85000000.00,'KES','Kitusuru, Nairobi','Nairobi','Nairobi','Kitusuru','Kitusuru','12 Kitusuru Drive, Nairobi, Kenya',-1.26670000,36.81670000,4,5,3,520.00,1200.00,2,2020,'Furnished','Available','Verified',NULL,NULL,NULL,1,541,'2024-01-15 06:30:00',1,1,'2026-08-26 09:37:01','2026-09-07 14:28:15');
INSERT INTO `properties` VALUES (2,1,'Luxury 3-Bedroom Apartment in Westlands','luxury-3-bedroom-apartment-westlands','<h3>Luxury 3-Bedroom Apartment in Westlands</h3><p>Spacious luxury apartment with panoramic city views...</p>',42500000.00,'KES','Westlands, Nairobi','Nairobi','Nairobi','Westlands','The Village','The Village Apartments, Waiyuki Road, Nairobi',-1.26670000,36.81670000,3,3,2,280.00,0.00,1,2022,'Semi-Furnished','Available','Verified',NULL,NULL,NULL,0,292,'2024-02-10 11:15:00',1,NULL,'2026-08-26 09:37:01','2026-09-07 12:57:22');
INSERT INTO `properties` VALUES (3,3,'Beautiful Maisonette in Runda','beautiful-maisonette-runda','<h3>Beautiful Maisonette in Runda</h3><p>Charming maisonette in the heart of Runda with mature gardens...</p>',58000000.00,'KES','Runda, Nairobi','Nairobi','Nairobi','Runda','Runda','45 Runda Drive, Nairobi, Kenya',-1.26670000,36.81670000,4,4,2,350.00,800.00,2,2019,'Furnished','Reserved','Verified',NULL,NULL,NULL,1,410,'2024-01-20 08:00:00',1,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `properties` VALUES (4,4,'Executive Bungalow in Karen','executive-bungalow-karen','<h3>Executive Bungalow in Karen</h3><p>Magnificent executive bungalow set on 1 acre of pristine land...</p>',75000000.00,'KES','Karen, Nairobi','Nairobi','Nairobi','Karen','Karen','189 Karen-Langata Road, Nairobi',-1.26670000,36.81670000,5,4,4,680.00,4356.00,1,2018,'Furnished','Under Offer','Documents Submitted',NULL,NULL,NULL,0,180,'2024-03-05 05:45:00',1,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `properties` VALUES (5,5,'Modern Townhouse in Kilimani','modern-townhouse-kilimani','<h3>Modern Townhouse in Kilimani</h3><p>Elegant townhouse in a gated community with premium amenities...</p>',38500000.00,'KES','Kilimani, Nairobi','Nairobi','Nairobi','Kilimani','Kilimani Heights','Kilimani Drive, Nairobi, Kenya',-1.26670000,36.81670000,3,3,2,240.00,0.00,3,2021,'Semi-Furnished','Available','Verified',NULL,NULL,NULL,0,156,'2024-02-28 13:20:00',1,NULL,'2026-08-26 09:37:01','2026-09-07 12:57:18');
INSERT INTO `properties` VALUES (6,1,'charles','charles','jjkk',8888870.00,'KES','Naivasha Sopa Resort, Kenya','Nairobi','kiambu','','','',0.00000000,0.00000000,3,2,1,NULL,NULL,1,2026,'Unfurnished','Available','Pending',NULL,NULL,NULL,1,4,NULL,1,1,'2026-09-06 11:42:01','2026-09-07 19:50:37');
INSERT INTO `properties` VALUES (7,1,'scoffie','scoffie','uuuuuuu',8888888.00,'KES','Naivasha Sopa Resort, Kenya','Kajiado','kiambu','kkk','','2344',0.00000000,0.00000000,3,2,1,NULL,NULL,1,2026,'Unfurnished','Available','Verified',NULL,NULL,NULL,1,8,NULL,1,1,'2026-09-07 02:21:50','2026-09-07 13:08:56');
INSERT INTO `properties` VALUES (8,11,'Prime 50x100 Residential Plot in Kitengela Acacia Estate','prime-50x100-residential-plot-kitengela-acacia','Superb 50x100 ft (1/8 Acre) residential plot situated within a rapidly developing gated neighborhood in Kitengela Acacia. Features rich red soil perfect for construction, well-graded access roads, connected electricity, and fresh borehole water supply. Clean, ready freehold title deed with no encumbrances. Ideal for immediate development of your family bungalow or maisonette.',1850000.00,'KES','Acacia Estate, Kitengela','Kajiado','Kitengela','Acacia','Acacia Gated Estate','Off Namanga Road, 3km from Kitengela Town',NULL,NULL,0,0,0,NULL,450.00,1,NULL,'Unfurnished','Available','Verified',NULL,NULL,NULL,1,12,NULL,1,NULL,'2026-09-07 19:31:17','2026-09-07 19:31:17');
INSERT INTO `properties` VALUES (9,10,'1/4 Acre Commercial Plot along Ruiru Eastern Bypass','quarter-acre-commercial-plot-ruiru-eastern-bypass','Prime 1/4 acre commercial / mixed-use plot situated just 150 meters off the bustling Ruiru Eastern Bypass. High capital appreciation corridor with intense ongoing commercial and residential developments. Perfect for commercial apartments, medical center, corporate offices, or institutional use. Has a clear freehold title deed, 3-phase electricity nearby, and water connection.',9500000.00,'KES','Eastern Bypass, Ruiru','Kiambu','Ruiru','Eastern Bypass','Corner Brook Area','2nd row from Ruiru Eastern Bypass tarmac',NULL,NULL,0,0,0,NULL,1012.00,1,NULL,'Unfurnished','Available','','',1,NULL,1,15,NULL,1,1,'2026-09-07 19:31:17','2026-09-08 09:42:19');
INSERT INTO `properties` VALUES (10,11,'Exclusive 1/2 Acre Red Soil Plot in Karen Hardy','exclusive-half-acre-red-soil-plot-karen-hardy','Rare opportunity to acquire a pristine 0.5-acre parcel of land in the quiet, prestigious enclave of Karen Hardy. Gently sloping with mature indigenous trees, deep red volcanic soil, and serene greenery. Fully fenced with mature perimeter hedge, dual water supply (City council and private borehole), reliable electricity, and manned barrier entry. Clean deed in place.',38000000.00,'KES','Hardy, Karen, Nairobi','Nairobi','Nairobi','Karen','Hardy Estate','Hardy Ridge Road, Karen',NULL,NULL,0,0,0,NULL,2023.00,1,NULL,'Unfurnished','Available','Verified',NULL,NULL,NULL,1,12,NULL,1,NULL,'2026-09-07 19:31:17','2026-09-07 19:31:17');
INSERT INTO `properties` VALUES (11,11,'Affordable 1/8 Acre Residential Plot in Juja South','affordable-eighth-acre-plot-juja-south','Controlled residential 1/8 acre (50x100) plot within the coveted Juja South community. Strict building guidelines ensure uniform, upscale single-family homes and orderly growth. All utilities ready on site: water connected, power lines live, street lighting installed, and murram roads completed. Immediate transfer of freehold title deed upon purchase.',2400000.00,'KES','Juja South Estate, Juja','Kiambu','Juja','Juja South','Juja South Gated Estate','4.5km off Thika Superhighway',NULL,NULL,0,0,0,NULL,450.00,1,NULL,'Unfurnished','Available','Verified',NULL,NULL,NULL,1,12,NULL,1,NULL,'2026-09-07 19:31:17','2026-09-07 19:31:17');
INSERT INTO `properties` VALUES (12,11,'charles','charles-2','GEGEGEGFG',7777.00,'KES','jhjhh','Nairobi','kiambu','5GT','7UU',NULL,NULL,NULL,3,2,1,NULL,NULL,1,2026,'Unfurnished','Available','','',1,NULL,1,1,NULL,1,1,'2026-09-07 20:35:59','2026-09-08 07:57:19');
INSERT INTO `properties` VALUES (13,11,'BBBB','bbbb','HHH',88888.00,'KES','TTTRRERR','Nairobi','ERRR','TR5','YTYY','TRY',NULL,NULL,3,2,1,NULL,NULL,1,2026,'Unfurnished','Available','Pending',NULL,NULL,NULL,1,1,NULL,1,1,'2026-09-07 20:56:19','2026-09-07 20:56:58');
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_agents`
--

DROP TABLE IF EXISTS `property_agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `property_agents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL,
  `agent_id` int(11) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_property_agent` (`property_id`,`agent_id`),
  KEY `idx_property` (`property_id`),
  KEY `idx_agent` (`agent_id`),
  CONSTRAINT `property_agents_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `property_agents_ibfk_2` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_agents`
--

LOCK TABLES `property_agents` WRITE;
/*!40000 ALTER TABLE `property_agents` DISABLE KEYS */;
INSERT INTO `property_agents` VALUES (2,2,4,1,'2026-08-26 09:37:01');
INSERT INTO `property_agents` VALUES (3,3,2,1,'2026-08-26 09:37:01');
INSERT INTO `property_agents` VALUES (4,4,3,1,'2026-08-26 09:37:01');
INSERT INTO `property_agents` VALUES (5,5,4,1,'2026-08-26 09:37:01');
INSERT INTO `property_agents` VALUES (7,2,1,0,'2026-08-26 09:37:01');
INSERT INTO `property_agents` VALUES (8,4,2,0,'2026-08-26 09:37:01');
INSERT INTO `property_agents` VALUES (11,1,1,1,'2026-09-07 02:19:28');
/*!40000 ALTER TABLE `property_agents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_documents`
--

DROP TABLE IF EXISTS `property_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `property_documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint(20) unsigned DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `document_type` enum('deed','title','tax_receipt','approval','survey','insurance','other') DEFAULT 'other',
  `visibility` enum('private','admin_only') DEFAULT 'private',
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_property` (`property_id`),
  KEY `idx_type` (`document_type`),
  KEY `idx_visibility` (`visibility`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `property_documents_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `property_documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_documents`
--

LOCK TABLES `property_documents` WRITE;
/*!40000 ALTER TABLE `property_documents` DISABLE KEYS */;
INSERT INTO `property_documents` VALUES (1,1,'Title Deed - Kitusuru Villa','Copy of the registered title deed','title-deed-kitusuru-villa.pdf','/uploads/documents/private/title-deed-kitusuru-villa.pdf',2048576,'application/pdf','title','admin_only',1,'2026-08-26 09:37:01');
INSERT INTO `property_documents` VALUES (2,1,'Rates Clearance Certificate','Nairobi County rates clearance certificate','rates-clearance-kitusuru.pdf','/uploads/documents/private/rates-clearance-kitusuru.pdf',1536000,'application/pdf','approval','admin_only',1,'2026-08-26 09:37:01');
INSERT INTO `property_documents` VALUES (3,2,'Approval Plan - Westlands Apt','Approved building plan','approval-plan-westlands-apt.pdf','/uploads/documents/private/approval-plan-westlands-apt.pdf',1792000,'application/pdf','approval','admin_only',1,'2026-08-26 09:37:01');
INSERT INTO `property_documents` VALUES (4,4,'Land Survey - Karen Bungalow','Property survey plan for Karen bungalow','land-survey-karen-bungalow.pdf','survey-plan-karen-bungalow.pdf',2150000,'application/pdf','survey','admin_only',1,'2026-08-26 09:37:01');
/*!40000 ALTER TABLE `property_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_features`
--

DROP TABLE IF EXISTS `property_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `property_features` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL,
  `feature_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_property_feature` (`property_id`,`feature_id`),
  KEY `idx_property` (`property_id`),
  KEY `idx_feature` (`feature_id`),
  CONSTRAINT `property_features_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `property_features_ibfk_2` FOREIGN KEY (`feature_id`) REFERENCES `features` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_features`
--

LOCK TABLES `property_features` WRITE;
/*!40000 ALTER TABLE `property_features` DISABLE KEYS */;
INSERT INTO `property_features` VALUES (11,2,14,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (12,2,16,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (13,2,17,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (14,2,7,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (15,2,13,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (16,3,2,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (17,3,3,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (18,3,5,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (19,3,6,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (20,3,8,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (21,3,9,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (22,3,15,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (23,3,25,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (24,4,2,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (25,4,3,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (26,4,5,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (27,4,6,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (28,4,8,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (29,4,9,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (30,4,13,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (31,4,15,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (32,4,24,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (33,5,13,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (34,5,14,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (35,5,17,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (36,5,16,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (37,5,9,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (38,5,25,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (39,5,22,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (40,5,23,'2026-08-26 09:37:01');
INSERT INTO `property_features` VALUES (61,1,1,'2026-09-07 02:19:28');
INSERT INTO `property_features` VALUES (62,1,2,'2026-09-07 02:19:28');
INSERT INTO `property_features` VALUES (63,1,3,'2026-09-07 02:19:28');
INSERT INTO `property_features` VALUES (64,1,4,'2026-09-07 02:19:28');
INSERT INTO `property_features` VALUES (65,1,5,'2026-09-07 02:19:28');
INSERT INTO `property_features` VALUES (66,1,6,'2026-09-07 02:19:28');
INSERT INTO `property_features` VALUES (67,1,7,'2026-09-07 02:19:28');
INSERT INTO `property_features` VALUES (68,1,8,'2026-09-07 02:19:28');
INSERT INTO `property_features` VALUES (69,1,14,'2026-09-07 02:19:28');
INSERT INTO `property_features` VALUES (70,1,20,'2026-09-07 02:19:28');
INSERT INTO `property_features` VALUES (71,8,26,'2026-09-07 19:31:17');
INSERT INTO `property_features` VALUES (72,8,27,'2026-09-07 19:31:17');
INSERT INTO `property_features` VALUES (73,8,28,'2026-09-07 19:31:17');
INSERT INTO `property_features` VALUES (74,8,29,'2026-09-07 19:31:17');
INSERT INTO `property_features` VALUES (75,8,32,'2026-09-07 19:31:17');
INSERT INTO `property_features` VALUES (80,10,26,'2026-09-07 19:31:17');
INSERT INTO `property_features` VALUES (81,10,30,'2026-09-07 19:31:17');
INSERT INTO `property_features` VALUES (82,10,29,'2026-09-07 19:31:17');
INSERT INTO `property_features` VALUES (83,10,27,'2026-09-07 19:31:17');
INSERT INTO `property_features` VALUES (84,10,33,'2026-09-07 19:31:17');
INSERT INTO `property_features` VALUES (85,10,32,'2026-09-07 19:31:17');
INSERT INTO `property_features` VALUES (86,11,26,'2026-09-07 19:31:17');
INSERT INTO `property_features` VALUES (87,11,27,'2026-09-07 19:31:17');
INSERT INTO `property_features` VALUES (88,11,28,'2026-09-07 19:31:17');
INSERT INTO `property_features` VALUES (89,11,29,'2026-09-07 19:31:17');
INSERT INTO `property_features` VALUES (90,11,31,'2026-09-07 19:31:17');
INSERT INTO `property_features` VALUES (91,12,1,'2026-09-07 20:35:59');
INSERT INTO `property_features` VALUES (92,12,2,'2026-09-07 20:35:59');
INSERT INTO `property_features` VALUES (93,12,3,'2026-09-07 20:35:59');
INSERT INTO `property_features` VALUES (97,13,1,'2026-09-07 20:56:58');
INSERT INTO `property_features` VALUES (98,13,3,'2026-09-07 20:56:58');
INSERT INTO `property_features` VALUES (99,13,12,'2026-09-07 20:56:58');
INSERT INTO `property_features` VALUES (100,9,26,'2026-09-08 06:22:36');
INSERT INTO `property_features` VALUES (101,9,27,'2026-09-08 06:22:36');
INSERT INTO `property_features` VALUES (102,9,28,'2026-09-08 06:22:36');
INSERT INTO `property_features` VALUES (103,9,31,'2026-09-08 06:22:36');
/*!40000 ALTER TABLE `property_features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_images`
--

DROP TABLE IF EXISTS `property_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `property_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `file_size` bigint(20) unsigned DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `width` smallint(6) DEFAULT NULL,
  `height` smallint(6) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_property` (`property_id`),
  KEY `idx_primary` (`is_primary`),
  KEY `idx_sort` (`sort_order`),
  CONSTRAINT `property_images_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_images`
--

LOCK TABLES `property_images` WRITE;
/*!40000 ALTER TABLE `property_images` DISABLE KEYS */;
INSERT INTO `property_images` VALUES (1,1,'villa-kitusuru-exterior.jpg','Modern villa exterior in Kitusuru','Main exterior view of the villa',1,0,245760,'image/jpeg',1200,800,'2026-08-26 09:37:01');
INSERT INTO `property_images` VALUES (2,1,'villa-kitusuru-living.jpg','Living room interior','Spacious living room with city view',0,1,184320,'image/jpeg',1000,750,'2026-08-26 09:37:01');
INSERT INTO `property_images` VALUES (3,1,'villa-kitusuru-kitchen.jpg','Modern kitchen','Fully equipped modern kitchen',0,2,196608,'image/jpeg',1100,800,'2026-08-26 09:37:01');
INSERT INTO `property_images` VALUES (4,1,'villa-kitusuru-garden.jpg','Swimming pool and garden','Private swimming pool surrounded by landscaped garden',0,3,229376,'image/jpeg',1200,800,'2026-08-26 09:37:01');
INSERT INTO `property_images` VALUES (5,1,'villa-kitusuru-master.jpg','Master bedroom','Luxury master bedroom with en-suite bathroom',0,4,163840,'image/jpeg',900,700,'2026-08-26 09:37:01');
INSERT INTO `property_images` VALUES (6,2,'apartment-westlands-exterior.jpg','Westlands luxury apartment exterior','Building exterior at sunset',1,0,204800,'image/jpeg',1200,800,'2026-08-26 09:37:01');
INSERT INTO `property_images` VALUES (7,2,'apartment-westlands-living.jpg','Living room with city view','Panoramic views of Westlands skyline',0,1,172032,'image/jpeg',1000,667,'2026-08-26 09:37:01');
INSERT INTO `property_images` VALUES (8,2,'apartment-westlands-kitchen.jpg','Modern kitchen','Contemporary kitchen with high-end appliances',0,2,188743,'image/jpeg',1100,733,'2026-08-26 09:37:01');
INSERT INTO `property_images` VALUES (9,2,'apartment-westlands-balcony.jpg','Balcony view','Private balcony overlooking the city',0,3,155648,'image/jpeg',900,600,'2026-08-26 09:37:01');
INSERT INTO `property_images` VALUES (10,3,'maisonette-runda-garden.jpg','Runda maisonette garden','Charming maisonette surrounded by mature trees',1,0,235520,'image/jpeg',1200,800,'2026-08-26 09:37:01');
INSERT INTO `property_images` VALUES (11,3,'maisonette-runda-interior.jpg','Interior living space','Elegant living room with natural light',0,1,169984,'image/jpeg',1000,750,'2026-08-26 09:37:01');
INSERT INTO `property_images` VALUES (12,3,'maisonette-runda-bedroom.jpg','Main bedroom','Spacious master bedroom with walk-in closet',0,2,159744,'image/jpeg',950,700,'2026-08-26 09:37:01');
INSERT INTO `property_images` VALUES (13,4,'bungalow-karen-exterior.jpg','Karen bungalow exterior','Executive bungalow on one acre of land',1,0,240000,'image/jpeg',1200,800,'2026-08-26 09:37:01');
INSERT INTO `property_images` VALUES (14,4,'bungalow-karen-garden.jpg','Garden view','Mature garden with indigenous trees',0,1,190000,'image/jpeg',1100,733,'2026-08-26 09:37:01');
INSERT INTO `property_images` VALUES (15,4,'bungalow-karen-living.jpg','Interior living area','Spacious open-plan living area',0,2,175000,'image/jpeg',1050,700,'2026-08-26 09:37:01');
INSERT INTO `property_images` VALUES (16,5,'townhouse-kilimani-exterior.jpg','Kilimani townhouse exterior','Modern townhouse in gated community',1,0,210000,'image/jpeg',1200,800,'2026-08-26 09:37:01');
INSERT INTO `property_images` VALUES (17,5,'townhouse-kilimani-living.jpg','Living area interior','Contemporary living room with large windows',0,1,165000,'image/jpeg',1000,750,'2026-08-26 09:37:01');
INSERT INTO `property_images` VALUES (18,5,'townhouse-kilimani-balcony.jpg','Balcony garden','Private balcony with potted plants',0,2,140000,'image/jpeg',900,600,'2026-08-26 09:37:01');
INSERT INTO `property_images` VALUES (31,7,'20260907_6a9eb70f28596.jpg','scoffie','',1,3,NULL,NULL,NULL,NULL,'2026-09-07 13:08:12');
INSERT INTO `property_images` VALUES (32,7,'20260907_6a9eb71b5fff1.jpg','scoffie','',0,4,NULL,NULL,NULL,NULL,'2026-09-07 13:08:12');
INSERT INTO `property_images` VALUES (33,6,'20260907_6a9eb7589cbb7.jpg','charles','',1,0,NULL,NULL,NULL,NULL,'2026-09-07 13:08:43');
INSERT INTO `property_images` VALUES (34,6,'20260907_6a9eb758cb224.jpg','charles','',1,0,NULL,NULL,NULL,NULL,'2026-09-07 13:08:43');
INSERT INTO `property_images` VALUES (35,8,'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',NULL,'Prime 50x100 Residential Plot in Kitengela Acacia Estate',1,1,NULL,NULL,NULL,NULL,'2026-09-07 19:31:17');
INSERT INTO `property_images` VALUES (37,10,'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1200&q=80',NULL,'Exclusive 1/2 Acre Red Soil Plot in Karen Hardy',1,1,NULL,NULL,NULL,NULL,'2026-09-07 19:31:17');
INSERT INTO `property_images` VALUES (38,11,'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',NULL,'Affordable 1/8 Acre Residential Plot in Juja South',1,1,NULL,NULL,NULL,NULL,'2026-09-07 19:31:17');
INSERT INTO `property_images` VALUES (39,12,'20260907_6a9f202b35478.jpg','charles','',1,0,NULL,NULL,NULL,NULL,'2026-09-07 20:35:59');
INSERT INTO `property_images` VALUES (40,12,'20260907_6a9f202b52f3b.jpg','charles','',1,0,NULL,NULL,NULL,NULL,'2026-09-07 20:35:59');
INSERT INTO `property_images` VALUES (41,12,'20260907_6a9f202b78545.jpg','charles','',1,0,NULL,NULL,NULL,NULL,'2026-09-07 20:35:59');
INSERT INTO `property_images` VALUES (45,13,'20260907_6a9f24f02e9ba.jpeg','BBBB','',1,0,NULL,NULL,NULL,NULL,'2026-09-07 20:56:58');
INSERT INTO `property_images` VALUES (46,13,'20260907_6a9f24f03ec1b.jpeg','BBBB','',1,0,NULL,NULL,NULL,NULL,'2026-09-07 20:56:58');
INSERT INTO `property_images` VALUES (47,13,'20260907_6a9f24f04f96a.jpeg','BBBB','',1,0,NULL,NULL,NULL,NULL,'2026-09-07 20:56:58');
INSERT INTO `property_images` VALUES (48,9,'20260908_6a9fa9a8407d0.jpg','1/4 Acre Commercial Plot along Ruiru Eastern Bypass','',1,1,NULL,NULL,NULL,NULL,'2026-09-08 06:22:36');
INSERT INTO `property_images` VALUES (49,9,'20260908_6a9fa9a852d43.jpeg','1/4 Acre Commercial Plot along Ruiru Eastern Bypass','',0,1,NULL,NULL,NULL,NULL,'2026-09-08 06:22:36');
INSERT INTO `property_images` VALUES (50,9,'20260908_6a9fa9a864576.jpeg','1/4 Acre Commercial Plot along Ruiru Eastern Bypass','',0,1,NULL,NULL,NULL,NULL,'2026-09-08 06:22:36');
/*!40000 ALTER TABLE `property_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_types`
--

DROP TABLE IF EXISTS `property_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `property_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_active` (`is_active`),
  KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_types`
--

LOCK TABLES `property_types` WRITE;
/*!40000 ALTER TABLE `property_types` DISABLE KEYS */;
INSERT INTO `property_types` VALUES (1,'Apartment','apartment','Home',1,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `property_types` VALUES (2,'Villa','villa','Home',2,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `property_types` VALUES (3,'Maisonette','maisonette','Home',3,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `property_types` VALUES (4,'Bungalow','bungalow','Home',4,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `property_types` VALUES (5,'Townhouse','townhouse','Home',5,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `property_types` VALUES (6,'Mansion','mansion','Home',6,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `property_types` VALUES (7,'Office','office','Building',7,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `property_types` VALUES (8,'Warehouse','warehouse','Building',8,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `property_types` VALUES (9,'Commercial Property','commercial','Building',9,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `property_types` VALUES (10,'Land','land','Land',10,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `property_types` VALUES (11,'Plot','plot','LandPlot',11,1,'2026-09-07 19:17:32','2026-09-07 19:17:32');
/*!40000 ALTER TABLE `property_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_verifications`
--

DROP TABLE IF EXISTS `property_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `property_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `status` enum('Pending','Under Review','Documents Submitted','Verified','Verification Required','Not Verified') DEFAULT 'Pending',
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_property` (`property_id`),
  KEY `idx_status` (`status`),
  KEY `submitted_by` (`submitted_by`),
  KEY `reviewed_by` (`reviewed_by`),
  CONSTRAINT `property_verifications_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `property_verifications_ibfk_2` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `property_verifications_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_verifications`
--

LOCK TABLES `property_verifications` WRITE;
/*!40000 ALTER TABLE `property_verifications` DISABLE KEYS */;
INSERT INTO `property_verifications` VALUES (1,1,'All documents submitted and verified. Property is confirmed to be legitimate.',1,1,'Verified','2024-01-20 07:30:00','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `property_verifications` VALUES (2,2,'Documents under review. Awaiting approval plan verification.',1,1,'Under Review',NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `property_verifications` VALUES (3,3,'Property fully verified with title deed and rates clearance confirmed.',1,1,'Verified','2024-01-25 11:15:00','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `property_verifications` VALUES (4,4,'Documents submitted. Pending rates clearance.',1,1,'Documents Submitted',NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `property_verifications` VALUES (5,5,'Verification completed successfully.',1,1,'Verified','2024-02-28 13:45:00','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `property_verifications` VALUES (6,9,'',NULL,1,'Verified',NULL,'2026-09-08 06:44:06','2026-09-08 06:44:06');
INSERT INTO `property_verifications` VALUES (7,9,'',NULL,1,'Verified',NULL,'2026-09-08 06:44:12','2026-09-08 06:44:12');
INSERT INTO `property_verifications` VALUES (8,9,'',NULL,1,'',NULL,'2026-09-08 06:49:32','2026-09-08 06:49:32');
INSERT INTO `property_verifications` VALUES (9,12,'',NULL,1,'',NULL,'2026-09-08 07:57:19','2026-09-08 07:57:19');
/*!40000 ALTER TABLE `property_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_views`
--

DROP TABLE IF EXISTS `property_views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `property_views` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `referrer` varchar(500) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_property` (`property_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `property_views_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_views`
--

LOCK TABLES `property_views` WRITE;
/*!40000 ALTER TABLE `property_views` DISABLE KEYS */;
INSERT INTO `property_views` VALUES (1,1,NULL,'sess_a1b2c3','192.168.1.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',NULL,'Nairobi','Kenya','2026-08-26 09:37:01');
INSERT INTO `property_views` VALUES (2,1,2,'sess_d4e5f6','192.168.1.2','Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',NULL,'Nairobi','Kenya','2026-08-26 09:37:01');
INSERT INTO `property_views` VALUES (3,2,NULL,'sess_g7h8i9','192.168.1.3','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',NULL,'Nairobi','Kenya','2026-08-26 09:37:01');
INSERT INTO `property_views` VALUES (4,3,3,'sess_j1k2l3','192.168.1.4','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',NULL,'Nairobi','Kenya','2026-08-26 09:37:01');
INSERT INTO `property_views` VALUES (5,1,NULL,'sess_m4n5o6','192.168.1.5','Mozilla/5.0 (Linux; Android 13) Chrome Mobile',NULL,'Kisumu','Kenya','2026-08-26 09:37:01');
INSERT INTO `property_views` VALUES (6,4,NULL,'sess_p7q8r9','192.168.1.6','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',NULL,'Mombasa','Kenya','2026-08-26 09:37:01');
INSERT INTO `property_views` VALUES (7,2,4,'sess_s1t2u3','192.168.1.7','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari',NULL,'Nairobi','Kenya','2026-08-26 09:37:01');
INSERT INTO `property_views` VALUES (8,5,5,'sess_v4w5x6','192.168.1.8','Mozilla/5.0 (Linux; Android 13) Chrome Mobile',NULL,'Nakuru','Kenya','2026-08-26 09:37:01');
INSERT INTO `property_views` VALUES (9,1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/modern-4-bedroom-villa-kitusuru',NULL,NULL,'2026-09-02 10:18:05');
INSERT INTO `property_views` VALUES (10,1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/modern-4-bedroom-villa-kitusuru',NULL,NULL,'2026-09-02 10:48:06');
INSERT INTO `property_views` VALUES (11,1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/modern-4-bedroom-villa-kitusuru',NULL,NULL,'2026-09-02 10:51:24');
INSERT INTO `property_views` VALUES (12,1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/modern-4-bedroom-villa-kitusuru',NULL,NULL,'2026-09-02 12:04:51');
INSERT INTO `property_views` VALUES (13,1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/modern-4-bedroom-villa-kitusuru',NULL,NULL,'2026-09-02 14:09:34');
INSERT INTO `property_views` VALUES (14,6,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/charles',NULL,NULL,'2026-09-06 11:42:12');
INSERT INTO `property_views` VALUES (15,6,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/charles',NULL,NULL,'2026-09-06 12:50:59');
INSERT INTO `property_views` VALUES (16,6,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/charles',NULL,NULL,'2026-09-06 13:19:19');
INSERT INTO `property_views` VALUES (17,2,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/luxury-3-bedroom-apartment-westlands',NULL,NULL,'2026-09-07 02:18:49');
INSERT INTO `property_views` VALUES (18,1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/modern-4-bedroom-villa-kitusuru',NULL,NULL,'2026-09-07 02:19:35');
INSERT INTO `property_views` VALUES (19,7,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/scoffie',NULL,NULL,'2026-09-07 02:22:18');
INSERT INTO `property_views` VALUES (20,7,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/scoffie',NULL,NULL,'2026-09-07 02:22:52');
INSERT INTO `property_views` VALUES (21,7,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/scoffie',NULL,NULL,'2026-09-07 07:32:01');
INSERT INTO `property_views` VALUES (22,7,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/scoffie',NULL,NULL,'2026-09-07 07:32:32');
INSERT INTO `property_views` VALUES (23,1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/modern-4-bedroom-villa-kitusuru',NULL,NULL,'2026-09-07 08:15:59');
INSERT INTO `property_views` VALUES (24,1,NULL,NULL,'::1','Mozilla/5.0 (iPhone; CPU iPhone OS 26_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1','http://localhost/homes/dist/properties/modern-4-bedroom-villa-kitusuru',NULL,NULL,'2026-09-07 08:16:10');
INSERT INTO `property_views` VALUES (25,1,NULL,NULL,'::1','Mozilla/5.0 (iPhone; CPU iPhone OS 26_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1','http://localhost/homes/dist/properties/modern-4-bedroom-villa-kitusuru',NULL,NULL,'2026-09-07 08:16:12');
INSERT INTO `property_views` VALUES (26,1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/modern-4-bedroom-villa-kitusuru',NULL,NULL,'2026-09-07 08:16:20');
INSERT INTO `property_views` VALUES (27,7,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/scoffie',NULL,NULL,'2026-09-07 08:53:10');
INSERT INTO `property_views` VALUES (28,7,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/scoffie',NULL,NULL,'2026-09-07 09:00:48');
INSERT INTO `property_views` VALUES (29,1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/modern-4-bedroom-villa-kitusuru',NULL,NULL,'2026-09-07 12:57:05');
INSERT INTO `property_views` VALUES (30,5,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/modern-townhouse-kilimani',NULL,NULL,'2026-09-07 12:57:18');
INSERT INTO `property_views` VALUES (31,2,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/luxury-3-bedroom-apartment-westlands',NULL,NULL,'2026-09-07 12:57:22');
INSERT INTO `property_views` VALUES (32,7,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/scoffie',NULL,NULL,'2026-09-07 13:08:01');
INSERT INTO `property_views` VALUES (33,7,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/scoffie',NULL,NULL,'2026-09-07 13:08:56');
INSERT INTO `property_views` VALUES (34,1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/properties/modern-4-bedroom-villa-kitusuru?view=1',NULL,NULL,'2026-09-07 14:20:40');
INSERT INTO `property_views` VALUES (35,1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/properties/modern-4-bedroom-villa-kitusuru',NULL,NULL,'2026-09-07 14:28:15');
INSERT INTO `property_views` VALUES (36,6,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/charles',NULL,NULL,'2026-09-07 19:50:37');
INSERT INTO `property_views` VALUES (37,12,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/charles-2',NULL,NULL,'2026-09-07 20:36:35');
INSERT INTO `property_views` VALUES (38,13,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/bbbb',NULL,NULL,'2026-09-07 20:56:48');
INSERT INTO `property_views` VALUES (39,9,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/quarter-acre-commercial-plot-ruiru-eastern-bypass',NULL,NULL,'2026-09-08 06:33:57');
INSERT INTO `property_views` VALUES (40,9,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/quarter-acre-commercial-plot-ruiru-eastern-bypass',NULL,NULL,'2026-09-08 06:42:44');
INSERT INTO `property_views` VALUES (41,9,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','http://localhost/homes/dist/properties/quarter-acre-commercial-plot-ruiru-eastern-bypass?view=1',NULL,NULL,'2026-09-08 09:42:19');
/*!40000 ALTER TABLE `property_views` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_permission` (`role_id`,`permission_id`),
  KEY `idx_role` (`role_id`),
  KEY `idx_permission` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=282 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (1,1,28,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (2,1,29,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (3,1,30,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (4,1,31,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (5,1,65,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (6,1,48,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (7,1,49,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (8,1,50,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (9,1,51,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (10,1,52,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (11,1,53,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (12,1,54,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (13,1,55,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (14,1,56,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (15,1,25,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (16,1,26,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (17,1,27,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (18,1,39,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (19,1,40,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (20,1,41,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (21,1,21,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (22,1,22,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (23,1,23,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (24,1,24,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (25,1,42,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (26,1,43,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (27,1,44,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (28,1,45,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (29,1,46,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (30,1,47,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (31,1,35,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (32,1,36,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (33,1,37,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (34,1,38,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (35,1,1,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (36,1,2,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (37,1,3,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (38,1,4,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (39,1,5,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (40,1,6,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (41,1,7,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (42,1,8,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (43,1,9,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (44,1,10,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (45,1,11,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (46,1,12,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (47,1,13,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (48,1,14,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (49,1,15,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (50,1,16,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (51,1,17,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (52,1,18,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (53,1,19,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (54,1,20,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (55,1,57,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (56,1,58,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (57,1,66,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (58,1,67,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (59,1,68,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (60,1,69,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (61,1,70,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (62,1,59,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (63,1,60,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (64,1,61,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (65,1,62,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (66,1,63,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (67,1,64,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (68,1,32,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (69,1,33,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (70,1,34,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (128,2,29,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (129,2,31,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (130,2,30,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (131,2,28,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (132,2,65,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (133,2,27,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (134,2,26,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (135,2,25,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (136,2,18,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (137,2,17,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (138,2,16,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (139,2,70,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (140,2,69,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (141,2,54,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (142,2,56,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (143,2,55,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (144,2,53,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (145,2,13,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (146,2,15,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (147,2,14,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (148,2,12,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (149,2,41,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (150,2,40,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (151,2,39,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (152,2,47,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (153,2,46,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (154,2,24,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (155,2,23,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (156,2,22,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (157,2,21,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (158,2,43,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (159,2,45,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (160,2,44,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (161,2,42,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (162,2,36,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (163,2,38,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (164,2,37,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (165,2,35,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (166,2,2,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (167,2,4,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (168,2,3,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (169,2,7,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (170,2,5,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (171,2,6,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (172,2,1,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (173,2,9,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (174,2,11,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (175,2,10,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (176,2,8,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (177,2,63,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (178,2,68,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (179,2,67,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (180,2,58,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (181,2,57,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (182,2,52,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (183,2,49,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (184,2,51,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (185,2,50,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (186,2,48,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (187,2,60,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (188,2,62,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (189,2,61,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (190,2,59,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (191,2,20,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (192,2,19,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (193,2,34,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (194,2,33,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (195,2,32,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (255,3,1,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (256,3,2,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (257,3,3,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (258,3,5,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (259,3,6,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (260,3,8,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (261,3,12,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (262,3,16,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (263,3,19,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (264,3,20,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (265,3,28,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (266,3,21,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (267,3,22,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (268,3,32,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (269,3,33,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (270,3,34,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (271,3,65,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (272,3,42,'2026-08-26 09:37:01');
INSERT INTO `role_permissions` VALUES (273,1,71,'2026-09-06 14:32:13');
INSERT INTO `role_permissions` VALUES (274,2,71,'2026-09-06 14:32:13');
INSERT INTO `role_permissions` VALUES (275,3,71,'2026-09-06 14:32:13');
INSERT INTO `role_permissions` VALUES (276,1,72,'2026-09-06 14:32:13');
INSERT INTO `role_permissions` VALUES (277,2,72,'2026-09-06 14:32:13');
INSERT INTO `role_permissions` VALUES (278,3,72,'2026-09-06 14:32:13');
INSERT INTO `role_permissions` VALUES (279,1,73,'2026-09-06 14:32:13');
INSERT INTO `role_permissions` VALUES (280,2,73,'2026-09-06 14:32:13');
INSERT INTO `role_permissions` VALUES (281,3,73,'2026-09-06 14:32:13');
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Super Admin','super-admin','Full system access',1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `roles` VALUES (2,'Administrator','administrator','Administrative access',2,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `roles` VALUES (3,'Property Manager','property-manager','Manage properties and agents',3,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `roles` VALUES (4,'Sales Agent','sales-agent','Sales and client management',4,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `roles` VALUES (5,'Content Manager','content-manager','Manage website content',5,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `roles` VALUES (6,'Support','support','Customer support access',6,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `roles` VALUES (7,'Customer','customer','Registered customer/visitor',7,'2026-08-26 09:37:01','2026-08-26 09:37:01');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seo_metadata`
--

DROP TABLE IF EXISTS `seo_metadata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seo_metadata` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page_type` varchar(100) NOT NULL,
  `page_id` int(11) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` varchar(255) DEFAULT NULL,
  `canonical_url` varchar(500) DEFAULT NULL,
  `og_title` varchar(255) DEFAULT NULL,
  `og_description` text DEFAULT NULL,
  `og_image` varchar(500) DEFAULT NULL,
  `og_type` varchar(50) DEFAULT 'website',
  `twitter_card` varchar(50) DEFAULT 'summary_large_image',
  `is_indexed` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_page_type` (`page_type`),
  KEY `idx_slug` (`slug`),
  KEY `idx_indexed` (`is_indexed`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seo_metadata`
--

LOCK TABLES `seo_metadata` WRITE;
/*!40000 ALTER TABLE `seo_metadata` DISABLE KEYS */;
INSERT INTO `seo_metadata` VALUES (1,'home',1,'home','Prime Realty Kenya | Your Trusted Property Partner','Prime Realty Kenya offers professionally managed residential and commercial properties across Kenya. Find your perfect home or investment property with our expert agents.',NULL,'/',NULL,NULL,NULL,'website','summary_large_image',1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `seo_metadata` VALUES (2,'about',2,'about','About Us - Prime Realty Kenya','Learn about Prime Realty Kenya, your trusted real estate partner with over 15 years of experience in the Kenyan property market.',NULL,'/about',NULL,NULL,NULL,'website','summary_large_image',1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `seo_metadata` VALUES (3,'contact',4,'contact','Contact Us - Prime Realty Kenya','Contact Prime Realty Kenya to find your dream property. We have offices in Nairobi, Mombasa, Kisumu, and Nakuru.',NULL,'/contact',NULL,NULL,NULL,'website','summary_large_image',1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `seo_metadata` VALUES (4,'properties',NULL,'properties','Properties for Sale in Kenya - Prime Realty Kenya','Browse our comprehensive list of residential and commercial properties for sale across Kenya. Filter by location, price, and property type.',NULL,'/properties',NULL,NULL,NULL,'website','summary_large_image',1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
/*!40000 ALTER TABLE `seo_metadata` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(100) NOT NULL,
  `value` text DEFAULT NULL,
  `type` enum('text','textarea','number','boolean','json','color','image','select','email','url') DEFAULT 'text',
  `group_name` varchar(50) NOT NULL DEFAULT 'general',
  `label` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_public` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  KEY `idx_key_name` (`key`),
  KEY `idx_group` (`group_name`),
  KEY `idx_public` (`is_public`)
) ENGINE=InnoDB AUTO_INCREMENT=254 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'business_name','Hemaprin Homes','text','general','Business Name','Official business name',1,1,'2026-08-26 09:37:01','2026-09-07 08:10:54');
INSERT INTO `settings` VALUES (2,'website_name','Hemaprin Homes','text','general','Website Name','Name displayed on website',2,1,'2026-08-26 09:37:01','2026-09-07 08:10:54');
INSERT INTO `settings` VALUES (3,'tagline','Your Trusted Partner in Kenyan Real Estate','text','general','Tagline','Website tagline',3,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (4,'description','Prime Realty Kenya offers professionally managed residential and commercial properties across Kenya. With over 15 years of experience, we help you find, buy, and sell properties with confidence.','textarea','general','Description','Website meta description',4,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (5,'default_currency','KES','select','general','Default Currency','Default currency for property prices',5,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (6,'country','Kenya','text','general','Country','Primary operating country',6,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (7,'timezone','Africa/Nairobi','select','general','Timezone','Default timezone',7,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (8,'language','en','select','general','Language','Default website language',8,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (9,'admin_email','admin@realestate.co.ke','email','general','Admin Email','Primary admin contact email',9,0,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (10,'items_per_page','12','number','general','Items Per Page','Number of items per page on website',10,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (11,'maintenance_mode','0','boolean','system','Maintenance Mode','Enable/disable maintenance mode',1,0,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (12,'customer_registration','1','boolean','system','Customer Registration','Allow public customer registration',2,0,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (13,'property_inquiries','1','boolean','system','Property Inquiries','Enable property inquiry system',3,0,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (14,'viewing_requests','1','boolean','system','Viewing Requests','Enable viewing request system',4,0,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (15,'whatsapp_enabled','1','boolean','system','WhatsApp Integration','Enable WhatsApp integration',5,0,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (16,'floating_social','1','boolean','system','Floating Social Buttons','Show floating social media buttons',6,0,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (17,'promotions_enabled','1','boolean','system','Promotions','Enable promotional cards/popups',7,0,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (18,'testimonials_enabled','1','boolean','system','Testimonials','Enable testimonials section',8,0,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (19,'contact_phone','+254 700 000 001','text','contact','Phone Number','Primary contact phone number',1,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (20,'contact_whatsapp','+254 700 000 001','text','contact','WhatsApp Number','WhatsApp contact number',2,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (21,'contact_email','info@realestate.co.ke','email','contact','Email Address','Primary contact email',3,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (22,'contact_secondary_email','support@realestate.co.ke','email','contact','Secondary Email','Secondary support email',4,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (23,'contact_address','Suite 201, Capital Centre, Westlands, Nairobi, Kenya','textarea','contact','Address','Physical business address',5,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (24,'contact_county','Nairobi','text','contact','County','County of operation',6,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (25,'contact_country','Kenya','text','contact','Country','Country of operation',7,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (26,'contact_opening_hours','Monday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 4:00 PM\nSunday: Closed\nPublic Holidays: Closed','textarea','contact','Opening Hours','Business opening hours',8,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (27,'contact_map_lat','-1.2864','text','contact','Map Latitude','Google Maps latitude',9,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (28,'contact_map_lng','36.8172','text','contact','Map Longitude','Google Maps longitude',10,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (29,'contact_map_zoom','12','number','contact','Map Zoom','Default map zoom level',11,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (30,'branding_logo','/homes/backend/uploads/branding/20260907_6a9ebbf466a20.jpeg','image','branding','Main Logo','Primary website logo',1,1,'2026-08-26 09:37:01','2026-09-07 13:28:22');
INSERT INTO `settings` VALUES (31,'branding_mobile_logo','uploads/branding/20260908_6a9fda5f54cf4.jpeg','image','branding','Mobile Logo','Logo for mobile devices',2,1,'2026-08-26 09:37:01','2026-09-08 09:50:25');
INSERT INTO `settings` VALUES (32,'branding_light_logo','uploads/branding/20260908_6a9fda551d38a.jpeg','image','branding','Light Logo','Logo for dark backgrounds',3,1,'2026-08-26 09:37:01','2026-09-08 09:50:25');
INSERT INTO `settings` VALUES (33,'branding_dark_logo','uploads/branding/20260908_6a9fda5b1ba11.jpeg','image','branding','Dark Logo','Logo for light backgrounds',4,1,'2026-08-26 09:37:01','2026-09-08 09:50:25');
INSERT INTO `settings` VALUES (34,'branding_favicon','uploads/branding/20260908_6a9fda4fd0c2e.jpeg','image','branding','Favicon','Browser favicon',5,1,'2026-08-26 09:37:01','2026-09-08 09:50:25');
INSERT INTO `settings` VALUES (35,'branding_primary_color','#1e3a8a','color','branding','Primary Color','Primary brand color',6,1,'2026-08-26 09:37:01','2026-09-07 01:52:14');
INSERT INTO `settings` VALUES (36,'branding_secondary_color','#4c1d95','color','branding','Secondary Color','Secondary brand color',7,1,'2026-08-26 09:37:01','2026-09-07 01:52:14');
INSERT INTO `settings` VALUES (37,'branding_accent_color','#92400e','color','branding','Accent Color','Accent/warm color',8,1,'2026-08-26 09:37:01','2026-09-07 01:52:14');
INSERT INTO `settings` VALUES (38,'branding_background','#ffffff','color','branding','Background','Page background color',9,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (39,'branding_surface','#f8fafc','color','branding','Surface','Card/surface background color',10,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (40,'branding_text_color','#1e293b','color','branding','Text Color','Primary text color',11,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (41,'branding_muted_text','#64748b','color','branding','Muted Text','Secondary/muted text color',12,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (42,'branding_heading_font','Roboto','select','branding','Heading Font','Font for headings',13,1,'2026-08-26 09:37:01','2026-09-07 09:07:29');
INSERT INTO `settings` VALUES (43,'branding_body_font','Inter','select','branding','Body Font','Font for body text',14,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (44,'seo_site_title','Prime Realty Kenya | Property Marketplace','text','seo','Site Title','SEO site title',1,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (45,'seo_meta_description','Prime Realty Kenya offers professionally managed residential and commercial properties across Kenya. Find your perfect home or investment property with our expert agents.','textarea','seo','Meta Description','SEO meta description',2,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (46,'seo_default_og_image','/uploads/branding/og-image.jpg','image','seo','Default OG Image','Default Open Graph image',3,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (47,'seo_google_verification','','text','seo','Google Verification','Google Search Console verification code',4,0,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (48,'seo_bing_verification','','text','seo','Bing Verification','Bing Webmaster verification code',5,0,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (49,'seo_twitter_card','summary_large_image','select','seo','Twitter Card','Default Twitter card type',6,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (50,'seo_favicon','/uploads/branding/favicon.png','image','seo','SEO Favicon','SEO favicon path',7,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (51,'smtp_host','','text','email','SMTP Host','SMTP server hostname',1,0,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (52,'smtp_port','587','number','email','SMTP Port','SMTP server port',2,0,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (53,'smtp_username','','text','email','SMTP Username','SMTP authentication username',3,0,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (54,'smtp_password','','text','email','SMTP Password','SMTP authentication password',4,0,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (55,'smtp_encryption','tls','select','email','SMTP Encryption','SMTP encryption method',5,0,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (56,'smtp_from_name','Prime Realty Kenya','text','email','From Name','Email from name',6,0,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (57,'smtp_from_email','info@realestate.co.ke','email','email','From Email','Email from address',7,0,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `settings` VALUES (58,'session_timeout_minutes','60','number','security','Session Timeout (minutes)','Admin session idle timeout in minutes',1,0,'2026-09-02 09:32:22','2026-09-02 09:32:22');
INSERT INTO `settings` VALUES (59,'max_login_attempts','5','number','security','Max Login Attempts','Maximum failed login attempts before lockout',2,0,'2026-09-02 09:32:22','2026-09-02 09:32:22');
INSERT INTO `settings` VALUES (60,'lockout_duration_minutes','15','number','security','Lockout Duration (minutes)','How long an account stays locked after failed attempts',3,0,'2026-09-02 09:32:22','2026-09-02 09:32:22');
INSERT INTO `settings` VALUES (61,'require_strong_passwords','true','boolean','security','Require Strong Passwords','Enforce uppercase, lowercase, number, and special character',4,0,'2026-09-02 09:32:22','2026-09-02 09:32:22');
INSERT INTO `settings` VALUES (62,'enable_two_factor','true','boolean','security','Enable 2FA','Require two-factor authentication for admin logins',5,0,'2026-09-02 09:32:22','2026-09-07 08:14:14');
INSERT INTO `settings` VALUES (63,'password_min_length','8','number','security','Password Minimum Length','Minimum length for new passwords',6,0,'2026-09-02 09:32:22','2026-09-02 09:32:22');
INSERT INTO `settings` VALUES (64,'force_password_reset_days','0','number','security','Force Password Reset (days)','Force password change every N days (0 = never)',7,0,'2026-09-02 09:32:22','2026-09-02 09:32:22');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `social_links`
--

DROP TABLE IF EXISTS `social_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `social_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `platform` varchar(50) NOT NULL,
  `url` varchar(500) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_platform` (`platform`),
  KEY `idx_active` (`is_active`),
  KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `social_links`
--

LOCK TABLES `social_links` WRITE;
/*!40000 ALTER TABLE `social_links` DISABLE KEYS */;
INSERT INTO `social_links` VALUES (1,'WhatsApp','https://wa.me/254700000001','WhatsApp',1,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `social_links` VALUES (2,'Facebook','https://facebook.com/primerealtykenya','Facebook',2,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `social_links` VALUES (3,'Instagram','https://instagram.com/primerealtykenya','Instagram',3,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `social_links` VALUES (4,'TikTok','https://tiktok.com/@primerealtykenya','TikTok',4,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `social_links` VALUES (5,'YouTube','https://youtube.com/primerealtykenya','YouTube',5,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `social_links` VALUES (6,'LinkedIn','https://linkedin.com/company/primerealtykenya','LinkedIn',6,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `social_links` VALUES (7,'X','https://x.com/primerealtykenya','Twitter',7,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `social_links` VALUES (8,'Telegram','https://t.me/primerealtykenya','Telegram',8,1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
/*!40000 ALTER TABLE `social_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testimonials`
--

DROP TABLE IF EXISTS `testimonials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `testimonials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `rating` tinyint(3) unsigned DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `property_id` int(11) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_rating` (`rating`),
  KEY `idx_sort` (`sort_order`),
  KEY `idx_property` (`property_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `testimonials_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `testimonials_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testimonials`
--

LOCK TABLES `testimonials` WRITE;
/*!40000 ALTER TABLE `testimonials` DISABLE KEYS */;
INSERT INTO `testimonials` VALUES (1,NULL,'Wanjiru Mwangi','wanjiru@example.com','+254 712 345 678',5,'Excellent Service!','Prime Realty helped me find the perfect home for my family in Karen. The entire process was smooth and professional. Highly recommended!',NULL,'approved',1,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `testimonials` VALUES (2,NULL,'James Ochieng','james@example.com','+254 733 456 789',5,'Outstanding!','Sold my villa in Mombasa through Prime Realty. They handled everything with professionalism and got me a great deal. Will definitely use again.',NULL,'approved',2,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `testimonials` VALUES (3,NULL,'Mary Atieno','mary@example.com','+254 722 345 678',4,'Very Professional','The team at Prime Realty made buying my first home a breeze. Great communication and expert guidance throughout.',NULL,'approved',3,'2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `testimonials` VALUES (4,NULL,'Peter Mutua','peter@example.com','+254 744 567 890',5,'Amazing Experience','I was able to sell my commercial property quickly thanks to Prime Realty. Their marketing reached the right buyers.',NULL,'approved',4,'2026-08-26 09:37:01','2026-08-26 09:37:01');
/*!40000 ALTER TABLE `testimonials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role` (`user_id`,`role_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_role` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,6,7,'2026-09-08 06:46:00');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) DEFAULT 7,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `phone_verified` tinyint(1) DEFAULT 0,
  `password_hash` varchar(255) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','suspended','banned') DEFAULT 'active',
  `email_verified` tinyint(1) DEFAULT 0,
  `email_verification_token` varchar(255) DEFAULT NULL,
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `login_attempts` int(11) DEFAULT 0,
  `lockout_until` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `remember_token` varchar(255) DEFAULT NULL,
  `remember_token_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role_id`),
  KEY `idx_status` (`status`),
  KEY `idx_last_login` (`last_login`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'Super Administrator','admin@realestate.co.ke','+254700000001',0,'$argon2id$v=19$m=65536,t=4,p=3$ejBSTlluOUxpSjBmRHhYVw$DX6Q6GxSBF5O0/akzbBbJZIr4+h4oP2BOmxyseorfAQ',NULL,'active',1,NULL,NULL,NULL,'2026-09-08 09:21:02',0,NULL,'2026-08-26 09:37:01','2026-09-08 09:21:02','f88b3a213827d017e88f2c4e134765463171aacab6472fb40c3cde46dd4e08c9','2026-10-08 11:21:02');
INSERT INTO `users` VALUES (2,3,'Alice Wanjiru','alice@example.com','+254711111222',1,'$2y$10$2M4qSHP2ZWRM8ZKi0s0bGeDgnLgnb/AB/Y8g.eNsrSk9TJU/dLGEm',NULL,'active',1,NULL,NULL,NULL,'2026-09-02 09:39:50',0,NULL,'2026-08-26 09:37:01','2026-09-07 01:53:48',NULL,NULL);
INSERT INTO `users` VALUES (3,7,'Bob Ochieng','bob@example.com','+254 722 222 333',1,'$2y$10$2M4qSHP2ZWRM8ZKi0s0bGeDgnLgnb/AB/Y8g.eNsrSk9TJU/dLGEm',NULL,'active',1,NULL,NULL,NULL,'2026-09-07 18:42:39',0,NULL,'2026-08-26 09:37:01','2026-09-07 18:42:39',NULL,NULL);
INSERT INTO `users` VALUES (4,7,'Carol Atieno','carol@example.com','+254 733 333 444',1,'$2y$10$2M4qSHP2ZWRM8ZKi0s0bGeDgnLgnb/AB/Y8g.eNsrSk9TJU/dLGEm',NULL,'active',1,NULL,NULL,NULL,NULL,0,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01',NULL,NULL);
INSERT INTO `users` VALUES (5,7,'David Mutua','david@example.com','+254 744 444 555',1,'$2y$10$2M4qSHP2ZWRM8ZKi0s0bGeDgnLgnb/AB/Y8g.eNsrSk9TJU/dLGEm',NULL,'active',1,NULL,NULL,NULL,NULL,0,NULL,'2026-08-26 09:37:01','2026-08-26 09:37:01',NULL,NULL);
INSERT INTO `users` VALUES (6,7,'charles','admin@joyvista.com','+254111323452',0,'$argon2id$v=19$m=65536,t=4,p=3$N2s5MXl6MTNYTkFRYnNOcw$45CTQbCTPOzpq7FRJx7z22J25g1XeUVPrujUSF4DIow',NULL,'active',0,'16fcabf94f469050631da3fd74a46811b8a192ad14ef7a46d03dc201626cfbf9',NULL,NULL,'2026-09-08 06:46:17',0,NULL,'2026-09-08 06:46:00','2026-09-08 06:48:07',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `viewing_requests`
--

DROP TABLE IF EXISTS `viewing_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `viewing_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `preferred_date` date DEFAULT NULL,
  `preferred_time_start` time DEFAULT NULL,
  `preferred_time_end` time DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` enum('Pending','Confirmed','Rescheduled','Completed','Cancelled') DEFAULT 'Pending',
  `assigned_agent` int(11) DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_property` (`property_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_agent` (`assigned_agent`),
  KEY `idx_date` (`preferred_date`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `viewing_requests_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `viewing_requests_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `viewing_requests_ibfk_3` FOREIGN KEY (`assigned_agent`) REFERENCES `agents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `viewing_requests`
--

LOCK TABLES `viewing_requests` WRITE;
/*!40000 ALTER TABLE `viewing_requests` DISABLE KEYS */;
INSERT INTO `viewing_requests` VALUES (1,1,2,'Alice Wanjiru','alice@example.com','+254 711 111 222','2024-04-15','10:00:00','11:00:00','Would prefer morning viewing please','Pending',1,'','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `viewing_requests` VALUES (2,2,3,'Bob Ochieng','bob@example.com','+254 722 222 333','2024-04-12','14:00:00','15:00:00','Available anytime in the afternoon','Confirmed',1,'Agent assigned - confirmed via WhatsApp','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `viewing_requests` VALUES (3,3,4,'Carol Atieno','carol@example.com','+254 733 333 444','2024-04-20','09:00:00','10:00:00','','Pending',2,'','2026-08-26 09:37:01','2026-08-26 09:37:01');
INSERT INTO `viewing_requests` VALUES (4,1,NULL,'Test User','test@test.com','+254712345678','2026-09-10',NULL,NULL,'','Pending',NULL,NULL,'2026-09-06 12:07:13','2026-09-06 12:07:13');
INSERT INTO `viewing_requests` VALUES (5,1,NULL,'Test User','test@test.com','+254712345678','2026-09-10',NULL,NULL,'','Pending',NULL,'','2026-09-06 12:32:30','2026-09-06 14:40:59');
INSERT INTO `viewing_requests` VALUES (6,6,1,'charles','bundicharles37@gmail.com','+254111323452','2026-09-13',NULL,NULL,'','Confirmed',1,'','2026-09-06 12:51:14','2026-09-06 14:41:16');
INSERT INTO `viewing_requests` VALUES (8,1,1,'Super Administrator','admin@realestate.co.ke','+254700000001','2026-09-08',NULL,NULL,'hghh','Pending',NULL,NULL,'2026-09-07 14:20:50','2026-09-07 14:20:50');
INSERT INTO `viewing_requests` VALUES (9,1,1,'vvvv','admin@realestate.co.ke','+254700000001','2026-09-08',NULL,NULL,'vvv','Pending',NULL,NULL,'2026-09-07 14:23:01','2026-09-07 14:23:01');
INSERT INTO `viewing_requests` VALUES (10,1,1,'vvvvvv','admin@realestate.co.ke','+254700000001','2026-09-08',NULL,NULL,'vvvvvv','Pending',NULL,NULL,'2026-09-07 14:23:24','2026-09-07 14:23:24');
/*!40000 ALTER TABLE `viewing_requests` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-08 15:31:12
