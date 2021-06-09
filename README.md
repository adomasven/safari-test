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

##### Failing messaging test

One of the tests involves a `manifest.json` change. Replace `manifest.json` with
`manifest.json-broken`. The test page will still work in Firefox but will
become completely broken in Safari. This is because if you add a content script
in `manifest.json` then message listeners on internal extension pages break.
If you go to https://www.zotero.org and press the extension button, note that
message listeners for the content page still work.