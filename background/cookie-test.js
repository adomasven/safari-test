async function testCookies() {
	console.log('Testing whether background fetch sends cookies');

	// Set a Strict cookie
	console.log("Setting SameSite=Strict cookie...");
	await fetch("https://setcookie.net/", {
		method: "POST",
		headers: {"content-type": "application/x-www-form-urlencoded;charset=UTF-8"},
		body: "name=testStrict&value=strict&path=%2F&dom=none&ss=strict&expdate=&tz=&httponly=on",
		credentials: "include"
	});

	// Set a Lax cookie
	console.log("Setting SameSite=Lax cookie...");
	await fetch("https://setcookie.net/", {
		method: "POST",
		headers: {"content-type": "application/x-www-form-urlencoded;charset=UTF-8"},
		body: "name=testLax&value=lax&path=%2F&dom=none&ss=lax&expdate=&tz=&httponly=on",
		credentials: "include"
	});

	// Set a None cookie (requires Secure)
	console.log("Setting SameSite=None cookie...");
	await fetch("https://setcookie.net/", {
		method: "POST",
		headers: {"content-type": "application/x-www-form-urlencoded;charset=UTF-8"},
		body: "name=testNone&value=none&path=%2F&dom=none&ss=none&expdate=&tz=&httponly=on",
		credentials: "include"
	});

	console.log('The following cookies have been set:');
	let cookies = await new Promise((resolve) => {
		chrome.cookies.getAll({domain: "setcookie.net"}, resolve);
	});
	console.log(JSON.stringify(cookies, null, 2));

	console.log("Fetching setcookie.net to check which cookies are sent...");
	let result = await fetch('https://setcookie.net/', {credentials: 'include'});
	let html = await result.text();

	// Extract the "Received cookies" section
	let cookiesSection = html.match(/Received cookies:<\/p><ul>(.*?)<\/ul>/s);
	let receivedCookies = [];
	if (cookiesSection) {
		let cookieMatches = cookiesSection[1].matchAll(/<code>(.*?)<\/code>/g);
		for (let match of cookieMatches) {
			receivedCookies.push(match[1]);
		}
	}

	// Check which cookies were received
	let hasStrict = receivedCookies.some(c => c.includes('testStrict'));
	let hasLax = receivedCookies.some(c => c.includes('testLax'));
	let hasNone = receivedCookies.some(c => c.includes('testNone'));

	console.log("Cookies received by server:");
	console.log("  Strict: " + (hasStrict ? "✓" : "✕"));
	console.log("  Lax:    " + (hasLax ? "✓" : "✕"));
	console.log("  None:   " + (hasNone ? "✓" : "✕"));
	console.log("Strict and Lax cookies should be ticks!");
}
