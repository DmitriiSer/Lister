"use strict";
(function () {
    var app = angular.module("app.directives", []);
    /* template directives */
    app.directive("navbar", function () {
        return {
            "restrict": "E",
            "templateUrl": "/Lister/partials/navbar.html"
        };
    });
    app.directive("loginBodyAndFooter", function () {
        return {
            "restrict": "E",
            "templateUrl": "/Lister/partials/loginContent.html"
        };
    });
    app.directive("listEditorContent", function () {
        return {
            "restrict": "E",
            "templateUrl": "/Lister/partials/listEditorContent.html"
        };
    });
    app.directive("confirmationContent", function () {
        return {
            "restrict": "E",
            "templateUrl": "/Lister/partials/confirmationContent.html"
        };
    });
    /* behavior directives */
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
            restrict: 'A',
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