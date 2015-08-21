function get_relative_path( url ) {
  var el = document.createElement('a');
  el.href = url;
  if( el.port == "" ) {
    return el.pathname;
  } else {
    return el.port + ':' + el.pathname;
  }
}
function get_resource_array() {
  var prints = [];
  for( var i = 0; i < document.images.length; i++ ){
    if( document.images[i].src !== undefined ) {
      prints.push( document.images[i].src );
    }
  }
  for( var i = 0; i < document.styleSheets.length; i++ ){
    if( document.styleSheets[i].href !== undefined ) {
      prints.push( document.styleSheets[i].href );
    }
  }
  for( var i = 0; i < prints.length; i++ ){
    prints[i] = get_relative_path( prints[i] );
  }
  return prints;
}
get_resource_array();
