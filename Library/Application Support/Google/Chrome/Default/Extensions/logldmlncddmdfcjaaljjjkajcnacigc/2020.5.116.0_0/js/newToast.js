var elem = document.createElement('div');
elem.setAttribute('id', 'toast_div');
document.body.insertBefore(elem, document.body.firstChild);
//NOTE(Thompson): "Why do we call on undefined?", you may ask. This value is an structured cloned data (an expression of the last evaluated statement)
//and it needs to be returned from tabs.executeScript(), because we're calling on a function callback after tabs.executeScript() is executed.
//https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/executeScript#Return_value
undefined;