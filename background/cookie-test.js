async function testCookies() {
	console.log('Testing whether background fetch sends httpOnly cookies');
	console.log("fetch('https://samesitetest.com/cookies/set', {credentials: 'include'})");
	await fetch('https://samesitetest.com/cookies/set', {credentials: 'include'});
	console.log('The following cookies have been set:');
	let cookies = await new Promise((resolve) => {
		chrome.cookies.getAll({domain: "samesitetest.com"}, resolve);
	});
	console.log(JSON.stringify(cookies, null, 1));
	console.log("fetch('https://samesitetest.com/cookies/read?test=GET', {credentials: 'include'})");
	let result = await fetch('https://samesitetest.com/cookies/read?test=GET', {credentials: 'include'});
	let doc = (new DOMParser()).parseFromString(await result.text(), 'text/html');
	console.log(doc.querySelectorAll('p')[1].innerText);
	console.log("All cookies should be present!")
}