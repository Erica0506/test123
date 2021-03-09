////NOTE(Thompson): ECMAScript6 allows the use of backticks for multi-line string literals. Useful for readability.
var div = document.getElementById("toast_div");
var svg_check = div.querySelector("#toast_svg_check");
var close = div.querySelector('#toast_svg_close');
var logo = div.querySelector('#toast_logo');
var span = div.querySelector("#toast_cbText");

//Initializing variables.
var cashback = div.getAttribute("xcb");
var maxOpacity = 1.0;
var opacitySpeed = 0.04;
var variableWidth = div.style.width || 330;	//NOTE(Thompson): Variable width takes into account the positioning of the toast message, so only tweak this variable, and don't touch the CSS.
var svgWidth = 32;
var logoWidth = 32;

//Initializing close button actions.
close.addEventListener("click", function () {
	var div = document.getElementById("toast_div");
	div.style.opacity = 0.0;
	document.body.removeChild(div);
});

//If cashback rate contains "Up to...", then we need to increase the width to accommodate the extra letters.
if (cashback && cashback.toLowerCase().indexOf("up") > -1) {
	variableWidth += 30;
}
div.style.width = variableWidth + "px";

logo.setAttribute("src", div.getAttribute("xlogo"));

svg_check.style.width = (svgWidth + "px");
svg_check.style.height = (svgWidth + "px");

if (cashback.toLowerCase().indexOf("activated") > -1)
	span.innerText = cashback.slice(0, -1 * " Activated".length);
else
	span.innerText = cashback;

//NOTE(Thompson): Handles the animation part. Pretty bad though, since the fade-in animation is not as smooth as the fade-out animation.
setTimeout(() => {
	var animation = setInterval(() => {
		var div = document.getElementById("toast_div");
		if (!div) {
			clearInterval(animation);
			return;
		}
		var opacity = Number(div.style.opacity);
		if (opacity < maxOpacity) {
			opacity += opacitySpeed;
			div.style.opacity = opacity.toString();
		}
		else {
			clearInterval(animation);
			setTimeout(() => {
				var reverseAnimation = setInterval(() => {
					var div = document.getElementById("toast_div");
					if (!div) {
						clearInterval(reverseAnimation);
						return;
					}
					var opacity = Number(div.style.opacity);
					if (opacity > 0.0) {
						opacity -= opacitySpeed;
						div.style.opacity = opacity.toString();
					}
					else {
						clearInterval(reverseAnimation);
						document.body.removeChild(div);
					}
				}, 1);
			}, 3000); //3 seconds
		}
	}, 1);
}, 500);