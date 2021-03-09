//Copyright © 2011-2018 Capital Intellect Inc. All Rights Reserved 
//Patents Pending 
var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.arrayIteratorImpl=function(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}};$jscomp.arrayIterator=function(a){return{next:$jscomp.arrayIteratorImpl(a)}};$jscomp.makeIterator=function(a){var b="undefined"!=typeof Symbol&&Symbol.iterator&&a[Symbol.iterator];return b?b.call(a):$jscomp.arrayIterator(a)};$jscomp.arrayFromIterator=function(a){for(var b,d=[];!(b=a.next()).done;)d.push(b.value);return d};
$jscomp.arrayFromIterable=function(a){return a instanceof Array?a:$jscomp.arrayFromIterator($jscomp.makeIterator(a))};
var IS_CHROME=!0,MAX_STORE_NAME_LENGTH=28,sitesList=document.getElementById("searchSitesList"),emptyMessage=document.getElementById("whenEmpty"),sptool=chrome.extension.getBackgroundPage().shoptoolbar,dstool=chrome.extension.getBackgroundPage().DisableSystem,bfrltool=chrome.extension.getBackgroundPage().BfrlTool,autotool=chrome.extension.getBackgroundPage().AutoApplyApp,pftool=bfrltool.Prefs,closeSettingsButton=document.getElementById("closeSettingsButton"),removeAllButton=document.getElementById("buttonRemoveAll"),
searchInputbox=document.getElementById("searchSitesInputBox"),searchSuggestionsList=document.getElementById("searchSuggestions"),_SearchListeners={},_EndTextListeners={},_EndTextOutListeners={},_TemporaryDisableNotifyList={},saveNewHideNotifyList=function(){bfrltool.BrowserStorage.TurnOffNotifications=JSON.stringify(_TemporaryDisableNotifyList)},_AddItemToDisableNotifyList=function(a,b,d,c){_TemporaryDisableNotifyList[d]={retailerName:a,internalName:b,retailerLogo:c}},_RemoveItemFromDisableNotifyList=
function(a){delete _TemporaryDisableNotifyList[a]},_Format=function(a){var b=Array.prototype.slice.call(arguments,1);return a.replace(/{(\d+)}/g,function(a,c){return"undefined"!=typeof b[c]?b[c]:a})},GetSearchAutoComplete=function(a,b){a=_Format("https://{0}/SearchOffers/search.asmx/GetCompletionListMultiJSON?contextKey={1}&count={2}&prefixText={3}","www.befrugal.com","toolbar-js",20,encodeURIComponent(a));var d=new XMLHttpRequest;d.open("GET",a);d.onload=function(a){var c=JSON.parse(d.responseText);
a=[];for(var e in c)if(-1!==c[e].SearchInternalID&&(a=a.filter(function(a){return a&&a!==c[e]}),a.push(c[e]),10<=a.length))break;b(a)};try{d.overrideMimeType("application/json")}catch(c){}try{d.send(null)}catch(c){}},addDivToSitesList=function(a,b,d,c){sitesList.classList.contains("custom-scrollable")||(sitesList.classList.add("custom-scrollable"),window.SimpleScrollbar.initEl(sitesList));var k=sitesList.querySelector(".ss-content");-1===c.toLowerCase().indexOf("https:")&&(c="https:"+c);var e=document.createElement("div");
e.className="bfslider_clearFix";var f=document.createElement("div");f.style="padding: 0 20px; line-height: 50px; height: 50px;";f.classList="item";var g=document.createElement("span");g.style="padding-left: 15px;";var l=document.createElement("div");l.classList="floatLeft";l.style="height: 50px; line-height: 50px; vertical-align: middle;";var p=document.createElement("img");p.style="display: inline-block; height: 45px; vertical-align: middle;";p.src=c;var m=document.createElement("span");m.classList=
"storeName";m.style="padding-left: 10px; font-weight: 500; vertical-align: middle;";var q=document.createElement("span");q.classList="floatRight";var r=document.createElement("span");r.id="removeButtonContainer";var h=document.createElement("div");h.id="removeButton";h.classList="removeButtonStyle";h.style="padding: 0 14px; line-height: 50px; cursor: pointer; vertical-align: middle;";var n=document.createElement("span");n.classList="btnclose";var t=document.createElement("span");t.classList="icon-trash";
t.style="font-size: 150%; position: relative; top: 3px; margin-right: 5px;";var v=document.createElement("span");v.innerText="Remove";var u=document.createElement("div");u.classList="horizontalRule_dashed";u.style="height: 1px; border-bottom: 1px dashed #ddd;";a.length>MAX_STORE_NAME_LENGTH&&(a=a.substring(0,MAX_STORE_NAME_LENGTH-3)+"...");m.innerText=a;h.addEventListener("click",function(a){sitesList.classList.contains("custom-scrollable")||(sitesList.classList.add("custom-scrollable"),window.SimpleScrollbar.initEl(sitesList));
a=sitesList.querySelector(".ss-content");_RemoveItemFromDisableNotifyList(d);saveNewHideNotifyList();for(var b=h.parentElement;0>b.className.indexOf("item");)b=b.parentElement;b.parentElement.parentElement.removeChild(b.parentElement);b=[].concat($jscomp.arrayFromIterable(sitesList.querySelectorAll("div")));if(0>=b.length)emptyMessage.style.display="block";else if(emptyMessage.style.display="none",b=b[0].querySelector(".horizontalRule_dashed"))b.style.display="none";removeAllButton.style.display=
"block";2>=a.childElementCount&&(removeAllButton.style.display="none")});n.appendChild(t);n.appendChild(v);h.appendChild(n);r.appendChild(h);q.appendChild(r);l.appendChild(p);l.appendChild(m);g.appendChild(l);g.appendChild(q);f.appendChild(g);f.appendChild(u);e.appendChild(f);e.style.lineHeight="40px";e.setAttribute("listId",sitesList.children.length);e.setAttribute("RetailerName",a);e.setAttribute("InternalName",b);e.setAttribute("RetailerLogo",c);e.setAttribute("RetailerID",d);k.appendChild(e);
removeAllButton.style.display="block";2>=k.childElementCount&&(removeAllButton.style.display="none")},suggestionListen=function(a,b){a.removeEventListener("click",_SearchListeners[b]);var d=function(){var a=document.getElementById("suggestionText"+b),d=a.getAttribute("RetailerName"),e=a.getAttribute("InternalName"),f=a.getAttribute("RetailerLogo");a=a.getAttribute("RetailerID");if(!(0<[].concat($jscomp.arrayFromIterable(sitesList.querySelectorAll("div[retailername]"))).filter(function(a){return a&&
a.getAttribute("retailername")===d}).length)&&(_AddItemToDisableNotifyList(d,e,a,f),saveNewHideNotifyList(),searchSuggestionsList.style.display="none",searchInputbox.value="",addDivToSitesList(d,e,a,f),e=[].concat($jscomp.arrayFromIterable(sitesList.querySelectorAll("div"))),0<e.length)){emptyMessage.style.display="none";if(e=e[0].querySelector(".horizontalRule_dashed"))e.style.display="none";sitesList.classList.add("custom-scrollable");window.SimpleScrollbar.initEl(sitesList)}};a.addEventListener("click",
d);_SearchListeners[b]=d};if(sitesList.hasChildNodes()){var nodeArray=[].concat($jscomp.arrayFromIterable(sitesList.childNodes));0<nodeArray.filter(function(a){return a&&a.className&&-1<a.className.indexOf("store")}).length&&(emptyMessage.style.display="none")}
removeAllButton.addEventListener("click",function(a){a=[].concat($jscomp.arrayFromIterable(sitesList.querySelectorAll("div[listid]")));for(var b=0;b<a.length;b++)_RemoveItemFromDisableNotifyList(a[b].getAttribute("RetailerID")),a[b].parentElement.removeChild(a[b]);saveNewHideNotifyList();emptyMessage.style.display="block";removeAllButton.style.display="none"});
function closeTab(a){sptool.GetBrowser()===sptool.Browsers.Chrome?window.close():sptool.GetBrowser()===sptool.Browsers.Edge?browser.tabs.query({},function(a){if(a&&0<a.length)for(var b=0;b<a.length;b++){var c=a[b].url;if(-1<c.indexOf(browser.runtime.id)&&-1<c.indexOf("searchSites")){browser.tabs.remove(a[b].id);break}}}):browser.tabs.query({active:!0,url:browser.extension.getURL("*")}).then(function(a){a&&0<a.length&&browser.tabs.remove(a[0].id)})}closeSettingsButton.addEventListener("click",closeTab);
null!=searchInputbox&&searchInputbox.addEventListener("input",function(){""!==searchInputbox.value?GetSearchAutoComplete(searchInputbox.value,function(a){if(null!=a&&0<a.length){searchSuggestionsList.style.display="block";var b;for(b=0;10>b;b++){document.getElementById("suggestionText"+b).innerText="";var d=document.getElementById("searchSuggestion"+b);d.style.visibility="hidden";d.style.backgroundColor="";d.style.padding="0px"}for(b=0;b<a.length&&10>b;b++){d=document.getElementById("searchSuggestion"+
b);d.style.visibility="visible";var c=document.getElementById("suggestionText"+b);c.innerText=a[b].SearchFriendlyName;c.setAttribute("RetailerName",a[b].SearchFriendlyName);c.setAttribute("InternalName",a[b].SearchInternalName);c.setAttribute("RetailerLogo",a[b].TemplateParameters[3]);c.setAttribute("RetailerID",a[b].SearchInternalID);suggestionListen(d,b);(d=document.getElementById("item"+b))&&d.style&&(d.style.borderBottom="1px dashed #DDDDDD",b>=a.length-1&&(d.style.borderBottom="0px dashed #DDDDDD"))}}else searchSuggestionsList.style.display=
"none"}):searchSuggestionsList.style.display="none"});searchInputbox.addEventListener("focus",function(){searchInputbox.setAttribute("placeholder","");searchInputbox.style.backgroundImage="none"});
searchInputbox.addEventListener("blur",function(){setTimeout(function(){searchInputbox.setAttribute("placeholder","Search and click on the store to add to the list");searchInputbox.style.background="url(../magnifying-glass.png) no-repeat white";searchInputbox.style.backgroundPosition="calc(100% - 5px) center";searchInputbox.value="";searchSuggestionsList.style.display="none"},200)});
searchInputbox.addEventListener("keydown",function(a){if("block"===document.getElementById("searchSuggestions").style.display){if("ArrowUp"===a.key||"ArrowDown"===a.key||"Enter"===a.key){for(var b=null,d=null,c=null,k=!1,e=[].concat($jscomp.arrayFromIterable(document.querySelectorAll("#suggestionsList li"))),f=0;f<e.length;f++)if(""!==e[f].style.backgroundColor){k=!0;f=e.filter(function(a){return"hidden"!==a.style.visibility});for(var g=0;g<f.length;g++)if(""!==f[g].style.backgroundColor){b=f[g];
0<g&&f[g-1]&&(d=f[g-1]);g<e.length-1&&f[g+1]&&(c=f[g+1]);break}break}if(k)"ArrowUp"===a.key?null!=d&&(d.style.backgroundColor=b.style.backgroundColor,b.style.backgroundColor=""):"ArrowDown"===a.key?null!=c&&(c.style.backgroundColor=b.style.backgroundColor,b.style.backgroundColor=""):null!=b&&(b.style.backgroundColor="",b.dispatchEvent(new Event("click")));else{for(a=0;a<e.length;a++)e[a].style.backgroundColor="";e[0].style.backgroundColor="#E6F2FB"}}}else for(e=[].concat($jscomp.arrayFromIterable(document.querySelectorAll("#suggestionsList li"))),
a=0;a<e.length;a++)e[a].style.backgroundColor=""});
window.addEventListener("load",function(a){emptyMessage.style.display="block";removeAllButton.style.display="none";setTimeout(function(){sitesList.classList.contains("custom-scrollable")||(sitesList.classList.add("custom-scrollable"),window.SimpleScrollbar.initEl(sitesList));var a=sitesList.querySelector(".ss-content");bfrltool.BrowserStorage.TurnOffNotifications.then(function(b){if(b){b=JSON.parse(b);for(var c in b)addDivToSitesList(b[c].retailerName,b[c].internalName,c,b[c].retailerLogo),_AddItemToDisableNotifyList(b[c].retailerName,
b[c].internalName,c,b[c].retailerLogo),emptyMessage.style.display="none";c=[].concat($jscomp.arrayFromIterable(a.querySelectorAll("div")));0<c.length&&(emptyMessage.style.display="none",c=c[0].querySelector(".horizontalRule_dashed"))&&(c.style.display="none");2<a.childElementCount&&(removeAllButton.style.display="block")}else removeAllButton.style.display="none"})},1)});
