### Safari bug samples

This is a Web Extension that showcases various bugs
in the Safari extension API. Load the extension in Chrome and click
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

##### Bad symbol encoding (FB9154698) - FIXED

~~If you run console.log() or attempt to send via the messaging system string literals
which include non-ASCII symbols from the background page they come out garbled. Use
`Test Bad Encoding` to reproduce the bug and see `background/char-encoding.js`~~

This bug has been fixed.

##### HTTP-Only cookies not available to extensions (FB9154760)

The `browser.cookies` APIs do not return HTTP-only cookies. When performing an XHR
in a background page HTTP-only cookies are not sent, i.e. the background page is
not considered same-origin to pages where the extension has permissions to be active.
Use `Test Cookies` to reproduce the bug and see `background/cookie-test.js`.

##### `browser.runtime.onMessage` listener does not support Promise responses (FB8735852) - FIXED

~~If a `browser.runtime.onMessage` callback returns a promise then the message sender should
receive the result of the promise resolution. Instead `undefined` is immediately returned
to the message sender. Use `Test Promise Messaging` to reproduce the bug and see
`background/promise-message.js` and `inject/promise-message.js`.~~

This bug has been fixed.

##### `browser.tabs.sendMessage` does not receive responses from injected extension frames

If an extension injects a web-accessible extension HTML page as a frame into a normal web page,
that frame can appear in `browser.webNavigation.getAllFrames`, but `browser.tabs.sendMessage`
does not receive its response. This happens both when broadcasting to all frames in the tab and
when targeting the injected extension frame by `frameId`. Use `Test Frame Message` to reproduce
and see `background/frame-message.js`, `frame-message.html`, and `inject/frame-message.js`.

##### `browser.webRequest.headersReceived` top frame ID not reported as 0 (FB8735832)

~~`browser.webRequest.headersReceived` (and other `webRequest`) handlers for top frame receive
a random number at `details.frameId` instead of 0 as per the spec. Use `Test Headers Received`
to reproduce and see `background/headers-received.js`.~~

This bug has been fixed

##### `browser.webRequest.headersReceived` `details.url` is wrong after a 302 redirect (FB9154838)

`browser.webRequest.headersReceived` handlers receive the wrong URL (pre-redirect) for the
200 request directly after a 302 redirect. Use `Test Headers Received` to reproduce and see
`background/headers-received.js`.

##### `browser.webRequest.headersReceived` event is not triggered for navigations from newtab page

If you open a new tab and navigate to any page, headersReceived events for the initial navigation
are not triggered. They are triggered for subsequent navigations on that tab.
