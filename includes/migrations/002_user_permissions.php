<?php
/**
 * Migration 002: Direct user permissions table.
 * Allows assigning permissions directly to users (on top of role permissions).
 *
 * Safe to run multiple times.
 * Run: php includes/migrations/002_user_permissions.php
 */

require_once __DIR__ . '/../smplPDO.php';

$db = new smplPDO("mysql:host=localhost;dbname=fahras_db", "root", "");

echo "=== Migration 002: User Direct Permissions ===\n\n";

$db->exec("CREATE TABLE IF NOT EXISTS `user_has_permissions` (
    `user_id` INT NOT NULL,
    `permission_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`user_id`, `permission_id`),
    CONSTRAINT `uhp_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `uhp_perm_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

echo "Table user_has_permissions: OK\n";

$c = $db->prepare("SELECT COUNT(*) FROM user_has_permissions"); $c->execute();
echo "Direct permission mappings: " . $c->fetchColumn() . "\n";
echo "\n=== Migration 002 complete! ===\n";
