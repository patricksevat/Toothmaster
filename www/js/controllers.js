angular.module('starter.controllers', [])

//controller used for debug buttons, not used anymore
.controller('AppCtrl', function($scope) {
  /*
  $scope.ClearLocalStor = function() {
    localStorage.clear();
    bugout.log('local storage cleared');
  };

  $scope.removeLocalSafety = function() {
    window.localStorage['Safety'] = '';
    bugout.log('Safety reset to ""');
  };

  $scope.setLocalSafety = function () {
    window.localStorage['Safety'] = 'Completed';
    bugout.log('Safety completed');
  };

  $scope.setRegister = function (){
    window.localStorage['registered'] = 'true';
    bugout.log('registered = true');
  };

  $scope.setDeregister = function (){
    window.localStorage['registered'] = 'false';
    bugout.log('registered = false');
  };

  $scope.setSettings = function () {
    window.localStorage['settings'] = '{"minFreq":50,"maxFreq":1600,"dipswitch":6400,"spindleAdvancement":5,"time":2,"encoder":{"enable": false, "stepsPerRPM": 0, "stepsToMiss": 0, "direction": false}}';
  };
 */
  $scope.setProgram= function () {
    var testProg = {title: 'testprog', sawWidth: 5, cutWidth: 5, pinWidth: 5, numberOfCuts: 2, startPosition: 5  };
    window.localStorage['testProg'] = JSON.stringify(testProg);
  }
})

.controller('SafetySlides', function($scope, $ionicModal) {
  $scope.i = 0;
  $scope.hidePrev = false;

  $scope.slides = [
    'Start safety instructions','Usage','Caution!', 'Causes of unexpected movements: ', 'Keep in mind!', 'Mitigations against these failure modes:', 'Minimum requirements','Norms and regulations'
  ];

  $scope.slide3 = [
    'Android/iOS is no Operating System for safety applications','Toothmaster software is not developed to aim for a certain so-called SIL(Safety Integrity Level).','You might drop something on your phone and then Toothmaster will order the stepmotor to move.','You or somebody else might by coincidence click on the continue button while making a precision cut.','There might be interference from other applications with Toothmaster.','Your phone memory might be bad. Leading to bit rot, causing inadvertant movement.','There might be Electro Magnetic Interference in your workplace (for instance if you start a heavy motor), leading to bit rot, causing inadvertant movement.','Step motor driver (step motor driver is explained here (TBD)) generates inadvertent movement etc.'
  ];

  $scope.slide4 = [
    'Toothmaster/ OS/ smartphone generates movement when not expected.','Toothmaster/ OS/ driver keeps moving or moves too far. (could also be cause by wrong user input/ installation errors)'
  ];

  $scope.slide5 = [
    {main: 'A) Clamping your workpiece before making a cut.', sub: 'Clamping is very simple and very safe. Of course safety has a negative effect on availability. The time to make the wood joint will be longer because the milling machine might have to be stopped, clamp has to be removed and installed for every cut.'},
    {main: 'B) Safety Switch', sub: 'Operator operates the safety switch. Not recommended because operator could make mistakes/ shorts the safety switch on purpose.', sub2: 'Safety switch is operated by the shifting part of your machinery when the workpiece is in a safe position to move.'},
    {main: 'C) Combination A&B', sub: 'Especially when working on expensive and big workpieces, you might consider A + B2 and even stop your machine before shifting the workpiece.'}
  ];

  $scope.swipeRightToLeft = function() {
    if ($scope.i <7) {
    bugout.log('swiping right');
    $scope.i ++;
    }
  };

  $scope.next = function() {
    if ($scope.i < 7) {
      bugout.log("next");
      $scope.i ++;
    }
  };

  $scope.prev = function() {
    if ($scope.i >= 0) {
      bugout.log("prev");
      $scope.i --;
    }
  };

  $scope.prevHide = function() {
    return $scope.i === 0;
  };

  $scope.nextHide = function() {
    return $scope.i === 7;
  };

  $scope.safetyReadHide = function() {
    return $scope.i !== 7;
  };

  $scope.showScheme = function() {
    if ($scope.i === 6) {
      return true;
    }
  };

  $ionicModal.fromTemplateUrl('scheme-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
    window.screen.lockOrientation('landscape');
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
    window.screen.unlockOrientation();
  };
  /*
  //Cleanup the modal when we're done with it!
  $scope.$on('$ionicView.leave', function() {
    $scope.modal.remove();
    bugout.log('cleaning up modal');
  });*/

  //on slide.id = 7, add read-safety-instruction button
  $scope.setLocalStorageSafety = function() {
    window.localStorage.setItem("Safety", "Completed");
  }
})

.controller('ProgramController', function($scope, $ionicModal, $ionicPopup, shareSettings, shareProgram, $state) {
  $scope.presets = [
    { titlePreset: '5mm everything', sawWidth: 5, cutWidth: 5, pinWidth: 5, numberOfCuts: 5, startPosition: 5  },
    { titlePreset: '15mm everything', sawWidth: 15, cutWidth: 15, pinWidth: 15, numberOfCuts: 15, startPosition: 15  }
  ];

  $scope.userPrograms = [];

  $scope.currentProgram = {

  };

  (function loadLastUsedProgram() {
    if (window.localStorage['lastUsedProgram'] !== '') {
      $scope.currentProgram = JSON.parse(window.localStorage['lastUsedProgram']);
      shareProgram.setObj($scope.currentProgram);
    }
  })();

  $scope.loadUserPrograms = function() {
    $scope.userPrograms = [];
    if (window.localStorage.length === 4) {
      bugout.log('only safety, settings, lastConnectedDevice and lastUsedProgram found in localstorage');
    }
    //load the userPrograms stored in localStorage. objects are named 1 - n.
    //parse the userPrograms in localStorage so that they are converted to objects
    //push the parsed userPrograms to $scope.userPrograms array
    else {
      bugout.log(window.localStorage);
      for (var a=0; a<window.localStorage.length; a++) {
        if (window.localStorage.key(a) == 'Safety' || window.localStorage.key(a) == 'settings' || window.localStorage.key(a) == 'lastUsedProgram' || window.localStorage.key(a) == 'lastConnectedDevice') {

        }
        else{
          var tempName = window.localStorage.key(a);
          var temp = window.localStorage[tempName];
          temp = JSON.parse(temp);
          $scope.userPrograms.push(temp);
          bugout.log(tempName+' pushed to userPrograms');
        }

      }
    }
  };

  $scope.loadUserPrograms();

  $scope.loadUserProgram = function($index) {
    //load userProgram & close load modal
    bugout.log('userProgram clicked');
    $scope.currentProgram = $scope.userPrograms[$index];
    shareProgram.setObj($scope.currentProgram);
    $scope.closeModal(1);
  };

  $scope.loadPreset = function($index) {
    //load preset & close load modal
    bugout.log('loadPreset clicked');
    $scope.currentProgram = $scope.presets[$index];
    $scope.currentProgram.title = $scope.presets[$index].titlePreset;
    shareProgram.setObj($scope.currentProgram);
    $scope.closeModal(1);
  };

  $scope.checkCurrentProgram = function(){
    /*bugout.log('registered = '+ window.localStorage['registered']);
    bugout.log('condition ='+ (window.localStorage['registered'] = 'false'));*/
    if ($scope.currentProgram.title == null ) {
      $scope.showAlertTitle();
      return false;
    }
    /*else if ($scope.currentProgram.numberOfCuts > 2 && window.localStorage['registered'] == 'false') {
      bugout.log('cannot save, number of cuts too high for restriction');
      $scope.showAlertNumberOfCuts();
      return false;
    }*/

    //show alert if not all program fields are filled in
    else if ($scope.currentProgram.sawWidth == null || $scope.currentProgram.cutWidth == null
      || $scope.currentProgram.pinWidth == null    || $scope.currentProgram.numberOfCuts == null
      || $scope.currentProgram.startPosition == null) {
      $scope.showAlertVars();
      return false;
    }
    else {
      return true;
    }
  };
  /*
  $scope.showAlertNumberOfCuts= function(){
    $ionicPopup.alert(
      {
        title: 'Number of cuts restricted',
        template: 'You have not registered your Toothmaster yet, please register to remove number of cuts restriction',
        buttons: [{
          text: 'Continue unregistered',
          type: 'button-calm',
          onTap: function () {
            $scope.currentProgram.numberOfCuts = 2;
          }
        },{
          text: 'Register',
          type: 'button-balanced',
          onTap: function () {
            $state.go('app.register');
          }
        }]
      }
    )
  };
*/
  $scope.saveProgram = function() {
    //show alert if title is not filled in
    if ($scope.checkCurrentProgram() === true) {
      if ($scope.currentProgram.titlePreset) {
        delete $scope.currentProgram.titlePreset
      }
      window.localStorage[$scope.currentProgram.title] = JSON.stringify($scope.currentProgram);
      $scope.userPrograms.push($scope.currentProgram);
      bugout.log('userProgram pushed to userPrograms & localStorage');
      bugout.log('\nuserPrgrams after pushed saved program:');
      bugout.log($scope.userPrograms);
      bugout.log('\ncurrentProgram:');
      bugout.log($scope.currentProgram);
      //call the successful save popup
      $scope.showAlertSaveSucces();
      //update the list of userPrograms
      $scope.loadUserPrograms();
      shareProgram.setObj($scope.currentProgram);
    }
    else {
      //$scope.checkCurrentProgram();
    }
  };

    $scope.showAlertSaveSucces = function() {
      $ionicPopup.show(
        {
        title: 'Program saved!',
        scope: $scope,
        buttons: [
          {
            //button holds current program & closes modal
            text: 'Use current program',
            type: 'button-balanced',
            onTap: function() {
              $scope.closeModal(2);
            }
          },
          {
            //button clears program fields and title
            text: 'Create new program',
            type: 'button-calm',
            onTap: function () {
              $scope.currentProgram.title = undefined;
                $scope.currentProgram.sawWidth = undefined;
                $scope.currentProgram.cutWidth = undefined;
                $scope.currentProgram.pinWidth = undefined;
                $scope.currentProgram.numberOfCuts = undefined;
                $scope.currentProgram.startPosition = undefined;
              $scope.closeModal(2);
            }
          }
        ]
        }
      )
    };

    $scope.showAlertVars = function(){
      $ionicPopup.alert(
        {
          title: 'Not all fields are filled in',
          template: 'Please fill in all Program fields before saving the program'
        }
      )
    };

  $scope.showAlertTitle = function(){
    $ionicPopup.alert(
      {
        title: 'Not all fields are filled in',
        template: 'Title is not filled in'
      }
    )
  };

    $ionicModal.fromTemplateUrl('load-modal.html', {
      id: 1,
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal1 = modal;
    });

    $ionicModal.fromTemplateUrl('save-modal.html', {
      id: 2,
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal2 = modal;
    });

  $scope.openModal = function(index) {
    if (index === 1) {
      $scope.modal1.show();
    }
    else {
      $scope.modal2.show();
    }
    };

    $scope.closeModal = function(index) {
      if (index === 1) {
        $scope.modal1.hide();
      }
      else {
        $scope.modal2.hide();
      }

    };

  /*
    $scope.$on('$ionicView.leave', function() {
      $scope.modal1.remove();
      $scope.modal2.remove();
      bugout.log('modals removed')
    });*/

  $scope.deleteUserProgram = function($index) {
    bugout.log('delete userProgram clicked at index: '+$index);
    bugout.log($scope.userPrograms);
    $scope.showDeleteAlert($index);
  };

    $scope.showDeleteAlert = function($index) {
      var index = $index;
      $ionicPopup.show(
        {
          title: 'Are you sure you want to delete this program?',
          scope: $scope,

          buttons: [
            {
              //button clears program fields and title
              text: 'Yes',
              type: 'button-assertive',
              onTap: function sureDelete() {
                bugout.log(window.localStorage);
                bugout.log('index ='+index);
                // remove the userProgram from localstorage. Step 1: get the key under which the userProgram is saved
                var userProg = $scope.userPrograms[index];
                bugout.log(userProg);
                var userProgName = userProg.title;
                bugout.log(userProgName);
                window.localStorage.removeItem(userProgName);
                //remove the userProgram visually
                $scope.userPrograms.splice(index, 1);
              }
            },
            {
              text: 'No',
              type: 'button-balanced'
            }
          ]
        }
      );

    };

  //On run program button, make sure that program and settings are filled in correctly
    $scope.runProgram = function() {

      /*
      if ($scope.currentProgram.numberOfCuts > 2 && window.localStorage['registered'] === 'false') {
        bugout.log('cannot save, number of cuts too high for restriction');
        $scope.showAlertNumberOfCuts();
      }
      else */
      if ($scope.currentProgram.sawWidth > $scope.currentProgram.cutWidth){
        $ionicPopup.alert(
          {
            title: 'Saw width cannot be wider than cut width',
            template: 'Please make sure that your saw width and cut width are entered correctly'
          }
        )
      }
      else if ($scope.currentProgram.numberOfCuts % 1 !== 0) {
        $ionicPopup.alert(
          {
            title: 'Number of cuts cannot be a floating point',
            template: 'Please make sure that the number of cuts is a whole number. "2" is correct, "2.2" is incorrect.'
          }
        )
      }
      else if ($scope.currentProgram.sawWidth > 0 && $scope.currentProgram.cutWidth > 0
        && $scope.currentProgram.pinWidth > 0 && $scope.currentProgram.numberOfCuts > 0
        && $scope.currentProgram.startPosition >= 0 && $scope.checkSettings()) {
        bugout.log('all fields filled in');
        shareProgram.setObj($scope.currentProgram);
        window.localStorage['lastUsedProgram'] = JSON.stringify($scope.currentProgram);
        $scope.confirmProgram();
      }
      else {
        $ionicPopup.alert(
          {
            title: 'Not all fields are filled in',
            template: 'Please fill in all Program fields before running the program'
          }
        )
      }
    };

    $scope.confirmProgram = function(){
      $ionicPopup.alert(
        {
          title: 'Please confirm your program',
          template: '<p>Saw width: '+$scope.currentProgram.sawWidth+'</p>'+'<p>Cut width: '+$scope.currentProgram.cutWidth+'</p>'+
          '<p>Pin width: '+$scope.currentProgram.pinWidth+'</p>'+'<p>Number of cuts: '+$scope.currentProgram.numberOfCuts+'</p>'+
          '<p>Start position: '+$scope.currentProgram.startPosition+'</p>',
          buttons: [{
           text: 'Edit program',
           type: 'button-calm'
          },{
            text: 'Confirm program',
            type: 'button-balanced',
            onTap: function () {
              //$scope.confirmSettings();
              $state.go('app.runBluetooth');
            }
          }]
        }
      )
    };
/*
  $scope.confirmSettings = function() {
    var templateText = '<p>Minimum frequency: '+$scope.settings.minFreq+'</p>'+'<p>Maximum frequency: '+$scope.settings.maxFreq+'</p>'+
      '<p>Step motor dipswitch: '+$scope.settings.dipswitch+'</p>'+'<p>Spindle advancement: '+$scope.settings.spindleAdvancement+'</p>'+
      '<p>Time to maximum frequency: '+$scope.settings.time+'</p>'+'<p>Encoder enabled: '+$scope.settings.encoder.enable+'</p>';
    if ($scope.settings.encoder.enable) {
      templateText += '<p>Encoder steps per RPM: '+$scope.settings.encoder.stepsPerRPM+'</p>'+
        '<p>Max allowable missed steps: '+$scope.settings.encoder.stepsToMiss+'</p>'+
        '<p>Reverse encoder direction: '+$scope.settings.encoder.direction+'</p>';
    }
    $ionicPopup.alert(
      {
        title: 'Please confirm your settings',
        template: templateText,
        buttons: [{
          text: 'Edit settings',
          type: 'button-calm',
          onTap: function() {
            $state.go('app.settings');
          }
        },
          {
          text: 'Confirm settings',
          type: 'button-balanced',
          onTap: function () {
            $state.go('app.runBluetooth');
          }

        }]
      }
    )
  };
*/
  $scope.settings = shareSettings.getObj();

  $scope.checkSettings = function() {
    $scope.settings = shareSettings.getObj();
    bugout.log($scope.settings);
    if ($scope.settings === undefined){
      bugout.log('settings are not filled in correctly');
      $ionicPopup.alert(
        {
          title: 'Please make sure your settings are filled in correctly',
          template: 'Use the buttons to go to settings',
          buttons: [{
            text: 'Edit settings',
            type: 'button-calm',
            onTap: function() {
              $state.go('app.settings');
            }
          }]
        });
      return false;
    }

    else if ($scope.settings.maxFreq !== null && $scope.settings.dipswitch !== null &&
      $scope.settings.spindleAdvancement !== null && $scope.settings.time !== null && $scope.settings.homingStopswitch !== null && $scope.settings.encoder.enable === false) {
      bugout.log('checkSettings passed');
      return true;
    }
    else if ($scope.settings.maxFreq !== null  && $scope.settings.dipswitch !== null &&
      $scope.settings.spindleAdvancement !== null && $scope.settings.time !== null && $scope.settings.homingStopswitch !== null && $scope.settings.encoder.enable === true &&
      $scope.settings.encoder.stepsPerRPM !== 0 && $scope.settings.encoder.stepsToMiss > 0) {
      bugout.log('checkSettings passed');
      return true;
    }
    else {
        bugout.log('settings are not filled in correctly');
      var templateText = '<p>Maximum frequency: '+$scope.settings.maxFreq+'</p>'+
        '<p>Step motor dipswitch: '+$scope.settings.dipswitch+'</p>'+'<p>Spindle advancement: '+$scope.settings.spindleAdvancement+'</p>'+
        '<p>Time to maximum frequency: '+$scope.settings.time+'</p>'+'<p>Encoder enabled: '+$scope.settings.encoder.enable+'</p>';
      if ($scope.settings.encoder.enable) {
        templateText += '<p>Encoder steps per RPM: '+$scope.settings.encoder.stepsPerRPM+'</p>'+'<p>Max allowable missed steps: '+$scope.settings.encoder.stepsToMiss+'</p>'+'<p>Encoder directtion: '+$scope.settings.encoder.stepsToMiss+'</p>';
      }
        $ionicPopup.alert(
          {
            title: 'Please make sure your settings are filled in correctly',
            template: templateText,
            buttons: [{
              text: 'Edit settings',
              type: 'button-calm',
              onTap: function() {
                $state.go('app.settings');
              }
            }]
          });
        return false;
      }
    };
  /*
  $scope.redText = function () {
    if ($scope.currentProgram.numberOfCuts > 2 && window.localStorage['registered'] === 'false') {
      return true;
    }
  }*/
})

.controller('SettingsCtrl', function($scope, $ionicPopup, shareSettings){

  $scope.settings = {
    encoder: {
      enable: false,
      stepsPerRPM: undefined,
      stepsToMiss: undefined
    },
    homingStopswitch: false
  };

  $scope.saveSettings = function() {
    if ($scope.settings.maxFreq > 80000) {
      $scope.showAlertMaxFreq();
    }

    else if ($scope.settings.maxFreq == null || $scope.settings.dipswitch == null ||
      $scope.settings.spindleAdvancement == null || $scope.settings.time == null) {
      $scope.showAlertSettings();
    }
    else if ($scope.settings.encoder.enable && ($scope.settings.encoder.stepsPerRPM ==undefined || $scope.settings.encoder.stepsToMiss== undefined || $scope.settings.encoder.direction == undefined)){
      $scope.showAlertSettings();
    }
    else {
      var settingsJSON = JSON.stringify($scope.settings);
      bugout.log(settingsJSON);
      window.localStorage['settings'] = settingsJSON;
      //call shareSettings service so that settings can be used in programCtrl & runBluetoothCtrl
      shareSettings.setObj($scope.settings);
      $scope.showAlertSaved();
    }

  };

  $scope.loadSettings = function() {
    bugout.log('settings: '+window.localStorage['settings']);
    if (window.localStorage['settings'] === '') {

    }
    else {
      $scope.settings = JSON.parse(window.localStorage['settings']);
    }
  };

  $scope.loadSettings();

  $scope.showAlertMaxFreq = function(){
    $ionicPopup.alert(
      {
        title: 'Maximum frequency invalid',
        template: 'Please make sure that maximum frequency is set to 1000 or lower'
      }
    )
  };

  $scope.showAlertSettings = function(){
    $ionicPopup.alert(
      {
        title: 'Not all fields are filled in',
        template: 'Please make sure that all fields are filled in correctly'
      }
    )
  };

  $scope.showAlertSaved = function(){
    $ionicPopup.alert(
      {
        title: 'Settings saved'
      }
    )
  }
})
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
      bugout.log('Localstorage activation code = '+window.localStorage['activationCode']);
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

  .controller('browserCtrl', function($scope, $cordovaInAppBrowser) {
  $scope.openBrowser = function() {
    $cordovaInAppBrowser.open('http://goodlife.nu', '_self');
  }

})


  .controller('runBluetoothCtrl', function($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal,
                                           $state, $ionicPlatform, $window, $interval, $timeout, shareSettings, shareProgram, skipService){
    $scope.availableDevices = [];
    $scope.pairedDevices = [];
    $scope.bluetoothLog = [];
    $scope.bluetoothEnabled =false;
    $scope.isConnected = false;
    $scope.platform = ionic.Platform.platform();
    var sending = false;
    var program = shareProgram.getObj();
    bugout.log('program:');
    bugout.log(JSON.stringify(program));
    $scope.settings = shareSettings.getObj();
    bugout.log('settings:');
    bugout.log(JSON.stringify($scope.settings));
    $scope.showSpinner = false;

    //TODO seperate OS instructions

    //
    //SECTION: pause & resume app
    //

    $ionicPlatform.on('pause', function () {
      //check for connection and if commands are being sent
      if ($scope.isConnected === true && !sending) {
        $window.bluetoothSerial.disconnect(function () {
          bugout.log('disconnected on pause from bluetooth controller');
          addToLog('Disconnected after pausing application');
        }, function () {
          bugout.log('could not disconnect on pause from bluetooth controller')
        });
        $scope.availableDevices = [];
        $scope.pairedDevices = [];
        $scope.showCalcButton = false;
        $scope.readyForData = false;
      }
      else if ($scope.isConnected && sending) {
        addToLog('User has paused application, continuing task in background');
      }
    });

    $ionicPlatform.on('resume', function () {
      bugout.log('resume called from bluetooth controller');
      if (window.localStorage['lastConnectedDevice'] !== '' && !sending) {
            connectToLastConnectedDevice();
          }
      else if (sending){
        bugout.log('Not reconnecting, because we are sending')
      }
      else {
        bugout.log('no stored device to be called on resume')
        }
    });

    //
    //SECTION: changing & entering views
    //


    var skip = skipService.getSkip();

    $scope.$on('$ionicView.enter',function () {
      calculateVars();
      skip = skipService.getSkip();
        bugout.log('enterView fired, skip = '+skip);
        if (skip === true) {
          bugout.log('ionicView.enter reconnect to lastConnectedDevice because view remains under runBluetoothCtrl');
          $scope.checkBluetoothEnabled(function () {
            $scope.bluetoothConnected(function () {
              if (!$scope.isConnected) {
                $scope.getAvailableDevices();
              }
            })
          });
        }
        else {
          bugout.log('reconnecting on $ionicView.enter');
          connectToLastConnectedDevice();
        }
        $scope.settings = shareSettings.getObj();
        program = shareProgram.getObj();
        bugout.log('program:');
        bugout.log(JSON.stringify(program));
        bugout.log('settings:');
        bugout.log(JSON.stringify($scope.settings));
        if (emergency) {
          $scope.showResetButton = true;
        }
        else {
          $scope.showCalcButton = true;
          $scope.showStressTest = true;
          $scope.showHoming = true;
          $scope.showMovingButton = false;
          $scope.showEmergency = false;
          $scope.readyForData = false;
        }
    });


    $scope.$on('$ionicView.leave',function () {
      skip = skipService.getSkip();
      bugout.log('ionicView.leave called, skip = '+skip);
      if (sending === true ) {
        addToLog('Cancelling current tasks');
        $scope.emergencyOn(function () {
          $scope.emergencyOff();
        })
      }
      else if (skip === true) {
        bugout.log('ionicView.leave skipped because view remains under runBluetoothCtrl');
      }
      else {
        $cordovaBluetoothSerial.clear();
        $window.bluetoothSerial.unsubscribeRawData();
        $window.bluetoothSerial.disconnect(function(){
          bugout.log('successfully disconnected')
        }, function () {
          bugout.log('could not disconnect')
        });
      }
    });

    //
    //SECTION: reconnecting to last connectedDevice & saving lastConnectedDevice
    //
    $scope.deviceName= '';

    function connectToLastConnectedDevice(){
      addToLog('Trying to connect with last known device');
      $scope.checkBluetoothEnabled(function () {
        if (window.localStorage['lastConnectedDevice'] !== '') {
          var obj = JSON.parse(window.localStorage['lastConnectedDevice']);
          $window.bluetoothSerial.connectInsecure(obj.id, function () {
            $scope.deviceName = obj.name;
            bugout.log('succesfully connected to last connected device');
            $scope.bluetoothConnected();
            $scope.showCalcButton = true;
          }, function () {
            bugout.log('could not connect to last connected device');
            $scope.$apply(function () {
              $scope.isConnected = false
            });
            $scope.getAvailableDevices();
          });
        }
        else if ($scope.bluetoothEnabled) {
          bugout.log('No previously connected devices available');
          addToLog('No previously connected devices available');
          $scope.getAvailableDevices();
        }
        else {
          bugout.log('Bluetooth not enabled in connecttolastdevice');
        }
      });
    }

    function saveLastConnectedDevice(id, name) {
      var obj = {'id':id,'name':name};
      $scope.deviceName = name;
      window.localStorage.setItem('lastConnectedDevice', JSON.stringify(obj));
      bugout.log('Local storage last connected device set to: '+window.localStorage['lastConnectedDevice'])
    }

    //
    //SECTION: checks for Bluetooth turned on & Bluetooth connected
    //


    $scope.checkBluetoothEnabled = function(callback) {
      bugout.log('checkBluetoothEnabled fired');

      $cordovaBluetoothSerial.isEnabled().then(function(){
        addToLog('Bluetooth is turned on');
        $scope.bluetoothEnabled = true;

      },function(){
        addToLog('Bluetooth is turned off');
        $scope.bluetoothEnabled = false;
      }).then(function () {
        if (callback) callback();
      })

    };

    $scope.bluetoothConnected = function (callback) {
      $cordovaBluetoothSerial.isConnected().then(function () {
        addToLog('Your smartphone is connected with a Bluetooth device');
        $scope.isConnected = true;
        if (window.localStorage['lastConnectedDevice'] !== '') {
          var obj = JSON.parse(window.localStorage['lastConnectedDevice']);
          $scope.deviceName = obj.name;
        }

      }, function () {
        addToLog('Your smartphone is not connected with a Bluetooth device');
        $scope.isConnected = false;
      }).then(function () {
        bugout.log('isConnected: '+$scope.isConnected);
        if (callback) callback();
      })
    };


    $scope.bluetoothOn = function () {
      $ionicPlatform.ready(function() {
        bugout.log('Calling bluetoothOn');
        if (ionic.Platform.isIOS()) {
          $ionicPopup.alert({
            title: 'Please open Bluetooth settings manually',
            template: 'Automatic enable not possible on iOS'
          });
          addToLog('Bluetooth should be turned on manually');
        }
        else {
        $cordovaBluetoothSerial.enable().then(function () {
          addToLog('Bluetooth has been turned on by Toothmaster app');
          $scope.checkBluetoothEnabled();
          $scope.bluetoothConnected();
          $scope.getAvailableDevices();
        }, function (){
          $cordovaBluetoothSerial.showBluetoothSettings();
          addToLog('Bluetooth should be turned on manually, redirected to Bluetooth settings');
          })
        }
      })
     };

    //
    //SECTION: Getting paired & unpaired devices, userDisconnect
    //

    $scope.getAvailableDevices = function () {
      $scope.availableDevices = [];
      $scope.pairedDevices = [];
      if (!$scope.isConnected) {
        $ionicPlatform.ready(function() {
          bugout.log('Calling get available devices');
          if (ionic.Platform.isAndroid) {
            //discover unpaired
            $cordovaBluetoothSerial.discoverUnpaired().then(function (devices) {
              addToLog('Searching for unpaired Bluetooth devices');
              devices.forEach(function (device) {
                  $scope.availableDevices.push(device);
                  addToLog('Unpaired Bluetooth device found');
                }
              )}, function () {
              addToLog('Cannot find unpaired Bluetooth devices');
            });
            //discover paired
            $cordovaBluetoothSerial.list().then(function (devices) {
              addToLog('Searching for paired Bluetooth devices');
              devices.forEach(function (device) {
                $scope.pairedDevices.push(device);
                addToLog('Paired Bluetooth device found');
              }),function () {
                addToLog('Cannot find paired Bluetooth devices');
              }
            })
          }
          else if (ionic.Platform.isIOS) {
            $cordovaBluetoothSerial.list().then(function (devices) {
              addToLog('Searching for Bluetooth devices');
              devices.forEach(function (device) {
                addToLog('Bluetooth device found');
                $scope.availableDevices.push(device);
              })
            }, function () {
              addToLog('No devices found');
            })
          }
        })
      }

    };

    $scope.connectToUnpairedDevice = function ($index) {
      $ionicPlatform.ready(function() {
      addToLog('Trying to connect');
        bugout.log('Platform '+$scope.platform);
      bugout.log('Id = '+$scope.availableDevices[$index].id);
        if ($scope.platform === 'android') {
          $cordovaBluetoothSerial.connectInsecure($scope.availableDevices[$index].id).then(function () {
            addToLog('Your smartphone has succesfully connected with the selected Bluetooth device');
            $scope.bluetoothConnected();
            $scope.showCalcButton = true;
            saveLastConnectedDevice($scope.availableDevices[$index].id, $scope.availableDevices[$index].name);
          }, function (error) {
            //failure callback
            addToLog('Your smartphone has not been able to connect or has lost connection with the selected Bluetooth device');
            addToLog('error: '+error);
            $scope.bluetoothConnected();
          })
        }
        else {
          $cordovaBluetoothSerial.connectInsecure($scope.availableDevices[$index].id).then(function () {
            addToLog('Your smartphone has succesfully connected with the selected Bluetooth device');
            $scope.bluetoothConnected();
            $scope.showCalcButton = true;
          }, function (error) {
            //failure callback
            addToLog('Your smartphone has not been able to connect or has lost connection with the selected Bluetooth device');
            addToLog('error: '+error);
            $scope.bluetoothConnected();
          })
        }
      })
      };

    $scope.connectToPairedDevice = function ($index) {
      $ionicPlatform.ready(function() {
        addToLog('Trying to connect');
        bugout.log('Id = '+$scope.pairedDevices[$index].id);
        $cordovaBluetoothSerial.connect($scope.pairedDevices[$index].id).then(function () {
          addToLog('Your smartphone has succesfully connected with the selected Bluetooth device');
          $scope.bluetoothConnected();
          $scope.showCalcButton = true;
          saveLastConnectedDevice($scope.pairedDevices[$index].id, $scope.pairedDevices[$index].name);
      }, function (error) {
          addToLog('Your smartphone has not been able to connect or has lost connection with the selected Bluetooth device');
          addToLog('error: '+error);
      })
      })
    };

    $scope.userDisconnect = function () {
      $cordovaBluetoothSerial.write('<<y8:y'+stepMotorNum+'>').then(function () {
        $window.bluetoothSerial.disconnect(function () {
          bugout.log('User disconnected');
          addToLog('User disconnected');
          $scope.$apply(function () {
            $scope.isConnected = false;
            $scope.showCalcButton = false;
          });
          $scope.getAvailableDevices();
        }, function () {
          bugout.log('User could not disconnected');
          addToLog('Could not disconnect from device');
        })
      });
    };

    //
    //SECTION: Show buttons variables
    //


    //show buttons on view vars
    $scope.readyForData = false;
    var emergency = false;
    $scope.showEmergency = false;
    $scope.showMovingButton = false;
    $scope.showCalcButton = false;
    $scope.moving = false;
    $scope.showResetButton = false;
    $scope.showHoming = true;
    $scope.showStressTest = true;

    //
    //SECTION: UI log function
    //

    function addToLog(str) {
      bugout.log('Added to UI log: '+str);
      if ($scope.bluetoothLog.length > 200) {
        $scope.bluetoothLog.pop();
        $scope.bluetoothLog.unshift(str);
      }
      else {
        $scope.bluetoothLog.unshift(str);
      }
    }

    //
    //SECTION: setting & resetting stop buttons
    //

    $scope.emergencyOn = function (cb) {
      addToLog('Stop button pressed');
      emergency = true;
      $scope.showEmergency = false;
      $scope.showMovingButton = false;
      $scope.showCalcButton = false;
      $scope.showStressTest = false;
      $scope.showHoming = false;
      sentSettingsForTest = false;
      sending = false;
      $scope.showSpinner = false;
      //Send reset command
      $cordovaBluetoothSerial.write('<<y8:y'+stepMotorNum+'>').then(function () {
        bugout.log('emergency command: <<y8:y'+stepMotorNum+'>');
        addToLog('Emergency reset sent');
        checkResetResponse(cb);

      }, function (err) {
        addToLog('Error: Emergency command could not be set. '+err);
      });
    };

    var emergencyResetCount = 0;
    var emergencySentCount = 0;
    function checkResetResponse(cb) {
      if (response.search('8:y') > -1) {
        addToLog('Program has been successfully reset');
        $scope.showResetButton = true;
        $scope.showEmergency = false;
        response = '';
        emergencyResetCount = 0;
        emergencySentCount = 0;
        if (cb) cb();
      }
      else {
        if (emergencyResetCount < 3) {
          $timeout(function () {
            emergencyResetCount +=1;
            addToLog('Awaiting reset response, try :'+(emergencyResetCount+1));
            checkResetResponse();
          }, 100)
        }
        else {
          if (emergencySentCount <3) {
            $timeout(function () {
              $cordovaBluetoothSerial.write('<<y8:y'+stepMotorNum+'>').then(function () {
                bugout.log('emergency command: <<y8:y'+stepMotorNum+'>');
                addToLog('Emergency reset sent');
                checkResetResponse();

              }, function (err) {
                addToLog('Error: Emergency command could not be set. '+err);
              });
            }, 250);
            emergencySentCount += 1;
          }
          else {
            addToLog('Could not receive a response from the bluetooth receiver, checking connection');
            $scope.bluetoothConnected(function () {
              if (!$scope.isConnected) {
                $scope.getAvailableDevices();
                $ionicPopup.alert({
                  title: 'It appears that you have been disconnected',
                  template: 'Please reconnect and restart your task'
                })
              }
            });
          }
        }
      }
    }

    $scope.emergencyOff = function () {
      bugout.log('emergencyOff called');
      emergency = false;
      $scope.showCalcButton = true;
      homingCommand = 0;
      command = 0;
      encoderCommand = 0;
      response = '';
      $scope.movements = [];
      $scope.movementsNum = 0;
      done = true;
      $scope.showResetButton = false;
      homingDone = true;
      settingsDone = true;
      $scope.completedTest = 0;
      $scope.showStressTest = true;
      $scope.showHoming = true;
    };

    //
    //SECTION: setting logic variables
    //

    var direction; //if 'change direction' is true then 1, else 0
    var homingDirection;
    var homingStopswitchInt;
    var startPositionSteps; // value can be positive or negative
    var stepsPerRPM; // value must be positive
    var maxRPM; //MaxFreq*60/dipswitch , value is max speed in RPM, floating point, must be positive
    var time; //test, value floating point, must be positive
    var stepMotorOnOff; //test, value 0 or 1

    //other vars/commands
    var softwareVersionCommand = '<z'+stepMotorNum+'>';

    //decoder vars
    var disableEncoder;
    var stepsPerRPMDevidedByStepsPerRPMEncoder;
    var maxAllowedMiss; //value = integer

    //settings commands
    var commands;
    var command;
    var settingsDone;

    //homing commands
    var homingCommands;
    var homingCommand;
    var homingDone;

    //encoder commands
    var encoderCommands;
    var encoderCommand;

    //response vars
    var lastCommandTime;
    var lastReceivedTime;
    var response='';

    //update steps vars
    $scope.movements = [];
    $scope.movementsNum = 0;
    var done = true;

    //setting vars
    var stepMotorNum = '3';

    function calculateVars() {
      direction = ($scope.settings.direction) ? 1 : 0;
      homingDirection = ($scope.settings.direction) ? 0 : 1;
      homingStopswitchInt = ($scope.settings.homingStopswitch === true) ? 2 : 1;
      startPositionSteps = Math.floor(program.startPosition / $scope.settings.spindleAdvancement * $scope.settings.dipswitch);
      stepsPerRPM = $scope.settings.dipswitch;
      maxRPM = ($scope.settings.maxFreq*60/$scope.settings.dipswitch).toFixed(3);
      time = $scope.settings.time.toFixed(3);
      stepMotorOnOff = '1';
      disableEncoder = '<x0'+stepMotorNum+'>';
      stepsPerRPMDevidedByStepsPerRPMEncoder = ($scope.settings.encoder.stepsPerRPM !== 0) ? ($scope.settings.dipswitch/$scope.settings.encoder.stepsPerRPM).toFixed(3) : '' ; //value floating point, allowed positive or negative value
      stepsPerRPMDevidedByStepsPerRPMEncoder = ($scope.settings.encoder.direction) ? stepsPerRPMDevidedByStepsPerRPMEncoder*-1: stepsPerRPMDevidedByStepsPerRPMEncoder;
      maxAllowedMiss = ($scope.settings.encoder.stepsToMiss) ? $scope.settings.encoder.stepsToMiss : '';
      commands = ['<v'+direction+stepMotorNum+'>', '<s'+startPositionSteps+stepMotorNum+'>', '<p'+stepsPerRPM+stepMotorNum+'>',
        '<r'+maxRPM+stepMotorNum+'>', '<f'+stepMotorOnOff+stepMotorNum+'>', '<o'+time+stepMotorNum+'>', '<kFAULT'+stepMotorNum+'>'];
      command = 0;
      settingsDone = true;
      homingCommands = ['<v'+homingDirection+stepMotorNum+'>', '<p'+stepsPerRPM+stepMotorNum+'>', '<r'+maxRPM+stepMotorNum+'>',
        '<o'+time+stepMotorNum+'>','<h'+homingStopswitchInt+stepMotorNum+'>', '<kFAULT'+stepMotorNum+'>'];
      homingCommand = 0;
      homingDone = true;
      encoderCommands = ['<x1'+stepMotorNum+'>', '<d'+stepsPerRPMDevidedByStepsPerRPMEncoder+stepMotorNum+'>', '<b'+maxAllowedMiss+stepMotorNum+'>'];
      encoderCommand = 0;
    }

    //retry counter
    var retry = 1;

    //
    //SECTION: functions to determine movement steps
    //

    //function to add number of steps and description to $scope.movements
    function addMovement(steps, descr) {
      $scope.movements.push({
        "steps": steps,
        "description": descr
      })
    }

    //calculate movement sequence
    $scope.calcSteps = function() {
      $scope.movements = [];
      //call function to calculate steps for cuts, subcuts and pins, log $scope.movements, callback to inform user of movements
      if (program.sawWidth === undefined || program.cutWidth === undefined
        || program.pinWidth === undefined || program.numberOfCuts === undefined) {
        $ionicPopup.alert({
          title: 'Please fill in your Program before continuing',
          buttons: [{
            text: 'Go to program',
            type: 'button-calm',
            onTap: function () {
              $state.go('app.program');
            }
          }]
        });
      }
      else if (program.sawWidth > program.cutWidth) {
        $ionicPopup.alert({
          title: 'Your saw width cannot be wider than your cut width',
          template: 'Please adjust your program',
          buttons: [{
            text: 'Go to program',
            type: 'button-positive',
            onTap: function () {
              $state.go('app.program');
            }
          }]
        });
      }
      else {
        cutsAndPins(function() {
          bugout.log('Movements to take:');
          var count= 1;
          $scope.movements.forEach(function (item) {
            bugout.log('Movement '+count+':'+' steps'+item.steps+', description: '+item.description);
            count +=1;
          })
        });

        function cutsAndPins(callback) {
          //do this for number of cuts
          for (var i = 1; i <= program.numberOfCuts; i++) {
            bugout.log('var i ='+i);

            //if cut width is wider than saw width, calculate subcuts (multiple subcuts needed to complete one cut)
            if (program.cutWidth > program.sawWidth){

              //how many subcuts do we need for this cut to complete
              var subCuts = program.cutWidth / program.sawWidth;
              var cutsRoundedUp = Math.ceil(subCuts);

              // calculate remaining subcut steps, start at 2 because first subcut is already added after moving to past pin
              for (var j=2; j<= cutsRoundedUp; j++){
                bugout.log('Var j'+j);
                if (j<cutsRoundedUp){
                  var stepsPerSawWidth = program.sawWidth / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
                  addMovement(stepsPerSawWidth, 'Make subcut '+j+'/'+cutsRoundedUp)
                }

                //calculate remaining mm & steps, based on number of subcuts already taken
                else if (j===cutsRoundedUp) {
                  var remainingMM = program.cutWidth-((j-1)*program.sawWidth);
                  bugout.log('remaining mm: '+remainingMM);
                  var remainingSteps = remainingMM / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
                  addMovement(remainingSteps, 'Make subcut '+j+'/'+cutsRoundedUp);
                }
              }
            }

            //calculate steps for pins, not needed after last cut, thus i<numberOfCuts
            if (i<program.numberOfCuts) {
              bugout.log('Calculating pin');
              var pinSteps = program.pinWidth / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
              if (program.cutWidth > program.sawWidth) {
                addMovement(pinSteps, 'Make subcut 1/'+cutsRoundedUp);
              }
              else if (program.cutWidth === program.sawWidth) {
                addMovement(pinSteps, 'Make the cut');
              }

            }
            if (i=== program.numberOfCuts){
              bugout.log('i === numberofcuts');
              addToLog('Done calculating movements');
              if (callback) callback();
              $scope.showCalcButton = false;
              $scope.readyForData = true;
            }
          }
        }
      }
    };

    //
    //SECTION: send settings before homing, test and makeMovement logic
    //

    //user clicks button front end, sendSettingsData() called
    $scope.sendSettingsData = function (test, callback) {
      if (homingDone){
        $scope.showSpinner = true;
        subscribe();
        sending = true;
        settingsDone = false;
        $scope.showEmergency = true;
        //send start command
        send('<<y8:y'+stepMotorNum+'>', function (boolean) {
          if (boolean === true) {
            //send encoder settings or disable encode command, after that send settings commands
            if ($scope.settings.encoder.enable) {
              addToLog('Encoder enabled');
              send(encoderCommands[0], encoderPlus);
            }
            else {
              addToLog('Encoder disabled');
              send(disableEncoder, function () {
                send(commands[command], commandPlus);
              })
            }
          }
          else if (boolean === false) {
            if (emergency) {}
            else if (retry < 4) {
              retry+=1;
              addToLog('retry number '+(retry+1)+'/3');
              $scope.sendSettingsData();
            }
            else {
              addToLog('Maximum number of retries reached');
            }
          }
        });
      }
      else {
        $ionicPopup.alert({
          title: 'Please wait until homing is done'
        });
      }

      function encoderPlus(boolean){
        if (boolean === true) {
          if (encoderCommand < encoderCommands.length-1){
            encoderCommand +=1;
            send(encoderCommands[encoderCommand], encoderPlus);
          }
          else if (encoderCommand === encoderCommands.length-1){
            send(commands[command], commandPlus);
          }
        }
        else if (boolean === false) {
          if (retry < 4) {
            retry+=1;
            addToLog('retry number '+retry+'/3');
            $scope.sendSettingsData();
          }
          else {
            addToLog('Maximum number of retries reached');
          }
        }
      }
      //command closure callback
      function commandPlus(boolean) {
        if (boolean === true) {
          if (command < commands.length-1) {
            command += 1;
            send(commands[command], commandPlus);
          }
          //on last command check if 'rdy' has been sent
          else if (command === commands.length-1 && response.search('rdy')> -1) {

            $scope.readyForData = false;
            $scope.showMovingButton = true;
            $scope.showCalcButton = false;
            $scope.showHoming = false;
            settingsDone = true;
            command = 0;
            response = '';
            sending = false;
            if (test === undefined) {
              addToLog('Moved to start position');
              var subCuts = program.cutWidth / program.sawWidth;
              var cutsRoundedUp = Math.ceil(subCuts);
              $scope.showSpinner = false;
              if (program.cutWidth !== program.sawWidth) {
                $ionicPopup.alert({
                  title: 'Make the subcut 1/'+cutsRoundedUp
                });
              }
              else {
                $ionicPopup.alert({
                  title: 'Make the cut'
                });
              }
            }
            //callback used in stresstest
            else {
              if (callback) callback();
            }
          }
          else if (command === commands.length-1 && response.search('rdy') === -1){
            addToLog('Settings have not been sent correctly');
            command = 0;
            settingsDone = true;
            response = '';
          }
        }
        else if (boolean === false) {
          if (retry < 4) {
            retry+=1;
            addToLog('retry number '+retry+'/3');
            $scope.sendSettingsData();
          }
          else {
            addToLog('Maximum number of retries reached');
          }
        }
      }
    };

    //
    //SECTION: homing logic
    //

    $scope.homing = function () {
      if (!emergency) {
        subscribe();
        response = '';
        bugout.log('homingStopswitch = '+homingStopswitchInt);
        if (settingsDone){
          $scope.showSpinner = true;
          sending = true;
          homingDone = false;
          $scope.showEmergency = true;
          $scope.showHoming = false;
          //send start command
          send('<<y8:y' + stepMotorNum + '>', function (boolean) {
            //true boolean means a correct response has been given
            if (boolean === true) {
              //send encoder settings or disable encode command, after that send settings commands
              if ($scope.settings.encoder.enable) {
                bugout.log('Homing with encoder enabled');
                send(encoderCommands[0], encoderHomingPlus);
              }
              else {
                bugout.log('Homing with encoder disabled');
                send(disableEncoder, function () {
                  send(homingCommands[homingCommand], homingCommandPlus);
                })
              }
            }
            //false boolean means a timeout was encountered, retry
            else if (boolean === false) {
              if (retry < 4) {
                retry+=1;
                addToLog('retry number '+retry+'/3');
                $scope.homing();
              }
              else {
                addToLog('Maximum number of retries reached');
              }
            }
          });
        }
        else {
          $ionicPopup.alert({
            title: 'Please wait untill moving to start position is done in run Bluetooth program'
          });
        }
      }
      else {
        $ionicPopup.alert({
          title: 'Emergency has been pressed, will not contnue homing'
        });
      }

      function encoderHomingPlus(boolean){
        if (boolean === true) {
          if (!emergency) {
            if (encoderCommand < encoderCommands.length-1){
              encoderCommand +=1;
              send(encoderCommands[encoderCommand], encoderPlus);
            }
            else if (encoderCommand === encoderCommands.length-1){
              send(homingCommands[homingCommand], homingCommandPlus);
            }
          }
        }
        else if (boolean === false) {
          if (retry < 4) {
            retry+=1;
            addToLog('retry number '+retry+'/3');
            $scope.homing();
          }
          else {
            addToLog('Maximum number of retries reached');
          }
        }
      }

      function homingCommandPlus(boolean, res) {
        if (boolean === true &&!homingDone) {
          if (!emergency){
            bugout.log('homingCommandPlus called');
            //first command is already sent in homing function
            if (homingCommand < homingCommands.length-1) {
              homingCommand += 1;
              send(homingCommands[homingCommand], homingCommandPlus);
              bugout.log('homingCommand = '+homingCommand);
              bugout.log('homingCommands.length = '+homingCommands.length);
            }
            //on last command check if 'rdy' has been sent
            else if (homingCommand === homingCommands.length -1) {
              bugout.log('All homing commands sent');
              bugout.log('Making homing movement');
              if (res.search('wydone') > -1) {
                $scope.showSpinner = false;
                $ionicPopup.alert({
                  title: 'Homing completed'
                });
                $scope.showCalcButton = true;
                homingDone = true;
                homingCommand = 0;
                sending = false;
                $scope.showEmergency = false;
                $scope.showHoming = true;
              }
              else {
                $timeout(function () {
                  send('<w'+stepMotorNum+'>', homingCommandPlus);
                }, 200);
              }
            }
          }
          else {
            $ionicPopup.alert({
              title: 'Emergency has been pressed in run Bluetooth program, will not execute homing'
            });
          }
        }
        else if (boolean === false) {
          if (retry < 4) {
            retry+=1;
            addToLog('retry number '+retry+'/3');
            $scope.homing();
          }
          else {
            addToLog('Maximum number of retries reached');
          }
        }
      }
    };

    //
    //SECTION: stressTest logic
    //

    $scope.retriesNeeded = 0;
    $scope.completedTest = 0;
    var sentSettingsForTest = false;
    $scope.numberOfTests = {};

    $scope.stressTest = function () {
      $scope.showEmergency = true;
      $scope.showResetButton = false;
      $scope.showStressTest = false;
      if (emergency) {
        return
      }
      if (!sentSettingsForTest) {
        bugout.log('numberOfTests:'+$scope.numberOfTests.tests);
        addToLog('Sending settings needed for testing');
        $scope.sendSettingsData(true, function () {
          sentSettingsForTest = true;
          $scope.stressTest();
        });
      }
      else {
        addToLog('Executing test '+($scope.completedTest+1)+'/'+$scope.numberOfTests.tests);
        sending = true;
        send('<q'+Math.floor((Math.random()*1000)+20) +stepMotorNum+'>', checkTestDone);

        function checkTestDone(boolean) {
          if (boolean === true) {
            if (response.search('wydone') > -1) {
              response = '';
              $cordovaBluetoothSerial.clear();
              bugout.log('Test done, moving to next test');
              $scope.completedTest +=1;

              $cordovaBluetoothSerial.clear();
              if ($scope.completedTest < $scope.numberOfTests.tests){
                $timeout(function () {
                  $scope.stressTest();
                }, 50)
              }
              else {
                $scope.showSpinner = false;
                $ionicPopup.alert({
                  title: 'Test completed',
                  template: 'You have successfully completed the tests.'
                });
                addToLog('Testing done, completed '+$scope.completedTest+' tests');
                $scope.showEmergency = false;
                $scope.completedTest = 0;
                $scope.showStressTest = true;
                $scope.showCalcButton = true;
                $scope.showHoming = true;
                sending = false;
              }
            }
            else {
              $timeout(function () {
                send('<w'+stepMotorNum+'>', checkTestDone);
              }, 50);
            }
          }
          else if (boolean === false) {
            if (retry <= 10) {
              addToLog('retry number '+retry+'/10');
              retry +=1;
              $scope.retriesNeeded += 1;
              $scope.stressTest();
            }
            else {
              addToLog('Maximum number of retries reached');
            }
          }
        }
      }

    };

    //
    //SECTION: startMoving \ take steps logic
    //


    $scope.startMoving = function () {
      //check if prev stepCommand is done, send command, start pinging <w>, check for 'done:', allow next stepCommand
      if (done) {
        sending = true;
        done = false;
        $scope.showSpinner = true;
        send('<q'+$scope.movements[$scope.movementsNum].steps+stepMotorNum+'>', checkDone);
      }
      else {
        addToLog('Please wait untill this step is finished');
      }

      function checkDone(boolean) {
        if (boolean === true) {
          if (response.search('wydone') > -1) {
            response = '';
            addToLog('Movement done');
            addToLog($scope.movements[$scope.movementsNum].description);
            done = true;
            $scope.showSpinner = false;
            if ($scope.movements[$scope.movementsNum].description !== 'Moving to next cut' && $scope.movementsNum !== $scope.movements.length -1){
              $ionicPopup.alert({
                title: $scope.movements[$scope.movementsNum].description
              });
            }
            //once last movement is completed show restart program popup
            else if ($scope.movementsNum === $scope.movements.length -1) {
              $ionicPopup.alert({
                title: $scope.movements[$scope.movementsNum].description,
                buttons: [{
                  type: 'button-calm',
                  text: 'OK',
                  onTap: $scope.showRestartPopup()
                }]
              });
              $scope.showMovingButton = false;
              $scope.showEmergency = false;
              $scope.showResetButton = true;
              sending = false;
            }
            $scope.movementsNum += 1;
          }
            //If response is not wydone, send a <w> command to keep connection alive
          else {
            $timeout(function () {
              bugout.log('no wydone, sending <w>');
              send('<w'+stepMotorNum+'>', checkDone);
            }, 200);
          }
        }
      else if (boolean === false) {
          if (retry <= 3) {
            addToLog('retry number '+retry+'/3');
            done = true;
            $scope.startMoving();
          }
          else {
            addToLog('Maximum number of retries reached');
          }
        }
      }
    };

    //
    //SECTION: sending commands and receiving responses logic
    //

    //TODO check if subscribe + delimiter is better than subscribeRawDAta
    //TODO new delimiter is going to be "#"
    //retrieve bluetooth messages from driver
    function subscribe(){
      $window.bluetoothSerial.subscribeRawData(function (data) {
        //update view as message comes in, response converted from ArrayBuffer to String
        //$scope.$apply(function () {
        //Commented out scope.apply as response is now moved to bugout.log
        response += String.fromCharCode.apply(null, new Uint8Array(data));
        bugout.log('ResponseFull = '+response);
        lastReceivedTime = Date.now();
        //});
      });
    }

    //TODO Bug in stm32: if settings have been sent with encoder enabled, and after new settings are sent with encoder disabled wydone keeps sending <wydone:0;0@21250;0>
    function send(str, callback){
      var interval = null;
      //Check for emergency
      if(!emergency) {
          //write to bluetooth receiver
        lastCommandTime = Date.now();
        bugout.log('Command: '+str);
          $cordovaBluetoothSerial.write(str).then(function () {
            var substr;
            var substr2;
            switch (str.charAt(1)) {
              case '<':
                substr = '8:y';
                break;
              case 'd':
                substr = '12:';
                break;
              case 'b':
                substr = '13:';
                break;
              case 'x':
                substr = '14:';
                break;
              case 'v':
                substr = '9:';
                break;
              case 's':
                substr = '6:';
                break;
              case 'p':
                substr='5:';
                break;
              case 'r':
                substr = '3:';
                break;
              case 'o':
                substr = '2:';
                break;
              case 'f':
                substr = '11:';
                break;
              case 'k':
                substr = '0:rdy';
                substr2 = 'FAULT';
                break;
              case 'q':
                $scope.showSpinner = true;
                substr = 'rdy';
                substr2 = 'wydone';
                break;
              case 'h':
                substr = '6:';
                break;
              case 'z':
                substr = '14:';
                break;
              case 'w':
                substr = 'wydone';
                substr2 = 'w'+stepMotorNum;
                break;
            }
            //check periodically if response has been sent
              interval = $interval(function () {
                var now = Date.now();
                //check response for stopswitch that has been hit
                //TODO Bij Homing brand er geen stopswitch
                if (response.search('wydone:') > -1 && response.search('wydone:0') === -1 ) {
                  var posStopswitch = response.lastIndexOf('@')-3;
                    logResponse('ERROR: Hit stopswitch number '+response.charAt(posStopswitch));
                    addToLog('ERROR: Hit stopswitch number '+response.charAt(posStopswitch));
                    emergency = true;
                    $scope.showEmergency = false;
                    $scope.showMovingButton = false;
                    $scope.showCalcButton = false;
                    $scope.readyForData = false;
                    $scope.showStressTest = false;

                    //Send reset command
                    $cordovaBluetoothSerial.write('<<y8:y'+stepMotorNum+'>').then(function () {
                      addToLog('Program reset command sent');
                      checkResetResponse();
                    }, function (err) {
                      addToLog('Error: Program reset command could not be sent. '+err);
                    });
                    var cancelledBoolean1 = $interval.cancel(interval);
                    bugout.log('cancelled interval: '+cancelledBoolean1);
                  }
                else if (response.search('wydone:') > -1 && response.search('@5') > -1 ) {
                  //splice result from '@' till end
                // in splicedStr, splice again from pos[2] ([0] = @, [1] is status code), till indexOf(';')
                  var splicedStr = response.slice(response.lastIndexOf('@'));
                  var missedSteps = splicedStr.slice(2, splicedStr.indexOf(';'));
                  $ionicPopup.alert({
                    title: 'You have missed the maximum number of allowed steps',
                    template: 'The program has been stopped.\nMaximum steps to miss: '+maxAllowedMiss+'\nNumber of steps actually missed '+missedSteps
                  });
                  addToLog('ERROR: Number of missed steps exceeds encoder settings:');
                  addToLog('Maximum steps to miss: '+maxAllowedMiss);
                  addToLog('Number of steps actually missed '+missedSteps);
                  emergency = true;
                  $scope.showEmergency = false;
                  $scope.showMovingButton = false;
                  $scope.showCalcButton = false;
                  $scope.showStressTest = false;
                  var cancelledBoolean2 = $interval.cancel(interval);
                  bugout.log('cancelled interval: '+cancelledBoolean2);
                  //Send reset command
                  $cordovaBluetoothSerial.write('<<y8:y'+stepMotorNum+'>').then(function () {
                    addToLog('Program reset command sent');
                    checkResetResponse();

                  }, function (err) {
                    addToLog('Error: Program reset command could not be sent. '+err);
                  });
                  response = '';
                }
                //check response for substring
                else if (response.search(substr) > -1 && lastReceivedTime - lastCommandTime >0) {
                  logResponse(substr);
                  intervalCancelAndCB(true, substr);
                  retry = 0;
                }
                else if (response.search(substr2) > -1 && lastReceivedTime - lastCommandTime >0) {
                  logResponse(substr2);
                  intervalCancelAndCB(true, substr2);
                  retry = 0;
                }
                //handle timeouts
                else if (now - lastCommandTime>3000){
                    addToLog('Not received a response on time, retrying command');
                    bugout.log('time passed: '+(now-lastCommandTime));
                    bugout.log('now: '+now);
                  bugout.log('lastcommand: '+lastCommandTime);
                  intervalCancelAndCB(false);
                  bugout.log('retry = '+retry);
                }
              },50);

            function logResponse(responseStr) {
              bugout.log('Response = '+responseStr);
              bugout.log('Responded in time = '+(lastReceivedTime-lastCommandTime)+' ms');
            }

            function intervalCancelAndCB(responded, responseStr, posStopswitch) {

              if (angular.isDefined(interval)) {
                var cancelledBoolean = $interval.cancel(interval);
                bugout.log('interval cancelled:'+cancelledBoolean)
              }
              else {
                bugout.log('cannot cancel interval')
              }
              if (callback && typeof callback === "function") callback(responded, responseStr, posStopswitch);
              substr = '';
              substr2 = '';
              //emergency checkResetResponse needs the response
              if (!emergency) {
                response = '';
              }
            }
          }, function () {
            addToLog('Error sending command');
          });
      }
      else {
        addToLog('Emergency button pressed, will not send command');
      }
      /*Not neccessary because all come back as false
      $scope.$on('$ionicView.leave', function () {
        var cancelledBoolean = $interval.cancel(interval);
        bugout.log('cancelling interval on scope leave: '+cancelledBoolean);
      });*/
    }

    $scope.clearBuffer = function () {
     $cordovaBluetoothSerial.clear().then(function success(){
       addToLog('Received buffer cleared');
     }, function err() {
       addToLog('Error: Could not clear receive buffer');
     })
    };

    //
    //SECTION: popups && modals
    //
    $scope.showRestartPopup = function () {
      $ionicPopup.alert({
        title: 'Program finished!',
        template: 'Would you like to return to start position?',
        buttons: [
          {
            text: 'Yes',
            type: 'button-balanced',
            onTap: function () {
              $state.go('app.homing')
            }
          },
          {
            text: 'No',
            type: 'button-calm',
            onTap: function () {

            }
          },
          {
            text: 'Edit program',
            type: 'button-positive',
            onTap: function () {
              $state.go('app.program');
            }
          }]
      })
    };


    $scope.start = function () {
      $ionicPopup.alert({
        title: 'Make sure your workpiece is tightly secured!',
        template: 'Program is about to start!',
        buttons: [
          {
            text: 'Cancel',
            type: 'button-positive'
          },
          {
            text: 'Start',
            type: 'button-balanced',
            onTap: function () {
              $scope.sendSettingsData()
            }
          }]
      })
    };

    function createLogModal(cb) {
      $ionicModal.fromTemplateUrl('log-modal.html', {
        id: 1,
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal1 = modal;
        if (cb) cb();
      });
    }

    function createHelpModal(cb) {
      $ionicModal.fromTemplateUrl('help-modal.html', {
        id: 2,
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        bugout.log('modal created');
        $scope.modal2 = modal;
        if (cb) cb();
      });
    }



    $scope.openModal = function(index) {
      if (index === 1) {
        if ($scope.modal1 == undefined) {
          createLogModal(function () {
            bugout.log('showing modal');
            $scope.modal1.show();
          });
        }
        else {
          $scope.modal1.show();
        }
      }
      else {
        if ($scope.modal2 == undefined) {
          createHelpModal(function () {
            bugout.log('showing modal');
            $scope.modal2.show();
          });
        }
        else {
          $scope.modal2.show();
        }
      }
    };

    $scope.closeModal = function(index) {
      if (index === 1) $scope.modal1.hide();
      else $scope.modal2.hide();
    };

    /* TODO figure out modal creation
    $scope.$on('$ionicView.leave', function() {
      if ($scope.modal1 !== undefined) $scope.modal1.remove();
      if ($scope.modal2 !== undefined) $scope.modal2.remove();
      bugout.log('modals removed')
    });*/

    $scope.showFullLog= function () {
      bugout.log('bluetoothLog.length'+$scope.bluetoothLog.length);
      $scope.fullLog = $scope.bluetoothLog.slice(0,19);
      $scope.openModal(1);
    };

    $scope.getFullLogExtract = function(start, end) {
      bugout.log('getFullLogExtract, start: '+start+' end: '+end);
      $scope.fullLog = $scope.bluetoothLog.slice(start, end)
    };

    $scope.fullLogPage = 0;

    $scope.previousFullLogPage = function () {
      bugout.log('prevFullLogPage');
      $scope.getFullLogExtract((($scope.fullLogPage-1)*10),(($scope.fullLogPage-1)*10)+9);
      $scope.fullLogPage -= 1;
    };

    $scope.nextFullLogPage = function () {
      bugout.log('nextFullLogPage');
      $scope.getFullLogExtract((($scope.fullLogPage+1)*10),(($scope.fullLogPage+1)*10)+9);
      $scope.fullLogPage += 1;
    };

    //Help modal
    $scope.show = null;
    $scope.QAList = [];
    for (var i=1; i<11; i++) {
        $scope.QAList.push({
          question: 'Question '+i,
          answer: 'Lorem ipsum'
        })
      }

    $scope.showAnswer = function(obj) {
      $scope.show = $scope.show === obj ? null : obj;
    };

    $scope.emailFullLog = function () {
      var now = Date.now();
      cordova.plugins.email.isAvailable(
        function(isAvailable) {
          bugout.log('email available:'+isAvailable);
          if (isAvailable === true) {
            var logFile = bugout.getLog();
            // save the file locally, so it can be retrieved from emailComposer
            window.resolveLocalFileSystemURL(cordova.file.externalCacheDirectory, function(fileSystem) {
              bugout.log('file system open: ' + fileSystem.name);
              // create the file if it doesn't exist
              fileSystem.getFile('log'+now+'.txt', {create: true, exclusive: false}, function(file) {
                bugout.log("file is file?" + file.isFile.toString());
                // create writer
                file.createWriter(function(writer) {
                  // write
                  writer.write(logFile);
                  // when done writing, call up email composer
                  writer.onwriteend = function() {
                    bugout.log('done writing');
                    var subject = 'Toothmaster bug report';
                    var body = 'I have encountered an error. Could you please look into this problem? \nMy logfile is attached.\n\nKind regards,\nA Toothmaster user';
                    cordova.plugins.email.open({
                      to: ['p.m.c.sevat@gmail.com','info@goodlife.nu'],
                      subject: subject,
                      body: body,
                      attachments: [cordova.file.externalCacheDirectory+'/'+'log'+now+'.txt']
                      });
                  }
                }, fileSystemError);
              }, fileSystemError);
            }, fileSystemError);
      }
          else {
          // not available
          $ionicPopup.alert({
            title: 'No email composer available',
            template: 'There is no email app available through which the email can be sent'
          });
        }
      });
    };

    function fileSystemError(error) {
      bugout.log('Error getting file system: '+error.code);
    }


  });
//end of controller runBluetoothCtrl
