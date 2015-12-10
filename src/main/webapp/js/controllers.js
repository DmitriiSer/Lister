"use strict";
/* controllers */
var controllers = angular.module("app.controllers", ["app.services"]);
controllers.controller("RootController", ["$scope", "$state", "$ionicActionSheet", "session",
    function ($scope, $state, $ionicActionSheet, session) {
        console.debug("RootController was loaded");
        $scope.userProfile = {username: ""};
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
        $scope.addList = function (e) {
            if ($scope.listName === undefined)
                $scope.listName = "";
            if (e.which == 1) {
                if ($scope.listName != "") {
                    // create a list
                    console.log("addList: $scope.listName = \"%s\"", $scope.listName);
                    $scope.userProfile = session.getUserProfile();
                    // send information to the server
                    $http.get(server.servletPath() + "/DataServlet?addList=" + $scope.listName).then(function (response) {
                        console.log("addList: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
                        $scope.userProfile.lists.push($scope.listName);
                        session.setOpenedListName($scope.listName);
                        session.setOpenedListContent("{}");
                        $state.go("listEditor");
                    }, function (response) {
                        $scope.dataError(response.data);
                    });
                } else {
                    session.setOpenedListIsNew(true);
                    session.setOpenedListName($scope.listName);
                    session.setOpenedListContent("{}");
                    $state.go("listEditor");
                }
            }
        };
        $scope.isLoggedIn = function () {
            return session.isLoggedIn();
        };
        $scope.logout = function () {
            session.clear(function (response) {
                $scope.userProfile = session.getUserProfile();
                console.log("logout: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
                $state.go("index");
            });
        };
    }]);
controllers.controller("HomeController", ["$rootScope", "$scope", "$state", "$timeout", "$http", "$uibModal", "$ionicScrollDelegate", "$ionicSideMenuDelegate", "server", "browser", "session",
    function ($rootScope, $scope, $state, $timeout, $http, $uibModal, $ionicScrollDelegate, $ionicSideMenuDelegate, server, browser, session) {
        console.debug("HomeController was loaded");
        $scope.listButtonDisabled = false;
        // happens when ng-view loaded
        // we need to check if user already been logged in
        if ($state.current.name == "index") {
            session.checkIfLoggedIn(function (response) {
                //console.log("session.isLoggedIn() = %s", session.isLoggedIn());
                // user needs to log in
                if (!session.isLoggedIn()) {
                    // show a modal window when page is loaded
                    $rootScope.loginWindow = $uibModal.open({
                        templateUrl: "loginWindow",
                        controller: "LoginController",
                        size: "sm",
                        windowClass: "center-modal",
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
            });
        }
        //
        $scope.$parent.updateUserProfile(session.getUserProfile());
        //
        $scope.dataError = function (data) {
            var data = JSON.stringify(data);
            data = data.match(/<h1>.+<\/h1>/);
            if (data !== null) {
                data = data[0];
            }
            data = data.split(/[<>-]/)[3].trim();
            console.error(data);
        };
        $scope.removeListButtonMouseenter = function () {
            $scope.listButtonDisabled = true;
        };
        $scope.removeListButtonMouseleave = function () {
            $scope.listButtonDisabled = false;
        };
        $scope.listNameToRemove;
        $scope.removeList = function (listName) {
            $rootScope.listNameToRemove = listName;
            // ask if user really wants to delete list
            $rootScope.confirmationWindow = $uibModal.open({
                templateUrl: "confirmationWindow",
                controller: "HomeController",
                windowClass: "center-modal no-border-radius",
                size: "md",
                animation: true
            });
        };
        $scope.confirmationYes = function () {
            var listName = $rootScope.listNameToRemove;
            $rootScope.confirmationWindow.close();
            if (listName !== undefined && listName != "") {
                // remove a list
                $http.get(server.servletPath() + "/DataServlet?removeList=" + listName).then(function (response) {
                    console.log("removeList: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
                    if ($scope.userProfile.lists.indexOf(listName) != -1)
                        $scope.userProfile.lists.splice($scope.userProfile.lists.indexOf(listName), 1);
                }, function (response) {
                    $scope.dataError(response.data);
                });
            }
        };
        $scope.confirmationNo = function () {
            $rootScope.confirmationWindow.dismiss("cancel");
        };
        $scope.getList = function (listName, e) {
            //console.log("$scope.listButtonDisabled = %s", $scope.listButtonDisabled);
            console.log(e.which);
            //alert(e.which);
            if (e.which == 1 || e.which == undefined) {
                $http.get(server.servletPath() + "/DataServlet?getList=" + listName).then(function (response) {
                    console.log("getList: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
                    session.setOpenedListName(listName);
                    session.setOpenedListContent(response.data.content);
                    $state.go("listEditor");
                }, function (response) {
                    $scope.dataError(response.data);
                });
            }
        };
        //
        $scope.pullToRefreshDoRefresh = function () {
            $state.go("index");
            $scope.$broadcast("scroll.refreshComplete");
        };
        $scope.thumbnailDragStart = function () {
            //console.log("thumbnailDragStart");
            $scope.dragList = true;
            $ionicScrollDelegate.freezeScroll(true);
            $ionicSideMenuDelegate.canDragContent(false);
        };
        $scope.thumbnailDragStop = function () {
            //console.log("thumbnailDragStop");
            $ionicScrollDelegate.freezeScroll(false);
            if ($scope.windowWidth < 768)
                $ionicSideMenuDelegate.canDragContent(true);
        };
        $scope.thumbnailDropSuccess = function (index, data) {
            //console.log("thumbnailDropSuccess");
            //alert("thumbnailDropSuccess");
            if ($scope.dragList) {
                $scope.dragList = false;
                //alert("index = " + index + ", data = " + data);
                //console.log("index = " + index + ", data = " + data);
                console.log("thumbnailDropSuccess: currentObj != newObj");
                //alert($scope.userProfile.lists);
                //console.log($scope.userProfile.lists);
                var currentObjIndex = $scope.userProfile.lists.indexOf(data);
                var newObj = $scope.userProfile.lists[index];
                $scope.userProfile.lists[index] = data;
                $scope.userProfile.lists[currentObjIndex] = newObj;
                //console.log($scope.userProfile.lists);
                if(browser.isMobileOrTablet())
                    $state.reload();
            }
        };
    }]);
controllers.controller("LoginController", ["$rootScope", "$scope", "$state", "$http", "server", "browser", "session",
    function ($rootScope, $scope, $state, $http, server, browser, session) {
        console.debug("LoginController was loaded");
        // default variables
        $scope.loginWindow = true;
        //TODO: remove $scope.userProfile
        $scope.userProfile = {username: "Ed", password: "Ed!23", avatar: ""};
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
            $scope.userProfile.username = data.username;
            $rootScope.loginWindow.close();
            $state.go("home");
        };
        $scope.authentificationError = function (data) {
            var data = JSON.stringify(data);
            data = data.match(/<h1>.+<\/h1>/);
            if (data !== null) {
                data = data[0];
            }
            data = data.split(/[<>-]/)[3].trim();
            $scope.alertMsg = String(data);
            console.error(data);
        };
        $scope.login = function () {
            $http.post(server.servletPath() + "/LoginServlet", {
                username: $scope.userProfile.username,
                password: $scope.encryptPassword($scope.userProfile.password)
            }).then(function (response) {
                console.log("login: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
                if (JSON.parse(response.data.loggedIn) === true) {
                    $scope.grantAccess(response.data);
                }
            }, function (response) {
                $scope.authentificationError(response.data);
            });
        };
        $scope.signUp = function () {
            // check if password meets all the requirements
            if ($scope.passwordStrength.progress >= 70) {
                $http.post(server.servletPath() + "/SignUpServlet",
                        {
                            username: $scope.userProfile.username,
                            password: $scope.encryptPassword($scope.userProfile.password),
                            avatar: $scope.userProfile.avatar
                        })
                        .then(function (response) {
                            console.log("sign up: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
                            $scope.grantAccess(response.data);
                        }, function (response) {
                            $scope.authentificationError(response.data);
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
        console.debug("OpenListEditorController was loaded");
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
        $scope.listName = session.getOpenedListName();
        $scope.checkboxIcon = "check-circle-o";
        $scope.checkboxIconUnchecked = "circle-thin";
        $scope.columnHeadingTitle = "";
        $scope.data = session.getOpenedListContent();
        if (angular.equals({}, $scope.data))
            $scope.data = {
                type: "",
                headings: [""],
                body: [{text: "", checked: false}]
            };
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
            var arr = new Array();
            for (var i = 0; i < $scope.data.body.length; i++)
                arr.push($scope.data.body[i].checked);
            return arr;
        };
        // updating additional column data
        var updateAdditionalColumnsData = function () {
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
        $scope.listBody = "";
        $scope.data.body.forEach(function (item, index) {
            if (index == $scope.data.body.length - 1)
                $scope.listBody = $scope.listBody + item.text;
            else
                $scope.listBody = $scope.listBody + item.text + "\n";
        });
        // check if data is a checklist and make arangements about it        
        if ($scope.data.type === "checklist")
            $scope.checkboxesColumnDisplay = "table-cell";
        //
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
        $scope.headingChange = function (headingTitle, index) {
            $scope.data.headings[index] = headingTitle;
        };
        $scope.checkboxChange = function (index) {
            console.log("YAY " + index);
            $scope.data.body[index].checked = !$scope.data.body[index].checked;
        };
        $scope.textareaChange = function () {
            // make changes in $scope.data
            var split = $scope.listBody.split("\n");
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
            }
            else {
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
        $scope.additionalChange = function (data, row, col) {
            col = col.replace(/ad/, "");
            // make changes in $scope.data
            $scope.data.body[row]["ad" + col] = data;
        };
        $scope.dataError = function (data) {
            var data = JSON.stringify(data);
            data = data.match(/<h1>.+<\/h1>/);
            if (data !== null) {
                data = data[0];
            }
            data = data.split(/[<>-]/)[3].trim();
            console.error(data);
        };
        $scope.submit = function () {
            // chack if there is correct list title
            if ($scope.listName != "") {
                // check if it's a new list
                if (session.getOpenedListIsNew()) {
                    // changing list status
                    session.setOpenedListIsNew(false);
                    // create a list
                    $scope.userProfile = session.getUserProfile();
                    // send information to the server
                    $http.get(server.servletPath() + "/DataServlet?addList=" + $scope.listName).then(function (response) {
                        console.log("addList: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
                        $scope.userProfile.lists.push($scope.listName);
                        //session.setOpenedListName($scope.listName);
                        //session.setOpenedListContent("{}");
                        //$state.go("listEditor");
                    }, function (response) {
                        $scope.dataError(response.data);
                    });
                } // otherwise we send changes
                else {
                    // transform list data to JSON
                    //console.log("JSON.stringify($scope.data) = %s", JSON.stringify($scope.data));
                    $http.post(server.servletPath() + "/DataServlet?changeList=" + $scope.listName, JSON.stringify($scope.data)).then(function (response) {
                        console.log("changeList: " + response.status + " " + response.statusText + ", data: " + JSON.stringify(response.data));
                        //$scope.userProfile.lists.push($scope.listName);
                        //$state.go("listEditor");
                    }, function (response) {
                        $scope.dataError(response.data);
                    });
                }
            }
            // close modal window
            $rootScope.listEditorWindow.close();
            $state.go("home");
        };
    }]);