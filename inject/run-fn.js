function runFn(fn) {
	chrome.runtime.sendMessage(fn)
}

let buttons = document.querySelectorAll('input');
for (let button of buttons) {
	button.addEventListener('click', () => {
		runFn(button.dataset.fn);
	})
}