"use strict";
/* controllers */
var controllers = angular.module("app.controllers", ["app.services"]);
controllers.controller("RootController", ["$rootScope", "$scope", "$state", "$ionicScrollDelegate", "$ionicActionSheet", "$http", "$uibModal", "server", "session",
    function ($rootScope, $scope, $state, $ionicScrollDelegate, $ionicActionSheet, $http, $uibModal, server, session) {
        console.debug("RootController was loaded");
        $scope.userProfile = {};
        $rootScope.dataError = function (data) {
            var data = JSON.stringify(data);
            data = data.match(/<h1>.+<\/h1>/);
            if (data !== null) {
                data = data[0];
                data = data.split(/[<>]/)[2];
                if (data.split(/[-]/)[1].trim() != "") {
                    data = data.split(/[-]/)[1].trim();
                } else {
                    data = data.split(/[-]/)[0].trim();
                }
            } else {
                data = "null";
            }
            return String(data);
        };
        $rootScope.showAlertMsg = function (message) {
            $rootScope.alertMsg = message;
            $rootScope.alertWindow = $uibModal.open({
                templateUrl: "alertWindow",
                controller: function ($scope) {
                    $scope.alertMsg = $rootScope.alertMsg;
                    delete $rootScope.alertMsg;
                },
                size: "sm",
                windowClass: "center-modal no-border-radius",
                animation: true,
                keyboard: true
            });
        };
        $rootScope.showConfirmationMsg = function (controller) {
            $rootScope.confirmationWindow = $uibModal.open({
                templateUrl: "confirmationWindow",
                controller: "RemoveListConfirmationController",
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
            var hideSheet = $ionicActionSheet.show({
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
            // For example's sake, hide the sheet after two seconds
            /*$timeout(function () { hideSheet(); }, 2000);*/
        };
        // in the root scope because of availability for side menu
        $rootScope.showListButton = false;
        $rootScope.showPlusButton = false;
        $rootScope.addList = function (param, data) {
            //console.log("addList");
            var e = null;
            if (param && typeof (param) === "string")
                $scope.listName = param;
            if (param && param.target)
                e = param;
            if (!e)
                e = {which: 1};
            if (e.which == 1 || angular.isUndefined(e.which)) {
                //
                // if there is a name for created list ($scope.listName) then create a list on the server
                if ($scope.listName !== "" && !angular.isUndefined($scope.listName)) {
                    // create a list
                    $scope.userProfile = session.getUserProfile();
                    // send information to the server
                    //console.log(JSON.stringify($scope.userProfile));
                    if (angular.isUndefined(data))
                        data = "";
                    //console.debug(data);
                    $http.post(server.hostName() + "/DataServlet?addList=" + $scope.listName, JSON.stringify(data)).then(function (response) {
                        console.log("addList: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
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
                }
                // the name of a list ($scope.listName) is not yet determined
                else {
                    // open an empty list editor
                    $rootScope.showPlusButton = false;
                    session.setOpenedListIsNew(true);
                    session.setOpenedListName("");
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
            session.setUserProfile({});
            $http.get(server.hostName() + "/LoginServlet?logout").then(function (response) {
                $scope.userProfile = {};
                console.log("logout: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
                $state.go("index");
            }, function (response) {
                error(response);
            });
        };
    }]);
controllers.controller("HomeController", ["$rootScope", "$scope", "$state", "$timeout", "$http", "$uibModal", "$ionicScrollDelegate", "$ionicSideMenuDelegate", "$ionicActionSheet", "ngDraggableDelegate", "server", "browser", "session",
    function ($rootScope, $scope, $state, $timeout, $http, $uibModal, $ionicScrollDelegate, $ionicSideMenuDelegate, $ionicActionSheet, ngDraggableDelegate, server, browser, session) {
        console.debug("HomeController was loaded");
        $scope.listNameToRemove = null;
        $scope.listButtonDisabled = false;
        $scope.showRemoveListButton = false;
        $scope.listHold = false;
        $scope.checkIfLoggedIn = function () {
            // happens when ng-view loaded
            // we need to check if user already been logged in
            if ($state.current.name == "index") {
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
                            // transform login window title to roulette element
                            var modalHeader = angular.element(document.getElementsByClassName("modal-header"));
                            // TODO: [ISSUE] for some reason Chrome 'slide' animation effect lags. Because of that we are switching Chrome animation to 'fade'
                            var rouletteOptions;
                            if (browser.name() == "chrome") {
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
                        // redirect to 'home'
                        $state.go("home");
                    }
                }, function (response) {
                    if ($rootScope.loginWindow) {
                        $scope.alertMsg = $scope.dataError(response.data);
                    } else {
                        $rootScope.showAlertMsg($scope.dataError(response.data));
                    }
                });
            }
            var sessionTimeout = session.getUserProfile().timeout;
            if (session.isLoggedIn() && sessionTimeout != 0) {
                console.log(sessionTimeout);
                // set up session timeout counter
                //session.watch(sessionTimeout);
                session.watch(3);
            }
        };
        $scope.checkIfLoggedIn();
        $scope.$parent.updateUserProfile(session.getUserProfile());
        //console.log(JSON.stringify($scope.userProfile));
        //
        if ($scope.userProfile.lists) {
            $rootScope.showListButton = ($scope.userProfile.lists.length > 0) ? true : false;
            $rootScope.showPlusButton = ($scope.userProfile.lists.length == 0) ? true : false;
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
            if (e.which == 1 || angular.isUndefined(e.which)) {
                $http.get(server.hostName() + "/DataServlet?getList=" + listName).then(function (response) {
                    console.log("getList: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
                    session.setOpenedListName(listName);
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
            console.log("pullToRefreshDoRefresh");
            $state.go("index");
            $scope.$broadcast("scroll.refreshComplete");
        };
        $scope.thumbnailDragStart = function () {
            //console.log("thumbnailDragStart");
            $scope.dragList = true;
            $scope.oldLists = $scope.userProfile.lists.slice();
            $scope.newListIndexes = [];
            for (var i = 0; i < $scope.userProfile.lists.length; i++)
                $scope.newListIndexes.push(i);
            $ionicScrollDelegate.freezeScroll(true);
            $ionicSideMenuDelegate.canDragContent(false);
        };
        $scope.thumbnailDropEnter = function (newObjIndex, curObjTitle) {
            //console.log("thumbnailDropEnter");
            var curObjIndex = $scope.userProfile.lists.indexOf(curObjTitle);
            if (newObjIndex != curObjIndex) {
                var newObjTitle = $scope.userProfile.lists[newObjIndex];
                // update current object value index from '$scope.newListIndexes'
                var curObjVal = $scope.newListIndexes[curObjIndex];
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
            if (!element)
                return;
            var display = display = window.getComputedStyle(element)["display"]; //element.style.display;
            if (angular.isUndefined(display) || display === "")
                display = "block";
            element.style.display = "none";
            var trick = element.offsetHeight;
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
            //console.log("thumbnailDropSuccess");
            var listsWereReordered = ($scope.userProfile.lists.toString() !== $scope.oldLists.toString());
            if (listsWereReordered) {
                // send list order to the server
                for (var i = 0; i < $scope.oldLists.length; i++)
                    $scope.newListIndexes[i] = $scope.userProfile.lists.indexOf($scope.oldLists[i]);
                var data = $scope.newListIndexes.toString();
                $http.post(server.hostName() + "/DataServlet?reorderLists", data).then(function (response) {
                    console.log("reorderLists: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
                }, function (response) {
                    console.log("ERROR");
                });
            }
        };
        $scope.thumbnailTap = function (listname, e) {
            //console.log("thumbnailTap");
            if (!$scope.listButtonDisabled && !$scope.dragList && !$scope.listHold)
                $scope.getList(listname, e);
        };
        $scope.thumbnailRelease = function (listname, e) {
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
            if ($scope.dragList)
                return;
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
                    destructiveText: "Delete",
                    destructiveButtonClicked: function () {
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
                    cancelText: "Cancel",
                    cancel: function () {
                        $scope.listHold = false;
                        $ionicScrollDelegate.freezeScroll(false);
                        $ionicSideMenuDelegate.canDragContent(true);
                        ngDraggableDelegate.canDragContent(true);
                    },
                });
            }
        };
    }]);
controllers.controller("LoginController", ["$rootScope", "$scope", "$state", "$http", "server", "browser", "session",
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
            if ($scope.alertMsg !== "")
                $scope.alertMsg = "";
            // body of the modal form is 'Sign Up'            
            if (!$scope.loginWindow) {
                $scope.changePassword();
                $scope.userProfile.avatar = "avt" + Math.floor((Math.random() * 24) + 1);
            }
        };
        $scope.avatarPopoverTrigger = function () {
            if (browser.isMobileOrTablet())
                return "touchend";
            else
                // TODO: needed a fix for Safari
                //return "click";    
                return (browser.name() == "safari") ? "click" : "focus";
        };
        $scope.fingerMoved = false;
        $scope.chooseAvatar = function (e) {
            if (!$scope.fingerMoved) {
                var popoverElem = e.toElement;
                if (popoverElem == null)
                    popoverElem = e.target;
                if (popoverElem == null)
                    popoverElem = e.relatedTarget;
                var avt = popoverElem.className;
                avt = avt.substring(avt.indexOf("avt"));
                if (avt.indexOf("avt") != -1) {
                    $scope.userProfile.avatar = avt;
                    // remove itself
                    var btnAvatars = document.getElementById("btn-avatars");
                    var popover = btnAvatars.nextSibling;
                    popover && popover.parentNode && popover.parentNode.removeChild(popover);
                    btnAvatars.focus();
                    btnAvatars.click();
                }
            } else
                $scope.fingerMoved = false;
        };
        $scope.changePassword = function () {
            // hide alert
            if ($scope.alertMsg !== "")
                $scope.alertMsg = "";
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
                var passwordChars = $scope.userProfile.password.split("");
                for (var i = 0; i < passwordChars.length; i++) {
                    var char = passwordChars[i];
                    if (parseInt(char)) {
                        $scope.passwordStrength.number = true;
                    } else if ((/^[! \" # $ % & \' ( ) * + , \- . / : ; < = \> ? @ \[ \\\ \] ^ _ ` { | } ~]*$/).test(char) == true) {
                        $scope.passwordStrength.specialCharacter = true;
                    } else if (char === char.toUpperCase()) {
                        $scope.passwordStrength.upperCaseLetter = true;
                    } else if (char === char.toLowerCase()) {
                        $scope.passwordStrength.lowerCaseLetter = true;
                    }
                }
            }
            $scope.passwordStrength.progress += ($scope.passwordStrength.minimumLength ? 10 : 0)
                    + ($scope.passwordStrength.recommendLength ? 30 : 0)
                    + ($scope.passwordStrength.number ? 10 : 0)
                    + ($scope.passwordStrength.upperCaseLetter ? 10 : 0)
                    + ($scope.passwordStrength.lowerCaseLetter ? 10 : 0)
                    + ($scope.passwordStrength.specialCharacter ? 30 : 0);
        };
        $scope.encryptPassword = function (s) {
            // TODO: $location.host() doesn't work through LAN
            // our salt is domain_name
            var salt = "www.lister.org";
            s = salt + s;
            var hash = CryptoJS.SHA3(s, {outputLength: 512});
            return hash.toString();
        };
        $scope.submit = function () {
            //console.log("$scope.submit");
            // hide alert
            if ($scope.alertMsg !== "")
                $scope.alertMsg = "";
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
    }]);
controllers.controller("OpenListEditorController", ["$rootScope", "$uibModal", function ($rootScope, $uibModal) {
        //console.debug("OpenListEditorController was loaded");
        $rootScope.listEditorWindow = $uibModal.open({
            templateUrl: "listEditorWindow",
            controller: "ListEditorController",
            windowClass: "list-editor-window",
            backdropClass: "list-editor-window-backdrop",
            size: "lg",
            //backdrop: "static",
            animation: true
        });
    }]);
controllers.controller("ListEditorController", ["$rootScope", "$scope", "$state", "$timeout", "$http", "server", "browser", "session",
    function ($rootScope, $scope, $state, $timeout, $http, server, browser, session) {
        console.debug("ListEditorController was loaded");
        $scope.headerFocused = true;
        $scope.checkboxesColumnDisplay = "none";
        $scope.currentList = {
            name: session.getOpenedListName(),
            nameBeforeChanges: session.getOpenedListName(),
            listBody: ""
        };
        $scope.checkboxIcon = "check-circle-o";
        $scope.checkboxIconUnchecked = "circle-thin";
        $scope.columnHeadingTitle = "";
        $scope.data = session.getOpenedListContent();
        if (angular.equals("{}", $scope.data) || angular.equals({}, $scope.data)) {
            $scope.data = {
                type: "",
                headings: [""],
                body: [{text: "", checked: false}]
            };
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
        // updating checkbox column data
        var updateCheckboxColumnData = function () {
            if (!angular.isUndefined($scope.data.body)) {
                var arr = new Array();
                for (var i = 0; i < $scope.data.body.length; i++)
                    arr.push($scope.data.body[i].checked);
                return arr;
            }
            return null;
        };
        // updating additional column data
        var updateAdditionalColumnsData = function () {
            if ($scope.data === "{}" || angular.isUndefined($scope.data)) {
                return [];
            }
            var arr = new Array();
            for (var j = 0; j < $scope.data.headings.length - 1; j++) {
                var innerArr = new Array();
                for (var i = 0; i < $scope.data.body.length; i++)
                    innerArr.push($scope.data.body[i]["ad" + j]);
                arr.push(innerArr);
            }
            return arr;
        };
        $scope.checkboxColumnData = updateCheckboxColumnData();
        $scope.additionalColumnsData = updateAdditionalColumnsData();
        // setting up initial textarea text
        $scope.data.body && $scope.data.body.forEach(function (item, index) {
            if (index == $scope.data.body.length - 1)
                $scope.currentList.listBody = $scope.currentList.listBody + item.text;
            else
                $scope.currentList.listBody = $scope.currentList.listBody + item.text + "\n";
        });
        // check if data is a checklist and make arangements about it        
        if ($scope.data.type === "checklist")
            $scope.checkboxesColumnDisplay = "table-cell";
        //<editor-fold defaultstate="collapsed" desc="var toolboxTextIcons, toolboxElementIcons">
        var toolboxTextIcons = [
            {icon: "check-square-o", title: "Create a checklist", state: ""},
            {icon: "align-left", title: "Left Align"},
            {icon: "align-center", title: "Center Align"},
            {icon: "align-right", title: "Right Align"},
            {icon: "align-justify", title: "Justify Align"},
            {icon: ""},
            {icon: "bold", title: "Bold Text"},
            {icon: "italic", title: "Italic Text"},
            {icon: "underline", title: "Underlined Text"},
            {icon: "strikethrough", title: "Striked Text"}
        ];
        var toolboxElementIcons = [
            {icon: "check-square-o", title: "Create a checklist", content: "<span>checklist</span>", state: ""},
            {icon: "columns", title: "Create a column", content: "<span>column</span>"},
            {icon: "align-left", title: "Left Align"},
            {icon: "align-center", title: "Center Align"},
            {icon: "align-right", title: "Right Align"},
            {icon: "align-justify", title: "Justify Align"}
        ];
        //</editor-fold>
        $rootScope.listEditorWindow.result.then(function () {
        }, function () {
            $state.go("home");
        });
        $scope.timer = null;
        var getSelection = function (elem) {
            // obtain the index of the first and the last selected character
            var start = elem.selectionStart;
            var finish = elem.selectionEnd;
            // return the selected text
            return elem.value.substring(start, finish);
        };
        $scope.keydownShortcut = function (e) {
            // Ctrl + Enter keyboard combination was pressed
            if (e.which == 13 && e.ctrlKey) {
                $scope.submit();
            }
        };
        $scope.textareaMousemove = function ($event) {
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
            var textarea = document.getElementById("list-editor-window-textarea");
            var caretCoordinates = getCaretCoordinates(textarea, textarea.selectionEnd);
            // define a limit in pixels to activate a toolbox
            var toolboxLimitArea = 20;
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
                    if (getSelection(textarea) !== "") {
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
            if (!$scope.toolboxMouseentered)
                $scope.showToolbox = false;
        };
        var getDataBodyText = function () {
            var arr = new Array;
            $scope.data.body.forEach(function (item) {
                arr.push(item.text);
            });
            return arr;
        };
        $scope.pullToClose = function () {
            console.log("pullToClose");
            $rootScope.listEditorWindow.close();
            $state.go("home");
            $scope.$broadcast("scroll.refreshComplete");
        };
        $scope.changeHeading = function (headingTitle, index) {
            $scope.data.headings[index] = headingTitle;
        };
        $scope.changeCheckbox = function (index) {
            console.log("YAY " + index);
            $scope.data.body[index].checked = !$scope.data.body[index].checked;
        };
        $scope.changeTextarea = function () {
            // make changes in $scope.data
            var split = $scope.currentList.listBody.split("\n");
            //console.debug("  split          = [%s]\n  data.body.text = [%s]", JSON.stringify(split), JSON.stringify(getDataBodyText()));
            var sign = "";
            var insertedElem = {text: "", checked: false};
            for (var j = 0; j < $scope.data.headings.length - 1; j++)
                insertedElem["ad" + j] = "";
            if (split.length === $scope.data.body.length) {
                sign = "=";
                for (var i = 0; i < $scope.data.body.length; i++)
                    $scope.data.body[i].text = split[i];
            } else if (split.length > $scope.data.body.length) {
                sign = ">";
                for (var i = 0; i < split.length; i++) {
                    // textarea caret in the END of the text and there was Enter key pressed
                    if (i > $scope.data.body.length - 1) {
                        insertedElem.text = split[i];
                        $scope.data.body.push(insertedElem);
                    }
                    else if (split[i] !== $scope.data.body[i].text) {
                        // textarea caret in MIDDLE of the text but in the END OF the ROW or in the BEGGINNING of the textarea and there was Enter key pressed
                        if (split[i] == "") {
                            // add additional row to $scope.data.body
                            $scope.data.body.splice(i, 0, insertedElem);
                        }
                        // textarea caret in MIDDLE of the text and in the MIDDLE OF the ROW and there was Enter key pressed
                        else {
                            $scope.data.body[i].text = split[i];
                            // add additional row to $scope.data.body
                            insertedElem.text = split[i + 1];
                            $scope.data.body.splice(i + 1, 0, insertedElem);
                        }
                    } else
                        continue;
                    break;
                }
            } else if (split.length < $scope.data.body.length) {
                sign = "<";
                for (var i = 0; i < $scope.data.body.length; i++) {
                    // textarea caret in the END of the text and there was Enter key pressed
                    if (i > split.length - 1) {
                        $scope.data.body.pop();
                    } else if (split[i] !== $scope.data.body[i].text) {
                        // removed row is empty
                        if ($scope.data.body[i].text == "") {
                            // remove row from $scope.data.body
                            $scope.data.body.splice(i, 1);
                        }
                        // removed row is not empty
                        else {
                            // remove row from $scope.data.body
                            $scope.data.body[i].text = split[i];
                            $scope.data.body.splice(i + 1, 1);
                        }
                    } else
                        continue;
                    break;
                }
            }
            $scope.checkboxColumnData = updateCheckboxColumnData();
            $scope.additionalColumnsData = updateAdditionalColumnsData();
            //console.debug("%s split          = [%s]\n  data.body.text = [%s]", sign, JSON.stringify(split), JSON.stringify(getDataBodyText()));
            //console.debug("data.body = [%s]", JSON.stringify($scope.data.body));
        };
        $scope.toolboxMouseleave = function () {
            //console.debug("toolboxMouseleave");
            $scope.showToolbox = false;
            $scope.toolboxMouseentered = false;
        };
        $scope.toolboxClick = function (item) {
            switch (item) {
                case "check-square-o":
                    $scope.createChecklist();
                    break;
                case "columns":
                    $scope.createColumn();
                    break;
                case "align-left":
                    $scope.textAlign = "left";
                    break;
                case "align-center":
                    $scope.textAlign = "center";
                    break;
                case "align-right":
                    $scope.textAlign = "right";
                    break;
                case "align-justify":
                    $scope.textAlign = "justify";
                    break;
                case "strikethrough":
                    $scope.textAlign = "justify";
                    break;
                default :
                    console.log(item);
            }
            $scope.showToolbox = false;
        };
        $scope.createChecklist = function () {
            console.debug("createChecklist");
            if ($scope.data.type !== "checklist") {
                $scope.data.type = "checklist";
                $scope.checkboxesColumnDisplay = "table-cell";
                toolboxElementIcons[0].state = "active";
                toolboxTextIcons[0].state = "active";
            } else {
                $scope.data.type = "";
                $scope.checkboxesColumnDisplay = "none";
                toolboxElementIcons[0].state = "";
                toolboxTextIcons[0].state = "";
            }
            $scope.checkboxColumnData = updateCheckboxColumnData();
        };
        $scope.createColumn = function () {
            console.debug("createColumn");
            $scope.data.headings.push("");
            //$scope.data.body.push({text: "", checked: false});
            for (var i = 0; i < $scope.data.headings.length - 1; i++) {
                $scope.data.body.forEach(function (item, index) {
                    item["ad" + ($scope.data.headings.length - 2)] = "";
                });
            }
            $scope.additionalColumnsData = updateAdditionalColumnsData();
        };
        $scope.changeAdditional = function (data, row, col) {
            col = col.replace(/ad/, "");
            // make changes in $scope.data
            $scope.data.body[row]["ad" + col] = data;
        };
        $scope.submit = function () {
            //console.log("$scope.submit");
            // check if it's a new list
            if (session.getOpenedListIsNew()) {
                // changing list status
                session.setOpenedListIsNew(false);
                // check if the list title is not empty
                if ($scope.currentList.name != "") {
                    // create a list and send information to the server
                    //console.log($scope.currentList.listBody);
                    $rootScope.addList($scope.currentList.name, $scope.data);
                }
            }
            // send changes to the server
            else {
                // check if the list title is not empty
                if ($scope.currentList.name != "") {
                    // send changes to the server
                    var paramRow = "";
                    if (($scope.currentList.nameBeforeChanges === "") ||
                            (angular.equals($scope.currentList.name, $scope.currentList.nameBeforeChanges))) {
                        paramRow += $scope.currentList.name;
                    } else {
                        paramRow += $scope.currentList.nameBeforeChanges + "&title=" + $scope.currentList.name;
                        session.renameList($scope.currentList.nameBeforeChanges, $scope.currentList.name);
                    }
                    $http.post(server.hostName() + "/DataServlet?changeList=" + paramRow, JSON.stringify($scope.data)).then(function (response) {
                        console.log("changeList: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
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
    }]);
controllers.controller("RemoveListConfirmationController", ["$rootScope", "$scope", "$http", "server", "session",
    function ($rootScope, $scope, $http, server, session) {
        $scope.message = "Do you really want to delete list with name \"" + $rootScope.listNameToRemove + "\"";
        $scope.confirmationYes = function () {
            // check if the list editor is open and close it if it is
            if (!angular.isUndefined($rootScope.listEditorWindow)) {
                $rootScope.listEditorWindow.dismiss("cancel");
            }
            //
            var listName = $rootScope.listNameToRemove;
            var lists = session.getUserLists();
            $rootScope.confirmationWindow.close();
            if (!angular.isUndefined(listName) && listName != "") {
                // remove a list
                $http.get(server.hostName() + "/DataServlet?removeList=" + listName).then(function (response) {
                    console.log("removeList: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
                    if (lists.indexOf(listName) != -1)
                        session.removeList(listName);
                    $rootScope.showPlusButton = (session.getUserLists().length == 0) ? true : false;
                }, function (response) {
                    $scope.dataError(response.data);
                });
            }
        }
        $scope.confirmationNo = function () {
            $rootScope.confirmationWindow.dismiss("cancel");
        }
    }]);