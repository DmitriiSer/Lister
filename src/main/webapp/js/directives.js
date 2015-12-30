"use strict";
(function () {
    var app = angular.module("app.directives", []);
    /* DOM template directives */
    app.directive("navbar", function () {
        return {
            "restrict": "E",
            "templateUrl": "partials/navbar.html"
        };
    });
    app.directive("loginBodyAndFooter", function () {
        return {
            "restrict": "E",
            "templateUrl": "partials/loginContent.html"
        };
    });
    app.directive("listEditorContent", function () {
        return {
            "restrict": "E",
            "templateUrl": "partials/listEditorContent.html"
        };
    });
    app.directive("confirmationContent", function () {
        return {
            "restrict": "E",
            "templateUrl": "partials/confirmationContent.html"
        };
    });
    /* behavior and event directives */
    app.directive("ngWidth", ["$window", "$timeout", "$ionicSideMenuDelegate", function ($window, $timeout, $ionicSideMenuDelegate) {
            return {
                link: function (scope, element) {
                    scope.getWindowWidth = function () {
                        return $window.innerWidth;
                    };
                    scope.$watch(scope.getWindowWidth, function (val) {
                        scope.windowWidth = val;
                    });
                    angular.element($window).bind("resize", function () {
                        if (scope.windowWidth < 768)
                            $ionicSideMenuDelegate.canDragContent(true);
                        else
                            $ionicSideMenuDelegate.canDragContent(false);
                        scope.$apply();
                    });
                    $timeout(function () {
                        angular.element($window).triggerHandler("resize");
                    });
                }
            };
        }]);
    app.directive("ngContextmenu", ["$parse", function ($parse) {
            return {
                compile: function (element, attrs) {
                    var fn = $parse(attrs.ngContextmenu);
                    return function (scope, element, attrs) {
                        element.on("contextmenu", function (e) {
                            scope.$apply(function () {
                                fn(scope, {$event: e});
                            });
                        });
                    };
                }
            };
        }]);
    app.directive("popoverClose", function () {
        return {
            "restrict": "A",
            link: function (scope, element, attrs) {
                element.on("click", function (event) {
                    alert("popoverClose");
                    console.log("popoverClose");
                });
            }
        };
    });
    app.directive("ngEnterKey", function () {
        return {
            link: function (scope, element, attrs) {
                element.on("keydown keypress", function (event) {
                    if (event.which === 13) {
                        scope.$apply(function () {
                            scope.$eval(attrs.ngEnterKey);
                        });
                        event.preventDefault();
                    }
                });
            }
        };
    });
    app.directive("ngEnterAsTab", [function () {
            return {
                "restrict": "A",
                link: function (scope, element, attrs) {
                    element.on("keydown", function (event) {
                        if (!event.altKey && !event.shiftKey && !event.ctrlKey && event.which === 13) {
                            var allChildElements = element[0].getElementsByTagName("*");
                            var nextElemGetsFocus = false, prevElemGetsFocus = false;
                            for (var i = 0; i < allChildElements.length; i++) {
                                if (allChildElements[i].getAttribute("ng-focus-on-enter") !== null) {
                                    if (nextElemGetsFocus) {
                                        event.preventDefault();
                                        allChildElements[i].focus();
                                        return;
                                    }
                                    if ((allChildElements[i].tagName === "INPUT") && (allChildElements[i] == document.activeElement)) {
                                        nextElemGetsFocus = true;
                                    }
                                }
                            }
                        }
                    });
                }
            };
        }]);
    app.directive("ngFocusOnShow", ["$compile", "$timeout", function ($compile, $timeout) {
            return {
                restrict: "A",
                /*compile: function (scope, element) {
                 console.log("ngFocusOnShow::compile");
                 },*/
                link: function (scope, element, attrs) {
                    //console.log("ngFocusOnShow::link");
                    var timeout = (attrs["ngFocusOnShow"] != "") ? attrs["ngFocusOnShow"] : 0;
                    // check if there is ng-show attribute
                    if (attrs.ngShow) {
                        scope.$watch(attrs.ngShow, function (newValue) {
                            if (newValue) {
                                $timeout(function () {
                                    element[0].focus();
                                }, timeout);
                            }
                        })
                    }
                    // check if there is ng-hide attribute
                    else if (attrs.ngHide) {
                        scope.$watch(attrs.ngHide, function (newValue) {
                            if (!newValue) {
                                $timeout(function () {
                                    //alert("focusOnShow::ngHide, element = %s", element);
                                    element[0].focus();
                                }, timeout);
                            }
                        })
                    }
                }
            }
            ;
        }]);
})();