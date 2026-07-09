function testI18nPlaceholders() {
	console.log('Testing browser.i18n.getMessage() with placeholders adjacent to double quotes');

	const tests = [
		{
			name: 'placeholder inside href attribute',
			message: 'i18n_linkWithPlaceholder',
			substitutions: ['https://www.zotero.org/support/'],
			expected: '<a href="https://www.zotero.org/support/">More information</a>'
		},
		{
			name: 'two placeholders with quoted attribute',
			message: 'i18n_twoQuotedPlaceholders',
			substitutions: ['https://www.zotero.org/support/kb', 'Knowledge Base'],
			expected: '<a target="_blank" href="https://www.zotero.org/support/kb">Knowledge Base</a>'
		},
		{
			name: 'plain text placeholder control',
			message: 'i18n_plainPlaceholder',
			substitutions: ['3'],
			expected: 'Saving 3 items'
		}
	];

	for (let test of tests) {
		let actual = chrome.i18n.getMessage(test.message, test.substitutions);
		console.log(`${test.name}:`);
		console.log(`  expected: ${test.expected}`);
		console.log(`  actual:   ${actual}`);
		console.log(`  result:   ${formatTestResult(actual === test.expected)}`);
	}
}
