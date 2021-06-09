async function testPromiseMessaging() {
	console.log('Injected page will return via sendResponse(). Works if `browser.` is supported');

	await new Promise((resolve) => {
		chrome.tabs.query({url: chrome.runtime.getURL(`preferences.html`)}, (tabs) => {
			chrome.tabs.sendMessage(tabs[0].id, ['returnSendResponse'], (response) => {
				console.log('Response from the injected script:');
				console.log(response);
				resolve();
			});
		});
	});
	
	console.log('Injected page will return a Promise. Broken in Safari');

	await new Promise((resolve) => {
		chrome.tabs.query({url: chrome.runtime.getURL(`preferences.html`)}, (tabs) => {
			chrome.tabs.sendMessage(tabs[0].id, ['returnPromise'], (response) => {
				console.log('Response from the injected script:');
				console.log(response);
				resolve();
			});
		});
	});
}