function logFrameMessageResponse(label, response) {
	console.log(`${label}: resolved response type=${typeof response}, value=${JSON.stringify(response)}`);
	console.log(`${label} result: ${formatTestResult(response && response.received === true && response.source === 'extension-frame')}`);
}

function logFrameMessageError(label, error) {
	console.log(`${label}: rejected error=${error && error.message ? error.message : error}`);
	console.log(`${label} result: ${formatTestResult(false)}`);
}

function sendFrameMessageWithBrowserApi(tabId, options, label) {
	if (typeof browser === 'undefined' || !browser.tabs || !browser.tabs.sendMessage) {
		console.log(`${label}: browser.tabs.sendMessage is not available`);
		console.log(`${label} result: ${formatTestResult(false)}`);
		return;
	}

	browser.tabs.sendMessage(tabId, ['frameMessageTest'], options).then(
		(response) => logFrameMessageResponse(label, response),
		(error) => logFrameMessageError(label, error)
	);
}

chrome.runtime.onMessage.addListener((request) => {
	if (!request) {
		return;
	}

	if (request[0] === 'frameMessageFrameLoaded') {
		console.log(`Internal extension frame reported loading at ${request[1]}`);
		return;
	}

	if (request[0] === 'frameMessageFrameReceived') {
		console.log(`Internal extension frame reported receiving frameMessageTest at ${request[1]}`);
	}
});

function inspectFramesAndSendMessages(tabId, frameUrl) {
	chrome.webNavigation.getAllFrames({tabId}, (frames) => {
		if (chrome.runtime.lastError) {
			console.log(`Could not inspect frames: ${chrome.runtime.lastError.message}`);
			console.log(`frame message frame inspection result: ${formatTestResult(false)}`);
			return;
		}

		if (!frames) {
			console.log('Could not inspect frames: getAllFrames returned no frames');
			console.log(`frame message frame inspection result: ${formatTestResult(false)}`);
			return;
		}

		console.log(`webNavigation.getAllFrames returned ${frames.length} frame(s):`);
		for (let frame of frames) {
			console.log(`Frame frameId=${frame.frameId}, parentFrameId=${frame.parentFrameId}, url=${frame.url}`);
		}

		let extensionFrame = frames.find(frame => frame.url === frameUrl);
		if (!extensionFrame) {
			console.log(`Could not find extension frame at ${frameUrl}`);
			console.log(`frame message extension frame discovery result: ${formatTestResult(false)}`);
			return;
		}

		console.log(`frame message extension frame discovery result: ${formatTestResult(true)}`);
		console.log('Sending frameMessageTest as a broadcast message; expected response is from the extension frame');
		sendFrameMessageWithBrowserApi(tabId, undefined, 'Broadcast response');

		console.log(`Sending frameMessageTest targeted to extension frameId=${extensionFrame.frameId}`);
		sendFrameMessageWithBrowserApi(
			tabId,
			{frameId: extensionFrame.frameId},
			`Targeted extension-frame response from frameId=${extensionFrame.frameId}`
		);
	});
}

function testFrameMessage() {
	const targetUrl = 'https://example.org/';
	const frameUrl = chrome.runtime.getURL('frame-message.html');

	console.log(`Opening a tab at ${targetUrl}`);
	chrome.tabs.create({url: targetUrl}, (tab) => {
		setTimeout(() => {
			console.log(`Injecting extension frame at ${frameUrl}`);
			chrome.tabs.executeScript(tab.id, {
				code: `(() => {
					let frame = document.createElement('iframe');
					frame.src = ${JSON.stringify(frameUrl)};
					frame.id = 'safari-test-extension-frame-message-test';
					frame.style.width = '600px';
					frame.style.height = '120px';
					document.body.appendChild(frame);
				})();`
			}, () => {
				if (chrome.runtime.lastError) {
					console.log(`Frame injection failed: ${chrome.runtime.lastError.message}`);
					console.log(`frame message frame injection result: ${formatTestResult(false)}`);
					return;
				}

				console.log(`frame message frame injection result: ${formatTestResult(true)}`);
				setTimeout(() => {
					inspectFramesAndSendMessages(tab.id, frameUrl);
				}, 1000);
			});
		}, 1000);

		setTimeout(() => {
			console.log('Closing the opened tab after 6s');
			chrome.tabs.remove(tab.id);
		}, 6000);
	});
}
