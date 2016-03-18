/* 
 Created on : Sep 24, 2015, 11:21:43 AM
 Author     : Dmitrii Serikov
 Version    : 0.0.3
 */
var uiRoulette = (function () {
    "use strict";
    /*jslint white: true, plusplus: true*/
    /*global window, document, setTimeout, Velocity*/
    var Roulette = {
        // default data
        data: {
            rouletteTrigger: "click",
            rouletteContent: "",
            rouletteContentOffset: "{0,0}",
            rouletteAnimation: "fade",
            rouletteAnimationSpeed: "fast",
            rouletteMaskImage: "",
            rouletteBackgroundOpacity: ""
        },
        // helper functions
        Utils: {
            // helper function to transform JSON style object to 'style' string
            createStyle: function (obj) {
                var style, match, i;
                style = JSON.stringify(obj).split(/[{}]/)[1];
                style = style.replace(/"/g, "").replace(/,/g, ";");
                match = style.match(/[a-z][A-Z]/g);
                if (match !== null) {
                    for (i = 0; i < match.length; i++) {
                        style = style.replace(match[i], match[i][0] + "-" + match[i][1]);
                    }
                }
                return style;
            },
            // helper function to get computed style property from the object
            css: function (obj, property) {
                return window.getComputedStyle(obj).getPropertyValue(property);
            }
        },
        /* Description: creates a roulette
         * Options: {
         *   rouletteTrigger           : ["click", "dblclick", "mouseenter", "hover", "focus" ...] - trigger that causes content switching
         *   rouletteContent           : <switchable content> - content HTML
         *   rouletteContentOffset     : "{x in px, y in px}" - content offset
         *   rouletteAnimation         : ["slide", "fade"] - animation effect
         *   rouletteAnimationSpeed    : ["fast", "slow", ms in int] - animation speed
         *   rouletteMaskImage         : url to back layer mask image
         *   rouletteBackgroundOpacity : [0-1] responsible for back layer opacity
         */
        create: function (element, options) {
            if (element === undefined || element[0] === undefined) {
                return;
            }
            var scope, data, Utils, i, j, key,
                    nodeName, nodeValue, nodeNameTransform, nodeNames,
                    rouletteContentOffset, rouletteContentToSwitch, bgnd,
                    scopeCSS, bgndCSS, bgndCSSChildOpacity, animations, switchContent;
            scope = element[0];
            data = uiRoulette.data;
            Utils = uiRoulette.Utils;
            // check for attributes in html tag
            for (i = 0; i < scope.attributes.length; i++) {
                nodeName = scope.attributes[i].nodeName;
                nodeValue = scope.attributes[i].value;
                nodeNameTransform = "";
                if (nodeName.indexOf("data-") !== -1) {
                    nodeNames = nodeName.split(/-/);
                    for (j = 1; j < nodeNames.length; j++) {
                        if (j > 1) {
                            nodeNames[j] = nodeNames[j].charAt(0).toUpperCase() + nodeNames[j].substring(1);
                        }
                        nodeNameTransform += nodeNames[j];
                    }
                    data[nodeNameTransform] = nodeValue;
                }
            }
            // check for options passed to the function
            if (options !== undefined) {
                for (key in options) {
                    if (options.hasOwnProperty(key)) {
                        data[key] = options[key];
                    }
                }
            }
            // replace some variables in data with appropriate analogues
            if (data.rouletteTrigger === "hover") {
                data.rouletteTrigger = "mouseenter";
            }
            if (data.rouletteMaskImage !== "") {
                data.rouletteMaskImage = "url('" + data.rouletteMaskImage + "')";
            }
            //
            rouletteContentOffset = {
                x: parseInt(data.rouletteContentOffset.split(/[{},]+/)[1], 10),
                y: parseInt(data.rouletteContentOffset.split(/[{},]+/)[2], 10)
            };
            // create backgroud semi-transparent container for ContentToSwitch and append it to roulette element
            rouletteContentToSwitch = data.rouletteContent;
            bgnd = document.createElement("div");
            bgnd.className = "roulette-background";
            scopeCSS = {
                "position": "relative",
                "cursor": "pointer",
                "userSelect": "none",
                "-webkit-user-select": "none",
                "-moz-user-select": "none",
                "-ms-user-select": "none",
                "-o-user-select": "none",
                "user-select": "none",
                "overflow": "hidden"
            };
            bgndCSS = {
                position: "absolute",
                width: "100%",
                height: "100%"
            };
            if (data.rouletteMaskImage !== "") {
                bgndCSS["-webkitMaskImage"] = data.rouletteMaskImage;
                bgndCSS.maskImage = data.rouletteMaskImage;
            }
            scope.setAttribute("style", Utils.createStyle(scopeCSS));
            bgnd.setAttribute("style", Utils.createStyle(bgndCSS));
            // append rouletteContentToSwitch to the bgnd div
            bgnd.innerHTML = rouletteContentToSwitch;
            // append bgnd div to scope
            scope.appendChild(bgnd);
            // set initial opacity to bgdn child
            bgndCSSChildOpacity = Utils.css(bgnd.childNodes[0], "opacity"); //data.rouletteMaskImageOpacity;
            if (data.rouletteBackgroundOpacity === "") {
                if (bgndCSSChildOpacity === 1) {
                    bgndCSSChildOpacity = 0.2;
                    bgnd.childNodes[0].setAttribute("style", "opacity:" + bgndCSSChildOpacity);
                }
            } else {
                bgndCSSChildOpacity = data.rouletteBackgroundOpacity;
                bgnd.childNodes[0].setAttribute("style", "opacity:" + bgndCSSChildOpacity);
            }
            //
            // recalculate several properties on resize
            window.onresize = function () {
                bgndCSS.left = rouletteContentOffset.x + "px";
                bgndCSS.top = rouletteContentOffset.y + "px";
                //bgndCSS.width = scope.clientWidth + "px";
                //bgndCSS.height = scope.clientHeight + "px";
                bgndCSS.margin = Utils.css(scope, "margin");
                bgndCSS.padding = Utils.css(scope, "padding");
                // support fo FireFox and IE
                if (bgndCSS.margin === "") {
                    bgndCSS.marginLeft = Utils.css(scope, "margin-left");
                    bgndCSS.marginTop = Utils.css(scope, "margin-top");
                    bgndCSS.marginRight = Utils.css(scope, "margin-right");
                    bgndCSS.marginBottom = Utils.css(scope, "margin-bottom");
                }
                if (bgndCSS.padding === "") {
                    bgndCSS.paddingLeft = Utils.css(scope, "padding-left");
                    bgndCSS.paddingTop = Utils.css(scope, "padding-top");
                    bgndCSS.paddingRight = Utils.css(scope, "padding-right");
                    bgndCSS.paddingBottom = Utils.css(scope, "padding-bottom");
                }
                //
                var bgndCSSStyle = Utils.createStyle(bgndCSS);
                bgnd.setAttribute("style", bgndCSSStyle);
            };
            // this needs to properly work with initial clientWidth and clientHeight, otherwise it will be twice as much before first windo resize
            setTimeout(function () {
                window.onresize();
            });
            // determine animation between data switchings            
            switch (data.rouletteAnimation) {
                case "slide":
                    animations = {
                        face: [{
                                marginLeft: "+=" + (rouletteContentOffset.x / 2), marginRight: "-=" + (rouletteContentOffset.x / 2),
                                marginTop: "+=" + (rouletteContentOffset.y / 2), marginBottom: "-=" + (rouletteContentOffset.y / 2),
                                opacity: 0, easing: "ease-in"
                            }, {
                                marginLeft: "-=" + (rouletteContentOffset.x / 2), marginRight: "+=" + (rouletteContentOffset.x / 2),
                                marginTop: "-=" + (rouletteContentOffset.y / 2), marginBottom: "+=" + (rouletteContentOffset.y / 2),
                                opacity: 1, easing: "ease-out"
                            }],
                        bgnd: [{
                                marginLeft: "-=" + (rouletteContentOffset.x / 2), marginRight: "+=" + (rouletteContentOffset.x / 2),
                                marginTop: "-=" + (rouletteContentOffset.y / 2), marginBottom: "+=" + (rouletteContentOffset.y / 2),
                                opacity: 0, easing: "ease-in"
                            }, {
                                marginLeft: "+=" + (rouletteContentOffset.x / 2), marginRight: "-=" + (rouletteContentOffset.x / 2),
                                marginTop: "+=" + (rouletteContentOffset.y / 2), marginBottom: "-=" + (rouletteContentOffset.y / 2),
                                opacity: data.rouletteBackgroundOpacity, easing: "ease-out"
                            }]
                    };
                    break;
                case "fade":
                    animations = {
                        face: [{opacity: 0.5, easing: "ease-in"}, {opacity: 1, easing: "ease-out"}],
                        bgnd: [{opacity: 0.5, easing: "ease-in"}, {opacity: data.rouletteBackgroundOpacity, easing: "ease-out"}]
                    };
                    break;
            }
            animations.animationDuration = data.rouletteAnimationSpeed;
            //    
            switchContent = function () {
                var divScopeFirstChild, divScopeSecondChild, rouletteCurrentContent;
                divScopeFirstChild = scope.childNodes[1];
                divScopeSecondChild = scope.childNodes[3].childNodes[0];
                //var divBgndFirstChild = bgnd.childNodes[0];
                //var rouletteCurrentContent = Utils.minimizeHTML(scope.childNodes[1].innerHTML);
                rouletteCurrentContent = divScopeFirstChild.innerHTML;
                //var rouletteContentToSwitch = Utils.minimizeHTML(scope.childNodes[3].childNodes[0].innerHTML);
                rouletteContentToSwitch = divScopeSecondChild.innerHTML;
                divScopeFirstChild.innerHTML = rouletteContentToSwitch;
                divScopeSecondChild.innerHTML = rouletteCurrentContent;
                // change 'data-roulette-content' attribute
                scope.setAttribute("data-roulette-content", rouletteCurrentContent);
            };
            // determine what triggers data switching        
            scope.addEventListener(data.rouletteTrigger, function () {
                /*jslint newcap: true*/
                var divScopeFirstChild, divBgndFirstChild;
                divScopeFirstChild = scope.childNodes[1];
                //divScopeSecondChild = scope.childNodes[3].childNodes[0];
                divBgndFirstChild = bgnd.childNodes[0];
                //check if animation is still in process do not animate, just switch data
                if (divScopeFirstChild.className.indexOf("velocity-animating") !== -1) {
                    // stop all the animations in process

                    Velocity("", "stop");
                    // switch contents
                    switchContent();
                }
                // if there is no amnimation in process then animate
                else {
                    // animation before data switching
                    Velocity(divScopeFirstChild, animations.face[0], animations.animationDuration, animations.face[0].easing);
                    Velocity(divBgndFirstChild, animations.bgnd[0], animations.animationDuration, animations.bgnd[0].easing, function () {
                        // switch contents
                        switchContent();
                        // if there is more animations
                        if (animations.bgnd[1] !== null && animations.face[1] !== null) {
                            // animation after data switching
                            Velocity(divBgndFirstChild, animations.bgnd[1], animations.animationDuration, animations.bgnd[1].easing);
                            Velocity(divScopeFirstChild, animations.face[1], animations.animationDuration, animations.face[1].easing);
                        }
                    });
                }
                /*jslint newcap: false*/
            });
        }
    };
    return Roulette;
}());