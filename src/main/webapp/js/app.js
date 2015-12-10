"use strict";
/* Angular app */
var app = angular.module("appLister", ["ionic", "ui.bootstrap", /*"ui.drop",*/"ngDraggable",
    /*"ngAnimate", "ngRoute", "ngSanitize", "ui.router", */
    "app.directives", "app.controllers"]);
app.run(["$ionicHistory", "$ionicPlatform", "$ionicActionSheet", "$window", "$state", "$rootScope", "$http", "session",
    function ($ionicHistory, $ionicPlatform, $ionicActionSheet, $window, $state, $rootScope, $http, session) {
        /* load ionic plugins */
        $ionicHistory.clearCache();
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
    }]);
/* configure routing */
app.config(["$stateProvider", "$urlRouterProvider", "$locationProvider",
    function ($stateProvider, $urlRouterProvider, $locationProvider) {
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
                });
        $urlRouterProvider.otherwise('/');
        // use the HTML5 History API
        $locationProvider.html5Mode(true);
    }]);
