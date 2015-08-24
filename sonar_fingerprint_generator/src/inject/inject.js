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
    if( document_ref.images[i].src !== undefined && document_ref.images[i].src !== null ) {
      prints.push( document_ref.images[i].src );
    }
  }
  for( var i = 0; i < document_ref.styleSheets.length; i++ ){
    if( document_ref.styleSheets[i].href !== undefined && document_ref.styleSheets[i].href !== null ) {
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
    for( i = 0; i < window_ref.frames.length; i++ ) {
        if( window_ref.frames[i].frames.length > 0 ) {
            resource_array = resource_array.concat( recursive_element_collect( window_ref.frames[i] ) );
        }
        resource_array = resource_array.concat( get_resource_array( window_ref.frames[i].document ) );
    }
    resource_array = resource_array.concat( get_resource_array( window_ref.document ) );
    return resource_array;
}
resource_array = recursive_element_collect( window );
resource_array
