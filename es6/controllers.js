// import angularAsyncAwait from "angular-async-await";
import ngAsync from './ng-async';

module.exports =
angular.module('starter.controllers', [ngAsync.name])
  /*
  * $rootScope emits:
  * $rootScope.$on('emergencyOn')
  * $rootScope.$on('emergencyOff')
  * $rootScope.$on('stopswitchHit', response, stopswitchNumber)
  * $rootScope.$on('maxSteps', response, missedSteps)
  * $rootScope.$on('bluetoothResponse', response)
  * */

.controller('SafetySlides', function($scope, $ionicModal, logService) {
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
    logService.consoleLog('swiping right');
    $scope.i ++;
    }
  };

  $scope.next = function() {
    if ($scope.i < 7) {
      logService.consoleLog("next");
      $scope.i ++;
    }
  };

  $scope.prev = function() {
    if ($scope.i >= 0) {
      logService.consoleLog("prev");
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
    logService.consoleLog('cleaning up modal');
  });*/

  //on slide.id = 7, add read-safety-instruction button
  $scope.setLocalStorageSafety = function() {
    window.localStorage.setItem("Safety", "Completed");
  }
})

.controller('ProgramController', function($scope, $ionicModal, $ionicPopup, shareSettings, shareProgram, $state, logService) {
  $scope.presets = [
    { titlePreset: '5mm everything', sawWidth: 5, cutWidth: 5, pinWidth: 5, numberOfCuts: 5, startPosition: 5  },
    { titlePreset: '15mm everything', sawWidth: 15, cutWidth: 15, pinWidth: 15, numberOfCuts: 15, startPosition: 15  }
  ];

  $scope.userPrograms = [];

  $scope.currentProgram = {

  };

  (function loadLastUsedProgram() {
    if (window.localStorage['lastUsedProgram'] !== "" && window.localStorage['lastUsedProgram'] !== undefined) {
      $scope.currentProgram = JSON.parse(window.localStorage['lastUsedProgram']);
      shareProgram.setObj($scope.currentProgram);
    }
  })();

  $scope.loadUserPrograms = function() {
    $scope.userPrograms = [];
    if (window.localStorage.length === 5) {
      logService.consoleLog('only safety, settings, lastConnectedDevice, commandIDNum and lastUsedProgram found in localstorage');
    }
    //load the userPrograms stored in localStorage. objects are named 1 - n.
    //parse the userPrograms in localStorage so that they are converted to objects
    //push the parsed userPrograms to $scope.userPrograms array
    else {
      logService.consoleLog(window.localStorage);
      for (var a=0; a<window.localStorage.length; a++) {
        if (window.localStorage.key(a) == 'Safety' || window.localStorage.key(a) == 'settings' || window.localStorage.key(a) == 'lastUsedProgram' || window.localStorage.key(a) == 'lastConnectedDevice' || window.localStorage.key(a) == 'commandIdNum') {

        }
        else{
          var tempName = window.localStorage.key(a);
          var temp = window.localStorage[tempName];
          temp = JSON.parse(temp);
          $scope.userPrograms.push(temp);
          logService.consoleLog(tempName+' pushed to userPrograms');
        }

      }
    }
  };

  $scope.loadUserPrograms();

  $scope.loadUserProgram = function($index) {
    //load userProgram & close load modal
    logService.consoleLog('userProgram clicked');
    $scope.currentProgram = $scope.userPrograms[$index];
    shareProgram.setObj($scope.currentProgram);
    $scope.closeModal(1);
  };

  $scope.loadPreset = function($index) {
    //load preset & close load modal
    logService.consoleLog('loadPreset clicked');
    $scope.currentProgram = $scope.presets[$index];
    $scope.currentProgram.title = $scope.presets[$index].titlePreset;
    shareProgram.setObj($scope.currentProgram);
    $scope.closeModal(1);
  };

  $scope.checkCurrentProgram = function(){
    /*logService.consoleLog('registered = '+ window.localStorage['registered']);
    logService.consoleLog('condition ='+ (window.localStorage['registered'] = 'false'));*/
    if ($scope.currentProgram.title == null ) {
      $scope.showAlertTitle();
      return false;
    }
    /*else if ($scope.currentProgram.numberOfCuts > 2 && window.localStorage['registered'] == 'false') {
      logService.consoleLog('cannot save, number of cuts too high for restriction');
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
      logService.consoleLog('userProgram pushed to userPrograms & localStorage');
      logService.consoleLog('\nuserPrgrams after pushed saved program:');
      logService.consoleLog($scope.userPrograms);
      logService.consoleLog('\ncurrentProgram:');
      logService.consoleLog($scope.currentProgram);
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
      logService.consoleLog('modals removed')
    });*/

  $scope.deleteUserProgram = function($index) {
    logService.consoleLog('delete userProgram clicked at index: '+$index);
    logService.consoleLog($scope.userPrograms);
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
                logService.consoleLog(window.localStorage);
                logService.consoleLog('index ='+index);
                // remove the userProgram from localstorage. Step 1: get the key under which the userProgram is saved
                var userProg = $scope.userPrograms[index];
                logService.consoleLog(userProg);
                var userProgName = userProg.title;
                logService.consoleLog(userProgName);
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
        logService.consoleLog('cannot save, number of cuts too high for restriction');
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
        logService.consoleLog('all fields filled in');
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
    logService.consoleLog($scope.settings);
    if ($scope.settings === undefined){
      logService.consoleLog('settings are not filled in correctly');
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
      $scope.settings.spindleAdvancement !== null && $scope.settings.time !== null && $scope.settings.stepMotorNum !== null &&
      $scope.settings.homingStopswitch !== null && $scope.settings.encoder.enable === false) {
      logService.consoleLog('checkSettings passed');
      return true;
    }
    else if ($scope.settings.maxFreq !== null  && $scope.settings.dipswitch !== null && $scope.settings.stepMotorNum !== null &&
      $scope.settings.spindleAdvancement !== null && $scope.settings.time !== null && $scope.settings.homingStopswitch !== null && $scope.settings.encoder.enable === true &&
      $scope.settings.encoder.stepsPerRPM !== 0 && $scope.settings.encoder.stepsToMiss > 0) {
      logService.consoleLog('checkSettings passed');
      return true;
    }
    else {
        logService.consoleLog('settings are not filled in correctly');
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

.controller('SettingsCtrl', function($rootScope, $scope, $ionicPopup, $state, shareSettings, logService){
  $scope.settings = {
    encoder: {
      enable: false,
      stepsPerRPM: null,
      stepsToMiss: null
    },
    homingStopswitch: false
  };

  //On leaving warn if settings are not saved
  $scope.settingsChanged = false;
  $scope.skipCheck = false;

  $scope.settingsHaveChanged = function () {
    $scope.settingsChanged = true;
    console.log('settingsChanged: '+$scope.settingsChanged);
  };

  $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams, fromState, fromStateParams) {
    if (fromState.name == 'app.settings' && $scope.settingsChanged && $scope.skipCheck === false) {
      event.preventDefault();
      $scope.showAlertUnsavedChanges(toState);
    }
  });

  $scope.saveSettings = function() {
    //Make sure that the frequency is not too high
    if ($scope.settings.maxFreq > 20000) {
      $scope.showAlertMaxFreq();
    }

    //  Make sure all regular settings are filled in correctly
    else if ($scope.settings.maxFreq == null || $scope.settings.dipswitch == null ||
      $scope.settings.spindleAdvancement == null || $scope.settings.time == null || $scope.settings.stepMotorNum == null) {
      $scope.showAlertSettings();
    }

    //  make sure all encoder seting are filled in correctly
    else if ($scope.settings.encoder.enable && ($scope.settings.encoder.stepsPerRPM ==undefined || $scope.settings.encoder.stepsToMiss== undefined || $scope.settings.encoder.direction == undefined)){
      $scope.showAlertSettings();
    }

    //  Save settings as JSON to localStorage
    else {
      $scope.settingsChanged = false;

      const settingsJSON = JSON.stringify($scope.settings);
      logService.consoleLog(settingsJSON);
      window.localStorage['settings'] = settingsJSON;

      //call shareSettings service so that settings can be used in programCtrl & runBluetoothCtrl
      shareSettings.setObj($scope.settings);
      $scope.showAlertSaved();
    }

  };

  $scope.loadSettings = function() {
    logService.consoleLog('settings: '+window.localStorage['settings']);
    if (window.localStorage['settings'] === '' || window.localStorage['settings'] === undefined) {

    }
    else {
      $scope.settings = JSON.parse(window.localStorage['settings']);
    }
  };

  // $scope.loadSettings();

  //Load settings on enter
  $scope.$on('$ionicView.afterEnter', function () {
    logService.consoleLog('AFTER ENTER');
    $scope.settingsChanged = false;
    $scope.skipCheck = false;
    $scope.loadSettings();
  });


  //
  //Alerts
  //

  $scope.showAlertUnsavedChanges = function(toState){
    console.log('toState in alert unsaved changes');
    console.log(toState);
    $ionicPopup.alert(
      {
        title: 'You have unsaved changes',
        template: 'Do you want to save your changes before leaving?',
        buttons: [{
          text: 'Yes',
          type: 'button-positive',
          onTap: () => {
            console.log('toState in alert unsaved changes onTap');
            console.log(toState);
            $scope.saveSettings();
            $state.go(toState.name);
          }
        },{
          text: 'No',
          type: 'button-energized',
          onTap: () => {
            console.log('toState in alert unsaved changes onTap');
            console.log(toState);
            $scope.skipCheck = true;
            $state.go(toState.name);
          }
        }]
      }
    )
  };

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

  .controller('runBluetoothCtrl', function($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal,
    $state, $ionicPlatform, $window, $interval, $timeout, shareSettings, shareProgram, skipService, buttonService, emergencyService,
    checkBluetoothEnabledService, isConnectedService, logService, disconnectService, calculateVarsService, sendAndReceiveService,
    statusService, connectToDeviceService, logModalService, modalService, $async, $q){

    const self = this;

    $scope.$on('$ionicView.beforeLeave', function () {
      logService.consoleLog('BEFORE LEAVE');
      sendAndReceiveService.unsubscribe();
    });

    $scope.$on('$ionicView.afterEnter', function () {
      logService.consoleLog('AFTER ENTER');
      sendAndReceiveService.subscribe();
    });

    $scope.bluetoothLog = logService.getLog();
    $scope.bluetoothEnabled = null;
    $scope.isConnected = null;
    var sending = statusService.getSending();
    var program = shareProgram.getObj();
    logService.consoleLog('program:');
    logService.consoleLog(JSON.stringify(program));
    $scope.settings = shareSettings.getObj();
    logService.consoleLog('settings:');
    logService.consoleLog(JSON.stringify($scope.settings));
    $scope.deviceName= connectToDeviceService.getDeviceName();
    //TODO aren't these variables superfluous because of ionicView.enter?
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
    var stepMotorNum = $scope.settings.stepMotorNum;

    //
    //SECTION: changing & entering views
    //

    $scope.$on('$ionicView.unloaded', function () {
      logService.consoleLog('\nUNLOADED\n');
    });

    // and only calculateVarsService.getVars('runBluetooth') is called && log is imported && correct buttons are set
    $scope.$on('$ionicView.enter',function () {
      logService.consoleLog('enterView in runBluetoothCtrl fired');
      isConnectedService.getValue(function (value) {
        $scope.isConnected = value;
      });
      checkBluetoothEnabledService.getValue(function (value) {
        $scope.bluetoothEnabled = value;
        logService.consoleLog('$scope.bluetoothEnabled: '+$scope.bluetoothEnabled);
      });
      logService.getLog(function (arr) {
        $scope.bluetoothLog = arr;
      });
      //no need to connect or anything, connectToLastDevice is done on app startup
      $scope.settings = shareSettings.getObj();
      program = shareProgram.getObj();
      logService.consoleLog('program:');
      logService.consoleLog(JSON.stringify(program));
      logService.consoleLog('settings:');
      logService.consoleLog(JSON.stringify($scope.settings));
      $scope.bluetoothLog = logService.getLog();
      //runBluetoothVars is an object which contains settings commands (obj.commands)
      // and individual variables (obj.vars.*)
      calculateVarsService.getVars('runBluetooth', function (runBluetoothVars) {
        commands = runBluetoothVars.commands;
        logService.consoleLog('commands:');
        logService.consoleLog(commands);
      });
      $scope.deviceName= connectToDeviceService.getDeviceName();
      $scope.buttons = buttonService.getValues();
        if (statusService.getEmergency() === true) {
          logService.consoleLog('set resetbutton true');
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
      $scope.movements = [];
      $scope.movementsNum = 0;
      stepMotorNum = $scope.settings.stepMotorNum;
    });

    $scope.$on('$ionicView.leave',function () {
      logService.consoleLog('ionicView.leave called');
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
      logService.consoleLog($scope.buttons);
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

    $rootScope.$on('emergencyOn', function () {
      emergency = true;
    });

    $rootScope.$on('emergencyOff', function () {
      emergency = false;
      $scope.movements = [];
      $scope.movementsNum = 0;
      done = true;
      settingsDone = true;
      $scope.buttons = buttonService.getValues();
      sendAndReceiveService.subscribe();
    });

    $scope.emergencyOn = function () {
      emergencyService.on();
    };

    $scope.emergencyOff = function () {
      statusService.setSending(false);
      logService.consoleLog('emergencyOff called');
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
          logService.consoleLog('Movements to take:');
          var count= 1;
          $scope.movements.forEach(function (item) {
            logService.consoleLog('Movement '+count+':'+' steps'+item.steps+', description: '+item.description);
            count +=1;
          })
        });

        function cutsAndPins(callback) {
          //do this for number of cuts
          for (var i = 1; i <= program.numberOfCuts; i++) {
            logService.consoleLog('var i ='+i);

            //if cut width is wider than saw width, calculate subcuts (multiple subcuts needed to complete one cut)
            if (program.cutWidth > program.sawWidth){

              //how many subcuts do we need for this cut to complete
              var subCuts = program.cutWidth / program.sawWidth;
              var cutsRoundedUp = Math.ceil(subCuts);

              // calculate remaining subcut steps, start at 2 because first subcut is already added after moving to past pin
              for (var j=2; j<= cutsRoundedUp; j++){
                logService.consoleLog('Var j'+j);
                if (j<cutsRoundedUp){
                  var stepsPerSawWidth = program.sawWidth / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
                  addMovement(stepsPerSawWidth, 'Make subcut '+j+'/'+cutsRoundedUp)
                }

                //calculate remaining mm & steps, based on number of subcuts already taken
                else if (j===cutsRoundedUp) {
                  var remainingMM = program.cutWidth-((j-1)*program.sawWidth);
                  logService.consoleLog('remaining mm: '+remainingMM);
                  var remainingSteps = remainingMM / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
                  addMovement(remainingSteps, 'Make subcut '+j+'/'+cutsRoundedUp);
                }
              }
            }

            //calculate steps for pins, not needed after last cut, thus i<numberOfCuts
            if (i<program.numberOfCuts) {
              logService.consoleLog('Calculating pin');
              var pinSteps = program.pinWidth / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
              if (program.cutWidth > program.sawWidth) {
                addMovement(pinSteps, 'Make subcut 1/'+cutsRoundedUp);
              }
              else if (program.cutWidth === program.sawWidth) {
                addMovement(pinSteps, 'Make the cut');
              }

            }
            if (i=== program.numberOfCuts){
              logService.consoleLog('i === numberofcuts');
              addToLog('Done calculating movements');
              logService.consoleLog('$scope.movements:');
              logService.consoleLog($scope.movements);
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

    self.sendWithRetry = $async(function* (str) {
      let res;
      for (let i = 0; i < 5; i++) {
        console.log('try: '+i+', command: '+str);
        res = yield sendAndReceiveService.writeAsync(str);
        console.log('res in sendWithretry: '+res);
        if (i === 4)
          return new Promise((resolve, reject) => {
            reject('exceeded num of tries');
          });
        else if (res === 'OK')
          return new Promise((resolve, reject) => {
            console.log('resolve value: '+res);
            resolve('resolve value: '+res);
          });
      }
    });


    //user clicks button front end, sendSettingsData() called
    $scope.sendSettingsData = $async(function* () {
      try {
        if (statusService.getEmergency() === false) {
          if (statusService.getSending() === false){
            setButtons({'showSpinner':true,'showEmergency':true, 'readyForData':false});
            statusService.setSending(true);
            settingsDone = false;

            for (let i = 0; i < commands.length; i++){
              console.log('going to await for command reply to command: '+commands[i]);
              let res = yield self.sendWithRetry(commands[i]);
              console.log('awaited reply for command: '+commands[i]+', i='+i+', response: '+res );

              if (i === commands.length-1) {
                console.log('commands');
                console.log(commands);
                console.log('commands.length');
                console.log(commands.length);
                console.log('last command of sendSettings is OK');
                lastSendSettingsCommand(res);
              }
            }
          }
        }
        else {
          addToLog('Emergency on, will not continue sending settings data');
        }
      }
      catch (err) {
        console.log('ERR: '+err);
      }
    });

    function checkWydone() {
      console.log('checkWydone');
      var rdy = $rootScope.$on('bluetoothResponse', function (event, res) {
        lastSendSettingsCommand(res);
        rdy();
      })
    }

    function lastSendSettingsCommand(res) {
      //Settings have been sent correctly, start pinging for update
      if (res.search('rdy') > -1) {
        addToLog('Moving to start position');
        sendAndReceiveService.write('<w'+stepMotorNum+'>', checkWydone());
      }
      //Movement is complete
      else if (res.search('wydone') > -1) {
        //showMoving button becomes available, which allows user to call startMoving()
        setButtons({
          'readyForData':false,
          'showMovingButton':true,
          'showCalcButton':false,
          'showHoming':false,
          'showSpinner': false
        });
        statusService.setSending(false);
        addToLog('Moved to start position');
        var subCuts = program.cutWidth / program.sawWidth;
        var cutsRoundedUp = Math.ceil(subCuts);
        //On popup user is able to indicate that cut is complete
        //Button on popup triggers startMoving()
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
      //  Setting have been sent incorrectly
      else if (res.search('kFAULT') !== -1){
        addToLog('Settings have been sent incorrectly, please try again');
        emergencyService.on(function () {
          emergencyService.off()
        });
      }
      //  Keep connection alive
      else {
        $timeout(function () {
          sendAndReceiveService.write('<w'+stepMotorNum+'>', checkWydone());
        }, 100)

      }
    }

    //
    //SECTION: startMoving \ take steps logic
    //

    $scope.startMoving = function () {
      logService.consoleLog('$scope.movements in startMoving:');
      logService.consoleLog($scope.movements);
      logService.consoleLog('$scope.movementsNum in startMoving:');
      logService.consoleLog($scope.movementsNum);
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
          logService.consoleLog('on bluetoothResponse in checkDone called');
            if (res.search('wydone') > -1) {
              checkDoneReceivedWydone()
            }
          else {
              $timeout(function () {
                logService.consoleLog('no wydone, sending <w>');
                sendAndReceiveService.write('<w'+stepMotorNum+'>', checkDone);
              }, 250);
            }
          check();
        });
      }

      function checkDoneReceivedWydone() {
        addToLog('Movement done');
        addToLog($scope.movements[$scope.movementsNum].description);
        done = true;
        setButtons({'showSpinner':false, 'showHoming': true, 'showResetButton': false});
        if ($scope.movements[$scope.movementsNum].description !== 'Moving to next cut'
          && $scope.movementsNum !== $scope.movements.length -1){
          $ionicPopup.alert({
            title: $scope.movements[$scope.movementsNum].description
          });
          //increment movementsNum, so when user clicks Start Moving button again,
          // startMoving() will be called with next command
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
          setButtons({'showMovingButton':false,'showEmergency':false,'showResetButton':false});
          statusService.setSending(false);
          $scope.movements = [];
          $scope.movementsNum = 0;
        }
      }
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
              setButtons({'showCalcButton': true})
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

    //Q&A section

    $scope.openHelpModal = function () {
      modalService
        .init('help-modal.html', $scope)
        .then(function (modal) {
          modal.show();
        })
    };

    $scope.show = null;

    $scope.showAnswer = function(obj) {
      $scope.show = $scope.show === obj ? null : obj;
    };

    $scope.QAList = [];
    for (var i=1; i<11; i++) {
      $scope.QAList.push({
        question: 'Question '+i,
        answer: 'Lorem ipsum'
      })
    }

    $scope.showFullLog = function () {
      $scope.fullLog = $scope.bluetoothLog.slice(0,19);
      modalService
        .init('log-modal.html', $scope)
        .then(function (modal) {
          modal.show();
        })
    };

    $scope.emailFullLog = function () {
      logModalService.emailFullLog();
    } ;

    $scope.fullLog = $scope.bluetoothLog.slice(0,19);

    $scope.fullLogPage = 0;

    $scope.getFullLogExtract = function(start, end) {
      logService.consoleLog('getFullLogExtract, start: '+start+' end: '+end);
      $scope.fullLog = $scope.bluetoothLog.slice(start, end)
    };

    $scope.previousFullLogPage = function () {
      logService.consoleLog('prevFullLogPage');
      $scope.getFullLogExtract((($scope.fullLogPage-1)*10),(($scope.fullLogPage-1)*10)+9);
      $scope.fullLogPage -= 1;
    };

    $scope.nextFullLogPage = function () {
      logService.consoleLog('nextFullLogPage');
      $scope.getFullLogExtract((($scope.fullLogPage+1)*10),(($scope.fullLogPage+1)*10)+9);
      $scope.fullLogPage += 1;
    };
  })
//end of controller runBluetoothCtrl

.controller('homingCtrl', function ($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal,
                                    $state, $ionicPlatform, $window, $interval, $timeout, shareSettings, shareProgram, skipService, buttonService, emergencyService,
                                    checkBluetoothEnabledService, isConnectedService, logService, disconnectService, calculateVarsService, sendAndReceiveService,
                                    statusService, connectToDeviceService, $ionicHistory, logModalService, modalService, $async) {
  $scope.$on('$ionicView.unloaded', function () {
    logService.consoleLog('\nUNLOADED\n');
  });

  $scope.$on('$ionicView.beforeLeave', function () {
    logService.consoleLog('BEFORE LEAVE');
    sendAndReceiveService.unsubscribe();
  });

  $scope.$on('$ionicView.afterEnter', function () {
    logService.consoleLog('AFTER ENTER');
    sendAndReceiveService.subscribe();
  });

  var homingStopswitchInt;
  //homing commands
  var homingCommands;
  $scope.settings = shareSettings.getObj();
  var stepMotorNum = $scope.settings.stepMotorNum;
  $scope.bluetoothLog = [];
  $scope.bluetoothEnabled = null;
  $scope.buttons = buttonService.getValues();
  $scope.userDisconnect = function () {
    disconnectService.disconnect();
    isConnectedService.getValue(function (val) {
      $scope.isConnected = val;
    })
  };
  $scope.homingDone = false;

  function setButtons(obj) {
    buttonService.setValues(obj);
    $scope.$apply(function () {
      $scope.buttons = buttonService.getValues()
    });
    logService.consoleLog($scope.buttons);
  }

  $scope.$on('$ionicView.enter', function () {
    logService.consoleLog('enterView in homingCtrl fired');
    logService.getLog(function (arr) {
      $scope.bluetoothLog = arr;
    });
    checkBluetoothEnabledService.getValue(function (value) {
      $scope.bluetoothEnabled = value;
      logService.consoleLog('$scope.bluetoothEnabled: '+$scope.bluetoothEnabled);
    });
    connectToDeviceService.getDeviceName(function (value) {
      $scope.deviceName= value;
    });
    $scope.buttons = buttonService.getValues();
    isConnectedService.getValue(function (value) {
      $scope.isConnected = value;
      logService.consoleLog('$scope.isConnected: '+$scope.isConnected);
    });
    calculateVarsService.getVars('homing', function (obj) {
      homingCommands = obj.commands;
      logService.consoleLog('homingcommands:');
      logService.consoleLog(homingCommands);
      homingStopswitchInt = obj.vars.homingStopswitchInt;
    });
    $scope.settings = shareSettings.getObj();
    stepMotorNum = $scope.settings.stepMotorNum;
    $scope.homingDone = false;
  });

  $scope.$on('$ionicView.leave', function () {
    logService.consoleLog('leaveView in bluetoothConnectionCtrl fired');
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
    logService.consoleLog('emergencyOff called');
    emergencyService.off();
  };

  //
  //SECTION: homing logic
  //

  $scope.sendWithRetry = $async(function* (str) {
    let res;
    for (let i = 0; i < 5; i++) {
      console.log('try: '+i+', command: '+str);
      res = yield sendAndReceiveService.writeAsync(str);
      console.log('res in sendWithretry: '+res);
      if (i === 4)
        return new Promise((resolve, reject) => {
          reject('exceeded num of tries');
        });
      else if (res === 'OK')
        return new Promise((resolve, reject) => {
          console.log('resolve value: '+res);
          resolve('resolve value: '+res);
        });
    }
  });

  $scope.homing = $async(function* () {
    if (statusService.getEmergency() === false) {
      logService.consoleLog('homingStopswitch = '+homingStopswitchInt);
      if (statusService.getSending() === false){
        setButtons({'showSpinner':true,'showEmergency':true,'showHoming':false});
        statusService.setSending(true);

        for (let i = 0; i < homingCommands.length; i++){
          console.log('going to await for command reply to command: '+homingCommands[i]);
          let res = yield $scope.sendWithRetry(homingCommands[i]);
          console.log('awaited reply for command: '+homingCommands[i]+', i='+i+', response: '+res );

          if (i === homingCommands.length-1) {
            console.log('commands');
            console.log(homingCommands);
            console.log('commands.length');
            console.log(homingCommands.length);
            console.log('last command of sendSettings is OK');
            lastHomingCommand(res);
          }
        }
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
  });

  function checkWydone() {
    console.log('checkWydone');
    var rdy = $rootScope.$on('bluetoothResponse', function (event, res) {
      lastHomingCommand(res);
      rdy();
    })
  }

  function lastHomingCommand(res) {
    console.log('res in lastHomingCommand: ' + res);
    if (res.search('wydone:') > -1) {
      $scope.homingDone = true;
      setButtons({'showSpinner': false, 'showEmergency': false, 'showHoming': true});
      $ionicPopup.alert({
        title: 'Homing completed'
      });
      statusService.setSending(false);
    }
    else if (res.search('kFAULT') !== -1){
      addToLog('Settings have been sent incorrectly, please try again');
      emergencyService.on(function () {
        emergencyService.off()
      });
    }
    else if (!$scope.homingDone) {
      $timeout(function () {
        sendAndReceiveService.write('<w'+stepMotorNum+'>', checkWydone());
      }, 100)
    }
  }

  function addToLog(str) {
    logService.addOne(str);
    logService.getLog(function (arr) {
      $scope.bluetoothLog = arr;
    });
  }

  $scope.openHelpModal = function () {
    modalService
      .init('help-modal.html', $scope)
      .then(function (modal) {
        modal.show();
      })
  };

  $scope.show = null;

  $scope.showAnswer = function(obj) {
    $scope.show = $scope.show === obj ? null : obj;
  };

  $scope.QAList = [];
  for (var i=1; i<11; i++) {
    $scope.QAList.push({
      question: 'Question '+i,
      answer: 'Lorem ipsum'
    })
  }

  $scope.showFullLog = function () {
    $scope.fullLog = $scope.bluetoothLog.slice(0,19);
    modalService
      .init('log-modal.html', $scope)
      .then(function (modal) {
        modal.show();
      })
  };

  $scope.emailFullLog = function () {
    logModalService.emailFullLog();
  } ;

  $scope.fullLog = $scope.bluetoothLog.slice(0,19);

  $scope.fullLogPage = 0;

  $scope.getFullLogExtract = function(start, end) {
    logService.consoleLog('getFullLogExtract, start: '+start+' end: '+end);
    $scope.fullLog = $scope.bluetoothLog.slice(start, end)
  };

  $scope.previousFullLogPage = function () {
    logService.consoleLog('prevFullLogPage');
    $scope.getFullLogExtract((($scope.fullLogPage-1)*10),(($scope.fullLogPage-1)*10)+9);
    $scope.fullLogPage -= 1;
  };

  $scope.nextFullLogPage = function () {
    logService.consoleLog('nextFullLogPage');
    $scope.getFullLogExtract((($scope.fullLogPage+1)*10),(($scope.fullLogPage+1)*10)+9);
    $scope.fullLogPage += 1;
  };

})
//end of controller homingCtrl

.controller('testCtrl', function ($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal,
                                  $state, $ionicPlatform, $window, $interval, $timeout, shareSettings, shareProgram, skipService, buttonService, emergencyService,
                                  checkBluetoothEnabledService, isConnectedService, logService, disconnectService, calculateVarsService, sendAndReceiveService,
                                  statusService, connectToDeviceService, logModalService, modalService) {
  $scope.$on('$ionicView.unloaded', function () {
    logService.consoleLog('\nUNLOADED\n');
  });

  $scope.$on('$ionicView.beforeLeave', function () {
    logService.consoleLog('BEFORE LEAVE');
    sendAndReceiveService.unsubscribe();
  });

  $scope.$on('$ionicView.afterEnter', function () {
    logService.consoleLog('AFTER ENTER');
    sendAndReceiveService.subscribe();
  });

//other vars/commands
  var commands;
  $scope.settings = shareSettings.getObj();
  var stepMotorNum = $scope.settings.stepMotorNum;
  var softwareVersionCommand = '<z'+stepMotorNum+'>';
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
    logService.consoleLog($scope.buttons);
  }

  $scope.$on('$ionicView.enter', function () {
    logService.consoleLog('enterView in testCtrl fired');
    logService.getLog(function (arr) {
      $scope.bluetoothLog = arr;
    });
    checkBluetoothEnabledService.getValue(function (value) {
      $scope.bluetoothEnabled = value;
      logService.consoleLog('$scope.bluetoothEnabled: '+$scope.bluetoothEnabled);
    });
    connectToDeviceService.getDeviceName(function (value) {
      $scope.deviceName= value;
    });
    $scope.buttons = buttonService.getValues();
    isConnectedService.getValue(function (value) {
      $scope.isConnected = value;
      logService.consoleLog('$scope.isConnected: '+$scope.isConnected);
    });
    calculateVarsService.getVars('test', function (obj) {
      commands = obj.commands;
      logService.consoleLog('testCommands:');
      logService.consoleLog(commands);
    });
    $scope.settings = shareSettings.getObj();
    stepMotorNum = $scope.settings.stepMotorNum;
  });

  $scope.$on('$ionicView.leave', function () {
    logService.consoleLog('leaveView in bluetoothConnectionCtrl fired');
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
    logService.setBulk($scope.bluetoothLog);
  });

  $scope.emergencyOn = function () {
    emergencyService.on();
    $scope.completedTest = 0;
    $scope.retriesNeeded = 0;
    sentSettingsForTest = false;
    testsSent = 0;
    $scope.testRunning = false;
    sendKfault();
    rdy();
    rdy2();
    listen();
    newCommand();
    nextListener();
  };

  $scope.emergencyOff = function () {
    logService.consoleLog('emergencyOff called');
    emergencyService.off();

  };
  //
  //SECTION: stressTest && move X mm logic
  //

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

  var sendKfault;
  var rdy;
  var rdy2;
  var listen;
  var newCommand;


  function sendSettings(type) {
    var typeStr = type;
    logService.consoleLog('Commands in testCtrl -> sendSettings:');
    logService.consoleLog(commands);
    //send commands, except last one
    for (var i = 0; i < commands.length -1; i++){
      sendAndReceiveService.write(commands[i]);
    }
    //send last command on sendKfault notification
    sendKfault = $rootScope.$on('sendKfault', function () {
      sendAndReceiveService.write(commands[commands.length-1], function () {
        initRdy(typeStr);
        sendKfault();
      });
    });
    //check if commands have been sent correctly
  }

  function initRdy(typeStr) {
    rdy = $rootScope.$on('bluetoothResponse', function (event, res) {
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
          logService.consoleLog('resetting commands in testCtrl');
          commands = obj.commands;
        });
      }
      else if (typeStr === 'stressTest') {
        addToLog('Executing tests');
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
        rdy2 = $rootScope.$on('bluetoothResponse', function (event, response) {
          checkRdy(response, typeStr);
          rdy2();
        })
      }, 200);
    }
  }

  //TODO tried to work with buffered commands, did not work, reverting back to one at a time
  $scope.stressTest = function () {
    if (statusService.getEmergency() === true) {
      addToLog('Emergency on, cancelling stresstest');
    }
    else if ($scope.numberOfTests.tests === undefined || $scope.numberOfTests.tests === 0) {
      $ionicPopup.alert({
        title: 'Please fill in the number of test commands'
      })
    }
    else {
      setButtons({'showEmergency': true, 'showResetButton': false, 'showStressTest': false, 'showVersionButton': false, 'showMoveXMm': false, 'showSpinner': true});
      $scope.testRunning = true;
      if (!sentSettingsForTest) {
        if (statusService.getEmergency() === false) {
          logService.consoleLog('numberOfTests:'+$scope.numberOfTests.tests);
          addToLog('Sending settings needed for testing');
          sendSettings('stressTest');
        }
      }
      else {
        if (statusService.getEmergency() === false) {
          statusService.setSending(true);

          //with 10 or less tests, send them all at once
          if (testsSent < $scope.numberOfTests.tests) {
            //Send a random command, true = create listener, function is executed as soon as wydone+commandID has come back
              $timeout(function () {
                send('<q'+Math.floor((Math.random()*1000)+20) +stepMotorNum+'>', sendNext);
              }, 150);
          }
        }
        else {
          addToLog('Emergency on, will not continue with stresstest');
        }
      }
    }
  };

  var nextListener;
  function sendNext() {
    nextListener = $rootScope.$on('bluetoothResponse', function (event, res) {
      if ($scope.numberOfTests.tests === testsSent && res.search('wydone')) {
        $scope.completedTest +=1;
        $ionicPopup.alert({
          title: 'Tests completed',
          template: 'Completed '+$scope.completedTest+' out of '+$scope.numberOfTests.tests
        });
        setButtons({'showEmergency':false, 'showSpinner': false, 'showStressTest':true, 'showVersionButton': true, 'showMoveXMm': true});
        $scope.testRunning = false;
        addToLog('Tests completed');
        logService.consoleLog('completed tests: '+$scope.completedTest+' number of tests: '+$scope.numberOfTests.tests+' sent tests: '+testsSent);
        sentSettingsForTest = false;
        statusService.setSending(false);
        nextListener();
      }
      else if (res.search('wydone') > -1) {
        $scope.completedTest +=1;
        $scope.stressTest();
        nextListener();
      }
      else {
        $timeout(function () {
          sendAndReceiveService.write('<w'+stepMotorNum+'>', sendNext);
        }, 200);
        nextListener();
      }
    })
  }

  function send(str, cb) {
    if (str === undefined){
      $ionicPopup.alert({
        title: 'Encountered an error',
        template: 'Please email a bug report via \'Show full log\''
      })
    }
    if (statusService.getEmergency() === false) {
      //calling .write() with original command (str). callingFunction is optional.
      sendAndReceiveService.write(str);
      testsSent += 1;
      if (cb) cb();
    }
  }

  $scope.getVersion = function() {
    if (statusService.getEmergency() === false && statusService.getSending() === false){
      sendAndReceiveService.write('<<y8:y'+stepMotorNum+'>');
      sendAndReceiveService.write(softwareVersionCommand, function () {
        listen = $rootScope.$on('bluetoothResponse', function (event, res) {
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

  $scope.openHelpModal = function () {
    modalService
      .init('help-modal.html', $scope)
      .then(function (modal) {
        modal.show();
      })
  };

  $scope.show = null;

  $scope.showAnswer = function(obj) {
    $scope.show = $scope.show === obj ? null : obj;
  };

  $scope.QAList = [];
  for (var i=1; i<11; i++) {
    $scope.QAList.push({
      question: 'Question '+i,
      answer: 'Lorem ipsum'
    })
  }

  $scope.showFullLog = function () {
    $scope.fullLog = $scope.bluetoothLog.slice(0,19);
    modalService
      .init('log-modal.html', $scope)
      .then(function (modal) {
        modal.show();
      })
  };

  $scope.emailFullLog = function () {
    logModalService.emailFullLog();
  } ;

  $scope.fullLog = $scope.bluetoothLog.slice(0,19);

  $scope.fullLogPage = 0;

  $scope.getFullLogExtract = function(start, end) {
    logService.consoleLog('getFullLogExtract, start: '+start+' end: '+end);
    $scope.fullLog = $scope.bluetoothLog.slice(start, end)
  };

  $scope.previousFullLogPage = function () {
    logService.consoleLog('prevFullLogPage');
    $scope.getFullLogExtract((($scope.fullLogPage-1)*10),(($scope.fullLogPage-1)*10)+9);
    $scope.fullLogPage -= 1;
  };

  $scope.nextFullLogPage = function () {
    logService.consoleLog('nextFullLogPage');
    $scope.getFullLogExtract((($scope.fullLogPage+1)*10),(($scope.fullLogPage+1)*10)+9);
    $scope.fullLogPage += 1;
  };
})
//end of controller testCtrl

.controller('bluetoothConnectionCtrl', function ($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal,
                                                 $state, $ionicPlatform, $window, turnOnBluetoothService, statusService, isConnectedService, logService,
                                                 buttonService, checkBluetoothEnabledService, connectToDeviceService, disconnectService, $timeout, logModalService, modalService) {

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
    logService.consoleLog(str);
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
    logService.consoleLog('enterView in bluetoothConnectionCtrl fired');
    logService.getLog(function (arr) {
      $scope.bluetoothLog = arr;
    });
    checkBluetoothEnabledService.getValue(function (value) {
      $scope.bluetoothEnabled = value;
      logService.consoleLog('$scope.bluetoothEnabled: '+$scope.bluetoothEnabled);
    });
    connectToDeviceService.getDeviceName(function (value) {
      $scope.deviceName= value;
    });
    $scope.buttons = buttonService.getValues();
    isConnectedService.getValue(function (value) {
      $scope.isConnected = value;
      logService.consoleLog('$scope.isConnected: '+$scope.isConnected);
      if (!$scope.isConnected) {
        logService.consoleLog('connected false, calling getAvailableDevices');
        $scope.getAvailableDevices();
      }
    });
  });

  $scope.userDisconnect = function () {
    disconnectService.disconnect();
    $scope.isConnected = false;
    $timeout(function () {
      $scope.getAvailableDevices();
    }, 500);

  };

  $scope.$on('$ionicView.leave', function () {
    logService.consoleLog('leaveView in bluetoothConnectionCtrl fired');
    logService.setBulk($scope.bluetoothLog);
  });

  //TODO not working correctly for unpaired devices
  $scope.getAvailableDevices = function () {
    $scope.availableDevices = [];
    $scope.pairedDevices = [];
    isConnectedService.getValue(function (value) {
      if (value === false) {
        $ionicPlatform.ready(function() {
          logService.consoleLog('Calling get available devices');
          if (ionic.Platform.isAndroid) {
            //discover unpaired
            addToLog('Searching for unpaired Bluetooth devices');
            $cordovaBluetoothSerial.discoverUnpaired().then(function (devices) {
              console.log('unpaired devices');
              console.log(devices);
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
      logService.consoleLog('Id = '+$scope.availableDevices[$index].id);
      $cordovaBluetoothSerial.connectInsecure($scope.availableDevices[$index].id).then(function () {
          addToLog('Your smartphone has succesfully connected with the selected Bluetooth device');
        saveLastConnectedDevice($scope.availableDevices[$index].id, $scope.availableDevices[$index].name);
        connectToDeviceService.setDeviceName($scope.availableDevices[$index].name);
          isConnectedService.getValue(function (val) {
            $timeout(function () {
              $scope.$apply(function () {
                $scope.isConnected = val;
              })
            }, 500);

          });

        }, function (error) {
          //failure callback
          addToLog('Your smartphone has not been able to connect or has lost connection with the selected Bluetooth device');
          addToLog('error: '+error);
          $scope.isConnected = isConnectedService.getValue();
        })
    })
  };

  $scope.connectToPairedDevice = function ($index) {
    $ionicPlatform.ready(function() {
      addToLog('Trying to connect');
      logService.consoleLog('Id = '+$scope.pairedDevices[$index].id);
      $cordovaBluetoothSerial.connect($scope.pairedDevices[$index].id).then(function () {
        saveLastConnectedDevice($scope.pairedDevices[$index].id, $scope.pairedDevices[$index].name);
        connectToDeviceService.setDeviceName($scope.pairedDevices[$index].name);
        addToLog('Your smartphone has succesfully connected with the selected Bluetooth device');
        isConnectedService.getValue(function (val) {
          $timeout(function () {
            $scope.$apply(function () {
              $scope.isConnected = val;
            })
          }, 500);

        });
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
    logService.consoleLog('Local storage last connected device set to: '+window.localStorage['lastConnectedDevice']);
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

  $scope.openHelpModal = function () {
    modalService
      .init('help-modal.html', $scope)
      .then(function (modal) {
        modal.show();
      })
  };

  $scope.show = null;

  $scope.showAnswer = function(obj) {
    $scope.show = $scope.show === obj ? null : obj;
  };

  $scope.QAList = [];
  for (var i=1; i<11; i++) {
    $scope.QAList.push({
      question: 'Question '+i,
      answer: 'Lorem ipsum'
    })
  }

  $scope.showFullLog = function () {
    $scope.fullLog = $scope.bluetoothLog.slice(0,19);
    modalService
      .init('log-modal.html', $scope)
      .then(function (modal) {
        modal.show();
      })
  };

  $scope.emailFullLog = function () {
    logModalService.emailFullLog();
  } ;

  $scope.fullLog = $scope.bluetoothLog.slice(0,19);

  $scope.fullLogPage = 0;

  $scope.getFullLogExtract = function(start, end) {
    logService.consoleLog('getFullLogExtract, start: '+start+' end: '+end);
    $scope.fullLog = $scope.bluetoothLog.slice(start, end)
  };

  $scope.previousFullLogPage = function () {
    logService.consoleLog('prevFullLogPage');
    $scope.getFullLogExtract((($scope.fullLogPage-1)*10),(($scope.fullLogPage-1)*10)+9);
    $scope.fullLogPage -= 1;
  };

  $scope.nextFullLogPage = function () {
    logService.consoleLog('nextFullLogPage');
    $scope.getFullLogExtract((($scope.fullLogPage+1)*10),(($scope.fullLogPage+1)*10)+9);
    $scope.fullLogPage += 1;
  };
});
//end of controller bluetoothConnectionCtrl
