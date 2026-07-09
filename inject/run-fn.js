function runFn(fn) {
	chrome.runtime.sendMessage(fn)
}

function clearConsoleOutput(selector) {
	let consoleOutput = document.querySelector(selector);
	for (let entry of consoleOutput.querySelectorAll('p')) {
		entry.remove();
	}
}

function clearTestOutput() {
	clearConsoleOutput('.bg-output');
}

let buttons = document.querySelectorAll('input');
for (let button of buttons) {
	button.addEventListener('click', () => {
		clearTestOutput();
		runFn(button.dataset.fn);
	})
}
