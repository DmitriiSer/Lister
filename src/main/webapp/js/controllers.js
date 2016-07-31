(function () {
    "use strict";
    /*jslint white: true, todo: true, plusplus: true, regexp: true*/
    /*global angular, window, document, console, alert, CryptoJS, uiRoulette, getCaretCoordinates*/
    /* controllers */
    angular.module("app.controllers", ["app.services"])
            .controller("RootController", ["$rootScope", "$scope", "$state", "$ionicScrollDelegate", "$ionicActionSheet", "$http", "$uibModal", "server", "session",
                function ($rootScope, $scope, $state, $ionicScrollDelegate, $ionicActionSheet, $http, $uibModal, server, session) {
                    console.debug("RootController was loaded");
                    $scope.userProfile = {};
                    $rootScope.dataError = function (data) {
                        //console.debug("$rootScope.dataError");
                        var formattedData = JSON.stringify(data);
                        formattedData = formattedData.match(/<h1>.+<\/h1>/);
                        if (formattedData !== null) {
                            formattedData = formattedData[0];
                            formattedData = formattedData.split(/[<>]/)[2];
                            if (formattedData.split(/[\-]/)[1].trim() !== "") {
                                formattedData = formattedData.split(/[\-]/)[1].trim();
                            } else {
                                formattedData = formattedData.split(/[\-]/)[0].trim();
                            }
                        } else {
                            formattedData = "null";
                        }
                        return String(formattedData);
                    };
                    $rootScope.showAlertMsg = function (message, callbackOnOk) {
                        $rootScope.alertCallback = callbackOnOk;
                        $rootScope.alertMsg = message;
                        $rootScope.alertWindow = $uibModal.open({
                            templateUrl: "alertWindow",
                            controller: function ($scope) {
                                $scope.alertMsg = $rootScope.alertMsg;
                                $scope.alertCallback = $rootScope.alertCallback;
                                $scope.onOk = function () {
                                    console.log("$rootScope.alertCallback = ");
                                    console.log($scope.alertCallback);
                                    if ($scope.alertCallback !== undefined) {
                                        $scope.alertCallback();
                                    }
                                };
                                delete $rootScope.alertMsg;
                                delete $rootScope.alertCallback;
                            },
                            size: "sm",
                            windowClass: "center-modal no-border-radius",
                            animation: true,
                            keyboard: true
                        });
                    };
                    $rootScope.showConfirmationMsg = function (controllerName) {
                        if (angular.isUndefined(controllerName)) {
                            controllerName = "";
                        }
                        $rootScope.confirmationWindow = $uibModal.open({
                            templateUrl: "confirmationWindow",
                            controller: controllerName,
                            windowClass: "center-modal no-border-radius",
                            size: "md",
                            animation: true
                        });
                    };
                    $scope.updateUserProfile = function (userProfile) {
                        $scope.userProfile = userProfile;
                    };
                    $scope.listNameToRemove = "";
                    $scope.clickTitle = function () {
                        // Show the action sheet
                        $ionicActionSheet.show({
                            titleText: 'Lister Options',
                            buttons: [
                                {text: '<i>Share</i> This'},
                                {text: 'Move'}
                            ],
                            /*destructiveText: 'Delete',*/
                            cancelText: 'Cancel',
                            /*cancel: function () {},*/
                            buttonClicked: function (index) {
                                alert(index);
                                return true;
                            }
                        });
                    };
                    // in the root scope because of availability for side menu
                    $rootScope.showListButton = false;
                    $rootScope.showPlusButton = false;
                    $rootScope.addList = function (param, data) {
                        //console.log("addList");
                        var e = null;
                        if (param && typeof param === "string") {
                            $scope.listName = param;
                        }
                        if (param && param.target) {
                            e = param;
                        }
                        if (!e) {
                            e = {which: 1};
                        }
                        if (e.which === 1 || angular.isUndefined(e.which)) {
                            //
                            // if there is a name for created list ($scope.listName) then create a list on the server
                            if ($scope.listName !== "" && !angular.isUndefined($scope.listName)) {
                                // create a list
                                $scope.userProfile = session.getUserProfile();
                                // send information to the server
                                //console.log(JSON.stringify($scope.userProfile));
                                if (angular.isUndefined(data)) {
                                    data = "";
                                }
                                //console.debug(data);
                                $http.post(server.hostName() + "/DataServlet?addList=" + $scope.listName, JSON.stringify(data)).then(function (response) {
                                    var data = JSON.stringify(response.data).replace(/\\/g, "");
                                    console.log("addList: " + response.status + " " + response.statusText + ", data: " + data);
                                    $scope.userProfile.lists.push($scope.listName);
                                    $rootScope.showListButton = true;
                                    $rootScope.showPlusButton = false;
                                    $scope.listName = "";
                                    // call $ionicScrollDelegate.resize() to expand scrollable area
                                    $ionicScrollDelegate.resize();
                                }, function (response) {
                                    var errorMsg = $scope.dataError(response.data);
                                    $rootScope.showAlertMsg(errorMsg);
                                    $rootScope.showListButton = true;
                                    $rootScope.showPlusButton = false;
                                    $scope.listName = "";
                                });
                            } else {
                                // the name of a list ($scope.listName) is not yet determined
                                // open an empty list editor
                                $rootScope.showPlusButton = false;
                                session.setOpenedListIsNew(true);
                                session.setOpenedListName("");
                                session.setOpenedListType("simple");
                                session.setOpenedListContent("{}");
                                $state.go("listEditor");
                            }
                        }
                    };
                    $rootScope.removeList = function (listName) {
                        //console.log("$rootScope.removeList");
                        if (!angular.isUndefined(listName)) {
                            $rootScope.listNameToRemove = listName;
                        } else {
                            $rootScope.listNameToRemove = session.getOpenedListName();
                        }
                        // ask if user really wants to delete list
                        $rootScope.showConfirmationMsg("RemoveListConfirmationController");
                    };
                    $scope.isLoggedIn = function () {
                        return session.isLoggedIn();
                    };
                    $scope.logout = function () {
                        session.stopWatching();
                        session.setUserProfile({});
                        $http.get(server.hostName() + "/LoginServlet?logout").then(function (response) {
                            $scope.userProfile = {};
                            console.log("logout: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
                            if (angular.isDefined($rootScope.listEditorWindow)) {
                                $rootScope.listEditorWindow.close();
                            }
                            if (angular.isDefined($rootScope.alertWindow)) {
                                $rootScope.alertWindow.close();
                            }
                            $state.go("index");
                        }, function (response) {
                            $rootScope.showAlertMsg($scope.dataError(response.data), function(){
                                console.log("onOk was fired");
                                alert("onOk was fired");
                            });
                            //$state.go("index");
                        });
                    };
                }])
            .controller("HomeController", ["$rootScope", "$scope", "$state", "$http", "$cookies", "$uibModal", "$ionicScrollDelegate", "$ionicSideMenuDelegate", "$ionicActionSheet", "ngDraggableDelegate", "server", "browser", "session",
                function ($rootScope, $scope, $state, $http, $cookies, $uibModal, $ionicScrollDelegate, $ionicSideMenuDelegate, $ionicActionSheet, ngDraggableDelegate, server, browser, session) {
                    console.debug("HomeController was loaded");
                    $scope.listNameToRemove = null;
                    $scope.listButtonDisabled = false;
                    $scope.showRemoveListButton = false;
                    $scope.listHold = false;
                    $scope.checkIfLoggedIn = function () {
                        var serverTime, clientTimeOffset, localTime;
                        // happens when ng-view loaded
                        // we need to check if user already been logged in
                        if ($state.current.name === "index") {
                            $http.get(server.hostName() + "/LoginServlet?isLoggedIn").then(function (response) {
                                if (response.data === null) {
                                    session.setLoggedIn(false);
                                } else {
                                    session.setUserProfile(response.data);
                                }
                                console.log("checkIfLoggedIn: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
                                console.log("isLoggedIn: %s", JSON.parse(response.data.loggedIn) ? "YES" : "NO");
                                //console.log("session.isLoggedIn() = %s", session.isLoggedIn());
                                // user needs to log in
                                if (!session.isLoggedIn()) {
                                    // show a modal window when page is loaded
                                    $rootScope.loginWindow = $uibModal.open({
                                        templateUrl: "loginWindow",
                                        controller: "LoginController",
                                        size: "sm",
                                        windowClass: "center-modal no-border-radius",
                                        animation: true,
                                        backdrop: "static",
                                        keyboard: false
                                    });
                                    $rootScope.loginWindow.rendered.then(function () {
                                        var modalHeader, rouletteOptions;
                                        // transform login window title to roulette element
                                        modalHeader = angular.element(document.getElementsByClassName("modal-header"));
                                        // TODO: [ISSUE] for some reason Chrome 'slide' animation effect lags. Because of that we are switching Chrome animation to 'fade'
                                        if (browser.name() === "chrome") {
                                            // fade
                                            rouletteOptions = {
                                                rouletteAnimation: "fade",
                                                rouletteBackgroundOpacity: 0
                                            };
                                        } else {
                                            // slide
                                            rouletteOptions = {
                                                rouletteContentOffset: "{10,-10}",
                                                rouletteAnimation: "slide",
                                                rouletteMaskImage: "images/triangle_graph.png",
                                                rouletteBackgroundOpacity: 0.4
                                            };
                                        }
                                        uiRoulette.create(modalHeader, rouletteOptions);
                                    });
                                }
                                // user already logged in
                                else {
                                    // TODO: get lists in case if database was updated
                                    //session.updateLists();
                                    $scope.$parent.updateUserProfile(session.getUserProfile());
                                    // redirect to 'home'
                                    $state.go("home");
                                }
                                $scope.$parent.updateUserProfile(session.getUserProfile());
                            }, function (response) {
                                if ($rootScope.loginWindow) {
                                    $scope.alertMsg = $scope.dataError(response.data);
                                } else {
                                    $rootScope.showAlertMsg($scope.dataError(response.data));
                                }
                            });
                        }
                        else if ($state.current.name === "home") {
                            server.setServerTime($cookies.get("serverTime"));
                            server.setClientTimeOffset($cookies.get("clientTimeOffset"));
                            // get serverTime cookie
                            serverTime = server.getServerTime();
                            clientTimeOffset = (new Date()).getTime() - serverTime;
                            $cookies.put("clientTimeOffset", clientTimeOffset);
                            //var sessionTimeout = $scope.userProfile.timeout;
                            //if (session.isLoggedIn() && sessionTimeout != 0) {
                            //console.log("sessionTimeout = %s", sessionTimeout);
                            // set up session timeout counter
                            session.watch(function () {
                                var sessionExpiry = Number($cookies.get("sessionExpiry")) + 15000; // 15 extra seconds to make sure
                                clientTimeOffset = $cookies.get("clientTimeOffset");
                                localTime = (new Date()).getTime();
                                /*console.log("localTime = %s, sessionExpiry = %s",
                                 $filter("date")(localTime - clientTimeOffset, "HH:mm:ss"),
                                 $filter("date")(sessionExpiry, "HH:mm:ss"));*/
                                if (localTime - clientTimeOffset > sessionExpiry) {
                                    //alert("Your session has expired");
                                    $rootScope.showAlertMsg("Your session has expired");
                                    //$scope.logout();
                                }
                            }, 15);
                        }
                    };
                    $scope.checkIfLoggedIn();
                    if ($scope.userProfile.lists) {
                        $rootScope.showListButton = ($scope.userProfile.lists.length > 0) ? true : false;
                        $rootScope.showPlusButton = ($scope.userProfile.lists.length === 0) ? true : false;
                    }
                    $scope.removeListButtonMouseenter = function () {
                        $scope.listButtonDisabled = true;
                    };
                    $scope.removeListButtonMouseleave = function () {
                        $scope.listButtonDisabled = false;
                    };
                    $scope.getList = function (listName, e) {
                        //console.log("listName = %s", listName);
                        //console.log("$scope.listButtonDisabled = %s", $scope.listButtonDisabled);
                        if (e.which === 1 || angular.isUndefined(e.which)) {
                            $http.get(server.hostName() + "/DataServlet?getList=" + listName).then(function (response) {
                                var data = JSON.stringify(response.data).replace(/\\/g, "");
                                console.log("getList: " + response.status + " " + response.statusText + ", data: " + data);
                                session.setOpenedListName(listName);
                                session.setOpenedListType(JSON.parse(response.data.content).type);
                                session.setOpenedListContent(response.data.content);
                                $rootScope.showListButton = false;
                                $state.go("listEditor");
                            }, function (response) {
                                $rootScope.showAlertMsg($scope.dataError(response.data));
                            });
                        }
                    };
                    //
                    $scope.contentScroll = function () {
                        $scope.scrolling = true;
                    };
                    $scope.contentScrollComplete = function () {
                        $scope.scrolling = false;
                    };
                    $scope.pullToRefreshDoRefresh = function () {
                        //console.log("pullToRefreshDoRefresh");
                        $state.go("index");
                        $scope.$broadcast("scroll.refreshComplete");
                    };
                    $scope.thumbnailDragStart = function () {
                        var i;
                        //console.log("thumbnailDragStart");
                        $scope.dragList = true;
                        $scope.oldLists = $scope.userProfile.lists.slice();
                        $scope.newListIndexes = [];
                        for (i = 0; i < $scope.userProfile.lists.length; i++) {
                            $scope.newListIndexes.push(i);
                        }
                        $ionicScrollDelegate.freezeScroll(true);
                        $ionicSideMenuDelegate.canDragContent(false);
                    };
                    $scope.thumbnailDropEnter = function (newObjIndex, curObjTitle) {
                        //console.log("thumbnailDropEnter");
                        var curObjVal, curObjIndex;
                        curObjIndex = $scope.userProfile.lists.indexOf(curObjTitle);
                        if (newObjIndex !== curObjIndex) {
                            //newObjTitle = $scope.userProfile.lists[newObjIndex];
                            // update current object value index from '$scope.newListIndexes'
                            curObjVal = $scope.newListIndexes[curObjIndex];
                            // remove draggable object's index from the '$scope.newListIndexes'
                            $scope.newListIndexes.splice(curObjIndex, 1);
                            // insert draggable object's index in a new position in the '$scope.newListIndexes'
                            $scope.newListIndexes.splice(newObjIndex, 0, curObjVal);
                            //
                            // remove draggable object from the '$scope.userProfile.lists'
                            $scope.userProfile.lists.splice(curObjIndex, 1);
                            // insert draggable object in a new position in the '$scope.userProfile.lists'
                            $scope.userProfile.lists.splice(newObjIndex, 0, curObjTitle);
                        }
                    };
                    var forceThumbnailRedraw = function (element) {
                        //var trick;
                        if (!element) {
                            return;
                        }
                        var display = window.getComputedStyle(element).display; //element.style.display;
                        if (angular.isUndefined(display) || display === "") {
                            display = "block";
                        }
                        element.style.display = "none";
                        //trick = element.offsetHeight;
                        element.style.display = display;
                    };
                    $scope.thumbnailDragStop = function (e) {
                        //console.log("thumbnailDragStop");
                        $scope.dragList = false;
                        $ionicScrollDelegate.freezeScroll(false);
                        if ($scope.windowWidth < 768) {
                            $ionicSideMenuDelegate.canDragContent(true);
                        }
                        forceThumbnailRedraw(e.target);
                        forceThumbnailRedraw(e.target.parentElement);
                    };
                    $scope.thumbnailDropSuccess = function () {
                        var i, listsWereReordered, data;
                        //console.log("thumbnailDropSuccess");
                        listsWereReordered = ($scope.userProfile.lists.toString() !== $scope.oldLists.toString());
                        if (listsWereReordered) {
                            // send list order to the server
                            for (i = 0; i < $scope.oldLists.length; i++) {
                                $scope.newListIndexes[i] = $scope.userProfile.lists.indexOf($scope.oldLists[i]);
                            }
                            data = $scope.newListIndexes.toString();
                            $http.post(server.hostName() + "/DataServlet?reorderLists", data).then(function (response) {
                                console.log("reorderLists: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
                            }, function () {
                                console.log("ERROR");
                            });
                        }
                    };
                    $scope.thumbnailTap = function (listname, e) {
                        //console.log("thumbnailTap");
                        if (!$scope.listButtonDisabled && !$scope.dragList && !$scope.listHold) {
                            $scope.getList(listname, e);
                        }
                    };
                    $scope.thumbnailRelease = function (/*listname*/) {
                        //console.log("thumbnailRelease");
                        /*if ($scope.scrolling)
                         return;*/
                        //console.log("!$scope.listButtonDisabled = %s, $scope.dragList = %s, $scope.listHold = %s", $scope.listButtonDisabled, $scope.dragList, $scope.listHold);
                        /*if (!$scope.listButtonDisabled && !$scope.dragList && !$scope.listHold)
                         $scope.getList(listname, e);*/
                        $scope.listHold = false;
                        ngDraggableDelegate.canDragContent(true);
                        $ionicSideMenuDelegate.canDragContent(true);
                        $ionicScrollDelegate.freezeScroll(false);
                    };
                    $scope.thumbnailHold = function (listname, e) {
                        //console.log("thumbnailHold");
                        if ($scope.dragList) {
                            return;
                        }
                        $scope.dragList = false;
                        if (browser.isMobileOrTablet()) {
                            $scope.listHold = true;
                            $ionicScrollDelegate.freezeScroll(true);
                            $ionicSideMenuDelegate.canDragContent(false);
                            ngDraggableDelegate.canDragContent(false);
                            // Show the action sheet
                            var hideSheet = $ionicActionSheet.show({
                                titleText: listname + " options",
                                buttons: [
                                    {text: "Edit"}
                                ],
                                destructiveText: "Delete", destructiveButtonClicked: function () {
                                    hideSheet();
                                    $scope.removeList(listname);
                                },
                                buttonClicked: function (index) {
                                    switch (index) {
                                        case 0:
                                            break;
                                        case 1:
                                            $scope.getList(listname, e);
                                            break;
                                        default:
                                            break;
                                    }
                                    return true;
                                },
                                cancelText: "Cancel", cancel: function () {
                                    $scope.listHold = false;
                                    $ionicScrollDelegate.freezeScroll(false);
                                    $ionicSideMenuDelegate.canDragContent(true);
                                    ngDraggableDelegate.canDragContent(true);
                                }
                            });
                        }
                    }
                    ;
                }])
            .controller("LoginController", ["$rootScope", "$scope", "$state", "$http", "server", "browser", "session",
                function ($rootScope, $scope, $state, $http, server, browser, session) {
                    console.debug("LoginController was loaded");
                    // default variables
                    $scope.loginWindow = true;
                    //TODO: remove $scope.userProfile
                    $scope.userProfile = {username: "demo", password: "Qwerty!23", avatar: ""};
                    $scope.passwordStrength = {
                        minimumLength: false,
                        recommendLength: false,
                        number: false,
                        upperCaseLetter: false,
                        lowerCaseLetter: false,
                        specialCharacter: false,
                        progress: 0
                    };
                    //
                    $scope.alertMsg = "";
                    $scope.changeLoginWindowBody = function () {
                        $scope.loginWindow = !$scope.loginWindow;
                        // hide alert
                        if ($scope.alertMsg !== "") {
                            $scope.alertMsg = "";
                        }
                        // body of the modal form is 'Sign Up'            
                        if (!$scope.loginWindow) {
                            $scope.changePassword();
                            $scope.userProfile.avatar = "avt" + Math.floor((Math.random() * 24) + 1);
                        }
                    };
                    $scope.avatarPopoverTrigger = function () {
                        if (browser.isMobileOrTablet()) {
                            return "touchend";
                        }
                        // TODO: needed a fix for Safari
                        //return "click";    
                        return (browser.name() === "safari") ? "click" : "focus";
                    };
                    $scope.fingerMoved = false;
                    $scope.chooseAvatar = function (e) {
                        var popoverElem, avt, btnAvatars, popover;
                        if (!$scope.fingerMoved) {
                            popoverElem = e.toElement;
                            if (popoverElem === null) {
                                popoverElem = e.target;
                            }
                            if (popoverElem === null) {
                                popoverElem = e.relatedTarget;
                            }
                            avt = popoverElem.className;
                            avt = avt.substring(avt.indexOf("avt"));
                            if (avt.indexOf("avt") !== -1) {
                                $scope.userProfile.avatar = avt;
                                // remove itself
                                btnAvatars = document.getElementById("btn-avatars");
                                popover = btnAvatars.nextSibling;
                                if (popover && popover.parentNode) {
                                    popover.parentNode.removeChild(popover);
                                }
                                btnAvatars.focus();
                                btnAvatars.click();
                            }
                        } else {
                            $scope.fingerMoved = false;
                        }
                    };
                    $scope.changePassword = function () {
                        var i, char, passwordChars;
                        // hide alert
                        if ($scope.alertMsg !== "") {
                            $scope.alertMsg = "";
                        }
                        $scope.passwordStrength = {
                            minimumLength: false,
                            recommendLength: false,
                            number: false,
                            upperCaseLetter: false,
                            lowerCaseLetter: false,
                            specialCharacter: false,
                            progress: 0
                        };
                        if ($scope.userProfile.password) {
                            if ($scope.userProfile.password.length >= 5) {
                                $scope.passwordStrength.minimumLength = true;
                            }
                            if ($scope.userProfile.password.length >= 8) {
                                $scope.passwordStrength.recommendLength = true;
                            }
                            passwordChars = $scope.userProfile.password.split("");
                            for (i = 0; i < passwordChars.length; i++) {
                                char = passwordChars[i];
                                if (parseInt(char, 10)) {
                                    $scope.passwordStrength.number = true;
                                } else if ((/^[! \" # $ % & \' ( ) * + , \- . \/ : ; < = \> ? @ \[ \\\ \] \^ _ ` { | } ~]*$/).test(char) === true) {
                                    $scope.passwordStrength.specialCharacter = true;
                                } else if (char === char.toUpperCase()) {
                                    $scope.passwordStrength.upperCaseLetter = true;
                                } else if (char === char.toLowerCase()) {
                                    $scope.passwordStrength.lowerCaseLetter = true;
                                }
                            }
                        }
                        $scope.passwordStrength.progress += ($scope.passwordStrength.minimumLength ? 10 : 0) + ($scope.passwordStrength.recommendLength ? 30 : 0) + ($scope.passwordStrength.number ? 10 : 0) + ($scope.passwordStrength.upperCaseLetter ? 10 : 0) + ($scope.passwordStrength.lowerCaseLetter ? 10 : 0) + ($scope.passwordStrength.specialCharacter ? 30 : 0);
                    };
                    $scope.encryptPassword = function (s) {
                        var salt, hash;
                        // TODO: $location.host() doesn't work through LAN
                        // our salt is domain_name
                        salt = "www.lister.org";
                        s = salt + s;
                        hash = CryptoJS.SHA3(s, {outputLength: 512});
                        return hash.toString();
                    };
                    $scope.submit = function () {
                        //console.log("$scope.submit");
                        // hide alert
                        if ($scope.alertMsg !== "") {
                            $scope.alertMsg = "";
                        }
                        // check if both the username and the password are not empty
                        if ($scope.loginForm.$valid) {
                            // check if the body of the modal window is 'login'
                            if ($scope.loginWindow) {
                                $scope.login();
                            }
                            // otherwise the body of the modal window is 'sign up'
                            else {
                                $scope.signUp();
                            }
                        } else {
                            var emptyFieldNames = "Password";
                            if ($scope.loginForm.username.$invalid) {
                                emptyFieldNames = "User name";
                                if ($scope.loginForm.password.$invalid) {
                                    emptyFieldNames += " and password";
                                }
                            }
                            $scope.alertMsg = emptyFieldNames + " cannot be empty";
                        }
                    };
                    $scope.grantAccess = function (data) {
                        $scope.userProfile.password = "";
                        session.setUserProfile({
                            loggedIn: true,
                            timeout: data.timeout,
                            username: data.username,
                            avatar: data.avatar,
                            lists: data.lists
                        });
                        //
                        $scope.userProfile.username = data.username;
                        $rootScope.loginWindow.close();
                        $state.go("home");
                    };
                    $scope.login = function () {
                        //console.log("$scope.login");
                        $http.post(server.hostName() + "/LoginServlet", {
                            username: $scope.userProfile.username,
                            password: $scope.encryptPassword($scope.userProfile.password)
                        }).then(function (response) {
                            console.log("login: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
                            // check if server returned correct data    
                            if ((typeof (response.data) === "object") && (JSON.parse(response.data.loggedIn) === true)) {
                                $scope.grantAccess(response.data);
                            }
                            // check if server returned an error
                            else if (typeof (response.data) === "string") {
                                $scope.alertMsg = response.data;
                            }
                        }, function (response) {
                            $scope.alertMsg = $rootScope.dataError(response.data);
                        });
                    };
                    $scope.signUp = function () {
                        // check if password meets all the requirements
                        if ($scope.passwordStrength.progress >= 70) {
                            $http.post(server.hostName() + "/SignUpServlet",
                                    {
                                        username: $scope.userProfile.username,
                                        password: $scope.encryptPassword($scope.userProfile.password),
                                        avatar: $scope.userProfile.avatar
                                    })
                                    .then(function (response) {
                                        console.log("sign up: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
                                        $scope.grantAccess(response.data);
                                    }, function (response) {
                                        $scope.dataError(response.data);
                                    });
                        }
                        // password does not meet all the requirements
                        else {
                            $scope.alertMsg = "Password must:<br/>"
                                    + (!$scope.passwordStrength.minimumLength ? "be at <strong><u>least</u></strong> 5 characters including<br/>" : "")
                                    + (!$scope.passwordStrength.upperCaseLetter ? "contain 1 <strong>uppercase</strong></a> letter<br/>" : "")
                                    + (!$scope.passwordStrength.lowerCaseLetter ? "contain 1 <strong>lowercase</strong></a> letter<br/>" : "")
                                    + (!$scope.passwordStrength.specialCharacter ? "contain 1 <strong>special character</strong></a><br/>" : "")
                                    + (!$scope.passwordStrength.number ? "contain 1 <strong>numeric character</strong></a>" : "");
                        }
                    };
                }])
            .controller("OpenListEditorController", ["$rootScope", "browser", "$uibModal",
                function ($rootScope, browser, $uibModal) {
                    var templateName = "listEditorWindow";
                    if (browser.isMobileOrTablet()) {
                        templateName = "listEditorWindowNoScroll";
                    }
                    $rootScope.listEditorWindow = $uibModal.open({
                        templateUrl: templateName,
                        controller: "ListEditorController",
                        windowClass: "list-editor-window",
                        backdropClass: "list-editor-window-backdrop",
                        size: "lg",
                        //backdrop: "static",
                        animation: true
                    });
                }])
            .controller("ListEditorController", ["$rootScope", "$scope", "$state", "$timeout", "$http", "$ionicScrollDelegate", "server", "browser", "session",
                function ($rootScope, $scope, $state, $timeout, $http, $ionicScrollDelegate, server, browser, session) {
                    console.debug("ListEditorController was loaded");
                    /*var templateName = "listEditorWindow";
                     if (browser.isMobileOrTablet())
                     templateName = "listEditorWindowNoScroll";
                     $ionicModal.fromTemplateUrl(templateName, {scope: $scope, animation: "slide-in-up"})
                     .then(function (modal) {
                     $rootScope.listEditorWindow = modal;
                     $rootScope.listEditorWindow.show();
                     });*/
                    $scope.headerFocused = true;
                    //$scope.checkboxesColumnDisplay = "none";
                    $scope.currentList = {
                        name: session.getOpenedListName(),
                        type: session.getOpenedListType(),
                        nameBeforeChanges: session.getOpenedListName(),
                        listBody: ""
                    };
                    $scope.checkboxIcon = "check-circle-o";
                    $scope.checkboxIconUnchecked = "circle-thin";
                    $scope.columnHeadingTitle = "";

                    $scope.data = session.getOpenedListContent();
                    if (angular.equals("{}", $scope.data) || angular.equals({}, $scope.data)) {
                        // type = {"simple", "checklist", "simple_table", checklist_table"};
                        $scope.data = {type: "simple", headings: [""], body: [{text: "", checked: false}]};
                    }
                    /*$scope.data = {
                     type: "checklist",
                     headings: ["Ingredients", "Quantity", "Measurements"],
                     body: [
                     {text: "Half and Half", checked: false, ad0: "2", ad1: "pk"},
                     {text: "Cucumbers", checked: false, ad0: "4", ad1: "each"},
                     {text: "Tomatoes", checked: true, ad0: "1", ad1: "pack"},
                     {text: "Sour Cream", checked: true, ad0: "2", ad1: "8oz pack"},
                     {text: "Corn On A Cob", checked: true, ad0: "3", ad1: "ech"}
                     ]};*/
                    // updating checkbox column data, main column data and additional columns data
                    var updateCheckboxColumnData, updateMainColumnData, updateToolbarMenuData,
                            columnsSubmenuActive, columnsSubmenu, toolboxTextIcons, toolboxElementIcons,
                            getSelection;
                    updateCheckboxColumnData = function () {
                        var i, arr = [];
                        if (!angular.isUndefined($scope.data.body)) {
                            for (i = 0; i < $scope.data.body.length; i++) {
                                arr.push($scope.data.body[i].checked);
                            }
                            return arr;
                        }
                        return null;
                    };
                    updateMainColumnData = function () {
                        var i, arr = [];
                        if ($scope.data === "{}" || angular.isUndefined($scope.data)) {
                            return [];
                        }
                        for (i = 0; i < $scope.data.body.length; i++) {
                            arr.push($scope.data.body[i].text);
                        }
                        return arr;
                    };
                    $scope.clearHeadingsData = function () {
                        if ($scope.data.headings.length >= 1) {
                            var firstHeadingTitle = $scope.data.headings[0];
                            $scope.data.headings = [];
                            $scope.data.headings.push(firstHeadingTitle);
                        }
                    };
                    $scope.updateAdditionalColumnsData = function (options) {
                        var i, j, arr = [], innerArr;
                        if (options && options.clear === true) {
                            return [];
                        }
                        if ($scope.data === "{}" || angular.isUndefined($scope.data)) {
                            return [];
                        }
                        for (j = 0; j < $scope.data.headings.length - 1; j++) {
                            innerArr = [];
                            for (i = 0; i < $scope.data.body.length; i++) {
                                innerArr.push($scope.data.body[i]["ad" + j]);
                            }
                            arr.push(innerArr);
                        }
                        return arr;
                    };
                    $scope.checkboxColumnData = updateCheckboxColumnData();
                    $scope.mainColumnData = updateMainColumnData();
                    $scope.additionalColumnsData = $scope.updateAdditionalColumnsData();
                    // setting up initial textarea text
                    if ($scope.data.body) {
                        $scope.data.body.forEach(function (item, index) {
                            if (index === $scope.data.body.length - 1) {
                                $scope.currentList.listBody = $scope.currentList.listBody + item.text;
                            } else {
                                $scope.currentList.listBody = $scope.currentList.listBody + item.text + "\n";
                            }
                        });
                    }
                    // check if data is a checklist and make arangements about it        
                    if ($scope.data.type.includes("checklist")) {
                        $scope.checkboxesColumnDisplay = "table-cell";
                    } else {
                        $scope.checkboxesColumnDisplay = "none";
                    }
                    //<editor-fold defaultstate="collapsed" desc="var columnsSubmenu, toolboxTextIcons, toolboxElementIcons">        
                    columnsSubmenuActive = [
                        {icon: "plus", title: "Add column", state: ""},
                        {icon: "minus", title: "Remove column", state: ""}
                    ];
                    columnsSubmenu = [];
                    if ($scope.currentList.type.includes("table")) {
                        columnsSubmenu = columnsSubmenuActive;
                    }
                    //console.log(JSON.stringify(columnsSubmenu));
                    toolboxTextIcons = [
                        {icon: "check-square-o", title: "Toggle checkboxes", state: ""},
                        {icon: "columns", title: "Toggle a table", submenu: columnsSubmenu}
                        /*{icon: "columns", title: "Add a column", content: "<span>column</span>"},
                         {icon: "align-left", title: "Left Align"},
                         {icon: "align-center", title: "Center Align"},
                         {icon: "align-right", title: "Right Align"},
                         {icon: "align-justify", title: "Justify Align"},
                         {icon: "bold", title: "Bold Text"},
                         {icon: "italic", title: "Italic Text"}
                         {icon: ""},
                         {icon: "underline", title: "Underlined Text"},
                         {icon: "strikethrough", title: "Striked Text"}*/
                    ];
                    toolboxElementIcons = [
                        {icon: "check-square-o", title: "Create a checklist", content: "<span>checklist</span>", state: ""},
                        {icon: "columns", title: "Create a column", content: "<span>column</span>"},
                        {icon: "align-left", title: "Left Align"},
                        {icon: "align-center", title: "Center Align"},
                        {icon: "align-right", title: "Right Align"},
                        {icon: "align-justify", title: "Justify Align"}
                    ];
                    updateToolbarMenuData = function () {
                        var i, arr = [];
                        /*for (i = 0; i < toolboxTextIcons.length; i++) {
                         if (angular.isDefined(toolboxTextIcons[i].submenu)) {}
                         }*/
                        if (!angular.isUndefined($scope.data.body)) {
                            for (i = 0; i < $scope.data.body.length; i++) {
                                arr.push($scope.data.body[i].checked);
                            }
                            return arr;
                        }
                        return null;
                    };
                    //</editor-fold>
                    $scope.toolboxIcons = toolboxTextIcons;
                    // go to home page on closing the editor without submitting it
                    $rootScope.listEditorWindow.result.then(function () {
                        return;
                    }, function () {
                        $state.go("home");
                    });
                    $scope.timer = null;
                    $scope.calculateTextareaWidth = function () {
                        var text, textPaddingLeft, textPaddingRight, textWidth;
                        text = angular.element(document.querySelector("#list-editor-window-text"))[0];
                        textPaddingLeft = parseInt(window.getComputedStyle(text)["padding-left"], 10);
                        textPaddingRight = parseInt(window.getComputedStyle(text)["padding-right"], 10);
                        textWidth = parseInt(window.getComputedStyle(text).width, 10) - 2 * textPaddingLeft - 2 * textPaddingRight;
                        return textWidth + "px";
                    };
                    getSelection = function (elem) {
                        // obtain the index of the first and the last selected character
                        var start = elem.selectionStart, finish = elem.selectionEnd;
                        // return the selected text
                        return elem.value.substring(start, finish);
                    };
                    $scope.keydownCtrlEnterShortcut = function (e) {
                        // Ctrl + Enter keyboard combination was pressed
                        e.stopImmediatePropagation();
                        e.stopPropagation();
                        if (e.ctrlKey) {
                            $scope.submit();
                        }
                    };
                    $scope.textareaMousemove = function ($event) {
                        var text, caretCoordinates, toolboxLimitArea;
                        // TODO: fix toolbar showing if textarea was scrolled
                        if (browser.isMobileOrTablet()) {
                            return;
                        }
                        $scope.showToolbox = false;
                        $scope.toolboxDisplay = "none";
                        $timeout.cancel($scope.timer);
                        // mouse {x,y} coordinates
                        $scope.textareaMousePosition = {
                            "x": $event.offsetX,
                            "y": $event.offsetY
                        };
                        // caret {x,y} coordinates
                        text = document.getElementById("list-editor-window-text");
                        caretCoordinates = getCaretCoordinates(text, text.selectionEnd);
                        // define a limit in pixels to activate a toolbox
                        toolboxLimitArea = 20;
                        // check if cursor is close to caret in textarea
                        if ($scope.textareaMousePosition.x + toolboxLimitArea >= caretCoordinates.left
                                && $scope.textareaMousePosition.x - toolboxLimitArea <= caretCoordinates.left
                                && $scope.textareaMousePosition.y + toolboxLimitArea >= caretCoordinates.top
                                && $scope.textareaMousePosition.y - toolboxLimitArea <= caretCoordinates.top) {
                            // wait for 800ms before further actions
                            $scope.timer = $timeout(function () {
                                // set cursor top 'wait'
                                $scope.textareaCursor = "pointer";
                                // transform mouse coordinates to px
                                $scope.textareaMousePosition.x = $scope.textareaMousePosition.x + 10 + "px";
                                $scope.textareaMousePosition.y = $scope.textareaMousePosition.y + 10 + "px";
                                if (getSelection(text) !== "") {
                                    $scope.timer = $timeout(function () {
                                        $scope.toolboxMouseentered = true;
                                        $scope.toolboxIcons = toolboxTextIcons;
                                        $scope.showToolbox = true;
                                        $scope.toolboxDisplay = "inline-block";
                                    }, 400);
                                } else {
                                    $scope.timer = $timeout(function () {
                                        $scope.toolboxMouseentered = true;
                                        $scope.toolboxIcons = toolboxElementIcons;
                                        $scope.showToolbox = true;
                                        $scope.toolboxDisplay = "inline-block";
                                    }, 400);
                                }
                            }, 800);
                        } else {
                            // set cursor back to 'auto'
                            $scope.textareaCursor = "auto";
                        }
                    };
                    // TODO: toolbox is hiding too fast and sometimes you can't get cursor to the toolbox because it's hiding immidiately after showing
                    $scope.textareaMouseleave = function () {
                        //console.debug("textareaMouseleave");
                        $timeout.cancel($scope.timer);
                        if (!$scope.toolboxMouseentered) {
                            $scope.showToolbox = false;
                        }
                    };
                    /*getDataBodyText = function () {
                     var arr = [];
                     $scope.data.body.forEach(function (item) {
                     arr.push(item.text);
                     });
                     return arr;
                     };*/
                    $scope.pullToClose = function () {
                        //console.log("pullToClose");
                        $rootScope.listEditorWindow.close();
                        $state.go("home");
                        $scope.$broadcast("scroll.refreshComplete");
                    };
                    $scope.changeHeading = function (headingTitle, index) {
                        $scope.data.headings[index] = headingTitle;
                    };
                    $scope.changeCheckboxStatus = function (index) {
                        $scope.data.body[index].checked = !$scope.data.body[index].checked;
                    };
                    $scope.disableScrolling = function () {
                        $ionicScrollDelegate.freezeAllScrolls(true);
                    };
                    $scope.enableScrolling = function () {
                        $ionicScrollDelegate.freezeAllScrolls(false);
                    };
                    $scope.scrollTextarea = function (e) {
                        var currentPos, checkboxesColumn;
                        currentPos = e.currentTarget.scrollTop;
                        checkboxesColumn = angular.element(document.querySelector("#list-editor-window-checkboxes-column"))[0];
                        console.log(checkboxesColumn.scrollTop);
                        checkboxesColumn.scrollTop = currentPos;
                        console.log(checkboxesColumn.scrollTop);
                    };
                    $scope.changeTextarea = function () {
                        alert("change text area");
                        var textAreaBodyRowByRow, insertedElem, i, j;
                        // make changes in $scope.data
                        textAreaBodyRowByRow = $scope.currentList.listBody.textAreaBodyRowByRow("\n");
                        //console.debug("  textAreaBodyRowByRow          = [%s]\n  data.body.text = [%s]", JSON.stringify(textAreaBodyRowByRow), JSON.stringify(getDataBodyText()));
                        //sign = "";
                        insertedElem = {text: "", checked: false};
                        for (j = 0; j < $scope.data.headings.length - 1; j++) {
                            insertedElem["ad" + j] = "";
                        }
                        if (textAreaBodyRowByRow.length === $scope.data.body.length) {
                            //sign = "=";
                            for (i = 0; i < $scope.data.body.length; i++) {
                                $scope.data.body[i].text = textAreaBodyRowByRow[i];
                            }
                        } else if (textAreaBodyRowByRow.length > $scope.data.body.length) {
                            //sign = ">";
                            for (i = 0; i < textAreaBodyRowByRow.length; i++) {
                                // textarea caret in the END of the text and there was Enter key pressed
                                if (i > $scope.data.body.length - 1) {
                                    insertedElem.text = textAreaBodyRowByRow[i];
                                    $scope.data.body.push(insertedElem);
                                } else if (textAreaBodyRowByRow[i] !== $scope.data.body[i].text) {
                                    // textarea caret in MIDDLE of the text but in the END OF the ROW or in the BEGGINNING of the textarea and there was Enter key pressed
                                    if (textAreaBodyRowByRow[i] === "") {
                                        // add additional row to $scope.data.body
                                        $scope.data.body.splice(i, 0, insertedElem);
                                    }
                                    // textarea caret in MIDDLE of the text and in the MIDDLE OF the ROW and there was Enter key pressed
                                    else {
                                        $scope.data.body[i].text = textAreaBodyRowByRow[i]; // add additional row to $scope.data.body
                                        insertedElem.text = textAreaBodyRowByRow[i + 1];
                                        $scope.data.body.splice(i + 1, 0, insertedElem);
                                    }
                                } else {
                                    continue;
                                }
                                break;
                            }
                        } else if (textAreaBodyRowByRow.length < $scope.data.body.length) {
                            //sign = "<";
                            for (i = 0; i < $scope.data.body.length; i++) {
                                // textarea caret in the END of the text and there was Enter key pressed
                                if (i > textAreaBodyRowByRow.length - 1) {
                                    $scope.data.body.pop();
                                } else if (textAreaBodyRowByRow[i] !== $scope.data.body[i].text) {
                                    // removed row is empty
                                    if ($scope.data.body[i].text === "") {
                                        // remove row from $scope.data.body
                                        $scope.data.body.splice(i, 1);
                                    }
                                    // removed row is not empty
                                    else {
                                        // remove row from $scope.data.body
                                        $scope.data.body[i].text = textAreaBodyRowByRow[i];
                                        $scope.data.body.splice(i + 1, 1);
                                    }
                                } else {
                                    continue;
                                }
                                break;
                            }
                        }
                        $scope.checkboxColumnData = updateCheckboxColumnData();
                        $scope.additionalColumnsData = $scope.updateAdditionalColumnsData();
                        //console.debug("%s textAreaBodyRowByRow          = [%s]\n  data.body.text = [%s]", sign, JSON.stringify(textAreaBodyRowByRow), JSON.stringify(getDataBodyText()));
                        //console.debug("data.body = [%s]", JSON.stringify($scope.data.body));
                    };
                    $scope.changeInput = function () {
                        var i;
                        $scope.currentList.listBody = "";
                        for (i = 0; i < $scope.data.body.length; i++) {
                            $scope.currentList.listBody += $scope.data.body[i].text;
                            if (i !== $scope.data.body.length - 1) {
                                $scope.currentList.listBody += "\n";
                            }
                        }
                    };
                    $scope.changeInputEnterKey = function (e, index) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        //e.stopPropagation();
                        if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
                            if (index === $scope.data.body.length - 1) {
                                console.log("// create");
                                $scope.data.body.push({text: "", checked: false});
                                $scope.mainColumnData = updateMainColumnData();
                                // go to the next element
                            } else {
                                console.log("// go to the next element");
                            }
                        }
                    };
                    $scope.toolboxMouseleave = function () {
                        //console.debug("toolboxMouseleave");
                        $scope.showToolbox = false;
                        $scope.toolboxMouseentered = false;
                    };
                    $scope.updateSubmenuData = function (items) {
                        var i, arr = [];
                        if (angular.isUndefined(items)) {
                            return [];
                        }
                        for (i = 0; i < items.length; i++) {
                            arr.push(items[i]);
                        }
                        return arr;
                    };
                    $scope.submenuData = [];
                    $scope.toolbarMouseenterDelayed = function (item, index) {
                        var itemNode, itemHeight;
                        $scope.submenuParentIcon = item.icon;
                        $scope.submenuData = $scope.updateSubmenuData(item.submenu);
                        if (angular.isDefined(item.submenu)) {
                            //console.debug("$scope.toolbarMouseenterDelayed");
                            itemNode = angular.element(document.querySelector("#list-editor-window-side-toolbar"))[0];
                            itemHeight = parseInt(window.getComputedStyle(itemNode).width, 10);
                            $scope.submenuTop = itemHeight * index + "px";
                            $scope.hideSubmenu = false;
                        } else {
                            $scope.hideSubmenu = true;
                        }
                    };
                    $scope.toolbarLeave = function () {
                        //console.debug("toolbarLeave");
                        $scope.hideSubmenu = true;
                        $scope.submenuData = $scope.updateSubmenuData();
                    };
                    $scope.submenuEnter = function () {
                        //console.debug("submenu enter");
                        $scope.hideSubmenu = false;
                    };
                    $scope.submenuLeave = function () {
                        //console.debug("submenu leave");
                        $scope.hideSubmenu = true;
                        $scope.submenuData = $scope.updateSubmenuData();
                    };
                    $scope.submenuClick = function (item) {
                        if (angular.isDefined(item) && angular.isDefined(item.icon) && angular.isDefined($scope.submenuParentIcon)) {
                            $scope.toolbarClick($scope.submenuParentIcon, item.icon);
                        }
                    };
                    $scope.toolbarClick = function (icon, submenu_icon) {
                        console.log("toolbarClick: icon=%s submenu_icon=%s", icon, submenu_icon);
                        switch (icon) {
                            case "check-square-o":
                                $scope.toggleChecklist();
                                break;
                            case "columns":
                                if (angular.isUndefined(submenu_icon)) {
                                    $scope.toggleTable();
                                } else {
                                    switch (submenu_icon) {
                                        case "plus":
                                            $scope.addColumn();
                                            break;
                                        case "minus":
                                            $scope.removeColumn();
                                            break;
                                    }
                                }
                                break;
                            case "align-left":
                                $scope.textAlign = "left";
                                $scope.data.textAlign = $scope.textAlign;
                                break;
                            case "align-center":
                                $scope.textAlign = "center";
                                $scope.data.textAlign = $scope.textAlign;
                                break;
                            case "align-right":
                                $scope.textAlign = "right";
                                $scope.data.textAlign = $scope.textAlign;
                                break;
                            case "align-justify":
                                $scope.textAlign = "justify";
                                break;
                            default :
                                console.log(icon);
                        }
                        $scope.showToolbox = false;
                    };
                    $scope.toggleChecklist = function () {
                        console.debug("toggleChecklist");
                        switch ($scope.data.type) {
                            case "simple":
                                $scope.data.type = "checklist";
                                $scope.checkboxesColumnDisplay = "table-cell";
                                toolboxElementIcons[0].state = "active";
                                toolboxTextIcons[0].state = "active";
                                break;
                            case "checklist":
                                $scope.data.type = "simple";
                                $scope.checkboxesColumnDisplay = "none";
                                toolboxElementIcons[0].state = "";
                                toolboxTextIcons[0].state = "";
                                break;
                            case "simple_table":
                                $scope.data.type = "checklist_table";
                                $scope.checkboxesColumnDisplay = "table-cell";
                                toolboxElementIcons[0].state = "active";
                                toolboxTextIcons[0].state = "active";
                                break;
                            case "checklist_table":
                                $scope.data.type = "simple_table";
                                $scope.checkboxesColumnDisplay = "none";
                                toolboxElementIcons[0].state = "";
                                toolboxTextIcons[0].state = "";
                                break;
                        }
                        console.log($scope.data.type);
                        $scope.currentList.type = $scope.data.type;
                        session.setOpenedListType($scope.data.type);
                        $scope.checkboxColumnData = updateCheckboxColumnData();
                        $scope.mainColumnData = updateMainColumnData();
                    };
                    $scope.toggleTable = function () {
                        var dataTypeBeforeChanging = $scope.data.type;
                        switch (dataTypeBeforeChanging) {
                            case "simple":
                                $scope.data.type = "simple_table";
                                $scope.checkboxesColumnDisplay = "none";
                                columnsSubmenu = columnsSubmenuActive;
                                break;
                            case "checklist":
                                $scope.data.type = "checklist_table";
                                $scope.checkboxesColumnDisplay = "table-cell";
                                columnsSubmenu = columnsSubmenuActive;
                                break;
                            case "simple_table":
                                $scope.data.type = "simple";
                                $scope.checkboxesColumnDisplay = "none";
                                columnsSubmenu = [];
                                $scope.additionalColumnsData = $scope.updateAdditionalColumnsData({clear: true});
                                $scope.clearHeadingsData();
                                break;
                            case "checklist_table":
                                $scope.data.type = "checklist";
                                $scope.checkboxesColumnDisplay = "table-cell";
                                columnsSubmenu = [];
                                $scope.additionalColumnsData = $scope.updateAdditionalColumnsData({clear: true});
                                $scope.clearHeadingsData();
                                break;
                        }
                        console.debug("toggleTable from [%s] to [%s]", dataTypeBeforeChanging, $scope.data.type);
                        $scope.currentList.type = $scope.data.type;
                        session.setOpenedListType($scope.data.type);
                    };
                    $scope.addColumn = function () {
                        var i;
                        console.debug("addColumn");
                        console.log("$scope.data.body = %s", JSON.stringify($scope.data.body));
                        $scope.data.headings.push("");
                        //$scope.data.body.push({text: "", checked: false});
                        /*jslint unparam: true*/
                        for (i = 0; i < $scope.data.headings.length - 1; i++) {
                            $scope.data.body.forEach(function (item, index) {
                                item["ad" + ($scope.data.headings.length - 2)] = "";
                            });
                        }
                        /*jslint unparam: false*/
                        console.log("$scope.data.body = %s", JSON.stringify($scope.data.body));
                        console.log(JSON.stringify($scope.additionalColumnsData));
                        $scope.additionalColumnsData = $scope.updateAdditionalColumnsData();
                        console.log(JSON.stringify($scope.additionalColumnsData));
                    };
                    $scope.removeColumn = function () {
                        console.debug("removeColumn");
                    };
                    $scope.changeAdditional = function (data, row, col) {
                        //console.debug("$scope.changeAdditional");
                        //console.debug(data, row, col);
                        col = col.replace(/ad/, "");
                        // make changes in $scope.data
                        $scope.data.body[row]["ad" + col] = data;
                    };
                    $scope.submit = function () {
                        console.debug("$scope.submit");
                        // check if it's a new list
                        if (session.getOpenedListIsNew()) {
                            // changing list status
                            session.setOpenedListIsNew(false);
                            // check if the list title is not empty
                            if ($scope.currentList.name !== "") {
                                // create a list and send information to the server
                                //console.log($scope.currentList.listBody);
                                $rootScope.addList($scope.currentList.name, $scope.data);
                            }
                        }
                        // else send changes to the server
                        else {
                            // check if the list title is not empty
                            if ($scope.currentList.name !== "") {
                                // send changes to the server
                                var paramRow = "";
                                if (($scope.currentList.nameBeforeChanges === "") ||
                                        (angular.equals($scope.currentList.name, $scope.currentList.nameBeforeChanges))) {
                                    paramRow += $scope.currentList.name;
                                } else {
                                    paramRow += $scope.currentList.nameBeforeChanges + "&title=" + $scope.currentList.name;
                                    session.renameList($scope.currentList.nameBeforeChanges, $scope.currentList.name);
                                }
                                //console.debug("data: " + JSON.stringify($scope.data));
                                $http.post(server.hostName() + "/DataServlet?changeList=" + paramRow, JSON.stringify($scope.data)).then(function (response) {
                                    var data = JSON.stringify(response.data).replace(/\\/g, "");
                                    console.log("changeList: " + response.status + " " + response.statusText + ", data: " + data);
                                }, function (response) {
                                    console.log("changeList: " + response.status + " " + response.statusText);
                                    $scope.dataError(response.data);
                                });
                            }
                        }
                        // close modal window
                        $rootScope.listEditorWindow.close();
                        $state.go("home");
                    };
                }])
            .controller("RemoveListConfirmationController", ["$rootScope", "$scope", "$http", "server", "session",
                function ($rootScope, $scope, $http, server, session) {
                    $scope.message = "Do you really want to delete list with name \"" + $rootScope.listNameToRemove + "\"";
                    $scope.confirmationYes = function () {
                        // check if the list editor is open and close it if it is
                        if (angular.isDefined($rootScope.listEditorWindow)) {
                            $rootScope.listEditorWindow.close();
                        }
                        //
                        var listName, lists;
                        listName = $rootScope.listNameToRemove;
                        lists = session.getUserLists();
                        $rootScope.confirmationWindow.close();
                        if (!angular.isUndefined(listName) && listName !== "") {
                            // remove a list
                            $http.get(server.hostName() + "/DataServlet?removeList=" + listName).then(function (response) {
                                console.log("removeList: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
                                if (lists.indexOf(listName) !== -1) {
                                    session.removeList(listName);
                                }
                                $rootScope.showPlusButton = (session.getUserLists().length === 0) ? true : false;
                            }, function (response) {
                                $scope.dataError(response.data);
                            });
                        }
                    };
                    $scope.confirmationNo = function () {
                        $rootScope.confirmationWindow.close();
                    };
                }]);
}());