chrome.browserAction.onClicked.addListener(() => {
	chrome.tabs.create({url: chrome.runtime.getURL('preferences.html')});
});

function formatTestResult(passed) {
	let color = passed ? 'green' : 'red';
	let symbol = passed ? '&#x2705;' : '&#x274C;';
	let label = passed ? 'PASS' : 'FAIL';
	return `<span style="color: ${color}">${symbol} ${label}</span>`;
}

var log = console.log;
console.log = function(message) {
	chrome.tabs.query({url: chrome.runtime.getURL(`preferences.html`)}, (tabs) => {
		chrome.tabs.sendMessage(tabs[0].id, ['bgConsole', message]);
	});
	log.apply(console, arguments);
}

chrome.runtime.onMessage.addListener((request) => {
	if (typeof request !== 'string') {
		return;
	}

	window[request]();
});
