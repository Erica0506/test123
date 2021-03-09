var disabledExtensionsList = document.getElementById('bfrl_disableExtensionList');
var isChrome = window.openDatabase ? true : false; //For avoiding Obfuscation bugs.
var manageExtensionsLink = document.getElementById('bfrl_aManageExtensions');

if (!isChrome) {
    //In Firefox, we disable the link to the add-ons managing system pages, because we don't have optional permissions to manage extensions.
    manageExtensionsLink.style.display = "none";
}
else {
    manageExtensionsLink.style.display = "block";
    manageExtensionsLink.addEventListener("click", function (event) {
        if (isChrome) {
            dstool.OpenExtensionsPage();
        }
    });
}
function _CreateDisabledItem(extension) {
	if (!extension) {
		return;
	}

	//Container
	let itemDiv = document.createElement("div");
	itemDiv.classList.add("bfrl_disableListItem");

	//Unique id
	itemDiv.setAttribute("id", extension.id);

	//Disabled Flag div
	let spanInfoCheck = document.createElement("span");
	spanInfoCheck.id = "infoIcon";
	//---
	spanInfoCheck.classList.add("icon-checkmark-full");
	spanInfoCheck.classList.add("bfrl_textIconTweak");
	let spanInfoCheckText = document.createElement("span");
	spanInfoCheckText.classList.add("bfrl_textStringDisabledFlag");
	spanInfoCheckText.innerText = "DISABLED";
	//---
	let disabledFlagContainer = document.createElement("div");
	disabledFlagContainer.classList.add("bfrl_disabledFlag");
	disabledFlagContainer.appendChild(spanInfoCheck);
	disabledFlagContainer.appendChild(spanInfoCheckText);
	disabledFlagContainer.appendChild(document.createElement("br"));
	itemDiv.appendChild(disabledFlagContainer);

	//Disabled Extension Title
	let spanTitle = document.createElement("span");
	spanTitle.classList.add("bfrl_disableListItemTitle");
	spanTitle.innerText = extension.name;
	itemDiv.appendChild(spanTitle);
	itemDiv.appendChild(document.createElement("br"));
	itemDiv.appendChild(document.createElement("br"));

	//Disabled Extension Description
	let spanDesc = document.createElement("span");
	spanDesc.classList.add("bfrl_disableListItemDescription");
	spanDesc.innerText = extension.description;
	itemDiv.appendChild(spanDesc);
	itemDiv.appendChild(document.createElement("br"));

	//Remove button
	let removeButton = document.createElement("button");
	removeButton.classList.add("bfrl_uninstall");
	removeButton.classList.add("bfrl_disableButtonRemove");
	removeButton.type = "button";
	removeButton.innerText = "Remove";
	removeButton.addEventListener("click", function (event) {
		_sendDisablingMessage("uninstall", {
			extension: extension
		}, function (uninstalledExtension) {
			if (uninstalledExtension) {
				let divs = document.querySelectorAll("#" + uninstalledExtension.id);
				let list = divs[0].parentNode;
				for (let i = 0; i < divs.length; i++) {
					list.removeChild(divs[i]);
				}
			}
			if (disabledExtensionsList && disabledExtensionsList.childElementCount <= 0) {
				dstool.OpenDialog({
					newWidth: 400,
					newHeight: 235,
					newURL: "disable/disable_page3.html" + "?localparent=" + disableParams["localparent"]
				}, false);
			}
		});
	});
	itemDiv.appendChild(removeButton);

	//End container
	return itemDiv;
}

function _CreateDisableHorizontalRule(id) {
	let divSection = document.createElement("div");
	divSection.id = id;
	divSection.classList.add("bfrl_greydivSection");
	let divRule = document.createElement("div");
	divRule.classList.add("bfrl_horizontalRule");
	divSection.appendChild(divRule);
	return divSection;
}

//NOTE(Thompson): We need to first grab the queried data string from the URL, that was passed along from the disable_page1.js. 
let query = disableParams["q"];

if (query && query !== "" && query.length > 0) {
	//NOTE(Thompson): If the query string exists, we then show a list of the results to the user.
	results = JSON.parse(query);
	for (let i = 0; i < results.length; i++) {
		let extension = results[i];
		let item = _CreateDisabledItem(extension);
		disabledExtensionsList.appendChild(item);
		if (i != results.length - 1) {
			let rule = _CreateDisableHorizontalRule(extension.id);
			disabledExtensionsList.appendChild(rule);
		}
	}
}