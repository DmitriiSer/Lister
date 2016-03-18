(function () {
    "use strict";
    /*jslint white: true, todo: true, plusplus: true, regexp: true*/
    /*global angular, document, console, alert*/
    angular.module("app.directives", [])
            /* DOM template directives */
            .directive("navbar", function () {
                return {
                    "restrict": "E",
                    "templateUrl": "partials/navbar.html"
                };
            })
            .directive("loginBodyAndFooter", function () {
                return {
                    "restrict": "E",
                    "templateUrl": "partials/loginContent.html"
                };
            })
            .directive("listEditorContent", function () {
                return {
                    "restrict": "E",
                    "templateUrl": "partials/listEditorContent.html"
                };
            })
            .directive("confirmationWindow", function () {
                return {
                    "restrict": "E",
                    "templateUrl": "partials/confirmationContent.html"
                };
            })
            .directive("alertWindow", function () {
                return {
                    restrict: "E",
                    templateUrl: "partials/alertContent.html"
                };
            })
            /* behavior and event directives */
            .directive("ngMouseenterDelayed", function ($timeout) {
                return {
                    link: function (scope, element, attrs) {
                        var timeout = null;
                        /*jslint unparam: true*/
                        element.on("mouseenter", function (event) {
                            timeout = $timeout(function () {
                                scope.$apply(function () {
                                    scope.$eval(attrs.ngMouseenterDelayed);
                                });
                            }, 500);
                        });
                        element.on("mouseleave", function (event) {
                            $timeout.cancel(timeout);
                        });
                        /*jslint unparam: false*/
                    }
                };
            })
            .directive("ngWidth", ["$window", "$timeout", "$ionicSideMenuDelegate", function ($window, $timeout, $ionicSideMenuDelegate) {
                    /*jslint unparam: true*/
                    return {
                        link: function (scope, element) {
                            scope.getWindowWidth = function () {
                                return $window.innerWidth;
                            };
                            scope.$watch(scope.getWindowWidth, function (val) {
                                scope.windowWidth = val;
                            });
                            angular.element($window).bind("resize", function () {
                                if (scope.windowWidth < 768) {
                                    $ionicSideMenuDelegate.canDragContent(true);
                                } else {
                                    $ionicSideMenuDelegate.canDragContent(false);
                                }
                                scope.$apply();
                            });
                            $timeout(function () {
                                angular.element($window).triggerHandler("resize");
                            });
                        }
                    };
                }])
            .directive("ngContextmenu", ["$parse", function ($parse) {
                    /*jslint unparam: true*/
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
                }])
            .directive("ngScroll", ["$parse", function ($parse) {
                    return {
                        compile: function (element, attrs) {
                            var fn = $parse(attrs.ngScroll);
                            /*jslint unparam: true*/
                            return function (scope, element, attrs) {
                                element.on("scroll", function (e) {
                                    scope.$apply(function () {
                                        fn(scope, {$event: e});
                                    });
                                });
                            };
                        }
                    };
                }])
            .directive("popoverClose", function () {
                /*jslint unparam: true*/
                return {
                    "restrict": "A",
                    link: function (scope, element, attrs) {
                        element.on("click", function (event) {
                            alert("popoverClose");
                            console.log("popoverClose");
                        });
                    }
                };
            })
            .directive("ngEnterKey", function ($timeout) {
                return {
                    link: function (scope, element, attrs) {
                        //element.on("keydown keypress", function (event) {
                        element.on("keydown", function (event) {
                            if (event && event.which === 13) {
                                $timeout(function () {
                                    scope.$apply(function () {
                                        scope.$eval(attrs.ngEnterKey, {"$event": event});
                                    });
                                }, 0);
                                //event.preventDefault();
                            }
                            event.stopImmediatePropagation();
                            event.stopPropagation();
                        });
                    }
                };
            })
            .directive("ngEnterAsTab", [function () {
                    /*jslint unparam: true*/
                    return {
                        "restrict": "A",
                        link: function (scope, element, attrs) {
                            element.on("keydown", function (event) {
                                var allChildElements, nextElemGetsFocus, i;
                                if (!event.altKey && !event.shiftKey && !event.ctrlKey && event.which === 13) {
                                    allChildElements = element[0].getElementsByTagName("*");
                                    nextElemGetsFocus = false;
                                    //prevElemGetsFocus = false;
                                    for (i = 0; i < allChildElements.length; i++) {
                                        if (allChildElements[i].getAttribute("ng-focus-on-enter") !== null) {
                                            if (nextElemGetsFocus) {
                                                event.preventDefault();
                                                allChildElements[i].focus();
                                                return;
                                            }
                                            if ((allChildElements[i].tagName === "INPUT") && (allChildElements[i] === document.activeElement)) {
                                                nextElemGetsFocus = true;
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    };
                }])
            .directive("ngFocusOnShow", ["$timeout", function ($timeout) {
                    return {
                        restrict: "A",
                        link: function (scope, element, attrs) {
                            var timeout = (attrs.ngFocusOnShow !== "") ? attrs.ngFocusOnShow : 0;
                            // check if there is ng-show attribute
                            if (attrs.ngShow) {
                                scope.$watch(attrs.ngShow, function (newValue) {
                                    if (newValue) {
                                        $timeout(function () {
                                            element[0].focus();
                                        }, timeout);
                                    }
                                });
                            }
                            // check if there is ng-hide attribute
                            else if (attrs.ngHide) {
                                scope.$watch(attrs.ngHide, function (newValue) {
                                    if (!newValue) {
                                        $timeout(function () {
                                            element[0].focus();
                                        }, timeout);
                                    }
                                });
                            }
                            // there is no ng-show and ng-hide
                            else {
                                $timeout(function () {
                                    element[0].focus();
                                }, timeout);
                            }
                        }
                    };
                }]);
}());