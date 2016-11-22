/*
 .controller('registerCtrl', function($scope, $ionicPopup, $cordovaClipboard, $cordovaInAppBrowser, $state) {
 $scope.slide2 = false;

 $scope.register = function() {
 $scope.slide2 = true;
 $scope.generateActivationCode();
 };

 $scope.generateActivationCode = function(){
 if (window.localStorage['activationCode'] === '') {
 $scope.activationCode = '';
 var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
 for (var j=1; j<41; j++) {
 $scope.activationCode += possible.charAt(Math.floor(Math.random()* possible.length));
 }
 window.localStorage['activationCode'] = $scope.activationCode;
 console.log('Localstorage activation code = '+window.localStorage['activationCode']);
 }
 else {
 $scope.activationCode = window.localStorage['activationCode'];
 }
 };

 $scope.buyPopup = function() {
 $cordovaClipboard.copy($scope.activationCode);
 $ionicPopup.alert({
 title: 'Activation code copied to clipboard',
 template: 'Go to the website to order your license',
 buttons: [
 {
 text: 'Cancel'
 },
 {
 text: 'Buy<br>Toothmaster',
 type: 'button-balanced',
 onTap: function () {
 $cordovaInAppBrowser.open('http://goodlife.nu', '_self');
 }
 }]
 })
 };



 $scope.checkLicense = function () {
 if ($scope.codeInput === null) {
 $ionicPopup.alert({
 title: 'Please enter your license code',
 template: 'Go to the website to order your license',
 buttons: [
 {
 text: 'Cancel'
 },
 {
 text: 'Buy<br>Toothmaster',
 type: 'button-balanced',
 onTap: function () {
 $cordovaInAppBrowser.open('http://goodlife.nu', '_self');
 }
 }]
 })
 }
 else {
 window.localStorage['registered'] = 'true';
 $ionicPopup.alert({
 title: 'Toothmaster succesfully registered',
 template: 'Number of cuts is no longer restricted',
 onTap: $state.go('app.program')
 })

 }
 }

 })*/
