function getPath( url ) {
    var a = document.createElement('a');
    a.href = url;
    return a.port + a.pathname;
}

function getImages() {
    var images = document.getElementsByTagName('img');
    var srcList = [];
    for(var i = 0; i < images.length; i++) {
        srcList.push( getPath( images[i].src ) );
    }
    return srcList;
}

function getCSS() {
    var css_links = document.getElementsByTagName('link');
    var srcList = [];
    for(var i = 0; i < css_links.length; i++) {
        if( css_links[i].rel === "stylesheet" ) {
            srcList.push( getPath( css_links[i].href ) );
        }
    }
    return srcList;
}

function fingerprint() {
    tmp = [];
    tmp = tmp.concat( getImages() );
    tmp = tmp.concat( getCSS() );
    return tmp;
}
