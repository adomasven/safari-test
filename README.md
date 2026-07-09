### Safari bug samples

This is a Web Extension that showcases various bugs
in the Safari extension API. Load the extension in Firefox and click
on the extension button, which will open the test runner page where
the web extension API implementation behaves as expected.

For testing in Safari 26+, open Safari Settings, go to
Developer, and use `Add Temporary Extension...` to select this directory directly.

See files in `background` and `inject` for code. Some tests have
corresponding files in both folders, others just in one, depending
on the nature of the bug.

Capability gaps, such as unsupported DNR response-header rule conditions and
`webNavigation.onHistoryStateUpdated`, are not included as bug tests here.

##### `browser.cookies.getAll()` cannot retrieve browser-stored cookies by URL or domain (FB23657073)

Test button: `Test Cookie Retrieval (FB23657073)`

`browser.cookies.getAll({url})` and `browser.cookies.getAll({domain})` should return
cookies for sites where the extension has host permissions. On Safari, the API returns
an empty list for cookies set by a normal page. This prevents the extension from
collecting cookies needed for attachment downloads. See `background/cookie-test.js`.

Observed in Safari with a temporary extension: after setting cookies from
`https://setcookie.net/`, both `cookies.getAll({url})` and `cookies.getAll({domain})`
returned `(none)`. In Firefox, both calls returned the JavaScript-visible test cookies.

Workaround: enumerating cookie stores with `cookies.getAllCookieStores()` and passing
an explicit `storeId` to `cookies.getAll()` returns the expected cookies. Safari
reported two stores: `persistent-1` (the default data store, 0 cookies, no tabs) and
`persistent-2` (the browsing session's store, with all browser cookies and the open
tabs in `tabIds`). Calls without `storeId` -- including unfiltered
`cookies.getAll({})` -- returned nothing even after successful `storeId` queries, so
omitting `storeId` queries the empty default store rather than the store of the
browsing session. Since store IDs other than `persistent-1` are runtime-generated
session IDs, an extension has to select the store dynamically, e.g. by finding the
store whose `tabIds` contains the relevant tab.

##### `browser.i18n.getMessage()` corrupts quoted positional placeholders (FB23657112)

Test button: `Test i18n Placeholders (FB23657112)`

`browser.i18n.getMessage()` should substitute positional placeholders such as `$1`
inside strings like `<a href="$1">More information</a>`. Safari corrupts strings
where a positional placeholder is adjacent to a double quote, returning broken or
empty markup. Plain text placeholders work. See `background/i18n-test.js` and
`_locales/en/messages.json`.

Observed in Safari with a temporary extension: quoted-link placeholders failed, while
the plain `Saving $1 items` control passed.

##### JavaScript source files without a UTF-8 BOM are decoded incorrectly (FB23657149)

Test button: `Test UTF-8 Source Without BOM (FB23657149)`

Safari misdecodes non-ASCII JavaScript string literals in extension source files that
do not start with a UTF-8 BOM. This requires an additional build step that prepends
a BOM to generated Safari extension JavaScript files. See `background/utf8-bom-test.js`.

Observed in Safari with a temporary extension: the expected escaped string
`✕’ąŠ` differed from the literal loaded from a non-BOM JavaScript source file, which
was displayed as mojibake.

##### `browser.tabs.sendMessage` does not receive responses from injected extension frames (FB23657166)

Test button: `Test Frame Message (FB23657166)`

If an extension injects a web-accessible extension HTML page as a frame into a normal web page,
that frame can appear in `browser.webNavigation.getAllFrames`, but `browser.tabs.sendMessage`
does not receive its response. This happens both when broadcasting to all frames in the tab and
when targeting the injected extension frame by `frameId`. See `background/frame-message.js`,
`frame-message.html`, and `inject/frame-message.js`.

##### `browser.webRequest.headersReceived` `details.url` is wrong after a 302 redirect (FB23657175)

Test button: `Test Headers Received (FB23657175, FB23657190)`

`browser.webRequest.headersReceived` handlers receive the wrong URL (pre-redirect) for the
200 request directly after a 302 redirect. See `background/headers-received.js`.

##### `browser.webRequest.headersReceived` event is not triggered for navigations from newtab page (FB23657190)

Test button: `Test Headers Received (FB23657175, FB23657190)`

If you open a new tab and navigate to any page, headersReceived events for the initial navigation
are not triggered. They are triggered for subsequent navigations on that tab.
