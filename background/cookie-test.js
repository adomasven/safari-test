async function testCookies() {
	console.log('Testing whether background fetch sends cookies');
	console.log("fetch('https://samesitetest.com/cookies/set', {credentials: 'include'})");
	await fetch('https://samesitetest.com/cookies/set', {credentials: 'include'});
	console.log('The following cookies have been set:');
	let cookies = await new Promise((resolve) => {
		chrome.cookies.getAll({domain: "samesitetest.com"}, resolve);
	});
	console.log(JSON.stringify(cookies));
	console.log("fetch('https://samesitetest.com/cookies/read?test=GET', {credentials: 'include'})");
	let result = await fetch('https://samesitetest.com/cookies/read?test=GET', {credentials: 'include'});
	let doc = (new DOMParser()).parseFromString(await result.text(), 'text/html');
	console.log(doc.querySelectorAll('p')[1].innerText);
	console.log("Strict and Lax cookies should be ticks!")
}