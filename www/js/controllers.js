angular.module('starter.controllers', [])
//TODO replace console.log with bugout.log
  /*
  * TODO:
  * $rootScope emits:
  * $rootScope.$on('emergencyOn')
  * $rootScope.$on('emergencyOff')
  * $rootScope.$on('stopswitchHit', response, stopswitchNumber)
  * $rootScope.$on('maxSteps', response, missedSteps)
  * $rootScope.$on('bluetoothResponse', response)
  * */
//controller used for debug buttons, not used anymore
.controller('AppCtrl', function($scope) {
  /*
  $scope.ClearLocalStor = function() {
    localStorage.clear();
    console.log('local storage cleared');
  };

  $scope.removeLocalSafety = function() {
    window.localStorage['Safety'] = '';
    console.log('Safety reset to ""');
  };

  $scope.setLocalSafety = function () {
    window.localStorage['Safety'] = 'Completed';
    console.log('Safety completed');
  };

  $scope.setRegister = function (){
    window.localStorage['registered'] = 'true';
    console.log('registered = true');
  };

  $scope.setDeregister = function (){
    window.localStorage['registered'] = 'false';
    console.log('registered = false');
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
    console.log('swiping right');
    $scope.i ++;
    }
  };

  $scope.next = function() {
    if ($scope.i < 7) {
      console.log("next");
      $scope.i ++;
    }
  };

  $scope.prev = function() {
    if ($scope.i >= 0) {
      console.log("prev");
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
    console.log('cleaning up modal');
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
    if (window.localStorage.length === 5) {
      console.log('only safety, settings, lastConnectedDevice, commandIDNum and lastUsedProgram found in localstorage');
    }
    //load the userPrograms stored in localStorage. objects are named 1 - n.
    //parse the userPrograms in localStorage so that they are converted to objects
    //push the parsed userPrograms to $scope.userPrograms array
    else {
      console.log(window.localStorage);
      for (var a=0; a<window.localStorage.length; a++) {
        if (window.localStorage.key(a) == 'Safety' || window.localStorage.key(a) == 'settings' || window.localStorage.key(a) == 'lastUsedProgram' || window.localStorage.key(a) == 'lastConnectedDevice' || window.localStorage.key(a) == 'commandIdNum') {

        }
        else{
          var tempName = window.localStorage.key(a);
          var temp = window.localStorage[tempName];
          temp = JSON.parse(temp);
          $scope.userPrograms.push(temp);
          console.log(tempName+' pushed to userPrograms');
        }

      }
    }
  };

  $scope.loadUserPrograms();

  $scope.loadUserProgram = function($index) {
    //load userProgram & close load modal
    console.log('userProgram clicked');
    $scope.currentProgram = $scope.userPrograms[$index];
    shareProgram.setObj($scope.currentProgram);
    $scope.closeModal(1);
  };

  $scope.loadPreset = function($index) {
    //load preset & close load modal
    console.log('loadPreset clicked');
    $scope.currentProgram = $scope.presets[$index];
    $scope.currentProgram.title = $scope.presets[$index].titlePreset;
    shareProgram.setObj($scope.currentProgram);
    $scope.closeModal(1);
  };

  $scope.checkCurrentProgram = function(){
    /*console.log('registered = '+ window.localStorage['registered']);
    console.log('condition ='+ (window.localStorage['registered'] = 'false'));*/
    if ($scope.currentProgram.title == null ) {
      $scope.showAlertTitle();
      return false;
    }
    /*else if ($scope.currentProgram.numberOfCuts > 2 && window.localStorage['registered'] == 'false') {
      console.log('cannot save, number of cuts too high for restriction');
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
      console.log('userProgram pushed to userPrograms & localStorage');
      console.log('\nuserPrgrams after pushed saved program:');
      console.log($scope.userPrograms);
      console.log('\ncurrentProgram:');
      console.log($scope.currentProgram);
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
      console.log('modals removed')
    });*/

  $scope.deleteUserProgram = function($index) {
    console.log('delete userProgram clicked at index: '+$index);
    console.log($scope.userPrograms);
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
                console.log(window.localStorage);
                console.log('index ='+index);
                // remove the userProgram from localstorage. Step 1: get the key under which the userProgram is saved
                var userProg = $scope.userPrograms[index];
                console.log(userProg);
                var userProgName = userProg.title;
                console.log(userProgName);
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
        console.log('cannot save, number of cuts too high for restriction');
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
        console.log('all fields filled in');
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
    console.log($scope.settings);
    if ($scope.settings === undefined){
      console.log('settings are not filled in correctly');
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
      console.log('checkSettings passed');
      return true;
    }
    else if ($scope.settings.maxFreq !== null  && $scope.settings.dipswitch !== null &&
      $scope.settings.spindleAdvancement !== null && $scope.settings.time !== null && $scope.settings.homingStopswitch !== null && $scope.settings.encoder.enable === true &&
      $scope.settings.encoder.stepsPerRPM !== 0 && $scope.settings.encoder.stepsToMiss > 0) {
      console.log('checkSettings passed');
      return true;
    }
    else {
        console.log('settings are not filled in correctly');
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
      console.log(settingsJSON);
      window.localStorage['settings'] = settingsJSON;
      //call shareSettings service so that settings can be used in programCtrl & runBluetoothCtrl
      shareSettings.setObj($scope.settings);
      $scope.showAlertSaved();
    }

  };

  $scope.loadSettings = function() {
    console.log('settings: '+window.localStorage['settings']);
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

  .controller('browserCtrl', function($scope, $cordovaInAppBrowser) {
  $scope.openBrowser = function() {
    $cordovaInAppBrowser.open('http://goodlife.nu', '_self');
  }

})


  .controller('runBluetoothCtrl', function($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal,
    $state, $ionicPlatform, $window, $interval, $timeout, shareSettings, shareProgram, skipService, buttonService, emergencyService,
    checkBluetoothEnabledService, isConnectedService, logService, disconnectService, calculateVarsService, sendAndReceiveService,
    statusService, connectToDeviceService){ //modalService, logModalService, helpModalService

    $scope.$on('$ionicView.beforeLeave', function () {
      console.log('BEFORE LEAVE');
      sendAndReceiveService.unsubscribe();
    });

    $scope.$on('$ionicView.afterEnter', function () {
      console.log('AFTER ENTER');
      sendAndReceiveService.subscribe();
    });

    $scope.bluetoothLog = logService.getLog();
    $scope.bluetoothEnabled = null;
    $scope.isConnected = null;
    var sending = statusService.getSending();
    var program = shareProgram.getObj();
    console.log('program:');
    console.log(JSON.stringify(program));
    $scope.settings = shareSettings.getObj();
    console.log('settings:');
    console.log(JSON.stringify($scope.settings));
    $scope.deviceName= connectToDeviceService.getDeviceName();
    //TODO spinner needs to be derived from buttonService
    //TODO aren;t these variables superfluous bevause of ionicView.enter?
    $scope.buttons = buttonService.getValues();
    var emergency = statusService.getEmergency();
    var runBluetoothVars;

    //settings commands
    var commands;
    var settingsDone;

    //update steps vars
    $scope.movements = [];
    $scope.movementsNum = 0;
    var done = true;

    //setting vars
    var stepMotorNum = '3';

    //
    //SECTION: changing & entering views
    //

    $scope.$on('$ionicView.unloaded', function () {
      console.log('\nUNLOADED\n');
    });

    // and only calculateVarsService.getVars('runBluetooth') is called && log is imported && correct buttons are set
    $scope.$on('$ionicView.enter',function () {
      console.log('enterView in runBluetoothCtrl fired');
      isConnectedService.getValue(function (value) {
        $scope.isConnected = value;
      });
      checkBluetoothEnabledService.getValue(function (value) {
        $scope.bluetoothEnabled = value;
        console.log('$scope.bluetoothEnabled: '+$scope.bluetoothEnabled);
      });
      logService.getLog(function (arr) {
        $scope.bluetoothLog = arr;
      });
      //no need to connect or anything, connectToLastDevice is done on app startup
      $scope.settings = shareSettings.getObj();
      program = shareProgram.getObj();
      console.log('program:');
      console.log(JSON.stringify(program));
      console.log('settings:');
      console.log(JSON.stringify($scope.settings));
      $scope.bluetoothLog = logService.getLog();
      //runBluetoothVars is an object which contains settings commands (obj.commands)
      // and individual variables (obj.vars.*)
      calculateVarsService.getVars('runBluetooth', function (arr) {
        runBluetoothVars = arr;
        commands = runBluetoothVars.commands;
        console.log('commands:');
        console.log(commands);
      });
      $scope.deviceName= connectToDeviceService.getDeviceName();
      $scope.buttons = buttonService.getValues();
        if (statusService.getEmergency() === true) {
          setButtons({'showResetButton': true});
        }
        else {
          setButtons({
            'showCalcButton': true,
            'showMovingButton': false,
            'showEmergency': false,
            'readyForData': false,
            'showSpinner': false
          })
        }
    });

    $scope.$on('$ionicView.leave',function () {
      console.log('ionicView.leave called');
      if (statusService.getSending() === true ) {
        addToLog('Cancelling current tasks');
        emergencyService.on(function () {
          emergencyService.off();
        });
      }
      else {
        sendAndReceiveService.clearBuffer();

      }
      logService.setBulk($scope.bluetoothLog);
    });

    $scope.userDisconnect = function () {
      disconnectService.disconnect();
      $scope.isConnected = false;
    };

    //
    //SECTION: Show buttons variables
    //

    function setButtons(obj) {
      buttonService.setValues(obj);
      $scope.$apply(function () {
        $scope.buttons = buttonService.getValues()
      });
      console.log($scope.buttons);
    }

    //
    //SECTION: UI log function
    //

    function addToLog(str) {
      logService.addOne(str);
      logService.getLog(function (arr) {
        $scope.bluetoothLog = arr;
      });
    }

    //
    //SECTION: setting & resetting stop buttons
    //

    //TODO set variables necessary on rootscope listener
    $rootScope.$on('emergencyOn', function () {
      emergency = true;
    });

    $rootScope.$on('emergencyOff', function () {
      emergency = false;
      $scope.movements = [];
      $scope.movementsNum = 0;
      done = true;
      settingsDone = true;
      $scope.completedTest = 0;
      $scope.buttons = buttonService.getValues();
    });

    $scope.emergencyOn = function () {
      emergencyService.on();
    };

    $scope.emergencyOff = function () {
      console.log('emergencyOff called');
      emergencyService.off();
    };

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
      program = shareProgram.getObj();
      $scope.settings = shareSettings.getObj();
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
          console.log('Movements to take:');
          var count= 1;
          $scope.movements.forEach(function (item) {
            console.log('Movement '+count+':'+' steps'+item.steps+', description: '+item.description);
            count +=1;
          })
        });

        function cutsAndPins(callback) {
          //do this for number of cuts
          for (var i = 1; i <= program.numberOfCuts; i++) {
            console.log('var i ='+i);

            //if cut width is wider than saw width, calculate subcuts (multiple subcuts needed to complete one cut)
            if (program.cutWidth > program.sawWidth){

              //how many subcuts do we need for this cut to complete
              var subCuts = program.cutWidth / program.sawWidth;
              var cutsRoundedUp = Math.ceil(subCuts);

              // calculate remaining subcut steps, start at 2 because first subcut is already added after moving to past pin
              for (var j=2; j<= cutsRoundedUp; j++){
                console.log('Var j'+j);
                if (j<cutsRoundedUp){
                  var stepsPerSawWidth = program.sawWidth / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
                  addMovement(stepsPerSawWidth, 'Make subcut '+j+'/'+cutsRoundedUp)
                }

                //calculate remaining mm & steps, based on number of subcuts already taken
                else if (j===cutsRoundedUp) {
                  var remainingMM = program.cutWidth-((j-1)*program.sawWidth);
                  console.log('remaining mm: '+remainingMM);
                  var remainingSteps = remainingMM / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
                  addMovement(remainingSteps, 'Make subcut '+j+'/'+cutsRoundedUp);
                }
              }
            }

            //calculate steps for pins, not needed after last cut, thus i<numberOfCuts
            if (i<program.numberOfCuts) {
              console.log('Calculating pin');
              var pinSteps = program.pinWidth / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
              if (program.cutWidth > program.sawWidth) {
                addMovement(pinSteps, 'Make subcut 1/'+cutsRoundedUp);
              }
              else if (program.cutWidth === program.sawWidth) {
                addMovement(pinSteps, 'Make the cut');
              }

            }
            if (i=== program.numberOfCuts){
              console.log('i === numberofcuts');
              addToLog('Done calculating movements');
              if (callback) callback();
              setButtons({
                'showCalcButton': false,
                'readyForData': true
              })
            }
          }
        }
      }
    };

    //
    //SECTION: send settings before homing, test and makeMovement logic
    //

    //user clicks button front end, sendSettingsData() called
    $scope.sendSettingsData = function () {
      if (statusService.getEmergency() === false) {
        if (statusService.getSending() === false){
          setButtons({'showSpinner':true,'showEmergency':true, 'readyForData':false});
          statusService.setSending(true);
          settingsDone = false;

          for (var i = 0; i < commands.length -1; i++){
            sendAndReceiveService.write(commands[i]);
            }
          //All other setting commands need to be sent before sending kFault,
          // so on second to last setting command a 'sendKfault' is emitted after which kFault is sent
          var sendKfault = $rootScope.$on('sendKfault', function () {
            sendAndReceiveService.write(commands[commands.length-1], function () {
              sendKfault();
            });
            //on sending kFault, check for response
          var rdy = $rootScope.$on('bluetoothResponse', function (event, res) {
            lastSendSettingsCommand(res);
            rdy();
            })
          })
        }
          console.log('cannot continue sendSettingsData, sending is true')
      }
      else {
        addToLog('Emergency on, will not continue sending settings data');
      }
    };

    function lastSendSettingsCommand(res) {
    if (res.search('rdy') !== -1) {
        setButtons({'readyForData':false,'showMovingButton':true,'showCalcButton':false,'showHoming':false, 'showSpinner': false});
        statusService.setSending(false);
        addToLog('Moved to start position');
        var subCuts = program.cutWidth / program.sawWidth;
        var cutsRoundedUp = Math.ceil(subCuts);
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
      else if (res.search('kFAULT') !== -1){
        //TODO Check this one
        addToLog('Settings have been sent incorrectly, please try again');
        emergencyService.on(function () {
          emergencyService.off()
        });
      }
    }

    //
    //SECTION: startMoving \ take steps logic
    //

    $scope.startMoving = function () {
      if (statusService.getEmergency() === false) {
        if (done) {
          statusService.setSending(true);
          done = false;
          setButtons({'showSpinner':true});
          sendAndReceiveService.write('<q'+$scope.movements[$scope.movementsNum].steps+stepMotorNum+'>', checkDone);
        }
        else {
          addToLog('Please wait untill this step is finished');
        }
      }
      else {
        addToLog('Emergency on, will not continue with movement');
      }

      //check if prev stepCommand is done, send command, start pinging <w>, check for 'done:', allow next stepCommand
      function checkDone() {
        var check = $rootScope.$on('bluetoothResponse', function (event, res) {
          console.log('on bluetoothResponse in checkDone called');
            if (res.search('wydone:0') > -1) {
              addToLog('Movement done');
              addToLog($scope.movements[$scope.movementsNum].description);
              done = true;
              setButtons({'showSpinner':false});
              if ($scope.movements[$scope.movementsNum].description !== 'Moving to next cut'
                && $scope.movementsNum !== $scope.movements.length -1){
                $ionicPopup.alert({
                  title: $scope.movements[$scope.movementsNum].description
                });
                $scope.movementsNum += 1;
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
                setButtons({'showMovingButton':false,'showEmergency':false,'showResetButton':true});
                statusService.setSending(false);
                $scope.movements = [];
                $scope.movementsNum = 0;
              }
            }
          else {
              $timeout(function () {
                console.log('no wydone, sending <w>');
                sendAndReceiveService.write('<w'+stepMotorNum+'>', checkDone);
              }, 250);
            }
          check();
        });
      }
    };
/*
    function send(str, listenerBoolean, listenerFunction) {
      if (str === undefined){
        $ionicPopup.alert({
          title: 'Encountered an error',
          template: 'Please email a bug report via \'Show full log\''
        })
      }
      if (statusService.getEmergency() === false) {
        //calling commandObj returns {'ID': num, 'command': str, 'expectedResponse': str}
        // and adds this object to sendAndReceive.commandArray
        var commandObj = sendAndReceiveService.addToCommandObj(str);

        //calling .write() with original command (str). commandID and callingFunction are optional.
        sendAndReceiveService.write(str, commandObj.ID, 'send in runBluetoothCtrl');
        //creates listener based on commandID, plus function to execute when listener is fired
        if (listenerBoolean === true) {
          createListener(commandObj.ID, listenerFunction);
        }
      }
    }
*/
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

    /*
    var createLogModal = new logModalService.create();

    var createHelpModal = new helpModalService.create();

//TODO check if this new declaration works
    $scope.openModal = new modalService.openModal;

    $scope.closeModal = new modalService.close;

    $scope.showFullLog = new logModalService.showFullLog;

    $scope.getFullLogExtract = new logModalService.getFullLogExtract;

    $scope.fullLogPage = 0;

    $scope.previousFullLogPage = new logModalService.previousFullLogPage;

    //TODO replaced by modalService.nextFullLogPage, call with new!
    $scope.nextFullLogPage = new logModalService.nextFullLogPage;

    //Help modal
    //TODO: fill with actual Q&A's
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

    //TODO replaced by logModal.emailFullLog
    $scope.emailFullLog = new logModalService.emailFullLog;
*/
  })
//end of controller runBluetoothCtrl

.controller('homingCtrl', function ($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal,
                                    $state, $ionicPlatform, $window, $interval, $timeout, shareSettings, shareProgram, skipService, buttonService, emergencyService,
                                    checkBluetoothEnabledService, isConnectedService, logService, disconnectService, calculateVarsService, sendAndReceiveService,
                                    statusService, connectToDeviceService) {
  $scope.$on('$ionicView.unloaded', function () {
    console.log('\nUNLOADED\n');
  });

  $scope.$on('$ionicView.beforeLeave', function () {
    console.log('BEFORE LEAVE');
    sendAndReceiveService.unsubscribe();
  });

  $scope.$on('$ionicView.afterEnter', function () {
    console.log('AFTER ENTER');
    sendAndReceiveService.subscribe();
  });

  var homingStopswitchInt;
  //homing commands
  var homingCommands;
  var stepMotorNum = '3';
  $scope.bluetoothLog = [];
  $scope.bluetoothEnabled = null;
  $scope.buttons = buttonService.getValues();
  $scope.userDisconnect = function () {
    disconnectService.disconnect();
    isConnectedService.getValue(function (val) {
      $scope.isConnected = val;
    })
  };

  function setButtons(obj) {
    buttonService.setValues(obj);
    $scope.$apply(function () {
      $scope.buttons = buttonService.getValues()
    });
    console.log($scope.buttons);
  }

  $scope.$on('$ionicView.enter', function () {
    console.log('enterView in homingCtrl fired');
    logService.getLog(function (arr) {
      $scope.bluetoothLog = arr;
    });
    checkBluetoothEnabledService.getValue(function (value) {
      $scope.bluetoothEnabled = value;
      console.log('$scope.bluetoothEnabled: '+$scope.bluetoothEnabled);
    });
    connectToDeviceService.getDeviceName(function (value) {
      $scope.deviceName= value;
    });
    $scope.buttons = buttonService.getValues();
    isConnectedService.getValue(function (value) {
      $scope.isConnected = value;
      console.log('$scope.isConnected: '+$scope.isConnected);
    });
    calculateVarsService.getVars('homing', function (obj) {
      homingCommands = obj.commands;
      console.log('homingcommands:');
      console.log(homingCommands);
      homingStopswitchInt = obj.vars.homingStopswitchInt;
    });
  });

  $scope.$on('$ionicView.leave', function () {
    console.log('leaveView in bluetoothConnectionCtrl fired');
    if (statusService.getSending() === true ) {
      addToLog('Cancelling current tasks');
      emergencyService.on(function () {
        emergencyService.off();
      });
    }
    else {

      sendAndReceiveService.clearBuffer();
    }
    //TODO perhaps create listeners in a var and cancel var on leave?
    logService.setBulk($scope.bluetoothLog);
  });

  $scope.emergencyOn = function () {
    emergencyService.on();
  };

  $scope.emergencyOff = function () {
    console.log('emergencyOff called');
    emergencyService.off();
  };

  //
  //SECTION: homing logic
  //

  $scope.homing = function () {
    if (statusService.getEmergency() === false) {
      console.log('homingStopswitch = '+homingStopswitchInt);
      if (statusService.getSending() === false){
        setButtons({'showSpinner':true,'showEmergency':true,'showHoming':false});
        statusService.setSending(true);
        //send start command
        for (var i = 0; i < homingCommands.length -1; i++){
          sendAndReceiveService.write(homingCommands[i]);
        }
        var sendKfault = $rootScope.$on('sendKfault', function () {
          sendAndReceiveService.write(homingCommands[homingCommands.length-1], function () {
            sendKfault();
          });
        });
        var rdy = $rootScope.$on('bluetoothResponse', function (event, res) {
          homingResponse(res);
          rdy();
        })
      }
      else {
        $ionicPopup.alert({
          title: 'Please wait untill moving to start position is done in run Bluetooth program'
        });
      }
    }
    else {
      $ionicPopup.alert({
        title: 'Emergency has been pressed, will not continue homing'
      });
    }

//TODO !!! Check real-life homing correct handling, using my STM-32 stopswitch is automatically hit, not able to check correct homing"
    function homingResponse(res) {
      if (res.search('wydone') > -1) {
        setButtons({'showSpinner': false, 'showEmergency': false, 'showHoming': true});
        $ionicPopup.alert({
          title: 'Homing completed'
        });
        statusService.setSending(false);
      }
      else {
        $timeout(function () {
          sendAndReceiveService.write('<w'+stepMotorNum+'>');
          var rdy = $rootScope.$on('bluetoothResponse', function (event, res) {
            homingResponse(res);
            rdy();
          })
        }, 200);
      }
    }
  };

  function addToLog(str) {
    logService.addOne(str);
    logService.getLog(function (arr) {
      $scope.bluetoothLog = arr;
    });
  }

})
//end of controller homingCtrl

.controller('testCtrl', function ($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal,
                                  $state, $ionicPlatform, $window, $interval, $timeout, shareSettings, shareProgram, skipService, buttonService, emergencyService,
                                  checkBluetoothEnabledService, isConnectedService, logService, disconnectService, calculateVarsService, sendAndReceiveService,
                                  statusService, connectToDeviceService) {
  $scope.$on('$ionicView.unloaded', function () {
    console.log('\nUNLOADED\n');
  });

  $scope.$on('$ionicView.beforeLeave', function () {
    console.log('BEFORE LEAVE');
    sendAndReceiveService.unsubscribe();
  });

  $scope.$on('$ionicView.afterEnter', function () {
    console.log('AFTER ENTER');
    sendAndReceiveService.subscribe();
  });

//other vars/commands
  var stepMotorNum = '3';
  var softwareVersionCommand = '<z'+stepMotorNum+'>';
  var commands;
  $scope.settings = shareSettings.getObj();
  $scope.bluetoothLog = [];
  $scope.bluetoothEnabled = null;
  $scope.buttons = buttonService.getValues();
  $scope.retriesNeeded = 0;
  $scope.completedTest = 0;
  var sentSettingsForTest = false;
  $scope.numberOfTests = {};
  var testsSent = 0;
  $scope.testRunning = false;

  $scope.userDisconnect = function () {
    disconnectService.disconnect();
    isConnectedService.getValue(function (val) {
      $scope.isConnected = val;
    })
  };

  function setButtons(obj) {
    buttonService.setValues(obj);
    $scope.$apply(function () {
      $scope.buttons = buttonService.getValues()
    });
    console.log($scope.buttons);
  }

  $scope.$on('$ionicView.enter', function () {
    console.log('enterView in testCtrl fired');
    logService.getLog(function (arr) {
      $scope.bluetoothLog = arr;
    });
    checkBluetoothEnabledService.getValue(function (value) {
      $scope.bluetoothEnabled = value;
      console.log('$scope.bluetoothEnabled: '+$scope.bluetoothEnabled);
    });
    connectToDeviceService.getDeviceName(function (value) {
      $scope.deviceName= value;
    });
    $scope.buttons = buttonService.getValues();
    isConnectedService.getValue(function (value) {
      $scope.isConnected = value;
      console.log('$scope.isConnected: '+$scope.isConnected);
    });
    calculateVarsService.getVars('test', function (obj) {
      commands = obj.commands;
      console.log('testCommands:');
      console.log(commands);
    });
    $scope.settings = shareSettings.getObj();
  });

  $scope.$on('$ionicView.leave', function () {
    console.log('leaveView in bluetoothConnectionCtrl fired');
    $scope.retriesNeeded = 0;
    $scope.completedTest = 0;
    sentSettingsForTest = false;
    $scope.numberOfTests = {};
    testsSent = 0;
    $scope.testRunning = false;
    if (statusService.getSending() === true ) {
      addToLog('Cancelling current tasks');
      emergencyService.on(function () {
        emergencyService.off();
      });
    }
    else {

      sendAndReceiveService.clearBuffer();
    }
    //TODO perhaps create listeners in a var and cancel var on leave?
    logService.setBulk($scope.bluetoothLog);
  });

  $scope.emergencyOn = function () {
    emergencyService.on();
    $scope.completedTest = 0;
    $scope.retriesNeeded = 0;
    sentSettingsForTest = false;
    testsSent = 0;
    $scope.testRunning = false;
  };

  $scope.emergencyOff = function () {
    console.log('emergencyOff called');
    emergencyService.off();

  };
  //
  //SECTION: stressTest && move X mm logic
  //

  //TODO make sure that moveXMm, stresstest and normal program still function as expected
  $scope.moveXMm = function () {
    if (statusService.getEmergency() === false && statusService.getSending() === false) {
      if ($scope.numberOfTests.mm === undefined) {
        $ionicPopup.alert({
          title: 'Please fill in "Move X mm"'
        })
      }
      else {
        setButtons({'showStressTest': false, 'showVersionButton': false, 'showSpinner':true, 'showEmergency': true});

        //replace standard <s0+stepMotorNum> with moveXMmStepsCommand
        var moveXMmSteps = $scope.numberOfTests.mm / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
        var moveXMmStepsCommand = '<s'+moveXMmSteps+stepMotorNum+'>';
        var position = commands.indexOf('<s0'+stepMotorNum+'>');
        commands[position] = moveXMmStepsCommand;
        sendSettings('moveXMm');
      }
    }
  };

  function sendSettings(type) {
    var typeStr = type;
    console.log('Commands in testCtrl -> sendSettings:');
    console.log(commands);
    //send commands, except last one
    for (var i = 0; i < commands.length -1; i++){
      sendAndReceiveService.write(commands[i]);
    }
    //send last command on sendKfault notification
    var sendKfault = $rootScope.$on('sendKfault', function () {
      sendAndReceiveService.write(commands[commands.length-1], function () {
        initRdy(typeStr);
        sendKfault();
      });
    });
    //check if commands have been sent correctly
  }

  function initRdy(typeStr) {
    var rdy = $rootScope.$on('bluetoothResponse', function (event, res) {
      checkRdy(res, typeStr);
      rdy();
    });
  }

  function checkRdy(res, type) {
    var typeStr = type;
    if (res.search('wydone') > -1) {
      if (typeStr === 'moveXMm') {
        $ionicPopup.alert({
          title: 'Moved '+$scope.numberOfTests.mm+' mm'
        });
        setButtons({'showStressTest': true, 'showVersionButton': true, 'showEmergency': false, 'showSpinner': false});
        calculateVarsService.getVars('test', function (obj) {
          console.log('resetting commands in testCtrl');
          commands = obj.commands;
        });
      }
      else if (typeStr === 'stressTest') {
        sentSettingsForTest = true;
        $scope.stressTest();
      }
    }
    else if (res.search('FAULT') > -1) {
      addToLog('Error sending moveXMmResponse, aborting current task & resetting');
      emergencyService.on(function () {
        emergencyService.off();
      })
    }
    else {
      $timeout(function () {
        sendAndReceiveService.write('<w'+stepMotorNum+'>');
        var rdy = $rootScope.$on('bluetoothResponse', function (event, response) {
          checkRdy(response, typeStr);
          rdy();
        })
      }, 200);
    }
  }

  $scope.stressTest = function () {
    setButtons({'showEmergency': true, 'showResetButton': false, 'showStressTest': false, 'showVersionButton': false, 'showMoveXmm': false, 'showSpinner': true});
    $scope.testRunning = true;
    if (statusService.getEmergency() === true) {
      addToLog('Emergency on, cancelling stresstest');
    }
    else if ($scope.numberOfTests.tests === undefined || $scope.numberOfTests.tests === 0) {
      $ionicPopup.alert({
        title: 'Please fill in the number of test commands'
      })
    }
    else {
      if (!sentSettingsForTest) {
        if (statusService.getEmergency() === false) {
          console.log('numberOfTests:'+$scope.numberOfTests.tests);
          addToLog('Sending settings needed for testing');
          sendSettings('stressTest');
        }
      }
      else {
        if (statusService.getEmergency() === false) {
          addToLog('Executing tests');
          statusService.setSending(true);

          //with 10 or less tests, send them all at once
          if ($scope.numberOfTests.tests <= 10) {
            for (var i = 0; i < $scope.numberOfTests.tests; i++) {
              //Send a random command, true = create listener, function is executed as soon as wydone+commandID has come back
              send('<q'+Math.floor((Math.random()*1000)+20) +stepMotorNum+'>');
            }
          }

          //TODO with 11 or more tests, start with 10, then send a new one everytime a wydone is received
          else {
            for (var i = 0; i < 10; i++) {
              //Send a random command, true = create listener, function is executed as soon as wydone+commandID has come back
              send('<q'+Math.floor((Math.random()*1000)+20) +stepMotorNum+'>');
            }
          }
          $timeout(function () {
            sendAndReceiveService.startPing();
          },500);
          var faulty = $rootScope.$on('faultyResponse', function (event, res) {
            console.log('faultyResponse in testCtrl, sending new buffered command');
            send('<q'+Math.floor((Math.random()*1000)+20) +stepMotorNum+'>');
          });
          var commandDone = $rootScope.$on('bufferedCommandDone', function (event, res, commandID) {
            $scope.completedTest += 1;
            if ($scope.completedTest === $scope.numberOfTests.tests) {
              sendAndReceiveService.stopPing();
              setButtons({'showSpinner':false,'showEmergency':false,'showStressTest':true,'showVersionButton':true,'showMoveXMm': true});;
              statusService.setSending(false);
              $scope.testRunning = false;
              $ionicPopup.alert({
                title: 'Test completed',
                template: 'You have successfully completed the tests.'
              });
              addToLog('Testing done, completed '+$scope.completedTest+' tests');
              calculateVarsService.getVars('test', function (obj) {
                console.log('resetting commands in testCtrl');
                commands = obj.commands;
              });
              faulty();
              commandDone();
            }
          });
        }
        else {
          addToLog('Emergency on, will not continue with stresstest');
        }
      }
    }
  };

  function send(str) {
    if (str === undefined){
      $ionicPopup.alert({
        title: 'Encountered an error',
        template: 'Please email a bug report via \'Show full log\''
      })
    }
    if (statusService.getEmergency() === false) {
      //calling commandObj returns {'ID': num, 'command': str, 'expectedResponse': str}
      // and adds this object to sendAndReceive.commandArray
      var commandObj = sendAndReceiveService.addToCommandObj(str);

      //calling .write() with original command (str). commandID and callingFunction are optional.
      sendAndReceiveService.writeBuffered(str, commandObj.ID, 'send in testCtrl -> send');
      //creates listener based on commandID, plus function to execute when listener is fired
      testsSent += 1;
    }
  }

  $scope.getVersion = function() {
    if (statusService.getEmergency() === false && statusService.getSending() === false){
      sendAndReceiveService.write('<<y8:y'+stepMotorNum+'>');
      sendAndReceiveService.write(softwareVersionCommand, function () {
        var listen = $rootScope.$on('bluetoothResponse', function (event, res) {
          if (res.search('<14:') > -1) {
            $ionicPopup.alert({
              title: 'Version number',
              template: 'Your version number is: '+res.slice(res.lastIndexOf(':')+1,res.lastIndexOf('>'))
            });
            listen();
          }
        })
      });
    }
  };

  function addToLog(str) {
    logService.addOne(str);
    logService.getLog(function (arr) {
      $scope.bluetoothLog = arr;
    });
  }
})
//end of controller testCtrl

.controller('bluetoothConnectionCtrl', function ($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal,
                                                 $state, $ionicPlatform, $window, turnOnBluetoothService, statusService, isConnectedService, logService,
                                                 buttonService, checkBluetoothEnabledService, connectToDeviceService, disconnectService) {

  $scope.availableDevices = [];
  $scope.pairedDevices = [];
  logService.getLog(function (arr) {
    $scope.bluetoothLog = arr;
  });
  $scope.bluetoothOn = function () {
    turnOnBluetoothService.turnOn(function () {
      checkBluetoothEnabledService.getValue(function (val) {
        $scope.bluetoothEnabled = val;
        if ($scope.bluetoothEnabled) $scope.getAvailableDevices();
      })
    });
  };
  checkBluetoothEnabledService.getValue(function (val) {
    $scope.bluetoothEnabled = val;
  });
  $scope.deviceName= connectToDeviceService.getDeviceName();
  $scope.buttons = buttonService.getValues();
  $scope.isConnected = isConnectedService.getValue();

  function addToLog(str) {
    console.log(str);
    logService.addOne(str);
    logService.getLog(function (arr) {
      $scope.bluetoothLog = arr;
    })
  }

  function setButtons(obj) {
    buttonService.setValues(obj);
    $scope.buttons = buttonService.getValues();
  }

  $scope.$on('$ionicView.enter', function () {
    $scope.availableDevices = [];
    $scope.pairedDevices = [];
    console.log('enterView in bluetoothConnectionCtrl fired');
    logService.getLog(function (arr) {
      $scope.bluetoothLog = arr;
    });
    checkBluetoothEnabledService.getValue(function (value) {
      $scope.bluetoothEnabled = value;
      console.log('$scope.bluetoothEnabled: '+$scope.bluetoothEnabled);
    });
    connectToDeviceService.getDeviceName(function (value) {
      $scope.deviceName= value;
    });
    $scope.buttons = buttonService.getValues();
    isConnectedService.getValue(function (value) {
      $scope.isConnected = value;
      console.log('$scope.isConnected: '+$scope.isConnected);
      if (!$scope.isConnected) {
        console.log('connected false, calling getAvailableDevices');
        $scope.getAvailableDevices();
      }
    });
  });
//TODO Problem: enterView is fired before leaveView, thus subscribe is called before unsubscrobe
  $scope.userDisconnect = function () {
    disconnectService.disconnect();
    $scope.isConnected = false;
    isConnectedService.getValue(function (val) {
      $scope.isConnected = val;
      $scope.getAvailableDevices();
    })
  };

  $scope.$on('$ionicView.leave', function () {
    console.log('leaveView in bluetoothConnectionCtrl fired');
    logService.setBulk($scope.bluetoothLog);
  });

  $scope.getAvailableDevices = function () {
    $scope.availableDevices = [];
    $scope.pairedDevices = [];
    isConnectedService.getValue(function (value) {
      if (value === false) {
        $ionicPlatform.ready(function() {
          console.log('Calling get available devices');
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
              })
            },function () {
              addToLog('Cannot find paired Bluetooth devices');
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
    })


  };

  $scope.connectToUnpairedDevice = function ($index) {
    $ionicPlatform.ready(function() {
      addToLog('Trying to connect');
      console.log('Platform '+$scope.platform);
      console.log('Id = '+$scope.availableDevices[$index].id);
      if ($scope.platform === 'android') {
        $cordovaBluetoothSerial.connectInsecure($scope.availableDevices[$index].id).then(function () {
          addToLog('Your smartphone has succesfully connected with the selected Bluetooth device');
          $scope.isConnected = isConnectedService.getValue();
          buttonService.setValues({'showCalcButton': true});
          saveLastConnectedDevice($scope.availableDevices[$index].id, $scope.availableDevices[$index].name);
        }, function (error) {
          //failure callback
          addToLog('Your smartphone has not been able to connect or has lost connection with the selected Bluetooth device');
          addToLog('error: '+error);
          $scope.isConnected = isConnectedService.getValue();
        })
      }
      else {
        $cordovaBluetoothSerial.connectInsecure($scope.availableDevices[$index].id).then(function () {
          addToLog('Your smartphone has succesfully connected with the selected Bluetooth device');
          $scope.isConnected = isConnectedService.getValue();
          buttonService.setValues({'showCalcButton': true});
        }, function (error) {
          //failure callback
          addToLog('Your smartphone has not been able to connect or has lost connection with the selected Bluetooth device');
          addToLog('error: '+error);
          $scope.isConnected = isConnectedService.getValue();
        })
      }
    })
  };

  $scope.connectToPairedDevice = function ($index) {
    $ionicPlatform.ready(function() {
      addToLog('Trying to connect');
      console.log('Id = '+$scope.pairedDevices[$index].id);
      $cordovaBluetoothSerial.connect($scope.pairedDevices[$index].id).then(function () {
        addToLog('Your smartphone has succesfully connected with the selected Bluetooth device');
        isConnectedService.getValue(function (val) {
          $scope.isConnected = val;
        });
        buttonService.setValues({'showCalcButton': true});
        saveLastConnectedDevice($scope.pairedDevices[$index].id, $scope.pairedDevices[$index].name);
      }, function (error) {
        addToLog('Your smartphone has not been able to connect or has lost connection with the selected Bluetooth device');
        addToLog('error: '+error);
      })
    })
  };

  function saveLastConnectedDevice(id, name) {
    var obj = {'id':id,'name':name};
    $scope.deviceName = name;
    window.localStorage.setItem('lastConnectedDevice', JSON.stringify(obj));
    console.log('Local storage last connected device set to: '+window.localStorage['lastConnectedDevice']);
    showSavedDeviceAlert();
  }

  function addToLog(str) {
    logService.addOne(str);
    logService.getLog(function (arr) {
      $scope.bluetoothLog = arr;
    });
  }

  function showSavedDeviceAlert() {
    $ionicPopup.alert({
      title: 'Bluetooth device saved',
      template: 'This bluetooth device is saved and will connect automatically from now on.<br \>If you need to change your device later on choose a new device via Bluetooth connection in the menu',
      buttons: [{
        text: 'Go to program',
        type: 'button-calm',
        onTap: function () {
          $state.go('app.program')
        }
      },
        {
          text: 'Close'
        }
      ]
    })
  }

});
//end of controller bluetoothConnectionCtrl
