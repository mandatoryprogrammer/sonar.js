function get_path( url ) {
    var a = document.createElement('a');
    a.href = url;
    return a.port + a.pathname;
}

function get_images() {
    var images = document.getElementsByTagName('img');
    var srcList = [];
    for(var i = 0; i < images.length; i++) {
        srcList.push( get_path( images[i].src ) );
    }
    return srcList;
}

function get_css() {
    var css_links = document.getElementsByTagName('link');
    var srcList = [];
    for(var i = 0; i < css_links.length; i++) {
        if( css_links[i].rel === "stylesheet" ) {
            srcList.push( get_path( css_links[i].href ) );
        }
    }
    return srcList;
}

function generate_function( name ) {
    var template = decodeURI( "var%20fingerprints%20=%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20'name':%20%5BREPLACE_WITH_DEVICE_NAME%5D,%0A%20%20%20%20%20%20%20%20'fingerprints':%20%5BREPLACE_WITH_FINGERPRINTS_ARRAY%5D,%0A%20%20%20%20%20%20%20%20'callback':%20function(%20ip%20)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20//%20Insert%20exploit%20here%0A%20%20%20%20%20%20%20%20%7D,%0A%20%20%20%20%7D,%0A%5D" );
    template = template.replace( '[REPLACE_WITH_DEVICE_NAME]', JSON.stringify( name ) );
    template = template.replace( '[REPLACE_WITH_FINGERPRINTS_ARRAY]', JSON.stringify( fingerprint() ) );
    console.log( template );
}

function fingerprint() {
    tmp = [];
    tmp = tmp.concat( get_images() );
    tmp = tmp.concat( get_css() );
    return tmp;
}

var exploit_name = window.prompt( "Please enter the name of this device", "" );
code = generate_function( exploit_name );
console.log( code );
