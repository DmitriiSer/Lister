(function () {
    "use strict";
    /*jslint white: true, todo: true, plusplus: true */
    /*global angular, cordova, ionic, window, document*/
    /* Angular app */
    var app = angular.module("appLister", ["ionic", /*"ngCordova",*/ "ui.bootstrap", "ngCookies", "ngDraggable",
        "app.directives", "app.controllers"]);
    app.run(["$ionicHistory", "$ionicPlatform", "$window",
        function ($ionicHistory, $ionicPlatform, $window) {
            // load ionic plugins
            // clear cached elements
            $ionicHistory.clearCache();
            //
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                    cordova.plugins.Keyboard.disableScroll(true);
                }
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    window.StatusBar.styleDefault();
                }
            });
            /* TODO: move it from here to modal window show function */
            $window.onkeydown = function (e) {
                var modal = document.getElementsByName("loginForm")[0],
                        firstTabindex = null,
                        lastTabindex = null,
                        list,
                        i;
                if (angular.isUndefined(modal)) {
                    return;
                }
                list = modal.getElementsByTagName("*");
                // calculate first and last DOM element with 'tabindex' attribute
                for (i = 0; i < list.length; i++) {
                    if (list[i].getAttribute("tabindex") !== null) {
                        if (firstTabindex === null) {
                            firstTabindex = list[i];
                        }
                        lastTabindex = list[i];
                    }
                }
                // check if Tab was pressed
                if (e.which === 9) {
                    if ((e.shiftKey === false) && (e.target === lastTabindex)) {
                        firstTabindex.focus();
                        e.preventDefault();
                    } else if ((e.shiftKey === true) && (e.target === firstTabindex)) {
                        lastTabindex.focus();
                        e.preventDefault();
                    }
                }
            };
        }]);
    /* configure routing */
    app.config(["$httpProvider", "$stateProvider", "$urlRouterProvider", "$locationProvider",
        function ($httpProvider, $stateProvider, $urlRouterProvider, $locationProvider) {
            //
            $httpProvider.defaults.useXDomain = true;
            //
            $stateProvider
                    // loads login page after the site loads
                    .state("index", {
                        cache: false,
                        url: "/",
                        templateUrl: "partials/login.html",
                        controller: "HomeController"
                    })
                    // user's home page with/without lists
                    .state("home", {
                        cache: false,
                        url: "/home",
                        templateUrl: "partials/home.html",
                        controller: "HomeController"
                    })
                    // list editor mode
                    .state("listEditor", {
                        cache: false,
                        url: "/listEditor",
                        templateUrl: "partials/listEditor.html",
                        controller: "OpenListEditorController"
                                //controller: "ListEditorController"
                    });
            $urlRouterProvider.otherwise('/');
            // use the HTML5 History API
            //if (ionic.Platform.platform() !== "android")
            if (!ionic.Platform.isWebView()) {
                // set mode to HTML5
                $locationProvider.html5Mode(true);
            }
        }]);
}());