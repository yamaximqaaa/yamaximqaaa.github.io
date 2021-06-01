<?php

if ( $_SERVER['REQUEST_METHOD'] == 'GET' )
  include 'get.php';
else
if ( $_SERVER['REQUEST_METHOD'] == 'POST' )
  include 'post.php';

?>
