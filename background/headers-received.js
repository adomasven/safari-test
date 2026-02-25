chrome.webRequest.onHeadersReceived.addListener((details) => {
	console.log(`Headers received for frame ${details.frameId}, parentFrame ${details.parentFrameId}, status ${details.statusCode}, url ${details.url}`);
}, {urls: ["https://httpbin.org/*"], types: ['main_frame', 'sub_frame']}, ['responseHeaders']);

function testHeadersReceived() {
	console.log('We should receive headers for 301 and 200 requests and they should come from frame 0')
	console.log('Opening a tab at https://httpbin.org/status/301');
	chrome.tabs.create({url: 'https://httpbin.org/status/301'}, (tab) => {
		setTimeout(() => {
			console.log('Closing the opened tab after 5s');
			chrome.tabs.remove(tab.id);
		}, 5000)
	});
}
