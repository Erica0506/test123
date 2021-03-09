var instructionsWrapper = function () {
	return {
		IsFirefox: false,
		curElems: [],
		retailerName: "",
		pageType: "",
		viewportRatio: 1,
		IsEdgium: function () {
		    let hasUserAgent = typeof window !== 'undefined' && typeof window.navigator !== 'undefined' && typeof window.navigator.userAgent !== 'undefined';
		    return (hasUserAgent && window && window.Navigator && window.navigator.userAgent && /edg/i.test(window.navigator.userAgent));
		},
		getCookie: function (name) {
			var value = "; " + document.cookie;
			var parts = value.split("; " + name + "=");
			if (parts.length == 2) return parts.pop().split(";").shift();
		},
		addOverlay: function () {
			if (document.getElementById("instructionOverlay") == null) {
				var elemDiv = document.createElement('div');
				elemDiv.id = "instructionOverlay";
				elemDiv.style.cssText = 'position:absolute;width:100%;height:100%;z-index:2001;background:rgba(0, 0, 0, 0.8);top: 0;';
				window.document.body.insertBefore(elemDiv, window.document.body.firstChild);
			}
			else
				document.getElementById("instructionOverlay").style.display = "block";
		},
		createImageElem: function (imageName, width, height) {
			var imagePath = chrome.extension.getURL("/instructionImages/" + imageName);
			var img = document.createElement('img');
			img.src = imagePath;
			img.style.zIndex = "1002";
			img.style.width = width + "px";
			img.style.height = height + "px";
			return img;
		},
		createTextElem: function (text) {
			var span = document.createElement('span');
			span.innerText = text;
			span.style.color = "white";
			span.style.zIndex = "1002";
			span.style.fontFamily = "Kalam";
			return span;
		},
		createTableElem: function (rows, cols) {
			var table = document.createElement('div');
			table.style.zIndex = "1002";
			table.style.marginTop = "0px";
			table.style.position = "absolute";
			table.style.display = "table";

			for (var i = 0; i < rows; i++) {
				var row = document.createElement('div');
				row.id = "row" + (i + 1);
				row.style.paddingTop = 10 * instructionsWrapper.viewportRatio + "px";
				row.style.paddingBottom = 10 * instructionsWrapper.viewportRatio + "px";
				row.style.display = "table-row";
				row.style.width = "100%";
				row.style.textAlign = "start";

				for (var j = 0; j < cols; j++) {
					var col = document.createElement('div');
					col.id = row.id + "col" + (j + 1);
					col.style.display = "table-cell";
					row.appendChild(col);
				}

				table.appendChild(row);
			}
			return table;
		},
		clearElems: function () {
			while (instructionsWrapper.curElems.length > 0) {
				var cur = instructionsWrapper.curElems[0];
				cur.parentNode.removeChild(cur);
				instructionsWrapper.curElems.splice(0, 1);
			}
		},
		getInternalFromCookie: function (cookie) {
			if (cookie != null && cookie.indexOf("store") != -1) {
				var firstBit = "/store/";
				var endBit = "-coupons/";
				var name = cookie.replace(firstBit, "").replace(endBit, "");
				return name;
			}
			else
				return null;
		},
		closeTour: function () {
			//We revert the scrollbar behaviors here when exiting the Tour Mode.
			document.body.style.overflow = "auto";

			instructionsWrapper.clearElems();
			var overlay = document.getElementById("instructionOverlay");
			overlay.style.display = "none";
		},
		initialize: function () {
			instructionsWrapper.viewportRatio = (window.innerWidth / window.outerWidth);
			//FF Replace begin
			var viewportHandler = function () {
				instructionsWrapper.viewportRatio = (window.innerWidth / window.outerWidth);
			}
			window.visualViewport.addEventListener('resize', viewportHandler);
			//FF Replace end

			var elemLink = document.createElement("link");
			elemLink.href = "https://fonts.googleapis.com/css?family=Kalam";
			elemLink.rel = "stylesheet";
			window.document.head.insertBefore(elemLink, window.document.head.firstChild);

			chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
				if (message.instruction == "Get internal") {
					var cookie = instructionsWrapper.getCookie("ToolbarPage.WelcomePageStyle");
					var parsed = null;
					if (cookie != null)
						parsed = JSON.parse(cookie);
					if (parsed != null)
						sendResponse({ internalName: parsed.Name, type: parsed.PageStyleType });
					else
						sendResponse({ internalName: "mcdonalds", type: "" });
				}
				else if (message.instruction == "Step one") {
					instructionsWrapper.retailerName = message.retailerName;
					instructionsWrapper.stepOne(message.pageType);
				}
				else if (message.instruction == "PopupOpened")
					instructionsWrapper.stepTwo();
				else if (message.instruction == "ClickedRestaurants")
					instructionsWrapper.stepThree(message.NoCashBack);
				else if (message.instruction == "OpeningCoupons")
					instructionsWrapper.stepFour();
				else if (message.instruction == "CloseTour")
					instructionsWrapper.closeTour();
				else if (message.instruction == "TourFinished")
					instructionsWrapper.closeTour();
			});


		},
		stepOne: function (pageType) {
			instructionsWrapper.pageType = pageType;

			instructionsWrapper.clearElems();

			let oldOverlay = document.querySelector(".modalBackgroundDark:not([style*='display'])");
			if (oldOverlay) oldOverlay.style.display = "none";

			//We hide the scrollbar to prevent users from scrolling out of the view of the Tour Mode.
			document.body.style.overflow = "hidden";

			instructionsWrapper.addOverlay();
			var overlay = document.getElementById("instructionOverlay");
			document.body.scrollTop = "0";
			window.scrollTo(0, 0);

			var table = instructionsWrapper.createTableElem(3, 2);

			if (instructionsWrapper.IsFirefox) {
				table.style.right = (115 * instructionsWrapper.viewportRatio) + "px";
				table.style.top = (20 * instructionsWrapper.viewportRatio) + "px";
			}
			else if (instructionsWrapper.IsEdgium()) {
			    table.style.right = (275 * instructionsWrapper.viewportRatio) + "px";
			    table.style.top = (40 * instructionsWrapper.viewportRatio) + "px";	
			}
			else {
				table.style.right = (150 * instructionsWrapper.viewportRatio) + "px";
				table.style.top = (40 * instructionsWrapper.viewportRatio) + "px";	
			}

			overlay.appendChild(table);
			instructionsWrapper.curElems.push(table);

			var row1col1 = document.getElementById("row1col1");
			var row1col2 = document.getElementById("row1col2");
			var row2col1 = document.getElementById("row2col1");
			var row2col2 = document.getElementById("row2col2");
			var row3col1 = document.getElementById("row3col1");
			var row3col2 = document.getElementById("row3col2");

			var upArrow = instructionsWrapper.createImageElem("arrow_01.png", 83, 83);
			upArrow.style.cssFloat = "right";
			var icon = instructionsWrapper.createImageElem("bf_icon.png", 66, 66);
			icon.style.cssFloat = "right";
			icon.style.marginTop = (40 * instructionsWrapper.viewportRatio) + "px";
			icon.style.marginRight = (15 * instructionsWrapper.viewportRatio) + "px";
			row1col2.appendChild(upArrow);
			row1col2.appendChild(icon);

			var isRestaurant = (instructionsWrapper.pageType === "Restaurant");
			var stepSpan = instructionsWrapper.createTextElem("Step 1 of " + (isRestaurant ? "4" : "3"));
			stepSpan.style.fontSize = "14pt";
			stepSpan.style.textDecoration = "underline";
			stepSpan.style.marginTop = (30 * instructionsWrapper.viewportRatio) + "px";
			row2col1.appendChild(stepSpan);

			var clickSpan = instructionsWrapper.createTextElem("Please click on the BeFrugal button above to view");
			clickSpan.style.fontSize = "20pt";
			clickSpan.style.fontWeight = "900";
			row3col1.appendChild(clickSpan);
			row3col1.appendChild(document.createElement('br'));

			if (isRestaurant) {
				let resSpan = instructionsWrapper.createTextElem(instructionsWrapper.retailerName + " coupons");
				resSpan.style.fontSize = "38pt";
				resSpan.style.fontWeight = "900";
				resSpan.style.color = "rgb(144,216,255)";
				row3col1.appendChild(resSpan);
			}
			else {
				let resTxt = (pageType === "WeeklyAd" ? " Weekly Ad Circular" : " Coupons");
				let resSpan = instructionsWrapper.createTextElem(instructionsWrapper.retailerName);
				resSpan.style.fontSize = "38pt";
				resSpan.style.fontWeight = "900";
				resSpan.style.color = "rgb(144,216,255)";
				row3col1.appendChild(resSpan);
				let selectSpan = instructionsWrapper.createTextElem(resTxt);
				selectSpan.style.fontSize = "20pt";
				selectSpan.style.fontWeight = "900";
				row3col1.appendChild(selectSpan);
			}

		},
		stepTwo: function () {
			instructionsWrapper.clearElems();
			if (!instructionsWrapper.pageType) {
				instructionsWrapper.pageType = "Restaurant"
            }
			var isRestaurant = (instructionsWrapper.pageType === "Restaurant");
			let isWeeklyAds = (instructionsWrapper.pageType === "WeeklyAd");

			var overlay = document.getElementById("instructionOverlay");
			overlay.style.display = "block";

			var table = instructionsWrapper.createTableElem(3, 1);
			if (instructionsWrapper.IsFirefox) {
				table.style.right = (480 * instructionsWrapper.viewportRatio) + "px";
			}
			else if (instructionsWrapper.IsEdgium()) {
			    table.style.right = (690 * instructionsWrapper.viewportRatio) + "px";
			}
			else {
				table.style.right = (580 * instructionsWrapper.viewportRatio) + "px";
			}
			table.style.top = ((isRestaurant ? 150 : 300) * instructionsWrapper.viewportRatio) + "px";

			overlay.appendChild(table);
			instructionsWrapper.curElems.push(table);

			var row1col1 = document.getElementById("row1col1");
			var row2col1 = document.getElementById("row2col1");
			var row3col1 = document.getElementById("row3col1");

			var stepSpan = instructionsWrapper.createTextElem("Step 2 of " + (isRestaurant ? "4": "3"));
			stepSpan.style.fontSize = "14pt";
			stepSpan.style.textDecoration = "underline";
			row1col1.appendChild(stepSpan);

			var selectSpanInnerOne = document.createElement('span');
			selectSpanInnerOne.innerText = "Please select";
			var selectSpanInnerTwo = document.createElement('span');
			selectSpanInnerTwo.style = "font-weight:900;font-size:38pt;color:rgb(144,216,255);" + (isRestaurant ? "margin-left: 8px;" : "display:block;");
			selectSpanInnerTwo.innerText = (isWeeklyAds ? "Weekly Ad Circulars" : instructionsWrapper.pageType + " Coupons");

			var selectSpan =  instructionsWrapper.createTextElem("");
			selectSpan.style.fontSize = "20pt";
			selectSpan.style.fontWeight = "900";
			selectSpan.appendChild(selectSpanInnerOne);
			selectSpan.appendChild(selectSpanInnerTwo);
			row2col1.appendChild(selectSpan);

			var arrow = instructionsWrapper.createImageElem("arrow_05.png", 110, 25);
			arrow.style.marginRight = ((-40) * instructionsWrapper.viewportRatio) + "px";
			arrow.style.float = "right";
			arrow.style.position = "relative";
			arrow.style.top = "-130px";
			arrow.style.left = "-30px";
			row3col1.appendChild(arrow);
		},
		stepThree: function (nocashback) {
			instructionsWrapper.clearElems();
			if (!instructionsWrapper.pageType) {
				instructionsWrapper.pageType = "Restaurant"
			}
			var isRestaurant = (instructionsWrapper.pageType === "Restaurant");
			let isWeeklyAds = (instructionsWrapper.pageType === "WeeklyAd");
			var overlay = document.getElementById("instructionOverlay");
			var table = instructionsWrapper.createTableElem(4, 1);
			if (instructionsWrapper.IsFirefox) {
				table.style.right = (530 * instructionsWrapper.viewportRatio) + "px";
			}
			else if (instructionsWrapper.IsEdgium()) {
			    table.style.right = (705 * instructionsWrapper.viewportRatio) + "px";
			}
			else {
				table.style.right = (585 * instructionsWrapper.viewportRatio) + "px";				
			}
			if (isRestaurant) {
				table.style.top = (130 * instructionsWrapper.viewportRatio) + "px";
			}
			else if (instructionsWrapper.IsFirefox) {
				table.style.top = (290 * instructionsWrapper.viewportRatio) + "px";
			}
			else {
				table.style.top = (240 * instructionsWrapper.viewportRatio) + "px";
            }

			overlay.appendChild(table);
			instructionsWrapper.curElems.push(table);

			var row1col1 = document.getElementById("row1col1");
			var row2col1 = document.getElementById("row2col1");
			var row3col1 = document.getElementById("row3col1");
			var row4col1 = document.getElementById("row4col1");

			var stepSpan = instructionsWrapper.createTextElem("Step 3 of " + (isRestaurant ? "4": "3"));
			stepSpan.style.fontSize = "14pt";
			stepSpan.style.textDecoration = "underline";
			row1col1.appendChild(stepSpan);

			if (isRestaurant) {
				var selectSpan = instructionsWrapper.createTextElem("Find and click on");
				selectSpan.style.fontSize = "20pt";
				selectSpan.style.fontWeight = "900";
				row2col1.appendChild(selectSpan);

				var nameSpan = instructionsWrapper.createTextElem(instructionsWrapper.retailerName);
				nameSpan.style.fontWeight = "900";
				nameSpan.style.fontSize = "38pt";
				nameSpan.style.color = "rgb(144,216,255)";
				row3col1.appendChild(nameSpan);

				var arrow = instructionsWrapper.createImageElem("arrow_03.png", 112, 25);
				arrow.style.float = "right";
				arrow.style.marginRight = ((-30) * instructionsWrapper.viewportRatio) + "px";
				row4col1.appendChild(arrow);
			}
			else {

				var createSpanTypeOne = function (inputText, bold, fontSize, lineheight) {
					let selectSpan = instructionsWrapper.createTextElem(inputText);
					selectSpan.style.fontSize = fontSize ? fontSize + "pt" : "20pt";
					selectSpan.style.lineHeight = (lineheight ? lineheight : (fontSize ? (fontSize + 2) : "22")) + "pt";
					if (bold) selectSpan.style.fontWeight = "900";
					return selectSpan;
				};

				var createSpanTypeTwo = function (inputText) {
					let selectSpan = instructionsWrapper.createTextElem(inputText);
					selectSpan.style.fontWeight = "900";
					selectSpan.style.fontSize = "38pt";
					selectSpan.style.lineHeight= "40pt"
					selectSpan.style.color = "rgb(144,216,255)";
					return selectSpan;
				};

				if (isWeeklyAds) {
					table.style.marginTop = "70px";

					var selectSpan = instructionsWrapper.createTextElem("Find and click on");
					selectSpan.style.fontSize = "20pt";
					selectSpan.style.fontWeight = "900";
					row2col1.appendChild(selectSpan);

					var nameSpan = instructionsWrapper.createTextElem(instructionsWrapper.retailerName);
					nameSpan.style.fontWeight = "900";
					nameSpan.style.fontSize = "38pt";
					nameSpan.style.color = "rgb(144,216,255)";
					row3col1.appendChild(nameSpan);

					var arrow = instructionsWrapper.createImageElem("arrow_03.png", 112, 25);
					arrow.style.float = "right";
					arrow.style.marginRight = ((-30) * instructionsWrapper.viewportRatio) + "px";
					arrow.style.marginTop = "-75px";
					row4col1.appendChild(arrow);
				}
				else {
					let smallbr = document.createElement('br');
					smallbr.style.fontSize = "5px";
					row2col1.appendChild(smallbr);
					row2col1.appendChild(createSpanTypeOne("There!", true));
					row2col1.appendChild(document.createElement('br'));
					row2col1.appendChild(createSpanTypeOne("Search for ", true));
					row2col1.appendChild(createSpanTypeTwo(instructionsWrapper.retailerName));
					row2col1.appendChild(createSpanTypeOne(" Coupons or", true));
					row2col1.appendChild(document.createElement('br'));
					row2col1.appendChild(createSpanTypeOne("browse by ", true));
					row2col1.appendChild(createSpanTypeTwo("Category"));
					row2col1.appendChild(createSpanTypeOne(" or ", true));
					row2col1.appendChild(createSpanTypeTwo("Brand"));

					row3col1.appendChild(document.createElement('br'));
					var arrow = instructionsWrapper.createImageElem("arrow_03.png", 112, 25);
					arrow.style.float = "right";
					arrow.style.marginRight = ((-30) * instructionsWrapper.viewportRatio) + "px";
					row3col1.appendChild(arrow);
                }

				if (!nocashback) {
					row3col1.appendChild(document.createElement('br'));
					row4col1.appendChild(document.createElement('br'));
					row4col1.appendChild(createSpanTypeOne("A Welcome Gift For You!", false, 18));
					row4col1.appendChild(document.createElement('br'));
					row4col1.appendChild(createSpanTypeOne("Find", false, 18));
					row4col1.appendChild(createSpanTypeOne(" $10 Bonus ", true, 20, 20));
					row4col1.appendChild(createSpanTypeOne("in your account.", false, 18));
					row4col1.appendChild(document.createElement('br'));
					row4col1.appendChild(createSpanTypeOne("Terms apply", false, 14));
                }
            }
		},
		stepFour: function () {
			instructionsWrapper.clearElems();

			var overlay = document.getElementById("instructionOverlay");

			var table = instructionsWrapper.createTableElem(4, 1);
			if (instructionsWrapper.IsFirefox) {
				table.style.right = (530 * instructionsWrapper.viewportRatio) + "px";
			}
			else if (instructionsWrapper.IsEdgium()) {
			    table.style.right = (705 * instructionsWrapper.viewportRatio) + "px";
			}
			else {
				table.style.right = (585 * instructionsWrapper.viewportRatio) + "px";
			}
			table.style.top = (140 * instructionsWrapper.viewportRatio) + "px";

			overlay.appendChild(table);
			instructionsWrapper.curElems.push(table);

			var row1col1 = document.getElementById("row1col1");
			var row2col1 = document.getElementById("row2col1");
			var row3col1 = document.getElementById("row3col1");
			var row4col1 = document.getElementById("row4col1");

			var stepSpan = instructionsWrapper.createTextElem("Step 4 of 4");
			stepSpan.style.fontSize = "14pt";
			stepSpan.style.textDecoration = "underline";
			row1col1.appendChild(stepSpan);

			var arrow = instructionsWrapper.createImageElem("arrow_04.png", 112, 25);
			arrow.style.float = "right";
			arrow.style.marginRight = ((-30) * instructionsWrapper.viewportRatio) + "px";
			row2col1.appendChild(arrow);

			var browseSpan = instructionsWrapper.createTextElem("");
			var selectSpanInnerOne = document.createElement('span');
			selectSpanInnerOne.innerText = "Browse ";
			var selectSpanInnerTwo = document.createElement('span');
			selectSpanInnerTwo.style = "font-size:38pt;font-weight:900;color:rgb(144,216,255)";
			selectSpanInnerTwo.innerText =  instructionsWrapper.retailerName;
			var selectSpanInnerThree = document.createElement('span');
			selectSpanInnerThree.innerText =  " coupons";
			browseSpan.style.fontSize = "20pt";
			browseSpan.style.fontWeight = "900";
			browseSpan.appendChild(selectSpanInnerOne);
			browseSpan.appendChild(selectSpanInnerTwo);
			browseSpan.appendChild(selectSpanInnerThree);
			row3col1.appendChild(browseSpan);

			var clickSpan = instructionsWrapper.createTextElem("Click on a coupon to get the offer");
			clickSpan.style.fontWeight = "900";
			clickSpan.style.fontSize = "20pt";
			row4col1.appendChild(clickSpan);

			if (window.innerWidth < 1100) {
				row3col1.style.maxWidth = "600px";
				row4col1.style.maxWidth = "600px";
				row4col1.parentNode.style.maxWidth = "600px";
			}
			else if (window.innerWidth < 1250) {
				row3col1.style.maxWidth = "700px";
				row4col1.style.maxWidth = "700px";
				row4col1.parentNode.style.maxWidth = "700px";
			}

		}
	};
}();

instructionsWrapper.initialize();