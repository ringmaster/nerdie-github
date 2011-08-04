var NerdieInterface = require('nerdie_interface.js')
  , Bitly = require('bitly').Bitly
  , $ = require("./jqNode").$
  , nerdie = null
  , config = null;


function Notify(parentNerdie) {
	this.pluginInterface = new NerdieInterface(parentNerdie, this);
	nerdie = parentNerdie;
	config = (nerdie.config.plugins.notify) ? nerdie.config.plugins.notify : {};
	console.log('Bitly:', config.bitly_username, config.bitly_apikey);
}

Notify.prototype.init = function () {
	$('/notify').post(function(request, response, querystring, data) {
		console.log(data.payload);
		try{
			payload = JSON.parse(data.payload);
		}
		catch(e) {
			console.log('JSON Parsing Error', e);
			$.write('JSON Parsing error:' + e);
		}
		console.log(payload);
		repo = '[' +payload.repository.name + '] ';
		bitly = new Bitly(config.bitly_username, config.bitly_apikey);
		payload.commits.forEach(function(commit) {
			bitly.shorten(commit.url, function(shorturl) {
				console.log(shorturl);
				if(shorturl.status == 200) {
					url = shorturl.data;
				}
				else {
					url = commit.url;
				}
				message = repo + commit.author.name + ' : ' + commit.message + ' -- ' + url;
				for(i in config.announce[payload.repository.name]) {
					nerdie.bot.say(config.announce[payload.repository.name], message);
				}
			});
		});
		$.write('ok');
	});
	$('/test').get(function(request, response, querystring, data) {
		$.writeFile(__dirname + '/testform.html');
	});
	$.start();
};

module.exports = Notify;
