### Safari bug samples

This is a Web Extension that showcases various bugs
in the Safari extension API. Load the extension in Firefox and click
on the extension button, which will open the test runner page.
 
For Safari use
```
xcrun safari-web-extension-converter ./safari-test
```
then open the generated project in XCode, run it, then open Safari, enable
unsigned extensions under Develop, then click the extension button.

See files in `background` and `inject` for code. Some tests have
corresponding files in both folders, others just in one, depending
on the nature of the bug.

##### Failing messaging (FB9154679)

One of the tests involves a `manifest.json` change. Replace `manifest.json` with
`manifest.json-broken`. The test page will still work in Firefox but will
become completely broken in Safari. This is because if you add a content script
in `manifest.json` then message listeners on internal extension pages break.
If you go to https://www.zotero.org and press the extension button, note that
message listeners for the content page still work.

##### Bad character encoding (FB9154698)

In a background script saved as UTF-8, if you run console.log() or attempt to
send via the messaging system string literals that include Unicode characters,
they can come out garbled. Adding a UTF-8 BOM to the file fixes it, but Chrome
and Firefox interpret as UTF-8 without that. Use `Test Bad Encoding`
to reproduce and see `background/char-encoding.js`

##### HTTP-Only cookies not available to extensions (FB9154760)

The `browser.cookies` APIs do not return HTTP-only cookies. When performing an XHR
in a background page HTTP-only cookies are not sent, i.e. the background page is
not considered same-origin to pages where the extension has permissions to be active.
Use `Test Cookies` to reproduce the bug and see `background/cookie-test.js`.

##### `browser.runtime.onMessage` listener does not support Promise responses (FB8735852)

If a `browser.runtime.onMessage` callback returns a promise then the message sender should
receive the result of the promise resolution. Instead `undefined` is immediately returned
to the message sender. Use `Test Promise Messaging` to reproduce the bug and see
`background/promise-message.js` and `inject/promise-message.js`.

##### `browser.webRequest.headersReceived` top frame ID not reported as 0 (FB8735832)

`browser.webRequest.headersReceived` (and other `webRequest`) handlers for top frame receive
a random number at `details.frameId` instead of 0 as per the spec. Use `Test Headers Received`
to reproduce and see `background/headers-received.js`.

##### `browser.webRequest.headersReceived` `details.url` is wrong after a 302 redirect (FB9154838)

`browser.webRequest.headersReceived` handlers receive the wrong URL (pre-redirect) for the
200 request directly after a 302 redirect. Use `Test Headers Received`
to reproduce and see `background/headers-received.js`.
