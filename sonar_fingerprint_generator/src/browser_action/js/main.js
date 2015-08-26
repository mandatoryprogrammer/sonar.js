chrome.tabs.getSelected( null, function( tab ) {
  chrome.tabs.executeScript( tab.id, { file: "/src/inject/inject.js" }, function( return_data ) {
    var code = "var fingerprints = [\r\n    {\r\n        \'name\': [FINGERPRINT_NAME_REPLACE_ME],\r\n        \'fingerprints\': [FINGERPRINT_REPLACE_ME],\r\n        \'callback\': function( ip ) {\r\n            \/\/ Insert exploit here\r\n        },\r\n    },\r\n]";
    code = code.replace( '[FINGERPRINT_NAME_REPLACE_ME]', JSON.stringify( 'Example' ) );
    code = code.replace( '[FINGERPRINT_REPLACE_ME]', JSON.stringify( remove_duplicates( return_data[0] ) ) );
    document.getElementById( 'codeoutput' ).value = code;
  });
});

function copycode() {
  document.getElementById("codeoutput").select();
  document.execCommand("copy", false, null);
}
document.getElementById("copy2clipboardbutton").addEventListener("click", copycode);

function remove_duplicates(arr) {
    var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];

    return arr.filter(function(item) {
        var type = typeof item;
        if(type in prims)
            return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
        else
            return objs.indexOf(item) >= 0 ? false : objs.push(item);
    });
}
