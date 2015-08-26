function get_relative_path( url ) {
  var el = document.createElement('a');
  el.href = url;
  if( el.protocol != 'http:' && el.protocol != 'https:' ) {
    return false;
  }
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
      prints.push( [ document_ref.images[i].src, document_ref.images[i].naturalWidth, document_ref.images[i].naturalHeight ] );
    }
  }
  for( var i = 0; i < document_ref.styleSheets.length; i++ ){
    if( document_ref.styleSheets[i].href !== undefined && document_ref.styleSheets[i].href !== null ) {
      prints.push( document_ref.styleSheets[i].href );
    }
  }
  for( var i = 0; i < document_ref.scripts.length; i++ ){
    if( document_ref.scripts[i].src !== undefined && document_ref.scripts[i].src !== null && document_ref.scripts[i].src.length > 0 ) {
      prints.push( document_ref.scripts[i].src );
    }
  }
  var new_prints = [];
  console.log(prints);
  for( var i = 0; i < prints.length; i++ ){
    var tmp_print = get_relative_path( prints[i] instanceof Array ? prints[i][0] : prints[i] );
    if( tmp_print != false ){
      if (prints[i] instanceof Array) {
        new_prints.push( [ tmp_print, prints[i][1], prints[i][2] ] );
      } else {
        new_prints.push( tmp_print );
      }
    }
  }
  prints = new_prints;
  console.log( prints );
  return prints;
}

function recursive_element_collect( window_ref ) {
    var resource_array = [];
    for( i = 0; i < window_ref.frames.length; i++ ) {
        if( window_ref.frames[i].frames.length > 0 ) {
          try {
            resource_array = resource_array.concat( recursive_element_collect( window_ref.frames[i] ) );
          } catch (e) {}
        }
        try{
          resource_array = resource_array.concat( get_resource_array( window_ref.frames[i].document ) );
        } catch (e) {}
        try{
          resource_array.push( get_relative_path( window_ref.frames[i].location.href ) );
        } catch (e) {}
    }
    resource_array = resource_array.concat( get_resource_array( window_ref.document ) );
    return resource_array;
}
resource_array = recursive_element_collect( window );
resource_array
