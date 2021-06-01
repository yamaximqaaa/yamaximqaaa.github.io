<?php

//******************************************************************************
//
// fields : db name, html name, html title, maxlen, editable

// id field
define('_id_', 'id');

// table name
define('_tbl_name_', 'cinema');

// field metadata indices
define('_fld_name_', 0);
define('_fld_fld_',  1);
define('_fld_head_', 2);
define('_fld_len_',  3);
define('_fld_edit_', 4);

// field metadata
$fields
  = array
  (
    array ( _id_,       _id_  , 'Id'             ,    0, false ),
    array ( 'name', 'name', 'Name', 45, true  ),
    array ( 'address', 'addr', 'Address', 45, true  ),
    array ( 'startingDate', 'startDt', 'Starting Date', 45, true  ),
    array ( 'placesCount', 'plcsCnt', 'Places Count', 45, true  ),
    array ( 'screensCount', 'scrnsCnt', 'Screens Count', 45, true  ),
    array ( 'technology', 'tech', 'Technology', 45, true  ),
    array ( 'threeD', 'threeD', 'Three D', 45, true  )
  );

//******************************************************************************
//
// database queries

define('_tbls_show_', 'show tables');

define('_tbl_make_', '
create table `' . _tbl_name_ . '`
(
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `address` VARCHAR(45) NOT NULL,
  `startingDate` VARCHAR(45) NOT NULL,
  `placesCount` VARCHAR(45) NOT NULL,
  `screensCount` VARCHAR(45) NOT NULL,
  `technology` VARCHAR(45) NOT NULL,
  `threeD` VARCHAR(45) NOT NULL,
  primary key (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC)
)
engine=myisam
default charset=utf8;
');

define('_tbl_drop_', 'drop table `' . _tbl_name_ . '`');

define('_tbl_wipe_', 'delete from `' . _tbl_name_ . '`');

define('_tbl_seed_', "
insert into `" . _tbl_name_ . "` (`" . $fields[1][_fld_name_] . "`, `" . $fields[2][_fld_name_] . "`, `" . $fields[3][_fld_name_] . "`, `" . $fields[4][_fld_name_] . "`, `" . $fields[5][_fld_name_] . "`, `" . $fields[6][_fld_name_] . "`, `" . $fields[7][_fld_name_] . "`) values
('florence', 'troyeschina', '01/01/1991', '200', '5', '7d', '+');
");

define('_tbl_insrepl_', ' into `' . _tbl_name_ . '` (`name`, `address`, `startingDate`, `placesCount`, `screensCount`,
 `technology`, `threeD`) values (?, ?, ?, ?, ?, ?, ?)');

define('_tbl_insert_', 'insert' . _tbl_insrepl_);

define('_tbl_replace_', 'replace' . _tbl_insrepl_);

define('_tbl_delete_', 'delete from `' . _tbl_name_ . '` where `id` = ?');

define('_tbl_select_', 'select * from `' . _tbl_name_ . '` order by `id`');

//******************************************************************************
//
// returns mysqli or stmt error

function show_error ( $mysqli, $stmt = null )
{
  if ( ! $stmt )
    if ( $mysqli->connect_errno )
      return 'error ' . $mysqli->connect_errno . ' connecting to db :' . '<br>' . $mysqli->connect_error;
    else
      return 'error ' . $mysqli->errno . ' executing query :' . '<br>' . $mysqli->error;
  else
    return 'error ' . $stmt->errno . ' executing query :' . '<br>' . $stmt->error;
}

//******************************************************************************

?>
