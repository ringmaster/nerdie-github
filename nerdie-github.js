var NerdieInterface = require('nerdie_interface.js')
  , Bitly = require('bitly').Bitly
  , $ = require("./jqNode").$
  , nerdie = null
  , config = null;


function Notify(parentNerdie) {
	this.pluginInterface = new NerdieInterface(parentNerdie, this);
	nerdie = parentNerdie;
	config = (nerdie.config.plugins.notify) ? nerdie.config.plugins.notify : {};
}

Notify.prototype.init = function () {
	$('/notify').post(function(request, response, querystring, data) {
		try{
			payload = JSON.parse(data.payload);
		}
		catch(e) {
			console.log('JSON Parsing Error', e);
			$.write('JSON Parsing error:' + e);
			return;
		}
		repo = '[' +payload.repository.name + '] ';
		bitly = new Bitly(config.bitly_username, config.bitly_apikey);
		payload.commits.forEach(function(commit) {
			bitly.shorten(commit.url, function(shorturl) {
				if(shorturl.status_code == 200) {
					url = shorturl.data.url;
				}
				else {
					url = commit.url;
				}
				message = repo + commit.author.name + ' : ' + commit.message + ' -- ' + url;
				nerdie.bot.say(config.announce[payload.repository.name], message);
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
