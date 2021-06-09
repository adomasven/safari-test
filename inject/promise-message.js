if (typeof browser != 'undefined') {
	browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request[0] != 'returnSendResponse') return;
		setTimeout(() => {
			sendResponse('onMessage handler returning via a sendResponse() after 1s');
		}, 1000);
		return true;
	});
	
	browser.runtime.onMessage.addListener(request => {
		if (request[0] != 'returnPromise') return;
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve('onMessage handler returning via a promise after 1s');
			}, 1000);
		});
	});
}
else {
	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (!['returnSendResponse', 'returnPromise'].includes(request[0])) return;
		console.log('This test only works with `browser.` APIs, e.g. on Firefox');
		sendResponse('This test does not work in Chrome. Test with Firefox');
	});
}