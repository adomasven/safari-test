async function testFrameResponse() {
	console.log("Sending 'frameResponse' message to injected page");
	console.log("Main frame won't respond but a sub frame will after 1s delay");
	
	await new Promise((resolve) => {
		chrome.tabs.query({url: chrome.runtime.getURL(`preferences.html`)}, (tabs) => {
			chrome.tabs.sendMessage(tabs[0].id, ['frameResponse'], (response) => {
				console.log('Response from the injected script:');
				console.log(response);
				resolve();
			});
		});
	});
}
