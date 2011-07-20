
var scripts = [	"helloworld.user.js"];
var tabBrowser = require("tab-browser");
var ioService = require("io-service");
var self = require("self");

var sandboxFactory = require("user-script-sandbox");
var userscriptParser = require("user-script-header-parser");

var httpRegEx = /^https?/i;

exports.main = function(){
	scripts.forEach(function(scriptName, index){
		var script = self.data.load(scriptName);
		var userScript = userscriptParser.parse(script);
		scripts[index] = userScript;
	});

	tabBrowser.whenContentLoaded(function(safeWin){
		var href = safeWin.location.href;

		// only remove kampyle from http protocol
		if (!httpRegEx.test(ioService.extractScheme(href))) {
			return;
		}

		scripts.forEach(function(userScript){
			// check that the userscript should be run on this page
			if(!userScript.matchesURL(href)) {
				return;
			}

			var sandbox = sandboxFactory.createSandbox(safeWin, userScript);
			sandboxFactory.evalInSandbox(userScript.source, sandbox);
		});
	});
}

