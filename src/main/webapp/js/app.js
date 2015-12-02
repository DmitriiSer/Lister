"use strict";
/* Angular app */
var app = angular.module("appLister", ["app.directives", "app.controllers",
    "ionic", "ngAnimate", /*"ngRoute",*/ "ui.router", "ngSanitize", "ui.bootstrap"]);
/* configure routing */
app.config(["$stateProvider", "$urlRouterProvider", "$locationProvider", /*"$routeProvider"*/
    function ($stateProvider, $urlRouterProvider, $locationProvider /*$routeProvider*/) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
                // loads login page after the site loads
                .state("/", {
                    url: "/",
                    templateUrl: "partials/login.html",
                    controller: "HomeController"
                })
                // user's home page with/without lists
                .state("home", {
                    url: "/home",
                    templateUrl: "partials/home.html",
                    controller: "HomeController"
                })
                // list editor mode
                .state("listEditor", {
                    url: "/listEditor",
                    templateUrl: "partials/listEditor.html",
                    controller: "OpenListEditorController"
                });
        /*$routeProvider.
         // loads login page after the site loads
         when("/", {
         templateUrl: "partials/login.html",
         controller: "HomeController"
         }).
         // user's home page with/without lists
         when("/home", {
         templateUrl: "partials/home.html",
         controller: "HomeController"
         }).
         // list editor mode
         when("/listEditor", {
         templateUrl: "partials/listEditor.html",
         controller: "OpenListEditorController"
         }).
         //when("/details/:itemId", {
         //    templateUrl: "/partials/details.html",
         //    controller: "DetailsController"
         //}).
         otherwise({redirectTo: "/"});
         */
        // use the HTML5 History API
        $locationProvider.html5Mode(true);
    }]);
app.run(["$ionicPlatform", "$window", "$http",
    function ($ionicPlatform, $window, $http) {
        // TODO: move it from here to modal window show function
        $window.onkeydown = function (e) {
            var modal = document.getElementsByName("loginForm")[0];
            if (modal === undefined)
                return;
            var firstTabindex = null;
            var lastTabindex = null;
            var list = modal.getElementsByTagName("*");
            // calculate first and last DOM element with 'tabindex' attribute
            for (var i = 0; i < list.length; i++) {
                if (list[i].getAttribute("tabindex") != null) {
                    if (firstTabindex == null)
                        firstTabindex = list[i];
                    lastTabindex = list[i];
                }
            }
            // check if Tab was pressed
            if (e.which === 9) {
                if ((e.shiftKey === false) && (e.target == lastTabindex)) {
                    firstTabindex.focus();
                    e.preventDefault();
                } else if ((e.shiftKey === true) && (e.target == firstTabindex)) {
                    lastTabindex.focus();
                    e.preventDefault();
                }
            }
        }
        /* load ionic plugins */
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    }]);