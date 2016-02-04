"use strict";
(function () {
    var app = angular.module("app.directives", [])
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
            .directive("ngWidth", ["$window", "$timeout", "$ionicSideMenuDelegate", function ($window, $timeout, $ionicSideMenuDelegate) {
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
                }])
            .directive("ngContextmenu", ["$parse", function ($parse) {
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
                            return function (scope, element, attrs) {
                                element.on("scroll", function (e) {
                                    scope.$apply(function () {
                                        fn(scope, {$event: e});
                                    });
                                });
                            }
                        }
                    };
                }])
            .directive("popoverClose", function () {
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
            .directive("ngEnterKey", function () {
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
            })
            .directive("ngEnterAsTab", [function () {
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
                }])
            .directive("ngFocusOnShow", ["$compile", "$timeout", function ($compile, $timeout) {
                    return {
                        restrict: "A",
                        link: function (scope, element, attrs) {
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
                                            element[0].focus();
                                        }, timeout);
                                    }
                                })
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
})();