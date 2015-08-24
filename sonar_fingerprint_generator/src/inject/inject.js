function get_relative_path( url ) {
  var el = document.createElement('a');
  el.href = url;
  if( el.port == "" ) {
    return el.pathname;
  } else {
    return el.port + ':' + el.pathname;
  }
}
function get_resource_array( document_ref ) {
  var prints = [];
  for( var i = 0; i < document_ref.images.length; i++ ){
    if( document_ref.images[i].src !== undefined ) {
      prints.push( document_ref.images[i].src );
    }
  }
  for( var i = 0; i < document_ref.styleSheets.length; i++ ){
    if( document_ref.styleSheets[i].href !== undefined ) {
      prints.push( document_ref.styleSheets[i].href );
    }
  }
  for( var i = 0; i < prints.length; i++ ){
    prints[i] = get_relative_path( prints[i] );
  }
  return prints;
}

function recursive_element_collect( window_ref ) {
    var resource_array = [];
    for( i = 0; i < window.frames.length; i++ ) {
        if( window.frames[i].frames.length > 0 ) {
            resource_array = resource_array.concat( recursive_element_collect( window.frames[i] ) );
        }
        resource_array = resource_array.concat( get_resource_array( window.frames[i].document ) );
    }
    return resource_array;
}
resource_array = get_resource_array( window.document );
resource_array = resource_array.concat( recursive_element_collect( window ) );
resource_array
