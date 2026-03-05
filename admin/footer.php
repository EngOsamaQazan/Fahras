<?php
if (!isset($token)) {
  http_response_code(403);
  exit('');
}
?>
  <footer class="footer hidden-print">
    <div class="container">
      <p class="text-muted">
        <a href="https://fb.com/mujeer.world" target="_blank"><?=_e('Made with')?> <i class="red fa fa-heart"></i> <?=_e('by MÜJEER')?></a>
          <span class="pull-right">&copy; <?=_e('Fahras')?> <?=date('Y')?></span>
        </p>
    </div>
  </footer>
  
	<?=Xcrud::load_js()?>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
	<link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.3/css/select2.min.css" rel="stylesheet" type="text/css" />
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.3/js/select2.full.min.js"></script>
	<script type="text/javascript">

		jQuery(document).on("xcrudbeforerequest", function(event, container) {
		    if (container) {
		        jQuery(container).find("select").select2("destroy");
		    } else {
		        jQuery(".xcrud").find("select").select2("destroy");
		    }
		});
		jQuery(document).on("ready xcrudafterrequest", function(event, container) {

		    if (container) {
		        jQuery(container).find("select").select2({theme: "bootstrap", dir: "<?=_e('ltr')?>"});
		    } else {
		        jQuery(".xcrud").find("select").select2({theme: "bootstrap", dir: "<?=_e('ltr')?>"});
		    }
		});
		jQuery(document).on("xcrudbeforedepend", function(event, container, data) {
		    jQuery(container).find('select[name="' + data.name + '"]').select2("destroy");
		});
		jQuery(document).on("xcrudafterdepend", function(event, container, data) {
		    jQuery(container).find('select[name="' + data.name + '"]').select2({theme: "bootstrap", dir: "<?=_e('ltr')?>"});
		});
	</script>    
  </body>
</html>