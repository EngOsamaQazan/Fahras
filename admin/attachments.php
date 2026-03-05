<?php
require_once __DIR__ . '/../includes/bootstrap.php';

if (!auth_check()) {
    http_response_code(403);
    exit;
}

$client_id = (int)($_GET['client'] ?? 0);
if ($client_id < 1) {
    exit;
}

$result = $db->get_all('attachments', ['client' => $client_id]);

foreach ($result as $key) {
    echo '<img src="/uploads/' . htmlspecialchars($key['image'], ENT_QUOTES, 'UTF-8') . '" />';
}
