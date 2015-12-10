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
    app.directive("ngWidth", ["$window", "$timeout", "$ionicSideMenuDelegate",
        function ($window, $timeout, $ionicSideMenuDelegate) {
            return function (scope, elem) {
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
        }]);
    app.directive("ngContextmenu", function ($parse) {
        return {
            compile: function (elem, attributes) {
                var fn = $parse(attributes.ngContextmenu);
                return function (scope, elem, attributes) {
                    elem.on("contextmenu", function (e) {
                        scope.$apply(function () {
                            fn(scope, {$event: e});
                        });
                    });
                };
            }
        };
    });
    app.directive("popoverClose", function () {
        return {
            "restrict": "A",
            link: function (scope, elem, attrs) {

                element.on("click", function (event) {
                    alert("popoverClose");
                    console.log("popoverClose");
                });
            }
        };
    });
    /*app.directive("ngEnterKey", function () {
     return function (scope, element, attrs) {
     element.bind("keydown keypress", function (event) {
     if (event.which === 13) {
     scope.$apply(function () {
     scope.$eval(attrs.ngEnterKey);
     });
     event.preventDefault();
     }
     });
     };
     });*/
    app.directive("focusOnShow", function ($timeout) {
        return {
            restrict: "A",
            link: function ($scope, $element, $attr) {
                var timeout = ($attr["focusOnShow"] != "") ? $attr["focusOnShow"] : 0;
                if ($attr.ngShow) {
                    $scope.$watch($attr.ngShow, function (newValue) {
                        if (newValue) {
                            $timeout(function () {
                                $element[0].focus();
                            }, timeout);
                        }
                    })
                }
                if ($attr.ngHide) {
                    $scope.$watch($attr.ngHide, function (newValue) {
                        if (!newValue) {
                            $timeout(function () {
                                $element[0].focus();
                            }, timeout);
                        }
                    })
                }
            }
        };
    })
})();