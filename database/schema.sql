-- SA - San Pablo City Tourist Demographic System
-- MySQL Schema (XAMPP / MySQL)
-- Run this in phpMyAdmin (Import) or: mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS sanpy_tourism;
USE sanpy_tourism;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('business','admin') NOT NULL DEFAULT 'business',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `remarks` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- businesses
-- ----------------------------
DROP TABLE IF EXISTS `businesses`;
CREATE TABLE `businesses` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `permit_number` varchar(100) NOT NULL,
  `owner_name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `barangay` varchar(100) DEFAULT NULL,
  `contact_number` varchar(50) NOT NULL,
  `permit_file_url` varchar(500) DEFAULT NULL,
  `valid_id_url` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_permit` (`permit_number`),
  CONSTRAINT `fk_businesses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- guest_records
-- ----------------------------
DROP TABLE IF EXISTS `guest_records`;
CREATE TABLE `guest_records` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `business_id` int unsigned NOT NULL,
  `check_in` date NOT NULL,
  `check_out` date NOT NULL,
  `nationality` varchar(100) NOT NULL,
  `gender` enum('male','female','other','prefer_not_to_say') NOT NULL,
  `age` tinyint unsigned NOT NULL,
  `transportation_mode` enum('private_car','bus','van','motorcycle','plane','other') NOT NULL,
  `purpose` enum('leisure','business','event','others') NOT NULL,
  `number_of_guests` smallint unsigned NOT NULL DEFAULT 1,
  -- new column stores details for each guest when individual demographics are recorded
  `guest_details` json DEFAULT NULL,
  `length_of_stay_days` smallint unsigned NOT NULL,
  `is_local_tourist` tinyint(1) NOT NULL DEFAULT 0,
  `festival_related` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business` (`business_id`),
  KEY `idx_check_in` (`check_in`),
  KEY `idx_nationality` (`nationality`),
  KEY `idx_month_year` (`check_in`),
  CONSTRAINT `fk_guest_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- monthly_submissions
-- ----------------------------
DROP TABLE IF EXISTS `monthly_submissions`;
CREATE TABLE `monthly_submissions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `business_id` int unsigned NOT NULL,
  `month` tinyint unsigned NOT NULL,
  `year` smallint unsigned NOT NULL,
  `status` enum('pending','submitted','locked') NOT NULL DEFAULT 'pending',
  `submitted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `business_month_year` (`business_id`,`month`,`year`),
  KEY `idx_month_year` (`month`,`year`),
  CONSTRAINT `fk_submission_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- messages
-- ----------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `sender_id` int unsigned NOT NULL,
  `receiver_id` int unsigned NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `read_status` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_receiver` (`receiver_id`),
  KEY `idx_sender` (`sender_id`),
  KEY `idx_read` (`receiver_id`,`read_status`),
  CONSTRAINT `fk_message_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_message_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- password_reset_tokens (forgot password)
-- ----------------------------
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_token` (`token`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `fk_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Seed one admin (password: Admin@123) - CHANGE IN PRODUCTION
-- INSERT INTO users (email, password_hash, role, status) VALUES
-- ('admin@tourism.sanpablo.gov.ph', '$2b$10$YourBcryptHashHere', 'admin', 'approved');
