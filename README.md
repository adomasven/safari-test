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