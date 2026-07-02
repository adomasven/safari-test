const HEADERS_RECEIVED_TEST_ORIGIN = 'https://mock.httpstatus.io';
const HEADERS_RECEIVED_TEST_URL = `${HEADERS_RECEIVED_TEST_ORIGIN}/302`;

chrome.webRequest.onHeadersReceived.addListener((details) => {
	console.log(`Headers received for frame ${details.frameId}, parentFrame ${details.parentFrameId}, status ${details.statusCode}, url ${details.url}`);
}, {urls: [`https://*/*`]}, ['responseHeaders']);

function testHeadersReceived() {
	console.log('We should receive headers for 302 and 200 requests and they should come from frame 0');
	console.log(`Opening a tab at ${HEADERS_RECEIVED_TEST_URL}`);
	chrome.tabs.create({url: HEADERS_RECEIVED_TEST_URL}, (tab) => {
		setTimeout(() => {
			console.log('2 headersReceived events should have been triggered above');
			console.log(`Reloading the tab at ${HEADERS_RECEIVED_TEST_URL}`);
			chrome.tabs.update(tab.id, {url: HEADERS_RECEIVED_TEST_URL});
		}, 2000);

		setTimeout(() => {
			console.log('Closing the opened tab after 5s');
			console.log(`The headersReceived event for 200 should have the url \`${HEADERS_RECEIVED_TEST_ORIGIN}/200`);
			chrome.tabs.remove(tab.id);
		}, 5000);
	});
}
