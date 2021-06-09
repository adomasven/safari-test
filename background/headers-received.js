chrome.webRequest.onHeadersReceived.addListener((details) => {
	console.log(`Headers received for frame ${details.frameId}, parentFrame ${details.parentFrameId}, status ${details.statusCode}, url ${details.url}`);
}, {urls: ["https://httpstat.us/*"], types: ['main_frame', 'sub_frame']});

function testHeadersReceived() {
	console.log('We should receive headers for 302 and 200 requests and they should come from frame 0')
	console.log('Opening a tab at https://httpstat.us/302');
	chrome.tabs.create({url: 'https://httpstat.us/302'}, (tab) => {
		setTimeout(() => {
			console.log('Closing the opened tab after 5s');
			chrome.tabs.remove(tab.id);
		}, 5000)
	});
}