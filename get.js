//******************************************************************************

// id field
let
  _id_ = 'id';

// fields ids
let
  fields = [ _id_, 'name', 'addr', 'startDt', 'plcsCnt', 'scrnsCnt', 'tech', 'threeD' ];

//******************************************************************************
//
// inits elements

function page_loaded ( anEvt )
{
let
  form = document.forms['fields'];

  if ( ! form )
  // global error, no form
    return true;

  // disabling fields
  for ( let fldNo = 0; fldNo < fields.length; fldNo++ )
  {
  let
    elem = form[fields[fldNo]];
    if ( elem )
    {
      elem.value = ''; elem.title = '';
      elem.setAttribute('readonly', 'true');
    }
  }

  // disabling buttons
  if ( document.getElementById('dtls') )
  {
    form['save'].disabled = 'true';
    form['back'].disabled = 'true';
    form['del'].disabled = 'true';
  }

  return true;
}

//******************************************************************************
//
// selects table row

function select_item ( anEvt )
{
let
  elem = anEvt.target;

  if ( ! (elem.tagName == 'TH' || elem.tagName == 'TD' || elem.tagName == 'INPUT') )
    return false;

  // determining selected row if any
let
  item_id = null,
  dtls = document.getElementById('dtls'),
  id_0 = document.getElementById('id_0');
let
  tr = null, tr_ = null;
  if ( elem.tagName == 'TH' || elem.tagName == 'TD' )
  // from list
  {
    tr = elem.parentNode;
    if ( tr.tagName != 'TR' || tr.childNodes.length == 0 )
      return false;

    item_id = tr.getAttribute(_id_);
    dtls.setAttribute('item_id', item_id);
    tr_ = tr.parentNode.childNodes[0];
    if ( elem.tagName == 'TH' )
      tr = null;
  }
  else
  if ( elem.name == 'add' )
  // from 'Add' button
  {
    if ( id_0.className == '' )
    {
      item_id = 'id_0';
      tr = document.getElementById(item_id);
      dtls.setAttribute('item_id', item_id);
      tr_ = tr.parentNode.childNodes[0];
    }
    else
      item_id = null;
  }
  else
  if ( elem.name == 'back' )
  // from 'Revert' button
  {
    item_id = dtls.getAttribute('item_id');
    tr = document.getElementById(item_id);
  }

// hiliting items

  for ( ; tr_; tr_ = tr_.nextSibling )
    if ( tr_.tagName == 'TR' )
      tr_.className = (tr_ == tr ? 'hilite' : '');

  id_0.className = (item_id == 'id_0' ? 'show' : '');

// setting fields

let
  form = document.forms['fields'];
let
  virt = ((elem.name == 'add' && ! item_id) || elem.tagName == 'TH' || elem.name == 'del' ? true : false);
  for ( let fldNo = 0; fldNo < fields.length; fldNo++ )
  {
  let
    td = null;
    if ( tr )
      for ( td = tr.childNodes[0]; td && ! (td.tagName == 'TD' && td.getAttribute('fld') == fields[fldNo]); td = td.nextSibling ) ;

  let
    elem = form[fields[fldNo]];
    elem.value = (td ? td.innerHTML.replace(/<[^>]*>?/gm, '') : '');
    if ( fldNo )
    {
      elem.title = elem.value;
      elem.style.removeProperty('background-color');

      if ( virt )
        elem.setAttribute('readonly', 'true');
      else
        elem.removeAttribute('readonly');
    }
  }

  if ( elem.name == 'add' )
  // focusing on first editable field
  {
    for ( let fldNo = 0; fldNo < fields.length; fldNo++ )
      if ( form[fields[fldNo]] && ! form[fields[fldNo]].hasAttribute('readonly') )
      {
        form[fields[fldNo]].focus();
        break;
      }
  }

  form['save'].disabled = (elem.tagName == 'TH' ? 'true' : '');
  virt = (elem.name == 'add' || elem.tagName == 'TH' ? 'true' : '');
  form['back'].disabled = virt;
  form['del'].disabled  = virt;
  form['add'].value = form['add'].getAttribute(item_id == 'id_0' ? 'unaddval' : 'addval');

  return true;
}

//******************************************************************************
//
// saves row fields

function save_item ( anEvt )
{
  send_req(anEvt);
}

//******************************************************************************
//
// deletes row

function del_item ( anEvt )
{
  if ( ! confirm('Are you sure to delete selected row?') )
    return;

  send_req(anEvt);
  select_item(anEvt);
}

//******************************************************************************
//
// wipes all table data

function wipe_table ( anEvt )
{
  if ( ! confirm('Are you sure to wipe all data?') )
    return;

  send_req(anEvt);
}

//******************************************************************************
//
// drops table

function drop_table ( anEvt )
{
  if ( ! confirm('Are you sure to drop data table?') )
    return;

  send_req(anEvt);
}

//******************************************************************************
//
// checks field value

function change_item ( anEvt )
{
let
  elem = anEvt.target;

  if ( elem.tagName != 'INPUT' )
    return false;

  // checking field for emptiness
let
  ok = elem.value.trim().length;

  if ( ok )
    // checking field values
    switch ( elem.name )
    {
      case 'startDt'   : ok = elem.value.match(/(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d/); break;
      case 'plcsCnt' : ok = elem.value.match(/^[+]?\d+([.]\d+)?$/); break;
      case 'scrnsCnt' : ok = elem.value.match(/^[+]?\d+([.]\d+)?$/); break;
    }

  if ( elem.value.trim() == elem.title )
    elem.style.removeProperty('background-color');
  else
    elem.style.backgroundColor = ok ? '#FF7' : '#FBB';

  return true;
}

//******************************************************************************
//
// makes request object

function make_xhr ( )
{
  try { return new XMLHttpRequest(); } catch (e){}
  try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
  try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
  try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch (e) {}
  try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch (e) {}
  return null;
}

//******************************************************************************
//
// sends request

function send_req ( anEvt )
{
let
  elem = anEvt.target;

let
  form = document.forms['fields'];

let
  data = new FormData();

let
  dtls = document.getElementById('dtls'),
  tr = (dtls ? document.getElementById(dtls.getAttribute('item_id')) : null);

// allowed commands
let
  cmds = [ 'make', 'drop', 'seed','wipe', 'save', 'del', 'csvi', 'json', 'csvo', 'tsvo' ];

// checking command
let
  cmdNo = cmds.length - 1;
  for ( ; cmdNo >= 0; cmdNo-- )
    if ( elem.name == cmds[cmdNo] )
      break;

  if ( cmdNo == -1 )
  {
    alert('unknown request');
    return;
  }

// making request string
  data.append(elem.name, '');
  if ( elem.name == 'save' || elem.name == 'del' )
  // saving or deleting
  {
    for ( let td = tr.childNodes[0]; td; td = td.nextSibling )
      if ( td.tagName == 'TD' )
      {
      let
        name = td.getAttribute('fld');
        if ( elem.name == 'save' || name == _id_ )
          data.append(name, form[name].value);
        if ( elem.name == 'del' )
          break;
      }
  }
  else
  if ( elem.name == 'csvi' )
  // sending CSV
  {
  let
    files = elem.files;
    if ( files.length == 0 )
    {
      alert('no file selected');
      return;
    }
  let
    file = files[0];
    data.append(elem.name, file, file.name);
  }

// making request object
let
  xhr = make_xhr();
  if ( xhr == null )
  {
    alert(document.getElementById('badxhr').innerHTML.replace('\\n', '\n').replace('\\n', '\n').replace('\\n', '\n'));
    return false;
  }

// checking request state
  xhr.onreadystatechange =

function()
{
  if ( xhr.readyState != XMLHttpRequest.DONE )
    return;

// request done
  form.removeAttribute('sending...');
  clearTimeout(timeout);

  if ( xhr.status == 200 )
  // status ok
  {
  let
    err = (xhr.responseText.indexOf('error') != -1),
    log = document.getElementById('log');
    log.className = (err ? 'show' : '');

    if ( ! err )
    // command executed successfully
    {
      log.innerHTML = '';

    let
      disp = xhr.getResponseHeader('Content-Disposition');
      if ( disp && disp.indexOf('attachment;filename=') != -1 )
      // downloading file
      {
      let
        name = disp.substr(disp.indexOf('=') + 1).trim().replace (/(^")|("$)/g, '').trim(),
        file = new File([xhr.responseText], name, { type: 'text/json' });
      let
        url = URL.createObjectURL(file);
      let
        link = document.createElement('A');
        if ( typeof link.download !== 'undefined' )
        {
          link.href = url;
          link.download = name;
          document.body.appendChild(link);
          link.click();
        }
        else
        // safari
          window.location = url;
      }
      else
      if ( elem.name == 'make' || elem.name == 'drop' || elem.name == 'seed' || elem.name == 'wipe' || elem.name == 'csvi' )
      // reporting
        alert((elem.name == 'make' ? 'table made' : elem.name == 'drop' ? 'table dropped' : elem.name == 'seed' ? 'table seeded' : elem.name == 'wipe' ? 'table wiped' : elem.name == 'csvi' ? 'loaded' : '') + ' successfully');

      if ( elem.name == 'save' )
      {
        if ( tr.id == 'id_0' )
        // solidifying added row
        {
        let
          tr_ = tr;
          tr = tr_.cloneNode(true);

          tr.removeAttribute('style');
          tr.setAttribute('onclick', 'select_item(event);');
          tr_.parentNode.insertBefore(tr, tr_);
          tr_.style.display = 'none';
          for ( let td_ = tr_.childNodes[0]; td_; td_ = td_.nextSibling )
            if ( td_.tagName == 'TD' && td_.getAttribute('fld') == _id_ )
            {
              td_.innerHTML = parseInt(td_.innerHTML) + 1;
              break;
            }
        }

        // updating row fields
        for ( let td = tr.childNodes[0]; td; td = td.nextSibling )
          if ( td.tagName == 'TD' )
          {
          let
            name = td.getAttribute('fld'),
            elem = form[name];
            td.innerHTML = elem.title = elem.value;
            if ( name == _id_ )
              tr.setAttribute(_id_, 'id_' + elem.value);
            elem.style.removeProperty('background-color');
          }
      }
      else
      if ( elem.name == 'del' )
      // deleting table row
        tr.remove();
      else
      if ( elem.name == 'make' || elem.name == 'drop' || elem.name == 'seed' || elem.name == 'wipe' || elem.name == 'csvi' )
      // reloading
        document.location.reload();
    }
    else
    // error executing command
    {
    let
      br = xhr.responseText.indexOf('<br />');
      log.innerHTML = xhr.responseText.substr(br != -1 ? br + 6 : 0);
      alert((elem.name == 'make' ? 'making table' : elem.name == 'drop' ? 'dropping table' : elem.name == 'seed' ? 'seeding table' : elem.name == 'wipe' ? 'wiping table' : elem.name == 'save' ? 'saving item' : elem.name == 'del' ? 'deleting item' : elem.name == 'csvi' ? 'sending csv' : '') + ' failed');
      if ( elem.name == 'save' )
      // focusing on wrong field
      {
      let
        fr = log.innerHTML.indexOf('\''), tl = log.innerHTML.indexOf('\'', fr + 1), fld = log.innerHTML.substr(fr + 1, tl - fr - 1);
        if ( form[fld] )
          form[fld].focus();
      }
    }
  }
  else
  if ( timeout != null )
  // timeouting
  {
    timeout = null;
    alert(xhr.responseText);
  }

}

// sending request
  form.setAttribute('sending...', true);

  xhr.open('POST', document.location, true);
  xhr.send(data);

// foreseeing timeout
let
  timeout = setTimeout(function(){ xhr.abort(); br.innerHTML = '<br>'; alert('Time over') }, 120000);

  return false;
}

//******************************************************************************
