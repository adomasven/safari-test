chrome.browserAction.onClicked.addListener(() => {
	chrome.tabs.query({active: true}, (tabs) => {
		if (tabs[0].url.includes('zotero.org')) {
			chrome.tabs.sendMessage(tabs[0].id, ['contentPageMessage']);
		}
		else {
			chrome.tabs.create({url: chrome.runtime.getURL(`preferences.html`)});
		}
	});
});

var log = console.log;
console.log = function(message) {
	chrome.tabs.query({url: chrome.runtime.getURL(`preferences.html`)}, (tabs) => {
		chrome.tabs.sendMessage(tabs[0].id, ['bgConsole', message]);
	});
	log.apply(console, arguments);
}

chrome.runtime.onMessage.addListener((request) => {
	window[request]();
});