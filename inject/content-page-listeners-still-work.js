var isTopWindow = false;
if(window.top) {
	try {
		isTopWindow = window.top == window;
	} catch(e) {};
}

if (isTopWindow) {
	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request[0] != 'contentPageMessage') return;
		let h1 = document.createElement('h1');
		h1.innerText = "Content page message listeners still work!";
		document.body.insertBefore(h1, document.body.children[0]);
	});
}