chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request[0] != 'frameResponse') return;
	console.log("Frame: received frame-response message. Sending response in 1s");
	setTimeout(() => {
		sendResponse('Response from frame after 1s');
		console.log("Frame response sent")
	}, 1000);
	return true;
});