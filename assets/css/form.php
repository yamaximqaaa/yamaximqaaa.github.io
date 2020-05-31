<?php
  session_start();
  $_SESSION["email"] = $_POST["email"];
  header("Location: ".$_SERVER["HTTP_REFERER"]);
  exit;
?>