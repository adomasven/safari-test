chrome.runtime.onMessage.addListener(request => {
	if (request[0] != 'bgConsole') return;
	let p = document.createElement('p');
	p.innerHTML = request[1];
	document.querySelector('.bg-output').appendChild(p);
});