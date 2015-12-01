"use strict";
/* Angular app */
var app = angular.module("appLister", ["app.directives", "app.controllers",
    "ngAnimate", "ngRoute", "ngSanitize", /*"ngTouch",*/ "ui.bootstrap"
]);
/* configure routing */
app.config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
        $routeProvider.
                // loads login page after the site loads
                when("/", {
                    templateUrl: "partials/login.html",
                    controller: "HomeController"
                }).
                // user's home page with/without lists
                when("/home", {
                    templateUrl: "partials/home.html",
                    controller: "HomeController"//"DataController"
                }).
                when("/listEditor", {
                    templateUrl: "partials/listEditor.html",
                    controller: "OpenListEditorController"
                }).
                // page with an empty list
                /*when("/list", {
                 templateUrl: "/partials/list.html",
                 controller: "ListController"
                 }).
                 when("/details/:itemId", {
                 templateUrl: "/partials/details.html",
                 controller: "DetailsController"
                 }).*/
                otherwise({
                    redirectTo: "/"
                });
        // use the HTML5 History API
        $locationProvider.html5Mode(true);
    }]);
/* load templates for popovers into $templateCache */
app.run(["$window", "$http", "$templateCache", function ($window, $http, $templateCache) {
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
        // TODO: remove this
        // set templates
        // $http.get("partials/passwordPopoverHtml.html", {cache: $templateCache}).then(function (response) {
        //    $templateCache.put("partials/passwordPopoverHtml.html", response.data);
        // });
        // $http.get("partials/avatarPopoverHtml.html", {cache: $templateCache}).then(function (response) {
        //    $templateCache.put("partials/avatarPopoverHtml.html", response.data);
        // });
    }]);