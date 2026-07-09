const HEADERS_RECEIVED_TEST_ORIGIN = 'https://mock.httpstatus.io';
const HEADERS_RECEIVED_TEST_URL = `${HEADERS_RECEIVED_TEST_ORIGIN}/302`;

let headersReceivedListener = null;
let headersReceivedEvents = [];

function removeHeadersReceivedListener() {
	if (!headersReceivedListener) return;
	chrome.webRequest.onHeadersReceived.removeListener(headersReceivedListener);
	headersReceivedListener = null;
}

function addHeadersReceivedListener() {
	removeHeadersReceivedListener();
	headersReceivedEvents = [];
	headersReceivedListener = (details) => {
		headersReceivedEvents.push(details);
		console.log(`Headers received for frame ${details.frameId}, parentFrame ${details.parentFrameId}, status ${details.statusCode}, url ${details.url}`);
	};
	chrome.webRequest.onHeadersReceived.addListener(
		headersReceivedListener,
		{urls: [`${HEADERS_RECEIVED_TEST_ORIGIN}/*`]},
		['responseHeaders']
	);
}

function logHeadersReceivedResult(label, passed) {
	console.log(`${label} result: ${formatTestResult(passed)}`);
}

function checkHeadersReceivedResults() {
	let redirectEvents = headersReceivedEvents.filter((details) => details.statusCode === 302);
	let finalEvents = headersReceivedEvents.filter((details) => details.statusCode === 200);
	let finalUrlEvents = finalEvents.filter((details) => details.url === `${HEADERS_RECEIVED_TEST_ORIGIN}/200`);

	logHeadersReceivedResult('headersReceived 302 event', redirectEvents.length >= 1);
	logHeadersReceivedResult('headersReceived 200 event', finalEvents.length >= 1);
	logHeadersReceivedResult('headersReceived 200 URL after redirect', finalUrlEvents.length >= 1);
}

function testHeadersReceived() {
	addHeadersReceivedListener();
	console.log('We should receive headers for both the 302 redirect and the final 200 response');
	console.log(`Opening a tab at ${HEADERS_RECEIVED_TEST_URL}`);
	chrome.tabs.create({url: HEADERS_RECEIVED_TEST_URL}, (tab) => {
		let closed = false;
		let onRemoved = (tabId) => {
			if (tabId !== tab.id) return;
			closed = true;
			chrome.tabs.onRemoved.removeListener(onRemoved);
			removeHeadersReceivedListener();
		};
		chrome.tabs.onRemoved.addListener(onRemoved);

		setTimeout(() => {
			if (closed) return;
			console.log(`headersReceived initial navigation events observed: ${headersReceivedEvents.length}`);
			logHeadersReceivedResult('headersReceived initial navigation event count', headersReceivedEvents.length >= 2);
			console.log(`Reloading the tab at ${HEADERS_RECEIVED_TEST_URL}`);
			chrome.tabs.update(tab.id, {url: HEADERS_RECEIVED_TEST_URL});
		}, 2000);

		setTimeout(() => {
			if (closed) return;
			console.log('Closing the opened tab after 5s');
			console.log(`The headersReceived event for 200 should have the url \`${HEADERS_RECEIVED_TEST_ORIGIN}/200\``);
			checkHeadersReceivedResults();
			chrome.tabs.remove(tab.id);
		}, 5000);
	});
}
