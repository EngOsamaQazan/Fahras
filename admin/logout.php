<?php
require_once __DIR__ . '/../includes/bootstrap.php';
log_activity('logout');
auth_logout();
header('Location: /admin/login');
exit;
