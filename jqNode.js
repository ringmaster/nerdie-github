var fs = require("fs"),
	http = require("http"),
	url = require("url");

var routes = {},
regexroutes = [],
	server = http.createServer();

var	_response, _data;

function route(request, response) {
	var parsedUrl = url.parse(request.url, true),
		pathName = parsedUrl.pathname,
		method = request.method;
		
	_response = response;
	_querystring = parsedUrl.query;
	
	if($.config.debug) {
		console.log("Received " + method + " request at " + pathName);
	}

	var handler = false;
	
	if(routes[pathName] && (handler = routes[pathName][method])){
		handler = routes[pathName][method];
	} else {
		for(routeindex in regexroutes) {
			route = regexroutes[routeindex];
			if(pathName.match(route.regex) && method == route.method) {
				handler = route.callback;
				break;
			}
		}
	}
	if(handler) {
		_data = "";
		request.addListener("data", function(chunk) {
			_data += chunk;
		});
		request.addListener("end", function() {
			handler(request, response, _querystring, require('querystring').parse(_data));
		});
	}
	else {
		response.writeHead(404, {'Content-Type' : 'text/html'});
		response.end("<h1>404. Not found.</h1>");
	}
}

function addRoute(url, method, callback) {
	finder = /function (.+?)\(/;
	url.constructor.toString().match(finder);
	switch(RegExp.$1) {
		case "RegExp":
			regexroutes.push({'regex': url, 'method': method, 'callback': callback});
			break;
		default:

			if(!routes[url]) {
				routes[url] = {};
			}
			routes[url][method] = callback;
			break;
	}
}

var $ = function(url) {
	return $.fn.init(url);
}

$.fn = $.prototype;

$.fn.init = function(url) {
	this.url = url;
	return this;
}

$.fn.get = function(callback) {
	addRoute(this.url, "GET", callback);
	return this;
}

$.fn.post = function(callback) {
	addRoute(this.url, "POST", callback);
	return this;
}

$.fn.head = function(callback) {
	addRoute(this.url, "HEAD", callback);
	return this;
}

$.fn.put = function(callback) {
	addRoute(this.url, "PUT", callback);
	return this;
}

$.fn['delete'] = function(callback) {
	addRoute(this.url, "DELETE", callback);
}


$.start = function(config) {
	$.config = {
		port: 8888,
		debug: false,
	}
	for (attrname in config) { $.config[attrname] = config[attrname]; }
	server.on('request', route);
	server.listen($.config.port);
	if($.config.debug) {
		console.log("Listening at port " + $.config.port);
	}
	return server;
}

$.write = function(data, contentType) {
	if(!contentType) {
		contentType = "text/html";
	}
	_response.writeHead(200, {'Content-Type' : contentType});
	_response.end(data);
}

$.writeFile = function(fileName, contentType) {
	if(!contentType) {
		contentType = "text/html";
	}
	fs.readFile(fileName, function(error, data) {
		if(error) {
			_response.writeHead(404, {'Content-Type' : 'text/html'});
			_response.end("<h1>Unable to load page. File not found</h1>");
			if($.config.debug) {
				console.log(fileName + " not found");
			}
		} else {
			_response.writeHead(200, {'Content-Type' : contentType});
			_response.end(data);
		}
	});
}

exports.$ = $;
