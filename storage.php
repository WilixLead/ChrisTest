<?php 
if( !empty($_POST['save']) ){
  if( file_put_contents('./params.json', json_encode($_POST['save'])) )
    echo 'ok';
}else{
  echo file_get_contents('./params.json');
}