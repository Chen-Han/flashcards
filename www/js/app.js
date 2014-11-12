angular.module('ionic.utils', [])
    .factory('$localstorage', ['$window', function ($window) {
        return {
            set: function (key, value) {
                $window.localStorage[key] = value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key, defaultValue) {
                return JSON.parse($window.localStorage[key] || JSON.stringify(defaultValue));
            }
        }
    }]);
angular.module('starter', ['ionic', 'ionic.contrib.ui.cards', 'ionic.utils',])

    .run(function ($ionicPlatform, $localstorage) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    })

    .directive('noScroll', function ($document) {

        return {
            restrict: 'A',
            link: function ($scope, $element, $attr) {

                $document.on('touchmove', function (e) {
                    e.preventDefault();
                });
            }
        }
    })
    .directive('stopEvent', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                element.bind('click', function (e) {
                    e.stopPropagation();
                });
            }
        };
    })
/*
    .factory('Data',function($localstorage){
        var Data=
        {
            "Math 137": [
                {title:"Limit",text:"a limit is...."},
                {title:"Continuity",text:"continuity means ..."}
            ],
            "Math 135":[
                {title:"GCDOO",text:"Let a= ...."},
                {title:"Fermat's little Theorem",text:"if p is a prime..."}],

            'Demo':[{title: 'Swipe down to clear the card',text:''},
                {title: 'Where is this?',text:''},
                {title: 'What kind of grass is this?',text:''},
                {title: 'What beach is this?',text:''},
                {title: 'What kind of clouds are these?',text:''}]
        };

        var saveData=function(){
            $localstorage.set('data',JSON.stringify(Data));
        };
        return {
            //return Data object
            all:function(){
                return Data;
            },
            //append a category at the end of user's categories
            addCategory:function(categoryTitle){
                Data[categoryTitle]=[];
                saveData();
            },
            //
            removeCategory:function(catTitle){
                delete Data[catTitle];
                saveData();
            },
            addCard:function(card,catTitle){
                Data[catTitle].pushCard();
                saveData();
            },
            removeCard:function(catTitle,cardIndex){
                Data[catTitle].splice(cardIndex,1);
                saveData();
            },
            //
            moveCard:function(oldCatTitle,oldCardIndex,newCatTitle,newCardIndex){
                if(oldCatTitle===newCatTitle || newCatTitle=="undefined"){
                    var temp = Data[oldCatTitle][oldCardIndex];
                    Data[oldCatTitle].splice(oldCardIndex,1);
                    Data[oldCatTitle].insert(newCardIndex,temp);
                }else if(newCardIndex=="undefined"){
                    var temp = Data[oldCatTitle][oldCardIndex];
                    Data[oldCatTitle].splice(oldCardIndex,1);
                    Data[newCatTitle].push(temp);
                }
            }
        };
    })*/
    .controller('CardsCtrl', function ($scope, $ionicSwipeCardDelegate, $ionicModal, $ionicActionSheet, $timeout, $localstorage,$ionicPopup) {
        //=============================Actual Cards Stuff =================================
        $scope.current = $localstorage.getObject ('current', {category: 'Demo', cardindex: 0, random: true});
        $scope.showContent = true;
        $scope.edit = [{}];
        $scope.alert = function (string) {
            alert(string);
        };
        $scope.current.cardFilter={colorTag:null};
        $scope.data = $localstorage.getObject ('data',{
                "Math 137": [
                    {title:"Limit",text:"a limit is....",colorTag:"red"},
                    {title:"Continuity",text:"continuity means ...",colorTag:"yellow"}
                ],
                "Math 135":[
                    {title:"GCDOO",text:"Let a= ....",colorTag:""},
                    {title:"Fermat's little Theorem",text:"if p is a prime...",colorTag:""}
                ],
                'Demo':[
                    {title: 'Swipe down to clear the card',text:'clear this card',colorTag:"red"},
                    {title: 'Where is this?',text:'',colorTag:"yellow"},
                    {title: 'What kind of grass is this?',text:'',colorTag:"green"},
                    {title: 'What beach is this?',text:'',colorTag:"blue"},
                    {title: 'test1',text:'',colorTag:"red"},
                    {title: 'test2',text:'',colorTag:"red"},
                    {title: 'test3',text:'',colorTag:"red"}
                ],
            "filler": [],
            "filler2": [],
            "filler3": [],
            "filler4": [],
            "filler5": [],
            "filler6": []
        });
        $scope.nav = $localstorage.getObject('nav', {
            "Math 137": {cardindex: 0, cardindexprev: 0, random: true},
            "Math 135": {cardindex: 0, cardindexprev: 0, random: true},
            "Demo": {cardindex: 0, cardindexprev: 0, random: false}
        });
        //===============================Switching Category============================
        $scope.swtichCategory = function (category) {
            //put nav variables in current
            $scope.current.category = category;
            $scope.current.cardindex = $scope.nav.category.cardindex;
            $scope.current.cardindexprev = $scope.nav.category.cardindexprev;
            $scope.current.random = $scope.nav.category.random;
            //update view
            $scope.updatecardview($scope.current.category, $scope.current.cardindex);
        };

        //====================================Cardswiper================================
        $scope.cards = Array.prototype.slice.call($scope.data[$scope.current.category], 0, 0);

		$scope.randomCardPool = []; //random card pool to select next card from

		//generates array of elements 0 to n-1
		$scope.resetRandomCardPool = function(n) {
			$scope.randomCardPool = [];
			for (i = 0; i < n; i++) {
				$scope.randomCardPool.push(i);
			}
		};

        $scope.cardSwiped = function (index) {
            $scope.addCard();
        };
        $scope.cardDestroyed = function (index) {
            $scope.cards.splice(index, 1);
        };
        $scope.updatecardview = function (category, index) {
            $scope.cards[0] = $scope.data[category][index];
            $scope.current.category = category;
            $scope.current.cardindex = index;
        };
        $scope.addCard = function () {
            //previous card index (for when items are deleted)
            $scope.current.cardindexprev = $scope.current.cardindex;
            if($scope.current.cardFilter.colorTag!==null){
                var index=($scope.current.cardindex +1)%$scope.data[$scope.current.category].length;
                while(index!=$scope.current.cardindex){
                    if($scope.data[$scope.current.category][index].colorTag==$scope.current.cardFilter.colorTag){
                        break;
                    }
                    index=(index+1)%$scope.data[$scope.current.category].length;
                }
                $scope.current.cardindex=index;
            }else if ($scope.current.random) {

				//if highest card index in random card pool is higher than category length, generate new random card pool
				if ((Math.max.apply(Math, $scope.randomCardPool) > $scope.data[$scope.current.category].length - 1) || ($scope.randomCardPool.length <= 0)) {
					$scope.resetRandomCardPool($scope.data[$scope.current.category].length);
				}

				var randomindex = Math.floor(Math.random() * $scope.randomCardPool.length);

				//sets random index and removes this index from random pool
				$scope.current.cardindex = $scope.randomCardPool[randomindex];
				$scope.randomCardPool.splice(randomindex, 1);

                //pure random algorithm
                //$scope.current.cardindex = Math.floor((Math.random() * $scope.data[$scope.current.category].length));
			}
            else
            {
                $scope.current.cardindex = ($scope.current.cardindex++) % $scope.data[$scope.current.category].length;
            }
            var newCard = $scope.data[$scope.current.category][$scope.current.cardindex];
            newCard.id = Math.random();
            $scope.cards.push(angular.extend({}, newCard));
        };
        //=================================ACTION SHEET=================================
        $scope.show = function () {
            // Show the action sheet
            var hideSheet = $ionicActionSheet.show({
                titleText: 'Edit',
                buttons: [
                    {text: '<b>New</b>'},
                    {text: 'Edit'},
                    {text: 'Move'},
                    {text: $scope.showContent?'Hide All':'Show All'}
                ],
                buttonClicked: function (index) {
                    if (index == 0) {
                        $scope.newstart($scope.current.category, $scope.current.cardindex);
                        $scope.openModal('new');
                    }
                    else if (index == 1) {
                        $scope.editstart($scope.current.category, $scope.current.cardindex);
                        $scope.openModal('edit');
                    }
                    else if (index == 2) {
                        alert("0");
                    }
                    else if (index == 3) {
                        $scope.showContent = !$scope.showContent;
                    }
                    return true;
                },
                cancelText: 'Cancel',
                cancel: function () {
                },
                destructiveText: 'Delete',
                destructiveButtonClicked: function () {
                    //remove card
                    $scope.data[$scope.current.category].splice($scope.current.cardindex, 1);
                    //update view to previous card
                    $scope.updatecardview($scope.current.category, $scope.current.cardindexprev);
                    return true;
                }
            });
            $timeout(function () {
                hideSheet();
            }, 20000);
        };
        //=================================Modals================================
        $ionicModal.fromTemplateUrl('templates/new-card.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modalnew = modal;
        });
        $ionicModal.fromTemplateUrl('templates/edit-card.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modaledit = modal;
        });
        $ionicModal.fromTemplateUrl('templates/menu.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modalmenu = modal;
        });
        $scope.openModal = function (id) {
            if (id == "new"){
                $scope.modalnew.show();
            }
            else if (id == "menu") {
                $scope.modalmenu.show();
            }
            else if (id == "edit") {
                $scope.modaledit.show();
            }
        };
        $scope.closeModal = function (id) {
            if (id == "new") {
                $scope.modalnew.hide();
            }
            else if (id == "menu") {
                $scope.modalmenu.hide();
                $scope.current.subShown='';
            }
            else if (id == "edit") {
                $scope.modaledit.hide();
            }
        };
        //=========================Edit Panel=================================
        $scope.editstart = function (category, index) {
            $scope.edit = $scope.data[category][index];
        };
        $scope.editsave = function () {
            $scope.data[$scope.current.category][$scope.current.cardindex] = $scope.edit;
            $scope.updatecardview($scope.current.category, $scope.current.cardindex);
            $scope.closeModal ('edit');
        };
        //=========================Edit Panel=================================
        $scope.newstart = function (category, index) {
            $scope.edit = {title:"",text:""};
        };
        $scope.newsave = function () {
            $scope.data[$scope.current.category].splice($scope.current.cardindex+1, 0, {title:$scope.edit.title, text:$scope.edit.text});
            $scope.updatecardview($scope.current.category, $scope.current.cardindex + 1);
            $scope.closeModal ('new');
        };
        //=========================Menu functions=====================================
        $scope.current.subShown='';
        $scope.current.subCategories=[];
        $scope.gotoCategory=function(category,subCategory){
            $scope.current.cardFilter.colorTag=subCategory ||null;
            $scope.current.category=category;
            $scope.current.cardindex=0;
            $scope.updatecardview($scope.current.category,$scope.current.cardindex);
            $scope.closeModal('menu');
        };
        $scope.updateSubCategories=function(category){
            var cards =$scope.data[category];
            $scope.current.subCategories=[];
            var addSubCategory=function (color){
                var isColorIn=false;
                for(var i=0;i<$scope.current.subCategories.length;i++){
                    if($scope.current.subCategories[i]==color){
                        isColorIn=true;
                        break;
                    }
                }
                if(!isColorIn){
                    $scope.current.subCategories.push(color);
                }
            };
            for(var i=0;i<cards.length;i++){
                if(cards[i].colorTag!==''){
                    addSubCategory(cards[i].colorTag);
                }
            }
            console.log('updatesub called');
            console.log($scope.current.subCategories);
        };
        $scope.toggleSubCategory=function(category){
            if($scope.current.subShown!==category){
                $scope.current.subShown=category;
            }else{
                $scope.current.subShown='';
            }
        };

        $scope.isSubShown=function(category){
            return $scope.current.subShown==category;
        };

        $scope.showDeleteConfirm = function(categoryName) {
            var confirmPopup = $ionicPopup.confirm({
                title: '<b>Delete Confirm</b>',
                template: 'Are you sure you want to delete this?'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    console.log('You are sure');
                    $scope.deleteCategory(categoryName);
                } else {
                    console.log('delete canceled');
                }
            });
        };
        $scope.showPopup=function(message){
            // An elaborate, custom popup
            var myPopup = $ionicPopup.show({
                template: message,
                title: 'A message...',
                scope: $scope,
                buttons: [
                    { text: 'Cancel',
                    onTap:function(event){event.preventDefault();event.stopPropagation();}},
                    {
                        text: '<b>OK</b>',
                        type: 'button-positive',
                        onTap: function(event) {
                            event.preventDefault();
                            event.stopPropagation();
                            /*some demo code from ionic
                            if (!$scope.data.wifi) {
                                //don't allow the user to close unless he enters wifi password
                                event.preventDefault();
                            } else {
                                return $scope.data.wifi;
                            }*/
                        }
                    },
                ]
            });
            myPopup.then(function(res) {
                console.log('Tapped!', res);
            });
            $timeout(function() {
                myPopup.close(); //close the popup after 3 seconds for some reason
            }, 2500);
        };
        $scope.showEditPrompt=function(categoryName){
            var promptPopup=$ionicPopup.prompt({
                title: '<b>Rename a category</b>',
                template: 'Enter your new category name',
                inputType: 'text',
                inputPlaceholder: 'new name here'
            });
            promptPopup.then(function(res) {
                console.log('you wanna change name from '+ categoryName +" to "+ res);
                promptPopup.close();
                if(!$scope.isCatNameUsed(categoryName)) {
                    $scope.renameCategory(categoryName, res);
                }else{
                    $scope.showPopup("Your new name is used...please try again");
                }
            });
        };
        $scope.isCatNameUsed=function(categoryName){
            return $scope.data.hasOwnProperty(categoryName);
        };

        $scope.renameCategory=function(oldCategoryName,newCategoryName){
            $scope.data[newCategoryName]=$scope.data[oldCategoryName];
            delete $scope.data[oldCategoryName];
        };
        $scope.deleteCategory=function(categoryName){
            delete $scope.data[categoryName];
            //TODO saveData to localStorage
        };
        //==============================Flip Functions=====================================
        $scope.isFlipped=false;
        $scope.toggleFlip=function(){
            $scope.isFlipped=!$scope.isFlipped;
        };

        //===================================Camera & Picture===============================
        $scope.takePicture=function(){
            navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
                destinationType: Camera.DestinationType.DATA_URL
            });

            function onSuccess(imageData) {
                var image = document.getElementById('myImage');
                image.src = "data:image/jpeg;base64," + imageData;
                $scope.myImage= "data:image/jpeg;base64," + imageData;
            }

            function onFail(message) {
                alert('Failed because: ' + message);
            }
        };
    })

    .controller('CardCtrl', function ($scope, $ionicSwipeCardDelegate) {
        $scope.goAway = function () {
            var card = $ionicSwipeCardDelegate.getSwipebleCard($scope);
            card.swipe();
        };
    })


;