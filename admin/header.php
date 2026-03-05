<?php
if (!isset($token)) {
    http_response_code(403);
    exit('');
}

$admin = 1;

require_once __DIR__ . '/../includes/bootstrap.php';

require_auth();

include __DIR__ . '/xcrud/xcrud.php';

$user = auth_user();
setcookie('language', $user['language'] ?? 'ar', time() + (86400 * 30), "/");

$lang = $user['language'] ?? 'ar';
?>
<!DOCTYPE html>
<html lang="<?= $lang ?>">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="<?= csrf_token() ?>">
    <title><?=_e('Fahras')?> - <?=_e($page_title ?? 'Dashboard')?></title>
    <link rel="icon" href="/admin/img/fahras-logo.png" type="image/png">
    <link href="https://iweb.ps/fs/css/all.css" rel="stylesheet">
    <?php if ($lang == 'ar') { ?>
    <link rel="stylesheet" href="https://cdn.rtlcss.com/bootstrap/3.3.7/css/bootstrap.min.css"
          integrity="sha384-cSfiDrYfMj9eYCidq//oGXEkMc0vuTxHXizrMOFAaPsLt1zoCUVnSsURN+nef1lj"
          crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" href="/admin/css/rtl.css?ver=<?=time()?>">
    <?php } else { ?>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
          integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
          crossorigin="anonymous">
    <?php } ?>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
    <link rel="stylesheet" type="text/css" href="/admin/css/select2-bootstrap.min.css">
    <?=Xcrud::load_css()?>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.5.1/dist/chart.min.js"></script>
    <link rel="stylesheet" type="text/css" href="/admin/css/custom.css?ver=<?=time()?>">
    <?php if ($lang == 'ar') { ?>
    <link rel="stylesheet" type="text/css" href="/admin/css/rtl.css?ver=<?=time()?>">
    <?php } ?>
    <link rel="stylesheet" type="text/css" href="/admin/css/dark-theme.css?ver=<?=time()?>">
  </head>
  <body>
	<nav class="navbar navbar-inverse">
	  <div class="container">
	    <div class="navbar-header">
	      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#main-navbar" aria-expanded="false">
	        <span class="sr-only">Toggle navigation</span>
	        <span class="icon-bar"></span>
	        <span class="icon-bar"></span>
	        <span class="icon-bar"></span>
	      </button>
	      <a class="navbar-brand" href="/admin"><b><?=_e('Fahras')?></b></a>
	    </div>

	    <div class="collapse navbar-collapse" id="main-navbar">
	      <ul class="nav navbar-nav">
            <?php if (user_can('dashboard', 'view')) { ?>
            <li><a href="/admin"><i class="fal fa-search"></i> <?=_e('Home')?></a></li>
            <?php } ?>
            <?php if (user_can('clients', 'view')) { ?>
            <li><a href="clients"><i class="fal fa-users"></i> <?=_e('Clients')?></a></li>
            <?php } ?>
            <?php if (user_can('jobs', 'view')) { ?>
            <li><a href="jobs"><i class="fal fa-briefcase"></i> <?=_e('Jobs')?></a></li>
            <?php } ?>
            <?php if (user_can('import', 'execute')) { ?>
            <li><a href="import"><i class="fal fa-upload"></i> <?=_e('Import Tool')?></a></li>
            <?php } ?>
            <?php if (user_can('violations', 'view')) { ?>
            <li><a href="violations"><i class="fal fa-exclamation-triangle"></i> <?=_e('Violations')?></a></li>
            <?php } ?>
            <?php if (user_can('accounts', 'view')) { ?>
            <li><a href="accounts"><i class="fal fa-briefcase"></i> <?=_e('Accounts')?></a></li>
            <?php } ?>
            <?php if (user_can('users', 'view')) { ?>
            <li><a href="users"><i class="fal fa-key"></i> <?=_e('Users')?></a></li>
            <?php } ?>
            <?php if (user_can('roles', 'view')) { ?>
            <li><a href="roles"><i class="fal fa-shield-alt"></i> <?=_e('Roles')?></a></li>
            <?php } ?>
            <?php if (user_can('scan', 'view')) { ?>
            <li><a href="scan"><i class="fal fa-radar"></i> <?=_e('Scan')?></a></li>
            <?php } ?>
            <?php if (user_can('reports', 'view')) { ?>
            <li><a href="monthly-report"><i class="fal fa-chart-bar"></i> <?=_e('Reports')?></a></li>
            <?php } ?>
            <?php if (user_can('sales_report', 'view')) { ?>
            <li><a href="sales-report"><i class="fal fa-chart-line"></i> <?=_e('Sales Report')?></a></li>
            <?php } ?>
            <?php if (user_can('activity_log', 'view')) { ?>
            <li><a href="activity-log"><i class="fal fa-history"></i> <?=_e('Activity Log')?></a></li>
            <?php } ?>
	      </ul>
        <ul class="nav navbar-nav navbar-right">
          <?php if ($lang == 'en') { ?>
          <li><a href="?lang=ar"><i class="fal fa-flag"></i> العربية</a></li>
          <?php } else { ?>
          <li><a href="?lang=en"><i class="fal fa-flag"></i> English</a></li>
          <?php } ?>
          <li><a href="/admin/logout"><i class="fal fa-sign-out"></i> <?=_e('Logout')?></a></li>
        </ul>
	    </div>
	  </div>
	</nav>
