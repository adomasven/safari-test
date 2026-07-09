const COOKIE_TEST_URL = 'https://setcookie.net/';
const COOKIE_RETRIEVAL_NAME = 'safariTestCookieRetrieval';

function createCookieTestRun() {
	let token = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
	return {
		retrievalValue: `retrieval-${token}`
	};
}

function getCookies(details) {
	return new Promise((resolve) => chrome.cookies.getAll(details, resolve));
}

function getCookieStores() {
	return new Promise((resolve) => chrome.cookies.getAllCookieStores(resolve));
}

function removeCookie(details) {
	return new Promise((resolve) => chrome.cookies.remove(details, resolve));
}

function createTab(url) {
	return new Promise((resolve) => chrome.tabs.create({url}, resolve));
}

function removeTab(tabId) {
	return new Promise((resolve) => chrome.tabs.remove(tabId, resolve));
}

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(promise, ms, label) {
	return Promise.race([
		promise,
		delay(ms).then(() => {
			throw new Error(`${label} timed out`);
		})
	]);
}

function executeScript(tabId, code) {
	return new Promise((resolve, reject) => {
		chrome.tabs.executeScript(tabId, {code}, (result) => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
				return;
			}
			resolve(result);
		});
	});
}

async function withCookieTestTab(fn) {
	let tab = await createTab(COOKIE_TEST_URL);
	try {
		await delay(2000);
		return await fn(tab);
	}
	finally {
		await removeTab(tab.id);
	}
}

async function setBrowserCookies(testRun) {
	await withCookieTestTab(async (tab) => {
		console.log(`Setting browser cookies from a page at ${COOKIE_TEST_URL}`);
		await executeScript(tab.id, `
			document.cookie = ${JSON.stringify(`${COOKIE_RETRIEVAL_NAME}=${testRun.retrievalValue}; path=/; SameSite=None; Secure`)};
		`);
	});
}

async function clearBrowserCookies() {
	console.log('Clearing test cookies');
	try {
		await withTimeout(removeCookie({url: COOKIE_TEST_URL, name: COOKIE_RETRIEVAL_NAME}), 1000, `cookies.remove() for ${COOKIE_RETRIEVAL_NAME}`);
	}
	catch (e) {
		console.log(`Ignoring cookies.remove() failure for ${COOKIE_RETRIEVAL_NAME}: ${e.message}`);
	}

	await withCookieTestTab(async (tab) => {
		await executeScript(tab.id, `
			document.cookie = ${JSON.stringify(`${COOKIE_RETRIEVAL_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure`)};
		`);
	});
}

function logCookieNames(label, cookies) {
	console.log(`${label}: ${cookies.length ? cookies.map((cookie) => `${cookie.name} = ${cookie.value}`).join(', ') : '(none)'}`);
}

async function testCookieRetrieval() {
	console.log('Testing browser.cookies.getAll() for browser-stored cookies');
	await clearBrowserCookies();
	try {
		let testRun = createCookieTestRun();
		await setBrowserCookies(testRun);

		let matchesTestCookie = (cookie) => cookie.name === COOKIE_RETRIEVAL_NAME && cookie.value === testRun.retrievalValue;

		let byUrl = await getCookies({url: COOKIE_TEST_URL});
		let byDomain = await getCookies({domain: 'setcookie.net'});

		logCookieNames('cookies.getAll({url}) returned', byUrl);
		console.log(`cookies.getAll({url}) result: ${formatTestResult(byUrl.some(matchesTestCookie))}`);

		logCookieNames('cookies.getAll({domain}) returned', byDomain);
		console.log(`cookies.getAll({domain}) result: ${formatTestResult(byDomain.some(matchesTestCookie))}`);

		console.log('Testing workaround: cookies.getAll() with explicit storeId for each cookie store');
		let stores;
		try {
			stores = await withTimeout(getCookieStores(), 5000, 'cookies.getAllCookieStores()');
		}
		catch (e) {
			console.log(`cookies.getAllCookieStores() failed: ${e.message}`);
			stores = null;
		}

		if (!stores || !stores.length) {
			console.log(`cookies.getAllCookieStores() returned ${stores ? 'no stores' : 'nothing'}`);
			console.log(`cookies.getAll({url, storeId}) result: ${formatTestResult(false)}`);
			console.log(`cookies.getAll({domain, storeId}) result: ${formatTestResult(false)}`);
		}
		else {
			console.log(`cookies.getAllCookieStores() returned ${stores.length} store(s): ${stores.map((store) => `${store.id} (tabIds: [${store.tabIds ? store.tabIds.join(', ') : ''}])`).join(', ')}`);

			let byUrlWithStore = [];
			let byDomainWithStore = [];
			for (let store of stores) {
				let storeCookies = await getCookies({storeId: store.id});
				console.log(`cookies.getAll({storeId: '${store.id}'}) returned ${storeCookies.length} cookie(s) total`);
				let urlCookies = await getCookies({url: COOKIE_TEST_URL, storeId: store.id});
				logCookieNames(`cookies.getAll({url, storeId: '${store.id}'}) returned`, urlCookies);
				byUrlWithStore.push(...urlCookies);
				byDomainWithStore.push(...await getCookies({domain: 'setcookie.net', storeId: store.id}));
			}

			logCookieNames('cookies.getAll({url, storeId}) returned', byUrlWithStore);
			console.log(`cookies.getAll({url, storeId}) result: ${formatTestResult(byUrlWithStore.some(matchesTestCookie))}`);

			logCookieNames('cookies.getAll({domain, storeId}) returned', byDomainWithStore);
			console.log(`cookies.getAll({domain, storeId}) result: ${formatTestResult(byDomainWithStore.some(matchesTestCookie))}`);
		}

		console.log('Testing workaround: unfiltered cookies.getAll({}) with manual filtering');
		let allCookies = await getCookies({});
		console.log(`cookies.getAll({}) returned ${allCookies.length} cookie(s)`);
		let manuallyFiltered = allCookies.filter((cookie) => cookie.domain && cookie.domain.replace(/^\./, '').endsWith('setcookie.net'));
		logCookieNames('cookies.getAll({}) filtered to setcookie.net', manuallyFiltered);
		console.log(`cookies.getAll({}) manual filter result: ${formatTestResult(manuallyFiltered.some(matchesTestCookie))}`);

		console.log('Testing workaround: retrying plain cookies.getAll() after the calls above');
		let byUrlRetry = await getCookies({url: COOKIE_TEST_URL});
		logCookieNames('cookies.getAll({url}) retry returned', byUrlRetry);
		console.log(`cookies.getAll({url}) retry result: ${formatTestResult(byUrlRetry.some(matchesTestCookie))}`);
	}
	finally {
		await clearBrowserCookies();
	}
}
