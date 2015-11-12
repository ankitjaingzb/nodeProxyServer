/* This is a proxy server that uses http-proxy. It can be used to host multiple websites on your computer. 
 * It proxies http and websocket requests as well, which are useful for socket.io.
 * It logs someof the useful pieces of information for the requests. Also it does not log requests from a particular location i.e. from your own network. 
 * To use, please replace yourwebsite with the domain name of your website. Also replace yourroutername.dyndns.org with the name for your router. If you are not sure about this, you may comment the call to the function logIfNotFromMyself.
 * Author : Ankit Jain ankitjainst at gmail dot com
 */
var http = require('http'),
    httpProxy = require('http-proxy'),
    proxy = httpProxy.createProxyServer({ws:true}),
    url = require('url');
var fs = require('fs');

proxy.on('error', function (err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  res.end('Something went wrong. And we are reporting a custom error message.');
});

var proxyServer = http.createServer(function(req, res) {
if(req.headers != null && req.headers.host != null)
{
    var hostname = req.headers.host.split(":")[0];
    var pathname = url.parse(req.url).pathname;

    logMsg = '\n'+req.url+','+req.headers['referer']+","+req.connection.remoteAddress+','+getDateTime()+','+req.headers['user-agent'];

    switch(hostname)
    {
	case 'yourwebsite.com':
	case 'www.yourwebsite.com':
	    proxy.web(req, res, { target: 'http://192.168.0.101:6002' });
	    logIfNotFromMyself('mywebsitelogs.txt', logMsg, req.connection.remoteAddress);
	    break;
	default:
	    console.log("defaulting for "+ hostname);
	    res.writeHead(200, { 'Content-Type': 'text/plain' });
	    res.write('Page is not available');
	    res.end();
    }
}});

proxyServer.on('upgrade', function (req, socket, head) {
	if(req.headers != null && req.headers.host != null)
	{
		var hostname = req.headers.host.split(":")[0];
		var pathname = url.parse(req.url).pathname;
		switch(hostname)
		{
			case 'yourwebsite.com':
			case 'www.yourwebsite.com':
				console.log('proxying '+ req.url);
				proxy.ws(req, socket, head, { target: 'http://192.168.0.101:6002' });
			break;
		}
	}
});

proxyServer.listen(4000, function() {
    console.log('proxy listening on port 4000');
});

function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}

function logIfNotFromMyself(file, message, ip)
{
	var dns = require('dns');

	dns.lookup('yourroutername.dyndns.org', function onLookup(err, addresses, family) {
		var ipParts = ip.split(':');
		var theIP = ipParts[ipParts.length-1];

		//console.log('my address is', addresses+ 'ip of request is '+theIP);
		if (!(theIP == addresses))
    		fs.appendFile(file, message, function (err) {  if (err) throw err; });
		else
    		fs.appendFile(file+".self", message, function (err) {  if (err) throw err; });
	});
}
