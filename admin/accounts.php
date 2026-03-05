<?php
	$page_title = 'Accounts';
	$token = 'mojeer';
	include 'header.php';
	require_permission('accounts', 'view');
?>

<style>
.xcrud-page {
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%);
    min-height: calc(100vh - 50px);
    margin: -20px -15px -60px;
    padding: 30px 20px 60px;
    color: #e0e6ed;
}
.xcrud-page-header {
    text-align: center;
    margin-bottom: 28px;
}
.xcrud-page-header h1 { color: #fff; font-size: 24px; font-weight: 800; margin: 0 0 6px; }
.xcrud-page-header p { color: rgba(255,255,255,0.4); font-size: 12px; margin: 0; }
.xcrud-page .container { max-width: 1100px; }
.xcrud-page-footer {
    background: rgba(0,0,0,0.2);
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 16px 0;
    margin-top: 40px;
    text-align: center;
    font-size: 12px;
    color: rgba(255,255,255,0.25);
}
.xcrud-page-footer a { color: rgba(255,255,255,0.35); text-decoration: none; }
.xcrud-page-footer a:hover { color: rgba(255,255,255,0.6); }
.xcrud-page-footer .fa-heart { color: #e53e3e; }
.xcrud-page ~ footer.footer { display: none !important; }
</style>

<div class="xcrud-page">
    <div class="container">
        <div class="xcrud-page-header">
            <h1><i class="fad fa-briefcase"></i> <?=_e($page_title)?></h1>
            <p><?=_e('Manage company accounts')?></p>
        </div>

	<?php
		if ($lang == 'en') {
			Xcrud_config::$is_rtl = 0;
		}
		$xcrud = Xcrud::get_instance();
		$xcrud->table('accounts');
		$xcrud->order_by('id','desc');
		$xcrud->language($user['language']);

		$xcrud->label(array(	
								'name' => _e('Account Name'),
								'phone' => _e('Phone'),
								'mobile' => _e('Mobile'),
								'address' => _e('Address'),
		));

		$xcrud->unset_view();

		if (!user_can('accounts', 'create')) $xcrud->unset_add();
		if (!user_can('accounts', 'edit'))   $xcrud->unset_edit();
		if (!user_can('accounts', 'delete')) $xcrud->unset_remove();

		echo $xcrud->render();
	?>

        <div class="xcrud-page-footer">
            <a href="https://fb.com/mujeer.world" target="_blank"><?=_e('Made with')?> <i class="fa fa-heart"></i> <?=_e('by MÜJEER')?></a>
            &nbsp;&middot;&nbsp;
            &copy; <?=_e('Fahras')?> <?=date('Y')?>
        </div>
    </div>
</div>

<?php include 'footer.php'; ?>
