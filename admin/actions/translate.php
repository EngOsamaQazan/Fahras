<?php
require_once __DIR__ . '/../../includes/bootstrap.php';

if (!auth_check() || !user_can('translate', 'edit')) {
    http_response_code(403);
    exit;
}

$allowed_fields = ['ar', 'en'];
$field = $_POST['field'] ?? '';
$value = $_POST['value'] ?? '';
$id    = (int)($_POST['id'] ?? 0);

if (!in_array($field, $allowed_fields) || $id < 1) {
    http_response_code(400);
    exit;
}

$db->update('translate', [$field => $value], ['id' => $id]);
echo json_encode(['ok' => true]);
