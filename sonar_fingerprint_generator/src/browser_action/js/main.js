chrome.tabs.getSelected( null, function( tab ) {
  chrome.tabs.executeScript( tab.id, { file: "/src/inject/inject.js" }, function( return_data ) {
    var code = "\t{\r\n        \'name\': [FINGERPRINT_NAME_REPLACE_ME],\r\n        \'created\': [FINGERPRINT_DATE_REPLACE_ME],\r\n        \'resources\': [FINGERPRINT_REPLACE_ME],\r\n        \'callback\': function( ip ) {\r\n            \/\/ Insert exploit here\r\n        },\r\n    }";
    code = code.replace( '[FINGERPRINT_NAME_REPLACE_ME]', JSON.stringify( 'Example' ) );
    code = code.replace( '[FINGERPRINT_REPLACE_ME]', JSON.stringify( remove_duplicates( return_data[0] ) ) );
    code = code.replace( '[FINGERPRINT_DATE_REPLACE_ME]', JSON.stringify( new Date().toGMTString() ) );
    document.getElementById( 'codeoutput' ).value = code;
  });
});

function copycode() {
  document.getElementById("codeoutput").select();
  document.execCommand("copy", false, null);
}
document.getElementById("copy2clipboardbutton").addEventListener("click", copycode);

function remove_duplicates(array){
  if ($.isArray(array)){
    var dupes = {}; var len, i;
    for (i=0,len=array.length;i<len;i++){
      var test = array[i].toString();
      if (dupes[test]) { array.splice(i,1); len--; i--; } else { dupes[test] = true; }
    }
  } 
  else {
    if (window.console) console.log('Not passing an array to uniqueArray, returning whatever you sent it - not filtered!');
      return(array);
  }
  return(array);
}