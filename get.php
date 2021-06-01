<?php

//******************************************************************************

include 'user.php';

include 'db.php';

//******************************************************************************
//
// checks if data table exists
date_default_timezone_set('Europe/Kiev');
ob_start();
$start_time = microtime(true);

function check_table ( $mysqli )
{
  if ( $rslt = $mysqli->query(_tbls_show_) )
  {
    for ( $tbls = 0; $row = $rslt->fetch_row(); $tbls++ )
      if ( $row[0] == _tbl_name_ )
        return true;
  }
  else
    show_error($mysqli);

  return false;
}

//******************************************************************************
//
// shows object list

function list_data ( $mysqli, $fields )
{
  if ( $stmt = $mysqli->prepare(_tbl_select_) )
  {

?>

<table id='list'>
  <tr onclick='select_item(event);'>

<?php

        foreach ( $fields as $fld )
        // showing column heads
        {
?>
    <th><?=$fld[_fld_head_]?></th>
<?php
        }

?>

  </tr>

<?php

  $ok
    = $stmt->execute();
    if ( $ok )
    // selecting data
    {

    $vals
      = array();
      $stmt->bind_result
      (
        $vals[$fields[0][_fld_fld_]], $vals[$fields[1][_fld_fld_]], $vals[$fields[2][_fld_fld_]],
        $vals[$fields[3][_fld_fld_]], $vals[$fields[4][_fld_fld_]], $vals[$fields[5][_fld_fld_]],
        $vals[$fields[6][_fld_fld_]], $vals[$fields[7][_fld_fld_]]
      );

      for ( $max_id = 0; $stmt->fetch(); )
      // walking through records
      {
        if ( $vals[$fields[0][_fld_fld_]] > $max_id )
          $max_id = $vals[$fields[0][_fld_fld_]];

?>
  <tr id='id_<?=$vals[$fields[0][_fld_fld_]]?>' onmousedown='event.preventDefault(); select_item(event);'>
<?php

        foreach ( $fields as $fld )
        // walking through fields
        {
?>
    <td fld='<?=$fld[_fld_fld_]?>'><?=$vals[$fld[_fld_fld_]]?></td>
<?php
        }

?>
  </tr>
<?php

      }

    }
    else
      return show_error($mysqli, $stmt);

    $stmt->close();

?>

  <tr id='id_0'>

<?php

    foreach ( $fields as $fld )
    // adding empty row for new record
    {
?>
    <td fld='<?=$fld[_fld_fld_]?>' class=''><?php if ( $fld[_fld_fld_] == _id_ ) echo ($max_id + 1); ?></td>
<?php

    }
?>

  </tr>
</table>

<?php

  }
  else
    show_error($mysqli);

}

//******************************************************************************
//
// shows object fields

function show_fields ( $data_table, $fields )
{

?>

<form name='fields'>

<?php

  if ( $data_table )
  {

?>

<table>
  <tr>
    <td>

<table id='dtls'>

<?php

  foreach ( $fields as $fld )
  // adding input fields
  {

?>
  <tr>
    <td><?=$fld[_fld_head_]?></td>
    <td><input name='<?=$fld[_fld_fld_]?>' type='text' <?php if ( $fld[_fld_edit_] ) { ?> maxlength=<?=$fld[_fld_len_]?> oninput='change_item(event);' <?php } else { ?> readonly=''<?php } ?>></td>
  </tr>
<?php

  }

?>

</table>

    </td>
    <td>

<table class='ctrl'>
  <tr><td><input name='save' type='button' value='Save item' accesskey='S' onclick='save_item(event);'></td></tr>
  <tr><td><input name='back' type='button' value='Revert item' onclick='select_item(event);'></td></tr>
  <tr><td><input name='del' type='button' value='Delete item' onclick='del_item(event);'></td></tr>
  <tr><td><input name='add' type='button' value='Add item' addval='Add item' unaddval='Unadd item' onclick='select_item(event);'></td></tr>
</table>

    </td>

    <td>

<table class='load'>
  <tr><td>
    <input name='csvi' type='file' hidden onchange='send_req(event);'>
    <input name='csv' type='button' value='Upload as CSV' onclick='this.form["csvi"].click();'>
  </td></tr>
  <tr><td><input name='json' type='button' value='Download as JSON' onclick='send_req(event);'></td></tr>
  <tr><td><input name='csvo' type='button' value='Download as CSV' onclick='send_req(event);'></td></tr>
  <tr><td><input name='tsvo' type='button' value='Download as TSV' onclick='send_req(event);'></td></tr>
</table>

    </td>

  </tr>
</table>

  <input name='seed' type='button' value='Seed data table' onclick='send_req(event);'>
  <input name='wipe' type='button' value='Wipe data table' onclick='wipe_table(event);'>
  <input name='drop' type='button' value='Drop data table' onclick='drop_table(event);'>

<?php

  }
  else
  {

?>

  <input name='make' type='button' value='Make data table' onclick='send_req(event);'>

<?php

  }

?>

  <div><div id='log'></div></div>

</form>

<?php

}

//******************************************************************************
//
// html

?>

<html>

<head>

<meta http-equiv='content-type' content='text/html; charset=utf-8' />
<link rel='icon' href='../<?=_grp_?>.png'>
<link rel='stylesheet' href='./get.css' type='text/css' />
<script type='text/javascript' src='./get.js' charset='utf-8'></script>

<title>Р К-П ПО, гр. БС-<?=_grp_?>, вар. <?=_var_?>, л.р. № 4</title>

</head>

<body onload='page_loaded(event);'>

  <span id='badxhr' style='display : none;'>Не удалось создать запрос.\n\nВозможно, это связано с некорректной работой браузера.\n</span>
  <span id='sentok' style='display : none;'>Данные отправлены.\n</span>
  <span id='senderr' style='display : none;'>Во время отправки данных произошла ошибка.\n\nПопробуйте повторить операцию.\n</span>

Группа БС-<?=_grp_?>, вариант <?=_var_?>, <?=_authname_?>
<hr>
Ваш IP-адрес : <?=$_SERVER['REMOTE_ADDR']?>, текущие дата и время : <?=date('m/d/Y h:i', time())?>, страница сформирована за : <?php echo $endTime?> сек
<hr>

<?php

//******************************************************************************
//
// + content

@$mysqli
  = new mysqli('localhost', _db_user_, _db_pswd_, _db_name_);

  if ( ! $mysqli->connect_errno )
  {
  $data_table
    = check_table($mysqli);

    if ( $data_table )
      list_data($mysqli, $fields);

    $mysqli->close();

    show_fields($data_table, $fields);
  }
  else
  {
?>

  <div><div id='log' class='show'>

<?php
    echo show_error($mysqli);
?>

  </div></div>

<?php
  }

// - content
//
//******************************************************************************

?>

</body>

</html>

<?php

ob_end_flush();
ob_flush();
$endTime = microtime(TRUE) - $start_time;

//******************************************************************************

?>
