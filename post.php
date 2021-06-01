<?php

//******************************************************************************

include 'user.php';

include 'db.php';

//******************************************************************************

// import/export types
define('_json_', 1);
define('_csv_',  2);
define('_tsv_',  3);

//******************************************************************************
//
// makes/drops/seeds/wipes data table

function deal_with_table ( $mysqli, $query, $done )
{
  if ( $rslt = $mysqli->query($query) )
    return '`cinema` table successfully ' . $done;
  else
    return show_error($mysqli);
}

//******************************************************************************
//
// checks field value

function check_field ( $data )
{
$err
  = null;

$fldNo
  = 0;
  // checking field for emptiness
  foreach ( $data as $fld => $val )
    if ( $fldNo++ && $val == '' )
      $err .= 'error : field ' . "'" . $fld . "'" . ' mustn\'t be empty' . '<br>';

  // checking field for righteousness
  if ( ! preg_match('/(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d/', $data['startDt']) )
      $err .= 'wrong field ' . "'startDt'" . ' : invalid Starting Date (MMMM/dd/YYYY) : ' . "'" . $data['startDt'] . "'" . '<br>';
  if ( ! preg_match('/^[+]?\d+([.]\d+)?$/', $data['plcsCnt']) )
      $err .= 'wrong field ' . "'plcsCnt'" . ' : invalid places count (number >= 0) : ' . "'" . $data['plcsCnt'] . "'" . '<br>';
  if ( ! preg_match('/^[+]?\d+([.]\d+)?$/', $data['scrnsCnt']) )
      $err .= 'wrong field ' . "'scrnsCnt'" . ' : invalid screens count (number >= 0) : ' . "'" . $data['scrnsCnt'] . "'" . '<br>';

  return $err;
}

//******************************************************************************
//
// saves object data by id

function save_item ( $mysqli, $data )
{
  // checking field values
  if ( $err = check_field($data) )
    return 'error(s) :' . '<br>' . $err;

$errs
  ='';

  // saving record
  if ( $stmt = $mysqli->prepare(_tbl_replace_) )
  {
    $stmt->bind_param('sssssss', 
    $data['name'], $data['addr'], $data['startDt'], $data['plcsCnt'], $data['scrnsCnt'],
    $data['tech'], $data['threeD']);

    if ( $stmt->execute() )
    {
      if ( ! $stmt->affected_rows )
        $errs = 'error : no rows affected';
    }
    else
      $errs = show_error($mysqli, $stmt);

    $stmt->close();
  }
  else
    $errs = show_error($mysqli);

  return $errs;
}

//******************************************************************************
//
// deletes object by id

function del_item ( $mysqli, $data )
{
$errs
  ='';

  if ( $stmt = $mysqli->prepare(_tbl_delete_) )
  {
    $stmt->bind_param('d', $id);
    $id = $data[_id_];

    if ( $stmt->execute() )
    {
      if ( ! $stmt->affected_rows )
        $errs = 'error : no rows affected';
    }
    else
      $errs = show_error($mysqli, $stmt);

    $stmt->close();
  }
  else
    $errs = show_error($mysqli);

  return $errs;
}

//******************************************************************************
//
// sends data as json/csv/tsv to client

function save_list ( $mysqli, $type )
{
  if ( $stmt = $mysqli->prepare(_tbl_select_) )
  {
  $ok
    = $stmt->execute();

    if ( $ok )
    {

      switch ( $type )
      {
      case _json_ :
        header('Content-Type: text/json');
        header('Content-disposition: attachment;filename="' . _grp_ . '-' . _var_ . '.json"');

        $data = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
      break;

      case _csv_ :
      case _tsv_ :
      {
        header('Content-Type: text/csv');
        header('Content-disposition: attachment;filename="' . _grp_ . '-' . _var_ . '.' . ($type == _csv_ ? 'csv' : 'tsv') . '"');

      $sep
        = ($type == _csv_ ? ',' : "\t");
        $data = $stmt->result_metadata()->fetch_fields();
        for ( $fldNo = 0; $fldNo < count($data); $fldNo++ )
        {
        $esc
          = ($type == _csv_ && strpos($data[$fldNo]->name, ' ') !== false ? '"' : '');
          echo $esc. $data[$fldNo]->name . $esc . ($fldNo < count($data) - 1 ? $sep : "\r\n");
        }
        $data = $stmt->get_result()->fetch_all(MYSQLI_NUM);
        for ( $recNo = 0; $recNo < count($data); $recNo++ )
          for ( $fldNo = 0; $fldNo < count($data[$recNo]); $fldNo++ )
          {
          $esc
            = ($type == _csv_ && strpos($data[$recNo][$fldNo], ' ') !== false ? '"' : '');
            echo $esc . $data[$recNo][$fldNo] . $esc . ($fldNo < count($data[$recNo]) - 1 ? $sep : "\r\n");
          }
      }
      break;
      }

    }
    else
      echo show_error($mysqli, $stmt);
  }
  else
    echo show_error($mysqli);
}

//******************************************************************************
//
// receives data as csv/tsv from client

function load_list ( $mysqli, $fields )
{
  if ( ! (count($_FILES) && isset($_FILES['csvi'])) )
  // no file
  {
    echo 'error ' . 'no csv file';
    return;
  }

$file
  = $_FILES['csvi'];
  if ( $file['error'] != 0 )
  // error uploading file
  {
    echo 'error ' . $file['error'] . ' uploading file';
    return;
  }
  if ( ! move_uploaded_file($file['tmp_name'], './' . $file['name']) )
  // error moving uploaded file
  {
    echo 'error moving file';
    return;
  }

$ids
  = array();

$errs
  = '';

  if ( ($hndl = fopen('./' . $file['name'], 'r')) !== false )
  // processing file
  {
  $head
    = trim(fgets($hndl));
  $sep
    = (strpos($head, "\t") !== false ? "\t" : ',');
    $head = explode($sep, $head);
  $idxs
    = array();
    // processing head row
    foreach ( $fields as $fld )
      if ( ($idx = array_search($fld[0], $head)) !== false )
        array_push($idxs, $idx);
      else
      {
        $errs .= 'error : ' . 'field ' . "'" . $fld[0] . "'" . ' not found in file';
        break;
      }

    // processing data rows
    for ( $rowNo = 0; ! $errs && ($vals = fgetcsv($hndl, 1024, $sep)) !== false; $rowNo++ )
    {
    $data
      = array();
      for ( $fldNo = 0; $fldNo < count($vals); $fldNo++ )
        $data[$fields[$fldNo][1]] = $vals[$idxs[$fldNo]];

      // checking field values
      if ( $err = check_field($data) )
      {
        $errs .= 'line ' . ($rowNo + 1) . ' : ' . $err;
        break;
      }

      if ( $stmt = $mysqli->prepare(_tbl_insert_) )
      {
        $stmt->bind_param('sssssss', 
    $data['name'], $data['addr'], $data['startDt'], $data['plcsCnt'], $data['scrnsCnt'],
    $data['tech'], $data['threeD']);

        if ( $stmt->execute() )
        {
          if ( $stmt->affected_rows )
            array_push($ids, array(_id_ => $data[_id_]));
          else
            $errs .= 'no rows affected';
        }
        else
          $errs .= show_error($mysqli, $stmt);

        $stmt->close();

        if ( $errs )
          break;
      }
      else
      {
        $errs .= show_error($mysqli);
        break;
      }
    }
    fclose($hndl);
  }

  unlink('./' . $file['name']);

  if ( $errs )
  // deleting records
    foreach ( $ids as $id )
      del_item($mysqli, $id);

  echo $errs ? 'error(s) :' . '<br>' . $errs : 'ok';
}

//******************************************************************************
//******************************************************************************
//******************************************************************************

  if ( count($_POST) == 0 )
  //  no command
  {
    echo 'error : empty command';
    return;
  }

// checking command

$deal
  = null;
$deals
  = array ( 'make', 'drop', 'seed', 'wipe', 'save', 'del', 'csvi', 'json', 'csvo', 'tsvo' );
  foreach ( $deals as $name )
    if ( isset($_POST[$name]) )
    {
      $deal = $name;
      break;
    }

  if ( ! $deal )
  // unknown command
  {
    echo 'error : unrecognized command ' . "'" . http_build_query($_POST) . "'";
    exit;
  }

@$mysqli
  = new mysqli('localhost', _db_user_, _db_pswd_, _db_name_);

  if ( ! $mysqli->connect_errno )
  // go workin' nigga
  {

    switch ( $deal )
    {
    case 'make' : echo deal_with_table($mysqli, _tbl_make_, 'made'); break;
    case 'drop' : echo deal_with_table($mysqli, _tbl_drop_, 'dropped'); break;

    case 'wipe' : echo deal_with_table($mysqli, _tbl_wipe_, 'wiped'); break;
    case 'seed' : echo deal_with_table($mysqli, _tbl_seed_, 'seeded'); break;

    case 'save' : echo save_item($mysqli, $_POST); break;
    case 'del'  : echo del_item($mysqli, $_POST); break;

    case 'csvi' : load_list($mysqli, $fields); break;
    case 'json' : save_list($mysqli, _json_); break;
    case 'csvo' : save_list($mysqli, _csv_); break;
    case 'tsvo' : save_list($mysqli, _tsv_); break;
    }

    $mysqli->close();
  }
  else
    echo show_error($mysqli);

return;

//******************************************************************************

?>
