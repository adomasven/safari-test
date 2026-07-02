if (typeof browser === 'undefined' || !browser.runtime) {
	console.log('Internal frame browser.runtime is not available');
}
else {
	browser.runtime.sendMessage(['frameMessageFrameLoaded', location.href]).catch((error) => {
		console.log(`Internal frame load ping failed: ${error && error.message ? error.message : error}`);
	});

	browser.runtime.onMessage.addListener((request) => {
		if (!request || request[0] !== 'frameMessageTest') {
			return;
		}

		console.log('Internal frame received frameMessageTest message');
		browser.runtime.sendMessage(['frameMessageFrameReceived', location.href]).catch((error) => {
			console.log(`Internal frame received ping failed: ${error && error.message ? error.message : error}`);
		});

		return Promise.resolve({received: true, source: 'extension-frame', url: location.href});
	});
}
