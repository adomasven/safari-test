function testUTF8SourceWithoutBOM() {
	const expected = "UTF-8 literal without BOM: \u2715\u2019\u0105\u0160";
	const actual = "UTF-8 literal without BOM: ✕’ąŠ";

	console.log('Testing UTF-8 source decoding for a JavaScript file without a BOM');
	console.log(`Expected: ${expected}`);
	console.log(`Actual:   ${actual}`);
	console.log(`Result:   ${formatTestResult(actual === expected)}`);
}
